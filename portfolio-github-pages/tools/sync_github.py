#!/usr/bin/env python3
"""
Sync the site with public GitHub repositories.

What it does (standard library only, no pip install needed):
  1. Reads public, non-fork repositories of GITHUB_USER through the GitHub REST API.
     The account's profile repository (named like the user) is skipped.
  2. Writes js/data/projects.js (the data the projects pages render).
  3. Writes projects/<slug>.html, one static, crawlable page per repository.
  4. Rewrites sitemap.xml from the pages that are indexable.

If the API cannot be reached (rate limit, network), the existing files are kept
and the script exits with status 0, so a scheduled run never breaks the site.

Usage:
    python3 tools/sync_github.py                 # from the project root
    GITHUB_TOKEN=... python3 tools/sync_github.py  # higher API rate limit
    python3 tools/sync_github.py --from-file repos.json   # offline test (raw API list)
"""
import datetime as dt
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GITHUB_USER = os.environ.get("GITHUB_USER", "mohammadreza-atlas")
SITE = os.environ.get("SITE_URL", "https://mohammadreza-soltani.ir").rstrip("/")
TOKEN = os.environ.get("GITHUB_TOKEN")
TODAY = dt.date.today().isoformat()

CATEGORY_BY_LANGUAGE = {
    "Python": "python", "Go": "go", "HTML": "web", "CSS": "web", "JavaScript": "web",
    "TypeScript": "web", "Jupyter Notebook": "data", "R": "data",
}


# ----------------------------------------------------------------------------
# GitHub API
# ----------------------------------------------------------------------------
def api(url, raw=False):
    headers = {
        "User-Agent": "portfolio-sync",
        "Accept": "application/vnd.github.raw" if raw else "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def fetch_repos():
    repos, page = [], 1
    while True:
        url = (f"https://api.github.com/users/{GITHUB_USER}/repos"
               f"?per_page=100&type=owner&sort=updated&page={page}")
        batch = json.loads(api(url))
        repos.extend(batch)
        if len(batch) < 100:
            return repos
        page += 1


def fetch_readme(full_name):
    try:
        return api(f"https://api.github.com/repos/{full_name}/readme", raw=True)
    except urllib.error.HTTPError:
        return ""


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def slugify(name):
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "project"


def readme_excerpt(md, limit=700):
    """Turn README markdown into short plain text (no code, links reduced to their text)."""
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    md = re.sub(r"```.*?```", "", md, flags=re.S)
    md = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", md)
    md = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", md)
    md = re.sub(r"<[^>]+>", "", md)
    lines = []
    for line in md.splitlines():
        s = re.sub(r"^\s*#+\s*", "", line).strip()
        s = re.sub(r"[*_`>|]", "", s).strip()
        if s and not re.fullmatch(r"[-=~ ]+", s):
            lines.append(s)
    text = " ".join(lines)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0] + "…"
    return text


def build_project(repo, readme_md):
    name = repo["name"]
    slug = slugify(name)
    desc = (repo.get("description") or "").strip()
    excerpt = readme_excerpt(readme_md) if readme_md else ""
    language = repo.get("language")
    return {
        "id": slug,
        "repoName": name,
        "name": name,
        "description": {"fa": desc, "en": desc},
        "details": {"fa": excerpt or desc, "en": excerpt or desc},
        "language": language or "",
        "topics": repo.get("topics") or ([language] if language else []),
        "category": CATEGORY_BY_LANGUAGE.get(language, "other"),
        "image": None,
        "gallery": [],
        "githubUrl": repo["html_url"],
        "liveUrl": repo.get("homepage") or None,
        "detailsUrl": f"projects/{slug}.html",
        "featured": repo.get("stargazers_count", 0) > 0,
        "stars": repo.get("stargazers_count", 0),
        "archived": bool(repo.get("archived")),
        "updatedAt": (repo.get("pushed_at") or "")[:10] or None,
        "isSample": False,
    }


# ----------------------------------------------------------------------------
# Writers
# ----------------------------------------------------------------------------
def write_projects_js(projects):
    body = json.dumps(projects, ensure_ascii=False, indent=4)
    content = (
        "/* ============================================================================\n"
        "   projects.js — GENERATED by tools/sync_github.py from the public GitHub repositories\n"
        f"   of {GITHUB_USER}. Do not edit by hand; changes are overwritten on the next sync.\n"
        f"   Last sync: {TODAY}\n"
        "============================================================================ */\n\n"
        f"const projectsData = {body};\n"
    )
    (ROOT / "js" / "data" / "projects.js").write_text(content, encoding="utf-8")


def set_meta(doc, attr, key, value):
    """Replace <meta attr="key" content=...> or insert it before </head>."""
    value_esc = html.escape(value, quote=True)
    pattern = re.compile(r'<meta\s+%s="%s"[^>]*/?>' % (attr, re.escape(key)))
    tag = f'<meta {attr}="{key}" content="{value_esc}" />'
    if pattern.search(doc):
        return pattern.sub(tag, doc, count=1)
    return doc.replace("</head>", f"  {tag}\n</head>", 1)


def set_text(doc, element_id, text_html):
    """Set the inner HTML of the element with the given id (keeps its opening tag)."""
    pattern = re.compile(r'(<(\w+)[^>]*\sid="%s"[^>]*>)(.*?)(</\2>)' % re.escape(element_id), re.S)
    return pattern.sub(lambda m: m.group(1) + text_html + m.group(4), doc, count=1)


def prefix_relative_links(doc):
    """The template lives at the root; project pages live one level down."""
    return re.sub(
        r'(\s(?:href|src)=")(?!https?://|#|mailto:|sms:|tel:|data:|/)([^"]+)"',
        r'\1../\2"',
        doc,
    )


def render_project_page(template, project, readme_paragraphs):
    name = project["name"]
    desc = project["description"]["en"] or project["description"]["fa"]
    page_title = f"{name} | نمونه‌کار محمدرضا سلطانی"
    page_desc = (desc or f"پروژه {name} در GitHub از محمدرضا سلطانی.")[:155]
    url = f"{SITE}/projects/{project['id']}.html"

    doc = template
    doc = re.sub(r"<title>.*?</title>", f"<title>{html.escape(page_title)}</title>", doc, count=1, flags=re.S)
    doc = set_meta(doc, "name", "description", page_desc)
    doc = set_meta(doc, "name", "robots", "index, follow")
    doc = set_meta(doc, "property", "og:title", page_title)
    doc = set_meta(doc, "property", "og:description", page_desc)
    doc = set_meta(doc, "property", "og:url", url)
    doc = set_meta(doc, "property", "og:type", "article")
    doc = set_meta(doc, "name", "twitter:title", page_title)
    doc = set_meta(doc, "name", "twitter:description", page_desc)
    doc = set_meta(doc, "name", "twitter:url", url)
    doc = re.sub(r'<link rel="canonical"[^>]*/>', f'<link rel="canonical" href="{url}" />', doc, count=1)
    doc = doc.replace('<body>', f'<body data-project-id="{project["id"]}">', 1)

    breadcrumb = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "خانه", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "پروژه‌ها", "item": f"{SITE}/projects.html"},
            {"@type": "ListItem", "position": 3, "name": name, "item": url},
        ],
    }
    software = {
        "@context": "https://schema.org", "@type": "SoftwareSourceCode",
        "name": name, "description": page_desc, "url": url,
        "codeRepository": project["githubUrl"],
        "programmingLanguage": project["language"] or None,
        "author": {"@type": "Person", "name": "محمدرضا سلطانی", "url": f"{SITE}/"},
        "dateModified": project["updatedAt"],
    }
    software = {k: v for k, v in software.items() if v}
    scripts = "\n".join(
        '<script type="application/ld+json">\n'
        + json.dumps(d, ensure_ascii=False, indent=2) + "\n</script>"
        for d in (breadcrumb, software)
    )
    doc = doc.replace("</head>", scripts + "\n</head>", 1)

    # Pre-rendered content (the page script re-renders the same data on load)
    doc = set_text(doc, "pdName", html.escape(name))
    doc = set_text(doc, "pdCrumb", html.escape(name))
    doc = set_text(doc, "pdDesc", html.escape(desc or ""))
    details = "\n".join(html.escape(p) for p in readme_paragraphs) or html.escape(desc or "")
    doc = set_text(doc, "pdDetails", details)
    topics_html = "".join(f'<li class="pd-topic">{html.escape(t)}</li>' for t in project["topics"])
    doc = set_text(doc, "pdTopics", topics_html)
    if project["language"]:
        doc = set_text(doc, "pdLanguage", html.escape(project["language"]))
    doc = re.sub(r'(<a id="pdRepo"[^>]*href=")[^"]*"', lambda m: m.group(1) + html.escape(project["githubUrl"]) + '"', doc, count=1)
    doc = prefix_relative_links(doc)
    return doc


def write_sitemap():
    """Indexable pages: every HTML file with a canonical URL and no noindex."""
    urls = []
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith(("tools/", ".github/")):
            continue
        doc = path.read_text(encoding="utf-8")
        if re.search(r'name="robots"[^>]*noindex', doc):
            continue
        m = re.search(r'<link rel="canonical" href="([^"]+)"', doc)
        if not m:
            continue
        urls.append(m.group(1))
    priority = lambda u: "1.0" if u.rstrip("/") == SITE else ("0.9" if "/projects" in u or "/services" in u else "0.7")
    entries = "\n".join(
        f"  <url>\n    <loc>{u}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>{priority(u)}</priority>\n  </url>"
        for u in sorted(set(urls))
    )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries + "\n</urlset>\n",
        encoding="utf-8",
    )
    return len(urls)


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
def main(argv):
    if "--from-file" in argv:
        raw = json.loads(Path(argv[argv.index("--from-file") + 1]).read_text(encoding="utf-8"))
        repos = raw
        readme_for = lambda full: ""
    else:
        try:
            repos = fetch_repos()
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as err:
            print(f"GitHub API unavailable ({err}); keeping the current files.")
            return 0
        readme_for = fetch_readme

    public = [
        r for r in repos
        if not r.get("fork") and not r.get("private")
        and r["name"].lower() != GITHUB_USER.lower()
    ]
    public.sort(key=lambda r: r.get("pushed_at") or "", reverse=True)

    projects = []
    for repo in public:
        readme = readme_for(repo["full_name"])
        projects.append(build_project(repo, readme))

    # 1. data
    write_projects_js(projects)

    # 2. static pages (remove pages of repositories that no longer exist)
    template_path = ROOT / "project-details.html"
    projects_dir = ROOT / "projects"
    projects_dir.mkdir(exist_ok=True)
    wanted = {p["id"] for p in projects}
    for old in projects_dir.glob("*.html"):
        if old.stem not in wanted:
            old.unlink()
            print(f"removed stale page: projects/{old.name}")
    if template_path.exists():
        template = template_path.read_text(encoding="utf-8")
        for project in projects:
            paragraphs = [p for p in project["details"]["en"].split(". ") if p] if project["details"]["en"] else []
            page = render_project_page(template, project, paragraphs[:6])
            (projects_dir / f"{project['id']}.html").write_text(page, encoding="utf-8")

    # 3. sitemap
    count = write_sitemap()
    print(f"synced {len(projects)} public repositories, {count} indexable URLs in sitemap.xml")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

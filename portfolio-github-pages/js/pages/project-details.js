/* ============================================================================
   project-details.js — renders one project chosen with ?p=<project id>
   Data comes from js/data/projects.js (same source as the Projects page).
============================================================================ */

function getRequestedProject() {
    // Static project pages (projects/<id>.html) carry the id on <body>; the shell uses ?p=<id>.
    const id = document.body.dataset.projectId || new URLSearchParams(window.location.search).get("p");
    if (!id) return null;
    return projectsData.find(p => p.id === id) || null;
}

function setSeoForProject(project) {
    const title = project
        ? localized(project.name) + " | " + t("pd.seoSuffix")
        : t("pd.notFoundTitle");
    const desc = project ? localized(project.description) : t("pd.notFoundDesc");
    document.title = title;
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', desc);
}

function renderProjectDetails() {
    const root = document.getElementById("pdRoot");
    if (!root) return;
    const project = getRequestedProject();
    setSeoForProject(project);

    if (!project) {
        document.getElementById("pdName").textContent = t("pd.notFoundTitle");
        document.getElementById("pdDesc").textContent = t("pd.notFoundDesc");
        document.getElementById("pdCrumb").textContent = t("pd.notFoundTitle");
        document.getElementById("pdBody").hidden = true;
        return;
    }

    document.getElementById("pdBody").hidden = false;
    document.getElementById("pdName").textContent = localized(project.name);
    document.getElementById("pdDesc").textContent = localized(project.description);
    document.getElementById("pdCrumb").textContent = localized(project.name);
    document.getElementById("pdDetails").textContent =
        localized(project.details) || localized(project.description);

    const sample = document.getElementById("pdSample");
    sample.hidden = !project.isSample;

    const lang = document.getElementById("pdLanguage");
    lang.textContent = project.language || "";
    lang.hidden = !project.language;

    const topics = document.getElementById("pdTopics");
    topics.innerHTML = "";
    (project.topics || []).forEach(topic => {
        const li = document.createElement("li");
        li.className = "pd-topic";
        li.textContent = topic;
        topics.appendChild(li);
    });

    const repo = document.getElementById("pdRepo");
    if (project.githubUrl) {
        repo.href = project.githubUrl;
        repo.hidden = false;
    } else {
        repo.hidden = true;
    }
}

onReady(renderProjectDetails);
onLanguageChange(renderProjectDetails);

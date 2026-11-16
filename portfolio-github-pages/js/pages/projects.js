/* projects.js — catalogue: stats, filter chips, search, sort and cards */

let activeCategory = "all";
let searchQuery = "";
let sortMode = "featured";

function renderStats() {
    const grid = document.getElementById("statsGrid");
    if (!grid) return;

    const techSet = new Set();
    projectsData.forEach(p => {
        if (p.language) techSet.add(p.language);
        (p.topics || []).forEach(topic => techSet.add(topic));
    });

    const stats = [
        { value: projectsData.length, label: t("stats.projects") },
        { value: techSet.size, label: t("stats.languages") },
        { value: projectsData.filter(p => p.featured).length, label: t("stats.featured") }
    ];

    grid.textContent = "";
    stats.forEach((stat, index) => {
        const card = document.createElement("div");
        card.className = "stat-card reveal reveal-delay-" + Math.min(index + 1, 4);

        const value = document.createElement("div");
        value.className = "stat-value";
        value.textContent = String(stat.value);

        const label = document.createElement("div");
        label.className = "stat-label";
        label.textContent = stat.label;

        card.appendChild(value);
        card.appendChild(label);
        grid.appendChild(card);
        revealObserver.observe(card);
    });
}
function countByCategory(category) {
    if (category === "all") return projectsData.length;
    return projectsData.filter(p => p.category === category).length;
}

function renderChips() {
    const row = document.getElementById("chipsRow");
    if (!row) return;
    row.textContent = "";

    CATEGORIES.forEach(category => {
        const count = countByCategory(category);
        if (category !== "all" && count === 0) return;   // دسته خالی نمایش داده نمی‌شود

        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip" + (activeCategory === category ? " active" : "");
        chip.setAttribute("aria-pressed", activeCategory === category ? "true" : "false");
        chip.dataset.category = category;

        const label = document.createElement("span");
        label.textContent = t("cat." + category);

        const badge = document.createElement("span");
        badge.className = "chip-count";
        badge.textContent = String(count);

        chip.appendChild(label);
        chip.appendChild(badge);

        chip.addEventListener("click", () => {
            activeCategory = category;
            renderChips();
            renderProjects();
        });

        row.appendChild(chip);
    });
}
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const sortSelect = document.getElementById("sortSelect");
const resetBtn = document.getElementById("resetBtn");
const emptyResetBtn = document.getElementById("emptyResetBtn");

let searchTimer = null;
searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    searchClear.classList.toggle("visible", searchQuery.length > 0);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderProjects, 160);
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchInput.value) {
      e.stopPropagation();
      clearSearch();
    }
});

function clearSearch() {
    searchInput.value = "";
    searchQuery = "";
    searchClear.classList.remove("visible");
    renderProjects();
    searchInput.focus();
}

searchClear.addEventListener("click", clearSearch);

sortSelect.addEventListener("change", () => {
    sortMode = sortSelect.value;
    renderProjects();
});

function resetFilters() {
    activeCategory = "all";
    searchQuery = "";
    searchInput.value = "";
    searchClear.classList.remove("visible");
    sortMode = "featured";
    sortSelect.value = "featured";
    renderChips();
    renderProjects();
}

resetBtn.addEventListener("click", resetFilters);
emptyResetBtn.addEventListener("click", resetFilters);
function getFilteredProjects() {
    const query = searchQuery.trim().toLowerCase();

    let list = projectsData.filter(project => {
        if (activeCategory !== "all" && project.category !== activeCategory) return false;
        if (!query) return true;

        const haystack = [
            project.name,
            project.language || "",
            localized(project.description),
            localized(project.details),
            (project.topics || []).join(" "),
            t("cat." + project.category)
        ].join(" ").toLowerCase();

        return haystack.includes(query);
    });

    if (sortMode === "name") {
        list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        list.sort((a, b) => {
            const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
            return featuredDiff !== 0 ? featuredDiff : a.name.localeCompare(b.name);
        });
    }

    return list;
}
function svgIcon(markup) {
    const wrap = document.createElement("span");
    wrap.innerHTML = markup;              // فقط SVG ثابت و قابل‌اعتماد
    return wrap.firstElementChild;
}

const ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>'
};

function getInitials(name) {
    const words = String(name).replace(/[^A-Za-z0-9\s-]/g, " ").trim().split(/[\s-]+/).filter(Boolean);
    if (words.length === 0) return "MR";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

function themeFor(project) {
    const index = Math.abs(hashString(project.id)) % PLACEHOLDER_THEMES.length;
    return PLACEHOLDER_THEMES[index];
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}

function buildImageArea(project) {
    const area = document.createElement("div");
    area.className = "project-image";

    if (project.image) {
        const img = document.createElement("img");
        img.src = project.image;
        img.alt = t("card.imageAlt") + " " + project.name;
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("error", () => {
            img.remove();
            area.appendChild(buildPlaceholder(project));
        });
        area.appendChild(img);
    } else {
        area.appendChild(buildPlaceholder(project));
    }

    const badges = document.createElement("div");
    badges.className = "project-badges";

    if (project.featured) {
        const badge = document.createElement("span");
        badge.className = "badge badge-featured";
        badge.appendChild(svgIcon(ICONS.star));
        const text = document.createElement("span");
        text.textContent = t("badge.featured");
        badge.appendChild(text);
        badges.appendChild(badge);
    }

    if (project.isSample) {
        const badge = document.createElement("span");
        badge.className = "badge badge-sample";
        badge.textContent = t("badge.sample");
        badges.appendChild(badge);
    }

    if (badges.childElementCount > 0) area.appendChild(badges);
    return area;
}

function buildPlaceholder(project) {
    const theme = themeFor(project);
    const ph = document.createElement("div");
    ph.className = "project-placeholder";
    ph.style.setProperty("--ph-a", theme[0]);
    ph.style.setProperty("--ph-b", theme[1]);
    ph.setAttribute("role", "img");
    ph.setAttribute("aria-label", t("card.imageAlt") + " " + project.name);

    const mono = document.createElement("span");
    mono.className = "ph-mono";
    mono.textContent = getInitials(project.name);

    const lang = document.createElement("span");
    lang.className = "ph-lang";
    lang.textContent = project.language || t("cat." + project.category);

    ph.appendChild(mono);
    ph.appendChild(lang);
    return ph;
}

function buildDetailsPanel(project, panelId) {
    const panel = document.createElement("div");
    panel.className = "project-details";
    panel.id = panelId;

    const inner = document.createElement("div");
    inner.className = "project-details-inner";

    const fullText = document.createElement("p");
    fullText.textContent = localized(project.details) || localized(project.description);
    inner.appendChild(fullText);

    const catRow = document.createElement("div");
    catRow.className = "details-row";
    const catKey = document.createElement("span");
    catKey.className = "details-key";
    catKey.textContent = t("card.category");
    const catVal = document.createElement("span");
    catVal.textContent = t("cat." + project.category);
    catRow.appendChild(catKey);
    catRow.appendChild(catVal);
    inner.appendChild(catRow);

    if ((project.topics || []).length > 0) {
        const topicRow = document.createElement("div");
        topicRow.className = "details-row";
        const topicKey = document.createElement("span");
        topicKey.className = "details-key";
        topicKey.textContent = t("card.topics");
        topicRow.appendChild(topicKey);
        project.topics.forEach(topic => {
            const chip = document.createElement("span");
            chip.className = "tech-chip";
            chip.textContent = topic;
            topicRow.appendChild(chip);
        });
        inner.appendChild(topicRow);
    }

    const dateRow = document.createElement("div");
    dateRow.className = "details-row";
    const dateKey = document.createElement("span");
    dateKey.className = "details-key";
    dateKey.textContent = t("card.updated");
    const dateVal = document.createElement("span");
    dateVal.textContent = project.updatedAt ? formatDate(project.updatedAt) : t("card.noDate");
    dateRow.appendChild(dateKey);
    dateRow.appendChild(dateVal);
    inner.appendChild(dateRow);

    const note = document.createElement("p");
    note.className = "details-note";
    note.textContent = t("card.detailsNote");
    inner.appendChild(note);

    panel.appendChild(inner);
    return panel;
}

function formatDate(iso) {
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return t("card.noDate");
        return date.toLocaleDateString(currentLang === "fa" ? "fa-IR" : "en-US", {
            year: "numeric", month: "short", day: "numeric"
        });
    } catch (e) {
        return t("card.noDate");
    }
}

function createProjectCard(project, index) {
    const card = document.createElement("article");
    card.className = "project-card reveal reveal-delay-" + Math.min(index + 1, 4);
    if (project.featured) card.classList.add("is-featured");
    card.dataset.projectId = project.id;
    if (project.repoName) card.dataset.repoName = project.repoName;

    card.appendChild(buildImageArea(project));

    const body = document.createElement("div");
    body.className = "project-body";

    const title = document.createElement("h3");
    title.className = "project-name";
    title.textContent = project.name;
    if (project.detailsUrl) {
        const link = document.createElement("a");
        link.href = project.detailsUrl;
        link.className = "project-name-link";
        link.textContent = project.name;
        title.textContent = "";
        title.appendChild(link);
    }
    body.appendChild(title);

    const desc = document.createElement("p");
    desc.className = "project-description";
    desc.textContent = localized(project.description);
    body.appendChild(desc);

    if ((project.topics || []).length > 0) {
        const chips = document.createElement("div");
        chips.className = "tech-chips";
        project.topics.slice(0, 4).forEach(topic => {
            const chip = document.createElement("span");
            chip.className = "tech-chip";
            chip.textContent = topic;
            chips.appendChild(chip);
        });
        body.appendChild(chips);
    }

    const meta = document.createElement("div");
    meta.className = "project-meta";

    const langEl = document.createElement("span");
    langEl.className = "project-language";
    const dot = document.createElement("span");
    dot.className = "language-dot";
    dot.style.background = LANGUAGE_COLORS[project.language] || "var(--accent)";
    const langText = document.createElement("span");
    langText.textContent = project.language || t("cat." + project.category);
    langEl.appendChild(dot);
    langEl.appendChild(langText);
    meta.appendChild(langEl);

    const catText = document.createElement("span");
    catText.textContent = t("cat." + project.category);
    meta.appendChild(catText);

    body.appendChild(meta);

    /* Actions */
    const actions = document.createElement("div");
    actions.className = "project-actions";

    const panelId = "details-" + project.id;

    if (project.detailsUrl) {
        // در آینده: لینک به صفحه اختصاصی پروژه
        const link = document.createElement("a");
        link.className = "btn btn-secondary btn-sm";
        link.href = project.detailsUrl;
        link.textContent = t("card.details");
        actions.appendChild(link);
    } else {
        // فعلاً: پنل جزئیات درون‌کارتی (بدون لینک خراب و بدون Modal سنگین)
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "btn btn-secondary btn-sm";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", panelId);
        const toggleText = document.createElement("span");
        toggleText.textContent = t("card.details");
        toggle.appendChild(toggleText);
        toggle.appendChild(svgIcon(ICONS.chevron));

        toggle.addEventListener("click", () => {
            const panel = document.getElementById(panelId);
            if (!panel) return;
            const isOpen = panel.classList.toggle("open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            toggleText.textContent = isOpen ? t("card.detailsClose") : t("card.details");
            const icon = toggle.querySelector("svg");
            if (icon) icon.style.transform = isOpen ? "rotate(180deg)" : "none";
        });

        actions.appendChild(toggle);
    }

    if (project.githubUrl) {
        const gh = document.createElement("a");
        gh.className = "icon-btn";
        gh.href = project.githubUrl;
        gh.target = "_blank";
        gh.rel = "noopener noreferrer";
        gh.setAttribute("aria-label", t("card.github") + " — " + project.name);
        gh.title = t("card.github");
        gh.appendChild(svgIcon(ICONS.github));
        actions.appendChild(gh);
    }

    if (project.liveUrl) {
        const live = document.createElement("a");
        live.className = "icon-btn";
        live.href = project.liveUrl;
        live.target = "_blank";
        live.rel = "noopener noreferrer";
        live.setAttribute("aria-label", t("card.live") + " — " + project.name);
        live.title = t("card.live");
        live.appendChild(svgIcon(ICONS.external));
        actions.appendChild(live);
    }

    body.appendChild(actions);
    body.appendChild(buildDetailsPanel(project, panelId));

    card.appendChild(body);
    return card;
}
function renderProjects() {
    const grid = document.getElementById("projectsGrid");
    const featuredGrid = document.getElementById("featuredGrid");
    const featuredBlock = document.getElementById("featuredBlock");
    const emptyState = document.getElementById("emptyState");
    const resultsCount = document.getElementById("resultsCount");
    if (!grid || !featuredGrid) return;

    const list = getFilteredProjects();
    const isDefaultView = activeCategory === "all" && searchQuery.trim() === "" && sortMode === "featured";
    const featuredList = isDefaultView ? list.filter(p => p.featured) : [];
    const mainList = featuredList.length > 0 ? list.filter(p => !p.featured) : list;

    grid.textContent = "";
    featuredGrid.textContent = "";

    featuredBlock.hidden = featuredList.length === 0;
    featuredList.forEach((project, index) => {
        const card = createProjectCard(project, index);
        featuredGrid.appendChild(card);
        revealObserver.observe(card);
    });

    mainList.forEach((project, index) => {
        const card = createProjectCard(project, index);
        grid.appendChild(card);
        revealObserver.observe(card);
    });

    emptyState.hidden = list.length !== 0;

    if (list.length === 0) {
        resultsCount.textContent = t("results.zero");
    } else if (list.length === 1) {
        resultsCount.textContent = t("results.one");
    } else {
        const number = currentLang === "fa" ? toPersianDigits(list.length) : String(list.length);
        resultsCount.textContent = t("results.many").replace("{n}", number);
    }

    const filtersActive = activeCategory !== "all" || searchQuery.trim() !== "" || sortMode !== "featured";
    resetBtn.hidden = !filtersActive;
}

function toPersianDigits(value) {
    const map = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];
    return String(value).replace(/\d/g, d => map[Number(d)]);
}

function renderProjectsPage() {
    renderStats();
    renderChips();
    renderProjects();
}
onReady(renderProjectsPage);
onLanguageChange(renderProjectsPage);

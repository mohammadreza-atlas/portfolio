/* home.js — featured project cards on the home page */

function createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card reveal";
    card.dataset.projectId = project.id;
    if (project.repoName) card.dataset.repoName = project.repoName;

    // Image section
    const imageSection = document.createElement("div");
    imageSection.className = "project-image";
    if (project.image) {
        const img = document.createElement("img");
        img.src = project.image;
        img.alt = project.name;
        img.loading = "lazy";
        img.onerror = function() {
            this.parentElement.innerHTML = getFallbackHTML();
        };
        imageSection.appendChild(img);
    } else {
        imageSection.innerHTML = getFallbackHTML();
    }

    // Body
    const body = document.createElement("div");
    body.className = "project-body";

    const top = document.createElement("div");
    top.className = "project-top";

    const icon = document.createElement("div");
    icon.className = "project-icon";
    icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

    const links = document.createElement("div");
    links.className = "project-links";

    if (project.githubUrl) {
        const repoLink = document.createElement("a");
        repoLink.href = project.githubUrl;
        repoLink.target = "_blank";
        repoLink.rel = "noopener noreferrer";
        repoLink.className = "project-link";
        repoLink.setAttribute("aria-label", t("projects.viewRepo"));
        repoLink.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>';
        links.appendChild(repoLink);
    }

    top.appendChild(icon);
    top.appendChild(links);

    const name = document.createElement("h3");
    name.className = "project-name";
    name.textContent = project.name;

    const description = document.createElement("p");
    description.className = "project-description";
    const descText = typeof project.description === 'object'
        ? (project.description[currentLang] || project.description.fa)
        : project.description;
    description.textContent = descText || t("projects.noDesc");

    const meta = document.createElement("div");
    meta.className = "project-meta";

    if (project.language) {
        const langEl = document.createElement("div");
        langEl.className = "project-language";
        const dot = document.createElement("span");
        dot.className = "language-dot";
        dot.style.background = LANGUAGE_COLORS[project.language] || "var(--accent)";
        const text = document.createElement("span");
        text.textContent = project.language;
        langEl.appendChild(dot);
        langEl.appendChild(text);
        meta.appendChild(langEl);
    } else {
        meta.appendChild(document.createElement("div"));
    }

    if (project.isSample) {
        const badge = document.createElement("span");
        badge.className = "project-sample-badge";
        badge.textContent = t("projects.sampleBadge");
        meta.appendChild(badge);
    }

    body.appendChild(top);
    body.appendChild(name);
    body.appendChild(description);
    body.appendChild(meta);

    card.appendChild(imageSection);
    card.appendChild(body);

    return card;
}

function getFallbackHTML() {
    return `<div class="project-image-fallback">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </div>`;
}

function renderProjects() {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const projects = projectsData.filter(p => p.featured).concat(projectsData.filter(p => !p.featured)).slice(0, 4);

    if (!projects.length) {
        const note = document.createElement("p");
        note.className = "pg-empty";
        note.textContent = t("projects.empty");
        grid.appendChild(note);
        return;
    }
    projects.forEach((project, i) => {
        const card = createProjectCard(project);
        card.classList.add(`reveal-delay-${Math.min(i + 1, 4)}`);
        grid.appendChild(card);
        revealObserver.observe(card);
    });
}

onReady(renderProjects);
onLanguageChange(renderProjects);

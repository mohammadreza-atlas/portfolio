/* ============================================================================
   components.js — widgets used on more than one page
   • renderMiniProjects: project cards on About and Services
   • initFaq: accordion on Services and Contact
============================================================================ */

/* ---- Mini projects ---- */function svgIcon(markup) {
    const wrap = document.createElement("span");
    wrap.innerHTML = markup;
    return wrap.firstElementChild;
}

const ICONS = {
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
};

function createMiniProjectCard(project) {
    const card = document.createElement("article");
    card.className = "mini-project-card reveal";
    card.dataset.projectId = project.id;

    const head = document.createElement("div");
    head.className = "mini-project-head";

    const icon = document.createElement("div");
    icon.className = "mini-project-icon";
    icon.appendChild(svgIcon(ICONS.folder));

    const name = document.createElement("h3");
    name.className = "mini-project-name";
    name.textContent = project.name;

    head.appendChild(icon);
    head.appendChild(name);

    const desc = document.createElement("p");
    desc.className = "mini-project-desc";
    desc.textContent = localized(project.description);

    const meta = document.createElement("div");
    meta.className = "mini-project-meta";

    const langEl = document.createElement("span");
    langEl.className = "mini-project-lang";
    const dot = document.createElement("span");
    dot.className = "lang-dot";
    dot.style.background = LANGUAGE_COLORS[project.language] || "var(--accent)";
    const langText = document.createElement("span");
    langText.textContent = project.language;
    langEl.appendChild(dot);
    langEl.appendChild(langText);

    const link = document.createElement("a");
    link.className = "mini-project-link";
    link.href = project.githubUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", project.name + " — GitHub");
    link.appendChild(svgIcon(ICONS.github));
    const linkText = document.createElement("span");
    linkText.textContent = t("myProjects.details");
    link.appendChild(linkText);

    meta.appendChild(langEl);
    meta.appendChild(link);

    card.appendChild(head);
    card.appendChild(desc);
    card.appendChild(meta);

    return card;
}

function renderMiniProjects() {
    const grid = document.getElementById("miniProjectsGrid");
    if (grid && !projectsData.length) {
        const section = grid.closest("section");
        if (section) section.hidden = true;
        return;
    }
    if (!grid) return;
    grid.textContent = "";
    projectsData.slice(0, 4).forEach(project => {
        const card = createMiniProjectCard(project);
        grid.appendChild(card);
        revealObserver.observe(card);
    });
}

/* ---- FAQ accordion ---- */function initFaq() {
    const faqList = document.getElementById("faqList");
    if (!faqList) return;

    faqList.addEventListener("click", (e) => {
        const button = e.target.closest(".faq-question");
        if (!button) return;

        const item = button.closest(".faq-item");
        const answer = item.querySelector(".faq-answer");
        const isOpen = item.classList.contains("open");

        // بستن همه آیتم‌های دیگر
        faqList.querySelectorAll(".faq-item.open").forEach(openItem => {
            if (openItem !== item) {
                openItem.classList.remove("open");
                openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
                openItem.querySelector(".faq-answer").style.maxHeight = "0";
            }
        });

        // باز/بستن آیتم فعلی
        if (isOpen) {
            item.classList.remove("open");
            button.setAttribute("aria-expanded", "false");
            answer.style.maxHeight = "0";
        } else {
            item.classList.add("open");
            button.setAttribute("aria-expanded", "true");
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });

    // پشتیبانی کیبورد
    faqList.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            const button = e.target.closest(".faq-question");
            if (button) {
                e.preventDefault();
                button.click();
            }
        }
    });
}

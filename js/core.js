/* ============================================================================
   core.js — shared behaviour for every page (vanilla JS, no dependencies)
   Loaded after js/lang/*.js and js/data/projects.js, before page scripts.
   Page scripts register work with onReady() and onLanguageChange().
============================================================================ */

const LANG_KEY = "mr_lang";

let currentLang = (function () {
    try {
        const saved = localStorage.getItem(LANG_KEY);
        return saved === "en" || saved === "fa" ? saved : "fa";
    } catch (e) {
        return "fa";
    }
})();

/* Dictionaries: SHARED_I18N (common keys) merged with PAGE_I18N (this page only). */
const translations = {
    fa: Object.assign({}, SHARED_I18N.fa, PAGE_I18N.fa),
    en: Object.assign({}, SHARED_I18N.en, PAGE_I18N.en)
};

function t(key) {
    const dict = translations[currentLang] || translations.fa;
    if (dict[key] !== undefined) return dict[key];
    return translations.fa[key] !== undefined ? translations.fa[key] : key;
}

function localized(value) {
    if (value && typeof value === "object") return value[currentLang] || value.fa || "";
    return value || "";
}

/* Hooks: page scripts push functions here instead of touching core internals. */
const READY_HOOKS = [];
const LANGUAGE_HOOKS = [];
function onReady(fn) { READY_HOOKS.push(fn); }
function onLanguageChange(fn) { LANGUAGE_HOOKS.push(fn); }

/* ----------------------------------------------------------------------------
   Element references (present on every page)
---------------------------------------------------------------------------- */
const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const backToTop = document.getElementById("backToTop");
const contactModal = document.getElementById("contactModal");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
let lastFocusedElement = null;

/* ----------------------------------------------------------------------------
   Language system
---------------------------------------------------------------------------- */
function setMeta(selector, content) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", content);
}

function applyLanguage(lang) {
    if (lang !== "fa" && lang !== "en") lang = "fa";
    currentLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* storage blocked: keep going */ }

    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");

    // Pages without seo.* keys (articles, 404) keep their own static head.
    if (translations[lang]["seo.title"] !== undefined) {
        const title = translations[lang]["seo.title"];
        const description = translations[lang]["seo.description"] || "";
        document.title = title;
        setMeta('meta[name="description"]', description);
        setMeta('meta[property="og:title"]', title);
        setMeta('meta[property="og:description"]', description);
        setMeta('meta[name="twitter:title"]', title);
        setMeta('meta[name="twitter:description"]', description);
    }
    setMeta('meta[property="og:locale"]', lang === "fa" ? "fa_IR" : "en_US");

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const text = translations[lang][key] !== undefined ? translations[lang][key] : translations.fa[key];
        if (text === undefined) return;
        // Dictionary values are trusted static content, so inline markup (<strong>) is allowed.
        if (/<[a-z][\s\S]*>/i.test(text)) el.innerHTML = text;
        else el.textContent = text;
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(el => {
        const text = translations[lang][el.getAttribute("data-i18n-aria")];
        if (text !== undefined) el.setAttribute("aria-label", text);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const text = translations[lang][el.getAttribute("data-i18n-placeholder")];
        if (text !== undefined) el.setAttribute("placeholder", text);
    });

    document.querySelectorAll(".lang-btn").forEach(btn => {
        const active = btn.dataset.lang === lang;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
    });

    LANGUAGE_HOOKS.forEach(fn => {
        try { fn(lang); } catch (err) { console.error(err); }
    });
}

document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

/* ----------------------------------------------------------------------------
   Header state, mobile menu, back-to-top
---------------------------------------------------------------------------- */
function handleHeaderScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 30);
}

function handleBackToTopVisibility() {
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 400);
}

window.addEventListener("scroll", () => {
    handleHeaderScroll();
    handleBackToTopVisibility();
}, { passive: true });

function toggleMobileMenu(forceClose = false) {
    if (!mobileNav || !menuToggle) return;
    const isOpen = mobileNav.classList.contains("open");
    const shouldOpen = !forceClose && !isOpen;
    mobileNav.classList.toggle("open", shouldOpen);
    menuToggle.classList.toggle("open", shouldOpen);
    menuToggle.setAttribute("aria-expanded", String(shouldOpen));
}

if (menuToggle) {
    menuToggle.addEventListener("click", () => toggleMobileMenu());
}

if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ----------------------------------------------------------------------------
   Reveal on scroll
---------------------------------------------------------------------------- */
const revealObserver = ("IntersectionObserver" in window)
    ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" })
    : null;

function observeReveal(scope = document) {
    scope.querySelectorAll(".reveal:not(.visible)").forEach(el => {
        if (revealObserver) revealObserver.observe(el);
        else el.classList.add("visible");
    });
}

/* ----------------------------------------------------------------------------
   Contact modal (shared by every page)
---------------------------------------------------------------------------- */
function getFocusable(container) {
    return Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null || el === document.activeElement);
}

function openContactModal() {
    if (!contactModal) return;
    lastFocusedElement = document.activeElement;
    if (mobileNav && mobileNav.classList.contains("open")) toggleMobileMenu(true);
    contactModal.classList.add("open");
    contactModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => {
        const first = getFocusable(contactModal)[0];
        if (first) first.focus();
    }, 100);
}

function closeContactModal() {
    if (!contactModal) return;
    contactModal.classList.remove("open");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
}

if (contactModal) {
    contactModal.addEventListener("click", (e) => {
        if (e.target === contactModal) closeContactModal();
    });
    contactModal.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;
        const items = getFocusable(contactModal);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
}

/* Declarative actions: <button data-action="openContactModal"> */
const ACTIONS = {
    openContactModal: () => openContactModal(),
    closeContactModal: () => closeContactModal(),
    toggleMobileMenu: () => toggleMobileMenu(),
    closePreviewModal: () => { if (typeof closePreviewModal === "function") closePreviewModal(); }
};

/* ----------------------------------------------------------------------------
   Copy to clipboard + toast
---------------------------------------------------------------------------- */
let toastTimeout = null;

function showToast(message) {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

function fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.className = "visually-hidden";
    document.body.appendChild(ta);
    ta.select();
    try {
        if (document.execCommand("copy")) done();
    } catch (e) {
        console.warn("Copy is not supported in this browser.");
    }
    ta.remove();
}

function copyToClipboard(text, buttonElement) {
    const done = () => {
        showToast(t("toast.copied"));
        if (buttonElement) {
            buttonElement.classList.add("copied");
            setTimeout(() => buttonElement.classList.remove("copied"), 1500);
        }
    };
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

/* ----------------------------------------------------------------------------
   Global click delegation: data-action, data-copy, mobile link close, outside click
---------------------------------------------------------------------------- */
document.addEventListener("click", (e) => {
    const actionEl = e.target.closest("[data-action]");
    if (actionEl && ACTIONS[actionEl.dataset.action]) {
        e.preventDefault();
        ACTIONS[actionEl.dataset.action]();
        return;
    }

    const copyEl = e.target.closest("[data-copy]");
    if (copyEl) {
        copyToClipboard(copyEl.dataset.copy, copyEl);
        return;
    }

    const mobileLink = e.target.closest(".mobile-nav-link");
    if (mobileLink) {
        toggleMobileMenu(true);
        return;
    }

    if (mobileNav && menuToggle && mobileNav.classList.contains("open")
        && !mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
        toggleMobileMenu(true);
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const previewModal = document.getElementById("previewModal");
    if (previewModal && previewModal.classList.contains("open") && typeof closePreviewModal === "function") {
        closePreviewModal();
        return;
    }
    if (mobileNav && mobileNav.classList.contains("open")) {
        toggleMobileMenu(true);
        if (menuToggle) menuToggle.focus();
        return;
    }
    if (contactModal && contactModal.classList.contains("open")) closeContactModal();
});

/* ----------------------------------------------------------------------------
   Smooth scroll for in-page anchors (accounts for the fixed header)
---------------------------------------------------------------------------- */
document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = header ? header.offsetHeight + 12 : 0;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", "#" + id);
});

/* ----------------------------------------------------------------------------
   Init (runs once the deferred scripts have all executed)
---------------------------------------------------------------------------- */
function initCore() {
    const year = document.getElementById("currentYear");
    if (year) year.textContent = new Date().getFullYear();

    handleHeaderScroll();
    handleBackToTopVisibility();
    observeReveal(document);

    READY_HOOKS.forEach(fn => {
        try { fn(); } catch (err) { console.error(err); }
    });

    applyLanguage(currentLang);
}

document.addEventListener("DOMContentLoaded", initCore);

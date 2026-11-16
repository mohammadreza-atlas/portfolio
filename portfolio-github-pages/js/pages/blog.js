/* ============================================================================
   blog.js — category filter + title search for the blog index.
   Articles are static HTML (crawlable); this script only shows/hides cards.
============================================================================ */

function initBlogFilters() {
    const grid = document.getElementById("blogGrid");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".blog-card"));
    const chips = Array.from(document.querySelectorAll("[data-blog-filter]"));
    const search = document.getElementById("blogSearch");
    const empty = document.getElementById("blogEmpty");
    let category = "all";

    function apply() {
        const query = (search ? search.value : "").trim().toLowerCase();
        let shown = 0;
        cards.forEach(card => {
            const matchCat = category === "all" || card.dataset.category === category;
            const haystack = (card.dataset.title || "") + " " + (card.dataset.tags || "");
            const matchQuery = !query || haystack.toLowerCase().includes(query);
            const visible = matchCat && matchQuery;
            card.hidden = !visible;
            if (visible) shown++;
        });
        if (empty) empty.hidden = shown !== 0;
    }

    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            category = chip.dataset.blogFilter;
            chips.forEach(c => {
                const active = c === chip;
                c.classList.toggle("active", active);
                c.setAttribute("aria-pressed", String(active));
            });
            apply();
        });
    });

    if (search) search.addEventListener("input", apply);
}

onReady(initBlogFilters);

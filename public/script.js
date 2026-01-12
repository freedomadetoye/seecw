const searchInput = document.getElementById("searchInput");
const feed = document.getElementById("feed");
const filterButtons = document.querySelectorAll(".filters button");

let allResults = [];
let currentSource = "all";

/* SEARCH */
async function runSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    feed.innerHTML = "<p>Loading results…</p>";

    try {
        const response = await fetch(`/search?item=${encodeURIComponent(query)}`);
        const data = await response.json();

        allResults = data.data || [];
        renderFeed();
    } catch {
        feed.innerHTML = "<p>Failed to load results.</p>";
    }
}

/* RENDER */
function renderFeed() {
    feed.innerHTML = "";

    const filtered = currentSource === "all"
        ? allResults
        : allResults.filter(p => p.source === currentSource);

    if (filtered.length === 0) {
        feed.innerHTML = "<p>No products found.</p>";
        return;
    }

    filtered.forEach(p => {
        const post = document.createElement("div");
        post.className = "post";
        post.style.backgroundImage = `url('${p.image}')`;

        post.innerHTML = `
            <div class="glass">
                <div class="source">
                    <i class="fa-solid fa-store"></i> ${p.source}
                </div>
                <div class="title">${p.title}</div>
                <div class="price">₦${Number(p.price).toLocaleString()}</div>
                <div class="actions">
                    <a href="${p.link}" target="_blank">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> View
                    </a>
                </div>
            </div>
        `;

        feed.appendChild(post);
    });
}

/* FILTERS */
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentSource = btn.dataset.source;
        renderFeed();
    });
});

/* EVENTS */
searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") runSearch();
});

window.onload = () => searchInput.focus();
let allResults = [];
let currentSource = 'all';

async function runSearch() {
    const query = document.getElementById('searchInput').value;
    const resultsContainer = document.getElementById('results');

    resultsContainer.innerHTML = '<p>Searching Africa’s markets...</p>';

    const response = await fetch(`/search?item=${query}`);
    const result = await response.json();

    allResults = result.data;
    renderResults();
}

function filterSource(source) {
    currentSource = source;

    document.querySelectorAll('.nav-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderResults();
}

function renderResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    const filtered = currentSource === 'all'
        ? allResults
        : allResults.filter(p => p.source === currentSource);

    filtered.forEach(product => {
        resultsContainer.innerHTML += `
        <div class="card">
            <img src="${product.image}" alt="${product.title}">
            <div class="info">
                <span class="badge ${product.source.toLowerCase()}">${product.source}</span>
                <h3>${product.title}</h3>
                <p class="price">₦${product.price.toLocaleString()}</p>
                <a href="${product.link}" target="_blank">
                    View on ${product.source}
                </a>
            </div>
        </div>
        `;
    });
}
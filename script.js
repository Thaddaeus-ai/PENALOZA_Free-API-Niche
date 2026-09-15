
const searchInput = document.getElementById('searchInput');
const mediaType = document.getElementById('mediaType');
const searchBtn = document.getElementById('searchBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const resultsGrid = document.getElementById('resultsGrid');

function triggerPreset(query) {
    searchInput.value = query;
    fetchData(query, mediaType.value);
}
async function fetchData(query, type) {
    const encodedQuery = encodeURIComponent(query);

    const url = type === 'video'
        ? `https://api.giphy.com/v1/clips/search?api_key=${CONFIG.API_KEY}&q=${encodedQuery}&limit=12`
        : `https://api.giphy.com/v1/gifs/search?api_key=${CONFIG.API_KEY}&q=${encodedQuery}&limit=12`;

    errorMessage.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        const results = data.data;

        if (!results || results.length === 0) {
            errorMessage.textContent = "No results found.";
            errorMessage.classList.remove('hidden');
            resultsGrid.innerHTML = "";
        } else {
            renderResults(results, type);
        }
    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Request failed. Check your API key or connection.";
        errorMessage.classList.remove('hidden');
        resultsGrid.innerHTML = "";
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

function renderResults(hits, type) {
    resultsGrid.innerHTML = "";

    hits.forEach(item => {
    const div = document.createElement('div');
    div.className = 'result-item';

    const author = item.username || 'Giphy User';

        if (type === 'video') {
            const videoSrc = item.images?.original?.mp4 || '';

            div.innerHTML = `
                <video controls preload="metadata">
                <source src="${videoSrc}" type="video/mp4">
                Your browser does not support video playback.
                </video>
                <p>By: ${author}</p>
            `;
        } else {
            const imgSrc = item.images?.fixed_height?.url || item.images?.original?.url;

            div.innerHTML = `
            <img src="${imgSrc}" alt="${item.title || 'Giphy GIF'}">
            <p>By: ${author}</p>
            `;
        }

    resultsGrid.appendChild(div);
    });
}

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchData(query, mediaType.value);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});
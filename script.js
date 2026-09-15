// 1. Declare DOM references
const searchInput = document.getElementById('searchInput');
const mediaType = document.getElementById('mediaType');
const searchBtn = document.getElementById('searchBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const resultsGrid = document.getElementById('resultsGrid');

// 2. Preset Search Helper
function triggerPreset(query) {
    searchInput.value = query;
    fetchData(query, mediaType.value);
}

// 3. Main Fetch Function using Browse AI Workspace API
async function fetchData(query, type) {
    errorMessage.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');

    // Browse AI task endpoint
    const url = `https://api.browse.ai/v2/robots/${CONFIG.ROBOT_ID}/tasks`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputParameters: {
                    originUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Browse AI Error: ${response.status}`);
        }

        const data = await response.json();

        // Check if extraction data was returned directly
        const results = data.result?.capturedLists;

        if (!results || Object.keys(results).length === 0) {
            errorMessage.textContent = "Task started! Check your Browse AI dashboard for live status.";
            errorMessage.classList.remove('hidden');
            resultsGrid.innerHTML = "";
        } else {
            renderResults(results);
        }
    } catch (error) {
        console.error(error);
        errorMessage.textContent = "Request failed. Check your Browse AI API key or Robot ID.";
        errorMessage.classList.remove('hidden');
        resultsGrid.innerHTML = "";
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

// 4. Render Results Function for Browse AI Scraped Items
function renderResults(capturedLists) {
    resultsGrid.innerHTML = "";

    // Grab the primary list extracted by your scraper
    const primaryKey = Object.keys(capturedLists)[0];
    const items = capturedLists[primaryKey] || [];

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';

        // Render scraped images or texts
        const imageSrc = item.src || item.image || item.thumbnail;
        const titleText = item.title || item.name || 'Extracted Result';

        div.innerHTML = `
            ${imageSrc ? `<img src="${imageSrc}" alt="${titleText}">` : ''}
            <p><strong>${titleText}</strong></p>
            ${item.link ? `<a href="${item.link}" target="_blank">View Details</a>` : ''}
        `;

        resultsGrid.appendChild(div);
    });
}

// 5. Event Listeners
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
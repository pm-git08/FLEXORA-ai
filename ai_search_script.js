
// --- JavaScript Code ---

document.addEventListener('DOMContentLoaded', () => {
    // --- GSAP Animations ---
    gsap.to("#main-heading", { duration: 0.8, y: 0, opacity: 1, ease: "power2.out", delay: 0.2 });
    gsap.to("#sub-heading", { duration: 0.8, y: 0, opacity: 1, ease: "power2.out", delay: 0.4 });
    gsap.to("#desc-text", { duration: 0.8, y: 0, opacity: 1, ease: "power2.out", delay: 0.6 });
    gsap.to("#ai-search-form", { duration: 0.8, y: 0, opacity: 1, ease: "power2.out", delay: 0.8 });

    // --- Element References & Event Listeners ---
    const searchForm = document.getElementById('ai-search-form');
    const searchQueryInput = document.getElementById('search-query-input');
    // No clear icon in this simple version

    if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            performAiSearch();
        });
    } else {
        console.error('Search form with ID "ai-search-form" not found!');
    }
}); // End DOMContentLoaded

// --- Function to call the backend API ---
async function performAiSearch() {
    const searchQueryInput = document.getElementById('search-query-input');
    const searchTypeSelect = document.getElementById('search-type-select');
    const searchResultsArea = document.getElementById('search-results-area');
    const searchButton = document.getElementById('search-submit-button');

    const query = searchQueryInput.value;
    const type = searchTypeSelect.value;
    if (!query) { alert('Please enter a search query.'); return; }

    searchResultsArea.innerHTML = '<p>Searching...</p>';
    searchResultsArea.classList.add('loading');
    searchResultsArea.classList.remove('error');
    if (searchButton) searchButton.disabled = true;

    const requestBody = { query: query, type: type };

    try {
        // *** IMPORTANT: Use your correct backend URL ***
        const apiUrl = 'http://localhost:5002/api/search';
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        displaySearchResults(data.matches, type);
    } catch (error) {
        console.error('Fetch/API Error:', error);
        displayError(error.message || 'Could not connect to the search service.');
    } finally {
        searchResultsArea.classList.remove('loading');
        if (searchButton) searchButton.disabled = false;
    }
}

// --- Function to display search results (using Tailwind classes) ---
function displaySearchResults(matches, searchType) {
    const searchResultsArea = document.getElementById('search-results-area');
    searchResultsArea.innerHTML = '';

    if (!matches || matches.length === 0) {
        searchResultsArea.innerHTML = '<p class="text-center text-gray-400">No relevant matches found.</p>';
        return;
    }
    const resultItems = [];
    matches.forEach(match => {
        const item = document.createElement('div');
        // --- Tailwind classes for result items ---
        item.className = 'result-item bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-4 border border-gray-700';
        item.style.opacity = 0; item.style.transform = 'translateY(20px)'; // Initial state for GSAP

        let title = 'N/A';
        let detailsHTML = '';
        let summaryOrDescHTML = '';

        if (searchType === 'client_search') { // Freelancer
            title = match.name || 'Unnamed Freelancer';
            const skillsList = Array.isArray(match.skills) ? match.skills : [];
            const skillsText = skillsList.length > 0 ? skillsList.map(s => `<span class="inline-block bg-gray-700 text-purple-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">${escapeHtml(s)}</span>`).join(' ') : '<span class="text-gray-400 text-sm">No skills listed</span>';
            const rateText = match.hourly_rate != null ? `₹${match.hourly_rate}/hr` : 'Rate not specified';

            detailsHTML += `<div class="mt-2"><p class="text-sm text-gray-400 mb-1">Skills:</p><div>${skillsText}</div></div>`; // Use div for skill tags
            detailsHTML += `<p class="mt-2 text-sm text-gray-300"><strong class="font-semibold text-gray-200">Rate:</strong> ${escapeHtml(rateText)}</p>`;

            if (match.profile_summary) {
                const fullSummary = escapeHtml(match.profile_summary); const snippet = fullSummary.substring(0, 120);
                if (fullSummary.length > 120) {
                    const elementId = `summary-${match.id || Math.random().toString(36).substring(2)}`; const buttonId = `toggle-${elementId}`;
                    summaryOrDescHTML = `<div id="${elementId}" class="expandable-text short text-sm text-gray-300 mt-2"><p><strong class="font-semibold text-gray-200">Summary:</strong> ${snippet}<span class="ellipsis">...</span><span class="full-text">${fullSummary.substring(120)}</span></p></div><button class="read-more-btn" id="${buttonId}" onclick="toggleText('${elementId}', '${buttonId}')">Read More</button>`;
                } else { summaryOrDescHTML = `<p class="text-sm text-gray-300 mt-2"><strong class="font-semibold text-gray-200">Summary:</strong> ${fullSummary}</p>`; }
            }
            detailsHTML += `<p class="mt-3"><a href="/profile/${match.id}" target="_blank" rel="noopener noreferrer" class="text-brandPurple-light hover:text-brandPurple font-medium text-sm">View Profile &rarr;</a></p>`;

        } else { // Job
            title = match.title || 'Untitled Job';
            const requiredSkillsList = Array.isArray(match.required_skills) ? match.required_skills : [];
            const skillsText = requiredSkillsList.length > 0 ? requiredSkillsList.map(s => `<span class="inline-block bg-gray-700 text-purple-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">${escapeHtml(s)}</span>`).join(' ') : '<span class="text-gray-400 text-sm">No skills specified</span>';
            const budgetText = (match.budget_min != null || match.budget_max != null) ? `Budget: ${match.budget_min != null ? '₹' + match.budget_min : ''} ${match.budget_min != null && match.budget_max != null ? ' - ' : ''} ${match.budget_max != null ? '₹' + match.budget_max : ''}` : 'Budget not specified';

            detailsHTML += `<div class="mt-2"><p class="text-sm text-gray-400 mb-1">Required Skills:</p><div>${skillsText}</div></div>`;
            detailsHTML += `<p class="mt-2 text-sm text-gray-300"><strong class="font-semibold text-gray-200">Budget:</strong> ${escapeHtml(budgetText)}</p>`;
            if (match.description) {
                const fullDescription = escapeHtml(match.description); const snippet = fullDescription.substring(0, 150);
                if (fullDescription.length > 150) {
                    const elementId = `desc-${match.id || Math.random().toString(36).substring(2)}`; const buttonId = `toggle-${elementId}`;
                    summaryOrDescHTML = `<div id="${elementId}" class="expandable-text short text-sm text-gray-300 mt-2"><p><strong class="font-semibold text-gray-200">Description:</strong> ${snippet}<span class="ellipsis">...</span><span class="full-text">${fullDescription.substring(150)}</span></p></div><button class="read-more-btn" id="${buttonId}" onclick="toggleText('${elementId}', '${buttonId}')">Read More</button>`;
                } else { summaryOrDescHTML = `<p class="text-sm text-gray-300 mt-2"><strong class="font-semibold text-gray-200">Description:</strong> ${fullDescription}</p>`; }
            }
            detailsHTML += `<p class="mt-3"><a href="/job/${match.id}" target="_blank" rel="noopener noreferrer" class="text-brandPurple-light hover:text-brandPurple font-medium text-sm">View Job Details &rarr;</a></p>`;
        }
        // --- Use Tailwind classes for title ---
        item.innerHTML = `<h4 class="text-lg md:text-xl font-semibold text-brandWhite mb-2">${escapeHtml(title)}</h4>${summaryOrDescHTML}${detailsHTML}`;
        searchResultsArea.appendChild(item);
        resultItems.push(item);
    });
    // Animate results with GSAP
    gsap.to(resultItems, { duration: 0.4, opacity: 1, y: 0, stagger: 0.08, ease: "power1.out" }); // Slightly faster stagger
}

// --- Function to display errors ---
function displayError(errorMessage) {
    const searchResultsArea = document.getElementById('search-results-area');
    if (!searchResultsArea) return;
    searchResultsArea.innerHTML = `<p>${escapeHtml(errorMessage)}</p>`;
    searchResultsArea.classList.add('error');
}

// --- Helper function to escape HTML ---
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// --- Helper function for toggling text ---
function toggleText(elementId, buttonId) {
    const textElement = document.getElementById(elementId);
    const buttonElement = document.getElementById(buttonId);
    if (!textElement || !buttonElement) return;
    // Use Tailwind classes OR direct style manipulation if simpler
    // Example using class toggle (assumes 'short' class hides .full-text)
    if (textElement.classList.contains('short')) {
        textElement.classList.remove('short');
        buttonElement.textContent = 'Read Less';
    } else {
        textElement.classList.add('short');
        buttonElement.textContent = 'Read More';
    }
}



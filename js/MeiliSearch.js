// ================================
// MeiliSearch Frontend Integration
// ================================

// MeiliSearch config
const MEILI_HOST = 'http://127.0.0.1:7700'; // Change to your MeiliSearch instance URL
const MEILI_API_KEY = 'd7733c8ef3db150a12fdbae24699e71e6392422f';
const INDEX_NAME = 'mars_library';

// Containers
const libraryContainer = document.getElementById("libraryContainer");

// Search bar logic
function handleSearch(event) {
  if (event.key === 'Enter') {
    searchLibrary();
  }
}

async function searchLibrary() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) {
    alert('Please enter a search query.');
    return;
  }

  libraryContainer.innerHTML = '<p>Searching...</p>';

  try {
    const response = await fetch(`${MEILI_HOST}/indexes/${INDEX_NAME}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${d7733c8ef3db150a12fdbae24699e71e6392422f}`
      },
      body: JSON.stringify({ 
        q: query, 
        limit: 20,
        attributesToCrop: ['abstract'],
        attributesToHighlight: ['title', 'authors', 'keywords']
      })
    });

    const data = await response.json();
    renderLibraryItems(data.hits);

  } catch (error) {
    console.error('Error searching MeiliSearch:', error);
    libraryContainer.innerHTML = '<p>Error searching the library.</p>';
  }
}

// Render search results
function renderLibraryItems(items) {
  if (!items.length) {
    libraryContainer.innerHTML = '<p>No results found.</p>';
    return;
  }

  libraryContainer.innerHTML = '';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'news-item';

    div.innerHTML = `
      <h4><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h4>
      <p>${item.published || 'Unknown Date'} - ${item.authors || 'Unknown Authors'}</p>
      <p style="font-style: italic; font-size: 12px;">Keywords: ${item.keywords || 'None'} | Source: ${item.source}</p>
    `;

    libraryContainer.appendChild(div);
  });
}

// ================================
// Mars Library Fetcher
// ================================

const div = document.createElement('div');
div.className = 'library-item';

// Search query keywords
const SEARCH_QUERY = 'Mars space travel colonization exploration';

// Containers
const libraryContainer = document.getElementById("libraryContainer");

// API URLs & Keys (if needed)
const arxivAPI = `https://export.arxiv.org/api/query?search_query=cat:astro-ph+AND+all:Mars&start=0&max_results=15`;

const today = new Date().toISOString().split('T')[0];
const nasaADS_API = `https://ui.adsabs.harvard.edu/v1/search/query?q=(title:Mars OR abstract:Mars) AND pubdate:[1900-01-01 TO 2025-12-31${today}]&fl=title,bibcode,author,pubdate&rows=15`; 
const nasaADS_API_KEY = 'WQto7CqrgTmifC8xpaBQEskOJ9I2qhQyy16R8HDF'; // Register & get key from https://ui.adsabs.harvard.edu/user/settings/token

const springerAPI = `https://api.springernature.com/meta/v2/json?q=title:Mars OR abstract:Mars&api_key=bdd4784fdadfe093ad4dc842b08ced4b`;

const googleBooksAPI = `https://www.googleapis.com/books/v1/volumes?q=Mars+colonization&maxResults=15`;

// More API URLs & Keys

const nasaOpenAPI = `https://api.nasa.gov/planetary/apod?api_key=WQto7CqrgTmifC8xpaBQEskOJ9I2qhQyy16R8HDF`; // Register at https://api.nasa.gov

const usgsAstroAPI = `https://astrogeology.usgs.gov/api/v1/record/mars`; // Example endpoint, confirm with USGS docs.

const cernOpenDataAPI = `http://opendata.cern.ch/api/records/?q=Mars&size=15`;

const esaOpenDataAPI = `https://scihub.copernicus.eu/dhus/search?format=json&q=Mars`; // Requires registration for full access.

const harvardDataverseAPI = `https://dataverse.harvard.edu/api/search?q=Mars&per_page=15`;

const pdsAPI = `https://pds.nasa.gov/services/search/search?q=Mars&rows=15`;

const semanticScholarAPI = `https://api.semanticscholar.org/graph/v1/paper/search?query=Mars&limit=15`;

const coreAPI = `https://api.core.ac.uk/v3/search/works?q=Mars&apiKey=Hr7BewzW5Zl0Vd8YnMFfhG4LD32EAQ9q`;

const scopusAPI = `https://api.elsevier.com/content/search/scopus?query=Mars&apiKey=8fe23a648e570e76ecac7bf6c39e824e`; // Requires Elsevier registration

const crossRefAPI = `https://api.crossref.org/works?query=Mars&rows=15`;

const openAIRE_API = `https://api.openaire.eu/search/publications?keywords=Mars&size=15`;

const jplSSD_API = `https://ssd-api.jpl.nasa.gov/sbdb_query.api?spk=Mars`; // For object data

const copernicusAPI = `https://scihub.copernicus.eu/dhus/search?q=Mars&rows=15`; // Similar to esaOpenDataAPI

const mendeleyAPI = `https://api.mendeley.com/catalog?query=Mars&limit=15`; // Requires OAuth token

const openCitationsAPI = `https://opencitations.net/index/coci/api/v1/citations/Mars`;

const figshareAPI = `https://api.figshare.com/v2/articles/search?search_for=Mars`;

const zenodoAPI = `https://zenodo.org/api/records/?q=Mars&size=15`;

const dplaAPI = `https://api.dp.la/v2/items?q=Mars&api_key=fdc188af3b8e8ba3128421a88eac4545`;

// ===============
// Fetch Functions
// ===============

// 1. Fetch from arXiv (Open Access)
async function fetchArxivPapers() {
  try {
    const response = await fetch(arxivAPI);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const entries = xmlDoc.querySelectorAll('entry');

    return Array.from(entries).map(entry => ({
      source: 'arXiv',
      title: entry.querySelector('title')?.textContent.trim(),
      link: entry.querySelector('id')?.textContent,
      authors: entry.querySelectorAll('author > name'),
      published: entry.querySelector('published')?.textContent.split('T')[0]
    }));
  } catch (error) {
    console.error("Error fetching from arXiv:", error);
    return [];
  }
}

// 2. Fetch from NASA ADS
async function fetchNASAPapers() {
  try {
    const response = await fetch(nasaADS_API, {
      headers: {
        'Authorization': `Bearer ${WQto7CqrgTmifC8xpaBQEskOJ9I2qhQyy16R8HDF}`,
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();
    const docs = json.response.docs || [];

    return docs.map(doc => ({
      source: 'NASA ADS',
      title: doc.title[0],
      link: `https://ui.adsabs.harvard.edu/abs/${doc.bibcode}`,
      authors: doc.author.join(', '),
      published: doc.pubdate
    }));
  } catch (error) {
    console.error("Error fetching from NASA ADS:", error);
    return [];
  }
}

// 3. Fetch from Springer (Open Access)
async function fetchSpringerPapers() {
  try {
    const response = await fetch(springerAPI);
    const json = await response.json();
    const records = json.records || [];

    return records.map(record => ({
      source: 'Springer',
      title: record.title,
      link: record.url[0].value,
      authors: record.creators.map(c => c.creator).join(', '),
      published: record.publicationDate
    }));
  } catch (error) {
    console.error("Error fetching from Springer:", error);
    return [];
  }
}

// 4. Fetch from Google Books API
async function fetchGoogleBooks() {
  try {
    const response = await fetch(googleBooksAPI);
    const json = await response.json();
    const books = json.items || [];

    return books.map(book => ({
      source: 'Google Books',
      title: book.volumeInfo.title,
      link: book.volumeInfo.infoLink,
      authors: (book.volumeInfo.authors || []).join(', '),
      published: book.volumeInfo.publishedDate
    }));
  } catch (error) {
    console.error("Error fetching from Google Books:", error);
    return [];
  }
}

// 5. Fetch from NASA Open API
async function fetchNasaOpenData() {
  try {
    const response = await fetch(nasaOpenAPI);
    const data = await response.json();
    return [{
      source: 'NASA Open API',
      title: data.title,
      link: data.url,
      published: data.date,
      explanation: data.explanation
    }];
  } catch (error) {
    console.error("Error fetching from NASA Open API:", error);
    return [];
  }
}

// 6. Fetch from USGS Astrogeology
async function fetchUSGSAstro() {
  try {
    const response = await fetch(usgsAstroAPI);
    const data = await response.json();
    return data.results.map(item => ({
      source: 'USGS Astro',
      title: item.title,
      link: item.url,
      published: item.date
    }));
  } catch (error) {
    console.error("Error fetching from USGS Astro:", error);
    return [];
  }
}

// 7. Fetch from ESA Open Data
async function fetchESAData() {
  try {
    const response = await fetch(esaOpenDataAPI, {
      headers: {
        'Authorization': 'Basic YOUR_CREDENTIALS' // Required login for Copernicus API
      }
    });
    const data = await response.json();
    return data.entries.map(entry => ({
      source: 'ESA Open Data',
      title: entry.title,
      link: entry.link.href,
      published: entry.updated
    }));
  } catch (error) {
    console.error("Error fetching from ESA Open Data:", error);
    return [];
  }
}

// 8. Fetch from CERN Open Data
async function fetchCernData() {
  try {
    const response = await fetch(cernOpenDataAPI);
    const data = await response.json();
    return data.hits.hits.map(item => ({
      source: 'CERN Open Data',
      title: item.metadata.title,
      link: item.links.self,
      published: item.metadata.publication_date
    }));
  } catch (error) {
    console.error("Error fetching from CERN Open Data:", error);
    return [];
  }
}

// 9. Fetch from Harvard Dataverse
async function fetchHarvardDataverse() {
  try {
    const response = await fetch(harvardDataverseAPI);
    const data = await response.json();
    return data.data.items.map(item => ({
      source: 'Harvard Dataverse',
      title: item.name,
      link: item.url,
      published: item.releaseDate
    }));
  } catch (error) {
    console.error("Error fetching from Harvard Dataverse:", error);
    return [];
  }
}

// 10. Fetch from PDS NASA
async function fetchPDSData() {
  try {
    const response = await fetch(pdsAPI);
    const data = await response.json();
    return data.results.map(item => ({
      source: 'NASA PDS',
      title: item.title,
      link: item.url,
      published: item.date
    }));
  } catch (error) {
    console.error("Error fetching from NASA PDS:", error);
    return [];
  }
}

// 11. Fetch from Semantic Scholar
async function fetchSemanticScholar() {
  try {
    const response = await fetch(semanticScholarAPI);
    const data = await response.json();
    return data.data.map(item => ({
      source: 'Semantic Scholar',
      title: item.title,
      link: `https://www.semanticscholar.org/paper/${item.paperId}`,
      published: item.year
    }));
  } catch (error) {
    console.error("Error fetching from Semantic Scholar:", error);
    return [];
  }
}

// 12. Fetch from CORE API
async function fetchCoreData() {
  try {
    const response = await fetch(coreAPI, {
      headers: { 'Authorization': 'Bearer Hr7BewzW5Zl0Vd8YnMFfhG4LD32EAQ9q' }
    });
    const data = await response.json();
    return data.results.map(item => ({
      source: 'CORE',
      title: item.title,
      link: item.url,
      published: item.yearPublished
    }));
  } catch (error) {
    console.error("Error fetching from CORE API:", error);
    return [];
  }
}

// 13. Fetch from Scopus
async function fetchScopusData() {
  try {
    const response = await fetch(scopusAPI, {
      headers: { 'X-ELS-APIKey': 'YOUR_SCOPUS_KEY' }
    });
    const data = await response.json();
    return data['search-results'].entry.map(item => ({
      source: 'Scopus',
      title: item.dc_title,
      link: item.link.find(l => l['@ref'] === 'scopus').$,
      published: item.prism_coverDate
    }));
  } catch (error) {
    console.error("Error fetching from Scopus:", error);
    return [];
  }
}

// 14. Fetch from CrossRef
async function fetchCrossRef() {
  try {
    const response = await fetch(crossRefAPI);
    const data = await response.json();
    return data.message.items.map(item => ({
      source: 'CrossRef',
      title: item.title[0],
      link: item.URL,
      published: item.created['date-time'].split('T')[0]
    }));
  } catch (error) {
    console.error("Error fetching from CrossRef:", error);
    return [];
  }
}

// 15. Fetch from OpenAIRE
async function fetchOpenAIRE() {
  try {
    const response = await fetch(openAIRE_API);
    const data = await response.json();
    return data.response.results.result.map(item => ({
      source: 'OpenAIRE',
      title: item.metadata.title,
      link: item.metadata.url,
      published: item.metadata.dateAccepted
    }));
  } catch (error) {
    console.error("Error fetching from OpenAIRE:", error);
    return [];
  }
}

// 16. Fetch from JPL SSD
async function fetchJPLSSD() {
  try {
    const response = await fetch(jplSSD_API);
    const data = await response.json();
    return [{
      source: 'JPL SSD',
      title: data.object.fullname,
      link: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${data.object.des}`,
      published: 'N/A'
    }];
  } catch (error) {
    console.error("Error fetching from JPL SSD:", error);
    return [];
  }
}

// 17. Fetch from Copernicus Open Access Hub
async function fetchCopernicus() {
  try {
    const response = await fetch(copernicusAPI, {
      headers: {
        'Authorization': 'Basic YOUR_CREDENTIALS' // Required login
      }
    });
    const data = await response.json();
    return data.entries.map(entry => ({
      source: 'Copernicus',
      title: entry.title,
      link: entry.link.href,
      published: entry.updated
    }));
  } catch (error) {
    console.error("Error fetching from Copernicus:", error);
    return [];
  }
}

// 18. Fetch from Mendeley
async function fetchMendeley() {
  try {
    const response = await fetch(mendeleyAPI, {
      headers: { 'Authorization': 'Bearer YOUR_MENDELEY_TOKEN' }
    });
    const data = await response.json();
    return data.map(item => ({
      source: 'Mendeley',
      title: item.title,
      link: item.link,
      published: item.year
    }));
  } catch (error) {
    console.error("Error fetching from Mendeley:", error);
    return [];
  }
}

// 19. Fetch from OpenCitations
async function fetchOpenCitations() {
  try {
    const response = await fetch(openCitationsAPI);
    const data = await response.json();
    return data.map(item => ({
      source: 'OpenCitations',
      citing: item.citing,
      cited: item.cited,
      citationDate: item.creation
    }));
  } catch (error) {
    console.error("Error fetching from OpenCitations:", error);
    return [];
  }
}

// 20. Fetch from Figshare
async function fetchFigshare() {
  try {
    const response = await fetch(figshareAPI);
    const data = await response.json();
    return data.map(item => ({
      source: 'Figshare',
      title: item.title,
      link: item.url,
      published: item.published_date
    }));
  } catch (error) {
    console.error("Error fetching from Figshare:", error);
    return [];
  }
}

// 21. Fetch from Zenodo
async function fetchZenodo() {
  try {
    const response = await fetch(zenodoAPI);
    const data = await response.json();
    return data.hits.hits.map(item => ({
      source: 'Zenodo',
      title: item.metadata.title,
      link: item.links.self,
      published: item.metadata.publication_date
    }));
  } catch (error) {
    console.error("Error fetching from Zenodo:", error);
    return [];
  }
}

// 22. Fetch from DPLA
async function fetchDPLA() {
  try {
    const response = await fetch(dplaAPI);
    const data = await response.json();
    return data.docs.map(item => ({
      source: 'DPLA',
      title: item.sourceResource.title,
      link: item.isShownAt,
      published: item.sourceResource.date?.displayDate
    }));
  } catch (error) {
    console.error("Error fetching from DPLA:", error);
    return [];
  }
}

// =========================
// Aggregate and Render Data
// =========================
async function fetchMarsLibrary() {
  libraryContainer.innerHTML = '<p>Loading research papers and data sources...</p>';

  try {
    // Parallel fetching for efficiency
    const [
      arxiv,
      nasa,
      springer,
      books,
      nasaOpen,
      usgs,
      esa,
      cern,
      harvard,
      pds,
      semantic,
      core,
      scopus,
      crossref,
      openAIRE,
      jplSSD,
      copernicus,
      mendeley,
      openCitations,
      figshare,
      zenodo,
      dpla
    ] = await Promise.all([
      fetchArxivPapers(),
      fetchNASAPapers(),
      fetchSpringerPapers(),
      fetchGoogleBooks(),
      fetchNasaOpenData(),
      fetchUSGSAstro(),
      fetchESAData(),
      fetchCernData(),
      fetchHarvardDataverse(),
      fetchPDSData(),
      fetchSemanticScholar(),
      fetchCoreData(),
      fetchScopusData(),
      fetchCrossRef(),
      fetchOpenAIRE(),
      fetchJPLSSD(),
      fetchCopernicus(),
      fetchMendeley(),
      fetchOpenCitations(),
      fetchFigshare(),
      fetchZenodo(),
      fetchDPLA()
    ]);

    // Combine all sources
    const allItems = [
      ...arxiv,
      ...nasa,
      ...springer,
      ...books,
      ...nasaOpen,
      ...usgs,
      ...esa,
      ...cern,
      ...harvard,
      ...pds,
      ...semantic,
      ...core,
      ...scopus,
      ...crossref,
      ...openAIRE,
      ...jplSSD,
      ...copernicus,
      ...mendeley,
      ...openCitations,
      ...figshare,
      ...zenodo,
      ...dpla
    ];

    // Sort by published date (desc)
    allItems.sort((a, b) => new Date(b.published) - new Date(a.published));

    renderLibraryItems(allItems);

    // ✅ Hide loader after successful rendering
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }

  } catch (error) {
    console.error("Error fetching Mars library:", error);
    libraryContainer.innerHTML = '<p>Error loading library content.</p>';

    // ✅ Also hide loader if there was an error
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  }
}

// Render items to HTML
function renderLibraryItems(items) {
  if (!items.length) {
    libraryContainer.innerHTML = '<p>No research papers or books found.</p>';
    return;
  }

  libraryContainer.innerHTML = ''; // Clear previous content

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'library-item';

    div.innerHTML = `
      <div class="tooltip-container">
        <h4><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h4>
        <div class="tooltip-text">
          <p>${item.description || 'No description available.'}</p>
        </div>
      </div><br/>
      <p>${item.published || 'Unknown Date'} - ${item.authors || 'Unknown Author'}</p>
      <p style="font-style: italic; font-size: 12px;">Source: ${item.source}</p>
    `;

    libraryContainer.appendChild(div);
  });
}


// =====================
// Initial & Auto Refresh
// =====================

fetchMarsLibrary();

// Auto-refresh every 30 minutes
setInterval(fetchMarsLibrary, 1800000);

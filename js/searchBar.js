    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const autocompleteList = document.getElementById('autocompleteList');
    let currentFocus = -1;
    let currentPage = 1;
    const rowsPerPage = 10;

    function renderResults(results) {
      autocompleteList.innerHTML = '';

      if (!results.length) {
        autocompleteList.innerHTML = '<div class="autocomplete-item">No results found</div>';
        return;
      }

      results.forEach(item => {
        const listItem = document.createElement('div');
        listItem.classList.add('autocomplete-item');
        listItem.innerHTML = `
          <a href="${item.link}" target="_blank" style="color: inherit; text-decoration: none;">
            <strong>${item.title}</strong>
          </a>
          <br>
          <small>${item.author} (${item.published})</small>
        `;
        listItem.addEventListener('click', function() {
          searchInput.value = item.title;
          closeAllLists();
        });
        autocompleteList.appendChild(listItem);
      });
      
      const paginationContainer = document.createElement('div');
      paginationContainer.style.display = 'flex';
      paginationContainer.style.justifyContent = 'space-between';
      paginationContainer.style.padding = '10px';

      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.disabled = currentPage === 1;
      prevButton.onclick = () => {
        if (currentPage > 1) {
          currentPage--;
          performSearch();
        }
      };

      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.onclick = () => {
        currentPage++;
        performSearch();
      };

      paginationContainer.appendChild(prevButton);
      paginationContainer.appendChild(nextButton);
      autocompleteList.appendChild(paginationContainer);

    }

    searchInput.addEventListener('keydown', function(e) {
      const items = autocompleteList.getElementsByClassName('autocomplete-item');
      if (e.key === 'ArrowDown') {
        currentFocus++;
        addActive(items);
      } else if (e.key === 'ArrowUp') {
        currentFocus--;
        addActive(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFocus > -1 && items[currentFocus]) {
          items[currentFocus].click();
        }
      }
    });

async function performSearch() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const year = document.getElementById('yearFilter').value.trim();
  const journal = document.getElementById('journalFilter').value.trim();

  if (!query) return;

  autocompleteList.innerHTML = '<div class="autocomplete-item">Loading...</div>';

  // Run the fetch functions concurrently
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
    fetchArxivPapers(query),
    fetchNASAPapers(query),
    fetchSpringerPapers(query),
    fetchGoogleBooks(query),
    fetchNasaOpenData(query),
    fetchUSGSAstro(query),
    fetchESAData(query),
    fetchCernData(query),
    fetchHarvardDataverse(query),
    fetchPDSData(query),
    fetchSemanticScholar(query),
    fetchCoreData(query),
    fetchScopusData(query),
    fetchCrossRef(query),
    fetchOpenAIRE(query),
    fetchJPLSSD(query),
    fetchCopernicus(query),
    fetchMendeley(query),
    fetchOpenCitations(query),
    fetchFigshare(query),
    fetchZenodo(query),
    fetchDPLA(query)
  ]);

  // Combine results
  let allItems = [
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

  
  // Apply filters (optional)
  if (journal) {
    allItems = allItems.filter(item => item.journal?.toLowerCase().includes(journal.toLowerCase()));
  }

  if (year) {
    allItems = allItems.filter(item => item.published?.includes(year));
  }

  renderResults(allItems);
}

    searchInput.addEventListener('input', performSearch);
searchButton.addEventListener('click', performSearch);


    function addActive(items) {
      if (!items) return false;
      removeActive(items);
      if (currentFocus >= items.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = items.length - 1;
      items[currentFocus].classList.add('active');
    }

    function removeActive(items) {
      for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
      }
    }

    function closeAllLists(elmnt) {
      if (elmnt !== autocompleteList && elmnt !== searchInput) {
        autocompleteList.innerHTML = '';
        currentFocus = -1;
      }
    }

    document.addEventListener('click', function (e) {
      closeAllLists(e.target);
    });

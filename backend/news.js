    async function fetchMarsNews() {
      const rssFeeds = [
        'https://mars.nasa.gov/rss/api/?feed=news&category=all&feedtype=rss',
        'https://www.nasa.gov/rss/dyn/breaking_news.rss',
        'https://www.esa.int/rssfeed/Our_Activities/Space_Science',
	'https://www.esa.int/Enabling_Support/Space_Engineering_Technology/Onboard_Computers_and_Data_Handling/News',
        'https://rss.nytimes.com/services/xml/rss/nyt/Space.xml',
        'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
	'https://spaceflightnow.com/',
	'https://www.spacex.com/updates/',
	'https://www.relativityspace.com/news',
	'https://www.blueorigin.com/news'
      ];

      const newsContainer = document.getElementById("newsContainer");
      newsContainer.innerHTML = '<p>Loading news...</p>';

      const fetchPromises = rssFeeds.map(feed => {
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`;
        return fetch(url).then(res => res.json());
      });

      try {
        const allFeeds = await Promise.all(fetchPromises);

        // Flatten items from all feeds
        const allItems = allFeeds.flatMap(feed => feed.items || []);

        // Sort by date (optional)
        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        newsContainer.innerHTML = ''; // clear previous

        allItems.slice(0, 15).forEach(item => {
          const newsItem = document.createElement("div");
          newsItem.className = "news-item";

newsItem.innerHTML = `
  <h4><a href="${item.link}" target="_blank">${item.title}</a></h4>
  <p>${new Date(item.pubDate).toLocaleDateString()} - ${item.author || item.source?.name || item.source?.title || "Unknown"}</p>
`;

          newsContainer.appendChild(newsItem);
        });
      } catch (error) {
        console.error("Failed to fetch Mars news", error);
        newsContainer.innerHTML = '<p>Error loading news.</p>';
      }
    }

    // Initial fetch
    fetchMarsNews();

    // Auto-refresh every 5 minutes
    setInterval(fetchMarsNews, 300000);

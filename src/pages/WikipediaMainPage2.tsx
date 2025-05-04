import React, { useEffect, useState } from "react";

export default function WikipediaMainPage2() {
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [news, setNews] = useState([]);
  const [didYouKnow, setDidYouKnow] = useState([]);
  const [onThisDay, setOnThisDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;

      try {
        setLoading(true);
        const response = await fetch(url, {
          headers: {
            'Api-User-Agent': 'YourAppName (your.email@example.com)'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        setFeaturedArticle(data.tfa);
        setNews(data.news || []);
        setDidYouKnow(data.onthisday?.selected || mockDidYouKnowData);
        setOnThisDay(data.onthisday?.events || mockOnThisDayData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Wikipedia content:", error);
        setError("Failed to load Wikipedia content. Please try again later.");
        setLoading(false);
        
        // Set mock data in case of error
        if (!featuredArticle) setFeaturedArticle(mockFeaturedArticle);
        if (news.length === 0) setNews(mockNewsData);
        if (didYouKnow.length === 0) setDidYouKnow(mockDidYouKnowData);
        if (onThisDay.length === 0) setOnThisDay(mockOnThisDayData);
      }
    };

    fetchFeaturedContent();
  }, []);

  const parseHTML = (htmlString) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  // Mock data for when API fails
  const mockFeaturedArticle = {
    titles: {
      display: "Mount Everest"
    },
    thumbnail: {
      source: "/api/placeholder/300/200"
    },
    extract: "Mount Everest is Earth's highest mountain above sea level, located in the Mahalangur Himal sub-range of the Himalayas. The China–Nepal border runs across its summit point."
  };

  const mockNewsData = [
    {
      story: "Scientists announce breakthrough in renewable energy storage technology.",
      thumbnail: {
        source: "/api/placeholder/120/80"
      }
    },
    {
      story: "International peace talks conclude with new agreement on climate change initiatives.",
      thumbnail: {
        source: "/api/placeholder/120/80"
      }
    }
  ];

  const mockDidYouKnowData = [
    {
      title: "J. J. Walser Jr. House",
      extract: "Chicago's deteriorating J. J. Walser Jr. House has not been repaired because it is unclear who owns it.",
      thumbnail: {
        source: "/api/placeholder/120/80"
      }
    },
    {
      title: "Sir William Hillary",
      extract: "The lifeboat Sir William Hillary was sent to Dover during World War II to assist with the Dunkirk evacuation.",
      thumbnail: {
        source: "/api/placeholder/120/80"
      }
    }
  ];

  const mockOnThisDayData = [
    {
      year: "1559",
      text: "Presbyterian cleric John Knox returned from exile to lead the Scottish Reformation.",
      thumbnail: {
        source: "/api/placeholder/120/80"
      }
    },
    {
      year: "1889",
      text: "The Treaty of Wuchale was signed between Ethiopia and Italy, later leading to the First Italo-Ethiopian War.",
      thumbnail: {
        source: "/api/placeholder/120/80"
      }
    },
    {
      year: "1945",
      text: "The Battle of Berlin ends as Soviet troops capture the Reichstag building.",
      thumbnail: {
        source: "/api/placeholder/120/80"
      }
    },
    {
      year: "2008",
      text: "Cyclone Nargis makes landfall in Myanmar, killing over 100,000 people.",
      thumbnail: {
        source: "/api/placeholder/120/80"
      }
    }
  ];

  if (error) {
    return (
      <div className="bg-white text-black font-sans p-6 max-w-7xl mx-auto">
        <div className="text-center border-b border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-normal">
            Welcome to <span className="text-blue-600">Wikipedia</span>,
          </h1>
          <p className="text-red-600 mt-4 p-4 border border-red-300 rounded">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black font-sans p-6 max-w-7xl mx-auto">
      <div className="text-center border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-normal">
          Welcome to <span className="text-blue-600">Wikipedia</span>,
        </h1>
        <p className="text-sm text-gray-700">
          the free encyclopedia that anyone can edit.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          117,932 active editors • 6,988,907 articles in English
        </p>
      </div>

      {/* Row 1: Featured Article + In the News */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Featured Article */}
        <div className="border border-green-300 bg-green-50 p-4 rounded-lg shadow-sm">
          <h2 className="font-bold text-lg text-green-900 mb-2 border-b border-green-200 pb-1">
            From today's featured article
          </h2>
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="bg-gray-300 w-24 h-24"></div>
              <div className="flex-1 space-y-3">
                <div className="h-2 bg-gray-300 rounded"></div>
                <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                <div className="h-2 bg-gray-300 rounded w-4/6"></div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              {featuredArticle?.thumbnail?.source ? (
                <img
                  src={featuredArticle.thumbnail.source}
                  alt="Featured"
                  className="w-24 h-auto border object-cover rounded"
                />
              ) : (
                <img
                  src="/api/placeholder/96/96"
                  alt="Featured"
                  className="w-24 h-auto border object-cover rounded"
                />
              )}
              <div>
                <p className="text-sm leading-relaxed">
                  <span className="font-bold text-blue-800">
                    {featuredArticle?.titles?.display || "Featured Article"}
                  </span>{" "}
                  {featuredArticle?.extract ? (
                    parseHTML(featuredArticle.extract)
                  ) : (
                    "Loading content..."
                  )}
                </p>
                <a href="#" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                  Read more...
                </a>
              </div>
            </div>
          )}
        </div>

        {/* In the News */}
        <div className="border border-blue-300 bg-blue-50 p-4 rounded-lg shadow-sm">
          <h2 className="font-bold text-lg text-blue-900 mb-2 border-b border-blue-200 pb-1">
            In the news
          </h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="flex space-x-2">
                <div className="bg-gray-300 w-12 h-12 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-gray-300 rounded"></div>
                  <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="bg-gray-300 w-12 h-12 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-gray-300 rounded"></div>
                  <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : (
            <ul className="text-sm space-y-3">
              {news && news.length > 0 ? (
                news.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {item.thumbnail && item.thumbnail.source ? (
                      <img 
                        src={item.thumbnail.source} 
                        alt="" 
                        className="w-16 h-auto border rounded object-cover mt-1"
                      />
                    ) : (
                      <img 
                        src="/api/placeholder/64/48" 
                        alt="" 
                        className="w-16 h-12 border rounded object-cover mt-1"
                      />
                    )}
                    <span className="flex-1">{parseHTML(item.story || "News content")}</span>
                  </li>
                ))
              ) : (
                <p className="text-sm italic">No news available at the moment.</p>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Row 2: Did You Know + On this day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Did You Know */}
        <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-lg shadow-sm">
          <h2 className="font-bold text-lg text-yellow-900 mb-2 border-b border-yellow-200 pb-1">
            Did you know ...
          </h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="flex space-x-2">
                <div className="bg-gray-300 w-12 h-12 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-gray-300 rounded"></div>
                  <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="bg-gray-300 w-12 h-12 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-gray-300 rounded"></div>
                  <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : (
            <ul className="text-sm space-y-3">
              {didYouKnow && didYouKnow.length > 0 ? (
                didYouKnow.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {item.thumbnail && item.thumbnail.source ? (
                      <img 
                        src={item.thumbnail.source} 
                        alt="" 
                        className="w-16 h-auto border rounded object-cover mt-1"
                      />
                    ) : (
                      <img 
                        src="/api/placeholder/64/48" 
                        alt="" 
                        className="w-16 h-12 border rounded object-cover mt-1"
                      />
                    )}
                    <span className="flex-1">
                      ... that <span className="text-blue-800">{item.title}</span>{" "}
                      {parseHTML(item.extract || "Interesting fact")}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-sm italic">No facts available at the moment.</p>
              )}
            </ul>
          )}
        </div>

        {/* On This Day */}
        <div className="border border-gray-300 p-4 bg-gray-100 rounded-lg shadow-sm">
          <h2 className="font-bold text-lg text-gray-800 mb-2 border-b border-gray-200 pb-1">
            On this day
          </h2>
          <p className="text-sm mb-2 text-gray-700">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: 
            {" "}Flag Day in Poland
          </p>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="flex space-x-2">
                <div className="bg-gray-300 w-12 h-12 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-gray-300 rounded"></div>
                  <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="bg-gray-300 w-12 h-12 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-gray-300 rounded"></div>
                  <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : (
            <ul className="text-sm space-y-3">
              {onThisDay && onThisDay.length > 0 ? (
                onThisDay.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {item.thumbnail && item.thumbnail.source ? (
                      <img 
                        src={item.thumbnail.source} 
                        alt="" 
                        className="w-16 h-auto border rounded object-cover mt-1"
                      />
                    ) : (
                      <img 
                        src="/api/placeholder/64/48" 
                        alt="" 
                        className="w-16 h-12 border rounded object-cover mt-1"
                      />
                    )}
                    <span className="flex-1">
                      <strong>{item.year}</strong> – {parseHTML(item.text || "Historical event")}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-sm italic">No historical events available at the moment.</p>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-200 pt-4">
        <p>
          This page is a representation of Wikipedia's main page. Content is fetched from
          the Wikimedia API when available.
        </p>
      </div>
    </div>
  );
}
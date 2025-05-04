import React, { useEffect, useState } from "react";

export default function WikipediaMainPage() {
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;

      try {
        const response = await fetch(url, {
          headers: {
            'Api-User-Agent': 'YourAppName (your.email@example.com)'
          }
        });
        const data = await response.json();
        console.log(data)
        setFeaturedArticle(data.tfa);
        setNews(data.news);
      } catch (error) {
        console.error("Error fetching Wikipedia content:", error);
      }
    };

    fetchFeaturedContent();
  }, []);

  const parseHTML = (htmlString) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

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
        <div className="border border-green-300 bg-green-50 p-4">
          <h2 className="font-bold text-lg text-green-900 mb-2">
            From today's featured article
          </h2>
          {featuredArticle ? (
            <div className="flex gap-4">
              {featuredArticle.thumbnail?.source && (
                <img
                  src={featuredArticle.thumbnail.source}
                  alt="Featured"
                  className="w-24 h-auto border"
                />
              )}
              <p className="text-sm leading-relaxed">
                <span className="font-bold text-blue-800">
                  {/* {parseHTML(featuredArticle.titles.display)} */}
                </span>{" "}
                {parseHTML(featuredArticle.extract_html)}
              </p>
            </div>
          ) : (
            <p className="text-sm italic">Loading...</p>
          )}
        </div>

        {/* In the News */}
        <div className="border border-blue-300 bg-blue-50 p-4">
          <h2 className="font-bold text-lg text-blue-900 mb-2">In the news</h2>
          {news.length > 0 ? (
            <ul className="text-sm list-disc list-inside leading-relaxed">
              {news.map((item, index) => (
                <li key={index} className="mb-3 flex items-start gap-2">
                    {item.thumbnail && item.thumbnail.source && (
                      <img src={item.thumbnail.source} alt="" className="w-12 h-auto border rounded" />
                    )}
                    <span>{parseHTML(item.story)}</span>
                  </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic">Loading...</p>
          )}
        </div>
      </div>

      {/* Row 2: Did You Know + On this day */}
    </div>
  );
}

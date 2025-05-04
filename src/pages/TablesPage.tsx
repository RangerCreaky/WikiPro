// ------ File: src/pages/TablesPage.jsx (New) ------
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticleContent } from '../services/api';

const TablesPage = () => {
  const { title } = useParams();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const articleData = await fetchArticleContent(title);
        
        // Extract tables from the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = articleData.text;
        
        const tableElements = tempDiv.querySelectorAll('table');
        const extractedTables = [];
        
        tableElements.forEach((table, index) => {
          // Check if the table has content and is not a navigation table
          // Skip tables that are likely navigation or metadata tables
          const isNavigationTable = table.classList.contains('navbox') || 
                                   table.classList.contains('vertical-navbox') ||
                                   table.classList.contains('metadata');
          
          if (table.rows.length > 0 && !isNavigationTable) {
            // Try to find a caption or a title for the table
            let tableTitle = '';
            const caption = table.querySelector('caption');
            
            if (caption) {
              tableTitle = caption.textContent.trim();
            } else {
              // Try to find a preceding heading as a potential title
              let prevElement = table.previousElementSibling;
              while (prevElement) {
                if (/^H[1-6]$/.test(prevElement.tagName)) {
                  tableTitle = prevElement.textContent.trim();
                  break;
                }
                prevElement = prevElement.previousElementSibling;
              }
            }
            
            // Add a default title if none was found
            if (!tableTitle) {
              tableTitle = `Table ${index + 1}`;
            }
            
            // Clean table styles to match Wikipedia styles
            // Preserve original classes for styling
            const tableClone = table.cloneNode(true);
            
            extractedTables.push({
              id: index,
              title: tableTitle,
              html: tableClone.outerHTML
            });
          }
        });
        
        setTables(extractedTables);
      } catch (err) {
        setError(err.message || 'Failed to fetch tables');
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      fetchTables();
    }
  }, [title]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white border border-gray-200 rounded p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tables: {title}</h1>
            <Link to={`/article/${encodeURIComponent(title)}`} className="text-blue-600 hover:underline">
              ← Back to article
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : tables.length === 0 ? (
          <p>No tables found in this article.</p>
        ) : (
          <div className="space-y-8">
            {tables.map(table => (
              <div key={table.id} className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-200">
                  <h2 className="text-lg font-bold">{table.title}</h2>
                </div>
                <div className="p-4 overflow-x-auto wiki-content">
                  <div dangerouslySetInnerHTML={{ __html: table.html }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesPage;
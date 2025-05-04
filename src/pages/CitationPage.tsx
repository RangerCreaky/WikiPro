import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticleContent, fetchArticleMetadata } from '../services/api';

const CitationPage = () => {
  const { title } = useParams();
  const [metadata, setMetadata] = useState(null);
  const [lastModified, setLastModified] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('apa');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get article content and metadata
        const [articleData, metaData] = await Promise.all([
          fetchArticleContent(title),
          fetchArticleMetadata(title)
        ]);
        
        // Parse contributors from HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = articleData.text;
        
        // Get the current date for "accessed on" date
        const today = new Date();
        
        setMetadata({
          title: articleData.title,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(articleData.title.replace(/ /g, '_'))}`,
          accessDate: today.toISOString().split('T')[0] // YYYY-MM-DD format
        });
        
        if (metaData && metaData.lastmodified) {
          // Convert to readable date
          const lastModDate = new Date(metaData.lastmodified);
          setLastModified(lastModDate.toISOString().split('T')[0]); // YYYY-MM-DD format
        }
        
        // Extract top contributors if available
        if (metaData && metaData.contributors) {
          const topContributors = metaData.contributors
            .slice(0, 3) // Top 3 contributors
            .map(contributor => contributor.name || 'Anonymous');
          setContributors(topContributors);
        }
        
      } catch (err) {
        setError(err.message || 'Failed to fetch citation data');
        console.error('Error fetching citation data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      fetchData();
    }
  }, [title]);

  // Format citation based on selected style
  const formatCitation = () => {
    if (!metadata) return '';
    
    const { title: articleTitle, url, accessDate } = metadata;
    const publicationDate = lastModified || 'n.d.';
    const contributorsText = contributors.length > 0 
      ? contributors.join(', ') 
      : 'Wikipedia contributors';
      
    switch (selectedFormat) {
      case 'apa':
        // APA 7th Edition
        return `${contributorsText}. (${publicationDate.split('-')[0]}). ${articleTitle}. Wikipedia. Retrieved ${formatDate(accessDate, 'mmmm d, yyyy')} from ${url}`;
      
      case 'mla':
        // MLA 8th Edition
        return `"${articleTitle}." Wikipedia, Wikimedia Foundation, ${formatDate(publicationDate, 'd mmm. yyyy')}, ${url}. Accessed ${formatDate(accessDate, 'd mmm. yyyy')}.`;
      
      case 'chicago':
        // Chicago 17th Edition
        return `"${articleTitle}." Wikipedia. Last modified ${formatDate(publicationDate, 'mmmm d, yyyy')}. ${url}.`;
      
      case 'harvard':
        // Harvard Style
        return `Wikipedia (${publicationDate.split('-')[0]}). ${articleTitle}. [online] Available at: ${url} [Accessed ${formatDate(accessDate, 'd mmm. yyyy')}].`;
      
      case 'bibtex':
        // BibTeX format
        const sanitizedTitle = articleTitle.replace(/[^a-zA-Z0-9]/g, '');
        return `@misc{wiki:${sanitizedTitle},
  author = {${contributorsText}},
  title = {${articleTitle}},
  year = {${publicationDate.split('-')[0]}},
  url = {${url}},
  note = {Online; accessed ${formatDate(accessDate, 'yyyy-mm-dd')}}
}`;
      
      case 'wikipedia':
        // Wikipedia's own citation format
        return `<ref>{{cite web |title=${articleTitle} |url=${url} |website=Wikipedia |access-date=${accessDate}}}</ref>`;
      
      default:
        return `${articleTitle}. Wikipedia. ${url}. Retrieved on ${accessDate}.`;
    }
  };

  // Helper to format dates in different styles
  const formatDate = (dateStr, format) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthsAbbr = [
      'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 
      'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
    ];
    
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    return format
      .replace('yyyy', year)
      .replace('mm', (month + 1).toString().padStart(2, '0'))
      .replace('mmmm', months[month])
      .replace('mmm', monthsAbbr[month])
      .replace('d', day);
  };

  // Copy citation to clipboard
  const copyToClipboard = () => {
    const citation = formatCitation();
    navigator.clipboard.writeText(citation)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Error copying text: ', err);
        setCopySuccess('Failed to copy');
      });
  };

  // Download citation as a text file
  const downloadCitation = () => {
    const citation = formatCitation();
    const element = document.createElement('a');
    const file = new Blob([citation], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/ /g, '_')}_citation_${selectedFormat}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white border border-gray-200 rounded p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Citation Generator: {title}</h1>
            <Link to={`/article/${encodeURIComponent(title)}`} className="text-[#36c] hover:underline">
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
        ) : metadata ? (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Article Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-semibold">Title:</span> {metadata.title}</p>
                  <p><span className="font-semibold">Last Modified:</span> {lastModified || 'Unknown'}</p>
                  <p><span className="font-semibold">Access Date:</span> {metadata.accessDate}</p>
                </div>
                <div>
                  <p><span className="font-semibold">URL:</span> <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="text-[#36c] hover:underline">{metadata.url}</a></p>
                  <p><span className="font-semibold">Contributors:</span> {contributors.length > 0 ? contributors.join(', ') : 'Wikipedia contributors'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Select Citation Format</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <button 
                  onClick={() => setSelectedFormat('apa')} 
                  className={`px-3 py-1 rounded text-sm border ${selectedFormat === 'apa' ? 'bg-[#36c] text-white' : 'bg-gray-100 border-gray-300'}`}
                >
                  APA 7th
                </button>
                <button 
                  onClick={() => setSelectedFormat('mla')} 
                  className={`px-3 py-1 rounded text-sm border ${selectedFormat === 'mla' ? 'bg-[#36c] text-white' : 'bg-gray-100 border-gray-300'}`}
                >
                  MLA 8th
                </button>
                <button 
                  onClick={() => setSelectedFormat('chicago')} 
                  className={`px-3 py-1 rounded text-sm border ${selectedFormat === 'chicago' ? 'bg-[#36c] text-white' : 'bg-gray-100 border-gray-300'}`}
                >
                  Chicago
                </button>
                <button 
                  onClick={() => setSelectedFormat('harvard')} 
                  className={`px-3 py-1 rounded text-sm border ${selectedFormat === 'harvard' ? 'bg-[#36c] text-white' : 'bg-gray-100 border-gray-300'}`}
                >
                  Harvard
                </button>
                <button 
                  onClick={() => setSelectedFormat('bibtex')} 
                  className={`px-3 py-1 rounded text-sm border ${selectedFormat === 'bibtex' ? 'bg-[#36c] text-white' : 'bg-gray-100 border-gray-300'}`}
                >
                  BibTeX
                </button>
                <button 
                  onClick={() => setSelectedFormat('wikipedia')} 
                  className={`px-3 py-1 rounded text-sm border ${selectedFormat === 'wikipedia' ? 'bg-[#36c] text-white' : 'bg-gray-100 border-gray-300'}`}
                >
                  Wikipedia Ref
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Generated Citation</h2>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
                <pre className={`whitespace-pre-wrap ${selectedFormat === 'bibtex' ? 'font-mono text-sm' : ''}`}>
                  {formatCitation()}
                </pre>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={copyToClipboard} 
                  className="bg-[#36c] hover:bg-[#36c] text-white px-4 py-2 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy to Clipboard
                  {copySuccess && <span className="ml-2 text-green-200">{copySuccess}</span>}
                </button>
                
                <button 
                  onClick={downloadCitation} 
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
            
            <div className="bg-[blue-50] p-4 rounded border border-[#36c] mt-6">
              <h3 className="text-md font-semibold mb-2 text-blue-800">How to Use This Citation</h3>
              <p className="text-sm text-blue-800">
                Copy and paste this citation into your bibliography or works cited page. For academic papers, place the citation at the end of any sentence or paragraph that references this Wikipedia article.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Note: While Wikipedia can be a valuable starting point for research, many academic institutions recommend using primary sources for formal research papers.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CitationPage;
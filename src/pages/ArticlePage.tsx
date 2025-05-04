// src/pages/ArticlePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchArticleContent } from '../services/api';
// import Sidebar from '../components/Sidebar';
import NoteToolbar from '../components/NoteToolbar';
import ReadingModeToolbar from '../components/ReadingModeToolbar';
import { MessageSquare,Download, File, FileText} from 'lucide-react';

const ArticlePage = ({ defaultArticle = 'Tiger' }) => {
  const { title } = useParams();
  const articleTitle = title || defaultArticle;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [readingSettings, setReadingSettings] = useState({
    fontSize: 'medium',
    theme: 'light',
    fontFamily: 'serif',
    lineSpacing: 'normal',
    hideLinks: false,
    nightMode: false
  });
  const navigate = useNavigate();

  const inputRef = useRef(null);

  const [showingSummary, setShowingSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Chat-related state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Export mode state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('summary');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Add state for study level
  const [studyLevel, setStudyLevel] = useState('high');

  // Handle export button click
  const handleExport = async () => {
    setExportLoading(true);
    setExportError(null);
    
    try {
      // Prepare the request payload
      const payload = {
        title: article.title,
        content: article.text,
        exportType,
        exportFormat,
        studyLevel,
      };
      
      // Call backend API
      const response = await fetch('https://wiki-pro-backend.vercel.app//api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create file name
      const fileExtension = exportFormat;
      let exportTypeName = '';
      switch (exportType) {
        case 'summary':
          exportTypeName = 'Summary';
          break;
        case 'presentation':
          exportTypeName = 'Presentation';
          break;
        case 'report':
          exportTypeName = 'Report';
          break;
        default:
          exportTypeName = 'Export';
      }
      
      const fileName = `${article.title.replace(/[^a-zA-Z0-9]/g, '_')}_${exportTypeName}.${fileExtension}`;
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      
      // Append to the document and trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Close the modal
      setShowExportModal(false);
      
    } catch (error) {
      console.error('Export error:', error);
      setExportError(`Failed to export: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  };


  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const articleData = await fetchArticleContent(articleTitle);
        setArticle(articleData);
      } catch (err) {
        setError(err.message || 'Failed to fetch article');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleTitle]);

  // Scroll to bottom when chat opens or messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isChatOpen, chatMessages.length]);

  

  // Highlight the current section in the article
  const highlightCurrentSection = (sectionTitle) => {
    // Remove any existing highlights
    document.querySelectorAll('.podcast-current-section').forEach(el => {
      el.classList.remove('podcast-current-section');
    });
    
    // Find the section header with matching text
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const header of headers) {
      if (header.textContent.trim() === sectionTitle) {
        header.classList.add('podcast-current-section');
        header.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  };


  // Add this near your other constants
  const suggestedQuestions = [
    "Explain this article simply",
    "Summarize like I'm 12",
    "What are the key points?"
  ];

  // Add these functions to your component
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (isTyping) return;
    
    // Get user message from the ref
    const userMessage = inputRef.current.value.trim();
    
    // Don't proceed if the input is empty
    if (!userMessage) return;
    
    // Clear the input field
    inputRef.current.value = '';
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Get conversation history (last 6 messages or fewer)
      const recentMessages = chatMessages.slice(-6);
      
      // API call to get assistant response
      const response = await fetch('https://wiki-pro-backend.vercel.app//api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...recentMessages, { role: 'user', content: userMessage }],
          article: {
            title: article.title,
            content: article.text,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Clean the response (remove markdown code block if present)
      const cleanedResponse = data.response
        .replace(/^\s*```html\s*/i, '')
        .replace(/\s*```\s*$/, '');
      
      // Add assistant response to chat
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: cleanedResponse 
      }]);
    } catch (err) {
      console.error('Error getting response:', err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '<p class="text-red-500">Sorry, I encountered an error. Please try again.</p>' 
      }]);
    } finally {
      setIsTyping(false);
      
      // Scroll to bottom
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSuggestedQuestion = (question) => {
    // Set the input field's value to the question (so users see what was clicked)
    if (inputRef.current) {
      inputRef.current.value = question;
    }
    
    // Call handleChatSubmit directly with the question
    handleChatSubmit({ preventDefault: () => {} });
  };

  // Add this function in your ArticlePage component
  const handleSummarize = async () => {
    // Toggle off summary display if already showing
    if (showingSummary) {
      setShowingSummary(false);
      return;
    }

    try {
      setSummaryLoading(true);

      // Prepare the content to send to the backend
      // We'll extract the main text content and relevant metadata
      const contentText = article.text;
      const title = article.title;

      // Make API call to the backend for summarization
      const response = await fetch('https://wiki-pro-backend.vercel.app//api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: contentText,
          // Adding metadata that might be useful for the LLM
          articleType: 'wikipedia',
          language: 'en', // Assuming English content
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      console.log(response)

      const data = await response.json();
      setSummary(data.summary);
      setShowingSummary(true);
    } catch (err) {
      console.error('Error generating summary:', err);
      alert('Failed to generate summary: ' + err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Function to fix internal wiki links and process content
  const processHtmlContent = (htmlContent) => {
    if (!htmlContent) return '';

    // Create a temporary div to manipulate the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Fix internal links
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');

      if (href && href.startsWith('/wiki/') && !href.includes(':')) {
        // Extract the article title from the Wikipedia link
        const articleTitle = href.replace('/wiki/', '');
        // Update the link to use our router
        link.setAttribute('href', `/article/${articleTitle}`);
        // Prevent default behavior and use React Router navigation
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navigate(`/article/${articleTitle}`);
        });
      }

      // If in reading mode with hideLinks option enabled, modify links
      if (readingMode && readingSettings.hideLinks) {
        // Store the original href as a data attribute
        link.setAttribute('data-original-href', link.getAttribute('href'));
        // Remove the href to make it non-clickable
        link.removeAttribute('href');
        // Remove underline and change color to match text
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        // Add a subtle marker to indicate it was a link
        link.style.borderBottom = '1px dotted #aaa';
        // Add a title to indicate it's a disabled link
        link.setAttribute('title', 'Links disabled in reading mode');
      }
    });

    // Fix image styling for side-by-side layout
    const thumbs = tempDiv.querySelectorAll('.thumb');
    thumbs.forEach(thumb => {
      // Make sure thumbs float right for text wrapping
      thumb.style.float = 'right';
      thumb.style.clear = 'right';
      thumb.style.marginLeft = '1.4em';
      thumb.style.marginBottom = '0.5em';
    });

    // Fix image containers
    const thumbinners = tempDiv.querySelectorAll('.thumbinner');
    thumbinners.forEach(container => {
      container.style.border = '1px solid #c8ccd1';
      container.style.padding = '3px';
      container.style.backgroundColor = '#f8f9fa';
      container.style.fontSize = '94%';
      container.style.textAlign = 'center';
      container.style.marginLeft = '1.4em';
      container.style.float = 'right';
      container.style.clear = 'right';
    });

    // If in reading mode, make additional modifications to content
    if (readingMode) {
      // Remove any tables of contents
      const toc = tempDiv.querySelector('.toc');
      if (toc) toc.remove();

      // Remove edit links
      const editLinks = tempDiv.querySelectorAll('.mw-editsection');
      editLinks.forEach(link => link.remove());

      // Ensure images are centered in reading mode
      const images = tempDiv.querySelectorAll('img');
      images.forEach(img => {
        const parent = img.parentNode;
        if (parent && (parent.tagName === 'FIGURE' || parent.className.includes('thumb'))) {
          parent.style.float = 'none';
          parent.style.margin = '1em auto';
          parent.style.textAlign = 'center';
          parent.style.display = 'block';
        }

        // Apply adjustments for night mode
        if (readingSettings.nightMode) {
          img.style.filter = 'brightness(0.8) contrast(1.2)';
        }
      });

      // Enhance image captions
      const captions = tempDiv.querySelectorAll('.thumbcaption');
      captions.forEach(caption => {
        caption.style.fontStyle = 'italic';
        caption.style.textAlign = 'center';
        caption.style.marginTop = '0.5em';
      });

      // Additional processing for night mode
      if (readingSettings.nightMode) {
        // Ensure tables have appropriate dark styling
        const tables = tempDiv.querySelectorAll('table');
        tables.forEach(table => {
          table.style.borderColor = '#555';

          const cells = table.querySelectorAll('td, th');
          cells.forEach(cell => {
            cell.style.borderColor = '#555';
          });

          const headers = table.querySelectorAll('th');
          headers.forEach(header => {
            header.style.backgroundColor = '#333';
          });
        });

        // Adjust blockquotes for night mode
        const blockquotes = tempDiv.querySelectorAll('blockquote');
        blockquotes.forEach(blockquote => {
          blockquote.style.borderLeftColor = '#555';
          blockquote.style.color = '#bbb';
        });
      }
    }

    return tempDiv.innerHTML;
  };

  // Toggle notes mode on/off
  const toggleNotesMode = () => {
    setNotesMode(!notesMode);
    // Turn off reading mode if notes mode is being activated
    if (!notesMode) setReadingMode(false);
  };

  // Toggle reading mode on/off
  const toggleReadingMode = () => {
    setReadingMode(!readingMode);
    // Turn off notes mode if reading mode is being activated
    if (!readingMode) setNotesMode(false);
  };

  // Update reading settings
  const updateReadingSettings = (settings) => {
    setReadingSettings({
      ...readingSettings,
      ...settings
    });
  };

  // Determine content classes based on current modes and settings
  const getContentClasses = () => {
    const classes = ['wiki-content'];

    if (notesMode) classes.push('notes-enabled');

    if (readingMode) {
      classes.push('reading-mode');
      classes.push(`font-${readingSettings.fontSize}`);
      classes.push(`theme-${readingSettings.theme}`);
      classes.push(`font-family-${readingSettings.fontFamily}`);
      classes.push(`line-spacing-${readingSettings.lineSpacing}`);

      // Add night-mode class if enabled
      if (readingSettings.nightMode) {
        classes.push('night-mode');
      }
    }

    return classes.join(' ');
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${readingMode ? 'reading-mode-container' + (readingSettings.nightMode ? ' night-mode' : '') : ''
      }`}>
      <div className={`flex flex-col md:flex-row ${readingMode ? 'reading-mode-layout' : ''}`}>
        {/* Sidebar - hidden in reading mode */}
        {!readingMode && (
          <div className="w-full md:w-64 mb-6 md:mb-0 md:mr-6">
            {/* <Sidebar /> */}
          </div>
        )}

        {/* Article Content */}
        {showingSummary && summary ? (
          <div className="mb-6 p-4 bg-blue-50 border border-[#36c] rounded">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-[#36c]">AI Summary</h2>
              <button
                onClick={() => setShowingSummary(false)}
                className="text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </div>
            <div
              className="wiki-summary prose max-w-none"
              dangerouslySetInnerHTML={{ __html: summary.replace(/<p>```html<\/p>/g, '') .replace(/^\s*```html\s*/i, '').replace(/\s*```\s*$/, '')}}
            />
            <div className="mt-3 text-xs text-gray-500">
              This summary was generated using AI and may not capture all nuances of the article.
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <div className={`flex-grow ${readingMode ? 'reading-mode-content mx-auto' : 'bg-white  p-6'}`}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader">Loading...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <p>Article not found or unable to load.</p>
            </div>
          ) : article ? (
            <div>
              {/* Top toolbar with buttons - not shown in reading mode */}
              {!readingMode && (
                <div className="mb-4 flex flex-wrap border-b border-gray-200 pb-2">
                  <Link
                    to={`/gallery/${encodeURIComponent(article.title)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mr-2 mb-2 border border-gray-300"
                  >
                    Gallery
                  </Link>
                  <Link
                    to={`/tables/${encodeURIComponent(article.title)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mr-2 mb-2 border border-gray-300"
                  >
                    Tables
                  </Link>
                  <Link
                    to={`/cite/${encodeURIComponent(article.title)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mr-2 mb-2 border border-gray-300"
                  >
                    Citation Generator
                  </Link>
                  <Link
                    to={`/timeline/${encodeURIComponent(article.title)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mr-2 mb-2 border border-gray-300"
                  >
                    Timeline
                  </Link>
                  <Link
                    to={`/flashcards/${encodeURIComponent(article.title)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mr-2 mb-2 border border-gray-300"
                  >
                    Flashcards
                  </Link>
                  <button
                    onClick={toggleNotesMode}
                    className={`px-3 py-1 rounded text-sm mr-2 mb-2 border ${notesMode
                        ? 'bg-yellow-200 border-yellow-400 text-yellow-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                      }`}
                  >
                    Notes
                  </button>
                  <button
                    onClick={toggleReadingMode}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mr-2 mb-2 border border-gray-300"
                  >
                    Reading Mode
                  </button>
                  <button
                    onClick={handleSummarize}
                    className={`px-3 py-1 rounded text-sm mr-2 mb-2 border ${showingSummary
                        ? 'bg-blue-200 border-blue-400 text-blue-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                      }`}
                    disabled={summaryLoading}
                  >
                    {summaryLoading ? 'Summarizing...' : 'AI Summarizer'}
                  </button>
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mr-2 mb-2 border border-gray-300 flex items-center"
                  >
                    Export
                  </button>
                  
                  <button 
                    onClick={() => alert("This feature is in progress, please check back later")}
                    className={`px-3 py-1 rounded text-sm mr-2 mb-2 border flex items-center bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300`}
                  >
                    Podcast Mode
                  </button>
                                    {/* <Link 
                    to={`/threadify/${encodeURIComponent(article.title)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm mr-2 mb-2 border border-gray-300"
                  >
                    Threadify
                  </Link> */}
                </div>
              )}

              {/* Export Modal */}
              {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Export Content</h3>
                      <button 
                        onClick={() => setShowExportModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                    <small className='text-xs'>Some exports are not in a good place, They are in progress</small>
                    {exportError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {exportError}
                      </div>
                    )}
                    
                    <div className="mb-6 mt-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        What would you like to export?
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          onClick={() => setExportType('summary')}
                          className={`p-4 border rounded-lg flex flex-col items-center ${
                            exportType === 'summary' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          
                          <span className="font-medium">Article Summary</span>
                          <span className="text-xs text-gray-500 mt-1">Concise overview of key points</span>
                        </button>
                        
                        <button
                          onClick={() => setExportType('presentation')}
                          className={`p-4 border rounded-lg flex flex-col items-center ${
                            exportType === 'presentation' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          
                          <span className="font-medium">Presentation Slides</span>
                          <span className="text-xs text-gray-500 mt-1">PowerPoint-ready slides</span>
                        </button>
                        
                        <button
                          onClick={() => setExportType('report')}
                          className={`p-4 border rounded-lg flex flex-col items-center ${
                            exportType === 'report' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          
                          <span className="font-medium">Study Report</span>
                          <span className="text-xs text-gray-500 mt-1">Structured educational content</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Choose format:
                      </label>
                      <div className="flex space-x-4">
                        <label className={`flex items-center p-3 border rounded ${
                          exportFormat === 'pdf' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="format"
                            value="pdf"
                            checked={exportFormat === 'pdf'}
                            onChange={() => setExportFormat('pdf')}
                            className="mr-2"
                          />
                          
                          PDF
                        </label>
                        
                        <label className={`flex items-center p-3 border rounded ${
                          exportFormat === 'docx' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="format"
                            value="docx"
                            checked={exportFormat === 'docx'}
                            onChange={() => setExportFormat('docx')}
                            className="mr-2"
                          />
                          
                          DOCX
                        </label>
                        
                        {exportType === 'presentation' && (
                          <label className={`flex items-center p-3 border rounded ${
                            exportFormat === 'pptx' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                          }`}>
                            <input
                              type="radio"
                              name="format"
                              value="pptx"
                              checked={exportFormat === 'pptx'}
                              onChange={() => setExportFormat('pptx')}
                              className="mr-2"
                            />
                            
                            PPTX
                          </label>
                        )}
                      </div>
                    </div>
                    
                    {exportType === 'report' && (
                      <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Study Level:
                        </label>
                        <select 
                          className="w-full border rounded px-3 py-2"
                          value={studyLevel}
                          onChange={(e) => setStudyLevel(e.target.value)}
                        >
                          <option value="elementary">Elementary School</option>
                          <option value="middle">Middle School</option>
                          <option value="high">High School</option>
                          <option value="college">College/University</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowExportModal(false)}
                        className="px-4 py-2 border rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExport}
                        disabled={exportLoading}
                        className={`px-4 py-2 bg-blue-600 text-white rounded flex items-center ${
                          exportLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                      >
                        {exportLoading ? (
                          <>
                            <span className="mr-2">Generating...</span>
                            <div className="spinner-border w-4 h-4 border-2 rounded-full border-t-transparent animate-spin"></div>
                          </>
                        ) : (
                          <>Export</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Note-taking toolbar - only visible when notes mode is active */}
              {notesMode && <NoteToolbar articleTitle={article.title} />}

              {/* Reading Mode toolbar - only visible in reading mode */}
              {readingMode && (
                <ReadingModeToolbar
                  settings={readingSettings}
                  onUpdateSettings={updateReadingSettings}
                  onExitReadingMode={toggleReadingMode}
                  articleTitle={article.title}
                />
              )}

              {/* Article Title */}
              <h1 className={`${readingMode ? 'reading-mode-title text-center my-8' : 'text-3xl font-bold mb-4'}`}>
                {article.title}
              </h1>

              {!readingMode && <hr className="mb-4" />}

              {/* Article Content */}
              <div
                className={getContentClasses()}
                id={notesMode ? "annotatable-content" : ""}
                dangerouslySetInnerHTML={{ __html: processHtmlContent(article.text) }}
              />
            </div>
          ) : null}
        </div>

        {/* AskBot Chat Icon */}
        <div
          className="fixed bottom-8 right-8 z-50 cursor-pointer"
          onClick={() => setIsChatOpen(true)}
        >
          <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors">
            <MessageSquare size={24} />
          </div>
        </div>

        {/* AskBot Chat Modal */}
        {isChatOpen && (
          <div className="fixed bottom-8 right-8 z-50 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-300 flex flex-col">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
              <h3 className="font-medium">AskBot: {article?.title}</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="space-y-3">
                  <div className="bg-blue-100 p-3 rounded-lg max-w-3/4">
                    <p className="text-sm text-blue-800">
                      Hi! I'm your AI assistant for this article. How can I help you understand it better?
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mt-2 mb-1">Try asking:</p>
                    {suggestedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="block w-full text-left text-sm bg-gray-100 hover:bg-gray-200 p-2 rounded mb-1 text-gray-800"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${msg.role === 'user'
                          ? 'bg-blue-50 ml-auto max-w-3/4 text-right'
                          : 'bg-gray-100 mr-auto max-w-3/4'
                        }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div
                          className="text-sm wiki-chat-response"
                          dangerouslySetInnerHTML={{ __html: msg.content }}
                        />
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="bg-gray-100 p-3 rounded-lg max-w-3/4 mr-auto">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef}></div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t">
              <form onSubmit={handleChatSubmit} className="flex">
                <input
                  type="text"
                  ref={inputRef}
                  className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ask about this article..."
                />
                <button
                  type="submit"
                  disabled={isTyping}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-r ${
                    isTyping ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;
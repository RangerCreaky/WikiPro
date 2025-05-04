// Complete TimelinePage.jsx with auto-scroll functionality
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticleContent } from '../services/api';
import { parseTimelineData } from '../utils/timelineParser';

const TimelinePage = () => {
  const { title } = useParams();
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState({ min: 0, max: 0 });
  const [viewMode, setViewMode] = useState('standard'); // 'standard', 'compact', or 'detailed'
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [focusedEvent, setFocusedEvent] = useState(null);
  
  // Create refs for each event using useRef and a map
  const eventRefs = useRef({});

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const articleData = await fetchArticleContent(title);
        
        // Extract timeline data from the article content
        const { events, timeRange: range, categories: cats } = parseTimelineData(articleData.text);
        
        if (events.length === 0) {
          setError('No timeline data could be extracted from this article.');
          setLoading(false);
          return;
        }
        
        setTimelineEvents(events);
        setTimeRange(range);
        setCategories(['all', ...cats]);
        
        // Initialize visible range to the full range
        setVisibleRange({ start: range.min, end: range.max });
        
      } catch (err) {
        setError(err.message || 'Failed to extract timeline data');
        console.error('Error creating timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      fetchTimelineData();
    }
  }, [title]);

  // Function to scroll to an event when its marker is clicked
  const scrollToEvent = (eventId) => {
    setFocusedEvent(eventId);
    
    // If we have a reference to this event's DOM element, scroll to it
    if (eventRefs.current[eventId]) {
      eventRefs.current[eventId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Filter events based on search term and category
  const filteredEvents = timelineEvents.filter(event => {
    const matchesFilter = filter === '' || 
      event.title.toLowerCase().includes(filter.toLowerCase()) || 
      event.description.toLowerCase().includes(filter.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    const withinVisibleRange = event.date >= visibleRange.start && event.date <= visibleRange.end;
    
    return matchesFilter && matchesCategory && withinVisibleRange;
  });

  // Sort events chronologically
  const sortedEvents = [...filteredEvents].sort((a, b) => a.date - b.date);

  // Calculate position on the timeline for an event
  const calculatePosition = (date) => {
    const range = visibleRange.end - visibleRange.start;
    const position = ((date - visibleRange.start) / range) * 100;
    return Math.max(0, Math.min(100, position));
  };

  // Format date for display
  const formatDate = (date) => {
    // For BCE dates
    if (date < 0) {
      return `${Math.abs(date)} BCE`;
    }
    // For CE dates
    return `${date} CE`;
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prevZoom => Math.min(200, prevZoom + 10));
    updateVisibleRange(zoomLevel + 10);
  };

  const handleZoomOut = () => {
    setZoomLevel(prevZoom => Math.max(10, prevZoom - 10));
    updateVisibleRange(zoomLevel - 10);
  };

  const updateVisibleRange = (newZoomLevel) => {
    const fullRange = timeRange.max - timeRange.min;
    const visiblePortion = 100 / newZoomLevel;
    
    // Center the visible range around the middle of the current visible range
    const currentMiddle = (visibleRange.start + visibleRange.end) / 2;
    
    // Calculate new start and end
    const halfVisibleRange = (fullRange * visiblePortion) / 2;
    const newStart = Math.max(timeRange.min, currentMiddle - halfVisibleRange);
    const newEnd = Math.min(timeRange.max, currentMiddle + halfVisibleRange);
    
    setVisibleRange({ start: newStart, end: newEnd });
  };

  // Handle timeline navigation
  const handleMoveLeft = () => {
    const range = visibleRange.end - visibleRange.start;
    const moveAmount = range * 0.2; // Move by 20% of visible range
    
    if (visibleRange.start - moveAmount >= timeRange.min) {
      setVisibleRange({
        start: visibleRange.start - moveAmount,
        end: visibleRange.end - moveAmount
      });
    } else {
      setVisibleRange({
        start: timeRange.min,
        end: timeRange.min + range
      });
    }
  };

  const handleMoveRight = () => {
    const range = visibleRange.end - visibleRange.start;
    const moveAmount = range * 0.2; // Move by 20% of visible range
    
    if (visibleRange.end + moveAmount <= timeRange.max) {
      setVisibleRange({
        start: visibleRange.start + moveAmount,
        end: visibleRange.end + moveAmount
      });
    } else {
      setVisibleRange({
        start: timeRange.max - range,
        end: timeRange.max
      });
    }
  };

  // Reset to full range
  const handleResetZoom = () => {
    setZoomLevel(100);
    setVisibleRange({ start: timeRange.min, end: timeRange.max });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white border border-gray-200 rounded p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Timeline: {title}</h1>
            <Link to={`/article/${encodeURIComponent(title)}`} className="text-blue-600 hover:underline">
              ← Back to article
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="standard">Standard View</option>
              <option value="compact">Compact View</option>
              <option value="detailed">Detailed View</option>
            </select>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <input 
              type="text" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              placeholder="Search events..." 
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
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
        ) : (
          <div>
            {/* Timeline controls */}
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
              <div className="text-sm text-gray-700">
                <span>Showing {formatDate(visibleRange.start)} to {formatDate(visibleRange.end)}</span>
                <span className="ml-4">Total events: {sortedEvents.length}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleMoveLeft} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm border border-gray-300"
                >
                  ◀ Earlier
                </button>
                
                <button 
                  onClick={handleZoomOut} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm border border-gray-300"
                  disabled={zoomLevel <= 10}
                >
                  -
                </button>
                
                <div className="px-2 text-sm">
                  {zoomLevel}%
                </div>
                
                <button 
                  onClick={handleZoomIn} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm border border-gray-300"
                  disabled={zoomLevel >= 200}
                >
                  +
                </button>
                
                <button 
                  onClick={handleResetZoom} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm border border-gray-300"
                >
                  Reset
                </button>
                
                <button 
                  onClick={handleMoveRight} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm border border-gray-300"
                >
                  Later ▶
                </button>
              </div>
            </div>
            
            {/* Timeline visualization */}
            <div className="mb-8 relative">
              {/* Timeline axis */}
              <div className="h-1 bg-gray-300 w-full my-4"></div>
              
              {/* Time markers */}
              <div className="flex justify-between w-full mb-4">
                {Array.from({ length: 5 }).map((_, index) => {
                  const position = index * 25; // 0%, 25%, 50%, 75%, 100%
                  const date = visibleRange.start + ((visibleRange.end - visibleRange.start) * (position / 100));
                  
                  return (
                    <div 
                      key={index} 
                      className="absolute text-xs text-gray-600"
                      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                      {formatDate(Math.round(date))}
                    </div>
                  );
                })}
              </div>
              
              {/* Event markers */}
              <div className="relative h-16">
                {sortedEvents.map((event) => {
                  const position = calculatePosition(event.date);
                  
                  return (
                    <div 
                      key={event.id} 
                      className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                        focusedEvent === event.id ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      style={{ left: `${position}%`, top: '50%' }}
                      title={`${event.title} (${formatDate(event.date)})`}
                      onClick={() => scrollToEvent(event.id)}
                      aria-label={`View event: ${event.title}`}
                    ></div>
                  );
                })}
              </div>
            </div>
            
            {/* Events list */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Events</h2>
              
              {sortedEvents.length === 0 ? (
                <p className="text-gray-600">No events match your current filters.</p>
              ) : (
                <div className={`grid gap-4 ${viewMode === 'compact' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                  {sortedEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className={`border rounded overflow-hidden transition-all duration-300 ${
                        focusedEvent === event.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : event.highlight 
                            ? 'border-blue-400 bg-blue-50' 
                            : 'border-gray-200'
                      }`}
                      ref={el => eventRefs.current[event.id] = el}
                      onClick={() => setFocusedEvent(event.id)}
                    >
                      <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                        <div>
                          <span className="font-bold">{formatDate(event.date)}</span>
                          {event.category && viewMode !== 'compact' && (
                            <span className="ml-2 text-xs text-gray-500">{event.category}</span>
                          )}
                        </div>
                        {event.importance && (
                          <div className="flex">
                            {Array.from({ length: event.importance }).map((_, i) => (
                              <span key={i} className="text-yellow-500">★</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-md mb-1">{event.title}</h3>
                        {viewMode !== 'compact' && (
                          <div 
                            className="text-sm text-gray-700" 
                            dangerouslySetInnerHTML={{ __html: event.description }}
                          ></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
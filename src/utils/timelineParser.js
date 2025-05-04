/**
 * Extract the sentence containing a date reference
 * @param {string} text - Full text to search in
 * @param {number} position - Position of the date reference
 * @returns {string} - The sentence containing the date
 */
const extractSentence = (text, position) => {
    // Look for sentence boundaries (., !, ?)
    let startPos = position;
    while (startPos > 0 && !".!?".includes(text[startPos - 1])) {
      startPos--;
    }
    
    let endPos = position;
    while (endPos < text.length && !".!?".includes(text[endPos])) {
      endPos++;
    }
    
    // Include the punctuation
    if (endPos < text.length) {
      endPos++;
    }
    
    return text.substring(startPos, endPos).trim();
  };
  
  /**
   * Create a title for an event based on the description
   * @param {string} text - Event description text
   * @returns {string} - A concise title
   */
  const createEventTitle = (text) => {
    // Extract first part of sentence, up to 60 chars
    const title = text.split(/[,.;:]/, 1)[0].trim();
    
    if (title.length <= 60) {
      return title;
    }
    
    // If too long, truncate
    return title.substring(0, 57) + '...';
  };
  
  /**
   * Infer a category for an event based on its description
   * @param {string} text - Event description
   * @returns {string|null} - Inferred category or null
   */
  const inferCategory = (text) => {
    const lowerText = text.toLowerCase();
    
    // Common category patterns
    const categories = [
      { keywords: ['birth', 'born', 'birthday'], category: 'Births' },
      { keywords: ['death', 'died', 'funeral', 'passed away'], category: 'Deaths' },
      { keywords: ['war', 'battle', 'invasion', 'conflict', 'fought'], category: 'Military' },
      { keywords: ['publish', 'book', 'novel', 'literature', 'wrote', 'author'], category: 'Literature' },
      { keywords: ['art', 'painting', 'sculpture', 'exhibition', 'museum'], category: 'Art' },
      { keywords: ['music', 'song', 'album', 'concert', 'symphony', 'opera'], category: 'Music' },
      { keywords: ['film', 'movie', 'cinema', 'director', 'actress', 'actor'], category: 'Film' },
      { keywords: ['science', 'discovery', 'experiment', 'theory', 'scientific'], category: 'Science' },
      { keywords: ['politic', 'government', 'election', 'president', 'parliament'], category: 'Politics' },
      { keywords: ['technology', 'invention', 'patent', 'device', 'machine'], category: 'Technology' },
      { keywords: ['sport', 'olympic', 'championship', 'tournament', 'athlete'], category: 'Sports' },
      { keywords: ['religion', 'church', 'mosque', 'temple', 'faith', 'spiritual'], category: 'Religion' },
    ];
    
    for (const { keywords, category } of categories) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return null;
  };
  
  /**
   * Estimate the importance of an event based on context
   * @param {string} text - Event description
   * @returns {number} - Importance score (1-5)
   */
  const estimateImportance = (text) => {
    const lowerText = text.toLowerCase();
    
    // Words that might indicate importance
    const importantWords = [
      'significant', 'major', 'important', 'crucial', 'pivotal', 
      'landmark', 'historic', 'famous', 'renowned', 'celebrated',
      'revolutionary', 'groundbreaking', 'pioneering', 'extraordinary',
      'remarkable', 'notable', 'influential', 'critical'
    ];
    
    // Count how many importance indicators are present
    let score = 1; // Base importance
    
    for (const word of importantWords) {
      if (lowerText.includes(word)) {
        score++;
      }
    }
    
    // Cap at max importance of 5
    return Math.min(5, score);
  };
  
  /**
 * Extract timeline data from Wikipedia article HTML
 * @param {string} htmlContent - The HTML content of the article
 * @returns {Object} - Object containing events, time range, and categories
 */
export const parseTimelineData = (htmlContent) => {
    // Create a DOM parser to extract data
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Initialize data structures
    const events = [];
    const categories = new Set();
    let timeRange = { min: 0, max: 0 };
    let eventId = 1;
    
    try {
      // Pattern for date extraction (years with CE/BCE)
      const datePatterns = [
        /(\d{1,4})\s*(?:CE|AD|C\.E\.)/i,  // For CE/AD dates: "1500 CE" or "800 AD"
        /(\d{1,4})\s*(?:BCE|BC|B\.C\.E\.)/i,  // For BCE/BC dates: "500 BCE" or "300 BC"
        /(?:In|By|Around|Circa|c\.|ca\.)?\s*(\d{1,4})(?:\s*(?:CE|AD|C\.E\.))?\b/i,  // "In 1945" or "c. 1066"
      ];
      
      // Step 1: Look for date references in paragraphs
      const paragraphs = doc.querySelectorAll('p');
      paragraphs.forEach(paragraph => {
        const text = paragraph.textContent;
        
        // Extract dates using patterns
        for (const pattern of datePatterns) {
          const matches = [...text.matchAll(new RegExp(pattern, 'g'))];
          
          for (const match of matches) {
            const dateValue = parseInt(match[1], 10);
            const isBCE = match[0].toLowerCase().includes('bc') || match[0].toLowerCase().includes('bce');
            const finalDate = isBCE ? -dateValue : dateValue;
            
            // Get surrounding context for the event
            const sentenceContext = extractSentence(text, match.index);
            
            if (sentenceContext) {
              // Try to infer a category based on content
              const category = inferCategory(sentenceContext);
              if (category) categories.add(category);
              
              // Estimate importance based on context
              const importance = estimateImportance(sentenceContext);
              
              events.push({
                id: eventId++,
                date: finalDate,
                title: createEventTitle(sentenceContext),
                description: sentenceContext,
                category: category || 'General',
                importance: importance,
                highlight: importance >= 3
              });
              
              // Update time range
              if (events.length === 1) {
                timeRange.min = finalDate;
                timeRange.max = finalDate;
              } else {
                timeRange.min = Math.min(timeRange.min, finalDate);
                timeRange.max = Math.max(timeRange.max, finalDate);
              }
            }
          }
        }
      });
      
      // Step 2: Extract events from tables that might contain timeline data
      const tables = doc.querySelectorAll('table');
      tables.forEach(table => {
        // Skip tables with too few rows
        const rows = table.querySelectorAll('tr');
        if (rows.length < 3) return;
        
        // Check first few rows to see if they have date patterns
        let hasDateColumn = false;
        let dateColumnIndex = -1;
        
        // Examine header row if present
        const headerRow = rows[0];
        const headerCells = headerRow.querySelectorAll('th');
        
        // Try to identify a date column from headers
        headerCells.forEach((cell, index) => {
          const text = cell.textContent.toLowerCase();
          if (text.includes('date') || text.includes('year') || text.includes('time') || text.includes('period')) {
            hasDateColumn = true;
            dateColumnIndex = index;
          }
        });
        
        // If no date column found from headers, check content of first column
        if (!hasDateColumn) {
          let dateMatches = 0;
          
          // Check the first 3 rows (or fewer if table is smaller)
          const rowsToCheck = Math.min(rows.length, 3);
          for (let i = 1; i < rowsToCheck; i++) {
            const firstCell = rows[i].querySelector('td');
            if (firstCell) {
              const text = firstCell.textContent;
              for (const pattern of datePatterns) {
                if (pattern.test(text)) {
                  dateMatches++;
                  break;
                }
              }
            }
          }
          
          // If most rows in our sample have dates in the first column, it's likely a timeline
          if (dateMatches >= Math.floor(rowsToCheck / 2)) {
            hasDateColumn = true;
            dateColumnIndex = 0;
          }
        }
        
        // Process table as timeline if we found a date column
        if (hasDateColumn && dateColumnIndex >= 0) {
          // Skip header row if it exists
          const startRow = headerCells.length > 0 ? 1 : 0;
          
          for (let i = startRow; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            
            if (cells.length <= dateColumnIndex) continue;
            
            const dateCell = cells[dateColumnIndex];
            const dateCellText = dateCell.textContent.trim();
            
            // Try to extract date
            let extractedDate = null;
            let isBCE = false;
            
            for (const pattern of datePatterns) {
              const match = dateCellText.match(pattern);
              if (match) {
                extractedDate = parseInt(match[1], 10);
                isBCE = dateCellText.toLowerCase().includes('bc') || dateCellText.toLowerCase().includes('bce');
                break;
              }
            }
            
            if (extractedDate !== null) {
              const finalDate = isBCE ? -extractedDate : extractedDate;
              
              // Get event description from other cells
              let eventTitle = '';
              let eventDescription = '';
              
              // If there's only one other cell, use it as both title and description
              if (cells.length === 2) {
                const contentCell = dateColumnIndex === 0 ? cells[1] : cells[0];
                eventTitle = contentCell.textContent.trim();
                eventDescription = contentCell.innerHTML;
              } 
              // If there are multiple cells, use the first non-date cell as title
              else if (cells.length > 2) {
                for (let j = 0; j < cells.length; j++) {
                  if (j !== dateColumnIndex) {
                    eventTitle = cells[j].textContent.trim();
                    break;
                  }
                }
                
                // Combine all non-date cells for description
                const descriptionParts = [];
                for (let j = 0; j < cells.length; j++) {
                  if (j !== dateColumnIndex) {
                    descriptionParts.push(cells[j].innerHTML);
                  }
                }
                eventDescription = descriptionParts.join(' - ');
              }
              
              // Truncate overly long titles
              if (eventTitle.length > 100) {
                eventTitle = eventTitle.substring(0, 100) + '...';
              }
              
              // Try to infer a category
              const category = inferCategory(eventTitle + ' ' + eventDescription);
              if (category) categories.add(category);
              
              // Estimate importance
              const importance = estimateImportance(eventTitle + ' ' + eventDescription);
              
              events.push({
                id: eventId++,
                date: finalDate,
                title: eventTitle || `Event in ${finalDate}`,
                description: eventDescription || eventTitle,
                category: category || 'General',
                importance: importance,
                highlight: importance >= 3
              });
              
              // Update time range
              if (events.length === 1) {
                timeRange.min = finalDate;
                timeRange.max = finalDate;
              } else {
                timeRange.min = Math.min(timeRange.min, finalDate);
                timeRange.max = Math.max(timeRange.max, finalDate);
              }
            }
          }
        }
      });
      
      // Step 3: Look for timeline-specific sections
      const timelineHeaders = Array.from(doc.querySelectorAll('h2, h3, h4')).filter(
        header => header.textContent.toLowerCase().includes('timeline') || 
                  header.textContent.toLowerCase().includes('chronology') ||
                  header.textContent.toLowerCase().includes('history') ||
                  header.textContent.toLowerCase().includes('dates')
      );
      
      timelineHeaders.forEach(header => {
        let currentElement = header.nextElementSibling;
        
        // Look for lists under the timeline section
        while (currentElement && !['H2', 'H3', 'H4'].includes(currentElement.tagName)) {
          if (currentElement.tagName === 'UL' || currentElement.tagName === 'OL') {
            const items = currentElement.querySelectorAll('li');
            
            items.forEach(item => {
              const text = item.textContent;
              
              // Try to extract dates
              for (const pattern of datePatterns) {
                const match = text.match(pattern);
                if (match) {
                  const dateValue = parseInt(match[1], 10);
                  const isBCE = text.toLowerCase().includes('bc') || text.toLowerCase().includes('bce');
                  const finalDate = isBCE ? -dateValue : dateValue;
                  
                  // Create an event from the list item
                  const description = item.innerHTML;
                  const title = createEventTitle(text);
                  
                  // Try to infer a category
                  const category = inferCategory(text);
                  if (category) categories.add(category);
                  
                  // Estimate importance
                  const importance = estimateImportance(text);
                  
                  events.push({
                    id: eventId++,
                    date: finalDate,
                    title: title,
                    description: description,
                    category: category || 'General',
                    importance: importance,
                    highlight: importance >= 3
                  });
                  
                  // Update time range
                  if (events.length === 1) {
                    timeRange.min = finalDate;
                    timeRange.max = finalDate;
                  } else {
                    timeRange.min = Math.min(timeRange.min, finalDate);
                    timeRange.max = Math.max(timeRange.max, finalDate);
                  }
                }
              }
            });
          }
          
          currentElement = currentElement.nextElementSibling;
        }
      });
      
      // If we found too few events or the time range is invalid, return empty data
      if (events.length < 2 || timeRange.min >= timeRange.max) {
        return { events: [], timeRange: { min: 0, max: 0 }, categories: [] };
      }
      
      // Add padding to time range for better visualization
      const rangePadding = Math.ceil((timeRange.max - timeRange.min) * 0.05); // 5% padding
      timeRange.min -= rangePadding;
      timeRange.max += rangePadding;
      
      return {
        events,
        timeRange,
        categories: Array.from(categories)
      };
    } catch (error) {
      console.error('Error parsing timeline data:', error);
      return { events: [], timeRange: { min: 0, max: 0 }, categories: [] };
    }
  };
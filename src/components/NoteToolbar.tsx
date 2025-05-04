import React, { useState, useEffect } from 'react';
import { getUserNotes, saveUserNotes } from '../services/notesService';

import NoteSidebar from './NoteSidebar';

const NoteToolbar = ({ articleTitle }) => {
  const [activeColor, setActiveColor] = useState('yellow');
  const [noteType, setNoteType] = useState('highlight'); // 'highlight', 'note', 'summary'
  const [summaryNote, setSummaryNote] = useState('');
  const [showSummaryEditor, setShowSummaryEditor] = useState(false);
  const [userNotes, setUserNotes] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);
  console.log(activeColor)

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const contentElement = document.getElementById('annotatable-content');
      if (contentElement) {
        contentElement.addEventListener('mouseup', handleTextSelection);
      }
    }, 100);
    
    // Clean up
    return () => {
      clearTimeout(timer);
      const contentElement = document.getElementById('annotatable-content');
      if (contentElement) {
        contentElement.removeEventListener('mouseup', handleTextSelection);
      }
    };
  }, [articleTitle]);


  // Load user notes for this article on component mount
  useEffect(() => {
    // Set up text selection listener
    const contentElement = document.getElementById('annotatable-content');
    
    // Add this check to prevent the error
    if (contentElement) {
      contentElement.addEventListener('mouseup', handleTextSelection);
      
      // Clean up on unmount
      return () => {
        contentElement.removeEventListener('mouseup', handleTextSelection);
      };
    }
    
    // Add a return function even if the element wasn't found
    return () => {};
  }, [articleTitle]);
  
  // Load saved notes
  const loadNotes = async () => {
    try {
      const notes = await getUserNotes(articleTitle);
      setUserNotes(notes);
      
      // Apply saved highlights and notes to the DOM
      applyStoredAnnotations(notes);
      
      // Load summary note if it exists
      const summary = notes.find(note => note.type === 'summary');
      if (summary) {
        setSummaryNote(summary.content);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };
  
  // Apply stored annotations to the article content
  const applyStoredAnnotations = (notes) => {
    const contentElement = document.getElementById('annotatable-content');
    if (!contentElement) return;
    
    // Create a text node walker to find the text nodes
    const textWalker = document.createTreeWalker(
      contentElement,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    // Apply each stored highlight or note
    notes.forEach(note => {
      if (note.type === 'summary') return; // Skip summary notes
      
      try {
        // Find the text range based on the stored XPath or other identifiers
        // This is a simplified implementation - in practice, you'd need a more robust
        // approach to find the exact text location
        const { startContainer, startOffset, endContainer, endOffset } = findTextPosition(note.location);
        
        if (startContainer && endContainer) {
          // Create a range
          const range = document.createRange();
          range.setStart(startContainer, startOffset);
          range.setEnd(endContainer, endOffset);
          
          // Create the highlight or note
          if (note.type === 'highlight') {
            createHighlight(range, note.color, note.id);
          } else if (note.type === 'note') {
            createNote(range, note.content, note.color, note.id);
          }
        }
      } catch (error) {
        console.error('Error applying annotation:', error);
      }
    });
  };
  
  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    
    // If no text is selected, do nothing
    if (selection.isCollapsed) return;
    
    // Get selection range
    const range = selection.getRangeAt(0);
    
    // Only process selections within our content area
    const contentElement = document.getElementById('annotatable-content');
    if (!contentElement.contains(range.commonAncestorContainer)) return;
    
    // Based on the current note type, create the appropriate annotation
    if (noteType === 'highlight') {
      createHighlightFromSelection(selection, activeColor);
    } else if (noteType === 'note') {
      promptForNote(selection, activeColor);
    }
    
    // Clear the selection after processing
    selection.removeAllRanges();
  };
  
  // Create a highlight from the current selection
  const createHighlightFromSelection = (selection, color) => {
    const range = selection.getRangeAt(0);
    const id = 'highlight-' + Date.now();
    
    // Store the highlight information
    const newHighlight = {
      id,
      type: 'highlight',
      location: saveTextPosition(range),
      color,
      createdAt: new Date().toISOString()
    };
    
    // Add to state and save
    const updatedNotes = [...userNotes, newHighlight];
    setUserNotes(updatedNotes);
    saveUserNotes(articleTitle, updatedNotes);
    
    // Apply the highlight to the DOM
    createHighlight(range, color, id);
  };
  
  // Create a highlight element in the DOM
  const createHighlight = (range, color, id) => {
    // Create a highlight span
    const highlightEl = document.createElement('span');
    highlightEl.className = `highlight highlight-${color}`;
    highlightEl.id = id;
    highlightEl.dataset.type = 'highlight';
    
    // Apply the highlight by surrounding the range
    range.surroundContents(highlightEl);
    
    // Add event listener for removing the highlight
    highlightEl.addEventListener('dblclick', () => removeAnnotation(id));
  };
  
  // Prompt the user for a note on the selected text
  const promptForNote = (selection, color) => {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    
    if (!selectedText) return;
    
    // Prompt for note content
    const noteContent = prompt('Add a note about: ' + selectedText);
    
    if (noteContent) {
      const id = 'note-' + Date.now();
      
      // Store the note information
      const newNote = {
        id,
        type: 'note',
        location: saveTextPosition(range),
        content: noteContent,
        color,
        createdAt: new Date().toISOString()
      };
      
      // Add to state and save
      const updatedNotes = [...userNotes, newNote];
      setUserNotes(updatedNotes);
      saveUserNotes(articleTitle, updatedNotes);
      
      // Apply the note to the DOM
      createNote(range, noteContent, color, id);
    }
  };
  
  // Create a note element in the DOM
  const createNote = (range, content, color, id) => {
    // Create a note span
    const noteEl = document.createElement('span');
    noteEl.className = `note note-${color}`;
    noteEl.id = id;
    noteEl.dataset.type = 'note';
    noteEl.dataset.content = content;
    noteEl.title = content;
    
    // Add a note icon
    noteEl.innerHTML = `<span class="note-icon">📝</span>`;
    
    // Apply the note by surrounding the range
    range.surroundContents(noteEl);
    
    // Add event listeners for note interaction
    noteEl.addEventListener('click', () => showNotePopup(id, content));
    noteEl.addEventListener('dblclick', () => removeAnnotation(id));
  };
  
  // Show a popup with the note content
  const showNotePopup = (id, content) => {
    // Check if popup already exists and remove it
    const existingPopup = document.getElementById('note-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
    
    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'note-popup';
    popup.className = 'note-popup';
    popup.innerHTML = `
      <div class="note-popup-content">
        <div class="note-popup-header">
          <span>Note</span>
          <button id="close-popup">×</button>
        </div>
        <div class="note-popup-body">${content}</div>
        <div class="note-popup-footer">
          <button id="edit-note">Edit</button>
          <button id="delete-note">Delete</button>
        </div>
      </div>
    `;
    
    // Add the popup to the body
    document.body.appendChild(popup);
    
    // Position popup near the note
    const noteElement = document.getElementById(id);
    if (noteElement) {
      const rect = noteElement.getBoundingClientRect();
      popup.style.top = `${rect.bottom + 10 + window.scrollY}px`;
      popup.style.left = `${rect.left}px`;
    }
    
    // Add event listeners
    document.getElementById('close-popup').addEventListener('click', () => {
      popup.remove();
    });
    
    document.getElementById('edit-note').addEventListener('click', () => {
      const newContent = prompt('Edit note:', content);
      if (newContent) {
        updateNoteContent(id, newContent);
        popup.remove();
      }
    });
    
    document.getElementById('delete-note').addEventListener('click', () => {
      removeAnnotation(id);
      popup.remove();
    });
    
    // Close popup when clicking outside
    document.addEventListener('click', function closePopup(e) {
      if (!popup.contains(e.target) && e.target.id !== id) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    });
  };
  
  // Update the content of a note
  const updateNoteContent = (id, newContent) => {
    // Update in DOM
    const noteElement = document.getElementById(id);
    if (noteElement) {
      noteElement.dataset.content = newContent;
      noteElement.title = newContent;
    }
    
    // Update in state and save
    const updatedNotes = userNotes.map(note => {
      if (note.id === id) {
        return { ...note, content: newContent };
      }
      return note;
    });
    
    setUserNotes(updatedNotes);
    saveUserNotes(articleTitle, updatedNotes);
  };
  
  // Remove an annotation (highlight or note)
  const removeAnnotation = (id) => {
    // Remove from DOM
    const element = document.getElementById(id);
    if (element) {
      // Replace the highlight/note with its text content
      const parent = element.parentNode;
      if (parent) {
        const textNode = document.createTextNode(element.textContent);
        parent.replaceChild(textNode, element);
      }
    }
    
    // Remove from state and save
    const updatedNotes = userNotes.filter(note => note.id !== id);
    setUserNotes(updatedNotes);
    saveUserNotes(articleTitle, updatedNotes);
  };
  
  // Save the current position of text for later retrieval
  const saveTextPosition = (range) => {
    // In a production app, you would use a more robust method to identify
    // text positions, such as XPath, text offsets from identifiable elements,
    // or other heuristics to find the same text again later
    
    // This is a simplified approach
    return {
      startPath: getNodePath(range.startContainer),
      startOffset: range.startOffset,
      endPath: getNodePath(range.endContainer),
      endOffset: range.endOffset,
      text: range.toString()
    };
  };
  
  // Find a text position based on stored location data
  const findTextPosition = (location) => {
    // In a production app, this would use the same robust method as saveTextPosition
    // to find the correct text nodes based on the stored location data
    
    // This is a simplified approach that uses text search
    const { text } = location;
    
    // Search for the text in the content
    const contentElement = document.getElementById('annotatable-content');
    if (!contentElement) return {};
    
    // Create a text node walker to find the text nodes
    const textWalker = document.createTreeWalker(
      contentElement,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    // Variables to store our findings
    let foundStart = null;
    let foundEnd = null;
    let startOffset = 0;
    let endOffset = 0;
    
    // Search for the text in text nodes
    let node;
    const textLength = text.length;
    
    while ((node = textWalker.nextNode())) {
      const nodeText = node.nodeValue;
      const textIndex = nodeText.indexOf(text);
      
      // If text is found in this node
      if (textIndex !== -1) {
        foundStart = node;
        foundEnd = node;
        startOffset = textIndex;
        endOffset = textIndex + textLength;
        break;
      }
    }
    
    return {
      startContainer: foundStart,
      startOffset,
      endContainer: foundEnd,
      endOffset
    };
  };
  
  // Get a path to a node for later retrieval
  const getNodePath = (node) => {
    // In a production app, this would create a path that can be used
    // to find the same node again later, such as an XPath
    
    // This is a simplified approach
    if (node.nodeType === Node.TEXT_NODE) {
      // For text nodes, include the parent element's ID or other identifier
      const parent = node.parentNode;
      return parent.id || parent.tagName;
    }
    
    return node.id || node.tagName;
  };
  
  // Save a summary note for the article
  const saveSummaryNote = () => {
    // Check if there's an existing summary note
    const existingSummaryIndex = userNotes.findIndex(note => note.type === 'summary');
    
    // Create new summary note object
    const summaryNoteObj = {
      id: existingSummaryIndex >= 0 ? userNotes[existingSummaryIndex].id : 'summary-' + Date.now(),
      type: 'summary',
      content: summaryNote,
      createdAt: new Date().toISOString()
    };
    
    // Update state and save
    let updatedNotes;
    if (existingSummaryIndex >= 0) {
      // Update existing summary
      updatedNotes = [...userNotes];
      updatedNotes[existingSummaryIndex] = summaryNoteObj;
    } else {
      // Add new summary
      updatedNotes = [...userNotes, summaryNoteObj];
    }
    
    setUserNotes(updatedNotes);
    saveUserNotes(articleTitle, updatedNotes);
    setShowSummaryEditor(false);
  };
  
  // Export notes to a downloadable file
  const exportNotes = () => {
    // Prepare notes data with article title
    const notesData = {
      articleTitle,
      notes: userNotes,
      exportedAt: new Date().toISOString()
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(notesData, null, 2);
    
    // Create blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${articleTitle.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="note-toolbar bg-[#EBEBD2] border border-[#EBEBD2] p-3 mb-4">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <span className="text-sm font-semibold text-yellow-800">Note Tools:</span>
          
          {/* Note type selector */}
          <div className="flex bg-white border border-[#EBEBD2] rounded overflow-hidden">
            <button 
              className={`px-3 py-1 text-xs ${noteType === 'highlight' ? 'bg-[#c9c9b1] font-semibold' : 'bg-white'}`}
              onClick={() => setNoteType('highlight')}
              title="Highlight text"
            >
              Highlight
            </button>
            <button 
              className={`px-3 py-1 text-xs ${noteType === 'note' ? 'bg-[#c9c9b1] font-semibold' : 'bg-white'}`}
              onClick={() => setNoteType('note')}
              title="Add a note to selected text"
            >
              Add Note
            </button>
          </div>
          
          {/* Color picker */}
          {/* <div className="flex bg-white border border-yellow-300 rounded overflow-hidden">
            <button 
              className={`w-6 h-6 bg-yellow-200 ${activeColor === 'yellow' ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => setActiveColor('yellow')}
              title="Yellow highlight"
            />
            <button 
              className={`w-6 h-6 bg-green-200 ${activeColor === 'green' ? 'ring-2 ring-green-400' : ''}`}
              onClick={() => setActiveColor('green')}
              title="Green highlight"
            />
            <button 
              className={`w-6 h-6 bg-blue-200 ${activeColor === 'blue' ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => setActiveColor('blue')}
              title="Blue highlight"
            />
            <button 
              className={`w-6 h-6 bg-purple-200 ${activeColor === 'purple' ? 'ring-2 ring-purple-400' : ''}`}
              onClick={() => setActiveColor('purple')}
              title="Purple highlight"
            />
          </div> */}
        </div>
        
        <div className="flex space-x-2">
        <button 
                    className="bg-[#c9c9b1] hover:bg-[#EBEBD2] px-3 py-1 rounded text-xs "
                    onClick={() => setShowSidebar(!showSidebar)}
                >
                    {showSidebar ? 'Hide Notes' : 'Show Notes'}
                </button>

          <button 
            className="bg-[#c9c9b1] hover:bg-[#EBEBD2] px-3 py-1 rounded text-xs"
            onClick={() => setShowSummaryEditor(!showSummaryEditor)}
          >
            {showSummaryEditor ? 'Hide Summary' : 'Summary Note'}
          </button>
          
          <button 
            className="bg-[#c9c9b1] hover:bg-[#EBEBD2] px-3 py-1 rounded text-xs "
            onClick={exportNotes}
            title="Export all notes and highlights"
          >
            Export Notes
          </button>
        </div>
      </div>
      
      {/* Summary Note Editor */}
      {showSummaryEditor && (
        <div className="mt-3 border border-yellow-300 rounded p-2 bg-white">
          <textarea
            className="w-full p-2 border border-yellow-200 rounded resize-y"
            rows="4"
            placeholder="Add your summary notes for this article here..."
            value={summaryNote}
            onChange={(e) => setSummaryNote(e.target.value)}
          ></textarea>
          <div className="flex justify-end mt-2">
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
              onClick={saveSummaryNote}
            >
              Save Summary
            </button>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-2 text-xs text-yellow-700">
        <p>Select text to {noteType === 'highlight' ? 'highlight it' : 'add a note'}. Double-click any highlight or note to remove it.</p>
      </div>

      <NoteSidebar 
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        notes={userNotes}
        onNoteClick={(note) => {
            // Scroll to the note in the document
            const element = document.getElementById(note.id);
            if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Flash highlight to make it easier to find
            element.classList.add('flash-highlight');
            setTimeout(() => {
                element.classList.remove('flash-highlight');
            }, 2000);
            }
        }}
        />
    </div>
  );
};

export default NoteToolbar;
import React from 'react';
import { formatDate } from '../utils/dateUtils';

const NoteSidebar = ({ isOpen, onClose, notes, onNoteClick }) => {
  // Group notes by type
  const highlights = notes.filter(note => note.type === 'highlight');
  const textNotes = notes.filter(note => note.type === 'note');
  const summary = notes.find(note => note.type === 'summary');
  
  return (
    <div className={`notes-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="notes-sidebar-header">
        <h3>Your Notes</h3>
        <button onClick={onClose}>×</button>
      </div>
      
      {/* Summary note */}
      {summary && (
        <div className="notes-section mb-4">
          <h4 className="text-md font-bold mb-2 pb-1 border-b">Summary</h4>
          <div className="note-item">
            <div className="note-item-header">
              <span>Last updated: {formatDate(new Date(summary.createdAt))}</span>
            </div>
            <div className="note-item-content">
              {summary.content}
            </div>
          </div>
        </div>
      )}
      
      {/* Text notes */}
      {textNotes.length > 0 && (
        <div className="notes-section mb-4">
          <h4 className="text-md font-bold mb-2 pb-1 border-b">Notes ({textNotes.length})</h4>
          <div className="notes-list">
            {textNotes.map(note => (
              <div 
                key={note.id} 
                className={`note-item note-${note.color || 'yellow'}-border`}
                onClick={() => onNoteClick(note)}
              >
                <div className="note-item-header">
                  <span>{formatDate(new Date(note.createdAt))}</span>
                </div>
                <div className="note-item-content">
                  {note.content}
                </div>
                <div className="note-item-highlighted-text">
                  "{note.location.text}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="notes-section">
          <h4 className="text-md font-bold mb-2 pb-1 border-b">Highlights ({highlights.length})</h4>
          <div className="notes-list">
            {highlights.map(highlight => (
              <div 
                key={highlight.id} 
                className={`note-item highlight-${highlight.color || 'yellow'}-border`}
                onClick={() => onNoteClick(highlight)}
              >
                <div className="note-item-header">
                  <span>{formatDate(new Date(highlight.createdAt))}</span>
                  <span className={`highlight-color-indicator bg-${highlight.color || 'yellow'}-200`}></span>
                </div>
                <div className="note-item-highlighted-text">
                  "{highlight.location.text}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {notes.length === 0 && (
        <div className="notes-empty-state">
          <p className="text-gray-500 text-center my-8">
            You haven't added any notes or highlights yet. Select text in the article to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default NoteSidebar;
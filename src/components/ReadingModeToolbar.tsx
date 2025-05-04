import React, { useState } from 'react';

const ReadingModeToolbar = ({ settings, onUpdateSettings, onExitReadingMode, articleTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Font size options
  const fontSizes = [
    { value: 'small', label: 'A', className: 'text-sm' },
    { value: 'medium', label: 'A', className: 'text-base' },
    { value: 'large', label: 'A', className: 'text-lg' },
    { value: 'x-large', label: 'A', className: 'text-xl' }
  ];
  
  // Theme options
  const themes = [
    { value: 'light', label: 'Light', className: 'bg-white text-gray-900' },
    { value: 'sepia', label: 'Sepia', className: 'bg-amber-50 text-amber-900' },
    { value: 'dark', label: 'Dark', className: 'bg-gray-900 text-gray-100' }
  ];
  
  // Font family options
  const fontFamilies = [
    { value: 'serif', label: 'Serif', className: 'font-serif' },
    { value: 'sans', label: 'Sans', className: 'font-sans' }
  ];
  
  // Line spacing options
  const lineSpacings = [
    { value: 'tight', label: 'Tight', className: 'leading-tight' },
    { value: 'normal', label: 'Normal', className: 'leading-normal' },
    { value: 'relaxed', label: 'Relaxed', className: 'leading-relaxed' },
    { value: 'loose', label: 'Loose', className: 'leading-loose' }
  ];
  
  // Toggle toolbar expansion
  const toggleToolbar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`reading-mode-toolbar transition-all duration-300 ease-in-out ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10 transition-transform duration-300">
        <div className="container mx-auto px-4 py-2  h-28 flex justify-between items-center">
          <button 
            onClick={onExitReadingMode}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Exit Reading Mode
          </button>
          
          <div className="text-gray-700 font-medium truncate px-4">
            {articleTitle}
          </div>
          
          <button 
            onClick={toggleToolbar}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Toggle reading settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
        
        {/* Expandable settings panel */}
        <div className={`container mx-auto px-4 py-3 border-t border-gray-200 transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
          <div className="flex flex-wrap justify-center gap-6">
            {/* Font size controls */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Text Size</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {fontSizes.map(size => (
                  <button
                    key={size.value}
                    onClick={() => onUpdateSettings({ fontSize: size.value })}
                    className={`px-3 py-1 rounded-md ${size.className} ${settings.fontSize === size.value ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Theme controls */}
                {/* <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Theme</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {themes.map(theme => (
                    <button
                        key={theme.value}
                        onClick={() => onUpdateSettings({ theme: theme.value })}
                        className={`px-3 py-1 rounded-md ${settings.theme === theme.value ? 'bg-blue-500 text-white' : theme.className}`}
                    >
                        {theme.label}
                    </button>
                    ))}
                </div>
                </div> */}
            
            {/* Font family controls */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Font</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {fontFamilies.map(font => (
                  <button
                    key={font.value}
                    onClick={() => onUpdateSettings({ fontFamily: font.value })}
                    className={`px-3 py-1 rounded-md ${font.className} ${settings.fontFamily === font.value ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Line spacing controls */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Spacing</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {lineSpacings.map(spacing => (
                  <button
                    key={spacing.value}
                    onClick={() => onUpdateSettings({ lineSpacing: spacing.value })}
                    className={`px-3 py-1 rounded-md ${settings.lineSpacing === spacing.value ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  >
                    {spacing.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* NEW: Night mode toggle */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Night Mode</span>
              <div className="flex items-center bg-gray-100 rounded-lg p-2">
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="night-mode" 
                    id="night-mode" 
                    checked={settings.nightMode}
                    onChange={() => onUpdateSettings({ nightMode: !settings.nightMode })}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="night-mode" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      settings.nightMode ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
                <label htmlFor="night-mode" className="text-xs">
                  {settings.nightMode ? 'On' : 'Off'}
                </label>
              </div>
            </div>
            
            {/* NEW: Hide links toggle */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Hide Links</span>
              <div className="flex items-center bg-gray-100 rounded-lg p-2">
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="hide-links" 
                    id="hide-links" 
                    checked={settings.hideLinks}
                    onChange={() => onUpdateSettings({ hideLinks: !settings.hideLinks })}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label 
                    htmlFor="hide-links" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      settings.hideLinks ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
                <label htmlFor="hide-links" className="text-xs">
                  {settings.hideLinks ? 'Hidden' : 'Visible'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add a spacer to ensure content is not hidden behind the fixed toolbar */}
      <div className={`h-12 ${isExpanded ? 'mb-24' : ''}`}></div>
    </div>
  );
};

export default ReadingModeToolbar;

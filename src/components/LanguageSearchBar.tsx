import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const LanguageSearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({ code: 'EN', name: 'Simple English' });
  const [inputFocused, setInputFocused] = useState(false)
  const dropdownRef = useRef(null);
  
  const languages = [
    { code: 'NL', name: 'Nederlands' },
    { code: 'JA', name: '日本語' },
    { code: 'NO', name: 'Norsk (bokmål)' },
    { code: 'NN', name: 'Norsk (nynorsk)' },
    { code: 'KK', name: 'Ночхийн' },
    { code: 'UZ', name:  `'O'zbekcha / Ўзбекча'` },
    { code: 'PL', name: 'Polski' },
    { code: 'PT', name: 'Português' },
    { code: 'KZ', name: 'Қазақша / Qazaqşa / قازاقشا' },
    { code: 'RO', name: 'Română' },
    { code: 'SQ', name: 'Shqip' },
    { code: 'EN', name: 'Simple English' },
    { code: 'CB', name: 'Sinugboanong Binisaya' },
    { code: 'SK', name: 'Slovenčina' },
    { code: 'SL', name: 'Slovenščina' },
    { code: 'SR', name: 'Српски / Srpski' },
    { code: 'SH', name: 'Srpskohrvatski / Српскохрватски' },
    { code: 'FI', name: 'Suomi' },
    { code: 'SV', name: 'Svenska' },
    { code: 'TA', name: 'தமிழ்' },
    { code: 'TT', name: 'Татарча / Tatarça' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="max-w-[450px] mx-auto mt-6">
      <div className="h-[44px] relative flex items-center border border-gray-300">
        <input
          type="text"
          className={`flex-grow py-2 px-4 outline-none focus:ring-2 focus:ring-[#36c] `}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
        
        <div className={`relative h-[44px] ${inputFocused ? 'border-t-2 border-b-2 border-t-[#36c] border-b-[#36c]': 'border-t border-b border-t-gray-300 border-b-gray-300'}`} ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-3 py-2 text-gray-700 bg-white border-gray-300 h-full"
          >
            <span className="mr-1 text-sm">{selectedLanguage.code}</span>
            <ChevronDown size={16} />
          </button>
          
          {isOpen && (
            <div className="absolute top-full w-[250px] right-0 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg z-10">
              <ul className="py-1 max-h-60 overflow-y-auto">
                {languages.map((language) => (
                  <li 
                    key={language.code}
                    className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${language.code === selectedLanguage.code ? 'bg-[#36c] text-white' : ''}`}
                    onClick={() => handleLanguageSelect(language)}
                  >
                    <span>{language.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button className="w-[56px] bg-[#36c] text-white p-2 flex items-center justify-center h-[44px]">
          <Search size={20} />
        </button>
      </div>
    </div>
  );
};

export default LanguageSearchBar;
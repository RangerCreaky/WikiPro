import React, { useState } from 'react';

const WikipediaLanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Group languages by article count
  const languageGroups = {
    "1,000,000+": [
      "العربية", "English", "فارسی", "Italiano", "Nederlands", "Polski", "Sinugboanong", "Svenska", "Tiếng Việt", "中文",
      "Deutsch", "Español", "Français", "مصرى", "日本語", "Português", "Binisaya", "Українська", "Winaray", "Русский"
    ],
    "100,000+": [
      "Afrikaans", "বাংলা", "Eesti", "Հայերեն", "Ladin", "Bahasa Melayu", "Нохчийн", "Shqip", "Srpskohrvatski / Српскохрватски", "ภาษาไทย",
      "Asturianu", "Беларуская", "Ελληνικά", "हिन्दी", "Latina", "Bahaso", "Oʻzbekcha / Ўзбекча", "Simple English", "Suomi", "Тоҷикӣ",
      "Azərbaycanca", "Català", "Esperanto", "Hrvatski", "Latviešu", "Minangkabau", "قازاقشا / Qazaqşa", "Slovenčina", "தமிழ்", "Türkçe",
      "Български", "Čeština", "Euskara", "Bahasa Indonesia", "Lietuvių", "မြန်မာဘာသာ", "Slovenščina", "Српски / Srpski", "Татарча / Tatarça", "اردو",
      "粵語 / Bân-lâm-gú", "Cymraeg", "Galego", "עברית", "Magyar", "Norsk (bokmål · nynorsk)", "Română", "తెలుగు", "粤语"
    ],
    "10,000+": [
      "Bahsa Acèh", "Беларуская (тарашкевіца)", "Diné Bizaad", "Hak-kâ-ngî / 客家語", "Íslenska", "Кыргыз мары", "مازِرونی", "ଓଡ଼ିଆ", "ⵜⴰⵎⴰⵣⵉⵖⵜ", "Kiswahili",
      "Alemannisch", "Bikol Central", "Emilián-Rumagnòl", "Hausa", "Jawa", "Lëtzebuergesch", "Ming-dĕ̤ng-ngṳ̄ / 閩東語", "অসমীয়া", "پښتو", "Tagalog",
      "አማርኛ", "বিষ্ণুপ্রিয়া মণিপুরী", "Fiji Hindi", "Hornjoserbsce", "ಕನ್ನಡ", "Ligure", "Монгол", "پنجابی (شاہ مکھی)", "Scots", "தமிழ்",
      "Aragonés", "Boarisch", "Føroyskt", "Ido", "តខ្មែរ", "Limburgs", "Napulitano", "پښتو", "ChiShona", "chiTumbuka"
      // Note: This is just a sample of the languages from the 10,000+ section
    ],
    "1,000+": [
      "Dzhudzezmo / לאדינו", "Aymar", "Deitsch", "Ghanaan Pidgin", "Перем коми", "Lingua Franca", "ייִדיש", "Papiamentu", "Seediq", "Taqbaylit",
      "Аҧсуа", "Betawi", "دزرگیله", "Gĩkũyũ", "Kongo", "Nova", "Na Vosa Vaka-Viti", "Patois", "Seeltersk", "Tarandíne"
      // Note: This is just a sample of the languages from the 1,000+ section
    ]
  };

  // Calculate the total height of the dropdown to create proper spacing
  const calculateDropdownHeight = () => {
    if (!isOpen) return 0;
    // Approximate height based on content
    const categoryCount = Object.keys(languageGroups).length;
    const rowsPerCategory = Math.ceil(Math.max(...Object.values(languageGroups).map(langs => langs.length)) / 5);
    // Each category has a header (30px) + rows (30px each) + divider (20px)
    return categoryCount * (30 + rowsPerCategory * 30 + 20);
  };

  return (
    <div className="w-full">
      <div className="w-full flex flex-col items-center  ">
        {/* Button container with centering */}
        <div className=" flex justify-center">
          <button 
            className={`z-10 flex items-center px-3 py-2 border-2 border-blue-600 bg-[#f8f9fa] text-[#36c] rounded-none font-bold text-sm`}
            onClick={toggleDropdown}
          >
            <span className="mr-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
              />
          </svg>
            </span>
            Read Wikipedia in your language
            <span className="ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#36c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <g transform={isOpen ? "rotate(180 10 10)" : ""}>
                  <path d="M4.5 7L9.5 12L14.5 7" />
                </g>
              </svg>
            </span>
          </button>
        </div>
        
        {/* Dropdown content */}
        {isOpen && (
          <div className="w-[80%] block bg-[#f8f9fa] z-10 text-sm">
            {Object.entries(languageGroups).map(([count, languages]) => (
              <div key={count} className="px-4 py-2">
                <div className="text-center text-gray-500 py-2">{count} articles</div>
                <div className="grid grid-cols-10 gap-1">
                  {languages.map((lang, index) => (
                    <a key={index} href="#" className="text-[#36c] hover:underline px-2 py-1" style={{ color: '#36c' }}>
                      {lang}
                    </a>
                  ))}
                </div>
                <div className="w-full border-t border-gray-300 mt-4"></div>
              </div>
            ))}

            <p className='font-bold text-[#36c] text-center p-4'> other languages </p>
          </div>
        )}
      </div>
    </div>
  )
};

export default WikipediaLanguageSelector;
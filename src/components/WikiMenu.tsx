import { useState, useEffect, useRef } from 'react';

const WikiMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { text: 'Main page', href: '#' },
    { text: 'Contents', href: '#' },
    { text: 'Current events', href: '#' },
    { text: 'Random article', href: '#' },
    { text: 'About Wikipedia', href: '#' },
    { text: 'Contact us', href: '#' },
    { text: 'Contribute', href: '#' },
    { text: 'Help', href: '#' },
    { text: 'Learn to edit', href: '#' },
    { text: 'Community portal', href: '#' },
    { text: 'Recent changes', href: '#' },
    { text: 'Upload file', href: '#' },
    { text: 'Special pages', href: '#' }
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="bg-white p-2 w-8 flex flex-col items-center justify-center space-y-1 hover:bg-[#f9f8fa] cursor-pointer"
        onClick={toggleMenu}
        aria-label="Main menu"
      >
        <span className="block w-4 h-0.5 bg-[#202122]"></span>
        <span className="block w-4 h-0.5 bg-[#202122]"></span>
        <span className="block w-4 h-0.5 bg-[#202122]"></span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg w-56 z-10">
          <div className="flex items-center p-4 ">
            <span className="font-bold">Main menu</span>
            <span className="ml-auto text-sm text-blue-600 cursor-pointer" onClick={() => setIsOpen(false)}>
              move to sidebar
            </span>
          </div>
          <ul className="py-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a 
                  href={item.href} 
                  className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WikiMenu;
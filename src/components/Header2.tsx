// ------ File: src/components/Header.jsx ------
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/wikipedia-logo.png'; // You'll need to add this to your assets folder

const Header2 = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleArticleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/article/${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap items-center">
          {/* Logo */}
          <div className="flex-shrink-0 mr-4">
            <Link to="/">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png" 
                alt="Wikipedia Logo" 
                className="h-16" 
              />
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="flex-grow mt-4 md:mt-0">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Wikipedia"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none"
              />
              <button 
                type="submit" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 border border-l-0 border-gray-300 rounded-r"
              >
                Search
              </button>
              <button 
                onClick={handleArticleSearch} 
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Go to Article
              </button>
            </form>
          </div>
          
          {/* Navigation Links */}
          <nav className="w-full md:w-auto mt-4 md:mt-0 md:ml-6">
            <ul className="flex space-x-4 text-sm">
              <li><Link to="/" className="text-blue-600 hover:underline">Main Page</Link></li>
              <li><Link to="/article/Contents" className="text-blue-600 hover:underline">Contents</Link></li>
              <li><Link to="/article/Current_events" className="text-blue-600 hover:underline">Current events</Link></li>
              <li><Link to="/article/Random" className="text-blue-600 hover:underline">Random article</Link></li>
              <li><Link to="/article/About" className="text-blue-600 hover:underline">About Wikipedia</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header2;
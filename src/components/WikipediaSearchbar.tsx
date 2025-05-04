import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WikipediaSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Redirect to the article page using the search query as the title parameter
      navigate(`/en/${encodeURIComponent(searchQuery.trim())}`);
      console.log("Searching for:", searchQuery);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <div className="flex h-[32px]">
      <div className="flex w-full border border-gray-300">
        <div className="flex items-center pl-2 pr-1 text-gray-500">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search Wikipedia"
          className="w-[386px] py-1 px-2 focus:outline-none text-sm"
        />
        <button
          onClick={handleSearch}
          className="bg-white border-l border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-100"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default WikipediaSearchBar;
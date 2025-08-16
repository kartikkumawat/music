import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch, placeholder = "Search for songs, artists, albums..." }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
      } else {
        onSearch('');
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, onSearch]);

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="relative max-w-md mx-auto">
      <div className={`relative flex items-center bg-dark-100 rounded-full px-4 py-3 transition-all ${
        isFocused ? 'ring-2 ring-primary-500' : 'ring-1 ring-gray-600'
      }`}>
        <Search size={20} className="text-gray-400 mr-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
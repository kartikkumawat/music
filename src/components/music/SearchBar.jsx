import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock } from 'lucide-react';

const SearchBar = ({
  onSearch,
  placeholder = "Search for songs, artists, albums...",
  showSuggestions = true,
  recentSearches = [],
  onRecentSearchClick
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Remove onSearch from dependencies and use ref to avoid infinite loop
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounced search
    timeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
      } else {
        onSearch('');
      }
    }, 300);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]); // Only depend on query, not onSearch

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    searchRef.current?.focus();
  };

  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    setShowDropdown(false);
    onRecentSearchClick?.(searchTerm);
  };

  const trendingSearches = [
    'Latest hits', 'Pop music', 'Rock classics', 'Hip hop', 'Electronic'
  ];

  return (
    <div className="relative max-w-2xl mx-auto" ref={dropdownRef}>
      {/* Search Input */}
      <div className={`relative flex items-center bg-dark-100 rounded-full px-6 py-4 transition-all duration-200 ${
        isFocused ? 'ring-2 ring-primary-500 shadow-lg' : 'ring-1 ring-gray-600'
      }`}>
        <Search size={20} className="text-gray-400 mr-4" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="ml-3 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-dark-100 border border-gray-600 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
          {query ? (
            /* Search Results Preview */
            <div className="p-4">
              <div className="flex items-center space-x-2 text-gray-400 mb-2">
                <Search size={16} />
                <span className="text-sm">Searching for "{query}"</span>
              </div>
            </div>
          ) : (
            /* Recent and Trending Searches */
            <div className="py-2">
              {recentSearches.length > 0 && (
                <div className="px-4 py-2">
                  <div className="flex items-center space-x-2 text-gray-400 mb-3">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Recent searches</span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded-md transition-colors flex items-center justify-between"
                      >
                        <span>{search}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Remove from recent searches
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-4 py-2 border-t border-gray-700">
                <div className="flex items-center space-x-2 text-gray-400 mb-3">
                  <TrendingUp size={16} />
                  <span className="text-sm font-medium">Trending searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((trend, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(trend)}
                      className="px-3 py-1 bg-gray-700 hover:bg-primary-500 text-sm text-white rounded-full transition-colors"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

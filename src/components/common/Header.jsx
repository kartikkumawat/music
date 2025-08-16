import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Music, Home, Search, List, User } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/playlists', label: 'Playlists', icon: List },
  ];

  return (
    <header className="bg-dark-200 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Music size={32} className="text-primary-500" />
            <h1 className="text-xl font-bold text-white">MusicStream</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === path
                    ? 'text-primary-500 bg-primary-500/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <User size={18} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden pb-4">
          <div className="flex items-center justify-around">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === path
                    ? 'text-primary-500'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
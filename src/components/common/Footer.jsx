import React from 'react';
import { Music, Heart, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  const footerLinks = {
    // 'Product': [
    //   'Features',
    //   'Premium',
    //   'Mobile App',
    //   'Web Player'
    // ],
    // 'Company': [
    //   'About',
    //   'Careers',
    //   'Press',
    //   'Contact'
    // ],
    'Support': [
      // 'Help Center',
      // 'Community',
      'Privacy Policy',
      'Terms of Service'
    ],
    // 'Developers': [
    //   'API Documentation',
    //   'SDKs',
    //   'Integration',
    //   'Partners'
    // ]
  };

  return (
    <footer className="bg-dark-200 border-t border-gray-700 mt-auto w-full">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Music size={32} className="text-primary-500" />
              <h3 className="text-2xl font-bold text-white gradient-text">MusicStream</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-md text-sm sm:text-base">
              Discover, stream, and enjoy millions of songs from your favorite artists.
              Your music, your way, anywhere you go.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="p-2 rounded-full bg-gray-700 hover:bg-primary-500 transition-colors group"
                  aria-label={label}
                >
                  <Icon size={18} className="text-gray-300 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links (Dynamic from footerLinks object) */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="w-full md:w-1/2">
              <h4 className="text-white font-semibold mb-2">Stay in the loop</h4>
              <p className="text-gray-400 text-sm">
                Get the latest music updates and exclusive content delivered to your inbox.
              </p>
            </div>

            <form className="w-full md:w-auto max-w-md flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-dark-100 border border-gray-600 rounded-lg sm:rounded-r-none text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg sm:rounded-l-none transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm flex items-center text-center sm:text-left">
              Made with <Heart size={16} className="text-red-500 mx-1" /> by MusicStream Team
            </div>

            <div className="text-gray-400 text-sm text-center sm:text-right">
              © {currentYear} MusicStream. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

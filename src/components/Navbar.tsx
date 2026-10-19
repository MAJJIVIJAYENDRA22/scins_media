import React, { useState, useEffect } from 'react';
import {
  Compass,
  Menu,
  X,
  Mail,
  Microscope,
  Info,
  Ticket,
  Shield
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onSelectConference?: (slug: string) => void;
  onOpenSubmit?: () => void;
  onOpenContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  onSelectConference = (_slug: string) => {},
  onOpenSubmit,
  onOpenContact
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Conferences', path: '/conferences' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Register', path: '/register' }
  ];

  return (
    <header
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white/70 backdrop-blur-sm border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center">
          <a
            href="/"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                onNavigate('/');
              }
            }}
            className="flex items-center text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-xl py-0.5 cursor-pointer"
            aria-label="SCINS MEDIA — Connecting Minds, Inspiring Innovation"
          >
            <img
              src="/scins-media-logo.png"
              alt="SCINS MEDIA — Connecting Minds, Inspiring Innovation"
              className="h-20 sm:h-[96px] md:h-[110px] w-auto max-h-[110px] -my-4 sm:-my-6 md:-my-8 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              loading="eager"
            />
          </a>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1.5">
          <a
            href="/conferences"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                onNavigate('/conferences');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer inline-flex items-center space-x-1.5 ${
              currentPath === '/conferences'
                ? 'text-[#0E7490] bg-teal-50 font-bold border border-teal-100'
                : 'text-slate-700 hover:text-[#0A2540] hover:bg-slate-100/80'
            }`}
          >
            <Microscope className="w-3.5 h-3.5" />
            <span>Conferences</span>
          </a>

          <a
            href="/about"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                onNavigate('/about');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer inline-flex items-center space-x-1.5 ${
              currentPath === '/about'
                ? 'text-[#0E7490] bg-teal-50 font-bold border border-teal-100'
                : 'text-slate-700 hover:text-[#0A2540] hover:bg-slate-100/80'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </a>

          {/* Existing Register button */}
          <a
            id="header-register-btn"
            href="/register"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                onNavigate('/register');
              }
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Register</span>
          </a>

          {/* Contact Us button immediately to the right of Register button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenContact) {
                onOpenContact();
              } else {
                onNavigate('/contact');
              }
            }}
            className="ml-1 px-4 py-2 rounded-xl text-sm font-bold border border-teal-600/30 text-teal-800 bg-teal-50/90 hover:bg-teal-100 shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1.5"
            title="Contact Conference Secretariat"
          >
            <Mail className="w-3.5 h-3.5 text-teal-600" />
            <span>Contact Us</span>
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center space-x-2.5">
          {/* Upcoming Events Quick Jump */}
          <a
            href="/#upcoming-conferences"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                onNavigate('/#upcoming-conferences');
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0A2540] hover:bg-[#0E7490] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-teal-300" />
            <span>Upcoming Events</span>
          </a>

          {/* Admin Portal Quick Access */}
          <button
            type="button"
            id="navbar-admin-login-btn"
            onClick={() => onNavigate('/admin')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Administrator Portal Login"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Admin</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/conferences"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onNavigate('/conferences');
                  setMobileMenuOpen(false);
                }
              }}
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl text-left font-medium text-slate-800 text-sm flex items-center space-x-2"
            >
              <Microscope className="w-4 h-4" />
              <span>Conferences</span>
            </a>
            <a
              href="/about"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onNavigate('/about');
                  setMobileMenuOpen(false);
                }
              }}
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl text-left font-medium text-slate-800 text-sm flex items-center space-x-2"
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </a>
            <a
              id="mobile-header-register-btn"
              href="/register"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onNavigate('/register');
                  setMobileMenuOpen(false);
                }
              }}
              className="p-3 bg-teal-600 hover:bg-teal-700 rounded-xl text-left font-bold text-white text-sm flex items-center space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Register Now</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenContact) {
                  onOpenContact();
                } else {
                  onNavigate('/contact');
                }
              }}
              className="p-3 bg-teal-50 hover:bg-teal-100 rounded-xl text-left font-bold text-teal-800 text-sm flex items-center space-x-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-teal-600" />
              <span>Contact Us</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            <a
              href="/#upcoming-conferences"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onNavigate('/#upcoming-conferences');
                  setMobileMenuOpen(false);
                }
              }}
              className="w-full py-3 bg-[#0A2540] hover:bg-[#0E7490] text-white rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer block"
            >
              Upcoming Events
            </a>
            <button
              type="button"
              id="mobile-admin-login-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/admin');
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-teal-800 rounded-xl text-xs font-semibold text-center transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Admin Portal Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

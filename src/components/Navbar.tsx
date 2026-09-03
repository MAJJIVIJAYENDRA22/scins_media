import React, { useState, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  Users,
  Award,
  Briefcase,
  Mail,
  Shield,
  Menu,
  X,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onSelectConference?: (slug: string) => void;
  onOpenSubmit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  onSelectConference = (_slug: string) => {},
  onOpenSubmit
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
    { label: 'Publications', path: '/publications' },
    { label: 'Speakers', path: '/speakers' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
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
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-xl py-0.5"
            aria-label="SCINS MEDIA — Connecting Minds, Inspiring Innovation"
          >
            <img
              src="/scins-media-logo.png"
              alt="SCINS MEDIA — Connecting Minds, Inspiring Innovation"
              className="h-20 sm:h-[96px] md:h-[110px] w-auto max-h-[110px] -my-4 sm:-my-6 md:-my-8 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              loading="eager"
            />
          </button>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((item, idx) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={idx}
                onClick={() => onNavigate(item.path!)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-teal-800 bg-teal-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center space-x-2.5">
          {/* Upcoming Events Quick Jump */}
          <button
            onClick={() => onNavigate('/conferences')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/70 text-xs font-semibold hover:bg-teal-100/70 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Upcoming Events</span>
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
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <img
              src="/scins-media-logo.png"
              alt="SCINS MEDIA"
              className="h-12 w-auto max-h-12 object-contain"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              International Conferences
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onNavigate('/conferences');
                setMobileMenuOpen(false);
              }}
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl text-left font-medium text-slate-800 text-sm"
            >
              Conferences
            </button>
            <button
              onClick={() => {
                onNavigate('/publications');
                setMobileMenuOpen(false);
              }}
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl text-left font-medium text-slate-800 text-sm"
            >
              Publications
            </button>
            <button
              onClick={() => {
                onNavigate('/speakers');
                setMobileMenuOpen(false);
              }}
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl text-left font-medium text-slate-800 text-sm"
            >
              Speakers
            </button>
            <button
              onClick={() => {
                onNavigate('/about');
                setMobileMenuOpen(false);
              }}
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl text-left font-medium text-slate-800 text-sm"
            >
              About
            </button>

            <button
              onClick={() => {
                onNavigate('/contact');
                setMobileMenuOpen(false);
              }}
              className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl text-left font-medium text-slate-800 text-sm"
            >
              Contact
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
            <button
              onClick={() => {
                onNavigate('/conferences');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-teal-800 text-white rounded-xl text-xs font-semibold text-center"
            >
              Upcoming Events
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

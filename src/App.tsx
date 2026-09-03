import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HomePage } from './pages/HomePage';
import { ConferencesListPage } from './pages/ConferencesListPage';
import { ConferenceDetailsPage } from './pages/ConferenceDetailsPage';
import { PublicationsPage } from './pages/PublicationsPage';
import { SpeakersDirectoryPage } from './pages/SpeakersDirectoryPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AbstractSubmissionModal } from './components/AbstractSubmissionModal';
import { RegistrationModal } from './components/RegistrationModal';

import {
  INITIAL_CONFERENCES,
  PUBLICATIONS,
  SPEAKERS,
  TESTIMONIALS,
  SESSIONS_20
} from './data/initialData';
import { Conference } from './types';
import { api } from './services/api';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '') {
      return window.location.pathname;
    }
    return '/';
  });
  const [selectedConferenceSlug, setSelectedConferenceSlug] = useState<string>('biopolymers-bioplastics-2026');
  const [conferences, setConferences] = useState<Conference[]>(INITIAL_CONFERENCES);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isGlobalAbstractModalOpen, setIsGlobalAbstractModalOpen] = useState<boolean>(false);
  const [isGlobalRegisterModalOpen, setIsGlobalRegisterModalOpen] = useState<boolean>(false);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        setCurrentPath(window.location.pathname || '/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch real conferences from backend
  useEffect(() => {
    const loadConferences = async () => {
      try {
        const data = await api.getConferences();
        if (data && data.length > 0) {
          setConferences(data);
        }
      } catch (err) {
        console.warn('Using initial seed conference records.');
      }
    };
    loadConferences();
  }, []);

  // Keyboard shortcut for Cmd/Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Window scroll to top on navigation & push browser history
  const navigateTo = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectConference = (slug: string) => {
    setSelectedConferenceSlug(slug);
    navigateTo(`/conferences/${slug}`);
  };

  // Find active conference
  const activeConference =
    conferences.find(c => c.slug === selectedConferenceSlug) || conferences[0];

  // Render current view
  const renderCurrentView = () => {
    if (currentPath === '/admin') {
      return (
        <AdminDashboardPage
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
        />
      );
    }

    if (currentPath.startsWith('/conferences/')) {
      return (
        <ConferenceDetailsPage
          conference={activeConference}
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
        />
      );
    }

    switch (currentPath) {
      case '/conferences':
        return (
          <ConferencesListPage
            conferences={conferences}
            onSelectConference={handleSelectConference}
            onNavigate={navigateTo}
          />
        );
      case '/publications':
        return <PublicationsPage publications={PUBLICATIONS} onNavigate={navigateTo} />;
      case '/speakers':
        return (
          <SpeakersDirectoryPage
            speakers={SPEAKERS}
            onSelectConference={handleSelectConference}
          />
        );
      case '/about':
        return <AboutPage onNavigate={navigateTo} />;
      case '/contact':
        return <ContactPage />;
      case '/':
      default:
        return (
          <HomePage
            conferences={conferences}
            speakers={SPEAKERS}
            testimonials={TESTIMONIALS}
            onNavigate={navigateTo}
            onSelectConference={handleSelectConference}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );
    }
  };

  const isAdmin = currentPath === '/admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar (Public app only) */}
      {!isAdmin && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigateTo}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectConference={handleSelectConference}
          onOpenSubmit={() => setIsGlobalAbstractModalOpen(true)}
        />
      )}

      {/* Main Dynamic View */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Global Footer (shown on all public views) */}
      {!isAdmin && (
        <Footer
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        conferences={conferences}
        speakers={SPEAKERS}
        sessions={SESSIONS_20}
        publications={PUBLICATIONS}
        onSelectConference={handleSelectConference}
        onNavigate={navigateTo}
      />

      {/* Global Abstract Submission Modal */}
      <AbstractSubmissionModal
        isOpen={isGlobalAbstractModalOpen}
        onClose={() => setIsGlobalAbstractModalOpen(false)}
        conference={activeConference}
      />

      {/* Global Delegate Registration Modal */}
      <RegistrationModal
        isOpen={isGlobalRegisterModalOpen}
        onClose={() => setIsGlobalRegisterModalOpen(false)}
        conference={activeConference}
      />
    </div>
  );
}

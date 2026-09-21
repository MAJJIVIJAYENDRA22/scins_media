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
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { CallForProposalsPage } from './pages/CallForProposalsPage';
import { AbstractSubmissionModal } from './components/AbstractSubmissionModal';
import { RegistrationModal } from './components/RegistrationModal';
import { PublicContextMenu } from './components/PublicContextMenu';

import {
  INITIAL_CONFERENCES,
  PUBLICATIONS,
  SPEAKERS,
  TESTIMONIALS,
  SESSIONS_20
} from './data/initialData';
import { Conference, Speaker, Publication } from './types';
import { api, getStoredAdminToken, isTokenValid, clearAdminSession } from './services/api';

export default function App() {
  // Always require authentication on initial load or refresh
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Security requirement: when the Admin page is loaded/refreshed, clear any existing session
  useEffect(() => {
    clearAdminSession();
    setIsAdminAuthenticated(false);
  }, []);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname) {
      const path = window.location.pathname;
      const cleanPath = (path.length > 1 && path.endsWith('/')) ? path.slice(0, -1) : path;
      const isAdminPath = cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanPath === '/login';

      if (isAdminPath) {
        if (window.location.pathname !== '/admin') {
          window.history.replaceState({}, '', '/admin');
        }
        clearAdminSession();
        return '/admin';
      }
      return path;
    }
    return '/';
  });
  const [selectedConferenceSlug, setSelectedConferenceSlug] = useState<string>('biopolymers-bioplastics-2026');
  const [conferences, setConferences] = useState<Conference[]>(INITIAL_CONFERENCES);
  const [speakers, setSpeakers] = useState<Speaker[]>(SPEAKERS);
  const [publications, setPublications] = useState<Publication[]>(PUBLICATIONS);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isGlobalAbstractModalOpen, setIsGlobalAbstractModalOpen] = useState<boolean>(false);
  const [isGlobalRegisterModalOpen, setIsGlobalRegisterModalOpen] = useState<boolean>(false);

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname || '';
        const cleanPath = (path.length > 1 && path.endsWith('/')) ? path.slice(0, -1) : path;
        const isAdminPath = cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanPath === '/login';

        if (isAdminPath) {
          if (window.location.pathname !== '/admin') {
            window.history.replaceState({}, '', '/admin');
          }
          if (!isAdminAuthenticated) {
            clearAdminSession();
          }
          setCurrentPath('/admin');
          return;
        }
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminAuthenticated]);

  // Strict Admin Route Protection
  useEffect(() => {
    const cleanPath = (currentPath.length > 1 && currentPath.endsWith('/')) ? currentPath.slice(0, -1) : currentPath;
    const isAdminPath = cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanPath === '/login';

    if (isAdminPath) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.history.replaceState({}, '', '/admin');
      }
      if (!isAdminAuthenticated) {
        clearAdminSession();
      }
    }
  }, [currentPath, isAdminAuthenticated]);

  // Fetch real conferences and speakers from backend
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const data = await api.getConferences();
        if (data && data.length > 0) {
          setConferences(data);
        }
      } catch (err) {
        console.warn('Using initial seed conference records.');
      }

      try {
        const speakerData = await api.getSpeakers();
        if (speakerData && speakerData.length > 0) {
          setSpeakers(speakerData);
        }
      } catch (err) {
        // use initial seed speakers
      }

      try {
        const pubData = await api.getPublications();
        if (pubData && pubData.length > 0) {
          setPublications(pubData);
        }
      } catch (err) {
        // use initial seed publications
      }
    };
    loadAppData();
  }, [currentPath]);

  // Listen for publication updates from admin or cross-component
  useEffect(() => {
    const handlePubsUpdate = async () => {
      try {
        const pubData = await api.getPublications();
        if (pubData && pubData.length > 0) {
          setPublications(pubData);
        }
      } catch {}
    };
    window.addEventListener('scinsmedia:publications_updated', handlePubsUpdate);
    return () => window.removeEventListener('scinsmedia:publications_updated', handlePubsUpdate);
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
    let targetPath = path;
    const cleanTarget = (targetPath.length > 1 && targetPath.endsWith('/')) ? targetPath.slice(0, -1) : targetPath;
    const isAdminPath = cleanTarget === '/admin' || cleanTarget.startsWith('/admin/') || cleanTarget === '/login';

    if (isAdminPath) {
      targetPath = '/admin';
      const token = getStoredAdminToken();
      if (!isAdminAuthenticated || !isTokenValid(token)) {
        clearAdminSession();
        setIsAdminAuthenticated(false);
      }
    }
    if (targetPath === '/register') {
      const slug = activeConference?.slug || 'biopolymers-bioplastics-2026';
      targetPath = `/conferences/${slug}#registration-section`;
    }
    setCurrentPath(targetPath);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    const hash = targetPath.includes('#') ? targetPath.split('#')[1] : '';
    if (hash) {
      const tryScroll = (retries = 6) => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (retries > 0) {
          setTimeout(() => tryScroll(retries - 1), 120);
        }
      };
      setTimeout(() => tryScroll(6), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    const cleanCurrent = (currentPath.length > 1 && currentPath.endsWith('/')) ? currentPath.slice(0, -1) : currentPath;

    // Single Secure Admin Route: /admin ONLY
    if (cleanCurrent === '/admin' || cleanCurrent.startsWith('/admin/') || cleanCurrent === '/login') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.history.replaceState({}, '', '/admin');
      }

      const token = getStoredAdminToken();
      const valid = isAdminAuthenticated && isTokenValid(token);

      // If NOT authenticated -> render Login Screen directly at /admin
      if (!valid) {
        clearAdminSession();
        return (
          <AdminLoginPage
              onLoginSuccess={() => {
                setIsAdminAuthenticated(true);
              }}
              onNavigateHome={() => navigateTo('/')}
            />
        );
      }

      // If already authenticated -> render Admin Dashboard at /admin
      return (
        <AdminDashboardPage
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
          onConferenceCreated={(conf) => {
            setConferences(prev => {
              const idx = prev.findIndex(c => c.id === conf.id || c.slug === conf.slug);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = conf;
                return next;
              }
              return [conf, ...prev];
            });
            setSelectedConferenceSlug(conf.slug);
          }}
          onSignOut={() => {
            clearAdminSession();
            setIsAdminAuthenticated(false);
            navigateTo('/admin');
          }}
        />
      );
    }

    if (currentPath === '/register' || currentPath === '/registration' || currentPath.startsWith('/register/')) {
      const rest = currentPath.startsWith('/register/') ? currentPath.replace('/register/', '') : '';
      const [slugFromPath, catIdFromPath] = rest.split('/');
      return (
        <RegistrationPage
          initialConferenceSlug={slugFromPath || undefined}
          initialCategoryId={catIdFromPath ? Number(catIdFromPath) : undefined}
          lockConference={!!slugFromPath}
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
        />
      );
    }

    if (currentPath === '/abstract' || currentPath.startsWith('/abstract/')) {
      const slugFromPath = currentPath.startsWith('/abstract/') ? currentPath.replace('/abstract/', '') : undefined;
      const abstractConference =
        (slugFromPath && conferences.find(c => c.slug === slugFromPath)) || activeConference;
      return (
        <ConferenceDetailsPage
          conference={abstractConference}
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
          autoOpenAbstract={true}
        />
      );
    }

    if (currentPath.startsWith('/conferences/')) {
      const slugFromPath = currentPath.replace('/conferences/', '').split('#')[0].split('?')[0];
      const detailsConference = conferences.find(c => c.slug === slugFromPath) || activeConference;
      return (
        <ConferenceDetailsPage
          conference={detailsConference}
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
      case '/proposals':
      case '/call-for-proposals':
        return (
          <CallForProposalsPage
            conferences={conferences}
            onNavigate={navigateTo}
            onSelectConference={handleSelectConference}
          />
        );
      case '/publications':
        return <PublicationsPage publications={publications} onNavigate={navigateTo} />;
      case '/speakers':
        return (
          <SpeakersDirectoryPage
            speakers={speakers}
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
            speakers={speakers}
            testimonials={TESTIMONIALS}
            onNavigate={navigateTo}
            onSelectConference={handleSelectConference}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );
    }
  };

  const isAdmin = currentPath === '/admin' || currentPath.startsWith('/admin/') || currentPath === '/login';
  const isConferenceDetails = currentPath.startsWith('/conferences/');

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-white' : 'bg-[#F8FAFC]'} text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white`}>
      {/* Top Navbar (Public app only, hidden on conference details routes) */}
      {!isAdmin && !isConferenceDetails && (
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

      {/* Global Footer (shown on all public views except conference details, which has its own condensed footer) */}
      {!isAdmin && !isConferenceDetails && (
        <Footer
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
          upcomingConferenceSlug={activeConference?.slug || 'biopolymers-bioplastics-2026'}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        conferences={conferences}
        speakers={speakers}
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

      {/* Public Context Menu with Open in New Tab & Open in New Window */}
      <PublicContextMenu isAdmin={isAdmin} />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HomePage } from './pages/HomePage';
import { ConferencesListPage } from './pages/ConferencesListPage';
import { ConferenceDetailsPage } from './pages/ConferenceDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { AbstractSubmissionPage } from './pages/AbstractSubmissionPage';
import { BrochureDownloadPage } from './pages/BrochureDownloadPage';
import { TermsAndConditionsPage } from './pages/TermsAndConditionsPage';
import { StripeCheckoutPage } from './pages/StripeCheckoutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AbstractSubmissionModal } from './components/AbstractSubmissionModal';
import { RegistrationModal } from './components/RegistrationModal';
import { ContactUsModal } from './components/ContactUsModal';
import { PublicContextMenu } from './components/PublicContextMenu';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

import {
  INITIAL_CONFERENCES,
  SPEAKERS,
  TESTIMONIALS,
  SESSIONS_20
} from './data/initialData';
import { Conference, Speaker } from './types';
import { api, getStoredAdminToken, isTokenValid, clearAdminSession } from './services/api';
import {
  setHomeSeo,
  setConferencesListSeo,
  setConferenceDetailSeo,
  setAboutSeo,
  setContactSeo,
  setTermsSeo,
  setAdminSeo,
  setNotFoundSeo
} from './utils/seo';

export default function App() {
  // Refreshing admin panel always logs out; admin session is strictly in-memory per live visit
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Clear any residual session on page load/refresh
  useEffect(() => {
    clearAdminSession();
    const handleBeforeUnload = () => {
      clearAdminSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const fullPath = (window.location.pathname || '') + (window.location.hash || '');
      const path = window.location.pathname || '/';
      const cleanPath = (path.length > 1 && path.endsWith('/')) ? path.slice(0, -1) : path;
      const isAdminPath = cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanPath === '/login' || cleanPath === '/admin-login';

      if (isAdminPath) {
        if (window.location.pathname !== '/admin') {
          window.history.replaceState({}, '', '/admin');
        }
        return '/admin';
      }
      return fullPath || '/';
    }
    return '/';
  });
  const [selectedConferenceSlug, setSelectedConferenceSlug] = useState<string>('biopolymers-bioplastics-2026');
  const [conferences, setConferences] = useState<Conference[]>(INITIAL_CONFERENCES);
  const [isConferencesLoaded, setIsConferencesLoaded] = useState<boolean>(false);
  const [speakers, setSpeakers] = useState<Speaker[]>(SPEAKERS);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isGlobalAbstractModalOpen, setIsGlobalAbstractModalOpen] = useState<boolean>(false);
  const [isGlobalRegisterModalOpen, setIsGlobalRegisterModalOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  // Sync browser back/forward buttons (including hash anchors)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const fullPath = (window.location.pathname || '') + (window.location.hash || '');
        const path = window.location.pathname || '/';
        const cleanPath = (path.length > 1 && path.endsWith('/')) ? path.slice(0, -1) : path;
        const isAdminPath = cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanPath === '/login' || cleanPath === '/admin-login';

        if (isAdminPath) {
          if (window.location.pathname !== '/admin') {
            window.history.replaceState({}, '', '/admin');
          }
          setCurrentPath('/admin');
          return;
        }
        setCurrentPath(fullPath || '/');

        // Scroll to hash target if present on back/forward
        if (window.location.hash) {
          const hash = window.location.hash.slice(1);
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminAuthenticated]);

  // Handle direct access and page refresh with hash anchor (e.g. /#upcoming-conferences)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.slice(1);
      const tryScroll = (retries = 8) => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (retries > 0) {
          setTimeout(() => tryScroll(retries - 1), 100);
        }
      };
      setTimeout(() => tryScroll(8), 120);
    }
  }, []);

  // Strict Admin Route Protection
  useEffect(() => {
    const cleanPath = (currentPath.length > 1 && currentPath.endsWith('/')) ? currentPath.slice(0, -1) : currentPath;
    const isAdminPath = cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanPath === '/login' || cleanPath === '/admin-login';

    if (isAdminPath) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.history.replaceState({}, '', '/admin');
      }
      if (!isAdminAuthenticated) {
        clearAdminSession();
      }
    }
  }, [currentPath, isAdminAuthenticated]);

  // Dynamic SEO metadata synchronization across client navigation
  useEffect(() => {
    const cleanCurrent = (currentPath.length > 1 && currentPath.endsWith('/')) ? currentPath.slice(0, -1) : currentPath;
    const baseRoute = cleanCurrent.split('#')[0].split('?')[0] || '/';

    if (cleanCurrent === '/admin' || cleanCurrent.startsWith('/admin/') || cleanCurrent === '/login') {
      setAdminSeo();
      return;
    }

    if (baseRoute === '/' || baseRoute === '') {
      setHomeSeo();
      return;
    }

    if (baseRoute === '/conferences') {
      setConferencesListSeo(conferences.length);
      return;
    }

    if (baseRoute === '/about') {
      setAboutSeo();
      return;
    }

    if (baseRoute === '/contact') {
      setContactSeo();
      return;
    }

    if (baseRoute === '/terms' || baseRoute === '/terms-and-conditions') {
      setTermsSeo();
      return;
    }

    if (baseRoute.startsWith('/conferences/')) {
      const slug = baseRoute.replace('/conferences/', '').split('/')[0];
      const conf = conferences.find(c => c.slug === slug || String(c.id) === slug);
      if (conf) {
        setConferenceDetailSeo(conf);
        return;
      }
    }
  }, [currentPath, conferences]);

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
      } finally {
        setIsConferencesLoaded(true);
      }

      try {
        const speakerData = await api.getSpeakers();
        if (speakerData && speakerData.length > 0) {
          setSpeakers(speakerData);
        }
      } catch (err) {
        // use initial seed speakers
      }
    };
    loadAppData();
  }, [currentPath]);

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
    setCurrentPath(targetPath);
    if (typeof window !== 'undefined') {
      const currentFull = (window.location.pathname || '') + (window.location.hash || '');
      if (currentFull !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
    const isSameConferenceAction =
      targetPath.startsWith('/conferences/') &&
      currentPath.startsWith('/conferences/') &&
      targetPath.split('/')[2] === currentPath.split('/')[2];

    const hash = targetPath.includes('#') ? targetPath.split('#')[1] : '';
    if (hash) {
      const tryScroll = (retries = 8) => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (retries > 0) {
          setTimeout(() => tryScroll(retries - 1), 100);
        }
      };
      setTimeout(() => tryScroll(8), 100);
    } else if (!isSameConferenceAction) {
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
    if (cleanCurrent === '/admin' || cleanCurrent.startsWith('/admin/') || cleanCurrent === '/login' || cleanCurrent === '/admin-login') {
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

    if (currentPath.startsWith('/checkout/stripe-session')) {
      return <StripeCheckoutPage />;
    }

    if (currentPath === '/register' || currentPath === '/registration' || currentPath.startsWith('/register/')) {
      const rest = currentPath.startsWith('/register/') ? currentPath.replace('/register/', '') : '';
      const [slugFromPath, catIdFromPath] = rest.split('/');
      if (slugFromPath) {
        const conf = conferences.find(c => c.slug === slugFromPath || String(c.id) === slugFromPath);
        if (conf) {
          return (
            <ConferenceDetailsPage
              conference={conf}
              activeAction="register"
              initialCategoryId={catIdFromPath ? Number(catIdFromPath) : undefined}
              onNavigate={navigateTo}
              onSelectConference={handleSelectConference}
            />
          );
        }
      }
      return (
        <RegistrationPage
          initialConferenceSlug={slugFromPath || undefined}
          initialCategoryId={catIdFromPath ? Number(catIdFromPath) : undefined}
          lockConference={Boolean(slugFromPath)}
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
        />
      );
    }

    if (
      currentPath === '/abstract' ||
      currentPath.startsWith('/abstract/') ||
      currentPath === '/submit-abstract' ||
      currentPath.startsWith('/submit-abstract/')
    ) {
      let slugFromPath: string | undefined;
      if (currentPath.startsWith('/abstract/')) {
        slugFromPath = currentPath.replace('/abstract/', '');
      } else if (currentPath.startsWith('/submit-abstract/')) {
        slugFromPath = currentPath.replace('/submit-abstract/', '');
      }
      if (slugFromPath) {
        const conf = conferences.find(c => c.slug === slugFromPath || String(c.id) === slugFromPath);
        if (conf) {
          return (
            <ConferenceDetailsPage
              conference={conf}
              activeAction="submit-abstract"
              onNavigate={navigateTo}
              onSelectConference={handleSelectConference}
            />
          );
        }
      }
      const abstractConference =
        (slugFromPath && conferences.find(c => c.slug === slugFromPath || String(c.id) === slugFromPath)) || activeConference;
      return (
        <AbstractSubmissionPage
          conference={abstractConference}
          conferences={conferences}
          lockConference={true}
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
        />
      );
    }

    if (currentPath.startsWith('/conferences/')) {
      const cleanPath = currentPath.split('#')[0].split('?')[0];
      const afterConferences = cleanPath.replace('/conferences/', '');
      const parts = afterConferences.split('/').filter(Boolean);
      const slugFromPath = parts[0];
      const action = parts[1];
      const extra = parts[2];

      if (!slugFromPath) {
        return (
          <ConferencesListPage
            conferences={conferences}
            onSelectConference={handleSelectConference}
            onNavigate={navigateTo}
          />
        );
      }

      const conf = conferences.find(c => c.slug === slugFromPath || String(c.id) === slugFromPath);
      if (!conf) {
        if (!isConferencesLoaded) {
          return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center pt-20">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading conference...</p>
              </div>
            </div>
          );
        }
        return <NotFoundPage onNavigate={navigateTo} />;
      }

      const recognizedActions = [
        'download-brochure',
        'brochure',
        'submit-abstract',
        'abstract',
        'register'
      ];

      if (action && !recognizedActions.includes(action)) {
        return <NotFoundPage onNavigate={navigateTo} />;
      }

      // Preserve conference page in the background and open modal for action URLs
      return (
        <ConferenceDetailsPage
          conference={conf}
          activeAction={action}
          initialCategoryId={extra ? Number(extra) : undefined}
          onNavigate={navigateTo}
          onSelectConference={handleSelectConference}
        />
      );
    }

    const baseRoute = cleanCurrent.split('#')[0].split('?')[0] || '/';

    switch (baseRoute) {
      case '/conferences':
        return (
          <ConferencesListPage
            conferences={conferences}
            onSelectConference={handleSelectConference}
            onNavigate={navigateTo}
          />
        );
      case '/about':
        return <AboutPage onNavigate={navigateTo} />;
      case '/contact':
        return <ContactPage />;
      case '/terms':
      case '/terms-and-conditions':
        return <TermsAndConditionsPage onNavigate={navigateTo} />;
      case '':
      case '/':
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
      default:
        return <NotFoundPage onNavigate={navigateTo} />;
    }
  };

  const isAdmin = currentPath === '/admin' || currentPath.startsWith('/admin/') || currentPath === '/login';

  // Dedicated conference pages and form pages hide the main website header, navigation, and footer
  const isConferenceOrFormFlow =
    currentPath.startsWith('/conferences/') ||
    currentPath.startsWith('/checkout/') ||
    currentPath === '/register' ||
    currentPath.startsWith('/register/') ||
    currentPath === '/registration' ||
    currentPath === '/abstract' ||
    currentPath.startsWith('/abstract/') ||
    currentPath === '/submit-abstract' ||
    currentPath.startsWith('/submit-abstract/') ||
    currentPath === '/brochure' ||
    currentPath.startsWith('/brochure/');

  const showWebsiteHeaderAndFooter = !isAdmin && !isConferenceOrFormFlow;

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-white' : 'bg-[#F8FAFC]'} text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white`}>
      {/* Top Navbar (Public catalog app only; hidden on conference pages and dedicated form pages/modals) */}
      {showWebsiteHeaderAndFooter && (
        <Navbar
          currentPath={currentPath}
          onNavigate={navigateTo}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectConference={handleSelectConference}
          onOpenSubmit={() => setIsGlobalAbstractModalOpen(true)}
          onOpenContact={() => setIsContactModalOpen(true)}
        />
      )}

      {/* Main Dynamic View */}
      <main className="flex-1">{renderCurrentView()}</main>

      {/* Global Footer (shown on public catalog views only; hidden on conference pages and dedicated form pages/modals) */}
      {showWebsiteHeaderAndFooter && (
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
        sessions={SESSIONS_20}
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

      {/* Global Contact Us Modal */}
      <ContactUsModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Public Context Menu with Open in New Tab & Open in New Window */}
      <PublicContextMenu isAdmin={isAdmin} />

      {/* Floating WhatsApp Contact Button (Across all public pages; hidden on admin/login) */}
      {!isAdmin && <FloatingWhatsApp />}
    </div>
  );
}

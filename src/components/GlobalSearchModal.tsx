import React, { useState, useEffect, useId } from 'react';
import { Search, X, Calendar, MapPin, User, BookOpen, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { Conference, Speaker, Session, Publication } from '../types';
import {
  INITIAL_CONFERENCES,
  SPEAKERS,
  SESSIONS_20,
  PUBLICATIONS
} from '../data/initialData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conferences?: Conference[];
  speakers?: Speaker[];
  sessions?: Session[];
  publications?: Publication[];
  onSelectConference: (slug: string) => void;
  onSelectPage?: (path: string) => void;
  onNavigate?: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  conferences = INITIAL_CONFERENCES,
  speakers = SPEAKERS,
  sessions = SESSIONS_20,
  publications = PUBLICATIONS,
  onSelectConference,
  onSelectPage,
  onNavigate
}) => {
  const handlePageNavigation = (path: string) => {
    if (onSelectPage) onSelectPage(path);
    else if (onNavigate) onNavigate(path);
  };
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'conferences' | 'speakers' | 'sessions' | 'publications'>('all');
  const searchInputId = useId();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle search
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredConferences = q
    ? conferences.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.theme.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q)
      )
    : conferences.slice(0, 3);

  const filteredSpeakers = q
    ? speakers.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.institution.toLowerCase().includes(q) ||
          s.research_domain.toLowerCase().includes(q) ||
          s.presentation_title?.toLowerCase().includes(q)
      )
    : speakers.slice(0, 3);

  const filteredSessions = q
    ? sessions.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.track.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    : sessions.slice(0, 4);

  const filteredPublications = q
    ? publications.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.journal.toLowerCase().includes(q) ||
          p.doi.toLowerCase().includes(q)
      )
    : publications.slice(0, 3);

  return (
    <div
      id="global-search-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" />
          <input
            id={searchInputId}
            type="text"
            placeholder="Search conferences, speakers, scientific sessions, tracks, DOIs..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-200/60 rounded-md mr-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1 px-4 py-2 bg-white border-b border-slate-100 text-xs font-medium text-slate-600 overflow-x-auto">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'conferences', label: `Conferences (${filteredConferences.length})` },
            { id: 'speakers', label: `Speakers (${filteredSpeakers.length})` },
            { id: 'sessions', label: `Sessions (${filteredSessions.length})` },
            { id: 'publications', label: `Publications (${filteredPublications.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 divide-y divide-slate-100">
          {/* Conferences */}
          {(activeTab === 'all' || activeTab === 'conferences') && filteredConferences.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                Conferences
              </div>
              {filteredConferences.map(conf => (
                <div
                  key={conf.id}
                  onClick={() => {
                    onSelectConference(conf.slug);
                    onClose();
                  }}
                  className="group flex items-start justify-between p-3 rounded-xl hover:bg-teal-50/60 border border-transparent hover:border-teal-200 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">
                        {conf.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{conf.theme}</p>
                      <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-teal-600" />
                          {conf.city}, {conf.country}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase">
                          {conf.domain}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all mt-2" />
                </div>
              ))}
            </div>
          )}

          {/* Speakers */}
          {(activeTab === 'all' || activeTab === 'speakers') && filteredSpeakers.length > 0 && (
            <div className="space-y-2 pt-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                Keynote & Academic Speakers
              </div>
              {filteredSpeakers.map(spk => (
                <div
                  key={spk.id}
                  onClick={() => {
                    handlePageNavigation('/speakers');
                    onClose();
                  }}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={spk.photo_url}
                      alt={spk.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{spk.name}</h4>
                      <p className="text-xs text-slate-500">{spk.institution} • {spk.country}</p>
                      {spk.presentation_title && (
                        <p className="text-[11px] text-teal-700 font-medium line-clamp-1 mt-0.5">
                          "{spk.presentation_title}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-700">View Bio</span>
                </div>
              ))}
            </div>
          )}

          {/* 20 Scientific Sessions */}
          {(activeTab === 'all' || activeTab === 'sessions') && filteredSessions.length > 0 && (
            <div className="space-y-2 pt-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                Scientific Sessions & Tracks
              </div>
              {filteredSessions.map(ses => (
                <div
                  key={ses.id}
                  onClick={() => {
                    onSelectConference('biopolymers-bioplastics-2026');
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded font-semibold">
                      {ses.session_code}
                    </span>
                    <span className="text-xs text-slate-400">{ses.track}</span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-900 mt-1">{ses.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ses.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Publications */}
          {(activeTab === 'all' || activeTab === 'publications') && filteredPublications.length > 0 && (
            <div className="space-y-2 pt-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                Scopus & Peer-Reviewed Publications
              </div>
              {filteredPublications.map(pub => (
                <div
                  key={pub.id}
                  onClick={() => {
                    handlePageNavigation('/publications');
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-teal-700 font-medium">{pub.doi}</span>
                    <span>{pub.citations} Citations</span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-900 mt-1 line-clamp-1">{pub.title}</h4>
                  <p className="text-xs text-slate-500">{pub.journal} • {pub.authors}</p>
                </div>
              ))}
            </div>
          )}

          {filteredConferences.length === 0 &&
            filteredSpeakers.length === 0 &&
            filteredSessions.length === 0 &&
            filteredPublications.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm">No scientific records matching "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Try searching by topic (e.g., PHB, Nanomedicine, Paris, Paris 2026, AI in Genomics)</p>
              </div>
            )}
        </div>

        {/* Search Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Navigate with <b>Tab</b> or click</span>
          <span>Press <b>ESC</b> to close</span>
        </div>
      </div>
    </div>
  );
};

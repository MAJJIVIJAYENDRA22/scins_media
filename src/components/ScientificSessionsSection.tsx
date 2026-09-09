import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Session } from '../types';
import { api } from '../services/api';
import { SESSIONS_20 } from '../data/initialData';
import { sortByStartTime } from '../utils/timeUtils';

interface ScientificSessionsSectionProps {
  conferenceId?: number;
  onSelectSession?: (session: Session) => void;
}

export const ScientificSessionsSection: React.FC<ScientificSessionsSectionProps> = ({
  conferenceId = 1,
  onSelectSession
}) => {
  const [sessions, setSessions] = useState<Session[]>(() => {
    // Initial hydration from local cache or seed data
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('scinsmedia_sessions_cache');
        if (cached) {
          const parsed: Session[] = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Safe fallback
      }
    }
    return SESSIONS_20;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionSearch, setSessionSearch] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(false);

  // Reset showAll if search term changes
  useEffect(() => {
    setShowAll(false);
  }, [sessionSearch]);

  // Load latest published sessions from backend database
  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getSessions({ conferenceId, publishedOnly: true });
      if (data && Array.isArray(data)) {
        setSessions(data);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('scinsmedia_sessions_cache', JSON.stringify(data));
          } catch {
            // Safe storage quota fallback
          }
        }
      }
    } catch {
      // Retain existing state if network call fails
    } finally {
      setIsLoading(false);
    }
  }, [conferenceId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Real-time synchronization: automatically updates when Admin Panel modifies sessions
  useEffect(() => {
    const handleSessionsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ sessions?: Session[] }>;
      if (customEvent.detail && Array.isArray(customEvent.detail.sessions)) {
        setSessions(customEvent.detail.sessions);
      } else {
        loadSessions();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'scinsmedia_sessions_cache' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setSessions(parsed);
          }
        } catch {
          // Safe fallback
        }
      }
    };

    window.addEventListener('scinsmedia:sessions_updated', handleSessionsUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('scinsmedia:sessions_updated', handleSessionsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadSessions]);

  // Strict status filter: ONLY published/active sessions appear on public website
  // Draft, unpublished, archived, or deleted sessions are strictly excluded
  const publishedSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchConf = !conferenceId || s.conference_id === conferenceId;
      const isPub =
        s.is_published !== false &&
        s.is_active !== false &&
        s.status !== 'draft' &&
        s.status !== 'unpublished' &&
        s.status !== 'archived' &&
        s.status !== 'deleted';
      return matchConf && isPub;
    });
  }, [sessions, conferenceId]);

  // Filtered sessions based strictly on title search, automatically sorted chronologically by Start Time
  const filteredSessions = useMemo(() => {
    const list = publishedSessions.filter(s => {
      const q = sessionSearch.trim().toLowerCase();
      return !q || s.title.toLowerCase().includes(q);
    });
    return sortByStartTime(list);
  }, [publishedSessions, sessionSearch]);

  // Show 8 sessions initially, or all when expanded
  const displayedSessions = useMemo(() => {
    return showAll ? filteredSessions : filteredSessions.slice(0, 8);
  }, [filteredSessions, showAll]);

  return (
    <section
      id="sessions-section"
      className="scroll-mt-20 py-14 sm:py-16 bg-slate-50 border-y border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: strictly "Scientific Sessions & Breakout Tracks" with no counts or badges */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
            Scientific Sessions & Breakout Tracks
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Peer-reviewed symposia, specialized breakout tracks, and oral research presentations across major disciplinary domains.
          </p>
        </div>

        {/* Dynamic Search */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs max-w-lg mx-auto mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={sessionSearch}
              onChange={e => setSessionSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Sessions Grid: 4 cols desktop (4x2 initially), 2 cols tablet, 1 col mobile */}
        {displayedSessions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
              {displayedSessions.map(session => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-[#0E7490] hover:shadow-xs transition-all p-3.5 sm:p-4 flex items-center min-h-[68px] sm:min-h-[76px] group"
                >
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#0E7490] leading-snug transition-colors">
                    {session.title}
                  </h3>
                </div>
              ))}
            </div>

            {/* View More: revealed only when more than 8 sessions exist */}
            {filteredSessions.length > 8 && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(prev => !prev)}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#0E7490] bg-white border border-slate-200 hover:border-[#0E7490] hover:text-[#0A2540] hover:shadow-xs transition-all cursor-pointer"
                >
                  {showAll ? 'View Less' : 'View More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-10 text-center bg-white rounded-xl border border-slate-200 shadow-xs max-w-lg mx-auto">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
            <div className="text-xs sm:text-sm font-bold text-slate-800">
              No sessions match your search criteria
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query.
            </p>
            {sessionSearch && (
              <button
                type="button"
                onClick={() => setSessionSearch('')}
                className="mt-3.5 px-4 py-1.5 bg-[#0A2540] text-white rounded-lg text-xs font-semibold hover:bg-[#0E7490] transition-colors cursor-pointer"
              >
                Reset Search
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

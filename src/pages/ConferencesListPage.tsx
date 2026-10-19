import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Conference } from '../types';
import { INITIAL_CONFERENCES } from '../data/initialData';
import { ConferenceCard } from '../components/ConferenceCard';
import {
  isConferenceUpcoming,
  isConferenceCompleted,
  sortConferencesDynamically
} from '../utils/dateUtils';

interface ConferencesListPageProps {
  conferences?: Conference[];
  onSelectConference?: (slug: string) => void;
  onNavigate?: (path: string) => void;
}

export const ConferencesListPage: React.FC<ConferencesListPageProps> = ({
  conferences = INITIAL_CONFERENCES,
  onSelectConference = (_slug: string) => {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Dynamically extract unique countries from existing conferences
  const countries = useMemo(() => {
    return Array.from(
      new Set(
        conferences
          .map(c => c.country?.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => (a as string).localeCompare(b as string)) as string[];
  }, [conferences]);

  // Combined filtering & dynamic date sorting logic
  const filteredConferences = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = conferences.filter(c => {
      // Only published conferences are visible in public directory
      if (c.status && c.status !== 'published') return false;

      // 1. Search Keywords filter (title, theme, city, country, short_title, domain)
      if (q) {
        const matchTitle = c.title?.toLowerCase().includes(q);
        const matchTheme = c.theme?.toLowerCase().includes(q);
        const matchCity = c.city?.toLowerCase().includes(q);
        const matchCountry = c.country?.toLowerCase().includes(q);
        const matchShortTitle = c.short_title?.toLowerCase().includes(q);
        const matchDomain = c.domain?.toLowerCase().includes(q);
        if (!matchTitle && !matchTheme && !matchCity && !matchCountry && !matchShortTitle && !matchDomain) {
          return false;
        }
      }

      // 2. Country filter
      if (selectedCountry !== 'All') {
        if ((c.country || '').trim().toLowerCase() !== selectedCountry.toLowerCase()) {
          return false;
        }
      }

      // 3. Status filter
      if (selectedStatus === 'upcoming') {
        if (!isConferenceUpcoming(c)) return false;
      } else if (selectedStatus === 'completed') {
        if (!isConferenceCompleted(c)) return false;
      }

      return true;
    });

    // Dynamic sort: Upcoming first (nearest start date), Ongoing next, Completed last (most recently completed first)
    return sortConferencesDynamically(filtered);
  }, [conferences, searchQuery, selectedCountry, selectedStatus]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCountry !== 'All' || selectedStatus !== 'All';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-[#0A2540] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-tr from-teal-900/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/80 inline-block">
              INTERNATIONAL ACADEMIC CALENDAR
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
              Global Scientific Conferences
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Discover peer-reviewed symposia, world congresses, and cross-border research forums scheduled across Europe, the Americas, Asia-Pacific, and the Middle East.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-3">
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCountry('All');
                  setSelectedStatus('All');
                }}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* 1. Search Keywords */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Title, keyword, city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
              />
            </div>
          </div>

          {/* 2. Country */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer"
            >
              <option value="All">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Status */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
        {filteredConferences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConferences.map(conf => (
              <ConferenceCard
                key={conf.id}
                conference={conf}
                onSelect={onSelectConference}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-display">No conferences found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filter parameters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};


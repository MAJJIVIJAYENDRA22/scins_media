import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Conference } from '../types';
import { INITIAL_CONFERENCES } from '../data/initialData';
import { ConferenceCard } from '../components/ConferenceCard';
import { parseConferenceDate, isConferenceCompleted, isConferenceOngoing } from '../utils/dateUtils';

interface ConferencesListPageProps {
  conferences?: Conference[];
  onSelectConference?: (slug: string) => void;
}

export const ConferencesListPage: React.FC<ConferencesListPageProps> = ({
  conferences = INITIAL_CONFERENCES,
  onSelectConference = (_slug: string) => {}
}) => {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'ongoing' | 'completed'>('all');

  // Real-time automatic counts based on conference database dates
  const ongoingCount = useMemo(() => {
    return conferences.filter(c => (c.status === 'published' || !c.status) && isConferenceOngoing(c)).length;
  }, [conferences]);

  const completedCount = useMemo(() => {
    return conferences.filter(c => (c.status === 'published' || !c.status) && isConferenceCompleted(c)).length;
  }, [conferences]);

  // Extract unique years from existing conferences data
  const years = Array.from(
    new Set(
      conferences.map(c => {
        const d = new Date(c.start_date);
        return isNaN(d.getFullYear()) ? c.start_date.split('-')[0] : String(d.getFullYear());
      })
    )
  )
    .filter(Boolean)
    .sort();

  const filtered = conferences
    .filter(c => {
      const matchesStatus = c.status === 'published' || !c.status;
      const matchesTimeline =
        timelineFilter === 'all' ||
        (timelineFilter === 'ongoing' && isConferenceOngoing(c)) ||
        (timelineFilter === 'completed' && isConferenceCompleted(c));
      const matchDomain = selectedDomain === 'All' || c.domain.toLowerCase().includes(selectedDomain.toLowerCase());
      const matchCountry = selectedCountry === 'All' || c.country.toLowerCase().includes(selectedCountry.toLowerCase());
      const matchMode = selectedMode === 'All' || c.mode.toLowerCase() === selectedMode.toLowerCase();
      const matchYear = selectedYear === 'All' || c.start_date.startsWith(selectedYear);
      const matchQuery = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesTimeline && matchDomain && matchCountry && matchMode && matchQuery && matchYear;
    })
    .sort((a, b) => {
      return parseConferenceDate(a.start_date) - parseConferenceDate(b.start_date);
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-[#0A2540] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-tr from-teal-900/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/80 inline-block">
              International Academic Calendar
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
              Global Scientific Conferences
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Discover peer-reviewed symposia, world congresses, and cross-border research forums scheduled across Europe, the Americas, Asia-Pacific, and the Middle East.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Title, keyword, city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Research Domain</label>
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-colors cursor-pointer"
            >
              <option value="All">All Domains</option>
              <option value="Biotechnology">Biotechnology</option>
              <option value="Nanomedicine">Nanomedicine</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Green Chemistry">Green Chemistry</option>
              <option value="Quantum Physics">Quantum Physics</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Country</label>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-colors cursor-pointer"
            >
              <option value="All">All Countries</option>
              <option value="France">France</option>
              <option value="United States">United States</option>
              <option value="Switzerland">Switzerland</option>
              <option value="Japan">Japan</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Format</label>
            <select
              value={selectedMode}
              onChange={e => setSelectedMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-colors cursor-pointer"
            >
              <option value="All">All Formats</option>
              <option value="hybrid">Hybrid</option>
              <option value="in-person">In-Person</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Year</label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-colors cursor-pointer"
            >
              <option value="All">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ongoing & Completed Timeline Filter Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-3 -mt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTimelineFilter(prev => prev === 'ongoing' ? 'all' : 'ongoing')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                timelineFilter === 'ongoing'
                  ? 'bg-teal-800 text-white shadow-xs ring-2 ring-teal-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-teal-900 border border-slate-200/90 shadow-2xs'
              }`}
              title="Show conferences scheduled for today or in the future"
            >
              <span className={`w-2 h-2 rounded-full ${timelineFilter === 'ongoing' ? 'bg-emerald-300 animate-pulse' : 'bg-emerald-500'}`} />
              <span>Ongoing</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                timelineFilter === 'ongoing' ? 'bg-teal-900/60 text-teal-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {ongoingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTimelineFilter(prev => prev === 'completed' ? 'all' : 'completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                timelineFilter === 'completed'
                  ? 'bg-slate-800 text-white shadow-xs ring-2 ring-slate-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 shadow-2xs'
              }`}
              title="Show conferences whose dates have already passed"
            >
              <span className={`w-2 h-2 rounded-full ${timelineFilter === 'completed' ? 'bg-slate-300' : 'bg-slate-400'}`} />
              <span>Completed</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                timelineFilter === 'completed' ? 'bg-slate-900/60 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {completedCount}
              </span>
            </button>

            {timelineFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setTimelineFilter('all')}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
              >
                Reset to All
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <b className="text-slate-900">{filtered.length}</b> {filtered.length === 1 ? 'conference' : 'conferences'}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(conf => (
            <ConferenceCard
              key={conf.id}
              conference={conf}
              onSelect={onSelectConference}
            />
          ))}
        </div>

        {filtered.length === 0 && (
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

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Conference } from '../types';
import { INITIAL_CONFERENCES } from '../data/initialData';
import { ConferenceCard } from '../components/ConferenceCard';

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
      const matchDomain = selectedDomain === 'All' || c.domain.toLowerCase().includes(selectedDomain.toLowerCase());
      const matchCountry = selectedCountry === 'All' || c.country.toLowerCase().includes(selectedCountry.toLowerCase());
      const matchMode = selectedMode === 'All' || c.mode.toLowerCase() === selectedMode.toLowerCase();
      const matchYear = selectedYear === 'All' || c.start_date.startsWith(selectedYear);
      const matchQuery = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchDomain && matchCountry && matchMode && matchQuery && matchYear;
    })
    .sort((a, b) => {
      const orderA = a.display_order ?? 999;
      const orderB = b.display_order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime();
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

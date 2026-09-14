import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Speaker } from '../types';
import { SPEAKERS } from '../data/initialData';

interface SpeakersDirectoryPageProps {
  speakers?: Speaker[];
  onSelectConference?: (slug: string) => void;
}

export const SpeakersDirectoryPage: React.FC<SpeakersDirectoryPageProps> = ({
  speakers = SPEAKERS,
  onSelectConference = (_slug: string) => {}
}) => {
  const [query, setQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  const filtered = speakers.filter(s => {
    const matchDomain = selectedDomain === 'All' || s.research_domain.toLowerCase().includes(selectedDomain.toLowerCase());
    const matchQuery =
      !query ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.institution.toLowerCase().includes(query.toLowerCase()) ||
      s.presentation_title?.toLowerCase().includes(query.toLowerCase());
    return matchDomain && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="bg-[#0A2540] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-tr from-teal-900/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/80 inline-block">
              International Academic Faculty
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
              Global Speakers Directory
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Meet world-renowned researchers, Nobel laureates, university department chairs, and pioneering industrial scientists speaking at Scinsmedia congresses.
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Search Speakers</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by speaker name, university, or talk topic..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#0E7490] focus:ring-1 focus:ring-[#0E7490] transition-colors"
              />
            </div>
          </div>

          <div className="sm:w-64">
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
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(spk => (
            <div
              key={spk.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-[#0E7490] hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={spk.photo_url}
                    alt={spk.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0A2540]/85 text-white px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/10">
                      {spk.speaker_type}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900 font-display">{spk.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{spk.institution} • {spk.country}</p>
                  {spk.presentation_title && (
                    <p className="text-xs text-[#0E7490] italic line-clamp-2 pt-1 font-medium">
                      "{spk.presentation_title}"
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectConference('biopolymers-bioplastics-2026')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-[#0E7490] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  View Conference Schedule →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-display">No speakers found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filter parameters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

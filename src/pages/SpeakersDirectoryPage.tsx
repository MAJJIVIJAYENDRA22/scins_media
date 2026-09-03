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
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              International Academic Faculty
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white">
              Global Keynote & Plenary Speakers
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Meet world-renowned researchers, Nobel laureates, university department chairs, and pioneering industrial scientists delivering keynote sessions at Scinsmedia congresses.
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by speaker name, university, or talk topic..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="sm:w-64">
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
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
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-teal-500 hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={spk.photo_url}
                    alt={spk.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      {spk.speaker_type}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{spk.name}</h3>
                  <p className="text-xs text-slate-500">{spk.institution} • {spk.country}</p>
                  {spk.presentation_title && (
                    <p className="text-xs text-teal-800 italic line-clamp-2 pt-1 font-medium">
                      "{spk.presentation_title}"
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectConference('biopolymers-bioplastics-2026')}
                  className="w-full py-2 bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-900 rounded-xl text-xs font-semibold transition-colors"
                >
                  View Conference Schedule →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

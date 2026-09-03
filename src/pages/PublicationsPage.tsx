import React, { useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { Publication } from '../types';
import { PUBLICATIONS } from '../data/initialData';

interface PublicationsPageProps {
  publications?: Publication[];
  onNavigate: (path: string) => void;
}

export const PublicationsPage: React.FC<PublicationsPageProps> = ({ publications = PUBLICATIONS }) => {
  const [query, setQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState('All');

  const filtered = publications.filter(p => {
    const matchJournal = selectedJournal === 'All' || p.journal.toLowerCase().includes(selectedJournal.toLowerCase());
    const matchQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authors.toLowerCase().includes(query.toLowerCase()) ||
      p.doi.toLowerCase().includes(query.toLowerCase());
    return matchJournal && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              Scopus & Elsevier Indexed Proceedings
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white">
              Scientific Publications & DOI Vault
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Access peer-reviewed conference proceedings, open-access journal articles, and citation records indexed across international scientific databases.
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by paper title, author, or DOI (e.g., 10.1016/j.polymdegradstab)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="sm:w-72">
            <select
              value={selectedJournal}
              onChange={e => setSelectedJournal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Scientific Journals</option>
              <option value="Polymer Degradation">Polymer Degradation & Stability (Elsevier)</option>
              <option value="Nanomedicine">Nanomedicine: Nanotechnology, Biology</option>
              <option value="Artificial Intelligence in Medicine">AI in Medicine (Elsevier)</option>
              <option value="Nature Materials">Nature Materials (Partner Track)</option>
            </select>
          </div>
        </div>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(pub => (
            <div
              key={pub.id}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded">
                    DOI: {pub.doi}
                  </span>
                  <span className="text-slate-500 font-semibold">{pub.journal} ({pub.year || pub.publication_date?.slice(0, 4) || '2026'})</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium">
                  Authors: {pub.authors}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                    {pub.citations} Citations
                  </span>
                  <span>Peer-Reviewed Proceedings</span>
                </div>

                <a
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 hover:bg-teal-600 text-white rounded-xl font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <span>Access via DOI / Elsevier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

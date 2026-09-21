import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  BookOpen,
  FileText
} from 'lucide-react';
import { Publication } from '../types';
import { PUBLICATIONS } from '../data/initialData';
import { api } from '../services/api';

interface PublicationsPageProps {
  publications?: Publication[];
  onNavigate?: (path: string) => void;
}

export const PublicationsPage: React.FC<PublicationsPageProps> = ({
  publications: initialPublications = PUBLICATIONS,
  onNavigate = (_path: string) => {}
}) => {
  const [publicationsList, setPublicationsList] = useState<Publication[]>(initialPublications);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState('All');

  // Synchronize when parent publications prop updates
  useEffect(() => {
    if (initialPublications && initialPublications.length >= 0) {
      setPublicationsList(initialPublications);
    }
  }, [initialPublications]);

  // Fetch real publications from API
  const fetchPubs = async () => {
    setLoading(true);
    try {
      const data = await api.getPublications();
      if (Array.isArray(data)) {
        setPublicationsList(data);
      }
    } catch (err) {
      console.warn('API getPublications fallback notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPubs();

    const handlePublicationsUpdated = () => {
      fetchPubs();
    };

    window.addEventListener('scinsmedia:publications_updated', handlePublicationsUpdated);
    window.addEventListener('storage', handlePublicationsUpdated);

    return () => {
      window.removeEventListener('scinsmedia:publications_updated', handlePublicationsUpdated);
      window.removeEventListener('storage', handlePublicationsUpdated);
    };
  }, []);

  // Extract unique journals from current publications list
  const availableJournals = Array.from(
    new Set(publicationsList.map(p => p.journal).filter(Boolean))
  );

  const filtered = publicationsList.filter(p => {
    const matchJournal = selectedJournal === 'All' || p.journal.toLowerCase().includes(selectedJournal.toLowerCase());
    const matchQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authors.toLowerCase().includes(query.toLowerCase()) ||
      (p.research_domain && p.research_domain.toLowerCase().includes(query.toLowerCase()));
    return matchJournal && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Banner */}
        <div className="bg-[#0A2540] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-tr from-teal-900/30 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/80 inline-block font-mono">
                Scopus & Elsevier Indexed Proceedings
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
                Scientific Publications & Proceedings
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Access peer-reviewed conference proceedings, open-access journal articles, and citation records indexed across international scientific databases.
              </p>
            </div>

            <div className="text-xs font-mono text-teal-200 bg-teal-950/60 border border-teal-800/60 px-4 py-2.5 rounded-2xl flex items-center space-x-2 self-start md:self-auto">
              <BookOpen className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{publicationsList.length} Indexed Works</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Search Articles & Authors
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by paper title, author, or research domain..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors"
              />
            </div>
          </div>

          <div className="sm:w-80">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Indexed Journal
            </label>
            <select
              value={selectedJournal}
              onChange={e => setSelectedJournal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-colors cursor-pointer font-medium"
            >
              <option value="All">All Scientific Journals ({publicationsList.length})</option>
              {availableJournals.map(journal => (
                <option key={journal} value={journal}>{journal}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(pub => (
            <div
              key={pub.id}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 hover:border-teal-600 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded text-[11px]">
                    {pub.research_domain || 'Indexed Article'}
                  </span>
                  <span className="text-slate-600 font-semibold text-[11px]">
                    {pub.journal} ({pub.year || (pub.publication_date ? pub.publication_date.substring(0, 4) : '2026')})
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium">
                  Authors: <span className="text-slate-800">{pub.authors}</span>
                </p>

                {pub.abstract_summary && (
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {pub.abstract_summary}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px]">
                    {pub.citations || 0} Citations
                  </span>
                  <span className="text-[11px] text-slate-500">Peer-Reviewed</span>
                </div>

                {pub.pdf_url && (
                  <a
                    href={pub.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-[#0A2540] hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>Full Article</span>
                    <ExternalLink className="w-3 h-3 text-teal-400" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-display">No publications found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filter parameters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

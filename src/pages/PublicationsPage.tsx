import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  BookOpen,
  Plus,
  CheckCircle2,
  Filter,
  FileText,
  Bookmark,
  Sparkles,
  X
} from 'lucide-react';
import { Publication } from '../types';
import { PUBLICATIONS } from '../data/initialData';
import { api } from '../services/api';

interface PublicationsPageProps {
  publications?: Publication[];
  onNavigate: (path: string) => void;
}

export const PublicationsPage: React.FC<PublicationsPageProps> = ({
  publications: initialPublications = PUBLICATIONS,
  onNavigate = (_path: string) => {}
}) => {
  const [publicationsList, setPublicationsList] = useState<Publication[]>(initialPublications);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // New Publication Form
  const [newTitle, setNewTitle] = useState('');
  const [newAuthors, setNewAuthors] = useState('');
  const [newJournal, setNewJournal] = useState('Journal of Advanced Biotechnology & Macromolecules');
  const [newDoi, setNewDoi] = useState('');
  const [newYear, setNewYear] = useState(2026);
  const [newAbstract, setNewAbstract] = useState('');

  // Fetch real publications from API
  useEffect(() => {
    let mounted = true;
    const fetchPubs = async () => {
      setLoading(true);
      try {
        const data = await api.getPublications();
        if (mounted && data && data.length > 0) {
          setPublicationsList(data);
        }
      } catch (err) {
        console.warn('API getPublications fallback to local list:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPubs();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreatePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthors.trim()) return;

    setSubmitting(true);
    try {
      const payload: Partial<Publication> = {
        title: newTitle.trim(),
        authors: newAuthors.trim(),
        journal: newJournal,
        doi: newDoi.trim() || `10.1016/j.scins.${Date.now().toString().slice(-6)}`,
        year: Number(newYear) || 2026,
        citations: 0,
        pdf_url: 'https://scinsmedia.com/proceedings/sample-paper.pdf'
      };

      const created = await api.createPublication(payload);
      setPublicationsList(prev => [created, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setSubmitSuccess(false);
        setNewTitle('');
        setNewAuthors('');
        setNewDoi('');
        setNewAbstract('');
      }, 1500);
    } catch (err) {
      console.warn('Failed to create publication on server:', err);
      // Fallback local append
      const localNew: Publication = {
        id: Date.now(),
        title: newTitle.trim(),
        authors: newAuthors.trim(),
        journal: newJournal,
        research_domain: 'Biotechnology & Advanced Sciences',
        publication_date: `${newYear}-01-15`,
        doi: newDoi.trim() || `10.1016/j.scins.${Date.now().toString().slice(-6)}`,
        year: Number(newYear) || 2026,
        abstract_summary: newAbstract || 'Peer-reviewed international conference proceedings article.',
        indexed_in: 'Scopus, Elsevier, Web of Science Core Collection',
        citations: 0
      };
      setPublicationsList(prev => [localNew, ...prev]);
      setIsSubmitModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = publicationsList.filter(p => {
    const matchJournal = selectedJournal === 'All' || p.journal.toLowerCase().includes(selectedJournal.toLowerCase());
    const matchQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authors.toLowerCase().includes(query.toLowerCase()) ||
      p.doi.toLowerCase().includes(query.toLowerCase());
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
                Scientific Publications & DOI Vault
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Access peer-reviewed conference proceedings, open-access journal articles, and citation records indexed across international scientific databases with verifiable DOIs.
              </p>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 transition-all shadow-md self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Index New Publication</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
              Search Articles, Authors & DOIs
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by paper title, author, or DOI (e.g., 10.1016/j.polymdegradstab)..."
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
              <option value="Polymer">Polymer Degradation & Stability (Elsevier)</option>
              <option value="Nanomedicine">Nanomedicine: Nanotechnology, Biology</option>
              <option value="Artificial Intelligence">AI in Medicine & Health Systems</option>
              <option value="Biotechnology">Journal of Advanced Biotechnology</option>
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
                    DOI: {pub.doi}
                  </span>
                  <span className="text-slate-600 font-semibold text-[11px]">
                    {pub.journal} ({pub.year || '2026'})
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs text-slate-600 font-medium">
                  Authors: <span className="text-slate-800">{pub.authors}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px]">
                    {pub.citations || 0} Citations
                  </span>
                  <span className="text-[11px] text-slate-500">Peer-Reviewed</span>
                </div>

                <a
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-[#0A2540] hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>DOI Access</span>
                  <ExternalLink className="w-3 h-3 text-teal-400" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800 font-display">No publications found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filter parameters or search terms.</p>
          </div>
        )}
      </div>

      {/* Index Publication Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-teal-700" />
                <h3 className="text-base font-bold text-slate-900 font-display">Index New Publication / DOI</h3>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center space-x-3 text-teal-800 text-xs font-bold">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                <span>Publication indexed and synchronized with MySQL database successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleCreatePublication} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paper Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Biodegradable Thermoplastics for Biomedical Implants"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Authors</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Prof. Robert Langer, Dr. Henriette Dubois"
                    value={newAuthors}
                    onChange={e => setNewAuthors(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Journal</label>
                    <select
                      value={newJournal}
                      onChange={e => setNewJournal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-none"
                    >
                      <option value="Journal of Advanced Biotechnology">Journal of Adv. Biotechnology</option>
                      <option value="Polymer Degradation & Stability (Elsevier)">Polymer Degradation (Elsevier)</option>
                      <option value="Nanomedicine: Nanotechnology, Biology">Nanomedicine</option>
                      <option value="AI in Clinical Medicine">AI in Clinical Medicine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Publication Year</label>
                    <input
                      type="number"
                      value={newYear}
                      onChange={e => setNewYear(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Digital Object Identifier (DOI)</label>
                  <input
                    type="text"
                    placeholder="e.g., 10.1016/j.polymdegradstab.2026.10842"
                    value={newDoi}
                    onChange={e => setNewDoi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Indexing...' : 'Index Publication'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

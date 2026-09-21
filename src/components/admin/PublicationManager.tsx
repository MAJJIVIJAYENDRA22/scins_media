import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  X,
  Save,
  FileText,
  Bookmark,
  Building,
  Quote,
  Filter,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Publication, Conference } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface PublicationManagerProps {
  publications: Publication[];
  conferences: Conference[];
  onPublicationsChange: (updated: Publication[]) => void;
}

export const PublicationManager: React.FC<PublicationManagerProps> = ({
  publications,
  conferences,
  onPublicationsChange
}) => {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [conferenceFilter, setConferenceFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'citations' | 'title'>('date');

  // Modal for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Partial<Publication> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [deletingPublication, setDeletingPublication] = useState<Publication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Distinct domains from existing publications
  const availableDomains = useMemo(() => {
    const set = new Set<string>();
    publications.forEach(p => {
      if (p.research_domain) set.add(p.research_domain);
    });
    return ['All', ...Array.from(set).sort()];
  }, [publications]);

  // Filter and Sort
  const filteredPublications = useMemo(() => {
    let list = publications.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q) ||
        (p.abstract_summary && p.abstract_summary.toLowerCase().includes(q));

      const matchesDomain = domainFilter === 'All' || p.research_domain === domainFilter;
      const matchesConf =
        conferenceFilter === 'All' ||
        (conferenceFilter === 'none' && !p.conference_id) ||
        String(p.conference_id) === conferenceFilter;

      return matchesSearch && matchesDomain && matchesConf;
    });

    list.sort((a, b) => {
      if (sortBy === 'citations') {
        return (b.citations || 0) - (a.citations || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default: date desc
      return new Date(b.publication_date || 0).getTime() - new Date(a.publication_date || 0).getTime();
    });

    return list;
  }, [publications, search, domainFilter, conferenceFilter, sortBy]);

  // Aggregate Metrics
  const totalCitations = useMemo(() => {
    return publications.reduce((sum, p) => sum + (Number(p.citations) || 0), 0);
  }, [publications]);

  const uniqueJournalsCount = useMemo(() => {
    const journals = new Set(publications.map(p => p.journal.trim().toLowerCase()).filter(Boolean));
    return journals.size;
  }, [publications]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingPublication({
      title: '',
      authors: '',
      journal: '',
      research_domain: 'Biotechnology',
      conference_id: conferences.length > 0 ? conferences[0].id : undefined,
      conference_name: conferences.length > 0 ? (conferences[0].short_title || conferences[0].title) : undefined,
      publication_date: new Date().toISOString().substring(0, 10),
      abstract_summary: '',
      pdf_url: '',
      citations: 0,
      indexed_in: 'Scopus, Web of Science, PubMed'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (pub: Publication) => {
    setEditingPublication({ ...pub });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!editingPublication?.title?.trim()) errs.title = 'Title is required';
    if (!editingPublication?.authors?.trim()) errs.authors = 'Authors are required';
    if (!editingPublication?.journal?.trim()) errs.journal = 'Journal name is required';
    if (!editingPublication?.research_domain?.trim()) errs.research_domain = 'Research domain is required';
    if (!editingPublication?.publication_date?.trim()) errs.publication_date = 'Publication date is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editingPublication) return;

    setIsSaving(true);
    try {
      const selectedConf = conferences.find(c => c.id === Number(editingPublication.conference_id));
      const confName = selectedConf ? (selectedConf.short_title || selectedConf.title) : editingPublication.conference_name;

      const payload: Partial<Publication> = {
        ...editingPublication,
        conference_id: editingPublication.conference_id ? Number(editingPublication.conference_id) : undefined,
        conference_name: confName,
        citations: Number(editingPublication.citations) || 0
      };
      delete payload.doi;

      if (editingPublication.id) {
        // UPDATE
        const updated = await api.updatePublication(editingPublication.id, payload);
        const newList = publications.map(p => (p.id === updated.id ? updated : p));
        onPublicationsChange(newList);
        showToast(`Updated publication: "${updated.title.substring(0, 40)}..."`);
      } else {
        // CREATE
        const created = await api.createPublication(payload);
        const newList = [created, ...publications];
        onPublicationsChange(newList);
        showToast(`Created publication: "${created.title.substring(0, 40)}..."`);
      }

      // Notify public views
      try {
        window.dispatchEvent(new CustomEvent('scinsmedia:publications_updated'));
      } catch {}

      setIsModalOpen(false);
      setEditingPublication(null);
    } catch (err: any) {
      console.error('Failed to save publication:', err);
      // Fallback local update if network fails in demo mode
      if (editingPublication.id) {
        const updatedLocal: Publication = {
          ...(editingPublication as Publication),
          citations: Number(editingPublication.citations) || 0
        };
        const newList = publications.map(p => (p.id === updatedLocal.id ? updatedLocal : p));
        onPublicationsChange(newList);
        showToast('Updated publication locally.');
      } else {
        const createdLocal: Publication = {
          id: Date.now(),
          title: editingPublication.title || 'Untitled',
          authors: editingPublication.authors || '',
          journal: editingPublication.journal || '',
          research_domain: editingPublication.research_domain || 'General',
          conference_id: editingPublication.conference_id ? Number(editingPublication.conference_id) : undefined,
          conference_name: editingPublication.conference_name,
          publication_date: editingPublication.publication_date || new Date().toISOString().substring(0, 10),
          abstract_summary: editingPublication.abstract_summary || '',
          pdf_url: editingPublication.pdf_url || '',
          citations: Number(editingPublication.citations) || 0,
          indexed_in: editingPublication.indexed_in || 'Scopus'
        };
        const newList = [createdLocal, ...publications];
        onPublicationsChange(newList);
        showToast('Created publication locally.');
      }
      try {
        window.dispatchEvent(new CustomEvent('scinsmedia:publications_updated'));
      } catch {}
      setIsModalOpen(false);
      setEditingPublication(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Publication
  const handleConfirmDelete = async () => {
    if (!deletingPublication) return;
    setIsDeleting(true);
    try {
      await api.deletePublication(deletingPublication.id);
      const newList = publications.filter(p => p.id !== deletingPublication.id);
      onPublicationsChange(newList);
      showToast(`Publication deleted successfully.`);

      try {
        window.dispatchEvent(new CustomEvent('scinsmedia:publications_updated'));
      } catch {}
    } catch (err) {
      console.error('Delete publication failed, updating local state:', err);
      const newList = publications.filter(p => p.id !== deletingPublication.id);
      onPublicationsChange(newList);
      showToast(`Publication removed.`);
      try {
        window.dispatchEvent(new CustomEvent('scinsmedia:publications_updated'));
      } catch {}
    } finally {
      setIsDeleting(false);
      setDeletingPublication(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-teal-800" />
            <span>Publications & Indexed Proceedings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full CRUD management for scientific journal papers and conference proceedings
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Publication</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Total Publications</span>
          <div className="text-2xl font-extrabold text-slate-900 font-display">{publications.length}</div>
          <span className="text-[10px] text-teal-700 font-semibold">Indexed in live database</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Total Citations</span>
          <div className="text-2xl font-extrabold text-teal-800 font-display">{totalCitations.toLocaleString()}</div>
          <span className="text-[10px] text-teal-700 font-semibold">Across all papers</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Unique Journals</span>
          <div className="text-2xl font-extrabold text-slate-900 font-display">{uniqueJournalsCount}</div>
          <span className="text-[10px] text-slate-500">Peer-reviewed outlets</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Active Domains</span>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {availableDomains.filter(d => d !== 'All').length}
          </div>
          <span className="text-[10px] text-slate-500">Scientific disciplines</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by paper title, author, or journal..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Research Domain Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              {availableDomains.map(d => (
                <option key={d} value={d}>
                  Domain: {d}
                </option>
              ))}
            </select>
          </div>

          {/* Conference Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={conferenceFilter}
              onChange={e => setConferenceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 max-w-[200px]"
            >
              <option value="All">All Conferences</option>
              <option value="none">No Linked Conference</option>
              {conferences.map(c => (
                <option key={c.id} value={String(c.id)}>
                  {c.short_title || c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              <option value="date">Sort: Newest Date</option>
              <option value="citations">Sort: Most Citations</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredPublications.length}</strong> of{' '}
            <strong className="text-slate-800">{publications.length}</strong> publications
          </span>
          {(search || domainFilter !== 'All' || conferenceFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setDomainFilter('All');
                setConferenceFilter('All');
              }}
              className="text-teal-700 hover:text-teal-800 font-semibold"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Publications List */}
      {filteredPublications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No publications found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No papers match your search criteria. Try modifying your filters or add a new publication.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Publication</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPublications.map(pub => (
            <div
              key={pub.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-teal-300 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-[280px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold font-mono uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                      {pub.research_domain}
                    </span>
                    {pub.publication_date && (
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{pub.publication_date}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {pub.title}
                  </h3>

                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{pub.authors}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(pub)}
                    className="p-2 text-slate-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors border border-slate-200"
                    title="Edit Publication"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPublication(pub)}
                    className="p-2 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                    title="Delete Publication"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Journal, Conference & Indexing Metadata */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center space-x-1">
                  <Bookmark className="w-3.5 h-3.5 text-teal-700" />
                  <span className="font-medium text-slate-700">{pub.journal}</span>
                </div>

                {pub.conference_name && (
                  <div className="flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pub.conference_name}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <Quote className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-slate-800">{pub.citations || 0}</span>
                  <span>citations</span>
                </div>

                {pub.indexed_in && (
                  <div className="text-[11px] text-slate-400">
                    Indexed: <span className="font-medium text-slate-600">{pub.indexed_in}</span>
                  </div>
                )}

                {pub.pdf_url && (
                  <a
                    href={pub.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center space-x-1 text-teal-700 hover:text-teal-900 font-semibold"
                  >
                    <span>View Article</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Abstract Summary */}
              {pub.abstract_summary && (
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600 leading-relaxed italic line-clamp-3">
                  "{pub.abstract_summary}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Publication Modal */}
      {isModalOpen && editingPublication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-800">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {editingPublication.id ? 'Edit Publication' : 'Add New Publication'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingPublication.id
                      ? 'Update publication details, citation counts, and indexing metadata'
                      : 'Index a new scientific paper or proceedings document'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Publication Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingPublication.title || ''}
                  onChange={e => setEditingPublication({ ...editingPublication, title: e.target.value })}
                  placeholder="e.g. Enzymatic Hydrolysis and Complete Mineralization Kinetics..."
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 ${
                    formErrors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {formErrors.title && <p className="text-[11px] text-red-500 mt-1">{formErrors.title}</p>}
              </div>

              {/* Authors */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Authors <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingPublication.authors || ''}
                  onChange={e => setEditingPublication({ ...editingPublication, authors: e.target.value })}
                  placeholder="e.g. Dubois, H., Thorne, M., & Laurent, P."
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 ${
                    formErrors.authors ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                  }`}
                />
                {formErrors.authors && <p className="text-[11px] text-red-500 mt-1">{formErrors.authors}</p>}
              </div>

              {/* Grid 1: Journal & Research Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Journal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingPublication.journal || ''}
                    onChange={e => setEditingPublication({ ...editingPublication, journal: e.target.value })}
                    placeholder="e.g. Advanced Functional Materials"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 ${
                      formErrors.journal ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.journal && <p className="text-[11px] text-red-500 mt-1">{formErrors.journal}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Research Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingPublication.research_domain || ''}
                    onChange={e => setEditingPublication({ ...editingPublication, research_domain: e.target.value })}
                    placeholder="e.g. Biotechnology, Materials Science"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 ${
                      formErrors.research_domain ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.research_domain && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.research_domain}</p>
                  )}
                </div>
              </div>

              {/* Grid 2: Conference & Publication Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Linked Conference
                  </label>
                  <select
                    value={editingPublication.conference_id ? String(editingPublication.conference_id) : ''}
                    onChange={e => {
                      const id = e.target.value ? Number(e.target.value) : undefined;
                      const conf = conferences.find(c => c.id === id);
                      setEditingPublication({
                        ...editingPublication,
                        conference_id: id,
                        conference_name: conf ? (conf.short_title || conf.title) : undefined
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  >
                    <option value="">None (Independent Publication)</option>
                    {conferences.map(c => (
                      <option key={c.id} value={String(c.id)}>
                        {c.short_title || c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publication Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingPublication.publication_date || ''}
                    onChange={e => setEditingPublication({ ...editingPublication, publication_date: e.target.value })}
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 ${
                      formErrors.publication_date ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.publication_date && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.publication_date}</p>
                  )}
                </div>
              </div>

              {/* Citations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citation Count
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingPublication.citations ?? 0}
                  onChange={e => setEditingPublication({ ...editingPublication, citations: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 font-mono"
                />
              </div>

              {/* Indexed In & PDF URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Indexed In (Databases)
                  </label>
                  <input
                    type="text"
                    value={editingPublication.indexed_in || ''}
                    onChange={e => setEditingPublication({ ...editingPublication, indexed_in: e.target.value })}
                    placeholder="e.g. Scopus, Web of Science, PubMed"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PDF / Full-Text Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingPublication.pdf_url || ''}
                    onChange={e => setEditingPublication({ ...editingPublication, pdf_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              </div>

              {/* Abstract Summary */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Abstract Summary
                </label>
                <textarea
                  rows={4}
                  value={editingPublication.abstract_summary || ''}
                  onChange={e => setEditingPublication({ ...editingPublication, abstract_summary: e.target.value })}
                  placeholder="Provide an overview or abstract summary of the findings and methodology..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{editingPublication.id ? 'Save Changes' : 'Create Publication'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingPublication}
        title="Delete Publication"
        itemName={deletingPublication?.title || ''}
        itemType="Publication"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPublication(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

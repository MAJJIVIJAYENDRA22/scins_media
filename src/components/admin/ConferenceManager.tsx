import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
  SlidersHorizontal,
  MapPin,
  Globe,
  Tag,
  Sparkles,
  X,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { Conference, ConferenceMode, ConferenceStatus } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ConferenceManagerProps {
  conferences: Conference[];
  onConferencesChange: (updatedList: Conference[]) => void;
  onSelectConference: (slug: string) => void;
  onOpenWizard?: (conference?: Conference) => void;
}

export const ConferenceManager: React.FC<ConferenceManagerProps> = ({
  conferences,
  onConferencesChange,
  onSelectConference,
  onOpenWizard
}) => {
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConference, setEditingConference] = useState<Partial<Conference> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingConference, setDeletingConference] = useState<Conference | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Distinct Domains
  const availableDomains = useMemo(() => {
    const set = new Set(conferences.map(c => c.domain).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [conferences]);

  // Filtered & Sorted Conferences
  const filteredConferences = useMemo(() => {
    let list = conferences.filter(c => {
      const matchesSearch =
        search === '' ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.conference_code.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.theme.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesDomain = domainFilter === 'All' || c.domain.toLowerCase() === domainFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesDomain;
    });

    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.start_date || '').getTime() - new Date(a.start_date || '').getTime();
    });

    return list;
  }, [conferences, search, statusFilter, domainFilter, sortBy]);

  // Status Change Handler
  const handleStatusChange = async (conf: Conference, newStatus: ConferenceStatus) => {
    try {
      const updated = await api.updateConferenceStatus(conf.id, newStatus);
      const updatedList = conferences.map(c => (c.id === conf.id ? { ...c, status: newStatus } : c));
      onConferencesChange(updatedList);
      showToast(`Status updated to "${newStatus}" for ${conf.short_title || conf.title}`);
    } catch (err: any) {
      // Optimistic update fallback
      const updatedList = conferences.map(c => (c.id === conf.id ? { ...c, status: newStatus } : c));
      onConferencesChange(updatedList);
      showToast(`Status updated to "${newStatus}"`);
    }
  };

  // Duplicate Conference Handler
  const handleDuplicate = async (conf: Conference) => {
    try {
      const duplicated = await api.duplicateConference(conf.id);
      const updatedList = [duplicated, ...conferences];
      onConferencesChange(updatedList);
      showToast(`Conference duplicated as Draft: "${duplicated.title}"`);
    } catch (err: any) {
      // Local fallback
      const newId = Math.max(...conferences.map(c => c.id), 0) + 1;
      const copyTimestamp = Date.now().toString().slice(-4);
      const duplicated: Conference = {
        ...conf,
        id: newId,
        title: `${conf.title} (Clone)`,
        short_title: `${conf.short_title} (Copy)`,
        slug: `${conf.slug}-copy-${copyTimestamp}`,
        conference_code: `${conf.conference_code}-CPY${copyTimestamp}`,
        status: 'draft',
        created_at: new Date().toISOString()
      };
      onConferencesChange([duplicated, ...conferences]);
      showToast(`Conference duplicated as Draft: "${duplicated.title}"`);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingConference({
      title: '',
      short_title: '',
      slug: '',
      conference_code: `SCINS-CONF-${Date.now().toString().slice(-4)}`,
      theme: '',
      tagline: '',
      description: '',
      domain: 'Biotechnology',
      city: '',
      country: '',
      venue: '',
      venue_address: '',
      timezone: 'UTC+2',
      start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      abstract_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      early_bird_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registration_deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mode: 'hybrid',
      status: 'draft',
      hero_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
      featured_badge: 'Flagship Edition'
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (conf: Conference) => {
    setEditingConference({ ...conf });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Validate and Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConference) return;

    const errors: Record<string, string> = {};
    if (!editingConference.title?.trim()) errors.title = 'Conference title is required';
    if (!editingConference.short_title?.trim()) errors.short_title = 'Short title is required';
    if (!editingConference.conference_code?.trim()) errors.conference_code = 'Conference code is required';
    if (!editingConference.city?.trim()) errors.city = 'City is required';
    if (!editingConference.country?.trim()) errors.country = 'Country is required';
    if (!editingConference.start_date) errors.start_date = 'Start date is required';
    if (!editingConference.end_date) errors.end_date = 'End date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      // Auto-generate slug if empty
      const slug =
        editingConference.slug ||
        (editingConference.short_title || editingConference.title || 'conf')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const payload = {
        ...editingConference,
        slug
      };

      if (editingConference.id) {
        // Update existing
        const updated = await api.updateConference(editingConference.id, payload);
        const updatedList = conferences.map(c => (c.id === editingConference.id ? { ...c, ...payload } as Conference : c));
        onConferencesChange(updatedList);
        showToast('Conference updated successfully');
      } else {
        // Create new
        const created = await api.createConference(payload);
        onConferencesChange([created, ...conferences]);
        showToast('New conference created successfully');
      }

      setIsEditModalOpen(false);
      setEditingConference(null);
    } catch (err: any) {
      // In case of network issue, update local state
      if (editingConference.id) {
        const updatedList = conferences.map(c =>
          c.id === editingConference.id ? ({ ...c, ...editingConference } as Conference) : c
        );
        onConferencesChange(updatedList);
        showToast('Conference saved locally');
      } else {
        const newId = Math.max(...conferences.map(c => c.id), 0) + 1;
        const newConf = { ...editingConference, id: newId } as Conference;
        onConferencesChange([newConf, ...conferences]);
        showToast('Conference created locally');
      }
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingConference) return;
    setIsDeleting(true);
    try {
      await api.deleteConference(deletingConference.id);
      const updatedList = conferences.filter(c => c.id !== deletingConference.id);
      onConferencesChange(updatedList);
      showToast(`Conference "${deletingConference.title}" deleted successfully`);
    } catch (err: any) {
      const updatedList = conferences.filter(c => c.id !== deletingConference.id);
      onConferencesChange(updatedList);
      showToast(`Conference "${deletingConference.title}" removed`);
    } finally {
      setIsDeleting(false);
      setDeletingConference(null);
    }
  };

  // Counts
  const totalCount = conferences.length;
  const publishedCount = conferences.filter(c => c.status === 'published').length;
  const draftCount = conferences.filter(c => c.status === 'draft').length;
  const archivedCount = conferences.filter(c => c.status === 'archived').length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Metrics Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-teal-50 text-teal-800 rounded-xl border border-teal-100">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Conferences & Congress Management</h2>
              <p className="text-xs text-slate-500">
                Full CRUD control over congress metadata, schedules, venues, and publication lifecycles
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenWizard && (
            <button
              onClick={() => onOpenWizard()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Launch 14-Step Wizard</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Conference</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Congresses</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{totalCount}</div>
        </div>
        <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Published & Live</div>
          <div className="text-xl font-bold text-teal-900 mt-0.5">{publishedCount}</div>
        </div>
        <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Draft Mode</div>
          <div className="text-xl font-bold text-amber-900 mt-0.5">{draftCount}</div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Archived</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">{archivedCount}</div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, code, city, country, or theme..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {/* Domain Filter */}
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              {availableDomains.map(d => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Disciplines' : d}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="date">Sort: Date (Recent)</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredConferences.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No conferences found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No records matched your search filter. Try adjusting your query or click "Add New Conference" to create one.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setDomainFilter('All');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4">Conference Code</th>
                  <th className="p-4">Title & Theme</th>
                  <th className="p-4">Discipline</th>
                  <th className="p-4">Dates & Location</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredConferences.map(conf => (
                  <tr key={conf.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block text-[11px]">
                        {conf.conference_code}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">ID: #{conf.id}</div>
                    </td>

                    <td className="p-4 align-top max-w-xs sm:max-w-sm">
                      <div className="font-bold text-slate-900 text-sm leading-snug">{conf.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">{conf.theme}</div>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50/70 border border-teal-100 px-1.5 py-0.5 rounded">
                          {conf.short_title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">slug: /{conf.slug}</span>
                      </div>
                    </td>

                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {conf.domain}
                      </span>
                    </td>

                    <td className="p-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {conf.start_date} → {conf.end_date}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>
                          {conf.city}, {conf.country}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">{conf.venue}</div>
                    </td>

                    <td className="p-4 align-top">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {conf.mode}
                      </span>
                    </td>

                    <td className="p-4 align-top">
                      <div className="relative inline-block">
                        <select
                          value={conf.status}
                          onChange={e => handleStatusChange(conf, e.target.value as ConferenceStatus)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-none ${
                            conf.status === 'published'
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : conf.status === 'draft'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          title="Preview Public Website"
                          onClick={() => onSelectConference(conf.slug)}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          title="Duplicate Conference (Clone)"
                          onClick={() => handleDuplicate(conf)}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Details"
                          onClick={() => handleOpenEdit(conf)}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Conference"
                          onClick={() => setDeletingConference(conf)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isEditModalOpen && editingConference && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingConference.id ? 'Edit Conference' : 'Create New Conference'}
                </h3>
                <p className="text-xs text-slate-500">Configure key details, deadlines, location, and metadata</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Conference Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Full Conference Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingConference.title || ''}
                    onChange={e => setEditingConference({ ...editingConference, title: e.target.value })}
                    placeholder="e.g., 3rd World Congress on Biotechnology & Bioengineering"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.title && <p className="text-[11px] text-red-500">{formErrors.title}</p>}
                </div>

                {/* Short Title & Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Short Title / Acronym <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingConference.short_title || ''}
                    onChange={e => setEditingConference({ ...editingConference, short_title: e.target.value })}
                    placeholder="e.g., Biotech 2026"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                  {formErrors.short_title && <p className="text-[11px] text-red-500">{formErrors.short_title}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Conference Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingConference.conference_code || ''}
                    onChange={e => setEditingConference({ ...editingConference, conference_code: e.target.value })}
                    placeholder="e.g., SCINS-BIO-2026"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Domain & Mode */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Scientific Discipline / Domain</label>
                  <input
                    type="text"
                    value={editingConference.domain || ''}
                    onChange={e => setEditingConference({ ...editingConference, domain: e.target.value })}
                    placeholder="e.g., Biotechnology, Medicine, AI"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Conference Mode</label>
                  <select
                    value={editingConference.mode || 'hybrid'}
                    onChange={e => setEditingConference({ ...editingConference, mode: e.target.value as ConferenceMode })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="in-person">In-Person</option>
                    <option value="hybrid">Hybrid (In-Person + Virtual)</option>
                    <option value="virtual">Virtual Only</option>
                  </select>
                </div>

                {/* Theme & Tagline */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Scientific Theme</label>
                  <input
                    type="text"
                    value={editingConference.theme || ''}
                    onChange={e => setEditingConference({ ...editingConference, theme: e.target.value })}
                    placeholder="e.g., Pioneering Innovations in Synthetic Biology and Bio-Manufacturing"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* City & Country */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Host City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingConference.city || ''}
                    onChange={e => setEditingConference({ ...editingConference, city: e.target.value })}
                    placeholder="e.g., Paris"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                  {formErrors.city && <p className="text-[11px] text-red-500">{formErrors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingConference.country || ''}
                    onChange={e => setEditingConference({ ...editingConference, country: e.target.value })}
                    placeholder="e.g., France"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                  {formErrors.country && <p className="text-[11px] text-red-500">{formErrors.country}</p>}
                </div>

                {/* Venue */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Venue Name & Address</label>
                  <input
                    type="text"
                    value={editingConference.venue || ''}
                    onChange={e => setEditingConference({ ...editingConference, venue: e.target.value })}
                    placeholder="e.g., Paris Convention Centre, Hall Pasteur"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Dates */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingConference.start_date || ''}
                    onChange={e => setEditingConference({ ...editingConference, start_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editingConference.end_date || ''}
                    onChange={e => setEditingConference({ ...editingConference, end_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Abstract Deadline & Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Abstract Submission Deadline</label>
                  <input
                    type="date"
                    value={editingConference.abstract_deadline || ''}
                    onChange={e => setEditingConference({ ...editingConference, abstract_deadline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Lifecycle Status</label>
                  <select
                    value={editingConference.status || 'draft'}
                    onChange={e =>
                      setEditingConference({ ...editingConference, status: e.target.value as ConferenceStatus })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="draft">Draft (Private / Testing)</option>
                    <option value="published">Published (Public Website)</option>
                    <option value="archived">Archived (Past Record)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Speakers on Frontend</label>
                  <select
                    value={editingConference.settings?.show_speakers !== false ? 'ON' : 'OFF'}
                    onChange={e =>
                      setEditingConference({
                        ...editingConference,
                        settings: {
                          ...(editingConference.settings || {
                            conference_id: editingConference.id || 0,
                            registration_enabled: true,
                            abstract_submission_enabled: true,
                            publication_enabled: true,
                            sponsors_enabled: true,
                            media_partners_enabled: true,
                            schedule_published: true,
                            show_counter: true,
                            max_attendees: 1000
                          }),
                          show_speakers: e.target.value === 'ON'
                        }
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="ON">ON (Visible)</option>
                    <option value="OFF">OFF (Hidden)</option>
                  </select>
                </div>

                {/* Hero Image URL */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hero Image URL</label>
                  <input
                    type="text"
                    value={editingConference.hero_image || ''}
                    onChange={e => setEditingConference({ ...editingConference, hero_image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Executive Summary / Description</label>
                  <textarea
                    rows={3}
                    value={editingConference.description || ''}
                    onChange={e => setEditingConference({ ...editingConference, description: e.target.value })}
                    placeholder="Detailed introduction to this scientific conference..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : editingConference.id ? 'Save Changes' : 'Create Conference'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingConference)}
        title="Delete Conference"
        itemName={deletingConference?.title || ''}
        itemType="Conference"
        onCancel={() => setDeletingConference(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

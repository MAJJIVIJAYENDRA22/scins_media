import React, { useState, useMemo } from 'react';
import {
  Mic,
  Search,
  Plus,
  Edit2,
  Trash2,
  Building,
  MapPin,
  ExternalLink,
  CheckCircle2,
  X,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  Globe,
  FileText
} from 'lucide-react';
import { Speaker, Conference, SpeakerType } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface SpeakerManagerProps {
  speakers: Speaker[];
  conferences: Conference[];
  onSpeakersChange: (updated: Speaker[]) => void;
}

export const SpeakerManager: React.FC<SpeakerManagerProps> = ({
  speakers,
  conferences,
  onSpeakersChange
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'hindex' | 'type'>('order');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Partial<Speaker> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deletingSpeaker, setDeletingSpeaker] = useState<Speaker | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const availableTypes: (SpeakerType | 'All')[] = [
    'All',
    'Keynote',
    'Plenary',
    'Invited',
    'Featured',
    'Oral',
    'Poster'
  ];

  const filteredSpeakers = useMemo(() => {
    let list = speakers.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        s.name.toLowerCase().includes(q) ||
        s.institution.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        (s.presentation_title && s.presentation_title.toLowerCase().includes(q)) ||
        (s.research_domain && s.research_domain.toLowerCase().includes(q));

      const matchesType = typeFilter === 'All' || s.speaker_type === typeFilter;
      const isActive = s.is_active ?? true;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchesSearch && matchesType && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'hindex') return (b.h_index || 0) - (a.h_index || 0);
      if (sortBy === 'type') return a.speaker_type.localeCompare(b.speaker_type);
      return (a.display_order || 0) - (b.display_order || 0);
    });

    return list;
  }, [speakers, search, typeFilter, statusFilter, sortBy]);

  const handleToggleStatus = async (speaker: Speaker) => {
    const currentActive = speaker.is_active ?? true;
    const newActive = !currentActive;
    try {
      await api.toggleSpeakerStatus(speaker.id, newActive);
      const updated = speakers.map(s =>
        s.id === speaker.id ? { ...s, is_active: newActive, status: newActive ? 'active' : 'inactive' } : s
      );
      onSpeakersChange(updated);
      showToast(`${speaker.name} status updated to ${newActive ? 'Active' : 'Inactive'}`);
    } catch {
      const updated = speakers.map(s =>
        s.id === speaker.id ? { ...s, is_active: newActive, status: newActive ? 'active' : 'inactive' } : s
      );
      onSpeakersChange(updated);
      showToast(`${speaker.name} status updated`);
    }
  };

  const handleOpenCreate = () => {
    setEditingSpeaker({
      prefix: 'Prof.',
      name: '',
      designation: 'Chair of Molecular Biology',
      institution: '',
      country: 'France',
      speaker_type: 'Keynote',
      research_domain: 'Biotechnology & Genetics',
      presentation_title: '',
      presentation_abstract: '',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      biography: '',
      h_index: 38,
      citations_count: 4200,
      conference_id: conferences[0]?.id || 1,
      display_order: speakers.length + 1,
      is_active: true,
      status: 'active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (speaker: Speaker) => {
    setEditingSpeaker({ ...speaker });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;

    const errors: Record<string, string> = {};
    if (!editingSpeaker.name?.trim()) errors.name = 'Speaker name is required';
    if (!editingSpeaker.institution?.trim()) errors.institution = 'Institution is required';
    if (!editingSpeaker.presentation_title?.trim()) errors.presentation_title = 'Presentation title is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      if (editingSpeaker.id) {
        await api.updateSpeaker(editingSpeaker.id, editingSpeaker);
        const updated = speakers.map(s =>
          s.id === editingSpeaker.id ? ({ ...s, ...editingSpeaker } as Speaker) : s
        );
        onSpeakersChange(updated);
        showToast('Speaker profile updated successfully');
      } else {
        const created = await api.addSpeaker(editingSpeaker);
        onSpeakersChange([...speakers, created]);
        showToast('New speaker added successfully');
      }
      setIsModalOpen(false);
    } catch {
      if (editingSpeaker.id) {
        const updated = speakers.map(s =>
          s.id === editingSpeaker.id ? ({ ...s, ...editingSpeaker } as Speaker) : s
        );
        onSpeakersChange(updated);
        showToast('Speaker saved locally');
      } else {
        const newId = Math.max(...speakers.map(s => s.id), 0) + 1;
        const newSpk = { ...editingSpeaker, id: newId } as Speaker;
        onSpeakersChange([...speakers, newSpk]);
        showToast('Speaker created locally');
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSpeaker) return;
    setIsDeleting(true);
    try {
      await api.deleteSpeaker(deletingSpeaker.id);
      const updated = speakers.filter(s => s.id !== deletingSpeaker.id);
      onSpeakersChange(updated);
      showToast(`Speaker "${deletingSpeaker.name}" removed`);
    } catch {
      const updated = speakers.filter(s => s.id !== deletingSpeaker.id);
      onSpeakersChange(updated);
      showToast(`Speaker "${deletingSpeaker.name}" removed`);
    } finally {
      setIsDeleting(false);
      setDeletingSpeaker(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-semibold shadow-md flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-teal-50 text-teal-800 rounded-xl border border-teal-100">
            <Mic className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Keynote & Faculty Speakers</h2>
            <p className="text-xs text-slate-500">
              Manage plenary speakers, invited faculty, keynote lectures, talk abstracts, and metrics
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Speaker</span>
        </button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Speakers</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{speakers.length}</div>
        </div>
        <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Keynote / Plenary</div>
          <div className="text-xl font-bold text-teal-900 mt-0.5">
            {speakers.filter(s => s.speaker_type === 'Keynote' || s.speaker_type === 'Plenary').length}
          </div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Faculty</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">
            {speakers.filter(s => s.is_active ?? true).length}
          </div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Global Countries</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">
            {new Set(speakers.map(s => s.country)).size}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search speaker by name, institution, presentation title, or domain..."
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

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              {availableTypes.map(t => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Speaker Types' : `${t} Speakers`}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active & Featured</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="order">Sort: Display Order</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="hindex">Sort: H-Index (Highest)</option>
              <option value="type">Sort: Speaker Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredSpeakers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Mic className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No speakers found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No speaker matching this query was found. Click "Add New Speaker" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4">Speaker</th>
                  <th className="p-4">Type & Domain</th>
                  <th className="p-4">Presentation / Talk Title</th>
                  <th className="p-4">Affiliation</th>
                  <th className="p-4">Metrics</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredSpeakers.map(speaker => {
                  const isActive = speaker.is_active ?? true;
                  return (
                    <tr key={speaker.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={speaker.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={speaker.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-tight">
                              {speaker.prefix ? `${speaker.prefix} ` : ''}
                              {speaker.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{speaker.designation}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            speaker.speaker_type === 'Keynote'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : speaker.speaker_type === 'Plenary'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {speaker.speaker_type}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-1">{speaker.research_domain}</div>
                      </td>

                      <td className="p-4 align-top max-w-xs sm:max-w-sm">
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                          "{speaker.presentation_title || 'Keynote Presentation'}"
                        </div>
                        {speaker.presentation_abstract && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {speaker.presentation_abstract}
                          </div>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <div className="font-medium text-slate-900">{speaker.institution}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{speaker.country}</span>
                        </div>
                      </td>

                      <td className="p-4 align-top font-mono text-[11px]">
                        <div className="text-teal-800 font-bold">h-index: {speaker.h_index || 25}</div>
                        <div className="text-slate-500 text-[10px]">
                          {(speaker.citations_count || 1000).toLocaleString()} cites
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <button
                          onClick={() => handleToggleStatus(speaker)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            isActive
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="p-4 align-top text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            title="Edit Speaker"
                            onClick={() => handleOpenEdit(speaker)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Speaker"
                            onClick={() => setDeletingSpeaker(speaker)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingSpeaker.id ? 'Edit Speaker Profile' : 'Add New Speaker'}
                </h3>
                <p className="text-xs text-slate-500">Lecture title, speaker type, affiliations, and biography</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Prefix & Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Academic Prefix</label>
                  <select
                    value={editingSpeaker.prefix || 'Prof.'}
                    onChange={e => setEditingSpeaker({ ...editingSpeaker, prefix: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Prof.">Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Assoc. Prof.">Assoc. Prof.</option>
                    <option value="Prof. Dr.">Prof. Dr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSpeaker.name || ''}
                    onChange={e => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                    placeholder="e.g., Jennifer A. Doudna"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-red-500">{formErrors.name}</p>}
                </div>

                {/* Speaker Type & Domain */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Speaker Type / Session Role</label>
                  <select
                    value={editingSpeaker.speaker_type || 'Keynote'}
                    onChange={e =>
                      setEditingSpeaker({ ...editingSpeaker, speaker_type: e.target.value as SpeakerType })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Keynote">Keynote Speaker</option>
                    <option value="Plenary">Plenary Speaker</option>
                    <option value="Invited">Invited Speaker</option>
                    <option value="Featured">Featured Faculty</option>
                    <option value="Oral">Oral Presenter</option>
                    <option value="Poster">Poster Presenter</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Research Domain</label>
                  <input
                    type="text"
                    value={editingSpeaker.research_domain || ''}
                    onChange={e => setEditingSpeaker({ ...editingSpeaker, research_domain: e.target.value })}
                    placeholder="e.g., Synthetic Biology & Genome Editing"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Presentation Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Presentation / Keynote Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSpeaker.presentation_title || ''}
                    onChange={e => setEditingSpeaker({ ...editingSpeaker, presentation_title: e.target.value })}
                    placeholder="e.g., Next-Generation CRISPR Platforms for Precision Gene Therapeutics"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.presentation_title ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.presentation_title && (
                    <p className="text-[11px] text-red-500">{formErrors.presentation_title}</p>
                  )}
                </div>

                {/* Institution & Country */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Institution / University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSpeaker.institution || ''}
                    onChange={e => setEditingSpeaker({ ...editingSpeaker, institution: e.target.value })}
                    placeholder="e.g., UC Berkeley / IGI"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.institution ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.institution && <p className="text-[11px] text-red-500">{formErrors.institution}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country</label>
                  <input
                    type="text"
                    value={editingSpeaker.country || ''}
                    onChange={e => setEditingSpeaker({ ...editingSpeaker, country: e.target.value })}
                    placeholder="e.g., United States"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Photo URL & Preview */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Photo URL</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editingSpeaker.photo_url || ''}
                      onChange={e => setEditingSpeaker({ ...editingSpeaker, photo_url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                    />
                    <img
                      src={editingSpeaker.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                  </div>
                </div>

                {/* H-Index & Citations */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">h-index Metric</label>
                  <input
                    type="number"
                    value={editingSpeaker.h_index || 25}
                    onChange={e => setEditingSpeaker({ ...editingSpeaker, h_index: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Total Citations Count</label>
                  <input
                    type="number"
                    value={editingSpeaker.citations_count || 1500}
                    onChange={e =>
                      setEditingSpeaker({ ...editingSpeaker, citations_count: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Abstract */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Presentation Abstract Summary</label>
                  <textarea
                    rows={3}
                    value={editingSpeaker.presentation_abstract || ''}
                    onChange={e =>
                      setEditingSpeaker({ ...editingSpeaker, presentation_abstract: e.target.value })
                    }
                    placeholder="Summary of presentation objectives and clinical / scientific breakthroughs..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  <span>{isSaving ? 'Saving...' : editingSpeaker.id ? 'Save Changes' : 'Add Speaker'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingSpeaker)}
        title="Delete Speaker"
        itemName={deletingSpeaker?.name || ''}
        itemType="Speaker"
        onCancel={() => setDeletingSpeaker(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Save,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { Session, Conference } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { sortByStartTime } from '../../utils/timeUtils';

interface SessionManagerProps {
  sessions: Session[];
  conferences: Conference[];
  onSessionsChange: (updated: Session[]) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  sessions,
  conferences,
  onSessionsChange
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [conferenceFilter, setConferenceFilter] = useState<string>('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Partial<Session> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deletingSession, setDeletingSession] = useState<Session | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize state locally and broadcast event to any public page listening
  const notifySessionsChange = (updated: Session[]) => {
    const sorted = sortByStartTime(updated);
    onSessionsChange(sorted);
    try {
      localStorage.setItem('scinsmedia_sessions_cache', JSON.stringify(sorted));
      window.dispatchEvent(new CustomEvent('scinsmedia:sessions_updated', { detail: { sessions: sorted } }));
    } catch {
      // Storage quota or SSR safe
    }
  };

  // Filter sessions strictly by title search, conference, and status, automatically sorted chronologically by Start Time
  const filteredSessions = useMemo(() => {
    const filtered = sessions.filter(s => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || s.title.toLowerCase().includes(q);

      const matchesConf = conferenceFilter === 'All' || s.conference_id === Number(conferenceFilter);

      const isPub =
        s.is_published !== false &&
        s.status !== 'draft' &&
        s.status !== 'unpublished' &&
        s.status !== 'archived' &&
        s.status !== 'deleted';

      if (statusFilter === 'published') return matchesSearch && matchesConf && isPub;
      if (statusFilter === 'draft') return matchesSearch && matchesConf && !isPub;
      return matchesSearch && matchesConf;
    });

    // Automatic chronological sorting by Start Time (stable sort preserves order if times match)
    return sortByStartTime(filtered);
  }, [sessions, search, statusFilter, conferenceFilter]);

  // Publish / Unpublish Action (1-click)
  const handleTogglePublish = async (session: Session) => {
    const isCurrentlyPub =
      session.is_published !== false &&
      session.status !== 'draft' &&
      session.status !== 'unpublished' &&
      session.status !== 'archived';
    const nextPub = !isCurrentlyPub;
    const nextStatus = nextPub ? 'published' : 'draft';

    try {
      await api.toggleSessionStatus(session.id, nextStatus, true, nextPub);
      const updated = sessions.map(s =>
        s.id === session.id ? { ...s, is_published: nextPub, status: nextStatus } : s
      );
      notifySessionsChange(updated);
      showToast(`Session is now ${nextPub ? 'Published (Live on Website)' : 'Unpublished (Draft)'}`);
    } catch {
      const updated = sessions.map(s =>
        s.id === session.id ? { ...s, is_published: nextPub, status: nextStatus } : s
      );
      notifySessionsChange(updated);
      showToast(`Session status updated`);
    }
  };

  // Add Action: Open modal
  const handleOpenCreate = () => {
    const nextNum = sessions.length + 1;
    setEditingSession({
      title: '',
      status: 'published',
      is_published: true,
      is_active: true,
      start_time: '09:00',
      end_time: '10:00',
      session_code: `BIO-SES-${String(nextNum).padStart(2, '0')}`,
      conference_id: conferences[0]?.id || 1,
      track: 'Scientific Track',
      category: 'Oral',
      session_type: 'Oral Presentation',
      room: 'Auditorium'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Edit Action: Open modal
  const handleOpenEdit = (session: Session) => {
    setEditingSession({ ...session });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Save (Add / Edit) Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    const trimmedTitle = editingSession.title?.trim() || '';
    if (!trimmedTitle) {
      setFormErrors({ title: 'Session Title / Headline is required' });
      return;
    }

    setIsSaving(true);
    const isPub =
      editingSession.status !== 'draft' &&
      editingSession.status !== 'unpublished' &&
      editingSession.status !== 'archived';

    const payload: Partial<Session> = {
      ...editingSession,
      title: trimmedTitle,
      start_time: editingSession.start_time?.trim() || '09:00',
      end_time: editingSession.end_time?.trim() || '',
      is_published: editingSession.is_published !== undefined ? editingSession.is_published : isPub,
      status: editingSession.status || (isPub ? 'published' : 'draft')
    };

    try {
      if (editingSession.id) {
        await api.updateSession(editingSession.id, payload);
        const updated = sessions.map(s =>
          s.id === editingSession.id ? ({ ...s, ...payload } as Session) : s
        );
        notifySessionsChange(updated);
        showToast('Session updated successfully (automatically sorted by Start Time)');
      } else {
        const created = await api.addSession(payload);
        const updated = [...sessions, created];
        notifySessionsChange(updated);
        showToast('New session added (automatically sorted by Start Time)');
      }
      setIsModalOpen(false);
    } catch {
      if (editingSession.id) {
        const updated = sessions.map(s =>
          s.id === editingSession.id ? ({ ...s, ...payload } as Session) : s
        );
        notifySessionsChange(updated);
        showToast('Session updated');
      } else {
        const newId = Math.max(...sessions.map(s => s.id), 0) + 1;
        const newSes = { ...payload, id: newId } as Session;
        const updated = [...sessions, newSes];
        notifySessionsChange(updated);
        showToast('New session added');
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingSession) return;
    setIsDeleting(true);
    try {
      await api.deleteSession(deletingSession.id);
      const updated = sessions.filter(s => s.id !== deletingSession.id);
      notifySessionsChange(updated);
      showToast(`Session "${deletingSession.title}" deleted`);
    } catch {
      const updated = sessions.filter(s => s.id !== deletingSession.id);
      notifySessionsChange(updated);
      showToast(`Session removed`);
    } finally {
      setIsDeleting(false);
      setDeletingSession(null);
    }
  };

  const totalPublished = sessions.filter(
    s =>
      s.is_published !== false &&
      s.status !== 'draft' &&
      s.status !== 'unpublished' &&
      s.status !== 'archived'
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-teal-50 text-teal-800 rounded-xl border border-teal-100">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Program & Schedule Management</h2>
            <p className="text-xs text-slate-500">
              Manage scientific sessions and schedule items. Sessions are automatically arranged chronologically by Start Time.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Session</span>
        </button>
      </div>

      {/* Metric summary counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Sessions</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{sessions.length}</div>
        </div>
        <div className="p-3.5 bg-teal-50/60 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Published (Live)</div>
          <div className="text-xl font-bold text-teal-900 mt-0.5">{totalPublished}</div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Draft (Hidden)</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">{sessions.length - totalPublished}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by session title / headline..."
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
            value={conferenceFilter}
            onChange={e => setConferenceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
          >
            <option value="All">All Conferences</option>
            {conferences.map(c => (
              <option key={c.id} value={c.id}>
                {c.short_title || c.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500 sm:w-44"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published (Live on Website)</option>
            <option value="draft">Draft (Hidden from Website)</option>
          </select>
        </div>
      </div>

      {/* Sessions Management Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No sessions found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No sessions matched your criteria. Click "Add Session" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4 w-44">Scheduled Time</th>
                  <th className="p-4">Session Title / Headline</th>
                  <th className="p-4 w-44">Status & Visibility</th>
                  <th className="p-4 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredSessions.map((session) => {
                  const isPub =
                    session.is_published !== false &&
                    session.status !== 'draft' &&
                    session.status !== 'unpublished' &&
                    session.status !== 'archived';

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Scheduled Time (Auto Chronological Order) */}
                      <td className="p-4 align-middle whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-900 font-mono bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>
                            {session.start_time || '09:00'}
                            {session.end_time ? ` – ${session.end_time}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Session Title / Headline */}
                      <td className="p-4 align-middle">
                        <div className="font-bold text-slate-900 text-sm leading-snug">
                          {session.title}
                        </div>
                      </td>

                      {/* Publish / Unpublish Toggle */}
                      <td className="p-4 align-middle">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(session)}
                          title={isPub ? 'Click to unpublish (Set to Draft)' : 'Click to publish (Live on website)'}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-colors flex items-center space-x-1.5 cursor-pointer ${
                            isPub
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {isPub ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{isPub ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Edit & Delete Actions */}
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            title="Edit Session"
                            onClick={() => handleOpenEdit(session)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete Session"
                            onClick={() => setDeletingSession(session)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Add / Edit Modal: Session Title, Scheduled Time, and Publish Status (NO manual order field) */}
      {isModalOpen && editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  {editingSession.id ? 'Edit Session' : 'Add Scientific Session'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure session headline, schedule time, and website visibility
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Assigned Conference */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Assigned Conference <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingSession.conference_id || (conferences[0]?.id || 1)}
                  onChange={e => setEditingSession({ ...editingSession, conference_id: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                >
                  {conferences.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.short_title || c.title} ({c.conference_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Session Title / Headline */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Session Title / Headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingSession.title || ''}
                  onChange={e => setEditingSession({ ...editingSession, title: e.target.value })}
                  placeholder="e.g., Synthesis & Catalysis"
                  autoFocus
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none ${
                    formErrors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                  }`}
                />
                {formErrors.title && <p className="text-[11px] text-red-500 font-medium">{formErrors.title}</p>}
              </div>

              {/* Scheduled Time (Start Time & End Time - Automatic Chronological Order) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Start Time (Auto-Sorts)</span>
                  </label>
                  <input
                    type="text"
                    value={editingSession.start_time || ''}
                    onChange={e => setEditingSession({ ...editingSession, start_time: e.target.value })}
                    placeholder="e.g., 09:00 or 09:30 AM"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Chronological order is auto-calculated from this time.</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>End Time</span>
                  </label>
                  <input
                    type="text"
                    value={editingSession.end_time || ''}
                    onChange={e => setEditingSession({ ...editingSession, end_time: e.target.value })}
                    placeholder="e.g., 10:15 or 10:30 AM"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Optional session conclusion time.</p>
                </div>
              </div>

              {/* Publish Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Publish Status</label>
                <select
                  value={editingSession.status || (editingSession.is_published ? 'published' : 'draft')}
                  onChange={e => {
                    const val = e.target.value;
                    const isPub = val !== 'draft' && val !== 'archived' && val !== 'unpublished';
                    setEditingSession({ ...editingSession, status: val, is_published: isPub });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
                >
                  <option value="published">Published (Visible on Public Website)</option>
                  <option value="draft">Draft (Hidden from Public Website)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : editingSession.id ? 'Save Changes' : 'Add Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingSession)}
        title="Delete Scientific Session"
        itemName={deletingSession?.title || 'Session'}
        itemType="Session"
        onCancel={() => setDeletingSession(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  X,
  Save,
  Tag,
  BookOpen,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { Session, Conference } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

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
  const [trackFilter, setTrackFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'number' | 'time' | 'title' | 'track'>('number');

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

  const availableTracks = useMemo(() => {
    const set = new Set(sessions.map(s => s.track).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [sessions]);

  const availableTypes = useMemo(() => {
    const set = new Set(sessions.map(s => s.session_type).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    let list = sessions.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        s.title.toLowerCase().includes(q) ||
        s.session_code.toLowerCase().includes(q) ||
        s.track.toLowerCase().includes(q) ||
        (s.room && s.room.toLowerCase().includes(q)) ||
        (s.chairperson && s.chairperson.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q));

      const matchesTrack = trackFilter === 'All' || s.track === trackFilter;
      const matchesType = typeFilter === 'All' || s.session_type === typeFilter;
      const matchesStatus = statusFilter === 'All' || (s.status || 'scheduled') === statusFilter;

      return matchesSearch && matchesTrack && matchesType && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'track') return a.track.localeCompare(b.track);
      if (sortBy === 'time') return (a.start_time || '').localeCompare(b.start_time || '');
      return (a.session_number || a.id) - (b.session_number || b.id);
    });

    return list;
  }, [sessions, search, trackFilter, typeFilter, statusFilter, sortBy]);

  const handleStatusChange = async (session: Session, newStatus: string) => {
    try {
      await api.toggleSessionStatus(session.id, newStatus);
      const updated = sessions.map(s => (s.id === session.id ? { ...s, status: newStatus } : s));
      onSessionsChange(updated);
      showToast(`Session ${session.session_code} status set to "${newStatus}"`);
    } catch {
      const updated = sessions.map(s => (s.id === session.id ? { ...s, status: newStatus } : s));
      onSessionsChange(updated);
      showToast(`Session status updated`);
    }
  };

  const handleOpenCreate = () => {
    const nextNum = sessions.length + 1;
    setEditingSession({
      session_number: nextNum,
      session_code: `BIO-SES-${String(nextNum).padStart(2, '0')}`,
      title: '',
      track: 'Synthetic Biology & Metabolic Engineering',
      category: 'Oral Presentations',
      session_type: 'Oral Presentation',
      session_date: '2026-06-22',
      start_time: '10:00',
      end_time: '11:30',
      room: 'Auditorium Pasteur A',
      chairperson: 'Prof. Claire Laurent, Ph.D.',
      speaker_name: 'Invited Faculty & Oral Presenters',
      description: '',
      status: 'scheduled',
      is_active: true,
      conference_id: conferences[0]?.id || 1,
      display_order: nextNum
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (session: Session) => {
    setEditingSession({ ...session });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    const errors: Record<string, string> = {};
    if (!editingSession.title?.trim()) errors.title = 'Session title is required';
    if (!editingSession.session_code?.trim()) errors.session_code = 'Session code is required';
    if (!editingSession.track?.trim()) errors.track = 'Scientific track is required';
    if (!editingSession.room?.trim()) errors.room = 'Room / Hall is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      if (editingSession.id) {
        await api.updateSession(editingSession.id, editingSession);
        const updated = sessions.map(s =>
          s.id === editingSession.id ? ({ ...s, ...editingSession } as Session) : s
        );
        onSessionsChange(updated);
        showToast('Session updated successfully');
      } else {
        const created = await api.addSession(editingSession);
        onSessionsChange([...sessions, created]);
        showToast('New scientific session created');
      }
      setIsModalOpen(false);
    } catch {
      if (editingSession.id) {
        const updated = sessions.map(s =>
          s.id === editingSession.id ? ({ ...s, ...editingSession } as Session) : s
        );
        onSessionsChange(updated);
        showToast('Session saved locally');
      } else {
        const newId = Math.max(...sessions.map(s => s.id), 0) + 1;
        const newSes = { ...editingSession, id: newId } as Session;
        onSessionsChange([...sessions, newSes]);
        showToast('Session created locally');
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSession) return;
    setIsDeleting(true);
    try {
      await api.deleteSession(deletingSession.id);
      const updated = sessions.filter(s => s.id !== deletingSession.id);
      onSessionsChange(updated);
      showToast(`Session ${deletingSession.session_code} deleted`);
    } catch {
      const updated = sessions.filter(s => s.id !== deletingSession.id);
      onSessionsChange(updated);
      showToast(`Session ${deletingSession.session_code} removed`);
    } finally {
      setIsDeleting(false);
      setDeletingSession(null);
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
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Scientific Sessions & Tracks</h2>
            <p className="text-xs text-slate-500">
              Manage scientific session schedules, hall assignments, chairpersons, and presentation tracks
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Scientific Session</span>
        </button>
      </div>

      {/* Metric counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Sessions</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{sessions.length}</div>
        </div>
        <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Scientific Tracks</div>
          <div className="text-xl font-bold text-teal-900 mt-0.5">
            {new Set(sessions.map(s => s.track)).size}
          </div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Scheduled Halls</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">
            {new Set(sessions.map(s => s.room)).size}
          </div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Confirmed Chairs</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">
            {new Set(sessions.map(s => s.chairperson).filter(Boolean)).size}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search session code, title, track, room, or chairperson..."
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
              value={trackFilter}
              onChange={e => setTrackFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500 max-w-[160px] truncate"
            >
              {availableTracks.map(t => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Tracks' : t}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              {availableTypes.map(t => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Session Types' : t}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live / In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="number">Sort: Session #</option>
              <option value="time">Sort: Start Time</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="track">Sort: Track</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No scientific sessions found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No sessions matched your criteria. Click "Add Scientific Session" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4">Code & Number</th>
                  <th className="p-4">Session Title & Track</th>
                  <th className="p-4">Timing & Room</th>
                  <th className="p-4">Session Chair</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredSessions.map(session => (
                  <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block text-[11px]">
                        {session.session_code}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Session #{session.session_number || session.id}
                      </div>
                    </td>

                    <td className="p-4 align-top max-w-xs sm:max-w-sm">
                      <div className="font-bold text-slate-900 text-sm leading-snug">{session.title}</div>
                      <div className="text-[11px] text-teal-800 font-semibold mt-1 flex items-center space-x-1">
                        <Tag className="w-3 h-3 flex-shrink-0" />
                        <span>{session.track}</span>
                      </div>
                      {session.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {session.description}
                        </div>
                      )}
                    </td>

                    <td className="p-4 align-top">
                      <div className="font-semibold text-slate-900 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{session.room || 'Auditorium Pasteur'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {session.session_date || 'Day 1'}
                      </div>
                    </td>

                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-900 flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{session.chairperson || 'Prof. Claire Laurent'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Session Chair</div>
                    </td>

                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {session.session_type || 'Oral Presentation'}
                      </span>
                    </td>

                    <td className="p-4 align-top">
                      <select
                        value={session.status || 'scheduled'}
                        onChange={e => handleStatusChange(session, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-none ${
                          session.status === 'live'
                            ? 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                            : session.status === 'completed'
                            ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            : session.status === 'cancelled'
                            ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                            : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                        }`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live Now</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          title="Edit Session"
                          onClick={() => handleOpenEdit(session)}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Session"
                          onClick={() => setDeletingSession(session)}
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
      {isModalOpen && editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingSession.id ? 'Edit Scientific Session' : 'Add New Session'}
                </h3>
                <p className="text-xs text-slate-500">Track name, room allocation, chair, and timing schedule</p>
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
                {/* Session Code & Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Session Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSession.session_code || ''}
                    onChange={e => setEditingSession({ ...editingSession, session_code: e.target.value })}
                    placeholder="e.g., BIO-SES-01"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.session_code ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.session_code && <p className="text-[11px] text-red-500">{formErrors.session_code}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Session Number</label>
                  <input
                    type="number"
                    value={editingSession.session_number || 1}
                    onChange={e => setEditingSession({ ...editingSession, session_number: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Session Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Session Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSession.title || ''}
                    onChange={e => setEditingSession({ ...editingSession, title: e.target.value })}
                    placeholder="e.g., Synthetic Biology, Enzyme Design & Genome Synthesis"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.title && <p className="text-[11px] text-red-500">{formErrors.title}</p>}
                </div>

                {/* Track & Session Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Scientific Track <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSession.track || ''}
                    onChange={e => setEditingSession({ ...editingSession, track: e.target.value })}
                    placeholder="e.g., Synthetic Biology & Metabolic Engineering"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.track ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.track && <p className="text-[11px] text-red-500">{formErrors.track}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Session Type</label>
                  <select
                    value={editingSession.session_type || 'Oral Presentation'}
                    onChange={e => setEditingSession({ ...editingSession, session_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Keynote Lecture">Keynote Lecture</option>
                    <option value="Oral Presentation">Oral Presentation</option>
                    <option value="Plenary Symposium">Plenary Symposium</option>
                    <option value="Poster Session">Poster Session</option>
                    <option value="Interactive Workshop">Interactive Workshop</option>
                    <option value="Panel Discussion">Panel Discussion</option>
                  </select>
                </div>

                {/* Session Date & Room */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Session Date</label>
                  <input
                    type="date"
                    value={editingSession.session_date || '2026-06-22'}
                    onChange={e => setEditingSession({ ...editingSession, session_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Room / Hall <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSession.room || ''}
                    onChange={e => setEditingSession({ ...editingSession, room: e.target.value })}
                    placeholder="e.g., Auditorium Pasteur A"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.room ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.room && <p className="text-[11px] text-red-500">{formErrors.room}</p>}
                </div>

                {/* Start Time & End Time */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={editingSession.start_time || '10:00'}
                    onChange={e => setEditingSession({ ...editingSession, start_time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={editingSession.end_time || '11:30'}
                    onChange={e => setEditingSession({ ...editingSession, end_time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Chairperson */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Session Chairperson</label>
                  <input
                    type="text"
                    value={editingSession.chairperson || ''}
                    onChange={e => setEditingSession({ ...editingSession, chairperson: e.target.value })}
                    placeholder="e.g., Prof. Claire Laurent, Sorbonne University"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Track Description & Objectives</label>
                  <textarea
                    rows={3}
                    value={editingSession.description || ''}
                    onChange={e => setEditingSession({ ...editingSession, description: e.target.value })}
                    placeholder="Scope of presentations and topics included in this session..."
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
                  <span>{isSaving ? 'Saving...' : editingSession.id ? 'Save Changes' : 'Create Session'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingSession)}
        title="Delete Scientific Session"
        itemName={`${deletingSession?.session_code}: ${deletingSession?.title}`}
        itemType="Session"
        onCancel={() => setDeletingSession(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

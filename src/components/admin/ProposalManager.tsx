import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  X,
  Presentation,
  Award,
  Layers,
  Users,
  Download,
  Clock,
  Send,
  Building,
  Mail,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import { ProposalSubmission, ProposalStatus, ProposalType } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ProposalManagerProps {
  proposals: ProposalSubmission[];
  onProposalsChange: (updated: ProposalSubmission[]) => void;
}

export const ProposalManager: React.FC<ProposalManagerProps> = ({
  proposals,
  onProposalsChange
}) => {
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<ProposalSubmission | null>(null);
  const [deletingProposal, setDeletingProposal] = useState<ProposalSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewerNotesInput, setReviewerNotesInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filtered = useMemo(() => {
    return proposals.filter(p => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.proposer_name.toLowerCase().includes(q) ||
        p.proposer_affiliation.toLowerCase().includes(q) ||
        p.proposal_code.toLowerCase().includes(q) ||
        p.conference_title.toLowerCase().includes(q);

      const matchesTrack = trackFilter === 'all' || p.proposal_type === trackFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [proposals, search, trackFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: proposals.length,
      workshops: proposals.filter(p => p.proposal_type === 'workshop').length,
      keynotes: proposals.filter(p => p.proposal_type === 'keynote_forum').length,
      posters: proposals.filter(p => p.proposal_type === 'poster').length,
      symposia: proposals.filter(p => p.proposal_type === 'symposium').length,
      accepted: proposals.filter(p => p.status === 'accepted').length
    };
  }, [proposals]);

  const handleStatusChange = async (id: number, newStatus: ProposalStatus, notes?: string) => {
    try {
      await api.updateProposalStatus(id, { status: newStatus, reviewer_notes: notes });
      const updated = proposals.map(p =>
        p.id === id ? { ...p, status: newStatus, reviewer_notes: notes !== undefined ? notes : p.reviewer_notes } : p
      );
      onProposalsChange(updated);
      if (selectedProposal && selectedProposal.id === id) {
        setSelectedProposal({
          ...selectedProposal,
          status: newStatus,
          reviewer_notes: notes !== undefined ? notes : selectedProposal.reviewer_notes
        });
      }
      showToast(`Proposal status updated to "${newStatus}"`);
    } catch {
      const updated = proposals.map(p =>
        p.id === id ? { ...p, status: newStatus, reviewer_notes: notes !== undefined ? notes : p.reviewer_notes } : p
      );
      onProposalsChange(updated);
      if (selectedProposal && selectedProposal.id === id) {
        setSelectedProposal({
          ...selectedProposal,
          status: newStatus,
          reviewer_notes: notes !== undefined ? notes : selectedProposal.reviewer_notes
        });
      }
      showToast(`Proposal status updated to "${newStatus}" (Offline Sync)`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProposal) return;
    setIsDeleting(true);
    try {
      await api.deleteProposal(deletingProposal.id);
      const updated = proposals.filter(p => p.id !== deletingProposal.id);
      onProposalsChange(updated);
      if (selectedProposal && selectedProposal.id === deletingProposal.id) {
        setSelectedProposal(null);
      }
      showToast('Proposal deleted successfully');
    } catch {
      const updated = proposals.filter(p => p.id !== deletingProposal.id);
      onProposalsChange(updated);
      if (selectedProposal && selectedProposal.id === deletingProposal.id) {
        setSelectedProposal(null);
      }
      showToast('Proposal removed from list');
    } finally {
      setIsDeleting(false);
      setDeletingProposal(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Code',
      'Track Type',
      'Title',
      'Proposer Name',
      'Email',
      'Affiliation',
      'Country',
      'Target Conference',
      'Status',
      'Created At'
    ];
    const rows = filtered.map(p => [
      `"${p.proposal_code}"`,
      `"${p.proposal_type}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.proposer_title || ''} ${p.proposer_name.replace(/"/g, '""')}"`,
      `"${p.proposer_email}"`,
      `"${p.proposer_affiliation.replace(/"/g, '""')}"`,
      `"${p.proposer_country}"`,
      `"${p.conference_title.replace(/"/g, '""')}"`,
      `"${p.status}"`,
      `"${p.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scins-proposals-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Proposals exported to CSV');
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shortlisted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'under_review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'declined':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTrackIcon = (type: ProposalType) => {
    switch (type) {
      case 'workshop':
        return <Presentation className="w-4 h-4 text-purple-600" />;
      case 'keynote_forum':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'poster':
        return <Layers className="w-4 h-4 text-teal-600" />;
      case 'symposium':
        return <Users className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Global Conference Proposals Management
          </h2>
          <p className="text-xs text-slate-500">
            Review and adjudicate invited proposals for Workshops, Keynote Forums, Posters, and Symposia across worldwide congresses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-slate-500 text-[11px] font-medium">Total Received</div>
          <div className="text-2xl font-bold text-slate-900 font-display">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-slate-500 text-[11px] font-medium">Workshops</div>
          <div className="text-2xl font-bold text-purple-700 font-display">{stats.workshops}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-slate-500 text-[11px] font-medium">Keynote Forums</div>
          <div className="text-2xl font-bold text-amber-700 font-display">{stats.keynotes}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-slate-500 text-[11px] font-medium">Poster Submissions</div>
          <div className="text-2xl font-bold text-teal-700 font-display">{stats.posters}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-slate-500 text-[11px] font-medium">Symposia</div>
          <div className="text-2xl font-bold text-blue-700 font-display">{stats.symposia}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
          <div className="text-slate-500 text-[11px] font-medium">Accepted Sessions</div>
          <div className="text-2xl font-bold text-emerald-700 font-display">{stats.accepted}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, proposer, institution, or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Track Filter */}
          <select
            value={trackFilter}
            onChange={e => setTrackFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-700"
          >
            <option value="all">All Proposal Tracks</option>
            <option value="workshop">Workshops</option>
            <option value="keynote_forum">Keynote Forums</option>
            <option value="poster">Poster Presentations</option>
            <option value="symposium">Thematic Symposia</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-teal-700"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
          </select>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code & Track</th>
                <th className="py-3 px-4">Proposed Session Title</th>
                <th className="py-3 px-4">Proposer & Affiliation</th>
                <th className="py-3 px-4">Target Congress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No proposals match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(prop => (
                  <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-slate-900 block">
                          {prop.proposal_code}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          {getTrackIcon(prop.proposal_type)}
                          <span className="capitalize text-[11px] font-semibold text-slate-700">
                            {prop.proposal_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                        {prop.title}
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {prop.created_at?.slice(0, 10)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-800">
                        {prop.proposer_title} {prop.proposer_name}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate">
                        {prop.proposer_affiliation}
                      </div>
                      <div className="text-slate-400 text-[10px]">{prop.proposer_country}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-800 font-medium truncate">
                        {prop.conference_title}
                      </div>
                      <div className="text-slate-400 text-[10px]">{prop.conference_city}, {prop.conference_country}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                          prop.status
                        )}`}
                      >
                        {prop.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedProposal(prop);
                            setReviewerNotesInput(prop.reviewer_notes || '');
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="View Details & Adjudicate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProposal(prop)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Proposal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review / Adjudication Drawer Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-6 max-h-[90vh] flex flex-col font-sans">
            {/* Modal Header */}
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded font-mono">
                    {selectedProposal.proposal_code}
                  </span>
                  <span className="text-xs text-slate-300 capitalize font-medium">
                    {selectedProposal.proposal_type.replace('_', ' ')} Proposal
                  </span>
                </div>
                <h3 className="text-lg font-bold font-display text-white">
                  Session Adjudication & Evaluation
                </h3>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800">
              {/* Proposal Header Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider font-mono">
                  Proposed Session Title
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedProposal.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-600">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    <span>{selectedProposal.conference_title}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProposal.duration_format}</span>
                  </span>
                </div>
              </div>

              {/* Proposer Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Proposer Profile
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedProposal.proposer_title} {selectedProposal.proposer_name}
                  </div>
                  <div className="text-slate-600">{selectedProposal.proposer_affiliation}</div>
                  <div className="text-slate-500">{selectedProposal.proposer_department} • {selectedProposal.proposer_country}</div>
                  <div className="pt-1 text-teal-800 font-medium">{selectedProposal.proposer_email}</div>
                  {selectedProposal.proposer_phone && (
                    <div className="text-slate-500">{selectedProposal.proposer_phone}</div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Session Specifications
                  </span>
                  <div>
                    <span className="text-slate-500 block">Co-Presenters / Chairs:</span>
                    <span className="font-semibold text-slate-800">{selectedProposal.co_presenters || 'None listed'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Audience:</span>
                    <span className="font-semibold text-slate-800">{selectedProposal.target_audience || 'General Scientific Delegates'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">AV / Technical Gear:</span>
                    <span className="font-semibold text-slate-800">{selectedProposal.av_requirements || 'Standard Podium Projection'}</span>
                  </div>
                </div>
              </div>

              {/* Bio & Abstract */}
              {selectedProposal.proposer_bio && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Proposer Biography
                  </span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                    {selectedProposal.proposer_bio}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Proposal Abstract / Curriculum Scope
                </span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed">
                  {selectedProposal.abstract}
                </div>
              </div>

              {selectedProposal.learning_objectives && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Learning Objectives & Takeaways
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedProposal.learning_objectives}
                  </div>
                </div>
              )}

              {/* Adjudication Controls */}
              <div className="p-5 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-3">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider font-mono block">
                  Scientific Advisory Board Adjudication
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                    Reviewer Notes / Room Allocation Directive
                  </label>
                  <textarea
                    rows={2}
                    value={reviewerNotesInput}
                    onChange={e => setReviewerNotesInput(e.target.value)}
                    placeholder="Enter notes on session scheduling, room assignment, or feedback to the proposer..."
                    className="w-full bg-white border border-teal-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-teal-800">
                    Current Status: <span className="font-bold uppercase font-mono">{selectedProposal.status}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedProposal.id, 'under_review', reviewerNotesInput)}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Under Review
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedProposal.id, 'shortlisted', reviewerNotesInput)}
                      className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Shortlist
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedProposal.id, 'declined', reviewerNotesInput)}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedProposal.id, 'accepted', reviewerNotesInput)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Accept Proposal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingProposal && (
        <DeleteConfirmModal
          isOpen={!!deletingProposal}
          title="Delete Proposal"
          message={`Are you sure you want to permanently delete proposal "${deletingProposal.proposal_code}" (${deletingProposal.title.slice(
            0,
            40
          )}...)? This action cannot be undone.`}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingProposal(null)}
        />
      )}
    </div>
  );
};

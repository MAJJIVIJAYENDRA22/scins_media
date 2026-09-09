import React, { useState, useMemo } from 'react';
import {
  Mail,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { ContactEnquiry } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ContactManagerProps {
  submissions: ContactEnquiry[];
  onSubmissionsChange: (updated: ContactEnquiry[]) => void;
}

export const ContactManager: React.FC<ContactManagerProps> = ({
  submissions,
  onSubmissionsChange
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [deletingEnquiry, setDeletingEnquiry] = useState<ContactEnquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered submissions by search and status
  const filtered = useMemo(() => {
    return submissions.filter(item => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  // Update Status handler
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.updateContactStatus(id, newStatus);
      const updated = submissions.map(item =>
        item.id === id ? { ...item, status: newStatus as any } : item
      );
      onSubmissionsChange(updated);
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus as any });
      }
      showToast(`Status updated to "${newStatus}"`);
    } catch {
      const updated = submissions.map(item =>
        item.id === id ? { ...item, status: newStatus as any } : item
      );
      onSubmissionsChange(updated);
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus as any });
      }
      showToast(`Status updated`);
    }
  };

  // Delete Confirm handler
  const handleDeleteConfirm = async () => {
    if (!deletingEnquiry) return;
    setIsDeleting(true);
    try {
      await api.deleteContactSubmission(deletingEnquiry.id);
      const updated = submissions.filter(s => s.id !== deletingEnquiry.id);
      onSubmissionsChange(updated);
      showToast(`Inquiry from ${deletingEnquiry.name} deleted`);
    } catch {
      const updated = submissions.filter(s => s.id !== deletingEnquiry.id);
      onSubmissionsChange(updated);
      showToast(`Submission removed`);
    } finally {
      setIsDeleting(false);
      setDeletingEnquiry(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'responded':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'archived':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const counts = {
    total: submissions.length,
    new: submissions.filter(s => s.status === 'new').length,
    inProgress: submissions.filter(s => s.status === 'in_progress').length,
    responded: submissions.filter(s => s.status === 'responded' || s.status === 'closed').length
  };

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
          <span className="p-2.5 bg-teal-50 text-teal-800 rounded-xl border border-teal-100">
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Contact Form Submissions</h2>
            <p className="text-xs text-slate-500">
              Manage incoming inquiries, visa invitation requests, and secretariat communications
            </p>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Inquiries</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{counts.total}</div>
        </div>
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">New (Unread)</div>
          <div className="text-xl font-bold text-blue-900 mt-0.5">{counts.new}</div>
        </div>
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">In Progress</div>
          <div className="text-xl font-bold text-amber-900 mt-0.5">{counts.inProgress}</div>
        </div>
        <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Responded / Closed</div>
          <div className="text-xl font-bold text-teal-900 mt-0.5">{counts.responded}</div>
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
            placeholder="Search by name, email, phone, subject, or message..."
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

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500 sm:w-48"
        >
          <option value="All">All Statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Contact Inquiries Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Mail className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No contact submissions found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No inquiries match your filter criteria or search keyword.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4 w-32">Date</th>
                  <th className="p-4 w-52">Delegate</th>
                  <th className="p-4">Subject & Message</th>
                  <th className="p-4 w-40">Status</th>
                  <th className="p-4 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date */}
                    <td className="p-4 align-top text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {item.created_at?.substring(0, 10)}
                      <div className="text-[10px] text-slate-400">
                        {item.created_at?.substring(11, 16)}
                      </div>
                    </td>

                    {/* Delegate Name & Contact */}
                    <td className="p-4 align-top">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 truncate max-w-[200px]" title={item.email}>
                        {item.email}
                      </div>
                      {item.phone && (
                        <div className="text-teal-800 text-[11px] font-mono mt-0.5">
                          {item.phone}
                        </div>
                      )}
                    </td>

                    {/* Subject & Message Preview */}
                    <td className="p-4 align-top">
                      <div className="font-semibold text-slate-900 text-xs">
                        {item.subject}
                      </div>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </td>

                    {/* Status with Quick Update Dropdown */}
                    <td className="p-4 align-top">
                      <select
                        value={item.status}
                        onChange={e => handleStatusChange(item.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="responded">Responded</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 align-top text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(item)}
                          title="View Full Inquiry"
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEnquiry(item)}
                          title="Delete Submission"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* View Submission Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Inquiry Details
                </h3>
                <p className="text-xs text-slate-500">
                  Received on {selectedEnquiry.created_at}
                </p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Name</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedEnquiry.name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Email</div>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-xs font-bold text-teal-800 hover:underline mt-0.5 flex items-center space-x-1"
                  >
                    <span>{selectedEnquiry.email}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Phone</div>
                  <div className="text-xs font-medium text-slate-800 mt-0.5 font-mono">
                    {selectedEnquiry.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                  <select
                    value={selectedEnquiry.status}
                    onChange={e => handleStatusChange(selectedEnquiry.id, e.target.value)}
                    className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border cursor-pointer ${getStatusBadge(
                      selectedEnquiry.status
                    )}`}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="responded">Responded</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                <div className="text-sm font-bold text-slate-900 mt-1">{selectedEnquiry.subject}</div>
              </div>

              {/* Message */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Message</label>
                <div className="mt-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Re: ${encodeURIComponent(selectedEnquiry.subject)}`}
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingEnquiry(selectedEnquiry);
                      setSelectedEnquiry(null);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Delete Submission
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEnquiry(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingEnquiry)}
        title="Delete Contact Inquiry"
        itemName={deletingEnquiry ? `${deletingEnquiry.name} (${deletingEnquiry.email})` : ''}
        itemType="Contact Submission"
        onCancel={() => setDeletingEnquiry(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

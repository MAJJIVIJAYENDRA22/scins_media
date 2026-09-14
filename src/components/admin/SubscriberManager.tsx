import React, { useState, useMemo } from 'react';
import {
  Send,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  X,
  Plus,
  Mail,
  UserCheck,
  UserX
} from 'lucide-react';
import { NewsletterSubscriber } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface SubscriberManagerProps {
  subscribers: NewsletterSubscriber[];
  onSubscribersChange: (updated: NewsletterSubscriber[]) => void;
}

export const SubscriberManager: React.FC<SubscriberManagerProps> = ({
  subscribers,
  onSubscribersChange
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deletingSub, setDeletingSub] = useState<NewsletterSubscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add subscriber modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered subscribers
  const filtered = useMemo(() => {
    return subscribers.filter(item => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || item.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscribers, search, statusFilter]);

  // Toggle status between active and unsubscribed
  const handleToggleStatus = async (item: NewsletterSubscriber) => {
    const nextStatus = item.status === 'active' ? 'unsubscribed' : 'active';
    try {
      await api.updateSubscriberStatus(item.id, nextStatus);
      const updated = subscribers.map(s =>
        s.id === item.id ? { ...s, status: nextStatus as any } : s
      );
      onSubscribersChange(updated);
      showToast(`Subscriber ${item.email} is now ${nextStatus}`);
    } catch {
      const updated = subscribers.map(s =>
        s.id === item.id ? { ...s, status: nextStatus as any } : s
      );
      onSubscribersChange(updated);
      showToast(`Subscriber status updated`);
    }
  };

  // Add subscriber handler
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setAddError('Please enter a valid email address');
      return;
    }

    setIsAdding(true);
    setAddError('');
    try {
      await api.subscribeNewsletter(trimmed);
      const exists = subscribers.some(s => s.email.toLowerCase() === trimmed);
      let updated: NewsletterSubscriber[];
      if (exists) {
        updated = subscribers.map(s =>
          s.email.toLowerCase() === trimmed ? { ...s, status: 'active' } : s
        );
      } else {
        const newId = Math.max(...subscribers.map(s => s.id), 0) + 1;
        const newRecord: NewsletterSubscriber = {
          id: newId,
          email: trimmed,
          status: 'active',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        updated = [newRecord, ...subscribers];
      }
      onSubscribersChange(updated);
      showToast(`Subscriber ${trimmed} added successfully`);
      setIsAddModalOpen(false);
      setNewEmail('');
    } catch {
      const newId = Math.max(...subscribers.map(s => s.id), 0) + 1;
      const newRecord: NewsletterSubscriber = {
        id: newId,
        email: trimmed,
        status: 'active',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      const updated = [newRecord, ...subscribers];
      onSubscribersChange(updated);
      showToast(`Subscriber ${trimmed} added`);
      setIsAddModalOpen(false);
      setNewEmail('');
    } finally {
      setIsAdding(false);
    }
  };

  // Delete confirm handler
  const handleDeleteConfirm = async () => {
    if (!deletingSub) return;
    setIsDeleting(true);
    try {
      await api.deleteSubscriber(deletingSub.id);
      const updated = subscribers.filter(s => s.id !== deletingSub.id);
      onSubscribersChange(updated);
      showToast(`Subscriber ${deletingSub.email} removed`);
    } catch {
      const updated = subscribers.filter(s => s.id !== deletingSub.id);
      onSubscribersChange(updated);
      showToast(`Subscriber removed`);
    } finally {
      setIsDeleting(false);
      setDeletingSub(null);
    }
  };

  const counts = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status !== 'active').length
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
            <Send className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Newsletter Subscribers</h2>
            <p className="text-xs text-slate-500">
              Manage scientific broadcast recipients, newsletter signups, and email lists
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <a
            href="/api/v1/exports/subscribers"
            download
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Export CSV</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setIsAddModalOpen(true);
              setAddError('');
            }}
            className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Subscribers</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{counts.total}</div>
        </div>
        <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Active Subscribers</div>
          <div className="text-xl font-bold text-teal-900 mt-0.5">{counts.active}</div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unsubscribed / Inactive</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">{counts.unsubscribed}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by subscriber email address..."
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
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Send className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No subscribers found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No subscriber records matched your filter or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4 w-16">#</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4 w-52">Subscription Date</th>
                  <th className="p-4 w-40">Status</th>
                  <th className="p-4 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((sub, index) => {
                  const isActive = sub.status === 'active';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Index */}
                      <td className="p-4 align-middle text-slate-400 font-mono text-[11px]">
                        #{index + 1}
                      </td>

                      {/* Email */}
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-bold text-slate-900 text-xs">{sub.email}</span>
                        </div>
                      </td>

                      {/* Subscription Date */}
                      <td className="p-4 align-middle text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        {sub.created_at?.substring(0, 10)}
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          {sub.created_at?.substring(11, 16)}
                        </span>
                      </td>

                      {/* Status & 1-click Toggle */}
                      <td className="p-4 align-middle">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sub)}
                          title={`Click to mark as ${isActive ? 'unsubscribed' : 'active'}`}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-colors flex items-center space-x-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          <span>{sub.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-middle text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeletingSub(sub)}
                          title="Delete / Archive Subscriber"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Add Newsletter Subscriber</h3>
                <p className="text-xs text-slate-500">Subscribe an email address to scientific updates</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="e.g., professor@university.edu"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                    addError ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                  }`}
                />
                {addError && <p className="text-[11px] text-red-500">{addError}</p>}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAdding ? 'Adding...' : 'Subscribe Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingSub)}
        title="Remove Subscriber"
        itemName={deletingSub?.email || ''}
        itemType="Newsletter Subscriber"
        onCancel={() => setDeletingSub(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

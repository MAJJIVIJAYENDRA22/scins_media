import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Building,
  Mail,
  Phone,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  FileCheck2,
  MapPin,
  User,
  Globe,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { AbstractSubmission, Conference } from '../../types';
import { api } from '../../services/api';
import { MediaUploadInput } from './MediaUploadInput';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface AbstractManagerProps {
  abstracts: AbstractSubmission[];
  conferences: Conference[];
  onAbstractsChange: (updated: AbstractSubmission[]) => void;
  onConferencesChange?: (updated: Conference[]) => void;
}

export const AbstractManager: React.FC<AbstractManagerProps> = ({
  abstracts,
  conferences,
  onAbstractsChange,
  onConferencesChange
}) => {
  const [search, setSearch] = useState('');
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAbstract, setSelectedAbstract] = useState<AbstractSubmission | null>(null);
  const [deletingAbstract, setDeletingAbstract] = useState<AbstractSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Review state in modal
  const [reviewStatus, setReviewStatus] = useState<string>('accepted');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSavingReview, setIsSavingReview] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open modal and initialize review fields
  const handleOpenRecord = (abs: AbstractSubmission) => {
    setSelectedAbstract(abs);
    setReviewStatus(abs.status || 'submitted');
    setReviewNotes(abs.reviewer_notes || '');
  };

  // Filtered abstracts
  const filteredAbstracts = useMemo(() => {
    return abstracts.filter(item => {
      // Conference Filter
      if (selectedConferenceId !== 'all') {
        if (String(item.conference_id) !== selectedConferenceId) return false;
      }

      // Status Filter
      if (selectedStatus !== 'all') {
        if (item.status !== selectedStatus) return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const conf = conferences.find(c => c.id === item.conference_id);
        const confName = (conf?.title || item.conference_title || '').toLowerCase();

        const match =
          item.submission_id.toLowerCase().includes(q) ||
          item.primary_author_name.toLowerCase().includes(q) ||
          item.primary_author_email.toLowerCase().includes(q) ||
          (item.primary_author_phone && item.primary_author_phone.toLowerCase().includes(q)) ||
          (item.primary_author_affiliation && item.primary_author_affiliation.toLowerCase().includes(q)) ||
          item.primary_author_country.toLowerCase().includes(q) ||
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.abstract_text && item.abstract_text.toLowerCase().includes(q)) ||
          (item.keywords && item.keywords.toLowerCase().includes(q)) ||
          confName.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [abstracts, conferences, selectedConferenceId, selectedStatus, search]);

  // Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const confParam = selectedConferenceId !== 'all' ? selectedConferenceId : undefined;
      await api.downloadExport(
        'abstracts',
        confParam,
        `scinsmedia-abstracts-${selectedConferenceId === 'all' ? 'all' : `conf-${selectedConferenceId}`}-${Date.now()}.csv`
      );
      showToast('Abstract submissions exported to CSV successfully');
    } catch (err) {
      console.warn('Backend export fallback, using client-side generator:', err);
      const header = 'SubmissionID,ConferenceID,ConferenceName,PrimaryAuthorName,Email,ContactNumber,Institution,Country,PresentationPreference,AbstractTitle,DocumentFileName,DocumentURL,Status,ReviewerNotes,SubmissionDate\n';
      const rows = filteredAbstracts.map(a => {
        const conf = conferences.find(c => c.id === a.conference_id);
        const confTitle = conf?.title || a.conference_title || `Conference #${a.conference_id}`;
        return `"${a.submission_id}","${a.conference_id}","${confTitle.replace(/"/g, '""')}","${a.primary_author_name.replace(/"/g, '""')}","${a.primary_author_email}","${a.primary_author_phone || ''}","${(a.primary_author_affiliation || '').replace(/"/g, '""')}","${a.primary_author_country}","${a.presentation_preference || 'Oral'}","${(a.title || '').replace(/"/g, '""')}","${(a.file_name || '').replace(/"/g, '""')}","${a.file_url || ''}","${a.status}","${(a.reviewer_notes || '').replace(/"/g, '""')}","${a.created_at}"`;
      }).join('\n');
      api.downloadCsvFile(header + rows, `scinsmedia-abstracts-${selectedConferenceId === 'all' ? 'all' : `conf-${selectedConferenceId}`}-${Date.now()}.csv`);
      showToast('Abstract submissions exported to CSV successfully');
    } finally {
      setIsExporting(false);
    }
  };

  // Quick Status Change in Table
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.updateAbstractStatus(id, { status: newStatus });
      const updated = abstracts.map(a => (a.id === id ? { ...a, status: newStatus as any } : a));
      onAbstractsChange(updated);
      showToast(`Abstract status updated to "${newStatus.replace('_', ' ')}"`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status. Please try again.');
    }
  };

  // Save Full Review from Modal
  const handleSaveReview = async () => {
    if (!selectedAbstract) return;
    setIsSavingReview(true);
    try {
      await api.updateAbstractStatus(selectedAbstract.id, {
        status: reviewStatus,
        reviewer_notes: reviewNotes
      });
      const updated = abstracts.map(a =>
        a.id === selectedAbstract.id
          ? { ...a, status: reviewStatus as any, reviewer_notes: reviewNotes }
          : a
      );
      onAbstractsChange(updated);
      setSelectedAbstract(prev => prev ? { ...prev, status: reviewStatus as any, reviewer_notes: reviewNotes } : null);
      showToast('Abstract evaluation saved successfully');
    } catch (err: any) {
      console.error('Failed to save evaluation:', err);
      showToast('Failed to save evaluation: ' + (err?.message || 'Error'));
    } finally {
      setIsSavingReview(false);
    }
  };

  // Delete Abstract
  const handleDeleteAbstract = async () => {
    if (!deletingAbstract) return;
    setIsDeleting(true);
    try {
      await api.deleteAbstract(deletingAbstract.id);
      const updated = abstracts.filter(a => a.id !== deletingAbstract.id);
      onAbstractsChange(updated);
      if (selectedAbstract?.id === deletingAbstract.id) {
        setSelectedAbstract(null);
      }
      setDeletingAbstract(null);
      showToast('Abstract record deleted successfully');
    } catch (err: any) {
      console.warn('API delete abstract fallback:', err);
      const updated = abstracts.filter(a => a.id !== deletingAbstract.id);
      onAbstractsChange(updated);
      if (selectedAbstract?.id === deletingAbstract.id) {
        setSelectedAbstract(null);
      }
      setDeletingAbstract(null);
      showToast('Abstract record removed from list');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'revision_required':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const counts = {
    total: abstracts.length,
    submitted: abstracts.filter(a => a.status === 'submitted').length,
    under_review: abstracts.filter(a => a.status === 'under_review').length,
    accepted: abstracts.filter(a => a.status === 'accepted').length,
    rejected: abstracts.filter(a => a.status === 'rejected' || a.status === 'revision_required').length
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

      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 bg-teal-50 text-teal-800 rounded-xl border border-teal-100">
            <FileCheck2 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Abstract Submissions
            </h2>
            <p className="text-xs text-slate-500">
              Primary Author & Abstract Information submitted across conferences with database persistence
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || abstracts.length === 0}
            className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            title="Export abstract submissions to CSV"
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'Exporting...' : `Export CSV (${filteredAbstracts.length})`}</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Submissions</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{counts.total}</div>
        </div>
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">New (Submitted)</div>
          <div className="text-xl font-bold text-amber-900 mt-0.5">{counts.submitted}</div>
        </div>
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">Under Review</div>
          <div className="text-xl font-bold text-blue-900 mt-0.5">{counts.under_review}</div>
        </div>
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Accepted Papers</div>
          <div className="text-xl font-bold text-emerald-900 mt-0.5">{counts.accepted}</div>
        </div>
      </div>

      {/* Sample Abstract Templates (Conference-Specific PDF Configuration) */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sample Abstract Templates</h3>
          <p className="text-xs text-slate-500">
            Upload the official sample abstract PDF/DOCX for each conference. Authors can download this template from the submission page.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {conferences.map(conf => (
            <div key={conf.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate pr-2">
                  <span className="text-xs font-bold text-slate-800 truncate">{conf.short_title || conf.title}</span>
                  {conf.sample_abstract_url ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Active
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                      None
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}/abstract/${conf.slug}`;
                      navigator.clipboard?.writeText(link);
                      showToast(`Copied submission link: /abstract/${conf.slug}`);
                    }}
                    title="Copy direct submission URL"
                    className="text-[10px] font-semibold text-slate-600 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>Link</span>
                  </button>
                  {conf.sample_abstract_url && (
                    <a
                      href={conf.sample_abstract_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
                      title="Download sample PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>Preview</span>
                    </a>
                  )}
                </div>
              </div>
              <MediaUploadInput
                label=""
                value={conf.sample_abstract_url || ''}
                onChange={async (url) => {
                  const updated = { ...conf, sample_abstract_url: url };
                  if (onConferencesChange) {
                    onConferencesChange(conferences.map(c => (c.id === conf.id ? updated : c)));
                  }
                  try {
                    await api.updateConference(conf.id, { sample_abstract_url: url });
                    showToast(`Updated sample template for ${conf.short_title || conf.title}`);
                  } catch (_) {}
                }}
                accept="pdf"
                maxSizeMB={10}
                category={`template_conf_${conf.id}`}
                placeholder="Upload or replace PDF template..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by author, email, phone, institution, country, title, submission ID..."
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

          {/* Conference Filter Dropdown */}
          <div className="w-full md:w-72 shrink-0">
            <select
              value={selectedConferenceId}
              onChange={e => setSelectedConferenceId(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">🌐 All Conferences ({abstracts.length})</option>
              {conferences.map(c => {
                const count = abstracts.filter(a => a.conference_id === c.id).length;
                return (
                  <option key={c.id} value={String(c.id)}>
                    {c.short_title || c.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'under_review', label: 'Under Review' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'rejected', label: 'Rejected' },
            { id: 'revision_required', label: 'Revision' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                selectedStatus === tab.id
                  ? 'bg-teal-800 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredAbstracts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No abstract submissions found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || selectedConferenceId !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search criteria or conference filter.'
                : 'Abstract submissions will appear here once submitted by delegates.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4 w-36">ID & Date</th>
                  <th className="p-4 w-52">Conference</th>
                  <th className="p-4 w-60">Primary Author Details</th>
                  <th className="p-4">Abstract & Attachment</th>
                  <th className="p-4 w-36">Status</th>
                  <th className="p-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredAbstracts.map(item => {
                  const conf = conferences.find(c => c.id === item.conference_id);
                  const confTitle = conf?.short_title || conf?.title || item.conference_title || `Conference #${item.conference_id}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID & Date */}
                      <td className="p-4 align-top">
                        <button
                          type="button"
                          onClick={() => handleOpenRecord(item)}
                          className="font-mono text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded border border-teal-200 text-[11px] font-bold block w-fit cursor-pointer transition-colors"
                          title="Click to view complete submission details"
                        >
                          {item.submission_id}
                        </button>
                        <div className="text-slate-500 text-[11px] font-mono mt-1 whitespace-nowrap">
                          {item.created_at?.substring(0, 10)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.created_at?.substring(11, 16)}
                        </div>
                      </td>

                      {/* Conference */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-900 line-clamp-2" title={confTitle}>
                          {confTitle}
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200 mt-1">
                          Conf ID #{item.conference_id}
                        </span>
                      </td>

                      {/* Primary Author Details */}
                      <td className="p-4 align-top space-y-0.5">
                        <button
                          type="button"
                          onClick={() => handleOpenRecord(item)}
                          className="font-bold text-slate-900 hover:text-teal-700 text-left cursor-pointer transition-colors"
                          title="Click to view author details"
                        >
                          {item.primary_author_name}
                        </button>
                        <div className="text-slate-500 text-[11px] truncate" title={item.primary_author_email}>
                          {item.primary_author_email}
                        </div>
                        {item.primary_author_phone && (
                          <div className="text-teal-800 text-[11px] font-mono">
                            {item.primary_author_phone}
                          </div>
                        )}
                        {item.primary_author_affiliation && (
                          <div className="text-slate-600 text-[11px] italic line-clamp-1" title={item.primary_author_affiliation}>
                            🏛️ {item.primary_author_affiliation}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          📍 {item.primary_author_country}
                        </div>
                      </td>

                      {/* Abstract & Document */}
                      <td className="p-4 align-top space-y-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenRecord(item)}
                          className="font-semibold text-slate-900 hover:text-teal-700 text-xs line-clamp-1 text-left cursor-pointer transition-colors"
                          title="Click to view abstract document"
                        >
                          {item.title}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-700">
                            Format: {item.presentation_preference || 'Oral'}
                          </span>
                          {item.keywords && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              Key: {item.keywords}
                            </span>
                          )}
                        </div>

                        {/* File Attachment & PDF Download */}
                        <div className="pt-0.5">
                          <a
                            href={`/api/v1/abstracts/${item.id}/document`}
                            download={item.file_name || `${item.submission_id}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            title="Download Official Abstract PDF / Document"
                          >
                            <FileText className="w-3 h-3 text-teal-600" />
                            <span className="truncate max-w-[160px]">{item.file_name || 'Download Abstract PDF'}</span>
                            <Download className="w-3 h-3 text-teal-600 ml-1" />
                          </a>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 align-top">
                        <select
                          value={item.status}
                          onChange={e => handleStatusChange(item.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="revision_required">Revision Required</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenRecord(item)}
                            title="Open Full Record & Document"
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingAbstract(item)}
                            title="Delete Submission"
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

      {/* Record Inspection & Document Reader Modal */}
      {selectedAbstract && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedAbstract(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 bg-teal-50 text-teal-800 rounded-xl border border-teal-200">
                  <FileCheck2 className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {selectedAbstract.submission_id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getStatusBadge(selectedAbstract.status)}`}>
                      {selectedAbstract.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-display mt-0.5 line-clamp-1">
                    {selectedAbstract.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedAbstract(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Conference Context Banner */}
              <div className="p-3.5 bg-teal-50/50 border border-teal-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5 truncate">
                  <Building className="w-4 h-4 text-teal-700 shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 block">Associated Conference</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {conferences.find(c => c.id === selectedAbstract.conference_id)?.title || selectedAbstract.conference_title || `Conference #${selectedAbstract.conference_id}`}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Submission Date</span>
                  <span className="font-mono text-slate-700 text-xs font-semibold">{selectedAbstract.created_at}</span>
                </div>
              </div>

              {/* Primary Author & Institution Grid */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80 pb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Primary Author & Contact Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Author Full Name</span>
                    <span className="font-bold text-slate-900">{selectedAbstract.primary_author_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Email Address</span>
                    <a href={`mailto:${selectedAbstract.primary_author_email}`} className="font-semibold text-teal-800 hover:underline inline-flex items-center space-x-1">
                      <span>{selectedAbstract.primary_author_email}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Number</span>
                    <span className="font-mono font-semibold text-slate-900">{selectedAbstract.primary_author_phone || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">University / Institution</span>
                    <span className="font-semibold text-slate-800">{selectedAbstract.primary_author_affiliation || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Country</span>
                    <span className="font-semibold text-slate-800">📍 {selectedAbstract.primary_author_country}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Presentation Format</span>
                    <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mt-0.5">
                      {selectedAbstract.presentation_preference || 'Oral'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submitted Abstract Text (if present) */}
              {selectedAbstract.abstract_text && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Abstract Text Content
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                    {selectedAbstract.abstract_text}
                  </div>
                </div>
              )}

              {/* Submitted Document Attachment & Embedded Document Reader */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Submitted Abstract Document
                  </span>
                  <a
                    href={`/api/v1/abstracts/${selectedAbstract.id}/document`}
                    download={selectedAbstract.file_name || `${selectedAbstract.submission_id}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Abstract PDF</span>
                  </a>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <div>
                        <span className="font-bold text-slate-900">{selectedAbstract.file_name || `${selectedAbstract.submission_id}.pdf`}</span>
                        <span className="text-slate-400 text-[10px] block">Preserved official document formatting</span>
                      </div>
                    </div>
                    <a
                      href={`/api/v1/abstracts/${selectedAbstract.id}/document`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-teal-800 hover:underline flex items-center space-x-1"
                    >
                      <span>Open in New Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* PDF Reader Frame */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 shadow-2xs">
                    <div className="px-3 py-1.5 bg-slate-200 text-slate-600 text-[11px] font-semibold flex items-center justify-between">
                      <span>Document Reader Preview</span>
                      <span className="font-mono text-[10px]">PDF Viewer</span>
                    </div>
                    <iframe
                      src={`/api/v1/abstracts/${selectedAbstract.id}/document`}
                      title="Submitted Abstract Document"
                      className="w-full h-80 border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Scientific Review & Evaluation Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Scientific Evaluation & Status Review</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Decision Status
                    </label>
                    <select
                      value={reviewStatus}
                      onChange={e => setReviewStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
                    >
                      <option value="submitted">Submitted (Pending)</option>
                      <option value="under_review">Under Review</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="revision_required">Revision Required</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Reviewer Feedback / Committee Notes
                    </label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      placeholder="e.g. Recommended for Oral session in Biopolymers stream..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    disabled={isSavingReview}
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    {isSavingReview ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedAbstract(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingAbstract}
        title="Delete Abstract Submission"
        message={`Are you sure you want to delete abstract submission "${deletingAbstract?.submission_id}" by ${deletingAbstract?.primary_author_name}? This action cannot be undone.`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteAbstract}
        onCancel={() => setDeletingAbstract(null)}
      />
    </div>
  );
};

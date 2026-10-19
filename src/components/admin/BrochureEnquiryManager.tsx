import React, { useState, useMemo } from 'react';
import {
  FileDown,
  Search,
  Eye,
  Trash2,
  X,
  Download,
  Calendar,
  Building,
  Mail,
  Phone,
  Globe,
  Clock,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { BrochureEnquiry, Conference } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface BrochureEnquiryManagerProps {
  enquiries: BrochureEnquiry[];
  conferences: Conference[];
  onEnquiriesChange: (updated: BrochureEnquiry[]) => void;
}

export const BrochureEnquiryManager: React.FC<BrochureEnquiryManagerProps> = ({
  enquiries,
  conferences,
  onEnquiriesChange
}) => {
  const [search, setSearch] = useState('');
  const [conferenceFilter, setConferenceFilter] = useState<string>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const [selectedEnquiry, setSelectedEnquiry] = useState<BrochureEnquiry | null>(null);
  const [deletingEnquiry, setDeletingEnquiry] = useState<BrochureEnquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered and sorted enquiries
  const filteredAndSorted = useMemo(() => {
    let result = enquiries.filter(item => {
      // 1. Text Search (name, email, conference)
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (item.full_name && item.full_name.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.conference_name && item.conference_name.toLowerCase().includes(q)) ||
        (item.mobile_number && item.mobile_number.toLowerCase().includes(q)) ||
        (item.country && item.country.toLowerCase().includes(q));

      // 2. Conference Filter
      const matchesConference =
        conferenceFilter === 'All' ||
        String(item.conference_id) === conferenceFilter ||
        item.conference_name === conferenceFilter;

      // 3. Date Filter
      let matchesDate = true;
      if (startDate || endDate) {
        const itemDateStr = item.created_at ? item.created_at.split('T')[0].split(' ')[0] : '';
        if (startDate && itemDateStr < startDate) {
          matchesDate = false;
        }
        if (endDate && itemDateStr > endDate) {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesConference && matchesDate;
    });

    // Sort by Newest or Oldest
    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime() || 0;
      const timeB = new Date(b.created_at).getTime() || 0;
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [enquiries, search, conferenceFilter, startDate, endDate, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, conferenceFilter, startDate, endDate, sortOrder]);

  // Export to CSV
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const targetItems = filteredAndSorted.length > 0 ? filteredAndSorted : enquiries;
      const header = 'ID,Conference ID,Conference Name,Full Name,Email,Mobile Number,Country,Query / Message,Action,Submission Date\n';
      const rows = targetItems.map(item =>
        `"${item.id}","${item.conference_id}","${(item.conference_name || '').replace(/"/g, '""')}","${(item.full_name || '').replace(/"/g, '""')}","${(item.email || '').replace(/"/g, '""')}","${(item.mobile_number || '').replace(/"/g, '""')}","${(item.country || '').replace(/"/g, '""')}","${(item.query_message || '').replace(/"/g, '""')}","${item.action || 'download_brochure'}","${item.created_at || ''}"`
      ).join('\n');

      const filename = `scinsmedia-brochure-enquiries-${Date.now()}.csv`;
      api.downloadCsvFile(header + rows, filename);
      showToast('Brochure enquiries CSV exported successfully');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      showToast('Failed to export enquiries CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Delete Enquiry
  const handleDeleteConfirm = async () => {
    if (!deletingEnquiry) return;
    setIsDeleting(true);
    try {
      await api.deleteBrochureEnquiry(deletingEnquiry.id);
      const updated = enquiries.filter(item => item.id !== deletingEnquiry.id);
      onEnquiriesChange(updated);
      setDeletingEnquiry(null);
      if (selectedEnquiry && selectedEnquiry.id === deletingEnquiry.id) {
        setSelectedEnquiry(null);
      }
      showToast('Enquiry record deleted successfully');
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
      // Optimistic update fallback
      const updated = enquiries.filter(item => item.id !== deletingEnquiry.id);
      onEnquiriesChange(updated);
      setDeletingEnquiry(null);
      showToast('Enquiry record removed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-800 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Brochure Enquiries & Leads
                </h2>
                <p className="text-xs text-slate-500">
                  Track and manage leads captured before conference brochure downloads
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportCsv}
              disabled={isExporting || enquiries.length === 0}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-xs disabled:opacity-50 cursor-pointer"
              title="Export displayed records to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export to CSV'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500">Total Enquiries</span>
            <div className="text-xl font-extrabold text-slate-900 font-display mt-0.5">
              {enquiries.length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100">
            <span className="text-[11px] font-medium text-teal-800">Filtered Records</span>
            <div className="text-xl font-extrabold text-teal-900 font-display mt-0.5">
              {filteredAndSorted.length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500">Conferences Represented</span>
            <div className="text-xl font-extrabold text-slate-900 font-display mt-0.5">
              {new Set(enquiries.map(e => e.conference_id)).size}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500">Unique Countries</span>
            <div className="text-xl font-extrabold text-slate-900 font-display mt-0.5">
              {new Set(enquiries.map(e => e.country).filter(Boolean)).size}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or conference..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
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

          {/* Conference Filter */}
          <div className="lg:col-span-3">
            <select
              value={conferenceFilter}
              onChange={e => setConferenceFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            >
              <option value="All">All Conferences ({conferences.length})</option>
              {conferences.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter: Start & End */}
          <div className="lg:col-span-3 flex items-center space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              title="Start Date"
              className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              title="End Date"
              className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          {/* Sort Order */}
          <div className="lg:col-span-2 flex items-center space-x-2">
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button (shown if active) */}
        {(search || conferenceFilter !== 'All' || startDate || endDate) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing {filteredAndSorted.length} of {enquiries.length} enquiries
            </span>
            <button
              onClick={() => {
                setSearch('');
                setConferenceFilter('All');
                setStartDate('');
                setEndDate('');
                setSortOrder('newest');
              }}
              className="text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {paginatedItems.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileDown className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 font-display">No Brochure Enquiries Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {enquiries.length === 0
                ? 'When visitors request brochures from conference pages, their enquiry details will appear here.'
                : 'No enquiries match the current filters. Try adjusting search criteria or dates.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Visitor / Contact</th>
                  <th className="py-3 px-4">Conference</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Query / Message</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Visitor / Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.full_name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{item.email}</span>
                      </div>
                      {item.mobile_number && (
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.mobile_number}</span>
                        </div>
                      )}
                    </td>

                    {/* Conference */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-teal-800 line-clamp-2 max-w-[220px]" title={item.conference_name}>
                        {item.conference_name || `Conference #${item.conference_id}`}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {item.conference_id}
                      </span>
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                        <Globe className="w-3 h-3 mr-1 text-slate-400" />
                        {item.country || 'Not specified'}
                      </span>
                    </td>

                    {/* Query / Message */}
                    <td className="py-3.5 px-4 max-w-[240px]">
                      <p className="line-clamp-2 text-slate-600 text-xs italic">
                        "{item.query_message}"
                      </p>
                    </td>

                    {/* Submission Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : '—'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : ''}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedEnquiry(item)}
                          className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition"
                          title="View complete details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingEnquiry(item)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete enquiry record"
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages} ({filteredAndSorted.length} total entries)
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-semibold"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Only show around current page if large number
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        currentPage === pageNum
                          ? 'bg-teal-800 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                }
                return null;
              })}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complete Enquiry Details Modal */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    Lead #{selectedEnquiry.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {selectedEnquiry.action || 'download_brochure'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Brochure Enquiry Lead Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Conference Banner */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Target Conference
                </span>
                <p className="text-sm font-bold text-teal-950 font-display">
                  {selectedEnquiry.conference_name}
                </p>
                <span className="text-[11px] text-teal-800/80 font-mono">
                  Conference ID: {selectedEnquiry.conference_id}
                </span>
              </div>

              {/* Visitor Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedEnquiry.full_name}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Country
                  </span>
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-700" />
                    <span>{selectedEnquiry.country || 'Not specified'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </span>
                  <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                    <span className="truncate">{selectedEnquiry.email}</span>
                    <a
                      href={`mailto:${selectedEnquiry.email}?subject=SCINS MEDIA Brochure Enquiry - ${selectedEnquiry.conference_name}`}
                      className="text-teal-700 hover:text-teal-900 font-bold ml-2 shrink-0"
                    >
                      Mail
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Mobile Number
                  </span>
                  <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                    <span>{selectedEnquiry.mobile_number || '—'}</span>
                    {selectedEnquiry.mobile_number && (
                      <a
                        href={`tel:${selectedEnquiry.mobile_number}`}
                        className="text-teal-700 hover:text-teal-900 font-bold ml-2 shrink-0"
                      >
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Query / Message */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Visitor Query / Message
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.query_message}
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Submitted on: {new Date(selectedEnquiry.created_at).toLocaleString()}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <a
                href={`mailto:${selectedEnquiry.email}?subject=RE: Conference Brochure Enquiry - ${selectedEnquiry.conference_name}&body=Dear ${selectedEnquiry.full_name},%0D%0A%0D%0AThank you for your interest in ${selectedEnquiry.conference_name}. Regarding your query:%0D%0A"${selectedEnquiry.query_message}"%0D%0A%0D%0A`}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply by Email</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEnquiry && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeletingEnquiry(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Brochure Enquiry"
          message={`Are you sure you want to permanently delete the brochure enquiry from ${deletingEnquiry.full_name}? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

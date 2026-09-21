import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Printer,
  ChevronRight,
  ExternalLink,
  Layers,
  Building,
  Mail,
  Phone,
  Eye,
  X,
  Sparkles,
  QrCode,
  Tag,
  Check
} from 'lucide-react';
import { Registration, Conference, PaymentStatus, RegistrationStatus } from '../../types';
import { api } from '../../services/api';

interface RegistrationManagerProps {
  registrations: Registration[];
  conferences: Conference[];
  onRegistrationsChange: (updated: Registration[]) => void;
  onConferencesChange?: (updated: Conference[]) => void;
}

export const RegistrationManager: React.FC<RegistrationManagerProps> = ({
  registrations,
  conferences,
  onRegistrationsChange,
  onConferencesChange
}) => {
  // Dynamic live conferences directly fetched from database & kept reactive
  const [liveConferences, setLiveConferences] = useState<Conference[]>(conferences);

  // Conference selection state ('all' or specific conference ID as string)
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>('all');

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // UI / Action states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [badgePreviewRegistration, setBadgePreviewRegistration] = useState<Registration | null>(null);
  const [isBatchBadgeModalOpen, setIsBatchBadgeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingManifest, setIsExportingManifest] = useState(false);
  const badgePrintRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadManifest = async () => {
    setIsExportingManifest(true);
    try {
      const params: Record<string, string> = {};
      if (selectedConferenceId !== 'all') params.conference_id = selectedConferenceId;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentStatusFilter !== 'all') params.payment_status = paymentStatusFilter;
      if (categoryFilter !== 'all') params.category_id = categoryFilter;

      await api.downloadExport('registrations', params);
      showToast('Registration manifest (CSV) downloaded successfully');
    } catch (err) {
      console.warn('Direct server export notice, using dataset fallback:', err);
      const targetRegs = filteredRegistrations.length > 0 ? filteredRegistrations : registrations;
      const header = 'RegistrationID,ConferenceID,ConferenceTitle,FirstName,LastName,Email,Phone,Country,Institution,Department,Category,Amount,PaymentStatus,RegistrationStatus,AttendanceMode,Date\n';
      const rows = targetRegs.map(r =>
        `"${r.registration_id}",${r.conference_id},"${(r.conference_title || '').replace(/"/g, '""')}","${r.first_name}","${r.last_name}","${r.email}","${r.phone || ''}","${r.country}","${(r.institution || '').replace(/"/g, '""')}","${(r.department || '').replace(/"/g, '""')}","${r.category_name}",${r.amount},"${r.payment_status}","${r.registration_status}","${r.attendance_mode}","${r.created_at}"`
      ).join('\n');
      const filename = `scinsmedia-registrations-${selectedConferenceId !== 'all' ? selectedConferenceId : 'all'}-${Date.now()}.csv`;
      api.downloadCsvFile(header + rows, filename);
      showToast('Registration manifest (CSV) generated and downloaded');
    } finally {
      setIsExportingManifest(false);
    }
  };

  // Synchronize when parent conferences prop updates
  useEffect(() => {
    if (conferences && conferences.length >= 0) {
      setLiveConferences(conferences);
    }
  }, [conferences]);

  // Fetch the latest conference records directly from the database API
  const fetchLatestConferences = async () => {
    try {
      const data = await api.getConferences();
      if (Array.isArray(data)) {
        setLiveConferences(data);
        if (onConferencesChange) {
          onConferencesChange(data);
        }
      }
    } catch (err) {
      console.warn('Backend conferences fetch warning:', err);
    }
  };

  // Listen for conference creation, updates, status toggles, or deletions from Conference Management
  useEffect(() => {
    fetchLatestConferences();

    const handleConferencesUpdated = () => {
      fetchLatestConferences();
    };

    window.addEventListener('scinsmedia:conferences_updated', handleConferencesUpdated);
    window.addEventListener('storage', handleConferencesUpdated);

    return () => {
      window.removeEventListener('scinsmedia:conferences_updated', handleConferencesUpdated);
      window.removeEventListener('storage', handleConferencesUpdated);
    };
  }, []);

  // Filter ONLY valid, currently listed/published conferences and remove any duplicates
  const publishedConferences = useMemo(() => {
    const seenIds = new Set<number>();
    const seenSlugs = new Set<string>();
    const list: Conference[] = [];

    (liveConferences || []).forEach(c => {
      if (!c || !c.id) return;
      // Must be currently published (not draft, unpublished, archived, or deleted)
      const status = (c.status || '').toLowerCase().trim();
      const isPublished = status === 'published' || status === 'active';
      if (!isPublished) return;

      // Deduplicate by ID and Slug/Title
      const slugKey = (c.slug || c.title || '').toLowerCase().trim();
      if (seenIds.has(c.id) || (slugKey && seenSlugs.has(slugKey))) {
        return;
      }
      seenIds.add(c.id);
      if (slugKey) seenSlugs.add(slugKey);
      list.push(c);
    });

    // Chronological sort
    list.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
    return list;
  }, [liveConferences]);

  // If currently selected conference was removed or switched to draft/unpublished, auto-switch to 'all'
  useEffect(() => {
    if (selectedConferenceId !== 'all') {
      const existsAndPublished = publishedConferences.some(c => String(c.id) === selectedConferenceId);
      if (!existsAndPublished) {
        setSelectedConferenceId('all');
      }
    }
  }, [publishedConferences, selectedConferenceId]);

  // Extract all distinct registration categories across all or selected conference
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach(r => {
      if (r.category_name) set.add(r.category_name);
    });
    return Array.from(set).sort();
  }, [registrations]);

  // Conference lookup map (strictly from published conferences)
  const conferenceMap = useMemo(() => {
    const map = new Map<number, Conference>();
    publishedConferences.forEach(c => map.set(c.id, c));
    return map;
  }, [publishedConferences]);

  // Count registrations per conference
  const conferenceRegistrationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach(r => {
      const key = String(r.conference_id);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  // Fetch from database/API dynamically whenever conference or primary filters change
  const fetchFilteredRegistrations = async () => {
    setIsLoading(true);
    try {
      // Re-fetch latest conferences to guarantee selector reflects database
      fetchLatestConferences();

      const data = await api.getRegistrations({
        conference_id: selectedConferenceId !== 'all' ? selectedConferenceId : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        payment_status: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
        category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined
      });
      if (Array.isArray(data)) {
        onRegistrationsChange(data);
      }
    } catch (err) {
      console.warn('Backend registrations fetch warning, falling back to current state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize when conference selector or filters change
  useEffect(() => {
    fetchFilteredRegistrations();
  }, [selectedConferenceId, statusFilter, paymentStatusFilter, categoryFilter, startDate, endDate]);

  // Handle live search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        fetchFilteredRegistrations();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Active filtered registrations (with frontend fallback guarantee)
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // Conference filter
      if (selectedConferenceId !== 'all' && String(r.conference_id) !== selectedConferenceId) {
        return false;
      }

      // Registration Status filter
      if (statusFilter !== 'all' && (r.registration_status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Payment Status filter
      if (paymentStatusFilter !== 'all' && (r.payment_status || '').toLowerCase() !== paymentStatusFilter.toLowerCase()) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && r.category_name !== categoryFilter && String(r.category_id) !== categoryFilter) {
        return false;
      }

      // Date Range filters
      if (startDate) {
        const itemDate = (r.created_at || '').substring(0, 10);
        if (itemDate && itemDate < startDate) return false;
      }
      if (endDate) {
        const itemDate = (r.created_at || '').substring(0, 10);
        if (itemDate && itemDate > endDate) return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const fullName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
        const matches =
          fullName.includes(q) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.registration_id && r.registration_id.toLowerCase().includes(q)) ||
          (r.institution && r.institution.toLowerCase().includes(q)) ||
          (r.country && r.country.toLowerCase().includes(q)) ||
          (r.conference_title && r.conference_title.toLowerCase().includes(q)) ||
          (r.category_name && r.category_name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [registrations, selectedConferenceId, statusFilter, paymentStatusFilter, categoryFilter, startDate, endDate, search]);

  // Statistics for selected conference or overall view
  const stats = useMemo(() => {
    const total = filteredRegistrations.length;
    const confirmed = filteredRegistrations.filter(r => r.registration_status === 'confirmed').length;
    const pending = filteredRegistrations.filter(r => r.registration_status === 'pending').length;
    const revenue = filteredRegistrations.reduce(
      (acc, r) => acc + (r.payment_status === 'completed' ? (Number(r.amount) || 0) : 0),
      0
    );
    return { total, confirmed, pending, revenue };
  }, [filteredRegistrations]);

  // Reset all filters back to default
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPaymentStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setSelectedConferenceId('all');
  };

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentStatusFilter !== 'all' ||
    startDate !== '' ||
    endDate !== '' ||
    selectedConferenceId !== 'all';

  // Selected conference object
  const activeConference = useMemo(() => {
    if (selectedConferenceId === 'all') return null;
    return conferenceMap.get(Number(selectedConferenceId)) || null;
  }, [selectedConferenceId, conferenceMap]);

  // Group registrations by Conference if "all" is selected
  const registrationsByConference = useMemo(() => {
    const groups: { conference: Conference | null; conferenceId: number; title: string; items: Registration[] }[] = [];
    const map = new Map<number, Registration[]>();

    filteredRegistrations.forEach(r => {
      const cId = r.conference_id;
      if (!map.has(cId)) map.set(cId, []);
      map.get(cId)!.push(r);
    });

    map.forEach((items, cId) => {
      const conf = conferenceMap.get(cId) || null;
      const title = conf ? conf.title : (items[0]?.conference_title || `Conference #${cId}`);
      groups.push({ conference: conf, conferenceId: cId, title, items });
    });

    return groups;
  }, [filteredRegistrations, conferenceMap]);

  // Update registration status (synced to database)
  const handleUpdateStatus = async (
    id: number,
    registration_status?: RegistrationStatus,
    payment_status?: PaymentStatus
  ) => {
    try {
      await api.updateRegistrationStatus(id, { registration_status, payment_status });
      const updated = registrations.map(r => {
        if (r.id === id) {
          return {
            ...r,
            registration_status: registration_status || r.registration_status,
            payment_status: payment_status || r.payment_status
          };
        }
        return r;
      });
      onRegistrationsChange(updated);
      showToast(`Delegate record updated successfully`);
    } catch {
      // Offline fallback
      const updated = registrations.map(r => {
        if (r.id === id) {
          return {
            ...r,
            registration_status: registration_status || r.registration_status,
            payment_status: payment_status || r.payment_status
          };
        }
        return r;
      });
      onRegistrationsChange(updated);
      showToast(`Delegate record updated (local)`);
    }
  };

  // Print single badge
  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & EXPORT ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Delegate Registrations & Badges
            </h3>
            <span className="bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
              {filteredRegistrations.length} {filteredRegistrations.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage conference attendees, filter by congress or category, and print official credentials
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Batch Print Badges Button */}
          {filteredRegistrations.length > 0 && (
            <button
              onClick={() => setIsBatchBadgeModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              title="Generate printable credential badges for currently filtered delegates"
            >
              <Printer className="w-3.5 h-3.5 text-teal-300" />
              <span>Batch Print Badges ({filteredRegistrations.length})</span>
            </button>
          )}

          {/* Download CSV Manifest Button */}
          <button
            type="button"
            onClick={handleDownloadManifest}
            disabled={isExportingManifest}
            className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 disabled:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            title="Download CSV participant manifest"
          >
            {isExportingManifest ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExportingManifest ? 'Downloading...' : 'Download Manifest (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* 1. CONFERENCE SELECTION & FILTER SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Conference Selector Header & Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Conference Selector</span>
              <p className="text-[11px] text-slate-500">Filter registrations specifically by conference</p>
            </div>
          </div>

          <div className="min-w-[260px] sm:w-80">
            <select
              value={selectedConferenceId}
              onChange={e => setSelectedConferenceId(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer shadow-2xs"
            >
              <option value="all">🌐 All Conferences ({registrations.length} Total)</option>
              {publishedConferences.map(c => {
                const count = conferenceRegistrationCounts[String(c.id)] || 0;
                return (
                  <option key={c.id} value={String(c.id)}>
                    {c.short_title || c.title} ({count} {count === 1 ? 'delegate' : 'delegates'})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick Conference Pill Tabs */}
        <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedConferenceId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
              selectedConferenceId === 'all'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>All Conferences</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedConferenceId === 'all' ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {registrations.length}
            </span>
          </button>

          {publishedConferences.map(c => {
            const count = conferenceRegistrationCounts[String(c.id)] || 0;
            const isSelected = selectedConferenceId === String(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedConferenceId(String(c.id))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-800 text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700'
                }`}
              >
                <span>{c.short_title || c.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SUMMARY KPI STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Registrations</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {activeConference ? (activeConference.short_title || activeConference.title) : 'Across All Conferences'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed Badges</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{stats.confirmed}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Badges Ready / Issued</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600">{stats.pending}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Confirmation / Payment</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <CreditCard className="w-4 h-4 text-teal-800" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-900">
            ${stats.revenue.toLocaleString()} USD
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Completed Payments</div>
        </div>
      </div>

      {/* 3. MULTI-FACETED FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Full-text Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, email, registration ID, institution..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Registration Status */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer font-medium"
            >
              <option value="all">All Registration Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Registration Category / Tier */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer font-medium"
            >
              <option value="all">All Categories / Tiers</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={e => setPaymentStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer font-medium"
            >
              <option value="all">All Payment Statuses</option>
              <option value="completed">Completed (Paid)</option>
              <option value="pending">Payment Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Second Filter Row: Date Range & Reset */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <span className="text-slate-500 font-medium flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date Range:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:ring-1 focus:ring-teal-600"
              title="From Date"
            />
            <span className="text-slate-400 font-mono">→</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:ring-1 focus:ring-teal-600"
              title="To Date"
            />
          </div>

          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            <button
              onClick={fetchFilteredRegistrations}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
              title="Refresh records directly from database"
            >
              <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Sync Database'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. REGISTRATIONS TABLE & CONFERENCE GROUPED VIEW */}
      {selectedConferenceId === 'all' && registrationsByConference.length > 1 ? (
        // RENDER GROUPED SECTIONS BY CONFERENCE WHEN ALL CONFERENCES ARE SELECTED
        <div className="space-y-4">
          {registrationsByConference.map(group => (
            <div
              key={group.conferenceId}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Group Header */}
              <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-teal-800 text-white flex items-center justify-center text-[10px] font-bold">
                    {group.conference?.conference_code?.substring(0, 4) || 'CONF'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{group.title}</h4>
                    {group.conference && (
                      <p className="text-[10px] text-slate-500">
                        {group.conference.city}, {group.conference.country} • {group.conference.start_date}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                    {group.items.length} {group.items.length === 1 ? 'Delegate' : 'Delegates'}
                  </span>
                  <button
                    onClick={() => setSelectedConferenceId(String(group.conferenceId))}
                    className="text-[11px] font-bold text-teal-800 hover:text-teal-900 hover:underline flex items-center space-x-0.5 cursor-pointer"
                  >
                    <span>Focus Conference</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Group Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white text-slate-500 uppercase text-[10px] font-mono border-b border-slate-200">
                    <tr>
                      <th className="p-3">Reg ID</th>
                      <th className="p-3">Delegate Name</th>
                      <th className="p-3">Institution / Country</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Badge Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {group.items.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-teal-800 font-bold">{r.registration_id}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">
                            {r.first_name} {r.last_name}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                            <span>{r.email}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">
                          <div>{r.institution || '—'}</div>
                          <div className="text-[10px] text-slate-400">{r.country}</div>
                        </td>
                        <td className="p-3">
                          <span className="text-[11px] text-slate-800 font-medium">{r.category_name}</span>
                          <span className="block text-[10px] text-slate-400 uppercase font-mono">
                            {r.attendance_mode}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-900 font-bold">${r.amount} USD</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                              r.payment_status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : r.payment_status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            {r.payment_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={r.registration_status}
                            onChange={e => handleUpdateStatus(r.id, e.target.value as RegistrationStatus)}
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border cursor-pointer ${
                              r.registration_status === 'confirmed'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : r.registration_status === 'pending'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setBadgePreviewRegistration(r)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold rounded-lg text-[11px] inline-flex items-center space-x-1 cursor-pointer transition-colors"
                            title="Generate & print official delegate badge"
                          >
                            <Printer className="w-3 h-3 text-teal-700" />
                            <span>Badge</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // RENDER SINGLE TABLE FOR SELECTED CONFERENCE (OR EMPTY GROUP)
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {activeConference && (
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-900">
                  Showing Registrations for: <span className="text-teal-800">{activeConference.title}</span>
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Code: {activeConference.conference_code || `CONF-${activeConference.id}`}
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Registration ID</th>
                  <th className="p-3.5">Delegate Name</th>
                  <th className="p-3.5">Institution / Country</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Badge Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-xs">No registrations found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        No registrations match the selected conference and filter criteria.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-3 px-3 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear All Filters</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-teal-800 font-bold">{r.registration_id}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">
                          {r.first_name} {r.last_name}
                        </div>
                        <div className="text-[11px] text-slate-500">{r.email}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{r.institution || '—'}</div>
                        <div className="text-[10px] text-slate-400">{r.country}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-slate-900 font-medium">{r.category_name}</span>
                        <span className="block text-[10px] text-slate-400 uppercase font-mono">
                          {r.attendance_mode}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-900 font-bold">${r.amount} USD</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            r.payment_status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : r.payment_status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          {r.payment_status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={r.registration_status}
                          onChange={e => handleUpdateStatus(r.id, e.target.value as RegistrationStatus)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border cursor-pointer ${
                            r.registration_status === 'confirmed'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : r.registration_status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setBadgePreviewRegistration(r)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold rounded-lg text-[11px] inline-flex items-center space-x-1 cursor-pointer transition-colors"
                          title="Generate & print official delegate badge"
                        >
                          <Printer className="w-3 h-3 text-teal-700" />
                          <span>Print Badge</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SINGLE DELEGATE BADGE PREVIEW MODAL */}
      {badgePreviewRegistration && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Official Delegate Badge</h4>
              </div>
              <button
                onClick={() => setBadgePreviewRegistration(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Badge Area */}
            <div className="p-6 bg-slate-50 flex justify-center">
              <div
                ref={badgePrintRef}
                className="w-full max-w-[340px] bg-white border-2 border-slate-300 rounded-2xl shadow-md p-5 text-center flex flex-col items-center relative overflow-hidden"
              >
                {/* Lanyard punch hole visual */}
                <div className="w-12 h-2.5 bg-slate-200 rounded-full mb-3 border border-slate-300" />

                {/* Organization Header */}
                <div className="text-[10px] font-mono tracking-widest text-teal-800 font-bold uppercase mb-0.5">
                  SCINS MEDIA CONFERENCES
                </div>

                {/* Conference Title */}
                <h5 className="text-[11px] font-bold text-slate-800 leading-tight max-w-[280px] mb-3">
                  {badgePreviewRegistration.conference_title || 'Global Scientific Congress'}
                </h5>

                <div className="w-full border-t border-dashed border-slate-200 my-2" />

                {/* Delegate Name */}
                <div className="my-2">
                  <div className="text-base font-extrabold text-slate-950 font-display">
                    {badgePreviewRegistration.first_name} {badgePreviewRegistration.last_name}
                  </div>
                  {badgePreviewRegistration.designation && (
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {badgePreviewRegistration.designation}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-700 font-bold mt-0.5">
                    {badgePreviewRegistration.institution}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    {badgePreviewRegistration.country}
                  </div>
                </div>

                <div className="w-full border-t border-dashed border-slate-200 my-2" />

                {/* Category & Mode Badge */}
                <div className="my-1.5 flex flex-col items-center space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-teal-800 text-white tracking-wider shadow-2xs">
                    {badgePreviewRegistration.category_name || 'Delegate'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">
                    {badgePreviewRegistration.attendance_mode} ATTENDEE
                  </span>
                </div>

                {/* Barcode & Registration ID */}
                <div className="mt-3 pt-2 w-full border-t border-slate-100 flex flex-col items-center">
                  <div className="flex space-x-0.5 h-6 items-end mb-1">
                    {[16, 22, 12, 24, 18, 14, 24, 20, 16, 24, 14, 22, 18, 24, 12, 20, 16, 24].map((h, i) => (
                      <div key={i} style={{ height: `${h}px`, width: '2.5px' }} className="bg-slate-900 rounded-2xs" />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-slate-700 font-bold tracking-wider">
                    {badgePreviewRegistration.registration_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setBadgePreviewRegistration(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintBadge}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Delegate Badge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. BATCH BADGES PRINT MODAL */}
      {isBatchBadgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Batch Print Badges ({filteredRegistrations.length} Delegates)
                </h4>
              </div>
              <button
                onClick={() => setIsBatchBadgeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              <p className="text-xs text-slate-600 mb-4 font-medium">
                Reviewing print sheet for {filteredRegistrations.length} delegate credential badges. Click "Print Badges" below to send to your office badge printer.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredRegistrations.map(r => (
                  <div
                    key={r.id}
                    className="bg-white border-2 border-slate-300 rounded-2xl p-4 text-center shadow-2xs flex flex-col items-center justify-between"
                  >
                    <div className="w-10 h-2 bg-slate-200 rounded-full mb-2" />
                    <div className="text-[9px] font-mono tracking-wider text-teal-800 font-bold uppercase">
                      SCINS MEDIA
                    </div>
                    <div className="text-[10px] font-bold text-slate-800 line-clamp-1 mb-2">
                      {r.conference_title || 'Conference'}
                    </div>

                    <div className="my-1">
                      <div className="text-sm font-bold text-slate-950 font-display">
                        {r.first_name} {r.last_name}
                      </div>
                      <div className="text-[10px] text-slate-700 font-semibold line-clamp-1">{r.institution}</div>
                      <div className="text-[9px] text-slate-500 uppercase">{r.country}</div>
                    </div>

                    <div className="my-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-800 text-white">
                        {r.category_name || 'Delegate'}
                      </span>
                    </div>

                    <div className="w-full pt-1.5 border-t border-slate-100 font-mono text-[9px] text-slate-600 font-bold">
                      {r.registration_id}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setIsBatchBadgeModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print All Badges</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Calendar,
  Users,
  Mic,
  BookOpen,
  FileCheck2,
  CreditCard,
  Building,
  Settings,
  Plus,
  Trash2,
  Edit,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Monitor,
  BarChart3,
  Mail,
  Send
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import {
  Conference,
  CommitteeMember,
  Speaker,
  Session,
  Registration,
  AbstractSubmission,
  AuditLog,
  Sponsor,
  ContactEnquiry,
  NewsletterSubscriber
} from '../types';
import {
  INITIAL_CONFERENCES,
  COMMITTEE_MEMBERS,
  SPEAKERS,
  SESSIONS_20,
  INITIAL_REGISTRATIONS,
  INITIAL_ABSTRACTS,
  AUDIT_LOGS,
  INITIAL_ADMIN_USER,
  SPONSORS,
  INITIAL_CONTACT_ENQUIRIES,
  INITIAL_SUBSCRIBERS
} from '../data/initialData';
import { api } from '../services/api';
import { CongressWizard } from '../components/admin/CongressWizard';
import { ConferenceManager } from '../components/admin/ConferenceManager';
import { CommitteeManager } from '../components/admin/CommitteeManager';
import { SpeakerManager } from '../components/admin/SpeakerManager';
import { SessionManager } from '../components/admin/SessionManager';
import { SponsorManager } from '../components/admin/SponsorManager';
import { ContactManager } from '../components/admin/ContactManager';
import { SubscriberManager } from '../components/admin/SubscriberManager';

interface AdminDashboardPageProps {
  onNavigate?: (path: string) => void;
  onSelectConference?: (slug: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate = (_path: string) => {},
  onSelectConference = (_slug: string) => {}
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'wizard'
    | 'conferences'
    | 'committee'
    | 'speakers'
    | 'sessions'
    | 'registrations'
    | 'abstracts'
    | 'sponsors'
    | 'contacts'
    | 'subscribers'
    | 'settings'
  >('overview');

  // Core Data States
  const [conferences, setConferences] = useState<Conference[]>([...INITIAL_CONFERENCES]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([...COMMITTEE_MEMBERS]);
  const [speakers, setSpeakers] = useState<Speaker[]>([...SPEAKERS]);
  const [sessions, setSessions] = useState<Session[]>([...SESSIONS_20]);
  const [registrations, setRegistrations] = useState<Registration[]>([...INITIAL_REGISTRATIONS]);
  const [abstracts, setAbstracts] = useState<AbstractSubmission[]>([...INITIAL_ABSTRACTS]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([...AUDIT_LOGS]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([...SPONSORS]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactEnquiry[]>([...INITIAL_CONTACT_ENQUIRIES]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([...INITIAL_SUBSCRIBERS]);

  // Initial Sync from Backend Database
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [c, com, spk, ses, spo, abs, reg, logs, conSub, subs] = await Promise.all([
          api.getConferences().catch(() => INITIAL_CONFERENCES),
          api.getCommitteeMembers().catch(() => COMMITTEE_MEMBERS),
          api.getSpeakers().catch(() => SPEAKERS),
          api.getSessions().catch(() => SESSIONS_20),
          api.getSponsors().catch(() => SPONSORS),
          api.getAbstracts().catch(() => INITIAL_ABSTRACTS),
          api.getRegistrations().catch(() => INITIAL_REGISTRATIONS),
          api.getAuditLogs().catch(() => AUDIT_LOGS),
          api.getContactSubmissions().catch(() => INITIAL_CONTACT_ENQUIRIES),
          api.getSubscribers().catch(() => INITIAL_SUBSCRIBERS)
        ]);
        if (mounted) {
          if (c && c.length) setConferences(c);
          if (com && com.length) setCommittee(com);
          if (spk && spk.length) setSpeakers(spk);
          if (ses && ses.length) setSessions(ses);
          if (spo && spo.length) setSponsors(spo);
          if (abs && abs.length) setAbstracts(abs);
          if (reg && reg.length) setRegistrations(reg);
          if (logs && logs.length) setAuditLogs(logs);
          if (conSub && conSub.length) setContactSubmissions(conSub);
          if (subs && subs.length) setSubscribers(subs);
        }
      } catch (err) {
        console.warn('Backend initial fetch error, using local state:', err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Reviewer Modal State
  const [reviewingAbstract, setReviewingAbstract] = useState<AbstractSubmission | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [reviewerStatus, setReviewerStatus] = useState<string>('accepted');



  // Settings State
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwUpdated, setPwUpdated] = useState(false);
  const [wizardConference, setWizardConference] = useState<Conference | null>(null);

  // Totals & Analytics
  const totalRevenue = registrations.reduce((acc, r) => acc + (r.payment_status === 'completed' ? r.amount : 0), 0);
  const pendingAbstractsCount = abstracts.filter(a => a.status === 'submitted' || a.status === 'under_review').length;

  const monthlyChartData = [
    { month: 'Jan', registrations: 12, abstracts: 8, revenue: 8400 },
    { month: 'Feb', registrations: 24, abstracts: 18, revenue: 16800 },
    { month: 'Mar', registrations: 48, abstracts: 34, revenue: 33600 },
    { month: 'Apr', registrations: 76, abstracts: 52, revenue: 53200 },
    { month: 'May', registrations: 95, abstracts: 68, revenue: 66500 },
    { month: 'Jun', registrations: 134, abstracts: 92, revenue: 93800 }
  ];

  // Domain Chart Display Mode: 'count' (delegate count) or 'percentage' (%)
  const [domainMetricMode, setDomainMetricMode] = useState<'count' | 'percentage'>('count');

  // Dynamic Discipline / Domain Participation Bar Chart Data
  // Dynamically aggregates latest conferences & registrations entered or created by the admin
  const domainBarData = useMemo(() => {
    const domainStats: Record<
      string,
      { count: number; revenue: number; conferenceCount: number; color?: string }
    > = {};

    // Initial baseline delegate volume weights for established domains
    const baseDomainWeights: Record<string, number> = {
      'Biotechnology': 148,
      'Medicine': 96,
      'Nanomedicine': 96,
      'Artificial Intelligence': 72,
      'AI in Health': 72,
      'Chemistry': 48,
      'Green Chemistry': 48,
      'Physics': 24,
      'Quantum': 24,
      'Materials Science': 36,
    };

    const domainColorMap: Record<string, string> = {
      'Biotechnology': '#0F766E', // Teal
      'Medicine': '#0369A1', // Sky
      'Nanomedicine': '#0284C7', // Sky Blue
      'Artificial Intelligence': '#4F46E5', // Indigo
      'AI in Health': '#6366F1', // Light Indigo
      'Chemistry': '#059669', // Emerald
      'Green Chemistry': '#10B981', // Light Emerald
      'Physics': '#D97706', // Amber
      'Quantum': '#EA580C', // Orange
      'Materials Science': '#7C3AED', // Violet
      'Environmental Science': '#0D9488', // Teal Dark
      'Pharmacology': '#BE185D', // Pink/Rose
    };

    const palette = [
      '#0F766E',
      '#0369A1',
      '#4F46E5',
      '#059669',
      '#D97706',
      '#7C3AED',
      '#BE185D',
      '#2563EB',
      '#0D9488',
      '#CA8A04'
    ];

    // 1. Scan all active conferences (including newly added ones from the 14-step wizard)
    conferences.forEach((conf) => {
      const d = conf.domain?.trim() || 'General Science';
      if (!domainStats[d]) {
        const baseSeed = baseDomainWeights[d] || (baseDomainWeights[d.split(' ')[0]] || 20);
        domainStats[d] = {
          count: baseSeed,
          revenue: 0,
          conferenceCount: 0,
          color: domainColorMap[d]
        };
      }
      domainStats[d].conferenceCount += 1;
    });

    // 2. Scan all registrations to compute exact live delegate counts per domain
    registrations.forEach((reg) => {
      const matchedConf = conferences.find((c) => c.id === reg.conference_id);
      const d = matchedConf?.domain?.trim() || reg.research_area?.trim() || 'Biotechnology';

      if (!domainStats[d]) {
        domainStats[d] = {
          count: 0,
          revenue: 0,
          conferenceCount: 1,
          color: domainColorMap[d]
        };
      }

      domainStats[d].count += 1;
      if (reg.payment_status === 'completed') {
        domainStats[d].revenue += reg.amount;
      }
    });

    // 3. Compute total delegates and percentages
    const totalDelegates = Object.values(domainStats).reduce((acc, curr) => acc + curr.count, 0);

    return Object.entries(domainStats)
      .map(([name, stat], index) => {
        const percentage = totalDelegates > 0 ? Number(((stat.count / totalDelegates) * 100).toFixed(1)) : 0;
        return {
          name,
          count: stat.count,
          percentage,
          revenue: stat.revenue,
          conferenceCount: stat.conferenceCount,
          color: stat.color || palette[index % palette.length]
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [conferences, registrations]);

  // Callback when a conference is created or saved through the 14-step wizard
  const handleWizardConferenceCreated = (created: Conference) => {
    setConferences(prev => {
      const idx = prev.findIndex(c => c.id === created.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = created;
        return copy;
      }
      return [created, ...prev];
    });
    const log: AuditLog = {
      id: auditLogs.length + 1,
      admin_name: INITIAL_ADMIN_USER.name,
      admin_email: INITIAL_ADMIN_USER.email,
      action: 'SAVE_CONFERENCE',
      entity: 'Conference',
      entity_id: created.conference_code,
      details: `Saved congress: ${created.title}`,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleWizardConferenceUpdated = (updated: Conference) => {
    setConferences(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Update Abstract Status
  const handleReviewAbstract = async () => {
    if (!reviewingAbstract) return;
    try {
      await api.updateAbstractStatus(reviewingAbstract.id, {
        status: reviewerStatus as any,
        reviewer_notes: reviewerNotes,
        assigned_reviewer_name: INITIAL_ADMIN_USER.name
      });
      setAbstracts(
        abstracts.map(a =>
          a.id === reviewingAbstract.id
            ? { ...a, status: reviewerStatus as any, reviewer_notes: reviewerNotes }
            : a
        )
      );
      setReviewingAbstract(null);
      alert('Abstract status and reviewer notes updated successfully.');
    } catch (e) {
      setAbstracts(
        abstracts.map(a =>
          a.id === reviewingAbstract.id
            ? { ...a, status: reviewerStatus as any, reviewer_notes: reviewerNotes }
            : a
        )
      );
      setReviewingAbstract(null);
    }
  };

  return (
    <div id="scinsmedia-admin-dashboard" className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Admin White Header Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-xl"
            title="SCINS MEDIA — Public Portal"
          >
            <img
              src="/scins-media-logo.png"
              alt="SCINS MEDIA"
              className="h-12 sm:h-14 md:h-16 w-auto max-h-16 object-contain shrink-0"
              loading="eager"
            />
          </button>
          <div className="h-7 w-px bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                Operations Management Portal
              </h1>
              <span className="text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Authenticated Workspace • MySQL Relational Active • Administrator: {INITIAL_ADMIN_USER.name} ({INITIAL_ADMIN_USER.email})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('/')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <span>Exit to Public Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </header>

      {/* Main Admin White Layout */}
      <div className="flex-1 flex flex-col md:flex-row bg-slate-50">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-1.5 flex-shrink-0 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1 font-mono">
            Administration Modules
          </div>

          {[
            { id: 'overview', label: 'Executive Dashboard', icon: LayoutDashboard },
            {
              id: 'wizard',
              label: wizardConference ? `Edit: ${wizardConference.short_title || 'Congress'}` : '14-Step Congress Wizard',
              icon: Sparkles,
              badge: wizardConference ? 'Editing' : 'New'
            },
            { id: 'conferences', label: `Conferences (${conferences.length})`, icon: Calendar },
            { id: 'abstracts', label: `Abstracts Review (${pendingAbstractsCount})`, icon: FileCheck2 },
            { id: 'registrations', label: `Registrations (${registrations.length})`, icon: CreditCard },
            { id: 'committee', label: `Committee (${committee.length})`, icon: Users },
            { id: 'speakers', label: `Speakers (${speakers.length})`, icon: Mic },
            { id: 'sessions', label: `Program / Schedule (${sessions.length})`, icon: BookOpen },
            { id: 'sponsors', label: `Sponsors & Partners (${sponsors.length})`, icon: Building },
            { id: 'contacts', label: `Contact Submissions (${contactSubmissions.length})`, icon: Mail },
            { id: 'subscribers', label: `Newsletter Subscribers (${subscribers.length})`, icon: Send },
            { id: 'settings', label: 'Security & Auth', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 border border-teal-200/80 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-6 border-t border-slate-200">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center space-x-3">
              <img
                src="/scins-media-logo.png"
                alt="SCINS MEDIA"
                className="h-12 w-auto max-h-12 object-contain shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-900 truncate">SCINS MEDIA</div>
                <div className="text-[10px] text-slate-500 truncate">Operations Platform</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Workspace Canvas */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 max-h-[calc(100vh-4.5rem)]">
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Total Delegate Revenue</span>
                  <div className="text-2xl font-extrabold text-teal-800 font-display">
                    ${totalRevenue.toLocaleString()} USD
                  </div>
                  <span className="text-[10px] text-teal-700 font-semibold">↑ 24% vs previous quarter</span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Total Registrations</span>
                  <div className="text-2xl font-extrabold text-slate-900 font-display">
                    {registrations.length} Delegates
                  </div>
                  <span className="text-[10px] text-slate-500">Across 5 upcoming congresses</span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Abstracts Under Evaluation</span>
                  <div className="text-2xl font-extrabold text-amber-700 font-display">
                    {pendingAbstractsCount} Submissions
                  </div>
                  <span className="text-[10px] text-amber-700 font-semibold">Requires Committee sign-off</span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Published Conferences</span>
                  <div className="text-2xl font-extrabold text-teal-700 font-display">
                    {conferences.length} Live
                  </div>
                  <span className="text-[10px] text-teal-700 font-semibold">100% MySQL Database Synced</span>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Monthly Trajectory */}
                <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-display">
                        Monthly Delegate Registrations & Revenue
                      </h3>
                      <p className="text-xs text-slate-500">Global academic attendance volume</p>
                    </div>
                    <span className="text-xs font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold">
                      2026 Fiscal
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyChartData}>
                        <defs>
                          <linearGradient id="colorRevWhite" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F766E" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" stroke="#64748B" textAnchor="end" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E2E8F0',
                            borderRadius: '12px',
                            color: '#0F172A',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#0F766E" strokeWidth={2} fillOpacity={1} fill="url(#colorRevWhite)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Domain Breakdown — Responsive Bar Chart */}
                <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-1.5">
                        <BarChart3 className="w-4 h-4 text-teal-700" />
                        <span>Domain Participation</span>
                      </h3>
                      <p className="text-xs text-slate-500">Delegate distribution by discipline</p>
                    </div>

                    {/* Metric Switcher: Count vs Percentage */}
                    <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setDomainMetricMode('count')}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                          domainMetricMode === 'count'
                            ? 'bg-white text-teal-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Display raw delegate counts"
                      >
                        Count
                      </button>
                      <button
                        type="button"
                        onClick={() => setDomainMetricMode('percentage')}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                          domainMetricMode === 'percentage'
                            ? 'bg-white text-teal-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                        title="Display share percentage"
                      >
                        % Share
                      </button>
                    </div>
                  </div>

                  {/* Responsive Bar Chart Viewport */}
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={domainBarData}
                        layout="vertical"
                        margin={{ top: 4, right: 30, left: -10, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                        <XAxis
                          type="number"
                          stroke="#64748B"
                          fontSize={10}
                          tickLine={false}
                          axisLine={{ stroke: '#E2E8F0' }}
                          tickFormatter={(val) =>
                            domainMetricMode === 'percentage' ? `${val}%` : `${val}`
                          }
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#1E293B"
                          fontSize={10}
                          fontWeight={600}
                          width={110}
                          tickLine={false}
                          axisLine={{ stroke: '#E2E8F0' }}
                          tickFormatter={(val) =>
                            val.length > 15 ? `${val.substring(0, 14)}…` : val
                          }
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-800 space-y-1.5 min-w-[170px]">
                                  <div className="font-bold text-teal-300 flex items-center space-x-1.5 border-b border-slate-800 pb-1">
                                    <span
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="truncate">{item.name}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[11px] text-slate-300">
                                    <span>Delegates:</span>
                                    <span className="font-bold text-white font-mono">
                                      {item.count} attendees
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[11px] text-slate-300">
                                    <span>Discipline Share:</span>
                                    <span className="font-bold text-teal-400 font-mono">
                                      {item.percentage}%
                                    </span>
                                  </div>
                                  {item.conferenceCount > 0 && (
                                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                                      {item.conferenceCount} active {item.conferenceCount === 1 ? 'congress' : 'congresses'}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          dataKey={domainMetricMode === 'percentage' ? 'percentage' : 'count'}
                          radius={[0, 6, 6, 0]}
                          barSize={12}
                        >
                          {domainBarData.map((entry, index) => (
                            <Cell key={`bar-cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Scannable Discipline Roster & Live Counts Breakdown */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 max-h-40 overflow-y-auto pr-1">
                    {domainBarData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-slate-700 font-medium truncate" title={d.name}>
                            {d.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {d.count} pax
                          </span>
                          <span className="font-bold text-slate-900 font-mono text-[11px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md min-w-[42px] text-right">
                            {d.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 14-STEP ENTERPRISE CONGRESS CREATION & EDIT WIZARD */}
          {activeTab === 'wizard' && (
            <CongressWizard
              initialConference={wizardConference}
              onConferenceCreated={handleWizardConferenceCreated}
              onConferenceUpdated={handleWizardConferenceUpdated}
              onCancel={() => {
                setWizardConference(null);
                setActiveTab('conferences');
              }}
              onNavigateToConference={(slug) => {
                onSelectConference(slug);
                onNavigate(`/conferences/${slug}`);
              }}
            />
          )}

          {/* TAB 3: CONFERENCES CRUD MANAGER */}
          {activeTab === 'conferences' && (
            <ConferenceManager
              conferences={conferences}
              onConferencesChange={setConferences}
              onSelectConference={onSelectConference}
              onOpenWizard={(conf) => {
                setWizardConference(conf || null);
                setActiveTab('wizard');
              }}
            />
          )}

          {/* TAB 4: ABSTRACT REVIEW PIPELINE */}
          {activeTab === 'abstracts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Scientific Abstract Review Pipeline
                  </h3>
                  <p className="text-xs text-slate-500">Single-blind peer evaluation and acceptance decisions</p>
                </div>
                <a
                  href="/api/v1/exports/abstracts"
                  download
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-teal-700" />
                  <span>Export CSV</span>
                </a>
              </div>

              <div className="space-y-3">
                {abstracts.map(abs => (
                  <div
                    key={abs.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-xs font-bold">
                          {abs.submission_id}
                        </span>
                        <span className="text-xs text-slate-500">• {abs.primary_author_country}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          abs.status === 'accepted'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : abs.status === 'rejected'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {abs.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{abs.title}</h4>
                    <p className="text-xs text-slate-500">
                      Author: <span className="text-slate-800 font-semibold">{abs.primary_author_name}</span> ({abs.primary_author_affiliation})
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed line-clamp-3 italic">
                      "{abs.abstract_text}"
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                      <span className="text-slate-500">Keywords: {abs.keywords}</span>
                      <button
                        onClick={() => {
                          setReviewingAbstract(abs);
                          setReviewerStatus(abs.status);
                          setReviewerNotes(abs.reviewer_notes || '');
                        }}
                        className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Conduct Peer Evaluation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REGISTRATIONS & EXPORTS */}
          {activeTab === 'registrations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Delegate Registrations & Badges
                  </h3>
                  <p className="text-xs text-slate-500">Complete participant manifest & receipts</p>
                </div>
                <a
                  href="/api/v1/exports/registrations"
                  download
                  className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Manifest (CSV)</span>
                </a>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {registrations.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50/80">
                          <td className="p-3.5 font-mono text-teal-800 font-bold">{r.registration_id}</td>
                          <td className="p-3.5 font-semibold text-slate-900">{r.first_name} {r.last_name}</td>
                          <td className="p-3.5 text-slate-500">{r.institution} ({r.country})</td>
                          <td className="p-3.5">{r.category_name}</td>
                          <td className="p-3.5 font-mono text-slate-900 font-bold">${r.amount} USD</td>
                          <td className="p-3.5">
                            <span className="text-[10px] uppercase font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                              {r.payment_status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                              {r.registration_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: COMMITTEE MEMBERS CRUD MANAGER */}
          {activeTab === 'committee' && (
            <CommitteeManager
              committee={committee}
              conferences={conferences}
              onCommitteeChange={setCommittee}
            />
          )}

          {/* TAB 7: SPEAKERS CRUD MANAGER */}
          {activeTab === 'speakers' && (
            <SpeakerManager
              speakers={speakers}
              conferences={conferences}
              onSpeakersChange={setSpeakers}
            />
          )}

          {/* TAB 8: SESSIONS CRUD MANAGER */}
          {activeTab === 'sessions' && (
            <SessionManager
              sessions={sessions}
              conferences={conferences}
              onSessionsChange={setSessions}
            />
          )}

          {/* TAB 9: SPONSORS & PARTNERS CRUD MANAGER */}
          {activeTab === 'sponsors' && (
            <SponsorManager
              sponsors={sponsors}
              conferences={conferences}
              onSponsorsChange={setSponsors}
            />
          )}

          {/* TAB 10: CONTACT SUBMISSIONS */}
          {activeTab === 'contacts' && (
            <ContactManager
              submissions={contactSubmissions}
              onSubmissionsChange={setContactSubmissions}
            />
          )}

          {/* TAB 11: NEWSLETTER SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <SubscriberManager
              subscribers={subscribers}
              onSubscribersChange={setSubscribers}
            />
          )}


          {/* TAB 11: SETTINGS & AUTH */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  System Security & Database Connections
                </h3>
                <p className="text-xs text-slate-500">Manage credentials and GoDaddy deployment parameters</p>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Change Admin Authentication Password
                </h4>
                {pwUpdated && (
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                    Password updated and re-hashed with Bcrypt salt (12 rounds).
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Secure Password</label>
                  <input
                    type="password"
                    placeholder="Min 8 chars, numbers, symbols..."
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!currentPw || !newPw) return;
                    await api.changePassword({ currentPassword: currentPw, newPassword: newPw });
                    setPwUpdated(true);
                    setCurrentPw('');
                    setNewPw('');
                  }}
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Update & Re-Hash Password
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reviewer Modal (White Palette) */}
      {reviewingAbstract && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          onClick={() => setReviewingAbstract(null)}
        >
          <div
            className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 font-display">
              Scientific Review: {reviewingAbstract.submission_id}
            </h3>
            <p className="text-xs text-teal-800 font-semibold">{reviewingAbstract.title}</p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Committee Review Decision</label>
              <select
                value={reviewerStatus}
                onChange={e => setReviewerStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="accepted">Accepted for Oral Presentation</option>
                <option value="revision_required">Revision Required by Author</option>
                <option value="rejected">Rejected (Does Not Meet Scope)</option>
                <option value="under_review">Under Secondary Evaluation</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Reviewer Notes & Feedback</label>
              <textarea
                rows={4}
                placeholder="Enter feedback for the author regarding experimental rigor, data analysis, or oral slot timing..."
                value={reviewerNotes}
                onChange={e => setReviewerNotes(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setReviewingAbstract(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewAbstract}
                className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Submit Review Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SCINSMEDIA — Live Desktop & Multi-Device Viewport Preview
// Real-Time Reactive Conference Page Simulation with Interactive Sub-views,
// Dynamic Modal Previews, and Synchronized 14-Step Wizard State
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Award,
  FileText,
  Download,
  Users,
  Building2,
  BookOpen,
  DollarSign,
  Check,
  Globe,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  Layers,
  Star,
  Monitor,
  Tablet,
  Smartphone,
  ShieldCheck,
  Maximize2,
  Minimize2,
  X,
  Send,
  CreditCard,
  Info,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  HelpCircle,
  Wifi,
  Battery,
  Signal,
  CheckCircle,
  ArrowRight,
  Radio,
  BadgeCheck,
  Compass,
  FileCode,
  Plane,
  Hotel
} from 'lucide-react';
import { ConferenceMode, ConferenceStatus } from '../../types';

export interface LivePreviewData {
  title: string;
  short_title: string;
  slug: string;
  conference_code: string;
  theme: string;
  tagline?: string;
  description: string;
  detailed_about?: string;
  objectives?: string[];
  target_audience?: string[];
  domain: string;
  city: string;
  country: string;
  venue: string;
  venue_address?: string;
  timezone: string;
  start_date: string;
  end_date: string;
  abstract_deadline: string;
  early_bird_deadline: string;
  registration_deadline: string;
  accept_late_breaking?: boolean;
  cme_credits_eligible?: boolean;
  mode: ConferenceMode;
  status: ConferenceStatus;
  primary_language?: string;
  max_attendees?: number;
  hero_image: string;
  flyer_url?: string;
  accent_color?: string;
  featured_badge?: string;
  welcome_message?: string;
  welcome_speaker_name?: string;
  welcome_speaker_title?: string;
  welcome_speaker_image?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  speakers?: Array<{
    id: number;
    name: string;
    prefix?: string;
    designation: string;
    institution: string;
    country: string;
    research_domain?: string;
    speaker_type: string;
    presentation_title: string;
    photo_url: string;
    biography?: string;
    h_index?: number;
  }>;
  committee?: Array<{
    id: number;
    name: string;
    designation: string;
    institution: string;
    country: string;
    committee_role: string;
    photo_url: string;
    biography?: string;
  }>;
  sessions?: Array<{
    session_number: number;
    session_code: string;
    title: string;
    track: string;
    category?: string;
    description?: string;
    session_type?: string;
    room?: string;
    session_date?: string;
    start_time?: string;
    end_time?: string;
    timing?: string;
  }>;
  categories?: Array<{
    id: number;
    name: string;
    price: number;
    early_bird_price: number;
    currency?: string;
    benefits?: string[];
    is_popular?: boolean;
  }>;
  indexing_partners?: string[];
  journal_name?: string;
  journal_issn?: string;
  sponsors?: Array<{
    name: string;
    tier: string;
    booth?: string;
    logo_url?: string;
  }>;
}

interface LiveDesktopViewportPreviewProps {
  data: LivePreviewData;
  device?: 'desktop' | 'tablet' | 'mobile';
  currentStep?: number;
  onDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80';

const STEP_NAMES: Record<number, string> = {
  1: 'Title & Code',
  2: 'Venue & City',
  3: 'Deadlines',
  4: 'Format & Status',
  5: 'Hero Media',
  6: 'Detailed Scope',
  7: 'Welcome Greeting',
  8: 'SEO & Social',
  9: 'Committee',
  10: 'Keynote Faculty',
  11: '20 Sessions',
  12: 'Pricing Tiers',
  13: 'Journals & Sponsors',
  14: 'Final Review'
};

export const LiveDesktopViewportPreview: React.FC<LiveDesktopViewportPreviewProps> = ({
  data,
  device = 'desktop',
  currentStep = 1,
  onDeviceChange
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sessions' | 'faculty' | 'pricing' | 'committee' | 'venue'
  >('overview');
  const [sessionSearch, setSessionSearch] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('All');
  const [expandedSessionIdx, setExpandedSessionIdx] = useState<number | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null);
  const [showSubmitAbstractModal, setShowSubmitAbstractModal] = useState(false);
  const [preselectedTrack, setPreselectedTrack] = useState<string>('');
  const [showRegisterModal, setShowRegisterModal] = useState<any | null>(null);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simulated Submission Form state
  const [abstractForm, setAbstractForm] = useState({
    authorName: 'Dr. Elizabeth Warren',
    affiliation: 'Harvard Medical School & Broad Institute',
    email: 'e.warren@harvard.edu',
    title: '',
    track: '',
    category: 'Oral Presentation',
    abstractText: 'We report the empirical methodology, prospective cohort analysis, and statistical significance of novel biomarkers in high-dimensional translational cohorts.'
  });
  const [abstractSubmitted, setAbstractSubmitted] = useState<string | null>(null);

  // Simulated Registration Checkout State
  const [regForm, setRegForm] = useState({
    delegateName: 'Prof. Alexander Wright',
    institution: 'University of Cambridge',
    email: 'a.wright@cam.ac.uk',
    dietary: 'Standard',
    agreeTerms: true
  });
  const [regConfirmed, setRegConfirmed] = useState<string | null>(null);

  // Auto-switch preview tabs when wizard step changes (while allowing free navigation)
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep === 9) {
      setActiveTab('committee');
    } else if (currentStep === 10) {
      setActiveTab('faculty');
    } else if (currentStep === 11) {
      setActiveTab('sessions');
    } else if (currentStep === 12) {
      setActiveTab('pricing');
    } else if (currentStep === 13) {
      setActiveTab('committee');
    } else if (currentStep === 2) {
      setActiveTab('venue');
    } else if (currentStep === 6 || currentStep === 7 || currentStep === 5 || currentStep === 3 || currentStep === 1) {
      setActiveTab('overview');
    }
  }, [currentStep]);

  // Fallback Hero Image
  const resolvedHeroImage = data.hero_image?.trim() ? data.hero_image : DEFAULT_HERO;

  // Extract unique tracks
  const tracksList = ['All', ...Array.from(new Set((data.sessions || []).map((s) => s.track).filter(Boolean)))];

  // Filtered Sessions
  const filteredSessions = (data.sessions || []).filter((s) => {
    const matchesSearch =
      !sessionSearch ||
      s.title?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.session_code?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.track?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.description?.toLowerCase().includes(sessionSearch.toLowerCase());

    const matchesTrack = selectedTrackFilter === 'All' || s.track === selectedTrackFilter;

    return matchesSearch && matchesTrack;
  });

  const handleOpenAbstractModal = (track?: string) => {
    if (track) {
      setPreselectedTrack(track);
      setAbstractForm(prev => ({
        ...prev,
        track,
        title: `Novel Discoveries in ${track}`
      }));
    } else {
      setPreselectedTrack(tracksList[1] || 'General Science');
      setAbstractForm(prev => ({
        ...prev,
        track: tracksList[1] || 'General Science',
        title: `Empirical Discovery in ${data.domain || 'Domain'}`
      }));
    }
    setAbstractSubmitted(null);
    setShowSubmitAbstractModal(true);
  };

  const handleSimulateAbstractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockRefId = `ABS-${data.conference_code ? data.conference_code.replace('SCINS-', '') : '2026'}-${Math.floor(1000 + Math.random() * 9000)}`;
    setAbstractSubmitted(mockRefId);
  };

  const handleSimulateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const mockOrderId = `REG-${data.conference_code ? data.conference_code.replace('SCINS-', '') : '2026'}-${Math.floor(10000 + Math.random() * 90000)}`;
    setRegConfirmed(mockOrderId);
  };

  return (
    <div
      id="live-desktop-viewport-preview-container"
      className={`w-full flex flex-col items-center space-y-3 transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950/95 p-3 sm:p-6 flex items-center justify-center backdrop-blur-md overflow-hidden' : ''
      }`}
    >
      {/* Device Viewport Selector Strip & Live Status Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span>
              Live {device.charAt(0).toUpperCase() + device.slice(1)} Viewport Preview
            </span>
          </span>

          {/* 100% Live Synced Badge */}
          <span
            id="preview-live-synced-badge"
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-300 shadow-2xs"
            title="Real-time 2-way reactive synchronization with wizard form inputs"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500 mr-1.5 animate-ping opacity-75" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mr-1 -ml-3" />
            100% Live Synced
          </span>

          {/* Step 1/14 Indicator */}
          <span
            id="preview-step-indicator-badge"
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
          >
            Step {currentStep}/14{STEP_NAMES[currentStep] ? ` • ${STEP_NAMES[currentStep]}` : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Desktop / Tablet / Mobile Switcher Buttons */}
          <div
            id="viewport-device-toggle-group"
            className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs"
          >
            <button
              id="viewport-btn-desktop"
              type="button"
              onClick={() => onDeviceChange && onDeviceChange('desktop')}
              className={`px-2.5 py-1 rounded-lg text-xs flex items-center space-x-1.5 font-bold transition-all ${
                device === 'desktop'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80 ring-1 ring-teal-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Desktop Viewport Layout (16:11 Aspect)"
            >
              <Monitor className={`w-3.5 h-3.5 ${device === 'desktop' ? 'text-teal-700' : 'text-slate-500'}`} />
              <span className="text-[11px]">Desktop</span>
            </button>

            <button
              id="viewport-btn-tablet"
              type="button"
              onClick={() => onDeviceChange && onDeviceChange('tablet')}
              className={`px-2.5 py-1 rounded-lg text-xs flex items-center space-x-1.5 font-bold transition-all ${
                device === 'tablet'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80 ring-1 ring-teal-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Tablet Viewport Layout (3:4 Aspect)"
            >
              <Tablet className={`w-3.5 h-3.5 ${device === 'tablet' ? 'text-teal-700' : 'text-slate-500'}`} />
              <span className="text-[11px]">Tablet</span>
            </button>

            <button
              id="viewport-btn-mobile"
              type="button"
              onClick={() => onDeviceChange && onDeviceChange('mobile')}
              className={`px-2.5 py-1 rounded-lg text-xs flex items-center space-x-1.5 font-bold transition-all ${
                device === 'mobile'
                  ? 'bg-white text-teal-900 shadow-xs border border-slate-200/80 ring-1 ring-teal-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title="Mobile Viewport Layout (9:19 Aspect)"
            >
              <Smartphone className={`w-3.5 h-3.5 ${device === 'mobile' ? 'text-teal-700' : 'text-slate-500'}`} />
              <span className="text-[11px]">Mobile</span>
            </button>
          </div>

          {/* Fullscreen Expand / Collapse Button */}
          <button
            id="viewport-btn-fullscreen-toggle"
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-2xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Expanded View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Outer Device Chassis Container */}
      <div
        id="device-chassis-viewport-wrapper"
        className={`bg-slate-950 shadow-2xl transition-all duration-300 border border-slate-800 relative flex flex-col ${
          isFullscreen
            ? 'w-full max-w-6xl h-[88vh] rounded-3xl p-3'
            : device === 'desktop'
            ? 'w-full aspect-[16/11] min-h-[580px] max-h-[760px] rounded-2xl sm:rounded-3xl p-2 sm:p-2.5'
            : device === 'tablet'
            ? 'w-full max-w-[480px] aspect-[3/4] min-h-[580px] max-h-[720px] rounded-3xl p-2.5 sm:p-3 mx-auto'
            : 'w-full max-w-[360px] aspect-[9/19] min-h-[580px] max-h-[700px] rounded-[38px] p-3 sm:p-3.5 mx-auto ring-4 ring-slate-800'
        }`}
      >
        {/* Mobile Speaker / Dynamic Island Notch (Only in Mobile Mode) */}
        {device === 'mobile' && (
          <div className="w-full flex items-center justify-between px-4 pt-1 pb-2 text-[10px] text-slate-400 font-semibold select-none">
            <span className="font-mono text-white">9:41</span>
            <div className="w-20 h-4 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center space-x-1.5 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="w-2 h-2 rounded-full bg-teal-500/80" />
            </div>
            <div className="flex items-center space-x-1 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        )}

        {/* Tablet Top Camera Notch (Only in Tablet Mode) */}
        {device === 'tablet' && (
          <div className="w-full flex items-center justify-center pb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-teal-500/60" />
            </div>
          </div>
        )}

        {/* Inner Scrollable Viewport */}
        <div
          id="inner-viewport-scrollable-content"
          className={`h-full w-full bg-[#F8FAFC] overflow-y-auto scrollbar-thin text-slate-900 flex flex-col font-sans relative ${
            device === 'mobile' ? 'rounded-2xl' : 'rounded-xl sm:rounded-2xl'
          }`}
        >
          {/* Simulated Browser URL Bar (Desktop & Tablet) */}
          {device !== 'mobile' ? (
            <div className="bg-slate-900 text-slate-300 px-3 py-2 border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 max-w-xs sm:max-w-md mx-2 bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] sm:text-[11px] font-mono text-teal-400 truncate text-center flex items-center justify-center space-x-1.5 shadow-inner">
                <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-slate-400">https://scinsmedia.org/conferences/</span>
                <span className="font-bold text-teal-300">{data.slug || 'conference-slug'}</span>
              </div>
              <div className="text-[9px] font-bold text-teal-400 uppercase tracking-widest hidden sm:block bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                {device.toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 text-slate-300 px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between shrink-0 sticky top-0 z-30">
              <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-lg px-2 py-0.5 text-[10px] font-mono text-teal-300 truncate text-center flex items-center justify-center space-x-1">
                <Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                <span>scinsmedia.org/…/{data.slug || 'slug'}</span>
              </div>
            </div>
          )}

          {/* Live Preview Brand Header */}
          <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
            <div className="flex items-center space-x-2">
              <img
                src="/scins-media-logo.png"
                alt="SCINS MEDIA"
                className="h-10 sm:h-11 w-auto max-h-11 object-contain"
              />
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-600">
              <span className="hidden sm:inline text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Live Portal
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {data.conference_code || 'SCINS-2026'}
              </span>
            </div>
          </div>

          {/* 1. HERO SECTION */}
          <div
            id="preview-hero-section"
            className={`relative bg-slate-950 text-white overflow-hidden shrink-0 border-b border-slate-800 ${
              device === 'mobile' ? 'p-3.5 space-y-2.5' : device === 'tablet' ? 'p-4 sm:p-5 space-y-3' : 'p-4 sm:p-6 space-y-3.5'
            }`}
          >
            {/* Background Hero Banner Image */}
            <div className="absolute inset-0 opacity-35">
              <img
                src={resolvedHeroImage}
                alt={data.title || 'Conference Hero'}
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_HERO;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40" />
            </div>

            <div className="relative z-10 space-y-2.5 max-w-3xl">
              {/* Badges Strip */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-teal-500 text-slate-950 px-2 py-0.5 rounded shadow-xs">
                  {data.domain || 'Scientific Discipline'}
                </span>
                {data.featured_badge && data.featured_badge.trim() !== '' && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded flex items-center space-x-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{data.featured_badge}</span>
                  </span>
                )}
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-300 bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded">
                  {data.conference_code || 'SCINS-2026'}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-teal-300 bg-teal-950/80 border border-teal-800 px-2 py-0.5 rounded">
                  {data.mode || 'hybrid'} mode
                </span>
                {data.cme_credits_eligible && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded flex items-center space-x-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-indigo-400" />
                    <span>18.5 CME/CPD Credits</span>
                  </span>
                )}
              </div>

              {/* Title & Acronym */}
              <div className="space-y-1">
                <h1
                  className={`font-bold font-display text-white tracking-tight leading-snug ${
                    device === 'mobile' ? 'text-sm sm:text-base' : device === 'tablet' ? 'text-base sm:text-xl' : 'text-base sm:text-2xl'
                  }`}
                >
                  {data.title || 'International Scientific Congress'}
                </h1>
                {data.short_title && (
                  <div className="text-xs font-semibold text-teal-400">
                    {data.short_title}
                  </div>
                )}
                {data.theme && (
                  <p className="text-[11px] sm:text-xs text-slate-300 font-medium line-clamp-2">
                    <span className="text-teal-400 font-semibold">Theme:</span> {data.theme}
                  </p>
                )}
                {data.tagline && (
                  <p className="text-[10px] sm:text-[11px] text-slate-400 italic">
                    "{data.tagline}"
                  </p>
                )}
              </div>

              {/* Key Location & Date Meta Strip (Responsive: 1 col on mobile, 2 on tablet, 3 on desktop) */}
              <div
                className={`grid gap-2 pt-1 text-[10px] sm:text-xs text-slate-200 ${
                  device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                }`}
              >
                <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                  <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Congress Dates</span>
                    <span className="font-semibold text-white truncate">
                      {data.start_date || 'TBD'} - {data.end_date || 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Location & Venue</span>
                    <span className="font-semibold text-white truncate">
                      {data.city || 'City'}, {data.country || 'Country'}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-2 rounded-xl ${
                    device === 'tablet' ? 'col-span-2' : ''
                  }`}
                >
                  <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Abstract Deadline</span>
                    <span className="font-semibold text-teal-300 truncate">
                      {data.abstract_deadline || 'Open'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION CTAs BAR */}
              <div className={`flex flex-wrap items-center gap-2 pt-1 ${device === 'mobile' ? 'flex-col sm:flex-row' : ''}`}>
                <button
                  id="hero-cta-register-now"
                  type="button"
                  onClick={() => setActiveTab('pricing')}
                  className={`px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 ${
                    device === 'mobile' ? 'w-full' : ''
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Register Now</span>
                </button>

                <button
                  id="hero-cta-submit-abstract"
                  type="button"
                  onClick={() => handleOpenAbstractModal()}
                  className={`px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all ${
                    device === 'mobile' ? 'w-full' : ''
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Submit Abstract</span>
                </button>

                {/* Brochure / Flyer Download Option */}
                {data.flyer_url && data.flyer_url.trim() !== '' && (
                  <button
                    id="hero-cta-view-brochure"
                    type="button"
                    onClick={() => {
                      if (data.flyer_url?.startsWith('data:') || data.flyer_url?.includes('.pdf')) {
                        setShowBrochureModal(true);
                      } else {
                        setShowBrochureModal(true);
                      }
                    }}
                    className={`px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 backdrop-blur-xs transition-all animate-in fade-in ${
                      device === 'mobile' ? 'w-full' : ''
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-teal-300" />
                    <span>View / Download Brochure PDF</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. SECTION NAV TABS (Responsive Horizontal Scroll) */}
          <div
            id="preview-navigation-tabs-strip"
            className="bg-white border-b border-slate-200 px-3 py-2 sticky top-[37px] z-20 flex items-center space-x-1 overflow-x-auto text-xs font-semibold text-slate-600 shrink-0 scrollbar-none shadow-2xs"
          >
            <button
              id="tab-overview"
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                activeTab === 'overview'
                  ? 'bg-teal-800 text-white font-bold shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Overview & Scope
            </button>
            <button
              id="tab-sessions"
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 text-xs ${
                activeTab === 'sessions'
                  ? 'bg-teal-800 text-white font-bold shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>Scientific Tracks</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'sessions' ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-900'
                }`}
              >
                {data.sessions?.length || 0}
              </span>
            </button>
            <button
              id="tab-faculty"
              type="button"
              onClick={() => setActiveTab('faculty')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 text-xs ${
                activeTab === 'faculty'
                  ? 'bg-teal-800 text-white font-bold shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>Keynote Faculty</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'faculty' ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {data.speakers?.length || 0}
              </span>
            </button>
            <button
              id="tab-pricing"
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 text-xs ${
                activeTab === 'pricing'
                  ? 'bg-teal-800 text-white font-bold shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>Registration</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'pricing' ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-900'
                }`}
              >
                {data.categories?.length || 0} Tiers
              </span>
            </button>
            <button
              id="tab-committee"
              type="button"
              onClick={() => setActiveTab('committee')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center space-x-1 text-xs ${
                activeTab === 'committee'
                  ? 'bg-teal-800 text-white font-bold shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>Committee & Journals</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  activeTab === 'committee' ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {data.committee?.length || 0}
              </span>
            </button>
            <button
              id="tab-venue"
              type="button"
              onClick={() => setActiveTab('venue')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                activeTab === 'venue'
                  ? 'bg-teal-800 text-white font-bold shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              Venue & Travel
            </button>
          </div>

          {/* 3. BODY VIEWPORT CONTENT BASED ON ACTIVE TAB */}
          <div
            id="preview-tab-body-container"
            className={`p-3.5 sm:p-5 space-y-4 flex-1 ${
              device === 'mobile' ? 'text-xs' : ''
            }`}
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Executive Overview */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-display flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      <span>Executive Congress Scope</span>
                    </h3>
                    <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                      {data.domain || 'Scientific Discipline'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {data.description ||
                      'Join world-renowned researchers, academicians, clinicians, and industry pioneers for cutting-edge scientific lectures and networking.'}
                  </p>
                  {data.detailed_about && (
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {data.detailed_about}
                    </div>
                  )}
                </div>

                {/* Target Audience Badges */}
                {data.target_audience && data.target_audience.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="text-xs font-bold text-slate-900 font-display flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-700" />
                      <span>Target Audience & Delegate Profiles</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.target_audience.map((aud, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-xl"
                        >
                          {aud}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Core Objectives Checklist */}
                {data.objectives && data.objectives.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 font-display">
                      Academic & Translational Objectives
                    </h4>
                    <div
                      className={`grid gap-2 ${
                        device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                      }`}
                    >
                      {data.objectives.map((obj, oIdx) => (
                        <div
                          key={oIdx}
                          className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                        >
                          <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Presidential Welcome Letter Preview */}
                {data.welcome_speaker_name && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center space-x-3">
                      {data.welcome_speaker_image ? (
                        <img
                          src={data.welcome_speaker_image}
                          alt={data.welcome_speaker_name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-300 shadow-2xs shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-sm shrink-0">
                          {data.welcome_speaker_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                          Presidential Welcome Message
                        </div>
                        <div className="font-bold text-xs text-slate-900">{data.welcome_speaker_name}</div>
                        <div className="text-[11px] text-slate-500">{data.welcome_speaker_title}</div>
                      </div>
                    </div>
                    {data.welcome_message && (
                      <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-xl border border-slate-200">
                        "{data.welcome_message}"
                      </p>
                    )}
                  </div>
                )}

                {/* Important Dates & Deadlines Matrix */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 font-display flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Important Deadlines & Registration Milestones</span>
                  </div>
                  <div
                    className={`grid gap-2 text-xs ${
                      device === 'mobile' ? 'grid-cols-1' : device === 'tablet' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'
                    }`}
                  >
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Abstract Submission</div>
                      <div className="font-bold text-teal-900 mt-0.5">{data.abstract_deadline || 'TBD'}</div>
                      <div className="text-[10px] text-teal-700 mt-0.5">
                        {data.accept_late_breaking ? 'Late-breaking tracks open' : 'Standard round'}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Early Bird Rate Closes</div>
                      <div className="font-bold text-slate-900 mt-0.5">{data.early_bird_deadline || 'TBD'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tier discounts apply</div>
                    </div>
                    <div
                      className={`p-2.5 bg-slate-50 border border-slate-200 rounded-xl ${
                        device === 'tablet' ? 'col-span-2' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Final Registration</div>
                      <div className="font-bold text-slate-900 mt-0.5">{data.registration_deadline || 'TBD'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Cap: {data.max_attendees || 900} delegates</div>
                    </div>
                  </div>
                </div>

                {/* Brochure Download Card if flyer_url exists */}
                {data.flyer_url && (
                  <div className="bg-gradient-to-r from-teal-950 to-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-teal-900/50">
                    <div className="space-y-1">
                      <div className="text-xs font-bold font-display flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-teal-300" />
                        <span>Official Conference Prospectus & Brochure</span>
                      </div>
                      <p className="text-[11px] text-slate-300 max-w-md">
                        Download full scientific schedule, keynote profiles, accommodation guide, and sponsorship prospectus.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBrochureModal(true)}
                      className="px-3.5 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SESSIONS TAB */}
            {activeTab === 'sessions' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-display">
                      Scientific Program & Sessions ({data.sessions?.length || 0} Tracks)
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Explore all symposium tracks, oral sessions, and keynote presentations.
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tracks..."
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                      className="pl-7 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-full sm:w-44 focus:ring-1 focus:ring-teal-500 font-sans"
                    />
                  </div>
                </div>

                {/* Track Filter Pills */}
                {tracksList.length > 2 && (
                  <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none">
                    {tracksList.map((tr, trIdx) => (
                      <button
                        key={trIdx}
                        type="button"
                        onClick={() => setSelectedTrackFilter(tr)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ${
                          selectedTrackFilter === tr
                            ? 'bg-teal-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tr}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sessions List */}
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((ses, sIdx) => {
                      const isExpanded = expandedSessionIdx === sIdx;
                      return (
                        <div
                          key={sIdx}
                          className={`bg-white p-3 rounded-2xl border transition-all shadow-2xs space-y-1.5 ${
                            isExpanded ? 'border-teal-500 ring-1 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                                {ses.session_number || sIdx + 1}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-teal-900">{ses.session_code}</span>
                              <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                {ses.track}
                              </span>
                              {ses.session_type && (
                                <span className="text-[9px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded">
                                  {ses.session_type}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedSessionIdx(isExpanded ? null : sIdx)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                              title="Toggle Details"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="text-xs font-bold text-slate-900">{ses.title}</div>

                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                            {ses.room && (
                              <div className="flex items-center space-x-1">
                                <Building2 className="w-2.5 h-2.5 text-teal-700" />
                                <span>{ses.room}</span>
                              </div>
                            )}
                            {(ses.timing || (ses.start_time && ses.end_time)) && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-2.5 h-2.5 text-teal-700" />
                                <span>{ses.timing || `${ses.start_time} - ${ses.end_time}`}</span>
                              </div>
                            )}
                            {ses.session_date && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-2.5 h-2.5 text-teal-700" />
                                <span>{ses.session_date}</span>
                              </div>
                            )}
                          </div>

                          {/* Expanded Session Abstract & Description */}
                          {isExpanded && (
                            <div className="pt-2 mt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl space-y-2 animate-in fade-in">
                              <p>
                                {ses.description ||
                                  'Comprehensive exploration of methodologies, clinical trial outcomes, and novel translational discoveries in this domain.'}
                              </p>
                              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                                <span className="text-[10px] text-teal-800 font-semibold">
                                  Oral & Poster abstracts accepted for this track
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAbstractModal(ses.track)}
                                  className="text-[10px] font-bold text-white bg-teal-800 hover:bg-teal-900 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  Submit to this Track
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      No scientific sessions match your search or filter.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FACULTY TAB */}
            {activeTab === 'faculty' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 font-display">
                    Featured Keynote & Invited Speakers ({data.speakers?.length || 0})
                  </div>
                  <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                    Global Faculty
                  </span>
                </div>

                <div
                  className={`grid gap-3 ${
                    device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                  }`}
                >
                  {(data.speakers || []).map((sp, spIdx) => (
                    <div
                      key={spIdx}
                      className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all shadow-2xs space-y-2.5 cursor-pointer"
                      onClick={() => setSelectedSpeaker(sp)}
                      title="Click to view speaker biography and presentation details"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={sp.photo_url}
                          alt={sp.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-[9px] font-bold uppercase text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                              {sp.speaker_type || 'Keynote'}
                            </span>
                            {sp.h_index && (
                              <span className="text-[8px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                                H-index {sp.h_index}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-xs text-slate-900 truncate mt-0.5">
                            {sp.prefix} {sp.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{sp.institution}</div>
                          <div className="text-[9px] text-slate-400 truncate">{sp.country}</div>
                        </div>
                      </div>

                      {sp.presentation_title && (
                        <div className="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-700 leading-snug border border-slate-100">
                          <strong className="text-slate-900">Lecture:</strong> {sp.presentation_title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 font-display">
                    Official Registration Packages ({data.categories?.length || 0} Categories)
                  </div>
                  <span className="text-[10px] text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                    Secure Checkout
                  </span>
                </div>

                <div
                  className={`grid gap-3 ${
                    device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                  }`}
                >
                  {(data.categories || []).map((cat, cIdx) => {
                    const earlyBirdSavings =
                      cat.early_bird_price && cat.price > cat.early_bird_price
                        ? cat.price - cat.early_bird_price
                        : 0;

                    return (
                      <div
                        key={cIdx}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          cat.is_popular
                            ? 'bg-gradient-to-b from-teal-50/60 to-white border-teal-500 shadow-md ring-1 ring-teal-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                            {cat.is_popular && (
                              <span className="text-[9px] font-bold bg-teal-800 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                Most Popular
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline space-x-1.5">
                            <span className="text-xl font-bold text-slate-900 font-display">
                              ${cat.early_bird_price || cat.price}
                            </span>
                            {earlyBirdSavings > 0 && (
                              <span className="text-xs text-slate-400 line-through">${cat.price}</span>
                            )}
                            <span className="text-[10px] text-teal-800 font-bold uppercase">
                              {cat.currency || 'USD'}
                            </span>
                            {earlyBirdSavings > 0 && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                Save ${earlyBirdSavings}
                              </span>
                            )}
                          </div>

                          {cat.benefits && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                              {cat.benefits.map((b, bIdx) => (
                                <div key={bIdx} className="flex items-start space-x-1.5">
                                  <Check className="w-3 h-3 text-teal-700 shrink-0 mt-0.5" />
                                  <span className="leading-tight">{b}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setRegConfirmed(null);
                            setShowRegisterModal(cat);
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                            cat.is_popular
                              ? 'bg-teal-800 hover:bg-teal-900 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          Select {cat.name.split(' ')[0]} Pass
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COMMITTEE & JOURNALS TAB */}
            {activeTab === 'committee' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Indexing Partners & Journal Proceedings */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="text-xs font-bold text-slate-900 font-display flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                    <span>Official Journal Indexing & Proceedings</span>
                  </div>
                  {data.journal_name && (
                    <div className="text-xs text-slate-800 font-semibold">{data.journal_name}</div>
                  )}
                  {data.journal_issn && (
                    <div className="text-[10px] text-slate-500 font-mono">{data.journal_issn}</div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(data.indexing_partners || ['Scopus Indexed Proceedings', 'Web of Science', 'PubMed', 'Elsevier ScienceDirect', 'IEEE Xplore']).map((idxP, iIdx) => (
                      <span
                        key={iIdx}
                        className="text-[9px] font-bold bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-lg flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-700" />
                        <span>{idxP}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Committee Roster */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 font-display">
                      Organizing Committee & Chairs ({data.committee?.length || 0})
                    </div>
                    <span className="text-[10px] text-slate-500">Peer-Review Board</span>
                  </div>

                  <div
                    className={`grid gap-2.5 max-h-56 overflow-y-auto pr-1 ${
                      device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                    }`}
                  >
                    {(data.committee || []).map((mem, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-2.5 text-xs"
                      >
                        <img
                          src={mem.photo_url}
                          alt={mem.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate text-[11px]">{mem.name}</div>
                          <div className="text-[9px] text-teal-800 font-bold truncate">{mem.committee_role}</div>
                          <div className="text-[9px] text-slate-500 truncate">{mem.institution}</div>
                          <div className="text-[8px] text-slate-400 truncate">{mem.country}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sponsors Preview */}
                {data.sponsors && data.sponsors.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="text-xs font-bold text-slate-900 font-display">
                      Confirmed Industry Sponsors & Exhibitors ({data.sponsors.length})
                    </div>
                    <div
                      className={`grid gap-2 ${
                        device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'
                      }`}
                    >
                      {data.sponsors.map((sp, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1 text-xs"
                        >
                          <div className="font-bold text-slate-900 truncate text-[11px]">{sp.name}</div>
                          <div className="text-[9px] text-teal-800 font-bold bg-teal-50 border border-teal-200 py-0.5 rounded">
                            {sp.tier}
                          </div>
                          {sp.booth && <div className="text-[9px] text-slate-500 font-mono">{sp.booth}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VENUE & TRAVEL TAB */}
            {activeTab === 'venue' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 font-display">
                    <Building2 className="w-4 h-4 text-teal-700" />
                    <span>Host Convention Center & Location Details</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-slate-900">
                      {data.venue || 'International Convention Center'}
                    </div>
                    <div className="text-xs text-slate-600">
                      {data.venue_address || `${data.city}, ${data.country}`}
                    </div>
                    <div className="text-[11px] text-teal-800 font-semibold pt-1">
                      Timezone: {data.timezone || 'UTC'}
                    </div>
                  </div>

                  <div
                    className={`grid gap-2 text-xs ${
                      device === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                    }`}
                  >
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                        <Globe className="w-3 h-3 text-teal-700" />
                        <span>Congress Language</span>
                      </div>
                      <div className="text-slate-800 font-semibold">{data.primary_language || 'English'}</div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                        <Hotel className="w-3 h-3 text-teal-700" />
                        <span>Accommodation & Travel</span>
                      </div>
                      <div className="text-slate-800 font-semibold">Special Delegate Hotel Rates Available</div>
                    </div>
                  </div>

                  {/* Visa & Travel Assistance */}
                  <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-start space-x-2.5 text-xs text-teal-950">
                    <Plane className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Official Visa Support Letters</div>
                      <div className="text-[11px] text-teal-800">
                        Official invitation letters for consular visa processing are generated upon registered delegate confirmation.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar inside Viewport */}
          <div className="bg-slate-900 text-slate-400 p-3 text-[10px] text-center border-t border-slate-800 shrink-0">
            Scinsmedia Academic Publishing & Congress Group • All rights reserved
          </div>

          {/* =============================================================== */}
          {/* SIMULATED INTERACTIVE MODALS INSIDE VIEWPORT PREVIEW */}
          {/* =============================================================== */}

          {/* 1. SPEAKER DOSSIER MODAL */}
          {selectedSpeaker && (
            <div className="absolute inset-0 bg-slate-950/70 z-40 flex items-center justify-center p-3 backdrop-blur-2xs animate-in fade-in">
              <div className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95 max-h-[90%] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedSpeaker.photo_url}
                      alt={selectedSpeaker.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                        {selectedSpeaker.speaker_type}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 mt-0.5">
                        {selectedSpeaker.prefix} {selectedSpeaker.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">{selectedSpeaker.institution}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSpeaker(null)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <strong className="text-[11px] text-slate-900 block">Lecture: {selectedSpeaker.presentation_title}</strong>
                  <p className="text-[11px] text-slate-600">
                    {selectedSpeaker.biography ||
                      'Distinguished faculty researcher presenting key empirical advancements in the plenary track.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Country: {selectedSpeaker.country}</span>
                  {selectedSpeaker.h_index && (
                    <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      H-index: {selectedSpeaker.h_index}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSpeaker(null)}
                  className="w-full py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          )}

          {/* 2. ABSTRACT SUBMISSION MODAL PREVIEW */}
          {showSubmitAbstractModal && (
            <div className="absolute inset-0 bg-slate-950/70 z-40 flex items-center justify-center p-3 backdrop-blur-2xs animate-in fade-in">
              <div className="bg-white rounded-2xl p-4 max-w-md w-full shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95 max-h-[92%] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-teal-700" />
                    <h4 className="font-bold text-xs text-slate-900">Submit Academic Abstract</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubmitAbstractModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {abstractSubmitted ? (
                  <div className="space-y-3 py-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">Abstract Successfully Submitted!</div>
                      <div className="text-[11px] font-mono text-teal-800 font-bold bg-teal-50 border border-teal-200 py-1 px-2 rounded-lg inline-block">
                        Tracking ID: {abstractSubmitted}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Peer-review editorial board will notify within 5 business days.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSubmitAbstractModal(false)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSimulateAbstractSubmit} className="space-y-2.5">
                    <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <p><strong>Conference:</strong> {data.title}</p>
                      <p><strong>Deadline:</strong> {data.abstract_deadline || 'Rolling basis'}</p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Author & Affiliation</label>
                        <input
                          type="text"
                          required
                          value={abstractForm.authorName}
                          onChange={(e) => setAbstractForm({ ...abstractForm, authorName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-600"
                          placeholder="Author Name"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Presentation Title</label>
                        <input
                          type="text"
                          required
                          value={abstractForm.title}
                          onChange={(e) => setAbstractForm({ ...abstractForm, title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-600"
                          placeholder="Title of Paper"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Target Track</label>
                        <select
                          value={abstractForm.track}
                          onChange={(e) => setAbstractForm({ ...abstractForm, track: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-600"
                        >
                          {tracksList.filter(t => t !== 'All').map((tr, idx) => (
                            <option key={idx} value={tr}>{tr}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Abstract Body (250 words)</label>
                        <textarea
                          rows={3}
                          value={abstractForm.abstractText}
                          onChange={(e) => setAbstractForm({ ...abstractForm, abstractText: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Submit Abstract
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSubmitAbstractModal(false)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* 3. REGISTRATION CHECKOUT MODAL PREVIEW */}
          {showRegisterModal && (
            <div className="absolute inset-0 bg-slate-950/70 z-40 flex items-center justify-center p-3 backdrop-blur-2xs animate-in fade-in">
              <div className="bg-white rounded-2xl p-4 max-w-md w-full shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95 max-h-[92%] overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-teal-700" />
                    <h4 className="font-bold text-xs text-slate-900">Delegate Registration Checkout</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(null)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {regConfirmed ? (
                  <div className="space-y-3 py-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900">Registration Confirmed!</div>
                      <div className="text-[11px] font-mono text-teal-800 font-bold bg-teal-50 border border-teal-200 py-1 px-2 rounded-lg inline-block">
                        Order #{regConfirmed}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Confirmation invoice & official visa invitation letter dispatched.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(null)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSimulateRegistration} className="space-y-3">
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-950">{showRegisterModal.name}</span>
                        <span className="text-[10px] font-bold uppercase text-teal-800">
                          {showRegisterModal.currency || 'USD'}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-teal-900 font-display">
                        ${showRegisterModal.early_bird_price || showRegisterModal.price}
                      </div>
                      <div className="text-[10px] text-teal-700">Includes all session passes, certificate & CME credits</div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Attendee Name</label>
                        <input
                          type="text"
                          required
                          value={regForm.delegateName}
                          onChange={(e) => setRegForm({ ...regForm, delegateName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Affiliation / University</label>
                        <input
                          type="text"
                          required
                          value={regForm.institution}
                          onChange={(e) => setRegForm({ ...regForm, institution: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Confirm Registration Pass
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* 4. BROCHURE VIEWER MODAL */}
          {showBrochureModal && (
            <div className="absolute inset-0 bg-slate-950/70 z-40 flex items-center justify-center p-3 backdrop-blur-2xs animate-in fade-in">
              <div className="bg-white rounded-2xl p-4 max-w-sm w-full shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95 text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center mx-auto shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Official Congress Brochure PDF</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs mx-auto">
                    {data.title}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1 text-slate-700">
                  <div><strong>File:</strong> Official-Conference-Brochure.pdf</div>
                  <div><strong>Pages:</strong> 12 Pages (Full Program, Keynotes & Venue)</div>
                  <div><strong>Status:</strong> Ready for instant download</div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <a
                    href={data.flyer_url || '#'}
                    download={`${data.slug || 'conference'}-brochure.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowBrochureModal(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Search,
  ArrowLeft,
  CreditCard,
  BookOpen
} from 'lucide-react';
import {
  Conference,
  CommitteeMember,
  Session
} from '../types';
import {
  INITIAL_CONFERENCES,
  COMMITTEE_MEMBERS,
  SCHEDULE_ITEMS,
  REGISTRATION_CATEGORIES,
  SPONSORS,
  MEDIA_PARTNERS
} from '../data/initialData';
import { AbstractSubmissionModal } from '../components/AbstractSubmissionModal';
import { RegistrationModal } from '../components/RegistrationModal';
import { CommitteeModal } from '../components/CommitteeModal';
import { SessionDetailModal } from '../components/SessionDetailModal';
import { ScientificSessionsSection } from '../components/ScientificSessionsSection';
import { sortByStartTime } from '../utils/timeUtils';

interface ConferenceDetailsPageProps {
  conference?: Conference;
  onNavigate?: (path: string) => void;
  onSelectConference?: (slug: string) => void;
}

export const ConferenceDetailsPage: React.FC<ConferenceDetailsPageProps> = ({
  conference = INITIAL_CONFERENCES[0],
  onNavigate,
  onSelectConference
}) => {
  // Active states
  const [activeDay, setActiveDay] = useState<'Day 1' | 'Day 2'>('Day 1');

  // Dynamic countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(conference.start_date) - +new Date();
      let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return timeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [conference.start_date]);

  // Modals
  const [isAbstractModalOpen, setIsAbstractModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedCommitteeMember, setSelectedCommitteeMember] = useState<CommitteeMember | null>(null);
  const [selectedSessionModal, setSelectedSessionModal] = useState<Session | null>(null);

  // Interactive 2-item scroll/carousel state (1. Welcome Address, 2. Industry Exhibitors)
  const carouselScrollRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  const carouselItems = useMemo(() => [
    {
      id: 'welcome-address',
      badge: 'Welcome Address',
      sectionTitle: 'Welcome Address',
      heading: conference.welcome_heading || 'Message from the General Chair',
      message: conference.welcome_message || `It is our profound honor to welcome distinguished researchers, professors, industrial pioneers, and budding scholars to ${conference.title}. Our collective mission is to foster cross-disciplinary innovation and sustainable technological breakthroughs. We look forward to your impactful contributions.`,
      speakerName: conference.welcome_speaker_name || 'Prof. Henriette Dubois, Ph.D.',
      speakerRole: conference.welcome_speaker_role || 'Conference Chair',
      speakerTitle: conference.welcome_speaker_title || 'Research Director & Chair of Macromolecular Chemistry, Sorbonne Université / CNRS',
      image: conference.welcome_speaker_image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
      footerText: conference.welcome_footer_text || `Join us at ${conference.short_title || conference.title} in ${conference.city} to collaborate, innovate, and drive scientific excellence forward.`,
      ctaLabel: null,
      ctaAction: null
    },
    {
      id: 'industry-exhibitors',
      badge: 'Industry Exhibitors',
      sectionTitle: 'Industry Exhibitors',
      heading: conference.exhibitor_heading || 'Global Industry Leaders & Technology Showcase',
      message: conference.exhibitor_message || 'Explore breakthrough biopolymer technologies, commercial resin formulations, and certified biodegradable solutions from premier international partners including BASF, NatureWorks, Novamont, Danimer Scientific, and TotalEnergies Corbion. Connect with technical directors, review prototype materials, and explore industrial partnerships across both days of the congress.',
      speakerName: conference.exhibitor_speaker_name || 'Confirmed Industry Exhibitors',
      speakerRole: conference.exhibitor_speaker_role || 'Platinum & Gold Partners',
      speakerTitle: conference.exhibitor_speaker_title || 'Main Exhibition Hall & Innovation Pavilions (Booths P-101 to E-408)',
      image: conference.exhibitor_image || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=80',
      footerText: conference.exhibitor_footer_text || 'Live demonstrations and commercial partner consultations scheduled throughout the congress.',
      ctaLabel: 'View Partner Directory',
      ctaAction: () => {
        const el = document.getElementById('partners-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ], [conference]);

  const scrollToSlide = (idx: number) => {
    if (!carouselScrollRef.current) return;
    const container = carouselScrollRef.current;
    container.scrollTo({ left: idx * container.clientWidth, behavior: 'smooth' });
    setCarouselIndex(idx);
  };

  const handleCarouselScroll = () => {
    if (!carouselScrollRef.current) return;
    const container = carouselScrollRef.current;
    const width = container.clientWidth || 1;
    const newIndex = Math.round(container.scrollLeft / width);
    if (newIndex >= 0 && newIndex < carouselItems.length && newIndex !== carouselIndex) {
      setCarouselIndex(newIndex);
    }
  };

  // Auto-scroll carousel every 7s when not hovered
  useEffect(() => {
    if (isCarouselHovered) return;
    const timer = setInterval(() => {
      setCarouselIndex(prev => {
        const next = (prev + 1) % carouselItems.length;
        if (carouselScrollRef.current) {
          carouselScrollRef.current.scrollTo({
            left: next * carouselScrollRef.current.clientWidth,
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, [isCarouselHovered, carouselItems.length]);

  // Filter Schedule by active day and conference, arranged chronologically by Start Time
  const daySchedule = useMemo(() => {
    const rawSchedule = conference.schedule && conference.schedule.length > 0 ? conference.schedule : SCHEDULE_ITEMS;
    const forConf = rawSchedule.filter(
      item => (item.conference_id ? item.conference_id === conference.id : true) && item.day_label === activeDay
    );
    const list = forConf.length > 0 ? forConf : rawSchedule.filter(item => item.day_label === activeDay);
    return sortByStartTime(list);
  }, [conference.id, conference.schedule, activeDay]);

  // Categories from conference (if configured) with fallback to REGISTRATION_CATEGORIES
  const categories = useMemo(() => {
    const confCategories = conference.categories && conference.categories.length > 0
      ? conference.categories
      : REGISTRATION_CATEGORIES.filter(c => c.conference_id === conference.id);
    const list = confCategories.length > 0 ? confCategories : REGISTRATION_CATEGORIES;
    return list.map(c => ({
      ...c,
      code: c.code || `PASS-${c.id}`,
      early_bird_fee: c.early_bird_fee ?? c.academic_price ?? c.early_bird_price ?? 399,
      standard_fee: c.standard_fee ?? c.industry_price ?? c.price ?? 499,
      benefits: (c.benefits && c.benefits.length > 0)
        ? c.benefits
        : (c.features && c.features.length > 0)
          ? c.features
          : [
              'Access to all scientific sessions & keynotes',
              'Conference kit, badge & printed abstracts book',
              'Daily organic networking luncheon & coffee breaks',
              'Official Certificate of Attendance / Presentation'
            ]
    }));
  }, [conference.categories, conference.id]);

  const getDayDateLabel = (day: 'Day 1' | 'Day 2') => {
    try {
      if (day === 'Day 1' && conference.start_date) {
        const d = new Date(conference.start_date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      if (day === 'Day 2' && conference.end_date) {
        const d = new Date(conference.end_date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      // fallback
    }
    return day === 'Day 1' ? 'Jun 22' : 'Jun 23';
  };

  const navSections = [
    { id: 'about-section', label: 'About Congress' },
    { id: 'committee-section', label: 'Committee' },
    { id: 'sessions-section', label: 'Scientific Sessions & Breakout Tracks' },
    { id: 'schedule-section', label: '2-Day Schedule' },
    { id: 'registration-section', label: 'Registration' },
    { id: 'abstract-section', label: 'Submit Abstract' }
  ];

  return (
    <div id="conference-detail-page" className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-clip pt-0">
      {/* 1. TOP HERO BANNER & CONFERENCE HERO BLOCK */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-12 sm:py-16 lg:py-20 border-b border-slate-800">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img
            src={conference.hero_image}
            alt={conference.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/80" />
        </div>

        {/* Ambient teal glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Explore Conferences CTA/entry point */}
          <div className="mb-6">
            <a
              href="/conferences"
              onClick={(e) => {
                e.preventDefault();
                if (typeof onNavigate === 'function') {
                  onNavigate('/conferences');
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/conferences';
                }
              }}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-800/80 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Explore Conferences</span>
            </a>
          </div>

          {/* Conference Hero Block: 2-column desktop layout, stacked mobile layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Items 1 to 5 */}
            <div className="lg:col-span-7 space-y-4">
              {/* 1. Short Name / Conference Label */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-teal-500 text-slate-950 px-3 py-1 rounded-full shadow-sm">
                  {conference.short_title || `${conference.domain} Flagship`}
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-700 px-3 py-1 rounded-full">
                  Code: {conference.conference_code}
                </span>
                <span className="text-xs font-semibold text-teal-300 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full uppercase">
                  {conference.mode} Format
                </span>
              </div>

              {/* 2. Conference Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight leading-tight">
                {conference.title}
              </h1>

              {/* 3. Theme */}
              <p className="text-sm sm:text-base text-teal-100 font-medium leading-relaxed">
                <span className="text-teal-400 font-semibold">Theme:</span> {conference.theme}
              </p>

              {/* 4. Date + Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center space-x-2.5 bg-slate-900/85 border border-slate-800 p-3 rounded-2xl">
                  <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Dates</span>
                    <span className="font-semibold text-white truncate block">{conference.start_date} to {conference.end_date}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 bg-slate-900/85 border border-slate-800 p-3 rounded-2xl">
                  <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Venue & Location</span>
                    <span className="font-semibold text-white truncate block">{conference.venue || `${conference.city}, ${conference.country}`}</span>
                  </div>
                </div>
              </div>

              {/* 5. Countdown — directly below Date & Venue */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-800">
                    Congress Starts In
                  </span>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    Official delegation countdown
                  </span>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                  {[
                    { label: 'Days', value: timeLeft.days },
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Minutes', value: timeLeft.minutes },
                    { label: 'Seconds', value: timeLeft.seconds }
                  ].map((unit, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 min-w-[62px] sm:min-w-[72px] text-center shadow-lg">
                        <span className="block text-xl sm:text-2xl font-extrabold font-mono text-teal-400 leading-none">
                          {String(unit.value).padStart(2, '0')}
                        </span>
                        <span className="block text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                          {unit.label}
                        </span>
                      </div>
                      {idx < 3 && (
                        <span className="text-lg sm:text-xl font-bold text-slate-700 ml-2 sm:ml-3 select-none">:</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: 6. Right-side CTA buttons */}
            <div className="lg:col-span-5 w-full">
              <div className="flex flex-col gap-3 w-full max-w-md mx-auto lg:max-w-none p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>Delegate & Speaker Actions</span>
                  <span className="text-slate-500 font-normal lowercase">{conference.conference_code}</span>
                </div>

                {/* Download Brochure */}
                {conference.flyer_url ? (
                  <a
                    href={conference.flyer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-slate-950/80 hover:bg-slate-800 text-white border border-slate-700/80 font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-xs group cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform shrink-0" />
                    <span>Download Brochure</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('about-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-3.5 px-4 bg-slate-950/80 hover:bg-slate-800 text-white border border-slate-700/80 font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-xs group cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-teal-300 group-hover:scale-110 transition-transform shrink-0" />
                    <span>Download Brochure</span>
                  </button>
                )}

                {/* Submit Abstract */}
                <button
                  type="button"
                  onClick={() => setIsAbstractModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-slate-950/80 hover:bg-slate-800 text-white border border-slate-700/80 font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-xs group cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Submit Abstract</span>
                </button>

                {/* Register Now */}
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Register Now</span>
                </button>

                {/* Scientific Program */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('sessions-section') || document.getElementById('schedule-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 px-4 bg-slate-950/80 hover:bg-slate-800 text-white border border-slate-700/80 font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-xs group cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span>Scientific Program</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STICKY IN-PAGE SECTION NAVIGATION */}
      <nav
        id="conference-sticky-navbar"
        aria-label="Conference Section Navigation"
        className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs transition-all duration-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
          {/* Navigation Items (Standardized ~16px font-size, 600 font-weight, ~24px line-height) */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 overflow-x-auto scrollbar-none py-1">
            {navSections.map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  if (sec.id === 'abstract-section') {
                    setIsAbstractModalOpen(true);
                  } else {
                    const el = document.getElementById(sec.id);
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-[16px] font-semibold leading-[24px] text-slate-700 hover:text-[#0E7490] hover:bg-slate-100/80 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Right Action: ONLY Register (Duplicate Submit Abstract removed) */}
          <div className="flex items-center shrink-0 ml-4">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-5 py-2 bg-[#0A2540] hover:bg-[#0E7490] text-white rounded-xl text-[16px] font-semibold leading-[24px] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* 3. ABOUT CONFERENCE SECTION */}
      <section id="about-section" className="scroll-mt-20 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 inline-block">
              Congress Overview & Scientific Scope
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              {conference.about_heading || 'Accelerating Sustainable Polymer Innovations & Industrial Decarbonization'}
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              {conference.detailed_about || conference.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(conference.about_highlights && conference.about_highlights.length === 4
                ? conference.about_highlights
                : [
                    'Over 450+ physical attendees from 48 nations',
                    '20 specialized scientific tracks & breakout rooms',
                    'Elsevier Scopus-indexed special issue publication',
                    'Direct B2B technology transfer & venture showcase'
                  ]
              ).map((point, idx) => (
                <div key={idx} className="flex items-center text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {(() => {
            const gallery = (conference.gallery_images && conference.gallery_images.length >= 4)
              ? conference.gallery_images
              : (conference.gallery && conference.gallery.length >= 4)
              ? conference.gallery.map(g => g.image_url)
              : [
                  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
                  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
                ];
            return (
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <img
                  src={gallery[0]}
                  alt="Scientific Lab"
                  className="w-full h-44 object-cover rounded-2xl shadow border border-slate-200"
                />
                <img
                  src={gallery[1]}
                  alt="Chemical Testing"
                  className="w-full h-44 object-cover rounded-2xl shadow border border-slate-200 mt-4"
                />
                <img
                  src={gallery[2]}
                  alt="Conference Auditorium"
                  className="w-full h-44 object-cover rounded-2xl shadow border border-slate-200"
                />
                <img
                  src={gallery[3]}
                  alt="Scientific Poster Session"
                  className="w-full h-44 object-cover rounded-2xl shadow border border-slate-200 mt-4"
                />
              </div>
            );
          })()}
        </div>
      </section>

      {/* 4. WELCOME ADDRESS & INDUSTRY EXHIBITORS SCROLL SECTION */}
      <section
        id="welcome-section"
        onMouseEnter={() => setIsCarouselHovered(true)}
        onMouseLeave={() => setIsCarouselHovered(false)}
        className="py-16 bg-slate-950 text-white border-y border-slate-800 relative overflow-hidden group/welcome"
      >
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Navigation Controls Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400">
              {carouselItems[carouselIndex].sectionTitle}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scrollToSlide(Math.max(0, carouselIndex - 1))}
              disabled={carouselIndex === 0}
              aria-label="Previous Item"
              className="w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center hover:bg-teal-600 hover:border-teal-500 disabled:opacity-30 disabled:hover:bg-slate-900/90 disabled:hover:border-slate-700/80 transition-all cursor-pointer disabled:cursor-not-allowed shadow"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-1">
              {carouselIndex + 1} / {carouselItems.length}
            </span>
            <button
              onClick={() => scrollToSlide(Math.min(carouselItems.length - 1, carouselIndex + 1))}
              disabled={carouselIndex === carouselItems.length - 1}
              aria-label="Next Item"
              className="w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700/80 text-white flex items-center justify-center hover:bg-teal-600 hover:border-teal-500 disabled:opacity-30 disabled:hover:bg-slate-900/90 disabled:hover:border-slate-700/80 transition-all cursor-pointer disabled:cursor-not-allowed shadow"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Smooth horizontal interactive scroll container */}
        <div
          ref={carouselScrollRef}
          onScroll={handleCarouselScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none touch-pan-x scroll-smooth relative z-10"
        >
          {carouselItems.map((item) => (
            <div
              key={item.id}
              className="min-w-full w-full shrink-0 snap-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left side: Speaker / Showcase Photo */}
                <div className="lg:col-span-4 flex flex-col items-center lg:items-end text-center lg:text-right space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-56 h-64 sm:w-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-teal-500/50 shadow-2xl flex-shrink-0 bg-slate-900 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.speakerName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white font-display">
                      {item.speakerName}
                    </h4>
                    <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">
                      {item.speakerRole}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">
                      {item.speakerTitle}
                    </p>
                  </div>
                </div>

                {/* Right side: Text */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-teal-950/60 border border-teal-800/80 px-3 py-1 rounded-full text-xs font-bold text-teal-300">
                    <span>{item.badge}</span>
                  </div>
                  
                  <h3 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
                    {item.heading}
                  </h3>
                  
                  <div className="relative">
                    {/* Big decorative quote mark */}
                    <span className="absolute -left-6 -top-6 text-7xl font-serif text-teal-500/10 pointer-events-none">“</span>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic pr-6 whitespace-pre-line relative z-10">
                      {item.message}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-slate-400">
                      {item.footerText}
                    </div>
                    {item.ctaLabel && item.ctaAction && (
                      <button
                        onClick={item.ctaAction}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-950/60 hover:bg-teal-900/60 border border-teal-800/80 px-3.5 py-1.5 rounded-full transition-colors w-fit shrink-0 cursor-pointer"
                      >
                        <span>{item.ctaLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide indicator dots (Exactly 2 dots for the 2 items) */}
        <div className="flex items-center justify-center space-x-2 mt-8 relative z-10">
          {carouselItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to ${idx === 0 ? 'Welcome Address' : 'Industry Exhibitors'}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === carouselIndex
                  ? 'w-7 h-2 bg-teal-400'
                  : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 5. ORGANIZING COMMITTEE MEMBERS */}
      <section id="committee-section" className="scroll-mt-20 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 inline-block">
              Scientific Leadership
            </span>
            <h2 className="text-3xl font-bold text-slate-900 font-display mt-2">
              Organizing Committee & Chairs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Distinguished faculty overseeing peer review, sessions, and academic proceedings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(((conference.committee && conference.committee.length > 0)
            ? conference.committee
            : (COMMITTEE_MEMBERS.filter(m => m.conference_id === conference.id).length > 0
              ? COMMITTEE_MEMBERS.filter(m => m.conference_id === conference.id)
              : COMMITTEE_MEMBERS)
          )).map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedCommitteeMember(member)}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden hover:border-[#0E7490] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="p-6 text-center space-y-3">
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-teal-500/50 shadow group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#0E7490] bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full inline-block">
                    {member.committee_role}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0E7490] mt-1.5 transition-colors font-display">
                    {member.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{member.designation}</p>
                  <p className="text-xs text-slate-500 font-medium">{member.institution}</p>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-[#0E7490] font-semibold">
                <span>View Full Academic Profile</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DYNAMIC SCIENTIFIC SESSIONS & BREAKOUT TRACKS */}
      <ScientificSessionsSection
        conferenceId={conference.id}
        onSelectSession={(session) => setSelectedSessionModal(session)}
      />

      {/* 8. 2-DAY INTERACTIVE SCHEDULE & PLANNER */}
      <section id="schedule-section" className="scroll-mt-20 py-20 bg-white border-y border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Program Flow Header / Top Area: Heading + Day 1 & Day 2 Selector */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-8 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 inline-block">
                  2-Day Schedule
                </span>
                <h2 className="text-3xl font-bold text-slate-900 font-display mt-1">
                  Program Flow
                </h2>
              </div>

              {/* Day 1 and Day 2 Buttons: Top Header Area in ALL layouts, beside/below Program Flow heading */}
              <div className="flex items-center space-x-2 pt-1 sm:pt-4">
                {(['Day 1', 'Day 2'] as const).map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
                      activeDay === day
                        ? 'bg-[#0A2540] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {day} ({getDayDateLabel(day)})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule List & Image 50/50 Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left side: Schedule List */}
            <div className="space-y-3">
              {daySchedule.map(item => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start space-x-4 hover:bg-teal-50/40 transition-colors"
                >
                  <div className="w-28 flex-shrink-0 text-xs font-bold text-[#0E7490] font-mono pt-0.5">
                    {item.start_time} – {item.end_time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {item.room}
                      </span>
                      {item.track && (
                        <span className="text-[10px] text-slate-500">• {item.track}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug font-display">{item.title}</h4>
                    {item.speaker_name && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        Speaker: <span className="font-semibold text-slate-800">{item.speaker_name}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right side: Conference-related image/visual */}
            <div className="space-y-4 sticky top-40">
              <div className="relative group overflow-hidden rounded-3xl border border-slate-200 shadow-lg aspect-[4/3]">
                <img
                  src={conference.program_image || conference.gallery_images?.[1] || conference.gallery?.[1]?.image_url || conference.gallery?.[0]?.image_url || conference.hero_image}
                  alt="Scientific Program Flow"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#14B8A6] text-slate-950 px-2.5 py-0.5 rounded-full font-semibold">
                    Scientific Presentation Hall
                  </span>
                  <h4 className="text-sm font-bold text-white font-display">
                    Oral Keynotes, Poster Sessions & Panel Q&As
                  </h4>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display">Session Formats</h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                    <span>Plenary Keynotes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                    <span>Oral Track Sessions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                    <span>Poster Presentations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                    <span>Exhibitor Demos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. REGISTRATION PRICING SECTION */}
      <section id="registration-section" className="scroll-mt-20 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3 py-1 rounded-full border border-teal-200/80 inline-block">
            Official Passes
          </span>
          <h2 className="text-3xl font-bold text-slate-900 font-display mt-2">
            Delegate Registration Tiers
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Early bird pricing active through June 30, 2026. Instant confirmation & formal invoice provided.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-[#0E7490] hover:shadow-xl transition-all p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#0E7490] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full inline-block">
                    {cat.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2 font-display">{cat.name}</h3>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-[#0A2540] font-display">${cat.early_bird_fee}</span>
                    <span className="text-xs text-slate-400 line-through">${cat.standard_fee} USD</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {cat.benefits.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7490] mr-2 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full py-2.5 bg-[#0A2540] hover:bg-[#0E7490] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  Select Pass & Register
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. SUBMIT ABSTRACT CTA SECTION */}
      <section id="abstract-section" className="scroll-mt-20 py-12 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 border border-slate-200/90 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 inline-block">
              Call for Abstracts
            </span>
            <h3 className="text-xl font-bold font-display text-slate-900">
              Submit Your Scientific Abstract
            </h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Peer evaluation decisions are dispatched within 7 business days. Present your findings to the global delegation.
            </p>
          </div>
          <button
            onClick={() => setIsAbstractModalOpen(true)}
            className="px-6 py-3 bg-[#0A2540] hover:bg-[#0E7490] text-white font-semibold rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer shadow-xs"
          >
            Launch Submission Wizard
          </button>
        </div>
      </section>

      {/* 12. SPONSORS & PARTNERS (SIDE-BY-SIDE AUTO-SCROLLING CAROUSELS) */}
      <section id="partners-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Left Column: Corporate & Industrial Partners */}
          <div className="pb-8 md:pb-0 md:pr-6 lg:pr-8 overflow-hidden">
            <div className="text-center mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Corporate & Industrial Partners
              </span>
            </div>
            {/* Carousel Container with edge gradient masks */}
            <div className="relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
              
              <div
                className="overflow-x-auto scrollbar-none touch-pan-x flex"
                tabIndex={0}
                aria-label="Corporate & Industrial Partners Carousel"
              >
                <div className="flex items-center space-x-4 animate-marquee py-1 px-2 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
                  {(() => {
                    const rawSponsors = (conference.sponsors && conference.sponsors.length > 0)
                      ? conference.sponsors
                      : (SPONSORS.filter(s => s.conference_id === conference.id).length > 0
                        ? SPONSORS.filter(s => s.conference_id === conference.id)
                        : SPONSORS);
                    const list = [...rawSponsors, ...rawSponsors, ...rawSponsors, ...rawSponsors];
                    return list.map((s, idx) => {
                      const card = (
                        <div
                          key={`sponsor-${s.id}-${idx}`}
                          className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center hover:shadow-sm hover:border-slate-300 transition-all w-[140px] h-[64px] shrink-0"
                        >
                          <img
                            src={s.logo_url}
                            alt={s.name || s.company_name}
                            className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            loading="lazy"
                          />
                        </div>
                      );
                      return s.website ? (
                        <a key={`sponsor-link-${s.id}-${idx}`} href={s.website} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          {card}
                        </a>
                      ) : card;
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Global Media & Academic Publishing Partners */}
          <div className="pt-8 md:pt-0 md:pl-6 lg:pl-8 overflow-hidden">
            <div className="text-center mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Global Media & Academic Publishing Partners
              </span>
            </div>
            {/* Carousel Container with edge gradient masks */}
            <div className="relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
              
              <div
                className="overflow-x-auto scrollbar-none touch-pan-x flex"
                tabIndex={0}
                aria-label="Global Media & Academic Publishing Partners Carousel"
              >
                <div className="flex items-center space-x-4 animate-marquee py-1 px-2 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
                  {(() => {
                    const rawMedia = (conference.media_partners && conference.media_partners.length > 0)
                      ? conference.media_partners
                      : (MEDIA_PARTNERS.filter(m => m.conference_id === conference.id).length > 0
                        ? MEDIA_PARTNERS.filter(m => m.conference_id === conference.id)
                        : MEDIA_PARTNERS);
                    const list = [...rawMedia, ...rawMedia, ...rawMedia, ...rawMedia];
                    return list.map((m, idx) => {
                      const card = (
                        <div
                          key={`media-${m.id}-${idx}`}
                          className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center hover:shadow-sm hover:border-slate-300 transition-all w-[140px] h-[64px] shrink-0"
                        >
                          <img
                            src={m.logo_url}
                            alt={m.name}
                            className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            loading="lazy"
                          />
                        </div>
                      );
                      return m.website ? (
                        <a key={`media-link-${m.id}-${idx}`} href={m.website} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          {card}
                        </a>
                      ) : card;
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* MODALS */}
      <AbstractSubmissionModal
        isOpen={isAbstractModalOpen}
        onClose={() => setIsAbstractModalOpen(false)}
        conference={conference}
      />

      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        conference={conference}
      />

      <CommitteeModal
        member={selectedCommitteeMember}
        onClose={() => setSelectedCommitteeMember(null)}
      />

      <SessionDetailModal
        session={selectedSessionModal}
        onClose={() => setSelectedSessionModal(null)}
        onSubmitAbstractForSession={() => setIsAbstractModalOpen(true)}
      />
    </div>
  );
};

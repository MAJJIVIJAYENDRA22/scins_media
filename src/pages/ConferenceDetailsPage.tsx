import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  FileText,
  CheckCircle2,
  ChevronRight,
  Search,
  Mail
} from 'lucide-react';
import {
  Conference,
  CommitteeMember,
  Session
} from '../types';
import {
  INITIAL_CONFERENCES,
  COMMITTEE_MEMBERS,
  SPEAKERS,
  SESSIONS_20,
  SCHEDULE_ITEMS,
  REGISTRATION_CATEGORIES,
  SPONSORS,
  MEDIA_PARTNERS,
  FAQS
} from '../data/initialData';
import { AbstractSubmissionModal } from '../components/AbstractSubmissionModal';
import { RegistrationModal } from '../components/RegistrationModal';
import { CommitteeModal } from '../components/CommitteeModal';
import { SessionDetailModal } from '../components/SessionDetailModal';

interface ConferenceDetailsPageProps {
  conference?: Conference;
  onNavigate?: (path: string) => void;
  onSelectConference?: (slug: string) => void;
}

export const ConferenceDetailsPage: React.FC<ConferenceDetailsPageProps> = ({
  conference = INITIAL_CONFERENCES[0]
}) => {
  // Active states
  const [activeDay, setActiveDay] = useState<'Day 1' | 'Day 2' | 'Day 3'>('Day 1');
  const [sessionTrackFilter, setSessionTrackFilter] = useState<string>('All');
  const [sessionSearch, setSessionSearch] = useState<string>('');
  const [savedScheduleIds, setSavedScheduleIds] = useState<number[]>([]);

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

  // Filter 20 Sessions
  const filteredSessions = SESSIONS_20.filter(s => {
    const matchTrack = sessionTrackFilter === 'All' || s.track === sessionTrackFilter;
    const matchSearch =
      !sessionSearch ||
      s.title.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.session_code.toLowerCase().includes(sessionSearch.toLowerCase());
    return matchTrack && matchSearch;
  });

  // Filter Schedule by active day
  const daySchedule = SCHEDULE_ITEMS.filter(item => item.day_label === activeDay);

  // Toggle Schedule Planner
  const toggleSaveSchedule = (id: number) => {
    if (savedScheduleIds.includes(id)) {
      setSavedScheduleIds(savedScheduleIds.filter(i => i !== id));
    } else {
      setSavedScheduleIds([...savedScheduleIds, id]);
    }
  };

  const navSections = [
    { id: 'about-section', label: 'About Congress' },
    { id: 'committee-section', label: 'Committee' },
    { id: 'sessions-section', label: 'Scientific Sessions' },
    ...(conference.settings?.show_speakers !== false ? [{ id: 'speakers-section', label: 'Speakers' }] : []),
    { id: 'schedule-section', label: '3-Day Schedule' },
    { id: 'registration-section', label: 'Registration' },
    { id: 'abstract-section', label: 'Submit Abstract' },
    { id: 'faq-section', label: 'FAQs' }
  ];

  return (
    <div id="conference-detail-page" className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden pt-20">
      {/* 1. TOP HERO BANNER */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-25">
          <img
            src={conference.hero_image}
            alt={conference.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-teal-500 text-slate-950 px-3 py-1 rounded-full shadow">
                {conference.domain} Flagship
              </span>
              <span className="text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-700 px-3 py-1 rounded-full">
                Code: {conference.conference_code}
              </span>
              <span className="text-xs font-semibold text-teal-300 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full uppercase">
                {conference.mode} Format
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-white tracking-tight leading-tight">
              {conference.title}
            </h1>

            {/* Tagline & Theme */}
            <p className="text-base sm:text-xl text-teal-100 font-medium">
              Theme: {conference.theme}
            </p>

            {/* Key Meta Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
                <Calendar className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dates</span>
                  <span className="font-semibold text-white">{conference.start_date} to {conference.end_date}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Venue & City</span>
                  <span className="font-semibold text-white">{conference.city}, {conference.country}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
                <Clock className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Early Bird Due</span>
                  <span className="font-semibold text-teal-300">{conference.early_bird_deadline}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all"
              >
                Register as Delegate
              </button>
              <button
                onClick={() => setIsAbstractModalOpen(true)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Submit Abstract (Due {conference.abstract_deadline})</span>
              </button>
              {conference.flyer_url && (
                <a
                  href={conference.flyer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold rounded-2xl text-xs sm:text-sm transition-all flex items-center space-x-2 backdrop-blur-xs shadow-xs"
                >
                  <Download className="w-4 h-4 text-teal-300" />
                  <span>View / Download Brochure</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* COUNTDOWN SECTION */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-800">
              Congress Starts In
            </span>
            <h4 className="text-sm font-semibold text-slate-300">
              Mark your calendar for the premier scientific gathering
            </h4>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((unit, idx) => (
              <div key={idx} className="flex items-center">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 min-w-[70px] sm:min-w-[80px] text-center shadow-lg">
                  <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-teal-400">
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                    {unit.label}
                  </span>
                </div>
                {idx < 3 && (
                  <span className="text-xl sm:text-2xl font-bold text-slate-700 ml-3 sm:ml-4 select-none">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. STICKY IN-PAGE SECTION NAVIGATION */}
      <div className="sticky top-[72px] lg:top-[96px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2.5">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs font-semibold text-slate-600 whitespace-nowrap">
            {navSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  if (sec.id === 'abstract-section') {
                    setIsAbstractModalOpen(true);
                  } else {
                    const el = document.getElementById(sec.id);
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                {sec.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => setIsAbstractModalOpen(true)}
              className="px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold hover:bg-teal-100"
            >
              Submit Abstract
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* 3. ABOUT CONFERENCE SECTION */}
      <section id="about-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md">
              Congress Overview & Scientific Scope
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Accelerating Sustainable Polymer Innovations & Industrial Decarbonization
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">
              {conference.detailed_about || conference.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Over 450+ physical attendees from 48 nations',
                '20 specialized scientific tracks & breakout rooms',
                'Elsevier Scopus-indexed special issue publication',
                'Direct B2B technology transfer & venture showcase'
              ].map((point, idx) => (
                <div key={idx} className="flex items-center text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"
              alt="Polymer Lab"
              className="w-full h-44 object-cover rounded-2xl shadow border border-slate-200"
            />
            <img
              src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80"
              alt="Chemical Testing"
              className="w-full h-44 object-cover rounded-2xl shadow border border-slate-200 mt-4"
            />
            <img
              src="https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80"
              alt="Conference Auditorium"
              className="w-full h-44 object-cover rounded-2xl shadow border border-slate-200"
            />
            <img
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80"
              alt="Scientific Poster Session"
              className="w-full h-44 object-cover rounded-2xl shadow border border-slate-200 mt-4"
            />
          </div>
        </div>
      </section>

      {/* 4. WELCOME MESSAGE SECTION */}
      <section className="py-16 bg-slate-950 text-white border-y border-slate-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side: Speaker/Chair Photo */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end text-center lg:text-right space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-56 h-64 sm:w-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-teal-500/50 shadow-2xl flex-shrink-0">
                  <img
                    src={conference.welcome_speaker_image}
                    alt={conference.welcome_speaker_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white font-display">
                  {conference.welcome_speaker_name}
                </h4>
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">
                  Conference Chair
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">
                  {conference.welcome_speaker_title}
                </p>
              </div>
            </div>

            {/* Right side: Welcome Text */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-teal-950/60 border border-teal-800/80 px-3 py-1 rounded-full text-xs font-bold text-teal-300">
                <span>Welcome Address</span>
              </div>
              
              <h3 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
                Message from the General Chair
              </h3>
              
              <div className="relative">
                {/* Big decorative quote mark */}
                <span className="absolute -left-6 -top-6 text-7xl font-serif text-teal-500/10 pointer-events-none">“</span>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic pr-6 whitespace-pre-line relative z-10">
                  {conference.welcome_message}
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-800 flex items-center space-x-4">
                <div className="text-xs text-slate-400">
                  Join us at <span className="font-semibold text-white">{conference.short_title}</span> in {conference.city} to collaborate, innovate, and drive scientific excellence forward.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ORGANIZING COMMITTEE MEMBERS */}
      <section id="committee-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Scientific Leadership
            </span>
            <h2 className="text-3xl font-bold text-slate-900 font-display mt-1">
              Organizing Committee & Chairs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Distinguished faculty overseeing peer review, sessions, and academic proceedings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMITTEE_MEMBERS.map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedCommitteeMember(member)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-teal-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="p-6 text-center space-y-3">
                <img
                  src={member.photo_url}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-teal-500/50 shadow group-hover:scale-105 transition-transform"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {member.committee_role}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-900 mt-1.5">
                    {member.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{member.designation}</p>
                  <p className="text-xs text-slate-400 font-medium">{member.institution}</p>
                </div>
              </div>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold">
                <span>View Full Academic Profile</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. COMPLETE 20 SCIENTIFIC SESSIONS SHOWCASE */}
      <section id="sessions-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-20 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase mb-2">
                <span>Full Scientific Agenda</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 font-display">
                20 Scientific Sessions & Specialized Tracks
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore the complete 20 academic tracks. Click any session to inspect learning objectives and submit an abstract.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200">
              Showing {filteredSessions.length} of 20 Sessions
            </div>
          </div>

          {/* Session Search & Track Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search across all 20 sessions by title, code, or description..."
                value={sessionSearch}
                onChange={e => setSessionSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="sm:w-64">
              <select
                value={sessionTrackFilter}
                onChange={e => setSessionTrackFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="All">All 5 Main Tracks</option>
                <option value="Synthesis & Bio-Production">Synthesis & Bio-Production</option>
                <option value="Structure & Characterization">Structure & Characterization</option>
                <option value="Industrial Bioprocessing">Industrial Bioprocessing</option>
                <option value="Biomedical & Engineering Applications">Biomedical & Engineering</option>
                <option value="Sustainability & Environmental Impact">Sustainability & Impact</option>
              </select>
            </div>
          </div>

          {/* 20 Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map(ses => (
              <div
                key={ses.id}
                onClick={() => setSelectedSessionModal(ses)}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                      {ses.session_code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{ses.track}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-900 mt-2">
                    {ses.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {ses.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-3">
                    <span>{ses.session_date}</span>
                    <span>•</span>
                    <span>{ses.room}</span>
                  </div>
                  <span className="text-teal-700 font-semibold group-hover:underline">
                    Inspect Session →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SPEAKERS SHOWCASE */}
      {conference.settings?.show_speakers !== false && (
        <section id="speakers-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Keynote Faculty
              </span>
              <h2 className="text-3xl font-bold text-slate-900 font-display mt-1">
                Featured Keynote & Plenary Speakers
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPEAKERS.map(spk => (
              <div
                key={spk.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative aspect-square bg-slate-100">
                  <img
                    src={spk.photo_url}
                    alt={spk.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {spk.speaker_type}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{spk.name}</h3>
                  <p className="text-xs text-slate-500">{spk.institution} • {spk.country}</p>
                  {spk.presentation_title && (
                    <p className="text-xs text-teal-800 font-medium italic line-clamp-2 pt-1">
                      "{spk.presentation_title}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. 3-DAY INTERACTIVE SCHEDULE & PLANNER */}
      <section id="schedule-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Program Flow
              </span>
              <h2 className="text-3xl font-bold text-slate-900 font-display mt-1">
                Official 3-Day Conference Schedule
              </h2>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex space-x-2 mt-4 sm:mt-0">
              {(['Day 1', 'Day 2', 'Day 3'] as const).map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeDay === day
                      ? 'bg-slate-900 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day} (Sept {day === 'Day 1' ? '15' : day === 'Day 2' ? '16' : '17'})
                </button>
              ))}
            </div>
          </div>

          {/* Schedule List & Image 50/50 Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left side: Schedule List */}
            <div className="space-y-3">
              {daySchedule.map(item => {
                const isSaved = savedScheduleIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-teal-50/40 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-28 flex-shrink-0 text-xs font-bold text-teal-800 font-mono">
                        {item.start_time} – {item.end_time}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            {item.room}
                          </span>
                          {item.track && (
                            <span className="text-[10px] text-slate-400">• {item.track}</span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                        {item.speaker_name && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Speaker: <span className="font-semibold text-slate-700">{item.speaker_name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSaveSchedule(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        isSaved
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSaved ? '✓ Saved to Plan' : '+ Add to Schedule'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right side: Conference-related image/visual */}
            <div className="space-y-4 sticky top-40">
              <div className="relative group overflow-hidden rounded-3xl border border-slate-200 shadow-lg aspect-[4/3]">
                <img
                  src={conference.gallery?.[1]?.image_url || conference.gallery?.[0]?.image_url || conference.hero_image}
                  alt="Scientific Program Flow"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                    Scientific Presentation Hall
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Oral Keynotes, Poster Sessions & Panel Q&As
                  </h4>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Session Formats</h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Plenary Keynotes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Oral Track Sessions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Poster Presentations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Exhibitor Demos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. REGISTRATION PRICING SECTION */}
      <section id="registration-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md">
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
          {REGISTRATION_CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-teal-500 hover:shadow-xl transition-all p-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {cat.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{cat.name}</h3>
                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-950 font-display">${cat.early_bird_fee}</span>
                    <span className="text-xs text-slate-400 line-through">${cat.standard_fee} USD</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {cat.benefits.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-semibold transition-colors shadow"
                >
                  Select Pass & Register
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. SUBMIT ABSTRACT CTA SECTION */}
      <section id="abstract-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-12 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
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
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs whitespace-nowrap transition-colors"
          >
            Launch Submission Wizard
          </button>
        </div>
      </section>

      {/* 11. FAQS */}
      <section id="faq-section" className="scroll-mt-[150px] lg:scroll-mt-[180px] py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Support & Inquiries
            </span>
            <h2 className="text-3xl font-bold text-slate-900 font-display mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map(faq => (
              <div key={faq.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <h3 className="text-sm font-bold text-slate-900">{faq.question}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. SPONSORS & PARTNERS (LOGOS ONLY) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 border-t border-slate-200">
        <div>
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Corporate & Industrial Partners
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {SPONSORS.map(s => (
              <div key={s.id} className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center hover:shadow-sm hover:border-slate-300 transition-all w-[140px] h-[64px]">
                <img src={s.logo_url} alt={s.name} className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/80">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Global Media & Academic Publishing Partners
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {MEDIA_PARTNERS.map(m => (
              <div key={m.id} className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center hover:shadow-sm hover:border-slate-300 transition-all w-[140px] h-[64px]">
                <img src={m.logo_url} alt={m.name} className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. SUPPORT & INQUIRIES SECTION */}
      <section className="py-12 bg-slate-950 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-800">
            Still Have Questions?
          </span>
          <h3 className="text-xl font-bold font-display text-white">
            Contact the Conference Secretariat
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            For queries regarding registration, visa support letters, abstract formatting, or sponsorship packages, get in touch with our team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-mono text-slate-300">
            <a href="mailto:secretariat@scinsmedia.com" className="hover:text-teal-400 transition-colors flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
              <Mail className="w-3.5 h-3.5 text-teal-400" />
              <span>secretariat@scinsmedia.com</span>
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Response within 24-48 hours</span>
            </span>
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

import React, { useState } from 'react';
import {
  Sparkles,
  Presentation,
  Award,
  Users,
  Layers,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Plus,
  Search,
  BookOpen,
  FileCheck2,
  Globe2,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  Microscope,
  GraduationCap
} from 'lucide-react';
import { Conference, ProposalType } from '../types';
import { INITIAL_CONFERENCES } from '../data/initialData';
import { ProposalSubmissionModal } from '../components/ProposalSubmissionModal';

interface CallForProposalsPageProps {
  conferences?: Conference[];
  onNavigate?: (path: string) => void;
  onSelectConference?: (slug: string) => void;
}

export const CallForProposalsPage: React.FC<CallForProposalsPageProps> = ({
  conferences = INITIAL_CONFERENCES,
  onNavigate = (_p: string) => {},
  onSelectConference = (_slug: string) => {}
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<ProposalType>('workshop');
  const [activeModalConfId, setActiveModalConfId] = useState<number>(conferences[0] ? conferences[0].id : 1);
  const [searchQuery, setSearchQuery] = useState('');

  const openProposalModal = (type: ProposalType, confId?: number) => {
    setActiveModalType(type);
    if (confId) setActiveModalConfId(confId);
    setIsModalOpen(true);
  };

  const tracks = [
    {
      id: 'workshop',
      type: 'workshop' as ProposalType,
      name: 'Workshops & Masterclasses',
      badge: 'Interactive & Practical',
      icon: Presentation,
      headline: 'Host a Hands-On Clinical, Computational or Experimental Masterclass',
      duration: '90 to 180 Minutes',
      audience: 'Lab Researchers, Clinicians, Doctoral Fellows & Industry Specialists',
      description:
        'Convene a dedicated training workshop to teach novel scientific techniques, software tools, clinical diagnostic protocols, or advanced laboratory instrumentation to international attendees.',
      deliverables: [
        'Dedicated session room equipped with high-speed AV and demo tables',
        'Inclusion of workshop syllabus & course notes in Scopus proceedings',
        'Official Workshop Convener Certificate & 2 complimentary co-instructor passes',
        'Direct promotion to pre-registered delegates across Europe, Asia & the Americas'
      ]
    },
    {
      id: 'keynote_forum',
      type: 'keynote_forum' as ProposalType,
      name: 'Keynote Plenary Forums',
      badge: 'Plenary Spotlight',
      icon: Award,
      headline: 'Deliver a 45-Minute Spotlight Plenary Keynote Address',
      duration: '45-Min Lecture + 15-Min Q&A',
      audience: 'Entire Congress Assembly (Plenary Stage)',
      description:
        'Designed for eminent professors, department chairs, industry innovators, and research directors to unveil paradigm-shifting discoveries, translational clinical trials, or future technology roadmaps.',
      deliverables: [
        'Prime plenary stage billing with full HD live-stream coverage',
        'Featured keynote profile and dedicated photo/bio banner on all congress materials',
        'Invitation to the Presidential VIP Faculty Gala Dinner',
        'Scopus-indexed publication of the plenary abstract with priority DOI assignment'
      ]
    },
    {
      id: 'poster',
      type: 'poster' as ProposalType,
      name: 'Poster Presentations & Young Investigator Showcase',
      badge: 'Visual Showcase & Awards',
      icon: Layers,
      headline: 'Present Scientific Research Posters & Compete for the $1,000 Best Poster Award',
      duration: '2-Day Display + 3-Min Lightning Pitch',
      audience: 'Ph.D. Candidates, Postdoctoral Fellows & Emerging Scholars',
      description:
        'Display your research findings on heavy-duty vertical display boards, engage one-on-one with senior principal investigators, and deliver a rapid 3-minute podium pitch before the judging panel.',
      deliverables: [
        'Dedicated A0 exhibition board with spotlight illumination in the main hall',
        'Automatic entry into the SCINS Young Investigator Award & $1,000 travel prize',
        'Peer-reviewed abstract published in indexed proceedings book',
        'Official Certificate of Scientific Poster Presentation'
      ]
    },
    {
      id: 'symposium',
      type: 'symposium' as ProposalType,
      name: 'Thematic Symposia & Special Sessions',
      badge: 'Curated Track',
      icon: Users,
      headline: 'Organize a Curated Thematic Session with 3 to 5 Invited Speakers',
      duration: '90 to 120 Minutes',
      audience: 'Consortia, Academic Societies & Multi-Disciplinary Working Groups',
      description:
        'Take ownership of a dedicated scientific sub-track. Propose an overarching theme, invite your preferred collaborating speakers, and lead the panel discussion during the congress.',
      deliverables: [
        'Recognized role as Official Symposium Chair in the final scientific program',
        'Ability to coordinate thematic abstracts and curate the speaker lineup',
        'Priority peer-review review lane for all symposium-associated manuscripts',
        'Special acknowledgment during the congress opening plenary ceremony'
      ]
    }
  ];

  const filteredTracks = selectedTrack === 'all'
    ? tracks
    : tracks.filter(t => t.id === selectedTrack);

  const filteredConferences = conferences.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q)
    );
  });

  const faqs = [
    {
      q: 'Who is eligible to submit a proposal for workshops or keynote forums?',
      a: 'We welcome proposals from established principal investigators, professors, clinician-scientists, postdoctoral researchers, and industrial R&D leaders from universities, medical centers, and research institutes globally.'
    },
    {
      q: 'How long does the proposal review process take?',
      a: 'All proposals undergo expedited peer review by the International Scientific Advisory Board. Proposers receive formal evaluation decisions and feedback within 5 to 7 business days.'
    },
    {
      q: 'Do session proposers receive official visa support?',
      a: 'Yes! Upon acceptance of your workshop, keynote, or poster proposal, the SCINS Media organizing committee issues an official signed Invitation Letter on formal institutional letterhead for expedited Schengen, UK, US, or international visa processing.'
    },
    {
      q: 'Can workshops or keynote presentations be delivered virtually?',
      a: 'Our flagship world congresses operate in a hybrid format. While physical in-person delivery is strongly encouraged to foster networking, virtual live-streamed presentations are accommodated for international speakers facing travel constraints.'
    },
    {
      q: 'Are accepted proposals published in indexed proceedings?',
      a: 'Yes. All accepted workshop syllabi, keynote lecture abstracts, and poster summaries are assigned unique digital object identifiers (DOIs) and published in conference proceedings indexed in Scopus, Web of Science, and partner Elsevier journals.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="bg-[#0A2540] rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-tr from-teal-800/40 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-950/90 px-3.5 py-1 rounded-full border border-teal-700/80 font-mono">
                Worldwide Congresses • Call for Proposals
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Paris • London • Dubai • Tokyo • Rome • Singapore
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight">
              Global Call for Proposals: Workshops, Keynote Forums & Posters
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
              SCINS Media convenes prestigious international congresses uniting thousands of scientists, academicians, clinicians, and technology pioneers worldwide. We invite visionary researchers to lead interactive workshops, deliver plenary keynote addresses, organize curated symposia, and showcase scientific poster presentations.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openProposalModal('workshop')}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Session Proposal</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('world-destinations');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
              >
                <span>Browse Conferences by City</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Impact Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">48+</div>
            <div className="text-xs text-slate-500 font-medium">Participating Nations</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-teal-800 font-display">5–7 Days</div>
            <div className="text-xs text-slate-500 font-medium">Expedited Peer Review</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">100%</div>
            <div className="text-xs text-slate-500 font-medium">Scopus / DOI Indexed</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-display">$1,000</div>
            <div className="text-xs text-slate-500 font-medium">Young Investigator Award</div>
          </div>
        </div>

        {/* Track Filter Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">Available Proposal Tracks</h2>
              <p className="text-xs text-slate-500">Choose your preferred session format to view guidelines and submit</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedTrack('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTrack === 'all'
                    ? 'bg-[#0A2540] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Tracks
              </button>
              <button
                onClick={() => setSelectedTrack('workshop')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTrack === 'workshop'
                    ? 'bg-[#0A2540] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Workshops
              </button>
              <button
                onClick={() => setSelectedTrack('keynote_forum')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTrack === 'keynote_forum'
                    ? 'bg-[#0A2540] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Keynote Forums
              </button>
              <button
                onClick={() => setSelectedTrack('poster')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTrack === 'poster'
                    ? 'bg-[#0A2540] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Poster Presentations
              </button>
              <button
                onClick={() => setSelectedTrack('symposium')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTrack === 'symposium'
                    ? 'bg-[#0A2540] text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Thematic Symposia
              </button>
            </div>
          </div>

          {/* Proposal Track Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTracks.map(track => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-teal-50 text-teal-800 rounded-2xl border border-teal-100">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200 font-mono">
                            {track.badge}
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display mt-0.5">
                            {track.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">
                        {track.headline}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-slate-500 font-medium block text-[11px]">Format Duration:</span>
                        <span className="font-bold text-slate-800">{track.duration}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block text-[11px]">Target Audience:</span>
                        <span className="font-semibold text-slate-800 truncate block">{track.audience}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        Organizer & Speaker Entitlements:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {track.deliverables.map((d, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => openProposalModal(track.type)}
                      className="w-full py-3 bg-[#0A2540] hover:bg-teal-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Submit {track.name} Proposal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Congress Destinations Grid */}
        <div id="world-destinations" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Globe2 className="w-5 h-5 text-teal-700" />
                <h2 className="text-2xl font-bold text-slate-900 font-display">
                  Conferences Accepting Proposals Worldwide
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Select your target international destination to invite a proposal directly for that congress
              </p>
            </div>

            <div className="relative sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by city, domain, or title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConferences.map(conf => (
              <div
                key={conf.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between space-y-4 hover:border-teal-600 hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {conf.domain}
                    </span>
                    <span className="text-slate-500 font-medium text-[11px] flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{conf.city}, {conf.country}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-display leading-snug line-clamp-2">
                    {conf.title}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{conf.start_date} to {conf.end_date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{conf.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openProposalModal('workshop', conf.id)}
                    className="flex-1 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Submit Proposal
                  </button>
                  <button
                    onClick={() => onSelectConference(conf.slug)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation & Review Timeline */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Proposal Evaluation & Onboarding Protocol
            </h3>
            <p className="text-xs text-slate-500">
              Clear, transparent four-stage review process modeled on premier international scientific societies
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-[11px]">
                Stage 01
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Online Proposal Intake</h4>
              <p className="text-slate-600 leading-relaxed">
                Submit session abstract, learning outcomes, equipment requirements, and speaker credentials via our portal.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-[11px]">
                Stage 02
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Committee Peer Review</h4>
              <p className="text-slate-600 leading-relaxed">
                Domain track chairs assess scientific novelty, pedagogical clarity, and alignment with congress tracks within 5–7 days.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-[11px]">
                Stage 03
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Formal Invitation & Visa</h4>
              <p className="text-slate-600 leading-relaxed">
                Official signed acceptance letter and visa clearance dispatch for international travel and grant clearance.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-[11px]">
                Stage 04
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Congress Delivery & DOI</h4>
              <p className="text-slate-600 leading-relaxed">
                Presentation at plenary hall or breakout room, followed by Scopus proceedings indexing and certificate issuance.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs for Proposers */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-teal-700" />
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Frequently Asked Questions for Proposers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{faq.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="bg-gradient-to-r from-teal-900 to-[#0A2540] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-2xl font-bold font-display text-white">
              Ready to Shape the Scientific Agenda?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Submit your workshop syllabus, plenary keynote proposal, or poster summary today. Our International Steering Committee looks forward to welcoming you to the podium.
            </p>
          </div>

          <button
            onClick={() => openProposalModal('workshop')}
            className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shrink-0 cursor-pointer"
          >
            Submit Proposal Now
          </button>
        </div>
      </div>

      {/* Proposal Submission Modal */}
      {isModalOpen && (
        <ProposalSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          conferences={conferences}
          defaultType={activeModalType}
          defaultConferenceId={activeModalConfId}
        />
      )}
    </div>
  );
};

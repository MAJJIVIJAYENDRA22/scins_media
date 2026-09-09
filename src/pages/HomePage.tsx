import React, { useState } from 'react';
import {
  ArrowRight,
  Search,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { HeroVisual } from '../components/HeroVisual';
import { ConferenceCard } from '../components/ConferenceCard';
import { Conference, Speaker, Testimonial } from '../types';
import {
  INITIAL_CONFERENCES,
  SPEAKERS,
  TESTIMONIALS
} from '../data/initialData';

interface HomePageProps {
  conferences?: Conference[];
  speakers?: Speaker[];
  testimonials?: Testimonial[];
  onSelectConference?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  onOpenSearch?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  conferences = INITIAL_CONFERENCES,
  speakers = SPEAKERS,
  testimonials: _testimonials = TESTIMONIALS,
  onSelectConference = (_slug: string) => {},
  onNavigate = (_path: string) => {},
  onOpenSearch = () => {}
}) => {
  // Discovery Filter States
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter conferences to show only upcoming, published ones sorted by display_order
  const filteredConferences = conferences
    .filter(c => {
      const isPublished = c.status === 'published' || !c.status;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const confDate = c.start_date ? new Date(`${c.start_date}T00:00:00`) : null;
      const isUpcoming = !confDate || confDate >= today;

      if (!isPublished || !isUpcoming) return false;

      const matchDomain = selectedDomain === 'All' || c.domain.toLowerCase().includes(selectedDomain.toLowerCase());
      const matchCountry = selectedCountry === 'All' || c.country.toLowerCase().includes(selectedCountry.toLowerCase());
      const matchMode = selectedMode === 'All' || c.mode.toLowerCase() === selectedMode.toLowerCase();
      const matchQuery = !searchQuery ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDomain && matchCountry && matchMode && matchQuery;
    })
    .sort((a, b) => {
      const orderA = a.display_order ?? 999;
      const orderB = b.display_order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime();
    });

  return (
    <div id="scinsmedia-home-page" className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden pt-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] border-b border-slate-200/80">
        <HeroVisual />

        <div className="relative z-10 max-w-5xl mx-auto text-center py-16 sm:py-24 space-y-6">
          {/* Scientific Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" />
            <span>2026–2027 International Scientific Calendar Live</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 font-display leading-[1.1]">
            Global Scientific Conferences,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-900">
              Research & Innovation.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Connecting leading researchers, universities, healthcare pioneers, and industry leaders across 170+ nations through peer-reviewed congresses, Elsevier/Scopus publications, and cross-disciplinary symposiums.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={() => onSelectConference('biopolymers-bioplastics-2026')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0A2540] hover:bg-[#0E7490] text-white rounded-2xl text-sm font-semibold shadow-lg shadow-slate-900/10 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Explore Paris 2026 Flagship</span>
              <ArrowRight className="w-4 h-4 text-teal-300" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('conference-discovery-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              Discover 500+ Conferences
            </button>
          </div>

          {/* Instant Search Bar Trigger */}
          <div className="pt-6 max-w-2xl mx-auto">
            <div
              onClick={onOpenSearch}
              className="w-full bg-white/90 backdrop-blur-md border border-slate-300/80 hover:border-teal-500 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between shadow-lg shadow-slate-200/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center space-x-3 pl-3 text-slate-400 group-hover:text-slate-600">
                <Search className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-slate-500">
                  Search by domain, topic, city (e.g., Paris, Biopolymers, Nanomedicine, AI)...
                </span>
              </div>
              <span className="hidden sm:inline-flex px-3 py-1.5 bg-slate-100 group-hover:bg-teal-50 text-slate-600 group-hover:text-teal-700 text-xs font-semibold rounded-xl transition-colors">
                Quick Search
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GLOBAL IMPACT STATS */}
      <section className="bg-[#0A2540] text-white py-14 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="text-center pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-display">170+</div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium mt-1">Participating Countries</div>
              <div className="text-[11px] text-slate-400 mt-0.5">International delegations</div>
            </div>
            <div className="text-center pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-display">2,500+</div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium mt-1">Academic & Research Partners</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Top-tier universities & institutes</div>
            </div>
            <div className="text-center pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-display">100,000+</div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium mt-1">Scientists & Researchers</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Active scholarly network</div>
            </div>
            <div className="text-center pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#14B8A6] font-display">500+</div>
              <div className="text-xs sm:text-sm text-slate-200 font-medium mt-1">Conferences & Proceedings</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scopus & SCI indexed</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL ABOUT SCINSMEDIA */}
      <section className="pt-16 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-md">
              <span>About the Scinsmedia Scientific Charter</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display leading-tight">
              An Open Global Platform for Unrestricted Scientific Exchange
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Founded on the belief that cross-disciplinary cooperation is vital to addressing humanity’s greatest challenges, Scinsmedia designs, chairs, and publishes high-impact academic congresses.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { title: 'Rigorous Single-Blind Peer Review', desc: 'Every abstract is reviewed by appointed international committee chairs before inclusion.' },
                { title: 'Indexed DOI & Proceeding Archival', desc: 'Conference proceedings indexed in Elsevier Scopus, Web of Science, and CrossRef.' },
                { title: 'Hybrid Real-Time Global Delivery', desc: 'Seamlessly combines physical auditoriums with broadcast-grade interactive digital access.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-slate-200/80">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80"
                alt="Scientific Laboratory"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white space-y-1">
                <div className="text-[10px] font-mono text-teal-400 uppercase tracking-widest">
                  Featured Congress Venue
                </div>
                <div className="text-base font-bold">Paris Congress Center • France</div>
                <div className="text-xs text-slate-300">
                  Hosting 450+ physical delegates and 3,000+ virtual academic attendees across 20 scientific sessions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MULTI-FACETED CONFERENCE DISCOVERY INTERFACE */}
      <section id="conference-discovery-section" className="scroll-mt-[90px] lg:scroll-mt-[110px] pt-6 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0A2540] font-display tracking-tight mb-2.5">
                Conference
              </h2>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#0E7490]">
                Conference Directory
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
                Upcoming International Congresses
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Filter by academic domain, hosting country, format, or search keywords.
              </p>
            </div>

            <div className="text-xs text-slate-600 font-medium">
              Showing <b>{filteredConferences.length}</b> verified scientific congresses
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Search */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Biopolymers, Paris..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Domain */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Academic Domain</label>
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Scientific Domains</option>
                <option value="Biotechnology">Biotechnology & Materials</option>
                <option value="Nanomedicine">Nanomedicine & Oncology</option>
                <option value="Artificial Intelligence">Artificial Intelligence in Health</option>
                <option value="Green Chemistry">Green Chemistry & Energy</option>
                <option value="Quantum Physics">Quantum Optics & Computing</option>
              </select>
            </div>

            {/* Country */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Host Country</label>
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Global Locations</option>
                <option value="France">France (Paris)</option>
                <option value="United States">United States (Boston)</option>
                <option value="Switzerland">Switzerland (Zurich)</option>
                <option value="Japan">Japan (Tokyo)</option>
                <option value="United Kingdom">United Kingdom (Cambridge)</option>
              </select>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Format</label>
              <select
                value={selectedMode}
                onChange={e => setSelectedMode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Formats</option>
                <option value="hybrid">Hybrid (In-Person & Virtual)</option>
                <option value="in-person">In-Person Only</option>
                <option value="virtual">Virtual Interactive</option>
              </select>
            </div>
          </div>

          {/* Conference Cards Grid */}
          {filteredConferences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConferences.map(conf => (
                <ConferenceCard
                  key={conf.id}
                  conference={conf}
                  onSelect={onSelectConference}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No upcoming conferences found</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting your filter parameters or search terms.</p>
            </div>
          )}
        </div>
      </section>

      {/* KEYNOTE SPEAKERS SHOWCASE */}
      <section className="pt-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A2540] font-display tracking-tight mb-2.5">
              Speakers
            </h2>
            <span className="block text-xs font-bold uppercase tracking-wider text-[#0E7490]">
              Distinguished Faculty
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
              Distinguished Speakers
            </h3>
          </div>
          <button
            onClick={() => onNavigate('/speakers')}
            className="mt-3 sm:mt-0 text-xs font-semibold text-[#0E7490] hover:text-[#0A2540] flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>View All Speakers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {speakers.slice(0, 4).map(spk => (
            <div
              key={spk.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={spk.photo_url}
                  alt={spk.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    {spk.speaker_type}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                  {spk.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{spk.institution} • {spk.country}</p>
                {spk.presentation_title && (
                  <p className="text-xs text-teal-800 italic line-clamp-2 pt-1">
                    "{spk.presentation_title}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

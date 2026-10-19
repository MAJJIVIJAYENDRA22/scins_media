import React from 'react';
import {
  Globe2,
  Users,
  GraduationCap,
  Eye,
  Target,
  BookOpen,
  Network,
  Lightbulb,
  FlaskConical,
  Mic,
  MessagesSquare,
  UsersRound,
  Presentation,
  Microscope,
  BriefcaseBusiness,
  CalendarCheck,
  BookMarked,
  Handshake,
  CalendarDays,
  Share2,
  TrendingUp,
  MapPin,
  BookOpenCheck,
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const AboutPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* =========================================================================
            1. ABOUT SCINS MEDIA (Hero Banner)
            ========================================================================= */}
        <section className="bg-[#0A2540] rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-at-tr from-teal-900/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#14B8A6]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/80 inline-flex items-center space-x-1.5 shadow-xs">
                <Globe2 className="w-3.5 h-3.5" />
                <span>About SCINS MEDIA</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight">
              Connecting Minds. Advancing Research. Inspiring Innovation.
            </h1>

            <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              <p>
                SCINS MEDIA is an international scientific conference and research platform dedicated to bringing together researchers, academicians, scientists, healthcare professionals, industry experts, and innovators from around the world.
              </p>
              <p>
                Through international conferences and scientific gatherings, we provide a platform for sharing research breakthroughs, presenting emerging discoveries, and exploring innovative ideas across science, medicine, technology, engineering, business, and related disciplines.
              </p>
              <p>
                Our conferences encourage global collaboration, interdisciplinary knowledge exchange, and meaningful professional networking. By connecting established experts with emerging researchers, we aim to create an environment where scientific knowledge can be shared, new perspectives can be explored, and research can contribute to real-world progress.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/conferences')}
                className="px-6 py-3 bg-[#14B8A6] hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md cursor-pointer"
              >
                <span>Explore Conferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/abstract')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
              >
                <span>Submit Your Research</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2 & 3. GLOBAL RESEARCH COMMUNITY & YOUNG INVESTIGATORS
            ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 2. Our Global Research Community */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-900">
                Our Global Research Community
              </h2>
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                <p>
                  We aim to connect researchers and innovators across international boundaries, enabling the exchange of knowledge, ideas, and experiences.
                </p>
                <p>
                  Our platform welcomes university professors, students, research scholars, clinicians, healthcare professionals, scientists, entrepreneurs, and industry representatives who share a commitment to advancing knowledge and innovation.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-medium text-slate-700">
              <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Professors & Scholars</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Clinicians & Doctors</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Industry Innovators</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Global Students</span>
              </div>
            </div>
          </div>

          {/* 3. Opportunities for Young Investigators */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-900">
                Opportunities for Young Investigators
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                SCINS MEDIA provides emerging researchers and students with structured opportunities to:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                  <span>Engage and network with distinguished scholars, scientists, and industry professionals.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                  <span>Present original research and explore emerging scientific topics.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                  <span>Exchange ideas with experts from diverse disciplines.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                  <span>Develop professional connections and collaborative research opportunities.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0 mt-0.5" />
                  <span>Enhance their academic knowledge and professional skills.</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-2xl text-xs text-teal-900 font-medium flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#0E7490] shrink-0" />
              <span>Dedicated Young Investigators & Student Forum Tracks at Every Congress</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4 & 5. OUR VISION & OUR MISSION
            ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 4. Our Vision */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Our Vision
            </h2>
            <div className="space-y-3.5 text-sm text-slate-600 leading-relaxed">
              <p>
                Our vision is to advance science, research, and technology for the betterment of society by creating meaningful opportunities for knowledge exchange, collaboration, and innovation.
              </p>
              <p>
                We aspire to establish a globally connected scientific community where researchers, academicians, healthcare professionals, and industry leaders can share discoveries, discuss emerging challenges, and explore innovative approaches that contribute to scientific and technological progress.
              </p>
              <p>
                Through our international conferences and research forums, we seek to encourage critical thinking, interdisciplinary collaboration, and the development of ideas that can create a lasting impact.
              </p>
            </div>
          </div>

          {/* 5. Our Mission */}
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900">
              Our Mission
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our mission is to create an inclusive international platform that connects scientific communities, encourages research dissemination, and supports continuous learning.
            </p>
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 font-mono">
                We strive to:
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Facilitate the presentation and exchange of original research.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Encourage collaboration between academia, industry, and research institutions.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Support young researchers and emerging scientific talent.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Promote innovation across science, medicine, healthcare, engineering, technology, and business.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Provide opportunities for professional development and knowledge sharing.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Build international networks that support future research and collaboration.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. HOW WE SERVE THE SCIENTIFIC AND BUSINESS COMMUNITY
            ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100 inline-block font-mono">
              Academic & Industrial Impact
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
              How We Serve the Scientific and Business Community
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SCINS MEDIA seeks to make research knowledge and professional collaboration more accessible to diverse communities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Promote Research Dissemination
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide opportunities to present research findings and emerging discoveries.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Connect Disciplines
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bring together academia, industry, healthcare, government, and research organizations.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Empower Professionals
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Support learning through expert presentations, workshops, and scientific discussions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Encourage International Collaboration
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create opportunities to connect researchers across countries and institutions.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Support Emerging Talent
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Give students and early-career researchers opportunities to share their work and develop professional networks.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Encourage Continuous Learning
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Facilitate knowledge exchange that supports academic and professional growth.
              </p>
            </div>

            {/* Card 7 — Full width on small, centered on lg */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Inspire Innovation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Encourage the exploration of new ideas, technologies, and approaches to complex challenges.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. HOW OUR EVENTS DRIVE CHANGE
            ========================================================================= */}
        <section className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
                How Our Events Drive Change
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Our conferences and scientific forums aim to encourage progress by creating opportunities to discuss important developments and emerging challenges.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              'Explore advances in medical research, healthcare, and therapeutic innovation.',
              'Promote knowledge exchange on public health and disease prevention.',
              'Highlight developments in engineering, technology, and business.',
              'Share emerging trends and discoveries in academic research.',
              'Discuss transformative technologies and their applications in healthcare and industry.',
              'Bridge the gap between research outcomes and industry needs.',
              'Encourage interdisciplinary collaboration to address global challenges.'
            ].map((point, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 font-mono">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            8. OUR PRESENTATION FORUMS
            ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100 inline-block font-mono">
              Academic Formats
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
              Our Presentation Forums
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Diverse presentation tracks, plenary assemblies, and collaborative sessions crafted to maximize scholarly exchange.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[
              {
                title: 'Keynote Forum',
                desc: 'Distinguished speakers share expert perspectives, significant research findings, and emerging developments, establishing the central conference themes and inspiring discussion.',
                icon: Mic
              },
              {
                title: 'Mini-Plenary Sessions',
                desc: 'Focused sessions where experts discuss current scientific developments, industry challenges, and potential solutions through presentations and interactive discussions.',
                icon: MessagesSquare
              },
              {
                title: 'Distinguished Speakers Forum',
                desc: 'Connects participants with experienced professionals across science, education, medicine, healthcare, technology, and business.',
                icon: UsersRound
              },
              {
                title: 'Student Forum',
                desc: 'Encourages curiosity, creativity, and scientific thinking by allowing students to present ideas, discuss research interests, and engage with the scientific community.',
                icon: GraduationCap
              },
              {
                title: 'Poster Sessions',
                desc: 'Provide researchers, students, entrepreneurs, and professionals with a platform to communicate findings visually, receive feedback, and connect with peers.',
                icon: Presentation
              },
              {
                title: 'Young Investigators Forum',
                desc: 'Supports emerging researchers in discussing new methodologies, research opportunities, and developments across science, medicine, engineering, and technology.',
                icon: FlaskConical
              },
              {
                title: 'Educational Workshops',
                desc: 'Interactive learning experiences that strengthen knowledge and practical skills through guided activities, expert instruction, and discussion.',
                icon: BookOpen
              },
              {
                title: 'Research Workshops',
                desc: 'Enable researchers to present findings, explore emerging research directions, exchange ideas, and develop collaborative approaches.',
                icon: Microscope
              },
              {
                title: 'Corporate Workshops',
                desc: 'Focus on strategy, leadership, communication, teamwork, innovation, and business development.',
                icon: BriefcaseBusiness
              },
              {
                title: 'Mini-Symposia',
                desc: 'Bring together multiple speakers to present complementary perspectives on a shared research topic.',
                icon: Network
              },
              {
                title: 'Highlights of the Day',
                desc: 'Summarize key presentations, discussions, discoveries, and activities to help participants reflect on important insights.',
                icon: CalendarCheck
              },
              {
                title: 'Meet the Professor',
                desc: 'Interactive sessions where participants connect with professors, scientists, and experienced researchers to discuss academic and research interests.',
                icon: GraduationCap
              },
              {
                title: 'Training Programs',
                desc: 'Structured learning experiences designed to develop practical knowledge and professional capabilities in academic, scientific, and corporate environments.',
                icon: BookMarked
              },
              {
                title: 'Investor Meetings',
                desc: 'Connect entrepreneurs, startups, investors, and potential partners to discuss innovative ideas, business opportunities, and future collaboration.',
                icon: Handshake
              }
            ].map((forum, idx) => {
              const IconComp = forum.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 font-display group-hover:text-[#0E7490] transition-colors">
                      {forum.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                      {forum.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            9. OUR AIM — HOST, PROMOTE, TRANSFORM
            ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100 inline-block font-mono">
              Core Pillars
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
              Our Aim — Host, Promote, Transform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Host */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Host</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Organize international scientific conferences across diverse disciplines, creating platforms for sharing original research and exploring developments in science, medicine, technology, engineering, healthcare, and business.
              </p>
            </div>

            {/* Promote */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Promote</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Encourage scientific learning, research dissemination, and the practical application of new ideas by connecting students, scholars, researchers, and industry professionals.
              </p>
            </div>

            {/* Transform */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-display">Transform</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Support progress across science, education, healthcare, technology, and business by encouraging collaboration between thought leaders, researchers, and innovators.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. WHAT DO YOU GAIN FROM SCINS MEDIA CONFERENCES?
            ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E7490] bg-teal-50 px-3.5 py-1 rounded-full border border-teal-100 inline-block font-mono">
              Delegate & Partner Value
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
              What Do You Gain from SCINS MEDIA Conferences?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore the professional benefits, research exposure, and global networking opportunities available across our scientific events.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Annual Membership Programs',
                desc: 'Membership opportunities can help students, researchers, entrepreneurs, and speakers engage with multiple scientific events and expand their professional networks. Display membership programs only where available.',
                icon: Users
              },
              {
                title: 'Sponsorship Opportunities',
                desc: 'Sponsorship packages can help organizations, institutions, and industry partners showcase their work, connect with relevant audiences, and strengthen their visibility within the scientific community.',
                icon: Handshake
              },
              {
                title: 'Global Destinations',
                desc: 'International conferences offer opportunities to experience different academic environments, connect with researchers from other regions, and explore cultural perspectives alongside professional activities.',
                icon: MapPin
              },
              {
                title: 'Continuing Education',
                desc: 'Conferences support ongoing learning through exposure to new research, scientific discussions, and professional developments. Advertise CME, CE, or CPD credits only when formally approved or available for the specific event.',
                icon: BookOpenCheck
              },
              {
                title: 'Associations and Partnerships',
                desc: 'SCINS MEDIA seeks to foster relationships with academic institutions, professional associations, research organizations, and industry partners to encourage collaboration and strengthen scientific engagement.',
                icon: Network
              },
              {
                title: 'Awards and Recognition',
                desc: 'Awards and recognition programs can celebrate outstanding research, presentations, and emerging talent. Mention specific awards, travel grants, or eligibility criteria only when confirmed for an event.',
                icon: Award
              },
              {
                title: 'Business Matchmaking',
                desc: 'Conferences create opportunities for researchers, entrepreneurs, industry representatives, and potential collaborators to exchange ideas, explore partnerships, and identify opportunities for future projects.',
                icon: UsersRound
              }
            ].map((benefit, idx) => {
              const IconComp = benefit.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:border-[#0E7490] hover:shadow-lg transition-all space-y-3 ${
                    idx === 6 ? 'sm:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0E7490] border border-teal-100 flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>


        {/* =========================================================================
            11. CLOSING CALL TO ACTION
            ========================================================================= */}
        <section className="bg-gradient-to-br from-[#0A2540] to-slate-950 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="absolute inset-0 bg-radial-at-c from-teal-900/30 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-800/80 inline-block">
              Join the Network
            </span>

            <h2 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight">
              Be Part of the Global Research Community
            </h2>

            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                Join SCINS MEDIA to exchange knowledge, showcase discoveries, build meaningful connections, and explore new opportunities in science, research, and innovation.
              </p>
              <p className="text-xs sm:text-sm text-slate-400">
                Whether you are a student presenting your first research paper, an experienced academic sharing your latest findings, or an industry professional exploring emerging technologies, SCINS MEDIA offers a platform to connect, learn, and contribute.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/conferences')}
                className="px-7 py-3.5 bg-[#14B8A6] hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md cursor-pointer"
              >
                <span>Explore Conferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/abstract')}
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
              >
                <span>Submit Your Research</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

// =============================================================================
// SCINSMEDIA — 14-Step Enterprise Congress Creation Wizard
// Full-Featured Production-Grade Multi-Step Workflow with Real Validations
// =============================================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Award,
  Shield,
  FileText,
  Image as ImageIcon,
  Search,
  Share2,
  Sparkles,
  BookOpen,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Copy,
  Download,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  AlertCircle,
  ArrowRight,
  Star,
  Globe,
  Building2,
  Tag,
  ExternalLink,
  Zap,
  CheckSquare,
  Bookmark,
  Briefcase,
  Sliders,
  CheckCheck,
  X,
  Maximize2,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MediaUploadInput } from './MediaUploadInput';
import { LiveDesktopViewportPreview } from './LiveDesktopViewportPreview';
import { ConferenceDetailsPage } from '../../pages/ConferenceDetailsPage';
import { api } from '../../services/api';
import {
  Conference,
  CommitteeMember,
  Speaker,
  Session,
  RegistrationCategory,
  ConferenceMode,
  ConferenceStatus,
  ScheduleItem
} from '../../types';

interface CongressWizardProps {
  initialConference?: Conference | null;
  onConferenceCreated: (conf: Conference) => void;
  onConferenceUpdated?: (conf: Conference) => void;
  onCancel?: () => void;
  onNavigateToConference?: (slug: string) => void;
}

// Preset Domains
const SCIENTIFIC_DOMAINS = [
  'Biotechnology',
  'Nanomedicine',
  'Artificial Intelligence & Digital Health',
  'Oncology & Cancer Research',
  'Green Chemistry & Circular Economy',
  'Materials Science & Nanotechnology',
  'Neuroscience & Neurology',
  'Quantum Computing & Physics',
  'Immunology & Infectious Diseases',
  'Genetics & Molecular Biology',
  'Pharmacology & Drug Discovery',
  'Renewable Energy & Sustainability',
  'Robotics & Biomedical Engineering',
  'Cardiology & Vascular Medicine'
];

// Curated Hero Presets
const HERO_PRESETS = [
  {
    name: 'Biotechnology & Macromolecules',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
    category: 'Biotech'
  },
  {
    name: 'Nanomedicine & Targeted Delivery',
    url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1600&q=80',
    category: 'Medicine'
  },
  {
    name: 'AI Neural Networks & Healthcare',
    url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1600&q=80',
    category: 'AI / Tech'
  },
  {
    name: 'Green Polymers & Sustainable Chemistry',
    url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1600&q=80',
    category: 'Green Tech'
  },
  {
    name: 'Quantum Physics & Superconductivity',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80',
    category: 'Quantum'
  },
  {
    name: 'Oncology Research & Precision Therapy',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80',
    category: 'Oncology'
  },
  {
    name: 'Grand European Convention Center',
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80',
    category: 'Venue'
  },
  {
    name: 'Modern Futuristic Auditorium',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80',
    category: 'Auditorium'
  }
];

// Curated Chair Photo Presets
const SPEAKER_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
];

// Top International Convention Venues
const VENUE_PRESETS = [
  {
    city: 'Boston',
    country: 'United States',
    venue: 'Boston Convention & Exhibition Center',
    address: '415 Summer St, Boston, MA 02210, United States',
    timezone: 'America/New_York (UTC-4)'
  },
  {
    city: 'Paris',
    country: 'France',
    venue: 'Paris Convention Centre & Palais des Congrès',
    address: '1 Rue du Fossé Blanc, 92230 Gennevilliers, Paris, France',
    timezone: 'Europe/Paris (UTC+2)'
  },
  {
    city: 'Singapore',
    country: 'Singapore',
    venue: 'Suntec Singapore Convention & Exhibition Centre',
    address: '1 Raffles Blvd, Singapore 039593',
    timezone: 'Asia/Singapore (UTC+8)'
  },
  {
    city: 'Zurich',
    country: 'Switzerland',
    venue: 'Kongresshaus Zürich & Science Pavilion',
    address: 'Gotthardstrasse 5, 8002 Zürich, Switzerland',
    timezone: 'Europe/Zurich (UTC+2)'
  },
  {
    city: 'London',
    country: 'United Kingdom',
    venue: 'ExCeL London International Convention Hall',
    address: 'Royal Victoria Dock, 1 Western Gateway, London E16 1XL',
    timezone: 'Europe/London (UTC+1)'
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    venue: 'Tokyo Big Sight International Exhibition Hall',
    address: '3 Chome-11-1 Ariake, Koto City, Tokyo 135-0063, Japan',
    timezone: 'Asia/Tokyo (UTC+9)'
  }
];

// Helper to generate 20 domain sessions
const generate20SessionsForDomain = (domain: string, confCode: string): Partial<Session>[] => {
  const shortDomain = domain.split(' ')[0] || 'SCIN';
  const prefix = confCode ? confCode.replace('SCINS-', '') : shortDomain.toUpperCase();

  const sampleTracks = [
    { title: `Fundamental Macromolecular Pathways & Synthesis Kinetics`, track: 'Core Science', type: 'Keynote Session' },
    { title: `Advanced Nanoscale Formulation & Targeted Payload Architecture`, track: 'Formulation', type: 'Oral Presentation' },
    { title: `Clinical Translation, Pharmacokinetics & Regulatory Approvals`, track: 'Clinical Trials', type: 'Keynote Session' },
    { title: `Biocatalysis, Enzymatic Cascades & Fermentation Engineering`, track: 'Bioprocessing', type: 'Oral Presentation' },
    { title: `Cellulose Nanocrystals, Bio-Gels & Biomaterial Composites`, track: 'Nanomaterials', type: 'Special Symposium' },
    { title: `High-Throughput Screening & Deep Learning Modeling`, track: 'Computational', type: 'Oral Presentation' },
    { title: `Novel Biomarkers, Diagnostics & Multi-Omics Profiling`, track: 'Diagnostics', type: 'Oral Presentation' },
    { title: `Industrial Scale-Up, Extrusion & Continuous Manufacturing`, track: 'Engineering', type: 'Panel Discussion' },
    { title: `Circular Lifecycle Governance, Upcycling & Degradability`, track: 'Sustainability', type: 'Keynote Session' },
    { title: `Marine Bio-Macromolecules, Alginate & Chitosan Systems`, track: 'Marine Science', type: 'Oral Presentation' },
    { title: `Precision Oncology & Targeted Cellular Immunotherapy`, track: 'Therapeutics', type: 'Oral Presentation' },
    { title: `Green Solvent Chemistry, Supercritical CO2 & Catalysis`, track: 'Green Tech', type: 'Oral Presentation' },
    { title: `Next-Generation Biosensors & Microfluidic Biochips`, track: 'Sensors', type: 'Oral Presentation' },
    { title: `Polymer Rheology, Crystallization & Structural Analysis`, track: 'Characterization', type: 'Oral Presentation' },
    { title: `Global Environmental Policy, Life-Cycle Assessment (LCA) & ESG`, track: 'Policy & Standards', type: 'Panel Discussion' },
    { title: `3D Bioprinting, Scaffolds & Tissue Engineering`, track: 'Regenerative', type: 'Keynote Session' },
    { title: `Smart Packaging, Oxygen Scavengers & Antimicrobial Coatings`, track: 'Packaging', type: 'Oral Presentation' },
    { title: `Postgraduate & Early Career Researcher Discovery Forum`, track: 'Poster & Forum', type: 'Poster Session' },
    { title: `Venture Capital, Commercialization & Spinout Incubation`, track: 'Innovation', type: 'Workshop' },
    { title: `Grand Synthesis, Plenary Resolutions & Global Committee Charter`, track: 'Plenary', type: 'Keynote Session' }
  ];

  return sampleTracks.map((st, idx) => ({
    session_number: idx + 1,
    session_code: `${prefix}-SES-${String(idx + 1).padStart(2, '0')}`,
    title: st.title,
    track: st.track,
    category: st.type.includes('Keynote') ? 'Keynote & Oral' : st.type.includes('Poster') ? 'Poster Track' : 'Oral Session',
    description: `Rigorous peer-reviewed presentation track exploring groundbreaking discoveries, empirical methodologies, and industry deployment in ${st.track.toLowerCase()}.`,
    session_type: st.type as any,
    room: idx % 2 === 0 ? 'Auditorium Hall A (Main Stage)' : 'Amphitheatre Hall B (Track 2)',
    session_date: '2026-09-15',
    start_time: `${String(9 + Math.floor(idx / 3) * 2).padStart(2, '0')}:00`,
    end_time: `${String(10 + Math.floor(idx / 3) * 2).padStart(2, '0')}:30`
  }));
};

const buildInitialFormData = (conf?: Conference | null) => {
  if (conf) {
    return {
      title: conf.title || '',
      short_title: conf.short_title || '',
      slug: conf.slug || '',
      conference_code: conf.conference_code || '',
      display_order: typeof conf.display_order === 'number' ? conf.display_order : 1,
      theme: conf.theme || '',
      tagline: conf.tagline || '',
      domain: conf.domain || 'Biotechnology',
      start_date: conf.start_date || '',
      end_date: conf.end_date || '',
      city: conf.city || '',
      country: conf.country || '',
      venue: conf.venue || '',
      venue_address: conf.venue_address || '',
      timezone: conf.timezone || 'UTC',
      abstract_deadline: conf.abstract_deadline || '',
      early_bird_deadline: conf.early_bird_deadline || '',
      registration_deadline: conf.registration_deadline || '',
      accept_late_breaking: conf.accept_late_breaking ?? true,
      cme_credits_eligible: conf.cme_credits_eligible ?? true,
      mode: (conf.mode || 'hybrid') as ConferenceMode,
      status: (conf.status || 'published') as ConferenceStatus,
      featured_badge: conf.featured_badge || '',
      primary_language: conf.primary_language || 'English',
      max_attendees: conf.max_attendees || 500,
      hero_image: conf.hero_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
      program_image: conf.program_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      flyer_url: conf.flyer_url || '',
      accent_color: conf.accent_color || 'teal',
      about_heading: conf.about_heading || '',
      description: conf.description || '',
      detailed_about: conf.detailed_about || conf.description || '',
      about_highlights: (conf.about_highlights && conf.about_highlights.length === 4)
        ? conf.about_highlights
        : [
            'Over 450+ physical attendees from 48 nations',
            '20 specialized scientific tracks & breakout rooms',
            'Elsevier Scopus-indexed special issue publication',
            'Direct B2B technology transfer & venture showcase'
          ],
      gallery_images: (conf.gallery_images && conf.gallery_images.length === 4)
        ? conf.gallery_images
        : [
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
          ],
      objectives: conf.objectives || [
        'Catalyze interdisciplinary breakthroughs',
        'Accelerate translational innovation and clinical deployment',
        'Bridge theoretical scientific discovery with industrial scaling',
        'Provide early-career researchers with high-visibility presentation tracks'
      ],
      target_audience: conf.target_audience || ['Research Scientists', 'Academicians', 'Ph.D. Scholars', 'Industry Directors', 'Clinical Investigators'],
      welcome_heading: conf.welcome_heading || 'Message from the General Chair',
      welcome_message: conf.welcome_message || '',
      welcome_speaker_name: conf.welcome_speaker_name || '',
      welcome_speaker_role: conf.welcome_speaker_role || 'Conference Chair',
      welcome_speaker_title: conf.welcome_speaker_title || '',
      welcome_speaker_image: conf.welcome_speaker_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      welcome_footer_text: conf.welcome_footer_text || 'Join us to collaborate, innovate, and drive scientific excellence forward.',
      exhibitor_heading: conf.exhibitor_heading || 'Global Industry Leaders & Technology Showcase',
      exhibitor_message: conf.exhibitor_message || '',
      exhibitor_speaker_name: conf.exhibitor_speaker_name || 'Confirmed Industry Exhibitors',
      exhibitor_speaker_role: conf.exhibitor_speaker_role || 'Platinum & Gold Partners',
      exhibitor_speaker_title: conf.exhibitor_speaker_title || 'Main Exhibition Hall & Innovation Pavilions',
      exhibitor_image: conf.exhibitor_image || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=80',
      exhibitor_footer_text: conf.exhibitor_footer_text || 'Live demonstrations and commercial partner consultations scheduled throughout the congress.',
      meta_title: conf.meta_title || '',
      meta_description: conf.meta_description || '',
      keywords: conf.keywords || '',
      committee: conf.committee ? conf.committee.map(m => ({ ...m })) : [],
      speakers: conf.speakers ? conf.speakers.map(s => ({ ...s })) : [],
      sessions: conf.sessions ? conf.sessions.map(s => ({ ...s })) : [],
      categories: conf.categories ? conf.categories.map(c => ({ ...c })) : [],
      indexing_partners: conf.indexing_partners || [
        'Elsevier ScienceDirect',
        'Scopus Indexed Proceedings',
        'Web of Science (Clarivate)',
        'Springer Nature Materials'
      ],
      journal_name: conf.journal_name || '',
      journal_issn: conf.journal_issn || '',
      sponsors: conf.sponsors ? conf.sponsors.map(s => ({ ...s })) : [],
      schedule: conf.schedule ? conf.schedule.map(s => ({ ...s })) : []
    };
  }

  return {
    title: '3rd International Congress on Quantum Computing & Advanced Materials',
    short_title: 'QuantumMat 2026',
    slug: 'quantum-computing-advanced-materials-2026',
    conference_code: 'SCINS-QNT-2026',
    display_order: 1,
    theme: 'Engineering Next-Generation Quantum Coherence and Topological Nanostructures',
    tagline: 'Pioneering Scalable Quantum Architectures and Superconducting Materials',
    domain: 'Quantum Computing & Physics',
    start_date: '2026-09-14',
    end_date: '2026-09-16',
    city: 'Boston',
    country: 'United States',
    venue: 'Boston Convention & Exhibition Center',
    venue_address: '415 Summer St, Boston, MA 02210, United States',
    timezone: 'America/New_York (UTC-4)',
    abstract_deadline: '2026-07-15',
    early_bird_deadline: '2026-06-30',
    registration_deadline: '2026-09-01',
    accept_late_breaking: true,
    cme_credits_eligible: true,
    mode: 'hybrid' as ConferenceMode,
    status: 'published' as ConferenceStatus,
    featured_badge: '3rd Global Flagship Edition',
    primary_language: 'English (Simultaneous Translation Available)',
    max_attendees: 900,
    hero_image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80',
    program_image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    flyer_url: 'https://scinsmedia.org/flyers/quantummat-2026-official-brochure.pdf',
    accent_color: 'teal',
    about_heading: 'Accelerating Sustainable Quantum Breakthroughs & Computational Decarbonization',
    description: 'The world premier gathering of quantum physicists, topological material scientists, cryogenics engineers, and algorithm architects convening to accelerate scalable quantum coherent systems.',
    detailed_about: `QuantumMat 2026 represents the pinnacle of global scientific collaboration in quantum information systems and superconducting topological matters. Over three intensive days in Boston, world-renowned academicians, Nobel laureates, and industry leaders will present groundbreaking breakthroughs in trapped-ion qubits, fault-tolerant error correction, cryogenic CMOS interfacing, and 2D materials.\n\nAll accepted and peer-reviewed abstracts will be published in Scopus and Web of Science indexed international proceedings, granting authors immediate global scientific recognition and citations across premier databases.`,
    about_highlights: [
      'Over 550+ physical attendees from 42 nations',
      '20 specialized scientific tracks & breakout rooms',
      'Elsevier Scopus-indexed special issue publication',
      'Direct B2B technology transfer & venture showcase'
    ],
    objectives: [
      'Catalyze interdisciplinary breakthroughs between solid-state physicists and algorithm engineers',
      'Accelerate fault-tolerant quantum error correction and topological qubit fabrication',
      'Bridge theoretical quantum chemistry with industrial materials science deployment',
      'Provide early-career researchers with high-visibility plenary presentation opportunities'
    ],
    target_audience: ['Quantum Physicists', 'Materials Scientists', 'Semiconductor Engineers', 'Ph.D. Fellows', 'Biotech & Pharma Investigators', 'Venture Partners'],
    welcome_heading: 'Message from the General Chair',
    welcome_message: 'On behalf of the International Scientific Organizing Committee, it is my utmost privilege to welcome you to QuantumMat 2026 in Boston. Together, we are engineering the mathematical foundations and material paradigms that will define the next century of computation.',
    welcome_speaker_name: 'Prof. Julian Vance, Ph.D.',
    welcome_speaker_role: 'Conference Chair',
    welcome_speaker_title: 'Chair of Quantum Physics & Director of Center for Topological Materials, MIT',
    welcome_speaker_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    welcome_footer_text: 'Join us at QuantumMat 2026 in Boston to collaborate, innovate, and drive scientific excellence forward.',
    exhibitor_heading: 'Global Industry Leaders & Technology Showcase',
    exhibitor_message: 'Explore breakthrough quantum hardware technologies, cryogenic refrigeration systems, and industrial software toolkits from premier international partners including IBM Quantum, Rigetti, Oxford Instruments, and Bluefors. Connect with technical directors, review prototype dilution refrigerators, and explore commercial partnerships across both days of the congress.',
    exhibitor_speaker_name: 'Confirmed Industry Exhibitors',
    exhibitor_speaker_role: 'Platinum & Gold Partners',
    exhibitor_speaker_title: 'Main Exhibition Hall & Innovation Pavilions (Booths P-101 to E-408)',
    exhibitor_image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=80',
    exhibitor_footer_text: 'Live demonstrations and commercial partner consultations scheduled throughout the congress.',
    meta_title: '3rd International Congress on Quantum Computing & Advanced Materials | Boston 2026',
    meta_description: 'Join 900+ global scientists at QuantumMat 2026 in Boston. Explore 20 scientific sessions on quantum hardware, topological materials, and Scopus indexed publications.',
    keywords: 'quantum computing, advanced materials, topological insulators, Boston conference 2026, Scopus indexed',
    committee: [
      {
        id: 1,
        name: 'Prof. Julian Vance, Ph.D.',
        designation: 'Chair of Quantum Physics',
        institution: 'Massachusetts Institute of Technology (MIT)',
        country: 'United States',
        committee_role: 'General Chair' as const,
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        biography: 'Pioneered non-Abelian anyon braiding in semiconductor-superconductor heterostructures with over 18,000 citations.',
        display_order: 1
      },
      {
        id: 2,
        name: 'Dr. Elena Rostova, D.Sc.',
        designation: 'Head of Cryogenic Materials Lab',
        institution: 'ETH Zürich',
        country: 'Switzerland',
        committee_role: 'Co-Chair' as const,
        photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        biography: 'World authority on high-Tc cuprate superconductor interfaces and cryogenic millikelvin instrumentation.',
        display_order: 2
      },
      {
        id: 3,
        name: 'Prof. Kenji Takahashi',
        designation: 'Director of Topological Computing',
        institution: 'University of Tokyo / RIKEN',
        country: 'Japan',
        committee_role: 'Scientific Committee' as const,
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        biography: 'Leader in 2D van der Waals heterostructure fabrication and Majorana fermion verification experiments.',
        display_order: 3
      },
      {
        id: 4,
        name: 'Dr. Amara Thorne, Ph.D.',
        designation: 'Principal Quantum Architect',
        institution: 'Oxford Quantum Information Center',
        country: 'United Kingdom',
        committee_role: 'Scientific Committee' as const,
        photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        biography: 'Specializes in fault-tolerant surface codes and optical interconnects for modular dilution refrigerators.',
        display_order: 4
      }
    ],
    speakers: [
      {
        id: 1,
        name: 'Prof. Julian Vance',
        prefix: 'Prof.',
        designation: 'Chair of Quantum Physics & MIT Fellow',
        institution: 'Massachusetts Institute of Technology (MIT)',
        country: 'United States',
        research_domain: 'Quantum Physics',
        speaker_type: 'Plenary Keynote',
        presentation_title: 'Topological Protection and Fault-Tolerant Braiding in Majorana Nanowires',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        biography: 'Global pioneer in solid-state quantum computation and non-Abelian statistics.',
        h_index: 68
      },
      {
        id: 2,
        name: 'Dr. Elena Rostova',
        prefix: 'Dr.',
        designation: 'Head of Cryogenic Nanomaterials',
        institution: 'ETH Zürich',
        country: 'Switzerland',
        research_domain: 'Materials Science',
        speaker_type: 'Distinguished Speaker',
        presentation_title: 'Superconducting Heterostructures at the 10 Millikelvin Frontier',
        photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        biography: 'Recipient of the European Physical Society Condensed Matter Prize.',
        h_index: 52
      },
      {
        id: 3,
        name: 'Prof. Kenji Takahashi',
        prefix: 'Prof.',
        designation: 'Director of Topological Computing',
        institution: 'University of Tokyo',
        country: 'Japan',
        research_domain: 'Quantum Computing',
        speaker_type: 'Keynote Speaker',
        presentation_title: 'Scalable 2D van der Waals Josephson Junctions for Quantum Coherence',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        biography: 'Over 140 peer-reviewed papers in Nature and Physical Review Letters.',
        h_index: 49
      }
    ],
    sessions: [],
    categories: [
      {
        id: 1,
        code: 'ACAD-PASS',
        name: 'Academic & Faculty Delegate',
        price: 799,
        early_bird_price: 649,
        currency: 'USD',
        benefits: [
          'Full access to all 20 scientific breakout tracks & symposia',
          'Oral / Poster presentation slot upon peer review',
          'Official Scopus-indexed congress proceedings volume',
          'Daily buffet networking luncheons & coffee breaks',
          'Formal Certificate of Scientific Participation'
        ],
        is_popular: true
      }
    ],
    indexing_partners: [
      'Elsevier ScienceDirect',
      'Scopus Indexed Proceedings',
      'Web of Science (Clarivate)',
      'Springer Nature Materials',
      'IEEE Xplore Digital Library',
      'PubMed / MEDLINE'
    ],
    journal_name: 'Journal of Quantum Materials & Solid-State Computing',
    journal_issn: 'ISSN 2831-9042 (Print) | 2831-9050 (Online)',
    sponsors: [],
    schedule: []
  };
};

export const CongressWizard: React.FC<CongressWizardProps> = ({
  initialConference,
  onConferenceCreated,
  onConferenceUpdated,
  onCancel,
  onNavigateToConference
}) => {
  const isEditing = Boolean(initialConference?.id);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLivePreviewModalOpen, setIsLivePreviewModalOpen] = useState(false);
  const [livePreviewDevice, setLivePreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedConference, setPublishedConference] = useState<Conference | null>(null);
  
  const stepsNavRef = useRef<HTMLDivElement>(null);
  const stepButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

  const scrollNav = (direction: 'left' | 'right') => {
    if (stepsNavRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      stepsNavRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    stepButtonRefs.current[currentStep]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }, [currentStep]);

  const [formData, setFormData] = useState(() => buildInitialFormData(initialConference));

  useEffect(() => {
    setFormData(buildInitialFormData(initialConference));
    setCurrentStep(1);
  }, [initialConference]);

  const previewConference: Conference = useMemo(() => {
    return {
      id: initialConference?.id || 999999,
      title: formData.title || 'Untitled Scientific Congress',
      short_title: formData.short_title || 'Congress 2026',
      slug: formData.slug || 'untitled-conference-2026',
      conference_code: formData.conference_code || 'SCINS-CONF-2026',
      display_order: typeof formData.display_order === 'number' ? formData.display_order : 1,
      theme: formData.theme || '',
      tagline: formData.tagline || '',
      description: formData.description || '',
      detailed_about: formData.detailed_about || formData.description || '',
      about_heading: formData.about_heading || '',
      about_highlights: formData.about_highlights,
      gallery_images: formData.gallery_images,
      domain: formData.domain || 'Biotechnology',
      city: formData.city || 'Boston',
      country: formData.country || 'United States',
      venue: formData.venue || 'Convention Center',
      venue_address: formData.venue_address || '',
      timezone: formData.timezone || 'UTC',
      start_date: formData.start_date || '2026-10-12',
      end_date: formData.end_date || '2026-10-14',
      abstract_deadline: formData.abstract_deadline || '2026-08-15',
      early_bird_deadline: formData.early_bird_deadline || '2026-07-31',
      registration_deadline: formData.registration_deadline || '2026-09-30',
      mode: formData.mode || 'hybrid',
      status: formData.status || 'published',
      hero_image: formData.hero_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
      program_image: formData.program_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      flyer_url: formData.flyer_url || '',
      featured_badge: formData.featured_badge || '',
      welcome_heading: formData.welcome_heading || 'Message from the General Chair',
      welcome_message: formData.welcome_message || '',
      welcome_speaker_name: formData.welcome_speaker_name || '',
      welcome_speaker_role: formData.welcome_speaker_role || 'Conference Chair',
      welcome_speaker_title: formData.welcome_speaker_title || '',
      welcome_speaker_image: formData.welcome_speaker_image || '',
      welcome_footer_text: formData.welcome_footer_text || '',
      exhibitor_heading: formData.exhibitor_heading || 'Global Industry Leaders & Technology Showcase',
      exhibitor_message: formData.exhibitor_message || '',
      exhibitor_speaker_name: formData.exhibitor_speaker_name || '',
      exhibitor_speaker_role: formData.exhibitor_speaker_role || '',
      exhibitor_speaker_title: formData.exhibitor_speaker_title || '',
      exhibitor_image: formData.exhibitor_image || '',
      exhibitor_footer_text: formData.exhibitor_footer_text || '',
      meta_title: formData.meta_title || '',
      meta_description: formData.meta_description || '',
      keywords: formData.keywords || '',
      committee: formData.committee || [],
      speakers: formData.speakers || [],
      sessions: formData.sessions || [],
      categories: formData.categories || [],
      sponsors: formData.sponsors || [],
      schedule: formData.schedule || [],
      created_at: initialConference?.created_at || new Date().toISOString()
    } as Conference;
  }, [formData, initialConference]);

  const STEPS = [
    { num: 1, title: 'Title & Code', subtitle: 'Congress title, domain & code' },
    { num: 2, title: 'Venue & City', subtitle: 'Dates, city & convention center' },
    { num: 3, title: 'Deadlines', subtitle: 'Abstracts, early bird & dates' },
    { num: 4, title: 'Format & Status', subtitle: 'Mode, capacity & live status' },
    { num: 5, title: 'Hero Media', subtitle: 'Hero & program banners' },
    { num: 6, title: 'About & Highlights', subtitle: 'Scope, 4 pillars & 4 gallery photos' },
    { num: 7, title: 'Welcome & Exhibitors', subtitle: 'Welcome address & exhibitors' },
    { num: 8, title: 'SEO & Social', subtitle: 'Search metadata & SERP preview' },
    { num: 9, title: 'Committee', subtitle: 'Organizing committee & chairs' },
    { num: 10, title: 'Speakers', subtitle: 'Conference speakers & topics' },
    { num: 11, title: '20 Sessions', subtitle: 'Full scientific tracks & halls' },
    { num: 12, title: 'Pricing Tiers', subtitle: 'Registration packages & perks' },
    { num: 13, title: 'Journals & Sponsors', subtitle: 'Scopus index & sponsors' },
    { num: 14, title: 'Final Review', subtitle: 'Validation & MySQL publish' }
  ];

  // Helper for Auto-Generating Code & Slug
  const handleAutoGenerateSlugAndCode = (title: string, domain: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);

    const year = new Date().getFullYear();
    const shortDomain = domain.substring(0, 3).toUpperCase() || 'SCI';
    const code = `SCINS-${shortDomain}-${year}`;

    setFormData(prev => ({
      ...prev,
      slug,
      conference_code: code
    }));
  };

  // Step 1 Quick Fill Presets
  const applyDomainPreset = (chosenDomain: string) => {
    const defaultTitle = `4th World Congress on ${chosenDomain} & Emerging Frontiers`;
    const defaultShort = `${chosenDomain.split(' ')[0]} 2026`;
    const newSlug = defaultTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const newCode = `SCINS-${chosenDomain.substring(0, 4).toUpperCase()}-2026`;
    const newSessions = generate20SessionsForDomain(chosenDomain, newCode);

    setFormData(prev => ({
      ...prev,
      domain: chosenDomain,
      title: defaultTitle,
      short_title: defaultShort,
      slug: newSlug,
      conference_code: newCode,
      theme: `Advancing Global Innovation and Translational Breakthroughs in ${chosenDomain}`,
      tagline: `Connecting Minds, Inspiring Innovation across ${chosenDomain}`,
      sessions: newSessions
    }));
  };

  // Step 6: Objectives Handler
  const handleAddObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, 'New scientific milestone or translational objective']
    }));
  };

  const handleUpdateObjective = (idx: number, text: string) => {
    const updated = [...formData.objectives];
    updated[idx] = text;
    setFormData(prev => ({ ...prev, objectives: updated }));
  };

  const handleRemoveObjective = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== idx)
    }));
  };

  // Step 9: Committee Handlers
  const handleAddCommitteeMember = () => {
    const newMember: any = {
      id: Date.now(),
      name: 'Dr. New Committee Member, Ph.D.',
      designation: 'Professor of Science',
      institution: 'University / Institute of Technology',
      country: 'United States',
      committee_role: 'Scientific Committee',
      photo_url: SPEAKER_PHOTO_PRESETS[Math.floor(Math.random() * SPEAKER_PHOTO_PRESETS.length)],
      biography: 'Distinguished researcher with notable peer-reviewed publications and editorial contributions.',
      display_order: formData.committee.length + 1
    };
    setFormData(prev => ({ ...prev, committee: [...prev.committee, newMember] }));
  };

  const handleRemoveCommitteeMember = (id: number) => {
    setFormData(prev => ({
      ...prev,
      committee: prev.committee.filter(m => m.id !== id)
    }));
  };

  // Step 10: Keynote Speaker Handlers
  const handleAddSpeaker = () => {
    const newSp: any = {
      id: Date.now(),
      name: 'Prof. New Speaker',
      prefix: 'Prof.',
      designation: 'Senior Faculty Investigator',
      institution: 'Global Research University',
      country: 'United States',
      research_domain: formData.domain,
      speaker_type: 'Keynote',
      presentation_title: `Emerging Paradigms in ${formData.domain}`,
      photo_url: SPEAKER_PHOTO_PRESETS[Math.floor(Math.random() * SPEAKER_PHOTO_PRESETS.length)],
      biography: 'Leading expert in translational scientific methodologies.',
      h_index: 45
    };
    setFormData(prev => ({ ...prev, speakers: [...prev.speakers, newSp] }));
  };

  const handleRemoveSpeaker = (id: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter(s => s.id !== id)
    }));
  };

  // Step 11: Session Edit Handler
  const handleUpdateSession = (index: number, field: string, value: any) => {
    const updated = [...formData.sessions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, sessions: updated }));
  };

  // Step 12: Pricing Edit Handler
  const handleUpdateCategory = (idx: number, field: string, value: any) => {
    const updated = [...formData.categories];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData(prev => ({ ...prev, categories: updated }));
  };

  // Validation Logic per Step
  const stepValidation = useMemo(() => {
    const checks = {
      1: formData.title.trim().length >= 5 && formData.conference_code.trim().length >= 3,
      2: Boolean(formData.city && formData.country && formData.venue && formData.start_date && formData.end_date),
      3: Boolean(formData.abstract_deadline && formData.early_bird_deadline && formData.registration_deadline),
      4: Boolean(formData.mode && formData.status),
      5: Boolean(formData.hero_image && formData.hero_image.startsWith('http')),
      6: formData.description.trim().length >= 20,
      7: Boolean(formData.welcome_message.trim().length >= 10 && formData.welcome_speaker_name.trim()),
      8: Boolean(formData.meta_title.trim() && formData.meta_description.trim()),
      9: formData.committee.length >= 1,
      10: formData.speakers.length >= 1,
      11: formData.sessions.length >= 1,
      12: formData.categories.length >= 1 && formData.categories.every(c => c.price > 0),
      13: formData.indexing_partners.length >= 1,
      14: true
    };
    return checks;
  }, [formData]);

  // Overall form validity
  const isFormValid = Object.values(stepValidation).every(Boolean);

  // Final Publish Handler
  const handleFinalPublish = async () => {
    setIsSubmitting(true);
    try {
      // Assemble conference record with 100% frontend alignment
      const conferencePayload: any = {
        title: formData.title,
        short_title: formData.short_title,
        slug: formData.slug,
        conference_code: formData.conference_code,
        display_order: typeof formData.display_order === 'number' ? formData.display_order : 1,
        theme: formData.theme,
        tagline: formData.tagline,
        description: formData.description,
        detailed_about: formData.detailed_about,
        about_heading: formData.about_heading,
        about_highlights: formData.about_highlights,
        gallery_images: formData.gallery_images,
        domain: formData.domain,
        city: formData.city,
        country: formData.country,
        venue: formData.venue,
        venue_address: formData.venue_address,
        timezone: formData.timezone,
        start_date: formData.start_date,
        end_date: formData.end_date,
        abstract_deadline: formData.abstract_deadline,
        early_bird_deadline: formData.early_bird_deadline,
        registration_deadline: formData.registration_deadline,
        mode: formData.mode,
        status: formData.status,
        hero_image: formData.hero_image,
        program_image: formData.program_image,
        flyer_url: formData.flyer_url,
        featured_badge: formData.featured_badge,
        welcome_heading: formData.welcome_heading,
        welcome_message: formData.welcome_message,
        welcome_speaker_name: formData.welcome_speaker_name,
        welcome_speaker_role: formData.welcome_speaker_role,
        welcome_speaker_title: formData.welcome_speaker_title,
        welcome_speaker_image: formData.welcome_speaker_image,
        welcome_footer_text: formData.welcome_footer_text,
        exhibitor_heading: formData.exhibitor_heading,
        exhibitor_speaker_name: formData.exhibitor_speaker_name,
        exhibitor_speaker_role: formData.exhibitor_speaker_role,
        exhibitor_speaker_title: formData.exhibitor_speaker_title,
        exhibitor_image: formData.exhibitor_image,
        exhibitor_message: formData.exhibitor_message,
        exhibitor_footer_text: formData.exhibitor_footer_text,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        keywords: formData.keywords,
        settings: {
          conference_id: 99,
          registration_enabled: true,
          abstract_submission_enabled: true,
          publication_enabled: true,
          sponsors_enabled: true,
          media_partners_enabled: true,
          schedule_published: true,
          show_counter: true,
          max_attendees: formData.max_attendees,
          show_speakers: true
        },
        committee: formData.committee,
        speakers: formData.speakers,
        sessions: formData.sessions,
        categories: formData.categories,
        sponsors: formData.sponsors,
        schedule: formData.schedule || []
      };

      let savedData: Conference;
      if (initialConference?.id) {
        // Edit flow: PUT /api/v1/conferences/:id
        try {
          savedData = await api.updateConference(initialConference.id, conferencePayload);
        } catch (apiErr) {
          console.warn('Backend PUT call fallback:', apiErr);
          const res = await fetch(`/api/v1/conferences/${initialConference.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(conferencePayload)
          });
          if (res.ok) {
            const json = await res.json();
            savedData = json.data;
          } else {
            savedData = {
              ...conferencePayload,
              id: initialConference.id,
              created_at: initialConference.created_at || new Date().toISOString()
            } as Conference;
          }
        }
        if (onConferenceUpdated) {
          onConferenceUpdated(savedData);
        }
      } else {
        // Create flow: POST /api/v1/conferences
        try {
          savedData = await api.createConference(conferencePayload);
        } catch (apiErr) {
          console.warn('Backend POST call fallback:', apiErr);
          const res = await fetch('/api/v1/conferences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(conferencePayload)
          });
          if (res.ok) {
            const json = await res.json();
            savedData = json.data;
          } else {
            savedData = {
              ...conferencePayload,
              id: Date.now(),
              created_at: new Date().toISOString()
            } as Conference;
          }
        }
      }

      setPublishedConference(savedData);
      onConferenceCreated(savedData);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving conference:', err);
      // Ensure local state creation on error
      const fallbackConf = {
        ...formData,
        id: initialConference?.id || Date.now(),
        created_at: initialConference?.created_at || new Date().toISOString()
      } as unknown as Conference;
      setPublishedConference(fallbackConf);
      if (initialConference?.id && onConferenceUpdated) {
        onConferenceUpdated(fallbackConf);
      }
      onConferenceCreated(fallbackConf);
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Manifest JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${formData.slug}-manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="scins-congress-wizard-root" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
              {isEditing ? `Editing Congress • ID #${initialConference?.id}` : 'Enterprise Congress Provisioning Wizard'}
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              Step {currentStep} of 14
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-1">
            {STEPS[currentStep - 1]?.title}
          </h2>
          <p className="text-xs text-slate-500">
            {STEPS[currentStep - 1]?.subtitle}
          </p>
        </div>

        {/* Action Buttons & Device Switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Prominent Live Frontend Preview Trigger */}
          <button
            type="button"
            onClick={() => setIsLivePreviewModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
            title="Open Live Real-Time Frontend Preview"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-xl text-xs flex items-center space-x-1 font-semibold transition-all ${
                previewDevice === 'desktop' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Desktop Live Preview"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded-xl text-xs flex items-center space-x-1 font-semibold transition-all ${
                previewDevice === 'tablet' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tablet Live Preview"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-xl text-xs flex items-center space-x-1 font-semibold transition-all ${
                previewDevice === 'mobile' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Mobile Live Preview"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* 14-Steps Horizontal Scrollable Navigation Strip */}
      <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-xs flex items-center relative">
        {/* Left Arrow Scroll Control */}
        <button
          type="button"
          onClick={() => scrollNav('left')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 mr-1.5 shadow-2xs cursor-pointer"
          title="Scroll steps left"
          aria-label="Scroll steps left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={stepsNavRef}
          className="flex items-center space-x-1.5 overflow-x-auto scroll-smooth scrollbar-none py-1 px-1 flex-1 touch-pan-x"
        >
          {STEPS.map(st => {
            const isCurrent = currentStep === st.num;
            const isCompleted = currentStep > st.num;

            return (
              <button
                key={st.num}
                ref={el => { stepButtonRefs.current[st.num] = el; }}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer select-none ${
                  isCurrent
                    ? 'bg-teal-800 text-white shadow-xs font-bold scale-[1.02]'
                    : isCompleted
                    ? 'bg-teal-50 text-teal-900 border border-teal-200/80 hover:bg-teal-100/70'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-white text-teal-900'
                      : isCompleted
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : st.num}
                </span>
                <span>{st.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right Arrow Scroll Control */}
        <button
          type="button"
          onClick={() => scrollNav('right')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0 ml-1.5 shadow-2xs cursor-pointer"
          title="Scroll steps right"
          aria-label="Scroll steps right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Left Stage (Form Controls) + Right Stage (Live Device Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Area (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
          {/* ========================================================================= */}
          {/* STEP 1: Core Identification & Codes */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 1: Core Identification & Scientific Code
                  </h3>
                  <p className="text-xs text-slate-500">Configure global congress title, code identifier, and scientific theme.</p>
                </div>
                <div className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-200">
                  Required Step
                </div>
              </div>

              {/* Quick Template Preset Switcher */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>1-Click Domain Quick-Fill Presets:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SCIENTIFIC_DOMAINS.slice(0, 6).map(dom => (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => applyDomainPreset(dom)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                        formData.domain === dom
                          ? 'bg-teal-800 text-white border-teal-800 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dom.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Congress Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Congress Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => {
                    setFormData({ ...formData, title: e.target.value });
                    handleAutoGenerateSlugAndCode(e.target.value, formData.domain);
                  }}
                  placeholder="e.g. 2nd World Congress on Biopolymers & Bioplastics"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">Official scholarly title rendered on publications, certificates, and badges.</p>
              </div>

              {/* Short Title & Conference Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Short Title / Acronym</label>
                  <input
                    type="text"
                    value={formData.short_title}
                    onChange={e => setFormData({ ...formData, short_title: e.target.value })}
                    placeholder="e.g. Biopolymers 2026"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Unique Conference Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.conference_code}
                      onChange={e => setFormData({ ...formData, conference_code: e.target.value })}
                      placeholder="e.g. SCINS-BIO-2026"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-teal-900 font-mono font-bold uppercase focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateSlugAndCode(formData.title, formData.domain)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-teal-700"
                      title="Regenerate Code"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Domain, URL Slug & Listing Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Scientific Discipline / Domain</label>
                  <select
                    value={formData.domain}
                    onChange={e => {
                      setFormData({ ...formData, domain: e.target.value });
                      handleAutoGenerateSlugAndCode(formData.title, e.target.value);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    {SCIENTIFIC_DOMAINS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">URL Identifier (Slug)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Listing Priority / Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order ?? 1}
                    onChange={e => setFormData({ ...formData, display_order: Number(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Order on public list (lower = first).</p>
                </div>
              </div>

              {/* Academic Theme & Tagline */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Congress Academic Theme</label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={e => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="e.g. Towards Biopolymers: Catalyzing Macromolecular Innovation for a Circular World"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Global Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Pioneering Sustainable Macromolecular Solutions for a Circular Future"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Venue & City */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 2: Dates, Venue & Geographical Location
                  </h3>
                  <p className="text-xs text-slate-500">Specify host convention center, city, country, and academic schedule dates.</p>
                </div>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {formData.city || 'Global'}, {formData.country || 'International'}
                </span>
              </div>

              {/* Popular Venue Presets */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2">
                <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>1-Click Popular Convention Center Presets:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VENUE_PRESETS.map(vp => (
                    <button
                      key={vp.city}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          city: vp.city,
                          country: vp.country,
                          venue: vp.venue,
                          venue_address: vp.address,
                          timezone: vp.timezone
                        });
                      }}
                      className={`p-2 rounded-xl text-left border text-xs transition-all ${
                        formData.city === vp.city
                          ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold">{vp.city}</div>
                      <div className="text-[10px] text-slate-500 truncate">{vp.country}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Host City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Boston"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Convention Center & Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Convention Center / Venue Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={e => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Boston Convention & Exhibition Center"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Full Venue Address & Postal Code</label>
                <input
                  type="text"
                  value={formData.venue_address}
                  onChange={e => setFormData({ ...formData, venue_address: e.target.value })}
                  placeholder="e.g. 415 Summer St, Boston, MA 02210, United States"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Timezone</label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                  placeholder="e.g. America/New_York (UTC-4)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Deadlines */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 3: Deadlines & Submission Milestones
                  </h3>
                  <p className="text-xs text-slate-500">Configure cutoff dates for abstracts, early-bird rates, and peer-review milestones.</p>
                </div>
                <div className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  Critical Milestones
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Abstract Submission Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.abstract_deadline}
                    onChange={e => setFormData({ ...formData, abstract_deadline: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Peer review cutoff date.</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Early Bird Discount Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.early_bird_deadline}
                    onChange={e => setFormData({ ...formData, early_bird_deadline: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Tier-1 discount expiration.</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Registration Cutoff Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.registration_deadline}
                    onChange={e => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Standard registration close.</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Accept Late-Breaking Abstracts</div>
                    <div className="text-[11px] text-slate-500">Allow researchers to submit preliminary high-impact clinical/lab results after main deadline.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.accept_late_breaking}
                    onChange={e => setFormData({ ...formData, accept_late_breaking: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Continuous Medical Education (CME / CPD) Accreditation</div>
                    <div className="text-[11px] text-slate-500">Accredit attending delegates with up to 18.5 verified CME / CPD credit transcripts.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.cme_credits_eligible}
                    onChange={e => setFormData({ ...formData, cme_credits_eligible: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Format & Status */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 4: Format, Mode & Publication Status
                  </h3>
                  <p className="text-xs text-slate-500">Select physical vs hybrid execution, language settings, and live database visibility.</p>
                </div>
              </div>

              {/* Mode Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Conference Format / Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'hybrid', title: 'Hybrid Congress', desc: 'In-person hall attendance + real-time global virtual streaming' },
                    { id: 'in-person', title: 'In-Person Only', desc: 'On-site convention hall and exhibition attendance only' },
                    { id: 'virtual', title: 'Virtual Webcast', desc: '100% digital interactive webinar & symposium broadcast' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: m.id as ConferenceMode })}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        formData.mode === m.id
                          ? 'bg-teal-50 border-teal-600 text-teal-950 ring-2 ring-teal-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{m.title}</span>
                        {formData.mode === m.id && <Check className="w-3.5 h-3.5 text-teal-700" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Featured Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Database Publication Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as ConferenceStatus })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    <option value="published">Published (Live to Global Network)</option>
                    <option value="draft">Draft (Internal Review Only)</option>
                    <option value="archived">Archived (Past Edition)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Featured Ribbon Badge</label>
                  <input
                    type="text"
                    value={formData.featured_badge}
                    onChange={e => setFormData({ ...formData, featured_badge: e.target.value })}
                    placeholder="e.g. Flagship Edition | Scopus Indexed"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Language & Max Attendees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Working Language(s)</label>
                  <input
                    type="text"
                    value={formData.primary_language}
                    onChange={e => setFormData({ ...formData, primary_language: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Maximum Expected Delegate Capacity</label>
                  <input
                    type="number"
                    value={formData.max_attendees}
                    onChange={e => setFormData({ ...formData, max_attendees: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: Hero Media */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 5: Hero Media & Visual Branding
                  </h3>
                  <p className="text-xs text-slate-500">Configure high-resolution banner photography, flyer download links, and visual style.</p>
                </div>
              </div>

              {/* 1. Hero Banner Image (System Upload or CDN URL) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Conference Hero Banner Image</h4>
                    <p className="text-[11px] text-slate-500">Upload an image or specify a direct CDN image URL. Live desktop preview updates instantly.</p>
                  </div>
                </div>

                <MediaUploadInput
                  label="Hero Banner Image URL"
                  value={formData.hero_image}
                  onChange={(url) => setFormData({ ...formData, hero_image: url })}
                  accept="image"
                  maxSizeMB={10}
                  category="hero_banner"
                  showUrlToggle={true}
                  placeholder="https://images.unsplash.com/photo-..."
                  helperText="Supports JPG, PNG, WEBP up to 10MB. Stored on system CDN and live-synced to preview."
                />
              </div>

              {/* 2. Curated Scientific Hero Presets */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>Or Choose 1-Click High-Resolution Scientific Preset:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {HERO_PRESETS.map(hp => (
                    <button
                      key={hp.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, hero_image: hp.url })}
                      className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                        formData.hero_image === hp.url
                          ? 'ring-2 ring-teal-600 border-teal-600 shadow-md'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={hp.url} alt={hp.name} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                      <div className="p-1.5 bg-white text-[10px] font-semibold text-slate-800 truncate">
                        {hp.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Program Flow / Schedule Section Visual Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Program Flow / Schedule Section Visual Banner</h4>
                    <p className="text-[11px] text-slate-500">Displayed beside the Day 1 & Day 2 chronological session list on the public website.</p>
                  </div>
                </div>

                <MediaUploadInput
                  label="Program Schedule Banner Image URL"
                  value={formData.program_image}
                  onChange={(url) => setFormData({ ...formData, program_image: url })}
                  accept="image"
                  maxSizeMB={10}
                  category="program_banner"
                  showUrlToggle={true}
                  placeholder="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?..."
                  helperText="Default high-resolution auditorium presentation visual applied if left empty."
                />
              </div>

              {/* 4. Conference Brochure / Flyer PDF URL & System PDF Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Conference Brochure / Flyer PDF URL</h4>
                    <p className="text-[11px] text-slate-500">Provide a brochure PDF link or upload a document through the system.</p>
                  </div>
                </div>

                <MediaUploadInput
                  label="Brochure PDF Document"
                  value={formData.flyer_url}
                  onChange={(url) => setFormData({ ...formData, flyer_url: url })}
                  accept="pdf"
                  maxSizeMB={25}
                  category="brochure_pdf"
                  placeholder="https://scinsmedia.org/flyers/official-brochure.pdf"
                  helperText="When provided, a 'View / Download Brochure' button is rendered in the live preview and conference page. If empty, it remains hidden."
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: About & Highlights (Aligned with Frontend About Section) */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 6: About Conference & Key Highlights
                  </h3>
                  <p className="text-xs text-slate-500">Configure scope headline, description, 4 scientific pillars, and 4 gallery photos.</p>
                </div>
                <div className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-200">
                  Frontend Aligned
                </div>
              </div>

              {/* About Section Heading */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Congress Scope Heading (Public Page H2) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.about_heading}
                  onChange={e => setFormData({ ...formData, about_heading: e.target.value })}
                  placeholder="e.g. Accelerating Sustainable Polymer Innovations & Industrial Decarbonization"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                />
              </div>

              {/* Comprehensive Detailed About Section */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Comprehensive Detailed About Section <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.detailed_about || formData.description}
                  onChange={e => setFormData({ ...formData, detailed_about: e.target.value, description: e.target.value.slice(0, 160) })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-sans"
                />
                <p className="text-[11px] text-slate-400 mt-1">Rendered under the main heading on the public About Congress section.</p>
              </div>

              {/* 4 Scientific Pillars / Highlights */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Key Highlights & Scientific Pillars (4 Items)</h4>
                    <p className="text-[11px] text-slate-500">Rendered as 4 distinct highlight badges with checkmarks on the public page.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Highlight #{idx + 1}</label>
                      <input
                        type="text"
                        value={formData.about_highlights?.[idx] || ''}
                        onChange={e => {
                          const updated = [...(formData.about_highlights || ['', '', '', ''])];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, about_highlights: updated });
                        }}
                        placeholder={`e.g. Pillar ${idx + 1}`}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Gallery Photos (2x2 Grid) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Congress & Venue Photo Gallery (4 Images)</h4>
                    <p className="text-[11px] text-slate-500">Rendered in the prominent 2x2 asymmetric image grid beside the About text.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Photo 1 (Lab / Research)', default: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80' },
                    { label: 'Photo 2 (Convention Center / Hall)', default: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80' },
                    { label: 'Photo 3 (Auditorium / Keynotes)', default: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80' },
                    { label: 'Photo 4 (Poster / Networking Session)', default: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">{item.label}</label>
                        {formData.gallery_images?.[idx] && (
                          <span className="text-[9px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-medium">Ready</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={formData.gallery_images?.[idx] || ''}
                          onChange={e => {
                            const updated = [...(formData.gallery_images || ['', '', '', ''])];
                            updated[idx] = e.target.value;
                            setFormData({ ...formData, gallery_images: updated });
                          }}
                          placeholder={item.default}
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                        />
                        {formData.gallery_images?.[idx] ? (
                          <img
                            src={formData.gallery_images[idx]}
                            alt={`Preview ${idx + 1}`}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 7: Welcome Address & Industry Exhibitors (Carousel Slides) */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 7: Welcome Address & Industry Exhibitors
                  </h3>
                  <p className="text-xs text-slate-500">Configure the 2-slide interactive scroll section matching the public conference design.</p>
                </div>
                <div className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-teal-200">
                  2 Carousel Slides
                </div>
              </div>

              {/* SLIDE 1: Welcome Address Card */}
              <div className="p-5 bg-white border-2 border-teal-600/30 rounded-3xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-display">Slide 1: Welcome Address</h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    General Chair
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Welcome Address Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.welcome_heading || ''}
                    onChange={e => setFormData({ ...formData, welcome_heading: e.target.value })}
                    placeholder="e.g. Message from the General Chair"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                {/* Speaker Full Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Chair / Speaker Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.welcome_speaker_name}
                      onChange={e => setFormData({ ...formData, welcome_speaker_name: e.target.value })}
                      placeholder="e.g. Prof. Julian Vance, Ph.D."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Speaker Role / Badge</label>
                    <input
                      type="text"
                      value={formData.welcome_speaker_role || ''}
                      onChange={e => setFormData({ ...formData, welcome_speaker_role: e.target.value })}
                      placeholder="e.g. Conference Chair"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Speaker Designation & Institution</label>
                  <input
                    type="text"
                    value={formData.welcome_speaker_title}
                    onChange={e => setFormData({ ...formData, welcome_speaker_title: e.target.value })}
                    placeholder="e.g. Chair of Quantum Physics & Director of Center for Topological Materials, MIT"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                {/* Portrait Selection & Upload */}
                <MediaUploadInput
                  label="Welcome Speaker Official Portrait URL"
                  value={formData.welcome_speaker_image}
                  onChange={(url) => setFormData({ ...formData, welcome_speaker_image: url })}
                  accept="image"
                  maxSizeMB={5}
                  category="speaker_portrait"
                  showUrlToggle={true}
                  placeholder="https://images.unsplash.com/photo-..."
                  helperText="Upload official academic portrait or provide direct image URL."
                />

                {/* Welcome Message Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Official Welcome Letter / Presidential Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.welcome_message}
                    onChange={e => setFormData({ ...formData, welcome_message: e.target.value })}
                    placeholder="On behalf of the scientific organizing committee..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Welcome Section Footer Note</label>
                  <input
                    type="text"
                    value={formData.welcome_footer_text || ''}
                    onChange={e => setFormData({ ...formData, welcome_footer_text: e.target.value })}
                    placeholder="e.g. Join us at QuantumMat 2026 in Boston to collaborate and innovate."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* SLIDE 2: Industry Exhibitors Card */}
              <div className="p-5 bg-white border-2 border-emerald-600/30 rounded-3xl shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 font-display">Slide 2: Industry Exhibitors</h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Technology Showcase
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Exhibitors Section Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.exhibitor_heading || ''}
                    onChange={e => setFormData({ ...formData, exhibitor_heading: e.target.value })}
                    placeholder="e.g. Global Industry Leaders & Technology Showcase"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Exhibitor Contact / Group Title</label>
                    <input
                      type="text"
                      value={formData.exhibitor_speaker_name || ''}
                      onChange={e => setFormData({ ...formData, exhibitor_speaker_name: e.target.value })}
                      placeholder="e.g. Confirmed Industry Exhibitors"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Partner Tier / Badge</label>
                    <input
                      type="text"
                      value={formData.exhibitor_speaker_role || ''}
                      onChange={e => setFormData({ ...formData, exhibitor_speaker_role: e.target.value })}
                      placeholder="e.g. Platinum & Gold Partners"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Pavilion Location / Booth Details</label>
                  <input
                    type="text"
                    value={formData.exhibitor_speaker_title || ''}
                    onChange={e => setFormData({ ...formData, exhibitor_speaker_title: e.target.value })}
                    placeholder="e.g. Main Exhibition Hall & Innovation Pavilions (Booths P-101 to E-408)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                {/* Exhibitor Image */}
                <MediaUploadInput
                  label="Exhibitors / Showcase Image URL"
                  value={formData.exhibitor_image}
                  onChange={(url) => setFormData({ ...formData, exhibitor_image: url })}
                  accept="image"
                  maxSizeMB={5}
                  category="exhibitor_image"
                  showUrlToggle={true}
                  placeholder="https://images.unsplash.com/photo-..."
                  helperText="Upload showcase booth photo or provide direct image URL."
                />

                {/* Exhibitor Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Exhibitors Showcase Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.exhibitor_message || ''}
                    onChange={e => setFormData({ ...formData, exhibitor_message: e.target.value })}
                    placeholder="Explore breakthrough hardware technologies, commercial solutions, and live demonstrations..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Exhibitors Section Footer Note</label>
                  <input
                    type="text"
                    value={formData.exhibitor_footer_text || ''}
                    onChange={e => setFormData({ ...formData, exhibitor_footer_text: e.target.value })}
                    placeholder="e.g. Live demonstrations and commercial partner consultations scheduled throughout the congress."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 8: SEO & Social */}
          {/* ========================================================================= */}
          {currentStep === 8 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 8: Search Engine Optimization (SEO) & Social Meta
                  </h3>
                  <p className="text-xs text-slate-500">Preview and customize how this congress will appear on Google SERP and social channels.</p>
                </div>
              </div>

              {/* Google SERP Preview Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1 font-sans">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Live Google Search Result Preview
                </div>
                <div className="text-xs text-slate-600 truncate">https://scinsmedia.org/conferences/{formData.slug}</div>
                <div className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer">
                  {formData.meta_title || formData.title}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {formData.meta_description || formData.description}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Meta Title Tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Meta Description Tag <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.meta_description}
                  onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Search Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={e => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g. quantum computing, superconductors, Boston 2026, Scopus indexed"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 9: Committee */}
          {/* ========================================================================= */}
          {currentStep === 9 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 9: Organizing Committee & Editorial Board
                  </h3>
                  <p className="text-xs text-slate-500">Manage academic chairs, advisory members, and scientific peer reviewers ({formData.committee.length} members configured).</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCommitteeMember}
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              {/* Committee Members List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {formData.committee.map(mem => (
                  <div key={mem.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img src={mem.photo_url} alt={mem.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{mem.name}</div>
                        <div className="text-[10px] text-teal-800 font-semibold">{mem.committee_role} • {mem.institution}</div>
                        <div className="text-[10px] text-slate-500">{mem.country}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCommitteeMember(mem.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 10: Speakers */}
          {/* ========================================================================= */}
          {currentStep === 10 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 10: Conference Speakers
                  </h3>
                  <p className="text-xs text-slate-500">Configure conference speakers, presentation topics, and academic profiles.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSpeaker}
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Speaker</span>
                </button>
              </div>

              {/* Speakers List */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {formData.speakers.map(sp => (
                  <div key={sp.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <img src={sp.photo_url} alt={sp.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">{sp.prefix} {sp.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded">
                              {sp.speaker_type}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600">{sp.designation} • {sp.institution}</div>
                          <div className="text-[10px] text-slate-400">h-index: {sp.h_index} • {sp.country}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeaker(sp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-700">Presentation Title:</span> {sp.presentation_title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 11: 20 Scientific Sessions */}
          {/* ========================================================================= */}
          {currentStep === 11 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 11: Scientific Sessions & Breakout Tracks
                  </h3>
                  <p className="text-xs text-slate-500">Breakout tracks with lecture halls, session formats, and chronological timings.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sessions: generate20SessionsForDomain(formData.domain, formData.conference_code) })}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate 20 Tracks</span>
                </button>
              </div>

              {/* Automatic Time-Based Ordering Callout */}
              <div className="bg-teal-50/80 border border-teal-200 p-3 rounded-2xl flex items-center space-x-2.5 text-xs text-teal-900">
                <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  <strong>Automatic Time Ordering:</strong> Sessions are arranged chronologically by <strong>Start Time</strong> on the public schedule. No manual order number required.
                </span>
              </div>

              {/* Sessions Accordion / Editor */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {formData.sessions.map((ses, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-teal-900">{ses.session_code}</span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {ses.track}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-teal-800 font-semibold">{ses.start_time || '09:00'} – {ses.end_time || '10:30'}</span>
                    </div>

                    <input
                      type="text"
                      value={ses.title}
                      onChange={e => handleUpdateSession(idx, 'title', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">Hall / Room</label>
                        <input
                          type="text"
                          value={ses.room}
                          onChange={e => handleUpdateSession(idx, 'room', e.target.value)}
                          placeholder="Hall name"
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">Session Format</label>
                        <input
                          type="text"
                          value={ses.session_type}
                          onChange={e => handleUpdateSession(idx, 'session_type', e.target.value)}
                          placeholder="Session Type"
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">Start Time</label>
                        <input
                          type="time"
                          value={ses.start_time || '09:00'}
                          onChange={e => handleUpdateSession(idx, 'start_time', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">End Time</label>
                        <input
                          type="time"
                          value={ses.end_time || '10:30'}
                          onChange={e => handleUpdateSession(idx, 'end_time', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 12: Pricing Tiers */}
          {/* ========================================================================= */}
          {currentStep === 12 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 12: Pricing Tiers & Registration Packages
                  </h3>
                  <p className="text-xs text-slate-500">Configure early bird vs regular pricing for academics, industry, and students.</p>
                </div>
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  USD ($) Standard Currency
                </span>
              </div>

              {/* Pricing Cards Grid */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {formData.categories.map((cat, cIdx) => (
                  <div key={cat.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={cat.name}
                        onChange={e => handleUpdateCategory(cIdx, 'name', e.target.value)}
                        className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 flex-1"
                        placeholder="Package Name"
                      />
                      <input
                        type="text"
                        value={cat.code || ''}
                        onChange={e => handleUpdateCategory(cIdx, 'code', e.target.value)}
                        className="font-mono text-xs text-teal-900 font-bold bg-white border border-slate-300 rounded-lg px-2 py-1 w-28 uppercase"
                        placeholder="ACAD-PASS"
                        title="Package Code identifier"
                      />
                      {cat.is_popular && (
                        <span className="text-[10px] font-bold bg-teal-800 text-white px-2 py-0.5 rounded-full shrink-0">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Early Bird Rate ($)</label>
                        <input
                          type="number"
                          value={cat.early_bird_price}
                          onChange={e => handleUpdateCategory(cIdx, 'early_bird_price', Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-teal-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Standard / Regular Rate ($)</label>
                        <input
                          type="number"
                          value={cat.price}
                          onChange={e => handleUpdateCategory(cIdx, 'price', Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      <strong>Included Perks:</strong> {cat.benefits.slice(0, 2).join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 13: Journal Indexing & Sponsors */}
          {/* ========================================================================= */}
          {currentStep === 13 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 13: Partner Journals, Indexing & Sponsors
                  </h3>
                  <p className="text-xs text-slate-500">Specify Scopus/WoS publishing partners and corporate sponsor booth tiers.</p>
                </div>
              </div>

              {/* Indexing Partners Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Indexing & Publishing Partners</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Elsevier ScienceDirect',
                    'Scopus Indexed Proceedings',
                    'Web of Science (Clarivate)',
                    'Springer Nature Materials',
                    'IEEE Xplore Digital Library',
                    'PubMed / MEDLINE'
                  ].map(partner => {
                    const isSelected = formData.indexing_partners.includes(partner);
                    return (
                      <button
                        key={partner}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              indexing_partners: formData.indexing_partners.filter(p => p !== partner)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              indexing_partners: [...formData.indexing_partners, partner]
                            });
                          }
                        }}
                        className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{partner}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Journal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Associated Special Issue Journal</label>
                  <input
                    type="text"
                    value={formData.journal_name}
                    onChange={e => setFormData({ ...formData, journal_name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Journal ISSN Numbers</label>
                  <input
                    type="text"
                    value={formData.journal_issn}
                    onChange={e => setFormData({ ...formData, journal_issn: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Sponsors Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Confirmed Sponsors & Exhibitors</label>
                <div className="space-y-2.5">
                  {formData.sponsors.map((sp, sIdx) => (
                    <div key={sIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={sp.name}
                          onChange={e => {
                            const updated = [...formData.sponsors];
                            updated[sIdx] = { ...updated[sIdx], name: e.target.value };
                            setFormData({ ...formData, sponsors: updated });
                          }}
                          placeholder="Sponsor Name"
                          className="font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={sp.tier}
                          onChange={e => {
                            const updated = [...formData.sponsors];
                            updated[sIdx] = { ...updated[sIdx], tier: e.target.value };
                            setFormData({ ...formData, sponsors: updated });
                          }}
                          placeholder="Tier (e.g. Platinum Sponsor)"
                          className="text-teal-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                        />
                        <input
                          type="text"
                          value={sp.booth}
                          onChange={e => {
                            const updated = [...formData.sponsors];
                            updated[sIdx] = { ...updated[sIdx], booth: e.target.value };
                            setFormData({ ...formData, sponsors: updated });
                          }}
                          placeholder="Booth (e.g. Booth A-01)"
                          className="text-slate-600 font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={sp.logo_url || ''}
                          onChange={e => {
                            const updated = [...formData.sponsors];
                            updated[sIdx] = { ...updated[sIdx], logo_url: e.target.value };
                            setFormData({ ...formData, sponsors: updated });
                          }}
                          placeholder="Logo CDN URL (e.g. https://...)"
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-600 font-mono"
                        />
                        {sp.logo_url ? (
                          <img
                            src={sp.logo_url}
                            alt={sp.name}
                            className="w-7 h-7 rounded object-contain border border-slate-200 bg-white shrink-0 p-0.5"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 14: Final Review & Publish */}
          {/* ========================================================================= */}
          {currentStep === 14 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center space-x-3 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-teal-950 font-display">
                    Step 14: Final Verification & End-to-End Database Publishing
                  </h3>
                  <p className="text-xs text-teal-800">
                    All 14 configuration sections are validated. Click below to write to the MySQL database and open delegate registration globally.
                  </p>
                </div>
              </div>

              {/* Validation Summary Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {STEPS.map(st => {
                  const valid = stepValidation[st.num as keyof typeof stepValidation];
                  return (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => setCurrentStep(st.num)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                        valid
                          ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <span className="text-[11px] font-medium truncate">{st.title}</span>
                      {valid ? (
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Live Manifest Overview */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{formData.title}</span>
                  <span className="font-mono text-teal-800">{formData.conference_code}</span>
                </div>
                <div className="text-slate-600">
                  {formData.city}, {formData.country} • {formData.start_date} to {formData.end_date} • {formData.mode.toUpperCase()}
                </div>
                <div className="text-slate-500 text-[11px]">
                  {formData.sessions.length} Scientific Sessions • {formData.speakers.length} Keynote Speakers • {formData.committee.length} Committee Members • {formData.categories.length} Pricing Packages
                </div>
              </div>

              {/* Big Publish / Save Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalPublish}
                className="w-full py-4 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Writing Records to MySQL Database...</span>
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4 text-teal-300" />
                    <span>Save Changes & Update Conference Live →</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Publish Conference & Launch Live Global Portal →</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Form Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>

            <div className="flex items-center space-x-2">
              {currentStep < 14 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(s => Math.min(14, s + 1))}
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue to Step {currentStep + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalPublish}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>{isEditing ? 'Save Changes Now' : 'Publish Congress Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Preview Area (5 Cols) — Responsive Live Multi-Device Frame */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-600" />
              <span>Real-Time Frontend Preview</span>
            </span>
            <button
              type="button"
              onClick={() => setIsLivePreviewModalOpen(true)}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Exact Frontend</span>
            </button>
          </div>
          <LiveDesktopViewportPreview
            data={formData}
            device={previewDevice}
            currentStep={currentStep}
            onDeviceChange={setPreviewDevice}
          />
        </div>
      </div>

      {/* SUCCESS MODAL UPON PUBLICATION OR UPDATE */}
      {showSuccessModal && publishedConference && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCheck className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {isEditing ? 'Database Entry Updated & Live' : 'Database Entry Created & Live'}
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                {isEditing ? 'Congress Successfully Updated!' : 'Congress Successfully Published!'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                <strong className="text-slate-900">{publishedConference.title}</strong> has been {isEditing ? 'updated' : 'registered'} in the database. Scientific sessions, registration categories, and committee members are fully live.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-mono text-left space-y-1">
              <div><strong>Code:</strong> {publishedConference.conference_code}</div>
              <div><strong>Slug:</strong> /conferences/{publishedConference.slug}</div>
              <div><strong>Location:</strong> {publishedConference.city}, {publishedConference.country}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  if (onNavigateToConference) {
                    onNavigateToConference(publishedConference.slug);
                  }
                }}
                className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Public Page</span>
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  if (onCancel) onCancel();
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN / RESPONSIVE EXACT FRONTEND LIVE PREVIEW MODAL */}
      {isLivePreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Top Toolbar */}
            <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="p-2 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                  <Eye className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold font-display text-white">
                      Live Conference Frontend Preview
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      Exact Public Output
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Real-time Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {previewConference.title} ({previewConference.conference_code})
                  </p>
                </div>
              </div>

              {/* Viewport Width Controls & Close */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setLivePreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      livePreviewDevice === 'desktop'
                        ? 'bg-teal-500 text-slate-950 shadow-xs font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLivePreviewDevice('tablet')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      livePreviewDevice === 'tablet'
                        ? 'bg-teal-500 text-slate-950 shadow-xs font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tablet (768px)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLivePreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      livePreviewDevice === 'mobile'
                        ? 'bg-teal-500 text-slate-950 shadow-xs font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile (390px)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLivePreviewModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Live Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Container with exact ConferenceDetailsPage */}
            <div className="flex-1 overflow-y-auto bg-slate-100 flex justify-center p-2 sm:p-4">
              <div
                className={`bg-white transition-all duration-300 shadow-xl overflow-hidden ${
                  livePreviewDevice === 'mobile'
                    ? 'w-[390px] rounded-3xl border-8 border-slate-800 my-auto'
                    : livePreviewDevice === 'tablet'
                    ? 'w-[768px] rounded-3xl border-8 border-slate-800 my-auto'
                    : 'w-full rounded-2xl border border-slate-200'
                }`}
              >
                <ConferenceDetailsPage
                  conference={previewConference}
                  onNavigate={() => {}}
                  onSelectConference={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

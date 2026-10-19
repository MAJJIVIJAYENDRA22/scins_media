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
  ChevronUp,
  ChevronDown,
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
  Save,
  CreditCard,
  Link as LinkIcon,
  Hotel,
  Mail,
  Phone,
  Headphones,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MediaUploadInput } from './MediaUploadInput';
import { LiveDesktopViewportPreview } from './LiveDesktopViewportPreview';
import { ConferenceDetailsPage } from '../../pages/ConferenceDetailsPage';
import { CommitteeMemberModal } from './CommitteeMemberModal';
import { SpeakerEditModal } from './SpeakerEditModal';
import { PublicCardPreviewModal } from './PublicCardPreviewModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { api } from '../../services/api';
import {
  COMMITTEE_MEMBERS,
  SPONSORS,
  MEDIA_PARTNERS,
  REGISTRATION_CATEGORIES,
  SCHEDULE_ITEMS
} from '../../data/initialData';
import {
  Conference,
  CommitteeMember,
  Speaker,
  Session,
  RegistrationCategory,
  ConferenceMode,
  ConferenceStatus,
  ScheduleItem,
  Sponsor,
  MediaPartner
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
    address: '2 Place de la Porte Maillot, 75017 Paris, France',
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
    timezone: 'Asia/Tokyo (UTC+9)',
  },
  {
    city: '',
    country: '',
    venue: 'Custom / Enter Manually',
    address: '',
    timezone: ''
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

const isValidUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
};

const getDuplicateGatewayLinks = (categories: RegistrationCategory[]): Set<string> => {
  const counts = new Map<string, number>();
  (categories || []).forEach(c => {
    const link = (c.payment_gateway_link || '').trim().toLowerCase();
    if (link) {
      counts.set(link, (counts.get(link) || 0) + 1);
    }
  });
  const dupes = new Set<string>();
  counts.forEach((count, link) => {
    if (count > 1) dupes.add(link);
  });
  return dupes;
};

const buildInitialFormData = (conf?: Conference | null) => {
  if (conf) {
    return {
      title: conf.title || '',
      short_title: conf.short_title || conf.featured_badge || '',
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
      venue_photo: conf.venue_photo || '',
      venue_maps_url: conf.venue_maps_url || '',
      venue_description: conf.venue_description || '',
      timezone: conf.timezone || 'UTC',
      abstract_deadline: conf.abstract_deadline || '',
      early_bird_deadline: conf.early_bird_deadline || '',
      registration_deadline: conf.registration_deadline || '',
      accept_late_breaking: conf.accept_late_breaking ?? true,
      cme_credits_eligible: conf.cme_credits_eligible ?? true,
      mode: (conf.mode || 'hybrid') as ConferenceMode,
      status: (conf.status || 'published') as ConferenceStatus,
      featured_badge: conf.featured_badge || conf.short_title || '',
      primary_language: conf.primary_language || 'English',
      max_attendees: conf.max_attendees || 500,
      hero_image: conf.hero_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
      logo_url: conf.logo_url || '',
      program_image: conf.program_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      flyer_url: conf.flyer_url || '',
      sample_abstract_url: conf.sample_abstract_url || '',
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
      categories: (conf.categories && conf.categories.length > 0)
        ? conf.categories.map((c, idx) => {
            const std = Number(c.price ?? c.standard_fee ?? c.industry_price ?? c.tier3_price ?? 799);
            const early = Number(c.early_bird_price ?? c.early_bird_fee ?? c.academic_price ?? c.tier1_price ?? 649);
            const acad = Number(c.academic_price ?? early);
            const ind = Number(c.industry_price ?? std);
            const stud = Number(c.student_price ?? Math.round(acad * 0.7));
            const mid = Number(c.tier2_price ?? Math.round((early + std) / 2));
            return {
              ...c,
              id: c.id || (idx + 1),
              currency: c.currency || 'USD',
              price: std,
              standard_fee: std,
              tier3_price: std,
              industry_price: ind,
              early_bird_price: early,
              early_bird_fee: early,
              tier1_price: early,
              academic_price: acad,
              student_price: stud,
              tier2_price: mid,
              is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
              display_order: Number(c.display_order ?? (idx + 1)),
              payment_gateway_link: c.payment_gateway_link || `https://buy.stripe.com/scins_c${conf.id || 1}_p${c.id || (idx + 1)}_${(c.name || 'pass').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
            };
          })
        : (REGISTRATION_CATEGORIES.filter(c => c.conference_id === conf.id).length > 0
          ? REGISTRATION_CATEGORIES.filter(c => c.conference_id === conf.id).map((c, idx) => ({
              ...c,
              id: c.id || (idx + 1),
              currency: c.currency || 'USD',
              is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
              display_order: Number(c.display_order ?? (idx + 1)),
              payment_gateway_link: c.payment_gateway_link || `https://buy.stripe.com/scins_c${conf.id || 1}_p${c.id || (idx + 1)}_${(c.name || 'pass').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
            }))
          : REGISTRATION_CATEGORIES.slice(0, 4).map((c, idx) => ({
              ...c,
              id: idx + 1,
              currency: c.currency || 'USD',
              is_active: true,
              display_order: idx + 1,
              payment_gateway_link: c.payment_gateway_link || `https://buy.stripe.com/scins_c${conf.id || 1}_p${idx + 1}_${(c.name || 'pass').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
            }))),
      indexing_partners: conf.indexing_partners || [
        'Elsevier ScienceDirect',
        'Scopus Indexed Proceedings',
        'Web of Science (Clarivate)',
        'Springer Nature Materials'
      ],
      journal_name: conf.journal_name || '',
      journal_issn: conf.journal_issn || '',
      journal_logo_url: conf.journal_logo_url || '',
      committee_heading: conf.committee_heading || 'Organizing Committee & Chairs',
      committee_description: conf.committee_description || 'Distinguished scholars and experts guiding the scientific program and conference vision',
      speakers_badge: conf.speakers_badge || 'Distinguished Lineup',
      speakers_heading: conf.speakers_heading || 'Keynote Speakers',
      speakers_description: conf.speakers_description || 'World-renowned experts delivering visionary insights and pioneering research findings',
      sponsors: (conf.sponsors && conf.sponsors.length > 0)
        ? conf.sponsors.map(s => ({ ...s }))
        : (SPONSORS.filter(s => s.conference_id === conf.id).length > 0
          ? SPONSORS.filter(s => s.conference_id === conf.id).map(s => ({ ...s }))
          : SPONSORS.slice(0, 4).map(s => ({ ...s }))),
      media_partners: (conf.media_partners && conf.media_partners.length > 0)
        ? conf.media_partners.map(m => ({ ...m }))
        : (MEDIA_PARTNERS.filter(m => m.conference_id === conf.id).length > 0
          ? MEDIA_PARTNERS.filter(m => m.conference_id === conf.id).map(m => ({ ...m }))
          : MEDIA_PARTNERS.slice(0, 4).map(m => ({ ...m }))),
      schedule: (conf.schedule && conf.schedule.length > 0)
        ? conf.schedule.map(s => ({ ...s }))
        : (SCHEDULE_ITEMS.filter(s => s.conference_id === conf.id).length > 0
          ? SCHEDULE_ITEMS.filter(s => s.conference_id === conf.id).map(s => ({ ...s }))
          : SCHEDULE_ITEMS.filter(s => s.conference_id === 1).map(s => ({ ...s }))),
      hotel_name: conf.hotel_name || 'Official Partner 4-Star Congress Hotel',
      accommodation_price_per_day: typeof conf.accommodation_price_per_day === 'number' ? conf.accommodation_price_per_day : 120,
      support_email: conf.support_email || 'scinsmedia@gmail.com',
      support_phone: conf.support_phone || '+1 (415) 800-3490',
      support_label: conf.support_label || 'Secretariat Desk',
      support_turnaround: conf.support_turnaround || 'Typical response turnaround is within 24 hours on business days.',
      secretariat_section_title: conf.secretariat_section_title || 'Contact Congress Secretariat',
      secretariat_section_description: conf.secretariat_section_description || 'Have questions regarding registration, abstract acceptance, visa invitation letters, or exhibition opportunities? Submit your inquiry directly to the organizing committee.',
      secretariat_association_title: conf.secretariat_association_title || 'Conference Association',
      secretariat_conference_name: conf.secretariat_conference_name || conf.title || '',
      secretariat_dates: conf.secretariat_dates || (conf.start_date && conf.end_date ? `${conf.start_date} – ${conf.end_date}` : conf.start_date || ''),
      secretariat_location: conf.secretariat_location || (conf.city && conf.country ? `${conf.city}, ${conf.country}` : conf.city || conf.country || '')
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
    venue_photo: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    venue_maps_url: 'https://maps.google.com/?q=415+Summer+St+Boston+MA+02210+United+States',
    venue_description: 'Premier convention hall featuring state-of-the-art keynote auditoriums, specialized scientific breakout rooms, and expansive exhibition space.',
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
    logo_url: '',
    program_image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    flyer_url: 'https://scinsmedia.org/flyers/quantummat-2026-official-brochure.pdf',
    sample_abstract_url: '',
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
        description: 'Standard academic and faculty delegate pass with presentation privileges upon review.',
        payment_gateway_link: 'https://buy.stripe.com/scins_default_acad_pass_2026',
        is_active: true,
        display_order: 1,
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
    journal_logo_url: '',
    committee_heading: 'Organizing Committee & Chairs',
    committee_description: 'Distinguished scholars and experts guiding the scientific program and conference vision',
    speakers_badge: 'Distinguished Lineup',
    speakers_heading: 'Keynote Speakers',
    speakers_description: 'World-renowned experts delivering visionary insights and pioneering research findings',
    sponsors: SPONSORS.slice(0, 4).map((s, idx) => ({ ...s, id: idx + 1, conference_id: 1 })),
    media_partners: MEDIA_PARTNERS.slice(0, 4).map((m, idx) => ({ ...m, id: idx + 1, conference_id: 1 })),
    schedule: SCHEDULE_ITEMS.filter(s => s.conference_id === 1).map((s, idx) => ({ ...s, id: idx + 1 })),
    hotel_name: 'Official Partner 4-Star Congress Hotel',
    accommodation_price_per_day: 120,
    support_email: 'scinsmedia@gmail.com',
    support_phone: '+1 (415) 800-3490',
    support_label: 'Secretariat Desk',
    support_turnaround: 'Typical response turnaround is within 24 hours on business days.',
    secretariat_section_title: 'Contact Congress Secretariat',
    secretariat_section_description: 'Have questions regarding registration, abstract acceptance, visa invitation letters, or exhibition opportunities? Submit your inquiry directly to the organizing committee.',
    secretariat_association_title: 'Conference Association',
    secretariat_conference_name: '3rd International Congress on Quantum Computing & Advanced Materials',
    secretariat_dates: '2026-09-14 – 2026-09-16',
    secretariat_location: 'Boston, United States'
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
  const [step11Tab, setStep11Tab] = useState<'sessions' | 'schedule'>('sessions');
  const [activeScheduleDay, setActiveScheduleDay] = useState<'Day 1' | 'Day 2'>('Day 1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLivePreviewModalOpen, setIsLivePreviewModalOpen] = useState(false);
  const [livePreviewDevice, setLivePreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedConference, setPublishedConference] = useState<Conference | null>(null);

  // Step 9: Committee Management State
  const [committeeFilterCategory, setCommitteeFilterCategory] = useState<string>('All');
  const [editingCommitteeMember, setEditingCommitteeMember] = useState<Partial<CommitteeMember> | null>(null);
  const [isCommitteeModalOpen, setIsCommitteeModalOpen] = useState(false);
  const [deletingCommitteeMemberId, setDeletingCommitteeMemberId] = useState<number | null>(null);

  // Step 10: Speaker Management State
  const [speakerFilterType, setSpeakerFilterType] = useState<string>('All');
  const [editingSpeaker, setEditingSpeaker] = useState<Partial<Speaker> | null>(null);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [deletingSpeakerId, setDeletingSpeakerId] = useState<number | null>(null);

  // Public Card Preview State
  const [previewCardType, setPreviewCardType] = useState<'committee' | 'speaker' | null>(null);
  const [previewCardData, setPreviewCardData] = useState<any>(null);
  const [isPreviewCardModalOpen, setIsPreviewCardModalOpen] = useState(false);
  
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
    if (initialConference?.id) {
      api.getConferenceBySlug(String(initialConference.id))
        .then(fullConf => {
          if (fullConf) {
            setFormData(buildInitialFormData(fullConf));
          }
        })
        .catch(err => {
          console.warn('Could not fetch complete conference for wizard edit:', err);
        });
    }
  }, [initialConference]);

  const previewConference: Conference = useMemo(() => {
    return {
      id: initialConference?.id || 999999,
      title: formData.title || 'Untitled Scientific Congress',
      short_title: formData.featured_badge || formData.short_title || 'FEATURED',
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
      venue_photo: formData.venue_photo || '',
      venue_maps_url: formData.venue_maps_url || '',
      venue_description: formData.venue_description || '',
      timezone: formData.timezone || 'UTC',
      start_date: formData.start_date || '2026-10-12',
      end_date: formData.end_date || '2026-10-14',
      abstract_deadline: formData.abstract_deadline || '2026-08-15',
      early_bird_deadline: formData.early_bird_deadline || '2026-07-31',
      registration_deadline: formData.registration_deadline || '2026-09-30',
      mode: formData.mode || 'hybrid',
      status: formData.status || 'published',
      hero_image: formData.hero_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
      logo_url: formData.logo_url || '',
      program_image: formData.program_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      flyer_url: formData.flyer_url || '',
      sample_abstract_url: formData.sample_abstract_url || '',
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
      media_partners: formData.media_partners || [],
      schedule: formData.schedule || [],
      hotel_name: formData.hotel_name || 'Official Partner 4-Star Congress Hotel',
      accommodation_price_per_day: Number(formData.accommodation_price_per_day) || 120,
      support_email: formData.support_email || 'scinsmedia@gmail.com',
      support_phone: formData.support_phone || '+1 (415) 800-3490',
      support_label: formData.support_label || 'Secretariat Desk',
      support_turnaround: formData.support_turnaround || 'Typical response turnaround is within 24 hours on business days.',
      secretariat_section_title: formData.secretariat_section_title || 'Contact Congress Secretariat',
      secretariat_section_description: formData.secretariat_section_description || 'Have questions regarding registration, abstract acceptance, visa invitation letters, or exhibition opportunities? Submit your inquiry directly to the organizing committee.',
      secretariat_association_title: formData.secretariat_association_title || 'Conference Association',
      secretariat_conference_name: formData.secretariat_conference_name || formData.title || '',
      secretariat_dates: formData.secretariat_dates || (formData.start_date && formData.end_date ? `${formData.start_date} – ${formData.end_date}` : formData.start_date || ''),
      secretariat_location: formData.secretariat_location || (formData.city && formData.country ? `${formData.city}, ${formData.country}` : formData.city || formData.country || ''),
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
    { num: 11, title: 'Scientific Tracks', subtitle: 'Breakout session tracks & halls' },
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
  const handleOpenAddCommitteeMember = () => {
    setEditingCommitteeMember({
      id: 0,
      conference_id: initialConference?.id || 1,
      name: '',
      designation: '',
      institution: '',
      country: '',
      committee_role: 'Scientific Committee',
      photo_url: '',
      biography: '',
      display_order: (formData.committee || []).length + 1,
      is_published: true
    });
    setIsCommitteeModalOpen(true);
  };

  const handleEditCommitteeMember = (member: CommitteeMember) => {
    setEditingCommitteeMember(member);
    setIsCommitteeModalOpen(true);
  };

  const handleSaveCommitteeMember = (saved: CommitteeMember) => {
    setFormData(prev => {
      const exists = (prev.committee || []).some(m => m.id === saved.id);
      let updated: CommitteeMember[];
      if (exists) {
        updated = (prev.committee || []).map(m => m.id === saved.id ? saved : m);
      } else {
        const nextId = saved.id || (Math.max(...(prev.committee || []).map(m => m.id), 0) + 1);
        updated = [...(prev.committee || []), { ...saved, id: nextId }];
      }
      return { ...prev, committee: updated };
    });
  };

  const handleMoveCommitteeMember = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const list = [...(prev.committee || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      const reordered = list.map((m, idx) => ({ ...m, display_order: idx + 1 }));
      return { ...prev, committee: reordered };
    });
  };

  const handleConfirmDeleteCommitteeMember = () => {
    if (deletingCommitteeMemberId === null) return;
    setFormData(prev => ({
      ...prev,
      committee: (prev.committee || []).filter(m => m.id !== deletingCommitteeMemberId).map((m, idx) => ({ ...m, display_order: idx + 1 }))
    }));
    setDeletingCommitteeMemberId(null);
  };

  // Step 10: Keynote Speaker Handlers
  const handleOpenAddSpeaker = () => {
    setEditingSpeaker({
      id: 0,
      conference_id: initialConference?.id || 1,
      name: '',
      prefix: 'Prof.',
      designation: '',
      institution: '',
      country: '',
      speaker_type: 'Keynote',
      presentation_title: '',
      presentation_abstract: '',
      research_domain: formData.domain || 'Scientific Research',
      photo_url: '',
      biography: '',
      h_index: 35,
      citations_count: 1500,
      display_order: (formData.speakers || []).length + 1,
      is_active: true
    });
    setIsSpeakerModalOpen(true);
  };

  const handleEditSpeaker = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setIsSpeakerModalOpen(true);
  };

  const handleSaveSpeaker = (saved: Speaker) => {
    setFormData(prev => {
      const exists = (prev.speakers || []).some(s => s.id === saved.id);
      let updated: Speaker[];
      if (exists) {
        updated = (prev.speakers || []).map(s => s.id === saved.id ? saved : s);
      } else {
        const nextId = saved.id || (Math.max(...(prev.speakers || []).map(s => s.id), 0) + 1);
        updated = [...(prev.speakers || []), { ...saved, id: nextId }];
      }
      return { ...prev, speakers: updated };
    });
  };

  const handleMoveSpeaker = (index: number, direction: 'up' | 'down') => {
    setFormData(prev => {
      const list = [...(prev.speakers || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      const reordered = list.map((s, idx) => ({ ...s, display_order: idx + 1 }));
      return { ...prev, speakers: reordered };
    });
  };

  const handleConfirmDeleteSpeaker = () => {
    if (deletingSpeakerId === null) return;
    setFormData(prev => ({
      ...prev,
      speakers: (prev.speakers || []).filter(s => s.id !== deletingSpeakerId).map((s, idx) => ({ ...s, display_order: idx + 1 }))
    }));
    setDeletingSpeakerId(null);
  };

  // Preview Card Modal Handlers
  const handleOpenCardPreview = (type: 'committee' | 'speaker', data: any) => {
    setPreviewCardType(type);
    setPreviewCardData(data);
    setIsPreviewCardModalOpen(true);
  };

  // Step 11: Dynamic Scientific Tracks Handlers
  const handleAddNewTrack = () => {
    const nextTrackNum = (formData.sessions || []).length + 1;
    const prefix = formData.conference_code
      ? formData.conference_code.replace('SCINS-', '')
      : (formData.domain ? formData.domain.substring(0, 4).toUpperCase() : 'TRACK');
    const newTrack: Session = {
      id: Date.now() + nextTrackNum,
      conference_id: initialConference?.id || 1,
      session_number: nextTrackNum,
      session_code: `${prefix}-SES-${String(nextTrackNum).padStart(2, '0')}`,
      title: `Scientific Track ${nextTrackNum}: Breakout Session`,
      track: `Track ${nextTrackNum}`,
      category: 'Breakout Session',
      description: '',
      room: 'Hall A',
      session_type: 'Oral Presentation',
      start_time: '09:00',
      end_time: '10:30',
      display_order: nextTrackNum,
      status: 'published',
      is_published: true,
      is_active: true
    };
    setFormData(prev => ({
      ...prev,
      sessions: [...(prev.sessions || []), newTrack]
    }));
  };

  const handleRemoveTrack = (index: number) => {
    setFormData(prev => {
      const updated = (prev.sessions || [])
        .filter((_, idx) => idx !== index)
        .map((ses, idx) => ({
          ...ses,
          session_number: idx + 1,
          display_order: idx + 1
        }));
      return { ...prev, sessions: updated };
    });
  };

  const handleMoveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= (formData.sessions || []).length) return;
    const updated = [...(formData.sessions || [])];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    const reindexed = updated.map((ses, idx) => ({
      ...ses,
      session_number: idx + 1,
      display_order: idx + 1
    }));
    setFormData(prev => ({ ...prev, sessions: reindexed }));
  };

  // Step 11: Session Edit Handler
  const handleUpdateSession = (index: number, field: string, value: any) => {
    const updated = [...formData.sessions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, sessions: updated }));
  };

  // Step 11: 2-Day Schedule Item Handlers
  const handleUpdateScheduleItem = (id: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: (prev.schedule || []).map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleAddScheduleItem = (day: 'Day 1' | 'Day 2') => {
    const nextId = Math.max(...(formData.schedule || []).map(s => s.id || 0), 0) + 1;
    const newItem: ScheduleItem = {
      id: nextId,
      conference_id: initialConference?.id || 1,
      day_number: day === 'Day 1' ? 1 : 2,
      day_label: day,
      schedule_date: day === 'Day 1' ? formData.start_date : formData.end_date,
      start_time: '11:00',
      end_time: '12:00',
      title: 'New Scientific Plenary Session',
      room: 'Auditorium Hall A',
      track: 'Plenary Track',
      speaker_name: 'Distinguished Presenter'
    };
    setFormData(prev => ({
      ...prev,
      schedule: [...(prev.schedule || []), newItem]
    }));
  };

  const handleRemoveScheduleItem = (id: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: (prev.schedule || []).filter(item => item.id !== id)
    }));
  };

  // Step 12: Pricing Edit & Add/Remove Handlers
  const handleUpdateCategory = (idx: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...(prev.categories || [])];
      if (!updated[idx]) return prev;
      let patch: any = { [field]: value };
      if (field === 'price' || field === 'standard_fee') {
        const num = Number(value);
        const early = Number(updated[idx].early_bird_price ?? updated[idx].early_bird_fee ?? 0);
        patch = {
          ...patch,
          price: num,
          standard_fee: num,
          tier3_price: num,
          industry_price: num,
          tier2_price: Math.round((early + num) / 2)
        };
      } else if (field === 'early_bird_price' || field === 'early_bird_fee') {
        const num = Number(value);
        const std = Number(updated[idx].price ?? updated[idx].standard_fee ?? 0);
        patch = {
          ...patch,
          early_bird_price: num,
          early_bird_fee: num,
          tier1_price: num,
          academic_price: num,
          tier2_price: Math.round((num + std) / 2)
        };
      }
      updated[idx] = { ...updated[idx], ...patch };
      return { ...prev, categories: updated };
    });
  };

  const handleAddCategory = () => {
    const nextId = Math.max(...(formData.categories || []).map(c => c.id || 0), 0) + 1;
    const newCat: RegistrationCategory = {
      id: nextId,
      conference_id: initialConference?.id || 1,
      code: `PASS-${nextId}`,
      name: 'Industry & Corporate Delegate',
      price: 999,
      early_bird_price: 849,
      currency: 'USD',
      description: 'Standard attendee pass with full access to scientific sessions and exhibition.',
      payment_gateway_link: `https://buy.stripe.com/scins_pkg_${nextId}_${Date.now().toString(36)}`,
      is_active: true,
      display_order: (formData.categories || []).length + 1,
      benefits: [
        'Full access to all 20 scientific breakout tracks & exhibition',
        'Official Scopus-indexed congress proceedings volume',
        'Buffet networking luncheons & coffee breaks',
        'Formal Certificate of Participation'
      ],
      is_popular: false
    };
    setFormData(prev => ({
      ...prev,
      categories: [...(prev.categories || []), newCat]
    }));
  };

  const handleRemoveCategory = (id: number) => {
    setFormData(prev => ({
      ...prev,
      categories: (prev.categories || []).filter(c => c.id !== id)
    }));
  };

  // Step 13: Sponsor Add / Remove Handlers
  const handleAddSponsor = () => {
    const nextId = Math.max(...(formData.sponsors || []).map(s => s.id || 0), 0) + 1;
    const newSponsor: Sponsor = {
      id: nextId,
      conference_id: initialConference?.id || 1,
      name: 'New Corporate Partner',
      company_name: 'New Corporate Partner',
      tier: 'Gold Sponsor',
      tier_name: 'Gold Sponsor',
      tier_id: 2,
      description: 'Corporate Sponsor',
      booth: 'Booth P-105',
      logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
      website: 'https://example.com'
    };
    setFormData(prev => ({
      ...prev,
      sponsors: [...(prev.sponsors || []), newSponsor]
    }));
  };

  const handleRemoveSponsor = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== idx)
    }));
  };

  // Step 13: Media Partner Handlers
  const handleAddMediaPartner = () => {
    const nextId = Math.max(...(formData.media_partners || []).map(m => m.id || 0), 0) + 1;
    const newMedia: MediaPartner = {
      id: nextId,
      conference_id: initialConference?.id || 1,
      name: 'New Media Partner Journal',
      country: 'United States',
      logo_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=200&q=80',
      website: 'https://example.com'
    };
    setFormData(prev => ({
      ...prev,
      media_partners: [...(prev.media_partners || []), newMedia]
    }));
  };

  const handleUpdateMediaPartner = (idx: number, field: string, value: any) => {
    const updated = [...(formData.media_partners || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData(prev => ({ ...prev, media_partners: updated }));
  };

  const handleRemoveMediaPartner = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      media_partners: (prev.media_partners || []).filter((_, i) => i !== idx)
    }));
  };

  // Validation Logic per Step
  const stepValidation = useMemo(() => {
    const checks = {
      1: formData.title.trim().length >= 5 && formData.conference_code.trim().length >= 3,
      2: Boolean(formData.city && formData.country && formData.venue && formData.start_date && formData.end_date),
      3: Boolean(formData.abstract_deadline && formData.early_bird_deadline && formData.registration_deadline),
      4: Boolean(formData.mode && formData.status),
      5: Boolean(
        formData.hero_image &&
        formData.hero_image.trim().length > 0 &&
        (
          formData.hero_image.startsWith('http://') ||
          formData.hero_image.startsWith('https://') ||
          formData.hero_image.startsWith('/') ||
          formData.hero_image.startsWith('data:image/')
        )
      ),
      6: formData.description.trim().length >= 20,
      7: Boolean(formData.welcome_message.trim().length >= 10 && formData.welcome_speaker_name.trim()),
      8: Boolean(formData.meta_title.trim() && formData.meta_description.trim()),
      9: formData.committee.length >= 1,
      10: formData.speakers.length >= 1,
      11: true, // Step 11: Scientific Tracks are dynamic (admin can configure any number of tracks)
      12: Boolean(
        formData.categories &&
        formData.categories.length >= 1 &&
        formData.categories.every(c =>
          Boolean(c.name && c.name.trim().length > 0) &&
          Number(c.price || c.standard_fee) > 0 &&
          Boolean(c.payment_gateway_link && isValidUrl(c.payment_gateway_link))
        ) &&
        getDuplicateGatewayLinks(formData.categories).size === 0
      ),
      13: formData.indexing_partners.length >= 1,
      14: true
    };
    return checks;
  }, [formData]);

  // Overall form validity
  const isFormValid = Object.values(stepValidation).every(Boolean);

  // 1-Click Auto-Fill Full Conference Template for Rapid Provisioning
  const handleAutoFillCompleteTemplate = () => {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    const autoTitle = formData.title && formData.title.length > 5
      ? formData.title
      : `International Congress on Next-Generation Advanced Sciences ${nextYear}`;
    const autoSlug = autoTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const autoCode = `SCINS-CONG-${nextYear}-${Math.floor(100 + Math.random() * 900)}`;

    const templateSessions = formData.sessions && formData.sessions.length > 0
      ? formData.sessions
      : [
          {
            session_number: 1,
            session_code: `${autoCode}-SES-01`,
            title: 'Keynote Plenary: Breakthrough Horizons & Translation',
            track: 'Plenary Track',
            room: 'Main Auditorium',
            session_type: 'Keynote Session',
            start_time: '09:00',
            end_time: '10:30'
          },
          {
            session_number: 2,
            session_code: `${autoCode}-SES-02`,
            title: 'Advanced Methodologies & Molecular Characterization',
            track: 'Core Science',
            room: 'Breakout Room 1',
            session_type: 'Oral Presentation',
            start_time: '11:00',
            end_time: '12:30'
          }
        ];

    setFormData(prev => ({
      ...prev,
      title: autoTitle,
      short_title: prev.short_title || autoTitle.split(' ').slice(0, 4).join(' '),
      slug: prev.slug || autoSlug,
      conference_code: prev.conference_code || autoCode,
      theme: prev.theme || 'Frontiers in Translational Research, Biomaterials & Clinical Innovation',
      tagline: prev.tagline || 'Uniting World-Leading Pioneers, Nobel Laureates & Industry Researchers',
      description: prev.description || 'A premier global congress gathering leading academic scientists, principal investigators, clinical directors, and research scholars to exchange cutting-edge findings and interdisciplinary methodologies.',
      detailed_about: prev.detailed_about || 'SCINS Media invites global thought leaders to this landmark congress. Featuring 20 specialized scientific tracks, keynote plenaries, interactive oral presentations, poster sessions, and Scopus-indexed proceedings publication.',
      about_heading: prev.about_heading || 'Congress Scope & Global Scientific Impact',
      domain: prev.domain || 'Biotechnology',
      city: prev.city || 'Paris',
      country: prev.country || 'France',
      venue: prev.venue || 'Paris Convention Centre & Palais des Congrès',
      venue_address: prev.venue_address || '2 Place de la Porte Maillot, 75017 Paris, France',
      timezone: prev.timezone || 'Europe/Paris (UTC+2)',
      start_date: prev.start_date || `${nextYear}-05-18`,
      end_date: prev.end_date || `${nextYear}-05-20`,
      abstract_deadline: prev.abstract_deadline || `${nextYear}-03-15`,
      early_bird_deadline: prev.early_bird_deadline || `${nextYear}-02-28`,
      registration_deadline: prev.registration_deadline || `${nextYear}-04-30`,
      mode: prev.mode || 'hybrid',
      status: 'published',
      featured_badge: prev.featured_badge || 'Flagship Congress',
      hero_image: prev.hero_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
      program_image: prev.program_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      welcome_heading: prev.welcome_heading || 'Welcome Address from the Organizing Committee Chair',
      welcome_message: prev.welcome_message || 'On behalf of the Organizing Committee and Advisory Board, it is our distinct privilege to welcome you to this world-class scientific forum. We look forward to your impactful contributions and collaborative dialogue.',
      welcome_speaker_name: prev.welcome_speaker_name || 'Prof. Henriette Dubois, Ph.D.',
      welcome_speaker_role: prev.welcome_speaker_role || 'Honorary Congress Chair',
      welcome_speaker_title: prev.welcome_speaker_title || 'Chair of Advanced Macromolecular Research, CNRS Paris',
      welcome_speaker_image: prev.welcome_speaker_image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      meta_title: prev.meta_title || `${autoTitle} | Official Congress Portal`,
      meta_description: prev.meta_description || 'Official registration and abstract submission portal for the premier scientific congress organized by SCINS Media.',
      keywords: prev.keywords || 'scientific congress, research conference, scopus indexed, academic symposium, biotechnology',
      committee: prev.committee && prev.committee.length > 0 ? prev.committee : [...COMMITTEE_MEMBERS],
      sponsors: prev.sponsors && prev.sponsors.length > 0 ? prev.sponsors : [...SPONSORS],
      media_partners: prev.media_partners && prev.media_partners.length > 0 ? prev.media_partners : [...MEDIA_PARTNERS.slice(0, 4)],
      categories: prev.categories && prev.categories.length > 0 ? prev.categories : [...REGISTRATION_CATEGORIES],
      schedule: prev.schedule && prev.schedule.length > 0 ? prev.schedule : SCHEDULE_ITEMS.filter(s => s.conference_id === 1),
      sessions: templateSessions as Session[]
    }));
  };

  // Final Publish Handler
  const handleFinalPublish = async () => {
    setIsSubmitting(true);
    try {
      // Mandatory Step 12 Validation: Every package MUST have its own valid payment gateway link
      const cats = formData.categories || [];
      const invalidCats = cats.filter(c => !c.name?.trim() || Number(c.price || c.standard_fee) <= 0 || !c.payment_gateway_link || !isValidUrl(c.payment_gateway_link));
      const dupeLinks = getDuplicateGatewayLinks(cats);
      if (cats.length === 0 || invalidCats.length > 0 || dupeLinks.size > 0) {
        setIsSubmitting(false);
        setCurrentStep(12);
        if (cats.length === 0) {
          alert('Step 12 Error: Please configure at least one registration package.');
        } else if (invalidCats.length > 0) {
          alert(`Step 12 Error: Every package MUST have a valid Payment Gateway Link (HTTP/HTTPS URL), Name, and Price. Found ${invalidCats.length} incomplete package(s).`);
        } else {
          alert('Step 12 Error: Duplicate payment gateway link detected. Every package MUST have its own unique payment link. Do NOT use one common or global payment link for all packages.');
        }
        return;
      }

      const year = new Date().getFullYear();
      const safeTitle = formData.title?.trim() || `Scientific Congress ${year + 1}`;
      const safeBadge = formData.featured_badge?.trim() || formData.short_title?.trim() || 'FEATURED';
      const safeShortTitle = safeBadge;
      const safeSlug = formData.slug?.trim() || safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const safeCode = formData.conference_code?.trim() || `SCINS-CONF-${year}-${Math.floor(100 + Math.random() * 900)}`;

      // Safe categories
      const safeCategories = (formData.categories && formData.categories.length > 0)
        ? formData.categories
        : REGISTRATION_CATEGORIES;

      // Safe committee
      const safeCommittee = (formData.committee && formData.committee.length > 0)
        ? formData.committee
        : COMMITTEE_MEMBERS;

      // Safe sessions: persist only the tracks the admin actually created
      const safeSessions = (formData.sessions && formData.sessions.length > 0)
        ? formData.sessions
        : [];

      // Safe sponsors
      const safeSponsors = (formData.sponsors && formData.sponsors.length > 0)
        ? formData.sponsors
        : SPONSORS;

      // Assemble conference record with 100% frontend alignment
      const conferencePayload: any = {
        title: safeTitle,
        short_title: safeShortTitle,
        slug: safeSlug,
        conference_code: safeCode,
        display_order: typeof formData.display_order === 'number' ? formData.display_order : 1,
        theme: formData.theme || 'Frontiers in International Scientific Discovery & Innovation',
        tagline: formData.tagline || 'Advancing Global Research and Interdisciplinary Collaboration',
        description: formData.description || 'International scientific congress bringing together researchers, clinicians, and industry experts.',
        detailed_about: formData.detailed_about || formData.description || 'Comprehensive scientific gathering with keynote plenaries, oral presentations, and breakout sessions.',
        about_heading: formData.about_heading || 'Congress Overview & Scientific Scope',
        about_highlights: formData.about_highlights && formData.about_highlights.length > 0
          ? formData.about_highlights
          : [
              'Over 450+ physical attendees from 48 nations',
              '20 specialized scientific tracks & breakout rooms',
              'Elsevier Scopus-indexed special issue publication',
              'Direct B2B technology transfer & venture showcase'
            ],
        gallery_images: formData.gallery_images && formData.gallery_images.length > 0
          ? formData.gallery_images
          : [
              'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
              'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
            ],
        domain: formData.domain || 'Biotechnology',
        city: formData.city || 'Paris',
        country: formData.country || 'France',
        venue: formData.venue || 'Paris Convention Centre',
        venue_address: formData.venue_address || '2 Place de la Porte Maillot, 75017 Paris, France',
        venue_photo: formData.venue_photo || '',
        venue_maps_url: formData.venue_maps_url || '',
        venue_description: formData.venue_description || '',
        timezone: formData.timezone || 'Europe/Paris (UTC+2)',
        start_date: formData.start_date || `${year + 1}-06-15`,
        end_date: formData.end_date || `${year + 1}-06-17`,
        abstract_deadline: formData.abstract_deadline || `${year + 1}-04-01`,
        early_bird_deadline: formData.early_bird_deadline || `${year + 1}-03-15`,
        registration_deadline: formData.registration_deadline || `${year + 1}-05-20`,
        mode: formData.mode || 'hybrid',
        status: formData.status || 'published',
        hero_image: formData.hero_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
        logo_url: formData.logo_url || '',
        program_image: formData.program_image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        flyer_url: formData.flyer_url || '',
        sample_abstract_url: formData.sample_abstract_url || '',
        featured_badge: safeBadge,
        welcome_heading: formData.welcome_heading || 'Message from the General Chair',
        welcome_message: formData.welcome_message || 'Welcome to this premier global scientific gathering fostering cross-border research excellence.',
        welcome_speaker_name: formData.welcome_speaker_name || 'Prof. Henriette Dubois, Ph.D.',
        welcome_speaker_role: formData.welcome_speaker_role || 'Conference Chair',
        welcome_speaker_title: formData.welcome_speaker_title || 'Research Director, Sorbonne Université / CNRS',
        welcome_speaker_image: formData.welcome_speaker_image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        welcome_footer_text: formData.welcome_footer_text || 'Join us to collaborate, innovate, and drive scientific excellence forward.',
        exhibitor_heading: formData.exhibitor_heading || 'Global Industry Leaders & Technology Showcase',
        exhibitor_speaker_name: formData.exhibitor_speaker_name || 'Confirmed Industry Exhibitors',
        exhibitor_speaker_role: formData.exhibitor_speaker_role || 'Platinum & Gold Partners',
        exhibitor_speaker_title: formData.exhibitor_speaker_title || 'Main Exhibition Hall & Innovation Pavilions',
        exhibitor_image: formData.exhibitor_image || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=80',
        exhibitor_message: formData.exhibitor_message || 'Explore breakthrough technologies and connect with commercial partners.',
        exhibitor_footer_text: formData.exhibitor_footer_text || 'Live demonstrations scheduled throughout the congress.',
        meta_title: formData.meta_title || `${safeTitle} | Official Congress Portal`,
        meta_description: formData.meta_description || 'International scientific congress portal with full abstracts, program schedule, and delegate registration.',
        keywords: formData.keywords || 'scientific congress, conference, scopus indexed, proceedings',
        accept_late_breaking: formData.accept_late_breaking ?? true,
        cme_credits_eligible: formData.cme_credits_eligible ?? true,
        primary_language: formData.primary_language || 'English',
        max_attendees: formData.max_attendees || 500,
        accent_color: formData.accent_color || 'teal',
        journal_name: formData.journal_name || '',
        journal_issn: formData.journal_issn || '',
        journal_logo_url: formData.journal_logo_url || '',
        hotel_name: formData.hotel_name || 'Official Partner 4-Star Congress Hotel',
        accommodation_price_per_day: Number(formData.accommodation_price_per_day) || 120,
        support_email: formData.support_email || 'scinsmedia@gmail.com',
        support_phone: formData.support_phone || '+1 (415) 800-3490',
        support_label: formData.support_label || 'Secretariat Desk',
        support_turnaround: formData.support_turnaround || 'Typical response turnaround is within 24 hours on business days.',
        secretariat_section_title: formData.secretariat_section_title || 'Contact Congress Secretariat',
        secretariat_section_description: formData.secretariat_section_description || 'Have questions regarding registration, abstract acceptance, visa invitation letters, or exhibition opportunities? Submit your inquiry directly to the organizing committee.',
        secretariat_association_title: formData.secretariat_association_title || 'Conference Association',
        secretariat_conference_name: formData.secretariat_conference_name || formData.title || '',
        secretariat_dates: formData.secretariat_dates || (formData.start_date && formData.end_date ? `${formData.start_date} – ${formData.end_date}` : formData.start_date || ''),
        secretariat_location: formData.secretariat_location || (formData.city && formData.country ? `${formData.city}, ${formData.country}` : formData.city || formData.country || ''),
        committee_heading: formData.committee_heading || 'Organizing Committee & Chairs',
        committee_description: formData.committee_description || 'Distinguished scholars and experts guiding the scientific program and conference vision',
        speakers_badge: formData.speakers_badge || 'Distinguished Lineup',
        speakers_heading: formData.speakers_heading || 'Keynote Speakers',
        speakers_description: formData.speakers_description || 'World-renowned experts delivering visionary insights and pioneering research findings',
        indexing_partners: formData.indexing_partners || [
          'Elsevier ScienceDirect',
          'Scopus Indexed Proceedings',
          'Web of Science (Clarivate)',
          'Springer Nature Materials'
        ],
        settings: {
          conference_id: 99,
          registration_enabled: true,
          abstract_submission_enabled: true,
          publication_enabled: true,
          sponsors_enabled: true,
          media_partners_enabled: true,
          schedule_published: true,
          show_counter: true,
          max_attendees: formData.max_attendees || 500,
          show_speakers: true
        },
        committee: safeCommittee,
        speakers: formData.speakers || [],
        sessions: safeSessions,
        categories: safeCategories,
        sponsors: safeSponsors,
        media_partners: formData.media_partners || [],
        schedule: formData.schedule || []
      };

      let savedData: Conference;
      if (initialConference?.id) {
        // Edit flow: PUT /api/v1/conferences/:id
        savedData = await api.updateConference(initialConference.id, conferencePayload);
        if (!savedData || !savedData.id) {
          throw new Error('Conference record could not be confirmed in the database after update.');
        }
        if (onConferenceUpdated) {
          onConferenceUpdated(savedData);
        }
      } else {
        // Create flow: POST /api/v1/conferences
        savedData = await api.createConference(conferencePayload);
        if (!savedData || !savedData.id) {
          throw new Error('Conference record could not be confirmed in the database after creation.');
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
    } catch (err: any) {
      console.error('Error saving conference:', err);
      alert(`Conference Save Error: ${err?.message || 'Could not persist conference to database. Please check required fields and try again.'}`);
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
          {/* Quick Auto-Fill Template Button */}
          <button
            type="button"
            onClick={handleAutoFillCompleteTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Auto-fill complete conference details with ready-to-use template data"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto-Fill Template</span>
          </button>

          {/* Quick Save & Publish Now Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinalPublish}
            className="flex items-center space-x-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Save and publish conference immediately to MySQL database"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Conference'}</span>
          </button>

          {/* Prominent Live Frontend Preview Trigger */}
          <button
            type="button"
            onClick={() => setIsLivePreviewModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
            title="Open Live Real-Time Frontend Preview"
          >
            <Eye className="w-3.5 h-3.5 text-teal-400" />
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

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Close Wizard"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
                onClick={() => {
                  if (currentStep === 12 && st.num > 12 && !stepValidation[12]) {
                    alert('Please complete Step 12: Every package requires a valid, unique Payment Gateway Link (HTTP/HTTPS URL) before proceeding.');
                    return;
                  }
                  setCurrentStep(st.num);
                }}
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

              {/* Featured Ribbon Badge & Conference Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Featured Ribbon Badge</label>
                  <input
                    type="text"
                    value={formData.featured_badge || formData.short_title || ''}
                    onChange={e => setFormData({ ...formData, featured_badge: e.target.value, short_title: e.target.value })}
                    placeholder="e.g. FEATURED, UPCOMING, or QUANTUM 2026"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Short badge displayed on conference cards and hero banner.</p>
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

              {/* Database Publication Status */}
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

              {/* 1b. Conference Logo (shown next to the title on the conference page) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Conference Logo</h4>
                    <p className="text-[11px] text-slate-500">Small square logo shown beside the conference title. Defaults to the SCINS Media logo if left blank.</p>
                  </div>
                </div>

                <MediaUploadInput
                  label="Logo Image URL"
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  accept="image"
                  maxSizeMB={5}
                  category="conference_logo"
                  showUrlToggle={true}
                  placeholder="/scins-media-logo.png"
                  helperText="Square image recommended (e.g. 200x200px). Supports JPG, PNG, WEBP up to 5MB."
                />

                {formData.logo_url && (
                  <div className="flex items-center space-x-3 pt-1">
                    <span className="text-[11px] text-slate-500">Preview:</span>
                    <img
                      src={formData.logo_url}
                      alt="Conference logo preview"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-300 bg-white"
                    />
                  </div>
                )}
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

              {/* 5. Sample Abstract Document (shown beside the Submit Abstract button) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Sample Abstract Document</h4>
                    <p className="text-[11px] text-slate-500">Reference sample abstract authors can download for formatting guidance. Shown as a "Sample" link beside the Submit Abstract button and inside the submission form.</p>
                  </div>
                </div>

                <MediaUploadInput
                  label="Sample Abstract PDF / DOCX"
                  value={formData.sample_abstract_url}
                  onChange={(url) => setFormData({ ...formData, sample_abstract_url: url })}
                  accept="pdf"
                  maxSizeMB={10}
                  category={initialConference?.id ? `template_conf_${initialConference.id}` : 'template_conf_new'}
                  placeholder="Upload conference-specific PDF template..."
                  helperText="When provided, delegates can preview the expected structure before submitting their own abstract. If empty, delegates will be shown a pending message."
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
                    <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                      <MediaUploadInput
                        label={item.label}
                        value={formData.gallery_images?.[idx] || ''}
                        onChange={(url) => {
                          const updated = [...(formData.gallery_images || ['', '', '', ''])];
                          while (updated.length < 4) updated.push('');
                          updated[idx] = url;
                          setFormData({ ...formData, gallery_images: updated });
                        }}
                        accept="image"
                        maxSizeMB={10}
                        category="gallery"
                        showUrlToggle={true}
                        placeholder={item.default}
                        helperText="Supports JPG, PNG, WEBP up to 10MB. Stored on system CDN."
                      />
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
          {/* STEP 9: Committee (Full CMS Management) */}
          {/* ========================================================================= */}
          {currentStep === 9 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 9: Organizing Committee & Editorial Board
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete CMS control: edit every field, reorder members, manage categories, and upload portraits ({(formData.committee || []).length} members configured).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCommitteeMember}
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Committee Member</span>
                </button>
              </div>

              {/* Section Heading & Description Customization */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <Sliders className="w-3.5 h-3.5 text-teal-700" />
                  <span>Public Section Customization (Headings & Labels)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Section Heading Title</label>
                    <input
                      type="text"
                      value={formData.committee_heading || ''}
                      onChange={e => setFormData({ ...formData, committee_heading: e.target.value })}
                      placeholder="e.g. Organizing Committee & Chairs"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Section Subtitle / Description</label>
                    <input
                      type="text"
                      value={formData.committee_description || ''}
                      onChange={e => setFormData({ ...formData, committee_description: e.target.value })}
                      placeholder="e.g. Distinguished scholars and experts guiding the scientific program..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter Tabs */}
              {(() => {
                const allCategories = Array.from(
                  new Set((formData.committee || []).map(m => m.committee_role).filter(Boolean))
                );
                return (
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">Filter:</span>
                    {['All', ...allCategories].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCommitteeFilterCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          committeeFilterCategory === cat
                            ? 'bg-teal-800 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                        }`}
                      >
                        {cat}
                        {cat === 'All'
                          ? ` (${(formData.committee || []).length})`
                          : ` (${(formData.committee || []).filter(m => m.committee_role === cat).length})`}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Committee Members List */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {(formData.committee || [])
                  .filter(m => committeeFilterCategory === 'All' || m.committee_role === committeeFilterCategory)
                  .map((mem, index) => {
                    const originalIndex = (formData.committee || []).findIndex(x => x.id === mem.id);
                    const isFirst = originalIndex === 0;
                    const isLast = originalIndex === (formData.committee || []).length - 1;

                    return (
                      <div
                        key={mem.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        {/* Member Identity & Details */}
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={mem.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                              alt={mem.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                              {mem.display_order || originalIndex + 1}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-900 truncate">{mem.name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full border border-teal-200/60">
                                {mem.committee_role}
                              </span>
                              {mem.is_published === false && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                  Draft / Unpublished
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 truncate mt-0.5">
                              {mem.designation} • <span className="font-medium">{mem.institution}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2">
                              <span>{mem.country}</span>
                              {mem.research_interests && <span>• {mem.research_interests}</span>}
                              {Boolean(mem.publications_count) && <span>• {mem.publications_count} publications</span>}
                            </div>
                          </div>
                        </div>

                        {/* CMS Action Buttons: Reorder, Edit, Preview, Delete */}
                        <div className="flex items-center space-x-1 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto justify-end">
                          {/* Move Up Button */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveCommitteeMember(originalIndex, 'up')}
                            className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down Button */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveCommitteeMember(originalIndex, 'down')}
                            className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Preview Public Card */}
                          <button
                            type="button"
                            onClick={() => handleOpenCardPreview('committee', mem)}
                            className="px-2 py-1 text-slate-600 hover:text-teal-900 hover:bg-teal-50 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                            title="Preview public website card"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden md:inline">Preview</span>
                          </button>

                          {/* Edit Member */}
                          <button
                            type="button"
                            onClick={() => handleEditCommitteeMember(mem)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-teal-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                            title="Edit full member profile"
                          >
                            <Edit2 className="w-3 h-3 text-teal-700" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Member */}
                          <button
                            type="button"
                            onClick={() => setDeletingCommitteeMemberId(mem.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {(formData.committee || []).length === 0 && (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                    <p className="text-xs font-semibold">No committee members configured yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddCommitteeMember}
                      className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Member</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 10: Speakers (Full CMS Management) */}
          {/* ========================================================================= */}
          {currentStep === 10 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 10: Conference Speakers
                  </h3>
                  <p className="text-xs text-slate-500">
                    Full CMS speaker management: presentation titles, abstracts, speaker types, reordering, portraits, and academic metrics ({(formData.speakers || []).length} speakers configured).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddSpeaker}
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Speaker</span>
                </button>
              </div>

              {/* Section Heading & Badge Customization */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <Sliders className="w-3.5 h-3.5 text-teal-700" />
                  <span>Public Section Customization (Badge, Heading & Description)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Section Badge</label>
                    <input
                      type="text"
                      value={formData.speakers_badge || ''}
                      onChange={e => setFormData({ ...formData, speakers_badge: e.target.value })}
                      placeholder="e.g. Distinguished Lineup"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Section Heading Title</label>
                    <input
                      type="text"
                      value={formData.speakers_heading || ''}
                      onChange={e => setFormData({ ...formData, speakers_heading: e.target.value })}
                      placeholder="e.g. Keynote Speakers"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Section Subtitle / Description</label>
                    <input
                      type="text"
                      value={formData.speakers_description || ''}
                      onChange={e => setFormData({ ...formData, speakers_description: e.target.value })}
                      placeholder="e.g. World-renowned experts delivering visionary insights..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Speaker Type Filter Tabs */}
              {(() => {
                const types = ['All', 'Keynote', 'Plenary', 'Featured', 'Invited Speaker', 'Oral Presenter'];
                return (
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">Type:</span>
                    {types.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSpeakerFilterType(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          speakerFilterType === t
                            ? 'bg-teal-800 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                        }`}
                      >
                        {t}
                        {t === 'All'
                          ? ` (${(formData.speakers || []).length})`
                          : ` (${(formData.speakers || []).filter(s => s.speaker_type === t).length})`}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* Speakers List */}
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {(formData.speakers || [])
                  .filter(s => speakerFilterType === 'All' || s.speaker_type === speakerFilterType)
                  .map((sp, index) => {
                    const originalIndex = (formData.speakers || []).findIndex(x => x.id === sp.id);
                    const isFirst = originalIndex === 0;
                    const isLast = originalIndex === (formData.speakers || []).length - 1;

                    return (
                      <div
                        key={sp.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl space-y-2.5 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          {/* Speaker Identity */}
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={sp.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                                alt={sp.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white shadow-2xs"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                                {sp.display_order || originalIndex + 1}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {sp.prefix ? `${sp.prefix} ` : ''}{sp.name}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full border border-teal-200/60">
                                  {sp.speaker_type || 'Keynote'}
                                </span>
                                {sp.is_active === false && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                    Inactive
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-600 truncate mt-0.5">
                                {sp.designation} • <span className="font-medium">{sp.institution}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center space-x-2">
                                <span>{sp.country}</span>
                                {sp.h_index && <span>• h-index: {sp.h_index}</span>}
                                {sp.citations_count && <span>• {sp.citations_count} citations</span>}
                              </div>
                            </div>
                          </div>

                          {/* CMS Action Buttons: Reorder, Edit, Preview, Delete */}
                          <div className="flex items-center space-x-1 shrink-0 self-end sm:self-auto justify-end">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleMoveSpeaker(originalIndex, 'up')}
                              className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleMoveSpeaker(originalIndex, 'down')}
                              className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-teal-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Preview Public Card */}
                            <button
                              type="button"
                              onClick={() => handleOpenCardPreview('speaker', sp)}
                              className="px-2 py-1 text-slate-600 hover:text-teal-900 hover:bg-teal-50 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors cursor-pointer"
                              title="Preview public card"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden md:inline">Preview</span>
                            </button>

                            {/* Edit Speaker */}
                            <button
                              type="button"
                              onClick={() => handleEditSpeaker(sp)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-teal-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer shadow-2xs"
                              title="Edit full speaker profile"
                            >
                              <Edit2 className="w-3 h-3 text-teal-700" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Speaker */}
                            <button
                              type="button"
                              onClick={() => setDeletingSpeakerId(sp.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Speaker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Presentation Title Box */}
                        {sp.presentation_title && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <span className="font-bold text-teal-800 uppercase text-[10px] mr-1">Talk:</span>
                              <span className="font-semibold text-slate-800">{sp.presentation_title}</span>
                            </div>
                            {sp.presentation_abstract && (
                              <span className="text-[10px] text-slate-400 italic shrink-0">
                                Abstract provided
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                {(formData.speakers || []).length === 0 && (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                    <p className="text-xs font-semibold">No keynote speakers added yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddSpeaker}
                      className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Speaker</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================================          {/* ========================================================================= */}
          {/* STEP 11: 20 Scientific Sessions & 2-Day Detailed Schedule */}
          {/* ========================================================================= */}
          {currentStep === 11 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 11: Scientific Tracks & 2-Day Detailed Schedule
                  </h3>
                  <p className="text-xs text-slate-500">Configure dynamic breakout session tracks and the chronological 2-Day congress program.</p>
                </div>
                {step11Tab === 'sessions' ? (
                  <button
                    type="button"
                    onClick={handleAddNewTrack}
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs shrink-0 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Track</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddScheduleItem(activeScheduleDay)}
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add {activeScheduleDay} Slot</span>
                  </button>
                )}
              </div>

              {/* Sub-Tabs: Scientific Tracks vs 2-Day Schedule Flow */}
              <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep11Tab('sessions')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    step11Tab === 'sessions'
                      ? 'bg-white text-teal-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Scientific Tracks ({(formData.sessions || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setStep11Tab('schedule')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    step11Tab === 'schedule'
                      ? 'bg-white text-teal-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2-Day Chronological Schedule ({(formData.schedule || []).length} slots)
                </button>
              </div>

              {step11Tab === 'sessions' ? (
                <>
                  {/* Automatic Time-Based Ordering Callout */}
                  <div className="bg-teal-50/80 border border-teal-200 p-3 rounded-2xl flex items-center space-x-2.5 text-xs text-teal-900">
                    <Clock className="w-4 h-4 text-teal-700 shrink-0" />
                    <span>
                      <strong>Scientific Breakout Tracks:</strong> Arranged chronologically by <strong>Start Time</strong> on the public schedule. Add as many tracks as required.
                    </span>
                  </div>

                  {/* Sessions Accordion / Dynamic Track Editor */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {(formData.sessions || []).length === 0 ? (
                      <div className="text-center py-10 px-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">No Scientific Tracks Added Yet</h4>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                            Add custom breakout session tracks based on your congress requirements.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddNewTrack}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Track</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {(formData.sessions || []).map((ses, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="w-5 h-5 rounded-full bg-teal-800 text-white font-bold text-[10px] flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="font-mono text-xs font-bold text-teal-900">{ses.session_code || `SES-${idx + 1}`}</span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {ses.track || `Track ${idx + 1}`}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-[10px] font-mono text-teal-800 font-semibold mr-1.5">
                                  {ses.start_time || '09:00'} – {ses.end_time || '10:30'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTrack(idx, 'up')}
                                  disabled={idx === 0}
                                  title="Move Track Up"
                                  className={`p-1 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white transition-all ${
                                    idx === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveTrack(idx, 'down')}
                                  disabled={idx === (formData.sessions || []).length - 1}
                                  title="Move Track Down"
                                  className={`p-1 rounded-md border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white transition-all ${
                                    idx === (formData.sessions || []).length - 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTrack(idx)}
                                  title="Delete Track"
                                  className="p-1 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer ml-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={ses.title}
                              placeholder="Track Title / Symposium Name"
                              onChange={e => handleUpdateSession(idx, 'title', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                            />

                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px]">
                              <div className="sm:col-span-2">
                                <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">Track / Discipline</label>
                                <input
                                  type="text"
                                  value={ses.track}
                                  onChange={e => handleUpdateSession(idx, 'track', e.target.value)}
                                  placeholder="e.g. Core Science"
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
                                />
                              </div>
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

                        <button
                          type="button"
                          onClick={handleAddNewTrack}
                          className="w-full py-2.5 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50 text-teal-800 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Another Track</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Day 1 and Day 2 Sub-Tabs */}
                  <div className="flex items-center space-x-2">
                    {(['Day 1', 'Day 2'] as const).map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setActiveScheduleDay(day)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeScheduleDay === day
                            ? 'bg-teal-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {day} Schedule ({
                          (formData.schedule || []).filter(item => item.day_label === day || (day === 'Day 1' ? item.day_number === 1 : item.day_number === 2)).length
                        } items)
                      </button>
                    ))}
                  </div>

                  {/* Schedule Items List */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {(formData.schedule || [])
                      .filter(item => item.day_label === activeScheduleDay || (activeScheduleDay === 'Day 1' ? item.day_number === 1 : item.day_number === 2))
                      .map((item) => (
                        <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold font-mono text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {item.start_time} – {item.end_time}
                              </span>
                              <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                {item.room || 'Main Hall'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveScheduleItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Remove slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Session / Event Title</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={e => handleUpdateScheduleItem(item.id, 'title', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium"
                              placeholder="e.g. Plenary Keynote"
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">Start Time</label>
                              <input
                                type="time"
                                value={item.start_time || '09:00'}
                                onChange={e => handleUpdateScheduleItem(item.id, 'start_time', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">End Time</label>
                              <input
                                type="time"
                                value={item.end_time || '10:00'}
                                onChange={e => handleUpdateScheduleItem(item.id, 'end_time', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">Room / Hall</label>
                              <input
                                type="text"
                                value={item.room || ''}
                                onChange={e => handleUpdateScheduleItem(item.id, 'room', e.target.value)}
                                placeholder="Auditorium"
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-500 font-semibold mb-0.5">Speaker Name</label>
                              <input
                                type="text"
                                value={item.speaker_name || ''}
                                onChange={e => handleUpdateScheduleItem(item.id, 'speaker_name', e.target.value)}
                                placeholder="Prof. Speaker"
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* STEP 12: Pricing Tiers & Registration Packages */}
          {/* ========================================================================= */}
          {currentStep === 12 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Step 12: Pricing Tiers & Registration Packages
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure package rates, currencies, included benefits, active status, display orders, and mandatory individual payment gateway links.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Package</span>
                  </button>
                </div>
              </div>

              {/* Step 12 Summary / Validation Banner */}
              {(() => {
                const dupeLinks = getDuplicateGatewayLinks(formData.categories || []);
                const invalidCats = (formData.categories || []).filter(
                  c => !c.name?.trim() || Number(c.price || c.standard_fee) <= 0 || !c.payment_gateway_link || !isValidUrl(c.payment_gateway_link)
                );
                const hasIssues = invalidCats.length > 0 || dupeLinks.size > 0;
                if (!hasIssues) {
                  return (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between text-xs text-teal-900">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0" />
                        <span className="font-medium">
                          All <strong>{(formData.categories || []).length}</strong> registration packages have valid, dedicated payment gateway links.
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-200/80 text-teal-900 px-2 py-0.5 rounded-full">
                        Ready to Publish
                      </span>
                    </div>
                  );
                }
                return (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1 text-xs text-rose-900">
                    <div className="flex items-center space-x-2 font-bold text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>Payment Gateway Configuration Required</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5 pl-1">
                      {invalidCats.length > 0 && (
                        <li>
                          <strong>{invalidCats.length} package(s)</strong> require a valid Payment Gateway Link (HTTP/HTTPS URL), name, or price before saving.
                        </li>
                      )}
                      {dupeLinks.size > 0 && (
                        <li>
                          Duplicate payment link detected: Every package <strong>MUST have its own distinct payment link</strong>. Do not use one common/global payment link across packages.
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })()}

              {/* Hotel Accommodation Rate Configuration */}
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Hotel Accommodation Nightly Rate (Per Day/Night)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Admin-configured daily rate applied when attendees select accommodation during delegate registration.</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-bold text-slate-700">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={formData.accommodation_price_per_day ?? 120}
                    onChange={e => setFormData(prev => ({ ...prev, accommodation_price_per_day: Number(e.target.value) || 0 }))}
                    className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-700"
                    placeholder="120"
                  />
                  <span className="text-xs text-slate-500 font-mono">/ night</span>
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {(formData.categories || []).map((cat, cIdx) => {
                  const dupeLinks = getDuplicateGatewayLinks(formData.categories || []);
                  const rawLink = (cat.payment_gateway_link || '').trim();
                  const isLinkEmpty = rawLink.length === 0;
                  const isLinkValidUrl = !isLinkEmpty && isValidUrl(rawLink);
                  const isLinkDupe = !isLinkEmpty && dupeLinks.has(rawLink.toLowerCase());
                  const hasLinkError = isLinkEmpty || !isLinkValidUrl || isLinkDupe;

                  return (
                    <div
                      key={cat.id || cIdx}
                      className={`p-4 rounded-2xl border transition-all space-y-3.5 ${
                        cat.is_active === false
                          ? 'bg-slate-50/70 border-slate-200 opacity-80'
                          : hasLinkError
                          ? 'bg-rose-50/30 border-rose-300 shadow-xs'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Top Package Bar: Name, Code, Display Order, Active Status, Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                            {cIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={cat.name}
                            onChange={e => handleUpdateCategory(cIdx, 'name', e.target.value)}
                            className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-teal-700"
                            placeholder="Package / Tier Name (e.g. Academic Delegate)"
                            required
                          />
                          <input
                            type="text"
                            value={cat.code || ''}
                            onChange={e => handleUpdateCategory(cIdx, 'code', e.target.value)}
                            className="font-mono text-xs text-teal-900 font-bold bg-white border border-slate-300 rounded-lg px-2 py-1.5 w-24 uppercase focus:outline-none focus:border-teal-700"
                            placeholder="CODE"
                            title="Package Code identifier"
                          />
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {/* Display Order */}
                          <div className="flex items-center space-x-1" title="Display Order">
                            <span className="text-[10px] text-slate-500 font-semibold">Order:</span>
                            <input
                              type="number"
                              min="1"
                              value={cat.display_order ?? (cIdx + 1)}
                              onChange={e => handleUpdateCategory(cIdx, 'display_order', Math.max(1, Number(e.target.value) || 1))}
                              className="w-12 text-center text-xs font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded-lg py-1 focus:outline-none focus:border-teal-700"
                            />
                          </div>

                          {/* Enable/Disable Toggle */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(cIdx, 'is_active', cat.is_active === false ? true : false)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1 ${
                              cat.is_active !== false
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 border border-slate-300'
                            }`}
                            title={cat.is_active !== false ? 'Package is Active on Frontend' : 'Package is Disabled and Hidden'}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active !== false ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                            <span>{cat.is_active !== false ? 'Enabled' : 'Disabled'}</span>
                          </button>

                          {/* Most Popular Toggle */}
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(cIdx, 'is_popular', !cat.is_popular)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              cat.is_popular
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                            }`}
                            title="Toggle Most Popular badge"
                          >
                            ★ {cat.is_popular ? 'Popular' : 'Mark Popular'}
                          </button>

                          {/* Delete Package */}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(cat.id)}
                            disabled={(formData.categories || []).length <= 1}
                            className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Remove this package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Pricing and Currency Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Early Bird Rate
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={cat.early_bird_price ?? cat.early_bird_fee ?? 0}
                              onChange={e => handleUpdateCategory(cIdx, 'early_bird_price', Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-teal-900 font-bold focus:outline-none focus:border-teal-700"
                              placeholder="649"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Standard / Regular Rate (Price) *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={cat.price ?? cat.standard_fee ?? 0}
                              onChange={e => handleUpdateCategory(cIdx, 'price', Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-700"
                              placeholder="799"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Currency
                          </label>
                          <select
                            value={cat.currency || 'USD'}
                            onChange={e => handleUpdateCategory(cIdx, 'currency', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-teal-700 cursor-pointer"
                          >
                            <option value="USD">USD ($) — US Dollar</option>
                            <option value="EUR">EUR (€) — Euro</option>
                            <option value="GBP">GBP (£) — British Pound</option>
                            <option value="CAD">CAD ($) — Canadian Dollar</option>
                            <option value="AUD">AUD ($) — Australian Dollar</option>
                            <option value="JPY">JPY (¥) — Japanese Yen</option>
                            <option value="INR">INR (₹) — Indian Rupee</option>
                            <option value="CHF">CHF (CHF) — Swiss Franc</option>
                            <option value="SGD">SGD ($) — Singapore Dollar</option>
                          </select>
                        </div>
                      </div>

                      {/* MANDATORY PAYMENT GATEWAY LINK FIELD */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                            <CreditCard className="w-3.5 h-3.5 text-teal-800" />
                            <span>Payment Gateway Link</span>
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                              REQUIRED
                            </span>
                          </label>
                          <span className="text-[10px] text-slate-400">
                            Package-specific checkout URL (Stripe, Razorpay, PayPal, etc.)
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="url"
                              value={cat.payment_gateway_link || ''}
                              onChange={e => handleUpdateCategory(cIdx, 'payment_gateway_link', e.target.value)}
                              placeholder="https://buy.stripe.com/..."
                              className={`w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl font-mono transition-colors focus:outline-none ${
                                hasLinkError
                                  ? 'bg-rose-50/50 border-2 border-rose-400 text-rose-900 focus:border-rose-600'
                                  : 'bg-white border border-slate-300 text-slate-900 focus:border-teal-700'
                              }`}
                              required
                            />
                          </div>

                          {isLinkValidUrl && (
                            <a
                              href={rawLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors shadow-2xs"
                              title="Test this payment gateway link in a new tab"
                            >
                              <span>Test Link</span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </a>
                          )}
                        </div>

                        {/* Validation Error / Success Feedback */}
                        {isLinkEmpty && (
                          <p className="text-[11px] font-semibold text-rose-600 flex items-center pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                            Payment gateway link is required for this package before publishing.
                          </p>
                        )}
                        {!isLinkEmpty && !isLinkValidUrl && (
                          <p className="text-[11px] font-semibold text-rose-600 flex items-center pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                            Invalid URL format. Link must start with http:// or https:// (e.g. https://buy.stripe.com/package_link).
                          </p>
                        )}
                        {!isLinkEmpty && isLinkValidUrl && isLinkDupe && (
                          <p className="text-[11px] font-semibold text-amber-700 flex items-center pt-0.5">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                            Duplicate link detected: Every package must have its own unique payment gateway link. Do NOT use one common link.
                          </p>
                        )}
                        {!isLinkEmpty && isLinkValidUrl && !isLinkDupe && (
                          <p className="text-[11px] font-medium text-emerald-700 flex items-center pt-0.5">
                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                            Valid dedicated payment gateway URL configured.
                          </p>
                        )}
                      </div>

                      {/* Package Description & Benefits */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Package Description
                          </label>
                          <textarea
                            rows={3}
                            value={cat.description || ''}
                            onChange={e => handleUpdateCategory(cIdx, 'description', e.target.value)}
                            placeholder="Brief description of this pass tier..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Included Perks & Benefits (one per line)
                          </label>
                          <textarea
                            rows={3}
                            value={Array.isArray(cat.benefits) ? cat.benefits.join('\n') : ''}
                            onChange={e => handleUpdateCategory(cIdx, 'benefits', e.target.value.split('\n').filter(Boolean))}
                            placeholder="Access to all scientific breakout tracks&#10;Official Scopus-indexed proceedings"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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

              {/* Journal Info & Logo */}
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

                {/* Journal Logo / Cover Media Selection */}
                <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Associated Journal Cover / Logo (Media Library)
                  </label>
                  <MediaUploadInput
                    value={formData.journal_logo_url || ''}
                    onChange={url => setFormData({ ...formData, journal_logo_url: url })}
                    category="partners"
                    hideUrlInput={true}
                    showMediaLibrary={true}
                    helperText="Select or upload the official special issue journal cover or emblem."
                  />
                </div>
              </div>

              {/* Sponsors Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Confirmed Corporate Sponsors & Exhibitors ({(formData.sponsors || []).length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSponsor}
                    className="px-2.5 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Sponsor</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {(formData.sponsors || []).map((sp, sIdx) => (
                    <div key={sIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={sp.name}
                          onChange={e => {
                            const updated = [...formData.sponsors];
                            updated[sIdx] = { ...updated[sIdx], name: e.target.value };
                            setFormData({ ...formData, sponsors: updated });
                          }}
                          placeholder="Sponsor Name"
                          className="font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs flex-1"
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
                          className="text-teal-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs w-36 font-semibold"
                        />
                        <input
                          type="text"
                          value={sp.booth || ''}
                          onChange={e => {
                            const updated = [...formData.sponsors];
                            updated[sIdx] = { ...updated[sIdx], booth: e.target.value };
                            setFormData({ ...formData, sponsors: updated });
                          }}
                          placeholder="Booth (e.g. Booth A-01)"
                          className="text-slate-600 font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs w-32"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSponsor(sIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove sponsor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Sponsor Logo via Media Library (No URL Input) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-700">Sponsor Logo (Media Library)</label>
                          <MediaUploadInput
                            value={sp.logo_url || ''}
                            onChange={url => {
                              const updated = [...formData.sponsors];
                              updated[sIdx] = { ...updated[sIdx], logo_url: url };
                              setFormData({ ...formData, sponsors: updated });
                            }}
                            category="sponsors"
                            hideUrlInput={true}
                            showMediaLibrary={true}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Company Website</label>
                          <input
                            type="text"
                            value={sp.website || ''}
                            onChange={e => {
                              const updated = [...formData.sponsors];
                              updated[sIdx] = { ...updated[sIdx], website: e.target.value };
                              setFormData({ ...formData, sponsors: updated });
                            }}
                            placeholder="Website URL (https://...)"
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-600 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmed Global Media & Publishing Partners */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    Confirmed Global Media & Publishing Partners ({(formData.media_partners || []).length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMediaPartner}
                    className="px-2.5 py-1 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Media Partner</span>
                  </button>
                </div>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {(formData.media_partners || []).map((media, mIdx) => (
                    <div key={mIdx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={media.name}
                          onChange={e => handleUpdateMediaPartner(mIdx, 'name', e.target.value)}
                          placeholder="Media Partner Name (e.g. BioWorld Journal)"
                          className="font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs flex-1"
                        />
                        <input
                          type="text"
                          value={media.website || ''}
                          onChange={e => handleUpdateMediaPartner(mIdx, 'website', e.target.value)}
                          placeholder="Website (https://...)"
                          className="text-slate-600 font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs w-48"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMediaPartner(mIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove media partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Media Partner Logo via Media Library (No URL Input) */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">Media Partner Logo (Media Library)</label>
                        <MediaUploadInput
                          value={media.logo_url || ''}
                          onChange={url => handleUpdateMediaPartner(mIdx, 'logo_url', url)}
                          category="partners"
                          hideUrlInput={true}
                          showMediaLibrary={true}
                        />
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

              {/* Official Hotel Accommodation Configuration (Section 14) */}
              <div className="bg-white border border-teal-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                    <Hotel className="w-5 h-5 text-teal-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-2">
                      <span>Official Hotel Accommodation</span>
                      <span className="text-[10px] uppercase font-mono font-bold bg-teal-100/70 text-teal-900 px-2 py-0.5 rounded-full">
                        Section 14
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Configure the official partner hotel and nightly room rate for this conference. Fetched dynamically by the registration and payment gateway.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Official Partner Hotel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="wizard-hotel-name-input"
                      value={formData.hotel_name || ''}
                      onChange={e => setFormData(prev => ({ ...prev, hotel_name: e.target.value }))}
                      placeholder="e.g. Grand Hyatt Boston / Official 4-Star Congress Hotel"
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Displayed to delegates in the registration portal and invoice breakdown.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nightly Price per Room (USD / base rate) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        id="wizard-hotel-price-input"
                        min="0"
                        step="5"
                        value={formData.accommodation_price_per_day ?? 120}
                        onChange={e => setFormData(prev => ({ ...prev, accommodation_price_per_day: Number(e.target.value) || 0 }))}
                        className="w-full text-xs font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl pl-7 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Base nightly rate multiplied by the number of nights selected by delegates.
                    </span>
                  </div>
                </div>

                {/* Live Preview Pill */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <span className="font-semibold text-slate-800">Delegate Portal Preview:</span>
                    <span className="text-slate-900 font-medium">{formData.hotel_name || 'Official Partner 4-Star Congress Hotel'}</span>
                  </div>
                  <div className="font-mono font-bold text-teal-800 bg-white border border-teal-200 px-2.5 py-1 rounded-lg">
                    ${formData.accommodation_price_per_day || 120} USD / night
                  </div>
                </div>
              </div>

              {/* Congress Venue & Location Management (Section 14) */}
              <div className="bg-white border border-teal-200/90 rounded-2xl p-5 shadow-xs space-y-5">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-teal-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-2">
                      <span>Congress Venue & Location Management</span>
                      <span className="text-[10px] uppercase font-mono font-bold bg-teal-100/70 text-teal-900 px-2 py-0.5 rounded-full">
                        Section 14
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Manage the congress venue name, photo, physical address, Google Maps URL, and optional description displayed to attendees.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Venue Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="wizard-venue-name-input"
                      value={formData.venue || ''}
                      onChange={e => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="e.g. Paris Convention Centre & Pullman Congress Hall"
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Primary exhibition and congress venue title.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Venue Physical Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        id="wizard-venue-address-input"
                        value={formData.venue_address || ''}
                        onChange={e => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                        placeholder="e.g. 2 Place de la Porte Maillot, 75017 Paris, France"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Full street address with postal code and country for attendee navigation.
                    </span>
                  </div>
                </div>

                {/* Venue Photo & Google Maps URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <MediaUploadInput
                      label="Venue Photo / Exterior Image"
                      value={formData.venue_photo || ''}
                      onChange={url => setFormData(prev => ({ ...prev, venue_photo: url }))}
                      placeholder="https://... or upload venue photo"
                      helperText="High-resolution photo of the convention center or main auditorium."
                      category="conference"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Google Maps URL
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="url"
                          id="wizard-venue-maps-url-input"
                          value={formData.venue_maps_url || ''}
                          onChange={e => setFormData(prev => ({ ...prev, venue_maps_url: e.target.value }))}
                          placeholder="e.g. https://maps.google.com/?q=Paris+Convention+Centre"
                          className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Direct link or share URL to Google Maps for mobile directions.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Venue Description (Optional)
                      </label>
                      <textarea
                        id="wizard-venue-description-input"
                        rows={3}
                        value={formData.venue_description || ''}
                        onChange={e => setFormData(prev => ({ ...prev, venue_description: e.target.value }))}
                        placeholder="Brief summary of venue amenities, halls, transit access, and facilities..."
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Venue Live Preview Pill */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    {formData.venue_photo ? (
                      <img
                        src={formData.venue_photo}
                        alt="Venue Preview"
                        className="w-12 h-10 object-cover rounded-lg border border-slate-300 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-10 bg-slate-200 rounded-lg flex items-center justify-center shrink-0 text-slate-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{formData.venue || 'Convention Center Name'}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-md">{formData.venue_address || `${formData.city}, ${formData.country}`}</div>
                    </div>
                  </div>
                  {formData.venue_maps_url && (
                    <a
                      href={formData.venue_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-teal-200 text-teal-800 font-bold rounded-lg hover:bg-teal-50 transition-colors shrink-0"
                    >
                      <span>Test Map Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Congress Secretariat & Official Support (Section 14) */}
              <div className="bg-white border border-teal-200/90 rounded-2xl p-5 shadow-xs space-y-5">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5 text-teal-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-2">
                      <span>Contact Congress Secretariat & Official Support</span>
                      <span className="text-[10px] uppercase font-mono font-bold bg-teal-100/70 text-teal-900 px-2 py-0.5 rounded-full">
                        Section 14
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Manage public secretariat headers, organizing body information, event location & dates, official contact channels, and response turnaround for this conference.
                    </p>
                  </div>
                </div>

                {/* Section Title & Description */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      id="wizard-secretariat-title-input"
                      value={formData.secretariat_section_title ?? ''}
                      onChange={e => setFormData(prev => ({ ...prev, secretariat_section_title: e.target.value }))}
                      placeholder="Contact Congress Secretariat"
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Section Description
                    </label>
                    <textarea
                      rows={2}
                      id="wizard-secretariat-desc-input"
                      value={formData.secretariat_section_description ?? ''}
                      onChange={e => setFormData(prev => ({ ...prev, secretariat_section_description: e.target.value }))}
                      placeholder="Have questions regarding registration, abstract acceptance, visa invitation letters, or exhibition opportunities? Submit your inquiry directly to the organizing committee."
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs resize-none"
                    />
                  </div>
                </div>

                {/* Secretariat Card Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Conference Association Title
                    </label>
                    <input
                      type="text"
                      id="wizard-secretariat-assoc-input"
                      value={formData.secretariat_association_title ?? ''}
                      onChange={e => setFormData(prev => ({ ...prev, secretariat_association_title: e.target.value }))}
                      placeholder="e.g. Conference Association or SCINS Media Congress Secretariat"
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Conference Display Name
                    </label>
                    <input
                      type="text"
                      id="wizard-secretariat-confname-input"
                      value={formData.secretariat_conference_name ?? ''}
                      onChange={e => setFormData(prev => ({ ...prev, secretariat_conference_name: e.target.value }))}
                      placeholder={formData.title || 'Conference Name (leave blank to use congress title)'}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Conference Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        id="wizard-secretariat-dates-input"
                        value={formData.secretariat_dates ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, secretariat_dates: e.target.value }))}
                        placeholder={formData.start_date && formData.end_date ? `${formData.start_date} – ${formData.end_date}` : 'e.g. September 14–16, 2026'}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Conference Location (City, Country)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        id="wizard-secretariat-location-input"
                        value={formData.secretariat_location ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, secretariat_location: e.target.value }))}
                        placeholder={formData.city && formData.country ? `${formData.city}, ${formData.country}` : 'e.g. Boston, United States'}
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Official Support Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        id="wizard-support-email-input"
                        value={formData.support_email ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, support_email: e.target.value }))}
                        placeholder="e.g. scinsmedia@gmail.com"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Support Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        id="wizard-support-phone-input"
                        value={formData.support_phone ?? ''}
                        onChange={e => setFormData(prev => ({ ...prev, support_phone: e.target.value }))}
                        placeholder="e.g. +1 (415) 800-3490"
                        className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Support Contact Label
                    </label>
                    <input
                      type="text"
                      id="wizard-support-label-input"
                      value={formData.support_label ?? ''}
                      onChange={e => setFormData(prev => ({ ...prev, support_label: e.target.value }))}
                      placeholder="e.g. Secretariat Desk or Toll Free Desk"
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Response Turnaround Message
                    </label>
                    <input
                      type="text"
                      id="wizard-support-turnaround-input"
                      value={formData.support_turnaround ?? ''}
                      onChange={e => setFormData(prev => ({ ...prev, support_turnaround: e.target.value }))}
                      placeholder="e.g. Typical response turnaround is within 24 hours on business days."
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Live Public Page Preview Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      <span>Public Conference Page Preview (Contact Congress Secretariat)</span>
                    </div>
                    <span className="text-[10px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                      Live Dynamic Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                    {/* Left Column: Context Preview */}
                    <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-xl p-4 space-y-2 shadow-2xs">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                        {formData.secretariat_association_title || 'Conference Association'}
                      </div>
                      <div className="font-bold text-slate-900 text-sm leading-snug">
                        {formData.secretariat_conference_name || formData.title || 'Conference Name'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                        <div className="flex items-center space-x-1.5 truncate">
                          <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{formData.secretariat_dates || (formData.start_date && formData.end_date ? `${formData.start_date} – ${formData.end_date}` : formData.start_date || 'Dates TBD')}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{formData.secretariat_location || (formData.city && formData.country ? `${formData.city}, ${formData.country}` : formData.city || formData.country || 'Location TBD')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Direct Support Channel Preview */}
                    <div className="md:col-span-5 p-4 rounded-xl bg-[#0A2540] text-white shadow-xs space-y-2.5 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                        Official Support
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center space-x-2 text-slate-200">
                          <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <a
                            href={`mailto:${formData.support_email || 'scinsmedia@gmail.com'}`}
                            className="hover:text-teal-300 transition-colors truncate"
                          >
                            {formData.support_email || 'scinsmedia@gmail.com'}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-200">
                          <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <a
                            href={`tel:${(formData.support_phone || '+1 (415) 800-3490').replace(/[^+\d]/g, '')}`}
                            className="hover:text-teal-300 transition-colors truncate"
                          >
                            {formData.support_phone || '+1 (415) 800-3490'}
                            {formData.support_label ? ` (${formData.support_label})` : (formData.support_phone && formData.support_phone.includes('(') ? '' : ' (Secretariat Desk)')}
                          </a>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 border-t border-white/10 leading-relaxed">
                        {formData.support_turnaround || 'Typical response turnaround is within 24 hours on business days.'}
                      </p>
                    </div>
                  </div>
                </div>
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
                  {formData.sessions.length} Scientific Sessions • {formData.speakers.length} Keynote Speakers • {formData.committee.length} Committee Members • {formData.categories.length} Pricing Packages • 🏨 {formData.hotel_name || 'Official Partner Hotel'} (${formData.accommodation_price_per_day || 120}/night) • ✉️ {formData.support_email || 'scinsmedia@gmail.com'}
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
                  onClick={() => {
                    if (currentStep === 12 && !stepValidation[12]) {
                      const invalidCats = (formData.categories || []).filter(c => !c.name?.trim() || Number(c.price || c.standard_fee) <= 0 || !c.payment_gateway_link || !isValidUrl(c.payment_gateway_link));
                      const dupes = getDuplicateGatewayLinks(formData.categories || []);
                      if (invalidCats.length > 0) {
                        alert(`Please complete Step 12: Every package requires a valid Payment Gateway Link (HTTP/HTTPS URL). ${invalidCats.length} package(s) have missing or invalid links.`);
                      } else if (dupes.size > 0) {
                        alert('Step 12: Duplicate payment gateway link detected. Every package MUST have its own unique payment link. Do not share one common link across packages.');
                      } else {
                        alert('Please ensure all required package fields in Step 12 are valid before proceeding.');
                      }
                      return;
                    }
                    setCurrentStep(s => Math.min(14, s + 1));
                  }}
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

      {/* Committee Member Edit/Add Modal */}
      <CommitteeMemberModal
        isOpen={isCommitteeModalOpen}
        onClose={() => setIsCommitteeModalOpen(false)}
        member={editingCommitteeMember}
        onSave={handleSaveCommitteeMember}
      />

      {/* Speaker Edit/Add Modal */}
      <SpeakerEditModal
        isOpen={isSpeakerModalOpen}
        onClose={() => setIsSpeakerModalOpen(false)}
        speaker={editingSpeaker}
        onSave={handleSaveSpeaker}
        conferenceDomain={formData.domain}
      />

      {/* Delete Confirmation Modal for Committee */}
      <DeleteConfirmModal
        isOpen={deletingCommitteeMemberId !== null}
        onClose={() => setDeletingCommitteeMemberId(null)}
        onConfirm={handleConfirmDeleteCommitteeMember}
        title="Delete Committee Member"
        message="Are you sure you want to remove this committee member from the conference? This action will remove their profile upon saving."
      />

      {/* Delete Confirmation Modal for Speakers */}
      <DeleteConfirmModal
        isOpen={deletingSpeakerId !== null}
        onClose={() => setDeletingSpeakerId(null)}
        onConfirm={handleConfirmDeleteSpeaker}
        title="Delete Conference Speaker"
        message="Are you sure you want to remove this speaker from the conference program? This action will remove their keynote entry upon saving."
      />

      {/* Live Public Website Card Preview Modal */}
      <PublicCardPreviewModal
        isOpen={isPreviewCardModalOpen}
        onClose={() => setIsPreviewCardModalOpen(false)}
        type={previewCardType || 'committee'}
        data={previewCardData}
      />
    </div>
  );
};

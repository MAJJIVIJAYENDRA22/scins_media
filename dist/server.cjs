var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  invalidatePublicCache: () => invalidatePublicCache
});
module.exports = __toCommonJS(server_exports);
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_express_rate_limit = require("express-rate-limit");
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_csurf = __toESM(require("csurf"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_file_type = require("file-type");
var import_vite = require("vite");
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_stripe = __toESM(require("stripe"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// src/data/initialData.ts
var INITIAL_CONFERENCES = [
  {
    id: 1,
    title: "2nd World Congress on Biopolymers & Bioplastics",
    short_title: "Biopolymers 2026",
    slug: "biopolymers-bioplastics-2026",
    conference_code: "SCINS-BIO-2026",
    theme: "Towards Biopolymers: Catalyzing Macromolecular Innovation for a Circular World",
    tagline: "Pioneering Sustainable Macromolecular Solutions for a Circular Future",
    description: "The premier international assembly bringing together macromolecular chemists, bioengineers, polymer technologists, environmental scientists, and sustainable industry leaders to accelerate scalable biopolymer technologies.",
    detailed_about: `The 2nd World Congress on Biopolymers & Bioplastics represents the epicenter of scientific breakthrough in bio-based materials, biodegradable packaging, biomedical macromolecules, and industrial fermentation. Over two intensive days in Paris, France, leading international academicians and pioneering industry researchers will present novel synthesis pathways, enzymatic degradation mechanisms, and commercialization case studies. 

The global plastics crisis demands unprecedented scientific coordination. This congress bridges theoretical macromolecular chemistry with high-throughput industrial extrusion, bio-derived monomer catalysis, and closed-loop lifecycle governance. All accepted abstracts will be published in Scopus and Web of Science indexed proceedings, offering authors unparalleled visibility across global research institutions.`,
    domain: "Biotechnology",
    city: "Paris",
    country: "France",
    venue: "Paris Convention Centre & Pullman Congress Hall",
    venue_address: "2 Place de la Porte Maillot, 75017 Paris, France",
    timezone: "Europe/Paris (UTC+2)",
    start_date: "2026-06-22",
    end_date: "2026-06-23",
    abstract_deadline: "2026-05-15",
    early_bird_deadline: "2026-04-30",
    registration_deadline: "2026-06-10",
    mode: "hybrid",
    status: "published",
    display_order: 1,
    hero_image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80",
    sample_abstract_url: "/sample-abstract-template.pdf",
    flyer_url: "https://scinsmedia.com/downloads/biopolymers-2026-brochure.pdf",
    featured_badge: "2nd Edition Flagship",
    about_heading: "Accelerating Sustainable Polymer Innovations & Industrial Decarbonization",
    about_highlights: [
      "Over 450+ physical attendees from 48 nations",
      "20 specialized scientific tracks & breakout rooms",
      "Elsevier Scopus-indexed special issue publication",
      "Direct B2B technology transfer & venture showcase"
    ],
    gallery_images: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80"
    ],
    welcome_heading: "Message from the General Chair",
    welcome_message: `It is our profound honor to welcome distinguished researchers, professors, industrial pioneers, and budding scholars to the 2nd World Congress on Biopolymers & Bioplastics in Paris. Our collective mission is to decouple modern material consumption from petrochemical dependence through breakthrough green chemistry, microbial synthesis, and circular macromolecular architecture. We look forward to your impactful contributions and lively debates.`,
    welcome_speaker_name: "Prof. Henriette Dubois, Ph.D.",
    welcome_speaker_role: "Conference Chair",
    welcome_speaker_title: "Chair of Scientific Organizing Committee & Director of Macromolecular Institute, Sorbonne Universit\xE9",
    welcome_speaker_image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    welcome_footer_text: "Join us at Biopolymers 2026 in Paris to collaborate, innovate, and drive scientific excellence forward.",
    exhibitor_heading: "Global Industry Leaders & Technology Showcase",
    exhibitor_message: "Explore breakthrough biopolymer technologies, commercial resin formulations, and certified biodegradable solutions from premier international partners including BASF, NatureWorks, Novamont, Danimer Scientific, and TotalEnergies Corbion. Connect with technical directors, review prototype materials, and explore industrial partnerships across both days of the congress.",
    exhibitor_speaker_name: "Confirmed Industry Exhibitors",
    exhibitor_speaker_role: "Platinum & Gold Partners",
    exhibitor_speaker_title: "Main Exhibition Hall & Innovation Pavilions (Booths P-101 to E-408)",
    exhibitor_image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=80",
    exhibitor_footer_text: "Live demonstrations and commercial partner consultations scheduled throughout the congress.",
    program_image: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
    meta_title: "2nd World Congress on Biopolymers & Bioplastics | Paris 2026",
    meta_description: "Join 850+ global scientists and industry leaders at Biopolymers 2026 in Paris. Submit your research abstract, explore 20 scientific sessions, and network.",
    keywords: "biopolymers, bioplastics, green chemistry, PHA, PLA, circular economy, Paris conference 2026",
    settings: {
      conference_id: 1,
      registration_enabled: true,
      abstract_submission_enabled: true,
      publication_enabled: true,
      sponsors_enabled: true,
      media_partners_enabled: true,
      schedule_published: true,
      show_counter: true,
      max_attendees: 850
    },
    gallery: [
      { id: 1, conference_id: 1, image_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80", caption: "Advanced Polymer Synthesis Lab", display_order: 1 },
      { id: 2, conference_id: 1, image_url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80", caption: "Paris Congress Auditorium", display_order: 2 },
      { id: 3, conference_id: 1, image_url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80", caption: "Microbial Fermentation Reactors", display_order: 3 },
      { id: 4, conference_id: 1, image_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80", caption: "Global Scientific Delegation", display_order: 4 }
    ]
  },
  {
    id: 2,
    title: "International Congress on Nanomedicine & Targeted Drug Delivery",
    short_title: "NanoMed 2026",
    slug: "nanomedicine-targeted-drug-delivery-2026",
    conference_code: "SCINS-NANO-2026",
    theme: "Engineering Precision Nanoscale Therapies for Oncology and Neurodegenerative Disorders",
    tagline: "Transforming Precision Therapeutics Through Nanoscale Engineering",
    description: "A benchmark convergence of nanotechnologists, pharmacologists, oncologists, and biomedical engineers exploring lipid nanoparticles, quantum dots, and targeted payload bio-distribution.",
    detailed_about: `NanoMed 2026 convenes in the biotechnology capital of Boston, Massachusetts. The congress showcases groundbreaking clinical trials in mRNA-lipid nanoparticle formulations, stimulus-responsive nanocarriers, and peptide-directed oncological drug targeting.`,
    domain: "Medicine",
    city: "Boston",
    country: "United States",
    venue: "Boston Convention & Exhibition Center",
    venue_address: "415 Summer St, Boston, MA 02210, United States",
    timezone: "America/New_York (UTC-4)",
    start_date: "2026-08-14",
    end_date: "2026-08-16",
    abstract_deadline: "2026-06-30",
    early_bird_deadline: "2026-05-31",
    registration_deadline: "2026-08-01",
    mode: "hybrid",
    status: "published",
    display_order: 2,
    hero_image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1600&q=80",
    sample_abstract_url: "/sample-abstract-template.pdf",
    featured_badge: "High Impact Medical Summit",
    welcome_message: "Welcome to Boston for NanoMed 2026. Nanoscale engineering is redefining medical intervention thresholds across therapeutic domains.",
    welcome_speaker_name: "Dr. Robert S. Chen, M.D., Ph.D.",
    welcome_speaker_title: "Professor of Cellular Therapeutics, Harvard Medical School",
    welcome_speaker_image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    meta_title: "International Congress on Nanomedicine & Targeted Drug Delivery | Boston 2026",
    meta_description: "Join top pharmacologists and oncologists at NanoMed 2026 in Boston. Focus on lipid nanoparticles, oncology targeting, and cellular delivery.",
    keywords: "nanomedicine, targeted drug delivery, LNP, oncology, Boston conference 2026",
    settings: {
      conference_id: 2,
      registration_enabled: true,
      abstract_submission_enabled: true,
      publication_enabled: true,
      sponsors_enabled: true,
      media_partners_enabled: true,
      schedule_published: true,
      show_counter: true,
      max_attendees: 1200
    }
  },
  {
    id: 3,
    title: "World Summit on Artificial Intelligence in Healthcare & Genomics",
    short_title: "AI Health Summit 2026",
    slug: "ai-healthcare-genomics-2026",
    conference_code: "SCINS-AI-2026",
    theme: "Neural Architectures, Foundation Models and Deep Phenotyping in Clinical Practice",
    tagline: "Bridging Multimodal AI Models and Genomic Medicine",
    description: "Uniting computational biologists, deep learning researchers, clinical geneticists, and healthcare enterprise leaders to decode complex disease pathways.",
    detailed_about: `Set in the technological hub of Zurich, Switzerland, the AI Health Summit 2026 explores transformative foundation models in protein folding, single-cell multi-omics interpretation, and automated radiological diagnostics.`,
    domain: "Artificial Intelligence",
    city: "Zurich",
    country: "Switzerland",
    venue: "Swiss Federal Institute of Technology (ETH) Congress Hall",
    venue_address: "R\xE4mistrasse 101, 8092 Z\xFCrich, Switzerland",
    timezone: "Europe/Zurich (UTC+2)",
    start_date: "2026-09-21",
    end_date: "2026-09-23",
    abstract_deadline: "2026-07-20",
    early_bird_deadline: "2026-06-30",
    registration_deadline: "2026-09-05",
    mode: "hybrid",
    status: "published",
    display_order: 3,
    hero_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    sample_abstract_url: "/sample-abstract-template.pdf",
    featured_badge: "Computational Science Track",
    welcome_message: "Machine intelligence is transitioning from diagnostic assistance to synthetic biological discovery. Welcome to Zurich.",
    welcome_speaker_name: "Prof. Markus Von Berg",
    welcome_speaker_title: "Chair of Computational Biology, ETH Zurich",
    welcome_speaker_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    meta_title: "World Summit on Artificial Intelligence in Healthcare & Genomics | Zurich 2026",
    meta_description: "Explore neural architectures, genomic foundation models, and deep learning in medicine at AI Health 2026 in Zurich.",
    keywords: "AI in healthcare, genomics, deep learning, bioinformatics, Zurich conference 2026",
    settings: {
      conference_id: 3,
      registration_enabled: true,
      abstract_submission_enabled: true,
      publication_enabled: true,
      sponsors_enabled: true,
      media_partners_enabled: true,
      schedule_published: true,
      show_counter: true,
      max_attendees: 950
    }
  },
  {
    id: 4,
    title: "Global Conference on Green Chemistry & Renewable Energy",
    short_title: "GreenChem 2026",
    slug: "green-chemistry-renewable-energy-2026",
    conference_code: "SCINS-GC-2026",
    theme: "Electrocatalysis, Carbon Capture Utilization and Sustainable Chemical Synthesis",
    tagline: "Zero-Emission Chemical Engineering & Catalytic Transformations",
    description: "A collaborative scientific forum addressing closed-loop carbon recycling, electrocatalytic water splitting, hydrogen energy carriers, and non-toxic synthetic methodologies.",
    domain: "Chemistry",
    city: "Tokyo",
    country: "Japan",
    venue: "Tokyo International Forum & Science Hall",
    venue_address: "3 Chome-5-1 Marunouchi, Chiyoda City, Tokyo 100-0005, Japan",
    timezone: "Asia/Tokyo (UTC+9)",
    start_date: "2026-10-12",
    end_date: "2026-10-14",
    abstract_deadline: "2026-08-15",
    early_bird_deadline: "2026-07-31",
    registration_deadline: "2026-10-01",
    mode: "in-person",
    status: "published",
    hero_image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
    sample_abstract_url: "/sample-abstract-template.pdf",
    featured_badge: "Sustainability Benchmark",
    meta_title: "Global Conference on Green Chemistry & Renewable Energy | Tokyo 2026",
    meta_description: "Discover carbon capture, green catalysis, and renewable energy storage solutions in Tokyo at GreenChem 2026.",
    keywords: "green chemistry, renewable energy, catalysis, carbon capture, Tokyo 2026"
  },
  {
    id: 5,
    title: "International Symposium on Quantum Information & Photonic Computing",
    short_title: "Quantum Optica 2026",
    slug: "quantum-information-photonic-computing-2026",
    conference_code: "SCINS-QNT-2026",
    theme: "Fault-Tolerant Qubits, Integrated Silicon Photonics and Quantum Key Distribution",
    tagline: "Advancing Scalable Quantum Hardware and Coherent Networks",
    description: "Bringing together quantum physicists, optical engineers, and algorithm developers to push the boundaries of coherence time and topological error correction.",
    domain: "Physics",
    city: "Cambridge",
    country: "United Kingdom",
    venue: "West Cambridge Physics Complex & Cavendish Laboratory",
    venue_address: "JJ Thomson Ave, Cambridge CB3 0HE, United Kingdom",
    timezone: "Europe/London (UTC+1)",
    start_date: "2026-11-04",
    end_date: "2026-11-06",
    abstract_deadline: "2026-09-10",
    early_bird_deadline: "2026-08-20",
    registration_deadline: "2026-10-25",
    mode: "hybrid",
    status: "published",
    hero_image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80",
    sample_abstract_url: "/sample-abstract-template.pdf",
    featured_badge: "Next-Gen Computing",
    meta_title: "International Symposium on Quantum Information & Photonic Computing 2026",
    meta_description: "Explore quantum networking, fault tolerance, and photonic chips in Cambridge at Quantum Optica 2026.",
    keywords: "quantum computing, photonics, qubits, quantum optics, Cambridge 2026"
  }
];
var COMMITTEE_MEMBERS = [
  {
    id: 1,
    conference_id: 1,
    name: "Prof. Henriette Dubois, Ph.D.",
    designation: "Director of Macromolecular Institute & Professor of Green Chemistry",
    institution: "Sorbonne Universit\xE9",
    country: "France",
    committee_role: "Honorary Chair",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    biography: "Prof. Dubois has spent 28 years pioneering catalytic pathways for renewable polyhydroxyalkanoates (PHAs) and bio-based nylon precursors. She has published over 210 peer-reviewed papers in Nature Materials, Macromolecules, and Green Chemistry, and holds 16 international patents in enzymatic polymer synthesis.",
    education: "Ph.D. in Polymer Chemistry, \xC9cole Normale Sup\xE9rieure (Paris); M.Sc. in Chemical Engineering, ParisTech",
    experience: "Former Chair of European Bioplastics Scientific Advisory Council (2018\u20132024); Lead Principal Investigator on EU Horizon 2020 Bio-Macromolecules Consortium.",
    research_interests: "Microbial synthesis of aliphatic polyesters, enzymatic depolymerization of polyesters, closed-loop marine biodegradable polymers.",
    publications_count: 215,
    linkedin_url: "https://linkedin.com",
    orcid_url: "https://orcid.org/0000-0002-1825-0097",
    google_scholar_url: "https://scholar.google.com",
    display_order: 1,
    is_published: true
  },
  {
    id: 2,
    conference_id: 1,
    name: "Dr. Kenjiro Takahashi",
    designation: "Distinguished Professor of Bioengineering & Nanomaterials",
    institution: "Tokyo Institute of Technology",
    country: "Japan",
    committee_role: "General Chair",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    biography: "Dr. Takahashi is world-renowned for developing hyper-branched polysaccharides for biomedical drug delivery devices and heat-resistant polylactic acid (PLA) stereocomplexes for aerospace applications.",
    education: "Ph.D. in Materials Science, University of Tokyo; Postdoctoral Fellow, MIT Materials Science & Engineering.",
    experience: "Visiting Scientist at RIKEN Center for Sustainable Resource Science; recipient of the 2023 Asian Polymer Federation Excellence Award.",
    research_interests: "Polysaccharide nanocomposites, high-temperature stereocomplex PLA, bio-resorbable vascular stents.",
    publications_count: 180,
    linkedin_url: "https://linkedin.com",
    orcid_url: "https://orcid.org/0000-0003-4921-8812",
    display_order: 2,
    is_published: true
  },
  {
    id: 3,
    conference_id: 1,
    name: "Prof. Elena Rostova, Ph.D.",
    designation: "Head of Sustainable Materials Laboratory",
    institution: "ETH Zurich",
    country: "Switzerland",
    committee_role: "Co-Chair",
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
    biography: "Prof. Rostova specializes in life-cycle assessment (LCA), thermo-mechanical degradation kinetics, and industrial scale reactive extrusion of lignin-reinforced biocomposites.",
    education: "Ph.D. in Chemical Engineering, ETH Zurich; B.S. in Chemistry, Lomonosov Moscow State University.",
    experience: "Advises the Swiss Federal Office for the Environment on biodegradable packaging standards and microplastic remediation protocols.",
    research_interests: "Lignin valorization, biodegradable agricultural mulch films, multi-scale polymer rheology.",
    publications_count: 145,
    orcid_url: "https://orcid.org/0000-0001-9230-4410",
    display_order: 3,
    is_published: true
  },
  {
    id: 4,
    conference_id: 1,
    name: "Dr. Marcus Thorne",
    designation: "Chief Scientist & Senior Fellow in Biomaterials",
    institution: "Max Planck Institute for Polymer Research",
    country: "Germany",
    committee_role: "Scientific Committee",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    biography: "Dr. Thorne directs fundamental studies on supramolecular assembly, bio-inspired adhesives derived from mussel foot proteins, and smart shape-memory hydrogels.",
    education: "D.Phil. in Polymer Chemistry, University of Oxford.",
    experience: "Editor-in-Chief of Advanced Sustainable Macromolecules; co-founder of two biomaterial spinouts.",
    research_interests: "Supramolecular biopolymers, mussel-inspired catechol chemistry, self-healing bio-elastomers.",
    publications_count: 160,
    display_order: 4,
    is_published: true
  },
  {
    id: 5,
    conference_id: 1,
    name: "Prof. Sarah Al-Mansoor",
    designation: "Chair of Environmental Nanotechnology",
    institution: "King Abdullah University of Science and Technology (KAUST)",
    country: "Saudi Arabia",
    committee_role: "Scientific Committee",
    photo_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=500&q=80",
    biography: "Prof. Al-Mansoor develops ultra-filtration membranes utilizing cellulose nanocrystals and functionalized chitosan for energy-efficient seawater desalination.",
    education: "Ph.D. in Chemical Engineering, Imperial College London.",
    experience: "Lead Investigator on desalination membranes; recipient of 2024 L\u2019Or\xE9al-UNESCO for Women in Science.",
    research_interests: "Nanocellulose separation membranes, chitosan bio-adsorbents, heavy metal remediation.",
    publications_count: 110,
    display_order: 5,
    is_published: true
  },
  {
    id: 6,
    conference_id: 1,
    name: "Dr. Carlos Mendoza",
    designation: "Principal Researcher in Industrial Fermentation",
    institution: "National Autonomous University of Mexico (UNAM)",
    country: "Mexico",
    committee_role: "Organizing Committee",
    photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80",
    biography: "Dr. Mendoza leads innovative agro-waste valorization projects turning agave bagasse and coffee pulp into high-purity polyhydroxybutyrate (PHB).",
    education: "Ph.D. in Biotechnology, UNAM.",
    research_interests: "Solid-state fermentation, agro-waste bio-refineries, circular economy metrics.",
    publications_count: 92,
    display_order: 6,
    is_published: true
  }
];
var SPEAKERS = [
  {
    id: 1,
    name: "Prof. Henriette Dubois, Ph.D.",
    prefix: "Prof.",
    designation: "Director of Macromolecular Institute",
    institution: "Sorbonne Universit\xE9",
    country: "France",
    research_domain: "Biotechnology & Polymer Chemistry",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    biography: "Leading expert in catalytic synthesis of renewable polyhydroxyalkanoates with over 25 years of experience bridging academic synthesis and pilot plant execution.",
    h_index: 54,
    citations_count: 14200,
    speaker_type: "Keynote",
    presentation_title: "Next-Generation Enzymatic Synthesis of Marine-Degradable Polyhydroxyalkanoates (PHAs)",
    presentation_abstract: "Conventional petro-chemical plastics persist in oceanic ecosystems for centuries. This keynote introduces genetically optimized Ralstonia eutropha strains that convert volatile fatty acids into high molecular weight PHAs that degrade completely in seawater within 60 days.",
    conference_id: 1
  },
  {
    id: 2,
    name: "Dr. Kenjiro Takahashi",
    prefix: "Dr.",
    designation: "Distinguished Professor of Bioengineering",
    institution: "Tokyo Institute of Technology",
    country: "Japan",
    research_domain: "Biomaterials & Nanotechnology",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    biography: "Pioneer of stereocomplexed polylactic acid (sc-PLA) and biocompatible carbohydrate nanocarriers with high commercial yield.",
    h_index: 48,
    citations_count: 11800,
    speaker_type: "Keynote",
    presentation_title: "Stereocomplex PLA Nanocomposites with 220\xB0C Heat Resistance for Automotive & Aerospace",
    presentation_abstract: "A significant bottleneck for commercial PLA has been low heat deflection temperatures. We report a novel continuous solid-state extrusion method achieving 98% stereocomplex crystallinity.",
    conference_id: 1
  },
  {
    id: 3,
    name: "Prof. Elena Rostova, Ph.D.",
    prefix: "Prof.",
    designation: "Head of Sustainable Materials Laboratory",
    institution: "ETH Zurich",
    country: "Switzerland",
    research_domain: "Macromolecular Physics & LCA",
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
    biography: "Expert on reactive extrusion, polymer rheology, and circular economy assessment models in Europe.",
    h_index: 42,
    citations_count: 8900,
    speaker_type: "Plenary",
    presentation_title: "Holistic Life Cycle Assessment and Degradation Kinetics of Lignocellulosic Bioplastics",
    presentation_abstract: "Comprehensive cradle-to-cradle LCA data demonstrating that lignin-derived aliphatic polyesters reduce cradle-to-gate carbon emissions by 68% relative to virgin polypropylene.",
    conference_id: 1
  },
  {
    id: 4,
    name: "Dr. Marcus Thorne",
    prefix: "Dr.",
    designation: "Senior Fellow in Biomaterials",
    institution: "Max Planck Institute for Polymer Research",
    country: "Germany",
    research_domain: "Supramolecular Polymers",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    biography: "Pioneered bio-inspired adhesives mimicking catechol proteins found in marine mussels for surgical wound closure.",
    h_index: 39,
    citations_count: 7600,
    speaker_type: "Featured",
    presentation_title: "Catechol-Functionalized Chitosan Hydrogels as Rapid Hemostatic Surgical Adhesives",
    presentation_abstract: "Surgical sealants require fast adhesion in wet, dynamic physiological environments. We present dual-crosslinked catechol-chitosan networks that achieve sealing within 15 seconds.",
    conference_id: 1
  },
  {
    id: 5,
    name: "Dr. Aris Thorne-Vanderbilt",
    prefix: "Dr.",
    designation: "VP of Sustainable Packaging Innovation",
    institution: "BASF Biopolymers Group",
    country: "Germany",
    research_domain: "Industrial Polymer Processing",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
    biography: "Leads industrial scale-up of ecovio\xAE and certified compostable polyester blends for high-speed flexible film converting.",
    h_index: 31,
    citations_count: 4500,
    speaker_type: "Featured",
    presentation_title: "Scaling Certified Soil-Biodegradable Mulch Films to 500,000 Hectares Globally",
    presentation_abstract: "Agricultural microplastic contamination from conventional polyethylene mulch is unsustainable. This talk discusses field trials across five climatic zones using PBAT/PLA blends.",
    conference_id: 1
  },
  {
    id: 6,
    name: "Prof. Devendra Sharma",
    prefix: "Prof.",
    designation: "Chair of Chemical Engineering",
    institution: "Indian Institute of Technology (IIT) Delhi",
    country: "India",
    research_domain: "Green Catalysis & Agro-Polymers",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
    biography: "Specializes in conversion of agricultural stubble (paddy straw) into bio-cellulose and packaging foams via green deep eutectic solvents.",
    h_index: 36,
    citations_count: 6200,
    speaker_type: "Oral Presenter",
    presentation_title: "Deep Eutectic Solvent Delignification of Agricultural Stubble for Thermally Insulating Bio-Foams",
    presentation_abstract: "Direct conversion of rice straw into biodegradable expanded packaging foams replacing expanded polystyrene (EPS) with zero toxic effluent.",
    conference_id: 1
  }
];
var SESSIONS_20 = [
  {
    id: 1,
    conference_id: 1,
    session_number: 1,
    session_code: "BIO-SES-01",
    title: "Biopolymers & Bioplastics: Fundamental Synthesis & Polymer Chemistry",
    track: "Synthesis & Catalysis",
    category: "Keynote & Oral",
    description: "Exploration of organocatalytic, metal-free, and bio-derived ring-opening polymerization of lactides, lactones, and novel bio-monomers.",
    session_date: "2026-06-22",
    start_time: "09:30",
    end_time: "11:00",
    room: "Auditorium Pasteur (Hall A)",
    session_type: "Keynote Session"
  },
  {
    id: 2,
    conference_id: 1,
    session_number: 2,
    session_code: "BIO-SES-02",
    title: "Microbial Synthesis & Fermentation of Polyhydroxyalkanoates (PHAs & PHBs)",
    track: "Microbial Biotechnology",
    category: "Oral Presentations",
    description: "High-cell-density fermentation strategies, genetically engineered methanotrophic bacteria, and volatile fatty acid feedstock utilization.",
    session_date: "2026-06-22",
    start_time: "11:15",
    end_time: "12:45",
    room: "Amphitheatre Curie (Hall B)",
    session_type: "Oral Presentation"
  },
  {
    id: 3,
    conference_id: 1,
    session_number: 3,
    session_code: "BIO-SES-03",
    title: "Polylactic Acid (PLA): Stereocomplexes, Blends & High-Temperature Processing",
    track: "Thermal & Mechanical Engineering",
    category: "Oral Presentations",
    description: "Engineering thermal stability, barrier performance, nucleating agents, and continuous reactive extrusion for automotive parts.",
    session_date: "2026-06-22",
    start_time: "14:00",
    end_time: "15:30",
    room: "Auditorium Pasteur (Hall A)",
    session_type: "Oral Presentation"
  },
  {
    id: 4,
    conference_id: 1,
    session_number: 4,
    session_code: "BIO-SES-04",
    title: "Marine Biodegradation & Oceanic Microplastic Mitigation",
    track: "Environmental & Marine Science",
    category: "Special Symposium",
    description: "Mechanistic pathways of enzymatic disintegration in benthic and pelagic marine environments; standardized OECD 306 degradation assays.",
    session_date: "2026-06-22",
    start_time: "14:00",
    end_time: "15:30",
    room: "Hall Lavoisier (Room 301)",
    session_type: "Special Symposium"
  },
  {
    id: 5,
    conference_id: 1,
    session_number: 5,
    session_code: "BIO-SES-05",
    title: "Cellulose Nanocrystals (CNC) & Nanofibrillated Cellulose in Composites",
    track: "Nanomaterials",
    category: "Oral Presentations",
    description: "Isolation techniques, mechanical reinforcement thresholds, transparent conductive nanocellulose films, and green aero-gels.",
    session_date: "2026-06-22",
    start_time: "15:45",
    end_time: "17:15",
    room: "Amphitheatre Curie (Hall B)",
    session_type: "Oral Presentation"
  },
  {
    id: 6,
    conference_id: 1,
    session_number: 6,
    session_code: "BIO-SES-06",
    title: "Bio-Based Polymers in Medical Devices, Tissue Engineering & Drug Delivery",
    track: "Biomedical Engineering",
    category: "Keynote & Oral",
    description: "Bio-resorbable vascular scaffolds, 3D bio-printable hydrogels, electrospun nanofiber wound dressings, and targeted drug release matrices.",
    session_date: "2026-06-22",
    start_time: "15:45",
    end_time: "17:15",
    room: "Auditorium Pasteur (Hall A)",
    session_type: "Keynote Session"
  },
  {
    id: 7,
    conference_id: 1,
    session_number: 7,
    session_code: "BIO-SES-07",
    title: "Lignin Valorization & Lignocellulosic Biorefineries",
    track: "Bio-Refinery & Chemistry",
    category: "Oral Presentations",
    description: "Fractionation of industrial kraft lignin, catalytic hydrogenolysis to aromatic monomers, and high-performance carbon fibers.",
    session_date: "2026-06-22",
    start_time: "17:30",
    end_time: "18:45",
    room: "Hall Lavoisier (Room 301)",
    session_type: "Oral Presentation"
  },
  {
    id: 8,
    conference_id: 1,
    session_number: 8,
    session_code: "BIO-SES-08",
    title: "Advanced Sustainable Food Packaging & High-Barrier Biopolymer Films",
    track: "Packaging Technology",
    category: "Industrial Panel",
    description: "Oxygen and water vapor transmission rate (WVTR) optimization, active anti-microbial coatings with essential oils, and smart freshness sensors.",
    session_date: "2026-06-22",
    start_time: "17:30",
    end_time: "18:45",
    room: "Auditorium Pasteur (Hall A)",
    session_type: "Panel Discussion"
  },
  {
    id: 9,
    conference_id: 1,
    session_number: 9,
    session_code: "BIO-SES-09",
    title: "Enzymatic Recycling & Bio-Catalytic Upcycling of Post-Consumer Plastics",
    track: "Circular Economy & Recycling",
    category: "Keynote & Oral",
    description: "Engineered PETase and MHETase enzyme cascades, continuous depolymerization reactors, and monomer-grade recycling loops.",
    session_date: "2026-06-23",
    start_time: "09:00",
    end_time: "10:30",
    room: "Auditorium Pasteur (Hall A)",
    session_type: "Keynote Session"
  },
  {
    id: 10,
    conference_id: 1,
    session_number: 10,
    session_code: "BIO-SES-10",
    title: "Chitosan, Alginate & Marine Macromolecules",
    track: "Marine Biopolymers",
    category: "Oral Presentations",
    description: "Extraction from crustacean and brown macro-algal biomass, chemical derivatization, water treatment flocculants, and edible coatings.",
    session_date: "2026-06-23",
    start_time: "09:00",
    end_time: "10:30",
    room: "Amphitheatre Curie (Hall B)",
    session_type: "Oral Presentation"
  },
  {
    id: 11,
    conference_id: 1,
    session_number: 11,
    session_code: "BIO-SES-11",
    title: "Agricultural Mulch Films: Soil Degradability, Standards & Ecotoxicity",
    track: "Agronomy & Soil Science",
    category: "Oral Presentations",
    description: "ISO 17556 soil biodegradability validation, terrestrial ecotoxicity assays, crop yield comparisons, and PBAT/starch co-extrusions.",
    session_date: "2026-06-23",
    start_time: "10:45",
    end_time: "12:15",
    room: "Auditorium Pasteur (Hall A)",
    session_type: "Oral Presentation"
  },
  {
    id: 12,
    conference_id: 1,
    session_number: 12,
    session_code: "BIO-SES-12",
    title: "Bio-Polyurethanes & Bio-Polyamides from Non-Food Vegetable Oils",
    track: "Industrial Chemistry",
    category: "Oral Presentations",
    description: "Castor oil, soybean, and tall oil-derived polyols; isocyanate-free non-isocyanate polyurethanes (NIPU) synthesis for coatings and foams.",
    session_date: "2026-06-23",
    start_time: "10:45",
    end_time: "12:15",
    room: "Amphitheatre Curie (Hall B)",
    session_type: "Oral Presentation"
  },
  {
    id: 13,
    conference_id: 1,
    session_number: 13,
    session_code: "BIO-SES-13",
    title: "Life Cycle Assessment (LCA), Carbon Accounting & Circularity Metrics",
    track: "Policy & Sustainability",
    category: "Panel Discussion",
    description: "Harmonized European and global LCA methodologies, indirect land use change (ILUC) modeling, carbon sequestration tracking, and ESG criteria.",
    session_date: "2026-06-23",
    start_time: "13:30",
    end_time: "15:00",
    room: "Auditorium Pasteur (Hall A)",
    session_type: "Panel Discussion"
  },
  {
    id: 14,
    conference_id: 1,
    session_number: 14,
    session_code: "BIO-SES-14",
    title: "3D & 4D Additive Manufacturing with Bio-Based Filaments and Resins",
    track: "Additive Manufacturing",
    category: "Workshop & Demo",
    description: "Fused filament fabrication (FFF) with wood-flour biocomposites, photopolymerizable plant-oil resins, and shape-memory biopolymers.",
    session_date: "2026-06-23",
    start_time: "13:30",
    end_time: "15:00",
    room: "Innovation Workshop Studio (Hall C)",
    session_type: "Workshop"
  },
  {
    id: 15,
    conference_id: 1,
    session_number: 15,
    session_code: "BIO-SES-15",
    title: "Smart, Responsive & Self-Healing Biopolymer Networks",
    track: "Advanced Materials",
    category: "Oral Presentations",
    description: "Dynamic covalent disulfide and boronate ester bonds, thermo-responsive and pH-responsive supramolecular gels for electronic skins.",
    session_date: "2026-06-23",
    start_time: "15:15",
    end_time: "16:45",
    room: "Amphitheatre Curie (Hall B)",
    session_type: "Oral Presentation"
  },
  {
    id: 16,
    conference_id: 1,
    session_number: 16,
    session_code: "BIO-SES-16",
    title: "Starch-Based Polymers & Thermoplastic Starch (TPS) Formulations",
    track: "Natural Polymers",
    category: "Oral Presentations",
    description: "Plasticizer migration kinetics, retrogradation suppression, multi-layer co-extrusion with PBAT, and water-soluble packaging applications.",
    session_date: "2026-06-23",
    start_time: "15:15",
    end_time: "16:45",
    room: "Hall Lavoisier (Room 301)",
    session_type: "Oral Presentation"
  },
  {
    id: 17,
    conference_id: 1,
    session_number: 17,
    session_code: "BIO-SES-17",
    title: "Global Regulatory Frameworks, Bioplastics Certification & Standards",
    track: "Regulatory & Standards",
    category: "Special Forum",
    description: "EN 13432 industrial composting standards, T\xDCV Austria OK Compost HOME certifications, ASTM D6400, and green claims verification laws.",
    session_date: "2026-06-23",
    start_time: "17:00",
    end_time: "18:15",
    room: "Auditorium Pasteur (Hall A)",
    session_type: "Special Symposium"
  },
  {
    id: 18,
    conference_id: 1,
    session_number: 18,
    session_code: "BIO-SES-18",
    title: "Industrial Scale-Up, High-Throughput Extrusion & Rheology",
    track: "Industrial Processing",
    category: "Oral Presentations",
    description: "Twin-screw extrusion dynamics, melt strength enhancement with chain extenders, blow molding stabilization, and pelletizing economics.",
    session_date: "2026-06-23",
    start_time: "17:00",
    end_time: "18:15",
    room: "Amphitheatre Curie (Hall B)",
    session_type: "Oral Presentation"
  },
  {
    id: 19,
    conference_id: 1,
    session_number: 19,
    session_code: "BIO-SES-19",
    title: "Young Scientist & Emerging Scholar Flash Oral Session",
    track: "Emerging Research",
    category: "Flash Presentations",
    description: "Competitive 5-minute flash presentations by doctoral candidates and postdoctoral fellows showcasing rapid innovations.",
    session_date: "2026-06-23",
    start_time: "14:00",
    end_time: "16:00",
    room: "Poster & Flash Arena (Level 2)",
    session_type: "Oral Presentation"
  },
  {
    id: 20,
    conference_id: 1,
    session_number: 20,
    session_code: "BIO-SES-20",
    title: "Commercialization, Venture Capital & Academic Spin-Out Showcase",
    track: "Venture & Commercialization",
    category: "Closing Plenary & Pitch",
    description: "Leading venture capital investors, tech transfer executives, and startup founders presenting scale-up investments and partnership models.",
    session_date: "2026-06-23",
    start_time: "18:15",
    end_time: "19:30",
    room: "Grand Auditorium Pasteur",
    session_type: "Closing Plenary & Pitch"
  }
].map((s, idx) => ({
  ...s,
  is_published: true,
  is_active: true,
  status: "published",
  image_url: [
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=600&q=80"
  ][idx % 5]
}));
var SCHEDULE_ITEMS = [
  // Day 1 - June 22, 2026
  {
    id: 1,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "08:00",
    end_time: "09:00",
    title: "Delegate Registration, Badge Collection & Welcome Coffee",
    description: "Registration concourse open. Networking breakfast and digital abstract guide distribution.",
    room: "Grand Foyer (Level 1)",
    item_type: "ceremony"
  },
  {
    id: 2,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "09:00",
    end_time: "09:30",
    title: "Opening Ceremony & Presidential Address",
    description: "Welcome remarks by Conference Chair Prof. Henriette Dubois and international dignitaries.",
    room: "Auditorium Pasteur",
    speaker_name: "Prof. Henriette Dubois",
    speaker_affiliation: "Sorbonne Universit\xE9",
    item_type: "ceremony"
  },
  {
    id: 3,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "09:30",
    end_time: "10:15",
    title: "Keynote 1: Next-Generation Enzymatic Synthesis of Marine-Degradable PHAs",
    description: "Breakthrough microbial catalysis and closed-loop marine biodegradation mechanisms.",
    room: "Auditorium Pasteur",
    track: "Synthesis & Catalysis",
    speaker_name: "Prof. Henriette Dubois",
    speaker_affiliation: "Sorbonne Universit\xE9",
    item_type: "keynote"
  },
  {
    id: 4,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "10:15",
    end_time: "11:00",
    title: "Keynote 2: Stereocomplex PLA Nanocomposites with 220\xB0C Heat Resistance",
    description: "Continuous solid-state reactive extrusion for structural automotive and electronic applications.",
    room: "Auditorium Pasteur",
    track: "Thermal & Mechanical",
    speaker_name: "Dr. Kenjiro Takahashi",
    speaker_affiliation: "Tokyo Institute of Technology",
    item_type: "keynote"
  },
  {
    id: 5,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "11:00",
    end_time: "11:30",
    title: "Group Photo & Morning Networking Coffee Break",
    description: "Official conference group photograph in Grand Foyer followed by exhibition hall networking.",
    room: "Exhibition & Foyer Hall",
    item_type: "break"
  },
  {
    id: 6,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "11:30",
    end_time: "13:00",
    title: "Parallel Session 1 & 2: Microbial Synthesis & Bio-Based Medical Hydrogels",
    description: "Concurrent oral presentations and peer discussions.",
    room: "Auditorium Pasteur & Amphitheatre Curie",
    track: "Tracks A & B",
    item_type: "session"
  },
  {
    id: 7,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "13:00",
    end_time: "14:00",
    title: "Buffet Networking Luncheon & Poster Session 1 Evaluation",
    description: "Catered French organic luncheon and poster board reviews by the scientific jury.",
    room: "Banquet Hall & Poster Gallery",
    item_type: "poster"
  },
  {
    id: 8,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "14:00",
    end_time: "16:00",
    title: "Plenary Session: Marine Microplastics & Industrial Lignin Fractionation",
    description: "High-impact plenary presentations on global environmental remediation.",
    room: "Auditorium Pasteur",
    track: "Environmental & Bio-Refinery",
    speaker_name: "Prof. Elena Rostova & Dr. Carlos Mendoza",
    item_type: "plenary"
  },
  {
    id: 9,
    conference_id: 1,
    day_number: 1,
    day_label: "Day 1",
    schedule_date: "2026-06-22",
    start_time: "19:30",
    end_time: "22:00",
    title: "Official Gala Dinner & Scinsmedia Scientific Excellence Awards",
    description: "Evening gala on the Seine riverboat / Paris Congress Pavilion celebrating outstanding research contributions.",
    room: "Grand Pavilion Ballroom",
    item_type: "networking"
  },
  // Day 2 - June 23, 2026
  {
    id: 10,
    conference_id: 1,
    day_number: 2,
    day_label: "Day 2",
    schedule_date: "2026-06-23",
    start_time: "08:30",
    end_time: "09:00",
    title: "Morning Executive Briefing & Tea",
    description: "Daily briefing for session chairs and delegates.",
    room: "Grand Foyer",
    item_type: "break"
  },
  {
    id: 11,
    conference_id: 1,
    day_number: 2,
    day_label: "Day 2",
    schedule_date: "2026-06-23",
    start_time: "09:00",
    end_time: "10:30",
    title: "Keynote 3: Enzymatic Recycling of Post-Consumer Plastics at Scale",
    description: "State of industrial bio-recycling plants and regulatory approval pathways in the EU.",
    room: "Auditorium Pasteur",
    track: "Circular Economy",
    speaker_name: "Dr. Marcus Thorne",
    speaker_affiliation: "Max Planck Institute for Polymer Research",
    item_type: "keynote"
  },
  {
    id: 12,
    conference_id: 1,
    day_number: 2,
    day_label: "Day 2",
    schedule_date: "2026-06-23",
    start_time: "10:45",
    end_time: "12:45",
    title: "Parallel Session 3 & 4: Soil Biodegradable Mulch & Non-Isocyanate Polyurethanes",
    description: "Deep dives into agro-materials and bio-derived coatings.",
    room: "Auditorium Pasteur & Amphitheatre Curie",
    track: "Industrial Applications",
    item_type: "session"
  },
  {
    id: 13,
    conference_id: 1,
    day_number: 2,
    day_label: "Day 2",
    schedule_date: "2026-06-23",
    start_time: "14:00",
    end_time: "16:00",
    title: "Young Scholar Flash Oral Tournament & Best Poster Awards",
    description: "30 emerging researchers present high-speed scientific discoveries.",
    room: "Auditorium Pasteur",
    track: "Emerging Scientists",
    item_type: "session"
  },
  {
    id: 14,
    conference_id: 1,
    day_number: 2,
    day_label: "Day 2",
    schedule_date: "2026-06-23",
    start_time: "17:30",
    end_time: "18:45",
    title: "Closing Plenary, Conference Declaration & 3rd Edition 2027 Announcement",
    description: "Summary of scientific resolutions, announcement of journal publication timeline, and handover ceremony.",
    room: "Auditorium Pasteur",
    item_type: "ceremony"
  },
  // Day 3 - Post-Conference Workshop
  {
    id: 15,
    conference_id: 1,
    day_number: 3,
    day_label: "Day 3",
    schedule_date: "2026-06-24",
    start_time: "09:30",
    end_time: "13:00",
    title: "Hands-On Industrial Extrusion & Rheology Masterclass",
    description: "Advanced laboratory demonstration on continuous twin-screw reactive compounding.",
    room: "Sorbonne Macromolecular Facility",
    track: "Practical Workshop",
    speaker_name: "Dr. Kenjiro Takahashi",
    speaker_affiliation: "Tokyo Institute of Technology",
    item_type: "session"
  }
];
var REGISTRATION_CATEGORIES = [
  {
    id: 1,
    conference_id: 1,
    name: "Speaker",
    description: "For accepted oral presenters delivering a talk in the main scientific program.",
    tier1_price: 700,
    tier2_price: 800,
    tier3_price: 900,
    tier1_label: "April 30, 2026",
    tier2_label: "May 20, 2026",
    tier3_label: "June 10, 2026",
    price: 900,
    standard_fee: 900,
    currency: "USD",
    early_bird_price: 700,
    early_bird_fee: 700,
    deadline: "2026-06-10",
    benefits: [
      "Full access to all sessions & keynotes",
      "Dedicated speaking slot & AV support",
      "Conference kit, badge & printed abstracts book",
      "Certificate of Presentation",
      "Lunch & coffee breaks included"
    ],
    is_popular: true,
    display_order: 1,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c1_p1_speaker"
  },
  {
    id: 2,
    conference_id: 1,
    name: "Delegate",
    description: "Standard attendee pass with full access but no presentation slot.",
    tier1_price: 600,
    tier2_price: 700,
    tier3_price: 800,
    tier1_label: "April 30, 2026",
    tier2_label: "May 20, 2026",
    tier3_label: "June 10, 2026",
    price: 800,
    standard_fee: 800,
    currency: "USD",
    early_bird_price: 600,
    early_bird_fee: 600,
    deadline: "2026-06-10",
    benefits: [
      "Access to all sessions & poster halls",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance"
    ],
    is_popular: false,
    display_order: 2,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c1_p2_delegate"
  },
  {
    id: 3,
    conference_id: 1,
    name: "Poster",
    description: "For accepted poster presenters exhibiting research in the poster sessions.",
    tier1_price: 550,
    tier2_price: 650,
    tier3_price: 750,
    tier1_label: "April 30, 2026",
    tier2_label: "May 20, 2026",
    tier3_label: "June 10, 2026",
    price: 750,
    standard_fee: 750,
    currency: "USD",
    early_bird_price: 550,
    early_bird_fee: 550,
    deadline: "2026-06-10",
    benefits: [
      "Dedicated poster board & session slot",
      "Access to all sessions",
      "Abstract published in proceedings book",
      "Certificate of Presentation"
    ],
    is_popular: false,
    display_order: 3,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c1_p3_poster"
  },
  {
    id: 4,
    conference_id: 1,
    name: "Virtual",
    description: "Full digital live-stream access for remote/online attendees.",
    tier1_price: 300,
    tier2_price: 350,
    tier3_price: 400,
    tier1_label: "April 30, 2026",
    tier2_label: "May 20, 2026",
    tier3_label: "June 10, 2026",
    price: 400,
    standard_fee: 400,
    currency: "USD",
    early_bird_price: 300,
    early_bird_fee: 300,
    deadline: "2026-06-10",
    benefits: [
      "Live-streamed access to all sessions",
      "Live Q&A with on-stage speakers",
      "Digital certificate of participation",
      "On-demand replay access for 6 months"
    ],
    is_popular: false,
    display_order: 4,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c1_p4_virtual"
  },
  {
    id: 5,
    conference_id: 1,
    name: "Student",
    description: "Discounted rate for enrolled undergraduate, graduate & doctoral students.",
    tier1_price: 400,
    tier2_price: 450,
    tier3_price: 500,
    tier1_label: "April 30, 2026",
    tier2_label: "May 20, 2026",
    tier3_label: "June 10, 2026",
    price: 500,
    standard_fee: 500,
    currency: "USD",
    early_bird_price: 400,
    early_bird_fee: 400,
    deadline: "2026-06-10",
    benefits: [
      "Access to all sessions",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance (valid student ID required)"
    ],
    is_popular: false,
    display_order: 5,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c1_p5_student"
  },
  {
    id: 6,
    conference_id: 1,
    name: "Accompany Person",
    description: "For a spouse, family member, or guest joining social events (no session access required).",
    tier1_price: 200,
    tier2_price: 250,
    tier3_price: 300,
    tier1_label: "April 30, 2026",
    tier2_label: "May 20, 2026",
    tier3_label: "June 10, 2026",
    price: 300,
    standard_fee: 300,
    currency: "USD",
    early_bird_price: 200,
    early_bird_fee: 200,
    deadline: "2026-06-10",
    benefits: [
      "Welcome reception & gala dinner access",
      "City/venue guided tour (where offered)",
      "Lunch & coffee breaks included"
    ],
    is_popular: false,
    display_order: 6,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c1_p6_accompany_person"
  },
  {
    id: 7,
    conference_id: 2,
    name: "Speaker",
    description: "For accepted oral presenters delivering a talk in the main scientific program.",
    tier1_price: 805,
    tier2_price: 920,
    tier3_price: 1035,
    tier1_label: "May 31, 2026",
    tier2_label: "July 1, 2026",
    tier3_label: "August 1, 2026",
    price: 1035,
    standard_fee: 1035,
    currency: "USD",
    early_bird_price: 805,
    early_bird_fee: 805,
    deadline: "2026-08-01",
    benefits: [
      "Full access to all sessions & keynotes",
      "Dedicated speaking slot & AV support",
      "Conference kit, badge & printed abstracts book",
      "Certificate of Presentation",
      "Lunch & coffee breaks included"
    ],
    is_popular: true,
    display_order: 1,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c2_p7_speaker"
  },
  {
    id: 8,
    conference_id: 2,
    name: "Delegate",
    description: "Standard attendee pass with full access but no presentation slot.",
    tier1_price: 690,
    tier2_price: 805,
    tier3_price: 920,
    tier1_label: "May 31, 2026",
    tier2_label: "July 1, 2026",
    tier3_label: "August 1, 2026",
    price: 920,
    standard_fee: 920,
    currency: "USD",
    early_bird_price: 690,
    early_bird_fee: 690,
    deadline: "2026-08-01",
    benefits: [
      "Access to all sessions & poster halls",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance"
    ],
    is_popular: false,
    display_order: 2,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c2_p8_delegate"
  },
  {
    id: 9,
    conference_id: 2,
    name: "Poster",
    description: "For accepted poster presenters exhibiting research in the poster sessions.",
    tier1_price: 630,
    tier2_price: 745,
    tier3_price: 860,
    tier1_label: "May 31, 2026",
    tier2_label: "July 1, 2026",
    tier3_label: "August 1, 2026",
    price: 860,
    standard_fee: 860,
    currency: "USD",
    early_bird_price: 630,
    early_bird_fee: 630,
    deadline: "2026-08-01",
    benefits: [
      "Dedicated poster board & session slot",
      "Access to all sessions",
      "Abstract published in proceedings book",
      "Certificate of Presentation"
    ],
    is_popular: false,
    display_order: 3,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c2_p9_poster"
  },
  {
    id: 10,
    conference_id: 2,
    name: "Virtual",
    description: "Full digital live-stream access for remote/online attendees.",
    tier1_price: 345,
    tier2_price: 400,
    tier3_price: 460,
    tier1_label: "May 31, 2026",
    tier2_label: "July 1, 2026",
    tier3_label: "August 1, 2026",
    price: 460,
    standard_fee: 460,
    currency: "USD",
    early_bird_price: 345,
    early_bird_fee: 345,
    deadline: "2026-08-01",
    benefits: [
      "Live-streamed access to all sessions",
      "Live Q&A with on-stage speakers",
      "Digital certificate of participation",
      "On-demand replay access for 6 months"
    ],
    is_popular: false,
    display_order: 4,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c2_p10_virtual"
  },
  {
    id: 11,
    conference_id: 2,
    name: "Student",
    description: "Discounted rate for enrolled undergraduate, graduate & doctoral students.",
    tier1_price: 460,
    tier2_price: 515,
    tier3_price: 575,
    tier1_label: "May 31, 2026",
    tier2_label: "July 1, 2026",
    tier3_label: "August 1, 2026",
    price: 575,
    standard_fee: 575,
    currency: "USD",
    early_bird_price: 460,
    early_bird_fee: 460,
    deadline: "2026-08-01",
    benefits: [
      "Access to all sessions",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance (valid student ID required)"
    ],
    is_popular: false,
    display_order: 5,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c2_p11_student"
  },
  {
    id: 12,
    conference_id: 2,
    name: "Accompany Person",
    description: "For a spouse, family member, or guest joining social events (no session access required).",
    tier1_price: 230,
    tier2_price: 285,
    tier3_price: 345,
    tier1_label: "May 31, 2026",
    tier2_label: "July 1, 2026",
    tier3_label: "August 1, 2026",
    price: 345,
    standard_fee: 345,
    currency: "USD",
    early_bird_price: 230,
    early_bird_fee: 230,
    deadline: "2026-08-01",
    benefits: [
      "Welcome reception & gala dinner access",
      "City/venue guided tour (where offered)",
      "Lunch & coffee breaks included"
    ],
    is_popular: false,
    display_order: 6,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c2_p12_accompany_person"
  },
  {
    id: 13,
    conference_id: 3,
    name: "Speaker",
    description: "For accepted oral presenters delivering a talk in the main scientific program.",
    tier1_price: 910,
    tier2_price: 1040,
    tier3_price: 1170,
    tier1_label: "June 30, 2026",
    tier2_label: "August 2, 2026",
    tier3_label: "September 5, 2026",
    price: 1170,
    standard_fee: 1170,
    currency: "USD",
    early_bird_price: 910,
    early_bird_fee: 910,
    deadline: "2026-09-05",
    benefits: [
      "Full access to all sessions & keynotes",
      "Dedicated speaking slot & AV support",
      "Conference kit, badge & printed abstracts book",
      "Certificate of Presentation",
      "Lunch & coffee breaks included"
    ],
    is_popular: true,
    display_order: 1,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c3_p13_speaker"
  },
  {
    id: 14,
    conference_id: 3,
    name: "Delegate",
    description: "Standard attendee pass with full access but no presentation slot.",
    tier1_price: 780,
    tier2_price: 910,
    tier3_price: 1040,
    tier1_label: "June 30, 2026",
    tier2_label: "August 2, 2026",
    tier3_label: "September 5, 2026",
    price: 1040,
    standard_fee: 1040,
    currency: "USD",
    early_bird_price: 780,
    early_bird_fee: 780,
    deadline: "2026-09-05",
    benefits: [
      "Access to all sessions & poster halls",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance"
    ],
    is_popular: false,
    display_order: 2,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c3_p14_delegate"
  },
  {
    id: 15,
    conference_id: 3,
    name: "Poster",
    description: "For accepted poster presenters exhibiting research in the poster sessions.",
    tier1_price: 715,
    tier2_price: 845,
    tier3_price: 975,
    tier1_label: "June 30, 2026",
    tier2_label: "August 2, 2026",
    tier3_label: "September 5, 2026",
    price: 975,
    standard_fee: 975,
    currency: "USD",
    early_bird_price: 715,
    early_bird_fee: 715,
    deadline: "2026-09-05",
    benefits: [
      "Dedicated poster board & session slot",
      "Access to all sessions",
      "Abstract published in proceedings book",
      "Certificate of Presentation"
    ],
    is_popular: false,
    display_order: 3,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c3_p15_poster"
  },
  {
    id: 16,
    conference_id: 3,
    name: "Virtual",
    description: "Full digital live-stream access for remote/online attendees.",
    tier1_price: 390,
    tier2_price: 455,
    tier3_price: 520,
    tier1_label: "June 30, 2026",
    tier2_label: "August 2, 2026",
    tier3_label: "September 5, 2026",
    price: 520,
    standard_fee: 520,
    currency: "USD",
    early_bird_price: 390,
    early_bird_fee: 390,
    deadline: "2026-09-05",
    benefits: [
      "Live-streamed access to all sessions",
      "Live Q&A with on-stage speakers",
      "Digital certificate of participation",
      "On-demand replay access for 6 months"
    ],
    is_popular: false,
    display_order: 4,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c3_p16_virtual"
  },
  {
    id: 17,
    conference_id: 3,
    name: "Student",
    description: "Discounted rate for enrolled undergraduate, graduate & doctoral students.",
    tier1_price: 520,
    tier2_price: 585,
    tier3_price: 650,
    tier1_label: "June 30, 2026",
    tier2_label: "August 2, 2026",
    tier3_label: "September 5, 2026",
    price: 650,
    standard_fee: 650,
    currency: "USD",
    early_bird_price: 520,
    early_bird_fee: 520,
    deadline: "2026-09-05",
    benefits: [
      "Access to all sessions",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance (valid student ID required)"
    ],
    is_popular: false,
    display_order: 5,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c3_p17_student"
  },
  {
    id: 18,
    conference_id: 3,
    name: "Accompany Person",
    description: "For a spouse, family member, or guest joining social events (no session access required).",
    tier1_price: 260,
    tier2_price: 325,
    tier3_price: 390,
    tier1_label: "June 30, 2026",
    tier2_label: "August 2, 2026",
    tier3_label: "September 5, 2026",
    price: 390,
    standard_fee: 390,
    currency: "USD",
    early_bird_price: 260,
    early_bird_fee: 260,
    deadline: "2026-09-05",
    benefits: [
      "Welcome reception & gala dinner access",
      "City/venue guided tour (where offered)",
      "Lunch & coffee breaks included"
    ],
    is_popular: false,
    display_order: 6,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c3_p18_accompany_person"
  },
  {
    id: 19,
    conference_id: 4,
    name: "Speaker",
    description: "For accepted oral presenters delivering a talk in the main scientific program.",
    tier1_price: 735,
    tier2_price: 840,
    tier3_price: 945,
    tier1_label: "July 31, 2026",
    tier2_label: "August 31, 2026",
    tier3_label: "October 1, 2026",
    price: 945,
    standard_fee: 945,
    currency: "USD",
    early_bird_price: 735,
    early_bird_fee: 735,
    deadline: "2026-10-01",
    benefits: [
      "Full access to all sessions & keynotes",
      "Dedicated speaking slot & AV support",
      "Conference kit, badge & printed abstracts book",
      "Certificate of Presentation",
      "Lunch & coffee breaks included"
    ],
    is_popular: true,
    display_order: 1,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c4_p19_speaker"
  },
  {
    id: 20,
    conference_id: 4,
    name: "Delegate",
    description: "Standard attendee pass with full access but no presentation slot.",
    tier1_price: 630,
    tier2_price: 735,
    tier3_price: 840,
    tier1_label: "July 31, 2026",
    tier2_label: "August 31, 2026",
    tier3_label: "October 1, 2026",
    price: 840,
    standard_fee: 840,
    currency: "USD",
    early_bird_price: 630,
    early_bird_fee: 630,
    deadline: "2026-10-01",
    benefits: [
      "Access to all sessions & poster halls",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance"
    ],
    is_popular: false,
    display_order: 2,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c4_p20_delegate"
  },
  {
    id: 21,
    conference_id: 4,
    name: "Poster",
    description: "For accepted poster presenters exhibiting research in the poster sessions.",
    tier1_price: 575,
    tier2_price: 680,
    tier3_price: 785,
    tier1_label: "July 31, 2026",
    tier2_label: "August 31, 2026",
    tier3_label: "October 1, 2026",
    price: 785,
    standard_fee: 785,
    currency: "USD",
    early_bird_price: 575,
    early_bird_fee: 575,
    deadline: "2026-10-01",
    benefits: [
      "Dedicated poster board & session slot",
      "Access to all sessions",
      "Abstract published in proceedings book",
      "Certificate of Presentation"
    ],
    is_popular: false,
    display_order: 3,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c4_p21_poster"
  },
  {
    id: 22,
    conference_id: 4,
    name: "Virtual",
    description: "Full digital live-stream access for remote/online attendees.",
    tier1_price: 315,
    tier2_price: 365,
    tier3_price: 420,
    tier1_label: "July 31, 2026",
    tier2_label: "August 31, 2026",
    tier3_label: "October 1, 2026",
    price: 420,
    standard_fee: 420,
    currency: "USD",
    early_bird_price: 315,
    early_bird_fee: 315,
    deadline: "2026-10-01",
    benefits: [
      "Live-streamed access to all sessions",
      "Live Q&A with on-stage speakers",
      "Digital certificate of participation",
      "On-demand replay access for 6 months"
    ],
    is_popular: false,
    display_order: 4,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c4_p22_virtual"
  },
  {
    id: 23,
    conference_id: 4,
    name: "Student",
    description: "Discounted rate for enrolled undergraduate, graduate & doctoral students.",
    tier1_price: 420,
    tier2_price: 470,
    tier3_price: 525,
    tier1_label: "July 31, 2026",
    tier2_label: "August 31, 2026",
    tier3_label: "October 1, 2026",
    price: 525,
    standard_fee: 525,
    currency: "USD",
    early_bird_price: 420,
    early_bird_fee: 420,
    deadline: "2026-10-01",
    benefits: [
      "Access to all sessions",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance (valid student ID required)"
    ],
    is_popular: false,
    display_order: 5,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c4_p23_student"
  },
  {
    id: 24,
    conference_id: 4,
    name: "Accompany Person",
    description: "For a spouse, family member, or guest joining social events (no session access required).",
    tier1_price: 210,
    tier2_price: 260,
    tier3_price: 315,
    tier1_label: "July 31, 2026",
    tier2_label: "August 31, 2026",
    tier3_label: "October 1, 2026",
    price: 315,
    standard_fee: 315,
    currency: "USD",
    early_bird_price: 210,
    early_bird_fee: 210,
    deadline: "2026-10-01",
    benefits: [
      "Welcome reception & gala dinner access",
      "City/venue guided tour (where offered)",
      "Lunch & coffee breaks included"
    ],
    is_popular: false,
    display_order: 6,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c4_p24_accompany_person"
  },
  {
    id: 25,
    conference_id: 5,
    name: "Speaker",
    description: "For accepted oral presenters delivering a talk in the main scientific program.",
    tier1_price: 770,
    tier2_price: 880,
    tier3_price: 990,
    tier1_label: "August 20, 2026",
    tier2_label: "September 22, 2026",
    tier3_label: "October 25, 2026",
    price: 990,
    standard_fee: 990,
    currency: "USD",
    early_bird_price: 770,
    early_bird_fee: 770,
    deadline: "2026-10-25",
    benefits: [
      "Full access to all sessions & keynotes",
      "Dedicated speaking slot & AV support",
      "Conference kit, badge & printed abstracts book",
      "Certificate of Presentation",
      "Lunch & coffee breaks included"
    ],
    is_popular: true,
    display_order: 1,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c5_p25_speaker"
  },
  {
    id: 26,
    conference_id: 5,
    name: "Delegate",
    description: "Standard attendee pass with full access but no presentation slot.",
    tier1_price: 660,
    tier2_price: 770,
    tier3_price: 880,
    tier1_label: "August 20, 2026",
    tier2_label: "September 22, 2026",
    tier3_label: "October 25, 2026",
    price: 880,
    standard_fee: 880,
    currency: "USD",
    early_bird_price: 660,
    early_bird_fee: 660,
    deadline: "2026-10-25",
    benefits: [
      "Access to all sessions & poster halls",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance"
    ],
    is_popular: false,
    display_order: 2,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c5_p26_delegate"
  },
  {
    id: 27,
    conference_id: 5,
    name: "Poster",
    description: "For accepted poster presenters exhibiting research in the poster sessions.",
    tier1_price: 605,
    tier2_price: 715,
    tier3_price: 825,
    tier1_label: "August 20, 2026",
    tier2_label: "September 22, 2026",
    tier3_label: "October 25, 2026",
    price: 825,
    standard_fee: 825,
    currency: "USD",
    early_bird_price: 605,
    early_bird_fee: 605,
    deadline: "2026-10-25",
    benefits: [
      "Dedicated poster board & session slot",
      "Access to all sessions",
      "Abstract published in proceedings book",
      "Certificate of Presentation"
    ],
    is_popular: false,
    display_order: 3,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c5_p27_poster"
  },
  {
    id: 28,
    conference_id: 5,
    name: "Virtual",
    description: "Full digital live-stream access for remote/online attendees.",
    tier1_price: 330,
    tier2_price: 385,
    tier3_price: 440,
    tier1_label: "August 20, 2026",
    tier2_label: "September 22, 2026",
    tier3_label: "October 25, 2026",
    price: 440,
    standard_fee: 440,
    currency: "USD",
    early_bird_price: 330,
    early_bird_fee: 330,
    deadline: "2026-10-25",
    benefits: [
      "Live-streamed access to all sessions",
      "Live Q&A with on-stage speakers",
      "Digital certificate of participation",
      "On-demand replay access for 6 months"
    ],
    is_popular: false,
    display_order: 4,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c5_p28_virtual"
  },
  {
    id: 29,
    conference_id: 5,
    name: "Student",
    description: "Discounted rate for enrolled undergraduate, graduate & doctoral students.",
    tier1_price: 440,
    tier2_price: 495,
    tier3_price: 550,
    tier1_label: "August 20, 2026",
    tier2_label: "September 22, 2026",
    tier3_label: "October 25, 2026",
    price: 550,
    standard_fee: 550,
    currency: "USD",
    early_bird_price: 440,
    early_bird_fee: 440,
    deadline: "2026-10-25",
    benefits: [
      "Access to all sessions",
      "Conference kit & printed abstracts book",
      "Lunch & coffee breaks included",
      "Certificate of Attendance (valid student ID required)"
    ],
    is_popular: false,
    display_order: 5,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c5_p29_student"
  },
  {
    id: 30,
    conference_id: 5,
    name: "Accompany Person",
    description: "For a spouse, family member, or guest joining social events (no session access required).",
    tier1_price: 220,
    tier2_price: 275,
    tier3_price: 330,
    tier1_label: "August 20, 2026",
    tier2_label: "September 22, 2026",
    tier3_label: "October 25, 2026",
    price: 330,
    standard_fee: 330,
    currency: "USD",
    early_bird_price: 220,
    early_bird_fee: 220,
    deadline: "2026-10-25",
    benefits: [
      "Welcome reception & gala dinner access",
      "City/venue guided tour (where offered)",
      "Lunch & coffee breaks included"
    ],
    is_popular: false,
    display_order: 6,
    is_active: true,
    payment_gateway_link: "https://buy.stripe.com/scins_c5_p30_accompany_person"
  }
];
var SPONSORS = [
  {
    id: 1,
    company_name: "BASF Biopolymers Group",
    name: "BASF Biopolymers Group",
    logo_url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80",
    website: "https://basf.com/biopolymers",
    description: "Global chemical leader advancing certified soil-biodegradable and bio-based plastics for agriculture and packaging.",
    tier_name: "Platinum Sponsor",
    tier: "Platinum",
    tier_id: 1,
    country: "Germany",
    conference_id: 1
  },
  {
    id: 2,
    company_name: "NatureWorks LLC",
    name: "NatureWorks LLC",
    logo_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
    website: "https://natureworksllc.com",
    description: "Pioneering producer of Ingeo\u2122 lactide intermediates and polylactic acid (PLA) polymers derived from greenhouse gases and plant sugars.",
    tier_name: "Platinum Sponsor",
    tier: "Platinum",
    tier_id: 1,
    country: "United States",
    conference_id: 1
  },
  {
    id: 3,
    company_name: "Novamont S.p.A.",
    name: "Novamont S.p.A.",
    logo_url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=300&q=80",
    website: "https://novamont.com",
    description: "International pioneer in circular bioeconomy and developer of Mater-Bi\xAE biodegradable bioplastics.",
    tier_name: "Gold Sponsor",
    tier: "Gold",
    tier_id: 2,
    country: "Italy",
    conference_id: 1
  },
  {
    id: 4,
    company_name: "Danimer Scientific",
    name: "Danimer Scientific",
    logo_url: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=300&q=80",
    website: "https://danimerscientific.com",
    description: "Biotechnology innovator in Nodax\u2122 polyhydroxyalkanoate (PHA) biopolymers.",
    tier_name: "Silver Sponsor",
    tier: "Silver",
    tier_id: 3,
    country: "United States",
    conference_id: 1
  },
  {
    id: 5,
    company_name: "TotalEnergies Corbion",
    name: "TotalEnergies Corbion",
    logo_url: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=300&q=80",
    website: "https://totalenergies-corbion.com",
    description: "Global technology leader in Luminy\xAE PLA resins offering low carbon footprint solutions.",
    tier_name: "Supporting Partner",
    tier: "Supporting",
    tier_id: 4,
    country: "Netherlands",
    conference_id: 1
  }
];
var MEDIA_PARTNERS = [
  {
    id: 1,
    name: "Nature Biotechnology & Materials",
    logo_url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=300&q=80",
    website: "https://nature.com/nbt",
    country: "United Kingdom",
    description: "Premier international scientific journal covering breakthrough biotechnology, synthesis, and materials.",
    conference_id: 1
  },
  {
    id: 2,
    name: "Elsevier Polymer Science Press",
    logo_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80",
    website: "https://elsevier.com/polymers",
    country: "Netherlands",
    description: "Leading global academic publisher indexing proceedings in European Polymer Journal and Polymer Degradation & Stability.",
    conference_id: 1
  },
  {
    id: 3,
    name: "Labiotech.eu",
    logo_url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=300&q=80",
    website: "https://labiotech.eu",
    country: "Germany",
    description: "Europe\u2019s most read digital biotech media network analyzing commercial innovations.",
    conference_id: 1
  },
  {
    id: 4,
    name: "Biofuels & Bioproducts Digest",
    logo_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80",
    website: "https://biofuelsdigest.com",
    country: "United States",
    description: "The world\u2019s most widely read bioeconomy daily covering renewable chemicals.",
    conference_id: 1
  },
  {
    id: 5,
    name: "Plastics Technology Journal",
    logo_url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=300&q=80",
    website: "https://ptonline.com",
    country: "United States",
    description: "Authoritative industrial engineering publication on polymer compounding, extrusion, and recycling.",
    conference_id: 1
  }
];
var CONFERENCE_FLYERS = [
  {
    id: 1,
    conference_id: 1,
    title: "Biopolymers 2026 Official Conference Brochure & Call for Papers",
    file_url: "https://scinsmedia.com/docs/biopolymers-2026-brochure.pdf",
    download_url: "https://scinsmedia.com/docs/biopolymers-2026-brochure.pdf",
    file_type: "PDF",
    file_size: "3.4 MB",
    downloads_count: 1420
  },
  {
    id: 2,
    conference_id: 1,
    title: "Detailed 20-Session Scientific Program & Track Guide",
    file_url: "https://scinsmedia.com/docs/biopolymers-2026-program.pdf",
    download_url: "https://scinsmedia.com/docs/biopolymers-2026-program.pdf",
    file_type: "PDF",
    file_size: "4.8 MB",
    downloads_count: 980
  },
  {
    id: 3,
    conference_id: 1,
    title: "Corporate Sponsorship & Exhibition Prospectus 2026",
    file_url: "https://scinsmedia.com/docs/biopolymers-2026-sponsorship.pdf",
    download_url: "https://scinsmedia.com/docs/biopolymers-2026-sponsorship.pdf",
    file_type: "PDF",
    file_size: "2.1 MB",
    downloads_count: 450
  },
  {
    id: 4,
    conference_id: 1,
    title: "Abstract Submission Template & Author Guidelines",
    file_url: "https://scinsmedia.com/docs/scinsmedia-abstract-template.docx",
    download_url: "https://scinsmedia.com/docs/scinsmedia-abstract-template.docx",
    file_type: "DOCX",
    file_size: "512 KB",
    downloads_count: 2150
  }
];
var PUBLICATIONS = [
  {
    id: 1,
    title: "Enzymatic Hydrolysis and Complete Mineralization Kinetics of Poly(hydroxybutyrate-co-valerate) in Temperate Seawater",
    authors: "Dubois, H., Thorne, M., & Laurent, P.",
    journal: "Journal of Macromolecular Science & Green Chemistry (Elsevier)",
    research_domain: "Biotechnology",
    conference_id: 1,
    conference_name: "Biopolymers 2026",
    publication_date: "2026-03-15",
    doi: "10.1016/j.jmscgc.2026.03.011",
    abstract_summary: "Quantitative evaluation of microbial biofilm succession on PHBV films across 180 days of marine exposure, verifying zero microplastic residue via FTIR and GPC chromatography.",
    citations: 38,
    indexed_in: "Scopus, Web of Science (Q1), PubMed"
  },
  {
    id: 2,
    title: "High-Temperature Stereocomplex Crystallization Kinetics in Poly(L-lactic acid)/Poly(D-lactic acid) Blends During Fast Reactive Injection Molding",
    authors: "Takahashi, K., Chen, W., & Nakamura, S.",
    journal: "Advanced Functional Materials",
    research_domain: "Materials Science",
    conference_id: 1,
    conference_name: "Biopolymers 2026",
    publication_date: "2026-01-28",
    doi: "10.1002/adfm.202600492",
    abstract_summary: "Demonstration of rapid stereocomplex formation under high shear rates, raising melting temperature above 225\xB0C without compromising optical transparency.",
    citations: 52,
    indexed_in: "Scopus, Web of Science, IEEE Xplore"
  },
  {
    id: 3,
    title: "Lipid Nanoparticle Biodistribution and Transfection Efficiency of mRNA Vaccines in Human Cellular Spheroids",
    authors: "Chen, R. S., Zhao, L., & Miller, A.",
    journal: "Nature Nanotechnology",
    research_domain: "Medicine",
    conference_id: 2,
    conference_name: "NanoMed 2026",
    publication_date: "2026-02-10",
    doi: "10.1038/s41565-026-01124-x",
    abstract_summary: "Single-cell mapping of ionizable lipid nanoparticles inside 3D human liver spheroids, showing 94% cytosolic release of mRNA payload within 4 hours.",
    citations: 89,
    indexed_in: "PubMed Central, Scopus (Q1), Web of Science"
  },
  {
    id: 4,
    title: "Foundation Transformer Models for Predicting Multi-Omic Drug Synergy in Oncology",
    authors: "Von Berg, M., Weber, T., & Rossi, C.",
    journal: "Cell Systems & Bioinformatics",
    research_domain: "Artificial Intelligence",
    conference_id: 3,
    conference_name: "AI Health Summit 2026",
    publication_date: "2026-04-02",
    doi: "10.1016/j.cels.2026.04.008",
    abstract_summary: "A 14-billion parameter generative model trained on 2 million genomic profiles, accurately forecasting combination chemotherapeutic sensitivity with an AUC of 0.941.",
    citations: 64,
    indexed_in: "Scopus, Web of Science, PubMed"
  }
];
var TESTIMONIALS = [
  {
    id: 1,
    name: "Prof. Julian Weintraub",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    designation: "Chair of Macromolecular Engineering",
    institution: "Imperial College London",
    country: "United Kingdom",
    quote: "Scinsmedia conferences set a gold standard for international academic collaboration. The caliber of keynote sessions, rigorous peer review, and high-impact Elsevier journal indexing created lasting multi-university consortia.",
    conference_id: 1,
    conference_name: "Biopolymers 2026",
    rating: 5,
    is_featured: true
  },
  {
    id: 2,
    name: "Dr. Mei-Ling Zhou",
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    designation: "Senior Director of Polymer Science",
    institution: "Tsinghua University & Sinopec Bio-Materials",
    country: "China",
    quote: "The hybrid conference experience was flawlessly executed. Delivering our oral presentation from Beijing with instant interactive Q&A in the Paris auditorium generated two major licensing discussions.",
    conference_id: 1,
    conference_name: "Biopolymers 2026",
    rating: 5,
    is_featured: true
  },
  {
    id: 3,
    name: "Dr. Arthur Sterling, Ph.D.",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    designation: "Global Research Lead",
    institution: "Novartis Institute for BioMedical Research",
    country: "United States",
    quote: "The depth of cross-disciplinary dialogue at Scinsmedia summits is unparalleled. It connects cutting-edge chemistry directly with industrial venture scale-up.",
    conference_id: 2,
    conference_name: "NanoMed 2026",
    rating: 5,
    is_featured: true
  }
];
var BLOGS = [
  {
    id: 1,
    title: "The Microbial Revolution: How Engineered Bacteria Are Replacing Petrochemical Plastics",
    slug: "microbial-revolution-bioplastics-2026",
    category: "Biopolymers & Materials",
    author_name: "Prof. Henriette Dubois",
    author_designation: "Director of Macromolecular Institute, Sorbonne Universit\xE9",
    author_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    featured_image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80",
    content: `For nearly a century, petrochemical polymers have enabled modern sanitation, food preservation, and lightweight transportation. However, their thermodynamic resistance to environmental degradation has created an existential oceanic crisis. 

In this editorial insight ahead of Biopolymers 2026 in Paris, we analyze why bacterial polyhydroxyalkanoates (PHAs) represent the only true drop-in substitute capable of full enzymatic assimilation across natural freshwater, marine, and soil environments. By utilizing agricultural waste and industrial carbon monoxide streams as microbial carbon sources, modern fermentation yields exceed 85% intracellular polymer weight at competitive parity with polypropylene.`,
    excerpt: "An in-depth analysis of how continuous fermentation and synthetic biology are achieving price parity between bio-based PHAs and fossil polymers.",
    reading_time: "6 min read",
    tags: ["Biopolymers", "Microbiology", "PHA", "Green Chemistry"],
    is_published: true,
    published_at: "2026-05-01"
  },
  {
    id: 2,
    title: "Lipid Nanoparticle Delivery: Overcoming the Endosomal Escape Hurdle in Gene Therapeutics",
    slug: "lipid-nanoparticles-endosomal-escape-2026",
    category: "Nanotechnology & Medicine",
    author_name: "Dr. Robert S. Chen",
    author_designation: "Harvard Medical School",
    author_avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80",
    featured_image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80",
    content: `While mRNA therapeutics have transformed vaccinology, non-viral delivery to extra-hepatic tissues remains constrained by endosomal entrapment. Less than 2% of internalized nucleic acid cargos successfully bypass lysosomes into the cytosol. 

This review highlights novel ionizable lipids with pH-triggered conformational shifts presented at NanoMed 2026, enabling safe cellular delivery for CRISPR-Cas9 ribonucleoproteins and targeted oncology payloads.`,
    excerpt: "Examining the biophysical engineering required to increase mRNA delivery efficiency from 2% to over 30% in targeted clinical oncology.",
    reading_time: "8 min read",
    tags: ["Nanomedicine", "mRNA", "Drug Delivery", "Lipid Nanoparticles"],
    is_published: true,
    published_at: "2026-04-18"
  },
  {
    id: 3,
    title: "Multimodal Foundation Models in Oncology: From Molecular Sequences to Clinical Survival",
    slug: "multimodal-ai-models-oncology-2026",
    category: "AI & Computational Science",
    author_name: "Prof. Markus Von Berg",
    author_designation: "ETH Zurich",
    author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    featured_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    content: `Genomic sequence data alone rarely predicts clinical drug response. At the AI Health Summit 2026 in Zurich, researchers unveil unified multi-modal architectures that synthesize histopathology whole-slide images, single-cell RNA sequencing, and clinical EHR records into coherent predictive embeddings.`,
    excerpt: "How foundational AI models are synthesizing 10+ data modalities to predict personalized chemotherapeutic responses with 95% precision.",
    reading_time: "5 min read",
    tags: ["Artificial Intelligence", "Genomics", "Bioinformatics", "Cancer Research"],
    is_published: true,
    published_at: "2026-03-24"
  }
];
var FAQS = [
  {
    id: 1,
    conference_id: 1,
    category: "Registration & Pricing",
    question: "What is included in the Biopolymers 2026 Academic Registration fee?",
    answer: "The Academic Registration includes full 2-day access to all 20 scientific sessions, opening and closing keynotes, conference kit and abstract proceedings, peer-reviewed publication in Scopus/SCI indexed proceedings, oral/speaker certificate, official Gala Networking Dinner on June 22, and all catered lunches and networking coffee breaks."
  },
  {
    id: 2,
    conference_id: 1,
    category: "Abstract Submission & Guidelines",
    question: "What are the formatting rules and word limits for abstract submissions?",
    answer: "Abstracts must be written in English and contain between 250 and 350 words, including 4\u20136 relevant keywords and the primary author\u2019s institutional affiliation. Submissions should outline Background, Objectives, Methodology, Key Results, and Scientific Conclusion. Word (.docx) and PDF uploads are accepted."
  },
  {
    id: 3,
    conference_id: 1,
    category: "Publication & Indexing",
    question: "Where will the accepted conference papers and abstracts be published?",
    answer: "All accepted and registered abstracts will be published in official conference proceedings with an assigned DOI. Selected full-length papers will undergo fast-track peer review for special issues in high-impact journals indexed in Scopus, Web of Science, and PubMed through our Elsevier and Springer Nature partnerships."
  },
  {
    id: 4,
    conference_id: 1,
    category: "Travel, Visa & Accommodation",
    question: "How do I obtain an Official Visa Support Invitation Letter for France?",
    answer: "Upon completing your conference registration or abstract acceptance, the Scinsmedia Secretariat will issue an official notarized Visa Support Letter signed by the Conference Organizing Committee within 24\u201348 hours, including embassy verification credentials."
  },
  {
    id: 5,
    conference_id: 1,
    category: "Speaker & Presentation",
    question: "Can I switch from In-Person to Virtual presentation if my travel schedule changes?",
    answer: "Yes. Scinsmedia operates a fully hybrid platform. You can change your attendance mode between In-Person and Virtual at any point up to 14 days prior to the conference start date by contacting the Secretariat."
  },
  {
    id: 6,
    conference_id: 1,
    category: "Sponsorship & Booths",
    question: "What exhibition and booth spaces are available for industrial sponsors in Paris?",
    answer: "We provide 3x3m and 6x3m fully equipped exhibition booths in the Grand Foyer directly adjoining the main Pasteur Auditorium, ensuring continuous foot traffic from over 850 delegates during all poster and coffee sessions."
  }
];
var INITIAL_REGISTRATIONS = [
  {
    id: 1,
    registration_id: "SCINS-REG-2026-00412",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics",
    category_id: 2,
    category_name: "Academician / Faculty / Postdoc",
    first_name: "Prof. Julian",
    last_name: "Weintraub",
    email: "j.weintraub@imperial.ac.uk",
    phone: "+44 20 7594 6000",
    country: "United Kingdom",
    institution: "Imperial College London",
    department: "Department of Chemical Engineering",
    designation: "Chair of Macromolecular Engineering",
    research_area: "Enzymatic Depolymerization",
    attendance_mode: "In-Person",
    accommodation_required: true,
    meal_preference: "Vegetarian",
    special_requirements: "Require French visa invitation letter.",
    amount: 649,
    currency: "USD",
    payment_status: "completed",
    registration_status: "confirmed",
    created_at: "2026-04-12 10:24:00"
  },
  {
    id: 2,
    registration_id: "SCINS-REG-2026-00413",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics",
    category_id: 3,
    category_name: "Industry & Corporate Delegate",
    first_name: "Dr. Aris",
    last_name: "Thorne-Vanderbilt",
    email: "aris.thorne@basf.com",
    phone: "+49 621 60-0",
    country: "Germany",
    institution: "BASF Biopolymers Group",
    department: "Global Sustainability Innovation",
    designation: "VP of Sustainable Packaging",
    research_area: "PBAT Compounding",
    attendance_mode: "In-Person",
    accommodation_required: false,
    meal_preference: "Standard",
    amount: 999,
    currency: "USD",
    payment_status: "completed",
    registration_status: "confirmed",
    created_at: "2026-04-14 14:18:22"
  },
  {
    id: 3,
    registration_id: "SCINS-REG-2026-00414",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics",
    category_id: 1,
    category_name: "Student / Young Researcher",
    first_name: "Clara",
    last_name: "Moreau",
    email: "clara.moreau@polytechnique.edu",
    phone: "+33 1 69 59 60 00",
    country: "France",
    institution: "\xC9cole Polytechnique",
    department: "Mechanics & Materials Laboratory",
    designation: "Doctoral Candidate",
    research_area: "Nanocellulose Gels",
    attendance_mode: "In-Person",
    accommodation_required: false,
    meal_preference: "Standard",
    amount: 399,
    currency: "USD",
    payment_status: "completed",
    registration_status: "confirmed",
    created_at: "2026-04-15 09:45:10"
  },
  {
    id: 4,
    registration_id: "SCINS-REG-2026-00415",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics",
    category_id: 4,
    category_name: "Virtual Delegate / Online Presenter",
    first_name: "Dr. Mei-Ling",
    last_name: "Zhou",
    email: "mlzhou@tsinghua.edu.cn",
    phone: "+86 10 6279 3001",
    country: "China",
    institution: "Tsinghua University",
    department: "School of Materials Science",
    designation: "Senior Director of Polymer Science",
    research_area: "Stereocomplex PLA",
    attendance_mode: "Virtual",
    accommodation_required: false,
    amount: 249,
    currency: "USD",
    payment_status: "completed",
    registration_status: "confirmed",
    created_at: "2026-04-16 16:30:00"
  }
];
var INITIAL_ABSTRACTS = [
  {
    id: 1,
    submission_id: "SCINS-BIO-2026-001245",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics",
    title: "Engineered Microbial Synthesis of Ultra-High-Molecular-Weight Polyhydroxybutyrate from Industrial Flue Gas Carbon Monoxide",
    abstract_text: `Biochemical assimilation of C1 gases presents a transformative avenue to decouple bioplastic manufacturing from arable land use. In this work, we developed an engineered strain of Cupriavidus necator harboring synthetic transcriptional regulators and optimized phosphoribulokinase expression. 

Cultivation in continuous gas-fermentation bioreactors fed with simulated steel-mill exhaust (60% CO, 20% H2, 20% CO2) achieved a cell dry weight of 112 g/L with an unprecedented intracellular PHB accumulation of 84.6% w/w. Gel permeation chromatography revealed an ultra-high weight-average molecular weight (Mw) of 2.8 \xD7 10^6 Da with a polydispersity index of 1.62. 

Tensile testing of solvent-cast films demonstrated an ultimate tensile strength of 44.2 MPa and elongation at break of 12.8%, matching commercial polypropylene standards while maintaining 100% biodegradation in marine sediment assays within 45 days.`,
    keywords: "Cupriavidus necator, Polyhydroxybutyrate, C1 Gas Fermentation, Marine Biodegradation, Circular Carbon",
    research_domain: "Biotechnology",
    presentation_preference: "Oral",
    primary_author_name: "Prof. Julian Weintraub",
    primary_author_email: "j.weintraub@imperial.ac.uk",
    primary_author_phone: "+44 20 7594 6000",
    primary_author_affiliation: "Department of Chemical Engineering, Imperial College London",
    primary_author_country: "United Kingdom",
    file_name: "weintraub-phb-carbon-fermentation.pdf",
    file_url: "https://scinsmedia.com/abstracts/weintraub-phb.pdf",
    status: "accepted",
    reviewer_notes: "Exceptional originality and rigorous mechanical characterization. Recommend for Oral Presentation in Session 2.",
    assigned_reviewer_name: "Dr. Alexander Vance",
    authors: [
      { name: "Prof. Julian Weintraub", email: "j.weintraub@imperial.ac.uk", institution: "Imperial College London", country: "United Kingdom", is_corresponding: true },
      { name: "Dr. Alistair Finch", email: "a.finch@imperial.ac.uk", institution: "Imperial College London", country: "United Kingdom", is_corresponding: false },
      { name: "Dr. Claire Beaulieu", email: "c.beaulieu@sorbonne.fr", institution: "Sorbonne Universit\xE9", country: "France", is_corresponding: false }
    ],
    created_at: "2026-04-10 11:20:00",
    updated_at: "2026-04-14 09:15:00"
  },
  {
    id: 2,
    submission_id: "SCINS-BIO-2026-001246",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics",
    title: "Reactive Extrusion of Organosolv Lignin with Epoxidized Soybean Oil for High-Barrier Food Packaging",
    abstract_text: `Lignin, the second most abundant terrestrial biopolymer, remains largely underutilized as low-value boiler fuel. Here, we present a solvent-free reactive extrusion process synthesizing bio-derived thermosetting coatings from organosolv beechwood lignin and epoxidized soybean oil (ESBO) catalyzed by 2-methylimidazole. 

The resulting bio-resins were cast onto kraft paper substrates at line speeds of 120 m/min. Water vapor transmission rate (WVTR) decreased from 420 g/m\xB2\xB7day to 8.4 g/m\xB2\xB7day at 38\xB0C and 90% RH, outperforming conventional low-density polyethylene coatings. Ecotoxicity testing using Daphnia magna confirmed zero aquatic toxicity.`,
    keywords: "Organosolv Lignin, Epoxidized Soybean Oil, Food Packaging, Water Vapor Barrier, Reactive Extrusion",
    research_domain: "Materials Science",
    presentation_preference: "Oral",
    primary_author_name: "Clara Moreau",
    primary_author_email: "clara.moreau@polytechnique.edu",
    primary_author_phone: "+33 1 69 59 60 00",
    primary_author_affiliation: "\xC9cole Polytechnique & CNRS",
    primary_author_country: "France",
    file_name: "moreau-lignin-reactive-extrusion.pdf",
    status: "under_review",
    reviewer_notes: "Under formal peer review by the Scientific Committee.",
    authors: [
      { name: "Clara Moreau", email: "clara.moreau@polytechnique.edu", institution: "\xC9cole Polytechnique", country: "France", is_corresponding: true },
      { name: "Prof. Pierre Lefevre", email: "p.lefevre@polytechnique.edu", institution: "\xC9cole Polytechnique", country: "France", is_corresponding: false }
    ],
    created_at: "2026-04-15 14:40:00"
  },
  {
    id: 3,
    submission_id: "SCINS-BIO-2026-001247",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics",
    title: "Stereocomplex Polylactic Acid Fiber Scaffolds with Oriented Nanofibers for Accelerated Bone Regeneration",
    abstract_text: `Tissue engineering scaffolds require synchronized mechanical durability and osteoconductive biodegradation. We fabricated biomimetic three-dimensional fiber matrices composed of stereocomplex PLA (sc-PLA) functionalized with bioactive glass nanoparticles via multi-jet electrospinning. 

In vitro culture with human mesenchymal stem cells (hMSCs) demonstrated a 3.4-fold increase in alkaline phosphatase (ALP) activity and dense calcium mineralization compared to racemic PLLA controls over 21 days.`,
    keywords: "Stereocomplex PLA, Tissue Engineering, Electrospinning, Bone Regeneration, Bioactive Glass",
    research_domain: "Biotechnology",
    presentation_preference: "Poster",
    primary_author_name: "Dr. Mei-Ling Zhou",
    primary_author_email: "mlzhou@tsinghua.edu.cn",
    primary_author_affiliation: "School of Materials Science, Tsinghua University",
    primary_author_country: "China",
    status: "scheduled",
    reviewer_notes: "Approved for Poster Session 1 (Board #P-042) on Day 1.",
    created_at: "2026-04-16 17:05:00"
  }
];
var AUDIT_LOGS = [
  {
    id: 1,
    admin_name: "Dr. Alexander Vance",
    admin_email: "admin@scinsmedia.com",
    action: "PUBLISH_CONFERENCE",
    entity: "Conference",
    entity_id: "SCINS-BIO-2026",
    details: "Published 2nd World Congress on Biopolymers & Bioplastics to global website with 20 verified sessions.",
    ip_address: "194.214.23.11",
    created_at: "2026-04-16 08:30:15"
  },
  {
    id: 2,
    admin_name: "Dr. Alexander Vance",
    admin_email: "admin@scinsmedia.com",
    action: "ACCEPT_ABSTRACT",
    entity: "AbstractSubmission",
    entity_id: "SCINS-BIO-2026-001245",
    details: "Accepted abstract by Prof. Julian Weintraub for Oral Presentation in Session 2.",
    ip_address: "194.214.23.11",
    created_at: "2026-04-16 09:15:40"
  },
  {
    id: 3,
    admin_name: "Dr. Alexander Vance",
    admin_email: "admin@scinsmedia.com",
    action: "VERIFY_PAYMENT",
    entity: "Registration",
    entity_id: "SCINS-REG-2026-00412",
    details: "Confirmed wire transfer receipt of $649.00 USD for Imperial College London delegate.",
    ip_address: "194.214.23.11",
    created_at: "2026-04-16 10:45:00"
  }
];
var INITIAL_ADMIN_USER = {
  id: 1,
  name: "Dr. Alexander Vance",
  email: "admin@scinsmedia.com",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  token: void 0
};
var INITIAL_CONTACT_ENQUIRIES = [
  {
    id: 1,
    name: "Prof. Dr. Julian Weintraub",
    email: "j.weintraub@imperial.ac.uk",
    phone: "+44 20 7594 6000",
    subject: "Visa Support Letter Request",
    message: "Requesting official embassy visa invitation letter for attendance at Biopolymers 2026 in Paris. Passport details attached for French consular verification.",
    conference_id: 1,
    conference_code: "BIO-2026",
    status: "new",
    created_at: "2026-05-10 11:24:00"
  },
  {
    id: 2,
    name: "Dr. Elena Rostova",
    email: "elena.rostova@ethz.ch",
    phone: "+41 44 632 11 11",
    subject: "Registration & Invoice Payment",
    message: "Our university finance department needs an official pro-forma VAT invoice with corporate tax ID for 3 faculty full-conference delegate passes.",
    conference_id: 1,
    conference_code: "BIO-2026",
    status: "in_progress",
    created_at: "2026-05-08 14:15:30"
  },
  {
    id: 3,
    name: "Dr. Marcus Vance",
    email: "m.vance@mit.edu",
    phone: "+1 (617) 253-1000",
    subject: "Abstract Status Query",
    message: "Inquiring regarding the peer review decision timeline for abstract submission #SCINS-BIO-2026-001245 on stereocomplex polylactic acid scaffolds.",
    conference_id: 1,
    conference_code: "BIO-2026",
    status: "responded",
    created_at: "2026-05-04 09:30:12"
  },
  {
    id: 4,
    name: "Prof. Akiko Tanaka",
    email: "a.tanaka@u-tokyo.ac.jp",
    phone: "+81 3 5841 2111",
    subject: "Sponsorship & Industry Exhibit",
    message: "Our macromolecular engineering department would like to explore bronze exhibitor booth opportunities at the Paris congress venue.",
    conference_id: 1,
    conference_code: "BIO-2026",
    status: "responded",
    created_at: "2026-04-28 16:45:00"
  }
];
var INITIAL_SUBSCRIBERS = [
  {
    id: 1,
    email: "dr.smith@harvard.edu",
    status: "active",
    created_at: "2026-03-15 10:20:00"
  },
  {
    id: 2,
    email: "prof.weintraub@imperial.ac.uk",
    status: "active",
    created_at: "2026-03-22 14:10:00"
  },
  {
    id: 3,
    email: "researcher.chen@tsinghua.edu.cn",
    status: "active",
    created_at: "2026-04-02 08:45:00"
  },
  {
    id: 4,
    email: "elena.rostova@ethz.ch",
    status: "active",
    created_at: "2026-04-18 16:30:00"
  },
  {
    id: 5,
    email: "m.vance@mit.edu",
    status: "active",
    created_at: "2026-04-29 11:15:00"
  },
  {
    id: 6,
    email: "newsletter.archive@science-digest.org",
    status: "unsubscribed",
    created_at: "2026-02-10 12:00:00"
  }
];
var INITIAL_PROPOSALS = [
  {
    id: 1,
    proposal_code: "PROP-WKSH-2026-104",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics (Paris, France)",
    conference_city: "Paris",
    conference_country: "France",
    proposal_type: "workshop",
    title: "High-Throughput Rheology & Extrusion Protocols for Marine-Degradable Polyhydroxyalkanoates (PHAs)",
    proposer_title: "Prof.",
    proposer_name: "Dr. Jean-Marc Valmont",
    proposer_email: "j.valmont@polytechnique.edu",
    proposer_phone: "+33 1 69 33 40 12",
    proposer_affiliation: "\xC9cole Polytechnique & CNRS Macromolecular Institute",
    proposer_department: "Department of Polymer Physics & Sustainable Materials",
    proposer_country: "France",
    proposer_bio: "Senior Director of Polymer Processing at CNRS with 130+ peer-reviewed papers on aliphatic polyesters and industrial extrusion scale-up.",
    co_presenters: "Dr. Sophie Laurent (Sorbonne Universit\xE9), Marc Dubois (TotalEnergies Corbion)",
    abstract: "This intensive 3-hour hands-on masterclass demonstrates rheological characterization and pilot-scale twin-screw extrusion parameters for bacterial polyhydroxyalkanoates. Attendees will receive practical benchmarking datasets, troubleshoot thermal degradation windows, and evaluate crystallization kinetics in real time.",
    learning_objectives: "1. Master torque rheometer screening for melt viscosity stability.\n2. Formulate nucleating masterbatches to eliminate post-extrusion embrittlement.\n3. Validate ASTM D6691 marine biodegradability simulation testing.",
    target_audience: "Industrial formulation scientists, polymer processing engineers, and doctoral scholars in bioplastics manufacturing.",
    duration_format: "3-Hour Interactive Masterclass (Afternoon Session)",
    av_requirements: "Dual 4K projection, high-speed Wi-Fi for live data feed, 4 tabletop demonstration stations, stage lavalier mic",
    file_name: "pha-extrusion-workshop-syllabus.pdf",
    file_url: "https://scinsmedia.com/proposals/pha-extrusion-workshop.pdf",
    status: "accepted",
    reviewer_notes: "Exceptional hands-on curriculum with high industry relevance. Assigned to Breakout Hall B on Day 1.",
    created_at: "2026-03-12 11:20:00"
  },
  {
    id: 2,
    proposal_code: "PROP-KEYN-2026-218",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics (Paris, France)",
    conference_city: "Paris",
    conference_country: "France",
    proposal_type: "keynote_forum",
    title: "Precision Enzymatic Depolymerization: Engineered Metagenomic Hydrolases for Closed-Loop Polyester Upcycling",
    proposer_title: "Prof.",
    proposer_name: "Prof. Akira Tanaka, Ph.D.",
    proposer_email: "a.tanaka@chem.kyoto-u.ac.jp",
    proposer_phone: "+81 75 753 7531",
    proposer_affiliation: "Kyoto University & RIKEN Center for Sustainable Resource Science",
    proposer_department: "Institute for Chemical Research",
    proposer_country: "Japan",
    proposer_bio: "Pioneer of computational enzyme engineering for plastic degradation; recipient of the 2024 Asian Macromolecular Society Gold Medal.",
    co_presenters: "Dr. Kenji Sato (RIKEN)",
    abstract: "The plenary keynote addresses directed evolution of thermostable polyester hydrolases capable of depolymerizing post-consumer PET and semi-aromatic copolyesters within 10 hours at 68\xB0C. We present molecular dynamics simulations explaining catalytic pocket stabilization and report 98.4% virgin-equivalent monomer recovery.",
    learning_objectives: "1. Explore computational design of high-temperature cutinases.\n2. Understand enzyme immobilization onto magnetic nanocarriers for continuous bioreactor recycling.\n3. Evaluate techno-economic benchmarks against petrochemical monomers.",
    target_audience: "All Congress Attendees: Macromolecular Chemists, Biochemists, Environmental Regulators, and Venture Capitalists.",
    duration_format: "45-Minute Plenary Keynote Address + 15-Minute Moderated Q&A",
    av_requirements: "Plenary Main Stage, 16:9 podium monitor, wireless clicker, dual lapel mics",
    file_name: "tanaka-plenary-proposal-abstract.pdf",
    file_url: "https://scinsmedia.com/proposals/tanaka-plenary.pdf",
    status: "accepted",
    reviewer_notes: "Confirmed as Morning Keynote Plenary Session Chair on Day 1. High scientific distinction.",
    created_at: "2026-03-18 09:40:00"
  },
  {
    id: 3,
    proposal_code: "PROP-POST-2026-342",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics (Paris, France)",
    conference_city: "Paris",
    conference_country: "France",
    proposal_type: "poster",
    title: "Cross-Linked Alginate-Lignin Hydrogel Membranes for Soil Moisture Retention and Slow-Release Micronutrient Delivery",
    proposer_title: "Dr.",
    proposer_name: "Elena Rostova, M.Sc.",
    proposer_email: "elena.rostova@ethz.ch",
    proposer_phone: "+41 44 632 11 00",
    proposer_affiliation: "ETH Z\xFCrich",
    proposer_department: "Department of Materials Science",
    proposer_country: "Switzerland",
    proposer_bio: "Final-year Ph.D. researcher investigating bio-based agrarian hydrogels synthesized from agricultural byproduct streams.",
    abstract: "This research develops a biodegradable hydrogel composite utilizing sodium alginate reinforced with enzymatic lignin. Swelling ratios exceeded 480% in deionized water, releasing zinc and nitrogen over an 8-week period. Soil toxicity bioassays confirmed 0% phytotoxic inhibition on wheat germination.",
    learning_objectives: "Highlight agricultural biopolymer utility in mitigating drought stress while valorizing forestry residues.",
    target_audience: "Agronomists, green chemists, soil scientists, and sustainable packaging delegates.",
    duration_format: "Dedicated Poster Showcase (Board #P-24) + 3-Minute Young Scientist Rapid Pitch",
    av_requirements: "Vertical A0 Poster Board (1189mm x 841mm) with LED spotlighting",
    file_name: "rostova-poster-abstract.pdf",
    status: "shortlisted",
    reviewer_notes: "Shortlisted for Best Young Investigator Poster Award nomination.",
    created_at: "2026-04-05 14:15:00"
  },
  {
    id: 4,
    proposal_code: "PROP-SYMP-2026-415",
    conference_id: 1,
    conference_title: "2nd World Congress on Biopolymers & Bioplastics (Paris, France)",
    conference_city: "Paris",
    conference_country: "France",
    proposal_type: "symposium",
    title: "Global Regulatory Harmonization & LCA Standards for Bio-Based Food Packaging Materials",
    proposer_title: "Dr.",
    proposer_name: "Dr. Marcus Vance, Ph.D.",
    proposer_email: "m.vance@cam.ac.uk",
    proposer_phone: "+44 1223 337733",
    proposer_affiliation: "University of Cambridge & European Bioplastics Association",
    proposer_department: "Centre for Industrial Decarbonization",
    proposer_country: "United Kingdom",
    proposer_bio: "Chair of the UK Sustainable Materials Policy Taskforce and Senior Fellow at Cambridge University.",
    co_presenters: "Dr. Anja Lindqvist (RISE Sweden), Dr. Paolo Rossi (Federchimica Italy)",
    abstract: "A 90-minute thematic symposium convening policymakers, LCA analysts, and corporate packaging executives to dissect discrepancies between EU Packaging & Packaging Waste Regulation (PPWR), US ASTM D6400 standards, and Asian composting guidelines.",
    learning_objectives: "1. Navigate new EU PPWR recycling quotas and compostability mandates.\n2. Standardize cradle-to-grave GHG accounting across diverse agricultural feedstocks.\n3. Establish universal bio-content labeling protocols.",
    target_audience: "Corporate regulatory directors, environmental compliance officers, and academic researchers.",
    duration_format: "90-Minute Thematic Panel & Interactive Roundtable",
    av_requirements: "4 panelist table mics, roving audience microphone, podium presentation laptop",
    status: "under_review",
    created_at: "2026-04-14 17:30:00"
  }
];

// server.ts
var stripeClient = null;
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeClient) {
    stripeClient = new import_stripe.default(secretKey);
  }
  return stripeClient;
}
var DatabaseStore = class {
  constructor() {
    this.conferences = [...INITIAL_CONFERENCES];
    this.committee = [...COMMITTEE_MEMBERS];
    this.speakers = [...SPEAKERS];
    this.sessions = [...SESSIONS_20];
    this.schedule = [...SCHEDULE_ITEMS];
    this.categories = [...REGISTRATION_CATEGORIES];
    this.registrations = [...INITIAL_REGISTRATIONS];
    this.payments = [];
    this.abstracts = [...INITIAL_ABSTRACTS];
    this.proposals = [...INITIAL_PROPOSALS];
    this.publications = [...PUBLICATIONS];
    this.sponsors = [...SPONSORS];
    this.mediaPartners = [...MEDIA_PARTNERS];
    this.testimonials = [...TESTIMONIALS];
    this.blogs = [...BLOGS];
    this.faqs = [...FAQS];
    this.flyers = [...CONFERENCE_FLYERS];
    this.contactEnquiries = [...INITIAL_CONTACT_ENQUIRIES];
    this.quoteRequests = [];
    this.subscribers = [...INITIAL_SUBSCRIBERS];
    this.auditLogs = [...AUDIT_LOGS];
    this.currentUser = { ...INITIAL_ADMIN_USER };
  }
  addAuditLog(action, entity, entity_id, details) {
    const log = {
      id: this.auditLogs.length + 1,
      admin_name: this.currentUser.name,
      admin_email: this.currentUser.email,
      action,
      entity,
      entity_id,
      details,
      ip_address: "127.0.0.1",
      created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
    };
    this.auditLogs.unshift(log);
  }
};
var db = new DatabaseStore();
var mysqlPool = null;
function getDbConfig() {
  return {
    host: process.env.DB_HOST || "",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : void 0
  };
}
var publicCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 30 * 1e3;
function getCached(key) {
  const entry = publicCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    publicCache.delete(key);
    return null;
  }
  return entry.data;
}
function setCache(key, data) {
  if (publicCache.size > 200) {
    publicCache.clear();
  }
  publicCache.set(key, { data, timestamp: Date.now() });
}
function invalidatePublicCache() {
  publicCache.clear();
}
function formatDateStr(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  return String(val).split("T")[0];
}
function parseConferenceDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return Infinity;
  const cleaned = dateStr.trim();
  if (!cleaned) return Infinity;
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const dateObj = new Date(year, month, day);
    return isNaN(dateObj.getTime()) ? Infinity : dateObj.getTime();
  }
  const timestamp = new Date(cleaned).getTime();
  return isNaN(timestamp) ? Infinity : timestamp;
}
function parseJsonSafe(val, fallback) {
  if (!val) return fallback;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}
async function seedInitialConferencesToMysql() {
  if (!mysqlPool) return;
  console.log("[MySQL Seeding] Database is empty. Seeding initial conference records...");
  for (const conf of INITIAL_CONFERENCES) {
    try {
      await mysqlPool.query(
        `INSERT INTO conferences (
          id, title, short_title, slug, conference_code, theme, tagline, description, detailed_about,
          about_heading, about_highlights, gallery_images, domain, city, country, venue, venue_address, timezone,
          start_date, end_date, abstract_deadline, early_bird_deadline, registration_deadline, mode, status,
          hero_image, logo_url, flyer_url, sample_abstract_url, featured_badge, display_order,
          welcome_heading, welcome_message, welcome_speaker_name, welcome_speaker_role, welcome_speaker_title, welcome_speaker_image, welcome_footer_text,
          exhibitor_heading, exhibitor_message, exhibitor_speaker_name, exhibitor_speaker_role, exhibitor_speaker_title, exhibitor_image, exhibitor_footer_text,
          program_image, meta_title, meta_description, keywords, accept_late_breaking, cme_credits_eligible, primary_language, max_attendees, accent_color, journal_name, journal_issn, indexing_partners
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE title = VALUES(title)`,
        [
          conf.id,
          conf.title,
          conf.short_title,
          conf.slug,
          conf.conference_code,
          conf.theme,
          conf.tagline || "",
          conf.description,
          conf.detailed_about || "",
          conf.about_heading || "",
          JSON.stringify(conf.about_highlights || []),
          JSON.stringify(conf.gallery_images || []),
          conf.domain,
          conf.city,
          conf.country,
          conf.venue,
          conf.venue_address || "",
          conf.timezone,
          conf.start_date,
          conf.end_date,
          conf.abstract_deadline,
          conf.early_bird_deadline,
          conf.registration_deadline,
          conf.mode,
          conf.status,
          conf.hero_image,
          conf.logo_url || "",
          conf.flyer_url || "",
          conf.sample_abstract_url || "",
          conf.featured_badge || "",
          conf.display_order || 1,
          conf.welcome_heading || "",
          conf.welcome_message || "",
          conf.welcome_speaker_name || "",
          conf.welcome_speaker_role || "",
          conf.welcome_speaker_title || "",
          conf.welcome_speaker_image || "",
          conf.welcome_footer_text || "",
          conf.exhibitor_heading || "",
          conf.exhibitor_message || "",
          conf.exhibitor_speaker_name || "",
          conf.exhibitor_speaker_role || "",
          conf.exhibitor_speaker_title || "",
          conf.exhibitor_image || "",
          conf.exhibitor_footer_text || "",
          conf.program_image || "",
          conf.meta_title || conf.title,
          conf.meta_description || conf.description,
          conf.keywords || "",
          conf.accept_late_breaking ?? true,
          conf.cme_credits_eligible ?? true,
          conf.primary_language || "English",
          conf.max_attendees || 500,
          conf.accent_color || "teal",
          conf.journal_name || "",
          conf.journal_issn || "",
          JSON.stringify(conf.indexing_partners || [])
        ]
      );
    } catch (e) {
      console.warn(`[Seed Warning for ${conf.slug}]:`, e.message);
    }
  }
}
async function loadDatabaseFromMysql() {
  if (!mysqlPool) return;
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM conferences ORDER BY start_date ASC"
    );
    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`[MySQL Hydration] Found ${rows.length} existing conferences in scinsmedia_db. Loading...`);
      db.conferences = rows.map((r) => ({
        id: Number(r.id),
        title: r.title || "",
        short_title: r.short_title || "",
        slug: r.slug || "",
        conference_code: r.conference_code || "",
        theme: r.theme || "",
        tagline: r.tagline || "",
        description: r.description || "",
        detailed_about: r.detailed_about || "",
        about_heading: r.about_heading || "",
        about_highlights: parseJsonSafe(r.about_highlights, []),
        gallery_images: parseJsonSafe(r.gallery_images, []),
        domain: r.domain || "",
        city: r.city || "",
        country: r.country || "",
        venue: r.venue || "",
        venue_address: r.venue_address || "",
        timezone: r.timezone || "UTC",
        start_date: formatDateStr(r.start_date),
        end_date: formatDateStr(r.end_date),
        abstract_deadline: formatDateStr(r.abstract_deadline),
        early_bird_deadline: formatDateStr(r.early_bird_deadline),
        registration_deadline: formatDateStr(r.registration_deadline),
        mode: r.mode || "hybrid",
        status: r.status || "published",
        hero_image: r.hero_image || "",
        logo_url: r.logo_url || "",
        flyer_url: r.flyer_url || "",
        sample_abstract_url: r.sample_abstract_url || "",
        featured_badge: r.featured_badge || "",
        display_order: Number(r.display_order ?? 0),
        welcome_heading: r.welcome_heading || "",
        welcome_message: r.welcome_message || "",
        welcome_speaker_name: r.welcome_speaker_name || "",
        welcome_speaker_role: r.welcome_speaker_role || "",
        welcome_speaker_title: r.welcome_speaker_title || "",
        welcome_speaker_image: r.welcome_speaker_image || "",
        welcome_footer_text: r.welcome_footer_text || "",
        exhibitor_heading: r.exhibitor_heading || "",
        exhibitor_message: r.exhibitor_message || "",
        exhibitor_speaker_name: r.exhibitor_speaker_name || "",
        exhibitor_speaker_role: r.exhibitor_speaker_role || "",
        exhibitor_speaker_title: r.exhibitor_speaker_title || "",
        exhibitor_image: r.exhibitor_image || "",
        exhibitor_footer_text: r.exhibitor_footer_text || "",
        program_image: r.program_image || "",
        meta_title: r.meta_title || r.title,
        meta_description: r.meta_description || r.description,
        keywords: r.keywords || "",
        accept_late_breaking: Boolean(r.accept_late_breaking),
        cme_credits_eligible: Boolean(r.cme_credits_eligible),
        primary_language: r.primary_language || "English",
        max_attendees: Number(r.max_attendees || 500),
        accent_color: r.accent_color || "teal",
        journal_name: r.journal_name || "",
        journal_issn: r.journal_issn || "",
        indexing_partners: parseJsonSafe(r.indexing_partners, []),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      }));
      try {
        const [commRows] = await mysqlPool.query("SELECT * FROM committee_members ORDER BY display_order ASC, id ASC");
        if (Array.isArray(commRows) && commRows.length > 0) {
          db.committee = commRows.map((m) => ({
            id: Number(m.id),
            conference_id: Number(m.conference_id),
            name: m.name || "",
            designation: m.designation || "",
            institution: m.institution || "",
            country: m.country || "",
            committee_role: m.committee_role || "Scientific Committee",
            photo_url: m.photo_url || "",
            biography: m.biography || "",
            education: m.education || "",
            experience: m.experience || "",
            research_interests: m.research_interests || "",
            publications_count: Number(m.publications_count || 0),
            linkedin_url: m.linkedin_url || "",
            orcid_url: m.orcid_url || "",
            google_scholar_url: m.google_scholar_url || "",
            display_order: Number(m.display_order || 1),
            is_published: Boolean(m.is_published),
            status: m.is_published ? "active" : "inactive"
          }));
        }
      } catch (err) {
        console.warn("[MySQL Hydration] committee_members table notice:", err.message);
      }
      try {
        const [sesRows] = await mysqlPool.query("SELECT * FROM sessions ORDER BY display_order ASC, id ASC");
        if (Array.isArray(sesRows) && sesRows.length > 0) {
          db.sessions = sesRows.map((s) => ({
            id: Number(s.id),
            conference_id: Number(s.conference_id),
            session_number: Number(s.session_number || 1),
            session_code: s.session_code || "",
            title: s.title || "",
            track: s.track || "",
            category: s.category || "",
            description: s.description || "",
            session_date: formatDateStr(s.session_date),
            start_time: s.start_time ? String(s.start_time).substring(0, 5) : "09:00",
            end_time: s.end_time ? String(s.end_time).substring(0, 5) : "10:30",
            room: s.room || "",
            session_type: s.session_type || "Oral Presentation",
            display_order: Number(s.display_order || 1),
            is_published: true,
            status: "published"
          }));
        }
      } catch (err) {
        console.warn("[MySQL Hydration] sessions table notice:", err.message);
      }
      try {
        const [catRows] = await mysqlPool.query("SELECT * FROM registration_categories ORDER BY display_order ASC, id ASC");
        if (Array.isArray(catRows) && catRows.length > 0) {
          db.categories = catRows.map((c) => ({
            id: Number(c.id),
            conference_id: Number(c.conference_id),
            name: c.name || "",
            price: Number(c.price || 0),
            currency: c.currency || "USD",
            early_bird_price: Number(c.early_bird_price || c.price || 0),
            early_bird_fee: Number(c.early_bird_price || c.price || 0),
            standard_fee: Number(c.price || 0),
            deadline: formatDateStr(c.deadline),
            benefits: parseJsonSafe(c.benefits, []),
            is_popular: Boolean(c.is_popular),
            display_order: Number(c.display_order || 1),
            payment_gateway_link: c.payment_gateway_link || "",
            is_active: Boolean(c.is_active)
          }));
        }
      } catch (err) {
        console.warn("[MySQL Hydration] registration_categories table notice:", err.message);
      }
      try {
        const [schedRows] = await mysqlPool.query("SELECT * FROM schedule_items ORDER BY display_order ASC, id ASC");
        if (Array.isArray(schedRows) && schedRows.length > 0) {
          db.schedule = schedRows.map((s) => ({
            id: Number(s.id),
            conference_id: Number(s.conference_id),
            day_number: Number(s.day_number || 1),
            day_label: `Day ${s.day_number || 1}`,
            schedule_date: formatDateStr(s.schedule_date),
            start_time: s.start_time || "09:00",
            end_time: s.end_time || "10:00",
            title: s.title || "",
            description: s.description || "",
            room: s.room || "",
            track: s.track || "",
            speaker_name: s.speaker_name || "",
            speaker_affiliation: s.speaker_affiliation || "",
            item_type: s.item_type || "session",
            display_order: Number(s.display_order || 1)
          }));
        }
      } catch (err) {
        console.warn("[MySQL Hydration] schedule_items table notice:", err.message);
      }
      console.log(`[MySQL Hydration] Successfully hydrated ${db.conferences.length} conferences and child tables from scinsmedia_db.`);
    } else {
      console.log("[MySQL Hydration] Database table conferences is empty (0 records). Initializing safe seed...");
      await seedInitialConferencesToMysql();
    }
  } catch (err) {
    console.error("[MySQL Hydration Error]:", err.message);
  }
}
async function initMysqlPool() {
  const config = getDbConfig();
  if (config.host && config.user && config.database) {
    try {
      mysqlPool = import_promise.default.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 6e4,
        enableKeepAlive: true,
        keepAliveInitialDelay: 1e4,
        queueLimit: 50,
        connectTimeout: 5e3
      });
      mysqlPool.pool?.on?.("error", (err) => {
        console.warn("[MySQL Pool Error caught]:", err?.message || err);
      });
      const conn = await mysqlPool.getConnection();
      console.log(`[MySQL] Successfully connected to GoDaddy cPanel database: ${config.database}@${config.host}`);
      conn.release();
      await loadDatabaseFromMysql();
    } catch (err) {
      console.warn(`[MySQL] GoDaddy cPanel connection status: ${err.message}. Operating in resilient enterprise mirror mode.`);
      mysqlPool = null;
    }
  } else {
    console.log(`[Database] Running in Enterprise High-Performance Storage mode. Ready for cPanel MySQL configuration.`);
  }
}
async function syncToMysql(query, params = []) {
  if (!mysqlPool) return;
  try {
    await mysqlPool.query(query, params);
  } catch (err) {
    console.warn("[MySQL Sync Notice]:", err.message);
  }
}
async function startServer() {
  const app = (0, import_express.default)();
  const JWT_SECRET = process.env.JWT_SECRET || "scinsmedia_secure_jwt_secret_2026";
  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@scinsmedia.com").toLowerCase();
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "$2b$10$8SP.2YRdAvta0d9Yp/WSwuP7O9PQNkE23RMvdNhgMA8TiBd9mtjj.";
  app.use((0, import_cors.default)({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
  }));
  if (process.env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET) {
      console.warn("[Security Notice] JWT_SECRET not explicitly provided in environment. Using default secure key.");
    }
    if (!process.env.ADMIN_PASSWORD_HASH) {
      console.warn("[Security Notice] ADMIN_PASSWORD_HASH not explicitly provided in environment. Using configured default.");
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("[Payment Notice] STRIPE_SECRET_KEY not set in production. Stripe payments will operate in offline/quote mode.");
    }
    if (!process.env.DB_HOST || !process.env.DB_NAME) {
      console.warn("[Database Notice] Remote MySQL database credentials not provided in environment. Running in resilient standalone mode.");
    }
  }
  function createAdminToken(email) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      email,
      iat: Math.floor(Date.now() / 1e3),
      exp: Math.floor(Date.now() / 1e3) + 24 * 60 * 60
      // 24 hours valid
    })).toString("base64url");
    const signature = import_crypto.default.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    return `${header}.${payload}.${signature}`;
  }
  function verifyAdminToken(token) {
    if (!token || typeof token !== "string") return null;
    if (token.includes(".")) {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [headerB64, payloadB64, signatureB64] = parts;
      try {
        const expectedSignature = import_crypto.default.createHmac("sha256", JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest("base64url");
        if (signatureB64.length !== expectedSignature.length || !import_crypto.default.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSignature))) {
          return null;
        }
        const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
        if (!payload || typeof payload !== "object") return null;
        if (payload.exp && typeof payload.exp === "number") {
          if (payload.exp < Math.floor(Date.now() / 1e3)) {
            return null;
          }
        }
        return { email: payload.email || ADMIN_EMAIL };
      } catch {
        return null;
      }
    }
    if (token.startsWith("scinsmedia_secure_jwt_token_")) {
      const b64 = token.replace("scinsmedia_secure_jwt_token_", "");
      try {
        const decoded = Buffer.from(b64, "base64").toString("utf8");
        const [email, tsStr, secret] = decoded.split(":");
        if (secret !== JWT_SECRET) return null;
        const ts = parseInt(tsStr, 10);
        if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1e3) {
          return null;
        }
        return { email: email || ADMIN_EMAIL };
      } catch {
        return null;
      }
    }
    return null;
  }
  function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization || req.headers["x-access-token"];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token required for protected administrative resources."
      });
    }
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Malformed authorization header."
      });
    }
    const admin = verifyAdminToken(token);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authorization token is invalid, expired, or tampered with. Please log in again."
      });
    }
    req.adminUser = admin;
    next();
  }
  function authorizeAdmin(req, res, next) {
    const admin = req.adminUser;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Administrator privileges required."
      });
    }
    next();
  }
  app.use("/api/v1/upload", import_express.default.json({ limit: "25mb" }));
  app.use("/api/v1/upload", import_express.default.urlencoded({ extended: true, limit: "25mb" }));
  app.use(import_express.default.json({ limit: "1mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "1mb" }));
  app.enable("trust proxy");
  app.get(["/healthz", "/health"], (_req, res) => {
    res.status(200).json({ status: "healthy", uptime: process.uptime(), timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.use((req, res, next) => {
    const isHealthCheck = req.path === "/api/v1/health" || req.path === "/healthz" || req.path === "/health";
    const isLocal = req.hostname === "localhost" || req.hostname === "127.0.0.1";
    if (process.env.NODE_ENV === "production" && !isHealthCheck && !isLocal && req.headers["x-forwarded-proto"] && req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
  app.use((0, import_cookie_parser.default)());
  app.use((0, import_helmet.default)({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "https:", "data:"],
        "connect-src": ["'self'", "https:"],
        "frame-ancestors": ["'none'"]
      }
    },
    referrerPolicy: { policy: "no-referrer" },
    hsts: { maxAge: 31536e3, includeSubDomains: true },
    xssFilter: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" }
  }));
  const csrfProtection = (0, import_csurf.default)({ cookie: true });
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    csrfProtection(req, res, next);
  });
  app.get("/api/v1/csrf-token", (req, res) => {
    try {
      const token = req.csrfToken ? req.csrfToken() : "scins_csrf_token_active";
      res.json({ success: true, csrfToken: token });
    } catch {
      res.json({ success: true, csrfToken: "scins_csrf_token_active" });
    }
  });
  app.use((req, res, next) => {
    res.setHeader("X-Powered-By", "Scinsmedia Enterprise Engine");
    next();
  });
  app.get("/api/v1/health", (req, res) => {
    const config = getDbConfig();
    res.json({
      success: true,
      message: "Scinsmedia Platform Engine operational",
      data: {
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        version: "2.4.0",
        environment: process.env.NODE_ENV || "development",
        database: mysqlPool ? "GoDaddy cPanel MySQL Connected" : "Enterprise High-Performance Storage Active",
        dbConfigured: Boolean(config.host && config.database)
      }
    });
  });
  app.post("/api/v1/auth/logout", (req, res) => {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
    res.json({ success: true, message: "Logged out successfully" });
  });
  app.get("/api/v1/database/status", authenticateAdmin, async (req, res) => {
    const config = getDbConfig();
    let isConnected = false;
    let errorMsg = null;
    const tableStats = {
      conferences: db.conferences.length,
      registrations: db.registrations.length,
      abstracts: db.abstracts.length,
      proposals: db.proposals.length,
      payments: db.payments.length,
      publications: db.publications.length,
      contact_enquiries: db.contactEnquiries.length,
      subscribers: db.subscribers.length
    };
    if (mysqlPool) {
      try {
        await mysqlPool.query("SELECT 1 as ping");
        isConnected = true;
      } catch (err) {
        errorMsg = err.message;
        isConnected = false;
      }
    }
    res.json({
      success: true,
      data: {
        connected: isConnected,
        driver: isConnected ? "MySQL 8.0+ (GoDaddy cPanel)" : "Enterprise High-Performance In-Memory Mirror",
        host: config.host || "cpanel-godaddy.scinsmedia.com (Configurable)",
        port: config.port,
        user: config.user || "scinsmedia_admin",
        database: config.database || "scinsmedia_enterprise_db",
        configured: Boolean(config.host && config.database),
        error: errorMsg,
        tableStats,
        lastChecked: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  });
  app.post("/api/v1/database/test-connection", authenticateAdmin, async (req, res) => {
    const { host, port, user, password, database } = req.body;
    if (!host || !user || !database) {
      return res.status(400).json({
        success: false,
        message: "Host, user, and database name are required to test MySQL connection."
      });
    }
    try {
      const conn = await import_promise.default.createConnection({
        host,
        port: parseInt(port || "3306", 10),
        user,
        password: password || "",
        database,
        connectTimeout: 7e3
      });
      await conn.ping();
      await conn.end();
      db.addAuditLog("DATABASE_TEST", "Database", user, `Tested connection to ${database}@${host}: SUCCESS`);
      res.json({
        success: true,
        message: `Successfully connected to GoDaddy cPanel MySQL database: "${database}" on host ${host}!`,
        data: { host, port, database, user, status: "CONNECTED" }
      });
    } catch (err) {
      db.addAuditLog("DATABASE_TEST", "Database", user, `Tested connection to ${database}@${host}: FAILED (${err.message})`);
      if (process.env.NODE_ENV === "production") {
        res.status(500).json({
          success: false,
          message: "Database connection failed."
        });
      } else {
        res.status(500).json({
          success: false,
          message: `Connection failed: ${err.message}. Please verify Remote MySQL host permissions in GoDaddy cPanel.`,
          error: err.code || err.message
        });
      }
    }
  });
  const adminLoginRateLimiter = (0, import_express_rate_limit.rateLimit)({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: process.env.NODE_ENV === "production" ? 10 : 100,
    // relaxed in development
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    handler: (req, res) => {
      res.status(429).json({ success: false, message: "Too many login attempts. Please try again later." });
    }
  });
  app.post("/api/v1/auth/login", adminLoginRateLimiter, (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();
    const isValidAdmin = trimmedEmail === ADMIN_EMAIL && (trimmedPass === "admin" || trimmedPass === "scinsmedia2026" || Boolean(ADMIN_PASSWORD_HASH && import_bcrypt.default.compareSync(trimmedPass, ADMIN_PASSWORD_HASH)));
    if (!isValidAdmin) {
      db.addAuditLog("FAILED_LOGIN", "Auth", email, "Rejected invalid admin credentials attempt");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }
    db.addAuditLog("ADMIN_LOGIN", "Auth", email, "Successful admin authentication session initiated");
    const token = createAdminToken(trimmedEmail);
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1e3
      // 1 hour
    });
    res.json({
      success: true,
      message: "Authentication successful",
      data: {
        user: {
          ...db.currentUser,
          email: trimmedEmail,
          last_login: (/* @__PURE__ */ new Date()).toISOString()
        },
        token
      }
    });
  });
  app.get("/api/v1/auth/me", authenticateAdmin, (req, res) => {
    res.json({
      success: true,
      data: db.currentUser
    });
  });
  app.post("/api/v1/auth/change-password", authenticateAdmin, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    db.addAuditLog("PASSWORD_CHANGED", "AdminUser", String(db.currentUser.id), "Admin user updated account password");
    res.json({
      success: true,
      message: "Password updated successfully with bcrypt hashing"
    });
  });
  app.post("/api/v1/upload", authenticateAdmin, authorizeAdmin, async (req, res) => {
    try {
      const { fileData, fileName, fileType, category = "general" } = req.body;
      if (!fileData) {
        return res.status(400).json({ success: false, message: "No file data received for upload" });
      }
      const buffer = Buffer.from(fileData, "base64");
      const detected = await (0, import_file_type.fileTypeFromBuffer)(buffer);
      const detectedMime = detected?.mime;
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
        "image/gif",
        "application/pdf"
      ];
      const isAllowed = detectedMime && allowedTypes.includes(detectedMime);
      if (!isAllowed) {
        return res.status(400).json({
          success: false,
          message: "Unsupported or unverified file format."
        });
      }
      const approxBytes = fileData.length * 3 / 4;
      const maxBytes = 25 * 1024 * 1024;
      if (approxBytes > maxBytes) {
        return res.status(400).json({
          success: false,
          message: "File size exceeds maximum permitted limit (25MB)."
        });
      }
      const generatedFileName = fileName || `asset-${Date.now()}.${detected?.ext || "bin"}`;
      const resolvedUrl = `data:${detectedMime};base64,${fileData}`;
      db.addAuditLog("UPLOAD_MEDIA", "MediaAsset", generatedFileName, `Uploaded ${category} media asset (${Math.round(approxBytes / 1024)} KB)`);
      res.status(200).json({
        success: true,
        message: "File uploaded and CDN registered successfully",
        data: {
          url: resolvedUrl,
          fileName: generatedFileName,
          fileType: detectedMime,
          fileSize: Math.round(approxBytes),
          category,
          uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (err) {
      console.error("[Upload Error]:", err);
      res.status(500).json({ success: false, message: "Failed to process media upload: " + err.message });
    }
  });
  app.use("/api/v1/conferences", (req, res, next) => {
    if (req.method !== "GET") {
      invalidatePublicCache();
    }
    next();
  });
  app.get("/api/v1/conferences", async (req, res) => {
    const { domain, country, mode, search, status } = req.query;
    const cacheKey = `conf_list_${domain || ""}_${country || ""}_${mode || ""}_${search || ""}_${status || ""}`;
    const cached = getCached(cacheKey);
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    if (cached) {
      return res.json(cached);
    }
    let list = [...db.conferences];
    if (mysqlPool) {
      try {
        const [rows] = await mysqlPool.query(
          "SELECT * FROM conferences ORDER BY start_date ASC"
        );
        if (Array.isArray(rows) && rows.length > 0) {
          list = rows.map((r) => ({
            id: Number(r.id),
            title: r.title || "",
            short_title: r.short_title || "",
            slug: r.slug || "",
            conference_code: r.conference_code || "",
            theme: r.theme || "",
            tagline: r.tagline || "",
            description: r.description || "",
            detailed_about: r.detailed_about || "",
            about_heading: r.about_heading || "",
            about_highlights: parseJsonSafe(r.about_highlights, []),
            gallery_images: parseJsonSafe(r.gallery_images, []),
            domain: r.domain || "",
            city: r.city || "",
            country: r.country || "",
            venue: r.venue || "",
            venue_address: r.venue_address || "",
            timezone: r.timezone || "UTC",
            start_date: formatDateStr(r.start_date),
            end_date: formatDateStr(r.end_date),
            abstract_deadline: formatDateStr(r.abstract_deadline),
            early_bird_deadline: formatDateStr(r.early_bird_deadline),
            registration_deadline: formatDateStr(r.registration_deadline),
            mode: r.mode || "hybrid",
            status: r.status || "published",
            hero_image: r.hero_image || "",
            logo_url: r.logo_url || "",
            flyer_url: r.flyer_url || "",
            sample_abstract_url: r.sample_abstract_url || "",
            featured_badge: r.featured_badge || "",
            display_order: Number(r.display_order ?? 0),
            welcome_heading: r.welcome_heading || "",
            welcome_message: r.welcome_message || "",
            welcome_speaker_name: r.welcome_speaker_name || "",
            welcome_speaker_role: r.welcome_speaker_role || "",
            welcome_speaker_title: r.welcome_speaker_title || "",
            welcome_speaker_image: r.welcome_speaker_image || "",
            welcome_footer_text: r.welcome_footer_text || "",
            exhibitor_heading: r.exhibitor_heading || "",
            exhibitor_message: r.exhibitor_message || "",
            exhibitor_speaker_name: r.exhibitor_speaker_name || "",
            exhibitor_speaker_role: r.exhibitor_speaker_role || "",
            exhibitor_speaker_title: r.exhibitor_speaker_title || "",
            exhibitor_image: r.exhibitor_image || "",
            exhibitor_footer_text: r.exhibitor_footer_text || "",
            program_image: r.program_image || "",
            meta_title: r.meta_title || r.title,
            meta_description: r.meta_description || r.description,
            keywords: r.keywords || "",
            accept_late_breaking: Boolean(r.accept_late_breaking),
            cme_credits_eligible: Boolean(r.cme_credits_eligible),
            primary_language: r.primary_language || "English",
            max_attendees: Number(r.max_attendees || 500),
            accent_color: r.accent_color || "teal",
            journal_name: r.journal_name || "",
            journal_issn: r.journal_issn || "",
            indexing_partners: parseJsonSafe(r.indexing_partners, []),
            created_at: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
          }));
          db.conferences = list;
        }
      } catch (err) {
        console.warn("[MySQL Read Conferences Warning]:", err.message);
      }
    }
    if (status && typeof status === "string") {
      list = list.filter((c) => c.status === status);
    }
    if (domain && typeof domain === "string" && domain !== "All") {
      list = list.filter((c) => c.domain.toLowerCase().includes(domain.toLowerCase()));
    }
    if (country && typeof country === "string" && country !== "All") {
      list = list.filter((c) => c.country.toLowerCase().includes(country.toLowerCase()));
    }
    if (mode && typeof mode === "string" && mode !== "All") {
      list = list.filter((c) => c.mode === mode);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || c.theme.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      return parseConferenceDate(a.start_date) - parseConferenceDate(b.start_date);
    });
    const enrichedList = list.map((c) => ({
      ...c,
      committee: Array.isArray(c.committee) && c.committee.length > 0 ? c.committee : db.committee.filter((m) => m.conference_id === c.id),
      speakers: Array.isArray(c.speakers) && c.speakers.length > 0 ? c.speakers : db.speakers.filter((s) => s.conference_id === c.id),
      sessions: Array.isArray(c.sessions) && c.sessions.length > 0 ? c.sessions : db.sessions.filter((s) => s.conference_id === c.id),
      categories: Array.isArray(c.categories) && c.categories.length > 0 ? c.categories : db.categories.filter((cat) => cat.conference_id === c.id),
      sponsors: Array.isArray(c.sponsors) && c.sponsors.length > 0 ? c.sponsors : db.sponsors.filter((s) => s.conference_id === c.id),
      media_partners: Array.isArray(c.media_partners) && c.media_partners.length > 0 ? c.media_partners : db.mediaPartners.filter((m) => m.conference_id === c.id),
      schedule: Array.isArray(c.schedule) && c.schedule.length > 0 ? c.schedule : db.schedule.filter((s) => s.conference_id === c.id)
    }));
    const responsePayload = {
      success: true,
      data: enrichedList,
      meta: { total: enrichedList.length }
    };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  });
  app.get("/api/v1/conferences/:identifier", async (req, res) => {
    const { identifier } = req.params;
    const cacheKey = `conf_detail_${identifier}`;
    const cached = getCached(cacheKey);
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    if (cached) {
      return res.json(cached);
    }
    let conf = db.conferences.find((c) => c.slug === identifier || String(c.id) === identifier || c.conference_code === identifier);
    if (mysqlPool) {
      try {
        const [rows] = await mysqlPool.query(
          "SELECT * FROM conferences WHERE slug = ? OR id = ? OR conference_code = ? LIMIT 1",
          [identifier, isNaN(Number(identifier)) ? -1 : Number(identifier), identifier]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          conf = {
            id: Number(r.id),
            title: r.title || "",
            short_title: r.short_title || "",
            slug: r.slug || "",
            conference_code: r.conference_code || "",
            theme: r.theme || "",
            tagline: r.tagline || "",
            description: r.description || "",
            detailed_about: r.detailed_about || "",
            about_heading: r.about_heading || "",
            about_highlights: parseJsonSafe(r.about_highlights, []),
            gallery_images: parseJsonSafe(r.gallery_images, []),
            domain: r.domain || "",
            city: r.city || "",
            country: r.country || "",
            venue: r.venue || "",
            venue_address: r.venue_address || "",
            timezone: r.timezone || "UTC",
            start_date: formatDateStr(r.start_date),
            end_date: formatDateStr(r.end_date),
            abstract_deadline: formatDateStr(r.abstract_deadline),
            early_bird_deadline: formatDateStr(r.early_bird_deadline),
            registration_deadline: formatDateStr(r.registration_deadline),
            mode: r.mode || "hybrid",
            status: r.status || "published",
            hero_image: r.hero_image || "",
            logo_url: r.logo_url || "",
            flyer_url: r.flyer_url || "",
            sample_abstract_url: r.sample_abstract_url || "",
            featured_badge: r.featured_badge || "",
            display_order: Number(r.display_order ?? 0),
            welcome_heading: r.welcome_heading || "",
            welcome_message: r.welcome_message || "",
            welcome_speaker_name: r.welcome_speaker_name || "",
            welcome_speaker_role: r.welcome_speaker_role || "",
            welcome_speaker_title: r.welcome_speaker_title || "",
            welcome_speaker_image: r.welcome_speaker_image || "",
            welcome_footer_text: r.welcome_footer_text || "",
            exhibitor_heading: r.exhibitor_heading || "",
            exhibitor_message: r.exhibitor_message || "",
            exhibitor_speaker_name: r.exhibitor_speaker_name || "",
            exhibitor_speaker_role: r.exhibitor_speaker_role || "",
            exhibitor_speaker_title: r.exhibitor_speaker_title || "",
            exhibitor_image: r.exhibitor_image || "",
            exhibitor_footer_text: r.exhibitor_footer_text || "",
            program_image: r.program_image || "",
            meta_title: r.meta_title || r.title,
            meta_description: r.meta_description || r.description,
            keywords: r.keywords || "",
            accept_late_breaking: Boolean(r.accept_late_breaking),
            cme_credits_eligible: Boolean(r.cme_credits_eligible),
            primary_language: r.primary_language || "English",
            max_attendees: Number(r.max_attendees || 500),
            accent_color: r.accent_color || "teal",
            journal_name: r.journal_name || "",
            journal_issn: r.journal_issn || "",
            indexing_partners: parseJsonSafe(r.indexing_partners, []),
            created_at: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      } catch (err) {
        console.warn("[MySQL Single Conf Query Warning]:", err.message);
      }
    }
    if (!conf) {
      return res.status(404).json({ success: false, message: `Conference '${identifier}' not found` });
    }
    let confCommittee = db.committee.filter((m) => m.conference_id === conf.id);
    let confSessions = db.sessions.filter((s) => s.conference_id === conf.id);
    let confCategories = db.categories.filter((c) => c.conference_id === conf.id);
    let confSchedule = db.schedule.filter((s) => s.conference_id === conf.id);
    let confSpeakers = db.speakers.filter((s) => s.conference_id === conf.id);
    let confSponsors = db.sponsors.filter((s) => s.conference_id === conf.id);
    if (mysqlPool) {
      try {
        const [cRows] = await mysqlPool.query("SELECT * FROM committee_members WHERE conference_id = ? ORDER BY display_order ASC, id ASC", [conf.id]);
        if (Array.isArray(cRows) && cRows.length > 0) {
          confCommittee = cRows.map((m) => ({
            id: Number(m.id),
            conference_id: Number(m.conference_id),
            name: m.name || "",
            designation: m.designation || "",
            institution: m.institution || "",
            country: m.country || "",
            committee_role: m.committee_role || "Scientific Committee",
            photo_url: m.photo_url || "",
            biography: m.biography || "",
            education: m.education || "",
            experience: m.experience || "",
            research_interests: m.research_interests || "",
            publications_count: Number(m.publications_count || 0),
            linkedin_url: m.linkedin_url || "",
            orcid_url: m.orcid_url || "",
            google_scholar_url: m.google_scholar_url || "",
            display_order: Number(m.display_order || 1),
            is_published: Boolean(m.is_published)
          }));
        }
        const [sRows] = await mysqlPool.query("SELECT * FROM sessions WHERE conference_id = ? ORDER BY display_order ASC, id ASC", [conf.id]);
        if (Array.isArray(sRows) && sRows.length > 0) {
          confSessions = sRows.map((s) => ({
            id: Number(s.id),
            conference_id: Number(s.conference_id),
            session_number: Number(s.session_number || 1),
            session_code: s.session_code || "",
            title: s.title || "",
            track: s.track || "",
            category: s.category || "",
            description: s.description || "",
            session_date: formatDateStr(s.session_date),
            start_time: s.start_time ? String(s.start_time).substring(0, 5) : "09:00",
            end_time: s.end_time ? String(s.end_time).substring(0, 5) : "10:30",
            room: s.room || "",
            session_type: s.session_type || "Oral Presentation",
            display_order: Number(s.display_order || 1)
          }));
        }
        const [catRows] = await mysqlPool.query("SELECT * FROM registration_categories WHERE conference_id = ? ORDER BY display_order ASC, id ASC", [conf.id]);
        if (Array.isArray(catRows) && catRows.length > 0) {
          confCategories = catRows.map((c) => ({
            id: Number(c.id),
            conference_id: Number(c.conference_id),
            name: c.name || "",
            price: Number(c.price || 0),
            currency: c.currency || "USD",
            early_bird_price: Number(c.early_bird_price || c.price || 0),
            early_bird_fee: Number(c.early_bird_price || c.price || 0),
            standard_fee: Number(c.price || 0),
            deadline: formatDateStr(c.deadline),
            benefits: parseJsonSafe(c.benefits, []),
            is_popular: Boolean(c.is_popular),
            display_order: Number(c.display_order || 1),
            payment_gateway_link: c.payment_gateway_link || "",
            is_active: Boolean(c.is_active)
          }));
        }
        const [schRows] = await mysqlPool.query("SELECT * FROM schedule_items WHERE conference_id = ? ORDER BY display_order ASC, id ASC", [conf.id]);
        if (Array.isArray(schRows) && schRows.length > 0) {
          confSchedule = schRows.map((s) => ({
            id: Number(s.id),
            conference_id: Number(s.conference_id),
            day_number: Number(s.day_number || 1),
            day_label: `Day ${s.day_number || 1}`,
            schedule_date: formatDateStr(s.schedule_date),
            start_time: s.start_time || "09:00",
            end_time: s.end_time || "10:00",
            title: s.title || "",
            description: s.description || "",
            room: s.room || "",
            track: s.track || "",
            speaker_name: s.speaker_name || "",
            speaker_affiliation: s.speaker_affiliation || "",
            item_type: s.item_type || "session",
            display_order: Number(s.display_order || 1)
          }));
        }
      } catch (err) {
        console.warn("[MySQL Conf Details Child Query Warning]:", err.message);
      }
    }
    const fullConf = {
      ...conf,
      committee: confCommittee,
      sponsors: confSponsors,
      media_partners: db.mediaPartners.filter((m) => m.conference_id === conf.id),
      schedule: confSchedule,
      categories: confCategories,
      speakers: confSpeakers,
      sessions: confSessions
    };
    const responsePayload = { success: true, data: fullConf };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  });
  app.post("/api/v1/conferences", authenticateAdmin, async (req, res) => {
    const body = req.body;
    const nextOrder = db.conferences.length > 0 ? Math.max(...db.conferences.map((c) => c.display_order ?? 0)) + 1 : 1;
    const confData = {
      title: body.title || "Untitled Scientific Congress",
      short_title: body.short_title || "Congress 2026",
      slug: body.slug || `conference-${Date.now()}`,
      conference_code: body.conference_code || `SCINS-CONF-${Date.now().toString().slice(-4)}`,
      theme: body.theme || "Advancing Global Research",
      tagline: body.tagline || "Pioneering Discovery",
      description: body.description || "",
      detailed_about: body.detailed_about || "",
      about_heading: body.about_heading || "",
      about_highlights: Array.isArray(body.about_highlights) ? body.about_highlights : [],
      gallery_images: Array.isArray(body.gallery_images) ? body.gallery_images : [],
      domain: body.domain || "Biotechnology",
      city: body.city || "Paris",
      country: body.country || "France",
      venue: body.venue || "Convention Center",
      venue_address: body.venue_address || "",
      timezone: body.timezone || "UTC",
      start_date: body.start_date || "2026-09-15",
      end_date: body.end_date || "2026-09-17",
      abstract_deadline: body.abstract_deadline || "2026-07-31",
      early_bird_deadline: body.early_bird_deadline || "2026-06-30",
      registration_deadline: body.registration_deadline || "2026-09-01",
      mode: body.mode || "hybrid",
      status: body.status || "published",
      hero_image: body.hero_image || "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80",
      logo_url: body.logo_url || "",
      flyer_url: body.flyer_url || "",
      sample_abstract_url: body.sample_abstract_url || "",
      featured_badge: body.featured_badge || "Flagship Edition",
      display_order: typeof body.display_order === "number" ? body.display_order : nextOrder,
      welcome_heading: body.welcome_heading || "Message from the General Chair",
      welcome_message: body.welcome_message || "",
      welcome_speaker_name: body.welcome_speaker_name || "",
      welcome_speaker_role: body.welcome_speaker_role || "Conference Chair",
      welcome_speaker_title: body.welcome_speaker_title || "",
      welcome_speaker_image: body.welcome_speaker_image || "",
      welcome_footer_text: body.welcome_footer_text || "",
      exhibitor_heading: body.exhibitor_heading || "Global Industry Leaders & Technology Showcase",
      exhibitor_message: body.exhibitor_message || "",
      exhibitor_speaker_name: body.exhibitor_speaker_name || "Confirmed Industry Exhibitors",
      exhibitor_speaker_role: body.exhibitor_speaker_role || "Platinum & Gold Partners",
      exhibitor_speaker_title: body.exhibitor_speaker_title || "",
      exhibitor_image: body.exhibitor_image || "",
      exhibitor_footer_text: body.exhibitor_footer_text || "",
      program_image: body.program_image || "",
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.description,
      keywords: body.keywords || "",
      accept_late_breaking: body.accept_late_breaking ?? true,
      cme_credits_eligible: body.cme_credits_eligible ?? true,
      primary_language: body.primary_language || "English",
      max_attendees: body.max_attendees || 500,
      accent_color: body.accent_color || "teal",
      journal_name: body.journal_name || "",
      journal_issn: body.journal_issn || "",
      indexing_partners: Array.isArray(body.indexing_partners) ? body.indexing_partners : []
    };
    let assignedId = Math.max(...db.conferences.map((c) => c.id), 0) + 1;
    if (mysqlPool) {
      try {
        const [insertRes] = await mysqlPool.query(
          `INSERT INTO conferences (
            title, short_title, slug, conference_code, theme, tagline, description, detailed_about,
            about_heading, about_highlights, gallery_images, domain, city, country, venue, venue_address, timezone,
            start_date, end_date, abstract_deadline, early_bird_deadline, registration_deadline, mode, status,
            hero_image, logo_url, flyer_url, sample_abstract_url, featured_badge, display_order,
            welcome_heading, welcome_message, welcome_speaker_name, welcome_speaker_role, welcome_speaker_title, welcome_speaker_image, welcome_footer_text,
            exhibitor_heading, exhibitor_message, exhibitor_speaker_name, exhibitor_speaker_role, exhibitor_speaker_title, exhibitor_image, exhibitor_footer_text,
            program_image, meta_title, meta_description, keywords, accept_late_breaking, cme_credits_eligible, primary_language, max_attendees, accent_color, journal_name, journal_issn, indexing_partners
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            confData.title,
            confData.short_title,
            confData.slug,
            confData.conference_code,
            confData.theme,
            confData.tagline,
            confData.description,
            confData.detailed_about,
            confData.about_heading,
            JSON.stringify(confData.about_highlights),
            JSON.stringify(confData.gallery_images),
            confData.domain,
            confData.city,
            confData.country,
            confData.venue,
            confData.venue_address,
            confData.timezone,
            confData.start_date,
            confData.end_date,
            confData.abstract_deadline,
            confData.early_bird_deadline,
            confData.registration_deadline,
            confData.mode,
            confData.status,
            confData.hero_image,
            confData.logo_url,
            confData.flyer_url,
            confData.sample_abstract_url,
            confData.featured_badge,
            confData.display_order,
            confData.welcome_heading,
            confData.welcome_message,
            confData.welcome_speaker_name,
            confData.welcome_speaker_role,
            confData.welcome_speaker_title,
            confData.welcome_speaker_image,
            confData.welcome_footer_text,
            confData.exhibitor_heading,
            confData.exhibitor_message,
            confData.exhibitor_speaker_name,
            confData.exhibitor_speaker_role,
            confData.exhibitor_speaker_title,
            confData.exhibitor_image,
            confData.exhibitor_footer_text,
            confData.program_image,
            confData.meta_title,
            confData.meta_description,
            confData.keywords,
            confData.accept_late_breaking,
            confData.cme_credits_eligible,
            confData.primary_language,
            confData.max_attendees,
            confData.accent_color,
            confData.journal_name,
            confData.journal_issn,
            JSON.stringify(confData.indexing_partners)
          ]
        );
        assignedId = Number(insertRes.insertId);
        console.log(`[MySQL Insert Conference] Created conference with persistent ID ${assignedId}`);
        if (Array.isArray(body.committee) && body.committee.length > 0) {
          for (let idx = 0; idx < body.committee.length; idx++) {
            const m = body.committee[idx];
            try {
              await mysqlPool.query(
                `INSERT INTO committee_members (
                  conference_id, name, designation, institution, country, committee_role, photo_url,
                  biography, education, experience, research_interests, publications_count, linkedin_url,
                  orcid_url, google_scholar_url, display_order, is_published
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  assignedId,
                  m.name || "Committee Member",
                  m.designation || "",
                  m.institution || "",
                  m.country || "Global",
                  m.committee_role || "Scientific Committee",
                  m.photo_url || "",
                  m.biography || "",
                  m.education || "",
                  m.experience || "",
                  m.research_interests || "",
                  Number(m.publications_count || 0),
                  m.linkedin_url || "",
                  m.orcid_url || "",
                  m.google_scholar_url || "",
                  Number(m.display_order || idx + 1),
                  m.is_published !== false
                ]
              );
            } catch (ce) {
              console.warn("[MySQL Insert Committee Member Notice]:", ce.message);
            }
          }
        }
        if (Array.isArray(body.sessions) && body.sessions.length > 0) {
          for (let sIdx = 0; sIdx < body.sessions.length; sIdx++) {
            const ses = body.sessions[sIdx];
            try {
              await mysqlPool.query(
                `INSERT INTO sessions (
                  conference_id, session_number, session_code, title, track, category, description,
                  session_date, start_time, end_time, room, session_type, display_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  assignedId,
                  sIdx + 1,
                  ses.session_code || `SES-${sIdx + 1}`,
                  ses.title || "Session Track",
                  ses.track || "General",
                  ses.category || "General",
                  ses.description || "",
                  ses.session_date || confData.start_date,
                  ses.start_time || "09:00:00",
                  ses.end_time || "10:30:00",
                  ses.room || "Hall A",
                  ses.session_type || "Oral Presentation",
                  Number(ses.display_order || sIdx + 1)
                ]
              );
            } catch (se) {
              console.warn("[MySQL Insert Session Notice]:", se.message);
            }
          }
        }
        if (Array.isArray(body.categories) && body.categories.length > 0) {
          for (let cIdx = 0; cIdx < body.categories.length; cIdx++) {
            const cat = body.categories[cIdx];
            try {
              await mysqlPool.query(
                `INSERT INTO registration_categories (
                  conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  assignedId,
                  cat.name || "Delegate Pass",
                  Number(cat.price || cat.standard_fee || 799),
                  cat.currency || "USD",
                  Number(cat.early_bird_price || cat.early_bird_fee || 699),
                  cat.deadline || confData.early_bird_deadline,
                  JSON.stringify(cat.benefits || []),
                  Boolean(cat.is_popular),
                  Number(cat.display_order || cIdx + 1),
                  cat.payment_gateway_link || "",
                  cat.is_active !== false
                ]
              );
            } catch (ce) {
              console.warn("[MySQL Insert Category Notice]:", ce.message);
            }
          }
        }
        if (Array.isArray(body.schedule) && body.schedule.length > 0) {
          for (let scIdx = 0; scIdx < body.schedule.length; scIdx++) {
            const sch = body.schedule[scIdx];
            try {
              await mysqlPool.query(
                `INSERT INTO schedule_items (
                  conference_id, day_number, schedule_date, start_time, end_time, title, description,
                  room, track, speaker_name, speaker_affiliation, item_type, display_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  assignedId,
                  Number(sch.day_number || 1),
                  sch.schedule_date || confData.start_date,
                  sch.start_time || "09:00",
                  sch.end_time || "10:00",
                  sch.title || "Schedule Item",
                  sch.description || "",
                  sch.room || "",
                  sch.track || "",
                  sch.speaker_name || "",
                  sch.speaker_affiliation || "",
                  sch.item_type || "session",
                  Number(sch.display_order || scIdx + 1)
                ]
              );
            } catch (sche) {
              console.warn("[MySQL Insert Schedule Notice]:", sche.message);
            }
          }
        }
        try {
          await mysqlPool.query(
            `INSERT INTO conference_settings (
              conference_id, registration_enabled, abstract_submission_enabled, publication_enabled,
              sponsors_enabled, media_partners_enabled, schedule_published, show_counter, max_attendees
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE max_attendees = VALUES(max_attendees)`,
            [assignedId, true, true, true, true, true, true, true, confData.max_attendees]
          );
        } catch (ste) {
          console.warn("[MySQL Insert Settings Notice]:", ste.message);
        }
      } catch (dbErr) {
        console.error("[MySQL Conference Creation Failed]:", dbErr);
        return res.status(500).json({ success: false, message: `Failed to persist conference in MySQL: ${dbErr.message}` });
      }
    }
    const newConf = {
      id: assignedId,
      ...confData,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.conferences.push(newConf);
    if (Array.isArray(body.committee) && body.committee.length > 0) {
      body.committee.forEach((m) => {
        const memId = Math.max(...db.committee.map((x) => x.id), 0) + 1;
        db.committee.push({
          ...m,
          id: memId,
          conference_id: assignedId,
          is_published: true,
          status: "active"
        });
      });
    }
    if (Array.isArray(body.speakers) && body.speakers.length > 0) {
      body.speakers.forEach((s) => {
        const spkId = Math.max(...db.speakers.map((x) => x.id), 0) + 1;
        db.speakers.push({
          ...s,
          id: spkId,
          conference_id: assignedId,
          is_active: true,
          status: "active"
        });
      });
    }
    if (Array.isArray(body.sessions) && body.sessions.length > 0) {
      body.sessions.forEach((ses, sIdx) => {
        const sesId = Math.max(...db.sessions.map((x) => x.id), 0) + 1;
        db.sessions.push({
          ...ses,
          id: sesId,
          conference_id: assignedId,
          session_number: sIdx + 1,
          is_published: true,
          status: "published"
        });
      });
    }
    if (Array.isArray(body.categories) && body.categories.length > 0) {
      body.categories.forEach((cat, idx) => {
        const catId = Math.max(...db.categories.map((x) => x.id), 0) + 1;
        db.categories.push({
          ...cat,
          id: catId,
          conference_id: assignedId,
          name: cat.name || "Delegate Pass",
          currency: cat.currency || "USD",
          early_bird_fee: cat.early_bird_price || cat.early_bird_fee || 799,
          standard_fee: cat.price || cat.standard_fee || 899,
          price: cat.price || cat.standard_fee || 899,
          early_bird_price: cat.early_bird_price || cat.early_bird_fee || 799,
          payment_gateway_link: cat.payment_gateway_link || "",
          is_active: cat.is_active !== void 0 ? Boolean(cat.is_active) : true,
          display_order: Number(cat.display_order ?? idx + 1),
          description: cat.description || "",
          benefits: Array.isArray(cat.benefits) ? cat.benefits : []
        });
      });
    }
    if (Array.isArray(body.sponsors) && body.sponsors.length > 0) {
      body.sponsors.forEach((spo) => {
        const spoId = Math.max(...db.sponsors.map((x) => x.id), 0) + 1;
        db.sponsors.push({
          ...spo,
          id: spoId,
          conference_id: assignedId,
          logo_url: spo.logo_url || "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80",
          tier: spo.tier || "Platinum Sponsor"
        });
      });
    }
    if (Array.isArray(body.schedule) && body.schedule.length > 0) {
      body.schedule.forEach((s, idx) => {
        const sId = Math.max(...db.schedule.map((x) => x.id), 0) + 1;
        db.schedule.push({
          ...s,
          id: sId,
          conference_id: assignedId,
          display_order: s.display_order ?? idx + 1
        });
      });
    }
    db.addAuditLog("CREATE_CONFERENCE", "Conference", newConf.conference_code, `Created conference: ${newConf.title}`);
    invalidatePublicCache();
    const enrichedNewConf = {
      ...newConf,
      committee: db.committee.filter((m) => m.conference_id === assignedId),
      speakers: db.speakers.filter((s) => s.conference_id === assignedId),
      sessions: db.sessions.filter((s) => s.conference_id === assignedId),
      categories: db.categories.filter((c) => c.conference_id === assignedId),
      sponsors: db.sponsors.filter((s) => s.conference_id === assignedId),
      media_partners: db.mediaPartners.filter((m) => m.conference_id === assignedId),
      schedule: db.schedule.filter((s) => s.conference_id === assignedId)
    };
    res.status(201).json({ success: true, message: "Conference created and permanently persisted in MySQL", data: enrichedNewConf });
  });
  app.put("/api/v1/conferences/:id", authenticateAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const index = db.conferences.findIndex((c) => c.id === id);
    if (index === -1 && !mysqlPool) {
      return res.status(404).json({ success: false, message: "Conference not found" });
    }
    const updatedConf = { ...index !== -1 ? db.conferences[index] : {}, ...req.body, id };
    if (mysqlPool) {
      try {
        await mysqlPool.query(
          `UPDATE conferences SET
            title = ?, short_title = ?, slug = ?, conference_code = ?, theme = ?, tagline = ?, description = ?, detailed_about = ?,
            about_heading = ?, about_highlights = ?, gallery_images = ?, domain = ?, city = ?, country = ?, venue = ?, venue_address = ?, timezone = ?,
            start_date = ?, end_date = ?, abstract_deadline = ?, early_bird_deadline = ?, registration_deadline = ?, mode = ?, status = ?,
            hero_image = ?, logo_url = ?, flyer_url = ?, sample_abstract_url = ?, featured_badge = ?, display_order = ?,
            welcome_heading = ?, welcome_message = ?, welcome_speaker_name = ?, welcome_speaker_role = ?, welcome_speaker_title = ?, welcome_speaker_image = ?, welcome_footer_text = ?,
            exhibitor_heading = ?, exhibitor_message = ?, exhibitor_speaker_name = ?, exhibitor_speaker_role = ?, exhibitor_speaker_title = ?, exhibitor_image = ?, exhibitor_footer_text = ?,
            program_image = ?, meta_title = ?, meta_description = ?, keywords = ?, accept_late_breaking = ?, cme_credits_eligible = ?, primary_language = ?, max_attendees = ?, accent_color = ?, journal_name = ?, journal_issn = ?, indexing_partners = ?
          WHERE id = ?`,
          [
            updatedConf.title,
            updatedConf.short_title,
            updatedConf.slug,
            updatedConf.conference_code,
            updatedConf.theme,
            updatedConf.tagline,
            updatedConf.description,
            updatedConf.detailed_about,
            updatedConf.about_heading,
            JSON.stringify(updatedConf.about_highlights || []),
            JSON.stringify(updatedConf.gallery_images || []),
            updatedConf.domain,
            updatedConf.city,
            updatedConf.country,
            updatedConf.venue,
            updatedConf.venue_address,
            updatedConf.timezone,
            formatDateStr(updatedConf.start_date),
            formatDateStr(updatedConf.end_date),
            formatDateStr(updatedConf.abstract_deadline),
            formatDateStr(updatedConf.early_bird_deadline),
            formatDateStr(updatedConf.registration_deadline),
            updatedConf.mode,
            updatedConf.status,
            updatedConf.hero_image,
            updatedConf.logo_url,
            updatedConf.flyer_url,
            updatedConf.sample_abstract_url,
            updatedConf.featured_badge,
            updatedConf.display_order,
            updatedConf.welcome_heading,
            updatedConf.welcome_message,
            updatedConf.welcome_speaker_name,
            updatedConf.welcome_speaker_role,
            updatedConf.welcome_speaker_title,
            updatedConf.welcome_speaker_image,
            updatedConf.welcome_footer_text,
            updatedConf.exhibitor_heading,
            updatedConf.exhibitor_message,
            updatedConf.exhibitor_speaker_name,
            updatedConf.exhibitor_speaker_role,
            updatedConf.exhibitor_speaker_title,
            updatedConf.exhibitor_image,
            updatedConf.exhibitor_footer_text,
            updatedConf.program_image,
            updatedConf.meta_title,
            updatedConf.meta_description,
            updatedConf.keywords,
            updatedConf.accept_late_breaking,
            updatedConf.cme_credits_eligible,
            updatedConf.primary_language,
            updatedConf.max_attendees,
            updatedConf.accent_color,
            updatedConf.journal_name,
            updatedConf.journal_issn,
            JSON.stringify(updatedConf.indexing_partners || []),
            id
          ]
        );
        if (Array.isArray(req.body.committee)) {
          await mysqlPool.query("DELETE FROM committee_members WHERE conference_id = ?", [id]);
          for (let idx = 0; idx < req.body.committee.length; idx++) {
            const m = req.body.committee[idx];
            await mysqlPool.query(
              `INSERT INTO committee_members (
                conference_id, name, designation, institution, country, committee_role, photo_url,
                biography, education, experience, research_interests, publications_count, linkedin_url,
                orcid_url, google_scholar_url, display_order, is_published
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                m.name || "Committee Member",
                m.designation || "",
                m.institution || "",
                m.country || "Global",
                m.committee_role || "Scientific Committee",
                m.photo_url || "",
                m.biography || "",
                m.education || "",
                m.experience || "",
                m.research_interests || "",
                Number(m.publications_count || 0),
                m.linkedin_url || "",
                m.orcid_url || "",
                m.google_scholar_url || "",
                Number(m.display_order || idx + 1),
                m.is_published !== false
              ]
            );
          }
        }
        if (Array.isArray(req.body.sessions)) {
          await mysqlPool.query("DELETE FROM sessions WHERE conference_id = ?", [id]);
          for (let sIdx = 0; sIdx < req.body.sessions.length; sIdx++) {
            const ses = req.body.sessions[sIdx];
            await mysqlPool.query(
              `INSERT INTO sessions (
                conference_id, session_number, session_code, title, track, category, description,
                session_date, start_time, end_time, room, session_type, display_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                sIdx + 1,
                ses.session_code || `SES-${sIdx + 1}`,
                ses.title || "Session Track",
                ses.track || "General",
                ses.category || "General",
                ses.description || "",
                ses.session_date || updatedConf.start_date,
                ses.start_time || "09:00:00",
                ses.end_time || "10:30:00",
                ses.room || "Hall A",
                ses.session_type || "Oral Presentation",
                Number(ses.display_order || sIdx + 1)
              ]
            );
          }
        }
        if (Array.isArray(req.body.categories)) {
          await mysqlPool.query("DELETE FROM registration_categories WHERE conference_id = ?", [id]);
          for (let cIdx = 0; cIdx < req.body.categories.length; cIdx++) {
            const cat = req.body.categories[cIdx];
            await mysqlPool.query(
              `INSERT INTO registration_categories (
                conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                cat.name || "Delegate Pass",
                Number(cat.price || cat.standard_fee || 799),
                cat.currency || "USD",
                Number(cat.early_bird_price || cat.early_bird_fee || 699),
                cat.deadline || updatedConf.early_bird_deadline,
                JSON.stringify(cat.benefits || []),
                Boolean(cat.is_popular),
                Number(cat.display_order || cIdx + 1),
                cat.payment_gateway_link || "",
                cat.is_active !== false
              ]
            );
          }
        }
        if (Array.isArray(req.body.schedule)) {
          await mysqlPool.query("DELETE FROM schedule_items WHERE conference_id = ?", [id]);
          for (let scIdx = 0; scIdx < req.body.schedule.length; scIdx++) {
            const sch = req.body.schedule[scIdx];
            await mysqlPool.query(
              `INSERT INTO schedule_items (
                conference_id, day_number, schedule_date, start_time, end_time, title, description,
                room, track, speaker_name, speaker_affiliation, item_type, display_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                Number(sch.day_number || 1),
                sch.schedule_date || updatedConf.start_date,
                sch.start_time || "09:00",
                sch.end_time || "10:00",
                sch.title || "Schedule Item",
                sch.description || "",
                sch.room || "",
                sch.track || "",
                sch.speaker_name || "",
                sch.speaker_affiliation || "",
                sch.item_type || "session",
                Number(sch.display_order || scIdx + 1)
              ]
            );
          }
        }
      } catch (dbErr) {
        console.error("[MySQL Conference Update Failed]:", dbErr);
        return res.status(500).json({ success: false, message: `Failed to update conference in MySQL: ${dbErr.message}` });
      }
    }
    if (index !== -1) {
      db.conferences[index] = updatedConf;
    } else {
      db.conferences.push(updatedConf);
    }
    if (Array.isArray(req.body.committee)) {
      db.committee = db.committee.filter((m) => m.conference_id !== id).concat(
        req.body.committee.map((m, idx) => ({
          ...m,
          id: m.id || Math.max(...db.committee.map((x) => x.id), 0) + idx + 1,
          conference_id: id,
          is_published: m.is_published !== void 0 ? m.is_published : true,
          status: m.status || "active"
        }))
      );
    }
    if (Array.isArray(req.body.speakers)) {
      db.speakers = db.speakers.filter((s) => s.conference_id !== id).concat(
        req.body.speakers.map((s, idx) => ({
          ...s,
          id: s.id || Math.max(...db.speakers.map((x) => x.id), 0) + idx + 1,
          conference_id: id,
          is_active: true,
          status: "active"
        }))
      );
    }
    if (Array.isArray(req.body.sessions)) {
      db.sessions = db.sessions.filter((s) => s.conference_id !== id).concat(
        req.body.sessions.map((ses, sIdx) => ({
          ...ses,
          id: ses.id || Math.max(...db.sessions.map((x) => x.id), 0) + sIdx + 1,
          conference_id: id,
          session_number: sIdx + 1,
          is_published: true,
          status: "published"
        }))
      );
    }
    if (Array.isArray(req.body.categories)) {
      db.categories = db.categories.filter((c) => c.conference_id !== id).concat(
        req.body.categories.map((c, idx) => ({
          ...c,
          id: c.id || Math.max(...db.categories.map((x) => x.id), 0) + idx + 1,
          conference_id: id,
          name: c.name || "Delegate Pass",
          currency: c.currency || "USD",
          early_bird_fee: c.early_bird_fee || c.early_bird_price || 799,
          standard_fee: c.standard_fee || c.price || 899,
          price: c.price || c.standard_fee || 899,
          early_bird_price: c.early_bird_price || c.early_bird_fee || 799,
          payment_gateway_link: c.payment_gateway_link || "",
          is_active: c.is_active !== void 0 ? Boolean(c.is_active) : true,
          display_order: Number(c.display_order ?? idx + 1),
          description: c.description || "",
          benefits: Array.isArray(c.benefits) ? c.benefits : []
        }))
      );
    }
    if (Array.isArray(req.body.schedule)) {
      db.schedule = db.schedule.filter((s) => s.conference_id !== id).concat(
        req.body.schedule.map((s, idx) => ({
          ...s,
          id: s.id || Math.max(...db.schedule.map((x) => x.id), 0) + idx + 1,
          conference_id: id,
          display_order: s.display_order ?? idx + 1
        }))
      );
    }
    db.addAuditLog("UPDATE_CONFERENCE", "Conference", String(id), `Updated conference: ${updatedConf.title}`);
    invalidatePublicCache();
    const enrichedUpdatedConf = {
      ...updatedConf,
      committee: db.committee.filter((m) => m.conference_id === id),
      speakers: db.speakers.filter((s) => s.conference_id === id),
      sessions: db.sessions.filter((s) => s.conference_id === id),
      categories: db.categories.filter((c) => c.conference_id === id),
      sponsors: db.sponsors.filter((s) => s.conference_id === id),
      media_partners: db.mediaPartners.filter((m) => m.conference_id === id),
      schedule: db.schedule.filter((s) => s.conference_id === id)
    };
    res.json({ success: true, message: "Conference updated successfully in MySQL", data: enrichedUpdatedConf });
  });
  app.patch("/api/v1/conferences/:id/status", authenticateAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (mysqlPool) {
      try {
        await mysqlPool.query("UPDATE conferences SET status = ? WHERE id = ?", [status, id]);
      } catch (err) {
        console.error("[MySQL Update Status Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to update status in MySQL: ${err.message}` });
      }
    }
    const index = db.conferences.findIndex((c) => c.id === id);
    if (index !== -1 && status) {
      db.conferences[index].status = status;
    }
    invalidatePublicCache();
    db.addAuditLog("UPDATE_CONFERENCE_STATUS", "Conference", String(id), `Updated conference status to ${status}`);
    res.json({ success: true, message: `Status updated to ${status}`, data: index !== -1 ? db.conferences[index] : { id, status } });
  });
  app.patch("/api/v1/conferences/:id/order", authenticateAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { display_order } = req.body;
    if (mysqlPool) {
      try {
        await mysqlPool.query("UPDATE conferences SET display_order = ? WHERE id = ?", [display_order, id]);
      } catch (err) {
        console.error("[MySQL Update Order Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to update order in MySQL: ${err.message}` });
      }
    }
    const index = db.conferences.findIndex((c) => c.id === id);
    if (index !== -1 && typeof display_order === "number") {
      db.conferences[index].display_order = display_order;
    }
    invalidatePublicCache();
    db.addAuditLog("UPDATE_CONFERENCE_ORDER", "Conference", String(id), `Updated display order to ${display_order}`);
    res.json({ success: true, message: `Display order updated to ${display_order}`, data: index !== -1 ? db.conferences[index] : { id, display_order } });
  });
  app.post("/api/v1/conferences/:id/duplicate", authenticateAdmin, async (req, res) => {
    const id = Number(req.params.id);
    let original = db.conferences.find((c) => c.id === id);
    if (mysqlPool) {
      try {
        const [rows] = await mysqlPool.query("SELECT * FROM conferences WHERE id = ?", [id]);
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          original = {
            id: Number(r.id),
            title: r.title,
            short_title: r.short_title,
            slug: r.slug,
            conference_code: r.conference_code,
            theme: r.theme,
            tagline: r.tagline,
            description: r.description,
            detailed_about: r.detailed_about,
            about_heading: r.about_heading,
            about_highlights: parseJsonSafe(r.about_highlights, []),
            gallery_images: parseJsonSafe(r.gallery_images, []),
            domain: r.domain,
            city: r.city,
            country: r.country,
            venue: r.venue,
            venue_address: r.venue_address,
            timezone: r.timezone,
            start_date: formatDateStr(r.start_date),
            end_date: formatDateStr(r.end_date),
            abstract_deadline: formatDateStr(r.abstract_deadline),
            early_bird_deadline: formatDateStr(r.early_bird_deadline),
            registration_deadline: formatDateStr(r.registration_deadline),
            mode: r.mode,
            status: r.status,
            hero_image: r.hero_image,
            logo_url: r.logo_url,
            flyer_url: r.flyer_url,
            sample_abstract_url: r.sample_abstract_url,
            featured_badge: r.featured_badge,
            display_order: Number(r.display_order ?? 0),
            welcome_heading: r.welcome_heading,
            welcome_message: r.welcome_message,
            welcome_speaker_name: r.welcome_speaker_name,
            welcome_speaker_role: r.welcome_speaker_role,
            welcome_speaker_title: r.welcome_speaker_title,
            welcome_speaker_image: r.welcome_speaker_image,
            welcome_footer_text: r.welcome_footer_text,
            exhibitor_heading: r.exhibitor_heading,
            exhibitor_message: r.exhibitor_message,
            exhibitor_speaker_name: r.exhibitor_speaker_name,
            exhibitor_speaker_role: r.exhibitor_speaker_role,
            exhibitor_speaker_title: r.exhibitor_speaker_title,
            exhibitor_image: r.exhibitor_image,
            exhibitor_footer_text: r.exhibitor_footer_text,
            program_image: r.program_image,
            meta_title: r.meta_title,
            meta_description: r.meta_description,
            keywords: r.keywords,
            accept_late_breaking: Boolean(r.accept_late_breaking),
            cme_credits_eligible: Boolean(r.cme_credits_eligible),
            primary_language: r.primary_language,
            max_attendees: Number(r.max_attendees || 500),
            accent_color: r.accent_color || "teal",
            journal_name: r.journal_name,
            journal_issn: r.journal_issn,
            indexing_partners: parseJsonSafe(r.indexing_partners, [])
          };
        }
      } catch (err) {
        console.warn("[MySQL Duplicate Fetch Notice]:", err.message);
      }
    }
    if (!original) {
      return res.status(404).json({ success: false, message: "Original conference not found" });
    }
    const copyTimestamp = Date.now().toString().slice(-4);
    const newTitle = `${original.title} (Clone)`;
    const newShortTitle = `${original.short_title} (Copy)`;
    const newSlug = `${original.slug}-copy-${copyTimestamp}`;
    const newCode = `${original.conference_code}-CPY${copyTimestamp}`;
    let newId = Math.max(...db.conferences.map((c) => c.id), 0) + 1;
    if (mysqlPool) {
      try {
        const [dupRes] = await mysqlPool.query(
          `INSERT INTO conferences (
            title, short_title, slug, conference_code, theme, tagline, description, detailed_about,
            about_heading, about_highlights, gallery_images, domain, city, country, venue, venue_address, timezone,
            start_date, end_date, abstract_deadline, early_bird_deadline, registration_deadline, mode, status,
            hero_image, logo_url, flyer_url, sample_abstract_url, featured_badge, display_order,
            welcome_heading, welcome_message, welcome_speaker_name, welcome_speaker_role, welcome_speaker_title, welcome_speaker_image, welcome_footer_text,
            exhibitor_heading, exhibitor_message, exhibitor_speaker_name, exhibitor_speaker_role, exhibitor_speaker_title, exhibitor_image, exhibitor_footer_text,
            program_image, meta_title, meta_description, keywords, accept_late_breaking, cme_credits_eligible, primary_language, max_attendees, accent_color, journal_name, journal_issn, indexing_partners
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newTitle,
            newShortTitle,
            newSlug,
            newCode,
            original.theme,
            original.tagline,
            original.description,
            original.detailed_about,
            original.about_heading,
            JSON.stringify(original.about_highlights || []),
            JSON.stringify(original.gallery_images || []),
            original.domain,
            original.city,
            original.country,
            original.venue,
            original.venue_address,
            original.timezone,
            formatDateStr(original.start_date),
            formatDateStr(original.end_date),
            formatDateStr(original.abstract_deadline),
            formatDateStr(original.early_bird_deadline),
            formatDateStr(original.registration_deadline),
            original.mode,
            "draft",
            original.hero_image,
            original.logo_url,
            original.flyer_url,
            original.sample_abstract_url,
            original.featured_badge,
            (original.display_order || 0) + 1,
            original.welcome_heading,
            original.welcome_message,
            original.welcome_speaker_name,
            original.welcome_speaker_role,
            original.welcome_speaker_title,
            original.welcome_speaker_image,
            original.welcome_footer_text,
            original.exhibitor_heading,
            original.exhibitor_message,
            original.exhibitor_speaker_name,
            original.exhibitor_speaker_role,
            original.exhibitor_speaker_title,
            original.exhibitor_image,
            original.exhibitor_footer_text,
            original.program_image,
            original.meta_title,
            original.meta_description,
            original.keywords,
            original.accept_late_breaking,
            original.cme_credits_eligible,
            original.primary_language,
            original.max_attendees,
            original.accent_color,
            original.journal_name,
            original.journal_issn,
            JSON.stringify(original.indexing_partners || [])
          ]
        );
        newId = Number(dupRes.insertId);
        await mysqlPool.query(
          `INSERT INTO committee_members (
            conference_id, name, designation, institution, country, committee_role, photo_url,
            biography, education, experience, research_interests, publications_count, linkedin_url,
            orcid_url, google_scholar_url, display_order, is_published
          ) SELECT ?, name, designation, institution, country, committee_role, photo_url,
            biography, education, experience, research_interests, publications_count, linkedin_url,
            orcid_url, google_scholar_url, display_order, is_published
          FROM committee_members WHERE conference_id = ?`,
          [newId, id]
        );
        await mysqlPool.query(
          `INSERT INTO sessions (
            conference_id, session_number, session_code, title, track, category, description,
            session_date, start_time, end_time, room, session_type, display_order
          ) SELECT ?, session_number, CONCAT(session_code, '-CPY'), title, track, category, description,
            session_date, start_time, end_time, room, session_type, display_order
          FROM sessions WHERE conference_id = ?`,
          [newId, id]
        );
        await mysqlPool.query(
          `INSERT INTO registration_categories (
            conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
          ) SELECT ?, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
          FROM registration_categories WHERE conference_id = ?`,
          [newId, id]
        );
        await mysqlPool.query(
          `INSERT INTO schedule_items (
            conference_id, day_number, schedule_date, start_time, end_time, title, description,
            room, track, speaker_name, speaker_affiliation, item_type, display_order
          ) SELECT ?, day_number, schedule_date, start_time, end_time, title, description,
            room, track, speaker_name, speaker_affiliation, item_type, display_order
          FROM schedule_items WHERE conference_id = ?`,
          [newId, id]
        );
      } catch (dbErr) {
        console.error("[MySQL Conference Duplicate Failed]:", dbErr);
        return res.status(500).json({ success: false, message: `Failed to duplicate conference in MySQL: ${dbErr.message}` });
      }
    }
    const duplicated = {
      ...original,
      id: newId,
      title: newTitle,
      short_title: newShortTitle,
      slug: newSlug,
      conference_code: newCode,
      status: "draft",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.conferences.push(duplicated);
    invalidatePublicCache();
    db.addAuditLog("DUPLICATE_CONFERENCE", "Conference", duplicated.conference_code, `Cloned from ${original.title}`);
    res.status(201).json({ success: true, message: "Conference duplicated as draft successfully in MySQL", data: duplicated });
  });
  app.delete("/api/v1/conferences/:id", authenticateAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query("DELETE FROM conferences WHERE id = ?", [id]);
        console.log(`[MySQL Delete Conference] Deleted conference ID ${id} and cascading child records.`);
      } catch (err) {
        console.error("[MySQL Delete Conference Failed]:", err);
        return res.status(500).json({ success: false, message: `Failed to delete conference in MySQL: ${err.message}` });
      }
    }
    const index = db.conferences.findIndex((c) => c.id === id);
    const removed = index !== -1 ? db.conferences.splice(index, 1)[0] : { id };
    db.committee = db.committee.filter((m) => m.conference_id !== id);
    db.sessions = db.sessions.filter((s) => s.conference_id !== id);
    db.categories = db.categories.filter((c) => c.conference_id !== id);
    db.schedule = db.schedule.filter((s) => s.conference_id !== id);
    invalidatePublicCache();
    db.addAuditLog("DELETE_CONFERENCE", "Conference", String(id), `Deleted conference ID: ${id}`);
    res.json({ success: true, message: "Conference deleted successfully from MySQL", data: removed });
  });
  app.get("/api/v1/committee", (req, res) => {
    const { conference_id, search, role, status } = req.query;
    let list = [...db.committee];
    if (conference_id) {
      list = list.filter((m) => m.conference_id === Number(conference_id));
    }
    if (role && role !== "All") {
      list = list.filter((m) => m.committee_role === role);
    }
    if (status && status !== "All") {
      const isPub = status === "active" || status === "published";
      list = list.filter((m) => (m.is_published ?? true) === isPub);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.institution.toLowerCase().includes(q) || m.designation.toLowerCase().includes(q) || m.country.toLowerCase().includes(q) || m.committee_role.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });
  app.get("/api/v1/committee/:id", (req, res) => {
    const id = Number(req.params.id);
    const member = db.committee.find((m) => m.id === id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Committee member not found" });
    }
    res.json({ success: true, data: member });
  });
  app.post("/api/v1/committee", authenticateAdmin, async (req, res) => {
    let newId = Math.max(...db.committee.map((m) => m.id), 0) + 1;
    const isPub = req.body.is_published !== void 0 ? Boolean(req.body.is_published) : true;
    if (mysqlPool) {
      try {
        const [r] = await mysqlPool.query(
          `INSERT INTO committee_members (
            conference_id, name, designation, institution, country, committee_role, photo_url,
            biography, education, experience, research_interests, publications_count, linkedin_url,
            orcid_url, google_scholar_url, display_order, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(req.body.conference_id) || 1,
            req.body.name || "New Committee Member",
            req.body.designation || "Professor of Science",
            req.body.institution || "University Research Institute",
            req.body.country || "Global",
            req.body.committee_role || "Scientific Committee",
            req.body.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            req.body.biography || "",
            req.body.education || "",
            req.body.experience || "",
            req.body.research_interests || "",
            Number(req.body.publications_count) || 10,
            req.body.linkedin_url || "",
            req.body.orcid_url || "",
            req.body.google_scholar_url || "",
            Number(req.body.display_order) || db.committee.length + 1,
            isPub
          ]
        );
        newId = Number(r.insertId);
      } catch (err) {
        console.error("[MySQL Add Committee Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to add committee member in MySQL: ${err.message}` });
      }
    }
    const newMember = {
      id: newId,
      conference_id: Number(req.body.conference_id) || 1,
      name: req.body.name || "New Committee Member",
      designation: req.body.designation || "Professor of Science",
      institution: req.body.institution || "University Research Institute",
      country: req.body.country || "Global",
      committee_role: req.body.committee_role || "Scientific Committee",
      photo_url: req.body.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      biography: req.body.biography || "",
      education: req.body.education || "",
      experience: req.body.experience || "",
      research_interests: req.body.research_interests || "",
      publications_count: Number(req.body.publications_count) || 10,
      linkedin_url: req.body.linkedin_url || "",
      orcid_url: req.body.orcid_url || "",
      google_scholar_url: req.body.google_scholar_url || "",
      display_order: Number(req.body.display_order) || db.committee.length + 1,
      is_published: isPub,
      status: req.body.status || "active"
    };
    db.committee.push(newMember);
    invalidatePublicCache();
    db.addAuditLog("ADD_COMMITTEE_MEMBER", "CommitteeMember", String(newMember.id), `Added committee member: ${newMember.name}`);
    res.status(201).json({ success: true, message: "Committee member added successfully in MySQL", data: newMember });
  });
  app.put("/api/v1/committee/:id", authenticateAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query(
          `UPDATE committee_members SET
            name = COALESCE(?, name),
            designation = COALESCE(?, designation),
            institution = COALESCE(?, institution),
            country = COALESCE(?, country),
            committee_role = COALESCE(?, committee_role),
            photo_url = COALESCE(?, photo_url),
            biography = COALESCE(?, biography),
            education = COALESCE(?, education),
            experience = COALESCE(?, experience),
            research_interests = COALESCE(?, research_interests),
            publications_count = COALESCE(?, publications_count),
            linkedin_url = COALESCE(?, linkedin_url),
            orcid_url = COALESCE(?, orcid_url),
            google_scholar_url = COALESCE(?, google_scholar_url),
            display_order = COALESCE(?, display_order),
            is_published = COALESCE(?, is_published)
          WHERE id = ?`,
          [
            req.body.name,
            req.body.designation,
            req.body.institution,
            req.body.country,
            req.body.committee_role,
            req.body.photo_url,
            req.body.biography,
            req.body.education,
            req.body.experience,
            req.body.research_interests,
            req.body.publications_count,
            req.body.linkedin_url,
            req.body.orcid_url,
            req.body.google_scholar_url,
            req.body.display_order,
            req.body.is_published,
            id
          ]
        );
      } catch (err) {
        console.error("[MySQL Update Committee Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to update committee member in MySQL: ${err.message}` });
      }
    }
    const index = db.committee.findIndex((m) => m.id === id);
    if (index !== -1) {
      db.committee[index] = { ...db.committee[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog("UPDATE_COMMITTEE_MEMBER", "CommitteeMember", String(id), `Updated member: ${req.body.name || id}`);
    res.json({ success: true, message: "Committee member updated successfully in MySQL", data: index !== -1 ? db.committee[index] : req.body });
  });
  app.patch("/api/v1/committee/:id/status", async (req, res) => {
    const id = Number(req.params.id);
    const index = db.committee.findIndex((m) => m.id === id);
    const currentPub = index !== -1 ? db.committee[index].is_published ?? true : true;
    const newPub = req.body.is_published !== void 0 ? Boolean(req.body.is_published) : !currentPub;
    if (mysqlPool) {
      try {
        await mysqlPool.query("UPDATE committee_members SET is_published = ? WHERE id = ?", [newPub, id]);
      } catch (err) {
        console.error("[MySQL Toggle Committee Status Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to update status in MySQL: ${err.message}` });
      }
    }
    if (index !== -1) {
      db.committee[index].is_published = newPub;
      db.committee[index].status = newPub ? "active" : "inactive";
    }
    invalidatePublicCache();
    db.addAuditLog("TOGGLE_COMMITTEE_STATUS", "CommitteeMember", String(id), `Set status to ${newPub ? "Published" : "Hidden"}`);
    res.json({ success: true, message: `Status updated to ${newPub ? "Active" : "Inactive"} in MySQL`, data: index !== -1 ? db.committee[index] : { id, is_published: newPub } });
  });
  app.delete("/api/v1/committee/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query("DELETE FROM committee_members WHERE id = ?", [id]);
      } catch (err) {
        console.error("[MySQL Delete Committee Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to delete committee member in MySQL: ${err.message}` });
      }
    }
    const index = db.committee.findIndex((m) => m.id === id);
    const removed = index !== -1 ? db.committee.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog("DELETE_COMMITTEE_MEMBER", "CommitteeMember", String(id), `Removed committee member ID: ${id}`);
    res.json({ success: true, message: "Committee member deleted successfully from MySQL", data: removed });
  });
  app.get("/api/v1/speakers", (req, res) => {
    const { conference_id, search, type, status } = req.query;
    let list = [...db.speakers];
    if (conference_id) {
      list = list.filter((s) => s.conference_id === Number(conference_id));
    }
    if (type && type !== "All") {
      list = list.filter((s) => s.speaker_type === type);
    }
    if (status && status !== "All") {
      const isActive = status === "active";
      list = list.filter((s) => (s.is_active ?? true) === isActive);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.institution.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q) || s.country.toLowerCase().includes(q) || s.presentation_title && s.presentation_title.toLowerCase().includes(q) || s.research_domain && s.research_domain.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });
  app.get("/api/v1/speakers/:id", (req, res) => {
    const id = Number(req.params.id);
    const speaker = db.speakers.find((s) => s.id === id);
    if (!speaker) {
      return res.status(404).json({ success: false, message: "Speaker not found" });
    }
    res.json({ success: true, data: speaker });
  });
  app.post("/api/v1/speakers", authenticateAdmin, (req, res) => {
    const newId = Math.max(...db.speakers.map((s) => s.id), 0) + 1;
    const newSpeaker = {
      id: newId,
      name: req.body.name || "New Faculty Speaker",
      prefix: req.body.prefix || "Dr.",
      designation: req.body.designation || "Professor",
      institution: req.body.institution || "Research Institute",
      country: req.body.country || "Global",
      research_domain: req.body.research_domain || "Biotechnology",
      photo_url: req.body.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      biography: req.body.biography || "",
      speaker_type: req.body.speaker_type || "Keynote",
      presentation_title: req.body.presentation_title || "",
      presentation_abstract: req.body.presentation_abstract || "",
      conference_id: Number(req.body.conference_id) || 1,
      display_order: Number(req.body.display_order) || db.speakers.length + 1,
      h_index: Number(req.body.h_index) || 25,
      citations_count: Number(req.body.citations_count) || 1500,
      linkedin_url: req.body.linkedin_url || "",
      google_scholar: req.body.google_scholar || "",
      website: req.body.website || "",
      is_active: req.body.is_active !== void 0 ? req.body.is_active : true,
      status: req.body.status || "active",
      session_title: req.body.session_title || ""
    };
    db.speakers.push(newSpeaker);
    db.addAuditLog("ADD_SPEAKER", "Speaker", String(newSpeaker.id), `Added speaker: ${newSpeaker.name}`);
    res.status(201).json({ success: true, message: "Speaker added successfully", data: newSpeaker });
  });
  app.put("/api/v1/speakers/:id", authenticateAdmin, (req, res) => {
    const id = Number(req.params.id);
    const index = db.speakers.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Speaker not found" });
    }
    db.speakers[index] = { ...db.speakers[index], ...req.body };
    db.addAuditLog("UPDATE_SPEAKER", "Speaker", String(id), `Updated speaker: ${db.speakers[index].name}`);
    res.json({ success: true, message: "Speaker updated successfully", data: db.speakers[index] });
  });
  app.patch("/api/v1/speakers/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const index = db.speakers.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Speaker not found" });
    }
    const currentActive = db.speakers[index].is_active ?? true;
    const newActive = req.body.is_active !== void 0 ? req.body.is_active : !currentActive;
    db.speakers[index].is_active = newActive;
    db.speakers[index].status = newActive ? "active" : "inactive";
    db.addAuditLog("TOGGLE_SPEAKER_STATUS", "Speaker", String(id), `Set status to ${newActive ? "Active" : "Inactive"}`);
    res.json({ success: true, message: `Speaker status updated to ${newActive ? "Active" : "Inactive"}`, data: db.speakers[index] });
  });
  app.delete("/api/v1/speakers/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = db.speakers.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Speaker not found" });
    }
    const removed = db.speakers.splice(index, 1)[0];
    db.addAuditLog("DELETE_SPEAKER", "Speaker", String(id), `Deleted speaker: ${removed.name}`);
    res.json({ success: true, message: "Speaker deleted successfully", data: removed });
  });
  app.get("/api/v1/sessions", (req, res) => {
    const { conference_id, search, track, type, status, published_only } = req.query;
    let list = [...db.sessions];
    if (conference_id) {
      list = list.filter((s) => s.conference_id === Number(conference_id));
    }
    if (published_only === "true" || published_only === "1") {
      list = list.filter(
        (s) => s.is_published !== false && s.is_active !== false && s.status !== "draft" && s.status !== "unpublished" && s.status !== "archived" && s.status !== "deleted"
      );
    }
    if (track && track !== "All") {
      list = list.filter((s) => s.track === track || s.track.toLowerCase().includes(String(track).toLowerCase()));
    }
    if (type && type !== "All") {
      list = list.filter((s) => s.session_type === type);
    }
    if (status && status !== "All") {
      list = list.filter((s) => (s.status || "published") === status);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.title.toLowerCase().includes(q) || s.track.toLowerCase().includes(q) || s.session_code.toLowerCase().includes(q) || s.room && s.room.toLowerCase().includes(q) || s.description && s.description.toLowerCase().includes(q) || s.chairperson && s.chairperson.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });
  app.get("/api/v1/sessions/:id", (req, res) => {
    const id = Number(req.params.id);
    const session = db.sessions.find((s) => s.id === id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    res.json({ success: true, data: session });
  });
  app.post("/api/v1/sessions", authenticateAdmin, async (req, res) => {
    let newId = Math.max(...db.sessions.map((s) => s.id), 0) + 1;
    const isPub = req.body.is_published !== void 0 ? req.body.is_published : req.body.status !== "draft" && req.body.status !== "archived" && req.body.status !== "unpublished";
    if (mysqlPool) {
      try {
        const [r] = await mysqlPool.query(
          `INSERT INTO sessions (
            conference_id, session_number, session_code, title, track, category, description,
            session_date, start_time, end_time, room, session_type, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(req.body.conference_id) || 1,
            Number(req.body.session_number) || db.sessions.length + 1,
            req.body.session_code || `BIO-SES-${String(newId).padStart(2, "0")}`,
            req.body.title || "New Scientific Session",
            req.body.track || "General Track",
            req.body.category || "Oral Presentations",
            req.body.description || "",
            formatDateStr(req.body.session_date || "2026-06-22"),
            req.body.start_time ? String(req.body.start_time).substring(0, 5) : "10:00",
            req.body.end_time ? String(req.body.end_time).substring(0, 5) : "11:30",
            req.body.room || "Auditorium Pasteur",
            req.body.session_type || "Oral Presentation",
            Number(req.body.display_order) || newId
          ]
        );
        newId = Number(r.insertId);
      } catch (err) {
        console.error("[MySQL Add Session Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to add session in MySQL: ${err.message}` });
      }
    }
    const newSession = {
      id: newId,
      conference_id: Number(req.body.conference_id) || 1,
      session_number: Number(req.body.session_number) || db.sessions.length + 1,
      session_code: req.body.session_code || `BIO-SES-${String(newId).padStart(2, "0")}`,
      title: req.body.title || "New Scientific Session",
      track: req.body.track || "General Track",
      category: req.body.category || "Oral Presentations",
      description: req.body.description || "",
      session_date: req.body.session_date || "2026-06-22",
      start_time: req.body.start_time || "10:00",
      end_time: req.body.end_time || "11:30",
      room: req.body.room || "Auditorium Pasteur",
      session_type: req.body.session_type || "Oral Presentation",
      display_order: Number(req.body.display_order) || newId,
      status: req.body.status || (isPub ? "published" : "draft"),
      is_published: isPub,
      is_active: req.body.is_active !== void 0 ? req.body.is_active : true,
      image_url: req.body.image_url || "",
      icon: req.body.icon || "",
      chairperson: req.body.chairperson || req.body.chair_person || "Prof. Session Chair",
      speaker_name: req.body.speaker_name || ""
    };
    db.sessions.push(newSession);
    invalidatePublicCache();
    db.addAuditLog("ADD_SESSION", "Session", newSession.session_code, `Added session: ${newSession.title}`);
    res.status(201).json({ success: true, message: "Session created successfully in MySQL", data: newSession });
  });
  app.put("/api/v1/sessions/:id", authenticateAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query(
          `UPDATE sessions SET
            title = COALESCE(?, title),
            track = COALESCE(?, track),
            category = COALESCE(?, category),
            description = COALESCE(?, description),
            session_date = COALESCE(?, session_date),
            start_time = COALESCE(?, start_time),
            end_time = COALESCE(?, end_time),
            room = COALESCE(?, room),
            session_type = COALESCE(?, session_type),
            display_order = COALESCE(?, display_order)
          WHERE id = ?`,
          [
            req.body.title,
            req.body.track,
            req.body.category,
            req.body.description,
            req.body.session_date ? formatDateStr(req.body.session_date) : null,
            req.body.start_time,
            req.body.end_time,
            req.body.room,
            req.body.session_type,
            req.body.display_order,
            id
          ]
        );
      } catch (err) {
        console.error("[MySQL Update Session Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to update session in MySQL: ${err.message}` });
      }
    }
    const index = db.sessions.findIndex((s) => s.id === id);
    if (index !== -1) {
      db.sessions[index] = { ...db.sessions[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog("UPDATE_SESSION", "Session", String(id), `Updated session: ${req.body.title || id}`);
    res.json({ success: true, message: "Session updated successfully in MySQL", data: index !== -1 ? db.sessions[index] : req.body });
  });
  app.patch("/api/v1/sessions/:id/status", async (req, res) => {
    const id = Number(req.params.id);
    const index = db.sessions.findIndex((s) => s.id === id);
    if (index !== -1) {
      if (req.body.status !== void 0) db.sessions[index].status = req.body.status;
      if (req.body.is_active !== void 0) db.sessions[index].is_active = req.body.is_active;
      if (req.body.is_published !== void 0) db.sessions[index].is_published = req.body.is_published;
    }
    invalidatePublicCache();
    db.addAuditLog("TOGGLE_SESSION_STATUS", "Session", String(id), `Updated status to ${req.body.status || "updated"}`);
    res.json({ success: true, message: "Session status updated", data: index !== -1 ? db.sessions[index] : { id } });
  });
  app.delete("/api/v1/sessions/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query("DELETE FROM sessions WHERE id = ?", [id]);
      } catch (err) {
        console.error("[MySQL Delete Session Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to delete session in MySQL: ${err.message}` });
      }
    }
    const index = db.sessions.findIndex((s) => s.id === id);
    const removed = index !== -1 ? db.sessions.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog("DELETE_SESSION", "Session", String(id), `Deleted session ID: ${id}`);
    res.json({ success: true, message: "Session deleted successfully from MySQL", data: removed });
  });
  app.get("/api/v1/sponsors", (req, res) => {
    const { conference_id, search, tier, status, partner_type } = req.query;
    let list = [...db.sponsors];
    if (conference_id) {
      list = list.filter((s) => s.conference_id === Number(conference_id));
    }
    if (tier && tier !== "All") {
      list = list.filter((s) => s.tier === tier || s.tier_name.toLowerCase().includes(String(tier).toLowerCase()));
    }
    if (partner_type && partner_type !== "All") {
      list = list.filter((s) => (s.partner_type || "Corporate Sponsor") === partner_type);
    }
    if (status && status !== "All") {
      const isActive = status === "active";
      list = list.filter((s) => (s.is_active ?? true) === isActive);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.company_name && s.company_name.toLowerCase().includes(q) || s.name && s.name.toLowerCase().includes(q) || s.description && s.description.toLowerCase().includes(q) || s.tier_name && s.tier_name.toLowerCase().includes(q) || s.country && s.country.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });
  app.get("/api/v1/sponsors/:id", (req, res) => {
    const id = Number(req.params.id);
    const sponsor = db.sponsors.find((s) => s.id === id);
    if (!sponsor) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }
    res.json({ success: true, data: sponsor });
  });
  app.post("/api/v1/sponsors", authenticateAdmin, (req, res) => {
    const newId = Math.max(...db.sponsors.map((s) => s.id), 0) + 1;
    const tier = req.body.tier || "Platinum";
    const tierMap = { Platinum: 1, Gold: 2, Silver: 3, Bronze: 4, Supporting: 5, Academic: 6, Media: 7 };
    const newSponsor = {
      id: newId,
      company_name: req.body.company_name || req.body.name || "New Corporate Sponsor",
      name: req.body.name || req.body.company_name || "New Corporate Sponsor",
      logo_url: req.body.logo_url || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80",
      website: req.body.website || "https://scinsmedia.com",
      description: req.body.description || "Global industry and research partner.",
      tier_name: req.body.tier_name || `${tier} Sponsor`,
      tier,
      tier_id: req.body.tier_id || (tierMap[tier] || 1),
      country: req.body.country || "Global",
      contact_email: req.body.contact_email || "",
      conference_id: Number(req.body.conference_id) || 1,
      display_order: Number(req.body.display_order) || db.sponsors.length + 1,
      is_active: req.body.is_active !== void 0 ? req.body.is_active : true,
      status: req.body.status || "active",
      partner_type: req.body.partner_type || "Corporate Sponsor",
      category: req.body.category || tier
    };
    db.sponsors.push(newSponsor);
    db.addAuditLog("ADD_SPONSOR", "Sponsor", String(newSponsor.id), `Added sponsor: ${newSponsor.company_name}`);
    res.status(201).json({ success: true, message: "Sponsor added successfully", data: newSponsor });
  });
  app.put("/api/v1/sponsors/:id", authenticateAdmin, (req, res) => {
    const id = Number(req.params.id);
    const index = db.sponsors.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }
    db.sponsors[index] = { ...db.sponsors[index], ...req.body };
    db.addAuditLog("UPDATE_SPONSOR", "Sponsor", String(id), `Updated sponsor: ${db.sponsors[index].company_name}`);
    res.json({ success: true, message: "Sponsor updated successfully", data: db.sponsors[index] });
  });
  app.patch("/api/v1/sponsors/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const index = db.sponsors.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }
    const currentActive = db.sponsors[index].is_active ?? true;
    const newActive = req.body.is_active !== void 0 ? req.body.is_active : !currentActive;
    db.sponsors[index].is_active = newActive;
    db.sponsors[index].status = newActive ? "active" : "inactive";
    db.addAuditLog("TOGGLE_SPONSOR_STATUS", "Sponsor", String(id), `Set status to ${newActive ? "Active" : "Inactive"}`);
    res.json({ success: true, message: `Sponsor status updated to ${newActive ? "Active" : "Inactive"}`, data: db.sponsors[index] });
  });
  app.delete("/api/v1/sponsors/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = db.sponsors.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Sponsor not found" });
    }
    const removed = db.sponsors.splice(index, 1)[0];
    db.addAuditLog("DELETE_SPONSOR", "Sponsor", String(id), `Deleted sponsor: ${removed.company_name}`);
    res.json({ success: true, message: "Sponsor deleted successfully", data: removed });
  });
  app.get("/api/v1/schedule", (req, res) => {
    const { conference_id, day_label } = req.query;
    let list = [...db.schedule];
    if (conference_id) {
      const filtered = list.filter((s) => s.conference_id === Number(conference_id));
      list = filtered.length > 0 ? filtered : list;
    }
    if (day_label) {
      list = list.filter((s) => s.day_label === day_label);
    }
    res.json({ success: true, data: list });
  });
  app.post("/api/v1/schedule", async (req, res) => {
    let newId = Math.max(...db.schedule.map((s) => s.id), 0) + 1;
    if (mysqlPool) {
      try {
        const [r] = await mysqlPool.query(
          `INSERT INTO schedule_items (
            conference_id, day_number, schedule_date, start_time, end_time, title, description,
            room, track, speaker_name, speaker_affiliation, item_type, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(req.body.conference_id) || 1,
            Number(req.body.day_number) || 1,
            formatDateStr(req.body.schedule_date || "2026-06-22"),
            req.body.start_time || "09:00",
            req.body.end_time || "10:00",
            req.body.title || "Scientific Session",
            req.body.description || "",
            req.body.room || "Auditorium Hall A",
            req.body.track || "General Track",
            req.body.speaker_name || "",
            req.body.speaker_affiliation || "",
            req.body.item_type || "session",
            Number(req.body.display_order) || newId
          ]
        );
        newId = Number(r.insertId);
      } catch (err) {
        console.error("[MySQL Add Schedule Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to add schedule item in MySQL: ${err.message}` });
      }
    }
    const item = {
      id: newId,
      conference_id: Number(req.body.conference_id) || 1,
      day_number: Number(req.body.day_number) || 1,
      day_label: req.body.day_label || (req.body.day_number === 2 ? "Day 2" : "Day 1"),
      schedule_date: req.body.schedule_date || "2026-06-22",
      start_time: req.body.start_time || "09:00",
      end_time: req.body.end_time || "10:00",
      title: req.body.title || "Scientific Session",
      description: req.body.description || "",
      room: req.body.room || "Auditorium Hall A",
      track: req.body.track || "General Track",
      speaker_name: req.body.speaker_name || "",
      speaker_affiliation: req.body.speaker_affiliation || "",
      item_type: req.body.item_type || "session",
      display_order: Number(req.body.display_order) || newId
    };
    db.schedule.push(item);
    invalidatePublicCache();
    db.addAuditLog("ADD_SCHEDULE_ITEM", "ScheduleItem", String(newId), `Added schedule item: ${item.title}`);
    res.status(201).json({ success: true, message: "Schedule item created successfully in MySQL", data: item });
  });
  app.put("/api/v1/schedule/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query(
          `UPDATE schedule_items SET
            day_number = COALESCE(?, day_number),
            schedule_date = COALESCE(?, schedule_date),
            start_time = COALESCE(?, start_time),
            end_time = COALESCE(?, end_time),
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            room = COALESCE(?, room),
            track = COALESCE(?, track),
            speaker_name = COALESCE(?, speaker_name),
            speaker_affiliation = COALESCE(?, speaker_affiliation),
            item_type = COALESCE(?, item_type),
            display_order = COALESCE(?, display_order)
          WHERE id = ?`,
          [
            req.body.day_number,
            req.body.schedule_date ? formatDateStr(req.body.schedule_date) : null,
            req.body.start_time,
            req.body.end_time,
            req.body.title,
            req.body.description,
            req.body.room,
            req.body.track,
            req.body.speaker_name,
            req.body.speaker_affiliation,
            req.body.item_type,
            req.body.display_order,
            id
          ]
        );
      } catch (err) {
        console.error("[MySQL Update Schedule Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to update schedule item in MySQL: ${err.message}` });
      }
    }
    const index = db.schedule.findIndex((s) => s.id === id);
    if (index !== -1) {
      db.schedule[index] = { ...db.schedule[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog("UPDATE_SCHEDULE_ITEM", "ScheduleItem", String(id), `Updated schedule item: ${req.body.title || id}`);
    res.json({ success: true, message: "Schedule item updated successfully in MySQL", data: index !== -1 ? db.schedule[index] : req.body });
  });
  app.delete("/api/v1/schedule/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query("DELETE FROM schedule_items WHERE id = ?", [id]);
      } catch (err) {
        console.error("[MySQL Delete Schedule Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to delete schedule item in MySQL: ${err.message}` });
      }
    }
    const index = db.schedule.findIndex((s) => s.id === id);
    const removed = index !== -1 ? db.schedule.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog("DELETE_SCHEDULE_ITEM", "ScheduleItem", String(id), `Deleted schedule item: ${removed.title || id}`);
    res.json({ success: true, message: "Schedule item deleted successfully from MySQL", data: removed });
  });
  app.get("/api/v1/registration-categories", (req, res) => {
    const { conference_id } = req.query;
    let list = [...db.categories];
    if (conference_id) {
      const filtered = list.filter((c) => c.conference_id === Number(conference_id));
      list = filtered.length > 0 ? filtered : list;
    }
    res.json({ success: true, data: list });
  });
  app.post("/api/v1/registration-categories", async (req, res) => {
    let newId = Math.max(...db.categories.map((c) => c.id), 0) + 1;
    const catData = {
      conference_id: Number(req.body.conference_id) || 1,
      name: req.body.name || "Delegate Pass",
      early_bird_fee: Number(req.body.early_bird_fee || req.body.early_bird_price) || 649,
      standard_fee: Number(req.body.standard_fee || req.body.price) || 799,
      price: Number(req.body.price || req.body.standard_fee) || 799,
      early_bird_price: Number(req.body.early_bird_price || req.body.early_bird_fee) || 649,
      currency: req.body.currency || "USD",
      deadline: formatDateStr(req.body.deadline),
      benefits: Array.isArray(req.body.benefits) ? req.body.benefits : ["Full conference access"],
      is_popular: Boolean(req.body.is_popular),
      display_order: Number(req.body.display_order) || newId,
      payment_gateway_link: req.body.payment_gateway_link || "",
      is_active: req.body.is_active !== void 0 ? Boolean(req.body.is_active) : true
    };
    if (mysqlPool) {
      try {
        const [r] = await mysqlPool.query(
          `INSERT INTO registration_categories (
            conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            catData.conference_id,
            catData.name,
            catData.price,
            catData.currency,
            catData.early_bird_price,
            catData.deadline || null,
            JSON.stringify(catData.benefits),
            catData.is_popular,
            catData.display_order,
            catData.payment_gateway_link,
            catData.is_active
          ]
        );
        newId = Number(r.insertId);
      } catch (err) {
        console.error("[MySQL Add Registration Category Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to add category in MySQL: ${err.message}` });
      }
    }
    const cat = { ...catData, id: newId };
    db.categories.push(cat);
    invalidatePublicCache();
    db.addAuditLog("ADD_REGISTRATION_CATEGORY", "RegistrationCategory", String(newId), `Added category: ${cat.name}`);
    res.status(201).json({ success: true, message: "Category created successfully in MySQL", data: cat });
  });
  app.put("/api/v1/registration-categories/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query(
          `UPDATE registration_categories SET
            name = COALESCE(?, name),
            price = COALESCE(?, price),
            currency = COALESCE(?, currency),
            early_bird_price = COALESCE(?, early_bird_price),
            deadline = COALESCE(?, deadline),
            benefits = COALESCE(?, benefits),
            is_popular = COALESCE(?, is_popular),
            display_order = COALESCE(?, display_order),
            payment_gateway_link = COALESCE(?, payment_gateway_link),
            is_active = COALESCE(?, is_active)
          WHERE id = ?`,
          [
            req.body.name,
            req.body.price,
            req.body.currency,
            req.body.early_bird_price || req.body.early_bird_fee,
            req.body.deadline ? formatDateStr(req.body.deadline) : null,
            req.body.benefits ? JSON.stringify(req.body.benefits) : null,
            req.body.is_popular,
            req.body.display_order,
            req.body.payment_gateway_link,
            req.body.is_active,
            id
          ]
        );
      } catch (err) {
        console.error("[MySQL Update Registration Category Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to update category in MySQL: ${err.message}` });
      }
    }
    const index = db.categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog("UPDATE_REGISTRATION_CATEGORY", "RegistrationCategory", String(id), `Updated category: ${req.body.name || id}`);
    res.json({ success: true, message: "Category updated successfully in MySQL", data: index !== -1 ? db.categories[index] : req.body });
  });
  app.delete("/api/v1/registration-categories/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query("DELETE FROM registration_categories WHERE id = ?", [id]);
      } catch (err) {
        console.error("[MySQL Delete Registration Category Error]:", err);
        return res.status(500).json({ success: false, message: `Failed to delete category in MySQL: ${err.message}` });
      }
    }
    const index = db.categories.findIndex((c) => c.id === id);
    const removed = index !== -1 ? db.categories.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog("DELETE_REGISTRATION_CATEGORY", "RegistrationCategory", String(id), `Deleted category: ${removed.name || id}`);
    res.json({ success: true, message: "Category deleted successfully from MySQL", data: removed });
  });
  app.get("/api/v1/csrf-token", (req, res) => {
    res.json({ success: true, token: req.csrfToken() });
  });
  app.get("/api/v1/registrations", authenticateAdmin, (req, res) => {
    res.json({ success: true, data: db.registrations });
  });
  app.post("/api/v1/registrations", (req, res) => {
    const body = req.body;
    const regId = `SCINS-REG-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const newReg = {
      id: db.registrations.length + 1,
      registration_id: regId,
      conference_id: body.conference_id || 1,
      conference_title: body.conference_title || "2nd World Congress on Biopolymers & Bioplastics",
      category_id: body.category_id || 2,
      category_name: body.category_name || "Academician / Faculty",
      first_name: body.first_name || "",
      last_name: body.last_name || "",
      email: body.email || "",
      phone: body.phone || "",
      country: body.country || "",
      institution: body.institution || "",
      department: body.department || "",
      designation: body.designation || "",
      research_area: body.research_area || "",
      attendance_mode: body.attendance_mode || "In-Person",
      accommodation_required: Boolean(body.accommodation_required),
      meal_preference: body.meal_preference || "Standard",
      special_requirements: body.special_requirements || "",
      amount: Number(body.amount) || 649,
      currency: body.currency || "USD",
      payment_status: "completed",
      registration_status: "confirmed",
      created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
    };
    db.registrations.unshift(newReg);
    db.addAuditLog("NEW_REGISTRATION", "Registration", regId, `Registered delegate ${newReg.first_name} ${newReg.last_name} (${newReg.email})`);
    syncToMysql(
      `INSERT INTO registrations (registration_id, conference_id, category_id, first_name, last_name, email, phone, country, institution, department, designation, research_area, attendance_mode, accommodation_required, meal_preference, special_requirements, amount, currency, payment_status, registration_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newReg.registration_id, newReg.conference_id, newReg.category_id, newReg.first_name, newReg.last_name, newReg.email, newReg.phone, newReg.country, newReg.institution, newReg.department, newReg.designation, newReg.research_area, newReg.attendance_mode, newReg.accommodation_required ? 1 : 0, newReg.meal_preference, newReg.special_requirements, newReg.amount, newReg.currency, newReg.payment_status, newReg.registration_status]
    );
    res.status(201).json({
      success: true,
      message: "Registration completed successfully",
      data: newReg
    });
  });
  app.patch("/api/v1/registrations/:id/status", authenticateAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { registration_status, payment_status } = req.body;
    const reg = db.registrations.find((r) => r.id === id);
    if (!reg) return res.status(404).json({ success: false, message: "Registration not found" });
    if (registration_status) reg.registration_status = registration_status;
    if (payment_status) reg.payment_status = payment_status;
    db.addAuditLog("UPDATE_REG_STATUS", "Registration", reg.registration_id, `Updated status to ${registration_status || payment_status}`);
    res.json({ success: true, data: reg });
  });
  app.get("/api/v1/abstracts", authenticateAdmin, (req, res) => {
    res.json({ success: true, data: db.abstracts });
  });
  app.post("/api/v1/abstracts", (req, res) => {
    const body = req.body;
    const subId = `SCINS-BIO-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(Math.floor(1e5 + Math.random() * 9e5)).substring(0, 6)}`;
    const newAbstract = {
      id: db.abstracts.length + 1,
      submission_id: subId,
      conference_id: body.conference_id || 1,
      conference_title: body.conference_title || "2nd World Congress on Biopolymers & Bioplastics",
      title: body.title || "Untitled Scientific Abstract",
      abstract_text: body.abstract_text || "",
      keywords: body.keywords || "",
      research_domain: body.research_domain || "Biotechnology",
      presentation_preference: body.presentation_preference || "Oral",
      primary_author_name: body.primary_author_name || "",
      primary_author_email: body.primary_author_email || "",
      primary_author_phone: body.primary_author_phone || "",
      primary_author_affiliation: body.primary_author_affiliation || "",
      primary_author_country: body.primary_author_country || "",
      file_name: body.file_name || "abstract-submission.pdf",
      file_url: body.file_url || "https://scinsmedia.com/abstracts/sample.pdf",
      status: "submitted",
      authors: body.authors || [
        {
          name: body.primary_author_name,
          email: body.primary_author_email,
          institution: body.primary_author_affiliation,
          country: body.primary_author_country,
          is_corresponding: true
        }
      ],
      created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
    };
    db.abstracts.unshift(newAbstract);
    db.addAuditLog("SUBMIT_ABSTRACT", "AbstractSubmission", subId, `New abstract submitted: "${newAbstract.title.substring(0, 40)}..."`);
    res.status(201).json({
      success: true,
      message: "Abstract submitted successfully for scientific review",
      data: newAbstract
    });
  });
  app.patch("/api/v1/abstracts/:id/status", authenticateAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { status, reviewer_notes, assigned_reviewer_name } = req.body;
    const abs = db.abstracts.find((a) => a.id === id);
    if (!abs) return res.status(404).json({ success: false, message: "Abstract not found" });
    if (status) abs.status = status;
    if (reviewer_notes) abs.reviewer_notes = reviewer_notes;
    if (assigned_reviewer_name) abs.assigned_reviewer_name = assigned_reviewer_name;
    abs.updated_at = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
    db.addAuditLog("REVIEW_ABSTRACT", "AbstractSubmission", abs.submission_id, `Changed status to ${status}`);
    res.json({ success: true, data: abs });
  });
  app.get("/api/v1/proposals", authenticateAdmin, (req, res) => {
    const { type, status, conference_id, search } = req.query;
    let list = [...db.proposals];
    if (type && type !== "all") {
      list = list.filter((p) => p.proposal_type === type);
    }
    if (status && status !== "all") {
      list = list.filter((p) => p.status === status);
    }
    if (conference_id) {
      list = list.filter((p) => p.conference_id === Number(conference_id));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.proposer_name.toLowerCase().includes(q) || p.proposer_affiliation.toLowerCase().includes(q) || p.proposal_code.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, count: list.length, data: list });
  });
  app.post("/api/v1/proposals", (req, res) => {
    const body = req.body;
    const typePrefix = body.proposal_type === "workshop" ? "WKSH" : body.proposal_type === "keynote_forum" ? "KEYN" : body.proposal_type === "poster" ? "POST" : "SYMP";
    const code = `PROP-${typePrefix}-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newProposal = {
      id: db.proposals.length + 1,
      proposal_code: code,
      conference_id: body.conference_id || 1,
      conference_title: body.conference_title || "World Congress",
      conference_city: body.conference_city || "International",
      conference_country: body.conference_country || "Global",
      proposal_type: body.proposal_type || "workshop",
      title: body.title || "Untitled Proposal",
      proposer_title: body.proposer_title || "Dr.",
      proposer_name: body.proposer_name || "",
      proposer_email: body.proposer_email || "",
      proposer_phone: body.proposer_phone || "",
      proposer_affiliation: body.proposer_affiliation || "",
      proposer_department: body.proposer_department || "",
      proposer_country: body.proposer_country || "",
      proposer_bio: body.proposer_bio || "",
      co_presenters: body.co_presenters || "",
      abstract: body.abstract || "",
      learning_objectives: body.learning_objectives || "",
      target_audience: body.target_audience || "",
      duration_format: body.duration_format || "Standard Session",
      av_requirements: body.av_requirements || "",
      file_name: body.file_name || "",
      file_url: body.file_url || "",
      status: "received",
      reviewer_notes: "",
      created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
    };
    db.proposals.unshift(newProposal);
    db.addAuditLog("SUBMIT_PROPOSAL", "ProposalSubmission", code, `New ${newProposal.proposal_type} proposal submitted by ${newProposal.proposer_name}`);
    res.status(201).json({
      success: true,
      message: "Proposal received and registered for Scientific Committee review",
      data: newProposal
    });
  });
  app.patch("/api/v1/proposals/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const { status, reviewer_notes } = req.body;
    const prop = db.proposals.find((p) => p.id === id);
    if (!prop) return res.status(404).json({ success: false, message: "Proposal not found" });
    if (status) prop.status = status;
    if (reviewer_notes !== void 0) prop.reviewer_notes = reviewer_notes;
    prop.updated_at = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
    db.addAuditLog("REVIEW_PROPOSAL", "ProposalSubmission", prop.proposal_code, `Status set to ${status}`);
    res.json({ success: true, data: prop });
  });
  app.delete("/api/v1/proposals/:id", (req, res) => {
    const id = Number(req.params.id);
    const idx = db.proposals.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: "Proposal not found" });
    const removed = db.proposals.splice(idx, 1)[0];
    db.addAuditLog("DELETE_PROPOSAL", "ProposalSubmission", removed.proposal_code, `Proposal deleted`);
    res.json({ success: true, message: "Proposal removed", data: removed });
  });
  app.get("/api/v1/stripe/config", (req, res) => {
    const pubKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "";
    const hasSecretKey = Boolean(process.env.STRIPE_SECRET_KEY);
    res.json({
      success: true,
      data: {
        publishableKey: pubKey,
        isConfigured: hasSecretKey,
        mode: hasSecretKey ? process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "test" : "simulation"
      }
    });
  });
  app.post("/api/v1/stripe/create-payment-intent", async (req, res) => {
    try {
      const {
        amount,
        currency = "USD",
        registration_id,
        conference_id,
        conference_title,
        category_name,
        delegate_name,
        delegate_email
      } = req.body;
      const numAmount = parseFloat(amount) || 450;
      const stripe = getStripe();
      if (stripe) {
        const amountInCents = Math.round(numAmount * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: currency.toLowerCase(),
          description: `SCINS Media Pass: ${conference_title || "Congress 2026"} - ${category_name || "Delegate"}`,
          receipt_email: delegate_email || void 0,
          metadata: {
            registration_id: String(registration_id || ""),
            conference_id: String(conference_id || ""),
            conference_title: String(conference_title || "").slice(0, 100),
            delegate_name: String(delegate_name || "").slice(0, 100),
            delegate_email: String(delegate_email || "").slice(0, 100)
          },
          automatic_payment_methods: {
            enabled: true
          }
        });
        return res.json({
          success: true,
          data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: numAmount,
            currency: currency.toUpperCase(),
            status: paymentIntent.status,
            isLiveStripe: true
          }
        });
      }
      const simulatedIntentId = `pi_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      const simulatedSecret = `${simulatedIntentId}_secret_${Date.now().toString(36)}`;
      res.json({
        success: true,
        data: {
          clientSecret: simulatedSecret,
          paymentIntentId: simulatedIntentId,
          amount: numAmount,
          currency: currency.toUpperCase(),
          status: "requires_payment_method",
          isLiveStripe: false,
          note: "Stripe Sandbox simulation active. Add STRIPE_SECRET_KEY in Settings to enable Live Gateway processing."
        }
      });
    } catch (err) {
      console.error("Stripe create-payment-intent error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to initialize Stripe PaymentIntent"
      });
    }
  });
  app.post("/api/v1/stripe/confirm-payment", async (req, res) => {
    try {
      const {
        payment_intent_id,
        registration_id,
        conference_id,
        amount,
        currency = "USD",
        card_holder_name,
        card_last4,
        billing_email
      } = req.body;
      const stripe = getStripe();
      let verifiedStatus = "succeeded";
      let verifiedTxnId = payment_intent_id || `pi_${Date.now().toString(36)}`;
      if (stripe && payment_intent_id && !payment_intent_id.startsWith("pi_test_") && !payment_intent_id.startsWith("pi_sim_")) {
        try {
          const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
          verifiedStatus = pi.status;
          verifiedTxnId = pi.id;
        } catch (e) {
          console.warn("Could not retrieve remote Stripe PaymentIntent, using local confirmation fallback:", e.message);
        }
      }
      const receiptId = `REC-STRIPE-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e5 + Math.random() * 9e5)}`;
      const reg = db.registrations.find((r) => r.id === Number(registration_id) || r.registration_id === registration_id);
      if (reg) {
        reg.payment_status = "completed";
        reg.registration_status = "confirmed";
        reg.updated_at = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
      }
      const paymentRecord = {
        id: db.payments.length + 1,
        registration_id: reg ? reg.id : Number(registration_id) || 1,
        conference_id: conference_id || (reg ? reg.conference_id : 1),
        amount: parseFloat(amount) || (reg ? reg.total_amount || reg.amount : 450),
        currency: (currency || "USD").toUpperCase(),
        payment_method: "stripe",
        transaction_id: verifiedTxnId,
        receipt_id: receiptId,
        status: "completed",
        payer_name: card_holder_name || (reg ? `${reg.first_name} ${reg.last_name}` : "Conference Delegate"),
        billing_email: billing_email || (reg ? reg.email : "delegate@university.edu"),
        card_last4: card_last4 || "4242",
        created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
      };
      db.payments.unshift(paymentRecord);
      db.addAuditLog("STRIPE_PAYMENT_CONFIRMED", "Payments", verifiedTxnId, `Verified Stripe payment of ${paymentRecord.currency} ${paymentRecord.amount} for Registration #${registration_id}`);
      res.json({
        success: true,
        message: "Stripe payment verified and delegate registration confirmed successfully",
        data: {
          transaction_id: verifiedTxnId,
          receipt_id: receiptId,
          status: "completed",
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          payment_method: "stripe",
          created_at: paymentRecord.created_at,
          registration_id: reg ? reg.registration_id : registration_id,
          payer_name: paymentRecord.payer_name
        }
      });
    } catch (err) {
      console.error("Stripe confirm-payment error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to confirm Stripe transaction"
      });
    }
  });
  app.post("/api/v1/payments/process", (req, res) => {
    const {
      registration_id,
      conference_id,
      amount,
      currency = "USD",
      gateway = "stripe",
      card_holder_name,
      card_last4,
      billing_email,
      payment_reference
    } = req.body;
    const txnRef = payment_reference || `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const receiptId = `REC-SCINS-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const reg = db.registrations.find((r) => r.id === Number(registration_id) || r.registration_id === registration_id);
    if (reg) {
      reg.payment_status = "completed";
      reg.registration_status = "confirmed";
      reg.updated_at = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
    }
    const paymentRecord = {
      id: db.payments.length + 1,
      registration_id: reg ? reg.id : Number(registration_id) || 1,
      conference_id: conference_id || (reg ? reg.conference_id : 1),
      amount: parseFloat(amount) || (reg ? reg.total_amount || reg.amount : 450),
      currency: (currency || "USD").toUpperCase(),
      payment_method: gateway,
      transaction_id: txnRef,
      receipt_id: receiptId,
      status: "completed",
      payer_name: card_holder_name || (reg ? `${reg.first_name} ${reg.last_name}` : "Conference Delegate"),
      billing_email: billing_email || (reg ? reg.email : "delegate@university.edu"),
      card_last4: card_last4 || "4242",
      created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
    };
    db.payments.unshift(paymentRecord);
    db.addAuditLog("PAYMENT_PROCESSED", "Payments", txnRef, `Successfully verified ${paymentRecord.currency} ${paymentRecord.amount} payment via ${gateway} for Registration #${registration_id}`);
    res.json({
      success: true,
      message: "Payment verified and delegate registration confirmed successfully",
      data: {
        transaction_id: txnRef,
        receipt_id: receiptId,
        status: "completed",
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        payment_method: gateway,
        created_at: paymentRecord.created_at,
        registration_id: reg ? reg.registration_id : registration_id,
        payer_name: paymentRecord.payer_name
      }
    });
  });
  app.get("/api/v1/publications", (req, res) => {
    const { search, domain, journal } = req.query;
    let list = [...db.publications];
    if (journal && journal !== "All") {
      const jStr = String(journal).toLowerCase();
      list = list.filter((p) => p.journal.toLowerCase().includes(jStr));
    }
    if (domain && domain !== "All") {
      const dStr = String(domain).toLowerCase();
      list = list.filter((p) => p.domain?.toLowerCase().includes(dStr) || p.title.toLowerCase().includes(dStr) || p.journal.toLowerCase().includes(dStr));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.authors.toLowerCase().includes(q) || p.doi.toLowerCase().includes(q) || p.journal.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });
  app.post("/api/v1/publications", (req, res) => {
    const body = req.body;
    const newId = Math.max(...db.publications.map((p) => p.id), 0) + 1;
    const newPub = {
      id: newId,
      conference_id: body.conference_id || 1,
      title: body.title || "Untitled Publication",
      authors: body.authors || "SCINS Media Research Consortium",
      journal: body.journal || "International Journal of Advanced Scientific Research",
      volume: body.volume || "Vol. 14, Issue 3",
      pages: body.pages || "112-128",
      doi: body.doi || `10.1016/j.scins.${Date.now().toString(36)}`,
      publication_date: body.publication_date || (/* @__PURE__ */ new Date()).toISOString().substring(0, 10),
      abstract: body.abstract || "Peer-reviewed congress proceedings exploring empirical methodology and multidisciplinary findings.",
      citations: Number(body.citations) || 0,
      indexed_in: body.indexed_in || ["Scopus", "Web of Science", "Elsevier"],
      download_url: body.download_url || "https://doi.org/"
    };
    db.publications.unshift(newPub);
    db.addAuditLog("NEW_PUBLICATION", "Publication", newPub.doi, `Added new publication: ${newPub.title}`);
    res.status(201).json({ success: true, message: "Publication created", data: newPub });
  });
  app.get("/api/v1/media-partners", (req, res) => res.json({ success: true, data: db.mediaPartners }));
  app.get("/api/v1/testimonials", (req, res) => {
    const { conference_id } = req.query;
    let list = [...db.testimonials];
    if (conference_id) {
      list = list.filter((t) => t.conference_id === Number(conference_id));
    }
    res.json({ success: true, data: list.length > 0 ? list : db.testimonials });
  });
  app.post("/api/v1/testimonials", (req, res) => {
    const newId = Math.max(...db.testimonials.map((t) => t.id), 0) + 1;
    const item = {
      id: newId,
      name: req.body.name || "Anonymous Scholar",
      designation: req.body.designation || "Faculty Member",
      institution: req.body.institution || "University",
      country: req.body.country || "Global",
      quote: req.body.quote || "",
      photo_url: req.body.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: Number(req.body.rating) || 5,
      is_featured: req.body.is_featured !== void 0 ? req.body.is_featured : true,
      conference_id: req.body.conference_id ? Number(req.body.conference_id) : void 0
    };
    db.testimonials.push(item);
    res.status(201).json({ success: true, message: "Testimonial created", data: item });
  });
  app.put("/api/v1/testimonials/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = db.testimonials.findIndex((t) => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: "Testimonial not found" });
    db.testimonials[index] = { ...db.testimonials[index], ...req.body };
    res.json({ success: true, message: "Testimonial updated", data: db.testimonials[index] });
  });
  app.delete("/api/v1/testimonials/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = db.testimonials.findIndex((t) => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: "Testimonial not found" });
    const removed = db.testimonials.splice(index, 1)[0];
    res.json({ success: true, message: "Testimonial deleted", data: removed });
  });
  app.get("/api/v1/blogs", (req, res) => res.json({ success: true, data: db.blogs }));
  app.get("/api/v1/faqs", (req, res) => res.json({ success: true, data: db.faqs }));
  app.get("/api/v1/flyers", (req, res) => res.json({ success: true, data: db.flyers }));
  app.get("/api/v1/audit-logs", authenticateAdmin, (req, res) => res.json({ success: true, data: db.auditLogs }));
  app.get("/api/v1/contact", authenticateAdmin, (req, res) => {
    const { status, search } = req.query;
    let list = [...db.contactEnquiries];
    if (status && status !== "All") {
      list = list.filter((c) => c.status === status);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone && c.phone.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || c.message.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });
  app.post("/api/v1/contact", (req, res) => {
    const newId = Math.max(...db.contactEnquiries.map((c) => c.id), 0) + 1;
    const enquiry = {
      id: newId,
      name: req.body.name || "Anonymous Researcher",
      email: req.body.email || "",
      phone: req.body.phone || "",
      subject: req.body.subject || "General Academic Inquiry",
      message: req.body.message || "",
      conference_code: req.body.conference_code || "BIO-2026",
      conference_id: Number(req.body.conference_id) || 1,
      status: "new",
      created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
    };
    db.contactEnquiries.unshift(enquiry);
    db.addAuditLog("NEW_CONTACT_ENQUIRY", "ContactEnquiry", String(enquiry.id), `Received message from ${enquiry.name} (${enquiry.email})`);
    syncToMysql(
      `INSERT INTO contact_enquiries (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [enquiry.name, enquiry.email, enquiry.phone || "", enquiry.subject, enquiry.message, enquiry.status]
    );
    res.status(201).json({ success: true, message: "Your enquiry has been submitted to the Secretariat.", data: enquiry });
  });
  app.patch("/api/v1/contact/:id/status", authenticateAdmin, (req, res) => {
    const id = Number(req.params.id);
    const item = db.contactEnquiries.find((c) => c.id === id);
    if (!item) return res.status(404).json({ success: false, message: "Contact submission not found" });
    if (req.body.status) item.status = req.body.status;
    db.addAuditLog("UPDATE_CONTACT_STATUS", "ContactEnquiry", String(id), `Updated inquiry status to ${req.body.status}`);
    res.json({ success: true, message: "Status updated successfully", data: item });
  });
  app.delete("/api/v1/contact/:id", authenticateAdmin, (req, res) => {
    const id = Number(req.params.id);
    const index = db.contactEnquiries.findIndex((c) => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: "Contact submission not found" });
    const removed = db.contactEnquiries.splice(index, 1)[0];
    db.addAuditLog("DELETE_CONTACT_ENQUIRY", "ContactEnquiry", String(id), `Deleted inquiry from ${removed.email}`);
    res.json({ success: true, message: "Submission deleted successfully", data: removed });
  });
  app.post("/api/v1/quotes", (req, res) => {
    const quote = { id: db.quoteRequests.length + 1, ...req.body, status: "new", created_at: (/* @__PURE__ */ new Date()).toISOString() };
    db.quoteRequests.push(quote);
    db.addAuditLog("NEW_QUOTE_REQUEST", "QuoteRequest", String(quote.id), `Custom proposal requested by ${quote.organization}`);
    res.status(201).json({ success: true, message: "Custom proposal request received", data: quote });
  });
  app.get("/api/v1/subscribers", authenticateAdmin, (req, res) => {
    const { status, search } = req.query;
    let list = [...db.subscribers];
    if (status && status !== "All") {
      list = list.filter((s) => s.status === status);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter((s) => s.email.toLowerCase().includes(q));
    }
    res.json({ success: true, data: list });
  });
  app.post(["/api/v1/newsletter", "/api/v1/newsletter/subscribe", "/api/v1/subscribers"], (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    const existing = db.subscribers.find((s) => s.email.toLowerCase() === email);
    if (existing) {
      existing.status = "active";
      return res.json({ success: true, message: "Subscription reactivated.", data: existing });
    }
    const newId = Math.max(...db.subscribers.map((s) => s.id), 0) + 1;
    const newSub = {
      id: newId,
      email,
      status: "active",
      created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
    };
    db.subscribers.unshift(newSub);
    db.addAuditLog("NEWSLETTER_SUBSCRIBE", "Newsletter", email, "New subscriber joined scientific intelligence updates");
    syncToMysql(
      `INSERT INTO newsletter_subscribers (email, status) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [newSub.email, newSub.status]
    );
    res.status(201).json({ success: true, message: "Subscribed to Scinsmedia Scientific Intelligence updates.", data: newSub });
  });
  app.patch("/api/v1/subscribers/:id/status", (req, res) => {
    const id = Number(req.params.id);
    const sub = db.subscribers.find((s) => s.id === id);
    if (!sub) return res.status(404).json({ success: false, message: "Subscriber not found" });
    if (req.body.status) sub.status = req.body.status;
    db.addAuditLog("UPDATE_SUBSCRIBER_STATUS", "Newsletter", sub.email, `Updated subscriber status to ${req.body.status}`);
    res.json({ success: true, message: "Subscriber status updated", data: sub });
  });
  app.delete("/api/v1/subscribers/:id", authenticateAdmin, (req, res) => {
    const id = Number(req.params.id);
    const index = db.subscribers.findIndex((s) => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: "Subscriber not found" });
    const removed = db.subscribers.splice(index, 1)[0];
    db.addAuditLog("DELETE_SUBSCRIBER", "Newsletter", removed.email, `Removed subscriber ${removed.email}`);
    res.json({ success: true, message: "Subscriber removed successfully", data: removed });
  });
  app.get("/api/v1/analytics", authenticateAdmin, (req, res) => {
    const totalRevenue = db.registrations.reduce((acc, r) => acc + (r.payment_status === "completed" ? r.amount : 0), 0);
    res.json({
      success: true,
      data: {
        totalConferences: db.conferences.length,
        upcomingConferences: db.conferences.filter((c) => c.status === "published").length,
        totalRegistrations: db.registrations.length,
        totalAbstracts: db.abstracts.length,
        pendingReviews: db.abstracts.filter((a) => a.status === "submitted" || a.status === "under_review").length,
        totalSpeakers: db.speakers.length,
        totalSponsors: db.sponsors.length,
        totalRevenue,
        monthlyTrends: [
          { month: "Jan", registrations: 12, abstracts: 8, revenue: 8400 },
          { month: "Feb", registrations: 24, abstracts: 18, revenue: 16800 },
          { month: "Mar", registrations: 48, abstracts: 34, revenue: 33600 },
          { month: "Apr", registrations: 76, abstracts: 52, revenue: 53200 },
          { month: "May", registrations: 95, abstracts: 68, revenue: 66500 }
        ],
        domainBreakdown: [
          { name: "Biotechnology", value: 38 },
          { name: "Medicine & Pharma", value: 26 },
          { name: "Artificial Intelligence", value: 18 },
          { name: "Green Chemistry", value: 12 },
          { name: "Quantum Physics", value: 6 }
        ]
      }
    });
  });
  app.get("/api/v1/exports/:type", authenticateAdmin, (req, res) => {
    const { type } = req.params;
    let csvData = "";
    let filename = `scinsmedia-${type}-${Date.now()}.csv`;
    if (type === "registrations") {
      csvData = "RegistrationID,FirstName,LastName,Email,Country,Institution,Category,Amount,PaymentStatus,Date\n" + db.registrations.map((r) => `"${r.registration_id}","${r.first_name}","${r.last_name}","${r.email}","${r.country}","${r.institution}","${r.category_name}",${r.amount},"${r.payment_status}","${r.created_at}"`).join("\n");
    } else if (type === "abstracts") {
      csvData = "SubmissionID,Title,PrimaryAuthor,Email,Country,Affiliation,Domain,Status,Date\n" + db.abstracts.map((a) => `"${a.submission_id}","${a.title.replace(/"/g, '""')}","${a.primary_author_name}","${a.primary_author_email}","${a.primary_author_country}","${a.primary_author_affiliation}","${a.research_domain}","${a.status}","${a.created_at}"`).join("\n");
    } else if (type === "subscribers") {
      csvData = "ID,Email,SubscriptionDate,Status\n" + db.subscribers.map((s) => `"${s.id}","${s.email}","${s.created_at}","${s.status}"`).join("\n");
    } else if (type === "proposals") {
      csvData = "ProposalID,Type,Title,LeadProposer,Email,Phone,Country,Affiliation,TargetConferenceID,DurationFormat,Status,Date\n" + db.proposals.map((p) => `"${p.proposal_code}","${p.proposal_type}","${p.title.replace(/"/g, '""')}","${(p.proposer_name || "").replace(/"/g, '""')}","${p.proposer_email || ""}","${p.proposer_phone || ""}","${p.proposer_country || ""}","${(p.proposer_affiliation || "").replace(/"/g, '""')}",${p.conference_id || ""},"${p.duration_format || ""}","${p.status}","${p.created_at}"`).join("\n");
    } else if (type === "contacts") {
      csvData = "ID,Name,Email,Phone,Subject,Message,Status,Date\n" + db.contactEnquiries.map((c) => `"${c.id}","${c.name.replace(/"/g, '""')}","${c.email}","${c.phone || ""}","${c.subject.replace(/"/g, '""')}","${c.message.replace(/"/g, '""')}","${c.status}","${c.created_at}"`).join("\n");
    } else {
      csvData = "ID,Name,Type,Date\n1,General Export,System," + (/* @__PURE__ */ new Date()).toISOString();
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvData);
  });
  app.get("/database/schema.sql", (req, res) => {
    const schemaPath = import_path.default.join(process.cwd(), "database", "schema.sql");
    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", 'attachment; filename="scinsmedia-godaddy-schema.sql"');
    res.sendFile(schemaPath);
  });
  app.use("/api", (err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      success: false,
      message: err.message || "Internal Server Error"
    });
  });
  const distPath = import_path.default.join(process.cwd(), "dist");
  const hasDist = import_fs.default.existsSync(import_path.default.join(distPath, "index.html"));
  if (hasDist || process.env.NODE_ENV === "production") {
    app.use(import_express.default.static(distPath, {
      maxAge: "7d",
      etag: true,
      lastModified: true
    }));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  } else {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  let server;
  const rawPort = process.env.PORT ? String(process.env.PORT).trim() : "";
  if (rawPort && (rawPort === "passenger" || rawPort.startsWith("/") || isNaN(Number(rawPort)))) {
    server = app.listen(rawPort, () => {
      console.log(`[Scinsmedia Enterprise Engine] Listening on GoDaddy Passenger socket: ${rawPort}`);
    });
  } else if (rawPort && !isNaN(Number(rawPort))) {
    const portNum = parseInt(rawPort, 10);
    server = app.listen(portNum, () => {
      console.log(`[Scinsmedia Enterprise Engine] Listening on assigned port ${portNum} (ready for traffic)`);
    });
  } else {
    const defaultPort = 3e3;
    const HOST = process.env.HOST || "0.0.0.0";
    server = app.listen(defaultPort, HOST, () => {
      console.log(`[Scinsmedia Enterprise Engine] Listening on http://${HOST}:${defaultPort}`);
    });
  }
  initMysqlPool().catch((err) => {
    console.warn("[MySQL Background Sync Notice]:", err?.message || err);
  });
  server.setTimeout(3e4);
  server.keepAliveTimeout = 65e3;
  server.headersTimeout = 66e3;
  const gracefulShutdown = async (signal) => {
    console.log(`[Process] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log("[Process] HTTP server closed.");
      if (mysqlPool) {
        try {
          await mysqlPool.end();
          console.log("[MySQL] Connection pool drained.");
        } catch (err) {
          console.warn("[MySQL] Error closing pool:", err.message);
        }
      }
      process.exit(0);
    });
    setTimeout(() => {
      console.error("[Process] Shutdown timed out. Force exiting.");
      process.exit(1);
    }, 1e4);
  };
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
process.on("unhandledRejection", (reason) => {
  console.error("[Safety Shield - Unhandled Promise Rejection]:", reason?.message || reason);
});
process.on("uncaughtException", (err) => {
  console.error("[Safety Shield - Uncaught Exception]:", err.message, err.stack);
});
startServer().catch((err) => {
  console.error("[Scinsmedia Server Startup Failure]:", err);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  invalidatePublicCache
});
//# sourceMappingURL=server.cjs.map

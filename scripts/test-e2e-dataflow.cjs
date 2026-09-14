// =============================================================================
// Comprehensive E2E Verification Script: Admin Panel -> MySQL/API -> Frontend
// =============================================================================

const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, rawData: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('=== STEP 1: AUTHENTICATION FLOW VERIFICATION ===');
  
  // 1A. Test invalid login
  const badLogin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@scinsmedia.com', password: 'wrongpassword' });
  
  if (badLogin.status === 401) {
    console.log('✔ Correctly rejected unauthorized admin credentials (HTTP 401)');
  } else {
    console.error('❌ Failed 401 check on bad password:', badLogin.status);
  }

  // 1B. Test valid login
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@scinsmedia.com';
  const testPassword = process.env.TEST_ADMIN_PASSWORD || 'Prey@nsh2018';
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: adminEmail, password: testPassword });

  if (loginRes.status !== 200 || !loginRes.data.data?.token) {
    console.error('❌ Login failed:', loginRes);
    process.exit(1);
  }
  const token = loginRes.data.data.token;
  console.log('✔ Successfully authenticated admin, received JWT token');

  console.log('\n=== STEP 2: CREATE NEW CONFERENCE FLOW (14-STEP WIZARD SIMULATION) ===');
  
  const testSlug = 'ai-medicine-summit-2027';
  const newConferencePayload = {
    title: 'Global Summit on AI in Medicine & Clinical Robotics 2027',
    short_title: 'AI Medicine 2027',
    slug: testSlug,
    conference_code: 'SCINS-AIMED-2027',
    theme: 'Revolutionizing Clinical Diagnostics and Precision Therapeutics with Autonomous Intelligence',
    tagline: 'Bridging Neural Networks with Clinical Practice for Global Healthcare Transformation',
    description: 'The premier worldwide symposium uniting computational biologists, diagnostic radiologists, clinical roboticists, and healthcare AI leaders.',
    detailed_about: 'The Global Summit on AI in Medicine 2027 represents the epicenter of technological transformation in clinical workflow automation, AI-driven drug discovery, and robotic surgery precision. Over three intensive days in Geneva, Switzerland, international faculty will present peer-reviewed benchmarks, regulatory compliance frameworks, and clinical deployment trials.',
    domain: 'Artificial Intelligence & Medicine',
    city: 'Geneva',
    country: 'Switzerland',
    venue: 'Centre International de Conférences Genève (CICG)',
    venue_address: '17 Rue de Varembé, 1211 Genève, Switzerland',
    timezone: 'Europe/Zurich (UTC+2)',
    start_date: '2027-05-18',
    end_date: '2027-05-20',
    abstract_deadline: '2027-04-01',
    early_bird_deadline: '2027-03-15',
    registration_deadline: '2027-05-01',
    mode: 'hybrid',
    status: 'published',
    display_order: 3,
    hero_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80',
    logo_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=200&q=80',
    flyer_url: 'https://scinsmedia.com/downloads/ai-medicine-2027-brochure.pdf',
    sample_abstract_url: '/sample-abstract-template.pdf',
    featured_badge: 'Inaugural Geneva Congress',
    about_heading: 'Autonomous Medicine & Algorithmic Diagnosis at Global Scale',
    about_highlights: [
      'Over 600+ physical clinical investigators from 35 countries',
      '20 specialized clinical AI tracks and hands-on algorithm workshops',
      'Springer Nature Computer Science indexed proceedings',
      'Live robotic surgical system demonstration suite'
    ],
    gallery_images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80'
    ],
    welcome_heading: 'Message from the Program Chair',
    welcome_message: 'On behalf of the International Medical AI Federation and SCINS Media, it is my distinct honor to welcome clinicians, data scientists, and surgical engineers to Geneva. Our mission is to accelerate the safe, ethical, and high-precision translation of foundation models into patient-centered care.',
    welcome_speaker_name: 'Prof. Sophia Laurent, M.D., Ph.D.',
    welcome_speaker_role: 'Program General Chair',
    welcome_speaker_title: 'Director of Machine Intelligence in Health, University of Geneva & Geneva University Hospitals',
    welcome_speaker_image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    welcome_footer_text: 'Join us at CICG Geneva in May 2027 to shape the future of algorithmic healthcare.',
    exhibitor_heading: 'Global MedTech & Clinical AI Technology Showcase',
    exhibitor_message: 'Explore next-generation AI diagnostic consoles, surgical navigation robots, and real-time clinical NLP tools from industry leaders.',
    exhibitor_speaker_name: 'Confirmed Industry Partners',
    exhibitor_speaker_role: 'Global Technology Sponsors',
    exhibitor_speaker_title: 'Exhibition Hall B (Booths AI-01 to AI-50)',
    exhibitor_image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=500&q=80',
    exhibitor_footer_text: 'Demonstrations and technical product workshops hosted hourly.',
    program_image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    meta_title: 'Global Summit on AI in Medicine 2027 | Geneva Congress',
    meta_description: 'Join 600+ medical AI researchers and clinical roboticists in Geneva. Submit your peer-reviewed abstract and register today.',
    keywords: 'medical AI, clinical robotics, healthcare LLMs, machine learning diagnostics, Geneva conference 2027',
    accept_late_breaking: true,
    cme_credits_eligible: true,
    primary_language: 'English',
    max_attendees: 600,
    accent_color: 'indigo',
    journal_name: 'International Journal of Clinical Artificial Intelligence',
    journal_issn: '2768-4321',
    indexing_partners: ['Scopus', 'PubMed Central', 'Web of Science'],

    // Child Entities
    committee: [
      {
        name: 'Prof. Sophia Laurent, M.D., Ph.D.',
        designation: 'Chair of Computational Medicine',
        institution: 'University of Geneva',
        country: 'Switzerland',
        committee_role: 'General Chair',
        photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
        biography: 'Prof. Laurent has published over 180 papers in Lancet Digital Health and Nature Medicine.',
        display_order: 1
      },
      {
        name: 'Dr. Lucas Van Der Berg',
        designation: 'Head of Surgical Robotics',
        institution: 'KU Leuven',
        country: 'Belgium',
        committee_role: 'Technical Co-Chair',
        photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        biography: 'Dr. Van Der Berg pioneered sub-millimeter autonomous suture guidance algorithms.',
        display_order: 2
      }
    ],

    speakers: [
      {
        name: 'Dr. Amina Al-Fassi',
        prefix: 'Dr.',
        designation: 'Chief AI Officer',
        institution: 'Zurich Health Labs',
        country: 'Switzerland',
        research_domain: 'Multimodal Foundation Models',
        photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        biography: 'Leading expert in whole-slide histopathology AI models with billions of parameters.',
        speaker_type: 'Keynote',
        talk_title: 'Multimodal Foundation Models for Zero-Shot Rare Disease Diagnosis',
        display_order: 1
      }
    ],

    sessions: [
      {
        session_code: 'AIMED-SES-01',
        title: 'Foundation Models & Multimodal Reasoning in Clinical Radiology',
        track: 'Medical Imaging AI',
        session_type: 'Keynote Session',
        session_date: '2027-05-18',
        start_time: '09:30',
        end_time: '11:00',
        room: 'Auditorium Rousseau',
        description: 'Deep neural networks for zero-shot lesion segmentation and automated radiological reporting.'
      },
      {
        session_code: 'AIMED-SES-02',
        title: 'Autonomous Surgical Robotics: Haptic Feedback and Computer Vision Guidance',
        track: 'Surgical Robotics',
        session_type: 'Oral Presentation',
        session_date: '2027-05-18',
        start_time: '11:15',
        end_time: '12:45',
        room: 'Amphitheatre Voltaire',
        description: 'Next-generation robotic arms with sub-millimeter precision in minimally invasive laparoscopic surgery.'
      }
    ],

    categories: [
      {
        name: 'Clinical Presenter Pass',
        price: 750,
        standard_fee: 750,
        early_bird_fee: 650,
        early_bird_price: 650,
        currency: 'EUR',
        payment_gateway_link: 'https://buy.stripe.com/test_aimed_pass_presenter',
        description: 'For clinicians and researchers delivering accepted oral or keynote talks.',
        benefits: [
          'Full 3-day access to all clinical AI sessions',
          'Dedicated podium speaking slot & session recording',
          'Official CME Certificate (18 AMA PRA Category 1 Credits)',
          'Gala dinner and networking reception ticket'
        ],
        is_popular: true,
        display_order: 1
      },
      {
        name: 'Standard Delegate Pass',
        price: 600,
        standard_fee: 600,
        early_bird_fee: 500,
        early_bird_price: 500,
        currency: 'EUR',
        payment_gateway_link: 'https://buy.stripe.com/test_aimed_pass_delegate',
        description: 'Full conference access for physicians, engineers, and observers.',
        benefits: [
          'Access to all technical tracks and exhibitions',
          'Printed conference proceedings & delegate satchel',
          'Daily luncheon & networking coffee intervals'
        ],
        is_popular: false,
        display_order: 2
      }
    ],

    sponsors: [
      {
        name: 'SwissMed AI Systems',
        company_name: 'SwissMed AI Systems',
        logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80',
        website: 'https://swissmed-ai.ch',
        tier: 'Platinum Sponsor'
      }
    ],

    media_partners: [
      {
        name: 'Frontiers in Digital Health & Robotics',
        logo_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=300&q=80',
        website: 'https://frontiersin.org',
        description: 'Official academic publishing partner indexing accepted proceedings.'
      }
    ],

    schedule: [
      {
        day_number: 1,
        day_label: 'Day 1',
        schedule_date: '2027-05-18',
        start_time: '08:30',
        end_time: '09:15',
        title: 'Badge Collection & Welcome Breakfast',
        room: 'Main Foyer CICG',
        item_type: 'ceremony'
      },
      {
        day_number: 1,
        day_label: 'Day 1',
        schedule_date: '2027-05-18',
        start_time: '09:15',
        end_time: '10:00',
        title: 'Keynote Address: Multimodal Foundation Models in Rare Diseases',
        speaker_name: 'Dr. Amina Al-Fassi',
        room: 'Auditorium Rousseau',
        item_type: 'keynote'
      },
      {
        day_number: 2,
        day_label: 'Day 2',
        schedule_date: '2027-05-19',
        start_time: '09:00',
        end_time: '10:30',
        title: 'Autonomous Robotic Surgery Live Stream & Q&A',
        speaker_name: 'Dr. Lucas Van Der Berg',
        room: 'Auditorium Rousseau',
        item_type: 'keynote'
      }
    ]
  };

  const createRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/conferences',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, newConferencePayload);

  if (createRes.status !== 201 || !createRes.data?.data) {
    console.error('❌ Conference creation failed:', createRes);
    process.exit(1);
  }
  const createdConf = createRes.data.data;
  console.log(`✔ Created conference: ID=${createdConf.id}, Title="${createdConf.title}", Slug="${createdConf.slug}"`);

  console.log('\n=== STEP 3: VERIFY CREATED DATA FROM REST API ===');
  
  const getCreated = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/conferences/${testSlug}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (getCreated.status !== 200 || !getCreated.data?.data) {
    console.error('❌ Failed to retrieve created conference:', getCreated);
    process.exit(1);
  }
  const fetched = getCreated.data.data;

  // Assertions on all wizard fields
  const assertions = [
    { label: 'Title match', test: fetched.title === newConferencePayload.title },
    { label: 'Slug match', test: fetched.slug === testSlug },
    { label: 'Conference code match', test: fetched.conference_code === 'SCINS-AIMED-2027' },
    { label: 'Theme match', test: fetched.theme === newConferencePayload.theme },
    { label: 'Venue match', test: fetched.venue === newConferencePayload.venue },
    { label: 'City / Country match', test: fetched.city === 'Geneva' && fetched.country === 'Switzerland' },
    { label: 'Welcome Speaker Name', test: fetched.welcome_speaker_name === 'Prof. Sophia Laurent, M.D., Ph.D.' },
    { label: 'Welcome Heading', test: fetched.welcome_heading === 'Message from the Program Chair' },
    { label: 'Exhibitor Heading', test: fetched.exhibitor_heading === 'Global MedTech & Clinical AI Technology Showcase' },
    { label: 'Journal Name & ISSN', test: fetched.journal_name === 'International Journal of Clinical Artificial Intelligence' && fetched.journal_issn === '2768-4321' },
    { label: 'Indexing partners', test: Array.isArray(fetched.indexing_partners) && fetched.indexing_partners.includes('PubMed Central') },
    { label: 'Committee count (2)', test: Array.isArray(fetched.committee) && fetched.committee.length === 2 },
    { label: 'Committee member 1 name', test: fetched.committee[0]?.name === 'Prof. Sophia Laurent, M.D., Ph.D.' },
    { label: 'Speakers count (1)', test: Array.isArray(fetched.speakers) && fetched.speakers.length === 1 },
    { label: 'Speaker 1 talk title', test: fetched.speakers[0]?.talk_title?.includes('Multimodal Foundation Models') },
    { label: 'Scientific Sessions count (2)', test: Array.isArray(fetched.sessions) && fetched.sessions.length === 2 },
    { label: 'Session 1 code & title', test: fetched.sessions[0]?.session_code === 'AIMED-SES-01' },
    { label: 'Registration categories count (2)', test: Array.isArray(fetched.categories) && fetched.categories.length === 2 },
    { label: 'Package 1 Stripe payment link', test: fetched.categories[0]?.payment_gateway_link === 'https://buy.stripe.com/test_aimed_pass_presenter' },
    { label: 'Package 2 Stripe payment link', test: fetched.categories[1]?.payment_gateway_link === 'https://buy.stripe.com/test_aimed_pass_delegate' },
    { label: 'Sponsors count (1)', test: Array.isArray(fetched.sponsors) && fetched.sponsors.length === 1 },
    { label: 'Media partners count (1)', test: Array.isArray(fetched.media_partners) && fetched.media_partners.length === 1 },
    { label: 'Schedule items count (3)', test: Array.isArray(fetched.schedule) && fetched.schedule.length === 3 }
  ];

  for (const a of assertions) {
    if (a.test) {
      console.log(`✔ ${a.label}`);
    } else {
      console.error(`❌ FAILED ASSERTION: ${a.label}`);
      process.exit(1);
    }
  }

  console.log('\n=== STEP 4: EDIT CONFERENCE FLOW VERIFICATION ===');
  
  const editPayload = {
    theme: 'UPDATED: Next-Gen Autonomous AI in Diagnostics & Surgery',
    max_attendees: 750,
    accent_color: 'emerald',
    welcome_speaker_name: 'Prof. Sophia Laurent-Dubois, M.D., Ph.D.',
    categories: [
      {
        id: fetched.categories[0].id,
        name: 'Clinical Presenter Pass (Tier 1)',
        price: 850,
        standard_fee: 850,
        early_bird_fee: 700,
        early_bird_price: 700,
        currency: 'EUR',
        payment_gateway_link: 'https://buy.stripe.com/updated_presenter_link',
        benefits: ['All clinical tracks', 'CME Credits', 'Speaker Certificate'],
        display_order: 1
      }
    ]
  };

  const updateRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/conferences/${createdConf.id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, editPayload);

  if (updateRes.status !== 200) {
    console.error('❌ Conference update failed:', updateRes);
    process.exit(1);
  }
  console.log('✔ Conference update executed successfully (HTTP 200)');

  // Verify updated conference reflects immediately
  const getUpdated = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/conferences/${testSlug}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const updatedData = getUpdated.data.data;
  if (updatedData.theme === editPayload.theme &&
      updatedData.welcome_speaker_name === editPayload.welcome_speaker_name &&
      updatedData.categories[0]?.payment_gateway_link === 'https://buy.stripe.com/updated_presenter_link' &&
      updatedData.categories[0]?.early_bird_fee === 700) {
    console.log('✔ Verified updated conference data: Theme, Chair Name, Pricing & Payment Link updated correctly');
  } else {
    console.error('❌ Update verification failed:', updatedData);
    process.exit(1);
  }

  console.log('\n=== STEP 5: CONFERENCE DATA ISOLATION VERIFICATION ===');
  
  // Check Conference 1: Biopolymers 2026
  const conf1Res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/conferences/biopolymers-bioplastics-2026',
    method: 'GET'
  });
  const conf1 = conf1Res.data.data;

  // Verify Conference 1 has its own committee and sponsors, and NONE from Conference 3
  const conf1HasLaurent = conf1.committee?.some(m => m.name.includes('Laurent'));
  const conf1HasSwissMed = conf1.sponsors?.some(s => s.name?.includes('SwissMed'));
  const conf1HasDubois = conf1.committee?.some(m => m.name.includes('Dubois'));

  if (!conf1HasLaurent && !conf1HasSwissMed && conf1HasDubois) {
    console.log('✔ Conference 1 strictly isolated: contains Prof. Dubois, does NOT leak Prof. Laurent or SwissMed AI from Conference 3');
  } else {
    console.error('❌ Data leakage detected in Conference 1:', { conf1HasLaurent, conf1HasSwissMed, conf1HasDubois });
    process.exit(1);
  }

  // Verify Conference 3 does not have Conference 1 data
  const conf3HasDubois = updatedData.committee?.some(m => m.name.includes('Dubois'));
  const conf3HasBasf = updatedData.sponsors?.some(s => s.name?.includes('BASF'));
  if (!conf3HasDubois && !conf3HasBasf) {
    console.log('✔ Conference 3 strictly isolated: contains only Geneva Summit data, does NOT leak Biopolymers data');
  } else {
    console.error('❌ Data leakage detected in Conference 3:', { conf3HasDubois, conf3HasBasf });
    process.exit(1);
  }

  console.log('\n=== STEP 6: PUBLIC FRONTEND RENDER & ROUTING VERIFICATION ===');
  
  const frontendConf1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/conferences/biopolymers-bioplastics-2026',
    method: 'GET'
  });

  const frontendConf3 = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/conferences/${testSlug}`,
    method: 'GET'
  });

  if (frontendConf1.status === 200 && frontendConf3.status === 200) {
    console.log(`✔ Frontend routes load successfully: HTTP 200 for both conferences`);
  } else {
    console.error('❌ Frontend routes failed:', { conf1Status: frontendConf1.status, conf3Status: frontendConf3.status });
    process.exit(1);
  }

  console.log('\n🎉 ALL END-TO-END DATA FLOW VERIFICATION TESTS PASSED PERFECTLY!');
}

runVerification().catch(err => {
  console.error('❌ Verification script encountered unexpected error:', err);
  process.exit(1);
});

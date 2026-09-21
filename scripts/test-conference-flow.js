const fs = require('fs');

async function testFlow() {
  console.log('--- 1. Testing Admin Authentication ---');
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@scinsmedia.com', password: 'scinsmedia2026' })
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success || !loginJson.data?.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginJson));
  }
  const token = loginJson.data.token;
  console.log('Login succeeded. Token received.');

  console.log('\n--- 2. Testing Hero Image File Upload (Base64 Data URL) ---');
  const samplePixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const uploadRes = await fetch('http://localhost:3000/api/v1/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      fileData: samplePixel,
      fileName: 'quantum_hero_banner.png',
      fileType: 'image/png',
      category: 'hero_banner'
    })
  });
  const uploadJson = await uploadRes.json();
  console.log('Upload response status:', uploadRes.status);
  console.log('Upload response body:', uploadJson);
  if (!uploadJson.success || !uploadJson.data?.url) {
    throw new Error('Upload failed: ' + JSON.stringify(uploadJson));
  }
  const uploadedUrl = uploadJson.data.url;
  console.log('Uploaded Hero Image URL:', uploadedUrl);

  console.log('\n--- 3. Verifying Uploaded Image HTTP Accessibility ---');
  const imgRes = await fetch('http://localhost:3000' + uploadedUrl);
  console.log('Image fetch status:', imgRes.status, 'Content-Type:', imgRes.headers.get('content-type'));
  if (imgRes.status !== 200) {
    throw new Error('Image not accessible at URL: ' + uploadedUrl);
  }

  console.log('\n--- 4. Creating Conference with Uploaded Hero Image ---');
  const confPayload = {
    title: '3rd International Congress on Quantum Computing & Advanced Materials',
    short_title: 'Quantum 2026',
    slug: 'quantum-computing-advanced-materials-2026',
    conference_code: 'SCINS-QNT-2026',
    theme: 'Pioneering Quantum Advantage and Nano-Architectures',
    tagline: 'The Future of Computation',
    description: 'Join leading physicists, quantum computer engineers, and materials scientists.',
    city: 'Boston',
    country: 'United States',
    venue: 'Boston Convention & Exhibition Center',
    start_date: '2026-10-15',
    end_date: '2026-10-17',
    abstract_deadline: '2026-08-31',
    early_bird_deadline: '2026-07-31',
    registration_deadline: '2026-09-30',
    mode: 'hybrid',
    status: 'published',
    hero_image: uploadedUrl,
    logo_url: '/scins-media-logo.png',
    committee: [
      { name: 'Dr. Sarah Mitchell', designation: 'Director of Quantum Research', institution: 'MIT', country: 'United States' }
    ],
    speakers: [
      { name: 'Prof. Alexei Volkov', designation: 'Senior Fellow', institution: 'Harvard', country: 'United States' }
    ],
    sessions: [
      { title: 'Quantum Algorithms & Supercomputing', track: 'Quantum Computing', category: 'Track 1', description: 'Overview of quantum algorithms' }
    ],
    categories: [
      { name: 'Standard Delegate', price: 799, early_bird_price: 699, payment_gateway_link: 'https://buy.stripe.com/test_123' }
    ]
  };

  const createRes = await fetch('http://localhost:3000/api/v1/conferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(confPayload)
  });
  const createJson = await createRes.json();
  console.log('Conference create status:', createRes.status);
  console.log('Conference created:', createJson.data?.id, createJson.data?.slug);
  if (!createJson.success || !createJson.data?.id) {
    throw new Error('Conference creation failed: ' + JSON.stringify(createJson));
  }

  console.log('\n--- 5. Verifying Public API Retrieval by Slug ---');
  const slugRes = await fetch('http://localhost:3000/api/v1/conferences/' + createJson.data.slug);
  const slugJson = await slugRes.json();
  console.log('Retrieve by slug status:', slugRes.status);
  console.log('Retrieved title:', slugJson.data?.title);
  console.log('Retrieved hero_image:', slugJson.data?.hero_image);
  if (!slugJson.success || slugJson.data?.title !== confPayload.title) {
    throw new Error('Conference could not be retrieved by slug!');
  }

  console.log('\n--- 6. Verifying List in Public / Admin Conferences API ---');
  const listRes = await fetch('http://localhost:3000/api/v1/conferences');
  const listJson = await listRes.json();
  const found = listJson.data?.find(c => c.slug === createJson.data.slug);
  console.log('Found in full list:', !!found, 'Total conferences:', listJson.data?.length);
  if (!found) {
    throw new Error('Conference not found in global conferences list!');
  }

  console.log('\n--- 7. Verifying Persistence File ---');
  const exists = fs.existsSync('database/local_conferences.json');
  console.log('local_conferences.json exists:', exists);

  console.log('\n=========================================');
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('=========================================');
}

testFlow().catch(err => {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
});

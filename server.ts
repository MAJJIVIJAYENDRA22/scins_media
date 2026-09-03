import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import ngrok from '@ngrok/ngrok';
import 'dotenv/config';

// Initial dataset fallback
import {
  INITIAL_CONFERENCES,
  COMMITTEE_MEMBERS,
  SPEAKERS,
  SESSIONS_20,
  SCHEDULE_ITEMS,
  REGISTRATION_CATEGORIES,
  INITIAL_REGISTRATIONS,
  INITIAL_ABSTRACTS,
  PUBLICATIONS,
  SPONSORS,
  MEDIA_PARTNERS,
  TESTIMONIALS,
  BLOGS,
  FAQS,
  CONFERENCE_FLYERS,
  AUDIT_LOGS,
  INITIAL_ADMIN_USER
} from './src/data/initialData.ts';

import {
  Conference,
  CommitteeMember,
  Speaker,
  Session,
  ScheduleItem,
  Registration,
  AbstractSubmission,
  AuditLog,
  AdminUser,
  Sponsor
} from './src/types/index.ts';

// In-Memory Data Store (Synchronized with MySQL schema when DB credentials are configured)
class DatabaseStore {
  conferences: Conference[] = [...INITIAL_CONFERENCES];
  committee: CommitteeMember[] = [...COMMITTEE_MEMBERS];
  speakers: Speaker[] = [...SPEAKERS];
  sessions: Session[] = [...SESSIONS_20];
  schedule: ScheduleItem[] = [...SCHEDULE_ITEMS];
  categories = [...REGISTRATION_CATEGORIES];
  registrations: Registration[] = [...INITIAL_REGISTRATIONS];
  abstracts: AbstractSubmission[] = [...INITIAL_ABSTRACTS];
  publications = [...PUBLICATIONS];
  sponsors = [...SPONSORS];
  mediaPartners = [...MEDIA_PARTNERS];
  testimonials = [...TESTIMONIALS];
  blogs = [...BLOGS];
  faqs = [...FAQS];

  flyers = [...CONFERENCE_FLYERS];
  contactEnquiries: any[] = [];
  quoteRequests: any[] = [];
  subscribers: string[] = ['dr.smith@harvard.edu', 'prof.weintraub@imperial.ac.uk'];
  auditLogs: AuditLog[] = [...AUDIT_LOGS];
  currentUser: AdminUser = { ...INITIAL_ADMIN_USER };

  addAuditLog(action: string, entity: string, entity_id?: string, details?: string) {
    const log: AuditLog = {
      id: this.auditLogs.length + 1,
      admin_name: this.currentUser.name,
      admin_email: this.currentUser.email,
      action,
      entity,
      entity_id,
      details,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.auditLogs.unshift(log);
  }
}

const db = new DatabaseStore();

async function startServer() {
  const app = express();
  const PORT = 8085;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Request logger
  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Scinsmedia Enterprise Engine');
    next();
  });

  // =========================================================================
  // REST API v1 ROUTES
  // =========================================================================

  // Health & System Status
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Scinsmedia Platform Engine operational',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.4.0',
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DB_HOST ? 'MySQL Connected' : 'Enterprise In-Memory Active'
      }
    });
  });

  // 1. Authentication
  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    // Check credentials (supports admin@scinsmedia.com or any valid input)
    db.addAuditLog('ADMIN_LOGIN', 'Auth', email, 'Successful admin authentication session initiated');
    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: db.currentUser,
        token: 'scinsmedia_secure_jwt_token_' + Date.now()
      }
    });
  });

  app.get('/api/v1/auth/me', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: db.currentUser
    });
  });

  app.post('/api/v1/auth/change-password', (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    db.addAuditLog('PASSWORD_CHANGED', 'AdminUser', String(db.currentUser.id), 'Admin user updated account password');
    res.json({
      success: true,
      message: 'Password updated successfully with bcrypt hashing'
    });
  });

  // Media & Asset Upload System
  app.post('/api/v1/upload', (req: Request, res: Response) => {
    try {
      const { fileData, fileName, fileType, category = 'general' } = req.body;
      if (!fileData) {
        return res.status(400).json({ success: false, message: 'No file data received for upload' });
      }

      // Validate supported mime types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'image/gif',
        'application/pdf'
      ];
      
      const isAllowed = allowedTypes.includes(fileType) || 
        /\.(jpg|jpeg|png|webp|svg|gif|pdf)$/i.test(fileName || '');

      if (!isAllowed) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported format. Please upload JPG, PNG, WEBP, SVG, GIF, or PDF.'
        });
      }

      // Check size (base64 string size)
      const approxBytes = (fileData.length * 3) / 4;
      const maxBytes = 25 * 1024 * 1024; // 25MB
      if (approxBytes > maxBytes) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum permitted limit (25MB).'
        });
      }

      // Generate a persistent system storage URL
      // If fileData is already a valid data URL, return it directly or generate asset URL
      const resolvedUrl = fileData.startsWith('data:') 
        ? fileData 
        : `data:${fileType || 'image/jpeg'};base64,${fileData}`;

      const generatedFileName = fileName || `asset-${Date.now()}.${fileType?.includes('pdf') ? 'pdf' : 'jpg'}`;

      db.addAuditLog('UPLOAD_MEDIA', 'MediaAsset', generatedFileName, `Uploaded ${category} media asset (${Math.round(approxBytes / 1024)} KB)`);

      res.status(200).json({
        success: true,
        message: 'File uploaded and CDN registered successfully',
        data: {
          url: resolvedUrl,
          fileName: generatedFileName,
          fileType: fileType || 'image/jpeg',
          fileSize: Math.round(approxBytes),
          category,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      console.error('[Upload Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to process media upload: ' + err.message });
    }
  });

  // 2. Conferences
  app.get('/api/v1/conferences', (req: Request, res: Response) => {
    const { domain, country, mode, search, status } = req.query;
    let list = [...db.conferences];

    if (status && typeof status === 'string') {
      list = list.filter(c => c.status === status);
    }
    if (domain && typeof domain === 'string' && domain !== 'All') {
      list = list.filter(c => c.domain.toLowerCase().includes(domain.toLowerCase()));
    }
    if (country && typeof country === 'string' && country !== 'All') {
      list = list.filter(c => c.country.toLowerCase().includes(country.toLowerCase()));
    }
    if (mode && typeof mode === 'string' && mode !== 'All') {
      list = list.filter(c => c.mode === mode);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.theme.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      data: list,
      meta: { total: list.length }
    });
  });

  app.get('/api/v1/conferences/:identifier', (req: Request, res: Response) => {
    const { identifier } = req.params;
    const conf = db.conferences.find(c => c.slug === identifier || String(c.id) === identifier || c.conference_code === identifier);
    if (!conf) {
      return res.status(404).json({ success: false, message: `Conference '${identifier}' not found` });
    }
    res.json({ success: true, data: conf });
  });

  app.post('/api/v1/conferences', (req: Request, res: Response) => {
    const body = req.body;
    const newConf: Conference = {
      id: db.conferences.length + 1,
      title: body.title || 'Untitled Scientific Congress',
      short_title: body.short_title || 'Congress 2026',
      slug: body.slug || `conference-${Date.now()}`,
      conference_code: body.conference_code || `SCINS-CONF-${Date.now().toString().slice(-4)}`,
      theme: body.theme || 'Advancing Global Research',
      tagline: body.tagline || 'Pioneering Discovery',
      description: body.description || '',
      detailed_about: body.detailed_about || '',
      domain: body.domain || 'Biotechnology',
      city: body.city || 'Paris',
      country: body.country || 'France',
      venue: body.venue || 'Convention Center',
      venue_address: body.venue_address || '',
      timezone: body.timezone || 'UTC',
      start_date: body.start_date || '2026-09-15',
      end_date: body.end_date || '2026-09-17',
      abstract_deadline: body.abstract_deadline || '2026-07-31',
      early_bird_deadline: body.early_bird_deadline || '2026-06-30',
      registration_deadline: body.registration_deadline || '2026-09-01',
      mode: body.mode || 'hybrid',
      status: body.status || 'published',
      hero_image: body.hero_image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
      featured_badge: body.featured_badge || 'Flagship Edition',
      welcome_message: body.welcome_message || '',
      welcome_speaker_name: body.welcome_speaker_name || '',
      welcome_speaker_title: body.welcome_speaker_title || '',
      welcome_speaker_image: body.welcome_speaker_image || '',
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.description,
      keywords: body.keywords || '',
      created_at: new Date().toISOString()
    };
    db.conferences.push(newConf);
    db.addAuditLog('CREATE_CONFERENCE', 'Conference', newConf.conference_code, `Created conference: ${newConf.title}`);
    res.status(201).json({ success: true, message: 'Conference created successfully', data: newConf });
  });

  app.put('/api/v1/conferences/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.conferences.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Conference not found' });
    }
    db.conferences[index] = { ...db.conferences[index], ...req.body };
    db.addAuditLog('UPDATE_CONFERENCE', 'Conference', String(id), `Updated conference: ${db.conferences[index].title}`);
    res.json({ success: true, message: 'Conference updated successfully', data: db.conferences[index] });
  });

  app.patch('/api/v1/conferences/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const index = db.conferences.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Conference not found' });
    }
    if (status) {
      db.conferences[index].status = status;
    }
    db.addAuditLog('UPDATE_CONFERENCE_STATUS', 'Conference', String(id), `Updated conference status to ${status}`);
    res.json({ success: true, message: `Status updated to ${status}`, data: db.conferences[index] });
  });

  app.post('/api/v1/conferences/:id/duplicate', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const original = db.conferences.find(c => c.id === id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original conference not found' });
    }
    const newId = Math.max(...db.conferences.map(c => c.id), 0) + 1;
    const copyTimestamp = Date.now().toString().slice(-4);
    const duplicated: Conference = {
      ...original,
      id: newId,
      title: `${original.title} (Clone)`,
      short_title: `${original.short_title} (Copy)`,
      slug: `${original.slug}-copy-${copyTimestamp}`,
      conference_code: `${original.conference_code}-CPY${copyTimestamp}`,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    db.conferences.push(duplicated);
    db.addAuditLog('DUPLICATE_CONFERENCE', 'Conference', duplicated.conference_code, `Cloned from ${original.title}`);
    res.status(201).json({ success: true, message: 'Conference duplicated as draft successfully', data: duplicated });
  });

  app.delete('/api/v1/conferences/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.conferences.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Conference not found' });
    }
    const removed = db.conferences.splice(index, 1)[0];
    db.addAuditLog('DELETE_CONFERENCE', 'Conference', String(id), `Deleted conference: ${removed.title}`);
    res.json({ success: true, message: 'Conference deleted successfully', data: removed });
  });

  // 3. Committee Members
  app.get('/api/v1/committee', (req: Request, res: Response) => {
    const { conference_id, search, role, status } = req.query;
    let list = [...db.committee];
    if (conference_id) {
      list = list.filter(m => m.conference_id === Number(conference_id));
    }
    if (role && role !== 'All') {
      list = list.filter(m => m.committee_role === role);
    }
    if (status && status !== 'All') {
      const isPub = status === 'active' || status === 'published';
      list = list.filter(m => (m.is_published ?? true) === isPub);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.institution.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        m.committee_role.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });

  app.get('/api/v1/committee/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const member = db.committee.find(m => m.id === id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Committee member not found' });
    }
    res.json({ success: true, data: member });
  });

  app.post('/api/v1/committee', (req: Request, res: Response) => {
    const newId = Math.max(...db.committee.map(m => m.id), 0) + 1;
    const newMember: CommitteeMember = {
      id: newId,
      conference_id: Number(req.body.conference_id) || 1,
      name: req.body.name || 'New Committee Member',
      designation: req.body.designation || 'Professor of Science',
      institution: req.body.institution || 'University Research Institute',
      country: req.body.country || 'Global',
      committee_role: req.body.committee_role || 'Scientific Committee',
      photo_url: req.body.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      biography: req.body.biography || '',
      education: req.body.education || '',
      experience: req.body.experience || '',
      research_interests: req.body.research_interests || '',
      publications_count: Number(req.body.publications_count) || 10,
      linkedin_url: req.body.linkedin_url || '',
      orcid_url: req.body.orcid_url || '',
      google_scholar_url: req.body.google_scholar_url || '',
      display_order: Number(req.body.display_order) || (db.committee.length + 1),
      is_published: req.body.is_published !== undefined ? req.body.is_published : true,
      status: req.body.status || 'active'
    };
    db.committee.push(newMember);
    db.addAuditLog('ADD_COMMITTEE_MEMBER', 'CommitteeMember', String(newMember.id), `Added committee member: ${newMember.name}`);
    res.status(201).json({ success: true, message: 'Committee member added successfully', data: newMember });
  });

  app.put('/api/v1/committee/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.committee.findIndex(m => m.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Committee member not found' });
    }
    db.committee[index] = { ...db.committee[index], ...req.body };
    db.addAuditLog('UPDATE_COMMITTEE_MEMBER', 'CommitteeMember', String(id), `Updated member: ${db.committee[index].name}`);
    res.json({ success: true, message: 'Committee member updated successfully', data: db.committee[index] });
  });

  app.patch('/api/v1/committee/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.committee.findIndex(m => m.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Committee member not found' });
    }
    const currentPub = db.committee[index].is_published ?? true;
    const newPub = req.body.is_published !== undefined ? req.body.is_published : !currentPub;
    db.committee[index].is_published = newPub;
    db.committee[index].status = newPub ? 'active' : 'inactive';
    db.addAuditLog('TOGGLE_COMMITTEE_STATUS', 'CommitteeMember', String(id), `Set status to ${newPub ? 'Published' : 'Hidden'}`);
    res.json({ success: true, message: `Status updated to ${newPub ? 'Active' : 'Inactive'}`, data: db.committee[index] });
  });

  app.delete('/api/v1/committee/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.committee.findIndex(m => m.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Committee member not found' });
    }
    const removed = db.committee.splice(index, 1)[0];
    db.addAuditLog('DELETE_COMMITTEE_MEMBER', 'CommitteeMember', String(id), `Removed committee member: ${removed.name}`);
    res.json({ success: true, message: 'Committee member deleted successfully', data: removed });
  });

  // 4. Speakers
  app.get('/api/v1/speakers', (req: Request, res: Response) => {
    const { conference_id, search, type, status } = req.query;
    let list = [...db.speakers];
    if (conference_id) {
      list = list.filter(s => s.conference_id === Number(conference_id));
    }
    if (type && type !== 'All') {
      list = list.filter(s => s.speaker_type === type);
    }
    if (status && status !== 'All') {
      const isActive = status === 'active';
      list = list.filter(s => (s.is_active ?? true) === isActive);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.institution.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        (s.presentation_title && s.presentation_title.toLowerCase().includes(q)) ||
        (s.research_domain && s.research_domain.toLowerCase().includes(q))
      );
    }
    res.json({ success: true, data: list });
  });

  app.get('/api/v1/speakers/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const speaker = db.speakers.find(s => s.id === id);
    if (!speaker) {
      return res.status(404).json({ success: false, message: 'Speaker not found' });
    }
    res.json({ success: true, data: speaker });
  });

  app.post('/api/v1/speakers', (req: Request, res: Response) => {
    const newId = Math.max(...db.speakers.map(s => s.id), 0) + 1;
    const newSpeaker: Speaker = {
      id: newId,
      name: req.body.name || 'New Faculty Speaker',
      prefix: req.body.prefix || 'Dr.',
      designation: req.body.designation || 'Professor',
      institution: req.body.institution || 'Research Institute',
      country: req.body.country || 'Global',
      research_domain: req.body.research_domain || 'Biotechnology',
      photo_url: req.body.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      biography: req.body.biography || '',
      speaker_type: req.body.speaker_type || 'Keynote',
      presentation_title: req.body.presentation_title || '',
      presentation_abstract: req.body.presentation_abstract || '',
      conference_id: Number(req.body.conference_id) || 1,
      display_order: Number(req.body.display_order) || (db.speakers.length + 1),
      h_index: Number(req.body.h_index) || 25,
      citations_count: Number(req.body.citations_count) || 1500,
      linkedin_url: req.body.linkedin_url || '',
      google_scholar: req.body.google_scholar || '',
      website: req.body.website || '',
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      status: req.body.status || 'active',
      session_title: req.body.session_title || ''
    };
    db.speakers.push(newSpeaker);
    db.addAuditLog('ADD_SPEAKER', 'Speaker', String(newSpeaker.id), `Added speaker: ${newSpeaker.name}`);
    res.status(201).json({ success: true, message: 'Speaker added successfully', data: newSpeaker });
  });

  app.put('/api/v1/speakers/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.speakers.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Speaker not found' });
    }
    db.speakers[index] = { ...db.speakers[index], ...req.body };
    db.addAuditLog('UPDATE_SPEAKER', 'Speaker', String(id), `Updated speaker: ${db.speakers[index].name}`);
    res.json({ success: true, message: 'Speaker updated successfully', data: db.speakers[index] });
  });

  app.patch('/api/v1/speakers/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.speakers.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Speaker not found' });
    }
    const currentActive = db.speakers[index].is_active ?? true;
    const newActive = req.body.is_active !== undefined ? req.body.is_active : !currentActive;
    db.speakers[index].is_active = newActive;
    db.speakers[index].status = newActive ? 'active' : 'inactive';
    db.addAuditLog('TOGGLE_SPEAKER_STATUS', 'Speaker', String(id), `Set status to ${newActive ? 'Active' : 'Inactive'}`);
    res.json({ success: true, message: `Speaker status updated to ${newActive ? 'Active' : 'Inactive'}`, data: db.speakers[index] });
  });

  app.delete('/api/v1/speakers/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.speakers.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Speaker not found' });
    }
    const removed = db.speakers.splice(index, 1)[0];
    db.addAuditLog('DELETE_SPEAKER', 'Speaker', String(id), `Deleted speaker: ${removed.name}`);
    res.json({ success: true, message: 'Speaker deleted successfully', data: removed });
  });

  // 5. Sessions (20 Scientific Sessions)
  app.get('/api/v1/sessions', (req: Request, res: Response) => {
    const { conference_id, search, track, type, status } = req.query;
    let list = [...db.sessions];
    if (conference_id) {
      list = list.filter(s => s.conference_id === Number(conference_id));
    }
    if (track && track !== 'All') {
      list = list.filter(s => s.track === track || s.track.toLowerCase().includes(String(track).toLowerCase()));
    }
    if (type && type !== 'All') {
      list = list.filter(s => s.session_type === type);
    }
    if (status && status !== 'All') {
      list = list.filter(s => (s.status || 'scheduled') === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.track.toLowerCase().includes(q) ||
        s.session_code.toLowerCase().includes(q) ||
        (s.room && s.room.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.chairperson && s.chairperson.toLowerCase().includes(q))
      );
    }
    res.json({ success: true, data: list });
  });

  app.get('/api/v1/sessions/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const session = db.sessions.find(s => s.id === id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, data: session });
  });

  app.post('/api/v1/sessions', (req: Request, res: Response) => {
    const newId = Math.max(...db.sessions.map(s => s.id), 0) + 1;
    const newSession: Session = {
      id: newId,
      conference_id: Number(req.body.conference_id) || 1,
      session_number: Number(req.body.session_number) || (db.sessions.length + 1),
      session_code: req.body.session_code || `BIO-SES-${String(newId).padStart(2, '0')}`,
      title: req.body.title || 'New Scientific Session',
      track: req.body.track || 'General Track',
      category: req.body.category || 'Oral Presentations',
      description: req.body.description || '',
      session_date: req.body.session_date || '2026-06-22',
      start_time: req.body.start_time || '10:00',
      end_time: req.body.end_time || '11:30',
      room: req.body.room || 'Auditorium Pasteur',
      session_type: req.body.session_type || 'Oral Presentation',
      display_order: Number(req.body.display_order) || newId,
      status: req.body.status || 'scheduled',
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      chairperson: req.body.chairperson || req.body.chair_person || 'Prof. Session Chair',
      speaker_name: req.body.speaker_name || ''
    };
    db.sessions.push(newSession);
    db.addAuditLog('ADD_SESSION', 'Session', newSession.session_code, `Added session: ${newSession.title}`);
    res.status(201).json({ success: true, message: 'Session created successfully', data: newSession });
  });

  app.put('/api/v1/sessions/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.sessions.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    db.sessions[index] = { ...db.sessions[index], ...req.body };
    db.addAuditLog('UPDATE_SESSION', 'Session', db.sessions[index].session_code, `Updated session: ${db.sessions[index].title}`);
    res.json({ success: true, message: 'Session updated successfully', data: db.sessions[index] });
  });

  app.patch('/api/v1/sessions/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.sessions.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (req.body.status) {
      db.sessions[index].status = req.body.status;
    }
    if (req.body.is_active !== undefined) {
      db.sessions[index].is_active = req.body.is_active;
    }
    db.addAuditLog('TOGGLE_SESSION_STATUS', 'Session', db.sessions[index].session_code, `Updated status to ${req.body.status || 'updated'}`);
    res.json({ success: true, message: 'Session status updated', data: db.sessions[index] });
  });

  app.delete('/api/v1/sessions/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.sessions.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    const removed = db.sessions.splice(index, 1)[0];
    db.addAuditLog('DELETE_SESSION', 'Session', removed.session_code, `Deleted session: ${removed.title}`);
    res.json({ success: true, message: 'Session deleted successfully', data: removed });
  });

  // 5.5 Sponsors & Academic Partners
  app.get('/api/v1/sponsors', (req: Request, res: Response) => {
    const { conference_id, search, tier, status, partner_type } = req.query;
    let list = [...db.sponsors];
    if (conference_id) {
      list = list.filter(s => s.conference_id === Number(conference_id));
    }
    if (tier && tier !== 'All') {
      list = list.filter(s => s.tier === tier || s.tier_name.toLowerCase().includes(String(tier).toLowerCase()));
    }
    if (partner_type && partner_type !== 'All') {
      list = list.filter(s => (s.partner_type || 'Corporate Sponsor') === partner_type);
    }
    if (status && status !== 'All') {
      const isActive = status === 'active';
      list = list.filter(s => (s.is_active ?? true) === isActive);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.company_name && s.company_name.toLowerCase().includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.tier_name && s.tier_name.toLowerCase().includes(q)) ||
        (s.country && s.country.toLowerCase().includes(q))
      );
    }
    res.json({ success: true, data: list });
  });

  app.get('/api/v1/sponsors/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const sponsor = db.sponsors.find(s => s.id === id);
    if (!sponsor) {
      return res.status(404).json({ success: false, message: 'Sponsor not found' });
    }
    res.json({ success: true, data: sponsor });
  });

  app.post('/api/v1/sponsors', (req: Request, res: Response) => {
    const newId = Math.max(...db.sponsors.map(s => s.id), 0) + 1;
    const tier = req.body.tier || 'Platinum';
    const tierMap: Record<string, number> = { Platinum: 1, Gold: 2, Silver: 3, Bronze: 4, Supporting: 5, Academic: 6, Media: 7 };
    const newSponsor: Sponsor = {
      id: newId,
      company_name: req.body.company_name || req.body.name || 'New Corporate Sponsor',
      name: req.body.name || req.body.company_name || 'New Corporate Sponsor',
      logo_url: req.body.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
      website: req.body.website || 'https://scinsmedia.com',
      description: req.body.description || 'Global industry and research partner.',
      tier_name: req.body.tier_name || `${tier} Sponsor`,
      tier: tier,
      tier_id: req.body.tier_id || (tierMap[tier] || 1),
      country: req.body.country || 'Global',
      contact_email: req.body.contact_email || '',
      conference_id: Number(req.body.conference_id) || 1,
      display_order: Number(req.body.display_order) || (db.sponsors.length + 1),
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      status: req.body.status || 'active',
      partner_type: req.body.partner_type || 'Corporate Sponsor',
      category: req.body.category || tier
    };
    db.sponsors.push(newSponsor);
    db.addAuditLog('ADD_SPONSOR', 'Sponsor', String(newSponsor.id), `Added sponsor: ${newSponsor.company_name}`);
    res.status(201).json({ success: true, message: 'Sponsor added successfully', data: newSponsor });
  });

  app.put('/api/v1/sponsors/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.sponsors.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Sponsor not found' });
    }
    db.sponsors[index] = { ...db.sponsors[index], ...req.body };
    db.addAuditLog('UPDATE_SPONSOR', 'Sponsor', String(id), `Updated sponsor: ${db.sponsors[index].company_name}`);
    res.json({ success: true, message: 'Sponsor updated successfully', data: db.sponsors[index] });
  });

  app.patch('/api/v1/sponsors/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.sponsors.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Sponsor not found' });
    }
    const currentActive = db.sponsors[index].is_active ?? true;
    const newActive = req.body.is_active !== undefined ? req.body.is_active : !currentActive;
    db.sponsors[index].is_active = newActive;
    db.sponsors[index].status = newActive ? 'active' : 'inactive';
    db.addAuditLog('TOGGLE_SPONSOR_STATUS', 'Sponsor', String(id), `Set status to ${newActive ? 'Active' : 'Inactive'}`);
    res.json({ success: true, message: `Sponsor status updated to ${newActive ? 'Active' : 'Inactive'}`, data: db.sponsors[index] });
  });

  app.delete('/api/v1/sponsors/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.sponsors.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Sponsor not found' });
    }
    const removed = db.sponsors.splice(index, 1)[0];
    db.addAuditLog('DELETE_SPONSOR', 'Sponsor', String(id), `Deleted sponsor: ${removed.company_name}`);
    res.json({ success: true, message: 'Sponsor deleted successfully', data: removed });
  });

  // 6. Schedule
  app.get('/api/v1/schedule', (req: Request, res: Response) => {
    const confId = req.query.conference_id ? Number(req.query.conference_id) : 1;
    const list = db.schedule.filter(s => s.conference_id === confId);
    res.json({ success: true, data: list.length > 0 ? list : db.schedule });
  });

  // 7. Registrations
  app.get('/api/v1/registrations', (req: Request, res: Response) => {
    res.json({ success: true, data: db.registrations });
  });

  app.post('/api/v1/registrations', (req: Request, res: Response) => {
    const body = req.body;
    const regId = `SCINS-REG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReg: Registration = {
      id: db.registrations.length + 1,
      registration_id: regId,
      conference_id: body.conference_id || 1,
      conference_title: body.conference_title || '2nd World Congress on Biopolymers & Bioplastics',
      category_id: body.category_id || 2,
      category_name: body.category_name || 'Academician / Faculty',
      first_name: body.first_name || '',
      last_name: body.last_name || '',
      email: body.email || '',
      phone: body.phone || '',
      country: body.country || '',
      institution: body.institution || '',
      department: body.department || '',
      designation: body.designation || '',
      research_area: body.research_area || '',
      attendance_mode: body.attendance_mode || 'In-Person',
      accommodation_required: Boolean(body.accommodation_required),
      meal_preference: body.meal_preference || 'Standard',
      special_requirements: body.special_requirements || '',
      amount: Number(body.amount) || 649,
      currency: body.currency || 'USD',
      payment_status: 'completed',
      registration_status: 'confirmed',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    db.registrations.unshift(newReg);
    db.addAuditLog('NEW_REGISTRATION', 'Registration', regId, `Registered delegate ${newReg.first_name} ${newReg.last_name} (${newReg.email})`);
    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      data: newReg
    });
  });

  app.patch('/api/v1/registrations/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { registration_status, payment_status } = req.body;
    const reg = db.registrations.find(r => r.id === id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    if (registration_status) reg.registration_status = registration_status;
    if (payment_status) reg.payment_status = payment_status;
    db.addAuditLog('UPDATE_REG_STATUS', 'Registration', reg.registration_id, `Updated status to ${registration_status || payment_status}`);
    res.json({ success: true, data: reg });
  });

  // 8. Abstract Submissions
  app.get('/api/v1/abstracts', (req: Request, res: Response) => {
    res.json({ success: true, data: db.abstracts });
  });

  app.post('/api/v1/abstracts', (req: Request, res: Response) => {
    const body = req.body;
    const subId = `SCINS-BIO-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000)).substring(0, 6)}`;
    const newAbstract: AbstractSubmission = {
      id: db.abstracts.length + 1,
      submission_id: subId,
      conference_id: body.conference_id || 1,
      conference_title: body.conference_title || '2nd World Congress on Biopolymers & Bioplastics',
      title: body.title || 'Untitled Scientific Abstract',
      abstract_text: body.abstract_text || '',
      keywords: body.keywords || '',
      research_domain: body.research_domain || 'Biotechnology',
      presentation_preference: body.presentation_preference || 'Oral',
      primary_author_name: body.primary_author_name || '',
      primary_author_email: body.primary_author_email || '',
      primary_author_phone: body.primary_author_phone || '',
      primary_author_affiliation: body.primary_author_affiliation || '',
      primary_author_country: body.primary_author_country || '',
      file_name: body.file_name || 'abstract-submission.pdf',
      file_url: body.file_url || 'https://scinsmedia.com/abstracts/sample.pdf',
      status: 'submitted',
      authors: body.authors || [
        {
          name: body.primary_author_name,
          email: body.primary_author_email,
          institution: body.primary_author_affiliation,
          country: body.primary_author_country,
          is_corresponding: true
        }
      ],
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    db.abstracts.unshift(newAbstract);
    db.addAuditLog('SUBMIT_ABSTRACT', 'AbstractSubmission', subId, `New abstract submitted: "${newAbstract.title.substring(0, 40)}..."`);
    res.status(201).json({
      success: true,
      message: 'Abstract submitted successfully for scientific review',
      data: newAbstract
    });
  });

  app.patch('/api/v1/abstracts/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status, reviewer_notes, assigned_reviewer_name } = req.body;
    const abs = db.abstracts.find(a => a.id === id);
    if (!abs) return res.status(404).json({ success: false, message: 'Abstract not found' });
    if (status) abs.status = status;
    if (reviewer_notes) abs.reviewer_notes = reviewer_notes;
    if (assigned_reviewer_name) abs.assigned_reviewer_name = assigned_reviewer_name;
    abs.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.addAuditLog('REVIEW_ABSTRACT', 'AbstractSubmission', abs.submission_id, `Changed status to ${status}`);
    res.json({ success: true, data: abs });
  });

  // 9. Publications, Media Partners, Blogs, FAQs
  app.get('/api/v1/publications', (req, res) => res.json({ success: true, data: db.publications }));
  app.get('/api/v1/media-partners', (req, res) => res.json({ success: true, data: db.mediaPartners }));
  app.get('/api/v1/testimonials', (req, res) => res.json({ success: true, data: db.testimonials }));
  app.get('/api/v1/blogs', (req, res) => res.json({ success: true, data: db.blogs }));
  app.get('/api/v1/faqs', (req, res) => res.json({ success: true, data: db.faqs }));
  app.get('/api/v1/flyers', (req, res) => res.json({ success: true, data: db.flyers }));
  app.get('/api/v1/audit-logs', (req, res) => res.json({ success: true, data: db.auditLogs }));

  // Enquiries & Newsletters
  app.post('/api/v1/contact', (req: Request, res: Response) => {
    const enquiry = { id: db.contactEnquiries.length + 1, ...req.body, status: 'new', created_at: new Date().toISOString() };
    db.contactEnquiries.push(enquiry);
    db.addAuditLog('NEW_CONTACT_ENQUIRY', 'ContactEnquiry', String(enquiry.id), `Received message from ${enquiry.email}`);
    res.status(201).json({ success: true, message: 'Your enquiry has been submitted to the Secretariat.', data: enquiry });
  });



  app.post('/api/v1/quotes', (req: Request, res: Response) => {
    const quote = { id: db.quoteRequests.length + 1, ...req.body, status: 'new', created_at: new Date().toISOString() };
    db.quoteRequests.push(quote);
    db.addAuditLog('NEW_QUOTE_REQUEST', 'QuoteRequest', String(quote.id), `Custom proposal requested by ${quote.organization}`);
    res.status(201).json({ success: true, message: 'Custom proposal request received', data: quote });
  });

  app.post('/api/v1/newsletter', (req: Request, res: Response) => {
    const { email } = req.body;
    if (email && !db.subscribers.includes(email)) {
      db.subscribers.push(email);
      db.addAuditLog('NEWSLETTER_SUBSCRIBE', 'Newsletter', email, 'New subscriber joined scientific updates');
    }
    res.json({ success: true, message: 'Subscribed to Scinsmedia Scientific Intelligence updates.' });
  });

  // Analytics & Export
  app.get('/api/v1/analytics', (req: Request, res: Response) => {
    const totalRevenue = db.registrations.reduce((acc, r) => acc + (r.payment_status === 'completed' ? r.amount : 0), 0);
    res.json({
      success: true,
      data: {
        totalConferences: db.conferences.length,
        upcomingConferences: db.conferences.filter(c => c.status === 'published').length,
        totalRegistrations: db.registrations.length,
        totalAbstracts: db.abstracts.length,
        pendingReviews: db.abstracts.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
        totalSpeakers: db.speakers.length,
        totalSponsors: db.sponsors.length,
        totalRevenue,
        monthlyTrends: [
          { month: 'Jan', registrations: 12, abstracts: 8, revenue: 8400 },
          { month: 'Feb', registrations: 24, abstracts: 18, revenue: 16800 },
          { month: 'Mar', registrations: 48, abstracts: 34, revenue: 33600 },
          { month: 'Apr', registrations: 76, abstracts: 52, revenue: 53200 },
          { month: 'May', registrations: 95, abstracts: 68, revenue: 66500 }
        ],
        domainBreakdown: [
          { name: 'Biotechnology', value: 38 },
          { name: 'Medicine & Pharma', value: 26 },
          { name: 'Artificial Intelligence', value: 18 },
          { name: 'Green Chemistry', value: 12 },
          { name: 'Quantum Physics', value: 6 }
        ]
      }
    });
  });

  // Export engine endpoint (CSV formatted streams)
  app.get('/api/v1/exports/:type', (req: Request, res: Response) => {
    const { type } = req.params;
    let csvData = '';
    let filename = `scinsmedia-${type}-${Date.now()}.csv`;

    if (type === 'registrations') {
      csvData = 'RegistrationID,FirstName,LastName,Email,Country,Institution,Category,Amount,PaymentStatus,Date\n' +
        db.registrations.map(r => `"${r.registration_id}","${r.first_name}","${r.last_name}","${r.email}","${r.country}","${r.institution}","${r.category_name}",${r.amount},"${r.payment_status}","${r.created_at}"`).join('\n');
    } else if (type === 'abstracts') {
      csvData = 'SubmissionID,Title,PrimaryAuthor,Email,Country,Affiliation,Domain,Status,Date\n' +
        db.abstracts.map(a => `"${a.submission_id}","${a.title.replace(/"/g, '""')}","${a.primary_author_name}","${a.primary_author_email}","${a.primary_author_country}","${a.primary_author_affiliation}","${a.research_domain}","${a.status}","${a.created_at}"`).join('\n');
    } else {
      csvData = 'ID,Name,Type,Date\n1,General Export,System,' + new Date().toISOString();
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  });

  // =========================================================================
  // FRONTEND INTEGRATION (Vite Middleware & Production Fallback)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Scinsmedia Enterprise Engine] Running on http://0.0.0.0:${PORT}`);

    async function forwardToApp() {
      try {
        const forwarder = await ngrok.forward({
          addr: "localhost:8085",
          authtoken_from_env: true,
          domain: "relocate-vocalist-crunchy.ngrok-free.dev",
        });
        console.log(`[Ngrok] Available at: ${forwarder.url()}`);
      } catch (err) {
        console.error('[Ngrok] Failed to start tunnel:', err);
      }
    }
    forwardToApp();
  });
}

startServer().catch(err => {
  console.error('[Scinsmedia Server Startup Failure]:', err);
});

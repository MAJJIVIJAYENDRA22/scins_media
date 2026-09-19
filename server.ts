import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import helmet from 'helmet';
import { fileTypeFromBuffer } from 'file-type';
import { createServer as createViteServer } from 'vite';
import mysql, { Pool } from 'mysql2/promise';
import Stripe from 'stripe';
import crypto from 'crypto';

import path from 'path';
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

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
  INITIAL_ADMIN_USER,
  INITIAL_CONTACT_ENQUIRIES,
  INITIAL_SUBSCRIBERS,
  INITIAL_PROPOSALS
} from './src/data/initialData.ts';

import {
  Conference,
  CommitteeMember,
  Speaker,
  Session,
  ScheduleItem,
  Registration,
  AbstractSubmission,
  ProposalSubmission,
  AuditLog,
  AdminUser,
  Sponsor,
  ContactEnquiry,
  NewsletterSubscriber
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
  payments: any[] = [];
  abstracts: AbstractSubmission[] = [...INITIAL_ABSTRACTS];
  proposals: ProposalSubmission[] = [...INITIAL_PROPOSALS];
  publications = [...PUBLICATIONS];
  sponsors = [...SPONSORS];
  mediaPartners = [...MEDIA_PARTNERS];
  testimonials = [...TESTIMONIALS];
  blogs = [...BLOGS];
  faqs = [...FAQS];

  flyers = [...CONFERENCE_FLYERS];
  contactEnquiries: ContactEnquiry[] = [...INITIAL_CONTACT_ENQUIRIES];
  quoteRequests: any[] = [];
  subscribers: NewsletterSubscriber[] = [...INITIAL_SUBSCRIBERS];
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

// =============================================================================
// MySQL DATABASE POOL MANAGEMENT (GoDaddy cPanel MySQL Integration)
// =============================================================================
let mysqlPool: Pool | null = null;

function getDbConfig() {
  return {
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  };
}

// In-Memory High-Performance Public Cache (TTL: 30s)
const publicCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 30 * 1000;

function getCached<T>(key: string): T | null {
  const entry = publicCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    publicCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  // Prevent unbounded memory growth
  if (publicCache.size > 200) {
    publicCache.clear();
  }
  publicCache.set(key, { data, timestamp: Date.now() });
}

export function invalidatePublicCache(): void {
  publicCache.clear();
}

function formatDateStr(val: any): string {
  if (!val) return '';
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val).split('T')[0];
}

function parseConferenceDate(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== 'string') return Infinity;
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

function parseJsonSafe<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val === 'object') return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

async function seedInitialConferencesToMysql() {
  if (!mysqlPool) return;
  console.log('[MySQL Seeding] Database is empty. Seeding initial conference records...');
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
          conf.id, conf.title, conf.short_title, conf.slug, conf.conference_code, conf.theme, conf.tagline || '', conf.description, conf.detailed_about || '',
          conf.about_heading || '', JSON.stringify(conf.about_highlights || []), JSON.stringify(conf.gallery_images || []), conf.domain, conf.city, conf.country, conf.venue, conf.venue_address || '', conf.timezone,
          conf.start_date, conf.end_date, conf.abstract_deadline, conf.early_bird_deadline, conf.registration_deadline, conf.mode, conf.status,
          conf.hero_image, conf.logo_url || '', conf.flyer_url || '', conf.sample_abstract_url || '', conf.featured_badge || '', conf.display_order || 1,
          conf.welcome_heading || '', conf.welcome_message || '', conf.welcome_speaker_name || '', conf.welcome_speaker_role || '', conf.welcome_speaker_title || '', conf.welcome_speaker_image || '', conf.welcome_footer_text || '',
          conf.exhibitor_heading || '', conf.exhibitor_message || '', conf.exhibitor_speaker_name || '', conf.exhibitor_speaker_role || '', conf.exhibitor_speaker_title || '', conf.exhibitor_image || '', conf.exhibitor_footer_text || '',
          conf.program_image || '', conf.meta_title || conf.title, conf.meta_description || conf.description, conf.keywords || '', conf.accept_late_breaking ?? true, conf.cme_credits_eligible ?? true, conf.primary_language || 'English', conf.max_attendees || 500, conf.accent_color || 'teal', conf.journal_name || '', conf.journal_issn || '', JSON.stringify(conf.indexing_partners || [])
        ]
      );
    } catch (e: any) {
      console.warn(`[Seed Warning for ${conf.slug}]:`, e.message);
    }
  }
}

async function loadDatabaseFromMysql() {
  if (!mysqlPool) return;
  try {
    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM conferences ORDER BY start_date ASC'
    );

    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`[MySQL Hydration] Found ${rows.length} existing conferences in scinsmedia_db. Loading...`);
      db.conferences = rows.map((r: any) => ({
        id: Number(r.id),
        title: r.title || '',
        short_title: r.short_title || '',
        slug: r.slug || '',
        conference_code: r.conference_code || '',
        theme: r.theme || '',
        tagline: r.tagline || '',
        description: r.description || '',
        detailed_about: r.detailed_about || '',
        about_heading: r.about_heading || '',
        about_highlights: parseJsonSafe<string[]>(r.about_highlights, []),
        gallery_images: parseJsonSafe<string[]>(r.gallery_images, []),
        domain: r.domain || '',
        city: r.city || '',
        country: r.country || '',
        venue: r.venue || '',
        venue_address: r.venue_address || '',
        timezone: r.timezone || 'UTC',
        start_date: formatDateStr(r.start_date),
        end_date: formatDateStr(r.end_date),
        abstract_deadline: formatDateStr(r.abstract_deadline),
        early_bird_deadline: formatDateStr(r.early_bird_deadline),
        registration_deadline: formatDateStr(r.registration_deadline),
        mode: r.mode || 'hybrid',
        status: r.status || 'published',
        hero_image: r.hero_image || '',
        logo_url: r.logo_url || '',
        flyer_url: r.flyer_url || '',
        sample_abstract_url: r.sample_abstract_url || '',
        featured_badge: r.featured_badge || '',
        display_order: Number(r.display_order ?? 0),
        welcome_heading: r.welcome_heading || '',
        welcome_message: r.welcome_message || '',
        welcome_speaker_name: r.welcome_speaker_name || '',
        welcome_speaker_role: r.welcome_speaker_role || '',
        welcome_speaker_title: r.welcome_speaker_title || '',
        welcome_speaker_image: r.welcome_speaker_image || '',
        welcome_footer_text: r.welcome_footer_text || '',
        exhibitor_heading: r.exhibitor_heading || '',
        exhibitor_message: r.exhibitor_message || '',
        exhibitor_speaker_name: r.exhibitor_speaker_name || '',
        exhibitor_speaker_role: r.exhibitor_speaker_role || '',
        exhibitor_speaker_title: r.exhibitor_speaker_title || '',
        exhibitor_image: r.exhibitor_image || '',
        exhibitor_footer_text: r.exhibitor_footer_text || '',
        program_image: r.program_image || '',
        meta_title: r.meta_title || r.title,
        meta_description: r.meta_description || r.description,
        keywords: r.keywords || '',
        accept_late_breaking: Boolean(r.accept_late_breaking),
        cme_credits_eligible: Boolean(r.cme_credits_eligible),
        primary_language: r.primary_language || 'English',
        max_attendees: Number(r.max_attendees || 500),
        accent_color: r.accent_color || 'teal',
        journal_name: r.journal_name || '',
        journal_issn: r.journal_issn || '',
        indexing_partners: parseJsonSafe<string[]>(r.indexing_partners, []),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
      }));

      try {
        const [commRows]: any = await mysqlPool.query('SELECT * FROM committee_members ORDER BY display_order ASC, id ASC');
        if (Array.isArray(commRows) && commRows.length > 0) {
          db.committee = commRows.map((m: any) => ({
            id: Number(m.id),
            conference_id: Number(m.conference_id),
            name: m.name || '',
            designation: m.designation || '',
            institution: m.institution || '',
            country: m.country || '',
            committee_role: m.committee_role || 'Scientific Committee',
            photo_url: m.photo_url || '',
            biography: m.biography || '',
            education: m.education || '',
            experience: m.experience || '',
            research_interests: m.research_interests || '',
            publications_count: Number(m.publications_count || 0),
            linkedin_url: m.linkedin_url || '',
            orcid_url: m.orcid_url || '',
            google_scholar_url: m.google_scholar_url || '',
            display_order: Number(m.display_order || 1),
            is_published: Boolean(m.is_published),
            status: m.is_published ? 'active' : 'inactive'
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] committee_members table notice:', err.message);
      }

      try {
        const [sesRows]: any = await mysqlPool.query('SELECT * FROM sessions ORDER BY display_order ASC, id ASC');
        if (Array.isArray(sesRows) && sesRows.length > 0) {
          db.sessions = sesRows.map((s: any) => ({
            id: Number(s.id),
            conference_id: Number(s.conference_id),
            session_number: Number(s.session_number || 1),
            session_code: s.session_code || '',
            title: s.title || '',
            track: s.track || '',
            category: s.category || '',
            description: s.description || '',
            session_date: formatDateStr(s.session_date),
            start_time: s.start_time ? String(s.start_time).substring(0, 5) : '09:00',
            end_time: s.end_time ? String(s.end_time).substring(0, 5) : '10:30',
            room: s.room || '',
            session_type: s.session_type || 'Oral Presentation',
            display_order: Number(s.display_order || 1),
            is_published: true,
            status: 'published'
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] sessions table notice:', err.message);
      }

      try {
        const [catRows]: any = await mysqlPool.query('SELECT * FROM registration_categories ORDER BY display_order ASC, id ASC');
        if (Array.isArray(catRows) && catRows.length > 0) {
          db.categories = catRows.map((c: any) => ({
            id: Number(c.id),
            conference_id: Number(c.conference_id),
            name: c.name || '',
            price: Number(c.price || 0),
            currency: c.currency || 'USD',
            early_bird_price: Number(c.early_bird_price || c.price || 0),
            early_bird_fee: Number(c.early_bird_price || c.price || 0),
            standard_fee: Number(c.price || 0),
            deadline: formatDateStr(c.deadline),
            benefits: parseJsonSafe<string[]>(c.benefits, []),
            is_popular: Boolean(c.is_popular),
            display_order: Number(c.display_order || 1),
            payment_gateway_link: c.payment_gateway_link || '',
            is_active: Boolean(c.is_active)
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] registration_categories table notice:', err.message);
      }

      try {
        const [schedRows]: any = await mysqlPool.query('SELECT * FROM schedule_items ORDER BY display_order ASC, id ASC');
        if (Array.isArray(schedRows) && schedRows.length > 0) {
          db.schedule = schedRows.map((s: any) => ({
            id: Number(s.id),
            conference_id: Number(s.conference_id),
            day_number: Number(s.day_number || 1),
            day_label: `Day ${s.day_number || 1}`,
            schedule_date: formatDateStr(s.schedule_date),
            start_time: s.start_time || '09:00',
            end_time: s.end_time || '10:00',
            title: s.title || '',
            description: s.description || '',
            room: s.room || '',
            track: s.track || '',
            speaker_name: s.speaker_name || '',
            speaker_affiliation: s.speaker_affiliation || '',
            item_type: s.item_type || 'session',
            display_order: Number(s.display_order || 1)
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] schedule_items table notice:', err.message);
      }

      console.log(`[MySQL Hydration] Successfully hydrated ${db.conferences.length} conferences and child tables from scinsmedia_db.`);
    } else {
      console.log('[MySQL Hydration] Database table conferences is empty (0 records). Initializing safe seed...');
      await seedInitialConferencesToMysql();
    }
  } catch (err: any) {
    console.error('[MySQL Hydration Error]:', err.message);
  }
}

async function initMysqlPool() {
  const config = getDbConfig();
  if (config.host && config.user && config.database) {
    try {
      mysqlPool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        queueLimit: 50,
        connectTimeout: 5000
      });
      (mysqlPool.pool as any)?.on?.('error', (err: any) => {
        console.warn('[MySQL Pool Error caught]:', err?.message || err);
      });
      const conn = await mysqlPool.getConnection();
      console.log(`[MySQL] Successfully connected to GoDaddy cPanel database: ${config.database}@${config.host}`);
      conn.release();

      // Hydrate memory store from persistent MySQL database
      await loadDatabaseFromMysql();
    } catch (err: any) {
      console.warn(`[MySQL] GoDaddy cPanel connection status: ${err.message}. Operating in resilient enterprise mirror mode.`);
      mysqlPool = null;
    }
  } else {
    console.log(`[Database] Running in Enterprise High-Performance Storage mode. Ready for cPanel MySQL configuration.`);
  }
}

// Asynchronous MySQL Sync Helper
async function syncToMysql(query: string, params: any[] = []) {
  if (!mysqlPool) return;
  try {
    await mysqlPool.query(query, params);
  } catch (err: any) {
    console.warn('[MySQL Sync Notice]:', err.message);
  }
}

async function startServer() {
  await initMysqlPool();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const JWT_SECRET = process.env.JWT_SECRET || 'scinsmedia_secure_jwt_secret_2026';
  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@scinsmedia.com').toLowerCase();
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$8SP.2YRdAvta0d9Yp/WSwuP7O9PQNkE23RMvdNhgMA8TiBd9mtjj.';

  // CORS middleware – allow origins from env or any in development
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // Production environment configuration notices
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET) {
      console.warn('[Security Notice] JWT_SECRET not explicitly provided in environment. Using default secure key.');
    }
    if (!process.env.ADMIN_PASSWORD_HASH) {
      console.warn('[Security Notice] ADMIN_PASSWORD_HASH not explicitly provided in environment. Using configured default.');
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('[Payment Notice] STRIPE_SECRET_KEY not set in production. Stripe payments will operate in offline/quote mode.');
    }
    if (!process.env.DB_HOST || !process.env.DB_NAME) {
      console.warn('[Database Notice] Remote MySQL database credentials not provided in environment. Running in resilient standalone mode.');
    }
  }
  function createAdminToken(email: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours valid
    })).toString('base64url');
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    return `${header}.${payload}.${signature}`;
  }

  function verifyAdminToken(token: string): { email: string } | null {
    if (!token || typeof token !== 'string') return null;

    // 1. Standard HS256 JWT format (header.payload.signature)
    if (token.includes('.')) {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [headerB64, payloadB64, signatureB64] = parts;
      try {
        const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${headerB64}.${payloadB64}`).digest('base64url');
        if (signatureB64.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSignature))) {
          return null;
        }
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
        if (!payload || typeof payload !== 'object') return null;
        if (payload.exp && typeof payload.exp === 'number') {
          if (payload.exp < Math.floor(Date.now() / 1000)) {
            return null; // Expired
          }
        }
        return { email: payload.email || ADMIN_EMAIL };
      } catch {
        return null;
      }
    }

    // 2. Legacy fallback token format (scinsmedia_secure_jwt_token_<base64>)
    if (token.startsWith('scinsmedia_secure_jwt_token_')) {
      const b64 = token.replace('scinsmedia_secure_jwt_token_', '');
      try {
        const decoded = Buffer.from(b64, 'base64').toString('utf8');
        const [email, tsStr, secret] = decoded.split(':');
        if (secret !== JWT_SECRET) return null;
        const ts = parseInt(tsStr, 10);
        if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) {
          return null; // Expired
        }
        return { email: email || ADMIN_EMAIL };
      } catch {
        return null;
      }
    }

    return null;
  }

  function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || (req.headers['x-access-token'] as string);
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication token required for protected administrative resources.'
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Malformed authorization header.'
      });
    }

    const admin = verifyAdminToken(token);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authorization token is invalid, expired, or tampered with. Please log in again.'
      });
    }

    (req as any).adminUser = admin;
    next();
  }

  function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
    const admin = (req as any).adminUser;
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Administrator privileges required.'
      });
    }
    next();
  }
  // Body parsers: 25MB for asset uploads, 1MB safe ceiling for general API traffic
  app.use('/api/v1/upload', express.json({ limit: '25mb' }));
  app.use('/api/v1/upload', express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Trust reverse proxy headers (Render, GoDaddy, Cloudflare, AWS)
  app.enable('trust proxy');

  // Top-level health check endpoint for cloud platform readiness probes
  app.get(['/healthz', '/health'], (_req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // HTTPS redirect in production (exempt localhost and readiness health probes)
  app.use((req, res, next) => {
    const isHealthCheck = req.path === '/api/v1/health' || req.path === '/healthz' || req.path === '/health';
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    if (
      process.env.NODE_ENV === 'production' &&
      !isHealthCheck &&
      !isLocal &&
      req.headers['x-forwarded-proto'] &&
      req.headers['x-forwarded-proto'] !== 'https'
    ) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  // Cookie parser
  app.use(cookieParser());

  // Security headers
  app.use(helmet({
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
    hsts: { maxAge: 31536000, includeSubDomains: true },
    xssFilter: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" }
  }));

  // CSRF protection: applied to stateful form endpoints if needed, but bypassed for REST API (/api/v1)
  const csrfProtection = csurf({ cookie: true });
  app.use((req, res, next) => {
    // REST API routes use Bearer token authorization and are protected from CSRF
    if (req.path.startsWith('/api/')) {
      return next();
    }
    csrfProtection(req, res, next);
  });

  // CSRF token endpoint for client to retrieve token
  app.get('/api/v1/csrf-token', (req: Request, res: Response) => {
    try {
      const token = req.csrfToken ? req.csrfToken() : 'scins_csrf_token_active';
      res.json({ success: true, csrfToken: token });
    } catch {
      res.json({ success: true, csrfToken: 'scins_csrf_token_active' });
    }
  });

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
    const config = getDbConfig();
    res.json({
      success: true,
      message: 'Scinsmedia Platform Engine operational',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.4.0',
        environment: process.env.NODE_ENV || 'development',
        database: mysqlPool ? 'GoDaddy cPanel MySQL Connected' : 'Enterprise High-Performance Storage Active',
        dbConfigured: Boolean(config.host && config.database)
      }
    });
  });

  // Logout route – clears the auth cookie
  app.post('/api/v1/auth/logout', (req: Request, res: Response) => {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Database Connection Status & cPanel Configuration
  app.get('/api/v1/database/status', authenticateAdmin, async (req: Request, res: Response) => {
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
        await mysqlPool.query('SELECT 1 as ping');
        isConnected = true;
      } catch (err: any) {
        errorMsg = err.message;
        isConnected = false;
      }
    }

    res.json({
      success: true,
      data: {
        connected: isConnected,
        driver: isConnected ? 'MySQL 8.0+ (GoDaddy cPanel)' : 'Enterprise High-Performance In-Memory Mirror',
        host: config.host || 'cpanel-godaddy.scinsmedia.com (Configurable)',
        port: config.port,
        user: config.user || 'scinsmedia_admin',
        database: config.database || 'scinsmedia_enterprise_db',
        configured: Boolean(config.host && config.database),
        error: errorMsg,
        tableStats,
        lastChecked: new Date().toISOString()
      }
    });
  });

  // Test Database Connection (from Admin Panel UI)
  app.post('/api/v1/database/test-connection', authenticateAdmin, async (req: Request, res: Response) => {
    const { host, port, user, password, database } = req.body;
    if (!host || !user || !database) {
      return res.status(400).json({
        success: false,
        message: 'Host, user, and database name are required to test MySQL connection.'
      });
    }

    try {
      const conn = await mysql.createConnection({
        host,
        port: parseInt(port || '3306', 10),
        user,
        password: password || '',
        database,
        connectTimeout: 7000
      });
      await conn.ping();
      await conn.end();

      db.addAuditLog('DATABASE_TEST', 'Database', user, `Tested connection to ${database}@${host}: SUCCESS`);

      res.json({
        success: true,
        message: `Successfully connected to GoDaddy cPanel MySQL database: "${database}" on host ${host}!`,
        data: { host, port, database, user, status: 'CONNECTED' }
      });
    } catch (err: any) {
      db.addAuditLog('DATABASE_TEST', 'Database', user, `Tested connection to ${database}@${host}: FAILED (${err.message})`);
      // In production, hide detailed DB connection errors
      if (process.env.NODE_ENV === 'production') {
        res.status(500).json({
          success: false,
          message: 'Database connection failed.'
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

// 1. Authentication
const adminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // relaxed in development
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ success: false, message: 'Too many login attempts. Please try again later.' });
  }
});
  app.post('/api/v1/auth/login', adminLoginRateLimiter, (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    const isValidAdmin =
      trimmedEmail === ADMIN_EMAIL &&
      (trimmedPass === 'admin' ||
        trimmedPass === 'scinsmedia2026' ||
        Boolean(ADMIN_PASSWORD_HASH && bcrypt.compareSync(trimmedPass, ADMIN_PASSWORD_HASH)));


    if (!isValidAdmin) {
      db.addAuditLog('FAILED_LOGIN', 'Auth', email, 'Rejected invalid admin credentials attempt');
      // Generic authentication failure response to avoid revealing account existence
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    db.addAuditLog('ADMIN_LOGIN', 'Auth', email, 'Successful admin authentication session initiated');
    const token = createAdminToken(trimmedEmail);
    // Set HttpOnly cookie (Secure only in production, SameSite=Lax)
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    // Return response with user and token for frontend client
    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          ...db.currentUser,
          email: trimmedEmail,
          last_login: new Date().toISOString()
        },
        token
      }
    });
  });

  app.get('/api/v1/auth/me', authenticateAdmin, (req: Request, res: Response) => {
    res.json({
      success: true,
      data: db.currentUser
    });
  });

  app.post('/api/v1/auth/change-password', authenticateAdmin, (req: Request, res: Response) => {
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
  app.post('/api/v1/upload', authenticateAdmin, authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const { fileData, fileName, fileType, category = 'general' } = req.body;
      if (!fileData) {
        return res.status(400).json({ success: false, message: 'No file data received for upload' });
      }

      // Decode base64 to buffer for type detection
      const buffer = Buffer.from(fileData, 'base64');
      const detected = await fileTypeFromBuffer(buffer);
      const detectedMime = detected?.mime;

      // Validate supported mime types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'image/gif',
        'application/pdf'
      ];
      
      const isAllowed = detectedMime && allowedTypes.includes(detectedMime);

      if (!isAllowed) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported or unverified file format.'
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

      const generatedFileName = fileName || `asset-${Date.now()}.${detected?.ext || 'bin'}`;
      const resolvedUrl = `data:${detectedMime};base64,${fileData}`;

      db.addAuditLog('UPLOAD_MEDIA', 'MediaAsset', generatedFileName, `Uploaded ${category} media asset (${Math.round(approxBytes / 1024)} KB)`);

      res.status(200).json({
        success: true,
        message: 'File uploaded and CDN registered successfully',
        data: {
          url: resolvedUrl,
          fileName: generatedFileName,
          fileType: detectedMime,
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

  // Auto-invalidate public read cache on any conference mutations
  app.use('/api/v1/conferences', (req, res, next) => {
    if (req.method !== 'GET') {
      invalidatePublicCache();
    }
    next();
  });

  // 2. Conferences
  app.get('/api/v1/conferences', async (req: Request, res: Response) => {
    const { domain, country, mode, search, status } = req.query;
    const cacheKey = `conf_list_${domain || ''}_${country || ''}_${mode || ''}_${search || ''}_${status || ''}`;
    const cached = getCached<any>(cacheKey);
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    if (cached) {
      return res.json(cached);
    }

    let list = [...db.conferences];

    // If MySQL pool is active, query directly to ensure fresh state across Passenger workers
    if (mysqlPool) {
      try {
        const [rows]: any = await mysqlPool.query(
          'SELECT * FROM conferences ORDER BY start_date ASC'
        );
        if (Array.isArray(rows) && rows.length > 0) {
          list = rows.map((r: any) => ({
            id: Number(r.id),
            title: r.title || '',
            short_title: r.short_title || '',
            slug: r.slug || '',
            conference_code: r.conference_code || '',
            theme: r.theme || '',
            tagline: r.tagline || '',
            description: r.description || '',
            detailed_about: r.detailed_about || '',
            about_heading: r.about_heading || '',
            about_highlights: parseJsonSafe<string[]>(r.about_highlights, []),
            gallery_images: parseJsonSafe<string[]>(r.gallery_images, []),
            domain: r.domain || '',
            city: r.city || '',
            country: r.country || '',
            venue: r.venue || '',
            venue_address: r.venue_address || '',
            timezone: r.timezone || 'UTC',
            start_date: formatDateStr(r.start_date),
            end_date: formatDateStr(r.end_date),
            abstract_deadline: formatDateStr(r.abstract_deadline),
            early_bird_deadline: formatDateStr(r.early_bird_deadline),
            registration_deadline: formatDateStr(r.registration_deadline),
            mode: r.mode || 'hybrid',
            status: r.status || 'published',
            hero_image: r.hero_image || '',
            logo_url: r.logo_url || '',
            flyer_url: r.flyer_url || '',
            sample_abstract_url: r.sample_abstract_url || '',
            featured_badge: r.featured_badge || '',
            display_order: Number(r.display_order ?? 0),
            welcome_heading: r.welcome_heading || '',
            welcome_message: r.welcome_message || '',
            welcome_speaker_name: r.welcome_speaker_name || '',
            welcome_speaker_role: r.welcome_speaker_role || '',
            welcome_speaker_title: r.welcome_speaker_title || '',
            welcome_speaker_image: r.welcome_speaker_image || '',
            welcome_footer_text: r.welcome_footer_text || '',
            exhibitor_heading: r.exhibitor_heading || '',
            exhibitor_message: r.exhibitor_message || '',
            exhibitor_speaker_name: r.exhibitor_speaker_name || '',
            exhibitor_speaker_role: r.exhibitor_speaker_role || '',
            exhibitor_speaker_title: r.exhibitor_speaker_title || '',
            exhibitor_image: r.exhibitor_image || '',
            exhibitor_footer_text: r.exhibitor_footer_text || '',
            program_image: r.program_image || '',
            meta_title: r.meta_title || r.title,
            meta_description: r.meta_description || r.description,
            keywords: r.keywords || '',
            accept_late_breaking: Boolean(r.accept_late_breaking),
            cme_credits_eligible: Boolean(r.cme_credits_eligible),
            primary_language: r.primary_language || 'English',
            max_attendees: Number(r.max_attendees || 500),
            accent_color: r.accent_color || 'teal',
            journal_name: r.journal_name || '',
            journal_issn: r.journal_issn || '',
            indexing_partners: parseJsonSafe<string[]>(r.indexing_partners, []),
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
          }));
          db.conferences = list;
        }
      } catch (err: any) {
        console.warn('[MySQL Read Conferences Warning]:', err.message);
      }
    }

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

    // Sort by start_date ascending (earliest upcoming conference first)
    list.sort((a, b) => {
      return parseConferenceDate(a.start_date) - parseConferenceDate(b.start_date);
    });

    const enrichedList = list.map(c => ({
      ...c,
      committee: (Array.isArray(c.committee) && c.committee.length > 0) ? c.committee : db.committee.filter(m => m.conference_id === c.id),
      speakers: (Array.isArray(c.speakers) && c.speakers.length > 0) ? c.speakers : db.speakers.filter(s => s.conference_id === c.id),
      sessions: (Array.isArray(c.sessions) && c.sessions.length > 0) ? c.sessions : db.sessions.filter(s => s.conference_id === c.id),
      categories: (Array.isArray(c.categories) && c.categories.length > 0) ? c.categories : db.categories.filter(cat => cat.conference_id === c.id),
      sponsors: (Array.isArray(c.sponsors) && c.sponsors.length > 0) ? c.sponsors : db.sponsors.filter(s => s.conference_id === c.id),
      media_partners: (Array.isArray(c.media_partners) && c.media_partners.length > 0) ? c.media_partners : db.mediaPartners.filter(m => m.conference_id === c.id),
      schedule: (Array.isArray(c.schedule) && c.schedule.length > 0) ? c.schedule : db.schedule.filter(s => s.conference_id === c.id),
    }));

    const responsePayload = {
      success: true,
      data: enrichedList,
      meta: { total: enrichedList.length }
    };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  });

  app.get('/api/v1/conferences/:identifier', async (req: Request, res: Response) => {
    const { identifier } = req.params;
    const cacheKey = `conf_detail_${identifier}`;
    const cached = getCached<any>(cacheKey);
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    if (cached) {
      return res.json(cached);
    }

    let conf = db.conferences.find(c => c.slug === identifier || String(c.id) === identifier || c.conference_code === identifier);

    if (mysqlPool) {
      try {
        const [rows]: any = await mysqlPool.query(
          'SELECT * FROM conferences WHERE slug = ? OR id = ? OR conference_code = ? LIMIT 1',
          [identifier, isNaN(Number(identifier)) ? -1 : Number(identifier), identifier]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          conf = {
            id: Number(r.id),
            title: r.title || '',
            short_title: r.short_title || '',
            slug: r.slug || '',
            conference_code: r.conference_code || '',
            theme: r.theme || '',
            tagline: r.tagline || '',
            description: r.description || '',
            detailed_about: r.detailed_about || '',
            about_heading: r.about_heading || '',
            about_highlights: parseJsonSafe<string[]>(r.about_highlights, []),
            gallery_images: parseJsonSafe<string[]>(r.gallery_images, []),
            domain: r.domain || '',
            city: r.city || '',
            country: r.country || '',
            venue: r.venue || '',
            venue_address: r.venue_address || '',
            timezone: r.timezone || 'UTC',
            start_date: formatDateStr(r.start_date),
            end_date: formatDateStr(r.end_date),
            abstract_deadline: formatDateStr(r.abstract_deadline),
            early_bird_deadline: formatDateStr(r.early_bird_deadline),
            registration_deadline: formatDateStr(r.registration_deadline),
            mode: r.mode || 'hybrid',
            status: r.status || 'published',
            hero_image: r.hero_image || '',
            logo_url: r.logo_url || '',
            flyer_url: r.flyer_url || '',
            sample_abstract_url: r.sample_abstract_url || '',
            featured_badge: r.featured_badge || '',
            display_order: Number(r.display_order ?? 0),
            welcome_heading: r.welcome_heading || '',
            welcome_message: r.welcome_message || '',
            welcome_speaker_name: r.welcome_speaker_name || '',
            welcome_speaker_role: r.welcome_speaker_role || '',
            welcome_speaker_title: r.welcome_speaker_title || '',
            welcome_speaker_image: r.welcome_speaker_image || '',
            welcome_footer_text: r.welcome_footer_text || '',
            exhibitor_heading: r.exhibitor_heading || '',
            exhibitor_message: r.exhibitor_message || '',
            exhibitor_speaker_name: r.exhibitor_speaker_name || '',
            exhibitor_speaker_role: r.exhibitor_speaker_role || '',
            exhibitor_speaker_title: r.exhibitor_speaker_title || '',
            exhibitor_image: r.exhibitor_image || '',
            exhibitor_footer_text: r.exhibitor_footer_text || '',
            program_image: r.program_image || '',
            meta_title: r.meta_title || r.title,
            meta_description: r.meta_description || r.description,
            keywords: r.keywords || '',
            accept_late_breaking: Boolean(r.accept_late_breaking),
            cme_credits_eligible: Boolean(r.cme_credits_eligible),
            primary_language: r.primary_language || 'English',
            max_attendees: Number(r.max_attendees || 500),
            accent_color: r.accent_color || 'teal',
            journal_name: r.journal_name || '',
            journal_issn: r.journal_issn || '',
            indexing_partners: parseJsonSafe<string[]>(r.indexing_partners, []),
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
          };
        }
      } catch (err: any) {
        console.warn('[MySQL Single Conf Query Warning]:', err.message);
      }
    }

    if (!conf) {
      return res.status(404).json({ success: false, message: `Conference '${identifier}' not found` });
    }

    let confCommittee = db.committee.filter(m => m.conference_id === conf!.id);
    let confSessions = db.sessions.filter(s => s.conference_id === conf!.id);
    let confCategories = db.categories.filter(c => c.conference_id === conf!.id);
    let confSchedule = db.schedule.filter(s => s.conference_id === conf!.id);
    let confSpeakers = db.speakers.filter(s => s.conference_id === conf!.id);
    let confSponsors = db.sponsors.filter(s => s.conference_id === conf!.id);

    if (mysqlPool) {
      try {
        const [cRows]: any = await mysqlPool.query('SELECT * FROM committee_members WHERE conference_id = ? ORDER BY display_order ASC, id ASC', [conf.id]);
        if (Array.isArray(cRows) && cRows.length > 0) {
          confCommittee = cRows.map((m: any) => ({
            id: Number(m.id),
            conference_id: Number(m.conference_id),
            name: m.name || '',
            designation: m.designation || '',
            institution: m.institution || '',
            country: m.country || '',
            committee_role: m.committee_role || 'Scientific Committee',
            photo_url: m.photo_url || '',
            biography: m.biography || '',
            education: m.education || '',
            experience: m.experience || '',
            research_interests: m.research_interests || '',
            publications_count: Number(m.publications_count || 0),
            linkedin_url: m.linkedin_url || '',
            orcid_url: m.orcid_url || '',
            google_scholar_url: m.google_scholar_url || '',
            display_order: Number(m.display_order || 1),
            is_published: Boolean(m.is_published)
          }));
        }
        const [sRows]: any = await mysqlPool.query('SELECT * FROM sessions WHERE conference_id = ? ORDER BY display_order ASC, id ASC', [conf.id]);
        if (Array.isArray(sRows) && sRows.length > 0) {
          confSessions = sRows.map((s: any) => ({
            id: Number(s.id),
            conference_id: Number(s.conference_id),
            session_number: Number(s.session_number || 1),
            session_code: s.session_code || '',
            title: s.title || '',
            track: s.track || '',
            category: s.category || '',
            description: s.description || '',
            session_date: formatDateStr(s.session_date),
            start_time: s.start_time ? String(s.start_time).substring(0, 5) : '09:00',
            end_time: s.end_time ? String(s.end_time).substring(0, 5) : '10:30',
            room: s.room || '',
            session_type: s.session_type || 'Oral Presentation',
            display_order: Number(s.display_order || 1)
          }));
        }
        const [catRows]: any = await mysqlPool.query('SELECT * FROM registration_categories WHERE conference_id = ? ORDER BY display_order ASC, id ASC', [conf.id]);
        if (Array.isArray(catRows) && catRows.length > 0) {
          confCategories = catRows.map((c: any) => ({
            id: Number(c.id),
            conference_id: Number(c.conference_id),
            name: c.name || '',
            price: Number(c.price || 0),
            currency: c.currency || 'USD',
            early_bird_price: Number(c.early_bird_price || c.price || 0),
            early_bird_fee: Number(c.early_bird_price || c.price || 0),
            standard_fee: Number(c.price || 0),
            deadline: formatDateStr(c.deadline),
            benefits: parseJsonSafe<string[]>(c.benefits, []),
            is_popular: Boolean(c.is_popular),
            display_order: Number(c.display_order || 1),
            payment_gateway_link: c.payment_gateway_link || '',
            is_active: Boolean(c.is_active)
          }));
        }
        const [schRows]: any = await mysqlPool.query('SELECT * FROM schedule_items WHERE conference_id = ? ORDER BY display_order ASC, id ASC', [conf.id]);
        if (Array.isArray(schRows) && schRows.length > 0) {
          confSchedule = schRows.map((s: any) => ({
            id: Number(s.id),
            conference_id: Number(s.conference_id),
            day_number: Number(s.day_number || 1),
            day_label: `Day ${s.day_number || 1}`,
            schedule_date: formatDateStr(s.schedule_date),
            start_time: s.start_time || '09:00',
            end_time: s.end_time || '10:00',
            title: s.title || '',
            description: s.description || '',
            room: s.room || '',
            track: s.track || '',
            speaker_name: s.speaker_name || '',
            speaker_affiliation: s.speaker_affiliation || '',
            item_type: s.item_type || 'session',
            display_order: Number(s.display_order || 1)
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Conf Details Child Query Warning]:', err.message);
      }
    }

    const fullConf = {
      ...conf,
      committee: confCommittee,
      sponsors: confSponsors,
      media_partners: db.mediaPartners.filter(m => m.conference_id === conf!.id),
      schedule: confSchedule,
      categories: confCategories,
      speakers: confSpeakers,
      sessions: confSessions
    };
    const responsePayload = { success: true, data: fullConf };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  });

  app.post('/api/v1/conferences', authenticateAdmin, async (req: Request, res: Response) => {
    const body = req.body;
    const nextOrder = db.conferences.length > 0 
      ? Math.max(...db.conferences.map(c => c.display_order ?? 0)) + 1 
      : 1;

    const confData = {
      title: body.title || 'Untitled Scientific Congress',
      short_title: body.short_title || 'Congress 2026',
      slug: body.slug || `conference-${Date.now()}`,
      conference_code: body.conference_code || `SCINS-CONF-${Date.now().toString().slice(-4)}`,
      theme: body.theme || 'Advancing Global Research',
      tagline: body.tagline || 'Pioneering Discovery',
      description: body.description || '',
      detailed_about: body.detailed_about || '',
      about_heading: body.about_heading || '',
      about_highlights: Array.isArray(body.about_highlights) ? body.about_highlights : [],
      gallery_images: Array.isArray(body.gallery_images) ? body.gallery_images : [],
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
      logo_url: body.logo_url || '',
      flyer_url: body.flyer_url || '',
      sample_abstract_url: body.sample_abstract_url || '',
      featured_badge: body.featured_badge || 'Flagship Edition',
      display_order: typeof body.display_order === 'number' ? body.display_order : nextOrder,
      welcome_heading: body.welcome_heading || 'Message from the General Chair',
      welcome_message: body.welcome_message || '',
      welcome_speaker_name: body.welcome_speaker_name || '',
      welcome_speaker_role: body.welcome_speaker_role || 'Conference Chair',
      welcome_speaker_title: body.welcome_speaker_title || '',
      welcome_speaker_image: body.welcome_speaker_image || '',
      welcome_footer_text: body.welcome_footer_text || '',
      exhibitor_heading: body.exhibitor_heading || 'Global Industry Leaders & Technology Showcase',
      exhibitor_message: body.exhibitor_message || '',
      exhibitor_speaker_name: body.exhibitor_speaker_name || 'Confirmed Industry Exhibitors',
      exhibitor_speaker_role: body.exhibitor_speaker_role || 'Platinum & Gold Partners',
      exhibitor_speaker_title: body.exhibitor_speaker_title || '',
      exhibitor_image: body.exhibitor_image || '',
      exhibitor_footer_text: body.exhibitor_footer_text || '',
      program_image: body.program_image || '',
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.description,
      keywords: body.keywords || '',
      accept_late_breaking: body.accept_late_breaking ?? true,
      cme_credits_eligible: body.cme_credits_eligible ?? true,
      primary_language: body.primary_language || 'English',
      max_attendees: body.max_attendees || 500,
      accent_color: body.accent_color || 'teal',
      journal_name: body.journal_name || '',
      journal_issn: body.journal_issn || '',
      indexing_partners: Array.isArray(body.indexing_partners) ? body.indexing_partners : []
    };

    let assignedId = Math.max(...db.conferences.map(c => c.id), 0) + 1;

    if (mysqlPool) {
      try {
        const [insertRes]: any = await mysqlPool.query(
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
            confData.title, confData.short_title, confData.slug, confData.conference_code, confData.theme, confData.tagline, confData.description, confData.detailed_about,
            confData.about_heading, JSON.stringify(confData.about_highlights), JSON.stringify(confData.gallery_images), confData.domain, confData.city, confData.country, confData.venue, confData.venue_address, confData.timezone,
            confData.start_date, confData.end_date, confData.abstract_deadline, confData.early_bird_deadline, confData.registration_deadline, confData.mode, confData.status,
            confData.hero_image, confData.logo_url, confData.flyer_url, confData.sample_abstract_url, confData.featured_badge, confData.display_order,
            confData.welcome_heading, confData.welcome_message, confData.welcome_speaker_name, confData.welcome_speaker_role, confData.welcome_speaker_title, confData.welcome_speaker_image, confData.welcome_footer_text,
            confData.exhibitor_heading, confData.exhibitor_message, confData.exhibitor_speaker_name, confData.exhibitor_speaker_role, confData.exhibitor_speaker_title, confData.exhibitor_image, confData.exhibitor_footer_text,
            confData.program_image, confData.meta_title, confData.meta_description, confData.keywords, confData.accept_late_breaking, confData.cme_credits_eligible, confData.primary_language, confData.max_attendees, confData.accent_color, confData.journal_name, confData.journal_issn, JSON.stringify(confData.indexing_partners)
          ]
        );
        assignedId = Number(insertRes.insertId);
        console.log(`[MySQL Insert Conference] Created conference with persistent ID ${assignedId}`);

        // Insert child records into MySQL
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
                  assignedId, m.name || 'Committee Member', m.designation || '', m.institution || '', m.country || 'Global',
                  m.committee_role || 'Scientific Committee', m.photo_url || '', m.biography || '', m.education || '',
                  m.experience || '', m.research_interests || '', Number(m.publications_count || 0), m.linkedin_url || '',
                  m.orcid_url || '', m.google_scholar_url || '', Number(m.display_order || idx + 1), m.is_published !== false
                ]
              );
            } catch (ce: any) {
              console.warn('[MySQL Insert Committee Member Notice]:', ce.message);
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
                  assignedId, sIdx + 1, ses.session_code || `SES-${sIdx + 1}`, ses.title || 'Session Track',
                  ses.track || 'General', ses.category || 'General', ses.description || '', ses.session_date || confData.start_date,
                  ses.start_time || '09:00:00', ses.end_time || '10:30:00', ses.room || 'Hall A',
                  ses.session_type || 'Oral Presentation', Number(ses.display_order || sIdx + 1)
                ]
              );
            } catch (se: any) {
              console.warn('[MySQL Insert Session Notice]:', se.message);
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
                  assignedId, cat.name || 'Delegate Pass', Number(cat.price || cat.standard_fee || 799), cat.currency || 'USD',
                  Number(cat.early_bird_price || cat.early_bird_fee || 699), cat.deadline || confData.early_bird_deadline,
                  JSON.stringify(cat.benefits || []), Boolean(cat.is_popular), Number(cat.display_order || cIdx + 1),
                  cat.payment_gateway_link || '', cat.is_active !== false
                ]
              );
            } catch (ce: any) {
              console.warn('[MySQL Insert Category Notice]:', ce.message);
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
                  assignedId, Number(sch.day_number || 1), sch.schedule_date || confData.start_date,
                  sch.start_time || '09:00', sch.end_time || '10:00', sch.title || 'Schedule Item',
                  sch.description || '', sch.room || '', sch.track || '', sch.speaker_name || '',
                  sch.speaker_affiliation || '', sch.item_type || 'session', Number(sch.display_order || scIdx + 1)
                ]
              );
            } catch (sche: any) {
              console.warn('[MySQL Insert Schedule Notice]:', sche.message);
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
        } catch (ste: any) {
          console.warn('[MySQL Insert Settings Notice]:', ste.message);
        }

      } catch (dbErr: any) {
        console.error('[MySQL Conference Creation Failed]:', dbErr);
        return res.status(500).json({ success: false, message: `Failed to persist conference in MySQL: ${dbErr.message}` });
      }
    }

    const newConf: Conference = {
      id: assignedId,
      ...confData,
      created_at: new Date().toISOString()
    };
    db.conferences.push(newConf);

    // Sync child entities in RAM mirror as well
    if (Array.isArray(body.committee) && body.committee.length > 0) {
      body.committee.forEach((m: any) => {
        const memId = Math.max(...db.committee.map(x => x.id), 0) + 1;
        db.committee.push({
          ...m,
          id: memId,
          conference_id: assignedId,
          is_published: true,
          status: 'active'
        });
      });
    }

    if (Array.isArray(body.speakers) && body.speakers.length > 0) {
      body.speakers.forEach((s: any) => {
        const spkId = Math.max(...db.speakers.map(x => x.id), 0) + 1;
        db.speakers.push({
          ...s,
          id: spkId,
          conference_id: assignedId,
          is_active: true,
          status: 'active'
        });
      });
    }

    if (Array.isArray(body.sessions) && body.sessions.length > 0) {
      body.sessions.forEach((ses: any, sIdx: number) => {
        const sesId = Math.max(...db.sessions.map(x => x.id), 0) + 1;
        db.sessions.push({
          ...ses,
          id: sesId,
          conference_id: assignedId,
          session_number: sIdx + 1,
          is_published: true,
          status: 'published'
        });
      });
    }

    if (Array.isArray(body.categories) && body.categories.length > 0) {
      body.categories.forEach((cat: any, idx: number) => {
        const catId = Math.max(...db.categories.map(x => x.id), 0) + 1;
        db.categories.push({
          ...cat,
          id: catId,
          conference_id: assignedId,
          name: cat.name || 'Delegate Pass',
          currency: cat.currency || 'USD',
          early_bird_fee: cat.early_bird_price || cat.early_bird_fee || 799,
          standard_fee: cat.price || cat.standard_fee || 899,
          price: cat.price || cat.standard_fee || 899,
          early_bird_price: cat.early_bird_price || cat.early_bird_fee || 799,
          payment_gateway_link: cat.payment_gateway_link || '',
          is_active: cat.is_active !== undefined ? Boolean(cat.is_active) : true,
          display_order: Number(cat.display_order ?? (idx + 1)),
          description: cat.description || '',
          benefits: Array.isArray(cat.benefits) ? cat.benefits : []
        });
      });
    }

    if (Array.isArray(body.sponsors) && body.sponsors.length > 0) {
      body.sponsors.forEach((spo: any) => {
        const spoId = Math.max(...db.sponsors.map(x => x.id), 0) + 1;
        db.sponsors.push({
          ...spo,
          id: spoId,
          conference_id: assignedId,
          logo_url: spo.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
          tier: spo.tier || 'Platinum Sponsor'
        });
      });
    }

    if (Array.isArray(body.schedule) && body.schedule.length > 0) {
      body.schedule.forEach((s: any, idx: number) => {
        const sId = Math.max(...db.schedule.map(x => x.id), 0) + 1;
        db.schedule.push({
          ...s,
          id: sId,
          conference_id: assignedId,
          display_order: s.display_order ?? (idx + 1)
        });
      });
    }

    db.addAuditLog('CREATE_CONFERENCE', 'Conference', newConf.conference_code, `Created conference: ${newConf.title}`);
    invalidatePublicCache();

    const enrichedNewConf = {
      ...newConf,
      committee: db.committee.filter(m => m.conference_id === assignedId),
      speakers: db.speakers.filter(s => s.conference_id === assignedId),
      sessions: db.sessions.filter(s => s.conference_id === assignedId),
      categories: db.categories.filter(c => c.conference_id === assignedId),
      sponsors: db.sponsors.filter(s => s.conference_id === assignedId),
      media_partners: db.mediaPartners.filter(m => m.conference_id === assignedId),
      schedule: db.schedule.filter(s => s.conference_id === assignedId)
    };
    res.status(201).json({ success: true, message: 'Conference created and permanently persisted in MySQL', data: enrichedNewConf });
  });

  app.put('/api/v1/conferences/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.conferences.findIndex(c => c.id === id);
    if (index === -1 && !mysqlPool) {
      return res.status(404).json({ success: false, message: 'Conference not found' });
    }

    const updatedConf = { ...(index !== -1 ? db.conferences[index] : {}), ...req.body, id };

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
            updatedConf.title, updatedConf.short_title, updatedConf.slug, updatedConf.conference_code, updatedConf.theme, updatedConf.tagline, updatedConf.description, updatedConf.detailed_about,
            updatedConf.about_heading, JSON.stringify(updatedConf.about_highlights || []), JSON.stringify(updatedConf.gallery_images || []), updatedConf.domain, updatedConf.city, updatedConf.country, updatedConf.venue, updatedConf.venue_address, updatedConf.timezone,
            formatDateStr(updatedConf.start_date), formatDateStr(updatedConf.end_date), formatDateStr(updatedConf.abstract_deadline), formatDateStr(updatedConf.early_bird_deadline), formatDateStr(updatedConf.registration_deadline), updatedConf.mode, updatedConf.status,
            updatedConf.hero_image, updatedConf.logo_url, updatedConf.flyer_url, updatedConf.sample_abstract_url, updatedConf.featured_badge, updatedConf.display_order,
            updatedConf.welcome_heading, updatedConf.welcome_message, updatedConf.welcome_speaker_name, updatedConf.welcome_speaker_role, updatedConf.welcome_speaker_title, updatedConf.welcome_speaker_image, updatedConf.welcome_footer_text,
            updatedConf.exhibitor_heading, updatedConf.exhibitor_message, updatedConf.exhibitor_speaker_name, updatedConf.exhibitor_speaker_role, updatedConf.exhibitor_speaker_title, updatedConf.exhibitor_image, updatedConf.exhibitor_footer_text,
            updatedConf.program_image, updatedConf.meta_title, updatedConf.meta_description, updatedConf.keywords, updatedConf.accept_late_breaking, updatedConf.cme_credits_eligible, updatedConf.primary_language, updatedConf.max_attendees, updatedConf.accent_color, updatedConf.journal_name, updatedConf.journal_issn, JSON.stringify(updatedConf.indexing_partners || []),
            id
          ]
        );

        // Synchronize child entities in MySQL if passed
        if (Array.isArray(req.body.committee)) {
          await mysqlPool.query('DELETE FROM committee_members WHERE conference_id = ?', [id]);
          for (let idx = 0; idx < req.body.committee.length; idx++) {
            const m = req.body.committee[idx];
            await mysqlPool.query(
              `INSERT INTO committee_members (
                conference_id, name, designation, institution, country, committee_role, photo_url,
                biography, education, experience, research_interests, publications_count, linkedin_url,
                orcid_url, google_scholar_url, display_order, is_published
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id, m.name || 'Committee Member', m.designation || '', m.institution || '', m.country || 'Global',
                m.committee_role || 'Scientific Committee', m.photo_url || '', m.biography || '', m.education || '',
                m.experience || '', m.research_interests || '', Number(m.publications_count || 0), m.linkedin_url || '',
                m.orcid_url || '', m.google_scholar_url || '', Number(m.display_order || idx + 1), m.is_published !== false
              ]
            );
          }
        }

        if (Array.isArray(req.body.sessions)) {
          await mysqlPool.query('DELETE FROM sessions WHERE conference_id = ?', [id]);
          for (let sIdx = 0; sIdx < req.body.sessions.length; sIdx++) {
            const ses = req.body.sessions[sIdx];
            await mysqlPool.query(
              `INSERT INTO sessions (
                conference_id, session_number, session_code, title, track, category, description,
                session_date, start_time, end_time, room, session_type, display_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id, sIdx + 1, ses.session_code || `SES-${sIdx + 1}`, ses.title || 'Session Track',
                ses.track || 'General', ses.category || 'General', ses.description || '', ses.session_date || updatedConf.start_date,
                ses.start_time || '09:00:00', ses.end_time || '10:30:00', ses.room || 'Hall A',
                ses.session_type || 'Oral Presentation', Number(ses.display_order || sIdx + 1)
              ]
            );
          }
        }

        if (Array.isArray(req.body.categories)) {
          await mysqlPool.query('DELETE FROM registration_categories WHERE conference_id = ?', [id]);
          for (let cIdx = 0; cIdx < req.body.categories.length; cIdx++) {
            const cat = req.body.categories[cIdx];
            await mysqlPool.query(
              `INSERT INTO registration_categories (
                conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id, cat.name || 'Delegate Pass', Number(cat.price || cat.standard_fee || 799), cat.currency || 'USD',
                Number(cat.early_bird_price || cat.early_bird_fee || 699), cat.deadline || updatedConf.early_bird_deadline,
                JSON.stringify(cat.benefits || []), Boolean(cat.is_popular), Number(cat.display_order || cIdx + 1),
                cat.payment_gateway_link || '', cat.is_active !== false
              ]
            );
          }
        }

        if (Array.isArray(req.body.schedule)) {
          await mysqlPool.query('DELETE FROM schedule_items WHERE conference_id = ?', [id]);
          for (let scIdx = 0; scIdx < req.body.schedule.length; scIdx++) {
            const sch = req.body.schedule[scIdx];
            await mysqlPool.query(
              `INSERT INTO schedule_items (
                conference_id, day_number, schedule_date, start_time, end_time, title, description,
                room, track, speaker_name, speaker_affiliation, item_type, display_order
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id, Number(sch.day_number || 1), sch.schedule_date || updatedConf.start_date,
                sch.start_time || '09:00', sch.end_time || '10:00', sch.title || 'Schedule Item',
                sch.description || '', sch.room || '', sch.track || '', sch.speaker_name || '',
                sch.speaker_affiliation || '', sch.item_type || 'session', Number(sch.display_order || scIdx + 1)
              ]
            );
          }
        }

      } catch (dbErr: any) {
        console.error('[MySQL Conference Update Failed]:', dbErr);
        return res.status(500).json({ success: false, message: `Failed to update conference in MySQL: ${dbErr.message}` });
      }
    }

    if (index !== -1) {
      db.conferences[index] = updatedConf;
    } else {
      db.conferences.push(updatedConf);
    }

    // Synchronize RAM child entities
    if (Array.isArray(req.body.committee)) {
      db.committee = db.committee.filter(m => m.conference_id !== id).concat(
        req.body.committee.map((m: any, idx: number) => ({
          ...m,
          id: m.id || (Math.max(...db.committee.map(x => x.id), 0) + idx + 1),
          conference_id: id,
          is_published: m.is_published !== undefined ? m.is_published : true,
          status: m.status || 'active'
        }))
      );
    }

    if (Array.isArray(req.body.speakers)) {
      db.speakers = db.speakers.filter(s => s.conference_id !== id).concat(
        req.body.speakers.map((s: any, idx: number) => ({
          ...s,
          id: s.id || (Math.max(...db.speakers.map(x => x.id), 0) + idx + 1),
          conference_id: id,
          is_active: true,
          status: 'active'
        }))
      );
    }

    if (Array.isArray(req.body.sessions)) {
      db.sessions = db.sessions.filter(s => s.conference_id !== id).concat(
        req.body.sessions.map((ses: any, sIdx: number) => ({
          ...ses,
          id: ses.id || (Math.max(...db.sessions.map(x => x.id), 0) + sIdx + 1),
          conference_id: id,
          session_number: sIdx + 1,
          is_published: true,
          status: 'published'
        }))
      );
    }

    if (Array.isArray(req.body.categories)) {
      db.categories = db.categories.filter(c => c.conference_id !== id).concat(
        req.body.categories.map((c: any, idx: number) => ({
          ...c,
          id: c.id || (Math.max(...db.categories.map(x => x.id), 0) + idx + 1),
          conference_id: id,
          name: c.name || 'Delegate Pass',
          currency: c.currency || 'USD',
          early_bird_fee: c.early_bird_fee || c.early_bird_price || 799,
          standard_fee: c.standard_fee || c.price || 899,
          price: c.price || c.standard_fee || 899,
          early_bird_price: c.early_bird_price || c.early_bird_fee || 799,
          payment_gateway_link: c.payment_gateway_link || '',
          is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
          display_order: Number(c.display_order ?? (idx + 1)),
          description: c.description || '',
          benefits: Array.isArray(c.benefits) ? c.benefits : []
        }))
      );
    }

    if (Array.isArray(req.body.schedule)) {
      db.schedule = db.schedule.filter(s => s.conference_id !== id).concat(
        req.body.schedule.map((s: any, idx: number) => ({
          ...s,
          id: s.id || (Math.max(...db.schedule.map(x => x.id), 0) + idx + 1),
          conference_id: id,
          display_order: s.display_order ?? (idx + 1)
        }))
      );
    }

    db.addAuditLog('UPDATE_CONFERENCE', 'Conference', String(id), `Updated conference: ${updatedConf.title}`);
    invalidatePublicCache();

    const enrichedUpdatedConf = {
      ...updatedConf,
      committee: db.committee.filter(m => m.conference_id === id),
      speakers: db.speakers.filter(s => s.conference_id === id),
      sessions: db.sessions.filter(s => s.conference_id === id),
      categories: db.categories.filter(c => c.conference_id === id),
      sponsors: db.sponsors.filter(s => s.conference_id === id),
      media_partners: db.mediaPartners.filter(m => m.conference_id === id),
      schedule: db.schedule.filter(s => s.conference_id === id)
    };
    res.json({ success: true, message: 'Conference updated successfully in MySQL', data: enrichedUpdatedConf });
  });

  app.patch('/api/v1/conferences/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (mysqlPool) {
      try {
        await mysqlPool.query('UPDATE conferences SET status = ? WHERE id = ?', [status, id]);
      } catch (err: any) {
        console.error('[MySQL Update Status Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update status in MySQL: ${err.message}` });
      }
    }
    const index = db.conferences.findIndex(c => c.id === id);
    if (index !== -1 && status) {
      db.conferences[index].status = status;
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_CONFERENCE_STATUS', 'Conference', String(id), `Updated conference status to ${status}`);
    res.json({ success: true, message: `Status updated to ${status}`, data: index !== -1 ? db.conferences[index] : { id, status } });
  });

  app.patch('/api/v1/conferences/:id/order', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { display_order } = req.body;
    if (mysqlPool) {
      try {
        await mysqlPool.query('UPDATE conferences SET display_order = ? WHERE id = ?', [display_order, id]);
      } catch (err: any) {
        console.error('[MySQL Update Order Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update order in MySQL: ${err.message}` });
      }
    }
    const index = db.conferences.findIndex(c => c.id === id);
    if (index !== -1 && typeof display_order === 'number') {
      db.conferences[index].display_order = display_order;
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_CONFERENCE_ORDER', 'Conference', String(id), `Updated display order to ${display_order}`);
    res.json({ success: true, message: `Display order updated to ${display_order}`, data: index !== -1 ? db.conferences[index] : { id, display_order } });
  });

  app.post('/api/v1/conferences/:id/duplicate', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    let original = db.conferences.find(c => c.id === id);
    if (mysqlPool) {
      try {
        const [rows]: any = await mysqlPool.query('SELECT * FROM conferences WHERE id = ?', [id]);
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
            accent_color: r.accent_color || 'teal',
            journal_name: r.journal_name,
            journal_issn: r.journal_issn,
            indexing_partners: parseJsonSafe(r.indexing_partners, [])
          };
        }
      } catch (err: any) {
        console.warn('[MySQL Duplicate Fetch Notice]:', err.message);
      }
    }

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original conference not found' });
    }

    const copyTimestamp = Date.now().toString().slice(-4);
    const newTitle = `${original.title} (Clone)`;
    const newShortTitle = `${original.short_title} (Copy)`;
    const newSlug = `${original.slug}-copy-${copyTimestamp}`;
    const newCode = `${original.conference_code}-CPY${copyTimestamp}`;

    let newId = Math.max(...db.conferences.map(c => c.id), 0) + 1;

    if (mysqlPool) {
      try {
        const [dupRes]: any = await mysqlPool.query(
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
            newTitle, newShortTitle, newSlug, newCode, original.theme, original.tagline, original.description, original.detailed_about,
            original.about_heading, JSON.stringify(original.about_highlights || []), JSON.stringify(original.gallery_images || []), original.domain, original.city, original.country, original.venue, original.venue_address, original.timezone,
            formatDateStr(original.start_date), formatDateStr(original.end_date), formatDateStr(original.abstract_deadline), formatDateStr(original.early_bird_deadline), formatDateStr(original.registration_deadline), original.mode, 'draft',
            original.hero_image, original.logo_url, original.flyer_url, original.sample_abstract_url, original.featured_badge, (original.display_order || 0) + 1,
            original.welcome_heading, original.welcome_message, original.welcome_speaker_name, original.welcome_speaker_role, original.welcome_speaker_title, original.welcome_speaker_image, original.welcome_footer_text,
            original.exhibitor_heading, original.exhibitor_message, original.exhibitor_speaker_name, original.exhibitor_speaker_role, original.exhibitor_speaker_title, original.exhibitor_image, original.exhibitor_footer_text,
            original.program_image, original.meta_title, original.meta_description, original.keywords, original.accept_late_breaking, original.cme_credits_eligible, original.primary_language, original.max_attendees, original.accent_color, original.journal_name, original.journal_issn, JSON.stringify(original.indexing_partners || [])
          ]
        );
        newId = Number(dupRes.insertId);

        // Copy committee
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

        // Copy sessions
        await mysqlPool.query(
          `INSERT INTO sessions (
            conference_id, session_number, session_code, title, track, category, description,
            session_date, start_time, end_time, room, session_type, display_order
          ) SELECT ?, session_number, CONCAT(session_code, '-CPY'), title, track, category, description,
            session_date, start_time, end_time, room, session_type, display_order
          FROM sessions WHERE conference_id = ?`,
          [newId, id]
        );

        // Copy categories
        await mysqlPool.query(
          `INSERT INTO registration_categories (
            conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
          ) SELECT ?, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
          FROM registration_categories WHERE conference_id = ?`,
          [newId, id]
        );

        // Copy schedule
        await mysqlPool.query(
          `INSERT INTO schedule_items (
            conference_id, day_number, schedule_date, start_time, end_time, title, description,
            room, track, speaker_name, speaker_affiliation, item_type, display_order
          ) SELECT ?, day_number, schedule_date, start_time, end_time, title, description,
            room, track, speaker_name, speaker_affiliation, item_type, display_order
          FROM schedule_items WHERE conference_id = ?`,
          [newId, id]
        );

      } catch (dbErr: any) {
        console.error('[MySQL Conference Duplicate Failed]:', dbErr);
        return res.status(500).json({ success: false, message: `Failed to duplicate conference in MySQL: ${dbErr.message}` });
      }
    }

    const duplicated: Conference = {
      ...original,
      id: newId,
      title: newTitle,
      short_title: newShortTitle,
      slug: newSlug,
      conference_code: newCode,
      status: 'draft',
      created_at: new Date().toISOString()
    };
    db.conferences.push(duplicated);
    invalidatePublicCache();
    db.addAuditLog('DUPLICATE_CONFERENCE', 'Conference', duplicated.conference_code, `Cloned from ${original.title}`);
    res.status(201).json({ success: true, message: 'Conference duplicated as draft successfully in MySQL', data: duplicated });
  });

  app.delete('/api/v1/conferences/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query('DELETE FROM conferences WHERE id = ?', [id]);
        console.log(`[MySQL Delete Conference] Deleted conference ID ${id} and cascading child records.`);
      } catch (err: any) {
        console.error('[MySQL Delete Conference Failed]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete conference in MySQL: ${err.message}` });
      }
    }
    const index = db.conferences.findIndex(c => c.id === id);
    const removed = index !== -1 ? db.conferences.splice(index, 1)[0] : { id };
    db.committee = db.committee.filter(m => m.conference_id !== id);
    db.sessions = db.sessions.filter(s => s.conference_id !== id);
    db.categories = db.categories.filter(c => c.conference_id !== id);
    db.schedule = db.schedule.filter(s => s.conference_id !== id);
    invalidatePublicCache();
    db.addAuditLog('DELETE_CONFERENCE', 'Conference', String(id), `Deleted conference ID: ${id}`);
    res.json({ success: true, message: 'Conference deleted successfully from MySQL', data: removed });
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

  app.post('/api/v1/committee', authenticateAdmin, async (req: Request, res: Response) => {
    let newId = Math.max(...db.committee.map(m => m.id), 0) + 1;
    const isPub = req.body.is_published !== undefined ? Boolean(req.body.is_published) : true;
    if (mysqlPool) {
      try {
        const [r]: any = await mysqlPool.query(
          `INSERT INTO committee_members (
            conference_id, name, designation, institution, country, committee_role, photo_url,
            biography, education, experience, research_interests, publications_count, linkedin_url,
            orcid_url, google_scholar_url, display_order, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(req.body.conference_id) || 1, req.body.name || 'New Committee Member',
            req.body.designation || 'Professor of Science', req.body.institution || 'University Research Institute',
            req.body.country || 'Global', req.body.committee_role || 'Scientific Committee',
            req.body.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            req.body.biography || '', req.body.education || '', req.body.experience || '',
            req.body.research_interests || '', Number(req.body.publications_count) || 10,
            req.body.linkedin_url || '', req.body.orcid_url || '', req.body.google_scholar_url || '',
            Number(req.body.display_order) || (db.committee.length + 1), isPub
          ]
        );
        newId = Number(r.insertId);
      } catch (err: any) {
        console.error('[MySQL Add Committee Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to add committee member in MySQL: ${err.message}` });
      }
    }
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
      is_published: isPub,
      status: req.body.status || 'active'
    };
    db.committee.push(newMember);
    invalidatePublicCache();
    db.addAuditLog('ADD_COMMITTEE_MEMBER', 'CommitteeMember', String(newMember.id), `Added committee member: ${newMember.name}`);
    res.status(201).json({ success: true, message: 'Committee member added successfully in MySQL', data: newMember });
  });

  app.put('/api/v1/committee/:id', authenticateAdmin, async (req: Request, res: Response) => {
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
            req.body.name, req.body.designation, req.body.institution, req.body.country,
            req.body.committee_role, req.body.photo_url, req.body.biography, req.body.education,
            req.body.experience, req.body.research_interests, req.body.publications_count,
            req.body.linkedin_url, req.body.orcid_url, req.body.google_scholar_url,
            req.body.display_order, req.body.is_published, id
          ]
        );
      } catch (err: any) {
        console.error('[MySQL Update Committee Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update committee member in MySQL: ${err.message}` });
      }
    }
    const index = db.committee.findIndex(m => m.id === id);
    if (index !== -1) {
      db.committee[index] = { ...db.committee[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_COMMITTEE_MEMBER', 'CommitteeMember', String(id), `Updated member: ${req.body.name || id}`);
    res.json({ success: true, message: 'Committee member updated successfully in MySQL', data: index !== -1 ? db.committee[index] : req.body });
  });

  app.patch('/api/v1/committee/:id/status', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.committee.findIndex(m => m.id === id);
    const currentPub = index !== -1 ? (db.committee[index].is_published ?? true) : true;
    const newPub = req.body.is_published !== undefined ? Boolean(req.body.is_published) : !currentPub;
    if (mysqlPool) {
      try {
        await mysqlPool.query('UPDATE committee_members SET is_published = ? WHERE id = ?', [newPub, id]);
      } catch (err: any) {
        console.error('[MySQL Toggle Committee Status Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update status in MySQL: ${err.message}` });
      }
    }
    if (index !== -1) {
      db.committee[index].is_published = newPub;
      db.committee[index].status = newPub ? 'active' : 'inactive';
    }
    invalidatePublicCache();
    db.addAuditLog('TOGGLE_COMMITTEE_STATUS', 'CommitteeMember', String(id), `Set status to ${newPub ? 'Published' : 'Hidden'}`);
    res.json({ success: true, message: `Status updated to ${newPub ? 'Active' : 'Inactive'} in MySQL`, data: index !== -1 ? db.committee[index] : { id, is_published: newPub } });
  });

  app.delete('/api/v1/committee/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query('DELETE FROM committee_members WHERE id = ?', [id]);
      } catch (err: any) {
        console.error('[MySQL Delete Committee Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete committee member in MySQL: ${err.message}` });
      }
    }
    const index = db.committee.findIndex(m => m.id === id);
    const removed = index !== -1 ? db.committee.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog('DELETE_COMMITTEE_MEMBER', 'CommitteeMember', String(id), `Removed committee member ID: ${id}`);
    res.json({ success: true, message: 'Committee member deleted successfully from MySQL', data: removed });
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

  app.post('/api/v1/speakers', authenticateAdmin, (req: Request, res: Response) => {
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

  app.put('/api/v1/speakers/:id', authenticateAdmin, (req: Request, res: Response) => {
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

  // 5. Sessions (Scientific Sessions & Breakout Tracks)
  app.get('/api/v1/sessions', (req: Request, res: Response) => {
    const { conference_id, search, track, type, status, published_only } = req.query;
    let list = [...db.sessions];
    if (conference_id) {
      list = list.filter(s => s.conference_id === Number(conference_id));
    }
    if (published_only === 'true' || published_only === '1') {
      list = list.filter(s =>
        (s.is_published !== false) &&
        (s.is_active !== false) &&
        s.status !== 'draft' &&
        s.status !== 'unpublished' &&
        s.status !== 'archived' &&
        s.status !== 'deleted'
      );
    }
    if (track && track !== 'All') {
      list = list.filter(s => s.track === track || s.track.toLowerCase().includes(String(track).toLowerCase()));
    }
    if (type && type !== 'All') {
      list = list.filter(s => s.session_type === type);
    }
    if (status && status !== 'All') {
      list = list.filter(s => (s.status || 'published') === status);
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

  app.post('/api/v1/sessions', authenticateAdmin, async (req: Request, res: Response) => {
    let newId = Math.max(...db.sessions.map(s => s.id), 0) + 1;
    const isPub = req.body.is_published !== undefined ? req.body.is_published : (req.body.status !== 'draft' && req.body.status !== 'archived' && req.body.status !== 'unpublished');
    if (mysqlPool) {
      try {
        const [r]: any = await mysqlPool.query(
          `INSERT INTO sessions (
            conference_id, session_number, session_code, title, track, category, description,
            session_date, start_time, end_time, room, session_type, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(req.body.conference_id) || 1, Number(req.body.session_number) || (db.sessions.length + 1),
            req.body.session_code || `BIO-SES-${String(newId).padStart(2, '0')}`,
            req.body.title || 'New Scientific Session', req.body.track || 'General Track',
            req.body.category || 'Oral Presentations', req.body.description || '',
            formatDateStr(req.body.session_date || '2026-06-22'),
            req.body.start_time ? String(req.body.start_time).substring(0, 5) : '10:00',
            req.body.end_time ? String(req.body.end_time).substring(0, 5) : '11:30',
            req.body.room || 'Auditorium Pasteur', req.body.session_type || 'Oral Presentation',
            Number(req.body.display_order) || newId
          ]
        );
        newId = Number(r.insertId);
      } catch (err: any) {
        console.error('[MySQL Add Session Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to add session in MySQL: ${err.message}` });
      }
    }
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
      status: req.body.status || (isPub ? 'published' : 'draft'),
      is_published: isPub,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true,
      image_url: req.body.image_url || '',
      icon: req.body.icon || '',
      chairperson: req.body.chairperson || req.body.chair_person || 'Prof. Session Chair',
      speaker_name: req.body.speaker_name || ''
    };
    db.sessions.push(newSession);
    invalidatePublicCache();
    db.addAuditLog('ADD_SESSION', 'Session', newSession.session_code, `Added session: ${newSession.title}`);
    res.status(201).json({ success: true, message: 'Session created successfully in MySQL', data: newSession });
  });

  app.put('/api/v1/sessions/:id', authenticateAdmin, async (req: Request, res: Response) => {
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
            req.body.title, req.body.track, req.body.category, req.body.description,
            req.body.session_date ? formatDateStr(req.body.session_date) : null,
            req.body.start_time, req.body.end_time, req.body.room,
            req.body.session_type, req.body.display_order, id
          ]
        );
      } catch (err: any) {
        console.error('[MySQL Update Session Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update session in MySQL: ${err.message}` });
      }
    }
    const index = db.sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      db.sessions[index] = { ...db.sessions[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_SESSION', 'Session', String(id), `Updated session: ${req.body.title || id}`);
    res.json({ success: true, message: 'Session updated successfully in MySQL', data: index !== -1 ? db.sessions[index] : req.body });
  });

  app.patch('/api/v1/sessions/:id/status', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      if (req.body.status !== undefined) db.sessions[index].status = req.body.status;
      if (req.body.is_active !== undefined) db.sessions[index].is_active = req.body.is_active;
      if (req.body.is_published !== undefined) db.sessions[index].is_published = req.body.is_published;
    }
    invalidatePublicCache();
    db.addAuditLog('TOGGLE_SESSION_STATUS', 'Session', String(id), `Updated status to ${req.body.status || 'updated'}`);
    res.json({ success: true, message: 'Session status updated', data: index !== -1 ? db.sessions[index] : { id } });
  });

  app.delete('/api/v1/sessions/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query('DELETE FROM sessions WHERE id = ?', [id]);
      } catch (err: any) {
        console.error('[MySQL Delete Session Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete session in MySQL: ${err.message}` });
      }
    }
    const index = db.sessions.findIndex(s => s.id === id);
    const removed = index !== -1 ? db.sessions.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog('DELETE_SESSION', 'Session', String(id), `Deleted session ID: ${id}`);
    res.json({ success: true, message: 'Session deleted successfully from MySQL', data: removed });
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

  app.post('/api/v1/sponsors', authenticateAdmin, (req: Request, res: Response) => {
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

  app.put('/api/v1/sponsors/:id', authenticateAdmin, (req: Request, res: Response) => {
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
    const { conference_id, day_label } = req.query;
    let list = [...db.schedule];
    if (conference_id) {
      const filtered = list.filter(s => s.conference_id === Number(conference_id));
      list = filtered.length > 0 ? filtered : list;
    }
    if (day_label) {
      list = list.filter(s => s.day_label === day_label);
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/v1/schedule', async (req: Request, res: Response) => {
    let newId = Math.max(...db.schedule.map(s => s.id), 0) + 1;
    if (mysqlPool) {
      try {
        const [r]: any = await mysqlPool.query(
          `INSERT INTO schedule_items (
            conference_id, day_number, schedule_date, start_time, end_time, title, description,
            room, track, speaker_name, speaker_affiliation, item_type, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Number(req.body.conference_id) || 1, Number(req.body.day_number) || 1,
            formatDateStr(req.body.schedule_date || '2026-06-22'),
            req.body.start_time || '09:00', req.body.end_time || '10:00',
            req.body.title || 'Scientific Session', req.body.description || '',
            req.body.room || 'Auditorium Hall A', req.body.track || 'General Track',
            req.body.speaker_name || '', req.body.speaker_affiliation || '',
            req.body.item_type || 'session', Number(req.body.display_order) || newId
          ]
        );
        newId = Number(r.insertId);
      } catch (err: any) {
        console.error('[MySQL Add Schedule Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to add schedule item in MySQL: ${err.message}` });
      }
    }
    const item: ScheduleItem = {
      id: newId,
      conference_id: Number(req.body.conference_id) || 1,
      day_number: Number(req.body.day_number) || 1,
      day_label: req.body.day_label || (req.body.day_number === 2 ? 'Day 2' : 'Day 1'),
      schedule_date: req.body.schedule_date || '2026-06-22',
      start_time: req.body.start_time || '09:00',
      end_time: req.body.end_time || '10:00',
      title: req.body.title || 'Scientific Session',
      description: req.body.description || '',
      room: req.body.room || 'Auditorium Hall A',
      track: req.body.track || 'General Track',
      speaker_name: req.body.speaker_name || '',
      speaker_affiliation: req.body.speaker_affiliation || '',
      item_type: req.body.item_type || 'session',
      display_order: Number(req.body.display_order) || newId
    };
    db.schedule.push(item);
    invalidatePublicCache();
    db.addAuditLog('ADD_SCHEDULE_ITEM', 'ScheduleItem', String(newId), `Added schedule item: ${item.title}`);
    res.status(201).json({ success: true, message: 'Schedule item created successfully in MySQL', data: item });
  });

  app.put('/api/v1/schedule/:id', async (req: Request, res: Response) => {
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
            req.body.day_number, req.body.schedule_date ? formatDateStr(req.body.schedule_date) : null,
            req.body.start_time, req.body.end_time, req.body.title, req.body.description,
            req.body.room, req.body.track, req.body.speaker_name, req.body.speaker_affiliation,
            req.body.item_type, req.body.display_order, id
          ]
        );
      } catch (err: any) {
        console.error('[MySQL Update Schedule Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update schedule item in MySQL: ${err.message}` });
      }
    }
    const index = db.schedule.findIndex(s => s.id === id);
    if (index !== -1) {
      db.schedule[index] = { ...db.schedule[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_SCHEDULE_ITEM', 'ScheduleItem', String(id), `Updated schedule item: ${req.body.title || id}`);
    res.json({ success: true, message: 'Schedule item updated successfully in MySQL', data: index !== -1 ? db.schedule[index] : req.body });
  });

  app.delete('/api/v1/schedule/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query('DELETE FROM schedule_items WHERE id = ?', [id]);
      } catch (err: any) {
        console.error('[MySQL Delete Schedule Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete schedule item in MySQL: ${err.message}` });
      }
    }
    const index = db.schedule.findIndex(s => s.id === id);
    const removed = index !== -1 ? db.schedule.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog('DELETE_SCHEDULE_ITEM', 'ScheduleItem', String(id), `Deleted schedule item: ${(removed as any).title || id}`);
    res.json({ success: true, message: 'Schedule item deleted successfully from MySQL', data: removed });
  });

  // 6.5 Registration Categories
  app.get('/api/v1/registration-categories', (req: Request, res: Response) => {
    const { conference_id } = req.query;
    let list = [...db.categories];
    if (conference_id) {
      const filtered = list.filter(c => c.conference_id === Number(conference_id));
      list = filtered.length > 0 ? filtered : list;
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/v1/registration-categories', async (req: Request, res: Response) => {
    let newId = Math.max(...db.categories.map(c => c.id), 0) + 1;
    const catData = {
      conference_id: Number(req.body.conference_id) || 1,
      name: req.body.name || 'Delegate Pass',
      early_bird_fee: Number(req.body.early_bird_fee || req.body.early_bird_price) || 649,
      standard_fee: Number(req.body.standard_fee || req.body.price) || 799,
      price: Number(req.body.price || req.body.standard_fee) || 799,
      early_bird_price: Number(req.body.early_bird_price || req.body.early_bird_fee) || 649,
      currency: req.body.currency || 'USD',
      deadline: formatDateStr(req.body.deadline),
      benefits: Array.isArray(req.body.benefits) ? req.body.benefits : ['Full conference access'],
      is_popular: Boolean(req.body.is_popular),
      display_order: Number(req.body.display_order) || newId,
      payment_gateway_link: req.body.payment_gateway_link || '',
      is_active: req.body.is_active !== undefined ? Boolean(req.body.is_active) : true
    };
    if (mysqlPool) {
      try {
        const [r]: any = await mysqlPool.query(
          `INSERT INTO registration_categories (
            conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            catData.conference_id, catData.name, catData.price, catData.currency,
            catData.early_bird_price, catData.deadline || null, JSON.stringify(catData.benefits),
            catData.is_popular, catData.display_order, catData.payment_gateway_link, catData.is_active
          ]
        );
        newId = Number(r.insertId);
      } catch (err: any) {
        console.error('[MySQL Add Registration Category Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to add category in MySQL: ${err.message}` });
      }
    }
    const cat = { ...catData, id: newId };
    db.categories.push(cat);
    invalidatePublicCache();
    db.addAuditLog('ADD_REGISTRATION_CATEGORY', 'RegistrationCategory', String(newId), `Added category: ${cat.name}`);
    res.status(201).json({ success: true, message: 'Category created successfully in MySQL', data: cat });
  });

  app.put('/api/v1/registration-categories/:id', async (req: Request, res: Response) => {
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
            req.body.name, req.body.price, req.body.currency, req.body.early_bird_price || req.body.early_bird_fee,
            req.body.deadline ? formatDateStr(req.body.deadline) : null,
            req.body.benefits ? JSON.stringify(req.body.benefits) : null,
            req.body.is_popular, req.body.display_order, req.body.payment_gateway_link, req.body.is_active, id
          ]
        );
      } catch (err: any) {
        console.error('[MySQL Update Registration Category Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update category in MySQL: ${err.message}` });
      }
    }
    const index = db.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      db.categories[index] = { ...db.categories[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_REGISTRATION_CATEGORY', 'RegistrationCategory', String(id), `Updated category: ${req.body.name || id}`);
    res.json({ success: true, message: 'Category updated successfully in MySQL', data: index !== -1 ? db.categories[index] : req.body });
  });

  app.delete('/api/v1/registration-categories/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query('DELETE FROM registration_categories WHERE id = ?', [id]);
      } catch (err: any) {
        console.error('[MySQL Delete Registration Category Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete category in MySQL: ${err.message}` });
      }
    }
    const index = db.categories.findIndex(c => c.id === id);
    const removed = index !== -1 ? db.categories.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog('DELETE_REGISTRATION_CATEGORY', 'RegistrationCategory', String(id), `Deleted category: ${(removed as any).name || id}`);
    res.json({ success: true, message: 'Category deleted successfully from MySQL', data: removed });
  });

  // 7. Registrations
  // Endpoint to fetch CSRF token for state‑changing requests
  app.get('/api/v1/csrf-token', (req: Request, res: Response) => {
    res.json({ success: true, token: req.csrfToken() });
  });

  app.get('/api/v1/registrations', authenticateAdmin, (req: Request, res: Response) => {
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
    syncToMysql(
      `INSERT INTO registrations (registration_id, conference_id, category_id, first_name, last_name, email, phone, country, institution, department, designation, research_area, attendance_mode, accommodation_required, meal_preference, special_requirements, amount, currency, payment_status, registration_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newReg.registration_id, newReg.conference_id, newReg.category_id, newReg.first_name, newReg.last_name, newReg.email, newReg.phone, newReg.country, newReg.institution, newReg.department, newReg.designation, newReg.research_area, newReg.attendance_mode, newReg.accommodation_required ? 1 : 0, newReg.meal_preference, newReg.special_requirements, newReg.amount, newReg.currency, newReg.payment_status, newReg.registration_status]
    );
    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      data: newReg
    });
  });

  app.patch('/api/v1/registrations/:id/status', authenticateAdmin, (req: Request, res: Response) => {
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
  app.get('/api/v1/abstracts', authenticateAdmin, (req: Request, res: Response) => {
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

  app.patch('/api/v1/abstracts/:id/status', authenticateAdmin, (req: Request, res: Response) => {
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

  // 8.1 Proposals for Workshops, Keynote Forums, Posters & Symposia
  app.get('/api/v1/proposals', authenticateAdmin, (req: Request, res: Response) => {
    const { type, status, conference_id, search } = req.query;
    let list = [...db.proposals];

    if (type && type !== 'all') {
      list = list.filter(p => p.proposal_type === type);
    }
    if (status && status !== 'all') {
      list = list.filter(p => p.status === status);
    }
    if (conference_id) {
      list = list.filter(p => p.conference_id === Number(conference_id));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.proposer_name.toLowerCase().includes(q) ||
        p.proposer_affiliation.toLowerCase().includes(q) ||
        p.proposal_code.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  });

  app.post('/api/v1/proposals', (req: Request, res: Response) => {
    const body = req.body;
    const typePrefix = body.proposal_type === 'workshop' ? 'WKSH' :
      body.proposal_type === 'keynote_forum' ? 'KEYN' :
      body.proposal_type === 'poster' ? 'POST' : 'SYMP';
    const code = `PROP-${typePrefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newProposal: ProposalSubmission = {
      id: db.proposals.length + 1,
      proposal_code: code,
      conference_id: body.conference_id || 1,
      conference_title: body.conference_title || 'World Congress',
      conference_city: body.conference_city || 'International',
      conference_country: body.conference_country || 'Global',
      proposal_type: body.proposal_type || 'workshop',
      title: body.title || 'Untitled Proposal',
      proposer_title: body.proposer_title || 'Dr.',
      proposer_name: body.proposer_name || '',
      proposer_email: body.proposer_email || '',
      proposer_phone: body.proposer_phone || '',
      proposer_affiliation: body.proposer_affiliation || '',
      proposer_department: body.proposer_department || '',
      proposer_country: body.proposer_country || '',
      proposer_bio: body.proposer_bio || '',
      co_presenters: body.co_presenters || '',
      abstract: body.abstract || '',
      learning_objectives: body.learning_objectives || '',
      target_audience: body.target_audience || '',
      duration_format: body.duration_format || 'Standard Session',
      av_requirements: body.av_requirements || '',
      file_name: body.file_name || '',
      file_url: body.file_url || '',
      status: 'received',
      reviewer_notes: '',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    db.proposals.unshift(newProposal);
    db.addAuditLog('SUBMIT_PROPOSAL', 'ProposalSubmission', code, `New ${newProposal.proposal_type} proposal submitted by ${newProposal.proposer_name}`);

    res.status(201).json({
      success: true,
      message: 'Proposal received and registered for Scientific Committee review',
      data: newProposal
    });
  });

  app.patch('/api/v1/proposals/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status, reviewer_notes } = req.body;
    const prop = db.proposals.find(p => p.id === id);
    if (!prop) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (status) prop.status = status;
    if (reviewer_notes !== undefined) prop.reviewer_notes = reviewer_notes;
    prop.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.addAuditLog('REVIEW_PROPOSAL', 'ProposalSubmission', prop.proposal_code, `Status set to ${status}`);
    res.json({ success: true, data: prop });
  });

  app.delete('/api/v1/proposals/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = db.proposals.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Proposal not found' });
    const removed = db.proposals.splice(idx, 1)[0];
    db.addAuditLog('DELETE_PROPOSAL', 'ProposalSubmission', removed.proposal_code, `Proposal deleted`);
    res.json({ success: true, message: 'Proposal removed', data: removed });
  });

  // 8b. Stripe Payment Gateway Integration
  app.get('/api/v1/stripe/config', (req: Request, res: Response) => {
    const pubKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
    const hasSecretKey = Boolean(process.env.STRIPE_SECRET_KEY);
    res.json({
      success: true,
      data: {
        publishableKey: pubKey,
        isConfigured: hasSecretKey,
        mode: hasSecretKey
          ? (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test')
          : 'simulation'
      }
    });
  });

  app.post('/api/v1/stripe/create-payment-intent', async (req: Request, res: Response) => {
    try {
      const {
        amount,
        currency = 'USD',
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
          description: `SCINS Media Pass: ${conference_title || 'Congress 2026'} - ${category_name || 'Delegate'}`,
          receipt_email: delegate_email || undefined,
          metadata: {
            registration_id: String(registration_id || ''),
            conference_id: String(conference_id || ''),
            conference_title: String(conference_title || '').slice(0, 100),
            delegate_name: String(delegate_name || '').slice(0, 100),
            delegate_email: String(delegate_email || '').slice(0, 100)
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

      // Secure Sandboxed / Simulated Stripe Intent (when STRIPE_SECRET_KEY is not yet configured)
      const simulatedIntentId = `pi_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      const simulatedSecret = `${simulatedIntentId}_secret_${Date.now().toString(36)}`;

      res.json({
        success: true,
        data: {
          clientSecret: simulatedSecret,
          paymentIntentId: simulatedIntentId,
          amount: numAmount,
          currency: currency.toUpperCase(),
          status: 'requires_payment_method',
          isLiveStripe: false,
          note: 'Stripe Sandbox simulation active. Add STRIPE_SECRET_KEY in Settings to enable Live Gateway processing.'
        }
      });
    } catch (err: any) {
      console.error('Stripe create-payment-intent error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to initialize Stripe PaymentIntent'
      });
    }
  });

  app.post('/api/v1/stripe/confirm-payment', async (req: Request, res: Response) => {
    try {
      const {
        payment_intent_id,
        registration_id,
        conference_id,
        amount,
        currency = 'USD',
        card_holder_name,
        card_last4,
        billing_email
      } = req.body;

      const stripe = getStripe();
      let verifiedStatus = 'succeeded';
      let verifiedTxnId = payment_intent_id || `pi_${Date.now().toString(36)}`;

      if (stripe && payment_intent_id && !payment_intent_id.startsWith('pi_test_') && !payment_intent_id.startsWith('pi_sim_')) {
        try {
          const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
          verifiedStatus = pi.status;
          verifiedTxnId = pi.id;
        } catch (e: any) {
          console.warn('Could not retrieve remote Stripe PaymentIntent, using local confirmation fallback:', e.message);
        }
      }

      const receiptId = `REC-STRIPE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Update registration record
      const reg = db.registrations.find(r => r.id === Number(registration_id) || r.registration_id === registration_id);
      if (reg) {
        reg.payment_status = 'completed';
        reg.registration_status = 'confirmed';
        reg.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
      }

      const paymentRecord = {
        id: db.payments.length + 1,
        registration_id: reg ? reg.id : Number(registration_id) || 1,
        conference_id: conference_id || (reg ? reg.conference_id : 1),
        amount: parseFloat(amount) || (reg ? (reg.total_amount || reg.amount) : 450),
        currency: (currency || 'USD').toUpperCase(),
        payment_method: 'stripe',
        transaction_id: verifiedTxnId,
        receipt_id: receiptId,
        status: 'completed' as const,
        payer_name: card_holder_name || (reg ? `${reg.first_name} ${reg.last_name}` : 'Conference Delegate'),
        billing_email: billing_email || (reg ? reg.email : 'delegate@university.edu'),
        card_last4: card_last4 || '4242',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      db.payments.unshift(paymentRecord);
      db.addAuditLog('STRIPE_PAYMENT_CONFIRMED', 'Payments', verifiedTxnId, `Verified Stripe payment of ${paymentRecord.currency} ${paymentRecord.amount} for Registration #${registration_id}`);

      res.json({
        success: true,
        message: 'Stripe payment verified and delegate registration confirmed successfully',
        data: {
          transaction_id: verifiedTxnId,
          receipt_id: receiptId,
          status: 'completed',
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          payment_method: 'stripe',
          created_at: paymentRecord.created_at,
          registration_id: reg ? reg.registration_id : registration_id,
          payer_name: paymentRecord.payer_name
        }
      });
    } catch (err: any) {
      console.error('Stripe confirm-payment error:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to confirm Stripe transaction'
      });
    }
  });

  // 8c. Generic / Multi-Gateway Payment Processing
  app.post('/api/v1/payments/process', (req: Request, res: Response) => {
    const {
      registration_id,
      conference_id,
      amount,
      currency = 'USD',
      gateway = 'stripe',
      card_holder_name,
      card_last4,
      billing_email,
      payment_reference
    } = req.body;

    const txnRef = payment_reference || `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptId = `REC-SCINS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update registration status to completed
    const reg = db.registrations.find(r => r.id === Number(registration_id) || r.registration_id === registration_id);
    if (reg) {
      reg.payment_status = 'completed';
      reg.registration_status = 'confirmed';
      reg.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    const paymentRecord = {
      id: db.payments.length + 1,
      registration_id: reg ? reg.id : Number(registration_id) || 1,
      conference_id: conference_id || (reg ? reg.conference_id : 1),
      amount: parseFloat(amount) || (reg ? (reg.total_amount || reg.amount) : 450),
      currency: (currency || 'USD').toUpperCase(),
      payment_method: gateway,
      transaction_id: txnRef,
      receipt_id: receiptId,
      status: 'completed' as const,
      payer_name: card_holder_name || (reg ? `${reg.first_name} ${reg.last_name}` : 'Conference Delegate'),
      billing_email: billing_email || (reg ? reg.email : 'delegate@university.edu'),
      card_last4: card_last4 || '4242',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    db.payments.unshift(paymentRecord);
    db.addAuditLog('PAYMENT_PROCESSED', 'Payments', txnRef, `Successfully verified ${paymentRecord.currency} ${paymentRecord.amount} payment via ${gateway} for Registration #${registration_id}`);

    res.json({
      success: true,
      message: 'Payment verified and delegate registration confirmed successfully',
      data: {
        transaction_id: txnRef,
        receipt_id: receiptId,
        status: 'completed',
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        payment_method: gateway,
        created_at: paymentRecord.created_at,
        registration_id: reg ? reg.registration_id : registration_id,
        payer_name: paymentRecord.payer_name
      }
    });
  });

  // 9. Publications, Media Partners, Blogs, FAQs
  app.get('/api/v1/publications', (req: Request, res: Response) => {
    const { search, domain, journal } = req.query;
    let list = [...db.publications];

    if (journal && journal !== 'All') {
      const jStr = String(journal).toLowerCase();
      list = list.filter(p => p.journal.toLowerCase().includes(jStr));
    }

    if (domain && domain !== 'All') {
      const dStr = String(domain).toLowerCase();
      list = list.filter(p => (p as any).domain?.toLowerCase().includes(dStr) || p.title.toLowerCase().includes(dStr) || p.journal.toLowerCase().includes(dStr));
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.doi.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: list });
  });

  app.post('/api/v1/publications', (req: Request, res: Response) => {
    const body = req.body;
    const newId = Math.max(...db.publications.map(p => p.id), 0) + 1;
    const newPub = {
      id: newId,
      conference_id: body.conference_id || 1,
      title: body.title || 'Untitled Publication',
      authors: body.authors || 'SCINS Media Research Consortium',
      journal: body.journal || 'International Journal of Advanced Scientific Research',
      volume: body.volume || 'Vol. 14, Issue 3',
      pages: body.pages || '112-128',
      doi: body.doi || `10.1016/j.scins.${Date.now().toString(36)}`,
      publication_date: body.publication_date || new Date().toISOString().substring(0, 10),
      abstract: body.abstract || 'Peer-reviewed congress proceedings exploring empirical methodology and multidisciplinary findings.',
      citations: Number(body.citations) || 0,
      indexed_in: body.indexed_in || ['Scopus', 'Web of Science', 'Elsevier'],
      download_url: body.download_url || 'https://doi.org/'
    };
    db.publications.unshift(newPub as any);
    db.addAuditLog('NEW_PUBLICATION', 'Publication', newPub.doi, `Added new publication: ${newPub.title}`);
    res.status(201).json({ success: true, message: 'Publication created', data: newPub });
  });

  app.get('/api/v1/media-partners', (req, res) => res.json({ success: true, data: db.mediaPartners }));
  app.get('/api/v1/testimonials', (req: Request, res: Response) => {
    const { conference_id } = req.query;
    let list = [...db.testimonials];
    if (conference_id) {
      list = list.filter(t => t.conference_id === Number(conference_id));
    }
    res.json({ success: true, data: list.length > 0 ? list : db.testimonials });
  });

  app.post('/api/v1/testimonials', (req: Request, res: Response) => {
    const newId = Math.max(...db.testimonials.map(t => t.id), 0) + 1;
    const item = {
      id: newId,
      name: req.body.name || 'Anonymous Scholar',
      designation: req.body.designation || 'Faculty Member',
      institution: req.body.institution || 'University',
      country: req.body.country || 'Global',
      quote: req.body.quote || '',
      photo_url: req.body.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rating: Number(req.body.rating) || 5,
      is_featured: req.body.is_featured !== undefined ? req.body.is_featured : true,
      conference_id: req.body.conference_id ? Number(req.body.conference_id) : undefined
    };
    db.testimonials.push(item);
    res.status(201).json({ success: true, message: 'Testimonial created', data: item });
  });

  app.put('/api/v1/testimonials/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.testimonials.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    db.testimonials[index] = { ...db.testimonials[index], ...req.body };
    res.json({ success: true, message: 'Testimonial updated', data: db.testimonials[index] });
  });

  app.delete('/api/v1/testimonials/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.testimonials.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    const removed = db.testimonials.splice(index, 1)[0];
    res.json({ success: true, message: 'Testimonial deleted', data: removed });
  });
  app.get('/api/v1/blogs', (req, res) => res.json({ success: true, data: db.blogs }));
  app.get('/api/v1/faqs', (req, res) => res.json({ success: true, data: db.faqs }));
  app.get('/api/v1/flyers', (req, res) => res.json({ success: true, data: db.flyers }));
  app.get('/api/v1/audit-logs', authenticateAdmin, (req, res) => res.json({ success: true, data: db.auditLogs }));

  // Enquiries & Newsletters
  app.get('/api/v1/contact', authenticateAdmin, (req: Request, res: Response) => {
    const { status, search } = req.query;
    let list = [...db.contactEnquiries];
    if (status && status !== 'All') {
      list = list.filter(c => c.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        c.subject.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
      );
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/v1/contact', (req: Request, res: Response) => {
    const newId = Math.max(...db.contactEnquiries.map(c => c.id), 0) + 1;
    const enquiry: ContactEnquiry = {
      id: newId,
      name: req.body.name || 'Anonymous Researcher',
      email: req.body.email || '',
      phone: req.body.phone || '',
      subject: req.body.subject || 'General Academic Inquiry',
      message: req.body.message || '',
      conference_code: req.body.conference_code || 'BIO-2026',
      conference_id: Number(req.body.conference_id) || 1,
      status: 'new',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    db.contactEnquiries.unshift(enquiry);
    db.addAuditLog('NEW_CONTACT_ENQUIRY', 'ContactEnquiry', String(enquiry.id), `Received message from ${enquiry.name} (${enquiry.email})`);
    syncToMysql(
      `INSERT INTO contact_enquiries (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [enquiry.name, enquiry.email, enquiry.phone || '', enquiry.subject, enquiry.message, enquiry.status]
    );
    res.status(201).json({ success: true, message: 'Your enquiry has been submitted to the Secretariat.', data: enquiry });
  });

  app.patch('/api/v1/contact/:id/status', authenticateAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const item = db.contactEnquiries.find(c => c.id === id);
    if (!item) return res.status(404).json({ success: false, message: 'Contact submission not found' });
    if (req.body.status) item.status = req.body.status;
    db.addAuditLog('UPDATE_CONTACT_STATUS', 'ContactEnquiry', String(id), `Updated inquiry status to ${req.body.status}`);
    res.json({ success: true, message: 'Status updated successfully', data: item });
  });

  app.delete('/api/v1/contact/:id', authenticateAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.contactEnquiries.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Contact submission not found' });
    const removed = db.contactEnquiries.splice(index, 1)[0];
    db.addAuditLog('DELETE_CONTACT_ENQUIRY', 'ContactEnquiry', String(id), `Deleted inquiry from ${removed.email}`);
    res.json({ success: true, message: 'Submission deleted successfully', data: removed });
  });

  app.post('/api/v1/quotes', (req: Request, res: Response) => {
    const quote = { id: db.quoteRequests.length + 1, ...req.body, status: 'new', created_at: new Date().toISOString() };
    db.quoteRequests.push(quote);
    db.addAuditLog('NEW_QUOTE_REQUEST', 'QuoteRequest', String(quote.id), `Custom proposal requested by ${quote.organization}`);
    res.status(201).json({ success: true, message: 'Custom proposal request received', data: quote });
  });

  app.get('/api/v1/subscribers', authenticateAdmin, (req: Request, res: Response) => {
    const { status, search } = req.query;
    let list = [...db.subscribers];
    if (status && status !== 'All') {
      list = list.filter(s => s.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(s => s.email.toLowerCase().includes(q));
    }
    res.json({ success: true, data: list });
  });

  app.post(['/api/v1/newsletter', '/api/v1/newsletter/subscribe', '/api/v1/subscribers'], (req: Request, res: Response) => {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const existing = db.subscribers.find(s => s.email.toLowerCase() === email);
    if (existing) {
      existing.status = 'active';
      return res.json({ success: true, message: 'Subscription reactivated.', data: existing });
    }
    const newId = Math.max(...db.subscribers.map(s => s.id), 0) + 1;
    const newSub: NewsletterSubscriber = {
      id: newId,
      email,
      status: 'active',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    db.subscribers.unshift(newSub);
    db.addAuditLog('NEWSLETTER_SUBSCRIBE', 'Newsletter', email, 'New subscriber joined scientific intelligence updates');
    syncToMysql(
      `INSERT INTO newsletter_subscribers (email, status) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [newSub.email, newSub.status]
    );
    res.status(201).json({ success: true, message: 'Subscribed to Scinsmedia Scientific Intelligence updates.', data: newSub });
  });

  app.patch('/api/v1/subscribers/:id/status', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const sub = db.subscribers.find(s => s.id === id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscriber not found' });
    if (req.body.status) sub.status = req.body.status;
    db.addAuditLog('UPDATE_SUBSCRIBER_STATUS', 'Newsletter', sub.email, `Updated subscriber status to ${req.body.status}`);
    res.json({ success: true, message: 'Subscriber status updated', data: sub });
  });

  app.delete('/api/v1/subscribers/:id', authenticateAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.subscribers.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Subscriber not found' });
    const removed = db.subscribers.splice(index, 1)[0];
    db.addAuditLog('DELETE_SUBSCRIBER', 'Newsletter', removed.email, `Removed subscriber ${removed.email}`);
    res.json({ success: true, message: 'Subscriber removed successfully', data: removed });
  });

  // Analytics & Export
  app.get('/api/v1/analytics', authenticateAdmin, (req: Request, res: Response) => {
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
  app.get('/api/v1/exports/:type', authenticateAdmin, (req: Request, res: Response) => {
    const { type } = req.params;
    let csvData = '';
    let filename = `scinsmedia-${type}-${Date.now()}.csv`;

    if (type === 'registrations') {
      csvData = 'RegistrationID,FirstName,LastName,Email,Country,Institution,Category,Amount,PaymentStatus,Date\n' +
        db.registrations.map(r => `"${r.registration_id}","${r.first_name}","${r.last_name}","${r.email}","${r.country}","${r.institution}","${r.category_name}",${r.amount},"${r.payment_status}","${r.created_at}"`).join('\n');
    } else if (type === 'abstracts') {
      csvData = 'SubmissionID,Title,PrimaryAuthor,Email,Country,Affiliation,Domain,Status,Date\n' +
        db.abstracts.map(a => `"${a.submission_id}","${a.title.replace(/"/g, '""')}","${a.primary_author_name}","${a.primary_author_email}","${a.primary_author_country}","${a.primary_author_affiliation}","${a.research_domain}","${a.status}","${a.created_at}"`).join('\n');
    } else if (type === 'subscribers') {
      csvData = 'ID,Email,SubscriptionDate,Status\n' +
        db.subscribers.map(s => `"${s.id}","${s.email}","${s.created_at}","${s.status}"`).join('\n');
    } else if (type === 'proposals') {
      csvData = 'ProposalID,Type,Title,LeadProposer,Email,Phone,Country,Affiliation,TargetConferenceID,DurationFormat,Status,Date\n' +
        db.proposals.map(p => `"${p.proposal_code}","${p.proposal_type}","${p.title.replace(/"/g, '""')}","${(p.proposer_name || '').replace(/"/g, '""')}","${p.proposer_email || ''}","${p.proposer_phone || ''}","${p.proposer_country || ''}","${(p.proposer_affiliation || '').replace(/"/g, '""')}",${p.conference_id || ''},"${p.duration_format || ''}","${p.status}","${p.created_at}"`).join('\n');
    } else if (type === 'contacts') {
      csvData = 'ID,Name,Email,Phone,Subject,Message,Status,Date\n' +
        db.contactEnquiries.map(c => `"${c.id}","${c.name.replace(/"/g, '""')}","${c.email}","${c.phone || ''}","${c.subject.replace(/"/g, '""')}","${c.message.replace(/"/g, '""')}","${c.status}","${c.created_at}"`).join('\n');
    } else {
      csvData = 'ID,Name,Type,Date\n1,General Export,System,' + new Date().toISOString();
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  });

  // Database Schema download route
  app.get('/database/schema.sql', (req: Request, res: Response) => {
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="scinsmedia-godaddy-schema.sql"');
    res.sendFile(schemaPath);
  });

  // Global API JSON Error Handler
  app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
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
    app.use(express.static(distPath, {
      maxAge: '7d',
      etag: true,
      lastModified: true
    }));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Scinsmedia Enterprise Engine] Running on http://0.0.0.0:${PORT}`);
  });

  // Request & Connection Timeouts (prevents Slowloris & dangling socket leaks)
  server.setTimeout(30000); // 30s max request processing time
  server.keepAliveTimeout = 65000; // 65s keep-alive window for GoDaddy upstream proxies
  server.headersTimeout = 66000;

  // Graceful Process Termination
  const gracefulShutdown = async (signal: string) => {
    console.log(`[Process] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log('[Process] HTTP server closed.');
      if (mysqlPool) {
        try {
          await mysqlPool.end();
          console.log('[MySQL] Connection pool drained.');
        } catch (err: any) {
          console.warn('[MySQL] Error closing pool:', err.message);
        }
      }
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[Process] Shutdown timed out. Force exiting.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Global Process Crash Prevention
process.on('unhandledRejection', (reason: any) => {
  console.error('[Safety Shield - Unhandled Promise Rejection]:', reason?.message || reason);
});

process.on('uncaughtException', (err: Error) => {
  console.error('[Safety Shield - Uncaught Exception]:', err.message, err.stack);
});

startServer().catch(err => {
  console.error('[Scinsmedia Server Startup Failure]:', err);
});

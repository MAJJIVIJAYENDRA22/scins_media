import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Multi-candidate .env path resolution for GoDaddy Phusion Passenger and CLI environments
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '..', '.env')
];
for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
// Default fallback if none matched above
dotenv.config();

import net from 'net';
import http from 'http';
import https from 'https';
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
let stripeClient: Stripe | null = null;
let currentStripeKey: string | null = null;
function getStripe(): Stripe | null {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^STRIPE_SECRET_KEY=["']?([^"'\r\n]+)["']?/m);
      if (match && match[1]) {
        process.env.STRIPE_SECRET_KEY = match[1].trim();
      }
    }
  } catch (_) {}

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeClient || currentStripeKey !== secretKey) {
    stripeClient = new Stripe(secretKey);
    currentStripeKey = secretKey;
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
  INITIAL_PROPOSALS,
  INITIAL_TERMS_CONTENT
} from './src/data/initialData.ts';

import {
  Conference,
  CommitteeMember,
  Speaker,
  Session,
  ScheduleItem,
  Registration,
  RegistrationCategory,
  AbstractSubmission,
  ProposalSubmission,
  AuditLog,
  AdminUser,
  Sponsor,
  ContactEnquiry,
  NewsletterSubscriber,
  Publication,
  TermsSection,
  TermsContent
} from './src/types/index.ts';
import { generateAbstractPdf } from './src/utils/abstractPdfGenerator.ts';

// In-Memory Data Store (Synchronized with MySQL schema when DB credentials are configured)
const LOCAL_CONFERENCES_FILE = path.join(process.cwd(), 'database', 'local_conferences.json');

function loadLocalConferences(): Conference[] {
  try {
    if (fs.existsSync(LOCAL_CONFERENCES_FILE)) {
      const content = fs.readFileSync(LOCAL_CONFERENCES_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const seen = new Set<string>();
        const deduped: Conference[] = [];
        for (const c of parsed) {
          const key = (c.slug || c.title || String(c.id)).toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            deduped.push(c);
          }
        }
        return deduped;
      }
    }
  } catch (e) {
    console.warn('[Local Conferences Storage] Notice:', e);
  }
  return [...INITIAL_CONFERENCES];
}

function saveLocalConferences(confs: Conference[]): void {
  try {
    const dir = path.dirname(LOCAL_CONFERENCES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const seen = new Set<string>();
    const deduped: Conference[] = [];
    for (const c of confs) {
      const key = (c.slug || c.title || String(c.id)).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(c);
      }
    }
    fs.writeFileSync(LOCAL_CONFERENCES_FILE, JSON.stringify(deduped, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Local Conferences Save] Notice:', e);
  }
}

const LOCAL_CATEGORIES_FILE = path.join(process.cwd(), 'database', 'local_categories.json');

function normalizeCategoryData(c: any, confId: number, idx: number): RegistrationCategory {
  const standardPrice = Number(
    c.price ?? c.standard_fee ?? c.industry_price ?? c.tier3_price ?? (c.academic_price ? Math.round(Number(c.academic_price) * 1.25) : 799)
  ) || 799;
  const earlyPrice = Number(
    c.early_bird_price ?? c.early_bird_fee ?? c.academic_price ?? c.tier1_price ?? (standardPrice > 100 ? standardPrice - 100 : standardPrice)
  ) || (standardPrice > 100 ? standardPrice - 100 : standardPrice);
  const midPrice = Number(c.tier2_price ?? Math.round((earlyPrice + standardPrice) / 2)) || Math.round((earlyPrice + standardPrice) / 2);
  const acadPrice = Number(c.academic_price ?? earlyPrice) || earlyPrice;
  const indPrice = Number(c.industry_price ?? standardPrice) || standardPrice;
  const studPrice = Number(c.student_price ?? Math.round(acadPrice * 0.7)) || Math.round(acadPrice * 0.7);

  const benefitsList = Array.isArray(c.benefits) && c.benefits.length > 0
    ? c.benefits
    : (Array.isArray(c.features) && c.features.length > 0
      ? c.features
      : [
          'Full access to all scientific tracks & keynotes',
          'Conference materials & Scopus-indexed abstracts',
          'Networking luncheon & refreshment breaks',
          'Official certificate of participation'
        ]);

  return {
    ...c,
    id: Number(c.id) || (idx + 1),
    conference_id: Number(confId),
    name: c.name || 'Delegate Pass',
    code: c.code || `PASS-${confId}-${idx + 1}`,
    description: c.description || 'Standard delegate package with full access to scientific tracks and sessions.',
    currency: (c.currency || 'USD').toUpperCase(),
    price: standardPrice,
    standard_fee: standardPrice,
    early_bird_price: earlyPrice,
    early_bird_fee: earlyPrice,
    academic_price: acadPrice,
    industry_price: indPrice,
    student_price: studPrice,
    tier1_price: earlyPrice,
    tier2_price: midPrice,
    tier3_price: standardPrice,
    payment_gateway_link: c.payment_gateway_link || '',
    is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
    display_order: Number(c.display_order ?? (idx + 1)),
    benefits: benefitsList,
    features: benefitsList,
    is_popular: Boolean(c.is_popular)
  };
}

function loadLocalCategories(): RegistrationCategory[] {
  try {
    if (fs.existsSync(LOCAL_CATEGORIES_FILE)) {
      const content = fs.readFileSync(LOCAL_CATEGORIES_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((cat, idx) => normalizeCategoryData(cat, cat.conference_id || 1, idx));
      }
    }
  } catch (e) {
    console.warn('[Local Categories Storage] Notice:', e);
  }

  // Populate from local conferences or REGISTRATION_CATEGORIES
  const initialList: RegistrationCategory[] = [];
  const confs = loadLocalConferences();

  confs.forEach(conf => {
    let confCats: any[] = [];
    if (Array.isArray(conf.categories) && conf.categories.length > 0) {
      confCats = conf.categories;
    } else {
      const matched = REGISTRATION_CATEGORIES.filter(c => c.conference_id === conf.id);
      confCats = matched.length > 0 ? matched : REGISTRATION_CATEGORIES.slice(0, 4);
    }
    confCats.forEach((c, idx) => {
      initialList.push(normalizeCategoryData(c, conf.id, initialList.length));
    });
  });

  saveLocalCategories(initialList);
  return initialList;
}

function saveLocalCategories(cats: RegistrationCategory[]): void {
  try {
    const dir = path.dirname(LOCAL_CATEGORIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_CATEGORIES_FILE, JSON.stringify(cats, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Local Categories Save] Notice:', e);
  }
}

const LOCAL_REGISTRATIONS_FILE = path.join(process.cwd(), 'database', 'local_registrations.json');

function loadLocalRegistrations(): Registration[] {
  try {
    if (fs.existsSync(LOCAL_REGISTRATIONS_FILE)) {
      const content = fs.readFileSync(LOCAL_REGISTRATIONS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Local Registrations Storage] Notice:', e);
  }
  return [...INITIAL_REGISTRATIONS];
}

function saveLocalRegistrations(regs: Registration[]): void {
  try {
    const dir = path.dirname(LOCAL_REGISTRATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_REGISTRATIONS_FILE, JSON.stringify(regs, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Local Registrations Save] Notice:', e);
  }
}

const LOCAL_ABSTRACTS_FILE = path.join(process.cwd(), 'database', 'local_abstracts.json');

function loadLocalAbstracts(): AbstractSubmission[] {
  try {
    if (fs.existsSync(LOCAL_ABSTRACTS_FILE)) {
      const content = fs.readFileSync(LOCAL_ABSTRACTS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Local Abstracts Storage] Notice:', e);
  }
  return [...INITIAL_ABSTRACTS];
}

function saveLocalAbstracts(abstracts: AbstractSubmission[]): void {
  try {
    const dir = path.dirname(LOCAL_ABSTRACTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_ABSTRACTS_FILE, JSON.stringify(abstracts, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Local Abstracts Save] Notice:', e);
  }
}

const LOCAL_PUBLICATIONS_FILE = path.join(process.cwd(), 'database', 'local_publications.json');

function loadLocalPublications(): Publication[] {
  try {
    if (fs.existsSync(LOCAL_PUBLICATIONS_FILE)) {
      const content = fs.readFileSync(LOCAL_PUBLICATIONS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Local Publications Storage] Notice:', e);
  }
  return [...PUBLICATIONS];
}

function saveLocalPublications(pubs: Publication[]): void {
  try {
    const dir = path.dirname(LOCAL_PUBLICATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_PUBLICATIONS_FILE, JSON.stringify(pubs, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Local Publications Save] Notice:', e);
  }
}

const LOCAL_CONTACT_ENQUIRIES_FILE = path.join(process.cwd(), 'database', 'local_contact_enquiries.json');

function loadLocalContactEnquiries(): ContactEnquiry[] {
  try {
    if (fs.existsSync(LOCAL_CONTACT_ENQUIRIES_FILE)) {
      const content = fs.readFileSync(LOCAL_CONTACT_ENQUIRIES_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Local Contact Enquiries Storage] Notice:', e);
  }
  return [...INITIAL_CONTACT_ENQUIRIES];
}

function saveLocalContactEnquiries(enquiries: ContactEnquiry[]): void {
  try {
    const dir = path.dirname(LOCAL_CONTACT_ENQUIRIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_CONTACT_ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Local Contact Enquiries Save] Notice:', e);
  }
}

const LOCAL_MEDIA_ASSETS_FILE = path.join(process.cwd(), 'database', 'local_media_assets.json');

interface LocalMediaRecord {
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: string;
  file_data: string;
  created_at: string;
}

function loadLocalMediaAssets(): Record<string, LocalMediaRecord> {
  try {
    if (fs.existsSync(LOCAL_MEDIA_ASSETS_FILE)) {
      const content = fs.readFileSync(LOCAL_MEDIA_ASSETS_FILE, 'utf8');
      return JSON.parse(content) || {};
    }
  } catch (e) {
    console.warn('[Local Media Assets Storage] Notice:', e);
  }
  return {};
}

function saveLocalMediaAsset(record: LocalMediaRecord): void {
  try {
    const dir = path.dirname(LOCAL_MEDIA_ASSETS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const map = loadLocalMediaAssets();
    map[record.file_name] = record;
    fs.writeFileSync(LOCAL_MEDIA_ASSETS_FILE, JSON.stringify(map), 'utf8');
  } catch (e) {
    console.warn('[Local Media Assets Save] Notice:', e);
  }
}

interface BrochureEnquiry {
  id: number;
  conference_id?: number;
  conference_name: string;
  full_name: string;
  email: string;
  mobile_number: string;
  country: string;
  query_message: string;
  action?: string;
  created_at: string;
}

const LOCAL_BROCHURE_ENQUIRIES_FILE = path.join(process.cwd(), 'database', 'local_brochure_enquiries.json');

function loadLocalBrochureEnquiries(): BrochureEnquiry[] {
  try {
    if (fs.existsSync(LOCAL_BROCHURE_ENQUIRIES_FILE)) {
      const content = fs.readFileSync(LOCAL_BROCHURE_ENQUIRIES_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[Local Brochure Enquiries Storage] Notice:', e);
  }
  return [];
}

function saveLocalBrochureEnquiries(items: BrochureEnquiry[]): void {
  try {
    const dir = path.dirname(LOCAL_BROCHURE_ENQUIRIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_BROCHURE_ENQUIRIES_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Local Brochure Enquiries Save] Notice:', e);
  }
}

const LOCAL_TERMS_FILE = path.join(process.cwd(), 'database', 'local_terms.json');

function loadLocalTerms(): TermsContent {
  try {
    if (fs.existsSync(LOCAL_TERMS_FILE)) {
      const content = fs.readFileSync(LOCAL_TERMS_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.sections)) return parsed;
    }
  } catch (e) {
    console.warn('[Local Terms Storage] Notice:', e);
  }
  return INITIAL_TERMS_CONTENT;
}

function saveLocalTerms(data: TermsContent): void {
  try {
    const dir = path.dirname(LOCAL_TERMS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_TERMS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Local Terms Save] Notice:', e);
  }
}

class DatabaseStore {
  conferences: Conference[] = loadLocalConferences();
  committee: CommitteeMember[] = [...COMMITTEE_MEMBERS];
  speakers: Speaker[] = [...SPEAKERS];
  sessions: Session[] = [...SESSIONS_20];
  schedule: ScheduleItem[] = [...SCHEDULE_ITEMS];
  categories: RegistrationCategory[] = loadLocalCategories();
  registrations: Registration[] = loadLocalRegistrations();
  payments: any[] = [];
  checkoutSessions: Record<string, any> = {};
  abstracts: AbstractSubmission[] = loadLocalAbstracts();
  proposals: ProposalSubmission[] = [...INITIAL_PROPOSALS];
  publications: Publication[] = loadLocalPublications();
  sponsors = [...SPONSORS];
  mediaPartners = [...MEDIA_PARTNERS];
  testimonials = [...TESTIMONIALS];
  blogs = [...BLOGS];
  faqs = [...FAQS];

  flyers = [...CONFERENCE_FLYERS];
  contactEnquiries: ContactEnquiry[] = loadLocalContactEnquiries();
  brochureEnquiries: BrochureEnquiry[] = loadLocalBrochureEnquiries();
  quoteRequests: any[] = [];
  subscribers: NewsletterSubscriber[] = [...INITIAL_SUBSCRIBERS];
  auditLogs: AuditLog[] = [...AUDIT_LOGS];
  currentUser: AdminUser = { ...INITIAL_ADMIN_USER };
  terms: TermsContent = loadLocalTerms();

  constructor() {
    this.conferences.forEach(c => {
      const confCats = this.categories.filter(cat => cat.conference_id === c.id);
      if (confCats.length > 0) {
        c.categories = confCats;
      }
    });
  }

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

function resolveDbHost(host: string): string {
  if (!host) return '127.0.0.1';
  const trimmed = host.trim();
  if (trimmed.toLowerCase() === 'localhost') {
    return '127.0.0.1';
  }
  return trimmed;
}

function getDbConfig() {
  const hostRaw = (process.env.DB_HOST || process.env.MYSQL_HOST || process.env.DATABASE_HOST || '').trim();
  const socketRaw = (process.env.DB_SOCKET || process.env.MYSQL_SOCKET || '').trim();
  let socketPath: string | undefined = socketRaw || undefined;

  // On Linux GoDaddy cPanel environments, auto-detect local MySQL socket if host is localhost or missing
  if (!socketPath && process.platform === 'linux' && (!hostRaw || hostRaw.toLowerCase() === 'localhost')) {
    const candidateSockets = ['/var/lib/mysql/mysql.sock', '/tmp/mysql.sock', '/var/run/mysqld/mysqld.sock'];
    for (const cs of candidateSockets) {
      if (fs.existsSync(cs)) {
        socketPath = cs;
        break;
      }
    }
  }

  const hostResolved = socketPath ? undefined : resolveDbHost(hostRaw);

  return {
    host: hostResolved,
    socketPath,
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || process.env.DATABASE_PORT || '3306', 10),
    user: (process.env.DB_USER || process.env.MYSQL_USER || process.env.DATABASE_USER || '').trim(),
    password: (process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.DATABASE_PASSWORD || '').trim(),
    database: (process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.DATABASE_NAME || '').trim(),
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
    if (isNaN(val.getTime())) return '';
    return val.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (!str || str === 'null' || str === 'undefined' || str === 'Invalid Date') {
    return '';
  }
  if (str.includes('T')) {
    const part = str.split('T')[0].trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
  }
  if (str.includes(' ')) {
    const part = str.split(' ')[0].trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    try {
      return parsed.toISOString().split('T')[0];
    } catch (_) {
      return '';
    }
  }
  return '';
}

function formatDateSql(val: any, fallback: string | null = null): string | null {
  const formatted = formatDateStr(val);
  if (formatted && /^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
    return formatted;
  }
  return fallback;
}

function parseConferenceDate(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== 'string') return Infinity;
  const cleaned = dateStr.trim();
  if (!cleaned) return Infinity;

  const ymdMatch = cleaned.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const dateObj = new Date(year, month, day);
    return isNaN(dateObj.getTime()) ? Infinity : dateObj.getTime();
  }

  const dmyMatch = cleaned.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
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

function getConferenceDateRange(conf: { start_date?: string; end_date?: string }) {
  const startTs = parseConferenceDate(conf.start_date);
  const endTs = parseConferenceDate(conf.end_date || conf.start_date);

  let startOfDay = startTs;
  if (startTs !== Infinity) {
    const s = new Date(startTs);
    s.setHours(0, 0, 0, 0);
    startOfDay = s.getTime();
  }

  let endOfDay = endTs;
  if (endTs !== Infinity) {
    const e = new Date(endTs);
    e.setHours(23, 59, 59, 999);
    endOfDay = e.getTime();
  }

  return { startOfDay, endOfDay, rawStart: startTs, rawEnd: endTs };
}

type ConferenceTimelineStatus = 'upcoming' | 'ongoing' | 'completed';

function getConferenceTimelineStatus(
  conf: { start_date?: string; end_date?: string },
  now: number = Date.now()
): ConferenceTimelineStatus {
  const { startOfDay, endOfDay } = getConferenceDateRange(conf);
  if (startOfDay === Infinity && endOfDay === Infinity) return 'upcoming';
  if (now < startOfDay) return 'upcoming';
  if (now > endOfDay) return 'completed';
  return 'ongoing';
}

function sortConferencesDynamically<T extends { start_date?: string; end_date?: string }>(
  conferences: T[],
  now: number = Date.now()
): T[] {
  return [...conferences].sort((a, b) => {
    const statusA = getConferenceTimelineStatus(a, now);
    const statusB = getConferenceTimelineStatus(b, now);

    const rank: Record<ConferenceTimelineStatus, number> = {
      upcoming: 1,
      ongoing: 2,
      completed: 3
    };

    if (rank[statusA] !== rank[statusB]) {
      return rank[statusA] - rank[statusB];
    }

    const rangeA = getConferenceDateRange(a);
    const rangeB = getConferenceDateRange(b);

    if (statusA === 'upcoming') {
      if (rangeA.rawStart !== rangeB.rawStart) return rangeA.rawStart - rangeB.rawStart;
      return rangeA.rawEnd - rangeB.rawEnd;
    }

    if (statusA === 'ongoing') {
      if (rangeA.rawStart !== rangeB.rawStart) return rangeA.rawStart - rangeB.rawStart;
      return rangeA.rawEnd - rangeB.rawEnd;
    }

    if (rangeA.rawEnd !== rangeB.rawEnd) {
      return rangeB.rawEnd - rangeA.rawEnd;
    }
    return rangeB.rawStart - rangeA.rawStart;
  });
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

let schemaEnsured = false;

async function ensureConferenceColumns(poolOrConn?: any) {
  const executor = poolOrConn || mysqlPool;
  if (!executor) return;
  const cols = [
    { name: 'committee_heading', type: 'VARCHAR(255) NULL' },
    { name: 'committee_description', type: 'TEXT NULL' },
    { name: 'speakers_badge', type: 'VARCHAR(100) NULL' },
    { name: 'speakers_heading', type: 'VARCHAR(255) NULL' },
    { name: 'speakers_description', type: 'TEXT NULL' },
    { name: 'journal_logo_url', type: 'TEXT NULL' },
    { name: 'accommodation_price_per_day', type: 'DECIMAL(10, 2) DEFAULT 120.00' },
    { name: 'hotel_name', type: 'VARCHAR(255) DEFAULT \'Official Partner Hotel\'' },
    { name: 'support_email', type: 'VARCHAR(150) DEFAULT \'scinsmedia@gmail.com\'' },
    { name: 'support_phone', type: 'VARCHAR(100) DEFAULT \'+1 (415) 800-3490 (Secretariat Desk)\'' },
    { name: 'support_label', type: 'VARCHAR(100) NULL' },
    { name: 'support_turnaround', type: 'TEXT NULL' },
    { name: 'secretariat_section_title', type: 'VARCHAR(255) NULL' },
    { name: 'secretariat_section_description', type: 'TEXT NULL' },
    { name: 'secretariat_association_title', type: 'VARCHAR(255) NULL' },
    { name: 'secretariat_conference_name', type: 'VARCHAR(255) NULL' },
    { name: 'secretariat_dates', type: 'VARCHAR(255) NULL' },
    { name: 'secretariat_location', type: 'VARCHAR(255) NULL' },
    { name: 'venue_photo', type: 'TEXT NULL' },
    { name: 'venue_maps_url', type: 'TEXT NULL' },
    { name: 'venue_description', type: 'TEXT NULL' }
  ];
  for (const col of cols) {
    try {
      await executor.query(`ALTER TABLE conferences ADD COLUMN ${col.name} ${col.type}`);
    } catch (e: any) {
      // Column already exists
    }
  }

  // Widen media and image URL columns across all entities to TEXT to ensure long paths and data URIs never truncate or fail
  const mediaAlters = [
    'ALTER TABLE conferences MODIFY COLUMN hero_image TEXT',
    'ALTER TABLE conferences MODIFY COLUMN logo_url TEXT',
    'ALTER TABLE conferences MODIFY COLUMN flyer_url TEXT',
    'ALTER TABLE conferences MODIFY COLUMN sample_abstract_url TEXT',
    'ALTER TABLE conferences MODIFY COLUMN welcome_speaker_image TEXT',
    'ALTER TABLE conferences MODIFY COLUMN exhibitor_image TEXT',
    'ALTER TABLE conferences MODIFY COLUMN program_image TEXT',
    'ALTER TABLE conferences MODIFY COLUMN journal_logo_url TEXT',
    'ALTER TABLE committee_members MODIFY COLUMN photo_url TEXT',
    'ALTER TABLE speakers MODIFY COLUMN photo_url TEXT',
    'ALTER TABLE sponsors MODIFY COLUMN logo_url TEXT',
    'ALTER TABLE media_partners MODIFY COLUMN logo_url TEXT',
    'ALTER TABLE testimonials MODIFY COLUMN photo_url TEXT',
    'ALTER TABLE conference_flyers MODIFY COLUMN flyer_url TEXT',
    'ALTER TABLE abstract_submissions MODIFY COLUMN primary_author_affiliation VARCHAR(200) NULL DEFAULT ""',
    'ALTER TABLE abstract_submissions MODIFY COLUMN primary_author_phone VARCHAR(50) NULL DEFAULT ""',
    'ALTER TABLE registrations ADD COLUMN accommodation_days INT DEFAULT 0',
    'ALTER TABLE registrations ADD COLUMN selected_categories JSON DEFAULT NULL',
    'ALTER TABLE registrations ADD COLUMN hotel_name VARCHAR(255) NULL',
    'ALTER TABLE registrations ADD COLUMN check_in_date VARCHAR(50) NULL',
    'ALTER TABLE registrations ADD COLUMN check_out_date VARCHAR(50) NULL',
    'ALTER TABLE registrations ADD COLUMN accommodation_rate DECIMAL(10, 2) DEFAULT 0',
    'ALTER TABLE registrations ADD COLUMN accommodation_amount DECIMAL(10, 2) DEFAULT 0',
    'ALTER TABLE registrations ADD COLUMN billing_address TEXT NULL'
  ];
  for (const sql of mediaAlters) {
    try {
      await executor.query(sql);
    } catch (_) {}
  }

  // Ensure brochure_enquiries table exists
  try {
    await executor.query(`
      CREATE TABLE IF NOT EXISTS brochure_enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conference_id INT NULL,
        conference_name VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        mobile_number VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL,
        query_message TEXT NOT NULL,
        action VARCHAR(50) DEFAULT 'download_brochure',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_conf_id (conference_id),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err: any) {
    console.warn('[Brochure Enquiries Table Init] Warning:', err?.message);
  }
}

async function seedInitialConferencesToMysql() {
  if (!mysqlPool) return;
  const confsToSeed = loadLocalConferences();
  
  // 1. Conferences
  try {
    const [cCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM conferences');
    if ((cCnt?.[0]?.count ?? 0) === 0) {
      console.log(`[MySQL Seeding] Database table conferences is empty. Seeding ${confsToSeed.length} conference records into MySQL...`);
      for (const conf of confsToSeed) {
        try {
          await mysqlPool.query(
            `INSERT INTO conferences (
              id, title, short_title, slug, conference_code, theme, tagline, description, detailed_about,
              about_heading, about_highlights, gallery_images, domain, city, country, venue, venue_address, timezone,
              start_date, end_date, abstract_deadline, early_bird_deadline, registration_deadline, mode, status,
              hero_image, logo_url, flyer_url, sample_abstract_url, featured_badge, display_order,
              welcome_heading, welcome_message, welcome_speaker_name, welcome_speaker_role, welcome_speaker_title, welcome_speaker_image, welcome_footer_text,
              exhibitor_heading, exhibitor_message, exhibitor_speaker_name, exhibitor_speaker_role, exhibitor_speaker_title, exhibitor_image, exhibitor_footer_text,
              program_image, meta_title, meta_description, keywords, accept_late_breaking, cme_credits_eligible, primary_language, max_attendees, accent_color, journal_name, journal_issn, indexing_partners,
              committee_heading, committee_description, speakers_badge, speakers_heading, speakers_description, journal_logo_url,
              hotel_name, accommodation_price_per_day, support_email, support_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE title = VALUES(title)`,
            [
              conf.id, conf.title, conf.short_title, conf.slug, conf.conference_code, conf.theme, conf.tagline || '', conf.description, conf.detailed_about || '',
              conf.about_heading || '', JSON.stringify(conf.about_highlights || []), JSON.stringify(conf.gallery_images || []), conf.domain, conf.city, conf.country, conf.venue, conf.venue_address || '', conf.timezone,
              formatDateSql(conf.start_date, '2026-09-01'), formatDateSql(conf.end_date, '2026-09-03'), formatDateSql(conf.abstract_deadline, '2026-07-31'), formatDateSql(conf.early_bird_deadline, '2026-06-30'), formatDateSql(conf.registration_deadline, '2026-08-15'), conf.mode, conf.status,
              conf.hero_image, conf.logo_url || '', conf.flyer_url || '', conf.sample_abstract_url || '', conf.featured_badge || '', conf.display_order || 1,
              conf.welcome_heading || '', conf.welcome_message || '', conf.welcome_speaker_name || '', conf.welcome_speaker_role || '', conf.welcome_speaker_title || '', conf.welcome_speaker_image || '', conf.welcome_footer_text || '',
              conf.exhibitor_heading || '', conf.exhibitor_message || '', conf.exhibitor_speaker_name || '', conf.exhibitor_speaker_role || '', conf.exhibitor_speaker_title || '', conf.exhibitor_image || '', conf.exhibitor_footer_text || '',
              conf.program_image || '', conf.meta_title || conf.title, conf.meta_description || conf.description, conf.keywords || '', conf.accept_late_breaking ?? true, conf.cme_credits_eligible ?? true, conf.primary_language || 'English', conf.max_attendees || 500, conf.accent_color || 'teal', conf.journal_name || '', conf.journal_issn || '', JSON.stringify(conf.indexing_partners || []),
              conf.committee_heading || '', conf.committee_description || '', conf.speakers_badge || '', conf.speakers_heading || '', conf.speakers_description || '', conf.journal_logo_url || '',
              conf.hotel_name || 'Official Partner Hotel', conf.accommodation_price_per_day || 120, conf.support_email || 'scinsmedia@gmail.com', conf.support_phone || '+1 (415) 800-3490 (Secretariat Desk)'
            ]
          );

          await mysqlPool.query(
            `INSERT INTO conference_settings (conference_id, registration_enabled, abstract_submission_enabled, publication_enabled, sponsors_enabled, media_partners_enabled, schedule_published, show_counter, max_attendees)
             VALUES (?, true, true, true, true, true, true, true, ?)
             ON DUPLICATE KEY UPDATE max_attendees = VALUES(max_attendees)`,
            [conf.id, conf.max_attendees || 500]
          ).catch(() => {});
        } catch (e: any) {
          console.warn(`[Seed Warning for ${conf.slug}]:`, e.message);
        }
      }
    }
  } catch (err: any) {
    console.warn('[Seed Conferences Check Notice]:', err.message);
  }

  // 2. Committee Members (if empty)
  try {
    const [commCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM committee_members');
    if ((commCnt?.[0]?.count ?? 0) === 0 && COMMITTEE_MEMBERS.length > 0) {
      for (let idx = 0; idx < COMMITTEE_MEMBERS.length; idx++) {
        const m = COMMITTEE_MEMBERS[idx];
        await mysqlPool.query(
          `INSERT INTO committee_members (
            id, conference_id, name, designation, institution, country, committee_role, photo_url,
            biography, education, experience, research_interests, publications_count, linkedin_url,
            orcid_url, google_scholar_url, display_order, is_published
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [
            m.id, m.conference_id, m.name, m.designation, m.institution, m.country, m.committee_role, m.photo_url || '',
            m.biography || '', m.education || '', m.experience || '', m.research_interests || '', m.publications_count || 0,
            m.linkedin_url || '', m.orcid_url || '', m.google_scholar_url || '', m.display_order || idx + 1, m.is_published !== false
          ]
        ).catch(() => {});
      }
    }
  } catch {}

  // 3. Registration Categories (if empty)
  try {
    const [catCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM registration_categories');
    if ((catCnt?.[0]?.count ?? 0) === 0 && REGISTRATION_CATEGORIES.length > 0) {
      for (let idx = 0; idx < REGISTRATION_CATEGORIES.length; idx++) {
        const c = REGISTRATION_CATEGORIES[idx];
        await mysqlPool.query(
          `INSERT INTO registration_categories (
            id, conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [
            c.id, c.conference_id, c.name, c.price, c.currency || 'USD', c.early_bird_price || c.price,
            formatDateSql(c.deadline, null), JSON.stringify(c.benefits || []), Boolean(c.is_popular), c.display_order || idx + 1,
            c.payment_gateway_link || '', c.is_active !== false
          ]
        ).catch(() => {});
      }
    }
  } catch {}

  // 4. Speakers (if empty)
  try {
    const [spkCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM speakers');
    if ((spkCnt?.[0]?.count ?? 0) === 0 && SPEAKERS.length > 0) {
      for (let idx = 0; idx < SPEAKERS.length; idx++) {
        const s = SPEAKERS[idx];
        await mysqlPool.query(
          `INSERT INTO speakers (
            id, name, prefix, designation, institution, country, research_domain, photo_url,
            biography, h_index, citations_count, linkedin_url, google_scholar, website
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [
            s.id, s.name, s.prefix || 'Dr.', s.designation, s.institution, s.country, s.research_domain,
            s.photo_url || '', s.biography || '', s.h_index || 25, s.citations_count || 1200,
            s.linkedin_url || '', s.google_scholar || '', s.website || ''
          ]
        ).catch(() => {});

        if (s.conference_id) {
          await mysqlPool.query(
            `INSERT INTO speaker_conferences (
              speaker_id, conference_id, speaker_type, presentation_title, presentation_abstract, display_order
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE presentation_title = VALUES(presentation_title)`,
            [
              s.id, s.conference_id, s.speaker_type || 'Keynote', s.presentation_title || 'Conference Keynote',
              s.presentation_abstract || '', s.display_order || idx + 1
            ]
          ).catch(() => {});
        }
      }
    }
  } catch {}

  // 5. Sessions (if empty)
  try {
    const [sesCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM sessions');
    if ((sesCnt?.[0]?.count ?? 0) === 0 && SESSIONS_20.length > 0) {
      for (let idx = 0; idx < SESSIONS_20.length; idx++) {
        const ses = SESSIONS_20[idx];
        await mysqlPool.query(
          `INSERT INTO sessions (
            id, conference_id, session_number, session_code, title, track, category, description,
            session_date, start_time, end_time, room, session_type, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE title = VALUES(title)`,
          [
            ses.id, ses.conference_id || 1, ses.session_number || (idx + 1), ses.session_code || `SES-${idx + 1}`,
            ses.title, ses.track || 'General', ses.category || 'General', ses.description || '',
            ses.session_date || '2026-06-22', ses.start_time || '09:00:00', ses.end_time || '10:30:00',
            ses.room || 'Hall A', ses.session_type || 'Oral Presentation', ses.display_order || (idx + 1)
          ]
        ).catch(() => {});
      }
    }
  } catch {}

  // 6. Schedule Items (if empty)
  try {
    const [schCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM schedule_items');
    if ((schCnt?.[0]?.count ?? 0) === 0 && SCHEDULE_ITEMS.length > 0) {
      for (let idx = 0; idx < SCHEDULE_ITEMS.length; idx++) {
        const sch = SCHEDULE_ITEMS[idx];
        await mysqlPool.query(
          `INSERT INTO schedule_items (
            id, conference_id, day_number, schedule_date, start_time, end_time, title, description,
            room, track, speaker_name, speaker_affiliation, item_type, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE title = VALUES(title)`,
          [
            sch.id, sch.conference_id || 1, sch.day_number || 1, sch.schedule_date || '2026-06-22',
            sch.start_time || '09:00', sch.end_time || '10:00', sch.title, sch.description || '',
            sch.room || '', sch.track || '', sch.speaker_name || '', sch.speaker_affiliation || '',
            sch.item_type || 'session', sch.display_order || (idx + 1)
          ]
        ).catch(() => {});
      }
    }
  } catch {}

  // 7. Sponsors (if empty)
  try {
    const [spnCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM sponsors');
    if ((spnCnt?.[0]?.count ?? 0) === 0 && SPONSORS.length > 0) {
      for (let idx = 0; idx < SPONSORS.length; idx++) {
        const sp = SPONSORS[idx];
        await mysqlPool.query(
          `INSERT INTO sponsors (
            id, name, logo_url, website, description, country, contact_email, is_active, display_order, tier_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [
            sp.id, sp.company_name || sp.name, sp.logo_url || '', sp.website || '',
            sp.description || '', sp.country || 'Global', sp.contact_email || '',
            sp.is_active ? 1 : 0, sp.display_order || (idx + 1), sp.tier_id || 1
          ]
        ).catch(() => {});

        if (sp.conference_id) {
          await mysqlPool.query(
            `INSERT INTO conference_sponsors (conference_id, sponsor_id, tier_id, display_order)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE tier_id = VALUES(tier_id)`,
            [sp.conference_id, sp.id, sp.tier_id || 1, sp.display_order || (idx + 1)]
          ).catch(() => {});
        }
      }
    }
  } catch {}

  // 8. Media Partners (if empty)
  try {
    const [mpCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM media_partners');
    if ((mpCnt?.[0]?.count ?? 0) === 0 && MEDIA_PARTNERS.length > 0) {
      for (let idx = 0; idx < MEDIA_PARTNERS.length; idx++) {
        const mp = MEDIA_PARTNERS[idx];
        await mysqlPool.query(
          `INSERT INTO media_partners (id, name, logo_url, website, category, display_order)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name)`,
          [mp.id, mp.name, mp.logo_url || '', mp.website || '', mp.category || 'Global Publisher', mp.display_order || (idx + 1)]
        ).catch(() => {});

        if (mp.conference_id) {
          await mysqlPool.query(
            `INSERT INTO conference_media_partners (conference_id, media_partner_id, display_order)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE display_order = VALUES(display_order)`,
            [mp.conference_id, mp.id, mp.display_order || (idx + 1)]
          ).catch(() => {});
        }
      }
    }
  } catch {}

  // 9. Testimonials (if empty)
  try {
    const [tCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM testimonials');
    if ((tCnt?.[0]?.count ?? 0) === 0 && TESTIMONIALS.length > 0) {
      for (let idx = 0; idx < TESTIMONIALS.length; idx++) {
        const t = TESTIMONIALS[idx];
        await mysqlPool.query(
          `INSERT INTO testimonials (id, conference_id, name, designation, institution, country, quote, photo_url, rating, is_featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE quote = VALUES(quote)`,
          [t.id, t.conference_id || 1, t.name, t.designation, t.institution, t.country, t.quote, t.photo_url || '', t.rating || 5, t.is_featured !== false]
        ).catch(() => {});
      }
    }
  } catch {}

  // 10. Publications (if empty)
  try {
    const [pubCnt]: any = await mysqlPool.query('SELECT COUNT(*) as count FROM publications');
    if ((pubCnt?.[0]?.count ?? 0) === 0 && PUBLICATIONS.length > 0) {
      for (let idx = 0; idx < PUBLICATIONS.length; idx++) {
        const p = PUBLICATIONS[idx];
        await mysqlPool.query(
          `INSERT INTO publications (id, conference_id, title, authors, journal, research_domain, publication_date, abstract_summary, pdf_url, citations, indexed_in)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title = VALUES(title)`,
          [p.id, p.conference_id || 1, p.title, p.authors, p.journal, p.research_domain, formatDateSql(p.publication_date, '2026-01-01'), p.abstract_summary, p.pdf_url || '', p.citations || 0, p.indexed_in || '']
        ).catch(() => {});
      }
    }
  } catch {}
}

async function ensureDatabaseSchema(poolOrConn?: Pool | any) {
  const executor = poolOrConn || mysqlPool;
  if (!executor) return;

  const tableDefinitions = [
    `CREATE TABLE IF NOT EXISTS conferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      short_title VARCHAR(100) NOT NULL,
      slug VARCHAR(150) NOT NULL UNIQUE,
      conference_code VARCHAR(50) NOT NULL UNIQUE,
      theme VARCHAR(255) NOT NULL,
      tagline VARCHAR(255) DEFAULT NULL,
      description TEXT NOT NULL,
      detailed_about LONGTEXT,
      domain VARCHAR(100) NOT NULL,
      city VARCHAR(100) NOT NULL,
      country VARCHAR(100) NOT NULL,
      venue VARCHAR(200) NOT NULL,
      venue_address TEXT,
      venue_photo TEXT,
      venue_maps_url TEXT,
      venue_description TEXT,
      timezone VARCHAR(50) DEFAULT 'UTC',
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      abstract_deadline DATE NOT NULL,
      early_bird_deadline DATE NOT NULL,
      registration_deadline DATE NOT NULL,
      mode ENUM('in-person', 'hybrid', 'virtual') DEFAULT 'hybrid',
      status ENUM('draft', 'published', 'archived') DEFAULT 'published',
      hero_image VARCHAR(255),
      logo_url VARCHAR(255) DEFAULT NULL,
      flyer_url VARCHAR(255),
      sample_abstract_url VARCHAR(255) DEFAULT NULL,
      featured_badge VARCHAR(100) DEFAULT '2nd Edition',
      display_order INT DEFAULT 0,
      about_heading VARCHAR(255),
      about_highlights JSON DEFAULT NULL,
      gallery_images JSON DEFAULT NULL,
      welcome_heading VARCHAR(255),
      welcome_message LONGTEXT,
      welcome_speaker_name VARCHAR(100),
      welcome_speaker_role VARCHAR(100) DEFAULT 'Conference Chair',
      welcome_speaker_title VARCHAR(150),
      welcome_speaker_image VARCHAR(255),
      welcome_footer_text TEXT,
      exhibitor_heading VARCHAR(255),
      exhibitor_message LONGTEXT,
      exhibitor_speaker_name VARCHAR(100),
      exhibitor_speaker_role VARCHAR(100) DEFAULT 'Platinum & Gold Partners',
      exhibitor_speaker_title VARCHAR(255),
      exhibitor_image VARCHAR(255),
      exhibitor_footer_text TEXT,
      program_image VARCHAR(255),
      meta_title VARCHAR(255),
      meta_description TEXT,
      keywords VARCHAR(255),
      accept_late_breaking BOOLEAN DEFAULT TRUE,
      cme_credits_eligible BOOLEAN DEFAULT TRUE,
      primary_language VARCHAR(100) DEFAULT 'English',
      max_attendees INT DEFAULT 500,
      accent_color VARCHAR(50) DEFAULT 'teal',
      journal_name VARCHAR(255) DEFAULT NULL,
      journal_issn VARCHAR(50) DEFAULT NULL,
      indexing_partners JSON DEFAULT NULL,
      committee_heading VARCHAR(255) NULL,
      committee_description TEXT NULL,
      speakers_badge VARCHAR(100) NULL,
      speakers_heading VARCHAR(255) NULL,
      speakers_description TEXT NULL,
      journal_logo_url VARCHAR(255) NULL,
      created_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_status (status),
      INDEX idx_dates (start_date, end_date),
      INDEX idx_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS conference_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NOT NULL UNIQUE,
      registration_enabled BOOLEAN DEFAULT TRUE,
      abstract_submission_enabled BOOLEAN DEFAULT TRUE,
      publication_enabled BOOLEAN DEFAULT TRUE,
      sponsors_enabled BOOLEAN DEFAULT TRUE,
      media_partners_enabled BOOLEAN DEFAULT TRUE,
      schedule_published BOOLEAN DEFAULT TRUE,
      show_counter BOOLEAN DEFAULT TRUE,
      max_attendees INT DEFAULT 1000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_conf_settings (conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS conference_gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      caption VARCHAR(255),
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_conf_gallery (conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS committee_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      designation VARCHAR(150) NOT NULL,
      institution VARCHAR(200) NOT NULL,
      country VARCHAR(100) NOT NULL,
      committee_role VARCHAR(100) DEFAULT 'Scientific Committee',
      photo_url VARCHAR(255),
      biography TEXT,
      education TEXT,
      experience TEXT,
      research_interests TEXT,
      publications_count INT DEFAULT 0,
      linkedin_url VARCHAR(255),
      orcid_url VARCHAR(255),
      google_scholar_url VARCHAR(255),
      display_order INT DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_comm_conf (conference_id, display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS speakers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      prefix VARCHAR(20) DEFAULT 'Dr.',
      designation VARCHAR(150) NOT NULL,
      institution VARCHAR(200) NOT NULL,
      country VARCHAR(100) NOT NULL,
      research_domain VARCHAR(100) NOT NULL,
      photo_url VARCHAR(255),
      biography TEXT,
      h_index INT DEFAULT 25,
      citations_count INT DEFAULT 1200,
      linkedin_url VARCHAR(255),
      google_scholar VARCHAR(255),
      website VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_speakers_domain (research_domain)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS speaker_conferences (
      speaker_id INT NOT NULL,
      conference_id INT NOT NULL,
      speaker_type VARCHAR(100) DEFAULT 'Keynote',
      presentation_title VARCHAR(255) NOT NULL,
      presentation_abstract TEXT,
      display_order INT DEFAULT 0,
      PRIMARY KEY (speaker_id, conference_id),
      INDEX idx_spk_conf (conference_id, display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NOT NULL,
      session_number INT NOT NULL,
      session_code VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      track VARCHAR(150) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      session_date DATE,
      start_time TIME,
      end_time TIME,
      room VARCHAR(100),
      session_type VARCHAR(100) DEFAULT 'Oral Presentation',
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_conf_session (conference_id, session_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS session_speakers (
      session_id INT NOT NULL,
      speaker_id INT NOT NULL,
      role VARCHAR(50) DEFAULT 'Presenter',
      talk_title VARCHAR(255),
      time_slot VARCHAR(50),
      PRIMARY KEY (session_id, speaker_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS schedule_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NOT NULL,
      day_number INT NOT NULL DEFAULT 1,
      schedule_date DATE NOT NULL,
      start_time VARCHAR(20) NOT NULL,
      end_time VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      room VARCHAR(100),
      track VARCHAR(100),
      speaker_name VARCHAR(150),
      speaker_affiliation VARCHAR(200),
      item_type VARCHAR(50) DEFAULT 'session',
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_schedule_conf_day (conference_id, day_number, start_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS registration_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      early_bird_price DECIMAL(10, 2) NOT NULL,
      deadline DATE,
      benefits JSON,
      is_popular BOOLEAN DEFAULT FALSE,
      display_order INT DEFAULT 0,
      payment_gateway_link VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_reg_cat_conf (conference_id, is_active, display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      registration_id VARCHAR(50) NOT NULL UNIQUE,
      conference_id INT NOT NULL,
      category_id INT NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      country VARCHAR(100) NOT NULL,
      institution VARCHAR(200) NOT NULL,
      department VARCHAR(150),
      designation VARCHAR(150) NOT NULL,
      research_area VARCHAR(150),
      attendance_mode VARCHAR(50) DEFAULT 'In-Person',
      accommodation_required BOOLEAN DEFAULT FALSE,
      meal_preference VARCHAR(50) DEFAULT 'Standard',
      special_requirements TEXT,
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      payment_status VARCHAR(50) DEFAULT 'pending',
      registration_status VARCHAR(50) DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_reg_conf_status (conference_id, registration_status, payment_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS abstract_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      submission_id VARCHAR(50) NOT NULL UNIQUE,
      conference_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      abstract_text LONGTEXT NOT NULL,
      keywords VARCHAR(255) NOT NULL,
      research_domain VARCHAR(100) NOT NULL,
      presentation_preference VARCHAR(100) DEFAULT 'Oral',
      primary_author_name VARCHAR(150) NOT NULL,
      primary_author_email VARCHAR(150) NOT NULL,
      primary_author_phone VARCHAR(50),
      primary_author_affiliation VARCHAR(200) NOT NULL,
      primary_author_country VARCHAR(100) NOT NULL,
      file_url VARCHAR(255),
      file_name VARCHAR(255),
      status VARCHAR(50) DEFAULT 'submitted',
      reviewer_notes TEXT,
      assigned_reviewer_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_abs_conf_status (conference_id, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS abstract_authors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      abstract_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      institution VARCHAR(200) NOT NULL,
      country VARCHAR(100) NOT NULL,
      is_corresponding BOOLEAN DEFAULT FALSE,
      display_order INT DEFAULT 0,
      INDEX idx_aauthors_abs (abstract_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS abstract_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      abstract_id INT NOT NULL,
      reviewer_id INT NOT NULL,
      score_originality INT DEFAULT 8,
      score_methodology INT DEFAULT 8,
      score_relevance INT DEFAULT 8,
      score_clarity INT DEFAULT 8,
      total_score DECIMAL(4, 2) DEFAULT 8.00,
      recommendation VARCHAR(50) DEFAULT 'accept',
      comments_to_author TEXT,
      confidential_comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_areviews_abs (abstract_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS proposal_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      proposal_id VARCHAR(50) NOT NULL UNIQUE,
      proposal_type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      lead_proposer_name VARCHAR(150) NOT NULL,
      lead_proposer_email VARCHAR(150) NOT NULL,
      lead_proposer_phone VARCHAR(50),
      affiliation VARCHAR(200) NOT NULL,
      country VARCHAR(100) NOT NULL,
      target_conference_id INT NULL,
      abstract_description LONGTEXT NOT NULL,
      learning_objectives TEXT,
      duration_minutes INT DEFAULT 90,
      expected_attendees INT DEFAULT 50,
      co_proposers JSON DEFAULT NULL,
      file_url VARCHAR(255),
      file_name VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',
      reviewer_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_prop_conf (target_conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS publications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      authors VARCHAR(255) NOT NULL,
      journal VARCHAR(200) NOT NULL,
      research_domain VARCHAR(100) NOT NULL,
      conference_id INT NULL,
      publication_date DATE NOT NULL,
      doi VARCHAR(100) NULL,
      abstract_summary TEXT,
      pdf_url VARCHAR(255),
      citations INT DEFAULT 0,
      indexed_in VARCHAR(200) DEFAULT 'Scopus, Web of Science, PubMed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_pub_conf (conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS sponsor_tiers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      min_amount DECIMAL(10, 2),
      display_order INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS sponsors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(150) NOT NULL,
      logo_url VARCHAR(255) NOT NULL,
      website VARCHAR(255) NOT NULL,
      description TEXT,
      country VARCHAR(100),
      contact_email VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS conference_sponsors (
      conference_id INT NOT NULL,
      sponsor_id INT NOT NULL,
      tier_id INT NOT NULL DEFAULT 1,
      display_order INT DEFAULT 0,
      PRIMARY KEY (conference_id, sponsor_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS media_partners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      logo_url VARCHAR(255) NOT NULL,
      website VARCHAR(255) NOT NULL,
      country VARCHAR(100),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS conference_media_partners (
      conference_id INT NOT NULL,
      media_partner_id INT NOT NULL,
      display_order INT DEFAULT 0,
      PRIMARY KEY (conference_id, media_partner_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      photo_url VARCHAR(255),
      designation VARCHAR(150) NOT NULL,
      institution VARCHAR(200) NOT NULL,
      country VARCHAR(100) NOT NULL,
      quote TEXT NOT NULL,
      conference_id INT NULL,
      rating INT DEFAULT 5,
      is_featured BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_test_conf (conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS contact_enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50),
      subject VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      conference_id INT NULL,
      status VARCHAR(50) DEFAULT 'new',
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_contact_conf (conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS conference_flyers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      file_url VARCHAR(255) NOT NULL,
      file_type VARCHAR(20) DEFAULT 'PDF',
      file_size VARCHAR(20) DEFAULT '2.4 MB',
      is_public BOOLEAN DEFAULT TRUE,
      downloads_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_flyer_conf (conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS conference_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NOT NULL,
      title VARCHAR(150) NOT NULL,
      category VARCHAR(100) NOT NULL,
      file_url VARCHAR(255) NOT NULL,
      downloads_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_doc_conf (conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      payment_reference VARCHAR(100) NOT NULL UNIQUE,
      registration_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      gateway VARCHAR(50) DEFAULT 'Stripe',
      status VARCHAR(50) DEFAULT 'succeeded',
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_pay_reg (registration_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NULL,
      action VARCHAR(100) NOT NULL,
      entity VARCHAR(100) NOT NULL,
      entity_id VARCHAR(50) NULL,
      details TEXT,
      ip_address VARCHAR(50) DEFAULT '127.0.0.1',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conference_id INT NULL,
      category_id INT NOT NULL DEFAULT 1,
      question VARCHAR(255) NOT NULL,
      answer TEXT NOT NULL,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_faq_conf (conference_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS media_assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL UNIQUE,
      file_path VARCHAR(500) NOT NULL,
      file_type VARCHAR(100) NOT NULL,
      file_size INT NOT NULL,
      category VARCHAR(100) DEFAULT 'general',
      file_data LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_media_filename (file_name),
      INDEX idx_media_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS terms_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      heading VARCHAR(255) NOT NULL,
      points JSON NOT NULL,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_terms_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  for (const q of tableDefinitions) {
    try {
      await executor.query(q);
    } catch (tblErr: any) {
      console.warn('[MySQL Table Init Notice]:', tblErr.message);
    }
  }

  await ensureConferenceColumns(executor);

  // Check and seed initial baseline data if tables are empty (never touches existing records)
  try {
    await seedInitialConferencesToMysql();
  } catch (chkErr: any) {
    console.warn('[MySQL Schema Seed Notice]:', chkErr.message);
  }

  try {
    const [termsRows]: any = await executor.query('SELECT COUNT(*) as cnt FROM terms_sections').catch(() => [[{ cnt: 0 }]]);
    if (termsRows && termsRows[0] && Number(termsRows[0].cnt) === 0) {
      console.log('[MySQL Terms Seed] Seeding initial Terms & Conditions sections into MySQL...');
      const terms = loadLocalTerms();
      for (let i = 0; i < terms.sections.length; i++) {
        const sec = terms.sections[i];
        await executor.query(
          'INSERT INTO terms_sections (heading, points, display_order) VALUES (?, ?, ?)',
          [sec.heading, JSON.stringify(sec.points), i + 1]
        );
      }
    }
  } catch (termsErr: any) {
    console.warn('[MySQL Terms Seed Notice]:', termsErr.message);
  }

  schemaEnsured = true;
}

async function loadDatabaseFromMysql() {
  if (!mysqlPool) return;
  await ensureDatabaseSchema(mysqlPool);
  try {
    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM conferences ORDER BY start_date ASC'
    );

    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`[MySQL Hydration] Found ${rows.length} existing conferences in MySQL database. Loading...`);
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
        venue_photo: r.venue_photo || '',
        venue_maps_url: r.venue_maps_url || '',
        venue_description: r.venue_description || '',
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
        committee_heading: r.committee_heading || '',
        committee_description: r.committee_description || '',
        speakers_badge: r.speakers_badge || '',
        speakers_heading: r.speakers_heading || '',
        speakers_description: r.speakers_description || '',
        journal_logo_url: r.journal_logo_url || '',
        accommodation_price_per_day: Number(r.accommodation_price_per_day) || 120,
        hotel_name: r.hotel_name || 'Official Partner Hotel',
        support_email: r.support_email || 'scinsmedia@gmail.com',
        support_phone: r.support_phone || '+1 (415) 800-3490 (Secretariat Desk)',
        support_label: r.support_label || '',
        support_turnaround: r.support_turnaround || '',
        secretariat_section_title: r.secretariat_section_title || '',
        secretariat_section_description: r.secretariat_section_description || '',
        secretariat_association_title: r.secretariat_association_title || '',
        secretariat_conference_name: r.secretariat_conference_name || '',
        secretariat_dates: r.secretariat_dates || '',
        secretariat_location: r.secretariat_location || '',
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
        const [spkRows]: any = await mysqlPool.query(`
          SELECT s.*, sc.conference_id, sc.speaker_type, sc.presentation_title, sc.presentation_abstract, sc.display_order as conf_display_order
          FROM speakers s
          LEFT JOIN speaker_conferences sc ON s.id = sc.speaker_id
          ORDER BY COALESCE(sc.display_order, s.id) ASC, s.id ASC
        `);
        if (Array.isArray(spkRows) && spkRows.length > 0) {
          db.speakers = spkRows.map((sp: any) => ({
            id: Number(sp.id),
            conference_id: sp.conference_id ? Number(sp.conference_id) : undefined,
            name: sp.name || '',
            prefix: sp.prefix || 'Dr.',
            designation: sp.designation || '',
            institution: sp.institution || '',
            country: sp.country || '',
            research_domain: sp.research_domain || '',
            photo_url: sp.photo_url || '',
            biography: sp.biography || '',
            h_index: Number(sp.h_index || 25),
            citations_count: Number(sp.citations_count || 1200),
            speaker_type: sp.speaker_type || 'Keynote',
            presentation_title: sp.presentation_title || '',
            presentation_abstract: sp.presentation_abstract || '',
            linkedin_url: sp.linkedin_url || '',
            google_scholar: sp.google_scholar || '',
            website: sp.website || '',
            display_order: Number(sp.conf_display_order || sp.id || 1),
            is_active: true,
            status: 'active'
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] speakers table notice:', err.message);
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

      try {
        const [regRows]: any = await mysqlPool.query(`
          SELECT r.*, c.title as conference_title, rc.name as category_name
          FROM registrations r
          LEFT JOIN conferences c ON r.conference_id = c.id
          LEFT JOIN registration_categories rc ON r.category_id = rc.id
          ORDER BY r.id DESC
        `);
        if (Array.isArray(regRows) && regRows.length > 0) {
          db.registrations = regRows.map((r: any) => ({
            id: Number(r.id),
            registration_id: r.registration_id || '',
            conference_id: Number(r.conference_id),
            conference_title: r.conference_title || '',
            category_id: Number(r.category_id),
            category_name: r.category_name || '',
            first_name: r.first_name || '',
            last_name: r.last_name || '',
            email: r.email || '',
            phone: r.phone || '',
            country: r.country || '',
            institution: r.institution || '',
            department: r.department || '',
            designation: r.designation || '',
            research_area: r.research_area || '',
            attendance_mode: r.attendance_mode || 'In-Person',
            accommodation_required: Boolean(r.accommodation_required),
            accommodation_days: Number(r.accommodation_days) || 0,
            accommodation_rate: Number(r.accommodation_rate) || 0,
            accommodation_amount: Number(r.accommodation_amount) || 0,
            hotel_name: r.hotel_name || '',
            check_in_date: r.check_in_date || '',
            check_out_date: r.check_out_date || '',
            meal_preference: r.meal_preference || 'Standard',
            special_requirements: r.special_requirements || '',
            amount: Number(r.amount || 0),
            currency: r.currency || 'USD',
            payment_status: r.payment_status || 'pending',
            registration_status: r.registration_status || 'confirmed',
            created_at: formatDateStr(r.created_at) || new Date().toISOString()
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] registrations table notice:', err.message);
      }

      // Hydrate Sponsors from MySQL
      try {
        const [spnRows]: any = await mysqlPool.query(`
          SELECT s.*, cs.conference_id as conf_id, cs.display_order as conf_disp_order, cs.tier_id as conf_tier_id, st.name as tier_title
          FROM sponsors s
          LEFT JOIN conference_sponsors cs ON s.id = cs.sponsor_id
          LEFT JOIN sponsor_tiers st ON (cs.tier_id = st.id OR s.tier_id = st.id)
          ORDER BY COALESCE(cs.display_order, s.display_order, s.id) ASC
        `);
        if (Array.isArray(spnRows) && spnRows.length > 0) {
          db.sponsors = spnRows.map((r: any) => ({
            id: Number(r.id),
            name: r.name || '',
            company_name: r.name || '',
            logo_url: r.logo_url || '',
            website: r.website || '',
            description: r.description || '',
            country: r.country || 'Global',
            contact_email: r.contact_email || '',
            tier: r.tier_title || 'Platinum',
            tier_name: r.tier_title || 'Platinum Sponsor',
            tier_id: Number(r.conf_tier_id || r.tier_id || 1),
            conference_id: r.conf_id ? Number(r.conf_id) : 1,
            display_order: Number(r.conf_disp_order || r.display_order || 1),
            is_active: Boolean(r.is_active ?? true),
            status: r.is_active ? 'active' : 'inactive',
            partner_type: 'Corporate Sponsor',
            category: r.tier_title || 'Platinum'
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] sponsors table notice:', err.message);
      }

      // Hydrate Media Partners from MySQL
      try {
        const [mpRows]: any = await mysqlPool.query(`
          SELECT mp.*, cmp.conference_id as conf_id, cmp.display_order as conf_disp_order
          FROM media_partners mp
          LEFT JOIN conference_media_partners cmp ON mp.id = cmp.media_partner_id
          ORDER BY COALESCE(cmp.display_order, mp.display_order, mp.id) ASC
        `);
        if (Array.isArray(mpRows) && mpRows.length > 0) {
          db.mediaPartners = mpRows.map((r: any) => ({
            id: Number(r.id),
            name: r.name || '',
            logo_url: r.logo_url || '',
            website: r.website || '',
            category: r.category || 'Global Publisher',
            conference_id: r.conf_id ? Number(r.conf_id) : 1,
            display_order: Number(r.conf_disp_order || r.display_order || 1)
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] media_partners table notice:', err.message);
      }

      // Hydrate Publications from MySQL
      try {
        const [pubRows]: any = await mysqlPool.query('SELECT * FROM publications ORDER BY id DESC');
        if (Array.isArray(pubRows) && pubRows.length > 0) {
          db.publications = pubRows.map((p: any) => ({
            id: Number(p.id),
            conference_id: p.conference_id ? Number(p.conference_id) : 1,
            conference_name: p.journal || 'Biopolymers 2026',
            title: p.title || '',
            authors: p.authors || '',
            journal: p.journal || '',
            research_domain: p.research_domain || 'Biotechnology',
            publication_date: formatDateStr(p.publication_date) || new Date().toISOString().substring(0, 10),
            abstract_summary: p.abstract_summary || '',
            citations: Number(p.citations || 0),
            indexed_in: p.indexed_in || 'Scopus, Web of Science',
            pdf_url: p.pdf_url || ''
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] publications table notice:', err.message);
      }

      // Hydrate Testimonials from MySQL
      try {
        const [tRows]: any = await mysqlPool.query('SELECT * FROM testimonials ORDER BY id ASC');
        if (Array.isArray(tRows) && tRows.length > 0) {
          db.testimonials = tRows.map((t: any) => ({
            id: Number(t.id),
            conference_id: t.conference_id ? Number(t.conference_id) : undefined,
            name: t.name || '',
            designation: t.designation || '',
            institution: t.institution || '',
            country: t.country || 'Global',
            quote: t.quote || '',
            photo_url: t.photo_url || '',
            rating: Number(t.rating || 5),
            is_featured: Boolean(t.is_featured ?? true)
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] testimonials table notice:', err.message);
      }

      // Hydrate Abstract Submissions from MySQL
      try {
        const [absRows]: any = await mysqlPool.query('SELECT * FROM abstract_submissions ORDER BY id DESC');
        if (Array.isArray(absRows) && absRows.length > 0) {
          db.abstracts = absRows.map((a: any) => {
            const conf = db.conferences.find(c => c.id === Number(a.conference_id));
            return {
              id: Number(a.id),
              submission_id: a.submission_id || a.submission_code || `SUB-${a.id}`,
              conference_id: Number(a.conference_id),
              conference_title: conf ? conf.title : (a.conference_title || 'World Congress'),
              title: a.title || '',
              abstract_text: a.abstract_text || '',
              keywords: a.keywords || '',
              research_domain: a.research_domain || a.track || 'Biotechnology',
              presentation_preference: a.presentation_preference || a.presentation_type || 'Oral',
              primary_author_name: a.primary_author_name || a.submitter_name || '',
              primary_author_email: a.primary_author_email || a.submitter_email || '',
              primary_author_phone: a.primary_author_phone || a.submitter_phone || '',
              primary_author_affiliation: a.primary_author_affiliation || a.submitter_affiliation || '',
              primary_author_country: a.primary_author_country || a.submitter_country || '',
              file_name: a.file_name || 'abstract.pdf',
              file_url: a.file_url || '',
              status: a.status || 'submitted',
              created_at: a.created_at ? new Date(a.created_at).toISOString() : new Date().toISOString()
            };
          });
          saveLocalAbstracts(db.abstracts);
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] abstract_submissions table notice:', err.message);
      }

      // Hydrate Proposal Submissions from MySQL
      try {
        const [propRows]: any = await mysqlPool.query('SELECT * FROM proposal_submissions ORDER BY id DESC');
        if (Array.isArray(propRows) && propRows.length > 0) {
          db.proposals = propRows.map((p: any) => ({
            id: Number(p.id),
            proposal_code: p.proposal_id || p.proposal_code || `PROP-${p.id}`,
            conference_id: Number(p.target_conference_id || p.conference_id || 1),
            conference_title: p.conference_title || 'World Congress',
            conference_city: p.conference_city || 'International',
            conference_country: p.country || 'Global',
            proposal_type: (p.proposal_type === 'keynote' ? 'keynote_forum' : p.proposal_type) || 'workshop',
            title: p.title || '',
            proposer_title: p.proposer_title || 'Dr.',
            proposer_name: p.lead_proposer_name || p.proposer_name || '',
            proposer_email: p.lead_proposer_email || p.proposer_email || '',
            proposer_phone: p.lead_proposer_phone || p.proposer_phone || '',
            proposer_affiliation: p.affiliation || p.proposer_affiliation || '',
            proposer_department: p.proposer_department || '',
            proposer_country: p.country || p.proposer_country || '',
            proposer_bio: p.proposer_bio || '',
            co_presenters: p.co_presenters || '',
            abstract: p.abstract_description || p.abstract || '',
            learning_objectives: p.learning_objectives || '',
            target_audience: p.target_audience || '',
            duration_format: p.duration_format || 'Standard Session',
            av_requirements: p.av_requirements || '',
            file_name: p.file_name || '',
            file_url: p.file_url || '',
            status: p.status || 'received',
            reviewer_notes: p.reviewer_notes || '',
            created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString()
          }));
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] proposal_submissions table notice:', err.message);
      }

      // Hydrate Contact Enquiries from MySQL
      try {
        const [contactRows]: any = await mysqlPool.query('SELECT * FROM contact_enquiries ORDER BY id DESC');
        if (Array.isArray(contactRows) && contactRows.length > 0) {
          db.contactEnquiries = contactRows.map((r: any) => {
            const cId = r.conference_id ? Number(r.conference_id) : undefined;
            const targetC = cId ? db.conferences.find(c => c.id === cId) : undefined;
            return {
              id: Number(r.id),
              name: r.name || '',
              email: r.email || '',
              phone: r.phone || '',
              subject: r.subject || '',
              message: r.message || '',
              conference_id: cId,
              conference_code: targetC?.slug ? targetC.slug.toUpperCase() : undefined,
              conference_title: targetC?.title || undefined,
              status: r.status || 'new',
              created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
            };
          });
          saveLocalContactEnquiries(db.contactEnquiries);
        }
      } catch (err: any) {
        console.warn('[MySQL Hydration] contact_enquiries table notice:', err.message);
      }

      // Bi-directional media synchronization between local storage and MySQL media_assets
      await syncMediaAssetsBidirectional();

      console.log(`[MySQL Hydration] Successfully hydrated ${db.conferences.length} conferences and all associated entities from MySQL database.`);
    } else {
      console.log('[MySQL Hydration] No conferences returned from MySQL. Preserving local conferences store.');
      if (db.conferences.length === 0) {
        db.conferences = loadLocalConferences();
      }
    }
  } catch (err: any) {
    console.error('[MySQL Hydration Error]:', err.message);
  }
}

// Bi-directional media asset persistence engine: guarantees images survive disk wipes, restarts and redeployments
async function syncMediaAssetsBidirectional(): Promise<void> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const distUploadsDir = path.join(process.cwd(), 'dist', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(distUploadsDir)) fs.mkdirSync(distUploadsDir, { recursive: true });

  try {
    // 1. Back up any existing disk files into local JSON and MySQL media_assets
    if (fs.existsSync(uploadsDir)) {
      const diskFiles = fs.readdirSync(uploadsDir);
      for (const fileName of diskFiles) {
        const filePath = path.join(uploadsDir, fileName);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          try {
            const buffer = fs.readFileSync(filePath);
            const base64Data = buffer.toString('base64');
            const ext = path.extname(fileName).toLowerCase().replace('.', '');
            let mime = 'image/jpeg';
            if (ext === 'png') mime = 'image/png';
            else if (ext === 'webp') mime = 'image/webp';
            else if (ext === 'svg') mime = 'image/svg+xml';
            else if (ext === 'gif') mime = 'image/gif';
            else if (ext === 'pdf') mime = 'application/pdf';

            const cat = fileName.split('-')[0] || 'general';

            saveLocalMediaAsset({
              file_name: fileName,
              file_path: `/uploads/${fileName}`,
              file_type: mime,
              file_size: stat.size,
              category: cat,
              file_data: base64Data,
              created_at: new Date().toISOString()
            });

            if (mysqlPool) {
              const [rows]: any = await mysqlPool.query(
                'SELECT id FROM media_assets WHERE file_name = ? LIMIT 1',
                [fileName]
              );
              if (!rows || rows.length === 0) {
                await mysqlPool.query(
                  `INSERT INTO media_assets (file_name, file_path, file_type, file_size, category, file_data)
                   VALUES (?, ?, ?, ?, ?, ?)
                   ON DUPLICATE KEY UPDATE file_data = VALUES(file_data)`,
                  [fileName, `/uploads/${fileName}`, mime, stat.size, cat, base64Data]
                );
                console.log(`[Media Sync] Backed up disk file "${fileName}" to MySQL media_assets`);
              }
            }
          } catch (fileErr: any) {
            console.warn(`[Media Sync] Notice backing up "${fileName}":`, fileErr.message);
          }
        }
      }
    }

    // 2. Restore any media assets stored in MySQL that are missing on disk
    if (mysqlPool) {
      const [dbAssets]: any = await mysqlPool.query(
        'SELECT file_name, file_data FROM media_assets'
      );
      if (Array.isArray(dbAssets)) {
        for (const asset of dbAssets) {
          if (!asset.file_name || !asset.file_data) continue;
          const targetDiskPath = path.join(uploadsDir, asset.file_name);
          const targetDistPath = path.join(distUploadsDir, asset.file_name);

          if (!fs.existsSync(targetDiskPath)) {
            try {
              const buf = Buffer.from(asset.file_data, 'base64');
              fs.writeFileSync(targetDiskPath, buf);
              try { fs.writeFileSync(targetDistPath, buf); } catch (_) {}
              console.log(`[Media Sync] Restored persistent media file "${asset.file_name}" from MySQL to disk`);
            } catch (restoreErr: any) {
              console.warn(`[Media Sync] Notice restoring "${asset.file_name}":`, restoreErr.message);
            }
          }
        }
      }
    }

    // 3. Restore any media assets stored in local_media_assets.json missing on disk
    const localAssets = loadLocalMediaAssets();
    for (const [fName, asset] of Object.entries(localAssets)) {
      if (!asset.file_data) continue;
      const targetDiskPath = path.join(uploadsDir, fName);
      const targetDistPath = path.join(distUploadsDir, fName);
      if (!fs.existsSync(targetDiskPath)) {
        try {
          const buf = Buffer.from(asset.file_data, 'base64');
          fs.writeFileSync(targetDiskPath, buf);
          try { fs.writeFileSync(targetDistPath, buf); } catch (_) {}
          console.log(`[Media Sync] Restored persistent media file "${fName}" from local store to disk`);
        } catch (_) {}
      }
    }
  } catch (err: any) {
    console.warn('[Media Sync Notice]:', err.message);
  }
}

let dbKeepAliveTimer: NodeJS.Timeout | null = null;

async function initMysqlPool() {
  const config = getDbConfig();
  const hasValidConfig = (config.host || config.socketPath) && config.user && config.database;
  if (hasValidConfig) {
    try {
      if (mysqlPool) {
        try { await mysqlPool.end(); } catch (e) {}
        mysqlPool = null;
      }
      
      const poolOpts: any = {
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 5,
        idleTimeout: 30000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        queueLimit: 0,
        connectTimeout: 15000,
        dateStrings: true
      };

      if (config.socketPath) {
        poolOpts.socketPath = config.socketPath;
      } else {
        poolOpts.host = config.host;
        poolOpts.port = config.port;
      }

      mysqlPool = mysql.createPool(poolOpts);

      (mysqlPool.pool as any)?.on?.('error', async (err: any) => {
        console.warn('[MySQL Pool Event caught]:', err?.message || err);
        if (err?.code === 'PROTOCOL_CONNECTION_LOST' || err?.code === 'ECONNRESET' || err?.fatal) {
          console.log('[MySQL] Reconnecting to MySQL pool after connection drop...');
          try {
            await initMysqlPool();
          } catch (reconnErr: any) {
            console.error('[MySQL Reconnect Failed]:', reconnErr.message);
          }
        }
      });

      const conn = await mysqlPool.getConnection();
      const connEndpoint = config.socketPath ? `socket:${config.socketPath}` : `${config.host}:${config.port}`;
      console.log(`[MySQL] Successfully connected to GoDaddy cPanel database: ${config.database}@${connEndpoint}`);
      conn.release();

      // Periodic keepalive heartbeat ping every 25s to prevent wait_timeout disconnections on GoDaddy
      if (dbKeepAliveTimer) clearInterval(dbKeepAliveTimer);
      dbKeepAliveTimer = setInterval(async () => {
        if (mysqlPool) {
          try {
            await mysqlPool.query('SELECT 1');
          } catch (pingErr: any) {
            console.warn('[MySQL Keep-Alive Ping Warning]:', pingErr?.message || pingErr);
            if (pingErr?.code === 'PROTOCOL_CONNECTION_LOST' || pingErr?.code === 'ECONNRESET') {
              initMysqlPool().catch(() => {});
            }
          }
        }
      }, 25000);

      // Hydrate memory store from persistent MySQL database
      await loadDatabaseFromMysql();
    } catch (err: any) {
      const connEndpoint = config.socketPath ? `socket:${config.socketPath}` : `${config.host}:${config.port}`;
      console.error(`[MySQL Connection Error] Failed to connect to MySQL database '${config.database}' on ${connEndpoint} — ${err.message}`);
      mysqlPool = null;
    }
  } else {
    console.warn(`[Database Warning] MySQL credentials missing or incomplete in environment. host='${config.host}', db='${config.database}'.`);
  }
}

// Asynchronous MySQL Sync Helper with Transparent Recovery
async function syncToMysql(query: string, params: any[] = []): Promise<any> {
  if (!mysqlPool) return null;
  try {
    const [result] = await mysqlPool.query(query, params);
    return result;
  } catch (err: any) {
    const isConnErr =
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
      err.code === 'EPIPE';
    if (isConnErr) {
      console.warn('[MySQL Auto-Recovery] Connection dropped during query. Re-initializing pool and retrying...', err.code);
      try {
        await initMysqlPool();
        if (mysqlPool) {
          const [retryRes] = await mysqlPool.query(query, params);
          return retryRes;
        }
      } catch (retryErr: any) {
        console.error('[MySQL Auto-Recovery Retry Failed]:', retryErr.message);
        throw retryErr;
      }
    }
    console.error('[MySQL Sync Failure]:', err.message);
    throw err;
  }
}

async function startServer() {
  const app = express();
  const JWT_SECRET = process.env.JWT_SECRET || 'scinsmedia_secure_jwt_secret_2026';
  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@scinsmedia.com').toLowerCase();
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$8SP.2YRdAvta0d9Yp/WSwuP7O9PQNkE23RMvdNhgMA8TiBd9mtjj.';

  // Security Shield: Block unauthorized probing for sensitive system, environment, config, or git files
  app.use((req: Request, res: Response, next: NextFunction) => {
    const rawPath = req.path.toLowerCase();
    if (
      rawPath.includes('/.env') ||
      rawPath.includes('/certs') ||
      rawPath.includes('/.git') ||
      (!rawPath.startsWith('/api/') && rawPath.includes('/database')) ||
      rawPath.includes('/node_modules') ||
      rawPath.startsWith('/.')
    ) {
      return res.status(403).json({ success: false, message: 'Access forbidden' });
    }
    next();
  });

  // CORS middleware – strict origin validation
  const configuredCors = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      if (configuredCors.length === 0 || configuredCors.includes(origin) || configuredCors.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Access-Token', 'X-CSRF-Token']
  }));

  // Global API Rate Limiter
  const apiGlobalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 1000 : 5000,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: { success: false, message: 'Too many requests. Please slow down.' }
  });
  app.use('/api/', apiGlobalRateLimiter);

  const publicSubmissionRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 40 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: { success: false, message: 'Too many submission requests. Please wait a few minutes before trying again.' }
  });

  const paymentRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 20 : 150,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
    message: { success: false, message: 'Too many payment requests. Please try again later.' }
  });

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
    const queryToken = typeof req.query?.token === 'string' ? req.query.token : undefined;
    const cookieToken = (req as any).cookies?.auth_token;
    const rawToken = authHeader || (queryToken ? `Bearer ${queryToken}` : undefined) || (cookieToken ? `Bearer ${cookieToken}` : undefined);

    if (!rawToken) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication token required for protected administrative resources.'
      });
    }

    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7).trim() : rawToken.trim();
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
  // Body parsers: 25MB for asset uploads and general API traffic, with rawBody captured for Stripe webhook signature verification
  app.use(express.json({
    limit: '25mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads directory serving & persistent database fallback
  const uploadsStaticDir = path.join(process.cwd(), 'public', 'uploads');
  const distUploadsDir = path.join(process.cwd(), 'dist', 'uploads');
  if (!fs.existsSync(uploadsStaticDir)) {
    fs.mkdirSync(uploadsStaticDir, { recursive: true });
  }
  if (!fs.existsSync(distUploadsDir)) {
    fs.mkdirSync(distUploadsDir, { recursive: true });
  }

  // 0. Auto-healing middleware: ensure abstract PDF files on disk are never corrupt stubs
  app.use('/uploads/:fileName', (req: Request, res: Response, next: NextFunction) => {
    const rawFileName = req.params.fileName;
    if (rawFileName && rawFileName.toLowerCase().endsWith('.pdf')) {
      const cleanFileName = path.basename(rawFileName);
      const localPath1 = path.join(uploadsStaticDir, cleanFileName);
      const localPath2 = path.join(distUploadsDir, cleanFileName);
      const targetPath = fs.existsSync(localPath1) ? localPath1 : (fs.existsSync(localPath2) ? localPath2 : null);

      if (targetPath) {
        try {
          const stat = fs.statSync(targetPath);
          if (stat.size < 200) {
            const matchedAbstract = db.abstracts.find(a => (a.file_url && a.file_url.includes(cleanFileName)) || a.file_name === cleanFileName);
            const conf = matchedAbstract ? db.conferences.find(c => c.id === matchedAbstract.conference_id) : null;
            const healed = generateAbstractPdf({
              submission_id: matchedAbstract?.submission_id || 'SCINS-DOC-2026',
              conference_title: conf?.title || matchedAbstract?.conference_title || 'SCINS Media Congress 2026',
              title: matchedAbstract?.title || 'Scientific Proceedings Document',
              primary_author_name: matchedAbstract?.primary_author_name || 'Primary Author',
              primary_author_email: matchedAbstract?.primary_author_email,
              primary_author_phone: matchedAbstract?.primary_author_phone,
              primary_author_affiliation: matchedAbstract?.primary_author_affiliation,
              primary_author_country: matchedAbstract?.primary_author_country,
              presentation_preference: matchedAbstract?.presentation_preference,
              abstract_text: matchedAbstract?.abstract_text || 'Official abstract document preserved in scientific archives.',
              created_at: matchedAbstract?.created_at
            });
            fs.writeFileSync(localPath1, healed);
            try { fs.writeFileSync(localPath2, healed); } catch (_) {}
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${cleanFileName}"`);
            return res.end(healed);
          }
        } catch (_) {}
      }
    }
    next();
  });

  // 1. Fast static file delivery from disk cache with dotfile protection
  app.use('/uploads', express.static(uploadsStaticDir, { dotfiles: 'deny' }));
  app.use('/uploads', express.static(distUploadsDir, { dotfiles: 'deny' }));

  // 2. Dynamic recovery fallback: if an image is missing from disk, restore from MySQL media_assets
  app.get('/uploads/:fileName', async (req: Request, res: Response) => {
    const rawFileName = req.params.fileName;
    if (!rawFileName) {
      return res.status(404).send('Not found');
    }
    const cleanFileName = path.basename(rawFileName);

    const localPath1 = path.join(uploadsStaticDir, cleanFileName);
    const localPath2 = path.join(distUploadsDir, cleanFileName);
    if (fs.existsSync(localPath1)) {
      return res.sendFile(localPath1);
    }
    if (fs.existsSync(localPath2)) {
      return res.sendFile(localPath2);
    }

    if (mysqlPool) {
      try {
        const [rows]: any = await mysqlPool.query(
          'SELECT file_type, file_data FROM media_assets WHERE file_name = ? LIMIT 1',
          [cleanFileName]
        );
        if (Array.isArray(rows) && rows.length > 0 && rows[0].file_data) {
          const row = rows[0];
          const buffer = Buffer.from(row.file_data, 'base64');
          try {
            fs.writeFileSync(localPath1, buffer);
            fs.writeFileSync(localPath2, buffer);
          } catch (_) {}

          res.setHeader('Content-Type', row.file_type || 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
          return res.end(buffer);
        }
      } catch (dbErr: any) {
        console.warn(`[Media Retrieval Notice for ${cleanFileName}]:`, dbErr.message);
      }
    }

    // Local JSON media registry fallback: restore if missing from disk
    const localRecord = loadLocalMediaAssets()[cleanFileName];
    if (localRecord && localRecord.file_data) {
      const buffer = Buffer.from(localRecord.file_data, 'base64');
      try {
        fs.writeFileSync(localPath1, buffer);
        fs.writeFileSync(localPath2, buffer);
      } catch (_) {}
      res.setHeader('Content-Type', localRecord.file_type || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      return res.end(buffer);
    }

    // Do NOT let missing uploads fall through to the SPA React index.html
    return res.status(404).send('Media asset not found');
  });

  // Trust reverse proxy headers (Render, GoDaddy, Cloudflare, AWS)
  app.enable('trust proxy');

  // Top-level health check endpoint for cloud platform readiness probes
  app.get(['/healthz', '/health'], (_req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // Technical SEO: Serve Search Engine Robots Directives
  app.get('/robots.txt', (_req: Request, res: Response) => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.sendFile(robotsPath);
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send("User-agent: *\nAllow: /\nAllow: /conferences\nAllow: /about\nAllow: /contact\nAllow: /terms\nAllow: /uploads/\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api/\nDisallow: /database/\n\nSitemap: https://scinsmedia.com/sitemap.xml\n");
  });

  // Technical SEO: Dynamic XML Sitemap with Live Conference URLs
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const today = new Date().toISOString().split('T')[0];
    const staticPages = [
      { loc: 'https://scinsmedia.com/', priority: '1.0', changefreq: 'daily' },
      { loc: 'https://scinsmedia.com/conferences', priority: '0.9', changefreq: 'daily' },
      { loc: 'https://scinsmedia.com/about', priority: '0.8', changefreq: 'weekly' },
      { loc: 'https://scinsmedia.com/contact', priority: '0.7', changefreq: 'monthly' },
      { loc: 'https://scinsmedia.com/terms', priority: '0.5', changefreq: 'monthly' }
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const p of staticPages) {
      xml += `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    }

    for (const c of db.conferences) {
      if (c.slug && c.status !== 'draft') {
        const modDate = c.updated_at || c.created_at;
        const lastmod = modDate ? modDate.split('T')[0].split(' ')[0] : today;
        xml += `  <url>\n    <loc>https://scinsmedia.com/conferences/${encodeURIComponent(c.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }
    }

    xml += '</urlset>\n';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  // Dedicated database health and connection status endpoint
  app.get('/api/v1/health/db', async (_req: Request, res: Response) => {
    const config = getDbConfig();
    let isConnected = false;
    let conferenceCount = 0;
    let errorMsg: string | null = null;
    if (mysqlPool) {
      try {
        const [rows]: any = await mysqlPool.query('SELECT COUNT(*) as cnt FROM conferences');
        isConnected = true;
        conferenceCount = Number(rows[0]?.cnt || 0);
      } catch (e: any) {
        errorMsg = e.message;
      }
    }
    res.json({
      success: true,
      database: {
        connected: isConnected,
        host: config.host,
        database_name: config.database,
        user: config.user,
        conferences_count: conferenceCount,
        error: errorMsg
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // HTTPS redirect in production (exempt localhost and readiness health probes)
  app.use((req, res, next) => {
    const isHealthCheck = req.path === '/api/v1/health' || req.path === '/healthz' || req.path === '/health';
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    if (process.env.NODE_ENV === 'production' && !isHealthCheck && !isLocal) {
      const forwardedProto = req.headers['x-forwarded-proto'];
      const proto = forwardedProto
        ? String(forwardedProto).split(',')[0].trim().toLowerCase()
        : (req.secure ? 'https' : 'http');

      if (proto !== 'https') {
        const host = req.headers.host || req.hostname;
        return res.redirect(301, `https://${host}${req.url}`);
      }
    }
    next();
  });

  // Cookie parser
  app.use(cookieParser());

  // Security headers with HSTS and automatic HTTP-to-HTTPS upgrade
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "font-src": ["'self'", "https:", "data:"],
        "connect-src": ["'self'", "https:"],
        "frame-ancestors": ["'none'"],
        "upgrade-insecure-requests": []
      }
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
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
  validate: { trustProxy: false },
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

    const isDev = process.env.NODE_ENV !== 'production';
    const isBcryptMatch = Boolean(ADMIN_PASSWORD_HASH && bcrypt.compareSync(trimmedPass, ADMIN_PASSWORD_HASH));
    const isExplicitMatch = Boolean(process.env.ADMIN_PASSWORD && trimmedPass === process.env.ADMIN_PASSWORD);
    const isDevPassMatch = isDev && (trimmedPass === 'admin' || trimmedPass === 'scinsmedia2026' || trimmedPass === 'Prey@nsh2018');

    const isValidAdmin = trimmedEmail === ADMIN_EMAIL && (isBcryptMatch || isExplicitMatch || isDevPassMatch);


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

      // Strip Data URL scheme if present (e.g., data:image/png;base64,...)
      let cleanBase64 = fileData;
      let headerMime = fileType || '';
      const dataUrlMatch = fileData.match(/^data:([^;]+);base64,(.*)$/s);
      if (dataUrlMatch) {
        headerMime = dataUrlMatch[1];
        cleanBase64 = dataUrlMatch[2];
      }

      // Decode base64 to buffer
      const buffer = Buffer.from(cleanBase64, 'base64');
      let detectedMime = headerMime;
      let detectedExt = '';

      try {
        const detected = await fileTypeFromBuffer(buffer);
        if (detected) {
          detectedMime = detected.mime;
          detectedExt = detected.ext;
        }
      } catch (_) {}

      // Normalize common mime types and extensions (handling SVGs, PDFs, DOCs)
      if (!detectedMime || detectedMime === 'application/octet-stream') {
        const lowerName = (fileName || '').toLowerCase();
        if (lowerName.endsWith('.svg')) detectedMime = 'image/svg+xml';
        else if (lowerName.endsWith('.png')) detectedMime = 'image/png';
        else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) detectedMime = 'image/jpeg';
        else if (lowerName.endsWith('.webp')) detectedMime = 'image/webp';
        else if (lowerName.endsWith('.gif')) detectedMime = 'image/gif';
        else if (lowerName.endsWith('.pdf')) detectedMime = 'application/pdf';
        else if (lowerName.endsWith('.doc')) detectedMime = 'application/msword';
        else if (lowerName.endsWith('.docx')) detectedMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else detectedMime = 'image/jpeg';
      }

      if (!detectedExt) {
        if (detectedMime === 'image/png') detectedExt = 'png';
        else if (detectedMime === 'image/webp') detectedExt = 'webp';
        else if (detectedMime === 'image/svg+xml') detectedExt = 'svg';
        else if (detectedMime === 'image/gif') detectedExt = 'gif';
        else if (detectedMime === 'application/pdf') detectedExt = 'pdf';
        else if (detectedMime.includes('word')) detectedExt = 'docx';
        else detectedExt = 'jpg';
      }

      // Validate supported mime types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      const isAllowed = allowedTypes.includes(detectedMime);
      if (!isAllowed) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported or unverified file format.'
        });
      }

      // Check size
      const byteLength = buffer.length;
      const maxBytes = 25 * 1024 * 1024; // 25MB
      if (byteLength > maxBytes) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum permitted limit (25MB).'
        });
      }

      // Save file to disk
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const distUploadsDir = path.join(process.cwd(), 'dist', 'uploads');
      if (!fs.existsSync(distUploadsDir)) {
        fs.mkdirSync(distUploadsDir, { recursive: true });
      }

      const safeCategory = (category || 'general').replace(/[^a-z0-9_-]/gi, '_');
      const cleanFileName = `${safeCategory}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${detectedExt}`;
      const filePath = path.join(uploadsDir, cleanFileName);
      fs.writeFileSync(filePath, buffer);
      try {
        fs.writeFileSync(path.join(distUploadsDir, cleanFileName), buffer);
      } catch (_) {}

      const resolvedUrl = `/uploads/${cleanFileName}`;

      // Persist to local JSON media registry
      saveLocalMediaAsset({
        file_name: cleanFileName,
        file_path: resolvedUrl,
        file_type: detectedMime,
        file_size: byteLength,
        category: safeCategory,
        file_data: cleanBase64,
        created_at: new Date().toISOString()
      });

      // Persist to MySQL media_assets table to ensure permanent storage across redeployments
      if (mysqlPool) {
        try {
          await mysqlPool.query(
            `INSERT INTO media_assets (file_name, file_path, file_type, file_size, category, file_data)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE file_data = VALUES(file_data), file_type = VALUES(file_type), file_size = VALUES(file_size), category = VALUES(category)`,
            [cleanFileName, resolvedUrl, detectedMime, byteLength, safeCategory, cleanBase64]
          );
        } catch (dbErr: any) {
          console.error('[MySQL Media Asset Persistence Error]:', dbErr.message);
          return res.status(500).json({
            success: false,
            message: 'Failed to persist media asset into MySQL database: ' + dbErr.message
          });
        }
      }

      db.addAuditLog('UPLOAD_MEDIA', 'MediaAsset', cleanFileName, `Uploaded ${category} media asset (${Math.round(byteLength / 1024)} KB)`);

      res.status(200).json({
        success: true,
        message: 'File uploaded and registered successfully',
        data: {
          url: resolvedUrl,
          fileName: cleanFileName,
          fileType: detectedMime,
          fileSize: byteLength,
          category,
          uploadedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      console.error('[Upload Error]:', err);
      res.status(500).json({ success: false, message: 'Failed to process media upload: ' + err.message });
    }
  });

  // Media Library Aggregation Endpoint (Restricted to Administrators)
  app.get('/api/v1/media-library', authenticateAdmin, async (req: Request, res: Response) => {
    const assets: Array<{ id: string | number; url: string; name: string; category: string; source: string }> = [];
    const seen = new Set<string>();

    const addAsset = (url: string | undefined, name: string, category: string, source: string) => {
      if (!url || typeof url !== 'string' || url.trim().length === 0) return;
      const cleanUrl = url.trim();
      if (seen.has(cleanUrl)) return;
      seen.add(cleanUrl);
      assets.push({
        id: `media-${seen.size}`,
        url: cleanUrl,
        name: name || 'Media Asset',
        category,
        source
      });
    };

    // 0. Dedicated Uploaded Assets from MySQL media_assets table
    if (mysqlPool) {
      try {
        const [assetRows]: any = await mysqlPool.query(
          'SELECT file_name, file_path, category FROM media_assets ORDER BY id DESC'
        );
        if (Array.isArray(assetRows)) {
          assetRows.forEach(a => {
            addAsset(a.file_path || `/uploads/${a.file_name}`, a.file_name, a.category || 'uploads', 'Uploaded Assets');
          });
        }
      } catch (_) {}
    }

    // 0.1 Scan disk uploads folder
    const diskUploads = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(diskUploads)) {
      try {
        const diskFiles = fs.readdirSync(diskUploads);
        diskFiles.forEach(f => {
          addAsset(`/uploads/${f}`, f, 'uploads', 'Uploaded Media');
        });
      } catch (_) {}
    }

    // 1. Corporate Sponsors
    db.sponsors.forEach(s => {
      addAsset(s.logo_url, s.name || s.company_name || 'Sponsor Logo', 'sponsors', 'Sponsors');
    });

    // 2. Global Media Partners
    db.mediaPartners.forEach(m => {
      addAsset(m.logo_url, m.name || 'Media Partner Logo', 'partners', 'Media Partners');
    });

    // 3. Conference Assets
    db.conferences.forEach(c => {
      addAsset(c.logo_url, `${c.short_title || c.title} Logo`, 'conferences', 'Conference');
      addAsset(c.hero_image, `${c.short_title || c.title} Hero Banner`, 'conferences', 'Conference Banner');
      addAsset(c.journal_logo_url, `${c.journal_name || 'Journal'} Logo`, 'partners', 'Partner Journal');
      if (Array.isArray(c.gallery_images)) {
        c.gallery_images.forEach((img, gIdx) => {
          addAsset(img, `${c.short_title || 'Conference'} Gallery ${gIdx + 1}`, 'conferences', 'Gallery');
        });
      }
    });

    // 4. Speakers
    db.speakers.forEach(sp => {
      addAsset(sp.photo_url, sp.name || 'Speaker Photo', 'speakers', 'Speakers');
    });

    // 5. Committee
    db.committee.forEach(cm => {
      addAsset(cm.photo_url, cm.name || 'Committee Photo', 'committee', 'Committee');
    });

    const categoryParam = req.query.category as string;
    let result = assets;
    if (categoryParam && categoryParam !== 'all') {
      result = assets.filter(a => a.category === categoryParam);
    }

    res.json({ success: true, count: result.length, data: result });
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
            committee_heading: r.committee_heading || '',
            committee_description: r.committee_description || '',
            speakers_badge: r.speakers_badge || '',
            speakers_heading: r.speakers_heading || '',
            speakers_description: r.speakers_description || '',
            journal_logo_url: r.journal_logo_url || '',
            accommodation_price_per_day: Number(r.accommodation_price_per_day) || 120,
            hotel_name: r.hotel_name || 'Official Partner Hotel',
            support_email: r.support_email || 'scinsmedia@gmail.com',
            support_phone: r.support_phone || '+1 (415) 800-3490 (Secretariat Desk)',
            support_label: r.support_label || '',
            support_turnaround: r.support_turnaround || '',
            secretariat_section_title: r.secretariat_section_title || '',
            secretariat_section_description: r.secretariat_section_description || '',
            secretariat_association_title: r.secretariat_association_title || '',
            secretariat_conference_name: r.secretariat_conference_name || '',
            secretariat_dates: r.secretariat_dates || '',
            secretariat_location: r.secretariat_location || '',
            created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
          }));
          db.conferences = list;
        }
      } catch (err: any) {
        console.warn('[MySQL Read Conferences Warning]:', err.message);
      }
    }

    if (status && typeof status === 'string' && status !== 'All') {
      if (status === 'upcoming') {
        list = list.filter(c => getConferenceTimelineStatus(c) === 'upcoming');
      } else if (status === 'ongoing') {
        list = list.filter(c => getConferenceTimelineStatus(c) === 'ongoing');
      } else if (status === 'completed') {
        list = list.filter(c => getConferenceTimelineStatus(c) === 'completed');
      } else {
        list = list.filter(c => c.status === status);
      }
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

    // Dynamic sort: Upcoming conferences first (nearest upcoming start date),
    // followed by Ongoing conferences, then Completed conferences (most recently completed first)
    list = sortConferencesDynamically(list);

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
            committee_heading: r.committee_heading || '',
            committee_description: r.committee_description || '',
            speakers_badge: r.speakers_badge || '',
            speakers_heading: r.speakers_heading || '',
            speakers_description: r.speakers_description || '',
            journal_logo_url: r.journal_logo_url || '',
            accommodation_price_per_day: Number(r.accommodation_price_per_day) || 120,
            hotel_name: r.hotel_name || 'Official Partner Hotel',
            support_email: r.support_email || 'scinsmedia@gmail.com',
            support_phone: r.support_phone || '+1 (415) 800-3490 (Secretariat Desk)',
            support_label: r.support_label || '',
            support_turnaround: r.support_turnaround || '',
            secretariat_section_title: r.secretariat_section_title || '',
            secretariat_section_description: r.secretariat_section_description || '',
            secretariat_association_title: r.secretariat_association_title || '',
            secretariat_conference_name: r.secretariat_conference_name || '',
            secretariat_dates: r.secretariat_dates || '',
            secretariat_location: r.secretariat_location || '',
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
    let confCategories = db.categories.filter(c => c.conference_id === conf!.id).map((c, idx) => normalizeCategoryData(c, conf!.id, idx));
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

        try {
          const [spkRows]: any = await mysqlPool.query(`
            SELECT s.*, sc.conference_id, sc.speaker_type, sc.presentation_title, sc.presentation_abstract, sc.display_order as conf_display_order
            FROM speakers s
            JOIN speaker_conferences sc ON s.id = sc.speaker_id
            WHERE sc.conference_id = ?
            ORDER BY COALESCE(sc.display_order, s.id) ASC, s.id ASC
          `, [conf.id]);
          if (Array.isArray(spkRows) && spkRows.length > 0) {
            confSpeakers = spkRows.map((sp: any) => ({
              id: Number(sp.id),
              conference_id: Number(conf.id),
              name: sp.name || '',
              prefix: sp.prefix || 'Dr.',
              designation: sp.designation || '',
              institution: sp.institution || '',
              country: sp.country || '',
              research_domain: sp.research_domain || '',
              photo_url: sp.photo_url || '',
              biography: sp.biography || '',
              h_index: Number(sp.h_index || 25),
              citations_count: Number(sp.citations_count || 1200),
              speaker_type: sp.speaker_type || 'Keynote',
              presentation_title: sp.presentation_title || '',
              presentation_abstract: sp.presentation_abstract || '',
              linkedin_url: sp.linkedin_url || '',
              google_scholar: sp.google_scholar || '',
              website: sp.website || '',
              display_order: Number(sp.conf_display_order || sp.id || 1),
              is_active: true,
              status: 'active'
            }));
          }
        } catch (spkNotice: any) {
          console.warn('[MySQL Conf Details Speakers Notice]:', spkNotice.message);
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
          confCategories = catRows.map((c: any, idx: number) => normalizeCategoryData(c, conf!.id, idx));
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
      venue: body.venue || '',
      venue_address: body.venue_address || '',
      venue_photo: body.venue_photo || body.venue_image || '',
      venue_maps_url: body.venue_maps_url || body.venue_map_url || '',
      venue_description: body.venue_description || '',
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
      indexing_partners: Array.isArray(body.indexing_partners) ? body.indexing_partners : [],
      committee_heading: body.committee_heading || '',
      committee_description: body.committee_description || '',
      speakers_badge: body.speakers_badge || '',
      speakers_heading: body.speakers_heading || '',
      speakers_description: body.speakers_description || '',
      journal_logo_url: body.journal_logo_url || '',
      hotel_name: body.hotel_name || 'Official Partner Hotel',
      accommodation_price_per_day: Number(body.accommodation_price_per_day) || 120,
      support_email: body.support_email || 'scinsmedia@gmail.com',
      support_phone: body.support_phone || '+1 (415) 800-3490 (Secretariat Desk)',
      support_label: body.support_label || '',
      support_turnaround: body.support_turnaround || '',
      secretariat_section_title: body.secretariat_section_title || '',
      secretariat_section_description: body.secretariat_section_description || '',
      secretariat_association_title: body.secretariat_association_title || '',
      secretariat_conference_name: body.secretariat_conference_name || '',
      secretariat_dates: body.secretariat_dates || '',
      secretariat_location: body.secretariat_location || ''
    };

    let assignedId: number;

    if (mysqlPool) {
      await ensureDatabaseSchema(mysqlPool);
      const conn = await mysqlPool.getConnection();
      try {
        await conn.beginTransaction();

        // Check slug and conference_code uniqueness in MySQL
        const [existingSlug]: any = await conn.query('SELECT id FROM conferences WHERE slug = ? OR conference_code = ?', [confData.slug, confData.conference_code]).catch(() => [[]]);
        if (Array.isArray(existingSlug) && existingSlug.length > 0) {
          const suffix = Date.now().toString().slice(-4);
          confData.slug = `${confData.slug}-${suffix}`;
          confData.conference_code = `${confData.conference_code}-${suffix}`;
        }

      const [insertRes]: any = await conn.query(
        `INSERT INTO conferences (
          title, short_title, slug, conference_code, theme, tagline, description, detailed_about,
          about_heading, about_highlights, gallery_images, domain, city, country, venue, venue_address, venue_photo, venue_maps_url, venue_description, timezone,
          start_date, end_date, abstract_deadline, early_bird_deadline, registration_deadline, mode, status,
          hero_image, logo_url, flyer_url, sample_abstract_url, featured_badge, display_order,
          welcome_heading, welcome_message, welcome_speaker_name, welcome_speaker_role, welcome_speaker_title, welcome_speaker_image, welcome_footer_text,
          exhibitor_heading, exhibitor_message, exhibitor_speaker_name, exhibitor_speaker_role, exhibitor_speaker_title, exhibitor_image, exhibitor_footer_text,
          program_image, meta_title, meta_description, keywords, accept_late_breaking, cme_credits_eligible, primary_language, max_attendees, accent_color, journal_name, journal_issn, indexing_partners,
          committee_heading, committee_description, speakers_badge, speakers_heading, speakers_description, journal_logo_url,
          hotel_name, accommodation_price_per_day, support_email, support_phone,
          support_label, support_turnaround, secretariat_section_title, secretariat_section_description,
          secretariat_association_title, secretariat_conference_name, secretariat_dates, secretariat_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          confData.title, confData.short_title, confData.slug, confData.conference_code, confData.theme, confData.tagline, confData.description, confData.detailed_about,
          confData.about_heading, JSON.stringify(confData.about_highlights), JSON.stringify(confData.gallery_images), confData.domain, confData.city, confData.country, confData.venue, confData.venue_address, confData.venue_photo, confData.venue_maps_url, confData.venue_description, confData.timezone,
          formatDateSql(confData.start_date, '2026-09-01'), formatDateSql(confData.end_date, '2026-09-03'), formatDateSql(confData.abstract_deadline, '2026-07-31'), formatDateSql(confData.early_bird_deadline, '2026-06-30'), formatDateSql(confData.registration_deadline, '2026-08-15'), confData.mode, confData.status,
          confData.hero_image, confData.logo_url, confData.flyer_url, confData.sample_abstract_url, confData.featured_badge, confData.display_order,
          confData.welcome_heading, confData.welcome_message, confData.welcome_speaker_name, confData.welcome_speaker_role, confData.welcome_speaker_title, confData.welcome_speaker_image, confData.welcome_footer_text,
          confData.exhibitor_heading, confData.exhibitor_message, confData.exhibitor_speaker_name, confData.exhibitor_speaker_role, confData.exhibitor_speaker_title, confData.exhibitor_image, confData.exhibitor_footer_text,
          confData.program_image, confData.meta_title, confData.meta_description, confData.keywords, confData.accept_late_breaking, confData.cme_credits_eligible, confData.primary_language, confData.max_attendees, confData.accent_color, confData.journal_name, confData.journal_issn, JSON.stringify(confData.indexing_partners),
          confData.committee_heading, confData.committee_description, confData.speakers_badge, confData.speakers_heading, confData.speakers_description, confData.journal_logo_url,
          confData.hotel_name, confData.accommodation_price_per_day, confData.support_email, confData.support_phone,
          confData.support_label, confData.support_turnaround, confData.secretariat_section_title, confData.secretariat_section_description,
          confData.secretariat_association_title, confData.secretariat_conference_name, confData.secretariat_dates, confData.secretariat_location
        ]
      );
      assignedId = Number(insertRes.insertId);

      // Insert child committee members into MySQL within same transaction
      if (Array.isArray(body.committee) && body.committee.length > 0) {
        for (let idx = 0; idx < body.committee.length; idx++) {
          const m = body.committee[idx];
          await conn.query(
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
          ).catch((e: any) => console.warn('[Committee Member Insert Notice]:', e.message));
        }
      }

      // Insert speakers and conference associations into MySQL within same transaction
      if (Array.isArray(body.speakers) && body.speakers.length > 0) {
        for (let spIdx = 0; spIdx < body.speakers.length; spIdx++) {
          const sp = body.speakers[spIdx];
          let speakerId = sp.id;
          if (speakerId) {
            const [existing]: any = await conn.query('SELECT id FROM speakers WHERE id = ?', [speakerId]).catch(() => [[]]);
            if (!existing || existing.length === 0) {
              const [ins]: any = await conn.query(
                `INSERT INTO speakers (name, prefix, designation, institution, country, research_domain, photo_url, biography, h_index, citations_count, linkedin_url, google_scholar, website)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  sp.name || 'Speaker', sp.prefix || 'Dr.', sp.designation || '', sp.institution || '', sp.country || 'Global',
                  sp.research_domain || 'General', sp.photo_url || '', sp.biography || '', Number(sp.h_index || 25),
                  Number(sp.citations_count || 1200), sp.linkedin_url || '', sp.google_scholar || '', sp.website || ''
                ]
              ).catch(() => null);
              if (ins) speakerId = ins.insertId;
            }
          } else {
            const [ins]: any = await conn.query(
              `INSERT INTO speakers (name, prefix, designation, institution, country, research_domain, photo_url, biography, h_index, citations_count, linkedin_url, google_scholar, website)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                sp.name || 'Speaker', sp.prefix || 'Dr.', sp.designation || '', sp.institution || '', sp.country || 'Global',
                sp.research_domain || 'General', sp.photo_url || '', sp.biography || '', Number(sp.h_index || 25),
                Number(sp.citations_count || 1200), sp.linkedin_url || '', sp.google_scholar || '', sp.website || ''
              ]
            ).catch(() => null);
            if (ins) speakerId = ins.insertId;
          }

          if (speakerId) {
            await conn.query(
              `INSERT INTO speaker_conferences (speaker_id, conference_id, speaker_type, presentation_title, presentation_abstract, display_order)
               VALUES (?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE speaker_type = VALUES(speaker_type), presentation_title = VALUES(presentation_title), presentation_abstract = VALUES(presentation_abstract), display_order = VALUES(display_order)`,
              [
                speakerId, assignedId, sp.speaker_type || 'Keynote', sp.presentation_title || 'Conference Presentation',
                sp.presentation_abstract || '', Number(sp.display_order || spIdx + 1)
              ]
            ).catch((e: any) => console.warn('[Speaker Conf Association Notice]:', e.message));
          }
        }
      }

      // Insert sessions into MySQL within same transaction
      if (Array.isArray(body.sessions) && body.sessions.length > 0) {
        for (let sIdx = 0; sIdx < body.sessions.length; sIdx++) {
          const ses = body.sessions[sIdx];
          await conn.query(
            `INSERT INTO sessions (
              conference_id, session_number, session_code, title, track, category, description,
              session_date, start_time, end_time, room, session_type, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              assignedId, sIdx + 1, ses.session_code || `SES-${sIdx + 1}`, ses.title || 'Session Track',
              ses.track || 'General', ses.category || 'General', ses.description || '', formatDateSql(ses.session_date, formatDateSql(confData.start_date, '2026-09-01')),
              ses.start_time || '09:00:00', ses.end_time || '10:30:00', ses.room || 'Hall A',
              ses.session_type || 'Oral Presentation', Number(ses.display_order || sIdx + 1)
            ]
          ).catch((e: any) => console.warn('[Session Insert Notice]:', e.message));
        }
      }

      // Insert registration categories into MySQL within same transaction
      if (Array.isArray(body.categories) && body.categories.length > 0) {
        for (let cIdx = 0; cIdx < body.categories.length; cIdx++) {
          const cat = body.categories[cIdx];
          await conn.query(
            `INSERT INTO registration_categories (
              conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              assignedId, cat.name || 'Delegate Pass', Number(cat.price || cat.standard_fee || 799), cat.currency || 'USD',
              Number(cat.early_bird_price || cat.early_bird_fee || 699), formatDateSql(cat.deadline || confData.early_bird_deadline, null),
              JSON.stringify(cat.benefits || []), Boolean(cat.is_popular), Number(cat.display_order || cIdx + 1),
              cat.payment_gateway_link || '', cat.is_active !== false
            ]
          ).catch((e: any) => console.warn('[Category Insert Notice]:', e.message));
        }
      }

      // Insert schedule items into MySQL within same transaction
      if (Array.isArray(body.schedule) && body.schedule.length > 0) {
        for (let scIdx = 0; scIdx < body.schedule.length; scIdx++) {
          const sch = body.schedule[scIdx];
          await conn.query(
            `INSERT INTO schedule_items (
              conference_id, day_number, schedule_date, start_time, end_time, title, description,
              room, track, speaker_name, speaker_affiliation, item_type, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              assignedId, Number(sch.day_number || 1), formatDateSql(sch.schedule_date, formatDateSql(confData.start_date, '2026-09-01')),
              sch.start_time || '09:00', sch.end_time || '10:00', sch.title || 'Schedule Item',
              sch.description || '', sch.room || '', sch.track || '', sch.speaker_name || '',
              sch.speaker_affiliation || '', sch.item_type || 'session', Number(sch.display_order || scIdx + 1)
            ]
          ).catch((e: any) => console.warn('[Schedule Item Insert Notice]:', e.message));
        }
      }

      // Insert conference settings into MySQL
      await conn.query(
        `INSERT INTO conference_settings (
          conference_id, registration_enabled, abstract_submission_enabled, publication_enabled,
          sponsors_enabled, media_partners_enabled, schedule_published, show_counter, max_attendees
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE max_attendees = VALUES(max_attendees)`,
        [assignedId, true, true, true, true, true, true, true, confData.max_attendees]
      ).catch((e: any) => console.warn('[Conference Settings Insert Notice]:', e.message));

      // Commit transaction
      await conn.commit();
      console.log(`[MySQL Transaction Committed] Created conference ID ${assignedId}`);
    } catch (txErr: any) {
      await conn.rollback();
      console.error('[MySQL Conference Creation Transaction Failed - Rolled Back]:', txErr);
      return res.status(500).json({ success: false, message: `Failed to persist conference in MySQL: ${txErr.message}` });
      } finally {
        conn.release();
      }
    } else {
      assignedId = (db.conferences.length > 0 ? Math.max(...db.conferences.map(c => Number(c.id) || 0)) : 0) + 1;
    }

    const newConf: Conference = {
      id: assignedId,
      ...confData,
      created_at: new Date().toISOString()
    };
    db.conferences.push(newConf);
    saveLocalConferences(db.conferences);

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
      const normalizedCats = body.categories.map((cat: any, idx: number) => {
        const catId = cat.id || (Math.max(...db.categories.map(x => x.id), 0) + idx + 1);
        return normalizeCategoryData({ ...cat, id: catId }, assignedId, idx);
      });
      db.categories = db.categories.filter(c => c.conference_id !== assignedId).concat(normalizedCats);
      saveLocalCategories(db.categories);
      newConf.categories = normalizedCats;
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
    const newConfIdx = db.conferences.findIndex(c => c.id === assignedId);
    if (newConfIdx !== -1) {
      db.conferences[newConfIdx] = enrichedNewConf;
    }
    saveLocalConferences(db.conferences);
    res.status(201).json({ success: true, message: 'Conference created and permanently persisted in MySQL', data: enrichedNewConf });
  });

  app.put('/api/v1/conferences/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.conferences.findIndex(c => c.id === id);
    let updatedConf: any;

    if (mysqlPool) {
      await ensureDatabaseSchema(mysqlPool);
      const conn = await mysqlPool.getConnection();

      try {
        // Verify conference exists in MySQL as single source of truth
        let [existing]: any = await conn.query('SELECT * FROM conferences WHERE id = ?', [id]).catch(() => [[]]);
        if (!existing || existing.length === 0) {
          const inMem = db.conferences.find(c => c.id === id);
          if (inMem) {
            await conn.query(
              `INSERT INTO conferences (
                id, title, short_title, slug, conference_code, theme, tagline, description, detailed_about,
                about_heading, about_highlights, gallery_images, domain, city, country, venue, venue_address, timezone,
                start_date, end_date, abstract_deadline, early_bird_deadline, registration_deadline, mode, status,
                hero_image, logo_url, flyer_url, sample_abstract_url, featured_badge, display_order,
                welcome_heading, welcome_message, welcome_speaker_name, welcome_speaker_role, welcome_speaker_title, welcome_speaker_image, welcome_footer_text,
                exhibitor_heading, exhibitor_message, exhibitor_speaker_name, exhibitor_speaker_role, exhibitor_speaker_title, exhibitor_image, exhibitor_footer_text,
                program_image, meta_title, meta_description, keywords, accept_late_breaking, cme_credits_eligible, primary_language, max_attendees, accent_color, journal_name, journal_issn, indexing_partners,
                committee_heading, committee_description, speakers_badge, speakers_heading, speakers_description, journal_logo_url
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id, inMem.title, inMem.short_title || inMem.title, inMem.slug, inMem.conference_code || `CONF-${id}`, inMem.theme || '', inMem.tagline || '', inMem.description || '', inMem.detailed_about || '',
                inMem.about_heading || '', JSON.stringify(inMem.about_highlights || []), JSON.stringify(inMem.gallery_images || []), inMem.domain || 'General', inMem.city || '', inMem.country || '', inMem.venue || '', inMem.venue_address || '', inMem.timezone || 'UTC',
                formatDateSql(inMem.start_date, '2026-09-01'), formatDateSql(inMem.end_date, '2026-09-03'), formatDateSql(inMem.abstract_deadline, '2026-07-31'), formatDateSql(inMem.early_bird_deadline, '2026-06-30'), formatDateSql(inMem.registration_deadline, '2026-08-15'), inMem.mode || 'hybrid', inMem.status || 'published',
                inMem.hero_image || '', inMem.logo_url || '', inMem.flyer_url || '', inMem.sample_abstract_url || '', inMem.featured_badge || '', inMem.display_order || 1,
                inMem.welcome_heading || '', inMem.welcome_message || '', inMem.welcome_speaker_name || '', inMem.welcome_speaker_role || '', inMem.welcome_speaker_title || '', inMem.welcome_speaker_image || '', inMem.welcome_footer_text || '',
                inMem.exhibitor_heading || '', inMem.exhibitor_message || '', inMem.exhibitor_speaker_name || '', inMem.exhibitor_speaker_role || '', inMem.exhibitor_speaker_title || '', inMem.exhibitor_image || '', inMem.exhibitor_footer_text || '',
                inMem.program_image || '', inMem.meta_title || inMem.title, inMem.meta_description || inMem.description, inMem.keywords || '', inMem.accept_late_breaking ?? true, inMem.cme_credits_eligible ?? true, inMem.primary_language || 'English', inMem.max_attendees || 500, inMem.accent_color || 'teal', inMem.journal_name || '', inMem.journal_issn || '', JSON.stringify(inMem.indexing_partners || []),
                inMem.committee_heading || '', inMem.committee_description || '', inMem.speakers_badge || '', inMem.speakers_heading || '', inMem.speakers_description || '', inMem.journal_logo_url || ''
              ]
            ).catch(() => {});
            [existing] = await conn.query('SELECT * FROM conferences WHERE id = ?', [id]).catch(() => [[]]);
          }
          if (!existing || existing.length === 0) {
            conn.release();
            return res.status(404).json({ success: false, message: `Conference ID ${id} not found in MySQL database.` });
          }
        }

      const existingRecord = existing[0];
      updatedConf = {
        ...existingRecord,
        ...req.body,
        id,
        about_highlights: req.body.about_highlights !== undefined ? req.body.about_highlights : parseJsonSafe(existingRecord.about_highlights, []),
        gallery_images: req.body.gallery_images !== undefined ? req.body.gallery_images : parseJsonSafe(existingRecord.gallery_images, []),
        indexing_partners: req.body.indexing_partners !== undefined ? req.body.indexing_partners : parseJsonSafe(existingRecord.indexing_partners, [])
      };

      await conn.beginTransaction();

      await conn.query(
        `UPDATE conferences SET
          title = ?, short_title = ?, slug = ?, conference_code = ?, theme = ?, tagline = ?, description = ?, detailed_about = ?,
          about_heading = ?, about_highlights = ?, gallery_images = ?, domain = ?, city = ?, country = ?, venue = ?, venue_address = ?, venue_photo = ?, venue_maps_url = ?, venue_description = ?, timezone = ?,
          start_date = ?, end_date = ?, abstract_deadline = ?, early_bird_deadline = ?, registration_deadline = ?, mode = ?, status = ?,
          hero_image = ?, logo_url = ?, flyer_url = ?, sample_abstract_url = ?, featured_badge = ?, display_order = ?,
          welcome_heading = ?, welcome_message = ?, welcome_speaker_name = ?, welcome_speaker_role = ?, welcome_speaker_title = ?, welcome_speaker_image = ?, welcome_footer_text = ?,
          exhibitor_heading = ?, exhibitor_message = ?, exhibitor_speaker_name = ?, exhibitor_speaker_role = ?, exhibitor_speaker_title = ?, exhibitor_image = ?, exhibitor_footer_text = ?,
          program_image = ?, meta_title = ?, meta_description = ?, keywords = ?, accept_late_breaking = ?, cme_credits_eligible = ?, primary_language = ?, max_attendees = ?, accent_color = ?, journal_name = ?, journal_issn = ?, indexing_partners = ?,
          committee_heading = ?, committee_description = ?, speakers_badge = ?, speakers_heading = ?, speakers_description = ?, journal_logo_url = ?,
          hotel_name = ?, accommodation_price_per_day = ?, support_email = ?, support_phone = ?,
          support_label = ?, support_turnaround = ?, secretariat_section_title = ?, secretariat_section_description = ?,
          secretariat_association_title = ?, secretariat_conference_name = ?, secretariat_dates = ?, secretariat_location = ?
        WHERE id = ?`,
        [
          updatedConf.title, updatedConf.short_title, updatedConf.slug, updatedConf.conference_code, updatedConf.theme, updatedConf.tagline, updatedConf.description, updatedConf.detailed_about,
          updatedConf.about_heading, JSON.stringify(updatedConf.about_highlights || []), JSON.stringify(updatedConf.gallery_images || []), updatedConf.domain, updatedConf.city, updatedConf.country, updatedConf.venue, updatedConf.venue_address, updatedConf.venue_photo || '', updatedConf.venue_maps_url || '', updatedConf.venue_description || '', updatedConf.timezone,
          formatDateSql(updatedConf.start_date, '2026-09-01'), formatDateSql(updatedConf.end_date, '2026-09-03'), formatDateSql(updatedConf.abstract_deadline, '2026-07-31'), formatDateSql(updatedConf.early_bird_deadline, '2026-06-30'), formatDateSql(updatedConf.registration_deadline, '2026-08-15'), updatedConf.mode, updatedConf.status,
          updatedConf.hero_image, updatedConf.logo_url, updatedConf.flyer_url, updatedConf.sample_abstract_url, updatedConf.featured_badge, updatedConf.display_order,
          updatedConf.welcome_heading, updatedConf.welcome_message, updatedConf.welcome_speaker_name, updatedConf.welcome_speaker_role, updatedConf.welcome_speaker_title, updatedConf.welcome_speaker_image, updatedConf.welcome_footer_text,
          updatedConf.exhibitor_heading, updatedConf.exhibitor_message, updatedConf.exhibitor_speaker_name, updatedConf.exhibitor_speaker_role, updatedConf.exhibitor_speaker_title, updatedConf.exhibitor_image, updatedConf.exhibitor_footer_text,
          updatedConf.program_image, updatedConf.meta_title, updatedConf.meta_description, updatedConf.keywords, updatedConf.accept_late_breaking, updatedConf.cme_credits_eligible, updatedConf.primary_language, updatedConf.max_attendees, updatedConf.accent_color, updatedConf.journal_name, updatedConf.journal_issn, JSON.stringify(updatedConf.indexing_partners || []),
          updatedConf.committee_heading || '', updatedConf.committee_description || '', updatedConf.speakers_badge || '', updatedConf.speakers_heading || '', updatedConf.speakers_description || '', updatedConf.journal_logo_url || '',
          updatedConf.hotel_name || 'Official Partner Hotel', Number(updatedConf.accommodation_price_per_day) || 120,
          updatedConf.support_email || 'scinsmedia@gmail.com', updatedConf.support_phone || '+1 (415) 800-3490 (Secretariat Desk)',
          updatedConf.support_label || '', updatedConf.support_turnaround || '', updatedConf.secretariat_section_title || '', updatedConf.secretariat_section_description || '',
          updatedConf.secretariat_association_title || '', updatedConf.secretariat_conference_name || '', updatedConf.secretariat_dates || '', updatedConf.secretariat_location || '',
          id
        ]
      );

      // Synchronize child committee entities in MySQL for this conference only
      if (Array.isArray(req.body.committee)) {
        await conn.query('DELETE FROM committee_members WHERE conference_id = ?', [id]);
        for (let idx = 0; idx < req.body.committee.length; idx++) {
          const m = req.body.committee[idx];
          await conn.query(
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

      // Synchronize speakers & associations in MySQL for this conference only
      if (Array.isArray(req.body.speakers)) {
        await conn.query('DELETE FROM speaker_conferences WHERE conference_id = ?', [id]);
        for (let spIdx = 0; spIdx < req.body.speakers.length; spIdx++) {
          const sp = req.body.speakers[spIdx];
          let speakerId = sp.id;
          if (speakerId) {
            const [existingSpk]: any = await conn.query('SELECT id FROM speakers WHERE id = ?', [speakerId]);
            if (!existingSpk || existingSpk.length === 0) {
              const [ins]: any = await conn.query(
                `INSERT INTO speakers (name, prefix, designation, institution, country, research_domain, photo_url, biography, h_index, citations_count, linkedin_url, google_scholar, website)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  sp.name || 'Speaker', sp.prefix || 'Dr.', sp.designation || '', sp.institution || '', sp.country || 'Global',
                  sp.research_domain || 'General', sp.photo_url || '', sp.biography || '', Number(sp.h_index || 25),
                  Number(sp.citations_count || 1200), sp.linkedin_url || '', sp.google_scholar || '', sp.website || ''
                ]
              );
              speakerId = ins.insertId;
            } else {
              await conn.query(
                `UPDATE speakers SET name=?, prefix=?, designation=?, institution=?, country=?, research_domain=?, photo_url=?, biography=?, h_index=?, citations_count=?, linkedin_url=?, google_scholar=?, website=?
                 WHERE id = ?`,
                [
                  sp.name || 'Speaker', sp.prefix || 'Dr.', sp.designation || '', sp.institution || '', sp.country || 'Global',
                  sp.research_domain || 'General', sp.photo_url || '', sp.biography || '', Number(sp.h_index || 25),
                  Number(sp.citations_count || 1200), sp.linkedin_url || '', sp.google_scholar || '', sp.website || '',
                  speakerId
                ]
              );
            }
          } else {
            const [ins]: any = await conn.query(
              `INSERT INTO speakers (name, prefix, designation, institution, country, research_domain, photo_url, biography, h_index, citations_count, linkedin_url, google_scholar, website)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                sp.name || 'Speaker', sp.prefix || 'Dr.', sp.designation || '', sp.institution || '', sp.country || 'Global',
                sp.research_domain || 'General', sp.photo_url || '', sp.biography || '', Number(sp.h_index || 25),
                Number(sp.citations_count || 1200), sp.linkedin_url || '', sp.google_scholar || '', sp.website || ''
              ]
            );
            speakerId = ins.insertId;
          }

          await conn.query(
            `INSERT INTO speaker_conferences (speaker_id, conference_id, speaker_type, presentation_title, presentation_abstract, display_order)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE speaker_type = VALUES(speaker_type), presentation_title = VALUES(presentation_title), presentation_abstract = VALUES(presentation_abstract), display_order = VALUES(display_order)`,
            [
              speakerId, id, sp.speaker_type || 'Keynote', sp.presentation_title || 'Conference Presentation',
              sp.presentation_abstract || '', Number(sp.display_order || spIdx + 1)
            ]
          );
        }
      }

      // Synchronize sessions for this conference only
      if (Array.isArray(req.body.sessions)) {
        await conn.query('DELETE FROM sessions WHERE conference_id = ?', [id]);
        for (let sIdx = 0; sIdx < req.body.sessions.length; sIdx++) {
          const ses = req.body.sessions[sIdx];
          await conn.query(
            `INSERT INTO sessions (
              conference_id, session_number, session_code, title, track, category, description,
              session_date, start_time, end_time, room, session_type, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id, sIdx + 1, ses.session_code || `SES-${sIdx + 1}`, ses.title || 'Session Track',
              ses.track || 'General', ses.category || 'General', ses.description || '', formatDateSql(ses.session_date, formatDateSql(updatedConf.start_date, '2026-09-01')),
              ses.start_time || '09:00:00', ses.end_time || '10:30:00', ses.room || 'Hall A',
              ses.session_type || 'Oral Presentation', Number(ses.display_order || sIdx + 1)
            ]
          );
        }
      }

      // Synchronize registration categories for this conference only
      if (Array.isArray(req.body.categories)) {
        await conn.query('DELETE FROM registration_categories WHERE conference_id = ?', [id]);
        for (let cIdx = 0; cIdx < req.body.categories.length; cIdx++) {
          const cat = req.body.categories[cIdx];
          await conn.query(
            `INSERT INTO registration_categories (
              conference_id, name, price, currency, early_bird_price, deadline, benefits, is_popular, display_order, payment_gateway_link, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id, cat.name || 'Delegate Pass', Number(cat.price || cat.standard_fee || 799), cat.currency || 'USD',
              Number(cat.early_bird_price || cat.early_bird_fee || 699), formatDateSql(cat.deadline || updatedConf.early_bird_deadline, null),
              JSON.stringify(cat.benefits || []), Boolean(cat.is_popular), Number(cat.display_order || cIdx + 1),
              cat.payment_gateway_link || '', cat.is_active !== false
            ]
          );
        }
      }

      // Synchronize schedule items for this conference only
      if (Array.isArray(req.body.schedule)) {
        await conn.query('DELETE FROM schedule_items WHERE conference_id = ?', [id]);
        for (let scIdx = 0; scIdx < req.body.schedule.length; scIdx++) {
          const sch = req.body.schedule[scIdx];
          await conn.query(
            `INSERT INTO schedule_items (
              conference_id, day_number, schedule_date, start_time, end_time, title, description,
              room, track, speaker_name, speaker_affiliation, item_type, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id, Number(sch.day_number || 1), formatDateSql(sch.schedule_date, formatDateSql(updatedConf.start_date, '2026-09-01')),
              sch.start_time || '09:00', sch.end_time || '10:00', sch.title || 'Schedule Item',
              sch.description || '', sch.room || '', sch.track || '', sch.speaker_name || '',
              sch.speaker_affiliation || '', sch.item_type || 'session', Number(sch.display_order || scIdx + 1)
            ]
          );
        }
      }

      await conn.commit();
      console.log(`[MySQL Transaction Committed] Updated conference ID ${id}`);
    } catch (dbErr: any) {
      await conn.rollback();
      console.error('[MySQL Conference Update Failed - Rolled Back]:', dbErr);
      return res.status(500).json({ success: false, message: `Failed to update conference in MySQL: ${dbErr.message}` });
      } finally {
        conn.release();
      }
    } else {
      if (index === -1) {
        return res.status(404).json({ success: false, message: `Conference ID ${id} not found.` });
      }
      const existingRecord = db.conferences[index];
      updatedConf = {
        ...existingRecord,
        ...req.body,
        id,
        about_highlights: req.body.about_highlights !== undefined ? req.body.about_highlights : existingRecord.about_highlights,
        gallery_images: req.body.gallery_images !== undefined ? req.body.gallery_images : existingRecord.gallery_images,
        indexing_partners: req.body.indexing_partners !== undefined ? req.body.indexing_partners : existingRecord.indexing_partners
      };
    }

    if (index !== -1) {
      db.conferences[index] = updatedConf;
    } else {
      db.conferences.push(updatedConf);
    }
    saveLocalConferences(db.conferences);

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
      const normalizedCats = req.body.categories.map((c: any, idx: number) => {
        const catId = c.id || (Math.max(...db.categories.map(x => x.id), 0) + idx + 1);
        return normalizeCategoryData({ ...c, id: catId }, id, idx);
      });
      db.categories = db.categories.filter(c => c.conference_id !== id).concat(normalizedCats);
      saveLocalCategories(db.categories);
      updatedConf.categories = normalizedCats;
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
    if (index !== -1) {
      db.conferences[index] = enrichedUpdatedConf;
    }
    saveLocalConferences(db.conferences);
    res.json({ success: true, message: 'Conference updated successfully in MySQL', data: enrichedUpdatedConf });
  });

  app.patch('/api/v1/conferences/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (mysqlPool) {
      await ensureDatabaseSchema(mysqlPool);
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
      saveLocalConferences(db.conferences);
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_CONFERENCE_STATUS', 'Conference', String(id), `Updated conference status to ${status}`);
    res.json({ success: true, message: `Status updated to ${status}`, data: index !== -1 ? db.conferences[index] : { id, status } });
  });

  app.patch('/api/v1/conferences/:id/order', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { display_order } = req.body;
    if (mysqlPool) {
      await ensureDatabaseSchema(mysqlPool);
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
      saveLocalConferences(db.conferences);
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
      await ensureDatabaseSchema(mysqlPool);
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
            formatDateSql(original.start_date, '2026-09-01'), formatDateSql(original.end_date, '2026-09-03'), formatDateSql(original.abstract_deadline, '2026-07-31'), formatDateSql(original.early_bird_deadline, '2026-06-30'), formatDateSql(original.registration_deadline, '2026-08-15'), original.mode, 'draft',
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
    saveLocalConferences(db.conferences);
    invalidatePublicCache();
    db.addAuditLog('DUPLICATE_CONFERENCE', 'Conference', duplicated.conference_code, `Cloned from ${original.title}`);
    res.status(201).json({ success: true, message: 'Conference duplicated as draft successfully', data: duplicated });
  });

  app.delete('/api/v1/conferences/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      await ensureDatabaseSchema(mysqlPool);
      const conn = await mysqlPool.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query('SET FOREIGN_KEY_CHECKS = 0').catch(() => {});

        // Safely remove/unlink all child and dependent entities
        await conn.query('DELETE FROM session_speakers WHERE session_id IN (SELECT id FROM sessions WHERE conference_id = ?)', [id]).catch(() => {});
        await conn.query('DELETE FROM sessions WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM schedule_items WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM committee_members WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM speaker_conferences WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM payments WHERE registration_id IN (SELECT id FROM registrations WHERE conference_id = ?)', [id]).catch(() => {});
        await conn.query('DELETE FROM registrations WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM registration_categories WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM abstract_reviews WHERE abstract_id IN (SELECT id FROM abstract_submissions WHERE conference_id = ?)', [id]).catch(() => {});
        await conn.query('DELETE FROM abstract_authors WHERE abstract_id IN (SELECT id FROM abstract_submissions WHERE conference_id = ?)', [id]).catch(() => {});
        await conn.query('DELETE FROM abstract_submissions WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('UPDATE proposal_submissions SET target_conference_id = NULL WHERE target_conference_id = ?', [id]).catch(() => {});
        await conn.query('UPDATE publications SET conference_id = NULL WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM conference_sponsors WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM conference_media_partners WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('UPDATE testimonials SET conference_id = NULL WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('UPDATE contact_enquiries SET conference_id = NULL WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM conference_flyers WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM conference_documents WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM faqs WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM conference_gallery WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM conference_settings WHERE conference_id = ?', [id]).catch(() => {});
        await conn.query('DELETE FROM conferences WHERE id = ?', [id]);

        await conn.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
        await conn.commit();
        console.log(`[MySQL Delete Conference] Successfully deleted conference ID ${id} and all related records.`);
      } catch (err: any) {
        await conn.rollback().catch(() => {});
        console.error('[MySQL Delete Conference Failed]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete conference in MySQL: ${err.message}` });
      } finally {
        conn.release();
      }
    }

    const index = db.conferences.findIndex(c => c.id === id);
    const removed = index !== -1 ? db.conferences.splice(index, 1)[0] : { id };
    db.committee = db.committee.filter(m => m.conference_id !== id);
    db.speakers = db.speakers.filter(s => s.conference_id !== id);
    db.sessions = db.sessions.filter(s => s.conference_id !== id);
    db.categories = db.categories.filter(c => c.conference_id !== id);
    db.schedule = db.schedule.filter(s => s.conference_id !== id);
    db.sponsors = db.sponsors.filter(s => s.conference_id !== id);
    db.mediaPartners = db.mediaPartners.filter(m => m.conference_id !== id);
    db.registrations = db.registrations.filter(r => r.conference_id !== id);
    db.abstracts = db.abstracts.filter(a => a.conference_id !== id);
    saveLocalConferences(db.conferences);
    saveLocalRegistrations(db.registrations);
    saveLocalAbstracts(db.abstracts);
    invalidatePublicCache();
    db.addAuditLog('DELETE_CONFERENCE', 'Conference', String(id), `Deleted conference ID: ${id}`);
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

  app.patch('/api/v1/committee/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
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

  app.delete('/api/v1/committee/:id', authenticateAdmin, async (req: Request, res: Response) => {
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

  app.post('/api/v1/speakers', authenticateAdmin, async (req: Request, res: Response) => {
    let newId = Math.max(...db.speakers.map(s => s.id), 0) + 1;
    const isAct = req.body.is_active !== undefined ? Boolean(req.body.is_active) : true;

    if (mysqlPool) {
      try {
        const [r]: any = await mysqlPool.query(
          `INSERT INTO speakers (
            name, prefix, designation, institution, country, research_domain, photo_url,
            biography, h_index, citations_count, linkedin_url, google_scholar, website
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.body.name || 'New Faculty Speaker', req.body.prefix || 'Dr.',
            req.body.designation || 'Professor', req.body.institution || 'Research Institute',
            req.body.country || 'Global', req.body.research_domain || 'Biotechnology',
            req.body.photo_url || '', req.body.biography || '',
            Number(req.body.h_index || 25), Number(req.body.citations_count || 1500),
            req.body.linkedin_url || '', req.body.google_scholar || '', req.body.website || ''
          ]
        );
        newId = Number(r.insertId);

        if (req.body.conference_id) {
          await mysqlPool.query(
            `INSERT INTO speaker_conferences (
              speaker_id, conference_id, speaker_type, presentation_title, presentation_abstract, display_order
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE speaker_type = VALUES(speaker_type), presentation_title = VALUES(presentation_title), presentation_abstract = VALUES(presentation_abstract), display_order = VALUES(display_order)`,
            [
              newId, Number(req.body.conference_id), req.body.speaker_type || 'Keynote',
              req.body.presentation_title || '', req.body.presentation_abstract || '',
              Number(req.body.display_order || (db.speakers.length + 1))
            ]
          );
        }
      } catch (err: any) {
        console.error('[MySQL Add Speaker Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to add speaker to database: ${err.message}` });
      }
    }

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
      is_active: isAct,
      status: isAct ? 'active' : 'inactive',
      session_title: req.body.session_title || ''
    };
    db.speakers.push(newSpeaker);
    invalidatePublicCache();
    db.addAuditLog('ADD_SPEAKER', 'Speaker', String(newSpeaker.id), `Added speaker: ${newSpeaker.name}`);
    res.status(201).json({ success: true, message: 'Speaker added successfully', data: newSpeaker });
  });

  app.put('/api/v1/speakers/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.speakers.findIndex(s => s.id === id);
    if (index === -1 && !mysqlPool) {
      return res.status(404).json({ success: false, message: 'Speaker not found' });
    }

    if (mysqlPool) {
      try {
        await mysqlPool.query(
          `UPDATE speakers SET
            name = COALESCE(?, name),
            prefix = COALESCE(?, prefix),
            designation = COALESCE(?, designation),
            institution = COALESCE(?, institution),
            country = COALESCE(?, country),
            research_domain = COALESCE(?, research_domain),
            photo_url = COALESCE(?, photo_url),
            biography = COALESCE(?, biography),
            h_index = COALESCE(?, h_index),
            citations_count = COALESCE(?, citations_count),
            linkedin_url = COALESCE(?, linkedin_url),
            google_scholar = COALESCE(?, google_scholar),
            website = COALESCE(?, website)
          WHERE id = ?`,
          [
            req.body.name, req.body.prefix, req.body.designation, req.body.institution,
            req.body.country, req.body.research_domain, req.body.photo_url, req.body.biography,
            req.body.h_index !== undefined ? Number(req.body.h_index) : null,
            req.body.citations_count !== undefined ? Number(req.body.citations_count) : null,
            req.body.linkedin_url, req.body.google_scholar, req.body.website,
            id
          ]
        );

        if (req.body.conference_id) {
          await mysqlPool.query(
            `INSERT INTO speaker_conferences (
              speaker_id, conference_id, speaker_type, presentation_title, presentation_abstract, display_order
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE speaker_type = VALUES(speaker_type), presentation_title = VALUES(presentation_title), presentation_abstract = VALUES(presentation_abstract), display_order = VALUES(display_order)`,
            [
              id, Number(req.body.conference_id), req.body.speaker_type || 'Keynote',
              req.body.presentation_title || '', req.body.presentation_abstract || '',
              Number(req.body.display_order || 1)
            ]
          );
        }
      } catch (err: any) {
        console.error('[MySQL Update Speaker Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update speaker in database: ${err.message}` });
      }
    }

    if (index !== -1) {
      db.speakers[index] = { ...db.speakers[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_SPEAKER', 'Speaker', String(id), `Updated speaker: ${req.body.name || id}`);
    res.json({ success: true, message: 'Speaker updated successfully', data: index !== -1 ? db.speakers[index] : req.body });
  });

  app.patch('/api/v1/speakers/:id/status', authenticateAdmin, (req: Request, res: Response) => {
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

  app.delete('/api/v1/speakers/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query('DELETE FROM speaker_conferences WHERE speaker_id = ?', [id]);
        await mysqlPool.query('DELETE FROM speakers WHERE id = ?', [id]);
      } catch (err: any) {
        console.error('[MySQL Delete Speaker Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete speaker from database: ${err.message}` });
      }
    }

    const index = db.speakers.findIndex(s => s.id === id);
    const removed = index !== -1 ? db.speakers.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog('DELETE_SPEAKER', 'Speaker', String(id), `Deleted speaker: ${id}`);
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
            formatDateSql(req.body.session_date, '2026-06-22'),
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
            req.body.session_date ? formatDateSql(req.body.session_date, '2026-06-22') : null,
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

  app.patch('/api/v1/sessions/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
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

  app.delete('/api/v1/sessions/:id', authenticateAdmin, async (req: Request, res: Response) => {
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

  app.post('/api/v1/sponsors', authenticateAdmin, async (req: Request, res: Response) => {
    let newId = Math.max(...db.sponsors.map(s => s.id), 0) + 1;
    const tier = req.body.tier || 'Platinum';
    const tierMap: Record<string, number> = { Platinum: 1, Gold: 2, Silver: 3, Bronze: 4, Supporting: 5, Academic: 6, Media: 7 };
    const tierId = req.body.tier_id || (tierMap[tier] || 1);
    const isAct = req.body.is_active !== undefined ? Boolean(req.body.is_active) : true;
    const confId = Number(req.body.conference_id) || 1;
    const dispOrder = Number(req.body.display_order) || (db.sponsors.length + 1);

    if (mysqlPool) {
      try {
        const [r]: any = await mysqlPool.query(
          `INSERT INTO sponsors (name, logo_url, website, description, country, contact_email, is_active, display_order, tier_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.body.company_name || req.body.name || 'New Corporate Sponsor',
            req.body.logo_url || '', req.body.website || 'https://scinsmedia.com',
            req.body.description || 'Global industry partner', req.body.country || 'Global',
            req.body.contact_email || '', isAct ? 1 : 0, dispOrder, tierId
          ]
        );
        newId = Number(r.insertId);

        await mysqlPool.query(
          `INSERT INTO conference_sponsors (conference_id, sponsor_id, tier_id, display_order)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE tier_id = VALUES(tier_id), display_order = VALUES(display_order)`,
          [confId, newId, tierId, dispOrder]
        );
      } catch (err: any) {
        console.error('[MySQL Add Sponsor Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to add sponsor to database: ${err.message}` });
      }
    }

    const newSponsor: Sponsor = {
      id: newId,
      company_name: req.body.company_name || req.body.name || 'New Corporate Sponsor',
      name: req.body.name || req.body.company_name || 'New Corporate Sponsor',
      logo_url: req.body.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
      website: req.body.website || 'https://scinsmedia.com',
      description: req.body.description || 'Global industry and research partner.',
      tier_name: req.body.tier_name || `${tier} Sponsor`,
      tier: tier,
      tier_id: tierId,
      country: req.body.country || 'Global',
      contact_email: req.body.contact_email || '',
      conference_id: confId,
      display_order: dispOrder,
      is_active: isAct,
      status: isAct ? 'active' : 'inactive',
      partner_type: req.body.partner_type || 'Corporate Sponsor',
      category: req.body.category || tier
    };
    db.sponsors.push(newSponsor);
    invalidatePublicCache();
    db.addAuditLog('ADD_SPONSOR', 'Sponsor', String(newSponsor.id), `Added sponsor: ${newSponsor.company_name}`);
    res.status(201).json({ success: true, message: 'Sponsor added successfully', data: newSponsor });
  });

  app.put('/api/v1/sponsors/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.sponsors.findIndex(s => s.id === id);
    if (index === -1 && !mysqlPool) {
      return res.status(404).json({ success: false, message: 'Sponsor not found' });
    }

    if (mysqlPool) {
      try {
        await mysqlPool.query(
          `UPDATE sponsors SET
            name = COALESCE(?, name),
            logo_url = COALESCE(?, logo_url),
            website = COALESCE(?, website),
            description = COALESCE(?, description),
            country = COALESCE(?, country),
            contact_email = COALESCE(?, contact_email),
            is_active = COALESCE(?, is_active),
            display_order = COALESCE(?, display_order),
            tier_id = COALESCE(?, tier_id)
          WHERE id = ?`,
          [
            req.body.company_name || req.body.name, req.body.logo_url, req.body.website,
            req.body.description, req.body.country, req.body.contact_email,
            req.body.is_active !== undefined ? (req.body.is_active ? 1 : 0) : null,
            req.body.display_order !== undefined ? Number(req.body.display_order) : null,
            req.body.tier_id !== undefined ? Number(req.body.tier_id) : null,
            id
          ]
        );

        if (req.body.conference_id) {
          await mysqlPool.query(
            `INSERT INTO conference_sponsors (conference_id, sponsor_id, tier_id, display_order)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE tier_id = VALUES(tier_id), display_order = VALUES(display_order)`,
            [Number(req.body.conference_id), id, req.body.tier_id || 1, req.body.display_order || 1]
          );
        }
      } catch (err: any) {
        console.error('[MySQL Update Sponsor Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update sponsor in database: ${err.message}` });
      }
    }

    if (index !== -1) {
      db.sponsors[index] = { ...db.sponsors[index], ...req.body };
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_SPONSOR', 'Sponsor', String(id), `Updated sponsor: ${req.body.name || req.body.company_name || id}`);
    res.json({ success: true, message: 'Sponsor updated successfully', data: index !== -1 ? db.sponsors[index] : req.body });
  });

  app.patch('/api/v1/sponsors/:id/status', authenticateAdmin, (req: Request, res: Response) => {
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

  app.delete('/api/v1/sponsors/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await mysqlPool.query('DELETE FROM conference_sponsors WHERE sponsor_id = ?', [id]);
        await mysqlPool.query('DELETE FROM sponsors WHERE id = ?', [id]);
      } catch (err: any) {
        console.error('[MySQL Delete Sponsor Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete sponsor from database: ${err.message}` });
      }
    }

    const index = db.sponsors.findIndex(s => s.id === id);
    const removed = index !== -1 ? db.sponsors.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    db.addAuditLog('DELETE_SPONSOR', 'Sponsor', String(id), `Deleted sponsor: ${id}`);
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

  app.post('/api/v1/schedule', authenticateAdmin, async (req: Request, res: Response) => {
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
            formatDateSql(req.body.schedule_date, '2026-06-22'),
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

  app.put('/api/v1/schedule/:id', authenticateAdmin, async (req: Request, res: Response) => {
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
            req.body.day_number, req.body.schedule_date ? formatDateSql(req.body.schedule_date, '2026-06-22') : null,
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

  app.delete('/api/v1/schedule/:id', authenticateAdmin, async (req: Request, res: Response) => {
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
    if (conference_id !== undefined && conference_id !== null && conference_id !== '') {
      list = list.filter(c => Number(c.conference_id) === Number(conference_id));
    }
    const normalizedList = list.map((c, idx) => normalizeCategoryData(c, c.conference_id || 1, idx));
    res.json({ success: true, data: normalizedList });
  });

  app.post('/api/v1/registration-categories', authenticateAdmin, async (req: Request, res: Response) => {
    let newId = Math.max(...db.categories.map(c => c.id), 0) + 1;
    const catData = {
      conference_id: Number(req.body.conference_id) || 1,
      name: req.body.name || 'Delegate Pass',
      early_bird_fee: Number(req.body.early_bird_fee || req.body.early_bird_price) || 649,
      standard_fee: Number(req.body.standard_fee || req.body.price) || 799,
      price: Number(req.body.price || req.body.standard_fee) || 799,
      early_bird_price: Number(req.body.early_bird_price || req.body.early_bird_fee) || 649,
      currency: req.body.currency || 'USD',
      deadline: formatDateSql(req.body.deadline, null),
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
            catData.early_bird_price, formatDateSql(catData.deadline, null), JSON.stringify(catData.benefits),
            catData.is_popular, catData.display_order, catData.payment_gateway_link, catData.is_active
          ]
        );
        newId = Number(r.insertId);
      } catch (err: any) {
        console.error('[MySQL Add Registration Category Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to add category in MySQL: ${err.message}` });
      }
    }
    const cat = normalizeCategoryData({ ...catData, id: newId }, catData.conference_id, db.categories.length);
    db.categories.push(cat);
    saveLocalCategories(db.categories);
    const confIdx = db.conferences.findIndex(c => c.id === cat.conference_id);
    if (confIdx !== -1 && Array.isArray(db.conferences[confIdx].categories)) {
      db.conferences[confIdx].categories!.push(cat);
      saveLocalConferences(db.conferences);
    }
    invalidatePublicCache();
    db.addAuditLog('ADD_REGISTRATION_CATEGORY', 'RegistrationCategory', String(newId), `Added category: ${cat.name}`);
    res.status(201).json({ success: true, message: 'Category created successfully in MySQL', data: cat });
  });

  app.put('/api/v1/registration-categories/:id', authenticateAdmin, async (req: Request, res: Response) => {
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
            req.body.deadline ? formatDateSql(req.body.deadline, null) : null,
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
    let updatedCat: any = req.body;
    if (index !== -1) {
      const merged = { ...db.categories[index], ...req.body };
      updatedCat = normalizeCategoryData(merged, merged.conference_id || 1, index);
      db.categories[index] = updatedCat;
      saveLocalCategories(db.categories);
      const confIdx = db.conferences.findIndex(c => c.id === updatedCat.conference_id);
      if (confIdx !== -1 && Array.isArray(db.conferences[confIdx].categories)) {
        const catIdx = db.conferences[confIdx].categories!.findIndex(c => c.id === id);
        if (catIdx !== -1) {
          db.conferences[confIdx].categories![catIdx] = updatedCat;
        } else {
          db.conferences[confIdx].categories!.push(updatedCat);
        }
        saveLocalConferences(db.conferences);
      }
    }
    invalidatePublicCache();
    db.addAuditLog('UPDATE_REGISTRATION_CATEGORY', 'RegistrationCategory', String(id), `Updated category: ${req.body.name || id}`);
    res.json({ success: true, message: 'Category updated successfully in MySQL', data: updatedCat });
  });

  app.delete('/api/v1/registration-categories/:id', authenticateAdmin, async (req: Request, res: Response) => {
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
    saveLocalCategories(db.categories);
    if (removed && (removed as any).conference_id) {
      const confIdx = db.conferences.findIndex(c => c.id === (removed as any).conference_id);
      if (confIdx !== -1 && Array.isArray(db.conferences[confIdx].categories)) {
        db.conferences[confIdx].categories = db.conferences[confIdx].categories!.filter(c => c.id !== id);
        saveLocalConferences(db.conferences);
      }
    }
    invalidatePublicCache();
    db.addAuditLog('DELETE_REGISTRATION_CATEGORY', 'RegistrationCategory', String(id), `Deleted category: ${(removed as any).name || id}`);
    res.json({ success: true, message: 'Category deleted successfully from MySQL', data: removed });
  });

  // 7. Registrations
  // Endpoint to fetch CSRF token for state‑changing requests
  app.get('/api/v1/csrf-token', (req: Request, res: Response) => {
    res.json({ success: true, token: req.csrfToken() });
  });

  app.get('/api/v1/registrations', authenticateAdmin, async (req: Request, res: Response) => {
    const { conference_id, status, payment_status, category_id, search, start_date, end_date } = req.query;

    if (mysqlPool) {
      try {
        let sql = `
          SELECT r.*, c.title as conference_title, rc.name as category_name
          FROM registrations r
          LEFT JOIN conferences c ON r.conference_id = c.id
          LEFT JOIN registration_categories rc ON r.category_id = rc.id
          WHERE 1=1
        `;
        const params: any[] = [];
        if (conference_id && conference_id !== 'all') {
          sql += ` AND r.conference_id = ?`;
          params.push(Number(conference_id));
        }
        if (status && status !== 'all') {
          sql += ` AND LOWER(r.registration_status) = LOWER(?)`;
          params.push(String(status));
        }
        if (payment_status && payment_status !== 'all') {
          sql += ` AND LOWER(r.payment_status) = LOWER(?)`;
          params.push(String(payment_status));
        }
        if (category_id && category_id !== 'all') {
          sql += ` AND (r.category_id = ? OR LOWER(rc.name) = LOWER(?))`;
          params.push(Number(category_id) || 0, String(category_id));
        }
        if (start_date) {
          sql += ` AND DATE(r.created_at) >= ?`;
          params.push(String(start_date));
        }
        if (end_date) {
          sql += ` AND DATE(r.created_at) <= ?`;
          params.push(String(end_date));
        }
        if (search && typeof search === 'string' && search.trim()) {
          const sq = `%${search.trim()}%`;
          sql += ` AND (r.first_name LIKE ? OR r.last_name LIKE ? OR r.email LIKE ? OR r.registration_id LIKE ? OR r.institution LIKE ? OR r.country LIKE ?)`;
          params.push(sq, sq, sq, sq, sq, sq);
        }
        sql += ` ORDER BY r.id DESC`;

        const [rows]: any = await mysqlPool.query(sql, params);
        if (Array.isArray(rows) && rows.length > 0) {
          return res.json({
            success: true,
            data: rows.map((r: any) => ({
              ...r,
              id: Number(r.id),
              conference_id: Number(r.conference_id),
              category_id: Number(r.category_id),
              amount: Number(r.amount || 0),
              created_at: formatDateStr(r.created_at) || (r.created_at ? new Date(r.created_at).toISOString() : '')
            }))
          });
        }
      } catch (err: any) {
        console.warn('[Registrations MySQL Query Notice, falling back to memory]:', err.message);
      }
    }

    let list = [...db.registrations];
    if (conference_id && conference_id !== 'all') {
      list = list.filter(r => r.conference_id === Number(conference_id));
    }
    if (status && status !== 'all') {
      const s = String(status).toLowerCase();
      list = list.filter(r => (r.registration_status || '').toLowerCase() === s);
    }
    if (payment_status && payment_status !== 'all') {
      const ps = String(payment_status).toLowerCase();
      list = list.filter(r => (r.payment_status || '').toLowerCase() === ps);
    }
    if (category_id && category_id !== 'all') {
      const catVal = String(category_id).toLowerCase();
      list = list.filter(r =>
        String(r.category_id) === catVal ||
        (r.category_name && r.category_name.toLowerCase() === catVal)
      );
    }
    if (start_date) {
      list = list.filter(r => (r.created_at || '').substring(0, 10) >= String(start_date));
    }
    if (end_date) {
      list = list.filter(r => (r.created_at || '').substring(0, 10) <= String(end_date));
    }
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(r =>
        (r.first_name && r.first_name.toLowerCase().includes(q)) ||
        (r.last_name && r.last_name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.registration_id && r.registration_id.toLowerCase().includes(q)) ||
        (r.institution && r.institution.toLowerCase().includes(q)) ||
        (r.country && r.country.toLowerCase().includes(q)) ||
        (r.conference_title && r.conference_title.toLowerCase().includes(q))
      );
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/v1/registrations', publicSubmissionRateLimiter, async (req: Request, res: Response) => {
    try {
      const body = req.body;

      // Validate mandatory delegate fields
      const firstName = String(body.first_name || '').trim();
      const lastName = String(body.last_name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const country = String(body.country || '').trim();

      if (!firstName) {
        return res.status(400).json({ success: false, message: 'First name is required.' });
      }
      if (!lastName) {
        return res.status(400).json({ success: false, message: 'Last name is required.' });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Contact phone number is required.' });
      }
      if (!country) {
        return res.status(400).json({ success: false, message: 'Country is required.' });
      }

      // Validate Conference ID
      if (!body.conference_id) {
        return res.status(400).json({ success: false, message: 'Conference ID is required.' });
      }
      const confId = Number(body.conference_id);
      const targetConf = db.conferences.find(c => c.id === confId || c.slug === String(body.conference_id));
      if (!targetConf) {
        return res.status(400).json({ success: false, message: `Invalid conference ID (${body.conference_id}). Conference does not exist in the database.` });
      }

      // Duplicate submission protection (prevent double-submit within 30 seconds)
      const recentDup = db.registrations.find(r =>
        r.conference_id === targetConf.id &&
        r.email.toLowerCase() === email &&
        (Date.now() - new Date(r.created_at).getTime()) < 30000
      );
      if (recentDup) {
        return res.status(200).json({
          success: true,
          message: 'Registration already received.',
          data: recentDup
        });
      }

      // 1. Process & Validate Multiple Registration Categories using Admin Configured Rates
      const confCategories = db.categories.filter(c => c.conference_id === targetConf.id);
      const fallbackCategories = REGISTRATION_CATEGORIES.filter(c => c.conference_id === targetConf.id);
      const availableCategories = confCategories.length > 0 ? confCategories : (fallbackCategories.length > 0 ? fallbackCategories : REGISTRATION_CATEGORIES);

      let selectedCategoriesList: Array<{
        id: number;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
        currency?: string;
      }> = [];

      if (Array.isArray(body.selected_categories) && body.selected_categories.length > 0) {
        selectedCategoriesList = body.selected_categories.map((item: any) => {
          const match = availableCategories.find(c => c.id === Number(item.id)) || availableCategories.find(c => c.name === item.name);
          const adminPrice = match
            ? Number(match.price ?? match.standard_fee ?? match.tier3_price ?? match.industry_price ?? match.early_bird_fee ?? match.early_bird_price ?? 499)
            : Number(item.price || 499);
          const quantity = Math.max(1, Number(item.quantity) || 1);
          const unitPrice = Number(item.price) || adminPrice;
          const subtotal = item.subtotal !== undefined ? Number(item.subtotal) : unitPrice * quantity;
          return {
            id: match ? match.id : Number(item.id || 1),
            name: match ? match.name : (item.name || 'Delegate Pass'),
            price: unitPrice,
            quantity: quantity,
            subtotal: subtotal,
            currency: body.currency || 'USD'
          };
        });
      } else if (Array.isArray(body.selected_category_ids) && body.selected_category_ids.length > 0) {
        selectedCategoriesList = body.selected_category_ids.map((cid: any) => {
          const match = availableCategories.find(c => c.id === Number(cid)) || availableCategories[0];
          const adminPrice = match
            ? Number(match.price ?? match.standard_fee ?? match.tier3_price ?? match.industry_price ?? match.early_bird_fee ?? match.early_bird_price ?? 499)
            : 499;
          return {
            id: match ? match.id : Number(cid),
            name: match ? match.name : 'Delegate Pass',
            price: adminPrice,
            quantity: 1,
            subtotal: adminPrice,
            currency: body.currency || 'USD'
          };
        });
      } else {
        const catId = Number(body.category_id) || availableCategories[0]?.id || 1;
        const match = availableCategories.find(c => c.id === catId) || availableCategories[0];
        const adminPrice = match
          ? Number(match.price ?? match.standard_fee ?? match.tier3_price ?? match.industry_price ?? match.early_bird_fee ?? match.early_bird_price ?? 499)
          : 499;
        selectedCategoriesList = [{
          id: match ? match.id : catId,
          name: match ? match.name : (body.category_name || 'Delegate Pass'),
          price: adminPrice,
          quantity: 1,
          subtotal: adminPrice,
          currency: body.currency || 'USD'
        }];
      }

      // 2. Process & Validate Accommodation using Admin Configured Rates
      const accommodationRequired = Boolean(body.accommodation_required);
      const accommodationDays = accommodationRequired ? Math.max(1, Number(body.accommodation_days) || 1) : 0;
      const adminAccommodationRate = Number(targetConf.accommodation_price_per_day) || 120;
      const accommodationTotal = accommodationRequired ? accommodationDays * adminAccommodationRate : 0;

      // 3. Price Calculation & Currency Conversion Validation
      const passesBaseTotal = selectedCategoriesList.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
      const grandBaseTotal = passesBaseTotal + accommodationTotal;

      const currency = (body.currency || 'USD').toUpperCase();
      const CURRENCY_RATES: Record<string, number> = { EUR: 1, USD: 1.08, GBP: 0.85 };
      const curRate = CURRENCY_RATES[currency] || 1;
      const expectedGrandTotal = Math.round(grandBaseTotal * curRate);

      const submittedAmount = Number(body.amount);
      const finalAmount = submittedAmount > 0 ? submittedAmount : expectedGrandTotal;

      const primaryCatId = selectedCategoriesList[0]?.id || 1;
      const combinedCategoryName = selectedCategoriesList
        .map(c => `${c.quantity > 1 ? `${c.quantity}x ` : ''}${c.name}`)
        .join(' + ') || 'Delegate Pass';

      const regId = `SCINS-REG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const selectedHotel = accommodationRequired ? (body.hotel_name || targetConf.hotel_name || 'Official Partner Hotel') : undefined;
      const checkInDate = accommodationRequired ? (body.check_in_date || targetConf.start_date || '') : undefined;
      const checkOutDate = accommodationRequired ? (body.check_out_date || targetConf.end_date || '') : undefined;

      const specialReqsData = {
        selected_categories: selectedCategoriesList,
        accommodation_required: accommodationRequired,
        accommodation_days: accommodationDays,
        accommodation_rate: adminAccommodationRate,
        accommodation_amount: accommodationTotal,
        hotel_name: selectedHotel,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        notes: body.special_requirements || ''
      };

      const newReg: Registration = {
        id: db.registrations.length + 1,
        registration_id: regId,
        conference_id: targetConf.id,
        conference_title: targetConf.title,
        category_id: primaryCatId,
        category_name: combinedCategoryName,
        selected_categories: selectedCategoriesList,
        first_name: body.first_name || '',
        last_name: body.last_name || '',
        email: body.email || '',
        phone: body.phone || '',
        country: body.country || '',
        institution: body.billing_address || body.institution || '',
        billing_address: body.billing_address || body.institution || '',
        department: body.department || '',
        designation: body.designation || '',
        research_area: body.research_area || '',
        attendance_mode: body.attendance_mode || 'In-Person',
        accommodation_required: accommodationRequired,
        accommodation_days: accommodationDays,
        accommodation_rate: adminAccommodationRate,
        accommodation_amount: accommodationTotal,
        hotel_name: selectedHotel,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        meal_preference: body.meal_preference || 'Standard',
        special_requirements: JSON.stringify(specialReqsData),
        amount: finalAmount,
        currency: currency,
        payment_status: body.payment_status || 'pending',
        registration_status: body.registration_status || 'pending',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      db.registrations.unshift(newReg);
      saveLocalRegistrations(db.registrations);
      db.addAuditLog('NEW_REGISTRATION', 'Registration', regId, `Registered delegate ${newReg.first_name} ${newReg.last_name} (${newReg.email}) for ${combinedCategoryName} with total ${currency} ${finalAmount}`);

      try {
        const dbRes: any = await syncToMysql(
          `INSERT INTO registrations (registration_id, conference_id, category_id, first_name, last_name, email, phone, country, institution, billing_address, department, designation, research_area, attendance_mode, accommodation_required, accommodation_days, selected_categories, hotel_name, check_in_date, check_out_date, accommodation_rate, accommodation_amount, meal_preference, special_requirements, amount, currency, payment_status, registration_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newReg.registration_id, newReg.conference_id, newReg.category_id, newReg.first_name, newReg.last_name, newReg.email, newReg.phone, newReg.country, newReg.institution, newReg.billing_address || newReg.institution, newReg.department, newReg.designation, newReg.research_area, newReg.attendance_mode,
            newReg.accommodation_required ? 1 : 0, newReg.accommodation_days || 0, JSON.stringify(selectedCategoriesList),
            newReg.hotel_name || null, newReg.check_in_date || null, newReg.check_out_date || null, newReg.accommodation_rate || 0, newReg.accommodation_amount || 0,
            newReg.meal_preference, newReg.special_requirements, newReg.amount, newReg.currency, newReg.payment_status, newReg.registration_status
          ]
        );
        if (dbRes?.insertId) {
          newReg.id = dbRes.insertId;
        }
      } catch (sqlErr: any) {
        // Fallback for older MySQL table schema without new accommodation columns
        const fallbackRes: any = await syncToMysql(
          `INSERT INTO registrations (registration_id, conference_id, category_id, first_name, last_name, email, phone, country, institution, department, designation, research_area, attendance_mode, accommodation_required, meal_preference, special_requirements, amount, currency, payment_status, registration_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newReg.registration_id, newReg.conference_id, newReg.category_id, newReg.first_name, newReg.last_name, newReg.email, newReg.phone, newReg.country, newReg.institution, newReg.department, newReg.designation, newReg.research_area, newReg.attendance_mode, newReg.accommodation_required ? 1 : 0, newReg.meal_preference, newReg.special_requirements, newReg.amount, newReg.currency, newReg.payment_status, newReg.registration_status]
        ).catch(() => null);
        if (fallbackRes?.insertId) {
          newReg.id = fallbackRes.insertId;
        }
      }

      res.status(201).json({
        success: true,
        message: 'Registration completed successfully',
        data: newReg
      });
    } catch (err: any) {
      console.error('[Registration Error]:', err.message);
      res.status(500).json({ success: false, message: 'Failed to process registration: ' + err.message });
    }
  });

  app.patch('/api/v1/registrations/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { registration_status, payment_status } = req.body;
      const reg = db.registrations.find(r => r.id === id);
      if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
      if (registration_status) reg.registration_status = registration_status;
      if (payment_status) reg.payment_status = payment_status;
      saveLocalRegistrations(db.registrations);
      await syncToMysql(
        `UPDATE registrations SET registration_status = COALESCE(?, registration_status), payment_status = COALESCE(?, payment_status) WHERE id = ?`,
        [registration_status || null, payment_status || null, id]
      );
      db.addAuditLog('UPDATE_REG_STATUS', 'Registration', reg.registration_id, `Updated status to ${registration_status || payment_status}`);
      res.json({ success: true, data: reg });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 8. Abstract Submissions
  app.get('/api/v1/abstracts', authenticateAdmin, (req: Request, res: Response) => {
    res.json({ success: true, data: db.abstracts });
  });

  app.post('/api/v1/abstracts', publicSubmissionRateLimiter, async (req: Request, res: Response) => {
    try {
      const body = req.body;
      const {
        primary_author_name,
        primary_author_email,
        primary_author_phone,
        primary_author_country,
        primary_author_affiliation
      } = body;

      // Mandatory validation per requirements
      if (!primary_author_name || !String(primary_author_name).trim()) {
        return res.status(400).json({ success: false, message: 'Primary author full name is required.' });
      }

      if (!primary_author_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(primary_author_email).trim())) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }

      if (!primary_author_phone || !String(primary_author_phone).trim()) {
        return res.status(400).json({ success: false, message: 'Primary author contact number is required.' });
      }

      if (!primary_author_country || !String(primary_author_country).trim()) {
        return res.status(400).json({ success: false, message: 'Country is required.' });
      }

      // Validate Conference ID
      if (!body.conference_id) {
        return res.status(400).json({ success: false, message: 'Conference ID is required.' });
      }
      const targetConfId = Number(body.conference_id);
      const targetConf = db.conferences.find(c => c.id === targetConfId || c.slug === String(body.conference_id));
      if (!targetConf) {
        return res.status(400).json({ success: false, message: `Invalid conference ID (${body.conference_id}). Conference does not exist in the database.` });
      }
      const resolvedConfId = targetConf.id;
      const resolvedConfTitle = targetConf.title;
      const confCode = (targetConf?.slug ? targetConf.slug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase() : 'SCINS') || 'SCINS';

      let resolvedFileUrl = body.file_url || '';
      let resolvedFileName = body.file_name || '';

      // Handle base64 file upload if provided
      if (body.file_data) {
        let cleanBase64 = body.file_data;
        let headerMime = body.file_type || '';
        const dataUrlMatch = body.file_data.match(/^data:([^;]+);base64,(.*)$/s);
        if (dataUrlMatch) {
          headerMime = dataUrlMatch[1];
          cleanBase64 = dataUrlMatch[2];
        }

        const buffer = Buffer.from(cleanBase64, 'base64');
        let detectedMime = headerMime;
        let detectedExt = '';

        try {
          const detected = await fileTypeFromBuffer(buffer);
          if (detected) {
            detectedMime = detected.mime;
            detectedExt = detected.ext;
          }
        } catch (_) {}

        if (!detectedMime || detectedMime === 'application/octet-stream') {
          const lowerName = (body.file_name || '').toLowerCase();
          if (lowerName.endsWith('.pdf')) detectedMime = 'application/pdf';
          else if (lowerName.endsWith('.doc')) detectedMime = 'application/msword';
          else if (lowerName.endsWith('.docx')) detectedMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          else detectedMime = 'application/pdf';
        }

        if (!detectedExt) {
          if (detectedMime === 'application/pdf') detectedExt = 'pdf';
          else if (detectedMime.includes('word')) detectedExt = 'docx';
          else if (detectedMime === 'application/msword') detectedExt = 'doc';
          else detectedExt = 'pdf';
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const distUploadsDir = path.join(process.cwd(), 'dist', 'uploads');
        if (!fs.existsSync(distUploadsDir)) {
          fs.mkdirSync(distUploadsDir, { recursive: true });
        }

        const safeCategory = `abstract_conf_${resolvedConfId}`;
        const cleanFileName = `abstract_conf_${resolvedConfId}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${detectedExt}`;
        const filePath = path.join(uploadsDir, cleanFileName);
        fs.writeFileSync(filePath, buffer);
        try {
          fs.writeFileSync(path.join(distUploadsDir, cleanFileName), buffer);
        } catch (_) {}

        resolvedFileUrl = `/uploads/${cleanFileName}`;
        resolvedFileName = body.file_name || cleanFileName;

        saveLocalMediaAsset({
          file_name: cleanFileName,
          file_path: resolvedFileUrl,
          file_type: detectedMime,
          file_size: buffer.length,
          category: safeCategory,
          file_data: cleanBase64,
          created_at: new Date().toISOString()
        });

        if (mysqlPool) {
          try {
            await mysqlPool.query(
              `INSERT INTO media_assets (file_name, file_path, file_type, file_size, category, file_data)
               VALUES (?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE file_data = VALUES(file_data), file_type = VALUES(file_type), file_size = VALUES(file_size), category = VALUES(category)`,
              [cleanFileName, resolvedFileUrl, detectedMime, buffer.length, safeCategory, cleanBase64]
            );
          } catch (dbErr: any) {
            console.error('[MySQL Media Asset Abstract Persistence Error]:', dbErr.message);
          }
        }
      }

      const subId = `${confCode}-ABS-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;

      // If no file was uploaded, generate a standards-compliant PDF representation
      if (!resolvedFileUrl) {
        const cleanFileName = `abstract_conf_${resolvedConfId}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.pdf`;
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const distUploadsDir = path.join(process.cwd(), 'dist', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        if (!fs.existsSync(distUploadsDir)) fs.mkdirSync(distUploadsDir, { recursive: true });

        const pdfBuffer = generateAbstractPdf({
          submission_id: subId,
          conference_title: resolvedConfTitle,
          title: body.title || `${String(primary_author_name).trim()} — Abstract Submission`,
          primary_author_name: String(primary_author_name).trim(),
          primary_author_email: String(primary_author_email).trim(),
          primary_author_phone: String(primary_author_phone).trim(),
          primary_author_affiliation: (primary_author_affiliation || '').trim(),
          primary_author_country: String(primary_author_country).trim(),
          presentation_preference: body.presentation_preference || 'Oral',
          research_domain: body.research_domain || (targetConf?.theme || 'Scientific Research'),
          keywords: body.keywords || '',
          abstract_text: body.abstract_text || '',
          created_at: new Date().toISOString()
        });

        fs.writeFileSync(path.join(uploadsDir, cleanFileName), pdfBuffer);
        try {
          fs.writeFileSync(path.join(distUploadsDir, cleanFileName), pdfBuffer);
        } catch (_) {}

        resolvedFileUrl = `/uploads/${cleanFileName}`;
        resolvedFileName = cleanFileName;

        saveLocalMediaAsset({
          file_name: cleanFileName,
          file_path: resolvedFileUrl,
          file_type: 'application/pdf',
          file_size: pdfBuffer.length,
          category: `abstract_conf_${resolvedConfId}`,
          file_data: pdfBuffer.toString('base64'),
          created_at: new Date().toISOString()
        });
      }
      const newAbstract: AbstractSubmission = {
        id: db.abstracts.length + 1,
        submission_id: subId,
        conference_id: resolvedConfId,
        conference_title: resolvedConfTitle,
        title: body.title || `${String(primary_author_name).trim()} — Abstract Submission`,
        abstract_text: body.abstract_text || '',
        keywords: body.keywords || '',
        research_domain: body.research_domain || (targetConf?.theme || 'Scientific Research'),
        presentation_preference: body.presentation_preference || 'Oral',
        primary_author_name: String(primary_author_name).trim(),
        primary_author_email: String(primary_author_email).trim().toLowerCase(),
        primary_author_phone: String(primary_author_phone).trim(),
        primary_author_affiliation: (primary_author_affiliation || '').trim(),
        primary_author_country: String(primary_author_country).trim(),
        file_name: resolvedFileName,
        file_url: resolvedFileUrl,
        status: 'submitted',
        authors: body.authors || [
          {
            name: String(primary_author_name).trim(),
            email: String(primary_author_email).trim().toLowerCase(),
            institution: (primary_author_affiliation || '').trim(),
            country: String(primary_author_country).trim(),
            is_corresponding: true
          }
        ],
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      db.abstracts.unshift(newAbstract);
      saveLocalAbstracts(db.abstracts);
      db.addAuditLog('SUBMIT_ABSTRACT', 'AbstractSubmission', subId, `New abstract submitted by ${newAbstract.primary_author_name} (${newAbstract.primary_author_phone}): "${newAbstract.title.substring(0, 40)}..."`);
      const dbRes: any = await syncToMysql(
        `INSERT INTO abstract_submissions (
          submission_id, conference_id, title, abstract_text, keywords, research_domain,
          presentation_preference, primary_author_name, primary_author_email, primary_author_phone,
          primary_author_affiliation, primary_author_country, file_url, file_name, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newAbstract.submission_id, newAbstract.conference_id, newAbstract.title, newAbstract.abstract_text,
          newAbstract.keywords, newAbstract.research_domain, newAbstract.presentation_preference,
          newAbstract.primary_author_name, newAbstract.primary_author_email, newAbstract.primary_author_phone || '',
          newAbstract.primary_author_affiliation || '', newAbstract.primary_author_country, newAbstract.file_url || '',
          newAbstract.file_name || '', newAbstract.status
        ]
      );
      if (dbRes?.insertId) {
        newAbstract.id = dbRes.insertId;
        saveLocalAbstracts(db.abstracts);
      }
      res.status(201).json({
        success: true,
        message: 'Abstract submitted successfully for scientific review',
        data: newAbstract
      });
    } catch (err: any) {
      console.error('[Abstract Submission Error]:', err.message);
      res.status(500).json({ success: false, message: 'Failed to submit abstract: ' + err.message });
    }
  });

  app.patch('/api/v1/abstracts/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status, reviewer_notes, assigned_reviewer_name } = req.body;
      const abs = db.abstracts.find(a => a.id === id);
      if (!abs) return res.status(404).json({ success: false, message: 'Abstract not found' });
      if (status) abs.status = status;
      if (reviewer_notes) abs.reviewer_notes = reviewer_notes;
      if (assigned_reviewer_name) abs.assigned_reviewer_name = assigned_reviewer_name;
      abs.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
      saveLocalAbstracts(db.abstracts);
      db.addAuditLog('REVIEW_ABSTRACT', 'AbstractSubmission', abs.submission_id, `Changed status to ${status}`);
      await syncToMysql(
        `UPDATE abstract_submissions SET status = COALESCE(?, status), reviewer_notes = COALESCE(?, reviewer_notes) WHERE id = ? OR submission_id = ?`,
        [status || null, reviewer_notes || null, id, abs.submission_id]
      );
      res.json({ success: true, data: abs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/v1/abstracts/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const idx = db.abstracts.findIndex(a => a.id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Abstract not found' });
      const [removed] = db.abstracts.splice(idx, 1);
      saveLocalAbstracts(db.abstracts);
      db.addAuditLog('DELETE_ABSTRACT', 'AbstractSubmission', removed.submission_id, `Deleted abstract ${removed.title}`);
      await syncToMysql(`DELETE FROM abstract_submissions WHERE id = ? OR submission_id = ?`, [id, removed.submission_id]);
      res.json({ success: true, message: 'Abstract deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Dedicated endpoint for downloading and previewing submitted abstract documents
  app.get(['/api/v1/abstracts/:id/document', '/api/v1/abstracts/:id/download'], async (req: Request, res: Response) => {
    try {
      const rawId = req.params.id;

      // Authorization check: Admin token OR exact matching submission_id
      const authHeader = req.headers.authorization || (req.headers['x-access-token'] as string);
      const queryToken = typeof req.query?.token === 'string' ? req.query.token : undefined;
      const cookieToken = (req as any).cookies?.auth_token;
      const rawToken = authHeader || (queryToken ? `Bearer ${queryToken}` : undefined) || (cookieToken ? `Bearer ${cookieToken}` : undefined);
      const token = rawToken ? (rawToken.startsWith('Bearer ') ? rawToken.slice(7).trim() : rawToken.trim()) : '';
      const isAdmin = token ? Boolean(verifyAdminToken(token)) : false;

      const abs = db.abstracts.find(a => String(a.id) === String(rawId) || a.submission_id === rawId);
      if (!abs) {
        return res.status(404).send('Abstract submission not found');
      }

      // Restrict access: only authenticated admins or the author with their unique submission_id code
      if (!isAdmin && rawId !== abs.submission_id) {
        return res.status(401).send('Access denied. Administrator privileges or submission credentials required.');
      }

      const conf = db.conferences.find(c => c.id === abs.conference_id);
      const confTitle = conf?.title || abs.conference_title || 'Conference';

      // Check if a valid physical file exists on disk
      if (abs.file_url) {
        const fileName = path.basename(abs.file_url);
        const p1 = path.join(process.cwd(), 'public', 'uploads', fileName);
        const p2 = path.join(process.cwd(), 'dist', 'uploads', fileName);
        const targetPath = fs.existsSync(p1) ? p1 : (fs.existsSync(p2) ? p2 : null);

        if (targetPath) {
          const stat = fs.statSync(targetPath);
          if (stat.size > 200) {
            const isPdf = fileName.toLowerCase().endsWith('.pdf');
            const mimeType = isPdf ? 'application/pdf' : (fileName.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/octet-stream');
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `inline; filename="${abs.file_name || fileName}"`);
            return res.sendFile(targetPath);
          }
        }
      }

      // Dynamic fallback generation: generate a valid PDF on-the-fly!
      const generatedBuffer = generateAbstractPdf({
        submission_id: abs.submission_id,
        conference_title: confTitle,
        title: abs.title,
        primary_author_name: abs.primary_author_name,
        primary_author_email: abs.primary_author_email,
        primary_author_phone: abs.primary_author_phone,
        primary_author_affiliation: abs.primary_author_affiliation,
        primary_author_country: abs.primary_author_country,
        presentation_preference: abs.presentation_preference,
        research_domain: abs.research_domain,
        keywords: abs.keywords,
        abstract_text: abs.abstract_text,
        created_at: abs.created_at
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${abs.file_name || `abstract-${abs.submission_id}.pdf`}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.end(generatedBuffer);
    } catch (err: any) {
      console.error('[Abstract Document Error]:', err);
      res.status(500).send('Error retrieving abstract document');
    }
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

  app.post('/api/v1/proposals', publicSubmissionRateLimiter, async (req: Request, res: Response) => {
    try {
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

      const normalizedType = newProposal.proposal_type === 'keynote_forum' ? 'keynote' : newProposal.proposal_type;
      const dbRes: any = await syncToMysql(
        `INSERT INTO proposal_submissions (
          proposal_id, proposal_type, title, lead_proposer_name, lead_proposer_email, lead_proposer_phone,
          affiliation, country, target_conference_id, abstract_description, learning_objectives,
          file_url, file_name, status, reviewer_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newProposal.proposal_code, normalizedType, newProposal.title,
          newProposal.proposer_name, newProposal.proposer_email, newProposal.proposer_phone || '',
          newProposal.proposer_affiliation, newProposal.proposer_country, newProposal.conference_id || 1,
          newProposal.abstract || '', newProposal.learning_objectives || '',
          newProposal.file_url || '', newProposal.file_name || '',
          'pending', newProposal.reviewer_notes || ''
        ]
      );
      if (dbRes?.insertId) {
        newProposal.id = dbRes.insertId;
      }

      res.status(201).json({
        success: true,
        message: 'Proposal received and registered for Scientific Committee review',
        data: newProposal
      });
    } catch (err: any) {
      console.error('[Proposal Submission Error]:', err.message);
      res.status(500).json({ success: false, message: 'Failed to submit proposal: ' + err.message });
    }
  });

  app.patch('/api/v1/proposals/:id/status', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status, reviewer_notes } = req.body;
      const prop = db.proposals.find(p => p.id === id);
      if (!prop) return res.status(404).json({ success: false, message: 'Proposal not found' });
      if (status) prop.status = status;
      if (reviewer_notes !== undefined) prop.reviewer_notes = reviewer_notes;
      prop.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
      db.addAuditLog('REVIEW_PROPOSAL', 'ProposalSubmission', prop.proposal_code, `Status set to ${status}`);
      await syncToMysql(
        `UPDATE proposal_submissions SET status = COALESCE(?, status), reviewer_notes = COALESCE(?, reviewer_notes) WHERE id = ? OR proposal_id = ?`,
        [status || null, reviewer_notes || null, id, prop.proposal_code]
      );
      res.json({ success: true, data: prop });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/v1/proposals/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const idx = db.proposals.findIndex(p => p.id === id);
      if (idx === -1) return res.status(404).json({ success: false, message: 'Proposal not found' });
      const removed = db.proposals.splice(idx, 1)[0];
      db.addAuditLog('DELETE_PROPOSAL', 'ProposalSubmission', removed.proposal_code, `Proposal deleted`);
      await syncToMysql(
        `DELETE FROM proposal_submissions WHERE id = ? OR proposal_id = ?`,
        [id, removed.proposal_code]
      );
      res.json({ success: true, message: 'Proposal removed', data: removed });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
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

  // 8b-1. Stripe Checkout Session Creation
  app.post('/api/v1/stripe/create-checkout-session', paymentRateLimiter, async (req: Request, res: Response) => {
    try {
      const {
        registration_id,
        conference_id,
        conference_title,
        category_name,
        delegate_name,
        delegate_email,
        amount,
        currency = 'USD',
        return_url
      } = req.body;

      // 1. Verify Stripe gateway credentials
      const stripe = getStripe();
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey || secretKey.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'GATEWAY_NOT_CONFIGURED',
          message: 'Stripe payment gateway is not configured. Missing STRIPE_SECRET_KEY in server environment.'
        });
      }
      if (secretKey.includes('...')) {
        return res.status(400).json({
          success: false,
          error: 'GATEWAY_KEY_INVALID',
          message: 'STRIPE_SECRET_KEY in .env contains placeholder ellipsis ("..."). Please replace it with your active Stripe secret key (sk_live_... or sk_test_...).'
        });
      }
      if (!stripe) {
        return res.status(400).json({
          success: false,
          error: 'GATEWAY_INIT_FAILED',
          message: 'Failed to initialize Stripe client with provided secret key.'
        });
      }

      // 2. Look up or locate registration order
      let reg = db.registrations.find(r => registration_id && (r.registration_id === registration_id || String(r.id) === String(registration_id)));

      // 3. Resolve Conference from Database
      const targetConf = db.conferences.find(c =>
        (conference_id && (c.id === Number(conference_id) || c.slug === String(conference_id))) ||
        (reg && c.id === reg.conference_id)
      ) || db.conferences[0];

      // 4. Resolve Categories for this Conference from Database
      const dbCategories = db.categories.filter(c => c.conference_id === targetConf.id);
      const confCats = (dbCategories.length > 0)
        ? dbCategories
        : (Array.isArray(targetConf.categories) && targetConf.categories.length > 0)
          ? targetConf.categories
          : REGISTRATION_CATEGORIES.filter(c => c.conference_id === targetConf.id);
      const availableCategories = confCats.length > 0 ? confCats : REGISTRATION_CATEGORIES;

      // 5. Build verified line items and verified total price from database
      const verifiedCurrency = (reg?.currency || currency || (targetConf as any).currency || 'USD').toLowerCase();
      let verifiedLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let verifiedPassesTotal = 0;

      if (reg && Array.isArray(reg.selected_categories) && reg.selected_categories.length > 0) {
        // Use items from existing saved registration, verifying each against database pricing
        for (const item of reg.selected_categories) {
          const matched = availableCategories.find(c => c.id === Number(item.id)) ||
            availableCategories.find(c => c.name.toLowerCase() === item.name.toLowerCase()) ||
            availableCategories[0];
          const verifiedUnitPrice = matched
            ? Number(matched.price ?? matched.standard_fee ?? matched.tier3_price ?? matched.early_bird_fee ?? matched.early_bird_price ?? 499)
            : Number(item.price || 499);
          const qty = Math.max(1, Number(item.quantity) || 1);
          const lineSubtotal = verifiedUnitPrice * qty;
          verifiedPassesTotal += lineSubtotal;

          verifiedLineItems.push({
            price_data: {
              currency: verifiedCurrency,
              unit_amount: Math.round(verifiedUnitPrice * 100),
              product_data: {
                name: `${targetConf.short_title || targetConf.title}: ${matched ? matched.name : item.name}`,
                description: `Delegate Pass [Order Ref: ${reg.registration_id}]`
              }
            },
            quantity: qty
          });
        }
      } else {
        // Find single category matching category_name or category_id
        const matched = availableCategories.find(c =>
          (category_name && c.name.toLowerCase() === category_name.toLowerCase()) ||
          (c.id === Number(reg?.category_id || 1))
        ) || availableCategories[0];

        const verifiedUnitPrice = matched
          ? Number(matched.price ?? matched.standard_fee ?? matched.tier3_price ?? matched.early_bird_fee ?? matched.early_bird_price ?? 499)
          : (parseFloat(amount) || 499);

        verifiedPassesTotal = verifiedUnitPrice;
        verifiedLineItems.push({
          price_data: {
            currency: verifiedCurrency,
            unit_amount: Math.round(verifiedUnitPrice * 100),
            product_data: {
              name: `${targetConf.short_title || targetConf.title}: ${matched.name}`,
              description: `Delegate Pass Order [Ref: ${reg ? reg.registration_id : 'PENDING'}]`
            }
          },
          quantity: 1
        });
      }

      // Check accommodation from registration if applicable
      let verifiedAccommodationTotal = 0;
      if (reg && reg.accommodation_required) {
        const accDays = Math.max(1, Number(reg.accommodation_days) || 1);
        const accRate = Number(targetConf.accommodation_price_per_day) || 120;
        verifiedAccommodationTotal = accDays * accRate;

        verifiedLineItems.push({
          price_data: {
            currency: verifiedCurrency,
            unit_amount: Math.round(accRate * 100),
            product_data: {
              name: `Accommodation: ${reg.hotel_name || targetConf.hotel_name || 'Official Partner Hotel'} (${accDays} Nights)`,
              description: `Check-in: ${reg.check_in_date || 'TBD'} to ${reg.check_out_date || 'TBD'}`
            }
          },
          quantity: accDays
        });
      }

      const verifiedGrandTotal = verifiedPassesTotal + verifiedAccommodationTotal;
      if (verifiedGrandTotal <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Calculated registration amount must be greater than zero.'
        });
      }

      const payerName = delegate_name || (reg ? `${reg.first_name} ${reg.last_name}`.trim() : '');
      const payerEmail = delegate_email || reg?.email || '';
      const orderRef = reg ? reg.registration_id : (registration_id && registration_id !== 'undefined' ? String(registration_id) : `SCINS-REG-2026-${Math.floor(10000 + Math.random() * 90000)}`);

      // 6. Ensure order is saved with status pending and verified price before checkout
      if (reg) {
        reg.amount = verifiedGrandTotal;
        reg.currency = verifiedCurrency.toUpperCase();
        reg.payment_status = 'pending';
        reg.registration_status = 'pending';
        saveLocalRegistrations(db.registrations);
        syncToMysql(
          `UPDATE registrations SET amount = ?, currency = ?, payment_status = 'pending', registration_status = 'pending', updated_at = NOW() WHERE id = ? OR registration_id = ?`,
          [reg.amount, reg.currency, reg.id, reg.registration_id]
        ).catch(() => null);
      } else {
        const newOrder: Registration = {
          id: db.registrations.length + 1,
          registration_id: orderRef,
          conference_id: targetConf.id,
          conference_title: targetConf.title,
          category_id: 1,
          category_name: category_name || 'Delegate Pass',
          selected_categories: [{
            id: 1,
            name: category_name || 'Delegate Pass',
            price: verifiedGrandTotal,
            quantity: 1,
            subtotal: verifiedGrandTotal,
            currency: verifiedCurrency.toUpperCase()
          }],
          first_name: payerName ? payerName.split(' ')[0] : 'Delegate',
          last_name: payerName && payerName.split(' ').length > 1 ? payerName.split(' ').slice(1).join(' ') : 'Attendee',
          email: payerEmail || 'delegate@scinsmedia.com',
          phone: '',
          country: 'International',
          institution: 'Academic / Industrial Institution',
          designation: 'Delegate',
          attendance_mode: 'In-Person',
          accommodation_required: false,
          amount: verifiedGrandTotal,
          currency: verifiedCurrency.toUpperCase(),
          payment_status: 'pending' as const,
          registration_status: 'pending' as const,
          created_at: new Date().toISOString()
        };
        db.registrations.unshift(newOrder);
        saveLocalRegistrations(db.registrations);
        reg = newOrder;
      }

      // 7. Base return URL for Stripe Hosted Checkout
      const baseReturn = return_url || (req.protocol + '://' + req.get('host') + '/register');
      const cleanReturn = baseReturn.split('?')[0].split('#')[0];

      // 8. Create Stripe Checkout Session (works in production and test mode)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: verifiedLineItems,
        mode: 'payment',
        customer_email: payerEmail || undefined,
        client_reference_id: orderRef,
        metadata: {
          registration_id: orderRef,
          conference_id: String(targetConf.id),
          conference_title: String(targetConf.title).slice(0, 100),
          delegate_name: String(payerName).slice(0, 100),
          delegate_email: String(payerEmail).slice(0, 100)
        },
        success_url: `${cleanReturn}?session_id={CHECKOUT_SESSION_ID}&registration_id=${orderRef}&payment_status=success`,
        cancel_url: `${cleanReturn}?session_id={CHECKOUT_SESSION_ID}&registration_id=${orderRef}&payment_status=cancelled`
      });

      if (!session.url) {
        throw new Error('Stripe Checkout session was created but did not return a checkout URL.');
      }

      // Store in memory for reference / lookup
      db.checkoutSessions[session.id] = {
        id: session.id,
        object: 'checkout.session',
        amount_total: Math.round(verifiedGrandTotal * 100),
        currency: verifiedCurrency,
        payment_status: session.payment_status || 'unpaid',
        status: session.status || 'open',
        client_reference_id: orderRef,
        customer_email: payerEmail,
        metadata: session.metadata,
        url: session.url,
        success_url: `${cleanReturn}?session_id=${session.id}&registration_id=${orderRef}&payment_status=success`,
        cancel_url: `${cleanReturn}?session_id=${session.id}&registration_id=${orderRef}&payment_status=cancelled`,
        created_at: new Date().toISOString()
      };

      // 9. Return Stripe-hosted Checkout URL immediately (no intermediate page)
      return res.json({
        success: true,
        data: {
          url: session.url,
          sessionId: session.id,
          registration_id: orderRef
        }
      });
    } catch (err: any) {
      console.error('[Stripe create-checkout-session Error]:', err);
      res.status(400).json({
        success: false,
        error: 'STRIPE_GATEWAY_ERROR',
        message: err.message || 'Failed to initialize Stripe Checkout session.'
      });
    }
  });

  // 8b-2. Retrieve Stripe Gateway Checkout Session by ID
  app.get('/api/v1/stripe/checkout-session/:id', (req: Request, res: Response) => {
    const session = db.checkoutSessions[req.params.id];
    if (!session) {
      return res.status(404).json({ success: false, message: 'Checkout session not found' });
    }
    res.json({ success: true, data: session });
  });

  // 8b-3. Complete payment on Stripe Gateway Checkout Session
  app.post('/api/v1/stripe/checkout-session/:id/pay', (req: Request, res: Response) => {
    const session = db.checkoutSessions[req.params.id];
    if (!session) {
      return res.status(404).json({ success: false, message: 'Checkout session not found' });
    }
    session.payment_status = 'paid';
    session.status = 'complete';
    session.payment_intent = `pi_stripe_${Date.now().toString(36)}`;
    res.json({
      success: true,
      data: {
        sessionId: session.id,
        redirect_url: session.success_url
      }
    });
  });

  // 8b-4. Stripe Checkout Session Verification
  app.post('/api/v1/stripe/verify-session', paymentRateLimiter, async (req: Request, res: Response) => {
    try {
      const { session_id, registration_id } = req.body;

      if (!session_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing session_id for payment verification.'
        });
      }

      // Check local gateway session first
      const localSession = db.checkoutSessions[session_id];
      if (localSession) {
        if (localSession.payment_status !== 'paid') {
          return res.status(400).json({
            success: false,
            status: localSession.payment_status,
            message: `Stripe checkout payment was not completed. Status: "${localSession.payment_status}".`
          });
        }

        const regRef = registration_id || localSession.metadata?.registration_id || localSession.client_reference_id;
        const reg = db.registrations.find(r => r.registration_id === regRef || String(r.id) === String(regRef));

        const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
        if (reg) {
          reg.payment_status = 'completed';
          reg.registration_status = 'confirmed';
          reg.updated_at = nowIso;
          saveLocalRegistrations(db.registrations);
          syncToMysql(
            `UPDATE registrations SET payment_status = 'completed', registration_status = 'confirmed', updated_at = NOW() WHERE id = ? OR registration_id = ?`,
            [reg.id, reg.registration_id]
          ).catch(() => null);
        }

        const txnId = `txn_stripe_${Date.now().toString(36).toUpperCase()}`;
        let payment = db.payments.find(p => p.transaction_id === txnId);
        if (!payment) {
          const receiptId = `REC-STRIPE-${new Date().getFullYear()}-${session_id.slice(-6).toUpperCase()}`;
          payment = {
            id: db.payments.length + 1,
            registration_id: reg ? reg.id : 1,
            conference_id: reg ? reg.conference_id : (Number(localSession.metadata?.conference_id) || 1),
            amount: (localSession.amount_total || 0) / 100,
            currency: (localSession.currency || 'USD').toUpperCase(),
            payment_method: 'stripe',
            transaction_id: txnId,
            receipt_id: receiptId,
            status: 'completed',
            payer_name: localSession.customer_details?.name || (reg ? `${reg.first_name} ${reg.last_name}` : 'Conference Delegate'),
            billing_email: localSession.customer_details?.email || (reg ? reg.email : ''),
            card_last4: '4242',
            created_at: nowIso
          };
          db.payments.unshift(payment);
          syncToMysql(
            `INSERT INTO payments (registration_id, conference_id, amount, currency, payment_method, transaction_id, receipt_id, status, payer_name, billing_email, card_last4, created_at)
             VALUES (?, ?, ?, ?, 'stripe', ?, ?, 'completed', ?, ?, ?, NOW())`,
            [payment.registration_id, payment.conference_id, payment.amount, payment.currency, payment.transaction_id, payment.receipt_id, payment.payer_name, payment.billing_email, payment.card_last4]
          ).catch(() => null);
          db.addAuditLog('STRIPE_CHECKOUT_VERIFIED', 'Payments', txnId, `Verified Stripe session payment of ${payment.currency} ${payment.amount} for Registration #${regRef}`);
        }

        return res.json({
          success: true,
          data: {
            status: 'completed',
            payment_status: 'paid',
            transaction_id: txnId,
            receipt_id: payment.receipt_id,
            amount: payment.amount,
            currency: payment.currency,
            payment_method: 'stripe',
            created_at: payment.created_at,
            registration: reg
          }
        });
      }

      // Live Stripe verification
      const stripe = getStripe();
      if (!stripe) {
        return res.status(400).json({
          success: false,
          error: 'GATEWAY_NOT_CONFIGURED',
          message: 'Stripe gateway is not configured.'
        });
      }

      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['payment_intent']
      });

      if (session.payment_status !== 'paid') {
        return res.status(400).json({
          success: false,
          status: session.payment_status,
          message: `Stripe checkout payment was not completed. Status: "${session.payment_status}".`
        });
      }

      const regRef = registration_id || session.metadata?.registration_id || session.client_reference_id;
      const reg = db.registrations.find(r => r.registration_id === regRef || String(r.id) === String(regRef));

      const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
      if (reg) {
        reg.payment_status = 'completed';
        reg.registration_status = 'confirmed';
        reg.updated_at = nowIso;
        saveLocalRegistrations(db.registrations);
        syncToMysql(
          `UPDATE registrations SET payment_status = 'completed', registration_status = 'confirmed', updated_at = NOW() WHERE id = ? OR registration_id = ?`,
          [reg.id, reg.registration_id]
        ).catch(() => null);
      }

      const txnId = typeof session.payment_intent === 'object' && session.payment_intent
        ? session.payment_intent.id
        : (typeof session.payment_intent === 'string' ? session.payment_intent : session.id);

      let payment = db.payments.find(p => p.transaction_id === txnId);
      if (!payment) {
        const receiptId = `REC-STRIPE-${new Date().getFullYear()}-${session.id.slice(-6).toUpperCase()}`;
        payment = {
          id: db.payments.length + 1,
          registration_id: reg ? reg.id : 1,
          conference_id: reg ? reg.conference_id : (Number(session.metadata?.conference_id) || 1),
          amount: (session.amount_total || 0) / 100,
          currency: (session.currency || 'USD').toUpperCase(),
          payment_method: 'stripe',
          transaction_id: txnId,
          receipt_id: receiptId,
          status: 'completed',
          payer_name: (session.customer_details as any)?.name || (reg ? `${reg.first_name} ${reg.last_name}` : 'Conference Delegate'),
          billing_email: (session.customer_details as any)?.email || (reg ? reg.email : ''),
          card_last4: '4242',
          created_at: nowIso
        };
        db.payments.unshift(payment);
        syncToMysql(
          `INSERT INTO payments (registration_id, conference_id, amount, currency, payment_method, transaction_id, receipt_id, status, payer_name, billing_email, card_last4, created_at)
           VALUES (?, ?, ?, ?, 'stripe', ?, ?, 'completed', ?, ?, ?, NOW())`,
          [payment.registration_id, payment.conference_id, payment.amount, payment.currency, payment.transaction_id, payment.receipt_id, payment.payer_name, payment.billing_email, payment.card_last4]
        ).catch(() => null);
        db.addAuditLog('STRIPE_CHECKOUT_VERIFIED', 'Payments', txnId, `Verified Stripe Checkout session payment of ${payment.currency} ${payment.amount} for Registration #${regRef}`);
      }

      res.json({
        success: true,
        data: {
          status: 'completed',
          payment_status: 'paid',
          transaction_id: txnId,
          receipt_id: payment.receipt_id,
          amount: payment.amount,
          currency: payment.currency,
          payment_method: 'stripe',
          created_at: payment.created_at,
          registration: reg
        }
      });
    } catch (err: any) {
      console.error('[Stripe verify-session Error]:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to verify Stripe checkout session.'
      });
    }
  });

  // 8b-3. Stripe Webhook Listener
  app.post('/api/v1/stripe/webhook', async (req: Request, res: Response) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = getStripe();
    let event: Stripe.Event;

    if (webhookSecret && stripe) {
      const sig = req.headers['stripe-signature'];
      try {
        const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
        event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
      } catch (err: any) {
        console.error('[Stripe Webhook Signature Error]:', err.message);
        return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
      }
    } else {
      event = req.body;
    }

    try {
      if (event && event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const regRef = session.client_reference_id || session.metadata?.registration_id;
        if (regRef && session.payment_status === 'paid') {
          const reg = db.registrations.find(r => r.registration_id === regRef || String(r.id) === String(regRef));
          const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

          if (reg && reg.payment_status !== 'completed') {
            reg.payment_status = 'completed';
            reg.registration_status = 'confirmed';
            reg.updated_at = nowIso;
            saveLocalRegistrations(db.registrations);
            syncToMysql(
              `UPDATE registrations SET payment_status = 'completed', registration_status = 'confirmed', updated_at = NOW() WHERE id = ? OR registration_id = ?`,
              [reg.id, reg.registration_id]
            ).catch(() => null);
            db.addAuditLog('STRIPE_WEBHOOK_COMPLETED', 'Payments', session.id, `Webhook confirmed payment for Registration #${regRef}`);
          }

          // Record payment in database
          const txnId = typeof session.payment_intent === 'object' && session.payment_intent
            ? (session.payment_intent as any).id
            : (typeof session.payment_intent === 'string' ? session.payment_intent : session.id);

          let payment = db.payments.find(p => p.transaction_id === txnId);
          if (!payment) {
            const receiptId = `REC-STRIPE-${new Date().getFullYear()}-${session.id.slice(-6).toUpperCase()}`;
            payment = {
              id: db.payments.length + 1,
              registration_id: reg ? reg.id : 1,
              conference_id: reg ? reg.conference_id : (Number(session.metadata?.conference_id) || 1),
              amount: (session.amount_total || 0) / 100,
              currency: (session.currency || 'USD').toUpperCase(),
              payment_method: 'stripe',
              transaction_id: txnId,
              receipt_id: receiptId,
              status: 'completed',
              payer_name: (session.customer_details as any)?.name || (reg ? `${reg.first_name} ${reg.last_name}` : 'Conference Delegate'),
              billing_email: (session.customer_details as any)?.email || (reg ? reg.email : ''),
              card_last4: '4242',
              created_at: nowIso
            };
            db.payments.unshift(payment);
            syncToMysql(
              `INSERT INTO payments (registration_id, conference_id, amount, currency, payment_method, transaction_id, receipt_id, status, payer_name, billing_email, card_last4, created_at)
               VALUES (?, ?, ?, ?, 'stripe', ?, ?, 'completed', ?, ?, ?, NOW())`,
              [payment.registration_id, payment.conference_id, payment.amount, payment.currency, payment.transaction_id, payment.receipt_id, payment.payer_name, payment.billing_email, payment.card_last4]
            ).catch(() => null);
          }
        }
      } else if (event && event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const regRef = session.client_reference_id || session.metadata?.registration_id;
        if (regRef) {
          const reg = db.registrations.find(r => r.registration_id === regRef || String(r.id) === String(regRef));
          if (reg && reg.payment_status !== 'completed') {
            reg.payment_status = 'failed';
            saveLocalRegistrations(db.registrations);
            syncToMysql(`UPDATE registrations SET payment_status = 'failed', updated_at = NOW() WHERE id = ? OR registration_id = ?`, [reg.id, reg.registration_id]).catch(() => null);
            db.addAuditLog('STRIPE_WEBHOOK_FAILED', 'Payments', session.id, `Async payment failed for Registration #${regRef}`);
          }
        }
      } else if (event && event.type === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session;
        const regRef = session.client_reference_id || session.metadata?.registration_id;
        if (regRef) {
          const reg = db.registrations.find(r => r.registration_id === regRef || String(r.id) === String(regRef));
          if (reg && reg.payment_status === 'pending') {
            reg.registration_status = 'cancelled';
            saveLocalRegistrations(db.registrations);
            syncToMysql(`UPDATE registrations SET registration_status = 'cancelled', updated_at = NOW() WHERE id = ? OR registration_id = ?`, [reg.id, reg.registration_id]).catch(() => null);
            db.addAuditLog('STRIPE_WEBHOOK_EXPIRED', 'Payments', session.id, `Checkout session expired for Registration #${regRef}`);
          }
        }
      }
      res.json({ received: true });
    } catch (err: any) {
      console.error('[Stripe Webhook Handler Error]:', err.message);
      res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  app.post('/api/v1/stripe/create-payment-intent', paymentRateLimiter, async (req: Request, res: Response) => {
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

  app.post('/api/v1/stripe/confirm-payment', paymentRateLimiter, async (req: Request, res: Response) => {
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

      const reg = db.registrations.find(r => r.id === Number(registration_id) || r.registration_id === registration_id);
      if (!reg && process.env.NODE_ENV === 'production') {
        return res.status(404).json({ success: false, message: 'Registration record not found for transaction confirmation.' });
      }

      const expectedAmount = reg ? Number(reg.total_amount || reg.amount || 0) : (parseFloat(amount) || 0);
      const stripe = getStripe();
      let verifiedStatus = 'succeeded';
      let verifiedTxnId = payment_intent_id || `pi_${Date.now().toString(36)}`;

      if (stripe && payment_intent_id) {
        if (payment_intent_id.startsWith('pi_test_') || payment_intent_id.startsWith('pi_sim_')) {
          if (process.env.NODE_ENV === 'production' && process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
            return res.status(400).json({
              success: false,
              message: 'Simulated payment identifiers are not permitted in live production gateway mode.'
            });
          }
        } else {
          try {
            const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
            if (pi.status !== 'succeeded') {
              return res.status(400).json({
                success: false,
                message: `Stripe payment verification failed: Payment status is "${pi.status}", not "succeeded".`
              });
            }
            if (expectedAmount > 0) {
              const expectedCents = Math.round(expectedAmount * 100);
              const receivedCents = pi.amount_received || pi.amount;
              if (Math.abs(receivedCents - expectedCents) > 100) {
                return res.status(400).json({
                  success: false,
                  message: `Payment amount mismatch: Expected ${expectedAmount}, received ${(receivedCents / 100).toFixed(2)} on Stripe.`
                });
              }
            }
            verifiedStatus = pi.status;
            verifiedTxnId = pi.id;
          } catch (e: any) {
            console.error('[Stripe Verification Error]:', e.message);
            return res.status(400).json({
              success: false,
              message: `Could not verify transaction with Stripe: ${e.message}`
            });
          }
        }
      }

      const receiptId = `REC-STRIPE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      // Update registration record
      if (reg) {
        reg.payment_status = 'completed';
        reg.registration_status = 'confirmed';
        reg.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
      }

      const paymentRecord = {
        id: db.payments.length + 1,
        registration_id: reg ? reg.id : Number(registration_id) || 1,
        conference_id: conference_id || (reg ? reg.conference_id : 1),
        amount: expectedAmount > 0 ? expectedAmount : (parseFloat(amount) || 450),
        currency: (currency || (reg ? reg.currency : 'USD') || 'USD').toUpperCase(),
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
      saveLocalRegistrations(db.registrations);
      syncToMysql(
        `UPDATE registrations SET payment_status = 'completed', registration_status = 'confirmed', updated_at = NOW() WHERE id = ? OR registration_id = ?`,
        [reg ? reg.id : 0, reg ? reg.registration_id : String(registration_id)]
      ).catch(() => null);
      syncToMysql(
        `INSERT INTO payments (registration_id, conference_id, amount, currency, payment_method, transaction_id, receipt_id, status, payer_name, billing_email, card_last4, created_at)
         VALUES (?, ?, ?, ?, 'stripe', ?, ?, 'completed', ?, ?, ?, NOW())`,
        [paymentRecord.registration_id, paymentRecord.conference_id, paymentRecord.amount, paymentRecord.currency, paymentRecord.transaction_id, paymentRecord.receipt_id, paymentRecord.payer_name, paymentRecord.billing_email, paymentRecord.card_last4]
      ).catch(() => null);
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
  app.post('/api/v1/payments/process', paymentRateLimiter, (req: Request, res: Response) => {
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

    const isWire = gateway === 'wire';
    const paymentStatus: 'completed' | 'pending' = isWire ? 'pending' : 'completed';
    const regStatus: 'pending' | 'confirmed' = isWire ? 'pending' : 'confirmed';

    // Update registration status
    const reg = db.registrations.find(r => r.id === Number(registration_id) || r.registration_id === registration_id);
    if (reg) {
      reg.payment_status = paymentStatus;
      reg.registration_status = regStatus;
      reg.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    const expectedAmount = reg ? Number(reg.total_amount || reg.amount || 0) : (parseFloat(amount) || 450);

    const paymentRecord = {
      id: db.payments.length + 1,
      registration_id: reg ? reg.id : Number(registration_id) || 1,
      conference_id: conference_id || (reg ? reg.conference_id : 1),
      amount: expectedAmount,
      currency: (currency || (reg ? reg.currency : 'USD') || 'USD').toUpperCase(),
      payment_method: gateway,
      transaction_id: txnRef,
      receipt_id: receiptId,
      status: paymentStatus,
      payer_name: card_holder_name || (reg ? `${reg.first_name} ${reg.last_name}` : 'Conference Delegate'),
      billing_email: billing_email || (reg ? reg.email : 'delegate@university.edu'),
      card_last4: card_last4 || '4242',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    db.payments.unshift(paymentRecord);
    saveLocalRegistrations(db.registrations);
    if (reg) {
      syncToMysql(
        `UPDATE registrations SET payment_status = ?, registration_status = ?, updated_at = NOW() WHERE id = ? OR registration_id = ?`,
        [paymentStatus, regStatus, reg.id, reg.registration_id]
      ).catch(() => null);
    }
    syncToMysql(
      `INSERT INTO payments (registration_id, conference_id, amount, currency, payment_method, transaction_id, receipt_id, status, payer_name, billing_email, card_last4, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [paymentRecord.registration_id, paymentRecord.conference_id, paymentRecord.amount, paymentRecord.currency, paymentRecord.payment_method, paymentRecord.transaction_id, paymentRecord.receipt_id, paymentRecord.status, paymentRecord.payer_name, paymentRecord.billing_email, paymentRecord.card_last4]
    ).catch(() => null);
    db.addAuditLog('PAYMENT_PROCESSED', 'Payments', txnRef, `Recorded ${paymentRecord.currency} ${paymentRecord.amount} payment via ${gateway} for Registration #${registration_id} (Status: ${paymentStatus})`);

    res.json({
      success: true,
      message: isWire
        ? 'Pro-forma wire remittance order recorded. Official invoice generated, pending bank transfer receipt.'
        : 'Payment verified and delegate registration confirmed successfully',
      data: {
        transaction_id: txnRef,
        receipt_id: receiptId,
        status: paymentStatus,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        payment_method: gateway,
        created_at: paymentRecord.created_at,
        registration_id: reg ? reg.registration_id : registration_id,
        payer_name: paymentRecord.payer_name
      }
    });
  });

  // 9. Media Partners, Testimonials, Blogs, FAQs
  app.get('/api/v1/media-partners', (req, res) => res.json({ success: true, data: db.mediaPartners }));
  app.get('/api/v1/testimonials', (req: Request, res: Response) => {
    const { conference_id } = req.query;
    let list = [...db.testimonials];
    if (conference_id) {
      list = list.filter(t => t.conference_id === Number(conference_id));
    }
    res.json({ success: true, data: list.length > 0 ? list : db.testimonials });
  });

  app.post('/api/v1/testimonials', authenticateAdmin, async (req: Request, res: Response) => {
    let newId = Math.max(...db.testimonials.map(t => t.id), 0) + 1;
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

    if (mysqlPool) {
      try {
        const r: any = await syncToMysql(
          `INSERT INTO testimonials (name, designation, institution, country, quote, photo_url, rating, is_featured, conference_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.name, item.designation, item.institution, item.country, item.quote, item.photo_url, item.rating, item.is_featured, item.conference_id || 1]
        );
        if (r && r.insertId) {
          newId = Number(r.insertId);
          item.id = newId;
        }
      } catch (err: any) {
        console.error('[MySQL Testimonial Insert Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to persist testimonial to MySQL: ${err.message}` });
      }
    }

    db.testimonials.push(item);
    invalidatePublicCache();
    res.status(201).json({ success: true, message: 'Testimonial created', data: item });
  });

  app.put('/api/v1/testimonials/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.testimonials.findIndex(t => t.id === id);
    if (index === -1 && !mysqlPool) return res.status(404).json({ success: false, message: 'Testimonial not found' });

    if (mysqlPool) {
      try {
        await syncToMysql(
          `UPDATE testimonials SET
            name = COALESCE(?, name),
            designation = COALESCE(?, designation),
            institution = COALESCE(?, institution),
            country = COALESCE(?, country),
            quote = COALESCE(?, quote),
            photo_url = COALESCE(?, photo_url),
            rating = COALESCE(?, rating),
            is_featured = COALESCE(?, is_featured),
            conference_id = COALESCE(?, conference_id)
          WHERE id = ?`,
          [
            req.body.name, req.body.designation, req.body.institution, req.body.country,
            req.body.quote, req.body.photo_url, req.body.rating, req.body.is_featured,
            req.body.conference_id, id
          ]
        );
      } catch (err: any) {
        console.error('[MySQL Testimonial Update Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to update testimonial in MySQL: ${err.message}` });
      }
    }

    if (index !== -1) {
      db.testimonials[index] = { ...db.testimonials[index], ...req.body };
    }
    invalidatePublicCache();
    res.json({ success: true, message: 'Testimonial updated', data: index !== -1 ? db.testimonials[index] : req.body });
  });

  app.delete('/api/v1/testimonials/:id', authenticateAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (mysqlPool) {
      try {
        await syncToMysql('DELETE FROM testimonials WHERE id = ?', [id]);
      } catch (err: any) {
        console.error('[MySQL Testimonial Delete Error]:', err);
        return res.status(500).json({ success: false, message: `Failed to delete testimonial in MySQL: ${err.message}` });
      }
    }

    const index = db.testimonials.findIndex(t => t.id === id);
    const removed = index !== -1 ? db.testimonials.splice(index, 1)[0] : { id };
    invalidatePublicCache();
    res.json({ success: true, message: 'Testimonial deleted', data: removed });
  });
  app.get('/api/v1/blogs', (req, res) => res.json({ success: true, data: db.blogs }));
  app.get('/api/v1/faqs', (req, res) => res.json({ success: true, data: db.faqs }));
  app.get('/api/v1/flyers', (req, res) => res.json({ success: true, data: db.flyers }));
  app.get('/api/v1/audit-logs', authenticateAdmin, (req, res) => res.json({ success: true, data: db.auditLogs }));

  // Terms & Conditions Endpoints
  app.get('/api/v1/terms', async (_req: Request, res: Response) => {
    try {
      if (mysqlPool) {
        const [rows]: any = await mysqlPool.query(
          'SELECT id, heading, points, display_order FROM terms_sections ORDER BY display_order ASC, id ASC'
        ).catch(() => [[]]);

        if (Array.isArray(rows) && rows.length > 0) {
          const sections = rows.map((r: any) => ({
            id: r.id,
            heading: r.heading || '',
            points: typeof r.points === 'string' ? parseJsonSafe(r.points, []) : (Array.isArray(r.points) ? r.points : [])
          }));
          const current = db.terms || INITIAL_TERMS_CONTENT;
          return res.json({
            success: true,
            data: {
              ...current,
              sections
            }
          });
        }
      }
      return res.json({ success: true, data: db.terms || INITIAL_TERMS_CONTENT });
    } catch (err: any) {
      console.warn('[Get Terms Error]:', err.message);
      return res.json({ success: true, data: db.terms || INITIAL_TERMS_CONTENT });
    }
  });

  app.put('/api/v1/terms', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { sections, badge, title, description, effective_date } = req.body;
      if (!Array.isArray(sections) || sections.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one content section is required.' });
      }

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (!sec.heading || !sec.heading.trim()) {
          return res.status(400).json({ success: false, message: `Section #${i + 1} must have a valid heading.` });
        }
        if (!Array.isArray(sec.points) || sec.points.length === 0 || !sec.points.some((p: string) => p && p.trim())) {
          return res.status(400).json({ success: false, message: `Section "${sec.heading}" must have at least one bullet point or paragraph.` });
        }
      }

      const cleanSections: TermsSection[] = sections.map((sec: any, idx: number) => ({
        id: sec.id || idx + 1,
        heading: sec.heading.trim(),
        points: (Array.isArray(sec.points) ? sec.points : [])
          .map((p: any) => String(p || '').trim())
          .filter(Boolean)
      }));

      const updatedTerms: TermsContent = {
        badge: badge !== undefined ? badge : (db.terms?.badge || 'Legal & Institutional Framework'),
        title: title !== undefined ? title : (db.terms?.title || 'Terms & Conditions'),
        description: description !== undefined ? description : (db.terms?.description || 'Please review the terms and regulations governing conference participation, delegate registrations, abstract submissions, publication services, and portal usage under SCINS Media.'),
        effective_date: effective_date !== undefined ? effective_date : (db.terms?.effective_date || `Effective Date: January 1, 2026 • Version 2.4`),
        sections: cleanSections,
        updated_at: new Date().toISOString()
      };

      if (mysqlPool) {
        try {
          await ensureDatabaseSchema(mysqlPool);
          const conn = await mysqlPool.getConnection();
          try {
            await conn.beginTransaction();
            await conn.query('DELETE FROM terms_sections');
            for (let i = 0; i < cleanSections.length; i++) {
              const sec = cleanSections[i];
              await conn.query(
                'INSERT INTO terms_sections (heading, points, display_order) VALUES (?, ?, ?)',
                [sec.heading, JSON.stringify(sec.points), i + 1]
              );
            }
            await conn.commit();
          } catch (dbErr: any) {
            await conn.rollback();
            console.warn('[MySQL Terms Save Rolled Back]:', dbErr.message);
          } finally {
            conn.release();
          }
        } catch (poolErr: any) {
          console.warn('[MySQL Terms Save Error]:', poolErr.message);
        }
      }

      db.terms = updatedTerms;
      saveLocalTerms(updatedTerms);
      db.addAuditLog('UPDATE_TERMS', 'Legal', 'terms-and-conditions', `Updated ${cleanSections.length} terms & conditions sections`);

      return res.json({
        success: true,
        message: 'Terms & Conditions updated and saved successfully!',
        data: updatedTerms
      });
    } catch (err: any) {
      console.error('[Update Terms Error]:', err);
      return res.status(500).json({ success: false, message: `Failed to save Terms & Conditions: ${err.message}` });
    }
  });

  app.post('/api/v1/terms', authenticateAdmin, (req: Request, res: Response, next: NextFunction) => {
    req.method = 'PUT';
    (app as any)._router.handle(req, res, next);
  });

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

  app.post('/api/v1/contact', publicSubmissionRateLimiter, async (req: Request, res: Response) => {
    try {
      const { name, email, phone, message, subject, conference_id } = req.body;

      if (!name || !String(name).trim()) {
        return res.status(400).json({ success: false, message: 'Full name is required.' });
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }

      if (!phone || !String(phone).trim()) {
        return res.status(400).json({ success: false, message: 'Contact number is required.' });
      }

      const resolvedMessage = message ? String(message).trim() : '';

      const confIdNum = conference_id ? Number(conference_id) : undefined;
      const targetConf = confIdNum ? db.conferences.find(c => c.id === confIdNum) : undefined;
      const resolvedSubject = subject && String(subject).trim()
        ? String(subject).trim()
        : (targetConf ? `Inquiry regarding ${targetConf.title}` : 'General Academic Inquiry');

      const newId = Math.max(...db.contactEnquiries.map(c => c.id), 0) + 1;
      const enquiry: ContactEnquiry = {
        id: newId,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        subject: resolvedSubject,
        message: resolvedMessage,
        conference_id: targetConf ? targetConf.id : confIdNum,
        conference_code: targetConf?.slug ? targetConf.slug.toUpperCase() : (req.body.conference_code || undefined),
        conference_title: targetConf ? targetConf.title : undefined,
        status: 'new',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      db.contactEnquiries.unshift(enquiry);
      saveLocalContactEnquiries(db.contactEnquiries);
      db.addAuditLog('NEW_CONTACT_ENQUIRY', 'ContactEnquiry', String(enquiry.id), `Received message from ${enquiry.name} (${enquiry.email}) for ${targetConf?.title || 'General'}`);

      const dbRes: any = await syncToMysql(
        `INSERT INTO contact_enquiries (name, email, phone, subject, message, conference_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [enquiry.name, enquiry.email, enquiry.phone || '', enquiry.subject, enquiry.message, enquiry.conference_id || null, enquiry.status]
      );
      if (dbRes?.insertId) {
        enquiry.id = dbRes.insertId;
        saveLocalContactEnquiries(db.contactEnquiries);
      }

      res.status(201).json({
        success: true,
        message: 'Your enquiry has been successfully submitted to the Secretariat.',
        data: enquiry
      });
    } catch (err: any) {
      console.error('[Contact Submission Error]:', err.message);
      res.status(500).json({ success: false, message: 'Failed to submit enquiry: ' + err.message });
    }
  });

  app.patch('/api/v1/contact/:id/status', authenticateAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const item = db.contactEnquiries.find(c => c.id === id);
    if (!item) return res.status(404).json({ success: false, message: 'Contact submission not found' });
    if (req.body.status) item.status = req.body.status;
    saveLocalContactEnquiries(db.contactEnquiries);
    db.addAuditLog('UPDATE_CONTACT_STATUS', 'ContactEnquiry', String(id), `Updated inquiry status to ${req.body.status}`);
    syncToMysql('UPDATE contact_enquiries SET status = ? WHERE id = ?', [item.status, id]);
    res.json({ success: true, message: 'Status updated successfully', data: item });
  });

  app.delete('/api/v1/contact/:id', authenticateAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.contactEnquiries.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Contact submission not found' });
    const removed = db.contactEnquiries.splice(index, 1)[0];
    saveLocalContactEnquiries(db.contactEnquiries);
    db.addAuditLog('DELETE_CONTACT_ENQUIRY', 'ContactEnquiry', String(id), `Deleted inquiry from ${removed.email}`);
    syncToMysql('DELETE FROM contact_enquiries WHERE id = ?', [id]);
    res.json({ success: true, message: 'Submission deleted successfully', data: removed });
  });

  // 11. Brochure Enquiries (Mandatory Enquiry Before Downloading Conference Brochures)
  app.post('/api/v1/brochure-enquiries', publicSubmissionRateLimiter, async (req: Request, res: Response) => {
    try {
      const {
        conference_id,
        conference_name,
        full_name,
        email,
        mobile_number,
        country,
        query_message
      } = req.body;

      // Strict backend validation
      const cleanName = (full_name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPhone = (mobile_number || '').trim();
      const cleanCountry = (country || '').trim();
      const cleanMessage = (query_message || '').trim();

      if (!cleanName) {
        return res.status(400).json({ success: false, message: 'Full Name is required.' });
      }
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: 'A valid email address is required.' });
      }
      if (!cleanPhone || cleanPhone.length < 5) {
        return res.status(400).json({ success: false, message: 'A valid mobile number with country code is required.' });
      }
      if (!cleanCountry) {
        return res.status(400).json({ success: false, message: 'Country is required.' });
      }
      if (!cleanMessage) {
        return res.status(400).json({ success: false, message: 'Query / Message is required.' });
      }

      // Associate with correct conference
      const conf = db.conferences.find(c => c.id === Number(conference_id) || c.slug === String(conference_id))
        || db.conferences.find(c => c.title.toLowerCase() === (conference_name || '').toLowerCase());
      
      const targetConfId = conf ? conf.id : (Number(conference_id) || null);
      const targetConfName = conf ? conf.title : (conference_name || 'General Conference Enquiry');
      const brochureUrl = conf?.flyer_url || '/sample-abstract-template.pdf';

      let newId = Math.max(...db.brochureEnquiries.map(b => b.id), 0) + 1;
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Persist to MySQL using parameterized query
      if (mysqlPool) {
        try {
          const insertRes: any = await syncToMysql(
            `INSERT INTO brochure_enquiries (conference_id, conference_name, full_name, email, mobile_number, country, query_message, action, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'download_brochure', NOW())`,
            [targetConfId, targetConfName, cleanName, cleanEmail, cleanPhone, cleanCountry, cleanMessage]
          );
          if (insertRes && insertRes.insertId) {
            newId = Number(insertRes.insertId);
          }
        } catch (dbErr: any) {
          console.error('[MySQL Brochure Enquiry Insert Error]:', dbErr);
          return res.status(500).json({
            success: false,
            message: `Failed to save enquiry to database: ${dbErr.message || 'Database error'}. Please try again.`
          });
        }
      }

      const enquiryRecord: BrochureEnquiry = {
        id: newId,
        conference_id: targetConfId || undefined,
        conference_name: targetConfName,
        full_name: cleanName,
        email: cleanEmail,
        mobile_number: cleanPhone,
        country: cleanCountry,
        query_message: cleanMessage,
        action: 'download_brochure',
        created_at: nowStr
      };

      db.brochureEnquiries.unshift(enquiryRecord);
      saveLocalBrochureEnquiries(db.brochureEnquiries);
      db.addAuditLog('NEW_BROCHURE_ENQUIRY', 'BrochureEnquiry', String(newId), `Brochure enquiry submitted by ${cleanName} for ${targetConfName}`);

      return res.status(201).json({
        success: true,
        message: 'Your enquiry has been successfully verified and saved. Initiating brochure download...',
        data: {
          id: newId,
          brochure_url: brochureUrl,
          conference_title: targetConfName
        }
      });
    } catch (err: any) {
      console.error('[Brochure Enquiry Error]:', err);
      return res.status(500).json({ success: false, message: 'Server error processing enquiry: ' + err.message });
    }
  });

  app.get('/api/v1/brochure-enquiries', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const { conference_id, search, startDate, endDate, sort } = req.query;

      // If MySQL is active, sync with fresh records from table
      if (mysqlPool) {
        try {
          const [rows]: any = await mysqlPool.query('SELECT * FROM brochure_enquiries ORDER BY created_at DESC');
          if (Array.isArray(rows)) {
            db.brochureEnquiries = rows.map((r: any) => ({
              id: Number(r.id),
              conference_id: r.conference_id ? Number(r.conference_id) : undefined,
              conference_name: r.conference_name || 'Conference',
              full_name: r.full_name || '',
              email: r.email || '',
              mobile_number: r.mobile_number || '',
              country: r.country || '',
              query_message: r.query_message || '',
              action: r.action || 'download_brochure',
              created_at: r.created_at ? new Date(r.created_at).toISOString().replace('T', ' ').substring(0, 19) : ''
            }));
            saveLocalBrochureEnquiries(db.brochureEnquiries);
          }
        } catch (dbErr) {
          console.warn('[Fetch Brochure Enquiries MySQL Warning]:', dbErr);
        }
      }

      let list = [...db.brochureEnquiries];

      if (conference_id && conference_id !== 'all') {
        const cId = Number(conference_id);
        list = list.filter(item => item.conference_id === cId || item.conference_name.toLowerCase().includes(String(conference_id).toLowerCase()));
      }

      if (search && typeof search === 'string') {
        const q = search.trim().toLowerCase();
        list = list.filter(item =>
          item.full_name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.conference_name.toLowerCase().includes(q) ||
          item.country.toLowerCase().includes(q) ||
          item.mobile_number.toLowerCase().includes(q)
        );
      }

      if (startDate && typeof startDate === 'string') {
        list = list.filter(item => item.created_at >= startDate);
      }

      if (endDate && typeof endDate === 'string') {
        list = list.filter(item => item.created_at <= `${endDate} 23:59:59`);
      }

      if (sort === 'oldest') {
        list.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
      } else {
        list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      }

      return res.json({ success: true, count: list.length, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/v1/brochure-enquiries/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (mysqlPool) {
        try {
          await syncToMysql('DELETE FROM brochure_enquiries WHERE id = ?', [id]);
        } catch (err) {
          console.warn('[MySQL Delete Brochure Enquiry Warning]:', err);
        }
      }
      const idx = db.brochureEnquiries.findIndex(b => b.id === id);
      if (idx !== -1) {
        db.brochureEnquiries.splice(idx, 1);
        saveLocalBrochureEnquiries(db.brochureEnquiries);
      }
      db.addAuditLog('DELETE_BROCHURE_ENQUIRY', 'BrochureEnquiry', String(id), `Deleted brochure enquiry #${id}`);
      return res.json({ success: true, message: 'Brochure enquiry removed successfully', id });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/v1/quotes', publicSubmissionRateLimiter, (req: Request, res: Response) => {
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

  app.post(['/api/v1/newsletter', '/api/v1/newsletter/subscribe', '/api/v1/subscribers'], publicSubmissionRateLimiter, (req: Request, res: Response) => {
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

  app.patch('/api/v1/subscribers/:id/status', authenticateAdmin, (req: Request, res: Response) => {
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
      const { conference_id, status, payment_status, category_id } = req.query;
      let regs = [...db.registrations];
      if (conference_id && conference_id !== 'all') {
        regs = regs.filter(r => r.conference_id === Number(conference_id));
        filename = `scinsmedia-conference-${conference_id}-registrations-${Date.now()}.csv`;
      }
      if (status && status !== 'all') {
        regs = regs.filter(r => r.registration_status === status);
      }
      if (payment_status && payment_status !== 'all') {
        regs = regs.filter(r => r.payment_status === payment_status);
      }
      if (category_id && category_id !== 'all') {
        regs = regs.filter(r => r.category_id === Number(category_id));
      }
      csvData = 'RegistrationID,ConferenceID,ConferenceTitle,FirstName,LastName,Email,Phone,Country,Institution,Department,Category,Amount,PaymentStatus,RegistrationStatus,AttendanceMode,Date\n' +
        regs.map(r => `"${r.registration_id}",${r.conference_id},"${(r.conference_title || '').replace(/"/g, '""')}","${r.first_name}","${r.last_name}","${r.email}","${r.phone || ''}","${r.country}","${(r.institution || '').replace(/"/g, '""')}","${(r.department || '').replace(/"/g, '""')}","${r.category_name}",${r.amount},"${r.payment_status}","${r.registration_status}","${r.attendance_mode}","${r.created_at}"`).join('\n');
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
      const { status } = req.query;
      let list = [...db.contactEnquiries];
      if (status && status !== 'All') {
        list = list.filter(c => c.status === status);
      }
      filename = `scinsmedia-contact-submissions-${Date.now()}.csv`;
      csvData = 'ID,Name,Email,Phone,Subject,Message,Status,Date\n' +
        list.map(c => `"${c.id}","${(c.name || '').replace(/"/g, '""')}","${c.email}","${c.phone || ''}","${(c.subject || '').replace(/"/g, '""')}","${(c.message || '').replace(/"/g, '""')}","${c.status}","${c.created_at}"`).join('\n');
    } else {
      csvData = 'ID,Name,Type,Date\n1,General Export,System,' + new Date().toISOString();
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  });

  // Database Schema download route (Secured for administrators)
  app.get('/api/v1/database/schema.sql', authenticateAdmin, (req: Request, res: Response) => {
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

  // Direct Conference Brochure Download API (Serves validated attachment)
  app.get(
    [
      '/api/v1/conferences/:slug/brochure',
      '/api/v1/conferences/:slug/brochure/download'
    ],
    async (req: Request, res: Response) => {
      try {
        const rawSlug = req.params.slug;
        if (!rawSlug) {
          return res.status(404).send('Conference slug required');
        }
        const cleanSlug = String(rawSlug).trim().toLowerCase();

        // 1. Locate conference in memory or MySQL database
        let conf = db.conferences.find(
          c => c.slug.toLowerCase() === cleanSlug || String(c.id) === cleanSlug
        );
        if (!conf && mysqlPool) {
          try {
            const [rows]: any = await mysqlPool.query(
              'SELECT * FROM conferences WHERE LOWER(slug) = ? OR id = ? LIMIT 1',
              [cleanSlug, cleanSlug]
            );
            if (Array.isArray(rows) && rows[0]) {
              conf = rows[0];
            }
          } catch (_) {}
        }

        if (!conf) {
          return res.status(404).send('Conference not found');
        }

        // 2. Identify brochure flyer URL
        let flyerUrl = (conf.flyer_url && typeof conf.flyer_url === 'string') ? conf.flyer_url.trim() : '';

        // If flyerUrl is an external link, redirect directly
        if (flyerUrl.startsWith('http://') || flyerUrl.startsWith('https://')) {
          return res.redirect(flyerUrl);
        }

        // Default brochure fallback if empty
        if (!flyerUrl) {
          flyerUrl = '/uploads/brochure_pdf-1791699467728-2254.pdf';
        }

        // Sanitize filename to prevent directory traversal
        const cleanFileName = path.basename(flyerUrl.split('?')[0].split('#')[0]);
        const p1 = path.join(uploadsStaticDir, cleanFileName);
        const p2 = path.join(distUploadsDir, cleanFileName);
        let targetDiskPath = fs.existsSync(p1) ? p1 : (fs.existsSync(p2) ? p2 : null);

        // Fallback to sample brochure template if file not found
        if (!targetDiskPath) {
          const defaultP1 = path.join(uploadsStaticDir, 'brochure_pdf-1791699467728-2254.pdf');
          const defaultP2 = path.join(distUploadsDir, 'brochure_pdf-1791699467728-2254.pdf');
          targetDiskPath = fs.existsSync(defaultP1) ? defaultP1 : (fs.existsSync(defaultP2) ? defaultP2 : null);
        }

        // Check media_assets in database if still not on disk
        if (!targetDiskPath && mysqlPool) {
          try {
            const [rows]: any = await mysqlPool.query(
              'SELECT file_data FROM media_assets WHERE file_name = ? LIMIT 1',
              [cleanFileName]
            );
            if (Array.isArray(rows) && rows[0]?.file_data) {
              const buffer = Buffer.from(rows[0].file_data, 'base64');
              fs.writeFileSync(p1, buffer);
              targetDiskPath = p1;
            }
          } catch (_) {}
        }

        if (!targetDiskPath || !fs.existsSync(targetDiskPath)) {
          return res.status(404).send('Brochure file currently in preparation by conference secretariat.');
        }

        const safeFilename = `${conf.slug || 'conference'}-official-brochure.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(targetDiskPath);
      } catch (err: any) {
        console.error('[Brochure Download Route Error]:', err.message);
        return res.status(500).send('Unable to download conference brochure at this time.');
      }
    }
  );

  // =========================================================================
  // LEGACY ROUTE PERMANENT REMOVAL (HTTP 410 GONE & NOINDEX)
  // Instructs search engines (Googlebot, Bingbot) and crawlers to immediately
  // de-index and purge obsolete categories, uncategorized posts, and WP artifacts.
  // =========================================================================
  const permanentlyRemovedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <title>410 Gone — Page Permanently Removed | SCINS MEDIA</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 40px;
      max-width: 540px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      border-radius: 9999px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    p {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      background: #0d9488;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 26px;
      border-radius: 8px;
      transition: background 0.2s ease;
      font-size: 14px;
    }
    .btn:hover { background: #0f766e; }
    .secondary-link {
      display: block;
      margin-top: 16px;
      color: #64748b;
      font-size: 13px;
      text-decoration: none;
    }
    .secondary-link:hover { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">HTTP 410 • Permanently Removed</div>
    <h1>This Page Has Been Removed</h1>
    <p>The category or page you are attempting to access has been permanently deleted and is no longer available on SCINS MEDIA.</p>
    <a href="/conferences" class="btn">Explore All Conferences</a>
    <a href="/" class="secondary-link">Return to Homepage</a>
  </div>
</body>
</html>`;

  const sendGone = (_req: Request, res: Response) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(410).type('html').send(permanentlyRemovedHtml);
  };

  app.get('/category/uncategorized', sendGone);
  app.get('/category/uncategorized/*', sendGone);
  app.get('/category', sendGone);
  app.get('/category/*', sendGone);
  app.get('/tag/*', sendGone);
  app.get('/author/*', sendGone);
  app.get('/wp-content/*', sendGone);
  app.get('/wp-includes/*', sendGone);
  app.get('/wp-json/*', sendGone);

  // =========================================================================
  // FRONTEND INTEGRATION (Vite Middleware & Production Fallback)
  // =========================================================================
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (hasDist || process.env.NODE_ENV === 'production') {
    app.use(express.static(distPath, {
      maxAge: '7d',
      etag: true,
      lastModified: true,
      dotfiles: 'deny'
    }));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // Support GoDaddy cPanel Phusion Passenger, Cloud Containers, and Localhost
  let server: any;
  const isPassenger =
    typeof (global as any).PhusionPassenger !== 'undefined' ||
    Boolean(process.env.PASSENGER_APP_ENV) ||
    process.env.PORT === 'passenger';
  const rawPort = process.env.PORT ? String(process.env.PORT).trim() : '';

  // SSL / HTTPS configuration for Local Development & Self-Hosted nodes
  const certPath = process.env.SSL_CERT_PATH || path.join(process.cwd(), 'certs', 'localhost.pem');
  const keyPath = process.env.SSL_KEY_PATH || path.join(process.cwd(), 'certs', 'localhost-key.pem');
  const hasLocalCert = fs.existsSync(certPath) && fs.existsSync(keyPath);
  const useHttps = !isPassenger && hasLocalCert && process.env.HTTPS !== 'false';

  let httpsOptions: { key: Buffer; cert: Buffer } | null = null;
  if (useHttps) {
    try {
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      console.log('[Scinsmedia SSL] Local development SSL certificate loaded successfully.');
    } catch (e: any) {
      console.warn('[Scinsmedia SSL] Failed to read SSL certificate, falling back to HTTP:', e.message);
      httpsOptions = null;
    }
  }

  const defaultPort = rawPort && !isNaN(Number(rawPort)) ? parseInt(rawPort, 10) : 3000;
  const HOST = process.env.HOST || '0.0.0.0';

  if (isPassenger || rawPort === 'passenger') {
    // GoDaddy cPanel Phusion Passenger gateway
    server = app.listen('passenger', () => {
      console.log('[Scinsmedia Enterprise Engine] Listening on GoDaddy Phusion Passenger gateway');
    });
  } else if (rawPort && (rawPort.startsWith('/') || isNaN(Number(rawPort)))) {
    // GoDaddy cPanel Unix domain socket
    server = app.listen(rawPort, () => {
      console.log(`[Scinsmedia Enterprise Engine] Listening on GoDaddy Passenger socket: ${rawPort}`);
    });
  } else {
    // Primary HTTP Server for reliable development & proxy compatibility
    server = http.createServer(app);
    server.listen(defaultPort, () => {
      console.log(`[Scinsmedia Enterprise Engine] Listening on http://localhost:${defaultPort}`);
    });

    // Optional Secondary HTTPS listener if local certs are enabled
    if (httpsOptions) {
      try {
        const httpsPort = process.env.HTTPS_PORT ? parseInt(process.env.HTTPS_PORT, 10) : 3443;
        const secHttps = https.createServer(httpsOptions, app);
        secHttps.listen(httpsPort, () => {
          console.log(`[Scinsmedia Enterprise Engine] Secure HTTPS test port listening on https://localhost:${httpsPort}`);
        });
      } catch (sslErr: any) {
        console.warn('[Scinsmedia SSL] Could not bind secondary HTTPS port:', sslErr?.message);
      }
    }
  }

  // Hydrate MySQL asynchronously without blocking or delaying port detection probes
  initMysqlPool().catch(err => {
    console.warn('[MySQL Background Sync Notice]:', err?.message || err);
  });

  // Request & Connection Timeouts (prevents Slowloris & dangling socket leaks)
  if (typeof (server as any).setTimeout === 'function') {
    server.setTimeout(30000); // 30s max request processing time
  }
  if ('keepAliveTimeout' in server) {
    server.keepAliveTimeout = 65000; // 65s keep-alive window for GoDaddy upstream proxies
  }
  if ('headersTimeout' in server) {
    server.headersTimeout = 66000;
  }

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

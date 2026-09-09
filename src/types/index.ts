// =============================================================================
// SCINSMEDIA — TypeScript Interfaces and Domain Models
// =============================================================================

export type ConferenceMode = 'in-person' | 'hybrid' | 'virtual';
export type ConferenceStatus = 'draft' | 'published' | 'archived';

export interface Conference {
  id: number;
  title: string;
  short_title: string;
  slug: string;
  conference_code: string;
  theme: string;
  tagline?: string;
  description: string;
  detailed_about?: string;
  about_heading?: string;
  about_highlights?: string[];
  gallery_images?: string[];
  domain: string;
  city: string;
  country: string;
  venue: string;
  venue_address?: string;
  timezone: string;
  start_date: string;
  end_date: string;
  abstract_deadline: string;
  early_bird_deadline: string;
  registration_deadline: string;
  mode: ConferenceMode;
  status: ConferenceStatus;
  hero_image: string;
  flyer_url?: string;
  featured_badge?: string;
  display_order?: number;

  // Welcome Address (Carousel Slide 1)
  welcome_heading?: string;
  welcome_message?: string;
  welcome_speaker_name?: string;
  welcome_speaker_role?: string;
  welcome_speaker_title?: string;
  welcome_speaker_image?: string;
  welcome_footer_text?: string;

  // Industry Exhibitors (Carousel Slide 2)
  exhibitor_heading?: string;
  exhibitor_message?: string;
  exhibitor_speaker_name?: string;
  exhibitor_speaker_role?: string;
  exhibitor_speaker_title?: string;
  exhibitor_image?: string;
  exhibitor_footer_text?: string;

  // Program Flow Visual
  program_image?: string;

  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  accept_late_breaking?: boolean;
  cme_credits_eligible?: boolean;
  primary_language?: string;
  max_attendees?: number;
  accent_color?: string;
  objectives?: string[];
  target_audience?: string[];
  indexing_partners?: string[];
  journal_name?: string;
  journal_issn?: string;
  created_at?: string;
  settings?: ConferenceSettings;
  gallery?: ConferenceGalleryImage[];
  committee?: CommitteeMember[];
  sponsors?: Sponsor[];
  media_partners?: MediaPartner[];
  schedule?: ScheduleItem[];
  categories?: RegistrationCategory[];
  speakers?: Speaker[];
  sessions?: Session[];
  testimonials?: Testimonial[];
}

export interface ConferenceGalleryImage {
  id: number;
  conference_id: number;
  image_url: string;
  caption?: string;
  display_order: number;
}

export interface ConferenceSettings {
  conference_id: number;
  registration_enabled: boolean;
  abstract_submission_enabled: boolean;
  publication_enabled: boolean;
  sponsors_enabled: boolean;
  media_partners_enabled: boolean;
  schedule_published: boolean;
  show_counter: boolean;
  max_attendees: number;
  show_speakers?: boolean;
}

export interface CommitteeMember {
  id: number;
  conference_id: number;
  name: string;
  designation: string;
  institution: string;
  country: string;
  committee_role: 'Honorary Chair' | 'General Chair' | 'Co-Chair' | 'Scientific Committee' | 'Organizing Committee' | 'Advisory Board' | string;
  photo_url: string;
  biography: string;
  education?: string;
  experience?: string;
  research_interests?: string;
  publications_count?: number;
  linkedin_url?: string;
  orcid_url?: string;
  google_scholar_url?: string;
  display_order: number;
  is_published?: boolean;
  is_active?: boolean;
  status?: 'active' | 'inactive';
  role_title?: string;
}

export type SpeakerType = 'Keynote' | 'Plenary' | 'Featured' | 'Oral Presenter' | 'Invited Speaker' | 'Oral' | 'Poster' | string;

export interface Speaker {
  id: number;
  name: string;
  prefix?: string;
  designation: string;
  institution: string;
  country: string;
  research_domain: string;
  photo_url: string;
  biography: string;
  h_index?: number;
  citations_count?: number;
  speaker_type?: 'Keynote' | 'Plenary' | 'Featured' | 'Oral Presenter' | 'Invited Speaker' | string;
  presentation_title?: string;
  presentation_abstract?: string;
  conference_id?: number;
  linkedin_url?: string;
  google_scholar?: string;
  website?: string;
  display_order?: number;
  is_active?: boolean;
  status?: 'active' | 'inactive';
  related_session_id?: number;
  session_title?: string;
  badge_type?: string;
  talk_title?: string;
}

export interface Session {
  id: number;
  conference_id: number;
  session_number: number;
  session_code: string;
  title: string;
  track: string;
  category: string;
  description: string;
  session_date?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
  session_type: 'Keynote Session' | 'Oral Presentation' | 'Poster Session' | 'Workshop' | 'Panel Discussion' | 'Networking & Gala' | 'Special Symposium' | string;
  speakers?: Speaker[];
  display_order?: number;
  status?: 'published' | 'scheduled' | 'live' | 'completed' | 'cancelled' | 'draft' | 'unpublished' | 'archived' | string;
  is_published?: boolean;
  is_active?: boolean;
  image_url?: string;
  icon?: string;
  speaker_name?: string;
  speaker_id?: number;
  chairperson?: string;
  chair_person?: string;
  day?: string;
  time_slot?: string;
  track_code?: string;
}

export interface ScheduleItem {
  id: number;
  conference_id: number;
  day_number?: number;
  day_label?: string;
  schedule_date?: string;
  start_time?: string;
  end_time?: string;
  time?: string;
  title: string;
  description?: string;
  room?: string;
  track?: string;
  speaker?: string;
  speaker_name?: string;
  speaker_affiliation?: string;
  type?: string;
  item_type?: 'session' | 'keynote' | 'plenary' | 'break' | 'ceremony' | 'networking' | 'poster' | string;
  display_order?: number;
}

export interface RegistrationCategory {
  id: number;
  conference_id: number;
  name: string;
  code?: string;
  description?: string;
  price?: number;
  currency?: string;
  early_bird_price?: number;
  early_bird_fee?: number;
  standard_fee?: number;
  academic_price?: number;
  industry_price?: number;
  student_price?: number;
  features?: string[];
  deadline?: string;
  benefits?: string[];
  is_popular?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Registration {
  id: number;
  registration_id: string;
  conference_id: number;
  conference_title?: string;
  category_id: number;
  category_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  institution: string;
  department?: string;
  designation: string;
  research_area?: string;
  attendance_mode: 'In-Person' | 'Virtual' | 'Hybrid';
  accommodation_required: boolean;
  meal_preference?: string;
  special_requirements?: string;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  registration_status: RegistrationStatus;
  created_at: string;
}

export type AbstractStatus = 'submitted' | 'under_review' | 'revision_required' | 'accepted' | 'rejected' | 'scheduled' | 'published';

export interface AbstractAuthor {
  id?: number;
  name: string;
  email: string;
  institution: string;
  country: string;
  is_corresponding: boolean;
}

export interface AbstractSubmission {
  id: number;
  submission_id: string;
  conference_id: number;
  conference_title?: string;
  title: string;
  abstract_text: string;
  keywords: string;
  research_domain: string;
  presentation_preference: 'Oral' | 'Poster' | 'Keynote Workshop' | 'Virtual Presentation';
  primary_author_name: string;
  primary_author_email: string;
  primary_author_phone?: string;
  primary_author_affiliation: string;
  primary_author_country: string;
  file_url?: string;
  file_name?: string;
  status: AbstractStatus;
  reviewer_notes?: string;
  assigned_reviewer_id?: number;
  assigned_reviewer_name?: string;
  authors?: AbstractAuthor[];
  created_at: string;
  updated_at?: string;
}

export interface Publication {
  id: number;
  title: string;
  authors: string;
  journal: string;
  research_domain: string;
  conference_id?: number;
  conference_name?: string;
  publication_date: string;
  year?: number | string;
  doi: string;
  abstract_summary: string;
  pdf_url?: string;
  citations: number;
  indexed_in: string;
}

export interface Sponsor {
  id: number;
  company_name: string;
  name?: string;
  logo_url: string;
  website: string;
  description: string;
  tier_name: string;
  tier?: string;
  tier_id: number;
  country?: string;
  contact_email?: string;
  conference_id?: number;
  display_order?: number;
  is_active?: boolean;
  status?: 'active' | 'inactive';
  partner_type?: 'Corporate Sponsor' | 'Academic Partner' | 'Media Partner' | 'Institutional Partner' | string;
  category?: string;
}

export interface MediaPartner {
  id: number;
  name: string;
  logo_url: string;
  website: string;
  country: string;
  description?: string;
  conference_id?: number;
}

export interface Testimonial {
  id: number;
  name: string;
  author_name?: string;
  photo_url: string;
  avatar_url?: string;
  designation: string;
  institution: string;
  country: string;
  quote: string;
  conference_id?: number;
  conference_name?: string;
  rating: number;
  is_featured?: boolean;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  category: string;
  author_name: string;
  author_designation?: string;
  author_avatar?: string;
  featured_image: string;
  content: string;
  excerpt: string;
  reading_time: string;
  tags?: string[];
  is_published: boolean;
  published_at: string;
}

export interface FAQ {
  id: number;
  conference_id?: number;
  category: string;
  question: string;
  answer: string;
}

export interface ContactEnquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  conference_id?: number;
  conference_code?: string;
  status: 'new' | 'in_progress' | 'responded' | 'closed' | 'archived';
  created_at: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  status: 'active' | 'unsubscribed' | 'archived';
  created_at: string;
}


export interface QuoteRequest {
  id: number;
  name: string;
  organization: string;
  email: string;
  phone?: string;
  service_type: string;
  conference_id?: number;
  requirements: string;
  budget_range?: string;
  status: 'new' | 'reviewing' | 'proposal_sent' | 'accepted' | 'declined';
  created_at: string;
}

export interface ConferenceFlyer {
  id: number;
  conference_id: number;
  title: string;
  file_url: string;
  download_url?: string;
  file_type: string;
  file_size: string;
  downloads_count: number;
}

export interface AuditLog {
  id: number;
  admin_name: string;
  admin_email: string;
  action: string;
  entity: string;
  entity_id?: string;
  details?: string;
  ip_address: string;
  created_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'conference_manager' | 'content_manager' | 'reviewer' | 'finance_manager';
  role_display: string;
  avatar_url?: string;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

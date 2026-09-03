-- =============================================================================
-- SCINSMEDIA — Enterprise Scientific Conference Platform
-- Database Schema for MySQL 8.0+ / MariaDB / phpMyAdmin
-- Compatible with GoDaddy Node.js Hosting & cPanel MySQL
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS conference_documents;
DROP TABLE IF EXISTS conference_flyers;
DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS quote_requests;
DROP TABLE IF EXISTS career_applications;
DROP TABLE IF EXISTS career_positions;
DROP TABLE IF EXISTS contact_enquiries;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS faq_categories;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS blog_categories;
DROP TABLE IF EXISTS testimonials;
DROP TABLE IF EXISTS conference_media_partners;
DROP TABLE IF EXISTS media_partners;
DROP TABLE IF EXISTS conference_sponsors;
DROP TABLE IF EXISTS sponsor_tiers;
DROP TABLE IF EXISTS sponsors;
DROP TABLE IF EXISTS publications;
DROP TABLE IF EXISTS abstract_reviews;
DROP TABLE IF EXISTS abstract_authors;
DROP TABLE IF EXISTS abstract_submissions;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS registration_categories;
DROP TABLE IF EXISTS schedule_items;
DROP TABLE IF EXISTS session_speakers;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS speaker_conferences;
DROP TABLE IF EXISTS speakers;
DROP TABLE IF EXISTS committee_members;
DROP TABLE IF EXISTS conference_settings;
DROP TABLE IF EXISTS conference_gallery;
DROP TABLE IF EXISTS conferences;
DROP TABLE IF EXISTS admin_role_permissions;
DROP TABLE IF EXISTS admin_permissions;
DROP TABLE IF EXISTS admin_roles;
DROP TABLE IF EXISTS admins;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. ADMINS & ROLES
-- -----------------------------------------------------------------------------
CREATE TABLE admin_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES admin_roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. CONFERENCES
-- -----------------------------------------------------------------------------
CREATE TABLE conferences (
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
    timezone VARCHAR(50) DEFAULT 'UTC',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    abstract_deadline DATE NOT NULL,
    early_bird_deadline DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    mode ENUM('in-person', 'hybrid', 'virtual') DEFAULT 'hybrid',
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    hero_image VARCHAR(255),
    featured_badge VARCHAR(100) DEFAULT '2nd Edition',
    welcome_message LONGTEXT,
    welcome_speaker_name VARCHAR(100),
    welcome_speaker_title VARCHAR(150),
    welcome_speaker_image VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords VARCHAR(255),
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conference_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conference_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conference_settings (
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
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. COMMITTEE MEMBERS
-- -----------------------------------------------------------------------------
CREATE TABLE committee_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conference_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL,
    committee_role ENUM('Honorary Chair', 'General Chair', 'Co-Chair', 'Scientific Committee', 'Organizing Committee', 'Advisory Board') DEFAULT 'Scientific Committee',
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
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. SPEAKERS & SESSIONS
-- -----------------------------------------------------------------------------
CREATE TABLE speakers (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE speaker_conferences (
    speaker_id INT NOT NULL,
    conference_id INT NOT NULL,
    speaker_type ENUM('Keynote', 'Plenary', 'Featured', 'Oral Presenter', 'Invited Speaker') DEFAULT 'Keynote',
    presentation_title VARCHAR(255) NOT NULL,
    presentation_abstract TEXT,
    display_order INT DEFAULT 0,
    PRIMARY KEY (speaker_id, conference_id),
    FOREIGN KEY (speaker_id) REFERENCES speakers(id) ON DELETE CASCADE,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
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
    session_type ENUM('Keynote Session', 'Oral Presentation', 'Poster Session', 'Workshop', 'Panel Discussion', 'Networking & Gala', 'Special Symposium') DEFAULT 'Oral Presentation',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE,
    INDEX idx_conf_session (conference_id, session_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE session_speakers (
    session_id INT NOT NULL,
    speaker_id INT NOT NULL,
    role ENUM('Chair', 'Co-Chair', 'Presenter', 'Panelist', 'Moderator') DEFAULT 'Presenter',
    talk_title VARCHAR(255),
    time_slot VARCHAR(50),
    PRIMARY KEY (session_id, speaker_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (speaker_id) REFERENCES speakers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE schedule_items (
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
    item_type ENUM('session', 'keynote', 'plenary', 'break', 'ceremony', 'networking', 'poster') DEFAULT 'session',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. REGISTRATIONS & CATEGORIES
-- -----------------------------------------------------------------------------
CREATE TABLE registration_categories (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registrations (
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
    attendance_mode ENUM('In-Person', 'Virtual', 'Hybrid') DEFAULT 'In-Person',
    accommodation_required BOOLEAN DEFAULT FALSE,
    meal_preference VARCHAR(50) DEFAULT 'Standard',
    special_requirements TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    registration_status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id),
    FOREIGN KEY (category_id) REFERENCES registration_categories(id),
    INDEX idx_reg_id (registration_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. ABSTRACT SUBMISSIONS & REVIEWS
-- -----------------------------------------------------------------------------
CREATE TABLE abstract_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id VARCHAR(50) NOT NULL UNIQUE,
    conference_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    abstract_text LONGTEXT NOT NULL,
    keywords VARCHAR(255) NOT NULL,
    research_domain VARCHAR(100) NOT NULL,
    presentation_preference ENUM('Oral', 'Poster', 'Keynote Workshop', 'Virtual Presentation') DEFAULT 'Oral',
    primary_author_name VARCHAR(150) NOT NULL,
    primary_author_email VARCHAR(150) NOT NULL,
    primary_author_phone VARCHAR(50),
    primary_author_affiliation VARCHAR(200) NOT NULL,
    primary_author_country VARCHAR(100) NOT NULL,
    file_url VARCHAR(255),
    file_name VARCHAR(255),
    status ENUM('submitted', 'under_review', 'revision_required', 'accepted', 'rejected', 'scheduled', 'published') DEFAULT 'submitted',
    reviewer_notes TEXT,
    assigned_reviewer_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id),
    FOREIGN KEY (assigned_reviewer_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_submission_id (submission_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE abstract_authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    abstract_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_corresponding BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    FOREIGN KEY (abstract_id) REFERENCES abstract_submissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE abstract_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    abstract_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    score_originality INT DEFAULT 8,
    score_methodology INT DEFAULT 8,
    score_relevance INT DEFAULT 8,
    score_clarity INT DEFAULT 8,
    total_score DECIMAL(4, 2) DEFAULT 8.00,
    recommendation ENUM('accept', 'minor_revision', 'major_revision', 'reject') DEFAULT 'accept',
    comments_to_author TEXT,
    confidential_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (abstract_id) REFERENCES abstract_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES admins(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. PUBLICATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE publications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    authors VARCHAR(255) NOT NULL,
    journal VARCHAR(200) NOT NULL,
    research_domain VARCHAR(100) NOT NULL,
    conference_id INT NULL,
    publication_date DATE NOT NULL,
    doi VARCHAR(100) NOT NULL UNIQUE,
    abstract_summary TEXT,
    pdf_url VARCHAR(255),
    citations INT DEFAULT 0,
    indexed_in VARCHAR(200) DEFAULT 'Scopus, Web of Science, PubMed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. SPONSORS & MEDIA PARTNERS
-- -----------------------------------------------------------------------------
CREATE TABLE sponsor_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    min_amount DECIMAL(10, 2),
    display_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    logo_url VARCHAR(255) NOT NULL,
    website VARCHAR(255) NOT NULL,
    description TEXT,
    country VARCHAR(100),
    contact_email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conference_sponsors (
    conference_id INT NOT NULL,
    sponsor_id INT NOT NULL,
    tier_id INT NOT NULL,
    display_order INT DEFAULT 0,
    PRIMARY KEY (conference_id, sponsor_id),
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE,
    FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE,
    FOREIGN KEY (tier_id) REFERENCES sponsor_tiers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE media_partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    logo_url VARCHAR(255) NOT NULL,
    website VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conference_media_partners (
    conference_id INT NOT NULL,
    media_partner_id INT NOT NULL,
    display_order INT DEFAULT 0,
    PRIMARY KEY (conference_id, media_partner_id),
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE,
    FOREIGN KEY (media_partner_id) REFERENCES media_partners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TESTIMONIALS, BLOGS, FAQS
-- -----------------------------------------------------------------------------
CREATE TABLE testimonials (
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
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_designation VARCHAR(150),
    author_avatar VARCHAR(255),
    featured_image VARCHAR(255),
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    reading_time VARCHAR(50) DEFAULT '5 min read',
    tags VARCHAR(255),
    is_published BOOLEAN DEFAULT TRUE,
    published_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES blog_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faq_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_order INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conference_id INT NULL,
    category_id INT NOT NULL,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES faq_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. ENQUIRIES, CAREERS, QUOTES, NEWSLETTER, FLYERS & AUDIT
-- -----------------------------------------------------------------------------
CREATE TABLE contact_enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    conference_id INT NULL,
    status ENUM('new', 'in_progress', 'responded', 'closed') DEFAULT 'new',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE career_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type ENUM('Full-time', 'Part-time', 'Contract', 'Remote') DEFAULT 'Full-time',
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    is_open BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE career_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    position_id INT NOT NULL,
    applicant_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    resume_url VARCHAR(255),
    cover_letter TEXT,
    portfolio_url VARCHAR(255),
    status ENUM('new', 'screening', 'shortlisted', 'interview', 'selected', 'rejected') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (position_id) REFERENCES career_positions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quote_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    service_type ENUM('Conference Sponsorship', 'Custom Symposium', 'Publication Indexing', 'Academic Partnership', 'Exhibition Booth') NOT NULL,
    conference_id INT NULL,
    requirements TEXT NOT NULL,
    budget_range VARCHAR(50),
    status ENUM('new', 'reviewing', 'proposal_sent', 'accepted', 'declined') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    domains JSON,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conference_flyers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conference_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) DEFAULT 'PDF',
    file_size VARCHAR(20) DEFAULT '2.4 MB',
    is_public BOOLEAN DEFAULT TRUE,
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE conference_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conference_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    category ENUM('Program Schedule', 'Sponsorship Kit', 'Registration Guide', 'Abstract Guidelines', 'Visa Support Letter Template') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conference_id) REFERENCES conferences(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(100) NOT NULL UNIQUE,
    registration_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    gateway ENUM('Stripe', 'PayPal', 'Wire Transfer', 'Credit Card') DEFAULT 'Stripe',
    status ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'succeeded',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(50) NULL,
    details TEXT,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- SEED DATA
-- -----------------------------------------------------------------------------
INSERT INTO admin_roles (id, name, display_name, description) VALUES
(1, 'super_admin', 'Super Admin', 'Full unrestricted platform access'),
(2, 'conference_manager', 'Conference Manager', 'Manage assigned conferences, schedules, speakers'),
(3, 'content_manager', 'Content Manager', 'Manage news, blogs, flyers, media partners, and FAQs'),
(4, 'reviewer', 'Scientific Reviewer', 'Review and grade abstract submissions'),
(5, 'finance_manager', 'Finance Manager', 'View registrations, invoice reconciliation, and revenue reports');

INSERT INTO admins (id, role_id, name, email, password_hash, status) VALUES
(1, 1, 'Dr. Alexander Vance', 'admin@scinsmedia.com', '$2a$12$e/e8N9Kj1kP7.bE8iR.N0.vO9Gz2XhFh7d2v2uD3G4K5L6M7N8O9P', 'active');

INSERT INTO sponsor_tiers (id, name, min_amount, display_order) VALUES
(1, 'Platinum Sponsor', 15000.00, 1),
(2, 'Gold Sponsor', 10000.00, 2),
(3, 'Silver Sponsor', 5000.00, 3),
(4, 'Supporting Partner', 2500.00, 4);

INSERT INTO blog_categories (id, name, slug) VALUES
(1, 'Biopolymers & Materials', 'biopolymers-materials'),
(2, 'Nanotechnology & Medicine', 'nanotech-medicine'),
(3, 'AI & Computational Science', 'ai-computational-science'),
(4, 'Conference Insights & Keynotes', 'conference-insights');

INSERT INTO faq_categories (id, name, display_order) VALUES
(1, 'Registration & Pricing', 1),
(2, 'Abstract Submission & Guidelines', 2),
(3, 'Speaker & Presentation', 3),
(4, 'Travel, Visa & Accommodation', 4),
(5, 'Publication & Indexing', 5),
(6, 'Sponsorship & Booths', 6);

-- Realistic Demo Conference
INSERT INTO conferences (id, title, short_title, slug, conference_code, theme, tagline, description, detailed_about, domain, city, country, venue, venue_address, timezone, start_date, end_date, abstract_deadline, early_bird_deadline, registration_deadline, mode, status, hero_image, featured_badge, welcome_message, welcome_speaker_name, welcome_speaker_title, welcome_speaker_image, meta_title, meta_description, keywords, created_by) VALUES
(1, '2nd World Congress on Biopolymers & Bioplastics', 'Biopolymers 2026', 'biopolymers-bioplastics-2026', 'SCINS-BIO-2026', 'Towards Biopolymers', 'Pioneering Sustainable Macromolecular Solutions for a Circular Future', 'The premier international assembly bringing together macromolecular chemists, bioengineers, polymer technologists, environmental scientists, and sustainable industry leaders to accelerate scalable biopolymer technologies.', 'The 2nd World Congress on Biopolymers & Bioplastics represents the epicenter of scientific breakthrough in bio-based materials, biodegradable packaging, biomedical macromolecules, and industrial fermentation. Over two intensive days in Paris, France, leading international academicians and pioneering industry researchers will present novel synthesis pathways, enzymatic degradation mechanisms, and commercialization case studies.', 'Biotechnology', 'Paris', 'France', 'Paris Convention Centre & Pullman Congress Hall', '1 Rue du Fossé Blanc, 92230 Gennevilliers, Paris, France', 'Europe/Paris', '2026-06-22', '2026-06-23', '2026-05-15', '2026-04-30', '2026-06-10', 'hybrid', 'published', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80', '2nd Edition', 'It is our profound honor to welcome distinguished researchers, professors, industrial pioneers, and budding scholars to the 2nd World Congress on Biopolymers & Bioplastics in Paris. Our collective mission is to decouple modern material consumption from petrochemical dependence through breakthrough green chemistry, microbial synthesis, and circular macromolecular architecture.', 'Prof. Henriette Dubois, Ph.D.', 'Chair of Scientific Organizing Committee & Director of Macromolecular Institute, Sorbonne Université', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', '2nd World Congress on Biopolymers & Bioplastics | Paris 2026', 'Join 850+ global scientists and industry leaders at Biopolymers 2026 in Paris. Submit your research abstract, explore 20 scientific sessions, and network.', 'biopolymers, bioplastics, green chemistry, PHA, PLA, circular economy, Paris conference 2026', 1);

INSERT INTO conference_settings (conference_id, registration_enabled, abstract_submission_enabled, publication_enabled, sponsors_enabled, media_partners_enabled, schedule_published, show_counter, max_attendees) VALUES
(1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 850);

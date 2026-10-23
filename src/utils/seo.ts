// =============================================================================
// SCINS MEDIA — Comprehensive Dynamic SEO & Metadata Manager
// =============================================================================

import { Conference } from '../types';

export const SITE_DOMAIN = 'https://scinsmedia.com';
export const SITE_NAME = 'SCINS MEDIA';
export const DEFAULT_OG_IMAGE = `${SITE_DOMAIN}/scins-media-logo.png`;

export interface SeoConfig {
  title: string;
  description: string;
  path?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'event';
  noindex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

function getOrCreateMeta(name: string, isProperty = false): HTMLMetaElement {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  return el;
}

function getOrCreateLink(rel: string): HTMLLinkElement {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  return el;
}

function setJsonLd(data: Record<string, any> | Array<Record<string, any>> | null): void {
  const scriptId = 'scins-structured-data-jsonld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!data) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function updateSeoMetadata(config: SeoConfig): void {
  if (typeof document === 'undefined') return;

  // 1. Browser Window & Tab Title
  document.title = config.title;

  // 2. Meta Description
  const metaDesc = getOrCreateMeta('description');
  metaDesc.setAttribute('content', config.description);

  // 3. Robots Directives (Strict noindex for admin/private pages)
  const metaRobots = getOrCreateMeta('robots');
  if (config.noindex) {
    metaRobots.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
  } else {
    metaRobots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }

  // 4. Canonical URL Link Tag
  const rawPath = config.path || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const cleanPath = (rawPath.length > 1 && rawPath.endsWith('/')) ? rawPath.slice(0, -1) : rawPath;
  const canonical = config.noindex ? `${SITE_DOMAIN}/` : (config.canonicalUrl || `${SITE_DOMAIN}${cleanPath}`);
  const linkCanonical = getOrCreateLink('canonical');
  linkCanonical.setAttribute('href', canonical);

  // 5. Open Graph Metadata (Facebook, LinkedIn, Messaging Apps)
  const ogTitle = getOrCreateMeta('og:title', true);
  ogTitle.setAttribute('content', config.title);

  const ogDesc = getOrCreateMeta('og:description', true);
  ogDesc.setAttribute('content', config.description);

  const ogUrl = getOrCreateMeta('og:url', true);
  ogUrl.setAttribute('content', canonical);

  const ogType = getOrCreateMeta('og:type', true);
  ogType.setAttribute('content', config.ogType || 'website');

  const ogSiteName = getOrCreateMeta('og:site_name', true);
  ogSiteName.setAttribute('content', SITE_NAME);

  const ogLocale = getOrCreateMeta('og:locale', true);
  ogLocale.setAttribute('content', 'en_US');

  const ogImage = getOrCreateMeta('og:image', true);
  let resolvedImage = config.ogImage || DEFAULT_OG_IMAGE;
  if (resolvedImage.startsWith('/')) {
    resolvedImage = `${SITE_DOMAIN}${resolvedImage}`;
  }
  ogImage.setAttribute('content', resolvedImage);

  // 6. Twitter Card Metadata
  const twCard = getOrCreateMeta('twitter:card');
  twCard.setAttribute('content', 'summary_large_image');

  const twTitle = getOrCreateMeta('twitter:title');
  twTitle.setAttribute('content', config.title);

  const twDesc = getOrCreateMeta('twitter:description');
  twDesc.setAttribute('content', config.description);

  const twImage = getOrCreateMeta('twitter:image');
  twImage.setAttribute('content', resolvedImage);

  // 7. Schema.org JSON-LD Structured Data
  if (config.structuredData) {
    setJsonLd(config.structuredData);
  }
}

// -----------------------------------------------------------------------------
// Pre-configured Page-Specific SEO Handlers
// -----------------------------------------------------------------------------

export function setHomeSeo(): void {
  updateSeoMetadata({
    title: 'SCINS MEDIA | International Scientific Conferences & Research',
    description: 'SCINS MEDIA is a premier international academic platform organizing multidisciplinary scientific conferences, research symposiums, and global scholarly gatherings connecting researchers, clinicians, and innovators worldwide.',
    path: '/',
    ogType: 'website',
    ogImage: `${SITE_DOMAIN}/scins-media-logo.png`,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SCINS MEDIA',
        url: SITE_DOMAIN,
        logo: `${SITE_DOMAIN}/scins-media-logo.png`,
        description: 'International scientific conference organizer and research dissemination platform.',
        email: 'scinsmedia@gmail.com',
        sameAs: [
          'https://linkedin.com/company/scinsmedia',
          'https://twitter.com/scinsmedia'
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Conference Secretariat',
          email: 'scinsmedia@gmail.com',
          availableLanguage: ['English']
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SCINS MEDIA',
        url: SITE_DOMAIN,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_DOMAIN}/conferences?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  });
}

export function setConferencesListSeo(count = 12): void {
  updateSeoMetadata({
    title: 'Upcoming Scientific Conferences & Congresses 2026 | SCINS MEDIA',
    description: `Explore ${count}+ world-class peer-reviewed scientific conferences in biopolymers, quantum physics, oncology, artificial intelligence, chemistry, renewable energy, and life sciences. Call for abstracts and early-bird registration open.`,
    path: '/conferences',
    ogType: 'website',
    ogImage: `${SITE_DOMAIN}/scins-media-logo.png`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Upcoming Scientific Conferences 2026',
      description: 'Directory of international scientific congresses, symposiums, and research forums organized by SCINS MEDIA.',
      url: `${SITE_DOMAIN}/conferences`
    }
  });
}

export function setConferenceDetailSeo(conf: Conference): void {
  const dates = (conf as any).dates_label || `${conf.start_date} – ${conf.end_date}`;
  const location = [conf.city, conf.country].filter(Boolean).join(', ') || 'Europe';
  const customTitle = conf.meta_title || `${conf.short_title || conf.title} | ${conf.city} 2026`;
  const fullTitle = `${customTitle} | SCINS MEDIA`;

  const customDesc = conf.meta_description ||
    `Official congress website for ${conf.title}. Join global researchers, keynote speakers, and industry pioneers in ${location} (${dates}). Call for abstracts, delegate registrations, and program details.`;

  let eventImage = conf.hero_image || conf.flyer_url || DEFAULT_OG_IMAGE;
  if (eventImage.startsWith('/')) eventImage = `${SITE_DOMAIN}${eventImage}`;

  // Formulate Event Attendance Mode
  let attendanceMode = 'https://schema.org/MixedEventAttendanceMode';
  if (conf.mode === 'in-person') attendanceMode = 'https://schema.org/OfflineEventAttendanceMode';
  if (conf.mode === 'virtual') attendanceMode = 'https://schema.org/OnlineEventAttendanceMode';

  const eventSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: conf.title,
    description: customDesc,
    startDate: conf.start_date,
    endDate: conf.end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: attendanceMode,
    image: [eventImage],
    location: {
      '@type': 'Place',
      name: conf.venue || `${conf.city} International Convention Centre`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: conf.city,
        addressCountry: conf.country
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'SCINS MEDIA',
      url: SITE_DOMAIN
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '399',
      highPrice: '1299',
      validFrom: conf.created_at || '2026-01-01',
      url: `${SITE_DOMAIN}/conferences/${conf.slug}/register`,
      availability: 'https://schema.org/InStock'
    }
  };

  updateSeoMetadata({
    title: fullTitle,
    description: customDesc,
    path: `/conferences/${conf.slug}`,
    ogType: 'event',
    ogImage: eventImage,
    structuredData: eventSchema
  });
}

export function setAboutSeo(): void {
  updateSeoMetadata({
    title: 'About SCINS MEDIA | Mission, Scientific Council & Global Network',
    description: 'Learn about SCINS MEDIA, an international scientific research platform dedicated to bridging academia and industry through peer-reviewed conferences, collaborative workshops, and global dissemination.',
    path: '/about',
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About SCINS MEDIA',
      description: 'About SCINS MEDIA international research platform and academic council.',
      url: `${SITE_DOMAIN}/about`
    }
  });
}

export function setContactSeo(): void {
  updateSeoMetadata({
    title: 'Contact Conference Secretariat & Support | SCINS MEDIA',
    description: 'Contact SCINS MEDIA international secretariats for conference inquiries, consular visa assistance letters, registration invoices, and abstract submission queries.',
    path: '/contact',
    ogType: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact SCINS MEDIA Secretariat',
      description: 'Contact information for SCINS MEDIA headquarters and conference secretariats.',
      url: `${SITE_DOMAIN}/contact`
    }
  });
}

export function setTermsSeo(): void {
  updateSeoMetadata({
    title: 'Terms & Conditions, Cancellation & Privacy | SCINS MEDIA',
    description: 'Official registration policies, cancellation and refund terms, abstract submission guidelines, code of conduct, and privacy policy for SCINS MEDIA conferences.',
    path: '/terms',
    ogType: 'website'
  });
}

export function setAdminSeo(): void {
  updateSeoMetadata({
    title: 'SCINS MEDIA | International Scientific Conferences & Research',
    description: 'International scientific conference organizer and global research dissemination platform.',
    path: '/',
    noindex: true // Strict noindex for all admin / login paths
  });
}

export function setNotFoundSeo(): void {
  updateSeoMetadata({
    title: 'Page Not Found | SCINS MEDIA',
    description: 'The requested conference or page could not be located on the SCINS MEDIA platform.',
    noindex: true
  });
}

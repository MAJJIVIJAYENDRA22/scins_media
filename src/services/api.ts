// =============================================================================
// SCINSMEDIA — Frontend API Service Client
// =============================================================================

import {
  Conference,
  CommitteeMember,
  Speaker,
  Session,
  ScheduleItem,
  RegistrationCategory,
  Registration,
  AbstractSubmission,
  ProposalSubmission,
  Publication,
  Sponsor,
  MediaPartner,
  Testimonial,
  Blog,
  ConferenceFlyer,
  AuditLog,
  AdminUser,
  ApiResponse,
  ContactEnquiry,
  NewsletterSubscriber,
  MediaAsset
} from '../types';

const API_BASE = '/api/v1';

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('scins_admin_token') || localStorage.getItem('scins_admin_token');
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('scins_admin_token');
  localStorage.removeItem('scins_admin_user');
  sessionStorage.removeItem('scins_admin_token');
  sessionStorage.removeItem('scins_admin_user');
}

export function isTokenValid(token: string | null): boolean {
  // For this application, any non‑empty token is considered valid.
  return !!token && token.trim().length > 0;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getStoredAdminToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options?.headers || {})
    },
    ...options
  });
  
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin/') || path === '/login') {
        clearAdminSession();
        if (path !== '/admin') {
          window.history.replaceState({}, '', '/admin');
        }
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    const errorData = await response.json().catch(async () => {
      const text = await response.text().catch(() => '');
      return { message: text || `HTTP Error ${response.status}` };
    });
    throw new Error(errorData.message || `HTTP Error ${response.status}`);
  }
  
  const result: ApiResponse<T> = await response.json();
  return result.data as T;
}

export function downloadCsvFile(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);
}

export async function downloadExport(
  type: string,
  params?: Record<string, string | number | undefined>,
  defaultFilename?: string
): Promise<boolean> {
  const token = getStoredAdminToken();
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
  }
  if (token) {
    searchParams.append('token', token);
  }

  const qs = searchParams.toString();
  const url = `${API_BASE}/exports/${type}${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  if (!res.ok) {
    let errMsg = `Export request failed (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.message) errMsg = errJson.message;
    } catch {}
    throw new Error(errMsg);
  }

  const disposition = res.headers.get('content-disposition');
  let filename = defaultFilename || `scinsmedia-${type}-${Date.now()}.csv`;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/);
    if (match && match[1]) {
      filename = match[1].trim();
    }
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 1000);

  return true;
}

export const api = {
  downloadExport,
  downloadCsvFile,
  // Conferences
  getConferences: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    return fetchJson<Conference[]>(`${API_BASE}/conferences?${searchParams.toString()}`);
  },
  getConferenceBySlug: (slug: string) => fetchJson<Conference>(`${API_BASE}/conferences/${slug}`),
  createConference: (data: Partial<Conference>) =>
    fetchJson<Conference>(`${API_BASE}/conferences`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateConference: (id: number, data: Partial<Conference>) =>
    fetchJson<Conference>(`${API_BASE}/conferences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  updateConferenceStatus: (id: number, status: 'draft' | 'published' | 'archived') =>
    fetchJson<Conference>(`${API_BASE}/conferences/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  updateConferenceOrder: (id: number, display_order: number) =>
    fetchJson<Conference>(`${API_BASE}/conferences/${id}/order`, {
      method: 'PATCH',
      body: JSON.stringify({ display_order })
    }),
  duplicateConference: (id: number) =>
    fetchJson<Conference>(`${API_BASE}/conferences/${id}/duplicate`, {
      method: 'POST'
    }),
  deleteConference: (id: number) =>
    fetchJson<Conference>(`${API_BASE}/conferences/${id}`, {
      method: 'DELETE'
    }),

  // Committee
  getCommittee: (params?: { conferenceId?: number; search?: string; role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.conferenceId) q.append('conference_id', String(params.conferenceId));
    if (params?.search) q.append('search', params.search);
    if (params?.role) q.append('role', params.role);
    if (params?.status) q.append('status', params.status);
    return fetchJson<CommitteeMember[]>(`${API_BASE}/committee${q.toString() ? `?${q.toString()}` : ''}`);
  },
  getCommitteeMembers: (params?: { conferenceId?: number; search?: string; role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.conferenceId) q.append('conference_id', String(params.conferenceId));
    if (params?.search) q.append('search', params.search);
    if (params?.role) q.append('role', params.role);
    if (params?.status) q.append('status', params.status);
    return fetchJson<CommitteeMember[]>(`${API_BASE}/committee${q.toString() ? `?${q.toString()}` : ''}`);
  },
  getCommitteeMember: (id: number) => fetchJson<CommitteeMember>(`${API_BASE}/committee/${id}`),
  addCommitteeMember: (data: Partial<CommitteeMember>) =>
    fetchJson<CommitteeMember>(`${API_BASE}/committee`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateCommitteeMember: (id: number, data: Partial<CommitteeMember>) =>
    fetchJson<CommitteeMember>(`${API_BASE}/committee/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  toggleCommitteeStatus: (id: number, is_published?: boolean) =>
    fetchJson<CommitteeMember>(`${API_BASE}/committee/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published })
    }),
  deleteCommitteeMember: (id: number) =>
    fetchJson<CommitteeMember>(`${API_BASE}/committee/${id}`, {
      method: 'DELETE'
    }),

  // Speakers
  getSpeakers: (params?: { conferenceId?: number; search?: string; type?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.conferenceId) q.append('conference_id', String(params.conferenceId));
    if (params?.search) q.append('search', params.search);
    if (params?.type) q.append('type', params.type);
    if (params?.status) q.append('status', params.status);
    return fetchJson<Speaker[]>(`${API_BASE}/speakers${q.toString() ? `?${q.toString()}` : ''}`);
  },
  getSpeaker: (id: number) => fetchJson<Speaker>(`${API_BASE}/speakers/${id}`),
  addSpeaker: (data: Partial<Speaker>) =>
    fetchJson<Speaker>(`${API_BASE}/speakers`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSpeaker: (id: number, data: Partial<Speaker>) =>
    fetchJson<Speaker>(`${API_BASE}/speakers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  toggleSpeakerStatus: (id: number, is_active?: boolean) =>
    fetchJson<Speaker>(`${API_BASE}/speakers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active })
    }),
  deleteSpeaker: (id: number) =>
    fetchJson<Speaker>(`${API_BASE}/speakers/${id}`, {
      method: 'DELETE'
    }),

  // Sessions
  getSessions: (params?: { conferenceId?: number; search?: string; track?: string; type?: string; status?: string; publishedOnly?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.conferenceId) q.append('conference_id', String(params.conferenceId));
    if (params?.search) q.append('search', params.search);
    if (params?.track) q.append('track', params.track);
    if (params?.type) q.append('type', params.type);
    if (params?.status) q.append('status', params.status);
    if (params?.publishedOnly) q.append('published_only', 'true');
    return fetchJson<Session[]>(`${API_BASE}/sessions${q.toString() ? `?${q.toString()}` : ''}`);
  },
  getSession: (id: number) => fetchJson<Session>(`${API_BASE}/sessions/${id}`),
  addSession: (data: Partial<Session>) =>
    fetchJson<Session>(`${API_BASE}/sessions`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSession: (id: number, data: Partial<Session>) =>
    fetchJson<Session>(`${API_BASE}/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  toggleSessionStatus: (id: number, status?: string, is_active?: boolean, is_published?: boolean) =>
    fetchJson<Session>(`${API_BASE}/sessions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, is_active, is_published })
    }),
  deleteSession: (id: number) =>
    fetchJson<Session>(`${API_BASE}/sessions/${id}`, {
      method: 'DELETE'
    }),

  // Sponsors & Academic Partners
  getSponsors: (params?: { conferenceId?: number; search?: string; tier?: string; status?: string; partner_type?: string }) => {
    const q = new URLSearchParams();
    if (params?.conferenceId) q.append('conference_id', String(params.conferenceId));
    if (params?.search) q.append('search', params.search);
    if (params?.tier) q.append('tier', params.tier);
    if (params?.status) q.append('status', params.status);
    if (params?.partner_type) q.append('partner_type', params.partner_type);
    return fetchJson<Sponsor[]>(`${API_BASE}/sponsors${q.toString() ? `?${q.toString()}` : ''}`);
  },
  getSponsor: (id: number) => fetchJson<Sponsor>(`${API_BASE}/sponsors/${id}`),
  addSponsor: (data: Partial<Sponsor>) =>
    fetchJson<Sponsor>(`${API_BASE}/sponsors`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSponsor: (id: number, data: Partial<Sponsor>) =>
    fetchJson<Sponsor>(`${API_BASE}/sponsors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  toggleSponsorStatus: (id: number, is_active?: boolean) =>
    fetchJson<Sponsor>(`${API_BASE}/sponsors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active })
    }),
  deleteSponsor: (id: number) =>
    fetchJson<Sponsor>(`${API_BASE}/sponsors/${id}`, {
      method: 'DELETE'
    }),

  // Schedule
  getSchedule: (conferenceId?: number, dayLabel?: string) => {
    const params = new URLSearchParams();
    if (conferenceId) params.append('conference_id', String(conferenceId));
    if (dayLabel) params.append('day_label', dayLabel);
    const qs = params.toString();
    return fetchJson<ScheduleItem[]>(`${API_BASE}/schedule${qs ? `?${qs}` : ''}`);
  },
  createScheduleItem: (data: Partial<ScheduleItem>) =>
    fetchJson<ScheduleItem>(`${API_BASE}/schedule`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateScheduleItem: (id: number, data: Partial<ScheduleItem>) =>
    fetchJson<ScheduleItem>(`${API_BASE}/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteScheduleItem: (id: number) =>
    fetchJson<ScheduleItem>(`${API_BASE}/schedule/${id}`, {
      method: 'DELETE'
    }),

  // Registration Categories
  getRegistrationCategories: (conferenceId?: number) =>
    fetchJson<RegistrationCategory[]>(`${API_BASE}/registration-categories${conferenceId ? `?conference_id=${conferenceId}` : ''}`),
  createRegistrationCategory: (data: Partial<RegistrationCategory>) =>
    fetchJson<RegistrationCategory>(`${API_BASE}/registration-categories`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateRegistrationCategory: (id: number, data: Partial<RegistrationCategory>) =>
    fetchJson<RegistrationCategory>(`${API_BASE}/registration-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteRegistrationCategory: (id: number) =>
    fetchJson<RegistrationCategory>(`${API_BASE}/registration-categories/${id}`, {
      method: 'DELETE'
    }),

  // Registrations
  getRegistrations: (params?: {
    conference_id?: number | string;
    status?: string;
    payment_status?: string;
    category_id?: number | string;
    search?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const q = new URLSearchParams();
    if (params) {
      if (params.conference_id !== undefined && params.conference_id !== 'all' && params.conference_id !== '') {
        q.append('conference_id', String(params.conference_id));
      }
      if (params.status && params.status !== 'all') q.append('status', params.status);
      if (params.payment_status && params.payment_status !== 'all') q.append('payment_status', params.payment_status);
      if (params.category_id && params.category_id !== 'all') q.append('category_id', String(params.category_id));
      if (params.search && params.search.trim()) q.append('search', params.search.trim());
      if (params.start_date) q.append('start_date', params.start_date);
      if (params.end_date) q.append('end_date', params.end_date);
    }
    const qs = q.toString();
    return fetchJson<Registration[]>(`${API_BASE}/registrations${qs ? `?${qs}` : ''}`);
  },
  createRegistration: (data: Partial<Registration>) =>
    fetchJson<Registration>(`${API_BASE}/registrations`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateRegistrationStatus: (id: number, statusData: { registration_status?: string; payment_status?: string }) =>
    fetchJson<Registration>(`${API_BASE}/registrations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    }),

  // Abstracts
  getAbstracts: () => fetchJson<AbstractSubmission[]>(`${API_BASE}/abstracts`),
  submitAbstract: (data: Partial<AbstractSubmission>) =>
    fetchJson<AbstractSubmission>(`${API_BASE}/abstracts`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAbstractStatus: (id: number, data: { status: string; reviewer_notes?: string; assigned_reviewer_name?: string }) =>
    fetchJson<AbstractSubmission>(`${API_BASE}/abstracts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Proposals (Workshops, Keynote Forums, Posters, Symposia)
  getProposals: (params?: { type?: string; status?: string; conference_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'all') query.append('type', params.type);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.conference_id) query.append('conference_id', params.conference_id.toString());
    const qs = query.toString();
    return fetchJson<ProposalSubmission[]>(`${API_BASE}/proposals${qs ? `?${qs}` : ''}`);
  },
  submitProposal: (data: Partial<ProposalSubmission>) =>
    fetchJson<ProposalSubmission>(`${API_BASE}/proposals`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProposalStatus: (id: number, data: { status: string; reviewer_notes?: string }) =>
    fetchJson<ProposalSubmission>(`${API_BASE}/proposals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  deleteProposal: (id: number) =>
    fetchJson<any>(`${API_BASE}/proposals/${id}`, {
      method: 'DELETE'
    }),

  // Content
  getMediaPartners: () => fetchJson<MediaPartner[]>(`${API_BASE}/media-partners`),
  getTestimonials: (conferenceId?: number) =>
    fetchJson<Testimonial[]>(`${API_BASE}/testimonials${conferenceId ? `?conference_id=${conferenceId}` : ''}`),
  createTestimonial: (data: Partial<Testimonial>) =>
    fetchJson<Testimonial>(`${API_BASE}/testimonials`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTestimonial: (id: number, data: Partial<Testimonial>) =>
    fetchJson<Testimonial>(`${API_BASE}/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteTestimonial: (id: number) =>
    fetchJson<Testimonial>(`${API_BASE}/testimonials/${id}`, {
      method: 'DELETE'
    }),
  getBlogs: () => fetchJson<Blog[]>(`${API_BASE}/blogs`),
  getFlyers: () => fetchJson<ConferenceFlyer[]>(`${API_BASE}/flyers`),
  getAuditLogs: () => fetchJson<AuditLog[]>(`${API_BASE}/audit-logs`),
  getAnalytics: () => fetchJson<any>(`${API_BASE}/analytics`),

  // Contact Submissions & Enquiries
  getContactSubmissions: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return fetchJson<ContactEnquiry[]>(`${API_BASE}/contact${qs ? `?${qs}` : ''}`);
  },
  submitContact: (data: any) =>
    fetchJson<any>(`${API_BASE}/contact`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateContactStatus: (id: number, status: string) =>
    fetchJson<ContactEnquiry>(`${API_BASE}/contact/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  deleteContactSubmission: (id: number) =>
    fetchJson<any>(`${API_BASE}/contact/${id}`, {
      method: 'DELETE'
    }),

  submitQuoteRequest: (data: any) =>
    fetchJson<any>(`${API_BASE}/quotes`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Newsletter Subscribers
  getSubscribers: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return fetchJson<NewsletterSubscriber[]>(`${API_BASE}/subscribers${qs ? `?${qs}` : ''}`);
  },
  subscribeNewsletter: (email: string) =>
    fetchJson<any>(`${API_BASE}/newsletter`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  updateSubscriberStatus: (id: number, status: string) =>
    fetchJson<NewsletterSubscriber>(`${API_BASE}/subscribers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  deleteSubscriber: (id: number) =>
    fetchJson<any>(`${API_BASE}/subscribers/${id}`, {
      method: 'DELETE'
    }),

  // Media & Asset Upload
  uploadMedia: (uploadData: { fileData: string; fileName: string; fileType: string; category?: string }) =>
    fetchJson<{ url: string; fileName: string; fileType: string; fileSize: number }>(`${API_BASE}/upload`, {
      method: 'POST',
      body: JSON.stringify(uploadData)
    }),

  // Payments & Checkout Gateway
  getStripeConfig: () =>
    fetchJson<{ publishableKey: string; isConfigured: boolean; mode: string }>(`${API_BASE}/stripe/config`),

  createStripePaymentIntent: (data: {
    amount: number;
    currency?: string;
    registration_id: number | string;
    conference_id?: number;
    conference_title?: string;
    category_name?: string;
    delegate_name?: string;
    delegate_email?: string;
  }) =>
    fetchJson<{
      clientSecret: string;
      paymentIntentId: string;
      amount: number;
      currency: string;
      status: string;
      isLiveStripe: boolean;
    }>(`${API_BASE}/stripe/create-payment-intent`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  confirmStripePayment: (data: {
    payment_intent_id: string;
    registration_id: number | string;
    conference_id?: number;
    amount: number;
    currency?: string;
    card_holder_name?: string;
    card_last4?: string;
    billing_email?: string;
  }) =>
    fetchJson<{
      transaction_id: string;
      receipt_id: string;
      status: string;
      amount: number;
      currency: string;
      payment_method: string;
      created_at: string;
      registration_id: string | number;
      payer_name: string;
    }>(`${API_BASE}/stripe/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  processPayment: (paymentData: {
    registration_id: number | string;
    conference_id?: number;
    amount: number;
    currency?: string;
    gateway: string;
    card_holder_name?: string;
    card_last4?: string;
    billing_email?: string;
    payment_reference?: string;
  }) =>
    fetchJson<any>(`${API_BASE}/payments/process`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    }),

  // Database Management & GoDaddy cPanel MySQL Integration
  getDatabaseStatus: () => fetchJson<{
    connected: boolean;
    driver: string;
    host: string;
    port: number;
    user: string;
    database: string;
    configured: boolean;
    error: string | null;
    tableStats: Record<string, number>;
    lastChecked: string;
  }>(`${API_BASE}/database/status`),

  testDatabaseConnection: (config: {
    host: string;
    port?: number | string;
    user: string;
    password?: string;
    database: string;
  }) =>
    fetchJson<{ host: string; port: number; database: string; user: string; status: string }>(`${API_BASE}/database/test-connection`, {
      method: 'POST',
      body: JSON.stringify(config)
    }),

  // Publications
  getPublications: (params?: { search?: string; domain?: string; journal?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.domain && params.domain !== 'All') query.append('domain', params.domain);
    if (params?.journal && params.journal !== 'All') query.append('journal', params.journal);
    const qs = query.toString();
    return fetchJson<Publication[]>(`${API_BASE}/publications${qs ? `?${qs}` : ''}`);
  },
  createPublication: (data: Partial<Publication>) =>
    fetchJson<Publication>(`${API_BASE}/publications`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updatePublication: (id: number, data: Partial<Publication>) =>
    fetchJson<Publication>(`${API_BASE}/publications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deletePublication: (id: number) =>
    fetchJson<{ message: string; id: number }>(`${API_BASE}/publications/${id}`, {
      method: 'DELETE'
    }),

  // Media Library
  getMediaLibrary: (category?: string) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return fetchJson<{ success: boolean; data: MediaAsset[] }>(`${API_BASE}/media-library${qs}`);
  },

  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchJson<{ user: AdminUser; token: string }>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  getMe: () => fetchJson<AdminUser>(`${API_BASE}/auth/me`),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchJson<any>(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

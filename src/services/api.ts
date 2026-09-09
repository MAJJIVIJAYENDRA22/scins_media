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
  NewsletterSubscriber
} from '../types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network request failed' }));
    throw new Error(errorData.message || `HTTP Error ${response.status}`);
  }
  
  const result: ApiResponse<T> = await response.json();
  return result.data as T;
}

export const api = {
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
  getRegistrations: () => fetchJson<Registration[]>(`${API_BASE}/registrations`),
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

  // Content
  getPublications: () => fetchJson<Publication[]>(`${API_BASE}/publications`),
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

  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchJson<{ user: AdminUser; token: string }>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchJson<any>(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

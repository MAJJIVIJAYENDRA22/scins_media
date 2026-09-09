import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
  SlidersHorizontal,
  MapPin,
  Globe,
  Tag,
  Sparkles,
  X,
  Save,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Layers,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Building,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  Users,
  CreditCard
} from 'lucide-react';
import { Conference, ConferenceMode, ConferenceStatus, CommitteeMember, Sponsor, MediaPartner, ScheduleItem, RegistrationCategory } from '../../types';
import { COMMITTEE_MEMBERS, SPONSORS, MEDIA_PARTNERS, SCHEDULE_ITEMS, REGISTRATION_CATEGORIES } from '../../data/initialData';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { MediaUploadInput } from './MediaUploadInput';

interface ConferenceManagerProps {
  conferences: Conference[];
  onConferencesChange: (updatedList: Conference[]) => void;
  onSelectConference: (slug: string) => void;
  onOpenWizard?: (conference?: Conference) => void;
}

type EditorTab =
  | 'basic'
  | 'about'
  | 'carousel'
  | 'deadlines'
  | 'publishing'
  | 'committee'
  | 'corporate_partners'
  | 'media_partners'
  | 'pricing';

export const ConferenceManager: React.FC<ConferenceManagerProps> = ({
  conferences,
  onConferencesChange,
  onSelectConference,
  onOpenWizard
}) => {
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'order' | 'date' | 'title' | 'status'>('order');

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>('basic');
  const [editingConference, setEditingConference] = useState<Partial<Conference> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Sub-forms for Committee, Corporate Partners, Media Partners, Schedule & Pricing
  const [editingCommitteeMember, setEditingCommitteeMember] = useState<Partial<CommitteeMember> | null>(null);
  const [isCommitteeFormOpen, setIsCommitteeFormOpen] = useState(false);

  const [editingCorporatePartner, setEditingCorporatePartner] = useState<Partial<Sponsor> | null>(null);
  const [isCorporatePartnerFormOpen, setIsCorporatePartnerFormOpen] = useState(false);

  const [editingMediaPartner, setEditingMediaPartner] = useState<Partial<MediaPartner> | null>(null);
  const [isMediaPartnerFormOpen, setIsMediaPartnerFormOpen] = useState(false);

  const [editingScheduleItem, setEditingScheduleItem] = useState<Partial<ScheduleItem> | null>(null);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [activeScheduleDayTab, setActiveScheduleDayTab] = useState<'Day 1' | 'Day 2'>('Day 1');

  const [editingPricingCategory, setEditingPricingCategory] = useState<Partial<RegistrationCategory> | null>(null);
  const [isPricingFormOpen, setIsPricingFormOpen] = useState(false);

  // Delete State
  const [deletingConference, setDeletingConference] = useState<Conference | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Distinct Domains
  const availableDomains = useMemo(() => {
    const set = new Set(conferences.map(c => c.domain).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [conferences]);

  // Filtered & Sorted Conferences
  const filteredConferences = useMemo(() => {
    let list = conferences.filter(c => {
      const matchesSearch =
        search === '' ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.conference_code.toLowerCase().includes(search.toLowerCase()) ||
        c.city.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.theme.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesDomain = domainFilter === 'All' || c.domain.toLowerCase() === domainFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesDomain;
    });

    list.sort((a, b) => {
      if (sortBy === 'order') {
        const orderA = a.display_order ?? 999;
        const orderB = b.display_order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.start_date || '').getTime() - new Date(a.start_date || '').getTime();
    });

    return list;
  }, [conferences, search, statusFilter, domainFilter, sortBy]);

  // Status Change Handler (One-Click Publish / Unpublish Toggle)
  const handleTogglePublish = async (conf: Conference) => {
    const nextStatus: ConferenceStatus = conf.status === 'published' ? 'draft' : 'published';
    try {
      await api.updateConferenceStatus(conf.id, nextStatus);
      const updatedList = conferences.map(c => (c.id === conf.id ? { ...c, status: nextStatus } : c));
      onConferencesChange(updatedList);
      showToast(`${conf.short_title || conf.title} is now ${nextStatus === 'published' ? 'Published' : 'Draft'}`);
    } catch {
      // Optimistic update
      const updatedList = conferences.map(c => (c.id === conf.id ? { ...c, status: nextStatus } : c));
      onConferencesChange(updatedList);
      showToast(`Status updated to "${nextStatus}"`);
    }
  };

  // Reorder Handler (Move Up or Down in Priority)
  const handleMoveOrder = async (conf: Conference, direction: 'up' | 'down') => {
    const sorted = [...conferences].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
    const currentIndex = sorted.findIndex(c => c.id === conf.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetConf = sorted[targetIndex];
    const currentOrder = conf.display_order ?? (currentIndex + 1);
    const targetOrder = targetConf.display_order ?? (targetIndex + 1);

    // Swap display order values
    const newCurrentOrder = targetOrder === currentOrder ? (direction === 'up' ? targetOrder : targetOrder + 1) : targetOrder;
    const newTargetOrder = currentOrder;

    const updatedList = conferences.map(c => {
      if (c.id === conf.id) return { ...c, display_order: newCurrentOrder };
      if (c.id === targetConf.id) return { ...c, display_order: newTargetOrder };
      return c;
    });

    onConferencesChange(updatedList);

    try {
      await Promise.all([
        api.updateConferenceOrder ? api.updateConferenceOrder(conf.id, newCurrentOrder) : api.updateConference(conf.id, { display_order: newCurrentOrder }),
        api.updateConferenceOrder ? api.updateConferenceOrder(targetConf.id, newTargetOrder) : api.updateConference(targetConf.id, { display_order: newTargetOrder })
      ]);
      showToast(`Reordered "${conf.short_title || conf.title}" to position #${newCurrentOrder}`);
    } catch {
      showToast(`Order updated locally`);
    }
  };

  // Duplicate Conference Handler
  const handleDuplicate = async (conf: Conference) => {
    try {
      const duplicated = await api.duplicateConference(conf.id);
      const updatedList = [duplicated, ...conferences];
      onConferencesChange(updatedList);
      showToast(`Conference duplicated as Draft: "${duplicated.title}"`);
    } catch {
      const newId = Math.max(...conferences.map(c => c.id), 0) + 1;
      const copyTimestamp = Date.now().toString().slice(-4);
      const duplicated: Conference = {
        ...conf,
        id: newId,
        title: `${conf.title} (Clone)`,
        short_title: `${conf.short_title} (Copy)`,
        slug: `${conf.slug}-copy-${copyTimestamp}`,
        conference_code: `${conf.conference_code}-CPY${copyTimestamp}`,
        status: 'draft',
        display_order: (conf.display_order ?? 1) + 1,
        created_at: new Date().toISOString()
      };
      onConferencesChange([duplicated, ...conferences]);
      showToast(`Conference duplicated as Draft: "${duplicated.title}"`);
    }
  };

  // Open Create Modal / Wizard
  const handleOpenCreate = () => {
    if (onOpenWizard) {
      onOpenWizard(undefined);
      return;
    }
    const nextOrder = conferences.length > 0 ? Math.max(...conferences.map(c => c.display_order ?? 0)) + 1 : 1;
    setEditingConference({
      title: '',
      short_title: '',
      slug: '',
      conference_code: `SCINS-CONF-${Date.now().toString().slice(-4)}`,
      theme: '',
      domain: 'Biotechnology',
      city: '',
      country: '',
      venue: '',
      start_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      abstract_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      early_bird_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      registration_deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mode: 'hybrid',
      status: 'draft',
      display_order: nextOrder,
      hero_image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=80',
      flyer_url: '',
      featured_badge: 'Flagship Edition',
      about_heading: 'Congress Overview & Scientific Scope',
      detailed_about: '',
      about_highlights: [
        'Over 450+ physical attendees from 48 nations',
        '20 specialized scientific tracks & breakout rooms',
        'Elsevier Scopus-indexed special issue publication',
        'Direct B2B technology transfer & venture showcase'
      ],
      gallery_images: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
      ],
      welcome_heading: 'Message from the General Chair',
      welcome_speaker_name: 'Prof. Henriette Dubois, Ph.D.',
      welcome_speaker_role: 'Conference Chair',
      welcome_speaker_title: 'Research Director & Chair of Macromolecular Chemistry, Sorbonne Université / CNRS',
      welcome_speaker_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
      welcome_message: 'It is our profound honor to welcome distinguished researchers, professors, industrial pioneers, and budding scholars to this congress. Our mission is to accelerate scientific discovery and foster international partnerships.',
      welcome_footer_text: 'Join us to collaborate, innovate, and drive scientific excellence forward.',
      exhibitor_heading: 'Global Industry Leaders & Technology Showcase',
      exhibitor_speaker_name: 'Confirmed Industry Exhibitors',
      exhibitor_speaker_role: 'Platinum & Gold Partners',
      exhibitor_speaker_title: 'Main Exhibition Hall & Innovation Pavilions (Booths P-101 to E-408)',
      exhibitor_image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=500&q=80',
      exhibitor_message: 'Explore breakthrough technologies, commercial formulations, and certified solutions from premier international partners. Connect with technical directors, review prototype materials, and explore industrial partnerships across both days.',
      exhibitor_footer_text: 'Live demonstrations and commercial partner consultations scheduled throughout the congress.',
      program_image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
      committee: [],
      sponsors: [],
      media_partners: [],
      schedule: [],
      categories: []
    });
    setFormErrors({});
    setIsCommitteeFormOpen(false);
    setIsCorporatePartnerFormOpen(false);
    setIsMediaPartnerFormOpen(false);
    setIsScheduleFormOpen(false);
    setEditingScheduleItem(null);
    setIsPricingFormOpen(false);
    setEditingPricingCategory(null);
    setActiveEditorTab('basic');
    setIsEditModalOpen(true);
  };

  // Open Edit Modal / Wizard
  const handleOpenEdit = (conf: Conference) => {
    const confCommittee = (conf.committee && conf.committee.length > 0)
      ? conf.committee
      : (COMMITTEE_MEMBERS.filter(m => m.conference_id === conf.id).length > 0
        ? COMMITTEE_MEMBERS.filter(m => m.conference_id === conf.id)
        : COMMITTEE_MEMBERS);

    const confSponsors = (conf.sponsors && conf.sponsors.length > 0)
      ? conf.sponsors
      : (SPONSORS.filter(s => s.conference_id === conf.id).length > 0
        ? SPONSORS.filter(s => s.conference_id === conf.id)
        : SPONSORS);

    const confMediaPartners = (conf.media_partners && conf.media_partners.length > 0)
      ? conf.media_partners
      : (MEDIA_PARTNERS.filter(m => m.conference_id === conf.id).length > 0
        ? MEDIA_PARTNERS.filter(m => m.conference_id === conf.id)
        : MEDIA_PARTNERS);

    const confSchedule = (conf.schedule && conf.schedule.length > 0)
      ? conf.schedule
      : (SCHEDULE_ITEMS.filter(s => s.conference_id === conf.id).length > 0
        ? SCHEDULE_ITEMS.filter(s => s.conference_id === conf.id)
        : SCHEDULE_ITEMS.map((s, idx) => ({ ...s, id: s.id || (idx + 1), conference_id: conf.id })));

    const confCategories = (conf.categories && conf.categories.length > 0)
      ? conf.categories
      : (REGISTRATION_CATEGORIES.filter(c => c.conference_id === conf.id).length > 0
        ? REGISTRATION_CATEGORIES.filter(c => c.conference_id === conf.id)
        : REGISTRATION_CATEGORIES.map((c, idx) => ({ ...c, id: c.id || (idx + 1), conference_id: conf.id })));

    const fullConfData: Conference = {
      ...conf,
      committee: confCommittee.map(m => ({ ...m })),
      sponsors: confSponsors.map(s => ({ ...s })),
      media_partners: confMediaPartners.map(m => ({ ...m })),
      schedule: confSchedule.map(s => ({ ...s })),
      categories: confCategories.map(c => ({ ...c })),
      about_highlights: (conf.about_highlights && conf.about_highlights.length === 4)
        ? conf.about_highlights
        : [
            'Over 450+ physical attendees from 48 nations',
            '20 specialized scientific tracks & breakout rooms',
            'Elsevier Scopus-indexed special issue publication',
            'Direct B2B technology transfer & venture showcase'
          ],
      gallery_images: (conf.gallery_images && conf.gallery_images.length === 4)
        ? conf.gallery_images
        : [
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
          ]
    };

    if (onOpenWizard) {
      onOpenWizard(fullConfData);
      return;
    }

    setEditingConference(fullConfData);
    setFormErrors({});
    setIsCommitteeFormOpen(false);
    setIsCorporatePartnerFormOpen(false);
    setIsMediaPartnerFormOpen(false);
    setIsScheduleFormOpen(false);
    setEditingScheduleItem(null);
    setIsPricingFormOpen(false);
    setEditingPricingCategory(null);
    setActiveEditorTab('basic');
    setIsEditModalOpen(true);
  };

  // Organizing Committee Handlers
  const handleSaveCommitteeMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommitteeMember || !editingConference) return;
    if (!editingCommitteeMember.name?.trim()) return;

    const currentList = editingConference.committee || [];
    let updatedList: CommitteeMember[];

    if (editingCommitteeMember.id) {
      updatedList = currentList.map(m =>
        m.id === editingCommitteeMember.id ? ({ ...m, ...editingCommitteeMember } as CommitteeMember) : m
      );
    } else {
      const newMember: CommitteeMember = {
        id: Date.now(),
        conference_id: editingConference.id || 1,
        name: editingCommitteeMember.name || '',
        photo_url: editingCommitteeMember.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        committee_role: editingCommitteeMember.committee_role || 'Organizing Committee',
        designation: editingCommitteeMember.designation || 'Professor',
        institution: editingCommitteeMember.institution || 'University Research Institute',
        country: editingCommitteeMember.country || 'Global',
        biography: editingCommitteeMember.biography || '',
        display_order: currentList.length + 1,
        is_published: true,
        status: 'active'
      };
      updatedList = [...currentList, newMember];
    }

    setEditingConference({ ...editingConference, committee: updatedList });
    setIsCommitteeFormOpen(false);
    setEditingCommitteeMember(null);
  };

  const handleRemoveCommitteeMember = (memberId: number) => {
    if (!editingConference) return;
    const currentList = editingConference.committee || [];
    setEditingConference({
      ...editingConference,
      committee: currentList.filter(m => m.id !== memberId)
    });
  };

  // Corporate & Industrial Partners Handlers
  const handleSaveCorporatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCorporatePartner || !editingConference) return;
    const name = editingCorporatePartner.company_name || editingCorporatePartner.name;
    if (!name?.trim()) return;

    const currentList = editingConference.sponsors || [];
    let updatedList: Sponsor[];

    if (editingCorporatePartner.id) {
      updatedList = currentList.map(s =>
        s.id === editingCorporatePartner.id ? ({ ...s, ...editingCorporatePartner, company_name: name, name } as Sponsor) : s
      );
    } else {
      const newSponsor: Sponsor = {
        id: Date.now(),
        company_name: name,
        name: name,
        logo_url: editingCorporatePartner.logo_url || 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=300&q=80',
        website: editingCorporatePartner.website || 'https://scinsmedia.com',
        description: editingCorporatePartner.description || 'Corporate & Industrial Partner',
        tier_name: 'Corporate Partner',
        tier_id: 1,
        conference_id: editingConference.id || 1,
        display_order: currentList.length + 1
      };
      updatedList = [...currentList, newSponsor];
    }

    setEditingConference({ ...editingConference, sponsors: updatedList });
    setIsCorporatePartnerFormOpen(false);
    setEditingCorporatePartner(null);
  };

  const handleRemoveCorporatePartner = (sponsorId: number) => {
    if (!editingConference) return;
    const currentList = editingConference.sponsors || [];
    setEditingConference({
      ...editingConference,
      sponsors: currentList.filter(s => s.id !== sponsorId)
    });
  };

  // Global Media Partners Handlers
  const handleSaveMediaPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMediaPartner || !editingConference) return;
    if (!editingMediaPartner.name?.trim()) return;

    const currentList = editingConference.media_partners || [];
    let updatedList: MediaPartner[];

    if (editingMediaPartner.id) {
      updatedList = currentList.map(m =>
        m.id === editingMediaPartner.id ? ({ ...m, ...editingMediaPartner } as MediaPartner) : m
      );
    } else {
      const newPartner: MediaPartner = {
        id: Date.now(),
        name: editingMediaPartner.name || '',
        logo_url: editingMediaPartner.logo_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=300&q=80',
        website: editingMediaPartner.website || 'https://scinsmedia.com',
        country: editingMediaPartner.country || 'Global',
        description: editingMediaPartner.description || 'Global Media & Academic Publishing Partner',
        conference_id: editingConference.id || 1
      };
      updatedList = [...currentList, newPartner];
    }

    setEditingConference({ ...editingConference, media_partners: updatedList });
    setIsMediaPartnerFormOpen(false);
    setEditingMediaPartner(null);
  };

  const handleRemoveMediaPartner = (partnerId: number) => {
    if (!editingConference) return;
    const currentList = editingConference.media_partners || [];
    setEditingConference({
      ...editingConference,
      media_partners: currentList.filter(m => m.id !== partnerId)
    });
  };

  // 2-Day Schedule Item Handlers
  const handleSaveScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduleItem || !editingConference) return;
    if (!editingScheduleItem.title?.trim() || !editingScheduleItem.time?.trim()) return;

    const currentList = editingConference.schedule || [];
    let updatedList: ScheduleItem[];

    if (editingScheduleItem.id) {
      updatedList = currentList.map(item =>
        item.id === editingScheduleItem.id ? ({ ...item, ...editingScheduleItem } as ScheduleItem) : item
      );
    } else {
      const newItem: ScheduleItem = {
        id: Date.now(),
        conference_id: editingConference.id || 1,
        time: editingScheduleItem.time || '09:00 - 10:00',
        title: editingScheduleItem.title || '',
        speaker: editingScheduleItem.speaker || '',
        room: editingScheduleItem.room || 'Main Auditorium',
        type: editingScheduleItem.type || 'Keynote',
        day_label: editingScheduleItem.day_label || activeScheduleDayTab,
        display_order: currentList.length + 1
      };
      updatedList = [...currentList, newItem];
    }

    setEditingConference({ ...editingConference, schedule: updatedList });
    setIsScheduleFormOpen(false);
    setEditingScheduleItem(null);
  };

  const handleRemoveScheduleItem = (itemId: number) => {
    if (!editingConference) return;
    const currentList = editingConference.schedule || [];
    setEditingConference({
      ...editingConference,
      schedule: currentList.filter(item => item.id !== itemId)
    });
  };

  // Registration Pricing Tiers Handlers
  const handleSavePricingCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPricingCategory || !editingConference) return;
    if (!editingPricingCategory.name?.trim()) return;

    const currentList = editingConference.categories || [];
    let updatedList: RegistrationCategory[];

    if (editingPricingCategory.id) {
      updatedList = currentList.map(cat =>
        cat.id === editingPricingCategory.id ? ({ ...cat, ...editingPricingCategory } as RegistrationCategory) : cat
      );
    } else {
      const newCategory: RegistrationCategory = {
        id: Date.now(),
        conference_id: editingConference.id || 1,
        name: editingPricingCategory.name || '',
        description: editingPricingCategory.description || '',
        academic_price: Number(editingPricingCategory.academic_price ?? 599),
        industry_price: Number(editingPricingCategory.industry_price ?? 799),
        student_price: Number(editingPricingCategory.student_price ?? 399),
        features: editingPricingCategory.features && editingPricingCategory.features.length > 0
          ? editingPricingCategory.features
          : [
              'Full access to all scientific tracks & keynotes',
              'Conference materials & Scopus-indexed abstracts',
              'Networking luncheon & refreshment breaks',
              'Official certificate of participation'
            ],
        is_active: true,
        display_order: currentList.length + 1
      };
      updatedList = [...currentList, newCategory];
    }

    setEditingConference({ ...editingConference, categories: updatedList });
    setIsPricingFormOpen(false);
    setEditingPricingCategory(null);
  };

  const handleRemovePricingCategory = (categoryId: number) => {
    if (!editingConference) return;
    const currentList = editingConference.categories || [];
    setEditingConference({
      ...editingConference,
      categories: currentList.filter(cat => cat.id !== categoryId)
    });
  };

  // Validate and Save
  const handleSave = async (e?: React.FormEvent, forceStatus?: ConferenceStatus) => {
    if (e) e.preventDefault();
    if (!editingConference) return;

    const errors: Record<string, string> = {};
    if (!editingConference.title?.trim()) errors.title = 'Conference title is required';
    if (!editingConference.short_title?.trim()) errors.short_title = 'Short title is required';
    if (!editingConference.conference_code?.trim()) errors.conference_code = 'Conference code is required';
    if (!editingConference.city?.trim()) errors.city = 'City is required';
    if (!editingConference.country?.trim()) errors.country = 'Country is required';
    if (!editingConference.start_date) errors.start_date = 'Start date is required';
    if (!editingConference.end_date) errors.end_date = 'End date is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setActiveEditorTab('basic');
      return;
    }

    setIsSaving(true);
    try {
      // Auto-generate slug if empty
      const slug =
        editingConference.slug ||
        (editingConference.short_title || editingConference.title || 'conf')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const payload: Partial<Conference> = {
        ...editingConference,
        slug,
        status: forceStatus || editingConference.status || 'draft',
        display_order: Number(editingConference.display_order ?? 1)
      };

      if (editingConference.id) {
        // Update existing
        await api.updateConference(editingConference.id, payload);
        const updatedList = conferences.map(c =>
          c.id === editingConference.id ? ({ ...c, ...payload } as Conference) : c
        );
        onConferencesChange(updatedList);
        showToast(`Conference "${payload.title}" saved successfully`);
      } else {
        // Create new
        const created = await api.createConference(payload);
        onConferencesChange([created, ...conferences]);
        showToast(`New conference created: "${created.title}"`);
      }

      setIsEditModalOpen(false);
      setEditingConference(null);
    } catch {
      // Local fallback
      if (editingConference.id) {
        const updatedList = conferences.map(c =>
          c.id === editingConference.id ? ({ ...c, ...editingConference } as Conference) : c
        );
        onConferencesChange(updatedList);
        showToast('Conference saved locally');
      } else {
        const newId = Math.max(...conferences.map(c => c.id), 0) + 1;
        const newConf = { ...editingConference, id: newId } as Conference;
        onConferencesChange([newConf, ...conferences]);
        showToast('Conference created locally');
      }
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingConference) return;
    setIsDeleting(true);
    try {
      await api.deleteConference(deletingConference.id);
      const updatedList = conferences.filter(c => c.id !== deletingConference.id);
      onConferencesChange(updatedList);
      showToast(`Conference "${deletingConference.title}" deleted successfully`);
    } catch {
      const updatedList = conferences.filter(c => c.id !== deletingConference.id);
      onConferencesChange(updatedList);
      showToast(`Conference "${deletingConference.title}" removed`);
    } finally {
      setIsDeleting(false);
      setDeletingConference(null);
    }
  };

  // Counts
  const totalCount = conferences.length;
  const publishedCount = conferences.filter(c => c.status === 'published').length;
  const draftCount = conferences.filter(c => c.status === 'draft').length;
  const archivedCount = conferences.filter(c => c.status === 'archived').length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Metrics Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-teal-50 text-teal-800 rounded-xl border border-teal-100">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Conference Management Portal</h2>
              <p className="text-xs text-slate-500">
                Manage live conference content, sections, display order, and publishing lifecycle
              </p>
            </div>
          </div>
        </div>

        {/* Counts & Action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
            <span className="font-bold text-slate-900">{totalCount}</span>
            <span className="text-slate-500">Total</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-teal-700">{publishedCount}</span>
            <span className="text-teal-600">Pub</span>
            <span className="text-slate-300">•</span>
            <span className="font-bold text-amber-700">{draftCount}</span>
            <span className="text-amber-600">Draft</span>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Conference</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & Sorting Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, code, city, theme..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Domain:</span>
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {availableDomains.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer font-semibold"
            >
              <option value="order">Display Order (#)</option>
              <option value="date">Start Date</option>
              <option value="title">Alphabetical</option>
              <option value="status">Lifecycle Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Conferences Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredConferences.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No conferences found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No scientific conferences match your search or filter criteria. Create a new conference to get started.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Conference</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-20 text-center">Order</th>
                  <th className="p-4">Conference Details</th>
                  <th className="p-4">Dates & Venue</th>
                  <th className="p-4">Publishing Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConferences.map((conf, index) => (
                  <tr
                    key={conf.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Display Order with Up/Down Controls */}
                    <td className="p-4 align-middle text-center">
                      <div className="inline-flex flex-col items-center justify-center space-y-0.5">
                        <button
                          title="Move Up"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(conf, 'up')}
                          className="p-1 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono font-bold flex items-center justify-center text-xs">
                          {conf.display_order ?? index + 1}
                        </span>
                        <button
                          title="Move Down"
                          disabled={index === filteredConferences.length - 1}
                          onClick={() => handleMoveOrder(conf, 'down')}
                          className="p-1 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Conference Thumbnail + Title + Metadata */}
                    <td className="p-4 align-top">
                      <div className="flex items-start space-x-3 max-w-md">
                        <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-2xs">
                          <img
                            src={conf.hero_image}
                            alt={conf.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.2 rounded-full">
                              {conf.short_title || 'Congress'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {conf.conference_code}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              • {conf.domain}
                            </span>
                          </div>
                          <h4
                            onClick={() => handleOpenEdit(conf)}
                            className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors line-clamp-1 cursor-pointer"
                          >
                            {conf.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                            Theme: {conf.theme}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Dates & Location */}
                    <td className="p-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 text-slate-700 font-medium text-xs">
                          <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{conf.start_date} – {conf.end_date}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{conf.city}, {conf.country}</span>
                        </div>
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                          {conf.mode}
                        </span>
                      </div>
                    </td>

                    {/* Status & Quick Toggle */}
                    <td className="p-4 align-top">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize border ${
                            conf.status === 'published'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : conf.status === 'draft'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              conf.status === 'published'
                                ? 'bg-teal-600'
                                : conf.status === 'draft'
                                ? 'bg-amber-600'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{conf.status}</span>
                        </span>

                        {/* One-click toggle */}
                        <div>
                          <button
                            onClick={() => handleTogglePublish(conf)}
                            className="text-[11px] font-semibold text-slate-600 hover:text-teal-800 underline decoration-slate-300 hover:decoration-teal-600 cursor-pointer transition-colors block"
                          >
                            {conf.status === 'published' ? 'Switch to Draft' : 'Publish to Website'}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          title="Preview Public Website"
                          onClick={() => {
                            onSelectConference(conf.slug);
                            window.open(`/conferences/${conf.slug}`, '_blank');
                          }}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          title="Duplicate Conference (Clone)"
                          onClick={() => handleDuplicate(conf)}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit Sections & Details"
                          onClick={() => handleOpenEdit(conf)}
                          className="p-1.5 text-teal-800 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer font-semibold flex items-center space-x-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="text-[11px] hidden sm:inline">Edit</span>
                        </button>
                        <button
                          title="Delete Conference"
                          onClick={() => setDeletingConference(conf)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION-ORGANIZED CONFERENCE EDITOR MODAL                                 */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingConference && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-6 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 bg-teal-50 text-teal-800 rounded-2xl border border-teal-100">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {editingConference.id ? `Edit: ${editingConference.short_title || editingConference.title}` : 'Create New Scientific Conference'}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        editingConference.status === 'published'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {editingConference.status || 'draft'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Manage frontend content sections, dates, carousel messages, and publishing order
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {editingConference.slug && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectConference(editingConference.slug!);
                      window.open(`/conferences/${editingConference.slug}`, '_blank');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preview Live</span>
                  </button>
                )}
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Section Tabs (8 Logical Tabs) */}
            <div className="flex border-b border-slate-200 bg-white px-5 overflow-x-auto scrollbar-none gap-1 sm:gap-2">
              {[
                { id: 'basic', label: '1. Basic Info & Hero', icon: Sparkles },
                { id: 'about', label: '2. About & Highlights', icon: FileText },
                { id: 'carousel', label: '3. Welcome & Exhibitors Carousel', icon: MessageSquare },
                { id: 'deadlines', label: '4. Deadlines & Program Flow', icon: Clock },
                { id: 'publishing', label: '5. Publishing & Order', icon: SlidersHorizontal },
                { id: 'committee', label: '6. Organizing Committee & Chairs', icon: Users },
                { id: 'corporate_partners', label: '7. Corporate & Industrial Partners', icon: Building },
                { id: 'media_partners', label: '8. Global Media Partners', icon: Globe },
                { id: 'pricing', label: '9. Registration Pricing Tiers', icon: CreditCard }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeEditorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveEditorTab(tab.id as EditorTab)}
                    className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'border-teal-700 text-teal-800 font-bold bg-teal-50/30'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[calc(92vh-180px)]">
              {/* ========================================================================= */}
              {/* TAB 1: BASIC INFO & HERO BANNER                                           */}
              {/* ========================================================================= */}
              {activeEditorTab === 'basic' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                    <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                      Hero Section Configuration
                    </h4>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      This information powers the top dark Hero Banner on the Conference Details page, including title, dates, venue, countdown, and brochure download.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Conference Title */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Full Conference Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingConference.title || ''}
                        onChange={e => setEditingConference({ ...editingConference, title: e.target.value })}
                        placeholder="e.g., 2nd World Congress on Biopolymers & Bioplastics"
                        className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                          formErrors.title ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                        }`}
                      />
                      {formErrors.title && <p className="text-[11px] text-red-500">{formErrors.title}</p>}
                    </div>

                    {/* Short Title / Acronym */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Short Name / Conference Label <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingConference.short_title || ''}
                        onChange={e => setEditingConference({ ...editingConference, short_title: e.target.value })}
                        placeholder="e.g., Biopolymers 2026"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                      {formErrors.short_title && <p className="text-[11px] text-red-500">{formErrors.short_title}</p>}
                    </div>

                    {/* Conference Code */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Conference Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingConference.conference_code || ''}
                        onChange={e => setEditingConference({ ...editingConference, conference_code: e.target.value })}
                        placeholder="e.g., SCINS-BIO-2026"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Research Domain */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Scientific Domain</label>
                      <input
                        type="text"
                        value={editingConference.domain || ''}
                        onChange={e => setEditingConference({ ...editingConference, domain: e.target.value })}
                        placeholder="e.g., Biotechnology, Medicine, AI"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Mode */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Conference Format / Mode</label>
                      <select
                        value={editingConference.mode || 'hybrid'}
                        onChange={e => setEditingConference({ ...editingConference, mode: e.target.value as ConferenceMode })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="in-person">In-Person</option>
                        <option value="hybrid">Hybrid (In-Person + Virtual)</option>
                        <option value="virtual">Virtual Only</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Scientific Theme</label>
                      <input
                        type="text"
                        value={editingConference.theme || ''}
                        onChange={e => setEditingConference({ ...editingConference, theme: e.target.value })}
                        placeholder="e.g., Towards Biopolymers: Catalyzing Macromolecular Innovation for a Circular World"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Dates */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={editingConference.start_date || ''}
                        onChange={e => setEditingConference({ ...editingConference, start_date: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                      {formErrors.start_date && <p className="text-[11px] text-red-500">{formErrors.start_date}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={editingConference.end_date || ''}
                        onChange={e => setEditingConference({ ...editingConference, end_date: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                      {formErrors.end_date && <p className="text-[11px] text-red-500">{formErrors.end_date}</p>}
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Host City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingConference.city || ''}
                        onChange={e => setEditingConference({ ...editingConference, city: e.target.value })}
                        placeholder="e.g., Paris"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingConference.country || ''}
                        onChange={e => setEditingConference({ ...editingConference, country: e.target.value })}
                        placeholder="e.g., France"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Venue Name */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Venue Name & Hall</label>
                      <input
                        type="text"
                        value={editingConference.venue || ''}
                        onChange={e => setEditingConference({ ...editingConference, venue: e.target.value })}
                        placeholder="e.g., Paris Convention Centre & Pullman Congress Hall"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Hero Background Image */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-700">Hero Banner Background Image</label>
                      <MediaUploadInput
                        label="Hero Background"
                        value={editingConference.hero_image || ''}
                        onChange={url => setEditingConference({ ...editingConference, hero_image: url })}
                        placeholder="https://images.unsplash.com/photo-..."
                        helperText="Displays in the top hero backdrop with dark gradient overlay"
                        category="hero"
                      />
                    </div>

                    {/* Brochure / Flyer URL */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Official Brochure / Flyer Download Link (PDF)
                      </label>
                      <MediaUploadInput
                        label="Brochure PDF"
                        accept="pdf"
                        value={editingConference.flyer_url || ''}
                        onChange={url => setEditingConference({ ...editingConference, flyer_url: url })}
                        placeholder="https://scinsmedia.com/downloads/brochure.pdf"
                        helperText="Enables the 'Download Brochure' button on the Conference Page"
                        category="brochure"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: ABOUT CONGRESS & GALLERY                                           */}
              {/* ========================================================================= */}
              {activeEditorTab === 'about' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                    <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                      About Congress Section
                    </h4>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Configures the "Congress Overview & Scientific Scope" section, the 4 key highlight metrics with checkmarks, and the 2x2 gallery photos.
                    </p>
                  </div>

                  {/* About Section Heading */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">About Section Main Heading</label>
                    <input
                      type="text"
                      value={editingConference.about_heading || ''}
                      onChange={e => setEditingConference({ ...editingConference, about_heading: e.target.value })}
                      placeholder="e.g., Accelerating Sustainable Polymer Innovations & Industrial Decarbonization"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-semibold"
                    />
                  </div>

                  {/* Overview Text */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Congress Overview & Scientific Scope (Detailed Narrative)
                    </label>
                    <textarea
                      rows={5}
                      value={editingConference.detailed_about || editingConference.description || ''}
                      onChange={e =>
                        setEditingConference({
                          ...editingConference,
                          detailed_about: e.target.value,
                          description: e.target.value
                        })
                      }
                      placeholder="Detailed introduction explaining congress goals, scientific coordination, journal publication..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 leading-relaxed"
                    />
                  </div>

                  {/* 4 Key Highlights */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        4 Key Highlights (Shown with checkmarks on frontend)
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Exactly 4 bullet points</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map(idx => {
                        const highlights = editingConference.about_highlights || [
                          'Over 450+ physical attendees from 48 nations',
                          '20 specialized scientific tracks & breakout rooms',
                          'Elsevier Scopus-indexed special issue publication',
                          'Direct B2B technology transfer & venture showcase'
                        ];
                        return (
                          <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={highlights[idx] || ''}
                              onChange={e => {
                                const copy = [...highlights];
                                copy[idx] = e.target.value;
                                setEditingConference({ ...editingConference, about_highlights: copy });
                              }}
                              placeholder={`Highlight #${idx + 1}...`}
                              className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4 Gallery Photos */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        4 About Gallery Photos (2x2 Grid)
                      </label>
                      <span className="text-[10px] text-slate-400">Lab, auditorium, and conference imagery</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map(idx => {
                        const gallery = editingConference.gallery_images || [
                          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
                          'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
                          'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
                          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
                        ];
                        const labels = ['1. Research Lab', '2. Chemical Testing', '3. Auditorium Hall', '4. Poster Sessions'];
                        return (
                          <div key={idx} className="space-y-1">
                            <span className="text-[11px] font-semibold text-slate-600">{labels[idx]}</span>
                            <MediaUploadInput
                              label={labels[idx]}
                              value={gallery[idx] || ''}
                              onChange={url => {
                                const copy = [...gallery];
                                copy[idx] = url;
                                setEditingConference({ ...editingConference, gallery_images: copy });
                              }}
                              placeholder="Image URL..."
                              category="gallery"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: WELCOME ADDRESS & INDUSTRY EXHIBITORS CAROUSEL                      */}
              {/* ========================================================================= */}
              {activeEditorTab === 'carousel' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                    <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                      2-Item Horizontal Carousel Section
                    </h4>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Powers the interactive 2-slide carousel containing <strong>Slide 1: Welcome Address</strong> and <strong>Slide 2: Industry Exhibitors</strong>.
                    </p>
                  </div>

                  {/* SLIDE 1: WELCOME ADDRESS */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Slide 1: Welcome Address
                        </h4>
                      </div>
                      <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                        Welcome Address
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Slide Heading</label>
                        <input
                          type="text"
                          value={editingConference.welcome_heading || ''}
                          onChange={e => setEditingConference({ ...editingConference, welcome_heading: e.target.value })}
                          placeholder="e.g., Message from the General Chair"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Chair / Speaker Full Name</label>
                        <input
                          type="text"
                          value={editingConference.welcome_speaker_name || ''}
                          onChange={e => setEditingConference({ ...editingConference, welcome_speaker_name: e.target.value })}
                          placeholder="e.g., Prof. Henriette Dubois, Ph.D."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Chair Role Badge</label>
                        <input
                          type="text"
                          value={editingConference.welcome_speaker_role || ''}
                          onChange={e => setEditingConference({ ...editingConference, welcome_speaker_role: e.target.value })}
                          placeholder="e.g., Conference Chair"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Chair Title & Academic Affiliation</label>
                        <input
                          type="text"
                          value={editingConference.welcome_speaker_title || ''}
                          onChange={e => setEditingConference({ ...editingConference, welcome_speaker_title: e.target.value })}
                          placeholder="e.g., Research Director & Chair of Macromolecular Chemistry, Sorbonne Université / CNRS"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Chair Photo</label>
                        <MediaUploadInput
                          label="Chair Photo"
                          value={editingConference.welcome_speaker_image || ''}
                          onChange={url => setEditingConference({ ...editingConference, welcome_speaker_image: url })}
                          placeholder="Photo URL..."
                          category="speaker"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Welcome Address Message</label>
                        <textarea
                          rows={4}
                          value={editingConference.welcome_message || ''}
                          onChange={e => setEditingConference({ ...editingConference, welcome_message: e.target.value })}
                          placeholder="Full text of the general chair welcome address..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 leading-relaxed italic"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Footer Note</label>
                        <input
                          type="text"
                          value={editingConference.welcome_footer_text || ''}
                          onChange={e => setEditingConference({ ...editingConference, welcome_footer_text: e.target.value })}
                          placeholder="e.g., Join us at Biopolymers 2026 in Paris to collaborate, innovate, and drive scientific excellence forward."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 2: INDUSTRY EXHIBITORS */}
                  <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Slide 2: Industry Exhibitors
                        </h4>
                      </div>
                      <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-bold">
                        Industry Exhibitors
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Slide Heading</label>
                        <input
                          type="text"
                          value={editingConference.exhibitor_heading || ''}
                          onChange={e => setEditingConference({ ...editingConference, exhibitor_heading: e.target.value })}
                          placeholder="e.g., Global Industry Leaders & Technology Showcase"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Exhibitor Group Label</label>
                        <input
                          type="text"
                          value={editingConference.exhibitor_speaker_name || ''}
                          onChange={e => setEditingConference({ ...editingConference, exhibitor_speaker_name: e.target.value })}
                          placeholder="e.g., Confirmed Industry Exhibitors"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Partnership Badge</label>
                        <input
                          type="text"
                          value={editingConference.exhibitor_speaker_role || ''}
                          onChange={e => setEditingConference({ ...editingConference, exhibitor_speaker_role: e.target.value })}
                          placeholder="e.g., Platinum & Gold Partners"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Exhibition Booths & Hall Location</label>
                        <input
                          type="text"
                          value={editingConference.exhibitor_speaker_title || ''}
                          onChange={e => setEditingConference({ ...editingConference, exhibitor_speaker_title: e.target.value })}
                          placeholder="e.g., Main Exhibition Hall & Innovation Pavilions (Booths P-101 to E-408)"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Exhibitor Showcase Image</label>
                        <MediaUploadInput
                          label="Exhibitor Image"
                          value={editingConference.exhibitor_image || ''}
                          onChange={url => setEditingConference({ ...editingConference, exhibitor_image: url })}
                          placeholder="Image URL..."
                          category="exhibitor"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Exhibitors Overview Narrative</label>
                        <textarea
                          rows={4}
                          value={editingConference.exhibitor_message || ''}
                          onChange={e => setEditingConference({ ...editingConference, exhibitor_message: e.target.value })}
                          placeholder="Description of premier international commercial partners, prototype demos, resin solutions..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 leading-relaxed italic"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Footer Note</label>
                        <input
                          type="text"
                          value={editingConference.exhibitor_footer_text || ''}
                          onChange={e => setEditingConference({ ...editingConference, exhibitor_footer_text: e.target.value })}
                          placeholder="e.g., Live demonstrations and commercial partner consultations scheduled throughout the congress."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: DEADLINES & PROGRAM FLOW                                           */}
              {/* ========================================================================= */}
              {activeEditorTab === 'deadlines' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                    <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                      Deadlines & 2-Day Schedule Program Visual
                    </h4>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Configure key academic deadlines displayed on conference cards and registration passes, along with the right-side presentation hall image.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Abstract Deadline */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Abstract Submission Deadline</label>
                      <input
                        type="date"
                        value={editingConference.abstract_deadline || ''}
                        onChange={e => setEditingConference({ ...editingConference, abstract_deadline: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Early Bird Deadline */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Early Bird Pass Deadline</label>
                      <input
                        type="date"
                        value={editingConference.early_bird_deadline || ''}
                        onChange={e => setEditingConference({ ...editingConference, early_bird_deadline: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Registration Deadline */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Final Registration Deadline</label>
                      <input
                        type="date"
                        value={editingConference.registration_deadline || ''}
                        onChange={e => setEditingConference({ ...editingConference, registration_deadline: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Program Flow Image */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700">
                      2-Day Schedule Program Visual Image (Presentation Hall Card)
                    </label>
                    <MediaUploadInput
                      label="Schedule Visual Image"
                      value={editingConference.program_image || ''}
                      onChange={url => setEditingConference({ ...editingConference, program_image: url })}
                      placeholder="https://images.unsplash.com/photo-..."
                      helperText="Displays on the right side of the 2-Day Schedule (Program Flow) section"
                      category="program"
                    />
                  </div>

                  {/* 2-Day Schedule Flow Management */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                          2-Day Scientific Program Schedule Items
                        </h4>
                        <p className="text-[11px] text-teal-700 mt-0.5">
                          Configure presentation sessions, keynote lectures, lunch breaks, and panel discussions for Day 1 and Day 2.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingScheduleItem({
                            time: '09:00 - 10:00',
                            title: '',
                            speaker: '',
                            room: 'Main Auditorium',
                            type: 'Keynote',
                            day_label: activeScheduleDayTab
                          });
                          setIsScheduleFormOpen(true);
                        }}
                        className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Schedule Item ({activeScheduleDayTab})</span>
                      </button>
                    </div>

                    {/* Day 1 / Day 2 Tab Selector */}
                    <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                      {(['Day 1', 'Day 2'] as const).map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setActiveScheduleDayTab(day)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                            activeScheduleDayTab === day
                              ? 'bg-teal-800 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {day} Schedule ({((editingConference.schedule || []).filter(s => (s.day_label || 'Day 1') === day)).length})
                        </button>
                      ))}
                    </div>

                    {/* Inline Form / Modal for Adding/Editing Schedule Item */}
                    {isScheduleFormOpen && editingScheduleItem && (
                      <div className="bg-slate-50 border-2 border-teal-600/30 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-teal-700" />
                            <h5 className="text-xs font-bold text-slate-900">
                              {editingScheduleItem.id ? 'Edit Schedule Item' : `Add Item to ${editingScheduleItem.day_label || activeScheduleDayTab}`}
                            </h5>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsScheduleFormOpen(false);
                              setEditingScheduleItem(null);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                              Time Interval <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editingScheduleItem.time || ''}
                              onChange={e => setEditingScheduleItem({ ...editingScheduleItem, time: e.target.value })}
                              placeholder="e.g., 08:30 - 09:15"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-mono"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                              Day Allocation
                            </label>
                            <select
                              value={editingScheduleItem.day_label || activeScheduleDayTab}
                              onChange={e => setEditingScheduleItem({ ...editingScheduleItem, day_label: e.target.value as 'Day 1' | 'Day 2' })}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                            >
                              <option value="Day 1">Day 1</option>
                              <option value="Day 2">Day 2</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-700">
                              Session / Event Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={editingScheduleItem.title || ''}
                              onChange={e => setEditingScheduleItem({ ...editingScheduleItem, title: e.target.value })}
                              placeholder="e.g., Keynote Address: Advanced Circular Bio-Macromolecules"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Speaker / Moderator (Optional)</label>
                            <input
                              type="text"
                              value={editingScheduleItem.speaker || ''}
                              onChange={e => setEditingScheduleItem({ ...editingScheduleItem, speaker: e.target.value })}
                              placeholder="e.g., Prof. Henriette Dubois"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Room / Hall Location</label>
                            <input
                              type="text"
                              value={editingScheduleItem.room || ''}
                              onChange={e => setEditingScheduleItem({ ...editingScheduleItem, room: e.target.value })}
                              placeholder="e.g., Grand Ballroom Foyer or Hall B"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                            />
                          </div>

                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-700">Session Badge / Type</label>
                            <input
                              type="text"
                              value={editingScheduleItem.type || ''}
                              onChange={e => setEditingScheduleItem({ ...editingScheduleItem, type: e.target.value })}
                              placeholder="e.g., Keynote, Registration, Session, Break, Networking, Panel"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                          <button
                            type="button"
                            onClick={() => {
                              setIsScheduleFormOpen(false);
                              setEditingScheduleItem(null);
                            }}
                            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveScheduleItem}
                            className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Schedule Item</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Schedule List for the Active Day */}
                    <div className="space-y-2">
                      {(() => {
                        const dayItems = (editingConference.schedule || []).filter(
                          s => (s.day_label || 'Day 1') === activeScheduleDayTab
                        );
                        if (dayItems.length === 0) {
                          return (
                            <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                              <Clock className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                              <p className="text-xs text-slate-500 font-medium">No items added for {activeScheduleDayTab} yet.</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Click "Add Schedule Item" above to add time slots, speakers, and breakout tracks.
                              </p>
                            </div>
                          );
                        }
                        return dayItems.map(item => (
                          <div
                            key={item.id}
                            className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
                          >
                            <div className="flex items-start space-x-3 min-w-0">
                              <div className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-700 shrink-0">
                                {item.time}
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <h6 className="text-xs font-bold text-slate-900 truncate">
                                    {item.title}
                                  </h6>
                                  {item.type && (
                                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded-md shrink-0">
                                      {item.type}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                  {item.speaker && (
                                    <span className="font-medium text-slate-700">Speaker: {item.speaker}</span>
                                  )}
                                  {item.room && (
                                    <span>• Room: {item.room}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                title="Edit Item"
                                onClick={() => {
                                  setEditingScheduleItem({ ...item });
                                  setIsScheduleFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Remove Item"
                                onClick={() => handleRemoveScheduleItem(item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: PUBLISHING & DISPLAY ORDER                                         */}
              {/* ========================================================================= */}
              {activeEditorTab === 'publishing' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                    <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                      Publishing Lifecycle & Priority Order
                    </h4>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Control visibility on the public portal and set the sequence priority across the homepage and conference directory.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Lifecycle Status</label>
                      <select
                        value={editingConference.status || 'draft'}
                        onChange={e =>
                          setEditingConference({ ...editingConference, status: e.target.value as ConferenceStatus })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-semibold"
                      >
                        <option value="published">Published (Visible to Global Public)</option>
                        <option value="draft">Draft (Private / Testing / Admin Only)</option>
                        <option value="archived">Archived (Past Proceedings)</option>
                      </select>
                    </div>

                    {/* Display Order */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Display Order Priority (Lower numbers appear first)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={editingConference.display_order ?? 1}
                        onChange={e =>
                          setEditingConference({
                            ...editingConference,
                            display_order: parseInt(e.target.value) || 1
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Featured Badge */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Card Badge (Optional)</label>
                      <input
                        type="text"
                        value={editingConference.featured_badge || ''}
                        onChange={e => setEditingConference({ ...editingConference, featured_badge: e.target.value })}
                        placeholder="e.g., 2nd Edition Flagship"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* URL Slug */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Custom URL Slug</label>
                      <input
                        type="text"
                        value={editingConference.slug || ''}
                        onChange={e => setEditingConference({ ...editingConference, slug: e.target.value })}
                        placeholder="e.g., biopolymers-bioplastics-2026"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  {/* Preview Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-xs font-bold text-slate-800">Public Page URL:</span>
                      <p className="text-xs font-mono text-teal-800 break-all">
                        https://scinsmedia.com/conferences/{editingConference.slug || 'slug'}
                      </p>
                    </div>
                    {editingConference.slug && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectConference(editingConference.slug!);
                          window.open(`/conferences/${editingConference.slug}`, '_blank');
                        }}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs shrink-0 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
                        <span>Preview Public Website</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 6: ORGANIZING COMMITTEE & CHAIRS                                      */}
              {/* ========================================================================= */}
              {activeEditorTab === 'committee' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                        Organizing Committee & Chairs Configuration
                      </h4>
                      <p className="text-[11px] text-teal-700 mt-0.5">
                        Manage chairs, co-chairs, and scientific committee members displayed on the conference frontend.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommitteeMember({
                          name: '',
                          photo_url: '',
                          committee_role: 'Scientific Committee',
                          designation: '',
                          institution: '',
                          country: '',
                          biography: ''
                        });
                        setIsCommitteeFormOpen(true);
                      }}
                      className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Committee Member</span>
                    </button>
                  </div>

                  {/* Inline Form / Modal for Adding/Editing Committee Member */}
                  {isCommitteeFormOpen && editingCommitteeMember && (
                    <div className="bg-slate-50 border-2 border-teal-600/30 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-teal-700" />
                          <h5 className="text-xs font-bold text-slate-900">
                            {editingCommitteeMember.id ? 'Edit Committee Member' : 'Add New Committee Member'}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCommitteeFormOpen(false);
                            setEditingCommitteeMember(null);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Full Name & Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingCommitteeMember.name || ''}
                            onChange={e =>
                              setEditingCommitteeMember({ ...editingCommitteeMember, name: e.target.value })
                            }
                            placeholder="e.g., Prof. Sarah Jenkins, Ph.D."
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                            required
                          />
                        </div>

                        {/* Committee Role */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Committee Role / Position</label>
                          <select
                            value={editingCommitteeMember.committee_role || 'Scientific Committee'}
                            onChange={e =>
                              setEditingCommitteeMember({ ...editingCommitteeMember, committee_role: e.target.value })
                            }
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                          >
                            <option value="Honorary Chair">Honorary Chair</option>
                            <option value="General Chair">General Chair</option>
                            <option value="Co-Chair">Co-Chair</option>
                            <option value="Scientific Committee">Scientific Committee</option>
                            <option value="Organizing Committee">Organizing Committee</option>
                            <option value="Advisory Board">Advisory Board</option>
                          </select>
                        </div>

                        {/* Designation */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Academic Designation</label>
                          <input
                            type="text"
                            value={editingCommitteeMember.designation || ''}
                            onChange={e =>
                              setEditingCommitteeMember({ ...editingCommitteeMember, designation: e.target.value })
                            }
                            placeholder="e.g., Director of Advanced Materials"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        {/* Institution */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Institution / University</label>
                          <input
                            type="text"
                            value={editingCommitteeMember.institution || ''}
                            onChange={e =>
                              setEditingCommitteeMember({ ...editingCommitteeMember, institution: e.target.value })
                            }
                            placeholder="e.g., Massachusetts Institute of Technology"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        {/* Country */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Country</label>
                          <input
                            type="text"
                            value={editingCommitteeMember.country || ''}
                            onChange={e =>
                              setEditingCommitteeMember({ ...editingCommitteeMember, country: e.target.value })
                            }
                            placeholder="e.g., United States"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        {/* Photo URL / Upload */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-slate-700">Photo</label>
                          <MediaUploadInput
                            label="Member Portrait Photo"
                            value={editingCommitteeMember.photo_url || ''}
                            onChange={url =>
                              setEditingCommitteeMember({ ...editingCommitteeMember, photo_url: url })
                            }
                            placeholder="https://images.unsplash.com/photo-..."
                            helperText="Recommended square or portrait image (displays at 48x48 rounded avatar on frontend)"
                            category="speakers"
                          />
                        </div>

                        {/* Biography */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-slate-700">Biography / Research Background</label>
                          <textarea
                            rows={3}
                            value={editingCommitteeMember.biography || ''}
                            onChange={e =>
                              setEditingCommitteeMember({ ...editingCommitteeMember, biography: e.target.value })
                            }
                            placeholder="Brief biographical summary and academic achievements..."
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCommitteeFormOpen(false);
                            setEditingCommitteeMember(null);
                          }}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCommitteeMember}
                          className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Member</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Members List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-800">
                        Configured Committee Members ({(editingConference.committee || []).length})
                      </h5>
                    </div>

                    {(!editingConference.committee || editingConference.committee.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No committee members assigned to this conference.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click "Add Committee Member" above to create chairs, co-chairs, or scientific members.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {editingConference.committee.map(member => (
                          <div
                            key={member.id}
                            className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-start justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-start space-x-3 min-w-0">
                              <img
                                src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                                alt={member.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5"
                              />
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h6 className="text-xs font-bold text-slate-900 truncate">{member.name}</h6>
                                  <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                                    {member.committee_role || 'Member'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 font-medium truncate">
                                  {member.designation || 'Academic Member'}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {member.institution}{member.country ? ` • ${member.country}` : ''}
                                </p>
                                {member.biography && (
                                  <p className="text-[10px] text-slate-500 line-clamp-2 italic pt-1">
                                    "{member.biography}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                title="Edit Member"
                                onClick={() => {
                                  setEditingCommitteeMember({ ...member });
                                  setIsCommitteeFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Remove Member"
                                onClick={() => handleRemoveCommitteeMember(member.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 7: CORPORATE & INDUSTRIAL PARTNERS                                    */}
              {/* ========================================================================= */}
              {activeEditorTab === 'corporate_partners' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                        Corporate & Industrial Partners Configuration
                      </h4>
                      <p className="text-[11px] text-teal-700 mt-0.5">
                        Manage corporate sponsors and industry partners displayed in the Corporate & Industrial Partners section.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCorporatePartner({
                          name: '',
                          company_name: '',
                          logo_url: '',
                          website: ''
                        });
                        setIsCorporatePartnerFormOpen(true);
                      }}
                      className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Corporate Partner</span>
                    </button>
                  </div>

                  {/* Inline Form / Modal for Adding/Editing Corporate Partner */}
                  {isCorporatePartnerFormOpen && editingCorporatePartner && (
                    <div className="bg-slate-50 border-2 border-teal-600/30 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-teal-700" />
                          <h5 className="text-xs font-bold text-slate-900">
                            {editingCorporatePartner.id ? 'Edit Corporate Partner' : 'Add New Corporate Partner'}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCorporatePartnerFormOpen(false);
                            setEditingCorporatePartner(null);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Partner Name */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Partner / Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingCorporatePartner.name || editingCorporatePartner.company_name || ''}
                            onChange={e =>
                              setEditingCorporatePartner({
                                ...editingCorporatePartner,
                                name: e.target.value,
                                company_name: e.target.value
                              })
                            }
                            placeholder="e.g., NovaBio Systems Corp"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                            required
                          />
                        </div>

                        {/* Website URL */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Website URL</label>
                          <input
                            type="text"
                            value={editingCorporatePartner.website || ''}
                            onChange={e =>
                              setEditingCorporatePartner({ ...editingCorporatePartner, website: e.target.value })
                            }
                            placeholder="https://example.com"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        {/* Logo URL / Upload */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-slate-700">Partner Logo</label>
                          <MediaUploadInput
                            label="Corporate Partner Logo"
                            value={editingCorporatePartner.logo_url || ''}
                            onChange={url =>
                              setEditingCorporatePartner({ ...editingCorporatePartner, logo_url: url })
                            }
                            placeholder="https://images.unsplash.com/..."
                            helperText="Recommended rectangular logo with transparent or light background"
                            category="sponsors"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCorporatePartnerFormOpen(false);
                            setEditingCorporatePartner(null);
                          }}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCorporatePartner}
                          className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Partner</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Partners List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-800">
                        Configured Corporate Partners ({(editingConference.sponsors || []).length})
                      </h5>
                    </div>

                    {(!editingConference.sponsors || editingConference.sponsors.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No corporate partners added yet.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click "Add Corporate Partner" above to add corporate & industrial sponsors.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {editingConference.sponsors.map(sponsor => (
                          <div
                            key={sponsor.id}
                            className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2.5 mb-3">
                                <img
                                  src={sponsor.logo_url}
                                  alt={sponsor.name || sponsor.company_name}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <h6 className="text-xs font-bold text-slate-900 truncate">
                                {sponsor.name || sponsor.company_name}
                              </h6>
                              {sponsor.website && (
                                <a
                                  href={sponsor.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-teal-700 hover:underline truncate flex items-center space-x-1 mt-1 font-mono"
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{sponsor.website}</span>
                                </a>
                              )}
                            </div>

                            <div className="flex items-center justify-end space-x-1 pt-3 mt-3 border-t border-slate-100">
                              <button
                                type="button"
                                title="Edit Partner"
                                onClick={() => {
                                  setEditingCorporatePartner({
                                    id: sponsor.id,
                                    name: sponsor.name || sponsor.company_name,
                                    company_name: sponsor.name || sponsor.company_name,
                                    logo_url: sponsor.logo_url,
                                    website: sponsor.website,
                                    description: sponsor.description
                                  });
                                  setIsCorporatePartnerFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Remove Partner"
                                onClick={() => handleRemoveCorporatePartner(sponsor.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 8: GLOBAL MEDIA & ACADEMIC PUBLISHING PARTNERS                        */}
              {/* ========================================================================= */}
              {activeEditorTab === 'media_partners' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                        Global Media & Academic Publishing Partners Configuration
                      </h4>
                      <p className="text-[11px] text-teal-700 mt-0.5">
                        Manage media outlets and academic publishing partners displayed on the conference page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMediaPartner({
                          name: '',
                          logo_url: '',
                          website: ''
                        });
                        setIsMediaPartnerFormOpen(true);
                      }}
                      className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Media Partner</span>
                    </button>
                  </div>

                  {/* Inline Form / Modal for Adding/Editing Media Partner */}
                  {isMediaPartnerFormOpen && editingMediaPartner && (
                    <div className="bg-slate-50 border-2 border-teal-600/30 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-teal-700" />
                          <h5 className="text-xs font-bold text-slate-900">
                            {editingMediaPartner.id ? 'Edit Media Partner' : 'Add New Media Partner'}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMediaPartnerFormOpen(false);
                            setEditingMediaPartner(null);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Media Partner Name */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Media Partner / Journal Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingMediaPartner.name || ''}
                            onChange={e =>
                              setEditingMediaPartner({ ...editingMediaPartner, name: e.target.value })
                            }
                            placeholder="e.g., Global Materials Today"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                            required
                          />
                        </div>

                        {/* Website URL */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Website URL</label>
                          <input
                            type="text"
                            value={editingMediaPartner.website || ''}
                            onChange={e =>
                              setEditingMediaPartner({ ...editingMediaPartner, website: e.target.value })
                            }
                            placeholder="https://example.com"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        {/* Logo URL / Upload */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-slate-700">Media Partner Logo</label>
                          <MediaUploadInput
                            label="Media Partner / Journal Logo"
                            value={editingMediaPartner.logo_url || ''}
                            onChange={url =>
                              setEditingMediaPartner({ ...editingMediaPartner, logo_url: url })
                            }
                            placeholder="https://images.unsplash.com/..."
                            helperText="Recommended rectangular logo for publishing partner or media brand"
                            category="partners"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMediaPartnerFormOpen(false);
                            setEditingMediaPartner(null);
                          }}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveMediaPartner}
                          className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Media Partner</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Media Partners List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-800">
                        Configured Media Partners ({(editingConference.media_partners || []).length})
                      </h5>
                    </div>

                    {(!editingConference.media_partners || editingConference.media_partners.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No media partners added yet.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click "Add Media Partner" above to register academic journals and press partners.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {editingConference.media_partners.map(partner => (
                          <div
                            key={partner.id}
                            className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <div className="h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2.5 mb-3">
                                <img
                                  src={partner.logo_url}
                                  alt={partner.name}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <h6 className="text-xs font-bold text-slate-900 truncate">
                                {partner.name}
                              </h6>
                              {partner.website && (
                                <a
                                  href={partner.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-teal-700 hover:underline truncate flex items-center space-x-1 mt-1 font-mono"
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{partner.website}</span>
                                </a>
                              )}
                            </div>

                            <div className="flex items-center justify-end space-x-1 pt-3 mt-3 border-t border-slate-100">
                              <button
                                type="button"
                                title="Edit Partner"
                                onClick={() => {
                                  setEditingMediaPartner({
                                    id: partner.id,
                                    name: partner.name,
                                    logo_url: partner.logo_url,
                                    website: partner.website,
                                    country: partner.country,
                                    description: partner.description
                                  });
                                  setIsMediaPartnerFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Remove Partner"
                                onClick={() => handleRemoveMediaPartner(partner.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 9: REGISTRATION PRICING TIERS                                         */}
              {/* ========================================================================= */}
              {activeEditorTab === 'pricing' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                        Registration Pricing Tiers Configuration
                      </h4>
                      <p className="text-[11px] text-teal-700 mt-0.5">
                        Manage registration categories, attendee rates (Academic, Industry, Student), and included pass privileges.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPricingCategory({
                          name: '',
                          description: '',
                          academic_price: 599,
                          industry_price: 799,
                          student_price: 399,
                          features: [
                            'Full access to all scientific tracks & keynotes',
                            'Conference materials & Scopus-indexed abstracts',
                            'Networking luncheon & refreshment breaks',
                            'Official certificate of participation'
                          ]
                        });
                        setIsPricingFormOpen(true);
                      }}
                      className="px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Pricing Tier</span>
                    </button>
                  </div>

                  {/* Inline Form for Adding/Editing Pricing Tier */}
                  {isPricingFormOpen && editingPricingCategory && (
                    <div className="bg-slate-50 border-2 border-teal-600/30 rounded-2xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-teal-700" />
                          <h5 className="text-xs font-bold text-slate-900">
                            {editingPricingCategory.id ? 'Edit Pricing Tier' : 'Add New Pricing Tier'}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPricingFormOpen(false);
                            setEditingPricingCategory(null);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Tier / Category Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingPricingCategory.name || ''}
                            onChange={e =>
                              setEditingPricingCategory({ ...editingPricingCategory, name: e.target.value })
                            }
                            placeholder="e.g., Oral Presentation Pass, Poster Pass, Listener Pass"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Academic Price ($ USD) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={editingPricingCategory.academic_price ?? 599}
                            onChange={e =>
                              setEditingPricingCategory({ ...editingPricingCategory, academic_price: Number(e.target.value) })
                            }
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Industry / Corporate Price ($ USD)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={editingPricingCategory.industry_price ?? 799}
                            onChange={e =>
                              setEditingPricingCategory({ ...editingPricingCategory, industry_price: Number(e.target.value) })
                            }
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Student / Scholar Price ($ USD)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={editingPricingCategory.student_price ?? 399}
                            onChange={e =>
                              setEditingPricingCategory({ ...editingPricingCategory, student_price: Number(e.target.value) })
                            }
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-xs font-bold text-slate-700">Short Description</label>
                          <input
                            type="text"
                            value={editingPricingCategory.description || ''}
                            onChange={e =>
                              setEditingPricingCategory({ ...editingPricingCategory, description: e.target.value })
                            }
                            placeholder="e.g., Dedicated 20-minute podium slot + Q&A and proceedings indexation"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-xs font-bold text-slate-700">
                            Included Privileges / Features (One feature per line)
                          </label>
                          <textarea
                            rows={4}
                            value={Array.isArray(editingPricingCategory.features) ? editingPricingCategory.features.join('\n') : (editingPricingCategory.features || '')}
                            onChange={e =>
                              setEditingPricingCategory({
                                ...editingPricingCategory,
                                features: e.target.value.split('\n').filter(f => f.trim())
                              })
                            }
                            placeholder="Full access to all scientific tracks&#10;Conference kit and abstracts&#10;Lunch and refreshments&#10;Certificate of presentation"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-500 leading-relaxed font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPricingFormOpen(false);
                            setEditingPricingCategory(null);
                          }}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePricingCategory}
                          className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Pricing Tier</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pricing Tiers List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-800">
                        Configured Pricing Tiers ({(editingConference.categories || []).length})
                      </h5>
                    </div>

                    {(!editingConference.categories || editingConference.categories.length === 0) ? (
                      <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No pricing tiers configured yet.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click "Add Pricing Tier" above to register registration packages for attendees.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {editingConference.categories.map(cat => (
                          <div
                            key={cat.id}
                            className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h6 className="text-xs font-bold text-slate-900 truncate">
                                  {cat.name}
                                </h6>
                                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg shrink-0">
                                  ${cat.academic_price}
                                </span>
                              </div>
                              {cat.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2">
                                  {cat.description}
                                </p>
                              )}
                              <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-center">
                                <div className="bg-slate-50 p-1 rounded border border-slate-100">
                                  <div className="text-slate-400 font-medium">Acad</div>
                                  <div className="font-bold text-slate-800 font-mono">${cat.academic_price}</div>
                                </div>
                                <div className="bg-slate-50 p-1 rounded border border-slate-100">
                                  <div className="text-slate-400 font-medium">Ind</div>
                                  <div className="font-bold text-slate-800 font-mono">${cat.industry_price}</div>
                                </div>
                                <div className="bg-slate-50 p-1 rounded border border-slate-100">
                                  <div className="text-slate-400 font-medium">Stud</div>
                                  <div className="font-bold text-slate-800 font-mono">${cat.student_price}</div>
                                </div>
                              </div>
                              {cat.features && cat.features.length > 0 && (
                                <ul className="text-[10px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                                  {cat.features.slice(0, 3).map((f, i) => (
                                    <li key={i} className="flex items-center space-x-1 truncate">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                                      <span className="truncate">{f}</span>
                                    </li>
                                  ))}
                                  {cat.features.length > 3 && (
                                    <li className="text-[9px] text-slate-400 italic">
                                      +{cat.features.length - 3} more privileges
                                    </li>
                                  )}
                                </ul>
                              )}
                            </div>

                            <div className="flex items-center justify-end space-x-1 pt-3 mt-3 border-t border-slate-100">
                              <button
                                type="button"
                                title="Edit Tier"
                                onClick={() => {
                                  setEditingPricingCategory({ ...cat });
                                  setIsPricingFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Remove Tier"
                                onClick={() => handleRemovePricingCategory(cat.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const tabs: EditorTab[] = ['basic', 'about', 'carousel', 'deadlines', 'publishing', 'committee', 'corporate_partners', 'media_partners', 'pricing'];
                      const currIdx = tabs.indexOf(activeEditorTab);
                      if (currIdx > 0) setActiveEditorTab(tabs[currIdx - 1]);
                    }}
                    disabled={activeEditorTab === 'basic'}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tabs: EditorTab[] = ['basic', 'about', 'carousel', 'deadlines', 'publishing', 'committee', 'corporate_partners', 'media_partners', 'pricing'];
                      const currIdx = tabs.indexOf(activeEditorTab);
                      if (currIdx < tabs.length - 1) setActiveEditorTab(tabs[currIdx + 1]);
                    }}
                    disabled={activeEditorTab === 'pricing'}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1"
                  >
                    <span>Next Section</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(undefined, 'draft')}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : editingConference.id ? 'Save Changes' : 'Create & Publish'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingConference)}
        title="Delete Conference"
        itemName={deletingConference?.title || ''}
        itemType="Conference"
        onCancel={() => setDeletingConference(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

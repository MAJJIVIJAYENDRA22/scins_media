import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  CheckCircle2,
  X,
  Save,
  Eye,
  EyeOff,
  Building,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Sponsor, Conference } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface SponsorManagerProps {
  sponsors: Sponsor[];
  conferences: Conference[];
  onSponsorsChange: (updated: Sponsor[]) => void;
}

export const SponsorManager: React.FC<SponsorManagerProps> = ({
  sponsors,
  conferences,
  onSponsorsChange
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [partnerTypeFilter, setPartnerTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'tier' | 'name' | 'order'>('tier');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Partial<Sponsor> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deletingSponsor, setDeletingSponsor] = useState<Sponsor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const availableTiers = ['All', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Supporting', 'Academic', 'Media'];
  const partnerTypes = ['All', 'Corporate Sponsor', 'Academic Partner', 'Media Partner', 'Research Consortia'];

  const tierPriority: Record<string, number> = {
    Platinum: 1,
    Gold: 2,
    Silver: 3,
    Bronze: 4,
    Supporting: 5,
    Academic: 6,
    Media: 7
  };

  const filteredSponsors = useMemo(() => {
    let list = sponsors.filter(s => {
      const q = search.toLowerCase();
      const name = s.company_name || s.name || '';
      const matchesSearch =
        search === '' ||
        name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.tier_name && s.tier_name.toLowerCase().includes(q)) ||
        (s.country && s.country.toLowerCase().includes(q));

      const matchesTier = tierFilter === 'All' || s.tier === tierFilter;
      const matchesPartnerType =
        partnerTypeFilter === 'All' || (s.partner_type || 'Corporate Sponsor') === partnerTypeFilter;
      const isActive = s.is_active ?? true;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'inactive' && !isActive);

      return matchesSearch && matchesTier && matchesPartnerType && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.company_name || a.name || '';
        const nameB = b.company_name || b.name || '';
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'order') {
        return (a.display_order || 0) - (b.display_order || 0);
      }
      // Tier priority
      const pA = tierPriority[a.tier || ''] || 99;
      const pB = tierPriority[b.tier || ''] || 99;
      return pA - pB;
    });

    return list;
  }, [sponsors, search, tierFilter, partnerTypeFilter, statusFilter, sortBy]);

  const handleToggleStatus = async (sponsor: Sponsor) => {
    const currentActive = sponsor.is_active ?? true;
    const newActive = !currentActive;
    try {
      await api.toggleSponsorStatus(sponsor.id, newActive);
      const updated = sponsors.map(s =>
        s.id === sponsor.id ? { ...s, is_active: newActive, status: newActive ? 'active' : 'inactive' } : s
      );
      onSponsorsChange(updated);
      showToast(`${sponsor.company_name || sponsor.name} status updated to ${newActive ? 'Active' : 'Inactive'}`);
    } catch {
      const updated = sponsors.map(s =>
        s.id === sponsor.id ? { ...s, is_active: newActive, status: newActive ? 'active' : 'inactive' } : s
      );
      onSponsorsChange(updated);
      showToast('Sponsor status updated');
    }
  };

  const handleOpenCreate = () => {
    setEditingSponsor({
      company_name: '',
      name: '',
      tier: 'Platinum',
      tier_name: 'Platinum Sponsor',
      partner_type: 'Corporate Sponsor',
      logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
      website: 'https://biocongress.org',
      country: 'France',
      contact_email: 'partners@biocongress.org',
      description: 'Leading innovations in biotechnology equipment, clinical reagents, and sequencing.',
      display_order: sponsors.length + 1,
      is_active: true,
      status: 'active',
      conference_id: conferences[0]?.id || 1
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sponsor: Sponsor) => {
    setEditingSponsor({
      ...sponsor,
      company_name: sponsor.company_name || sponsor.name
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSponsor) return;

    const errors: Record<string, string> = {};
    if (!editingSponsor.company_name?.trim()) errors.company_name = 'Organization/Company name is required';
    if (!editingSponsor.tier?.trim()) errors.tier = 'Partnership tier is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...editingSponsor,
        name: editingSponsor.company_name,
        tier_name: editingSponsor.tier_name || `${editingSponsor.tier} Partner`
      };

      if (editingSponsor.id) {
        await api.updateSponsor(editingSponsor.id, payload);
        const updated = sponsors.map(s =>
          s.id === editingSponsor.id ? ({ ...s, ...payload } as Sponsor) : s
        );
        onSponsorsChange(updated);
        showToast('Sponsor profile updated successfully');
      } else {
        const created = await api.addSponsor(payload);
        onSponsorsChange([...sponsors, created]);
        showToast('New sponsor partner added successfully');
      }
      setIsModalOpen(false);
    } catch {
      if (editingSponsor.id) {
        const updated = sponsors.map(s =>
          s.id === editingSponsor.id ? ({ ...s, ...editingSponsor } as Sponsor) : s
        );
        onSponsorsChange(updated);
        showToast('Sponsor saved locally');
      } else {
        const newId = Math.max(...sponsors.map(s => s.id), 0) + 1;
        const newSp = { ...editingSponsor, id: newId } as Sponsor;
        onSponsorsChange([...sponsors, newSp]);
        showToast('Sponsor added locally');
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSponsor) return;
    setIsDeleting(true);
    try {
      await api.deleteSponsor(deletingSponsor.id);
      const updated = sponsors.filter(s => s.id !== deletingSponsor.id);
      onSponsorsChange(updated);
      showToast(`Partner "${deletingSponsor.company_name || deletingSponsor.name}" removed`);
    } catch {
      const updated = sponsors.filter(s => s.id !== deletingSponsor.id);
      onSponsorsChange(updated);
      showToast(`Partner "${deletingSponsor.company_name || deletingSponsor.name}" removed`);
    } finally {
      setIsDeleting(false);
      setDeletingSponsor(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-800 text-xs font-semibold shadow-md flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2 bg-teal-50 text-teal-800 rounded-xl border border-teal-100">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Sponsors & Academic Partners</h2>
            <p className="text-xs text-slate-500">
              Manage corporate sponsors, university partners, media alliances, booth spaces, and tier rankings
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Sponsor / Partner</span>
        </button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Partners</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{sponsors.length}</div>
        </div>
        <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Platinum & Gold</div>
          <div className="text-xl font-bold text-amber-900 mt-0.5">
            {sponsors.filter(s => s.tier === 'Platinum' || s.tier === 'Gold').length}
          </div>
        </div>
        <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Academic Partners</div>
          <div className="text-xl font-bold text-teal-900 mt-0.5">
            {sponsors.filter(s => s.partner_type === 'Academic Partner' || s.tier === 'Academic').length}
          </div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Published</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">
            {sponsors.filter(s => s.is_active ?? true).length}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by company name, tier, country, or description..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              {availableTiers.map(t => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Tiers' : `${t} Tier`}
                </option>
              ))}
            </select>

            <select
              value={partnerTypeFilter}
              onChange={e => setPartnerTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              {partnerTypes.map(p => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Partner Types' : p}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active / Visible</option>
              <option value="inactive">Hidden / Inactive</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="tier">Sort: Tier Hierarchy</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="order">Sort: Display Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredSponsors.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No sponsors or partners found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching partner records found. Click "Add Sponsor / Partner" to create a new one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4">Organization / Sponsor</th>
                  <th className="p-4">Tier & Type</th>
                  <th className="p-4">Website & Country</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredSponsors.map(sponsor => {
                  const isActive = sponsor.is_active ?? true;
                  const name = sponsor.company_name || sponsor.name || 'Partner';
                  return (
                    <tr key={sponsor.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              sponsor.logo_url ||
                              'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={name}
                            className="w-12 h-9 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1 flex-shrink-0"
                            onError={(e: any) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-tight">{name}</div>
                            <div className="text-[11px] text-slate-500">{sponsor.contact_email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            sponsor.tier === 'Platinum'
                              ? 'bg-slate-900 text-white border-slate-800'
                              : sponsor.tier === 'Gold'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : sponsor.tier === 'Silver'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : sponsor.tier === 'Bronze'
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}
                        >
                          {sponsor.tier || 'Platinum'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {sponsor.partner_type || 'Corporate Sponsor'}
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        {sponsor.website ? (
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-teal-800 hover:underline flex items-center space-x-1"
                          >
                            <Globe className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {sponsor.website.replace(/^https?:\/\//, '')}
                            </span>
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        <div className="text-slate-500 text-[11px] mt-0.5 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{sponsor.country || 'Global'}</span>
                        </div>
                      </td>

                      <td className="p-4 align-top max-w-xs">
                        <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {sponsor.description || 'Scientific conference partnership and technology collaboration.'}
                        </div>
                      </td>

                      <td className="p-4 align-top font-mono font-bold text-slate-600">
                        #{sponsor.display_order || sponsor.id}
                      </td>

                      <td className="p-4 align-top">
                        <button
                          onClick={() => handleToggleStatus(sponsor)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            isActive
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{isActive ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td className="p-4 align-top text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            title="Edit Partner"
                            onClick={() => handleOpenEdit(sponsor)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Partner"
                            onClick={() => setDeletingSponsor(sponsor)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingSponsor.id ? 'Edit Sponsor Profile' : 'Add New Sponsor / Partner'}
                </h3>
                <p className="text-xs text-slate-500">Tier assignment, logo URL, partner category, and contact details</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Organization / Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingSponsor.company_name || ''}
                    onChange={e => setEditingSponsor({ ...editingSponsor, company_name: e.target.value })}
                    placeholder="e.g., Novozymes Synthetic Biology Solutions"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.company_name ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.company_name && <p className="text-[11px] text-red-500">{formErrors.company_name}</p>}
                </div>

                {/* Tier & Partner Type */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Partnership Tier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingSponsor.tier || 'Platinum'}
                    onChange={e => setEditingSponsor({ ...editingSponsor, tier: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Platinum">Platinum Sponsor</option>
                    <option value="Gold">Gold Sponsor</option>
                    <option value="Silver">Silver Sponsor</option>
                    <option value="Bronze">Bronze Sponsor</option>
                    <option value="Supporting">Supporting Sponsor</option>
                    <option value="Academic">Academic Partner</option>
                    <option value="Media">Media Partner</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Partner Classification</label>
                  <select
                    value={editingSponsor.partner_type || 'Corporate Sponsor'}
                    onChange={e => setEditingSponsor({ ...editingSponsor, partner_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Corporate Sponsor">Corporate Sponsor</option>
                    <option value="Academic Partner">Academic Institution / University</option>
                    <option value="Media Partner">Media & Press Partner</option>
                    <option value="Research Consortia">Research Consortia / Society</option>
                  </select>
                </div>

                {/* Website & Country */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Official Website URL</label>
                  <input
                    type="text"
                    value={editingSponsor.website || ''}
                    onChange={e => setEditingSponsor({ ...editingSponsor, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country / HQ</label>
                  <input
                    type="text"
                    value={editingSponsor.country || ''}
                    onChange={e => setEditingSponsor({ ...editingSponsor, country: e.target.value })}
                    placeholder="e.g., France"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Logo URL & Preview */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Company Logo Image URL</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editingSponsor.logo_url || ''}
                      onChange={e => setEditingSponsor({ ...editingSponsor, logo_url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                    />
                    <img
                      src={
                        editingSponsor.logo_url ||
                        'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80'
                      }
                      alt="Logo preview"
                      className="w-12 h-9 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1 flex-shrink-0"
                    />
                  </div>
                </div>

                {/* Contact Email & Display Order */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Contact / Partnership Email</label>
                  <input
                    type="email"
                    value={editingSponsor.contact_email || ''}
                    onChange={e => setEditingSponsor({ ...editingSponsor, contact_email: e.target.value })}
                    placeholder="partner@company.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Order Index</label>
                  <input
                    type="number"
                    value={editingSponsor.display_order || 1}
                    onChange={e => setEditingSponsor({ ...editingSponsor, display_order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Partnership Overview / Bio</label>
                  <textarea
                    rows={3}
                    value={editingSponsor.description || ''}
                    onChange={e => setEditingSponsor({ ...editingSponsor, description: e.target.value })}
                    placeholder="Brief description of partner's contributions and products..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : editingSponsor.id ? 'Save Changes' : 'Add Partner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingSponsor)}
        title="Delete Sponsor / Partner"
        itemName={deletingSponsor?.company_name || deletingSponsor?.name || ''}
        itemType="Sponsor"
        onCancel={() => setDeletingSponsor(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

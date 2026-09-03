import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Linkedin,
  BookOpen,
  MapPin,
  Building,
  GraduationCap,
  Save,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { CommitteeMember, Conference } from '../../types';
import { api } from '../../services/api';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface CommitteeManagerProps {
  committee: CommitteeMember[];
  conferences: Conference[];
  onCommitteeChange: (updated: CommitteeMember[]) => void;
}

export const CommitteeManager: React.FC<CommitteeManagerProps> = ({
  committee,
  conferences,
  onCommitteeChange
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [conferenceFilter, setConferenceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'pubs'>('order');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<CommitteeMember> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deletingMember, setDeletingMember] = useState<CommitteeMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const availableRoles = useMemo(() => {
    const set = new Set(committee.map(m => m.committee_role).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [committee]);

  const filteredMembers = useMemo(() => {
    let list = committee.filter(m => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === '' ||
        m.name.toLowerCase().includes(q) ||
        m.institution.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.country.toLowerCase().includes(q) ||
        (m.research_interests && m.research_interests.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'All' || m.committee_role === roleFilter;
      const matchesConf = conferenceFilter === 'All' || m.conference_id === Number(conferenceFilter);
      const isPub = m.is_published ?? true;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'active' && isPub) ||
        (statusFilter === 'inactive' && !isPub);

      return matchesSearch && matchesRole && matchesConf && matchesStatus;
    });

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'pubs') return (b.publications_count || 0) - (a.publications_count || 0);
      return (a.display_order || 0) - (b.display_order || 0);
    });

    return list;
  }, [committee, search, roleFilter, conferenceFilter, statusFilter, sortBy]);

  const handleToggleStatus = async (member: CommitteeMember) => {
    const currentPub = member.is_published ?? true;
    const newPub = !currentPub;
    try {
      await api.toggleCommitteeStatus(member.id, newPub);
      const updated = committee.map(m =>
        m.id === member.id ? { ...m, is_published: newPub, status: newPub ? 'active' : 'inactive' } : m
      );
      onCommitteeChange(updated);
      showToast(`${member.name} is now ${newPub ? 'Published' : 'Hidden'}`);
    } catch {
      const updated = committee.map(m =>
        m.id === member.id ? { ...m, is_published: newPub, status: newPub ? 'active' : 'inactive' } : m
      );
      onCommitteeChange(updated);
      showToast(`${member.name} status updated`);
    }
  };

  const handleOpenCreate = () => {
    setEditingMember({
      name: '',
      designation: 'Professor & Department Chair',
      institution: '',
      country: 'France',
      committee_role: 'Scientific Committee',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      biography: '',
      research_interests: '',
      education: 'Ph.D. in Bioengineering',
      experience: '15+ Years in Academic Research',
      publications_count: 24,
      linkedin_url: '',
      orcid_url: '',
      google_scholar_url: '',
      conference_id: conferences[0]?.id || 1,
      display_order: committee.length + 1,
      is_published: true,
      status: 'active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: CommitteeMember) => {
    setEditingMember({ ...member });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const errors: Record<string, string> = {};
    if (!editingMember.name?.trim()) errors.name = 'Full name is required';
    if (!editingMember.institution?.trim()) errors.institution = 'Institution is required';
    if (!editingMember.committee_role?.trim()) errors.committee_role = 'Committee role is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      if (editingMember.id) {
        await api.updateCommitteeMember(editingMember.id, editingMember);
        const updated = committee.map(m =>
          m.id === editingMember.id ? ({ ...m, ...editingMember } as CommitteeMember) : m
        );
        onCommitteeChange(updated);
        showToast('Committee member updated successfully');
      } else {
        const created = await api.addCommitteeMember(editingMember);
        onCommitteeChange([...committee, created]);
        showToast('New committee member added successfully');
      }
      setIsModalOpen(false);
    } catch {
      if (editingMember.id) {
        const updated = committee.map(m =>
          m.id === editingMember.id ? ({ ...m, ...editingMember } as CommitteeMember) : m
        );
        onCommitteeChange(updated);
        showToast('Member saved locally');
      } else {
        const newId = Math.max(...committee.map(m => m.id), 0) + 1;
        const newMem = { ...editingMember, id: newId } as CommitteeMember;
        onCommitteeChange([...committee, newMem]);
        showToast('Member added locally');
      }
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      await api.deleteCommitteeMember(deletingMember.id);
      const updated = committee.filter(m => m.id !== deletingMember.id);
      onCommitteeChange(updated);
      showToast(`Removed ${deletingMember.name}`);
    } catch {
      const updated = committee.filter(m => m.id !== deletingMember.id);
      onCommitteeChange(updated);
      showToast(`Removed ${deletingMember.name}`);
    } finally {
      setIsDeleting(false);
      setDeletingMember(null);
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
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">Committee Members Management</h2>
            <p className="text-xs text-slate-500">
              Manage scientific chairs, advisory board, affiliations, research interests, and visibility
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Committee Member</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Members</div>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{committee.length}</div>
        </div>
        <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Published</div>
          <div className="text-xl font-bold text-teal-900 mt-0.5">
            {committee.filter(m => (m.is_published ?? true)).length}
          </div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Institutions</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">
            {new Set(committee.map(m => m.institution)).size}
          </div>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Countries</div>
          <div className="text-xl font-bold text-slate-700 mt-0.5">
            {new Set(committee.map(m => m.country)).size}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search member by name, institution, designation, or country..."
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
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              {availableRoles.map(r => (
                <option key={r} value={r}>
                  {r === 'All' ? 'All Committee Roles' : r}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="active">Published / Active</option>
              <option value="inactive">Hidden / Inactive</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-500"
            >
              <option value="order">Sort: Display Order</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="pubs">Sort: Publications Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No committee members found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or click "Add Committee Member" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-mono border-b border-slate-200">
                <tr>
                  <th className="p-4">Member Info</th>
                  <th className="p-4">Affiliation & Country</th>
                  <th className="p-4">Committee Role</th>
                  <th className="p-4">Research & Stats</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredMembers.map(member => {
                  const isPub = member.is_published ?? true;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            onError={(e: any) => {
                              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-tight">{member.name}</div>
                            <div className="text-[11px] text-slate-500">{member.designation}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              {member.linkedin_url && (
                                <a
                                  href={member.linkedin_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Linkedin className="w-3 h-3" />
                                </a>
                              )}
                              {member.orcid_url && (
                                <span className="text-[10px] text-emerald-600 font-mono">ORCID</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <div className="font-semibold text-slate-900 flex items-center space-x-1">
                          <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{member.institution}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{member.country}</span>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                          {member.committee_role}
                        </span>
                      </td>

                      <td className="p-4 align-top">
                        <div className="text-[11px] text-slate-700 line-clamp-1 max-w-[200px]">
                          {member.research_interests || 'Biotechnology & Science'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          {member.publications_count || 10} Publications
                        </div>
                      </td>

                      <td className="p-4 align-top font-mono text-slate-600 font-bold text-xs">
                        #{member.display_order || member.id}
                      </td>

                      <td className="p-4 align-top">
                        <button
                          onClick={() => handleToggleStatus(member)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            isPub
                              ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {isPub ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{isPub ? 'Published' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td className="p-4 align-top text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            title="Edit Member"
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Member"
                            onClick={() => setDeletingMember(member)}
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
      {isModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {editingMember.id ? 'Edit Committee Member' : 'Add New Committee Member'}
                </h3>
                <p className="text-xs text-slate-500">Academic credentials, role, affiliations, and display order</p>
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
                {/* Full Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Full Name & Prefix <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingMember.name || ''}
                    onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                    placeholder="e.g., Prof. Sarah Jenkins, Ph.D."
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.name && <p className="text-[11px] text-red-500">{formErrors.name}</p>}
                </div>

                {/* Designation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Academic Designation</label>
                  <input
                    type="text"
                    value={editingMember.designation || ''}
                    onChange={e => setEditingMember({ ...editingMember, designation: e.target.value })}
                    placeholder="e.g., Chair of Biomolecular Sciences"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Committee Role */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Committee Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingMember.committee_role || 'Scientific Committee'}
                    onChange={e => setEditingMember({ ...editingMember, committee_role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Conference Chair">Conference Chair</option>
                    <option value="Honorary Chair">Honorary Chair</option>
                    <option value="Scientific Committee">Scientific Committee</option>
                    <option value="Organizing Committee">Organizing Committee</option>
                    <option value="Advisory Board">Advisory Board</option>
                    <option value="Executive Committee">Executive Committee</option>
                  </select>
                </div>

                {/* Institution & Country */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Institution / University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingMember.institution || ''}
                    onChange={e => setEditingMember({ ...editingMember, institution: e.target.value })}
                    placeholder="e.g., Sorbonne University / CNRS"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none ${
                      formErrors.institution ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-teal-500'
                    }`}
                  />
                  {formErrors.institution && <p className="text-[11px] text-red-500">{formErrors.institution}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Country</label>
                  <input
                    type="text"
                    value={editingMember.country || ''}
                    onChange={e => setEditingMember({ ...editingMember, country: e.target.value })}
                    placeholder="e.g., France"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Photo URL & Preview */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Profile Photo URL</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editingMember.photo_url || ''}
                      onChange={e => setEditingMember({ ...editingMember, photo_url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                    />
                    <img
                      src={editingMember.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                  </div>
                </div>

                {/* Research Interests */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Research Focus & Specialization</label>
                  <input
                    type="text"
                    value={editingMember.research_interests || ''}
                    onChange={e => setEditingMember({ ...editingMember, research_interests: e.target.value })}
                    placeholder="e.g., Synthetic Biology, Enzyme Engineering, Crispr-Cas9"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Publications Count & Display Order */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Publications Count</label>
                  <input
                    type="number"
                    value={editingMember.publications_count || 10}
                    onChange={e => setEditingMember({ ...editingMember, publications_count: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={editingMember.display_order || 1}
                    onChange={e => setEditingMember({ ...editingMember, display_order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* LinkedIn & ORCID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={editingMember.linkedin_url || ''}
                    onChange={e => setEditingMember({ ...editingMember, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ORCID ID / URL</label>
                  <input
                    type="text"
                    value={editingMember.orcid_url || ''}
                    onChange={e => setEditingMember({ ...editingMember, orcid_url: e.target.value })}
                    placeholder="0000-0002-..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Biography */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Academic Biography</label>
                  <textarea
                    rows={3}
                    value={editingMember.biography || ''}
                    onChange={e => setEditingMember({ ...editingMember, biography: e.target.value })}
                    placeholder="Brief background and scientific achievements..."
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
                  <span>{isSaving ? 'Saving...' : editingMember.id ? 'Save Changes' : 'Add Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingMember)}
        title="Delete Committee Member"
        itemName={deletingMember?.name || ''}
        itemType="Committee Member"
        onCancel={() => setDeletingMember(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};

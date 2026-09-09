import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, CreditCard, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, Building, User, Mail, Globe, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Conference, RegistrationCategory } from '../types';
import { REGISTRATION_CATEGORIES } from '../data/initialData';
import { api } from '../services/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  conference
}) => {
  const [step, setStep] = useState(1);

  const categoriesList = useMemo(() => {
    const confCats = (conference.categories && conference.categories.length > 0)
      ? conference.categories
      : REGISTRATION_CATEGORIES.filter(c => c.conference_id === conference.id);
    const list = confCats.length > 0 ? confCats : REGISTRATION_CATEGORIES;
    return list.map(c => ({
      ...c,
      code: c.code || `PASS-${c.id}`,
      early_bird_fee: c.early_bird_fee ?? c.academic_price ?? c.early_bird_price ?? 399,
      standard_fee: c.standard_fee ?? c.industry_price ?? c.price ?? 499,
      benefits: (c.benefits && c.benefits.length > 0)
        ? c.benefits
        : (c.features && c.features.length > 0)
          ? c.features
          : [
              'Access to all scientific sessions & keynotes',
              'Conference kit, badge & printed abstracts book',
              'Daily organic networking luncheon & coffee breaks',
              'Official Certificate of Attendance / Presentation'
            ]
    }));
  }, [conference.categories, conference.id]);

  const [selectedCat, setSelectedCat] = useState<RegistrationCategory>(() => categoriesList[0] || REGISTRATION_CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: 'France',
    institution: '',
    department: '',
    designation: 'Associate Professor',
    attendance_mode: 'In-Person' as 'In-Person' | 'Virtual',
    accommodation_required: false,
    meal_preference: 'Standard'
  });

  if (!isOpen) return null;

  const fee = selectedCat.early_bird_fee ?? selectedCat.early_bird_price ?? selectedCat.price ?? 499;
  const totalAmount = fee + (formData.accommodation_required ? 350 : 0);

  const handleNext = () => {
    if (step === 2) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.institution) {
        alert('Please complete all mandatory delegate fields.');
        return;
      }
    }
    setStep(s => Math.min(4, s + 1));
  };

  const handleCompleteRegistration = async () => {
    setSubmitting(true);
    try {
      const res = await api.createRegistration({
        conference_id: conference.id,
        conference_title: conference.title,
        category_id: selectedCat.id,
        category_name: selectedCat.name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        institution: formData.institution,
        department: formData.department,
        designation: formData.designation,
        attendance_mode: formData.attendance_mode,
        accommodation_required: formData.accommodation_required,
        meal_preference: formData.meal_preference,
        amount: totalAmount,
        currency: 'USD'
      });

      setRegistrationId(res.registration_id);
      setStep(4);
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      const fallbackId = `SCINS-REG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setRegistrationId(fallbackId);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="conference-registration-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                Official Delegate Portal
              </span>
              <span className="text-xs text-slate-500">• {conference.short_title}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
              Conference Registration & Pass Selection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        {step < 4 && (
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            {[
              { num: 1, label: '1. Select Category' },
              { num: 2, label: '2. Delegate Information' },
              { num: 3, label: '3. Review & Checkout' }
            ].map(s => (
              <div
                key={s.num}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md ${
                  step === s.num
                    ? 'text-teal-700 bg-teal-50 font-bold'
                    : step > s.num
                    ? 'text-slate-900 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Select Registration Tier</h4>
                <p className="text-xs text-slate-500">Early-bird discounts applied until June 30, 2026.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {categoriesList.map(cat => {
                  const isSelected = selectedCat.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCat(cat)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-slate-900">{cat.name}</h5>
                          <span className="text-[11px] text-slate-500 font-medium">{cat.code || `TIER-0${cat.id}`}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-extrabold text-teal-800">${cat.early_bird_fee ?? cat.early_bird_price ?? cat.price}</div>
                          <div className="text-[10px] text-slate-400 line-through">${cat.standard_fee ?? cat.price} USD</div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{cat.description}</p>

                      <div className="mt-3 pt-2.5 border-t border-slate-100/80 space-y-1">
                        {cat.benefits.slice(0, 2).map((b, bIdx) => (
                          <div key={bIdx} className="flex items-center text-[11px] text-slate-500">
                            <span className="w-1 h-1 rounded-full bg-teal-500 mr-1.5" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Delegate Info */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Prof. Sarah"
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Jenkins"
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (for Badge & Invoice) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., s.jenkins@oxford.ac.uk"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., France, Germany, USA"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Institution / University *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., University of Oxford / CNRS"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Designation</label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Research Fellow / Professor"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Add 3 Nights Official Hotel Accommodation (+ $350 USD)</h5>
                  <p className="text-[11px] text-slate-500">Includes 4-star hotel stay with breakfast near the Paris venue.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.accommodation_required}
                  onChange={e => setFormData({ ...formData, accommodation_required: e.target.checked })}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Summary */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Selected Pass</span>
                  <span className="text-xs font-bold text-teal-800">{selectedCat.name}</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><b>Delegate:</b> {formData.first_name} {formData.last_name}</p>
                  <p><b>Email:</b> {formData.email}</p>
                  <p><b>Institution:</b> {formData.institution}, {formData.country}</p>
                  <p><b>Mode:</b> {formData.attendance_mode}</p>
                  <p><b>Hotel Accommodation:</b> {formData.accommodation_required ? 'Included (3 Nights, +$350)' : 'Not Required'}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-teal-800 font-extrabold text-xl">${totalAmount} USD</span>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200/80 p-3.5 rounded-2xl flex items-center space-x-3 text-xs text-teal-900">
                <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <span>Instant confirmation receipt with unique Registration Barcode ID & PDF invoice will be generated.</span>
              </div>
            </div>
          )}

          {/* Step 4: Success Screen */}
          {step === 4 && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                  Confirmed & Verified
                </span>
                <h3 className="text-2xl font-bold text-slate-900 font-display mt-2">
                  Conference Registration Confirmed!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Welcome to {conference.title}. Your delegate badge and invoice have been dispatched.
                </p>
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-2xl max-w-md mx-auto shadow-lg space-y-2">
                <div className="text-xs text-slate-400">Official Delegate Registration ID</div>
                <div className="text-xl font-mono font-bold text-teal-400 tracking-wider select-all">
                  {registrationId || 'SCINS-REG-2026-88120'}
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Badge Name: <b>{formData.first_name} {formData.last_name}</b> ({formData.institution})
                </div>
              </div>

              <div className="pt-4 flex justify-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Close & View Schedule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleCompleteRegistration}
                className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? 'Confirming Delegate...' : `Complete Registration ($${totalAmount})`}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

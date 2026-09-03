import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2, Shield } from 'lucide-react';
import { api } from '../services/api';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Academic Inquiry',
    message: '',
    conference_code: 'BIO-2026'
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitContact(formData);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-xs inline-flex items-center">
                <img
                  src="/scins-media-logo.png"
                  alt="SCINS MEDIA"
                  className="h-12 sm:h-14 w-auto max-h-14 object-contain"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
                International Secretariats
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white">
              Contact the Conference Secretariat
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Get assistance with abstract submissions, registration invoices, official visa support invitation letters, or institutional sponsorship.
            </p>
          </div>
        </div>

        {/* Secretariats Grid & Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Secretariats & Visa Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                European Headquarters (Paris)
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>1 Rue du Fossé Blanc, Gennevilliers, 92230 Paris, France</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                  <span className="font-mono text-teal-800">paris.secretariat@scinsmedia.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                  <span>+33 1 48 30 20 00</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                London Liaison & Editorial Office
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                  <span className="font-mono text-teal-800">secretariat@scinsmedia.com</span>
                </div>
              </div>
            </div>

            <div className="bg-teal-50/70 border border-teal-200/80 p-5 rounded-3xl text-xs text-teal-900 space-y-2">
              <div className="font-bold flex items-center">
                <Shield className="w-4 h-4 text-teal-700 mr-1.5" />
                <span>Official Visa Assistance Support</span>
              </div>
              <p className="leading-relaxed">
                Registered delegates requiring formal consular visa invitation letters will receive an embassy-attested PDF with security barcode within 48 hours of registration confirmation.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-1">
              Send Official Communication to the Secretariat
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Our conference coordinators respond within 24 hours on academic business days.
            </p>

            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Message Dispatched to Secretariat</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  A ticket has been generated and routed to the corresponding conference coordinator.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'General Academic Inquiry', message: '', conference_code: 'BIO-2026' });
                  }}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold mt-2"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Prof. Dr. Julian Weintraub"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., j.weintraub@university.edu"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Category</label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="General Academic Inquiry">General Academic Inquiry</option>
                      <option value="Visa Support Letter">Visa Support Letter Request</option>
                      <option value="Abstract Status Query">Abstract Status Query</option>
                      <option value="Registration Invoice">Registration & Invoice Payment</option>
                      <option value="Sponsorship & Exhibit">Sponsorship & Industry Exhibit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Related Congress</label>
                    <select
                      value={formData.conference_code}
                      onChange={e => setFormData({ ...formData, conference_code: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="BIO-2026">Biopolymers 2026 (Paris, France)</option>
                      <option value="NANO-2026">NanoMed 2026 (Boston, USA)</option>
                      <option value="AI-2026">AI Health 2026 (Zurich, Switzerland)</option>
                      <option value="GREEN-2026">GreenChem 2026 (Tokyo, Japan)</option>
                      <option value="QUANT-2026">Quantum 2026 (Cambridge, UK)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Message / Question *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide details regarding your question or delegation requirements..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Transmitting to Secretariat...' : 'Submit Inquiry to Secretariat'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Eye,
  FileText,
  ListPlus,
  Sparkles,
  Info
} from 'lucide-react';
import { TermsContent, TermsSection } from '../../types';
import { INITIAL_TERMS_CONTENT } from '../../data/initialData';
import { api } from '../../services/api';

interface TermsManagerProps {
  onNavigate?: (path: string) => void;
}

export const TermsManager: React.FC<TermsManagerProps> = ({ onNavigate }) => {
  const [content, setContent] = useState<TermsContent>(INITIAL_TERMS_CONTENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMetadataSettings, setShowMetadataSettings] = useState<boolean>(false);

  // Load latest terms from database/API on mount
  useEffect(() => {
    let isMounted = true;
    api.getTerms()
      .then(res => {
        if (isMounted && res && res.data && Array.isArray(res.data.sections)) {
          setContent(res.data);
        }
      })
      .catch(err => {
        console.warn('Could not fetch terms from backend, using baseline:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Section Management Handlers
  const handleAddSection = () => {
    const newId = Date.now();
    const newSection: TermsSection = {
      id: newId,
      heading: `Section ${content.sections.length + 1}`,
      points: ['Enter policy point or explanatory clause here.']
    };
    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setSaveSuccess(false);
  };

  const handleDeleteSection = (index: number) => {
    if (content.sections.length <= 1) {
      setErrorMessage('At least one terms section must be maintained.');
      return;
    }
    setContent(prev => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== index)
    }));
    setSaveSuccess(false);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= content.sections.length) return;

    setContent(prev => {
      const nextSections = [...prev.sections];
      const temp = nextSections[index];
      nextSections[index] = nextSections[targetIndex];
      nextSections[targetIndex] = temp;
      return {
        ...prev,
        sections: nextSections
      };
    });
    setSaveSuccess(false);
  };

  const handleHeadingChange = (index: number, newHeading: string) => {
    setContent(prev => {
      const nextSections = [...prev.sections];
      nextSections[index] = { ...nextSections[index], heading: newHeading };
      return { ...prev, sections: nextSections };
    });
    setSaveSuccess(false);
  };

  // Points Management Handlers
  const handleAddPoint = (sectionIndex: number) => {
    setContent(prev => {
      const nextSections = [...prev.sections];
      const targetSec = nextSections[sectionIndex];
      nextSections[sectionIndex] = {
        ...targetSec,
        points: [...targetSec.points, '']
      };
      return { ...prev, sections: nextSections };
    });
    setSaveSuccess(false);
  };

  const handleDeletePoint = (sectionIndex: number, pointIndex: number) => {
    setContent(prev => {
      const nextSections = [...prev.sections];
      const targetSec = nextSections[sectionIndex];
      if (targetSec.points.length <= 1) {
        setErrorMessage('Each section must contain at least one point or paragraph.');
        return prev;
      }
      nextSections[sectionIndex] = {
        ...targetSec,
        points: targetSec.points.filter((_, idx) => idx !== pointIndex)
      };
      return { ...prev, sections: nextSections };
    });
    setSaveSuccess(false);
  };

  const handlePointChange = (sectionIndex: number, pointIndex: number, newText: string) => {
    setContent(prev => {
      const nextSections = [...prev.sections];
      const targetSec = nextSections[sectionIndex];
      const nextPoints = [...targetSec.points];
      nextPoints[pointIndex] = newText;
      nextSections[sectionIndex] = {
        ...targetSec,
        points: nextPoints
      };
      return { ...prev, sections: nextSections };
    });
    setSaveSuccess(false);
  };

  const handleMovePoint = (sectionIndex: number, pointIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? pointIndex - 1 : pointIndex + 1;
    setContent(prev => {
      const nextSections = [...prev.sections];
      const targetSec = nextSections[sectionIndex];
      if (targetIndex < 0 || targetIndex >= targetSec.points.length) return prev;
      const nextPoints = [...targetSec.points];
      const temp = nextPoints[pointIndex];
      nextPoints[pointIndex] = nextPoints[targetIndex];
      nextPoints[targetIndex] = temp;
      nextSections[sectionIndex] = {
        ...targetSec,
        points: nextPoints
      };
      return { ...prev, sections: nextSections };
    });
    setSaveSuccess(false);
  };

  // Reset to Baseline
  const handleResetToBaseline = () => {
    if (window.confirm('Reset all Terms & Conditions sections back to the official default baseline?')) {
      setContent(INITIAL_TERMS_CONTENT);
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  };

  // Save Validation & Submission
  const handleSave = async () => {
    setErrorMessage(null);
    setSaveSuccess(false);

    // Validation
    if (!content.sections || content.sections.length === 0) {
      setErrorMessage('Please add at least one terms section before saving.');
      return;
    }

    for (let i = 0; i < content.sections.length; i++) {
      const sec = content.sections[i];
      if (!sec.heading.trim()) {
        setErrorMessage(`Section #${i + 1} has an empty heading. Please enter a valid heading.`);
        return;
      }
      const validPoints = sec.points.filter(p => p && p.trim().length > 0);
      if (validPoints.length === 0) {
        setErrorMessage(`Section #${i + 1} ("${sec.heading}") must have at least one non-empty point or paragraph.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await api.updateTerms(content);
      if (res && res.success) {
        setSaveSuccess(true);
        if (res.data) {
          setContent(res.data);
        }
        setTimeout(() => {
          setSaveSuccess(false);
        }, 5000);
      } else {
        throw new Error(res?.message || 'Failed to save terms and conditions.');
      }
    } catch (err: any) {
      console.error('Error saving terms:', err);
      setErrorMessage(err.message || 'Error occurred while saving to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
        <div className="w-9 h-9 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading Terms & Conditions from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0 shadow-2xs">
            <Scale className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Terms & Conditions Management
              </h2>
              <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                {content.sections.length} Sections
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, edit, delete, and reorder legal clauses and bullet points displayed dynamically at <code className="font-mono text-teal-800 bg-teal-50 px-1 py-0.5 rounded">/terms-and-conditions</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleAddSection}
            id="terms-add-section-btn"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-teal-700" />
            <span>Add Section</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('/terms-and-conditions');
              } else {
                window.open('/terms-and-conditions', '_blank');
              }
            }}
            id="terms-view-public-btn"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Public Page</span>
          </button>

          <button
            type="button"
            onClick={handleResetToBaseline}
            title="Reset to default terms content"
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            id="terms-save-btn"
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3 text-emerald-900 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Terms & Conditions updated successfully!</span> Changes have been committed to the database and are now live on the public page.
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center space-x-3 text-rose-900 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Validation Error:</span> {errorMessage}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Banner / Header Metadata Collapsible Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Public Page Header & Version Information</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMetadataSettings(prev => !prev)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            {showMetadataSettings ? 'Hide Details' : 'Edit Header & Effective Date'}
          </button>
        </div>

        {showMetadataSettings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 animate-in fade-in">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Badge / Category Label
              </label>
              <input
                type="text"
                value={content.badge || ''}
                onChange={e => setContent(prev => ({ ...prev, badge: e.target.value }))}
                placeholder="Legal & Institutional Framework"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Effective Date & Version String
              </label>
              <input
                type="text"
                value={content.effective_date || ''}
                onChange={e => setContent(prev => ({ ...prev, effective_date: e.target.value }))}
                placeholder="Effective Date: January 1, 2026 • Version 2.4"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Banner Description
              </label>
              <textarea
                rows={2}
                value={content.description || ''}
                onChange={e => setContent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please review the terms and regulations governing conference participation..."
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Sections List */}
      <div className="space-y-4">
        {content.sections.map((section, sIdx) => (
          <div
            key={section.id || sIdx}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
          >
            {/* Top Toolbar of the Section Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs font-mono">
                  {sIdx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Section #{sIdx + 1}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Reorder Up */}
                <button
                  type="button"
                  disabled={sIdx === 0}
                  onClick={() => handleMoveSection(sIdx, 'up')}
                  title="Move section up"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Reorder Down */}
                <button
                  type="button"
                  disabled={sIdx === content.sections.length - 1}
                  onClick={() => handleMoveSection(sIdx, 'down')}
                  title="Move section down"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Delete Section */}
                <button
                  type="button"
                  onClick={() => handleDeleteSection(sIdx)}
                  title="Delete section"
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editable Heading */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Heading <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={section.heading}
                onChange={e => handleHeadingChange(sIdx, e.target.value)}
                placeholder="e.g. Acceptance of Terms"
                className="w-full text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs font-display"
              />
            </div>

            {/* Points / Content List */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Points / Content Paragraphs ({section.points.length}) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleAddPoint(sIdx)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Add Point / Paragraph</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {section.points.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-start space-x-2">
                    <span className="text-xs font-mono text-slate-400 mt-2.5 select-none w-4 text-right shrink-0">
                      •
                    </span>
                    <textarea
                      rows={2}
                      value={point}
                      onChange={e => handlePointChange(sIdx, pIdx, e.target.value)}
                      placeholder={`Enter clause or bullet point #${pIdx + 1}...`}
                      className="flex-1 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all shadow-2xs resize-y"
                    />
                    <div className="flex flex-col space-y-1 shrink-0 mt-0.5">
                      <button
                        type="button"
                        disabled={pIdx === 0}
                        onClick={() => handleMovePoint(sIdx, pIdx, 'up')}
                        title="Move point up"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={pIdx === section.points.length - 1}
                        onClick={() => handleMovePoint(sIdx, pIdx, 'down')}
                        title="Move point down"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 transition-colors cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePoint(sIdx, pIdx)}
                      title="Remove point"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Section Button Bottom */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleAddSection}
          className="px-6 py-3 bg-white hover:bg-slate-50 text-teal-800 border-2 border-dashed border-teal-300 hover:border-teal-400 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4 text-teal-700" />
          <span>Add Another Terms Section</span>
        </button>
      </div>

      {/* Live Preview Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Eye className="w-4 h-4 text-teal-600" />
            <span>Live Public Layout Preview</span>
          </div>
          <span className="text-[10px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-semibold">
            Dynamic Real-Time Sync
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-8 max-h-[360px] overflow-y-auto">
          {content.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center space-x-2.5 text-slate-900">
                <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs border border-teal-100 font-mono">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  {sec.heading || `Section ${idx + 1}`}
                </h3>
              </div>
              <div className="pl-8 text-xs text-slate-600 leading-relaxed space-y-1.5">
                {sec.points.map((p, pI) => (
                  <p key={pI}>{p || <span className="text-slate-400 italic">Empty point...</span>}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

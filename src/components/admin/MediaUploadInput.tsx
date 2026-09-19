// =============================================================================
// SCINSMEDIA — System Media & Image Upload Input Component
// Supports Drag & Drop, File Validation (Type & Size), Server CDN Storage,
// Automatic URL Generation, Replace/Remove Actions, Media Library Selector & Preview
// =============================================================================

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
  Link as LinkIcon,
  FolderOpen
} from 'lucide-react';
import { api } from '../../services/api';
import { MediaLibraryModal } from './MediaLibraryModal';

interface MediaUploadInputProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: 'image' | 'pdf' | 'all';
  maxSizeMB?: number;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  category?: string;
  showUrlToggle?: boolean;
  hideUrlInput?: boolean;
  showMediaLibrary?: boolean;
}

export const MediaUploadInput: React.FC<MediaUploadInputProps> = ({
  label,
  value = '',
  onChange,
  accept = 'image',
  maxSizeMB = 10,
  placeholder,
  helperText,
  required = false,
  category = 'conference',
  showUrlToggle = true,
  hideUrlInput = false,
  showMediaLibrary = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMimeTypes =
    accept === 'pdf'
      ? '.pdf,application/pdf'
      : accept === 'image'
      ? 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif,.jpg,.jpeg,.png,.webp,.svg,.gif'
      : 'image/*,.pdf,application/pdf';

  const processFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    // Format validation
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name);

    if (accept === 'image' && !isImage) {
      setUploadError('Invalid format. Please upload a valid image (JPG, PNG, WEBP, SVG, GIF).');
      return;
    }
    if (accept === 'pdf' && !isPdf) {
      setUploadError('Invalid format. Please upload a valid PDF document.');
      return;
    }
    if (!isImage && !isPdf) {
      setUploadError('Unsupported format. Please select an image or PDF file.');
      return;
    }

    // Size validation
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        try {
          const response = await api.uploadMedia({
            fileData,
            fileName: file.name,
            fileType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
            category
          });

          const generatedUrl = response?.url || fileData;
          onChange(generatedUrl);
          setUploadSuccess(`Uploaded "${file.name}" (${(file.size / 1024).toFixed(0)} KB)`);
          setIsUploading(false);
        } catch (err: any) {
          onChange(fileData);
          setUploadSuccess(`Uploaded "${file.name}"`);
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read file on client system.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const isPdfValue = value?.toLowerCase().includes('.pdf') || value?.startsWith('data:application/pdf');
  const allowUrlMode = !hideUrlInput && showUrlToggle;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center space-x-2">
            {showMediaLibrary && (
              <button
                type="button"
                onClick={() => setIsMediaLibraryOpen(true)}
                className="text-[11px] text-teal-800 hover:text-teal-900 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <FolderOpen className="w-3 h-3 text-teal-700" />
                <span>Media Library</span>
              </button>
            )}
            {allowUrlMode && (
              <button
                type="button"
                onClick={() => setShowDirectUrlInput(!showDirectUrlInput)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showDirectUrlInput ? 'Switch to Upload' : 'Direct URL'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Direct URL Input Mode (Only if not hidden) */}
      {!hideUrlInput && showDirectUrlInput ? (
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || (accept === 'pdf' ? 'https://.../brochure.pdf' : 'https://.../image.jpg')}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear URL"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
        </div>
      ) : (
        /* System Upload Zone, Media Library Button & Preview */
        <div className="space-y-2">
          {/* Active Upload Preview Card */}
          {value ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                {isPdfValue ? (
                  <div className="w-14 h-14 rounded-xl bg-red-100 border border-red-200 text-red-700 flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-7 h-7" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-300 overflow-hidden shrink-0 shadow-xs flex items-center justify-center p-0.5">
                    <img
                      src={value}
                      alt="Selected preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-mono">
                      {isPdfValue ? 'PDF Document' : 'Image Selected'}
                    </span>
                    <span className="text-slate-400 text-[10px]">Preview Ready</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-xs sm:max-w-sm mt-1">
                    {value.startsWith('data:') ? 'Local Upload Attached' : value}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0">
                {showMediaLibrary && (
                  <button
                    type="button"
                    onClick={() => setIsMediaLibraryOpen(true)}
                    className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Select another image from library"
                  >
                    <FolderOpen className="w-3 h-3 text-teal-700" />
                    <span className="hidden sm:inline">Choose Media</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Upload replacement from computer"
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span className="hidden sm:inline">Upload New</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setUploadSuccess(null);
                    setUploadError(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Upload Drop Area + Direct Media Library Button */
            <div className="space-y-2">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-teal-600 bg-teal-50/70'
                    : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center">
                    {isUploading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : accept === 'pdf' ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isUploading
                        ? 'Uploading to System CDN...'
                        : `Click to Browse or Drag & Drop ${accept === 'pdf' ? 'PDF File' : 'Image'}`}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {accept === 'pdf'
                        ? `Supports PDF document up to ${maxSizeMB}MB`
                        : `Supports JPG, PNG, WEBP, SVG up to ${maxSizeMB}MB`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Media Library Trigger Option */}
              {showMediaLibrary && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setIsMediaLibraryOpen(true)}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <FolderOpen className="w-4 h-4 text-teal-700" />
                    <span>Or Select Existing from Media Library</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedMimeTypes}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFile(e.target.files[0]);
              }
            }}
          />

          {/* Helper / Error / Success Messages */}
          {uploadError && (
            <div className="flex items-center space-x-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && !uploadError && (
            <div className="flex items-center space-x-1.5 text-[11px] text-teal-800 bg-teal-50 p-2 rounded-xl border border-teal-200">
              <Check className="w-3.5 h-3.5 shrink-0 text-teal-700" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {helperText && !uploadError && !uploadSuccess && (
            <p className="text-[11px] text-slate-400">{helperText}</p>
          )}
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibraryModal
          isOpen={isMediaLibraryOpen}
          onClose={() => setIsMediaLibraryOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setUploadSuccess('Asset selected from Media Library');
            setUploadError(null);
          }}
          title={`Select ${label || 'Media Asset'}`}
          category={category}
          currentValue={value}
        />
      )}
    </div>
  );
};

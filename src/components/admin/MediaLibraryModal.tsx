// =============================================================================
// SCINSMEDIA — Media Library Modal Component
// Supports browsing system & uploaded assets, category filtering, search,
// direct in-modal upload with auto-selection, and preview.
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Filter,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { MediaAsset } from '../../types';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, name?: string) => void;
  title?: string;
  category?: string;
  currentValue?: string;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
  category = 'all',
  currentValue = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(category || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedAssetUrl, setSelectedAssetUrl] = useState<string>(currentValue);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAssetUrl(currentValue);
      loadMedia();
    }
  }, [isOpen, currentValue]);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMediaLibrary();
      if (res && res.success && Array.isArray(res.data)) {
        setAssets(res.data);
      }
    } catch (err) {
      console.warn('Could not load media library:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files (JPG, PNG, WEBP, SVG) are supported.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds the 25MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        try {
          const resp = await api.uploadMedia({
            fileData,
            fileName: file.name,
            fileType: file.type,
            category: activeCategory !== 'all' ? activeCategory : 'general'
          });

          if (resp && resp.url) {
            const newAsset: MediaAsset = {
              id: Date.now(),
              url: resp.url,
              name: resp.fileName || file.name,
              category: (activeCategory !== 'all' ? activeCategory : 'general') as any,
              source: 'Upload'
            };
            setAssets(prev => [newAsset, ...prev]);
            setSelectedAssetUrl(resp.url);
            onSelect(resp.url, newAsset.name);
            onClose();
          } else {
            setUploadError('Upload failed. Please try again.');
          }
        } catch (uploadErr: any) {
          setUploadError(uploadErr.message || 'Error occurred while uploading.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to read file.');
      setIsUploading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Media' },
    { id: 'sponsors', label: 'Sponsors' },
    { id: 'partners', label: 'Media & Journals' },
    { id: 'speakers', label: 'Speakers' },
    { id: 'committee', label: 'Committee' },
    { id: 'conferences', label: 'Conferences' }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesCategory =
      activeCategory === 'all' ||
      asset.category === activeCategory ||
      (activeCategory === 'partners' && (asset.category === 'journals' || asset.category === 'partners'));

    const matchesSearch =
      !searchQuery.trim() ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.source && asset.source.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-2xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">{title}</h3>
              <p className="text-xs text-slate-500">Select an existing asset or upload a new image directly.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Category tabs, Search, Upload Button */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* In-Modal Direct Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search images by name or source..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {uploadError && (
            <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[280px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <p className="text-xs">Loading media assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">No media assets found</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {searchQuery ? 'Try a different search term or category' : 'Upload a new image using the button above'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredAssets.map(asset => {
                const isSelected = selectedAssetUrl === asset.url;
                return (
                  <div
                    key={`${asset.id}-${asset.url}`}
                    onClick={() => setSelectedAssetUrl(asset.url)}
                    className={`group relative rounded-xl border p-2 flex flex-col items-center justify-between cursor-pointer transition-all bg-white hover:shadow-md ${
                      isSelected
                        ? 'border-teal-600 ring-2 ring-teal-500/30 bg-teal-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-full h-24 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 relative mb-1.5 p-1">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="w-full text-left">
                      <p className="text-[11px] font-bold text-slate-800 truncate" title={asset.name}>
                        {asset.name}
                      </p>
                      <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-400">
                        <span className="capitalize">{asset.category}</span>
                        {asset.source && <span className="truncate max-w-[70px]">{asset.source}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            {selectedAssetUrl ? (
              <span className="text-teal-700 font-semibold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Asset selected</span>
              </span>
            ) : (
              <span>Select an asset from above to apply</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedAssetUrl}
              onClick={() => {
                if (selectedAssetUrl) {
                  const match = assets.find(a => a.url === selectedAssetUrl);
                  onSelect(selectedAssetUrl, match?.name);
                  onClose();
                }
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Use Selected Media
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

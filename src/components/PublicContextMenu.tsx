import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Maximize2, Copy, Check, Link as LinkIcon } from 'lucide-react';

interface PublicContextMenuProps {
  isAdmin: boolean;
}

interface MenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetUrl: string;
  linkText?: string;
  hasSelection?: boolean;
  selectedText?: string;
}

export const PublicContextMenu: React.FC<PublicContextMenuProps> = ({ isAdmin }) => {
  const [menu, setMenu] = useState<MenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetUrl: ''
  });
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdmin) {
      setMenu(prev => ({ ...prev, isOpen: false }));
      return;
    }

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Detect closest link or conference card or target URL
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      const conferenceCard = target.closest('[data-conference-slug]') as HTMLElement | null;
      const dataHrefEl = target.closest('[data-href]') as HTMLElement | null;

      let detectedUrl = '';
      let text = '';

      if (conferenceCard && conferenceCard.dataset.conferenceSlug) {
        detectedUrl = `/conferences/${conferenceCard.dataset.conferenceSlug}`;
        text = conferenceCard.dataset.conferenceTitle || 'Conference';
      } else if (dataHrefEl && dataHrefEl.dataset.href) {
        detectedUrl = dataHrefEl.dataset.href;
      } else if (anchor && anchor.href) {
        detectedUrl = anchor.getAttribute('href') || anchor.href;
        text = anchor.innerText.trim();
      } else {
        // Fallback to current page
        detectedUrl = window.location.pathname + window.location.search + window.location.hash;
      }

      // Check if user has selected text
      const selected = window.getSelection()?.toString().trim() || '';

      // Prevent native context menu on public pages so our options appear
      e.preventDefault();

      // Clamp position within window bounds
      const menuWidth = 230;
      const menuHeight = 160;
      const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
      const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

      setMenu({
        isOpen: true,
        x: Math.max(10, x),
        y: Math.max(10, y),
        targetUrl: detectedUrl,
        linkText: text,
        hasSelection: selected.length > 0,
        selectedText: selected
      });
      setCopied(false);
    };

    const handleClose = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        setMenu(prev => ({ ...prev, isOpen: false }));
      } else if (e instanceof MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setMenu(prev => ({ ...prev, isOpen: false }));
        }
      }
    };

    const handleScroll = () => {
      setMenu(prev => (prev.isOpen ? { ...prev, isOpen: false } : prev));
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleClose);
    window.addEventListener('keydown', handleClose);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleClose);
      window.removeEventListener('keydown', handleClose);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAdmin]);

  if (!menu.isOpen || isAdmin) return null;

  const fullUrl = menu.targetUrl.startsWith('http')
    ? menu.targetUrl
    : `${window.location.origin}${menu.targetUrl.startsWith('/') ? '' : '/'}${menu.targetUrl}`;

  const handleOpenNewTab = () => {
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
    setMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleOpenNewWindow = () => {
    window.open(
      fullUrl,
      '_blank',
      'width=1280,height=800,menubar=yes,toolbar=yes,location=yes,status=yes,scrollbars=yes,resizable=yes'
    );
    setMenu(prev => ({ ...prev, isOpen: false }));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => {
        setMenu(prev => ({ ...prev, isOpen: false }));
      }, 700);
    } catch {
      // Fallback
    }
  };

  const handleCopyText = async () => {
    if (menu.selectedText) {
      try {
        await navigator.clipboard.writeText(menu.selectedText);
      } catch {}
    }
    setMenu(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${menu.y}px`, left: `${menu.x}px` }}
      className="fixed z-[99999] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 w-56 text-xs text-slate-800 font-sans animate-in fade-in zoom-in-95 duration-150 select-none overflow-hidden"
    >
      <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold tracking-wide">
        <span className="truncate max-w-[170px]">{menu.linkText || 'Page Link'}</span>
        <LinkIcon className="w-3 h-3 text-teal-600 shrink-0 ml-1" />
      </div>

      <div className="py-1">
        <button
          type="button"
          onClick={handleOpenNewTab}
          className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-teal-50 hover:text-teal-900 font-medium transition-colors cursor-pointer group"
        >
          <ExternalLink className="w-3.5 h-3.5 text-teal-700 group-hover:translate-x-0.5 transition-transform" />
          <span className="font-semibold text-slate-800 group-hover:text-teal-900">Open in New Tab</span>
        </button>

        <button
          type="button"
          onClick={handleOpenNewWindow}
          className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-teal-50 hover:text-teal-900 font-medium transition-colors cursor-pointer group"
        >
          <Maximize2 className="w-3.5 h-3.5 text-teal-700 group-hover:scale-105 transition-transform" />
          <span className="font-semibold text-slate-800 group-hover:text-teal-900">Open in New Window</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-teal-50 hover:text-teal-900 font-medium transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-emerald-700">Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Link Address</span>
            </>
          )}
        </button>

        {menu.hasSelection && (
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-teal-50 hover:text-teal-900 font-medium transition-colors cursor-pointer border-t border-slate-100"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Selected Text</span>
          </button>
        )}
      </div>
    </div>
  );
};

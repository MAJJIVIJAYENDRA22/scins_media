import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { INITIAL_ORGANIZATION_INFO, OrganizationLocationInfo } from '../data/initialData';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber: propPhoneNumber,
  defaultMessage = 'Hello SCINS MEDIA, I would like to know more about your conferences and registration.'
}) => {
  const DEFAULT_NUMBER = '+1 307-357-9814';

  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => {
    if (propPhoneNumber && propPhoneNumber.trim()) return propPhoneNumber;
    if (typeof window !== 'undefined') {
      const direct = localStorage.getItem('scins_whatsapp_number');
      if (direct && direct.trim()) return direct;
      try {
        const orgSaved = localStorage.getItem('scins_organization_info');
        if (orgSaved) {
          const parsed: OrganizationLocationInfo = JSON.parse(orgSaved);
          if (parsed.whatsapp_number && parsed.whatsapp_number.trim()) return parsed.whatsapp_number;
        }
      } catch {}
    }
    const envNum = (import.meta as any).env?.VITE_WHATSAPP_NUMBER;
    if (envNum && envNum.trim()) return envNum;
    return INITIAL_ORGANIZATION_INFO.whatsapp_number || DEFAULT_NUMBER;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [showConfigNotice, setShowConfigNotice] = useState(false);

  useEffect(() => {
    // If not set in localStorage, save the official business number
    if (typeof window !== 'undefined') {
      try {
        const direct = localStorage.getItem('scins_whatsapp_number');
        if (!direct || !direct.trim()) {
          localStorage.setItem('scins_whatsapp_number', DEFAULT_NUMBER);
        }
      } catch {}
    }

    const handleUpdate = () => {
      try {
        const direct = localStorage.getItem('scins_whatsapp_number');
        if (direct && direct.trim()) {
          setWhatsappNumber(direct);
          return;
        }
        const saved = localStorage.getItem('scins_organization_info');
        if (saved) {
          const parsed: OrganizationLocationInfo = JSON.parse(saved);
          if (parsed.whatsapp_number && parsed.whatsapp_number.trim()) {
            setWhatsappNumber(parsed.whatsapp_number);
            return;
          }
        }
      } catch {}
      setWhatsappNumber(DEFAULT_NUMBER);
    };

    window.addEventListener('scins_organization_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('scins_organization_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const chatUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`
    : '#';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cleanNumber) {
      e.preventDefault();
      setShowConfigNotice(true);
      setTimeout(() => setShowConfigNotice(false), 5000);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-40 sm:bottom-7 sm:right-7 flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip & Notice Popup */}
      <div
        id="whatsapp-tooltip"
        role="tooltip"
        className={`absolute right-full mr-3.5 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none whitespace-nowrap ${
          isHovered || showConfigNotice
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-2'
        }`}
      >
        <div className="relative bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xl border border-slate-700/80 flex items-center space-x-2">
          {showConfigNotice ? (
            <span className="text-amber-300">
              WhatsApp number being linked. Please email{' '}
              <span className="underline font-mono">scinsmedia@gmail.com</span>
            </span>
          ) : (
            <>
              <span className="inline-block w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>Chat with us on WhatsApp</span>
            </>
          )}

          {/* Pointer Triangle pointing right to the button */}
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-slate-900/95" />
        </div>
      </div>

      {/* Floating Action Button */}
      <a
        href={chatUrl}
        target={cleanNumber ? '_blank' : undefined}
        rel={cleanNumber ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        aria-label="Chat with SCINS MEDIA on WhatsApp"
        aria-describedby="whatsapp-tooltip"
        className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-950/25 hover:shadow-2xl hover:shadow-[#25D366]/40 hover:bg-[#20bd5a] active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Subtle Ambient Pulse Wave */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping -z-10 pointer-events-none"
          style={{ animationDuration: '3s' }}
        />

        {/* Official WhatsApp Logo SVG */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.781-.879-2.057-.98-.276-.1-.477-.15-.678.15s-.779.98-.954 1.181c-.176.2-.351.226-.653.075s-1.272-.469-2.424-1.496c-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.135-.135.301-.351.452-.527.15-.176.2-.301.301-.502.101-.2.05-.376-.025-.527s-.678-1.633-.929-2.235c-.245-.587-.494-.507-.678-.517-.176-.01-.377-.01-.578-.01s-.527.075-.803.376c-.276.301-1.055 1.03-1.055 2.511 0 1.482 1.08 2.912 1.23 3.113.151.2 2.126 3.247 5.151 4.554.72.311 1.282.497 1.721.637.724.23 1.383.198 1.904.12.58-.087 1.781-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.351zM12.042 21.673h-.008c-1.734 0-3.433-.466-4.921-1.349l-.353-.21-3.659.96 1.002-3.568-.23-.367c-.968-1.542-1.479-3.328-1.479-5.161 0-5.32 4.329-9.649 9.654-9.649 2.579 0 5.003 1.005 6.824 2.829 1.822 1.823 2.825 4.248 2.824 6.828 0 5.321-4.33 9.647-9.654 9.647zm7.989-17.643C17.897 1.895 15.074.722 12.04 0 5.401 0 0 5.401 0 12.04c0 2.121.554 4.19 1.606 6.012L0 24l6.103-1.601c1.751.955 3.731 1.458 5.939 1.458 6.64 0 12.041-5.401 12.041-12.041.001-3.217-1.251-6.241-3.09-8.486z" />
        </svg>

        {/* Small Active Badge Dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </span>
      </a>
    </div>
  );
};

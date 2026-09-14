import React, { useState } from 'react';
import { MapPin, ExternalLink, Calendar, Users, ArrowRight } from 'lucide-react';
import { GLOBAL_HUBS } from '../data/initialData';

interface WorldMapInteractiveProps {
  onSelectCity?: (city: string) => void;
  onSelectConference?: (slug: string) => void;
}

export const WorldMapInteractive: React.FC<WorldMapInteractiveProps> = ({
  onSelectCity = (_city: string) => {},
  onSelectConference = (_slug: string) => {}
}) => {
  const [selectedHub, setSelectedHub] = useState<typeof GLOBAL_HUBS[0] | null>(GLOBAL_HUBS[0]);

  // Coordinates converted to percentage on SVG map
  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(10, Math.min(90, y)) };
  };

  return (
    <div id="interactive-world-map" className="relative w-full bg-slate-900 rounded-3xl p-6 sm:p-10 text-white overflow-hidden shadow-2xl border border-slate-800">
      {/* Background SVG Grid & World Silhouette */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Global Scientific Footprint</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Interactive Global Conference Network
          </h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Select an international research hub to explore upcoming symposiums, university partners, and scientific delegations.
          </p>
        </div>

        {/* Quick Hub Pills */}
        <div className="flex flex-wrap gap-2">
          {GLOBAL_HUBS.map(hub => (
            <button
              key={hub.city}
              onClick={() => setSelectedHub(hub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedHub?.city === hub.city
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-lg shadow-teal-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {hub.city}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative w-full aspect-[2/1] min-h-[340px] bg-slate-950/80 rounded-2xl border border-slate-800 p-4 flex items-center justify-center overflow-hidden">
        {/* Stylized Vector World Silhouette */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-contain opacity-35"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* North America */}
          <path
            d="M150,100 Q220,70 300,120 Q280,220 200,260 Q150,220 140,160 Z"
            fill="#334155"
          />
          {/* South America */}
          <path
            d="M260,280 Q320,300 310,400 Q260,460 240,380 Q230,320 260,280 Z"
            fill="#334155"
          />
          {/* Europe */}
          <path
            d="M480,90 Q560,80 580,140 Q530,190 470,160 Q460,120 480,90 Z"
            fill="#334155"
          />
          {/* Africa */}
          <path
            d="M480,200 Q580,210 590,320 Q540,420 490,380 Q450,280 480,200 Z"
            fill="#334155"
          />
          {/* Asia */}
          <path
            d="M600,80 Q780,70 850,160 Q820,280 670,240 Q620,180 600,80 Z"
            fill="#334155"
          />
          {/* Australia */}
          <path
            d="M780,340 Q860,330 870,410 Q810,440 760,400 Z"
            fill="#334155"
          />
        </svg>

        {/* Global Hub Nodes */}
        {GLOBAL_HUBS.map(hub => {
          const isSelected = selectedHub?.city === hub.city;
          // SVG relative position mapping
          const posMap: Record<string, { top: string; left: string }> = {
            Paris: { top: '30%', left: '49%' },
            Boston: { top: '33%', left: '26%' },
            Zurich: { top: '33%', left: '52%' },
            Tokyo: { top: '36%', left: '84%' },
            Cambridge: { top: '26%', left: '47%' },
            Singapore: { top: '62%', left: '76%' },
            Dubai: { top: '46%', left: '62%' }
          };
          const pos = posMap[hub.city] || { top: '50%', left: '50%' };

          return (
            <div
              key={hub.city}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              onClick={() => setSelectedHub(hub)}
            >
              {/* Pulse ripple */}
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-60 ${
                  isSelected ? 'bg-teal-400' : 'bg-teal-600/40'
                }`}
                style={{ width: '28px', height: '28px', margin: '-6px' }}
              />

              {/* Pin Icon */}
              <div
                className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-teal-400 text-slate-950 scale-125 shadow-lg shadow-teal-400/50'
                    : 'bg-slate-900 border-2 border-teal-500 text-teal-400 group-hover:scale-110'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>

              {/* City Label */}
              <span
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-[11px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-md transition-all ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800'
                }`}
              >
                {hub.city}
              </span>
            </div>
          );
        })}

        {/* Selected Hub Interactive Overlay Card */}
        {selectedHub && (
          <div className="absolute bottom-4 right-4 max-w-sm w-full bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-teal-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400">
                  {selectedHub.country} Hub
                </span>
                <h4 className="text-base font-bold text-white flex items-center mt-0.5">
                  <MapPin className="w-4 h-4 text-teal-400 mr-1 flex-shrink-0" />
                  {selectedHub.city}
                </h4>
              </div>
              <span className="text-xs font-semibold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full">
                {selectedHub.conferences} Conferences
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 line-clamp-2">
              Featured Flagship: <span className="text-white font-medium">{selectedHub.title}</span>
            </p>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  if (selectedHub.city === 'Paris') {
                    onSelectConference('biopolymers-bioplastics-2026');
                  } else if (selectedHub.city === 'Boston') {
                    onSelectConference('nanomedicine-targeted-drug-delivery-2026');
                  } else if (selectedHub.city === 'Zurich') {
                    onSelectConference('ai-healthcare-genomics-2026');
                  } else {
                    onSelectCity(selectedHub.city);
                  }
                }}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1 group"
              >
                <span>View Conferences</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <span className="text-[11px] text-slate-500">Live Registration Open</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Calendar, MapPin, Sparkles, ArrowRight, FileText, CheckCircle } from 'lucide-react';
import { Conference } from '../types';

interface ConferenceCardProps {
  conference: Conference;
  onSelect?: (slug: string) => void;
  onOpenAbstract?: (conf: Conference) => void;
  onOpenRegister?: (conf: Conference) => void;
}

export const ConferenceCard: React.FC<ConferenceCardProps> = ({
  conference,
  onSelect = (_slug: string) => {},
  onOpenAbstract,
  onOpenRegister
}) => {
  return (
    <div
      id={`conference-card-${conference.id}`}
      className="group bg-white rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
    >
      {/* Top Banner Image with Badges */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
        <img
          src={conference.hero_image}
          alt={conference.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-full">
            {conference.domain}
          </span>
          {conference.featured_badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-500 text-slate-950 px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>{conference.featured_badge}</span>
            </span>
          )}
        </div>

        {/* Bottom City Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center text-xs font-semibold text-white space-x-1.5 drop-shadow-md">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span>{conference.city}, {conference.country}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Date & Mode */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
              <Calendar className="w-3.5 h-3.5 mr-1 text-teal-600" />
              {conference.start_date} – {conference.end_date}
            </span>
            <span className="uppercase text-[10px] font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {conference.mode}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(conference.slug)}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-teal-900 transition-colors font-display line-clamp-2 cursor-pointer leading-snug"
          >
            {conference.title}
          </h3>

          {/* Theme & Tagline */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {conference.theme}
          </p>
        </div>

        {/* Deadlines Bar */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Abstract Due</span>
            <span className="font-semibold text-slate-800">{conference.abstract_deadline}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Early Bird</span>
            <span className="font-bold text-[#0E7490]">{conference.early_bird_deadline}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center space-x-2">
          <button
            onClick={() => onSelect(conference.slug)}
            className="flex-1 py-2.5 bg-[#0A2540] hover:bg-[#0E7490] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>Explore Congress</span>
            <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

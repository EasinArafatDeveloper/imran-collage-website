'use client';

import React, { useState } from 'react';
import { IEvent } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, Users, Bookmark, ArrowRight, Tag, CheckCircle2 } from 'lucide-react';

interface EventCardProps {
  event: IEvent;
  onSelect: (event: IEvent) => void;
  onRegister: (event: IEvent) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (eventId: string) => void;
  isRegistered?: boolean;
}

export default function EventCard({
  event,
  onSelect,
  onRegister,
  isBookmarked = false,
  onToggleBookmark,
  isRegistered = false,
}: EventCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const seatsLeft = Math.max(0, event.capacity - (event.registeredCount || 0));
  const isFull = seatsLeft <= 0;
  const progressPercent = Math.min(100, Math.round(((event.registeredCount || 0) / event.capacity) * 100));

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    if (onToggleBookmark) onToggleBookmark(event._id);
  };

  return (
    <div
      onClick={() => onSelect(event)}
      className="glass-card-hover group cursor-pointer overflow-hidden flex flex-col justify-between h-full"
    >
      <div>
        {/* Cover Image & Badges */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category Badge */}
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-pink-300 border border-pink-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {event.category}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition ${
              bookmarked
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40'
                : 'bg-black/50 text-white/80 hover:bg-black/80'
            }`}
            aria-label="Bookmark event"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
          </button>

          {/* Pricing tag */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                event.registrationFee > 0
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-emerald-500 text-white shadow-md'
              }`}
            >
              {event.registrationFee > 0 ? `৳ ${event.registrationFee}` : 'Free'}
            </span>
            {event.eventType && (
              <span className="text-[10px] bg-black/70 text-slate-300 px-2 py-0.5 rounded-full capitalize">
                {event.eventType}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(event.startAt)}</span>
          </div>

          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition line-clamp-2 leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {event.shortDescription || event.description}
          </p>

          {/* Venue & Organizer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2 truncate text-[11px]">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Organizer: {event.clubName || event.organizerName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Registration CTA */}
      <div className="px-5 pb-5 pt-0 space-y-3">
        {/* Capacity Bar */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            <span>Filled: {progressPercent}%</span>
            <span className={isFull ? 'text-amber-500 font-bold' : 'text-slate-400'}>
              {isFull ? 'House Full' : `${seatsLeft} seats left`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent > 85
                  ? 'bg-rose-500'
                  : progressPercent > 50
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        {isRegistered ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(event);
            }}
            className="w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Enrolled
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegister(event);
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md ${
              isFull && !event.isWaitlistEnabled
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : isFull
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-pink-500/20'
            }`}
          >
            <span>{isFull ? (event.isWaitlistEnabled ? 'Join Waitlist' : 'Registration Closed') : 'Enroll Now'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import { IEventRegistration } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '@/lib/utils';
import { 
  Download, 
  Printer, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Ticket
} from 'lucide-react';

interface QrTicketPassProps {
  registration: IEventRegistration;
  onClose?: () => void;
}

export default function QrTicketPass({ registration, onClose }: QrTicketPassProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Clean Isolated Print - only prints the ticket card on a single page
  const handlePrint = () => {
    const printContent = ticketRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=650,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Event Pass - ${registration.registrationCode}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: auto; margin: 10mm; }
            body { 
              background: #0b0617; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 380px; width: 100%;">
            ${printContent.outerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Direct PNG Image Download
  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;
    try {
      setDownloading(true);
      const htmlToImage = await import('html-to-image');
      const dataUrl = await htmlToImage.toPng(ticketRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `Ticket_${registration.registrationCode || 'Pass'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      // If html-to-image fails, fallback to clean print
      handlePrint();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = () => {
    if (registration.registrationCode) {
      navigator.clipboard.writeText(registration.registrationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extract date and time strings
  const eventDateObj = registration.eventStartAt ? new Date(registration.eventStartAt) : new Date();
  const dateFormatted = eventDateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = eventDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dayName = eventDateObj.toLocaleDateString('en-US', { weekday: 'short' });

  const coverImg = registration.eventCoverImage || 
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-5 animate-fade-in max-w-sm sm:max-w-md mx-auto">
      {/* ================= RICH GRADIENT SURROUNDING WRAPPER ================= */}
      <div className="relative p-5 sm:p-7 rounded-[32px] bg-gradient-to-br from-slate-950 via-[#150a2a] to-slate-950 shadow-2xl shadow-purple-950/80 border border-purple-500/30 overflow-hidden">
        
        {/* Glowing Background Radial Orbs */}
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-pink-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* ================= 🎟️ REALISTIC CINEMA/CONCERT TICKET CARD ================= */}
        <div 
          ref={ticketRef}
          id="ticket-card-printable"
          className="printable-area relative bg-white text-slate-900 rounded-[26px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-200/90 select-none"
        >
          
          {/* Top Half (Event & Member Info) */}
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Header: Square Image + Title & Member */}
            <div className="flex items-start gap-3.5">
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-200 bg-slate-100">
                <img
                  src={coverImg}
                  alt={registration.eventTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 overflow-hidden">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight line-clamp-2">
                  {registration.eventTitle}
                </h3>

                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Member Name
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    {registration.userName}
                  </h4>
                </div>
              </div>
            </div>

            {/* 2x2 Details Grid (Date, Time, Admit, Venue) */}
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 pt-1 text-left">
              {/* Date */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Date
                </span>
                <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 leading-snug">
                  {dateFormatted}
                </p>
              </div>

              {/* Time */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Time
                </span>
                <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 leading-snug">
                  {dayName}, {timeFormatted}
                </p>
              </div>

              {/* Admit / Student ID */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Admit
                </span>
                <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 leading-snug">
                  01 only <span className="text-[10px] text-purple-700 font-bold block font-mono">ID: {registration.studentId}</span>
                </p>
              </div>

              {/* Venue */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Venue
                </span>
                <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug line-clamp-2" title={registration.eventVenue}>
                  {registration.eventVenue}
                </p>
              </div>
            </div>
          </div>

          {/* ================= MIDDLE PERFORATED CUTOUT (TEAR LINE) ================= */}
          <div className="relative flex items-center justify-center my-0 py-1">
            {/* Left Circular Notch */}
            <div className="absolute -left-3.5 w-7 h-7 bg-[#150a2a] rounded-full border border-purple-500/20 z-20" />
            
            {/* Dashed Tear Line */}
            <div className="w-full border-t-2 border-dashed border-slate-300 mx-5" />

            {/* Right Circular Notch */}
            <div className="absolute -right-3.5 w-7 h-7 bg-[#150a2a] rounded-full border border-purple-500/20 z-20" />
          </div>

          {/* ================= BOTTOM HALF (QR CODE & BOOKING ID) ================= */}
          <div className="p-5 sm:p-6 pt-3 flex flex-col items-center justify-center text-center space-y-3.5">
            
            {/* QR Code Container */}
            <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
              <QRCodeSVG
                value={registration.qrPayloadToken || registration.registrationCode}
                size={180}
                level="H"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#0f172a"
              />
            </div>

            {/* Booking ID & Copy Button */}
            <div className="space-y-1">
              <div 
                onClick={handleCopyCode}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer border border-slate-200"
                title="Click to copy"
              >
                <span className="font-mono text-xs sm:text-sm font-black text-slate-900 tracking-wider">
                  BOOKING ID - {registration.registrationCode}
                </span>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              
              <p className="text-[10px] text-slate-400 font-medium">
                Scan the QR code at the entrance
              </p>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM OUTSIDE ACTIONS ================= */}
        <div className="no-print pt-5 flex flex-col items-center justify-center gap-3">
          {/* Direct Download Image Link (Golden Accent like reference) */}
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="text-amber-400 hover:text-amber-300 font-bold text-xs underline underline-offset-4 flex items-center gap-1.5 transition hover:scale-105 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Downloading...' : 'Download my ticket (HD Image)'}</span>
          </button>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-pink-400" />
              <span>Print / PDF</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-lg shadow-pink-500/25 transition"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

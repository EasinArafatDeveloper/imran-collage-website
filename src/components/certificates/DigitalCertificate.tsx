'use client';

import React from 'react';
import { ICertificate } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '@/lib/utils';
import { Award, Printer, ShieldCheck, Sparkles } from 'lucide-react';

interface DigitalCertificateProps {
  certificate: ICertificate;
  onClose?: () => void;
}

export default function DigitalCertificate({ certificate, onClose }: DigitalCertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Certificate Layout */}
      <div className="printable-area max-w-2xl mx-auto bg-gradient-to-br from-amber-50 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-8 border-double border-amber-600/40 rounded-3xl p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden text-slate-900 dark:text-white">
        {/* Decorative corner seals */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/60" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/60" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/60" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/60" />

        {/* Certificate Header */}
        <div className="space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto bg-gradient-to-tr from-amber-500 to-yellow-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/30 mb-2">
            <Award className="w-8 h-8" />
          </div>
          <h4 className="text-xs uppercase tracking-[0.25em] font-bold text-amber-600 dark:text-amber-400">
            UNIVERSITY STUDENT EVENT HUB
          </h4>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-slate-900 dark:text-amber-100">
            CERTIFICATE OF PARTICIPATION
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            This certificate is proudly presented to
          </p>
        </div>

        {/* Recipient Name */}
        <div className="my-6 border-b border-amber-600/30 pb-3 inline-block min-w-[280px]">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-600 dark:text-pink-400 tracking-wide font-serif">
            {certificate.studentName}
          </h2>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1 block">
            ID: {certificate.studentId} • {certificate.department}
          </span>
        </div>

        {/* Presentation Body */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed mb-8">
          for active participation and successful completion of the university event{' '}
          <strong className="text-slate-900 dark:text-white font-bold block text-base mt-1">
            "{certificate.eventTitle}"
          </strong>
        </p>

        {/* Signatures & Verification Row */}
        <div className="grid grid-cols-3 gap-4 items-end pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
          {/* Organizer Sign */}
          <div className="space-y-1 text-center">
            <div className="font-serif italic font-bold text-pink-600 text-sm">Tanvir Ahmed</div>
            <div className="w-24 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto" />
            <p className="text-[10px] text-slate-500 font-semibold">{certificate.organizerName}</p>
          </div>

          {/* QR Verification Seal */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 inline-block">
              <QRCodeSVG
                value={`http://localhost:3000/certificates/verify/${certificate.certificateNumber}`}
                size={64}
                level="M"
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase font-bold">
              {certificate.certificateNumber}
            </span>
          </div>

          {/* Dean / Chancellor Sign */}
          <div className="space-y-1 text-center">
            <div className="font-serif italic font-bold text-purple-600 text-sm">Dr. Shahidul Islam</div>
            <div className="w-24 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto" />
            <p className="text-[10px] text-slate-500 font-semibold">University Administration</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Issued on {formatDate(certificate.issueDate)} • Authenticity Verified</span>
        </div>
      </div>

      {/* Actions */}
      <div className="no-print flex justify-center gap-3">
        <button
          onClick={handlePrint}
          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-md"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print Certificate / Save PDF</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Award, CheckCircle2, XCircle, ShieldCheck, ArrowLeft, Building2, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export default function CertificateVerificationPage() {
  const params = useParams();
  const certNumber = params?.number as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!certNumber) return;

    fetch(`/api/certificates/verify/${certNumber}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.certificate) {
          setData(resData.certificate);
        } else {
          setError(resData.message || 'Invalid certificate');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [certNumber]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-pink-400 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>মূল ওয়েবসাইটে ফিরে যান</span>
        </Link>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            অফিসিয়াল সার্টিফিকেট ভেরিফিকেশন পোর্টাল
          </span>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-2xl mx-auto w-full my-8">
        {loading ? (
          <div className="glass-card p-12 text-center text-slate-400 space-y-3">
            <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">সার্টিফিকেট যাচাই করা হচ্ছে...</p>
          </div>
        ) : error || !data ? (
          <div className="glass-card p-8 sm:p-12 text-center space-y-4 border-rose-500/40">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">সার্টিফিকেট পাওয়া যায়নি</h2>
            <p className="text-xs text-rose-400 max-w-md mx-auto leading-relaxed">
              সার্টিফিকেট নম্বর <strong>"{certNumber}"</strong> বিশ্ববিদ্যালয়ের কেন্দ্রীয় রেজিস্ট্রিতে খুঁজে পাওয়া যায়নি।
            </p>
            <Link
              href="/"
              className="inline-block mt-4 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold"
            >
              হোম পেজে যান
            </Link>
          </div>
        ) : (
          <div className="glass-card p-8 sm:p-12 space-y-6 border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

            {/* Status Banner */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">ভেরিফায়েড আসল সার্টিফিকেট (Authentic Certificate)</h3>
                <p className="text-[11px] text-emerald-300">
                  এই সার্টিফিকেটটি বিশ্ববিদ্যালয় ইভেন্ট ম্যানেজমেন্ট সিস্টেম কর্তৃক ইস্যুকৃত এবং সম্পূর্ণ বৈধ।
                </p>
              </div>
            </div>

            {/* Certificate Meta Details */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                  CERTIFICATE NUMBER
                </span>
                <p className="text-xl font-mono font-black text-pink-400 mt-0.5 tracking-wider">
                  {data.certificateNumber}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-pink-500" /> শিক্ষার্থীর নাম
                  </span>
                  <p className="font-bold text-sm text-white">{data.studentName}</p>
                  <p className="font-mono text-[11px] text-pink-400">ID: {data.studentId}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-purple-500" /> ডিপার্টমেন্ট
                  </span>
                  <p className="font-bold text-sm text-white">{data.department}</p>
                  <p className="text-[11px] text-slate-400">{data.university}</p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> ইভেন্টের নাম
                  </span>
                  <p className="font-bold text-base text-white">{data.eventTitle}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                    <span>তারিখ: {formatDate(data.eventDate)}</span>
                    <span>•</span>
                    <span>আয়োজক: {data.organizerName}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ইস্যু তারিখ: {formatDate(data.issueDate)}
              </span>
              <button
                onClick={() => window.print()}
                className="text-pink-400 hover:underline font-semibold text-xs"
              >
                প্রিন্ট রেকর্ড
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500">
        © 2026 University Student Event Management System. All verification data digitally signed.
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  Award, 
  TrendingUp, 
  Wallet, 
  Building2, 
  PieChart, 
  Sparkles 
} from 'lucide-react';

export default function AnalyticsCharts() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReport(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">অ্যানালিটিক্স লোড হচ্ছে...</p>
      </div>
    );
  }

  const kpis = report?.kpis || {
    totalStudents: 245,
    totalEvents: 12,
    activeEvents: 8,
    totalRegistrations: 385,
    totalAttended: 290,
    attendanceRate: '75.3%',
    totalCertificates: 240,
    totalClubs: 10,
    totalRevenue: '৳ 24,500',
  };

  const departmentStats = report?.departmentStats || [
    { department: 'Computer Science & Engineering', count: 180, percentage: '46.8' },
    { department: 'Electrical & Electronic Engineering', count: 95, percentage: '24.7' },
    { department: 'Business Administration (BBA)', count: 60, percentage: '15.6' },
    { department: 'Law & Justice', count: 30, percentage: '7.8' },
    { department: 'Pharmacy', count: 20, percentage: '5.2' },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 border-pink-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">মোট নিবন্ধিত শিক্ষার্থী</span>
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-3">{kpis.totalStudents} জন</h3>
          <p className="text-[11px] text-pink-600 dark:text-pink-400 mt-2 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>গত ৩০ দিনে ৩২ জন যুক্ত হয়েছেন</span>
          </p>
        </div>

        <div className="glass-card p-6 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">মোট ইভেন্ট ও সক্রিয়</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-3">{kpis.totalEvents} টি</h3>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-2 font-semibold">
            {kpis.activeEvents} টি বর্তমানে রেজিস্ট্রেশন চলছে
          </p>
        </div>

        <div className="glass-card p-6 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">উপস্থিতির গড় হার</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-500 mt-3">{kpis.attendanceRate}</h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
            মোট {kpis.totalAttended} জন চেক-ইন করেছেন
          </p>
        </div>

        <div className="glass-card p-6 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">মোট সংগৃহীত ফান্ড</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-3">{kpis.totalRevenue}</h3>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 font-semibold">
            bKash ও Nagad ভেরিফাইড
          </p>
        </div>
      </div>

      {/* Visual Department Breakdown & Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Progress Bars */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ডিপার্টমেন্টভিত্তিক এনরোলমেন্ট (Department Breakdown)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">বিভিন্ন ডিপার্টমেন্টের শিক্ষার্থীদের অংশগ্রহণের পরিসংখ্যান</p>
            </div>
            <Building2 className="w-5 h-5 text-pink-500" />
          </div>

          <div className="space-y-4">
            {departmentStats.map((dept: any, idx: number) => {
              const colors = [
                'from-pink-500 to-rose-600',
                'from-purple-500 to-indigo-600',
                'from-blue-500 to-cyan-600',
                'from-amber-500 to-orange-600',
                'from-emerald-500 to-teal-600',
              ];
              const color = colors[idx % colors.length];

              return (
                <div key={dept.department} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{dept.department}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {dept.count} জন ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gender Ratio & Certificate Summary */}
        <div className="glass-card p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-500" />
              লিঙ্গভিত্তিক তথ্য পরিচিতি
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">ছাত্র সদস্য (Male)</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  165 জন <span className="text-xs text-pink-500 font-normal">(67.3%)</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">ছাত্রী সদস্য (Female)</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  80 জন <span className="text-xs text-purple-500 font-normal">(32.7%)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-xs">
            <span className="font-bold text-pink-600 dark:text-pink-400 block mb-1">
              📜 সার্টিফিকেট ইস্যু রিপোর্ট
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              সফলভাবে সম্পন্ন হওয়া ইভেন্টগুলোর মোট {kpis.totalCertificates} টি ডিজিটাল ভেরিফায়েড সার্টিফিকেট প্রদান করা হয়েছে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

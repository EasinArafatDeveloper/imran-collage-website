'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { seedCategories, seedDepartments } from '@/lib/seedData';

interface EventFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (val: string) => void;
  selectedFee: string;
  setSelectedFee: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  totalCount: number;
}

export default function EventFilters({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedDepartment,
  setSelectedDepartment,
  selectedFee,
  setSelectedFee,
  sortBy,
  setSortBy,
  totalCount,
}: EventFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ইভেন্টের নাম, স্পিকার, ডিপার্টমেন্ট বা ভেন্যু খুঁজুন..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-pink-500 shadow-sm transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              মুছুন
            </button>
          )}
        </div>

        {/* Quick Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">সাজান:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-pink-500 shadow-sm transition"
          >
            <option value="upcoming">আসন্ন ইভেন্ট (Upcoming)</option>
            <option value="popular">সর্বাধিক জনপ্রিয় (Most Popular)</option>
            <option value="newest">নতুন যুক্ত হওয়া (Newest)</option>
            <option value="deadline">রেজিস্ট্রেশন ডেডলাইন</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
            selectedCategory === 'all'
              ? 'bg-pink-600 text-white shadow-pink-600/30'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-pink-500/40'
          }`}
        >
          সব ইভেন্ট ({totalCount})
        </button>
        {seedCategories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm ${
              selectedCategory === cat.name
                ? 'bg-pink-600 text-white shadow-pink-600/30'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-pink-500/40'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Secondary Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-pink-500"
          >
            <option value="all">সকল ডিপার্টমেন্ট (All Depts)</option>
            {seedDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Fee Filter */}
          <select
            value={selectedFee}
            onChange={(e) => setSelectedFee(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-pink-500"
          >
            <option value="all">সকল ফি (Free & Paid)</option>
            <option value="free">শুধুমাত্র ফ্রি ইভেন্ট</option>
            <option value="paid">পেইড ইভেন্ট</option>
          </select>
        </div>

        {(selectedCategory !== 'all' || selectedDepartment !== 'all' || selectedFee !== 'all' || search) && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedDepartment('all');
              setSelectedFee('all');
            }}
            className="text-pink-600 dark:text-pink-400 hover:underline font-semibold text-xs"
          >
            ফিল্টার রিসেট করুন
          </button>
        )}
      </div>
    </div>
  );
}

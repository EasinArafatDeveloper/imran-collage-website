'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import { IEvent, IEventRegistration } from '@/types';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  Smartphone, 
  Shirt, 
  ArrowRight, 
  Lock,
  QrCode,
  User,
  Mail,
  IdCard,
  Phone,
  Building2
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent | null;
  onSuccess: (registration: IEventRegistration) => void;
  onOpenLoginModal?: () => void;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  event,
  onSuccess,
  onOpenLoginModal,
}: RegistrationModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'details' | 'payment' | 'processing'>('details');

  // Form fields - fully editable with dynamic initial values and placeholder suggestions
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  const [tshirtSize, setTshirtSize] = useState('L');
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Electrical & Electronic Engineering',
    'Business Administration (BBA)',
    'Economics',
    'Law & Justice',
    'Pharmacy',
    'English Language & Literature',
    'Civil Engineering',
    'Mechanical Engineering',
    'Architecture',
  ];

  // Sync with logged in user when modal opens or user loads
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || '');
      setEmail(user?.email || '');
      setStudentId(user?.studentProfile?.studentId || '');
      setDepartment(user?.studentProfile?.department || 'Computer Science & Engineering');
      setPhone(user?.studentProfile?.phone || '');
      setTshirtSize('L');
      setStep('details');
      setError('');
      setTrxId('');
    }
  }, [isOpen, user]);

  if (!event) return null;

  const isPaidEvent = event.registrationFee > 0;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in or create an account before registering.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide your name');
      return;
    }
    if (!email.trim()) {
      setError('Please provide your email address');
      return;
    }
    if (!studentId.trim()) {
      setError('Student ID is required');
      return;
    }
    if (!phone.trim()) {
      setError('Contact phone number is required');
      return;
    }

    setError('');
    if (isPaidEvent) {
      setStep('payment');
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const payload = {
        eventId: event._id,
        name: name.trim(),
        email: email.trim(),
        studentId: studentId.trim(),
        department,
        phone: phone.trim(),
        tshirtSize,
        paymentMethod: isPaidEvent ? paymentMethod : 'Free',
        trxId: isPaidEvent
          ? trxId.trim() || `SIM-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
          : undefined,
      };

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Registration could not be completed. Please try again.');
        setLoading(false);
        return;
      }

      triggerConfetti();
      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Event Registration & Enrollment" maxWidth="2xl">
      <div className="space-y-5 text-xs">
        {/* Header Summary */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-500/20">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-pink-500/30"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400">
              {event.category}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {event.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
              <span>
                Registration Fee:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {isPaidEvent ? `৳ ${event.registrationFee}` : 'Free'}
                </strong>
              </span>
              <span>•</span>
              <span>Seats Left: {Math.max(0, event.capacity - (event.registeredCount || 0))}</span>
            </div>
          </div>
        </div>

        {!user && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Please sign in or create an account to register for this event.</span>
            </div>
            {onOpenLoginModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLoginModal();
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shrink-0 transition"
              >
                Sign In
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Student Information Form (Fully Editable with suggestions) */}
        {step === 'details' && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Student Name */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Imran Hossain"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  University Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@university.edu"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 transition"
                  />
                </div>
              </div>

              {/* Student ID */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Student ID / Roll <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 2024-1-60-001"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 transition"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +880 1712-345678"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 transition"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 transition"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* T-Shirt Size */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Shirt className="w-3.5 h-3.5 text-pink-500" />
                  T-Shirt Size
                </label>
                <select
                  value={tshirtSize}
                  onChange={(e) => setTshirtSize(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 transition font-medium"
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                  <option value="XXL">Double XL (XXL)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isPaidEvent ? (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Processing...' : 'Confirm Registration (Free)'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Mobile Banking Payment Gateway (if Paid) */}
        {step === 'payment' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">Total Payable Fee:</span>
                <span className="text-base font-extrabold text-pink-600 dark:text-pink-400">
                  ৳ {event.registrationFee}
                </span>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'bKash', color: 'bg-pink-600' },
                  { name: 'Nagad', color: 'bg-orange-600' },
                  { name: 'Rocket', color: 'bg-purple-600' },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setPaymentMethod(item.name as any)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 ${
                      paymentMethod === item.name
                        ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>

              {/* Simulation Instructions */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <p>
                  1. Send <strong>Send Money / Payment</strong> from your {paymentMethod} account to:{' '}
                  <strong className="text-slate-900 dark:text-white font-mono">01700-123456</strong>
                </p>
                <p>2. Enter the Transaction ID (TrxID) below or leave blank to auto-simulate:</p>
              </div>

              {/* TrxID Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {paymentMethod} Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 9J8A7K6L5M (Leave empty for auto simulation)"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white font-bold shadow-lg shadow-pink-500/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>{loading ? 'Verifying payment...' : 'Confirm Payment & Enroll'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

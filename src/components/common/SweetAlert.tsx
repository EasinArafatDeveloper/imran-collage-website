'use client';

import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Trash2, 
  Check, 
  Sparkles 
} from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface SweetAlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface SweetAlertModalProps {
  alert: SweetAlertState | null;
  onClose: () => void;
}

export default function SweetAlertModal({ alert, onClose }: SweetAlertModalProps) {
  if (!alert || !alert.isOpen) return null;

  const {
    type = 'info',
    title,
    message,
    confirmText = 'ঠিক আছে',
    cancelText = 'বাতিল',
    onConfirm,
    onCancel,
  } = alert;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up text-center relative overflow-hidden"
        style={{
          boxShadow: type === 'success' 
            ? '0 20px 50px -10px rgba(16, 185, 129, 0.25)' 
            : type === 'error' || type === 'confirm' 
            ? '0 20px 50px -10px rgba(244, 63, 94, 0.25)' 
            : '0 20px 50px -10px rgba(236, 72, 153, 0.25)'
        }}
      >
        {/* Glow Header Background */}
        <div 
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
            type === 'success'
              ? 'bg-emerald-500'
              : type === 'error' || type === 'confirm'
              ? 'bg-rose-500'
              : type === 'warning'
              ? 'bg-amber-500'
              : 'bg-pink-500'
          }`}
        />

        {/* Top Icon with Ring */}
        <div className="flex justify-center pt-2">
          {type === 'success' && (
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          )}

          {type === 'error' && (
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/20 animate-pulse">
              <AlertCircle className="w-9 h-9" />
            </div>
          )}

          {type === 'warning' && (
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/20 animate-pulse">
              <AlertTriangle className="w-9 h-9" />
            </div>
          )}

          {type === 'confirm' && (
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/20">
              <Trash2 className="w-8 h-8" />
            </div>
          )}

          {type === 'info' && (
            <div className="w-16 h-16 rounded-full bg-pink-500/15 border-2 border-pink-500/40 flex items-center justify-center text-pink-500 shadow-lg shadow-pink-500/20">
              <Sparkles className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {type === 'confirm' ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex-1"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition flex-1 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className={`px-8 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                type === 'success'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white shadow-emerald-500/25'
                  : type === 'error'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 text-white shadow-rose-500/25'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 text-white shadow-pink-500/25'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{confirmText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

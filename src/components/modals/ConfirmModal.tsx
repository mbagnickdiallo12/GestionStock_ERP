"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const ConfirmModal: React.FC = () => {
  const { confirmState, closeConfirm } = useApp();

  if (!confirmState || !confirmState.isOpen) return null;

  const handleConfirm = () => {
    confirmState.onConfirm();
    closeConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-slate-950 flex flex-col gap-5 relative overflow-hidden font-sans">
        
        {/* Top glowing alert accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

        {/* Modal Close Button */}
        <button
          onClick={closeConfirm}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Message Body */}
        <div className="flex items-start gap-4 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              {confirmState.title || "Confirmation requise"}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmState.message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            onClick={closeConfirm}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold shadow-lg shadow-red-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {confirmState.confirmLabel || "Confirmer la Suppression"}
          </button>
        </div>

      </div>
    </div>
  );
};

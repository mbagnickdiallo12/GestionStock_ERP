"use client";

import React from "react";
import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ id, title, children, footer, size = 'md' }) => {
  const { activeModal, closeModal } = useApp();

  if (activeModal !== id) return null;

  const maxWidthClass = size === 'lg' ? 'max-w-3xl' : size === 'xl' ? 'max-w-5xl' : 'max-w-xl';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
      <div className={`bg-[#1e293b] border border-white/10 rounded-2xl w-full ${maxWidthClass} max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150`}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between gap-2 no-print">
          <h3 className="font-bold text-base sm:text-lg text-white leading-snug">{title}</h3>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-black/20 flex flex-wrap items-center justify-end gap-2 sm:gap-3 no-print">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

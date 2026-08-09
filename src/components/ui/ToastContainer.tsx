"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderColor = "border-emerald-500";
        let iconColor = "text-emerald-400";

        if (toast.type === "error") {
          Icon = XCircle;
          borderColor = "border-red-500";
          iconColor = "text-red-400";
        } else if (toast.type === "warning") {
          Icon = AlertCircle;
          borderColor = "border-amber-500";
          iconColor = "text-amber-400";
        } else if (toast.type === "info") {
          Icon = Info;
          borderColor = "border-blue-500";
          iconColor = "text-blue-400";
        }

        return (
          <div
            key={toast.id}
            className={`bg-[#1e293b] border-l-4 ${borderColor} border-white/10 text-white shadow-xl px-4 py-3 rounded-lg flex items-center gap-3 min-w-[280px] animate-in slide-in-from-right duration-200`}
          >
            <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};

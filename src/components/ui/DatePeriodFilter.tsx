"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, SlidersHorizontal } from "lucide-react";

interface DatePeriodFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  preset: string;
  onPresetChange: (preset: string) => void;
}

export const DatePeriodFilter: React.FC<DatePeriodFilterProps> = ({
  startDate,
  endDate,
  onDateChange,
  preset,
  onPresetChange,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(2026, 7, 1)); // August 2026

  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetSelect = (val: string) => {
    onPresetChange(val);
    const today = new Date(2026, 7, 8); // Simulation date Aug 8, 2026
    const todayStr = today.toISOString().slice(0, 10);

    if (val === "today") {
      onDateChange(todayStr, todayStr);
      setShowPopover(false);
    } else if (val === "7days") {
      const d7 = new Date(today);
      d7.setDate(today.getDate() - 7);
      onDateChange(d7.toISOString().slice(0, 10), todayStr);
      setShowPopover(false);
    } else if (val === "30days") {
      const d30 = new Date(today);
      d30.setDate(today.getDate() - 30);
      onDateChange(d30.toISOString().slice(0, 10), todayStr);
      setShowPopover(false);
    } else if (val === "all") {
      onDateChange("", "");
      setShowPopover(false);
    } else if (val === "custom") {
      setShowPopover(true);
    }
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday start

  const handleDateClick = (dayNum: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dStr);
      setTempEnd("");
    } else if (tempStart && !tempEnd) {
      if (dStr < tempStart) {
        setTempStart(dStr);
        setTempEnd(tempStart);
      } else {
        setTempEnd(dStr);
      }
    }
  };

  const handleApplyCustom = () => {
    if (tempStart) {
      onDateChange(tempStart, tempEnd || tempStart);
      onPresetChange("custom");
    } else {
      onDateChange("", "");
      onPresetChange("all");
    }
    setShowPopover(false);
  };

  const handleClearCustom = () => {
    setTempStart("");
    setTempEnd("");
    onDateChange("", "");
    onPresetChange("all");
    setShowPopover(false);
  };

  const changeMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  return (
    <div ref={containerRef} className="relative inline-block text-xs font-sans">
      {/* Preset Pill Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#0f172a] border border-white/15 p-1.5 rounded-xl shadow-md">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold px-2 py-1">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="hidden sm:inline">Période:</span>
        </div>

        <button
          type="button"
          onClick={() => handlePresetSelect("all")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            preset === "all" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          Toutes
        </button>

        <button
          type="button"
          onClick={() => handlePresetSelect("today")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            preset === "today" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          Aujourd'hui
        </button>

        <button
          type="button"
          onClick={() => handlePresetSelect("7days")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            preset === "7days" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          7 Jours
        </button>

        <button
          type="button"
          onClick={() => handlePresetSelect("30days")}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            preset === "30days" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          30 Jours
        </button>

        <button
          type="button"
          onClick={() => setShowPopover(!showPopover)}
          className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
            preset === "custom" 
              ? "bg-blue-600 border-blue-500 text-white shadow-md" 
              : "bg-[#1e293b] border-white/15 text-slate-300 hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
          <span>
            {preset === "custom" && startDate 
              ? `${startDate}${endDate ? ` → ${endDate}` : ''}` 
              : "Personnalisé"}
          </span>
        </button>
      </div>

      {/* Modern Adaptive Calendar Popover */}
      {showPopover && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-[#1e293b] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header Month/Year Selector */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="font-extrabold text-sm text-white">
              {monthNames[month]} {year}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-lg hover:bg-black/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-1 rounded-lg hover:bg-black/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

              const isStart = tempStart === dStr;
              const isEnd = tempEnd === dStr;
              const inRange = tempStart && tempEnd && dStr >= tempStart && dStr <= tempEnd;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleDateClick(dayNum)}
                  className={`h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${
                    isStart || isEnd
                      ? "bg-emerald-600 text-white font-black shadow-md scale-105"
                      : inRange
                      ? "bg-emerald-500/20 text-emerald-400 font-bold"
                      : "text-slate-300 hover:bg-black/10"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Selection range text */}
          <div className="bg-[#0f172a] border border-white/10 p-2 rounded-xl text-[11px] text-slate-300 flex items-center justify-between">
            <span>Plage:</span>
            <strong className="text-emerald-400 font-mono font-bold">
              {tempStart ? tempStart : "Début"} {tempEnd ? `→ ${tempEnd}` : ""}
            </strong>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={handleClearCustom}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded transition-colors cursor-pointer"
            >
              Effacer
            </button>

            <button
              type="button"
              onClick={handleApplyCustom}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

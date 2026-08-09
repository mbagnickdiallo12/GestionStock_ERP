"use client";

import React, { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Search, Plus, Minus, FileText, FileCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatNumber } from "@/lib/utils";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";

export default function StocksPage() {
  const { movements, depots, products, stocks, openModal, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [mvtTypeFilter, setMvtTypeFilter] = useState("all");
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <SkeletonTable rows={5} cols={5} />
        <SkeletonTable rows={6} cols={6} />
      </div>
    );
  }

  const filteredMovements = movements.filter(m => {
    const matchSearch = m.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.prodTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.dest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = mvtTypeFilter === "all" || m.type === mvtTypeFilter;

    const mvtDate = m.date ? m.date.slice(0, 10) : "";
    const matchStart = !startDate || mvtDate >= startDate;
    const matchEnd = !endDate || mvtDate <= endDate;

    return matchSearch && matchType && matchStart && matchEnd;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Stocks & Mouvements des Dépôts</h1>
          <p className="text-sm text-slate-400 mt-1">Matrice multi-dépôts, bons de livraison (BL), bons de réception (BR) et transferts camionnage.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => openModal("modal-stock-in")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Entrée Stock
          </button>
          <button 
            onClick={() => openModal("modal-stock-out")}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
          >
            <Minus className="w-4 h-4" /> Sortie Stock
          </button>
          <button 
            onClick={() => openModal("modal-stock-transfer")}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfert Inter-Dépôts
          </button>
        </div>
      </div>

      {/* Stock Matrix Table */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <span className="font-extrabold text-base text-white block mb-4">Matrice des Stocks de Sacs de Riz en Temps Réel</span>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Variété de Riz</th>
                <th className="p-3">Format</th>
                {depots.map(d => (
                  <th key={d.id} className="p-3 text-right">{d.name}</th>
                ))}
                <th className="p-3 text-right font-black text-emerald-400">Total Sacs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(p => {
                let totalProdBags = 0;
                depots.forEach(d => {
                  totalProdBags += (stocks[d.id] && stocks[d.id][p.id]) || 0;
                });

                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white">{p.title}</td>
                    <td className="p-3 text-slate-400">{p.weight} kg</td>
                    {depots.map(d => {
                      const qty = (stocks[d.id] && stocks[d.id][p.id]) || 0;
                      return (
                        <td key={d.id} className={`p-3 text-right font-bold ${qty < p.alertThreshold ? 'text-red-400' : 'text-slate-200'}`}>
                          {formatNumber(qty)}
                        </td>
                      );
                    })}
                    <td className="p-3 text-right font-black text-emerald-400 text-base">{formatNumber(totalProdBags)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search & Filter Bar with Date Period Selection */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° mouvement (MVT-8820), produit, provenance, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DatePeriodFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            preset={preset}
            onPresetChange={setPreset}
          />

          <select
            value={mvtTypeFilter}
            onChange={(e) => setMvtTypeFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous les Mouvements</option>
            <option value="ENTREE">Entrées (Arrivages)</option>
            <option value="SORTIE">Sorties (Ventes / Livraisons)</option>
            <option value="TRANSFERT">Transferts Inter-Dépôts</option>
          </select>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <span className="font-extrabold text-base text-white block mb-4">Historique des Entrées, Sorties & Transferts ({filteredMovements.length})</span>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Référence Mouvement</th>
                <th className="p-3">Date & Heure</th>
                <th className="p-3">Type</th>
                <th className="p-3">Produit</th>
                <th className="p-3">Source → Destination</th>
                <th className="p-3 text-right">Quantité (Sacs)</th>
                <th className="p-3">Opérateur / Chauffeur</th>
                <th className="p-3 text-right">Documents Logistiques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMovements.map(m => (
                <tr key={m.ref} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-white">{m.ref}</td>
                  <td className="p-3 text-slate-400 text-xs font-mono">{m.date}</td>
                  <td className="p-3">
                    {m.type === 'ENTREE' && <span className="bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-max"><ArrowDownLeft className="w-3.5 h-3.5" /> Entrée</span>}
                    {m.type === 'SORTIE' && <span className="bg-red-500/15 text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-max"><ArrowUpRight className="w-3.5 h-3.5" /> Sortie</span>}
                    {m.type === 'TRANSFERT' && <span className="bg-blue-500/15 text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-max"><ArrowRightLeft className="w-3.5 h-3.5" /> Transfert</span>}
                  </td>
                  <td className="p-3 font-semibold text-white">{m.prodTitle}</td>
                  <td className="p-3 text-slate-300">{m.source} → {m.dest}</td>
                  <td className="p-3 text-right font-black text-white">{formatNumber(m.qty)}</td>
                  <td className="p-3 text-slate-400">{m.operator}</td>
                  <td className="p-3 text-right">
                    {m.type === 'ENTREE' ? (
                      <button
                        onClick={() => openModal(`br-${m.ref}`)}
                        className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Imprimer le Bon de Réception (BR)"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Bon BR
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal(`bl-${m.ref}`)}
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        title="Imprimer le Bon de Livraison (BL)"
                      >
                        <FileText className="w-3.5 h-3.5" /> Bon BL
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

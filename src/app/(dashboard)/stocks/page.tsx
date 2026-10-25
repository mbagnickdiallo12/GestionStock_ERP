"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Search, Plus, Minus, FileText, FileCheck, Calendar, Clock, RotateCcw, AlertTriangle, Building2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatNumber, canCreate, getUserAssignedDepot, isMatchingDepot } from "@/lib/utils";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

export default function StocksPage() {
  const { movements, depots, products, stocks, sales, openModal, isLoading, currentUser, activeDepotId } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [mvtTypeFilter, setMvtTypeFilter] = useState("all");
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStockDate, setSelectedStockDate] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const userRestricted = getUserAssignedDepot(currentUser, depots);

  const [depotFilter, setDepotFilter] = useState(() => {
    if (userRestricted) return userRestricted.id;
    return activeDepotId;
  });

  useEffect(() => {
    if (userRestricted) {
      setDepotFilter(userRestricted.id);
    } else {
      setDepotFilter(activeDepotId);
    }
  }, [activeDepotId, userRestricted]);

  // Calculate historical stock matrix at selected date
  const displayStocks = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!selectedStockDate || selectedStockDate >= todayStr) {
      return stocks;
    }

    // Clone base stocks
    const historicalStocks: { [depotId: string]: { [prodId: string]: number } } = {};
    depots.forEach(d => {
      historicalStocks[d.id] = {};
      products.forEach(p => {
        historicalStocks[d.id][p.id] = (stocks[d.id] && stocks[d.id][p.id]) || 0;
      });
    });

    // Replay/reverse movements that occurred strictly AFTER selectedStockDate
    movements.forEach(m => {
      const mDate = m.date ? m.date.slice(0, 10) : "";
      if (mDate > selectedStockDate) {
        const prod = products.find(p => p.title.toLowerCase() === m.prodTitle.toLowerCase());
        const prodId = prod ? prod.id : "";
        if (!prodId) return;

        if (m.type === "ENTREE") {
          const destDepot = depots.find(d => isMatchingDepot(d.name, m.dest, depots) || isMatchingDepot(d.id, m.dest, depots));
          if (destDepot && historicalStocks[destDepot.id]) {
            historicalStocks[destDepot.id][prodId] = Math.max(0, (historicalStocks[destDepot.id][prodId] || 0) - m.qty);
          }
        } else if (m.type === "SORTIE") {
          const srcDepot = depots.find(d => isMatchingDepot(d.name, m.source, depots) || isMatchingDepot(d.id, m.source, depots));
          if (srcDepot && historicalStocks[srcDepot.id]) {
            historicalStocks[srcDepot.id][prodId] = (historicalStocks[srcDepot.id][prodId] || 0) + m.qty;
          }
        } else if (m.type === "TRANSFERT") {
          const srcDepot = depots.find(d => isMatchingDepot(d.name, m.source, depots) || isMatchingDepot(d.id, m.source, depots));
          const destDepot = depots.find(d => isMatchingDepot(d.name, m.dest, depots) || isMatchingDepot(d.id, m.dest, depots));
          if (srcDepot && historicalStocks[srcDepot.id]) {
            historicalStocks[srcDepot.id][prodId] = (historicalStocks[srcDepot.id][prodId] || 0) + m.qty;
          }
          if (destDepot && historicalStocks[destDepot.id]) {
            historicalStocks[destDepot.id][prodId] = Math.max(0, (historicalStocks[destDepot.id][prodId] || 0) - m.qty);
          }
        }
      }
    });

    // Reverse sales that occurred strictly after selectedStockDate (if not cancelled)
    sales.forEach(s => {
      const sDate = s.date ? s.date.slice(0, 10) : "";
      if (sDate > selectedStockDate && s.status !== "Annulé") {
        const depot = depots.find(d => isMatchingDepot(d.id, s.depotId, depots));
        if (depot && historicalStocks[depot.id]) {
          s.items.forEach(it => {
            const prod = products.find(p => p.id === it.productId || p.title.toLowerCase() === it.title.toLowerCase());
            if (prod && historicalStocks[depot.id]) {
              historicalStocks[depot.id][prod.id] = (historicalStocks[depot.id][prod.id] || 0) + it.qty;
            }
          });
        }
      }
    });

    return historicalStocks;
  }, [stocks, depots, products, movements, sales, selectedStockDate]);

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

  const effectiveDepotFilter = userRestricted ? userRestricted.id : depotFilter;

  const filteredMovements = movements.filter(m => {
    const matchSearch = m.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.prodTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.dest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = mvtTypeFilter === "all" || m.type === mvtTypeFilter;
    const matchDepot = effectiveDepotFilter === "all" || 
                       isMatchingDepot(m.source, effectiveDepotFilter, depots) || 
                       isMatchingDepot(m.dest, effectiveDepotFilter, depots);

    const mvtDate = m.date ? m.date.slice(0, 10) : "";
    const matchStart = !startDate || mvtDate >= startDate;
    const matchEnd = !endDate || mvtDate <= endDate;

    return matchSearch && matchType && matchDepot && matchStart && matchEnd;
  });

  // Explicitly sort movements: NEWEST FIRST (plus récent au plus ancien)
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    const tA = new Date(a.date || "").getTime() || 0;
    const tB = new Date(b.date || "").getTime() || 0;
    return tB - tA;
  });

  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
  const paginatedMovements = sortedMovements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const isHistorical = Boolean(selectedStockDate && selectedStockDate < new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Stocks & Mouvements des Dépôts</h1>
          <p className="text-sm text-slate-400 mt-1">Matrice multi-dépôts, consultation à date, bons de livraison (BL) et transferts camionnage.</p>
        </div>
        {canCreate(currentUser, 'stocks') && (
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
        )}
      </div>

      {/* Stock Matrix Table with Date Selector */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white">
              {isHistorical ? `Matrice des Stocks au ${new Date(selectedStockDate).toLocaleDateString('fr-FR')}` : "Matrice des Stocks de Sacs de Riz en Temps Réel"}
            </span>
            {isHistorical && (
              <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Archive Historique
              </span>
            )}
          </div>

          {/* Date Picker to view stock at a specific date */}
          <div className="flex flex-wrap items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-semibold">Stock à la date du :</span>
            <input
              type="date"
              value={selectedStockDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setSelectedStockDate(e.target.value)}
              className="bg-transparent text-white text-xs font-mono font-bold outline-none cursor-pointer"
            />
            {selectedStockDate && (
              <button
                onClick={() => setSelectedStockDate("")}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
                title="Revenir au stock en temps réel"
              >
                <RotateCcw className="w-3 h-3" /> Aujourd'hui
              </button>
            )}
          </div>
        </div>

        {/* Historical Notice Banner */}
        {isHistorical && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                État comptable reconstitué au <strong>{new Date(selectedStockDate).toLocaleDateString('fr-FR')}</strong> en déduisant les flux ultérieurs (ventes, entrées, sorties et transferts).
              </span>
            </div>
            <button
              onClick={() => setSelectedStockDate("")}
              className="text-amber-400 underline hover:text-amber-200 font-bold whitespace-nowrap cursor-pointer"
            >
              Afficher le stock actuel
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Variété de Riz</th>
                <th className="p-3">Format</th>
                {(userRestricted ? [userRestricted] : depots).map(d => (
                  <th key={d.id} className={`p-3 text-right ${userRestricted?.id === d.id ? 'text-amber-400 font-black' : ''}`}>
                    {d.name} {userRestricted?.id === d.id ? '(Votre Dépôt Assigné)' : ''}
                  </th>
                ))}
                <th className="p-3 text-right font-black text-emerald-400">Total Sacs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(p => {
                const targetDepotsList = userRestricted ? [userRestricted] : depots;
                let totalProdBags = 0;
                targetDepotsList.forEach(d => {
                  totalProdBags += (displayStocks[d.id] && displayStocks[d.id][p.id]) || 0;
                });

                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white">{p.title}</td>
                    <td className="p-3 text-slate-400">{p.weight} kg</td>
                    {targetDepotsList.map(d => {
                      const qty = (displayStocks[d.id] && displayStocks[d.id][p.id]) || 0;
                      return (
                        <td key={d.id} className={`p-3 text-right font-bold ${qty < p.alertThreshold ? 'text-red-400' : 'text-slate-200'} ${userRestricted?.id === d.id ? 'bg-amber-500/5' : ''}`}>
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
          {/* Depot Filter: Locked for restricted users, selector for admins */}
          {userRestricted ? (
            <div className="flex items-center gap-2 bg-[#0f172a] border border-amber-500/30 px-3 py-2 rounded-xl shadow-sm" title={`Compte assigné exclusivement au ${userRestricted.name}`}>
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white text-xs font-bold truncate">📍 {userRestricted.name}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 ml-1">Affecté</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={depotFilter}
                onChange={(e) => setDepotFilter(e.target.value)}
                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#1e293b]">📍 Tous les Dépôts</option>
                {depots.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#1e293b]">📍 {d.name}</option>
                ))}
              </select>
            </div>
          )}

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
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/30">
          <span className="font-bold text-sm text-slate-200">
            Historique des Entrées, Sorties & Transferts ({sortedMovements.length})
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Classé par ordre chronologique (du plus récent au plus ancien)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-900/60">
                <th className="py-3.5 px-4 font-semibold">Réf. Mouvement</th>
                <th className="py-3.5 px-4 font-semibold">Date & Heure</th>
                <th className="py-3.5 px-4 font-semibold text-center">Type</th>
                <th className="py-3.5 px-4 font-semibold">Produit</th>
                <th className="py-3.5 px-4 font-semibold">Trajet (Source → Destination)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Quantité</th>
                <th className="py-3.5 px-4 font-semibold">Opérateur</th>
                <th className="py-3.5 px-4 text-right font-semibold">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedMovements.length > 0 ? (
                paginatedMovements.map(m => (
                  <tr key={m.ref} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Référence */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/5 whitespace-nowrap">
                        {m.ref}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                      {m.date}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4 text-center">
                      {m.type === 'ENTREE' && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Entrée
                        </span>
                      )}
                      {m.type === 'SORTIE' && (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Sortie
                        </span>
                      )}
                      {m.type === 'TRANSFERT' && (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                          <ArrowRightLeft className="w-3.5 h-3.5" /> Transfert
                        </span>
                      )}
                    </td>

                    {/* Produit */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-100 text-sm">
                        {m.prodTitle}
                      </span>
                    </td>

                    {/* Source -> Destination */}
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <span className="text-slate-400">{m.source}</span>
                      <span className="text-emerald-400 mx-1.5 font-bold">→</span>
                      <span className="text-slate-200 font-medium">{m.dest}</span>
                    </td>

                    {/* Quantité */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                      {formatNumber(m.qty)} <span className="text-xs font-normal text-slate-400">Sacs</span>
                    </td>

                    {/* Opérateur */}
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-medium">
                      {m.operator || "-"}
                    </td>

                    {/* Action Document */}
                    <td className="py-3.5 px-4 text-right">
                      {m.type === 'ENTREE' ? (
                        <button
                          onClick={() => openModal(`br-${m.ref}`)}
                          className="bg-slate-800/80 hover:bg-emerald-600 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/5 inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                          title="Imprimer le Bon de Réception (BR)"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Bon BR</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openModal(`bl-${m.ref}`)}
                          className="bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/5 inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                          title="Imprimer le Bon de Livraison (BL)"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Bon BL</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    Aucun mouvement trouvé pour cette sélection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Numbered Pagination with Arrows */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedMovements.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setCurrentPage(1);
          }}
          itemName="mouvements"
        />
      </div>
    </div>
  );
}

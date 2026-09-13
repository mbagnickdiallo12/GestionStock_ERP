"use client";

import React, { useState } from "react";
import { Plus, Search, ClipboardList, CheckCircle2, AlertTriangle, RefreshCw, Eye, Building2, Calendar, FileSpreadsheet, PackageCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatNumber, canCreate } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";

export default function InventairePage() {
  const { inventories, depots, activeDepotId, setActiveDepotId, openModal, showToast, currentUser, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [depotFilter, setDepotFilter] = useState(activeDepotId);
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  const filteredInventories = inventories.filter(inv => {
    const matchSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inv.depotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inv.auditor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    
    // Depot filtering: either from page dropdown or active header depot selector
    const currentDepotFilter = depotFilter !== "all" ? depotFilter : activeDepotId;
    const matchDepot = currentDepotFilter === "all" || inv.depotId === currentDepotFilter;

    const invDate = inv.date.slice(0, 10);
    const matchStart = !startDate || invDate >= startDate;
    const matchEnd = !endDate || invDate <= endDate;

    return matchSearch && matchStatus && matchDepot && matchStart && matchEnd;
  });

  const totalSessions = filteredInventories.length;
  const totalBagsCounted = filteredInventories.reduce((sum, i) => sum + i.totalActual, 0);
  const totalDiscrepancies = filteredInventories.reduce((sum, i) => sum + i.totalDiscrepancy, 0);
  const adjustedCount = filteredInventories.filter(i => i.status === "Ajusté").length;

  const totalPages = Math.ceil(filteredInventories.length / pageSize) || 1;
  const paginatedInventories = filteredInventories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeDepotName = depots.find(d => d.id === (depotFilter !== "all" ? depotFilter : activeDepotId))?.name || "Tous les Dépôts";

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Date,Depot,Auditeur,Statut,TotalAttendu,TotalComptes,EcartGlobal\n";
    filteredInventories.forEach(i => {
      csvContent += `"${i.id}","${i.date}","${i.depotName}","${i.auditor}","${i.status}","${i.totalExpected}","${i.totalActual}","${i.totalDiscrepancy}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventaires_Physiques_RizStock_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast("Fichier des inventaires exporté en CSV !", "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-500" /> Inventaire Physique & Audit des Stocks
          </h1>
          <p className="text-sm text-slate-400 mt-1">Comptage contradictoire en entrepôt, procès-verbal (PV) et ajustement automatisé du stock système.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV PV
          </button>
          {canCreate(currentUser, 'inventaire') && (
            <button 
              onClick={() => openModal("modal-new-inventory")}
              className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Lancer un Inventaire Dépôt
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sessions d'Inventaire</span>
            <ClipboardList className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalSessions}</div>
          <span className="text-[11px] text-slate-400">Audits physiques filtrés</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sacs Comptés</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{formatNumber(totalBagsCounted)} Sacs</div>
          <span className="text-[11px] text-slate-400">Comptage physique réel</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Écarts Globaux Détectés</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-black ${totalDiscrepancies < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {totalDiscrepancies > 0 ? '+' : ''}{formatNumber(totalDiscrepancies)} Sacs
          </div>
          <span className="text-[11px] text-slate-400">Balance des pertes / gains</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Stocks Système Ajustés</span>
            <RefreshCw className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{adjustedCount} / {totalSessions}</div>
          <span className="text-[11px] text-slate-400">Synchronisations terminées</span>
        </div>
      </div>

      {/* Search & Depot Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° inventaire (INV-2026-005), dépôt, auditeur..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
              setCurrentPage(1);
            }}
            preset={preset}
            onPresetChange={(p) => {
              setPreset(p);
              setCurrentPage(1);
            }}
          />

          <select
            value={depotFilter}
            onChange={(e) => { setDepotFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">🏢 Tous les Dépôts</option>
            {depots.map(d => (
              <option key={d.id} value={d.id}>📍 {d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous les Statuts</option>
            <option value="En cours">En cours</option>
            <option value="Clôturé">Clôturé</option>
            <option value="Ajusté">Ajusté & Synchro</option>
          </select>
        </div>
      </div>

      {/* Inventories Table */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        {filteredInventories.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <PackageCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white">Aucun inventaire physique enregistré pour {activeDepotName}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Les entrées/sorties quotidiennes figurent dans le module <strong>Stocks & Mouvements</strong>.
              Pour réaliser un comptage contradictoire physique et ajuster le stock système de ce dépôt, lancez une session ci-dessous :
            </p>
            {canCreate(currentUser, 'inventaire') && (
              <button
                onClick={() => openModal("modal-new-inventory")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" /> Lancer l'Inventaire Physique pour {activeDepotName}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                  <th className="p-3">N° Inventaire</th>
                  <th className="p-3">Date & Heure</th>
                  <th className="p-3">Dépôt Audité</th>
                  <th className="p-3">Auditeur Responsable</th>
                  <th className="p-3 text-right">Système (Attendu)</th>
                  <th className="p-3 text-right">Compté (Physique)</th>
                  <th className="p-3 text-right">Écart Global</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions Métier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedInventories.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-white">{inv.id}</td>
                    <td className="p-3 text-slate-300 text-xs">{inv.date}</td>
                    <td className="p-3 font-bold text-white text-xs flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {inv.depotName}
                    </td>
                    <td className="p-3 text-slate-300 text-xs">{inv.auditor}</td>
                    <td className="p-3 text-right text-slate-300 font-semibold">{formatNumber(inv.totalExpected)} Sacs</td>
                    <td className="p-3 text-right text-white font-extrabold">{formatNumber(inv.totalActual)} Sacs</td>
                    <td className="p-3 text-right font-black">
                      {inv.totalDiscrepancy === 0 ? (
                        <span className="text-slate-400">0</span>
                      ) : inv.totalDiscrepancy > 0 ? (
                        <span className="text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full text-xs">+{formatNumber(inv.totalDiscrepancy)} Sacs</span>
                      ) : (
                        <span className="text-red-400 bg-red-500/15 px-2.5 py-0.5 rounded-full text-xs">{formatNumber(inv.totalDiscrepancy)} Sacs</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        inv.status === 'Ajusté' ? 'bg-emerald-500/20 text-emerald-400' :
                        inv.status === 'Clôturé' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(`modal-inventory-details-${inv.id}`)}
                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Consulter PV & Ajuster Stock"
                        >
                          <Eye className="w-3.5 h-3.5" /> Fiche & Ajuster
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredInventories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInventories.length}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newSize: number) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            itemName="inventaires"
          />
        )}
      </div>
    </div>
  );
}

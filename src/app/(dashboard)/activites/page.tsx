"use client";

import React, { useState } from "react";
import { Activity, Search, FileSpreadsheet, Trash2, CheckCircle2, Clock, Terminal, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatNumber } from "@/lib/utils";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";

import { SkeletonTable } from "@/components/ui/Skeleton";

export default function ActivitesPage() {
  const { auditLogs, clearAuditLogs, askConfirm, showToast, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <SkeletonTable rows={7} cols={5} />
      </div>
    );
  }

  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.depotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.ipAddress.includes(searchTerm);
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    const matchUser = userFilter === "all" || log.user.toLowerCase().includes(userFilter.toLowerCase());

    const logDate = log.timestamp.slice(0, 10);
    const matchStart = !startDate || logDate >= startDate;
    const matchEnd = !endDate || logDate <= endDate;

    return matchSearch && matchAction && matchUser && matchStart && matchEnd;
  });

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Date,Utilisateur,Role,Action,Description,Depot,IP\n";
    filteredLogs.forEach(l => {
      csvContent += `"${l.id}","${l.timestamp}","${l.user}","${l.role}","${l.action}","${l.description.replace(/"/g, '""')}","${l.depotName}","${l.ipAddress}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Journal_Audit_RizStock_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast("Journal d'activités exporté en CSV !", "success");
  };

  const handleClearLogs = () => {
    askConfirm({
      title: "Purger le Journal d'Activités ?",
      message: "Êtes-vous sûr de vouloir effacer l'historique des traces d'audit ? Cette action réinitialise le registre d'activités.",
      confirmLabel: "Oui, Purger l'Audit",
      onConfirm: () => clearAuditLogs(),
    });
  };

  // Metrics
  const totalLogs = filteredLogs.length;
  const salesLogsCount = filteredLogs.filter(l => l.action === "VENTE").length;
  const stockLogsCount = filteredLogs.filter(l => l.action === "STOCK").length;
  const userLogsCount = filteredLogs.filter(l => l.action === "UTILISATEUR" || l.action === "PARAMETRE").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" /> Journal d'Activités & Audit de Sécurité
          </h1>
          <p className="text-sm text-slate-400 mt-1">Traçabilité complète des actions utilisateurs : qui a fait quoi, quand et depuis quel dépôt.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          <button 
            onClick={handleClearLogs}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Purger l'Audit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Actions Traçées</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatNumber(totalLogs)}</div>
          <span className="text-[11px] text-slate-400">Historique d'audit actif</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ventes & Encaisses</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{formatNumber(salesLogsCount)}</div>
          <span className="text-[11px] text-slate-400">Transactions POS enregistrées</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Mouvements Stock</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{formatNumber(stockLogsCount)}</div>
          <span className="text-[11px] text-slate-400">Entrées, sorties & transferts</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sécurité & Accès</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{formatNumber(userLogsCount)}</div>
          <span className="text-[11px] text-slate-400">Modifs rôles, pass & paramètres</span>
        </div>
      </div>

      {/* Search & Date Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrer par utilisateur, mot-clé d'action, N° facture/mouvement, IP..."
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
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Toutes les Actions</option>
            <option value="VENTE">Ventes & Factures</option>
            <option value="STOCK">Mouvements Stock</option>
            <option value="CREANCE">Créances Clients</option>
            <option value="PAIE">Salaires & RH</option>
            <option value="ACHAT">Achats Conteneurs</option>
            <option value="UTILISATEUR">Habilitations & Accès</option>
            <option value="PARAMETRE">Paramètres ERP</option>
          </select>

          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous les Utilisateurs</option>
            <option value="moustapha">Moustapha Ndiaye (Admin)</option>
            <option value="ousmane">Ousmane Ba (Gérant)</option>
            <option value="awa">Awa Diop (Caissière)</option>
            <option value="fatou">Fatou Sall (Comptable)</option>
          </select>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <span className="font-extrabold text-base text-white block mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" /> Registre d'Audit & Traçabilité Métier
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Réf Audit</th>
                <th className="p-3">Horodatage</th>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">Catégorie Action</th>
                <th className="p-3">Description Métier Détaillée</th>
                <th className="p-3">Dépôt / Site</th>
                <th className="p-3">Terminal IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-400 text-xs">{log.id}</td>
                  <td className="p-3 text-slate-300 font-medium text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {log.timestamp}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-white text-xs">{log.user}</div>
                    <span className="text-[10px] text-blue-400 uppercase font-semibold">{log.role}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      log.action === 'VENTE' ? 'bg-emerald-500/15 text-emerald-400' :
                      log.action === 'STOCK' ? 'bg-amber-500/15 text-amber-400' :
                      log.action === 'CREANCE' ? 'bg-blue-500/15 text-blue-400' :
                      log.action === 'PAIE' ? 'bg-purple-500/15 text-purple-400' :
                      log.action === 'UTILISATEUR' ? 'bg-red-500/15 text-red-400' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200 font-semibold text-xs max-w-md">{log.description}</td>
                  <td className="p-3 text-slate-300 text-xs">{log.depotName}</td>
                  <td className="p-3 font-mono text-slate-500 text-xs">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Plus, Search, UserCheck, DollarSign, Edit, Trash2, FileText, PlusCircle, Building2, User, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber, canCreate, canManage } from "@/lib/utils";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";

export default function RHPage() {
  const { employees, depots, activeDepotId, deleteEmployee, openModal, askConfirm, isLoading, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [depotFilter, setDepotFilter] = useState(activeDepotId);

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

  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (emp.cniNumber && emp.cniNumber.includes(searchTerm));

    const matchRole = roleFilter === "all" || emp.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchDepot = depotFilter === "all" || emp.depotId === depotFilter;

    return matchSearch && matchRole && matchDepot;
  });

  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (e.salary || 0) + (e.transportAllowance || 0) + (e.housingAllowance || 0), 0);
  const totalAdvances = employees.reduce((sum, e) => sum + (e.advances || 0), 0);

  const handleDelete = (id: string, empName: string) => {
    askConfirm({
      title: "Supprimer la Fiche Employé ?",
      message: `Êtes-vous sûr de vouloir supprimer définitivement le dossier RH de "${empName}" ?`,
      confirmLabel: "Oui, Supprimer",
      onConfirm: () => deleteEmployee(id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-500" /> Ressources Humaines, Dossiers Salariés & Paie
          </h1>
          <p className="text-sm text-slate-400 mt-1">Gestion des fiches RH (CNI, Contrats CDI/CDD), filtrage par dépôt, avances sur salaire et bulletins de paie.</p>
        </div>

        {canCreate(currentUser, 'rh') && (
          <button 
            onClick={() => openModal("modal-add-employee")}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nouvel Employé RH
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Effectif Total Dépôts</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{employees.length} Salariés</div>
          <span className="text-[11px] text-slate-400">Gérants, Caissiers & Manutentionnaires</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Masse Salariale Mensuelle</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatFCFA(totalMonthlyPayroll)}</div>
          <span className="text-[11px] text-slate-400">Salaires de base + Primes</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Encours Avances Salaire</span>
            <PlusCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{formatFCFA(totalAdvances)}</div>
          <span className="text-[11px] text-slate-400">À déduire sur prochains bulletins</span>
        </div>
      </div>

      {/* Search & Depot / Role Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un employé (EMP-01), nom, N° CNI, poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Depot Filter Selector */}
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

          {/* Role Filter Selector */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous les Postes</option>
            <option value="gérant">Gérants de Dépôt</option>
            <option value="caiss">Caissiers</option>
            <option value="manutention">Manutentionnaires</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-900/60">
                <th className="py-3.5 px-4 font-semibold">Matricule</th>
                <th className="py-3.5 px-4 font-semibold">Salarié</th>
                <th className="py-3.5 px-4 font-semibold">Dépôt</th>
                <th className="py-3.5 px-4 font-semibold">Poste / Contrat</th>
                <th className="py-3.5 px-4 font-semibold">Coordonnées</th>
                <th className="py-3.5 px-4 font-semibold text-right">Salaire Base</th>
                <th className="py-3.5 px-4 font-semibold text-right">Avances</th>
                <th className="py-3.5 px-4 font-semibold text-center">Dernière Paie</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions RH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => {
                  const depot = depots.find(d => d.id === emp.depotId);
                  const initials = emp.name
                    .split(" ")
                    .map(n => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "RH";

                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Matricule */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-medium text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/5 whitespace-nowrap">
                          {emp.id}
                        </span>
                      </td>
                      
                      {/* Salarié Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => openModal(`employee-details-${emp.id}`)}
                          className="flex items-center gap-3 text-left group-hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Consulter le dossier RH complet"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors text-sm">
                              {emp.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {emp.cniNumber || "CNI non renseignée"}
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Dépôt */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 text-xs font-medium inline-flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {depot ? depot.name : emp.depotId}
                        </span>
                      </td>
                      
                      {/* Poste & Contrat */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-200 text-xs font-medium">{emp.role}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            emp.contractType === 'CDD' 
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {emp.contractType || 'CDI'}
                          </span>
                        </div>
                      </td>

                      {/* Coordonnées */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-400">
                        {emp.phone || "-"}
                      </td>

                      {/* Salaire Base */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                        {formatFCFA(emp.salary)}
                      </td>
                      
                      {/* Avances */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        {emp.advances > 0 ? (
                          <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-xs font-bold">
                            {formatFCFA(emp.advances)}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">0 FCFA</span>
                        )}
                      </td>

                      {/* Dernière Paie */}
                      <td className="py-3.5 px-4 text-center text-xs">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          emp.lastPay?.includes('2026')
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-white/5'
                        }`}>
                          {emp.lastPay || "En attente"}
                        </span>
                      </td>

                      {/* Actions RH */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal(`employee-details-${emp.id}`)}
                            className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/5 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            title="Consulter la fiche RH"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Fiche</span>
                          </button>

                          <button 
                            onClick={() => openModal(`payslip-${emp.id}`)}
                            className="bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            title="Générer Bulletin de Paie"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Paie</span>
                          </button>

                          <button 
                            onClick={() => openModal(`advance-${emp.id}`)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-2 py-1.5 rounded-lg text-xs font-medium border border-amber-500/20 flex items-center gap-1 transition-all cursor-pointer"
                            title="Octroyer une Avance"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Avance</span>
                          </button>

                          {canManage(currentUser, 'rh') && (
                            <div className="flex items-center pl-1 ml-1 border-l border-white/10 gap-0.5">
                              <button 
                                onClick={() => openModal(`edit-employee-${emp.id}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                                title="Modifier les données RH"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button 
                                onClick={() => handleDelete(emp.id, emp.name)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Supprimer le dossier"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    Aucun employé trouvé pour cette recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

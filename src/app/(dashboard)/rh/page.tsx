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

  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (e.salary || 0) + (e.transportAllowance || 0), 0);
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
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Matricule</th>
                <th className="p-3">Nom & Prénom</th>
                <th className="p-3">Dépôt Affecté</th>
                <th className="p-3">Poste & Contrat</th>
                <th className="p-3">N° CNI / Tel</th>
                <th className="p-3">Salaire de Base</th>
                <th className="p-3">Avances en Cours</th>
                <th className="p-3">Dernier Bulletin</th>
                <th className="p-3 text-right">Actions RH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEmployees.map(emp => {
                const depot = depots.find(d => d.id === emp.depotId);

                return (
                  <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-white"><span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded text-xs">{emp.id}</span></td>
                    
                    {/* Employee Name with Dossier Trigger */}
                    <td className="p-3 font-bold text-white">
                      <button
                        onClick={() => openModal(`employee-details-${emp.id}`)}
                        className="hover:text-emerald-400 flex items-center gap-2 cursor-pointer transition-colors text-left"
                        title="Voir la fiche RH complète du salarié"
                      >
                        <User className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{emp.name}</span>
                      </button>
                    </td>

                    <td className="p-3 text-slate-300 text-xs font-semibold">{depot ? depot.name : emp.depotId}</td>
                    
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-blue-500/15 text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">{emp.role}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          emp.contractType === 'CDD' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {emp.contractType || 'CDI'}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-xs text-slate-400 font-mono">
                      <div>{emp.cniNumber || "1 757 1990 00123"}</div>
                      <div className="text-[11px] text-slate-300 font-sans">{emp.phone || "+221 77 000 00 00"}</div>
                    </td>

                    <td className="p-3 text-slate-200 font-mono font-bold">{formatFCFA(emp.salary)}</td>
                    
                    <td className="p-3 font-mono">
                      {emp.advances > 0 ? (
                        <span className="text-amber-400 font-bold">{formatFCFA(emp.advances)}</span>
                      ) : (
                        <span className="text-slate-500">0 FCFA</span>
                      )}
                    </td>

                    <td className="p-3 text-slate-400 text-xs">{emp.lastPay}</td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(`employee-details-${emp.id}`)}
                          className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Fiche RH Salarié"
                        >
                          <User className="w-3.5 h-3.5" /> Fiche
                        </button>

                        <button 
                          onClick={() => openModal(`payslip-${emp.id}`)}
                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Générer Bulletin de Paie"
                        >
                          <FileText className="w-3.5 h-3.5" /> Paie
                        </button>

                        <button 
                          onClick={() => openModal(`advance-${emp.id}`)}
                          className="bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Octroyer une Avance"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Avance
                        </button>

                        {canManage(currentUser, 'rh') && (
                          <>
                            <button 
                              onClick={() => openModal(`edit-employee-${emp.id}`)}
                              className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Modifier les données RH"
                            >
                              <Edit className="w-3.5 h-3.5" /> Modifier
                            </button>

                            <button 
                              onClick={() => handleDelete(emp.id, emp.name)}
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors cursor-pointer"
                              title="Supprimer la fiche"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

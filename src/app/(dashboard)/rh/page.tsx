"use client";

import React, { useState } from "react";
import { Plus, Search, UserCheck, DollarSign, Edit, Trash2, FileText, PlusCircle, Building2, User, SlidersHorizontal, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber, canCreate, canManage } from "@/lib/utils";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";

export default function RHPage() {
  const { employees, depots, activeDepotId, deleteEmployee, openModal, askConfirm, isLoading, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [depotFilter, setDepotFilter] = useState(activeDepotId);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Column visibility state (useful defaults to avoid clutter)
  const [visibleCols, setVisibleCols] = useState({
    matricule: false, // Hidden by default to reduce noise
    depot: true,
    contact: true,
    avances: false, // Merged cleanly under salary, but can be separate
    statutPaie: true,
  });

  const toggleCol = (colKey: keyof typeof visibleCols) => {
    setVisibleCols(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

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

  // Helper to format clean phone (hide raw "+221" when no actual number is entered)
  const formatCleanPhone = (phone?: string) => {
    if (!phone) return "—";
    const clean = phone.trim();
    if (clean === "+221" || clean === "+221 " || clean.length <= 4) return "—";
    return clean;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-500" /> Ressources Humaines & Salaires
          </h1>
          <p className="text-sm text-slate-400 mt-1">Gestion des effectifs, dossiers du personnel, avances et bulletins de paie.</p>
        </div>

        {canCreate(currentUser, 'rh') && (
          <button 
            onClick={() => openModal("modal-add-employee")}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nouvel Employé
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Effectif Total</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{employees.length} Salariés</div>
          <span className="text-[11px] text-slate-400">Personnel actif multi-dépôts</span>
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

      {/* Search & Depot / Role Filter & Column Visibility Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, poste, téléphone..."
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

          {/* Column Toggle Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="bg-[#0f172a] border border-white/15 hover:border-white/30 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Affichage</span>
            </button>

            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl p-2 z-20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">Colonnes visibles :</span>
                
                <button
                  onClick={() => toggleCol('matricule')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Matricule ID</span>
                  {visibleCols.matricule && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => toggleCol('depot')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Dépôt Affecté</span>
                  {visibleCols.depot && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => toggleCol('contact')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Téléphone / Contact</span>
                  {visibleCols.contact && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => toggleCol('avances')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Colonne Avances</span>
                  {visibleCols.avances && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => toggleCol('statutPaie')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Dernière Paie</span>
                  {visibleCols.statutPaie && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-900/60">
                {visibleCols.matricule && <th className="py-3.5 px-4 font-semibold w-24">Matricule</th>}
                <th className="py-3.5 px-4 font-semibold">Salarié & Poste</th>
                {visibleCols.depot && <th className="py-3.5 px-4 font-semibold">Dépôt</th>}
                {visibleCols.contact && <th className="py-3.5 px-4 font-semibold">Contact</th>}
                <th className="py-3.5 px-4 font-semibold text-right">Rémunération</th>
                {visibleCols.avances && <th className="py-3.5 px-4 font-semibold text-right">Avances</th>}
                {visibleCols.statutPaie && <th className="py-3.5 px-4 font-semibold text-center">Dernière Paie</th>}
                <th className="py-3.5 px-4 text-right font-semibold">Actions RH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => {
                  const depot = depots.find(d => d.id === emp.depotId);
                  const initials = emp.name
                    .split(" ")
                    .map(n => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "RH";

                  const cleanPhone = formatCleanPhone(emp.phone);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Optional Matricule */}
                      {visibleCols.matricule && (
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/5 whitespace-nowrap">
                            #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                          </span>
                        </td>
                      )}
                      
                      {/* Salarié Avatar & Name + Clean Role Subtitle (No CNI clutter) */}
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
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                              <span className="text-slate-300 font-medium">{emp.role}</span>
                              <span className="text-slate-600">&bull;</span>
                              <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded ${
                                emp.contractType === 'CDD' 
                                  ? 'text-amber-400 bg-amber-500/10' 
                                  : 'text-emerald-400 bg-emerald-500/10'
                              }`}>
                                {emp.contractType || 'CDI'}
                              </span>
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Dépôt */}
                      {visibleCols.depot && (
                        <td className="py-3.5 px-4">
                          <span className="text-slate-300 text-xs font-medium inline-flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {depot ? depot.name : emp.depotId}
                          </span>
                        </td>
                      )}

                      {/* Clean Contact */}
                      {visibleCols.contact && (
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                          {cleanPhone}
                        </td>
                      )}

                      {/* Rémunération Base + Avance badge if any */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-slate-100 text-sm">
                          {formatFCFA(emp.salary)}
                        </div>
                        {emp.advances > 0 && !visibleCols.avances && (
                          <div className="text-[10px] text-amber-400 font-medium mt-0.5">
                            Avance: -{formatNumber(emp.advances)} F
                          </div>
                        )}
                      </td>
                      
                      {/* Optional Separate Avances Column */}
                      {visibleCols.avances && (
                        <td className="py-3.5 px-4 text-right font-mono">
                          {emp.advances > 0 ? (
                            <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-xs font-bold">
                              {formatFCFA(emp.advances)}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">0 FCFA</span>
                          )}
                        </td>
                      )}

                      {/* Dernière Paie */}
                      {visibleCols.statutPaie && (
                        <td className="py-3.5 px-4 text-center text-xs">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                            emp.lastPay?.includes('2026')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-white/5'
                          }`}>
                            {emp.lastPay || "En attente"}
                          </span>
                        </td>
                      )}

                      {/* Actions RH (Streamlined) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal(`employee-details-${emp.id}`)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/5 flex items-center gap-1 transition-all cursor-pointer"
                            title="Consulter la fiche RH"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Fiche</span>
                          </button>

                          <button 
                            onClick={() => openModal(`payslip-${emp.id}`)}
                            className="bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/20 flex items-center gap-1 transition-all cursor-pointer"
                            title="Générer Bulletin de Paie"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Paie</span>
                          </button>

                          <button 
                            onClick={() => openModal(`advance-${emp.id}`)}
                            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/15 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer"
                            title="Octroyer une Avance"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>

                          {canManage(currentUser, 'rh') && (
                            <div className="flex items-center pl-1 border-l border-white/10 gap-0.5">
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
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
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


"use client";

import React, { useState } from "react";
import { Plus, Search, Users, DollarSign, AlertCircle, CheckCircle, Edit, Trash2, Eye, Mail, MapPin, Phone, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, canCreate } from "@/lib/utils";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";

export default function ClientsPage() {
  const { clients, deleteClient, openModal, askConfirm, showToast, isLoading, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [debtFilter, setDebtFilter] = useState("all");

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
        <SkeletonTable rows={6} cols={6} />
      </div>
    );
  }

  const filteredClients = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.phone.includes(searchTerm) ||
                        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        c.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "all" || c.category === categoryFilter;
    const matchDebt = debtFilter === "all" ||
                      (debtFilter === "with_debt" && c.balance > 0) ||
                      (debtFilter === "clean" && c.balance === 0);

    return matchSearch && matchCategory && matchDebt;
  });

  const totalClients = clients.length;
  const totalDebts = clients.reduce((sum, c) => sum + c.balance, 0);
  const clientsWithDebtCount = clients.filter(c => c.balance > 0).length;
  const totalCreditLimit = clients.reduce((sum, c) => sum + (c.creditLimit || 10000000), 0);

  const handleDelete = (id: string, name: string) => {
    askConfirm({
      title: "Supprimer le Client ?",
      message: `Êtes-vous sûr de vouloir supprimer définitivement la fiche client de "${name}" ?`,
      confirmLabel: "Oui, Supprimer Client",
      onConfirm: () => deleteClient(id),
    });
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Nom,Categorie,Telephone,Email,Ville,Adresse,CumulAchats,SoldeCreance,PlafondCredit\n";
    filteredClients.forEach(c => {
      csvContent += `"${c.id}","${c.name}","${c.category}","${c.phone}","${c.email || ''}","${c.city}","${(c.address || '').replace(/"/g, '""')}","${c.totalPurchases}","${c.balance}","${c.creditLimit || 10000000}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clients_Creances_RizStock_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast("Repertoire clients exporté en CSV !", "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" /> Gestion des Clients & Suivi des Créances
          </h1>
          <p className="text-sm text-slate-400 mt-1">Répertoire complet des grossistes, plafonds de crédit, emails, adresses et recouvrements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          {canCreate(currentUser, 'clients') && (
            <button 
              onClick={() => openModal("modal-add-client")}
              className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nouveau Client
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Clients Enregistrés</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalClients}</div>
          <span className="text-[11px] text-slate-400">Grossistes & détaillants actifs</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Encours Total Créances</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{formatFCFA(totalDebts)}</div>
          <span className="text-[11px] text-slate-400">Montant total dû par les clients</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Clients avec Créance</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{clientsWithDebtCount}</div>
          <span className="text-[11px] text-slate-400">En attente de recouvrement</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Plafond Crédit Autorisé</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{formatFCFA(totalCreditLimit)}</div>
          <span className="text-[11px] text-slate-400">Capacité de financement globale</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email (contact@...), ville ou adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Toutes les Catégories</option>
            <option value="Grossiste Majeur">Grossiste Majeur</option>
            <option value="Demi-Grossiste">Demi-Grossiste</option>
            <option value="Détaillant">Détaillant</option>
          </select>

          <select
            value={debtFilter}
            onChange={(e) => setDebtFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous les Statuts de Créance</option>
            <option value="with_debt">⚠️ Clients avec Créance Active</option>
            <option value="clean">✅ Clients à Jour (Solde 0 FCFA)</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Client / Raison Sociale</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Coordonnées (Tél & Email)</th>
                <th className="p-3">Ville & Adresse</th>
                <th className="p-3 text-right">Plafond Crédit</th>
                <th className="p-3 text-right">Cumul Achats</th>
                <th className="p-3 text-right">Solde Créance</th>
                <th className="p-3 text-right">Actions Métier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map(c => {
                const limit = c.creditLimit || 10000000;

                return (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white">
                      <div className="text-base">{c.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {c.id}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-blue-500/15 text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {c.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {c.phone}
                      </div>
                      {c.email ? (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-blue-400 shrink-0" /> {c.email}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Email non renseigné</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-300 text-xs">{c.city}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" /> {c.address || "Sens information"}
                      </div>
                    </td>
                    <td className="p-3 text-right text-blue-400 font-bold text-xs">{formatFCFA(limit)}</td>
                    <td className="p-3 text-right text-slate-200 font-bold">{formatFCFA(c.totalPurchases)}</td>
                    <td className="p-3 text-right">
                      {c.balance > 0 ? (
                        <div>
                          <span className="bg-red-500/20 text-red-400 font-black px-2.5 py-1 rounded-full text-xs inline-block">
                            {formatFCFA(c.balance)}
                          </span>
                          <span className="block text-[10px] text-red-400 font-semibold mt-0.5">⚠️ Créance Active</span>
                        </div>
                      ) : (
                        <span className="bg-emerald-500/15 text-emerald-400 font-bold px-2.5 py-1 rounded-full text-xs flex items-center gap-1 justify-end ml-auto w-max">
                          <CheckCircle className="w-3 h-3" /> À jour (0 FCFA)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(`modal-client-details-${c.id}`)}
                          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors cursor-pointer"
                          title="Voir Fiche Détaillée & Relevé de Compte"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {c.balance > 0 && (
                          <button
                            onClick={() => openModal(`settle-debt-${c.id}`)}
                            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Encaisse le règlement de créance"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Régler
                          </button>
                        )}
                        <button
                          onClick={() => openModal(`edit-client-${c.id}`)}
                          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Modifier la fiche client"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Supprimer ce client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

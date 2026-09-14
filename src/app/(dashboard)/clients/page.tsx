"use client";

import React, { useState } from "react";
import { Plus, Search, Users, DollarSign, AlertCircle, CheckCircle, Edit, Trash2, Eye, Mail, MapPin, Phone, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, canCreate, canManage } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";

export default function ClientsPage() {
  const { clients, deleteClient, openModal, askConfirm, showToast, isLoading, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [debtFilter, setDebtFilter] = useState("all");
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

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = filteredClients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
            <span className="text-xs font-bold uppercase tracking-wider">Créances en Cours</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{formatFCFA(totalDebts)}</div>
          <span className="text-[11px] text-slate-400">{clientsWithDebtCount} clients avec solde débiteur</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Clients à Jour</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalClients - clientsWithDebtCount}</div>
          <span className="text-[11px] text-slate-400">Aucun paiement en retard</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Plafond Crédit Total</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{formatFCFA(totalCreditLimit)}</div>
          <span className="text-[11px] text-slate-400">Capacité de financement accordée</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#1e293b] border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, ville, email..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-[#0f172a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Toutes Catégories</option>
            <option value="Grossiste">Grossistes</option>
            <option value="Demi-grossiste">Demi-grossistes</option>
            <option value="Détaillant">Détaillants</option>
            <option value="Particulier">Particuliers</option>
          </select>

          <select
            value={debtFilter}
            onChange={e => { setDebtFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tous les Soldes</option>
            <option value="with_debt">Avec Créance Active</option>
            <option value="clean">Solde à Jour (0 F)</option>
          </select>
        </div>
      </div>

      {/* Table of Clients */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-900/60">
                <th className="py-3.5 px-4 font-semibold">Client / Partenaire</th>
                <th className="py-3.5 px-4 font-semibold">Catégorie</th>
                <th className="py-3.5 px-4 font-semibold">Contact</th>
                <th className="py-3.5 px-4 font-semibold">Localisation</th>
                <th className="py-3.5 px-4 font-semibold text-right">Plafond Crédit</th>
                <th className="py-3.5 px-4 font-semibold text-right">Cumul Achats</th>
                <th className="py-3.5 px-4 font-semibold text-right">Solde Créance</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedClients.map(c => {
                const limit = c.creditLimit || 10000000;
                const initials = c.name
                  .split(" ")
                  .map(n => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "CL";

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Client Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openModal(`modal-client-details-${c.id}`)}
                        className="flex items-center gap-3 text-left group-hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Consulter la fiche client et le relevé"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors text-sm">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {c.id}
                          </div>
                        </div>
                      </button>
                    </td>

                    {/* Catégorie */}
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-800 text-slate-300 border border-white/5 px-2.5 py-0.5 rounded-full text-xs font-medium inline-block">
                        {c.category}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                      <div>{c.phone}</div>
                      {c.email && <div className="text-[11px] text-slate-400 font-sans">{c.email}</div>}
                    </td>

                    {/* Localisation */}
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div className="font-medium text-slate-200">{c.city}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{c.address || "-"}</div>
                    </td>

                    {/* Plafond Crédit */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-blue-400 text-xs">
                      {formatFCFA(limit)}
                    </td>

                    {/* Cumul Achats */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200 text-sm">
                      {formatFCFA(c.totalPurchases)}
                    </td>

                    {/* Solde Créance */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      {c.balance > 0 ? (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold px-2.5 py-0.5 rounded-full text-xs inline-block">
                          {formatFCFA(c.balance)}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">À jour (0 F)</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(`modal-client-details-${c.id}`)}
                          className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/5 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          title="Fiche Détaillée & Relevé"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Fiche</span>
                        </button>

                        {c.balance > 0 && (
                          <button
                            onClick={() => openModal(`settle-debt-${c.id}`)}
                            className="bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            title="Encaisse le règlement de créance"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Régler</span>
                          </button>
                        )}

                        {canManage(currentUser, 'clients') && (
                          <div className="flex items-center pl-1 ml-1 border-l border-white/10 gap-0.5">
                            <button
                              onClick={() => openModal(`edit-client-${c.id}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                              title="Modifier la fiche"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id, c.name)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Supprimer ce client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          itemsPerPage={pageSize}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newSize: number) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemName="clients"
        />
      </div>
    </div>
  );
}

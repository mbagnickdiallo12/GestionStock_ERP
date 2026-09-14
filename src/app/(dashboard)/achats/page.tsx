"use client";

import React, { useState } from "react";
import { Plus, Search, Truck, Ship, FileText, CheckCircle2, Clock, AlertCircle, Trash2, Edit, Anchor, HelpCircle, FileSpreadsheet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber, canCreate, canManage } from "@/lib/utils";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";
import { Purchase } from "@/types";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

export default function AchatsPage() {
  const { purchases, updatePurchase, deletePurchase, openModal, askConfirm, showToast, isLoading, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showGuide, setShowGuide] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  const filteredPurchases = purchases.filter(p => {
    const matchSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.containers.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.blNumber && p.blNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchTab = true;
    if (statusTab === "transit") matchTab = p.status === "En Transit" || p.status === "Dédouanement";
    if (statusTab === "livre") matchTab = p.status === "Livré";
    if (statusTab === "commande") matchTab = p.status === "Commandé";

    const pDate = p.date.slice(0, 10);
    const matchStart = !startDate || pDate >= startDate;
    const matchEnd = !endDate || pDate <= endDate;

    return matchSearch && matchTab && matchStart && matchEnd;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    const tA = new Date(a.date || "").getTime() || 0;
    const tB = new Date(b.date || "").getTime() || 0;
    return tB - tA;
  });

  const totalPages = Math.ceil(sortedPurchases.length / itemsPerPage);
  const paginatedPurchases = sortedPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalBags = purchases.reduce((sum, p) => sum + p.bags, 0);
  const totalCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const transitCount = purchases.filter(p => p.status === "En Transit" || p.status === "Dédouanement").length;
  const deliveredCount = purchases.filter(p => p.status === "Livré").length;

  const handleDelete = (id: string) => {
    askConfirm({
      title: "Supprimer la Commande d'Achat ?",
      message: `Êtes-vous sûr de vouloir supprimer la commande d'arrivage ${id} ?`,
      confirmLabel: "Oui, Supprimer",
      onConfirm: () => deletePurchase(id),
    });
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,ID,Date,Fournisseur,Depot,Conteneurs,BL,Sacs,CoutTotal,Statut,Paiement\n";
    filteredPurchases.forEach(p => {
      csvContent += `"${p.id}","${p.date}","${p.supplier}","${p.depotName || p.depotId}","${p.containers}","${p.blNumber || ''}","${p.bags}","${p.totalCost}","${p.status}","${p.payment}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Achats_et_Arrivages_RizStock_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast("Exportation CSV des achats effectuée !", "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-500" /> Achats & Arrivages de Conteneurs
          </h1>
          <p className="text-sm text-slate-400 mt-1">Importations maritimes, gestion dynamique des statuts d'arrivage (Transit &rarr; Dédouanement &rarr; Livré) et bons de réception (BR).</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>

          {canCreate(currentUser, 'achats') && (
            <button 
              onClick={() => openModal("modal-add-purchase")}
              className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nouvel Arrivage Conteneur
            </button>
          )}
        </div>
      </div>

      {/* Educational Guide Box (Difference between Achats & Arrivages & How Statuses Work) */}
      {showGuide && (
        <div className="bg-gradient-to-r from-blue-950/60 via-[#1e293b] to-emerald-950/60 border border-blue-500/30 rounded-2xl p-5 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-blue-400 flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-blue-400" /> Comment sont gérés les Statuts d'Arrivage & de Règlement ?
            </span>
            <button 
              onClick={() => setShowGuide(false)}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Masquer le guide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#0f172a]/80 p-3.5 rounded-xl border border-white/10 space-y-1">
              <strong className="text-blue-400 flex items-center gap-1 font-bold text-xs">
                🚢 1. En Transit / Dédouanement
              </strong>
              <p className="text-slate-300 leading-relaxed">
                Le navire cargo est en mer ou les conteneurs sont en dédouanement portuaire. <em>Le stock entrepôt n'est pas encore incrémenté.</em>
              </p>
            </div>

            <div className="bg-[#0f172a]/80 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
              <strong className="text-emerald-400 flex items-center gap-1 font-bold text-xs">
                ✅ 2. Passage au Statut "LIVRÉ"
              </strong>
              <p className="text-slate-300 leading-relaxed">
                En sélectionnant <strong>"LIVRÉ"</strong> dans le menu déroulant du tableau, le stock physique du dépôt récepteur est <strong>automatiquement crédité (+N Sacs)</strong> !
              </p>
            </div>

            <div className="bg-[#0f172a]/80 p-3.5 rounded-xl border border-purple-500/30 space-y-1">
              <strong className="text-purple-300 flex items-center gap-1 font-bold text-xs">
                💳 3. Règlement Financier
              </strong>
              <p className="text-slate-300 leading-relaxed">
                Permet de suivre les acomptes fournisseurs (<strong>En attente</strong>, <strong>Acompte 50%</strong>, <strong>Payé</strong>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Volume Total Commandé</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatNumber(totalBags)} Sacs</div>
          <span className="text-[11px] text-slate-400">Cargaisons maritimes</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Valeur Totale Achats</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatFCFA(totalCost)}</div>
          <span className="text-[11px] text-slate-400">Investissement approvisionnement</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">En Transit / Dédouanement</span>
            <Ship className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{transitCount} Arrivages</div>
          <span className="text-[11px] text-slate-400">En mer ou au port</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Livrés & Dépotés</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{deliveredCount} Cargaisons</div>
          <span className="text-[11px] text-slate-400">Rentrées en stock entrepôt</span>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° commande, fournisseur, N° BL..."
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

          <div className="flex items-center bg-[#0f172a] p-1 rounded-xl border border-white/15">
            <button
              onClick={() => setStatusTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusTab === 'all' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setStatusTab("transit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusTab === 'transit' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              🚢 En Transit
            </button>
            <button
              onClick={() => setStatusTab("livre")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusTab === 'livre' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              ✅ Livrés
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-900/60">
                <th className="py-3.5 px-4 font-semibold">N° Commande</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Fournisseur Partenaire</th>
                <th className="py-3.5 px-4 font-semibold">Dépôt Récepteur</th>
                <th className="py-3.5 px-4 font-semibold">Conteneurs / N° BL</th>
                <th className="py-3.5 px-4 font-semibold text-right">Volume</th>
                <th className="py-3.5 px-4 font-semibold text-right">Coût Total</th>
                <th className="py-3.5 px-4 font-semibold text-center">Statut Arrivage & Paiement</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {paginatedPurchases.length > 0 ? (
                paginatedPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                    {/* Commande ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-md border border-white/5 whitespace-nowrap">
                        {p.id}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                      {p.date}
                    </td>

                    {/* Fournisseur */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="font-semibold text-slate-100 text-sm">
                          {p.supplier}
                        </span>
                      </div>
                    </td>

                    {/* Dépôt */}
                    <td className="py-3.5 px-4 text-slate-300 text-xs font-medium">
                      {p.depotName || p.depotId}
                    </td>

                    {/* Conteneurs / BL */}
                    <td className="py-3.5 px-4 text-xs font-mono">
                      <div className="text-slate-200 font-sans">{p.containers}</div>
                      {p.blNumber && <div className="text-[11px] text-amber-400/90 font-semibold">{p.blNumber}</div>}
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                      {formatNumber(p.bags)} <span className="text-xs font-normal text-slate-400">Sacs</span>
                    </td>

                    {/* Coût Total */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatFCFA(p.totalCost)}
                    </td>
                    
                    {/* Statuts */}
                    <td className="py-3.5 px-4">
                      {canManage(currentUser, 'achats') ? (
                        <div className="flex flex-col items-center gap-1.5 min-w-[170px]">
                          <select
                            value={p.status}
                            onChange={(e) => updatePurchase(p.id, { status: e.target.value as Purchase['status'] })}
                            className={`w-full text-xs font-semibold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition-all ${
                              p.status === 'Livré' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60' :
                              p.status === 'En Transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-500/60' :
                              p.status === 'Dédouanement' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500/60' :
                              'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:border-purple-500/60'
                            }`}
                            title="Changer le statut logistique de l'arrivage"
                          >
                            <option value="Commandé" className="bg-[#1e293b] text-white">📦 Commandé</option>
                            <option value="En Transit" className="bg-[#1e293b] text-blue-400">🚢 En Transit</option>
                            <option value="Dédouanement" className="bg-[#1e293b] text-amber-400">⚓ Dédouanement</option>
                            <option value="Livré" className="bg-[#1e293b] text-emerald-400">✅ Livré (Stock +)</option>
                          </select>

                          <select
                            value={p.payment}
                            onChange={(e) => updatePurchase(p.id, { payment: e.target.value as Purchase['payment'] })}
                            className="w-full text-[11px] font-medium bg-slate-900/80 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md outline-none cursor-pointer hover:border-white/20 transition-colors"
                            title="Changer le statut de paiement fournisseur"
                          >
                            <option value="En attente" className="bg-[#1e293b]">⏳ En attente</option>
                            <option value="Acompte 50%" className="bg-[#1e293b]">💵 Acompte 50%</option>
                            <option value="Payé" className="bg-[#1e293b]">💳 Payé 100%</option>
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-medium text-xs border ${
                            p.status === 'Livré' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {p.status}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{p.payment}</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => openModal(`reception-${p.id}`)}
                          className="bg-slate-800/80 hover:bg-emerald-600 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/5 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                          title="Imprimer Bon de Réception (BR)"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Bon BR</span>
                        </button>

                        {canManage(currentUser, 'achats') && (
                          <div className="flex items-center pl-1 ml-1 border-l border-white/10 gap-0.5">
                            <button 
                              onClick={() => openModal(`edit-purchase-${p.id}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                              title="Modifier la commande"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              title="Supprimer la commande"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    Aucun arrivage ou commande trouvé pour cette sélection.
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
          totalItems={sortedPurchases.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setCurrentPage(1);
          }}
          itemName="commandes d'achat"
        />
      </div>
    </div>
  );
}

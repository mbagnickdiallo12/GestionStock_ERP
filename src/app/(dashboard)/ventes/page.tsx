"use client";

import React, { useState } from "react";
import { 
  Plus, Search, FileText, CheckCircle2, Clock, Truck, 
  Building2, Ban, TrendingUp, X, Banknote,
  Smartphone, Building, Sparkles, Edit3, Gift
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber, canManage, getUserAssignedDepot, isMatchingDepot } from "@/lib/utils";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";
import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

// Client avatar color generator based on name hash
function getAvatarColor(name: string) {
  const colors = [
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "bg-rose-500/20 text-rose-400 border-rose-500/30"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Payment method helper
function getPaymentInfo(mode: string) {
  const m = (mode || "").toLowerCase();
  if (m.includes("cadeau") || m.includes("offert") || m.includes("don")) {
    return { label: "Cadeau / Offert", icon: Gift, color: "text-purple-400" };
  }
  if (m.includes("wave") || m.includes("mobile") || m.includes("om")) {
    return { label: "Wave / Mobile", icon: Smartphone, color: "text-cyan-400" };
  }
  if (m.includes("vir") || m.includes("banq") || m.includes("cheq")) {
    return { label: "Virement", icon: Building, color: "text-blue-400" };
  }
  if (m.includes("cred") || m.includes("terme")) {
    return { label: "À Crédit", icon: Clock, color: "text-amber-400" };
  }
  return { label: "Espèces", icon: Banknote, color: "text-emerald-400" };
}

export default function VentesPage() {
  const { sales, depots, openModal, isLoading, movements, cancelSale, askConfirm, currentUser, clients } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const userRestricted = getUserAssignedDepot(currentUser, depots);

  const handleCancelSale = (sale: (typeof sales)[0]) => {
    const depotObj = depots.find(d => isMatchingDepot(d.id, sale.depotId, depots));
    askConfirm({
      title: `Annuler la Vente ${sale.id} ?`,
      message: `Êtes-vous sûr de vouloir annuler la facture ${sale.id} d'un montant de ${formatFCFA(sale.totalAmount)} pour ${sale.clientName || 'le client'} ?\n\nTous les sacs de riz vendus seront immédiatement réintégrés dans le stock du dépôt "${depotObj?.name || 'Dépôt'}".`,
      confirmLabel: "Confirmer l'Annulation & Réintégrer Stock",
      onConfirm: () => cancelSale(sale.id, "Annulation demandée par l'utilisateur")
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonTable rows={6} cols={5} />
      </div>
    );
  }

  const filteredSales = sales.filter(s => {
    const matchSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.items.some(i => i.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchPayment = paymentFilter === "all" || s.paymentMode.toLowerCase() === paymentFilter.toLowerCase();
    const matchStatus = statusFilter === "all" || 
                        (statusFilter === "paye" && (s.status === "Payé" || !s.status)) ||
                        (statusFilter === "attente" && s.status === "En attente") ||
                        (statusFilter === "annule" && s.status === "Annulé");
    const matchDepot = !userRestricted || isMatchingDepot(s.depotId, userRestricted.id, depots);

    const saleDate = s.date.slice(0, 10);
    const matchStart = !startDate || saleDate >= startDate;
    const matchEnd = !endDate || saleDate <= endDate;

    return matchSearch && matchPayment && matchStatus && matchDepot && matchStart && matchEnd;
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    const tA = new Date(a.date || "").getTime() || 0;
    const tB = new Date(b.date || "").getTime() || 0;
    return tB - tA;
  });

  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = sortedSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalSalesAmount = filteredSales.reduce((sum, s) => s.status === 'Annulé' ? sum : sum + (s.totalAmount || 0), 0);
  const totalBagsSold = filteredSales.reduce((sum, s) => s.status === 'Annulé' ? sum : sum + (s.items?.reduce((isum, it) => isum + it.qty, 0) || 0), 0);
  const averageBasket = filteredSales.length > 0 ? Math.round(totalSalesAmount / Math.max(1, filteredSales.filter(s => s.status !== 'Annulé').length)) : 0;

  const activeFiltersCount = (searchTerm ? 1 : 0) + (paymentFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (preset !== "all" ? 1 : 0);

  const handleResetFilters = () => {
    setSearchTerm("");
    setPaymentFilter("all");
    setStatusFilter("all");
    setPreset("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-5 w-full min-w-0 max-w-full pb-10">
      
      {/* 🌟 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1e293b] via-[#1e293b]/90 to-[#0f172a] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Historique des Ventes</h1>
          </div>
          <p className="text-xs text-slate-400">
            Consultation des factures, réimpression et gestion des encaissements en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button 
            onClick={() => openModal("modal-pos")}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Vente</span>
          </button>
        </div>
      </div>

      {/* 📊 2. Essential KPI Summary Cards (Compact & Crisp) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1 : Chiffre d'Affaires */}
        <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono truncate">
              {formatFCFA(totalSalesAmount)}
            </div>
            <span className="text-[10px] text-slate-400">{filteredSales.filter(s => s.status !== 'Annulé').length} factures payées</span>
          </div>
        </div>

        {/* Metric 2 : Volume Sorti */}
        <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume Sorti</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-amber-400 font-mono truncate">
              {formatNumber(totalBagsSold)} <span className="text-xs font-semibold text-slate-400">Sacs</span>
            </div>
            <span className="text-[10px] text-slate-400">Total riz livré</span>
          </div>
        </div>

        {/* Metric 3 : Total Factures */}
        <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transactions</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-white truncate">
              {filteredSales.length} <span className="text-xs font-semibold text-slate-400">ventes</span>
            </div>
            <span className="text-[10px] text-slate-400">{filteredSales.filter(s => s.status === 'Annulé').length} annulée(s)</span>
          </div>
        </div>

        {/* Metric 4 : Panier Moyen */}
        <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Panier Moyen</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-purple-300 font-mono truncate">
              {formatFCFA(averageBasket)}
            </div>
            <span className="text-[10px] text-slate-400">Par commande</span>
          </div>
        </div>

      </div>

      {/* 🔍 3. Filter Toolbar (Fully Responsive, Zero Overflow) */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl p-3 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* Search Box */}
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/10 focus-within:border-emerald-500/50 px-3 py-2 rounded-xl flex-1 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par N° facture, client, variété de riz..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-white placeholder-slate-500 text-xs outline-none w-full"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Period Filter */}
          <DatePeriodFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
              setCurrentPage(1);
            }}
            preset={preset}
            onPresetChange={(newPreset) => {
              setPreset(newPreset);
              setCurrentPage(1);
            }}
          />

          {/* Payment Mode */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0f172a] border border-white/10 text-slate-200 text-xs font-semibold px-2.5 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous Paiements</option>
            <option value="espece">💵 Espèces</option>
            <option value="wave">📱 Wave / Mobile</option>
            <option value="virement">🏦 Virement</option>
            <option value="cheque">📜 Chèque</option>
            <option value="credit">⏳ À Crédit</option>
            <option value="cadeau">🎁 Cadeau / Offert</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0f172a] border border-white/10 text-slate-200 text-xs font-semibold px-2.5 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous Statuts</option>
            <option value="paye">✅ Payé</option>
            <option value="attente">⏳ En attente</option>
            <option value="annule">🚫 Annulé</option>
          </select>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Réinitialiser les filtres"
            >
              <X className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          )}

        </div>
      </div>

      {/* 📋 4. Clean 5-Column High-Clarity Sales Table */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table summary bar */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{filteredSales.length} transaction(s)</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-mono font-semibold">{formatFCFA(totalSalesAmount)}</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Cliquez sur Facture ou Bon BL pour imprimer</span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold tracking-wider uppercase text-slate-400 bg-slate-900/80">
                <th className="py-3 px-4 font-bold">Facture / Date</th>
                <th className="py-3 px-4 font-bold">Client & Dépôt</th>
                <th className="py-3 px-4 font-bold">Marchandises</th>
                <th className="py-3 px-4 font-bold text-right">Montant & Paiement</th>
                <th className="py-3 px-4 font-bold text-right">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {paginatedSales.length > 0 ? (
                paginatedSales.map(s => {
                  const displayItems = s.items && s.items.length > 0 ? s.items : (() => {
                    const matchedMvt = movements.find(m => m.dest && m.dest.includes(s.id));
                    if (matchedMvt) {
                      return [{ productId: 'mvt', title: matchedMvt.prodTitle, qty: matchedMvt.qty, price: 0 }];
                    }
                    return [];
                  })();

                  const depot = depots.find(d => d.id === s.depotId);
                  const matchedClient = clients.find(c => c.name.toLowerCase() === (s.clientName || "").toLowerCase());
                  const totalSaleBags = displayItems.reduce((acc, it) => acc + (it.qty || 0), 0);
                  
                  const rawClientName = s.clientName || "Client Comptoir";
                  const clientDisplayName = rawClientName.charAt(0).toUpperCase() + rawClientName.slice(1);
                  const clientInitials = clientDisplayName
                    .split(" ")
                    .filter(Boolean)
                    .map(n => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "CL";
                  
                  const clientAvatarClass = getAvatarColor(clientDisplayName);
                  const paymentInfo = getPaymentInfo(s.paymentMode);
                  const isCancelled = s.status === 'Annulé';

                  return (
                    <tr 
                      key={s.id} 
                      className={`group transition-colors ${
                        isCancelled 
                          ? "bg-red-950/10 hover:bg-red-950/20 opacity-75" 
                          : "hover:bg-slate-800/60"
                      }`}
                    >
                      {/* 1. Facture & Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => openModal(`invoice-${s.id}`)}
                            className="font-mono text-xs font-black text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer text-left"
                            title="Aperçu Facture"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{s.id}</span>
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono pl-5">
                            {s.date ? s.date.slice(0, 10) : "2026-09-24"} {s.date && s.date.length > 10 ? s.date.slice(11, 16) : ""}
                          </span>
                        </div>
                      </td>

                      {/* 2. Client & Dépôt */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-[10px] shrink-0 ${clientAvatarClass}`}>
                            {clientInitials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-100 text-xs block truncate max-w-[180px]">
                              {clientDisplayName}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[180px]">
                              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{depot ? depot.name : "Dépôt Principal"}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Marchandises */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-black px-2 py-0.5 rounded shrink-0">
                            {totalSaleBags} {totalSaleBags > 1 ? "sacs" : "sac"}
                          </span>

                          {displayItems.length === 1 ? (
                            <span className="text-xs text-slate-200 truncate max-w-[160px]" title={displayItems[0].title}>
                              {displayItems[0].title}
                            </span>
                          ) : displayItems.length > 1 ? (
                            <div className="flex items-center gap-1 max-w-[180px]">
                              <span className="text-xs text-slate-200 truncate" title={displayItems.map(i => `${i.qty}x ${i.title}`).join(", ")}>
                                {displayItems[0].title}
                              </span>
                              <span 
                                className="bg-slate-800 text-slate-300 border border-white/10 text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 cursor-help"
                                title={displayItems.map(i => `• ${i.qty} sacs ${i.title}`).join("\n")}
                              >
                                +{displayItems.length - 1}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">Riz Brisé</span>
                          )}
                        </div>
                      </td>

                      {/* 4. Montant & Statut */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`font-mono font-black text-xs sm:text-sm ${isCancelled ? 'line-through text-slate-500' : 'text-emerald-400'}`}>
                            {formatFCFA(s.totalAmount)}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            {isCancelled ? (
                              <span className="text-red-400 font-bold">Annulé</span>
                            ) : (
                              <>
                                <span className={paymentInfo.color}>{paymentInfo.label}</span>
                                <span className="text-slate-500">&bull;</span>
                                <span className={s.status === 'En attente' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                  {s.status || 'Payé'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 5. Actions Rapides */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Facture button */}
                          <button 
                            onClick={() => openModal(`invoice-${s.id}`)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
                            title="Imprimer Facture (2 exemplaires)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Facture</span>
                          </button>

                          {/* Bon BL button */}
                          <button 
                            onClick={() => openModal(`bl-${s.id}`)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/10 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                            title="Imprimer Bon de Livraison BL"
                          >
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span>BL</span>
                          </button>

                          {/* Modifier button */}
                          {!isCancelled && canManage(currentUser) && (
                            <button 
                              onClick={() => openModal(`edit-sale-${s.id}`)}
                              className="bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold border border-white/10 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                              title="Modifier la facture (articles, prix, date, client, chauffeur)"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Modifier</span>
                            </button>
                          )}

                          {/* Cancel button */}
                          {!isCancelled && canManage(currentUser) && (
                            <button 
                              onClick={() => handleCancelSale(s)}
                              className="bg-slate-800/80 hover:bg-red-600 text-slate-400 hover:text-white p-1 rounded-lg text-xs border border-white/10 hover:border-red-500/40 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                              title="Annuler la vente et réintégrer le stock"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="font-bold text-sm text-slate-300">Aucune transaction trouvée</p>
                    <p className="text-xs text-slate-500 mt-1">Modifiez vos filtres ou effectuez une nouvelle vente.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredSales.length > 0 && (
          <div className="px-4 py-2 border-t border-white/10 bg-slate-900/60">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredSales.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemName="ventes"
            />
          </div>
        )}

      </div>

    </div>
  );
}

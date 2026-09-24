"use client";

import React, { useState } from "react";
import { 
  Plus, Search, FileText, CheckCircle2, Clock, Truck, 
  SlidersHorizontal, Check, Building2, User, Ban, 
  TrendingUp, ArrowUpRight, Sparkles, X, Banknote,
  Smartphone, Building, Calendar, ChevronRight, Eye, ShieldAlert,
  Printer
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

// Payment method badge helper
function getPaymentBadge(mode: string) {
  const m = (mode || "").toLowerCase();
  if (m.includes("wave") || m.includes("mobile") || m.includes("om")) {
    return {
      label: "Wave / Mobile",
      icon: Smartphone,
      className: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
    };
  }
  if (m.includes("vir") || m.includes("banq") || m.includes("cheq")) {
    return {
      label: "Virement / Chq",
      icon: Building,
      className: "bg-blue-500/10 text-blue-300 border-blue-500/20"
    };
  }
  if (m.includes("cred") || m.includes("terme")) {
    return {
      label: "À Crédit",
      icon: Clock,
      className: "bg-amber-500/10 text-amber-300 border-amber-500/20"
    };
  }
  return {
    label: "Espèces",
    icon: Banknote,
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
  };
}

export default function VentesPage() {
  const { sales, depots, openModal, isLoading, movements, cancelSale, askConfirm, currentUser, clients } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const userRestricted = getUserAssignedDepot(currentUser, depots);

  // Column visibility settings (clean defaults)
  const [visibleCols, setVisibleCols] = useState({
    date: true,
    depot: true,
    paiement: true,
    statut: true,
  });

  const toggleCol = (colKey: keyof typeof visibleCols) => {
    setVisibleCols(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonTable rows={6} cols={6} />
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* 🌟 1. Top Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1e293b]/90 via-[#1e293b]/70 to-[#0f172a]/90 p-6 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow Accent background */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">Historique des Ventes & Facturation</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Registre complet des transactions, édition instantanée des factures et bons de livraison (BL) 2-en-1, contrôle des encaissements et traçabilité.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button 
            onClick={() => openModal("modal-pos")}
            className="group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/60 transition-all duration-200 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>Nouvelle Vente (POS)</span>
          </button>
        </div>
      </div>

      {/* 📊 2. Ultra-Polished Google Material Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 : Total Factures */}
        <div className="relative group bg-[#1e293b]/80 hover:bg-[#1e293b] border border-white/10 hover:border-blue-500/40 rounded-2xl p-4.5 transition-all duration-300 shadow-lg shadow-black/10 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre de Factures</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {filteredSales.length} <span className="text-sm font-semibold text-slate-400">ventes</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>{filteredSales.filter(s => s.status !== 'Annulé').length} actives &bull; {filteredSales.filter(s => s.status === 'Annulé').length} annulées</span>
            </div>
          </div>
        </div>

        {/* Metric 2 : Chiffre d'Affaires */}
        <div className="relative group bg-[#1e293b]/80 hover:bg-[#1e293b] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-4.5 transition-all duration-300 shadow-lg shadow-black/10 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
              {formatFCFA(totalSalesAmount)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Période sélectionnée</span>
            </div>
          </div>
        </div>

        {/* Metric 3 : Volume Sacs */}
        <div className="relative group bg-[#1e293b]/80 hover:bg-[#1e293b] border border-white/10 hover:border-amber-500/40 rounded-2xl p-4.5 transition-all duration-300 shadow-lg shadow-black/10 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Total Sorti</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Truck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight font-mono">
              {formatNumber(totalBagsSold)} <span className="text-sm font-semibold text-slate-400">Sacs</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Marchandises livrées</span>
            </div>
          </div>
        </div>

        {/* Metric 4 : Panier Moyen */}
        <div className="relative group bg-[#1e293b]/80 hover:bg-[#1e293b] border border-white/10 hover:border-purple-500/40 rounded-2xl p-4.5 transition-all duration-300 shadow-lg shadow-black/10 flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Panier Moyen</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight font-mono">
              {formatFCFA(averageBasket)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Moyenne par commande</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 3. Google Command-Style Filter Toolbar */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl p-3.5 shadow-lg backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Left: Instant Search Box */}
        <div className="flex items-center gap-2.5 bg-[#0f172a] border border-white/10 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 px-3.5 py-2 rounded-xl flex-1 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par N° facture (ex: FC2026...), nom de client, variété de riz..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent text-white placeholder-slate-500 text-xs sm:text-sm outline-none w-full"
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

        {/* Right Filters & Quick Selects */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Period Filter Component */}
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

          {/* Payment Mode Dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0f172a] border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer transition-all"
          >
            <option value="all">Tous Paiements</option>
            <option value="espece">💵 Espèces</option>
            <option value="wave">📱 Wave / Mobile</option>
            <option value="virement">🏦 Virement</option>
            <option value="credit">⏳ À Crédit</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0f172a] border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer transition-all"
          >
            <option value="all">Tous Statuts</option>
            <option value="paye">✅ Payé</option>
            <option value="attente">⏳ En attente</option>
            <option value="annule">🚫 Annulé</option>
          </select>

          {/* Reset Filters button if any active */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Réinitialiser tous les filtres"
            >
              <X className="w-3.5 h-3.5" />
              <span>Effacer ({activeFiltersCount})</span>
            </button>
          )}

          {/* Column Toggle Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="bg-[#0f172a] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Colonnes</span>
            </button>

            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl p-2 z-30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block border-b border-white/10">Colonnes visibles :</span>
                
                <button
                  onClick={() => toggleCol('date')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Date & Heure</span>
                  {visibleCols.date && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => toggleCol('depot')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Dépôt Expéditeur</span>
                  {visibleCols.depot && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => toggleCol('paiement')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Mode Paiement</span>
                  {visibleCols.paiement && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={() => toggleCol('statut')}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <span>Statut Vente</span>
                  {visibleCols.statut && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📋 4. Top-Tier Google Data Table */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Table Header Action Bar */}
        <div className="px-5 py-3 border-b border-white/10 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{filteredSales.length} transaction(s)</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-mono font-semibold">{formatFCFA(totalSalesAmount)}</span>
          </div>
          <span className="text-[11px] text-slate-400">Cliquez sur une ligne ou sur les boutons pour afficher la facture & BL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold tracking-wider uppercase text-slate-400 bg-slate-900/80 select-none">
                <th className="py-3.5 px-4 font-bold">N° Facture</th>
                {visibleCols.date && <th className="py-3.5 px-4 font-bold">Date & Heure</th>}
                <th className="py-3.5 px-4 font-bold">Client / Acheteur</th>
                <th className="py-3.5 px-4 font-bold">Marchandises</th>
                {visibleCols.depot && <th className="py-3.5 px-4 font-bold">Dépôt Expéditeur</th>}
                <th className="py-3.5 px-4 font-bold text-right">Montant TTC</th>
                {visibleCols.paiement && <th className="py-3.5 px-4 font-bold text-center">Paiement</th>}
                {visibleCols.statut && <th className="py-3.5 px-4 font-bold text-center">Statut</th>}
                <th className="py-3.5 px-4 text-right font-bold">Documents & Actions</th>
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
                  
                  // Clean Client Display
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
                  const paymentBadge = getPaymentBadge(s.paymentMode);
                  const PaymentIcon = paymentBadge.icon;

                  const isCancelled = s.status === 'Annulé';

                  return (
                    <tr 
                      key={s.id} 
                      className={`group transition-all duration-150 ${
                        isCancelled 
                          ? "bg-red-950/10 hover:bg-red-950/20 opacity-75" 
                          : "hover:bg-slate-800/60"
                      }`}
                    >
                      {/* 1. Facture Reference ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => openModal(`invoice-${s.id}`)}
                          className="font-mono text-xs font-extrabold text-emerald-400 group-hover:text-emerald-300 bg-slate-900/90 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-lg border border-emerald-500/20 hover:border-emerald-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          title="Aperçu & Impression de la Facture"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors" />
                          <span>{s.id}</span>
                        </button>
                      </td>

                      {/* 2. Date & Heure */}
                      {visibleCols.date && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-200 font-mono">
                              {s.date ? s.date.slice(0, 10) : "2026-09-24"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {s.date && s.date.length > 10 ? s.date.slice(11, 16) : "18:27"}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* 3. Client with Avatar Initials */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] shrink-0 ${clientAvatarClass}`}>
                            {clientInitials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 text-xs block group-hover:text-white">
                              {clientDisplayName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {matchedClient?.phone || "Vente Comptoir"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Articles Vendus (Compact, Single-Line with Tooltip Pill) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-black px-2 py-0.5 rounded-md shrink-0">
                            {totalSaleBags} {totalSaleBags > 1 ? "sacs" : "sac"}
                          </span>

                          {displayItems.length === 1 ? (
                            <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]" title={displayItems[0].title}>
                              {displayItems[0].title}
                            </span>
                          ) : displayItems.length > 1 ? (
                            <div className="flex items-center gap-1 max-w-[220px]">
                              <span className="text-xs font-semibold text-slate-200 truncate" title={displayItems.map(i => `${i.qty}x ${i.title}`).join(", ")}>
                                {displayItems[0].title}
                              </span>
                              <span 
                                className="bg-slate-800 text-slate-300 border border-white/10 text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 cursor-help"
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

                      {/* 5. Dépôt */}
                      {visibleCols.depot && (
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 font-medium bg-slate-900/60 border border-white/10 px-2.5 py-1 rounded-lg">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[140px]">{depot ? depot.name : s.depotId}</span>
                          </span>
                        </td>
                      )}

                      {/* 6. Montant Total */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className={`font-mono font-black text-sm ${isCancelled ? 'line-through text-slate-500' : 'text-emerald-400'}`}>
                            {formatFCFA(s.totalAmount)}
                          </span>
                          {s.paymentMode === 'Credit' && !isCancelled && (
                            <span className="text-[9.5px] text-amber-400 font-semibold font-mono">À recouvrer</span>
                          )}
                        </div>
                      </td>

                      {/* 7. Mode Paiement */}
                      {visibleCols.paiement && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentBadge.className}`}>
                            <PaymentIcon className="w-3 h-3" />
                            <span>{paymentBadge.label}</span>
                          </span>
                        </td>
                      )}

                      {/* 8. Statut */}
                      {visibleCols.statut && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {isCancelled ? (
                            <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              <Ban className="w-3 h-3" /> Annulé
                            </span>
                          ) : s.status === 'Payé' || !s.status ? (
                            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Payé
                            </span>
                          ) : (
                            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> En attente
                            </span>
                          )}
                        </td>
                      )}

                      {/* 9. Actions & Documents */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          
                          {/* Facture Action (2x Facture on 1 sheet) */}
                          <button 
                            onClick={() => openModal(`invoice-${s.id}`)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-emerald-900/50 transition-all active:scale-95"
                            title="Imprimer la Facture (Double Facture sur 1 Feuille A4)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Facture</span>
                          </button>

                          {/* Bon de Livraison Action (2x BL on 1 sheet) */}
                          <button 
                            onClick={() => openModal(`bl-${s.id}`)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
                            title="Imprimer le Bon de Livraison (BL)"
                          >
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Bon BL</span>
                          </button>

                          {/* Annuler button */}
                          {!isCancelled && canManage(currentUser) && (
                            <button 
                              onClick={() => handleCancelSale(s)}
                              className="bg-slate-800/80 hover:bg-red-600/90 text-slate-400 hover:text-white p-1.5 rounded-xl text-xs font-semibold border border-white/10 hover:border-red-500/40 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                              title="Annuler cette vente et réintégrer le stock au dépôt"
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
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-slate-400">
                        <Search className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="text-slate-300 font-bold text-sm">Aucune vente trouvée</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Aucune transaction ne correspond à vos critères de recherche ou période sélectionnée.
                      </p>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={handleResetFilters}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Réinitialiser les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Numbered Pagination with Clean Footer */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedSales.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setCurrentPage(1);
          }}
          itemName="factures de vente"
        />
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { Plus, Search, FileText, CheckCircle, Clock, Truck, SlidersHorizontal, Check, Building2, User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

export default function VentesPage() {
  const { sales, depots, openModal, isLoading, movements } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

    const saleDate = s.date.slice(0, 10);
    const matchStart = !startDate || saleDate >= startDate;
    const matchEnd = !endDate || saleDate <= endDate;

    return matchSearch && matchPayment && matchStart && matchEnd;
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    const tA = new Date(a.date || "").getTime() || 0;
    const tB = new Date(b.date || "").getTime() || 0;
    return tB - tA;
  });

  const totalPages = Math.ceil(sortedSales.length / itemsPerPage);
  const paginatedSales = sortedSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalBagsSold = filteredSales.reduce((sum, s) => sum + (s.items?.reduce((isum, it) => isum + it.qty, 0) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Historique des Ventes & Facturation</h1>
          <p className="text-sm text-slate-400 mt-1">Recherche de factures, édition de bons de livraison (BL) et suivi des encaissements.</p>
        </div>
        <button 
          onClick={() => openModal("modal-pos")}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nouvelle Vente (POS)
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Nombre de Factures</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{filteredSales.length} Ventes</div>
          <span className="text-[11px] text-slate-400">Période sélectionnée</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Chiffre d'Affaires</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatFCFA(totalSalesAmount)}</div>
          <span className="text-[11px] text-slate-400">Total facturé</span>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Volume Total Sorti</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{formatNumber(totalBagsSold)} Sacs</div>
          <span className="text-[11px] text-slate-400">Quantité livrée</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° facture, client, riz..."
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
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous les Modes</option>
            <option value="espece">Espèces</option>
            <option value="wave">Wave / Mobile</option>
            <option value="virement">Virement</option>
            <option value="credit">À Crédit</option>
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
              <div className="absolute right-0 mt-2 w-48 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl p-2 z-20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">Colonnes visibles :</span>
                
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
                  <span>Statut</span>
                  {visibleCols.statut && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-[#1e293b]/90 border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-900/60">
                <th className="py-3.5 px-4 font-semibold">Facture</th>
                {visibleCols.date && <th className="py-3.5 px-4 font-semibold">Date & Heure</th>}
                <th className="py-3.5 px-4 font-semibold">Client</th>
                <th className="py-3.5 px-4 font-semibold">Articles Vendu(s)</th>
                {visibleCols.depot && <th className="py-3.5 px-4 font-semibold">Dépôt</th>}
                <th className="py-3.5 px-4 font-semibold text-right">Montant Total</th>
                {visibleCols.paiement && <th className="py-3.5 px-4 font-semibold text-center">Paiement</th>}
                {visibleCols.statut && <th className="py-3.5 px-4 font-semibold text-center">Statut</th>}
                <th className="py-3.5 px-4 text-right font-semibold">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
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
                  
                  // Format Clean Client Name
                  const clientDisplayName = s.clientName 
                    ? s.clientName.charAt(0).toUpperCase() + s.clientName.slice(1)
                    : "Client Comptoir";

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Facture ID */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => openModal(`invoice-${s.id}`)}
                          className="font-mono text-xs font-bold text-slate-100 bg-slate-900/90 hover:bg-emerald-600 hover:text-white px-2.5 py-1 rounded-md border border-white/10 whitespace-nowrap transition-colors cursor-pointer block w-max"
                          title="Ouvrir la Facture"
                        >
                          {s.id}
                        </button>
                      </td>

                      {/* Date & Heure */}
                      {visibleCols.date && (
                        <td className="py-3.5 px-4 text-slate-300 text-xs font-mono whitespace-nowrap">
                          {s.date}
                        </td>
                      )}

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-100 text-sm block">
                          {clientDisplayName}
                        </span>
                      </td>

                      {/* Articles Vendu(s) */}
                      <td className="py-3.5 px-4">
                        {displayItems.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                            {displayItems.map((item, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md"
                              >
                                <span className="font-bold font-mono text-[11px] text-emerald-400">
                                  {item.qty} sacs
                                </span>
                                <span className="text-slate-200 font-semibold">{item.title}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Marchandise Riz</span>
                        )}
                      </td>

                      {/* Dépôt */}
                      {visibleCols.depot && (
                        <td className="py-3.5 px-4 text-slate-300 text-xs font-medium whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {depot ? depot.name : s.depotId}
                          </span>
                        </td>
                      )}

                      {/* Montant Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                        {formatFCFA(s.totalAmount)}
                      </td>

                      {/* Mode Paiement */}
                      {visibleCols.paiement && (
                        <td className="py-3.5 px-4 text-center">
                          <span className="bg-slate-800 text-slate-300 border border-white/10 px-2.5 py-0.5 rounded-full text-xs font-medium inline-block">
                            {s.paymentMode}
                          </span>
                        </td>
                      )}

                      {/* Statut */}
                      {visibleCols.statut && (
                        <td className="py-3.5 px-4 text-center">
                          {s.status === 'Payé' ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Payé
                            </span>
                          ) : (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> En attente
                            </span>
                          )}
                        </td>
                      )}

                      {/* Actions Documents */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openModal(`invoice-${s.id}`)}
                            className="bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                            title="Imprimer la Facture A4"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Facture</span>
                          </button>
                          <button 
                            onClick={() => openModal(`bl-${s.id}`)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                            title="Imprimer le Bon de Livraison (BL)"
                          >
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Bon BL</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    Aucune vente enregistrée pour cette sélection.
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


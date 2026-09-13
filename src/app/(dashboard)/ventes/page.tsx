"use client";

import React, { useState } from "react";
import { Plus, Search, FileText, CheckCircle, Clock, Truck } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

export default function VentesPage() {
  const { sales, depots, openModal, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Historique des Ventes & Facturation</h1>
          <p className="text-sm text-slate-400 mt-1">Recherche de factures, édition de bons de livraison (BL) et suivi des paiements au comptoir.</p>
        </div>
        <button 
          onClick={() => openModal("modal-pos")}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nouvelle Vente (POS)
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° facture (FAC-2026-0089), client, variété..."
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
            <option value="all">Tous les Modes de Paiement</option>
            <option value="espece">Espèces</option>
            <option value="wave">Wave / Mobile</option>
            <option value="virement">Virement Bancaire</option>
            <option value="credit">Vente à Crédit</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">N° Facture</th>
                <th className="p-3">Date</th>
                <th className="p-3">Client</th>
                <th className="p-3">Dépôt Expéditeur</th>
                <th className="p-3 text-right">Volume (Sacs)</th>
                <th className="p-3 text-right">Montant Total</th>
                <th className="p-3">Paiement</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Imprimer Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedSales.length > 0 ? (
                paginatedSales.map(s => {
                  const totalBags = s.items.reduce((sum, i) => sum + i.qty, 0);
                  const depot = depots.find(d => d.id === s.depotId);

                  return (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{s.id}</td>
                      <td className="p-3 text-slate-400">{s.date}</td>
                      <td className="p-3 font-semibold text-white">{s.clientName}</td>
                      <td className="p-3 text-slate-300">{depot ? depot.name : s.depotId}</td>
                      <td className="p-3 text-right text-slate-300 font-bold">{formatNumber(totalBags)} Sacs</td>
                      <td className="p-3 text-right font-black text-emerald-400">{formatFCFA(s.totalAmount)}</td>
                      <td className="p-3"><span className="bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">{s.paymentMode}</span></td>
                      <td className="p-3">
                        {s.status === 'Payé' ? (
                          <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> Payé</span>
                        ) : (
                          <span className="bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> En attente</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openModal(`invoice-${s.id}`)}
                            className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Imprimer la Facture de Vente"
                          >
                            <FileText className="w-3.5 h-3.5" /> Facture
                          </button>
                          <button 
                            onClick={() => openModal(`bl-${s.id}`)}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Imprimer le Bon de Livraison (BL)"
                          >
                            <Truck className="w-3.5 h-3.5" /> Bon BL
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
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

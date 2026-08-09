"use client";

import React from "react";
import { Boxes, DollarSign, TrendingUp, Receipt, ArrowUpRight, Plus, FileSpreadsheet } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { formatNumber, formatFCFA } from "@/lib/utils";

import { SkeletonStatCard, SkeletonChart, SkeletonTable } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const { sales, depots, stocks, products, expenses, activeDepotId, showToast, openModal, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonChart />
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }

  let filteredSales = activeDepotId === "all" ? sales : sales.filter(s => s.depotId === activeDepotId);

  // Total Bags & Valuation
  let totalBags = 0;
  let stockValue = 0;
  Object.keys(stocks).forEach(depId => {
    if (activeDepotId === "all" || activeDepotId === depId) {
      Object.keys(stocks[depId]).forEach(prodId => {
        const qty = stocks[depId][prodId] || 0;
        totalBags += qty;
        const prod = products.find(p => p.id === prodId);
        if (prod) {
          stockValue += qty * prod.buyPrice;
        }
      });
    }
  });

  // Sales Today
  const salesTodayVal = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const bagsTodayVal = filteredSales.reduce((acc, s) => acc + s.items.reduce((a, b) => a + b.qty, 0), 0);

  // Monthly Expenses
  const expMonthVal = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tableau de Bord Exécutif</h1>
          <p className="text-sm text-slate-400 mt-1">Supervision globale des stocks de riz, ventes en direct et trésorerie multi-dépôts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast("Exportation du rapport exécutif CSV...", "success")}
            className="bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-sm px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exporter Résumé
          </button>
          <button
            onClick={() => openModal("modal-add-mvt")}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nv Mouvement Stock
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Sacs</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatNumber(totalBags)} Sacs</div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% vs mois dernier
          </div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valeur Stock FCFA</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatNumber(stockValue)} F</div>
          <div className="text-xs text-slate-400">Basé sur le prix d'achat moyen</div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatNumber(salesTodayVal)} F</div>
          <div className="text-xs text-slate-400">{formatNumber(bagsTodayVal)} sacs vendus (Période)</div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dépenses Opérationnelles</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatNumber(expMonthVal)} F</div>
          <div className="text-xs text-amber-400 font-semibold">Manutention, Transport & Loyer</div>
        </div>
      </div>

      {/* Chart Graphs Section */}
      <DashboardCharts />

      {/* Recent Sales Table */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg text-white">Dernières Factures Émises</h3>
          <span className="text-xs text-slate-400">Accès direct aux réimpressions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">N° Facture</th>
                <th className="p-3">Date</th>
                <th className="p-3">Client</th>
                <th className="p-3">Mode Paiement</th>
                <th className="p-3">Montant Total</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSales.slice(0, 5).map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-white">{s.id}</td>
                  <td className="p-3 text-slate-300">{s.date}</td>
                  <td className="p-3 text-slate-300">{s.clientName}</td>
                  <td className="p-3"><span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded text-xs font-bold">{s.paymentMode}</span></td>
                  <td className="p-3 font-bold text-emerald-400">{formatFCFA(s.totalAmount)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openModal(`invoice-${s.id}`)}
                      className="bg-slate-700/50 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-medium cursor-pointer"
                    >
                      Reçu / Imprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Printer, TrendingUp, Coins, BarChart3, Vault, FileSpreadsheet, Building2, Package, ArrowUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { DatePeriodFilter } from "@/components/ui/DatePeriodFilter";

import { SkeletonTable, SkeletonStatCard, SkeletonChart } from "@/components/ui/Skeleton";

export default function RapportsPage() {
  const { sales, products, expenses, depots, openModal, showToast, isLoading } = useApp();
  
  const [preset, setPreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonChart />
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  const filteredSales = sales.filter(s => {
    const saleDate = s.date.slice(0, 10);
    const matchStart = !startDate || saleDate >= startDate;
    const matchEnd = !endDate || saleDate <= endDate;
    return matchStart && matchEnd;
  });

  let totalCA = 0;
  let costGoods = 0;

  // Breakdown per product
  const productPerformance: { [prodId: string]: { title: string; code: string; bagsSold: number; revenue: number; cost: number; margin: number } } = {};

  products.forEach(p => {
    productPerformance[p.id] = { title: p.title, code: p.code, bagsSold: 0, revenue: 0, cost: 0, margin: 0 };
  });

  // Breakdown per depot
  const depotPerformance: { [depId: string]: { name: string; revenue: number; salesCount: number } } = {};
  depots.forEach(d => {
    depotPerformance[d.id] = { name: d.name, revenue: 0, salesCount: 0 };
  });

  filteredSales.forEach(s => {
    totalCA += s.totalAmount;
    if (depotPerformance[s.depotId]) {
      depotPerformance[s.depotId].revenue += s.totalAmount;
      depotPerformance[s.depotId].salesCount += 1;
    }

    s.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const buyPrice = prod ? prod.buyPrice : 0;
      costGoods += it.qty * buyPrice;

      if (productPerformance[it.productId]) {
        productPerformance[it.productId].bagsSold += it.qty;
        productPerformance[it.productId].revenue += it.price * it.qty;
        productPerformance[it.productId].cost += buyPrice * it.qty;
        productPerformance[it.productId].margin += (it.price - buyPrice) * it.qty;
      }
    });
  });

  const grossMargin = totalCA - costGoods;

  // Expenses breakdown
  const manutentionCost = expenses.filter(e => e.category === "Manutention").reduce((sum, e) => sum + e.amount, 0);
  const transportCost = expenses.filter(e => e.category === "Transport").reduce((sum, e) => sum + e.amount, 0);
  const loyerCost = expenses.filter(e => e.category === "Loyer").reduce((sum, e) => sum + e.amount, 0);
  const otherCost = expenses.filter(e => !["Manutention", "Transport", "Loyer"].includes(e.category)).reduce((sum, e) => sum + e.amount, 0);

  const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = grossMargin - totalExp;
  const marginPercent = totalCA > 0 ? ((grossMargin / totalCA) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Rapports Financiers & Performance Commerciale</h1>
          <p className="text-sm text-slate-400 mt-1">Compte de résultat d'exploitation, rentabilité par variété de riz et bilans d'entrepôt.</p>
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

          <button 
            onClick={() => showToast("Exportation du rapport comptable CSV...", "success")}
            className="bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          <button 
            onClick={() => openModal("modal-print-financial-report")}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimer Bilan PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chiffre d'Affaires Brut</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatFCFA(totalCA)}</div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total factures de riz émises
          </div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Coût des Marchandises</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatFCFA(costGoods)}</div>
          <div className="text-xs text-slate-400">Valeur d'achat des sacs vendus</div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Marge Commerciale Brute</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatFCFA(grossMargin)}</div>
          <div className="text-xs text-blue-400 font-bold">{marginPercent}% Taux de Marge Moyenne</div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Résultat Net d'Exploitation</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Vault className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatFCFA(netProfit)}
          </div>
          <div className="text-xs text-slate-400">Déduction faite des charges d'exploitation</div>
        </div>
      </div>

      {/* Main Financial Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Compte de Résultat d'Exploitation */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-extrabold text-base text-white flex items-center gap-2">
              📊 Compte de Résultat Synthetique
            </span>
            <span className="text-xs bg-emerald-500/15 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
              SYSCOHADA
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase bg-black/20 font-bold">
                  <th className="p-3">Postes Comptables d'Exploitation</th>
                  <th className="p-3 text-right">Montants (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-3 font-bold text-white">Ventes de Marchandises (Chiffre d'Affaires Brut)</td>
                  <td className="p-3 text-right font-black text-emerald-400">+{formatFCFA(totalCA)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 pl-6">- Coût d'Achat des Marchandises Vendues (CAMV)</td>
                  <td className="p-3 text-right font-bold text-red-400">-{formatFCFA(costGoods)}</td>
                </tr>
                <tr className="bg-blue-500/10 font-black">
                  <td className="p-3 text-blue-300 uppercase">MARGE BRUTE COMMERCIALES</td>
                  <td className="p-3 text-right text-blue-400">={formatFCFA(grossMargin)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 pl-6">- Charges de Manutention & Manœuvres Port</td>
                  <td className="p-3 text-right text-red-400">-{formatFCFA(manutentionCost)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 pl-6">- Camionnage, Transport Inter-Dépôts & Carburant</td>
                  <td className="p-3 text-right text-red-400">-{formatFCFA(transportCost)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300 pl-6">- Loyers Entrepôts & Charges Fixes Dépôts</td>
                  <td className="p-3 text-right text-red-400">-{formatFCFA(loyerCost)}</td>
                </tr>
                {otherCost > 0 && (
                  <tr>
                    <td className="p-3 text-slate-300 pl-6">- Autre Charges Opérationnelles & Salaires RH</td>
                    <td className="p-3 text-right text-red-400">-{formatFCFA(otherCost)}</td>
                  </tr>
                )}
                <tr className="bg-emerald-500/15 font-black text-sm border-t border-emerald-500/30">
                  <td className="p-3 text-emerald-300 uppercase">RÉSULTAT NET DE L'EXERCICE</td>
                  <td className={`p-3 text-right ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ={formatFCFA(netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Marge par Variété de Riz */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-extrabold text-base text-white flex items-center gap-2">
              🌾 Rentabilité & Marges par Variété de Riz
            </span>
            <span className="text-xs text-slate-400">Top Variétés</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase bg-black/20 font-bold">
                  <th className="p-3">Variété</th>
                  <th className="p-3 text-right">Volume (Sacs)</th>
                  <th className="p-3 text-right">CA Généré</th>
                  <th className="p-3 text-right">Marge Dégagée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.keys(productPerformance).map(pId => {
                  const item = productPerformance[pId];
                  const marginPct = item.revenue > 0 ? ((item.margin / item.revenue) * 100).toFixed(1) : 0;
                  return (
                    <tr key={pId} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <div>
                          <div>{item.title}</div>
                          <span className="text-[10px] text-blue-400 font-normal">{item.code}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right text-slate-300 font-semibold">{formatNumber(item.bagsSold)} Sacs</td>
                      <td className="p-3 text-right text-slate-200 font-bold">{formatFCFA(item.revenue)}</td>
                      <td className="p-3 text-right font-black text-emerald-400">
                        +{formatFCFA(item.margin)}
                        <div className="text-[10px] text-blue-400 font-bold">{marginPct}% Marge</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Performance by Depot Section */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 space-y-4">
        <span className="font-extrabold text-base text-white flex items-center gap-2">
          🏢 Performance & Ventillation du CA par Entrepôt Dépôt
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(depotPerformance).map(depId => {
            const dPerf = depotPerformance[depId];
            const percent = totalCA > 0 ? ((dPerf.revenue / totalCA) * 100).toFixed(1) : 0;

            return (
              <div key={depId} className="bg-[#0f172a] border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-white flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {dPerf.name}
                  </span>
                  <span className="bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded text-[11px]">
                    {percent}%
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-400">{formatFCFA(dPerf.revenue)}</div>
                <div className="text-xs text-slate-400">{dPerf.salesCount} factures enregistrées</div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, Building2, TrendingUp, Coins, BarChart3, Vault } from "lucide-react";
import { formatFCFA, formatNumber } from "@/lib/utils";

export const PrintFinancialReportModal: React.FC = () => {
  const { activeModal, closeModal, sales, products, expenses, settings, depots } = useApp();

  const isOpen = activeModal === "modal-print-financial-report";
  if (!isOpen) return null;

  let totalCA = 0;
  let costGoods = 0;

  // Breakdown per product
  const productPerformance: { [prodId: string]: { title: string; bagsSold: number; revenue: number; cost: number; margin: number } } = {};

  products.forEach(p => {
    productPerformance[p.id] = { title: p.title, bagsSold: 0, revenue: 0, cost: 0, margin: 0 };
  });

  sales.forEach(s => {
    totalCA += s.totalAmount;
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

  // Breakdown of expenses
  const manutentionCost = expenses.filter(e => e.category === "Manutention").reduce((sum, e) => sum + e.amount, 0);
  const transportCost = expenses.filter(e => e.category === "Transport").reduce((sum, e) => sum + e.amount, 0);
  const loyerCost = expenses.filter(e => e.category === "Loyer").reduce((sum, e) => sum + e.amount, 0);
  const otherCost = expenses.filter(e => !["Manutention", "Transport", "Loyer"].includes(e.category)).reduce((sum, e) => sum + e.amount, 0);
  const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = grossMargin - totalExp;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      id="modal-print-financial-report"
      title="Bilan Financier & Compte de Résultat Officiel"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
            Fermer
          </button>
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimer Bilan PDF
          </button>
        </>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans space-y-6 border border-slate-200">
        {/* Header Company Logo & Document Title */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#1e4d35] text-white flex items-center justify-center font-black text-xl shadow-sm">
                RZ
              </div>
            )}
            <div>
              <div className="font-black text-slate-900 text-lg tracking-tight">{settings.companyName}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">{settings.address}</p>
              <p className="text-[11px] text-slate-500">Tel: {settings.phone} | NINEA: {settings.rccm}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-1">
              RAPPORT FINANCIER GLOBAL
            </span>
            <div className="text-xs text-slate-500 mt-1">Exercice: <strong className="text-slate-900">2026</strong></div>
            <div className="text-xs text-slate-500">Date d'arrêt: <strong className="text-slate-900">{new Date().toLocaleDateString('fr-FR')}</strong></div>
          </div>
        </div>

        {/* Executive Summary Metadata Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Chiffre d'Affaires</span>
            <span className="text-sm font-extrabold text-slate-900">{formatFCFA(totalCA)}</span>
          </div>
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Coût Achat Stock</span>
            <span className="text-sm font-extrabold text-slate-900">{formatFCFA(costGoods)}</span>
          </div>
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Marge Brute</span>
            <span className="text-sm font-extrabold text-emerald-700">+{formatFCFA(grossMargin)}</span>
          </div>
          <div className="bg-slate-50/80 border border-slate-200/80 p-3 rounded-xl">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Bénéfice Net</span>
            <span className={`text-sm font-extrabold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {netProfit >= 0 ? '+' : ''}{formatFCFA(netProfit)}
            </span>
          </div>
        </div>

        {/* Financial Statement Breakdown Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                <th className="p-3">Poste Comptable & Analyse d'Exploitation</th>
                <th className="p-3 text-right">Montant Exercice (FCFA)</th>
                <th className="p-3 text-right">Ratio / % CA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900">Ventes Globales de Sacs de Riz (CA)</td>
                <td className="p-3 text-right font-black text-slate-900">+{formatFCFA(totalCA)}</td>
                <td className="p-3 text-right font-bold text-slate-600">100.0%</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-800">Coût d'Achat des Marchandises Vendues (CAMV)</td>
                <td className="p-3 text-right text-red-600">-{formatFCFA(costGoods)}</td>
                <td className="p-3 text-right text-slate-500">{totalCA > 0 ? ((costGoods / totalCA) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr className="bg-emerald-50/60 font-extrabold text-emerald-900 border-t border-b border-emerald-200">
                <td className="p-3">MARGE BRUTE D'EXPLOITATION</td>
                <td className="p-3 text-right text-emerald-800 font-black">+{formatFCFA(grossMargin)}</td>
                <td className="p-3 text-right text-emerald-800">{totalCA > 0 ? ((grossMargin / totalCA) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-800">Manutention, Déchargement & Manœuvres Port</td>
                <td className="p-3 text-right text-red-600">-{formatFCFA(manutentionCost)}</td>
                <td className="p-3 text-right text-slate-500">-</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-800">Transport Camionnage Inter-Dépôts</td>
                <td className="p-3 text-right text-red-600">-{formatFCFA(transportCost)}</td>
                <td className="p-3 text-right text-slate-500">-</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-800">Loyers Entrepôts & Charges Fixes Dépôts</td>
                <td className="p-3 text-right text-red-600">-{formatFCFA(loyerCost)}</td>
                <td className="p-3 text-right text-slate-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Reference Model Capsule Summary Block */}
        <div className="bg-[#1e4d35] text-white p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="font-black text-xs uppercase tracking-wider block">RÉSULTAT NET COMPTABLE DE L'EXERCICE</span>
            <span className="text-[11px] text-emerald-200 font-medium">Après déduction de l'ensemble des charges d'exploitation</span>
          </div>
          <div className="text-2xl font-black font-mono">
            {formatFCFA(netProfit)}
          </div>
        </div>

        {/* Signatures Block */}
        <div className="grid grid-cols-2 gap-8 pt-6 text-xs border-t border-slate-200">
          <div>
            <p className="font-bold text-slate-700">Validation Chef Comptable :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700">Approbation Direction Générale :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2 flex items-center justify-end text-[10px] text-slate-400 font-semibold italic">
              {settings.companyName} DG
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, Wheat } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export const PrintFinancialReportModal: React.FC = () => {
  const { activeModal, closeModal, sales, products, expenses, settings } = useApp();

  const isOpen = activeModal === "modal-print-financial-report";
  if (!isOpen) return null;

  let totalCA = 0;
  let costGoods = 0;

  sales.forEach(s => {
    totalCA += s.totalAmount;
    s.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId || p.title.toLowerCase() === it.title.toLowerCase());
      const buyPrice = (prod && prod.buyPrice > 0) ? prod.buyPrice : Math.round(it.price * 0.85);
      costGoods += it.qty * buyPrice;
    });
  });

  const grossMargin = totalCA - costGoods;

  const manutentionCost = expenses.filter(e => e.category === "Manutention").reduce((sum, e) => sum + e.amount, 0);
  const transportCost = expenses.filter(e => e.category === "Transport").reduce((sum, e) => sum + e.amount, 0);
  const loyerCost = expenses.filter(e => e.category === "Loyer").reduce((sum, e) => sum + e.amount, 0);
  const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const netProfit = grossMargin - totalExp;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      id="modal-print-financial-report"
      title="Rapport Financier & Compte de Résultat"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
            <Printer className="w-3.5 h-3.5" /> Imprimer Bilan PDF
          </button>
          <button onClick={closeModal} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-5 rounded-xl font-sans space-y-4 border border-slate-200 shadow-sm text-xs">
        {/* Header Logo & Document Title */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">{settings.companyName || "RizStock ERP"}</h1>
              <p className="text-[10px] text-slate-500">{settings.address || "Dakar, Sénégal"} • Tél: {settings.phone || "+221 33 800 00 00"}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">RAPPORT FINANCIER GLOBAL</h2>
            <div className="text-[10px] text-slate-600 mt-0.5 space-x-2 font-medium">
              <span>Exercice: <strong className="text-slate-900 font-mono">2026</strong></span>
              <span>•</span>
              <span>Date: <span className="text-slate-900">{new Date().toLocaleDateString('fr-FR')}</span></span>
            </div>
          </div>
        </div>

        {/* Minimal Financial Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Chiffre d'Affaires</span>
            <span className="text-xs font-bold text-slate-900 font-mono whitespace-nowrap">{formatFCFA(totalCA)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Coût d'Achat Stock</span>
            <span className="text-xs font-bold text-slate-900 font-mono whitespace-nowrap">{formatFCFA(costGoods)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Marge Brute</span>
            <span className="text-xs font-bold text-emerald-700 font-mono whitespace-nowrap">+{formatFCFA(grossMargin)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Résultat Net</span>
            <span className={`text-xs font-bold font-mono whitespace-nowrap ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {netProfit >= 0 ? '+' : ''}{formatFCFA(netProfit)}
            </span>
          </div>
        </div>

        {/* Income Statement Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600 bg-slate-100">
                <th className="py-1.5 px-2.5 whitespace-nowrap">Poste Comptable & Analyse d'Exploitation</th>
                <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Montant Exercice (FCFA)</th>
                <th className="py-1.5 px-2.5 text-right whitespace-nowrap">% CA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              <tr className="hover:bg-slate-50">
                <td className="py-1.5 px-2.5 font-semibold text-slate-900 whitespace-nowrap">Ventes Globales de Sacs de Riz (CA)</td>
                <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">+{formatFCFA(totalCA)}</td>
                <td className="py-1.5 px-2.5 text-right font-bold text-slate-600 whitespace-nowrap">100.0%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">Coût d'Achat des Marchandises Vendues (CAMV)</td>
                <td className="py-1.5 px-2.5 text-right font-mono font-bold text-rose-700 whitespace-nowrap">-{formatFCFA(costGoods)}</td>
                <td className="py-1.5 px-2.5 text-right text-slate-500 whitespace-nowrap">{totalCA > 0 ? ((costGoods / totalCA) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t border-b border-slate-300">
                <td className="py-1.5 px-2.5 uppercase text-[10px] whitespace-nowrap">MARGE BRUTE D'EXPLOITATION</td>
                <td className="py-1.5 px-2.5 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">+{formatFCFA(grossMargin)}</td>
                <td className="py-1.5 px-2.5 text-right font-bold text-emerald-700 whitespace-nowrap">{totalCA > 0 ? ((grossMargin / totalCA) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">Manutention, Déchargement & Port</td>
                <td className="py-1.5 px-2.5 text-right font-mono text-rose-700 whitespace-nowrap">-{formatFCFA(manutentionCost)}</td>
                <td className="py-1.5 px-2.5 text-right text-slate-400 whitespace-nowrap">-</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">Transport & Camionnage Inter-Dépôts</td>
                <td className="py-1.5 px-2.5 text-right font-mono text-rose-700 whitespace-nowrap">-{formatFCFA(transportCost)}</td>
                <td className="py-1.5 px-2.5 text-right text-slate-400 whitespace-nowrap">-</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">Loyers Entrepôts & Charges Fixes</td>
                <td className="py-1.5 px-2.5 text-right font-mono text-rose-700 whitespace-nowrap">-{formatFCFA(loyerCost)}</td>
                <td className="py-1.5 px-2.5 text-right text-slate-400 whitespace-nowrap">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Minimal Net Profit Banner */}
        <div className="bg-slate-900 text-white p-2.5 rounded-lg flex items-center justify-between">
          <span className="font-bold text-[11px] uppercase text-slate-200">RÉSULTAT NET COMPTABLE DE L'EXERCICE</span>
          <span className="text-base font-extrabold font-mono text-emerald-400">{formatFCFA(netProfit)}</span>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 font-sans text-[10px]">
          <div>
            <span className="font-bold text-slate-600 block uppercase">Chef Comptable</span>
            <div className="h-8 border-b border-slate-300 mt-1" />
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-600 block uppercase">Direction Générale</span>
            <div className="h-8 border-b border-slate-300 mt-1" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

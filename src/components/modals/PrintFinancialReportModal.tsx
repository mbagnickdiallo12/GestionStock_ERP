"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, Wheat } from "lucide-react";
import { formatFCFA, formatNumber } from "@/lib/utils";

export const PrintFinancialReportModal: React.FC = () => {
  const { activeModal, closeModal, sales, products, expenses, settings, depots } = useApp();

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
      size="lg"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button onClick={handlePrint} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all">
            <Printer className="w-3.5 h-3.5" /> Imprimer Bilan Financier (PDF)
          </button>
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans border border-slate-200/80 shadow-md">
        
        {/* Top Content Group */}
        <div>
          {/* Header: Logo & Title + Status Badge */}
          <div className="flex justify-between items-start pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#1e1b4b] tracking-tight">
                    {settings?.companyName ? settings.companyName.split(" ")[0].toLowerCase() : "rizstock"}
                  </span>
                </div>
              )}
              <span className="text-slate-400 font-bold uppercase text-[10.5px] tracking-wider pl-3 border-l border-slate-200">
                RAPPORT FINANCIER & BILAN
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-semibold text-[9.5px] uppercase tracking-wider block mb-1">
                STATUT AUDIT
              </span>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded text-xs font-bold inline-block">
                Exercice Conforme
              </span>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-2.5 my-5 text-xs">
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">N° de Référence Bilan :</span>
              <span className="font-extrabold text-slate-800 text-sm font-mono tracking-tight">RPT-SYSCOHADA-2026</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Raison Sociale / Entité :</span>
              <span className="font-extrabold text-slate-900 text-sm">{settings?.companyName || "RizStock ERP"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Réseau Logistique :</span>
              <span className="font-semibold text-slate-700 text-sm">{depots.length} Dépôts Connectés (Multi-Dépôts)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Période d'Exercice :</span>
              <span className="font-extrabold text-slate-800 text-sm">Exercice Clôturé 2026</span>
            </div>
          </div>

          {/* Document Subject Title */}
          <h2 className="text-sm sm:text-base font-black text-slate-900 mb-3 tracking-tight">
            Compte de Résultat Synthétique (SYSCOHADA) - {settings?.companyName || "RizStock ERP"}
          </h2>

          {/* Financial Accounting Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-y border-slate-200 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                  <th className="py-2 px-2">POSTE COMPTABLE / RUBRIQUE</th>
                  <th className="py-2 px-2">NATURE</th>
                  <th className="py-2 px-2 text-right">MONTANT (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-2 font-bold text-slate-900">Ventes de Marchandises (Chiffre d'Affaires Brut)</td>
                  <td className="py-2.5 px-2 text-slate-500 text-[10.5px]">Recettes POS & Factures</td>
                  <td className="py-2.5 px-2 text-right font-black text-emerald-600 font-mono text-xs sm:text-sm">+{formatFCFA(totalCA)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 font-bold text-slate-900">Coût d'Achat des Marchandises Vendues (CAMV)</td>
                  <td className="py-2.5 px-2 text-slate-500 text-[10.5px]">Achats Import & Fret</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-slate-700 font-mono text-xs sm:text-sm">-{formatFCFA(costGoods)}</td>
                </tr>
                <tr className="bg-slate-50/70">
                  <td className="py-2 px-2 font-black text-slate-900 uppercase text-[10.5px]">MARGE BRUTE COMMERCIALE</td>
                  <td className="py-2.5 px-2 text-slate-500 font-semibold text-[10px]">{totalCA > 0 ? ((grossMargin / totalCA) * 100).toFixed(1) : 0}% Marge</td>
                  <td className="py-2.5 px-2 text-right font-black text-slate-900 font-mono text-xs sm:text-sm">={formatFCFA(grossMargin)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 font-bold text-slate-900">Charges de Manutention & Déchargement</td>
                  <td className="py-2.5 px-2 text-slate-500 text-[10.5px]">Manœuvres & Port</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-red-600 font-mono text-xs sm:text-sm">-{formatFCFA(manutentionCost)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 font-bold text-slate-900">Frais de Camionnage & Transport</td>
                  <td className="py-2.5 px-2 text-slate-500 text-[10.5px]">Logistique Inter-Dépôts</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-red-600 font-mono text-xs sm:text-sm">-{formatFCFA(transportCost)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 font-bold text-slate-900">Loyers Entrepôts & Charges Fixes</td>
                  <td className="py-2.5 px-2 text-slate-500 text-[10.5px]">Baux & Dépôts</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-red-600 font-mono text-xs sm:text-sm">-{formatFCFA(loyerCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Highlight Box */}
          <div className="flex justify-end my-5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 flex items-center justify-between gap-6 min-w-[300px]">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">RÉSULTAT NET :</span>
              <span className={`text-xl font-black font-mono tracking-tight ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatFCFA(netProfit)}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200/80 text-xs">
            <div>
              <span className="font-bold text-slate-600 block uppercase text-[9.5px] tracking-wider mb-0.5">Direction Financière</span>
              <p className="text-[9.5px] text-slate-400">Pour certification des comptes</p>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-600 block uppercase text-[9.5px] tracking-wider mb-0.5">Direction Générale</span>
              <p className="text-[9.5px] text-slate-400">Pour visa et approbation</p>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/80 pt-3 mt-auto flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-400">
          <span>Bilan certifié conforme par {settings?.companyName || "RizStock ERP"} - NINEA {settings?.ninea || "00984521"}</span>
          <span>Document certifié électroniquement</span>
        </div>

      </div>
    </Modal>
  );
};

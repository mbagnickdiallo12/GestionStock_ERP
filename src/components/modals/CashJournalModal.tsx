"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { Printer, Search, Wheat } from "lucide-react";

export const CashJournalModal: React.FC = () => {
  const { activeModal, closeModal, sales, expenses, activeDepotId, depots, settings, currentUser } = useApp();

  const isOpen = activeModal === "modal-cash-journal";

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  if (!isOpen) return null;

  const currentDepot = depots.find(d => d.id === activeDepotId);
  const depotNameDisplay = activeDepotId === "all" ? "Tous les Dépôts (Global)" : (currentDepot?.name || "Dakar Port");

  // Combine sales and expenses into a single cash journal timeline
  const saleEntries = sales.map(s => ({
    id: s.id,
    date: s.date,
    type: 'VENTE' as const,
    party: s.clientName,
    paymentMode: s.paymentMode,
    amount: s.totalAmount,
    bags: s.items.reduce((acc, i) => acc + i.qty, 0),
    depotId: s.depotId
  }));

  const expenseEntries = expenses.map(e => ({
    id: e.id,
    date: `${e.date} 12:00`,
    type: 'DEPENSE' as const,
    party: e.beneficiary,
    paymentMode: 'Espece' as const,
    amount: -e.amount,
    bags: 0,
    depotId: e.depotId
  }));

  const journalEntries = [...saleEntries, ...expenseEntries]
    .filter(e => activeDepotId === "all" || e.depotId === activeDepotId)
    .filter(e => {
      const matchSearch = e.id.toLowerCase().includes(searchTerm.toLowerCase()) || e.party.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPayment = paymentFilter === "all" || e.paymentMode === paymentFilter;
      return matchSearch && matchPayment;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCashIn = journalEntries.filter(e => e.type === 'VENTE' && e.paymentMode === 'Espece').reduce((sum, e) => sum + e.amount, 0);
  const totalWaveIn = journalEntries.filter(e => e.type === 'VENTE' && e.paymentMode === 'Wave').reduce((sum, e) => sum + e.amount, 0);
  const totalOut = journalEntries.filter(e => e.type === 'DEPENSE').reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const netCashFlow = totalCashIn - totalOut;

  const handlePrint = () => {
    window.print();
  };

  const printDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <Modal
      id="modal-cash-journal"
      title="Journal de Caisse & Enregistrements"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer / PDF
          </button>
          <button
            onClick={closeModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-5 rounded-xl font-sans space-y-4 border border-slate-200 shadow-sm text-xs">
        
        {/* Modern Compact Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">{settings?.companyName || "RizStock ERP"}</h1>
              <p className="text-[10px] text-slate-500">{settings?.address || "Dakar, Sénégal"} • Tél: {settings?.phone || "+221 33 800 00 00"}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Journal de Caisse</h2>
            <div className="text-[10px] text-slate-600 mt-0.5 space-x-2 font-medium">
              <span>Dépôt: <strong className="text-slate-900">{depotNameDisplay}</strong></span>
              <span>•</span>
              <span>Date: <span className="text-slate-900">{printDate}</span></span>
            </div>
          </div>
        </div>

        {/* Compact Key Metric Line */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Entrées Cash</span>
            <span className="text-xs font-bold text-emerald-700 font-mono whitespace-nowrap">+{formatFCFA(totalCashIn)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Entrées Wave</span>
            <span className="text-xs font-bold text-blue-700 font-mono whitespace-nowrap">+{formatFCFA(totalWaveIn)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Sorties</span>
            <span className="text-xs font-bold text-rose-700 font-mono whitespace-nowrap">-{formatFCFA(totalOut)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Solde Net Espèces</span>
            <span className="text-xs font-bold text-slate-900 font-mono whitespace-nowrap">{formatFCFA(netCashFlow)}</span>
          </div>
        </div>

        {/* Screen Filters (Hidden in PDF print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2 rounded-lg">
          <div className="flex items-center gap-2 bg-white border border-slate-300 px-2.5 py-1 rounded flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-900 text-xs outline-none w-full"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 text-xs px-2.5 py-1 rounded outline-none cursor-pointer font-medium"
          >
            <option value="all">Tous les Modes de Règlement</option>
            <option value="Espece">Espèces / Cash</option>
            <option value="Wave">Wave / Mobile Money</option>
            <option value="Virement">Virement Bancaire</option>
            <option value="Cheque">Chèque Bancaire</option>
            <option value="Credit">Crédit Client</option>
          </select>
        </div>

        {/* Clean Compact Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600 bg-slate-100">
                <th className="py-1.5 px-2.5 whitespace-nowrap">Date</th>
                <th className="py-1.5 px-2.5 whitespace-nowrap">Référence</th>
                <th className="py-1.5 px-2.5 whitespace-nowrap">Tiers / Client</th>
                <th className="py-1.5 px-2.5 whitespace-nowrap">Opération</th>
                <th className="py-1.5 px-2.5 whitespace-nowrap">Règlement</th>
                <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {journalEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400 italic text-[11px]">
                    Aucune écriture dans le journal de caisse.
                  </td>
                </tr>
              ) : (
                journalEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{entry.date}</td>
                    <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">{entry.id}</td>
                    <td className="py-1.5 px-2.5 font-medium text-slate-900 whitespace-nowrap">{entry.party}</td>
                    <td className="py-1.5 px-2.5 whitespace-nowrap">
                      {entry.type === 'VENTE' ? (
                        <span className="text-emerald-700 font-semibold">Vente ({entry.bags} sacs)</span>
                      ) : (
                        <span className="text-rose-700 font-semibold">Dépense Caisse</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{entry.paymentMode}</td>
                    <td className={`py-1.5 px-2.5 text-right font-mono font-bold whitespace-nowrap ${entry.amount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {entry.amount >= 0 ? `+${formatFCFA(entry.amount)}` : formatFCFA(entry.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Signatures */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 font-sans text-[10px]">
          <div>
            <span className="font-bold text-slate-600 block uppercase">Visa Caissier</span>
            <div className="h-8 border-b border-slate-300 mt-1" />
            <span className="text-slate-400 block mt-0.5">{currentUser?.name || "Caissier"}</span>
          </div>

          <div className="text-right">
            <span className="font-bold text-slate-600 block uppercase">Visa Comptabilité</span>
            <div className="h-8 border-b border-slate-300 mt-1" />
            <span className="text-slate-400 block mt-0.5">Signature autorisée</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

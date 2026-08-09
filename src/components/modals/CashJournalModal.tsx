"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { BookOpen, Printer, ArrowDownRight, ArrowUpRight, Search, FileText } from "lucide-react";

export const CashJournalModal: React.FC = () => {
  const { activeModal, closeModal, sales, expenses, activeDepotId, depots } = useApp();

  const isOpen = activeModal === "modal-cash-journal";

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  if (!isOpen) return null;

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      id="modal-cash-journal"
      title="Journal de Caisse & Historique Mouvements Opérationnels"
      footer={(
        <div className="flex items-center justify-between w-full">
          <button onClick={handlePrint} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimer Journal de Caisse PDF
          </button>
          <button onClick={closeModal} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="space-y-4 text-sm printable-area">
        {/* Summary Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0f172a] border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Total Entrées Cash (Espèces)</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">+{formatFCFA(totalCashIn)}</span>
            </div>
            <ArrowDownRight className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="bg-[#0f172a] border border-blue-500/30 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Total Entrées Mobile Money (Wave)</span>
              <span className="text-base font-extrabold text-blue-400 font-mono">+{formatFCFA(totalWaveIn)}</span>
            </div>
            <ArrowDownRight className="w-6 h-6 text-blue-400" />
          </div>

          <div className="bg-[#0f172a] border border-red-500/30 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">Total Sorties de Caisse</span>
              <span className="text-base font-extrabold text-red-400 font-mono">-{formatFCFA(totalOut)}</span>
            </div>
            <ArrowUpRight className="w-6 h-6 text-red-400" />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] border border-white/10 p-3 rounded-xl">
          <div className="flex items-center gap-2 bg-[#1e293b] border border-white/15 px-3 py-1.5 rounded-lg flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher réf, client, tiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-white text-xs outline-none w-full"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#1e293b] border border-white/15 text-white text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer font-semibold"
          >
            <option value="all">Tous les Modes de Règlement</option>
            <option value="Espece">💵 Espèces / Cash</option>
            <option value="Wave">📲 Wave / Mobile Money</option>
            <option value="Virement">🏦 Virement Bancaire</option>
            <option value="Cheque">📜 Chèque Bancaire</option>
            <option value="Credit">⏳ Crédit Client</option>
          </select>
        </div>

        {/* Journal Entries Table */}
        <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 font-bold uppercase text-slate-400 bg-black/30 sticky top-0">
                <th className="p-2.5">Date & Heure</th>
                <th className="p-2.5">Réf / Pièce</th>
                <th className="p-2.5">Client / Tiers</th>
                <th className="p-2.5">Type Opération</th>
                <th className="p-2.5">Règlement</th>
                <th className="p-2.5 text-right">Montant (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {journalEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-2.5 text-slate-300 font-sans">{entry.date}</td>
                  <td className="p-2.5 font-bold text-white"><span className="bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded">{entry.id}</span></td>
                  <td className="p-2.5 font-sans font-semibold text-slate-200">{entry.party}</td>
                  <td className="p-2.5 font-sans">
                    {entry.type === 'VENTE' ? (
                      <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold text-[11px]">🛒 Vente (+{entry.bags} Sacs)</span>
                    ) : (
                      <span className="bg-red-500/15 text-red-400 px-2 py-0.5 rounded font-bold text-[11px]">💸 Dépense Caisse</span>
                    )}
                  </td>
                  <td className="p-2.5 font-sans text-slate-300">{entry.paymentMode}</td>
                  <td className={`p-2.5 text-right font-bold text-sm ${entry.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.amount >= 0 ? `+${formatFCFA(entry.amount)}` : formatFCFA(entry.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

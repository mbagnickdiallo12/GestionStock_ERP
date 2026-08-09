"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { BookOpen, Printer, ArrowDownRight, ArrowUpRight, Search, FileText, Wheat } from "lucide-react";

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
      title="Journal de Caisse & Registre des Encaissements"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button
            onClick={handlePrint}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" /> Imprimer Journal de Caisse (PDF / Papier)
          </button>
          <button
            onClick={closeModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans space-y-6 border border-slate-200 shadow-sm">
        {/* Printable Official Header */}
        <div className="flex justify-between items-start pb-5 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                <Wheat className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{settings?.companyName || "RizStock ERP"}</h1>
              <p className="text-xs text-slate-500 font-medium">{settings?.address || "Dakar, Sénégal"}</p>
              <p className="text-xs text-slate-500 font-medium">Tél: {settings?.phone || "+221 33 800 00 00"} | RCCM: {settings?.rccm || "SN-DKR-2026-B-0000"}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-black text-slate-900 tracking-wider uppercase">JOURNAL DE CAISSE</h2>
            <p className="text-xs text-slate-600 mt-1 font-semibold">Dépôt : <span className="text-emerald-700 font-bold">{depotNameDisplay}</span></p>
            <p className="text-xs text-slate-600 font-semibold">Édité le : <span className="text-slate-900">{printDate}</span></p>
            <p className="text-xs text-slate-600 font-semibold">Opérateur : <span className="text-slate-900 font-bold">{currentUser?.name || "Caissier POS"}</span></p>
          </div>
        </div>

        {/* Summary Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Entrées Cash</span>
            <span className="text-base font-extrabold text-emerald-700 font-mono">+{formatFCFA(totalCashIn)}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Entrées Wave / Mobile</span>
            <span className="text-base font-extrabold text-blue-700 font-mono">+{formatFCFA(totalWaveIn)}</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Sorties Caisse</span>
            <span className="text-base font-extrabold text-rose-700 font-mono">-{formatFCFA(totalOut)}</span>
          </div>

          <div className="bg-slate-900 text-white p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase block">Solde Net Espèces</span>
            <span className="text-base font-extrabold text-white font-mono">{formatFCFA(netCashFlow)}</span>
          </div>
        </div>

        {/* Interactive Filter Controls (Hidden in Print PDF) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 bg-white border border-slate-300 px-3 py-1.5 rounded-lg flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par réf, client ou tiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-900 text-xs outline-none w-full"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-900 text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer font-bold"
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
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300 font-bold uppercase text-slate-700 bg-slate-100">
                <th className="p-3">Date & Heure</th>
                <th className="p-3">Réf / Pièce</th>
                <th className="p-3">Client / Tiers</th>
                <th className="p-3">Type Opération</th>
                <th className="p-3">Règlement</th>
                <th className="p-3 text-right">Montant (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {journalEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-sans italic">
                    Aucune écriture enregistrée dans le journal de caisse pour cette sélection.
                  </td>
                </tr>
              ) : (
                journalEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-700 font-sans">{entry.date}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <span className="bg-slate-200 text-slate-900 px-1.5 py-0.5 rounded font-mono text-[11px]">{entry.id}</span>
                    </td>
                    <td className="p-3 font-sans font-bold text-slate-900">{entry.party}</td>
                    <td className="p-3 font-sans">
                      {entry.type === 'VENTE' ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold text-[10px]">🛒 Vente (+{entry.bags} Sacs)</span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded font-bold text-[10px]">💸 Dépense Caisse</span>
                      )}
                    </td>
                    <td className="p-3 font-sans font-medium text-slate-700">{entry.paymentMode}</td>
                    <td className={`p-3 text-right font-black text-xs ${entry.amount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {entry.amount >= 0 ? `+${formatFCFA(entry.amount)}` : formatFCFA(entry.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Validation & Signature Footer for Print/PDF */}
        <div className="grid grid-cols-2 gap-8 text-xs pt-8 border-t border-slate-200 font-sans">
          <div className="border border-slate-200 p-4 rounded-xl space-y-8 bg-slate-50">
            <span className="font-extrabold text-slate-700 block uppercase text-[10px] tracking-widest">Visa & Signature Caissier</span>
            <div className="h-10 border-b border-dashed border-slate-300" />
            <span className="text-[10px] text-slate-400 block text-right">Nom : {currentUser?.name || "Caissier"}</span>
          </div>

          <div className="border border-slate-200 p-4 rounded-xl space-y-8 bg-slate-50 text-right">
            <span className="font-extrabold text-slate-700 block uppercase text-[10px] tracking-widest">Visa Direction / Comptabilité</span>
            <div className="h-10 border-b border-dashed border-slate-300" />
            <span className="text-[10px] text-slate-400 block">Cachet & Signature Autorisée</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

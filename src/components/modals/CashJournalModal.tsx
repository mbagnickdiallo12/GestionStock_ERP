"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber, isMatchingDepot } from "@/lib/utils";
import { Printer, Search, Wheat } from "lucide-react";

export const CashJournalModal: React.FC = () => {
  const { activeModal, closeModal, sales, expenses, activeDepotId, depots, settings, currentUser } = useApp();

  const isOpen = activeModal === "modal-cash-journal";

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  if (!isOpen) return null;

  const currentDepot = depots.find(d => isMatchingDepot(d.id, activeDepotId, depots));
  const depotNameDisplay = activeDepotId === "all" ? "Tous les Dépôts (Global)" : (currentDepot?.name || "Dépôt Central");

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
    .filter(e => isMatchingDepot(e.depotId, activeDepotId, depots))
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
      size="lg"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer Journal de Caisse (PDF)
          </button>
          <button
            onClick={closeModal}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-8 sm:p-10 rounded-2xl font-sans border border-slate-200/80 shadow-md">
        
        {/* Header: Logo & Title + Status Badge */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#1e1b4b] tracking-tight">
                  {settings?.companyName ? settings.companyName.split(" ")[0].toLowerCase() : "rizstock"}
                </span>
              </div>
            )}
            <span className="text-slate-400 font-bold uppercase text-[11px] tracking-wider pl-3 border-l border-slate-200">
              JOURNAL DE CAISSE OFFICIEL
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">
              STATUT DU REGISTRE
            </span>
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded text-xs font-bold inline-block">
              Journal Équilibré
            </span>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="space-y-3.5 my-6 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">N° de Référence Journal :</span>
            <span className="font-extrabold text-slate-800 text-sm font-mono tracking-tight">JRN-{new Date().toISOString().slice(0, 10)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Point de Vente / Dépôt :</span>
            <span className="font-extrabold text-slate-900 text-sm">{depotNameDisplay}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Caissier / Opérateur en charge :</span>
            <span className="font-semibold text-slate-700 text-sm">{currentUser?.name || "Direction Caisse"}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Date & Heure d'arrêté :</span>
            <span className="font-extrabold text-slate-800 text-sm">{printDate}</span>
          </div>
        </div>

        {/* Document Subject Title */}
        <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 tracking-tight pt-2">
          Registre Chronologique des Recettes & Dépenses - {settings?.companyName || "RizStock ERP"}
        </h2>

        {/* Entries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-2">DATE & RÉF</th>
                <th className="py-2.5 px-2">TIERS / DÉSIGNATION</th>
                <th className="py-2.5 px-2">MODE</th>
                <th className="py-2.5 px-2 text-right">ENCAISSEMENT</th>
                <th className="py-2.5 px-2 text-right">DÉCAISSEMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {journalEntries.map(e => (
                <tr key={e.id}>
                  <td className="py-3 px-2 text-slate-600 align-top whitespace-nowrap text-[11px]">
                    <div>{e.date}</div>
                    <div className="font-mono font-bold text-slate-800 text-[10px]">{e.id}</div>
                  </td>
                  <td className="py-3 px-2 align-top">
                    <div className="font-bold text-slate-900 text-sm">{e.party || "Client Comptoir"}</div>
                    <div className="text-slate-500 text-[10px]">
                      {e.type === 'VENTE' ? `Vente Riz (${e.bags} sacs)` : 'Dépense / Manutention'}
                    </div>
                  </td>
                  <td className="py-3 px-2 align-top">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                      {e.paymentMode}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-black text-emerald-600 text-sm align-top whitespace-nowrap font-mono">
                    {e.amount > 0 ? `+${formatFCFA(e.amount)}` : "-"}
                  </td>
                  <td className="py-3 px-2 text-right font-black text-red-600 text-sm align-top whitespace-nowrap font-mono">
                    {e.amount < 0 ? `-${formatFCFA(Math.abs(e.amount))}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Highlight Box */}
        <div className="flex justify-end mt-8">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-6 py-3.5 flex items-center justify-between gap-8 min-w-[320px]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SOLDE NET EN CAISSE :</span>
            <span className="text-xl font-black text-emerald-600 font-mono tracking-tight">{formatFCFA(netCashFlow)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/80 pt-4 mt-8 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <span>Journal certifié conforme par la Direction Financière - {settings?.companyName || "RizStock ERP"}</span>
          <span>Document certifié électroniquement</span>
        </div>

      </div>
    </Modal>
  );
};

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { Building2, Mail, Phone, MapPin, ShieldCheck, Printer, History, CreditCard } from "lucide-react";

export const ClientDetailsModal: React.FC = () => {
  const { activeModal, closeModal, clients, debtTransactions, settings, openModal } = useApp();

  const isDetailsModal = activeModal && activeModal.startsWith("modal-client-details-");
  const clientId = isDetailsModal ? activeModal.replace("modal-client-details-", "") : null;
  const targetClient = clients.find(c => c.id === clientId);

  if (!isDetailsModal || !targetClient) return null;

  const clientHistory = debtTransactions.filter(tx => tx.clientId === targetClient.id);
  const creditLimit = targetClient.creditLimit || 10000000;
  const creditUsagePct = Math.min(100, Math.round((targetClient.balance / creditLimit) * 100));

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <Modal
      id={`modal-client-details-${targetClient.id}`}
      title={`Fiche Complète Client & Relevé de Compte - ${targetClient.name}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Fermer</button>
          {targetClient.balance > 0 && (
            <button
              onClick={() => {
                closeModal();
                openModal(`settle-debt-${targetClient.id}`);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer"
            >
              💵 Régler la Créance ({formatFCFA(targetClient.balance)})
            </button>
          )}
        </>
      )}
    >
      <div className="space-y-5 text-sm">
        {/* Header Profile Summary */}
        <div className="bg-[#0f172a] border border-white/10 p-5 rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                {targetClient.name}
                <span className="bg-blue-500/15 text-blue-400 text-xs px-3 py-0.5 rounded-full uppercase font-bold">
                  {targetClient.category}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {targetClient.phone}</span>
                {targetClient.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-blue-400" /> {targetClient.email}</span>}
              </p>
            </div>

            <button
              onClick={handlePrintStatement}
              className="bg-[#1e293b] hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" /> Relevé PDF
            </button>
          </div>

          <div className="border-t border-white/10 pt-3 text-xs text-slate-300 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> {targetClient.address || "Adresse non renseignée"}, {targetClient.city}</span>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1e293b] border border-white/10 p-4 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Cumul Achats Effectués</span>
            <div className="text-xl font-black text-white">{formatFCFA(targetClient.totalPurchases)}</div>
            <span className="text-[10px] text-emerald-400">Volume d'affaires global</span>
          </div>

          <div className="bg-[#1e293b] border border-white/10 p-4 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Solde Créance Actuel Dû</span>
            <div className={`text-xl font-black ${targetClient.balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatFCFA(targetClient.balance)}
            </div>
            <span className="text-[10px] text-slate-400">Paiement différé en cours</span>
          </div>

          <div className="bg-[#1e293b] border border-white/10 p-4 rounded-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Plafond Crédit Autorisé</span>
            <div className="text-xl font-black text-blue-400">{formatFCFA(creditLimit)}</div>
            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-1">
              <div className={`h-full rounded-full ${creditUsagePct > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${creditUsagePct}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">{creditUsagePct}% d'utilisation du plafond</span>
          </div>
        </div>

        {/* History of Debt Transactions */}
        <div className="bg-[#1e293b] border border-white/10 p-4 rounded-2xl space-y-3">
          <span className="font-extrabold text-sm text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" /> Historique des Règlements & Recouvrements
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase bg-black/20 font-bold">
                  <th className="p-2.5">Réf Reçu</th>
                  <th className="p-2.5">Date & Heure</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Mode Paiement</th>
                  <th className="p-2.5 text-right">Montant Versé</th>
                  <th className="p-2.5">Agent Caisse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clientHistory.length > 0 ? (
                  clientHistory.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/5">
                      <td className="p-2.5 font-mono font-bold text-slate-400">{tx.id}</td>
                      <td className="p-2.5 text-slate-300">{tx.date}</td>
                      <td className="p-2.5 font-bold">
                        <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-200">{tx.paymentMode}</td>
                      <td className="p-2.5 text-right font-black text-emerald-400">+{formatFCFA(tx.amount)}</td>
                      <td className="p-2.5 text-slate-400">{tx.recordedBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400">Aucun règlement antérieur enregistré pour ce client.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

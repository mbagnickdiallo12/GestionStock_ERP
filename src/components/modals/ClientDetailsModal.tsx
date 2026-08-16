"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { Building2, Mail, Phone, MapPin, ShieldCheck, Printer, History, CreditCard, Wheat } from "lucide-react";

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

  const printDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <Modal
      id={`modal-client-details-${targetClient.id}`}
      title={`Fiche Complète Client & Relevé de Compte - ${targetClient.name}`}
      size="lg"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button
            onClick={handlePrintStatement}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer Relevé Client (PDF)
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
              Fermer
            </button>
            {targetClient.balance > 0 && (
              <button
                onClick={() => {
                  closeModal();
                  openModal(`settle-debt-${targetClient.id}`);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                💵 Régler la Créance ({formatFCFA(targetClient.balance)})
              </button>
            )}
          </div>
        </div>
      )}
    >
      <div className="space-y-5 text-sm">
        
        {/* On Screen View */}
        <div className="no-print space-y-5">
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

        {/* Printable Clean A4 Format */}
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
                  RELEVÉ DE COMPTE CLIENT
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 font-semibold text-[9.5px] uppercase tracking-wider block mb-1">
                  STATUT CRÉANCE
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold inline-block border ${
                  targetClient.balance <= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  {targetClient.balance <= 0 ? "Solde Réglé (0 FCFA)" : `En attente (${formatFCFA(targetClient.balance)})`}
                </span>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-2.5 my-5 text-xs">
              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">N° de Compte / Réf Client :</span>
                <span className="font-extrabold text-slate-800 text-sm font-mono tracking-tight">{targetClient.id}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Client / Bénéficiaire :</span>
                <span className="font-extrabold text-slate-900 text-sm">{targetClient.name} • {targetClient.category}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Téléphone & Contact :</span>
                <span className="font-semibold text-slate-700 text-sm">{targetClient.phone} - {targetClient.city}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Date d'édition du relevé :</span>
                <span className="font-extrabold text-slate-800 text-sm">{printDate}</span>
              </div>
            </div>

            {/* Document Subject Title */}
            <h2 className="text-sm sm:text-base font-black text-slate-900 mb-3 tracking-tight">
              Relevé Chronologique des Règlements & Recouvrements - {settings?.companyName || "RizStock ERP"}
            </h2>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-y border-slate-200 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                    <th className="py-2 px-2">DATE & RÉF</th>
                    <th className="py-2 px-2">NATURE DE TRANSACTION</th>
                    <th className="py-2 px-2">MODE</th>
                    <th className="py-2 px-2 text-right">MONTANT VERSÉ (FCFA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientHistory.slice(0, 8).map(tx => (
                    <tr key={tx.id}>
                      <td className="py-2.5 px-2 text-slate-600 align-top whitespace-nowrap text-[10.5px]">
                        <div>{tx.date}</div>
                        <div className="font-mono font-bold text-slate-800 text-[10px]">{tx.id}</div>
                      </td>
                      <td className="py-2.5 px-2 align-top">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">Règlement de Créance</div>
                        <div className="text-slate-500 text-[10px]">Encaissé par {tx.recordedBy}</div>
                      </td>
                      <td className="py-2.5 px-2 align-top">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700">
                          {tx.paymentMode}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right font-black text-emerald-600 text-xs sm:text-sm align-top whitespace-nowrap font-mono">
                        +{formatFCFA(tx.amount)}
                      </td>
                    </tr>
                  ))}
                  {clientHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">Aucun règlement antérieur pour ce client.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Highlight Box */}
            <div className="flex justify-end my-5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 flex items-center justify-between gap-6 min-w-[280px]">
                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">SOLDE RESTANT DÛ :</span>
                <span className={`text-xl font-black font-mono tracking-tight ${targetClient.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {formatFCFA(targetClient.balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200/80 pt-3 mt-auto flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-400">
            <span>Relevé certifié conforme par {settings?.companyName || "RizStock ERP"} - NINEA {settings?.ninea || "00984521"}</span>
            <span>Document certifié électroniquement</span>
          </div>

        </div>

      </div>
    </Modal>
  );
};

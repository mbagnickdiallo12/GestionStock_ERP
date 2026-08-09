"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA } from "@/lib/utils";
import { DebtTransaction } from "@/types";

export const DebtSettlementModal: React.FC = () => {
  const { activeModal, closeModal, clients, settleClientDebt, showToast } = useApp();

  const isSettleModal = activeModal && activeModal.startsWith("settle-debt-");
  const clientId = isSettleModal ? activeModal.replace("settle-debt-", "") : null;
  const targetClient = clients.find(c => c.id === clientId);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<DebtTransaction['paymentMode']>("Wave");
  const [note, setNote] = useState("");

  if (!isSettleModal || !targetClient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      showToast("Veuillez saisir un montant de règlement valide supérieur à 0 FCFA", "error");
      return;
    }
    if (paymentAmount > targetClient.balance) {
      showToast(`Le montant versé (${formatFCFA(paymentAmount)}) dépasse la créance due (${formatFCFA(targetClient.balance)})`, "error");
      return;
    }

    settleClientDebt(targetClient.id, paymentAmount, paymentMode, note || "Recouvrement de créance client");
  };

  return (
    <Modal
      id={`settle-debt-${targetClient.id}`}
      title={`Encaisser Règlement de Créance - ${targetClient.name}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer">
            Valider le Encaissement
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client Credit Card Overview */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Client Concerné :</span>
            <strong className="text-white text-sm">{targetClient.name} ({targetClient.category})</strong>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
            <span className="text-slate-400">Solde Créance Actuel Dû :</span>
            <strong className="text-red-400 text-base font-black">{formatFCFA(targetClient.balance)}</strong>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Montant Versé / Encaissé (FCFA) *</label>
          <input
            type="number"
            required
            min={1000}
            max={targetClient.balance}
            value={paymentAmount || ''}
            onChange={(e) => setPaymentAmount(Number(e.target.value))}
            placeholder={`ex: ${targetClient.balance}`}
            className="w-full bg-[#0f172a] border border-white/15 text-emerald-400 text-base font-black px-3.5 py-2.5 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Mode de Règlement *</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as any)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="Wave">Wave / Mobile Money</option>
            <option value="Espece">Espèces (Caisse)</option>
            <option value="Virement">Virement Bancaire</option>
            <option value="Cheque">Chèque Bancaire</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Référence / Note de Remarque</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ex: Versement partiel reçu par Wave du 08/08"
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};

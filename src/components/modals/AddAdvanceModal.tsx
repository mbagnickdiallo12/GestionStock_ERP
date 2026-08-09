"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA } from "@/lib/utils";

export const AddAdvanceModal: React.FC = () => {
  const { activeModal, closeModal, employees, grantSalaryAdvance } = useApp();

  const isAdvanceModal = activeModal && activeModal.startsWith("add-advance-");
  const empId = isAdvanceModal ? activeModal.replace("add-advance-", "") : null;
  const targetEmployee = employees.find(e => e.id === empId);

  const [advanceAmount, setAdvanceAmount] = useState(25000);

  useEffect(() => {
    setAdvanceAmount(25000);
  }, [targetEmployee]);

  if (!isAdvanceModal || !targetEmployee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId || advanceAmount <= 0) return;
    grantSalaryAdvance(empId, advanceAmount);
  };

  return (
    <Modal
      id={`add-advance-${empId}`}
      title={`Accorder une Avance sur Salaire - ${targetEmployee.name}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Valider l'Avance FCFA</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl space-y-1 text-xs">
          <div className="text-slate-400">Salaire Mensuel de Base : <strong className="text-white">{formatFCFA(targetEmployee.salary)}</strong></div>
          <div className="text-slate-400">Avances déjà accumulées : <strong className="text-amber-400">{formatFCFA(targetEmployee.advances)}</strong></div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Montant de la nouvelle avance (FCFA) *</label>
          <input
            type="number"
            required
            max={targetEmployee.salary}
            value={advanceAmount}
            onChange={(e) => setAdvanceAmount(parseInt(e.target.value) || 0)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-base font-bold px-3 py-2 rounded-xl outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};

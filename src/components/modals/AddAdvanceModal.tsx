"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA } from "@/lib/utils";
import { DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

export const AddAdvanceModal: React.FC = () => {
  const { activeModal, closeModal, employees, grantSalaryAdvance } = useApp();

  const isAdvanceModal = activeModal && (activeModal.startsWith("add-advance-") || activeModal.startsWith("advance-"));
  const empId = isAdvanceModal ? activeModal.replace("add-advance-", "").replace("advance-", "") : null;
  const targetEmployee = employees.find(e => e.id === empId);

  const [advanceAmount, setAdvanceAmount] = useState(25000);

  useEffect(() => {
    if (targetEmployee) {
      setAdvanceAmount(Math.min(25000, targetEmployee.salary || 25000));
    }
  }, [targetEmployee, activeModal]);

  if (!isAdvanceModal || !targetEmployee || !empId) return null;

  const maxAllowed = targetEmployee.salary || 500000;
  const remainingSalary = Math.max(0, (targetEmployee.salary || 0) - ((targetEmployee.advances || 0) + advanceAmount));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId || advanceAmount <= 0) return;
    grantSalaryAdvance(empId, advanceAmount);
  };

  const quickAmounts = [10000, 25000, 50000, 100000];

  return (
    <Modal
      id={activeModal}
      title={`Accorder une Avance sur Salaire — ${targetEmployee.name}`}
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button 
            type="button" 
            onClick={closeModal} 
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Annuler
          </button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/40 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" /> Valider l'Avance ({formatFCFA(advanceAmount)})
          </button>
        </div>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
        
        {/* Employee Summary Card */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Salarié / Bénéficiaire :</span>
            <strong className="text-white text-sm">{targetEmployee.name}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Poste & Fonction :</span>
            <span className="text-slate-300 font-semibold">{targetEmployee.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Salaire Mensuel de Base :</span>
            <strong className="text-emerald-400 font-mono text-sm">{formatFCFA(targetEmployee.salary)}</strong>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <span className="text-slate-400">Avances déjà en cours :</span>
            <strong className="text-amber-400 font-mono text-sm">{formatFCFA(targetEmployee.advances || 0)}</strong>
          </div>
        </div>

        {/* Input Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 block">
            Montant de l'avance à verser (FCFA) *
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min={1000}
              max={maxAllowed}
              step={1000}
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(parseInt(e.target.value) || 0)}
              className="w-full bg-[#0f172a] border border-white/15 text-white text-lg font-black px-4 py-2.5 rounded-xl outline-none focus:border-amber-400 font-mono"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
              FCFA
            </span>
          </div>
        </div>

        {/* Quick Amount Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold">Montants rapides :</span>
          {quickAmounts.map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => setAdvanceAmount(amt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border ${
                advanceAmount === amt
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-[#0f172a] hover:bg-white/10 text-slate-300 border-white/10"
              }`}
            >
              +{formatFCFA(amt)}
            </button>
          ))}
        </div>

        {/* Projected Impact */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-[11px]">
            <p>
              Cette avance sera automatiquement déduite sur le prochain bulletin de paie du salarié.
            </p>
            <p className="font-semibold text-amber-300">
              Cumul total des avances après validation : <span className="font-mono font-bold">{formatFCFA((targetEmployee.advances || 0) + advanceAmount)}</span>
            </p>
          </div>
        </div>

      </form>
    </Modal>
  );
};

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, CheckCircle2, Wheat } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export const PayslipModal: React.FC = () => {
  const { activeModal, closeModal, employees, depots, settings, paySalary } = useApp();

  const isPayslipModal = activeModal && activeModal.startsWith("payslip-");
  const empId = isPayslipModal ? activeModal.replace("payslip-", "") : null;
  const employee = employees.find(e => e.id === empId);

  if (!isPayslipModal || !employee) return null;

  const depot = depots.find(d => d.id === employee.depotId);

  const baseSalary = employee.salary || 0;
  const transportAllowance = employee.transportAllowance || 25000;
  const housingAllowance = employee.housingAllowance || 0;
  const grossSalary = baseSalary + transportAllowance + housingAllowance;

  const ipresRetirement = Math.round(baseSalary * 0.056);
  const advances = employee.advances || 0;
  const totalDeductions = ipresRetirement + advances;

  const netPayable = Math.max(0, grossSalary - totalDeductions);

  const handlePrint = () => {
    window.print();
  };

  const handlePaySalary = () => {
    paySalary(employee.id, netPayable);
    closeModal();
  };

  return (
    <Modal
      id={`payslip-${empId}`}
      title={`Bulletin de Paie - ${employee.name}`}
      size="lg"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
              <Printer className="w-3.5 h-3.5" /> Imprimer Bulletin (PDF)
            </button>
            <button onClick={handlePaySalary} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Valider Paiement Net
            </button>
          </div>
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-5 rounded-xl font-sans space-y-4 border border-slate-200 shadow-sm text-xs">
        {/* Header Logo & Document Title */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">{settings.companyName || "RizStock ERP"}</h1>
              <p className="text-[10px] text-slate-500">{settings.address || "Dakar, Sénégal"} • Tél: {settings.phone || "+221 33 800 00 00"}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">BULLETIN DE PAIE</h2>
            <div className="text-[10px] text-slate-600 mt-0.5 space-x-2 font-medium">
              <span>Période: <strong className="text-slate-900">Août 2026</strong></span>
              <span>•</span>
              <span>Matricule: <span className="text-slate-900 font-mono">{employee.id}</span></span>
            </div>
          </div>
        </div>

        {/* Employee Metadata Line */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Salarié / Bénéficiaire</span>
            <strong className="text-slate-900 font-bold block text-[11px]">{employee.name}</strong>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Poste Occupé</span>
            <strong className="text-slate-900 font-semibold block text-[11px]">{employee.role}</strong>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Dépôt d'Affectation</span>
            <strong className="text-slate-900 font-semibold block text-[11px]">{depot ? depot.name : "Dépôt Central"}</strong>
          </div>
        </div>

        {/* Salary Breakdown Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600 bg-slate-100">
                <th className="py-1.5 px-2.5 whitespace-nowrap">Détail des Éléments de Salaire & Déductions</th>
                <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Gains (FCFA)</th>
                <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Retenues (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              <tr className="hover:bg-slate-50">
                <td className="py-1.5 px-2.5 font-semibold text-slate-900 whitespace-nowrap">Salaire de Base Contractuel</td>
                <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">+{formatFCFA(baseSalary)}</td>
                <td className="py-1.5 px-2.5 text-right text-slate-400 font-mono whitespace-nowrap">-</td>
              </tr>
              {transportAllowance > 0 && (
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 px-2.5 font-medium text-slate-800 whitespace-nowrap">Prime Obligatoire de Transport</td>
                  <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">+{formatFCFA(transportAllowance)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                </tr>
              )}
              {housingAllowance > 0 && (
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 px-2.5 font-medium text-slate-800 whitespace-nowrap">Indemnité de Logement</td>
                  <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">+{formatFCFA(housingAllowance)}</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                </tr>
              )}
              <tr className="bg-slate-100 font-bold text-slate-900 border-t border-b border-slate-300">
                <td className="py-1.5 px-2.5 uppercase text-[10px] whitespace-nowrap">TOTAL SALAIRE BRUT DU MOIS</td>
                <td className="py-1.5 px-2.5 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">{formatFCFA(grossSalary)}</td>
                <td className="py-1.5 px-2.5 text-right text-slate-400 font-mono whitespace-nowrap">-</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">Cotisation Retraite IPRES (5.6%)</td>
                <td className="py-1.5 px-2.5 text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                <td className="py-1.5 px-2.5 text-right font-mono font-bold text-rose-700 whitespace-nowrap">-{formatFCFA(ipresRetirement)}</td>
              </tr>
              {advances > 0 && (
                <tr className="hover:bg-slate-50">
                  <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">Remboursement Avance sur Salaire</td>
                  <td className="py-1.5 px-2.5 text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                  <td className="py-1.5 px-2.5 text-right font-mono font-bold text-rose-700 whitespace-nowrap">-{formatFCFA(advances)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Net Payable Banner */}
        <div className="bg-slate-900 text-white p-2.5 rounded-lg flex items-center justify-between">
          <span className="font-bold text-[11px] uppercase text-slate-200">NET À PAYER AU SALARIÉ</span>
          <span className="text-base font-extrabold font-mono text-emerald-400">{formatFCFA(netPayable)}</span>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 font-sans text-[10px]">
          <div>
            <span className="font-bold text-slate-600 block uppercase">Signature du Salarié</span>
            <div className="h-8 border-b border-slate-300 mt-1" />
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-600 block uppercase">Visa Direction RH</span>
            <div className="h-8 border-b border-slate-300 mt-1" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

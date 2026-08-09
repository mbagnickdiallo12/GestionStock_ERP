"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, CheckCircle2, Building2, UserCheck, ShieldCheck } from "lucide-react";
import { formatFCFA, formatNumber } from "@/lib/utils";

export const PayslipModal: React.FC = () => {
  const { activeModal, closeModal, employees, depots, settings, paySalary } = useApp();

  const isPayslipModal = activeModal && activeModal.startsWith("payslip-");
  const empId = isPayslipModal ? activeModal.replace("payslip-", "") : null;
  const employee = employees.find(e => e.id === empId);

  if (!isPayslipModal || !employee) return null;

  const depot = depots.find(d => d.id === employee.depotId);

  // Dynamic salary calculations (West African HR standard structure)
  const baseSalary = employee.salary || 0;
  const transportAllowance = employee.transportAllowance || 25000;
  const housingAllowance = employee.housingAllowance || 0;
  const grossSalary = baseSalary + transportAllowance + housingAllowance;

  // Social & tax deductions
  const ipresRetirement = Math.round(baseSalary * 0.056); // 5.6% Pension IPRES/CSS
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
      title={`Bulletin de Paie Officiel - ${employee.name}`}
      size="lg"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
            Fermer
          </button>
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimer Bulletin PDF
          </button>
          <button onClick={handlePaySalary} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer">
            <CheckCircle2 className="w-4 h-4" /> Valider Paiement Net
          </button>
        </>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans space-y-6 border border-slate-200">
        {/* Header Company Logo & Document Title */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#1e4d35] text-white flex items-center justify-center font-black text-xl shadow-sm">
                RZ
              </div>
            )}
            <div>
              <div className="font-black text-slate-900 text-lg tracking-tight">{settings.companyName}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">{settings.address}</p>
              <p className="text-[11px] text-slate-500">Tel: {settings.phone} | NINEA: {settings.rccm}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-1">
              BULLETIN DE PAIE DU MOIS
            </span>
            <div className="text-xs text-slate-500 mt-1">Période: <strong className="text-slate-900">Août 2026</strong></div>
            <div className="text-xs text-slate-500">Matricule: <strong className="text-slate-900">{employee.id}</strong></div>
          </div>
        </div>

        {/* Employee HR Metadata Card */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Employé / Bénéficiaire</span>
            <strong className="text-sm font-extrabold text-slate-900">{employee.name}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Poste & Département</span>
            <strong className="text-sm font-extrabold text-slate-900">{employee.role}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Dépôt d'Affectation</span>
            <strong className="text-sm font-extrabold text-slate-900">{depot ? depot.name : "Dépôt Central"}</strong>
          </div>
        </div>

        {/* Salary Elements Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                <th className="p-3">Détail des Éléments de Salaire & Déductions</th>
                <th className="p-3 text-right">Gains (FCFA)</th>
                <th className="p-3 text-right">Retenues (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900">Salaire de Base de Contractuel</td>
                <td className="p-3 text-right font-bold text-slate-900 font-mono">+{formatFCFA(baseSalary)}</td>
                <td className="p-3 text-right text-slate-400 font-mono">-</td>
              </tr>
              {transportAllowance > 0 && (
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Prime Obligatoire de Transport</td>
                  <td className="p-3 text-right font-bold text-slate-900 font-mono">+{formatFCFA(transportAllowance)}</td>
                  <td className="p-3 text-right text-slate-400 font-mono">-</td>
                </tr>
              )}
              {housingAllowance > 0 && (
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Indemnité de Logement</td>
                  <td className="p-3 text-right font-bold text-slate-900 font-mono">+{formatFCFA(housingAllowance)}</td>
                  <td className="p-3 text-right text-slate-400 font-mono">-</td>
                </tr>
              )}
              <tr className="bg-slate-100/50 font-bold text-slate-900 border-t border-slate-200">
                <td className="p-3 font-black">TOTAL SALAIRE BRUT DU MOIS</td>
                <td className="p-3 text-right text-emerald-800 font-black font-mono">{formatFCFA(grossSalary)}</td>
                <td className="p-3 text-right text-slate-400 font-mono">-</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-800">Cotisation Sociale Retraite IPRES (5.6%)</td>
                <td className="p-3 text-right text-slate-400 font-mono">-</td>
                <td className="p-3 text-right font-bold text-red-600 font-mono">-{formatFCFA(ipresRetirement)}</td>
              </tr>
              {advances > 0 && (
                <tr className="bg-amber-50/60">
                  <td className="p-3 font-bold text-amber-900">Remboursement Avance sur Salaire en cours</td>
                  <td className="p-3 text-right text-slate-400 font-mono">-</td>
                  <td className="p-3 text-right font-bold text-amber-700 font-mono">-{formatFCFA(advances)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Reference Model Dark Green Capsule Total Block */}
        <div className="bg-[#1e4d35] text-white p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="font-black text-xs uppercase tracking-wider block">NET À PAYER AU SALARIÉ</span>
            <span className="text-[11px] text-emerald-200 font-medium">Déductions IPRES et avances sur salaire régularisées</span>
          </div>
          <div className="text-2xl font-black font-mono">
            {formatFCFA(netPayable)}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-6 text-xs border-t border-slate-200">
          <div>
            <p className="font-bold text-slate-700">Signature du Salarié :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700">Signature & Cachet Direction RH :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2 flex items-center justify-end text-[10px] text-slate-400 font-semibold italic">
              {settings.companyName} DRH
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

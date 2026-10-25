"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, CheckCircle2, Calendar } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export const PayslipModal: React.FC = () => {
  const { activeModal, closeModal, employees, depots, settings, paySalary } = useApp();

  const isPayslipModal = activeModal && activeModal.startsWith("payslip-");
  const empId = isPayslipModal ? activeModal.replace("payslip-", "") : null;
  const employee = employees.find(e => e.id === empId);

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const now = new Date();
  const currentYear = now.getFullYear();
  const defaultCurrentMonth = `${monthNames[now.getMonth()]} ${currentYear}`;

  const [payMonth, setPayMonth] = useState(defaultCurrentMonth);

  // Month options: 12 months of current year, and last 3 months of previous year
  const availableMonths = [
    `Août ${currentYear}`,
    `Septembre ${currentYear}`,
    `Octobre ${currentYear}`,
    `Novembre ${currentYear}`,
    `Décembre ${currentYear}`,
    ...monthNames.map(m => `${m} ${currentYear}`)
  ].filter((v, i, a) => a.indexOf(v) === i);

  useEffect(() => {
    if (employee && employee.lastPay && employee.lastPay !== "Jamais" && employee.lastPay !== "En attente") {
      setPayMonth(defaultCurrentMonth);
    }
  }, [employee, defaultCurrentMonth]);

  if (!isPayslipModal || !employee) return null;

  const depot = depots.find(d => d.id === employee.depotId);

  const baseSalary = employee.salary || 0;
  const transportAllowance = employee.transportAllowance ?? 0;
  const housingAllowance = employee.housingAllowance ?? 0;
  const grossSalary = baseSalary + transportAllowance + housingAllowance;

  const advances = employee.advances || 0;
  const totalDeductions = advances;

  const netPayable = Math.max(0, grossSalary - totalDeductions);

  const handlePrint = () => {
    window.print();
  };

  const handlePaySalary = () => {
    paySalary(employee.id, netPayable, payMonth);
    closeModal();
  };

  const isAlreadyPaidForMonth = employee.lastPay === payMonth;

  return (
    <Modal
      id={`payslip-${empId}`}
      title={`Bulletin de Paie - ${employee.name}`}
      size="lg"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all">
              <Printer className="w-3.5 h-3.5" /> Imprimer Bulletin (PDF)
            </button>
            <button 
              onClick={handlePaySalary} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/30 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Valider Paiement Net ({payMonth})
            </button>
          </div>
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      {/* Month Selection Bar (No Print) */}
      <div className="no-print mb-4 bg-slate-900/90 border border-white/10 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Mois & Période du Salaire :</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={payMonth}
            onChange={(e) => setPayMonth(e.target.value)}
            className="bg-[#1e293b] border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span className={`px-2 py-1 rounded text-[11px] font-bold border ${
            isAlreadyPaidForMonth 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {isAlreadyPaidForMonth ? "Déjà Réglé" : "À Payer"}
          </span>
        </div>
      </div>

      <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans border border-slate-200/80 shadow-md">
        
        {/* Top Content Group */}
        <div>
          {/* Header: Logo & Title + Status Badge */}
          <div className="flex justify-between items-start pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#1e1b4b] tracking-tight">
                    {settings.companyName ? settings.companyName.split(" ")[0].toLowerCase() : "rizstock"}
                  </span>
                </div>
              )}
              <span className="text-slate-400 font-bold uppercase text-[10.5px] tracking-wider pl-3 border-l border-slate-200">
                BULLETIN DE PAIE & SALAIRE
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-semibold text-[9.5px] uppercase tracking-wider block mb-1">
                STATUT PAIE ({payMonth})
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold inline-block border ${
                isAlreadyPaidForMonth 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {isAlreadyPaidForMonth ? 'Payé / Réglé' : 'Prêt pour Règlement'}
              </span>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-2.5 my-5 text-xs">
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Matricule & Référence Salarié :</span>
              <span className="font-extrabold text-slate-800 text-sm font-mono tracking-tight">{employee.id}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Salarié / Bénéficiaire :</span>
              <span className="font-extrabold text-slate-900 text-sm">{employee.name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Fonction / Poste :</span>
              <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 inline-block">
                {employee.role} • Contrat {employee.contractType || 'CDI'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Dépôt d'Affectation :</span>
              <span className="font-semibold text-slate-700 text-sm">{depot ? depot.name : "Dépôt Central"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Période de Règlement :</span>
              <span className="font-extrabold text-emerald-700 text-sm">{payMonth}</span>
            </div>
          </div>

          {/* Document Subject Title */}
          <h2 className="text-sm sm:text-base font-black text-slate-900 mb-3 tracking-tight">
            Bulletin de Paie & Reçu d'Émoluments - {settings.companyName || "RizStock ERP"}
          </h2>

          {/* Gains & Deductions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-y border-slate-200 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                  <th className="py-2 px-2">RUBRIQUE SALARIALE</th>
                  <th className="py-2 px-2">BASE / TAUX</th>
                  <th className="py-2 px-2 text-right">GAINS (FCFA)</th>
                  <th className="py-2 px-2 text-right">RETENUES (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-2 font-bold text-slate-900">Salaire de Base Contractuel</td>
                  <td className="py-2.5 px-2 text-slate-500 font-mono">100.0%</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-slate-900 font-mono">{formatFCFA(baseSalary)}</td>
                  <td className="py-2.5 px-2 text-right text-slate-400 font-mono">-</td>
                </tr>
                {transportAllowance > 0 && (
                  <tr>
                    <td className="py-2.5 px-2 font-bold text-slate-900">Indemnité de Transport Légale</td>
                    <td className="py-2.5 px-2 text-slate-500 font-mono">Forfait Mensuel</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-slate-900 font-mono">{formatFCFA(transportAllowance)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 font-mono">-</td>
                  </tr>
                )}
                {housingAllowance > 0 && (
                  <tr>
                    <td className="py-2.5 px-2 font-bold text-slate-900">Prime de Logement & Sujétion</td>
                    <td className="py-2.5 px-2 text-slate-500 font-mono">Forfait</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-slate-900 font-mono">{formatFCFA(housingAllowance)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 font-mono">-</td>
                  </tr>
                )}
                {advances > 0 ? (
                  <tr>
                    <td className="py-2.5 px-2 font-bold text-slate-900">Remboursement Acomptes sur Salaire</td>
                    <td className="py-2.5 px-2 text-slate-500 font-mono">Déduction</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 font-mono">-</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-red-600 font-mono">-{formatFCFA(advances)}</td>
                  </tr>
                ) : (
                  <tr>
                    <td className="py-2.5 px-2 text-slate-500 italic">Aucune retenue ou acompte sur ce mois</td>
                    <td className="py-2.5 px-2 text-slate-400 font-mono">-</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 font-mono">-</td>
                    <td className="py-2.5 px-2 text-right text-slate-400 font-mono">0 FCFA</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Highlight Box */}
          <div className="flex justify-end my-5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 flex items-center justify-between gap-6 min-w-[300px]">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">NET À PAYER ({payMonth}) :</span>
              <span className="text-xl font-black text-emerald-600 font-mono tracking-tight">{formatFCFA(netPayable)}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200/80 text-xs">
            <div>
              <span className="font-bold text-slate-600 block uppercase text-[9.5px] tracking-wider mb-0.5">Direction RH</span>
              <p className="text-[9.5px] text-slate-400">Pour approbation de la paie</p>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-600 block uppercase text-[9.5px] tracking-wider mb-0.5">Signature Salarié</span>
              <p className="text-[9.5px] text-slate-400">Reconnaissance de réception des fonds</p>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/80 pt-3 mt-auto flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-400">
          <span>Bulletin édité par {settings.companyName || "RizStock ERP"}</span>
          <span>Période : {payMonth} &bull; Document certifié électroniquement</span>
        </div>

      </div>
    </Modal>
  );
};

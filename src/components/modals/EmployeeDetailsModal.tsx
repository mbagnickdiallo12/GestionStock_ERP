"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA } from "@/lib/utils";
import { User, Phone, Mail, MapPin, Calendar, FileText, Building2, ShieldCheck, DollarSign, Edit, Printer, PlusCircle } from "lucide-react";

export const EmployeeDetailsModal: React.FC = () => {
  const { activeModal, closeModal, employees, depots, openModal } = useApp();

  const isDetailsModal = activeModal && activeModal.startsWith("employee-details-");
  const empId = isDetailsModal ? activeModal.replace("employee-details-", "") : null;
  const employee = employees.find(e => e.id === empId);

  if (!isDetailsModal || !employee) return null;

  const depotObj = depots.find(d => d.id === employee.depotId);

  const grossSalary = (employee.salary || 0) + (employee.transportAllowance || 0) + (employee.housingAllowance || 0);

  return (
    <Modal
      id={`employee-details-${empId}`}
      title={`Fiche RH & Dossier Personnel - ${employee.name}`}
      size="lg"
      footer={(
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeModal();
                openModal(`payslip-${employee.id}`);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4" /> Générer Bulletin de Paie
            </button>
            <button
              onClick={() => {
                closeModal();
                openModal(`advance-${employee.id}`);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4" /> Avance sur Salaire
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeModal();
                openModal(`edit-employee-${employee.id}`);
              }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-4 h-4" /> Modifier Fiche
            </button>
            <button onClick={closeModal} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
              Fermer
            </button>
          </div>
        </div>
      )}
    >
      <div className="space-y-5 text-sm">
        {/* Header Profile Banner */}
        <div className="bg-[#0f172a] border border-white/15 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black text-xl shadow-lg uppercase shrink-0">
              {employee.firstName ? employee.firstName.charAt(0) : employee.name.charAt(0)}
              {employee.lastName ? employee.lastName.charAt(0) : ''}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">{employee.name}</h3>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-mono">
                  {employee.id}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold">{employee.role}</p>
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {depotObj ? depotObj.name : employee.depotId}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
              employee.contractType === 'CDI' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
              employee.contractType === 'CDD' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
              'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              Contrat {employee.contractType || 'CDI'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Embauché le: {employee.hireDate || '2023-01-01'}</span>
          </div>
        </div>

        {/* Section 1: Identité & Etat Civil */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-2xl space-y-3">
          <span className="font-extrabold text-xs text-white uppercase tracking-wider block border-b border-white/10 pb-2">
            🪪 Identité & État Civil
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Prénom & Nom</span>
              <strong className="text-white text-sm">{employee.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Date & Lieu de Naissance</span>
              <strong className="text-slate-200">{employee.birthDate || "14/05/1990"} à {employee.birthPlace || "Dakar"}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">N° CNI (Identité Nationale)</span>
              <strong className="text-emerald-400 font-mono">{employee.cniNumber || "1 757 1990 00123"}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block font-semibold">Adresse Résidentielle</span>
              <strong className="text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> {employee.address || "Dakar, Sénégal"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">N° Sécurité Sociale (IPRES/CSS)</span>
              <strong className="text-amber-400 font-mono">{employee.socialSecurityNum || "IPRES-89012-SN"}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Coordonnées & Urgence */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-2xl space-y-3">
          <span className="font-extrabold text-xs text-white uppercase tracking-wider block border-b border-white/10 pb-2">
            📞 Contacts & Urgence RH
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Téléphone Portable</span>
              <strong className="text-white font-mono flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> {employee.phone || "+221 77 000 00 00"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Adresse Email</span>
              <strong className="text-slate-200 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> {employee.email || "employe@gdrs-riz.sn"}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Contact Urgence (Accident)</span>
              <strong className="text-red-300 font-medium">{employee.emergencyContact || "Famille - +221 77 123 45 67"}</strong>
            </div>
          </div>
        </div>

        {/* Section 3: Rémunération & Avances */}
        <div className="bg-[#0f172a] border border-emerald-500/30 p-4 rounded-2xl space-y-3">
          <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block border-b border-white/10 pb-2 flex justify-between items-center">
            <span>💰 Structure de Rémunération & Paie</span>
            <span className="text-[10px] text-slate-400 font-normal">Dernier bulletin: {employee.lastPay}</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#1e293b] p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block mb-1">Salaire de Base</span>
              <strong className="text-white font-mono text-sm">{formatFCFA(employee.salary)}</strong>
            </div>

            <div className="bg-[#1e293b] p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block mb-1">Prime Transport</span>
              <strong className="text-emerald-400 font-mono text-sm">+{formatFCFA(employee.transportAllowance || 0)}</strong>
            </div>

            <div className="bg-[#1e293b] p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block mb-1">Indemnité Logement</span>
              <strong className="text-emerald-400 font-mono text-sm">+{formatFCFA(employee.housingAllowance || 0)}</strong>
            </div>

            <div className="bg-[#1e293b] p-3 rounded-xl border border-emerald-500/40">
              <span className="text-emerald-400 block font-bold mb-1">Salaire Brut Mensuel</span>
              <strong className="text-emerald-400 font-mono text-base">{formatFCFA(grossSalary)}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs mt-2">
            <span className="text-amber-400 font-semibold">Cumul Avances en cours non déduites :</span>
            <strong className="text-amber-400 font-mono text-sm">{formatFCFA(employee.advances)}</strong>
          </div>
        </div>
      </div>
    </Modal>
  );
};

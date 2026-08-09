"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Employee } from "@/types";

export const EditEmployeeModal: React.FC = () => {
  const { activeModal, closeModal, employees, depots, updateEmployee } = useApp();

  const isEditModal = activeModal && activeModal.startsWith("edit-employee-");
  const empId = isEditModal ? activeModal.replace("edit-employee-", "") : null;
  const targetEmployee = employees.find(e => e.id === empId);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [depotId, setDepotId] = useState("dep-1");
  const [contractType, setContractType] = useState<Employee['contractType']>("CDI");
  const [salary, setSalary] = useState(350000);
  const [transportAllowance, setTransportAllowance] = useState(25000);
  const [housingAllowance, setHousingAllowance] = useState(0);
  const [advances, setAdvances] = useState(0);

  const [cniNumber, setCniNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [socialSecurityNum, setSocialSecurityNum] = useState("");

  useEffect(() => {
    if (targetEmployee) {
      setName(targetEmployee.name);
      setRole(targetEmployee.role);
      setDepotId(targetEmployee.depotId);
      setContractType(targetEmployee.contractType || "CDI");
      setSalary(targetEmployee.salary);
      setTransportAllowance(targetEmployee.transportAllowance || 25000);
      setHousingAllowance(targetEmployee.housingAllowance || 0);
      setAdvances(targetEmployee.advances);

      setCniNumber(targetEmployee.cniNumber || "");
      setPhone(targetEmployee.phone || "");
      setEmail(targetEmployee.email || "");
      setAddress(targetEmployee.address || "");
      setBirthDate(targetEmployee.birthDate || "");
      setBirthPlace(targetEmployee.birthPlace || "");
      setEmergencyContact(targetEmployee.emergencyContact || "");
      setSocialSecurityNum(targetEmployee.socialSecurityNum || "");
    }
  }, [targetEmployee]);

  if (!isEditModal || !targetEmployee) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empId) return;
    updateEmployee(empId, {
      name,
      role,
      depotId,
      contractType,
      salary,
      transportAllowance,
      housingAllowance,
      advances,
      cniNumber,
      phone,
      email,
      address,
      birthDate,
      birthPlace,
      emergencyContact,
      socialSecurityNum
    });
  };

  return (
    <Modal
      id={`edit-employee-${empId}`}
      title={`Modifier Fiche RH: ${targetEmployee.name}`}
      size="lg"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Enregistrer Modifications</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Identity & Role */}
        <div className="border-b border-white/10 pb-3">
          <span className="font-extrabold text-emerald-400 uppercase tracking-wider block mb-2">🪪 Identité Salarié & Contrat</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-400 block mb-1">Nom & Prénom *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">N° CNI (Carte Identité)</label>
              <input type="text" value={cniNumber} onChange={(e) => setCniNumber(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">Poste / Fonction</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Type de Contrat</label>
              <select value={contractType} onChange={(e) => setContractType(e.target.value as Employee['contractType'])} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none cursor-pointer">
                <option value="CDI">Contrat CDI</option>
                <option value="CDD">Contrat CDD</option>
                <option value="Prestataire / Journalier">Prestataire / Journalier</option>
                <option value="Stage">Stage</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Dépôt Affecté</label>
              <select value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none cursor-pointer">
                {depots.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contacts & Birth */}
        <div className="border-b border-white/10 pb-3">
          <span className="font-extrabold text-blue-400 uppercase tracking-wider block mb-2">📍 Naissance & Coordonnées</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Date de Naissance</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Lieu de Naissance</label>
              <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Téléphone Direct</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">Adresse Résidentielle</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Contact Urgence (Accident)</label>
              <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">N° IPRES / CSS</label>
              <input type="text" value={socialSecurityNum} onChange={(e) => setSocialSecurityNum(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div>
          <span className="font-extrabold text-amber-400 uppercase tracking-wider block mb-2">💰 Rémunération & Avances</span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Salaire de Base FCFA *</label>
              <input type="number" required value={salary} onChange={(e) => setSalary(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Prime Transport FCFA</label>
              <input type="number" value={transportAllowance} onChange={(e) => setTransportAllowance(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Indemnité Logement FCFA</label>
              <input type="number" value={housingAllowance} onChange={(e) => setHousingAllowance(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Avances en Cours FCFA</label>
              <input type="number" value={advances} onChange={(e) => setAdvances(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

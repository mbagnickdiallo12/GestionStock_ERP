"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Employee } from "@/types";

export const AddEmployeeModal: React.FC = () => {
  const { depots, addEmployee, closeModal } = useApp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("Manutentionnaire");
  const [depotId, setDepotId] = useState(depots[0]?.id || "");
  const [contractType, setContractType] = useState<Employee['contractType']>("CDI");
  const [salary, setSalary] = useState(0);
  const [transportAllowance, setTransportAllowance] = useState(0);
  const [housingAllowance, setHousingAllowance] = useState(0);

  React.useEffect(() => {
    if (depots.length > 0 && !depotId) {
      setDepotId(depots[0].id);
    }
  }, [depots, depotId]);

  const [cniNumber, setCniNumber] = useState("");
  const [phone, setPhone] = useState("+221 ");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("1992-06-15");
  const [birthPlace, setBirthPlace] = useState("Dakar");
  const [hireDate, setHireDate] = useState("2026-08-01");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [socialSecurityNum, setSocialSecurityNum] = useState("IPRES-");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) return;

    addEmployee({
      name: fullName,
      firstName,
      lastName,
      role,
      depotId,
      salary,
      transportAllowance,
      housingAllowance,
      contractType,
      cniNumber,
      phone,
      email,
      address,
      birthDate,
      birthPlace,
      hireDate,
      emergencyContact,
      socialSecurityNum
    });

    setFirstName("");
    setLastName("");
    setCniNumber("");
  };

  return (
    <Modal
      id="modal-add-employee"
      title="Créer une Fiche RH Salarié Complète"
      size="lg"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Enregistrer Fiche RH</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Section 1: Identity */}
        <div className="border-b border-white/10 pb-3">
          <span className="font-extrabold text-emerald-400 uppercase tracking-wider block mb-2">🪪 Identité Salarié & Contrat</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Prénom *</label>
              <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="ex: Cheikh Tidiane" className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Nom *</label>
              <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="ex: Sall" className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">N° CNI (Carte Identité)</label>
              <input type="text" value={cniNumber} onChange={(e) => setCniNumber(e.target.value)} placeholder="ex: 1 757 1992 00412" className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">Poste / Fonction</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="ex: Chef Magasinier" className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
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

        {/* Section 2: Birth & Contacts */}
        <div className="border-b border-white/10 pb-3">
          <span className="font-extrabold text-blue-400 uppercase tracking-wider block mb-2">📍 Naissance & Coordonnées</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Date de Naissance</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Lieu de Naissance</label>
              <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="ex: Dakar, Thiès" className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Téléphone Direct</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ex: +221 77 123 45 67" className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">Adresse Résidentielle</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ex: Maristes Villa N° 12" className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Contact Urgence (Accident)</label>
              <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="ex: Épouse - +221 77 600 00 00" className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">N° IPRES / CSS</label>
              <input type="text" value={socialSecurityNum} onChange={(e) => setSocialSecurityNum(e.target.value)} placeholder="ex: IPRES-89012-SN" className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
          </div>
        </div>

        {/* Section 3: Salary Structure */}
        <div>
          <span className="font-extrabold text-amber-400 uppercase tracking-wider block mb-2">💰 Rémunération & Primes</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Salaire de Base FCFA *</label>
              <input type="number" required value={salary} onChange={(e) => setSalary(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Prime Légale Transport FCFA</label>
              <input type="number" value={transportAllowance} onChange={(e) => setTransportAllowance(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Indemnité Logement FCFA</label>
              <input type="number" value={housingAllowance} onChange={(e) => setHousingAllowance(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none" />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";

export const AddDepotModal: React.FC = () => {
  const { addDepot, closeModal } = useApp();

  const [name, setName] = useState("");
  const [city, setCity] = useState("Dakar");
  const [capacity, setCapacity] = useState(30000);
  const [manager, setManager] = useState("");
  const [phone, setPhone] = useState("+221 ");
  const [status, setStatus] = useState<'Actif' | 'Inactif' | 'Maintenance'>("Actif");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !manager) return;

    addDepot({
      name,
      city,
      capacity,
      manager,
      phone,
      status
    });

    setName("");
    setManager("");
    setPhone("+221 ");
  };

  return (
    <Modal
      id="modal-add-depot"
      title="Créer un Nouveau Dépôt de Riz"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
            Annuler
          </button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
            Enregistrer Dépôt
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="sm:col-span-2">
          <label className="font-semibold text-slate-400 block mb-1">Nom du Dépôt *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Dépôt 5 - Saint-Louis Port"
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-400 block mb-1">Ville / Emplacement *</label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="ex: Saint-Louis, Kaolack, Ziguinchor"
            className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-400 block mb-1">Capacité Maximale (Sacs 50kg) *</label>
          <input
            type="number"
            required
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
            className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-400 block mb-1">Nom du Gérant Responsable *</label>
          <input
            type="text"
            required
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            placeholder="ex: Cheikh Tidiane Ndiaye"
            className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-400 block mb-1">Téléphone Contact</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="ex: +221 77 123 45 67"
            className="w-full bg-[#0f172a] border border-white/15 text-white font-mono px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="font-semibold text-slate-400 block mb-1">Statut d'Opérabilité</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Actif' | 'Inactif' | 'Maintenance')}
            className="w-full bg-[#0f172a] border border-white/15 text-white px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="Actif">🟢 Actif (Prêt pour entrées/sorties)</option>
            <option value="Maintenance">🟡 En Maintenance / Extension</option>
            <option value="Inactif">🔴 Inactif</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

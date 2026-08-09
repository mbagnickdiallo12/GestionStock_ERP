"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";

export const EditDepotModal: React.FC = () => {
  const { activeModal, closeModal, depots, updateDepot } = useApp();

  const isEditModal = activeModal && activeModal.startsWith("edit-depot-");
  const depotId = isEditModal ? activeModal.replace("edit-depot-", "") : null;
  const targetDepot = depots.find(d => d.id === depotId);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [capacity, setCapacity] = useState(50000);
  const [manager, setManager] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"Actif" | "Inactif" | "Maintenance">("Actif");

  useEffect(() => {
    if (targetDepot) {
      setName(targetDepot.name);
      setCity(targetDepot.city);
      setCapacity(targetDepot.capacity);
      setManager(targetDepot.manager);
      setPhone(targetDepot.phone);
      setStatus(targetDepot.status);
    }
  }, [targetDepot]);

  if (!isEditModal || !targetDepot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depotId) return;
    updateDepot(depotId, {
      name,
      city,
      capacity,
      manager,
      phone,
      status
    });
  };

  return (
    <Modal
      id={`edit-depot-${depotId}`}
      title={`Modifier le Dépôt: ${targetDepot.name}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Enregistrer Modifications</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Nom du Dépôt *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Emplacement / Ville *</label>
          <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Capacité Maximale (Sacs)</label>
          <input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Nom du Gérant *</label>
          <input type="text" required value={manager} onChange={(e) => setManager(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Téléphone de Contact</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Statut d'Opération</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none">
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

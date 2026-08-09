"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Client } from "@/types";

export const EditClientModal: React.FC = () => {
  const { activeModal, closeModal, clients, updateClient } = useApp();

  const isEditModal = activeModal && activeModal.startsWith("edit-client-");
  const clientId = isEditModal ? activeModal.replace("edit-client-", "") : null;
  const targetClient = clients.find(c => c.id === clientId);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Client['category']>("Grossiste Majeur");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [creditLimit, setCreditLimit] = useState<number>(10000000);

  useEffect(() => {
    if (targetClient) {
      setName(targetClient.name);
      setCategory(targetClient.category);
      setPhone(targetClient.phone);
      setEmail(targetClient.email || "");
      setAddress(targetClient.address || "");
      setCity(targetClient.city);
      setCreditLimit(targetClient.creditLimit || 10000000);
    }
  }, [targetClient]);

  if (!isEditModal || !targetClient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    updateClient(targetClient.id, {
      name,
      category,
      phone,
      email,
      address,
      city,
      creditLimit
    });
  };

  return (
    <Modal
      id={`edit-client-${targetClient.id}`}
      title={`Modifier Fiche Client - ${targetClient.name}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Enregistrer Modifications</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Nom / Raison Sociale *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Catégorie Commerciale</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
            <option value="Grossiste Majeur">Grossiste Majeur</option>
            <option value="Demi-Grossiste">Demi-Grossiste</option>
            <option value="Détaillant">Détaillant</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Téléphone Direct *</label>
          <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Adresse Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@entreprise.com" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Ville / Région</label>
          <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Plafond de Crédit Autorisé (FCFA)</label>
          <input type="number" step="500000" value={creditLimit} onChange={(e) => setCreditLimit(Number(e.target.value))} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none" />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-400 block mb-1">Adresse Physique Détaillée</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
      </form>
    </Modal>
  );
};

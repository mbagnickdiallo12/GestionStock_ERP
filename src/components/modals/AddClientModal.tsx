"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Client } from "@/types";

export const AddClientModal: React.FC = () => {
  const { addClient, closeModal } = useApp();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Client['category']>("Grossiste Majeur");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dakar");
  const [creditLimit, setCreditLimit] = useState<number>(10000000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addClient({
      name,
      category,
      phone,
      email,
      address,
      city,
      creditLimit
    });
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setCity("Dakar");
    setCreditLimit(10000000);
  };

  return (
    <Modal
      id="modal-add-client"
      title="Créer une Fiche Client / Partner"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Créer Client</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Nom / Raison Sociale *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Ets Mamadou & Frères" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
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
          <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 000 00 00" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Adresse Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@entreprise.com" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Ville / Région</label>
          <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dakar, Touba, Saint-Louis..." className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Plafond de Crédit Autorisé (FCFA)</label>
          <input type="number" step="500000" value={creditLimit} onChange={(e) => setCreditLimit(Number(e.target.value))} placeholder="10000000" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none" />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-400 block mb-1">Adresse Physique Détaillée</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ex: Marché Tilène, Avenue Blaise Diagne" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
      </form>
    </Modal>
  );
};

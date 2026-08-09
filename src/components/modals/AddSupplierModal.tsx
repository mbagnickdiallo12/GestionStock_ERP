"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";

export const AddSupplierModal: React.FC = () => {
  const { addSupplier, activeModal, closeModal } = useApp();

  const isOpen = activeModal === "modal-add-supplier";

  const [name, setName] = useState("");
  const [country, setCountry] = useState("Inde / Singapour");
  const [phone, setPhone] = useState("+65 6000 0000");
  const [email, setEmail] = useState("contact@supplier.com");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addSupplier({
      name,
      country,
      phone,
      email,
      leadTime: "25 Jours",
      rating: "★★★★★"
    });

    setName("");
  };

  return (
    <Modal
      id="modal-add-supplier"
      title="Ajouter un Nouveau Fournisseur"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Enregistrer Fournisseur</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Raison Sociale / Nom *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Thai Export Rice Co" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Pays / Région</label>
          <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Téléphone</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
      </form>
    </Modal>
  );
};

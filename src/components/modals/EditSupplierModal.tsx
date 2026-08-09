"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";

export const EditSupplierModal: React.FC = () => {
  const { activeModal, closeModal, suppliers, updateSupplier } = useApp();

  const isEditModal = activeModal && activeModal.startsWith("edit-supplier-");
  const supplierId = isEditModal ? activeModal.replace("edit-supplier-", "") : null;
  const targetSupplier = suppliers.find(s => s.id === supplierId);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [rating, setRating] = useState("★★★★★");

  useEffect(() => {
    if (targetSupplier) {
      setName(targetSupplier.name);
      setCountry(targetSupplier.country);
      setPhone(targetSupplier.phone);
      setEmail(targetSupplier.email);
      setLeadTime(targetSupplier.leadTime);
      setRating(targetSupplier.rating);
    }
  }, [targetSupplier]);

  if (!isEditModal || !targetSupplier) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return;
    updateSupplier(supplierId, {
      name,
      country,
      phone,
      email,
      leadTime,
      rating
    });
  };

  return (
    <Modal
      id={`edit-supplier-${supplierId}`}
      title={`Modifier Fournisseur: ${targetSupplier.name}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Enregistrer Modifications</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Raison Sociale / Nom *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Pays / Origine</label>
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
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Délai Moyen Livraison</label>
          <input type="text" value={leadTime} onChange={(e) => setLeadTime(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Évaluation / Note</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
            <option value="★★★★★">★★★★★ (5/5)</option>
            <option value="★★★★☆">★★★★☆ (4/5)</option>
            <option value="★★★☆☆">★★★☆☆ (3/5)</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

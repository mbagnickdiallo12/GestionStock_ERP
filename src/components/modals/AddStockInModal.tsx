"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";

export const AddStockInModal: React.FC = () => {
  const { activeModal, closeModal, depots, products, addStockMovement } = useApp();

  const isOpen = activeModal === "modal-stock-in";

  const [depotId, setDepotId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(500);
  const [source, setSource] = useState("Arrivage Conteneur Port");
  const [operator, setOperator] = useState("Magasinier Dépôt");
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 16));

  useEffect(() => {
    if (depots.length > 0 && !depotId) {
      setDepotId(depots[0].id);
    }
    if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
    if (!customDate) {
      setCustomDate(new Date().toISOString().slice(0, 16));
    }
  }, [depots, products, depotId, productId, customDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) return;

    const selectedDepot = depots.find(d => d.id === depotId) || depots[0];
    const selectedProd = products.find(p => p.id === productId) || products[0];

    if (!selectedDepot || !selectedProd) return;

    addStockMovement({
      depotId: selectedDepot.id,
      productId: selectedProd.id,
      type: "ENTREE",
      prodTitle: selectedProd.title,
      source: source || "Fournisseur / Port",
      dest: selectedDepot.name,
      qty: qty,
      operator: operator || "Magasinier Dépôt",
      customDate: customDate || new Date().toISOString().slice(0, 16)
    });
  };

  return (
    <Modal
      id="modal-stock-in"
      title="Entrée en Stock (Réception & Chargement)"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Valider l'Entrée Stock</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Récepteur *</label>
          <select value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
            {depots.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Variété de Riz *</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
            {products.map(p => <option key={p.id} value={p.id}>{p.title} ({p.weight}kg)</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Quantité de Sacs à Ajouter *</label>
          <input
            type="number"
            required
            min={1}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Date & Heure de l'Entrée <span className="text-emerald-400 font-normal">(modifiable)</span>
          </label>
          <input
            type="datetime-local"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-mono"
            title="Vous pouvez choisir une date antérieure pour enregistrer une rentrée passée"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Provenance / Origine Chargement</label>
          <input
            type="text"
            required
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="ex: Conteneur MSC-9012"
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Opérateur / Magasinier Responsable</label>
          <input
            type="text"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};

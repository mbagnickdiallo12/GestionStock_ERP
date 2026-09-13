"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatNumber } from "@/lib/utils";

export const AddStockOutModal: React.FC = () => {
  const { activeModal, closeModal, depots, products, stocks, addStockMovement } = useApp();

  const isOpen = activeModal === "modal-stock-out";

  const [depotId, setDepotId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(100);
  const [dest, setDest] = useState("Livraison Client Grossiste");
  const [operator, setOperator] = useState("Chauffeur Transporteur");
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

  const currentAvailable = (stocks[depotId] && stocks[depotId][productId]) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0 || qty > currentAvailable) return;

    const selectedDepot = depots.find(d => d.id === depotId) || depots[0];
    const selectedProd = products.find(p => p.id === productId) || products[0];

    if (!selectedDepot || !selectedProd) return;

    addStockMovement({
      depotId: selectedDepot.id,
      productId: selectedProd.id,
      type: "SORTIE",
      prodTitle: selectedProd.title,
      source: selectedDepot.name,
      dest: dest || "Client / Destination",
      qty: qty,
      operator: operator || "Opérateur",
      customDate: customDate || new Date().toISOString().slice(0, 16)
    });
  };

  return (
    <Modal
      id="modal-stock-out"
      title="Sortie de Stock (Déchargement & Livraison)"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button 
            onClick={handleSubmit} 
            disabled={qty > currentAvailable}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer text-white ${qty > currentAvailable ? 'bg-slate-600 opacity-50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}`}
          >
            Valider la Sortie Stock
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Expéditeur *</label>
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
          <label className="text-xs font-semibold text-slate-400 block mb-1">Quantité de Sacs à Déduire *</label>
          <input
            type="number"
            required
            min={1}
            max={currentAvailable}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">Stock disponible dans ce dépôt: <strong className="text-emerald-400">{formatNumber(currentAvailable)} sacs</strong></span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Date & Heure de la Sortie <span className="text-amber-400 font-normal">(modifiable)</span>
          </label>
          <input
            type="datetime-local"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Destinataire / Client / Motif</label>
          <input
            type="text"
            required
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="ex: Client Comptoir / Expédition Touba"
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Opérateur / Chauffeur Responsable</label>
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

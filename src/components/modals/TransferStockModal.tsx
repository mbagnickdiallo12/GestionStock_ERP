"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatNumber } from "@/lib/utils";

export const TransferStockModal: React.FC = () => {
  const { activeModal, closeModal, depots, products, stocks, transferStock, activeDepotId } = useApp();

  const isOpen = activeModal === "modal-stock-transfer";

  const [srcId, setSrcId] = useState("");
  const [destId, setDestId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(100);
  const [truck, setTruck] = useState("Camion Ceebu Touba - Chauffeur");

  // Synchronize default depot & product IDs when modal opens or depots/products load
  useEffect(() => {
    if (!isOpen) return;

    if (depots.length > 0) {
      const defaultSrc = (activeDepotId !== "all" && depots.some(d => d.id === activeDepotId))
        ? activeDepotId
        : depots[0].id;
      
      const defaultDest = depots.length > 1
        ? (depots.find(d => d.id !== defaultSrc)?.id || depots[1].id)
        : depots[0].id;

      if (!srcId || !depots.some(d => d.id === srcId)) {
        setSrcId(defaultSrc);
      }
      if (!destId || !depots.some(d => d.id === destId) || destId === defaultSrc) {
        setDestId(defaultDest);
      }
    }

    if (products.length > 0) {
      if (!productId || !products.some(p => p.id === productId)) {
        setProductId(products[0].id);
      }
    }
  }, [isOpen, depots, products, activeDepotId]);

  if (!isOpen) return null;

  const currentAvailable = (srcId && productId && stocks[srcId] && stocks[srcId][productId]) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srcId || !destId || srcId === destId || qty <= 0 || qty > currentAvailable) return;
    transferStock(srcId, destId, productId, qty, truck);
  };

  return (
    <Modal
      id="modal-stock-transfer"
      title="Transfert Inter-Dépôts par Camionnage"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors">
            Annuler
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!srcId || !destId || srcId === destId || qty <= 0 || qty > currentAvailable}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer text-white ${(!srcId || !destId || srcId === destId || qty <= 0 || qty > currentAvailable) ? 'bg-slate-600 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Valider le Transfert Inter-Dépôts
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Source (Départ) *</label>
          <select 
            value={srcId} 
            onChange={(e) => {
              const newSrc = e.target.value;
              setSrcId(newSrc);
              if (newSrc === destId) {
                const other = depots.find(d => d.id !== newSrc);
                if (other) setDestId(other.id);
              }
            }} 
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
            required
          >
            {depots.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Destination (Arrivée) *</label>
          <select 
            value={destId} 
            onChange={(e) => setDestId(e.target.value)} 
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
            required
          >
            {depots.map(d => (
              <option key={d.id} value={d.id} disabled={d.id === srcId}>
                {d.name} {d.id === srcId ? "(Déjà sélectionné en source)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Variété de Riz à Transférer *</label>
          <select 
            value={productId} 
            onChange={(e) => setProductId(e.target.value)} 
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
            required
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.weight}kg) — Stock dispo: {stocks[srcId]?.[p.id] || 0} sacs
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Quantité de Sacs *</label>
          <input
            type="number"
            required
            min={1}
            max={currentAvailable}
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Disponible au dépôt source: <strong className="text-emerald-400">{formatNumber(currentAvailable)} sacs</strong>
          </span>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-400 block mb-1">Immatriculation Camion & Chauffeur Transporteur</label>
          <input
            type="text"
            value={truck}
            placeholder="Ex: Camion Ceebu Touba - Chauffeur Modou Diop"
            onChange={(e) => setTruck(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};

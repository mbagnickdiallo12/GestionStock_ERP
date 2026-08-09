"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatNumber } from "@/lib/utils";

export const TransferStockModal: React.FC = () => {
  const { activeModal, closeModal, depots, products, stocks, transferStock } = useApp();

  const isOpen = activeModal === "modal-stock-transfer";

  const [srcId, setSrcId] = useState("dep-1");
  const [destId, setDestId] = useState("dep-2");
  const [productId, setProductId] = useState("prod-1");
  const [qty, setQty] = useState(200);
  const [truck, setTruck] = useState("Camion 10T - DK 8492 B");

  if (!isOpen) return null;

  const currentAvailable = (stocks[srcId] && stocks[srcId][productId]) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (srcId === destId || qty <= 0 || qty > currentAvailable) return;
    transferStock(srcId, destId, productId, qty, truck);
  };

  return (
    <Modal
      id="modal-stock-transfer"
      title="Transfert Inter-Dépôts par Camionnage"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button 
            onClick={handleSubmit} 
            disabled={srcId === destId || qty > currentAvailable}
            className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer text-white ${(srcId === destId || qty > currentAvailable) ? 'bg-slate-600 opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Valider le Transfert Inter-Dépôts
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Source (Départ) *</label>
          <select value={srcId} onChange={(e) => setSrcId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
            {depots.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Destination (Arrivée) *</label>
          <select value={destId} onChange={(e) => setDestId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
            {depots.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Variété de Riz à Transférer *</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
            {products.map(p => <option key={p.id} value={p.id}>{p.title} ({p.weight}kg)</option>)}
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
          <span className="text-[11px] text-slate-400 mt-1 block">Disponible au dépôt source: <strong className="text-emerald-400">{formatNumber(currentAvailable)} sacs</strong></span>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-400 block mb-1">Immatriculation Camion & Chauffeur Transporteur</label>
          <input
            type="text"
            value={truck}
            onChange={(e) => setTruck(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};

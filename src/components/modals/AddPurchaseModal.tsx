"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Purchase } from "@/types";
import { formatFCFA } from "@/lib/utils";

export const AddPurchaseModal: React.FC = () => {
  const { suppliers, depots, products, addPurchase, closeModal } = useApp();

  const [supplier, setSupplier] = useState(suppliers[0]?.name || "");
  const [depotId, setDepotId] = useState(depots[0]?.id || "");
  const [productId, setProductId] = useState(products[0]?.id || "");

  React.useEffect(() => {
    if (suppliers.length > 0 && !supplier) setSupplier(suppliers[0].name);
    if (depots.length > 0 && !depotId) setDepotId(depots[0].id);
    if (products.length > 0 && !productId) setProductId(products[0].id);
  }, [suppliers, depots, products, supplier, depotId, productId]);
  const [containers, setContainers] = useState("10 Conteneurs (40ft)");
  const [bags, setBags] = useState(5400);
  const [unitPrice, setUnitPrice] = useState(18500);
  const [blNumber, setBlNumber] = useState(`BL-MSC-${Math.floor(202600 + Math.random() * 999)}`);
  const [etaDate, setEtaDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<Purchase['status']>("En Transit");
  const [payment, setPayment] = useState<Purchase['payment']>("Acompte 50%");

  const totalCost = bags * unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDepot = depots.find(d => d.id === depotId);
    const targetProd = products.find(p => p.id === productId);

    addPurchase({
      supplier,
      depotId,
      depotName: targetDepot ? targetDepot.name : depotId,
      productId,
      productTitle: targetProd ? targetProd.title : productId,
      containers,
      bags: Number(bags),
      unitPrice: Number(unitPrice),
      totalCost,
      status,
      payment,
      blNumber,
      etaDate
    });
  };

  return (
    <Modal
      id="modal-add-purchase"
      title="Créer une Commande d'Achat & Arrivage Maritime"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Enregistrer l'Arrivage</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Fournisseur Partenaire *</label>
            <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-bold">
              {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.country})</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Récepteur *</label>
            <select value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-bold">
              {depots.map(d => <option key={d.id} value={d.id}>{d.name} ({d.city})</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Variété de Riz Commandée *</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
              {products.map(p => <option key={p.id} value={p.id}>{p.title} ({p.weight}kg)</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">N° Connaissement Maritime / BL</label>
            <input type="text" required value={blNumber} onChange={(e) => setBlNumber(e.target.value)} placeholder="BL-MSC-2026-9901" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-mono px-3 py-2 rounded-xl outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Détail Logistique (Conteneurs / Camions)</label>
            <input type="text" required value={containers} onChange={(e) => setContainers(e.target.value)} placeholder="10 Conteneurs (40ft)" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Volume de Sacs *</label>
            <input type="number" min={1} required value={bags} onChange={(e) => setBags(Number(e.target.value))} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono font-bold text-sm px-3 py-2 rounded-xl outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Prix d'Achat Unitaire par Sac (FCFA) *</label>
            <input type="number" min={0} required value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="w-full bg-[#0f172a] border border-white/15 text-white font-mono text-sm px-3 py-2 rounded-xl outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Date estimée d'Arrivée au Port (ETA)</label>
            <input type="date" value={etaDate} onChange={(e) => setEtaDate(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Statut Logistique de l'Arrivage</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none cursor-pointer">
              <option value="En Transit">🚢 En Transit Maritime (Mer)</option>
              <option value="Dédouanement">🛃 Dédouanement Portuaire</option>
              <option value="Livré">✅ Livré & Dépoté en Stock</option>
              <option value="Commandé">⏳ Commandé / Confirmation BC</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Statut du Règlement Financier</label>
            <select value={payment} onChange={(e) => setPayment(e.target.value as any)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none cursor-pointer">
              <option value="Acompte 50%">Acompte 50% Versé</option>
              <option value="Payé">Payé Intégralement (100%)</option>
              <option value="En attente">En attente de Règlement</option>
            </select>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-white/10 p-3.5 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Coût Total de la Cargaison:</span>
          <span className="text-lg font-black text-emerald-400">{formatFCFA(totalCost)}</span>
        </div>
      </form>
    </Modal>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { InventoryItem } from "@/types";
import { formatNumber } from "@/lib/utils";
import { ClipboardList, Check, AlertTriangle } from "lucide-react";

export const NewInventoryModal: React.FC = () => {
  const { activeModal, closeModal, depots, products, stocks, addInventorySession, users, activeRole } = useApp();

  const isOpen = activeModal === "modal-new-inventory";
  const activeUserObj = users.find(u => u.role.toLowerCase() === activeRole.toLowerCase()) || users[0];

  const [selectedDepotId, setSelectedDepotId] = useState(depots[0]?.id || "");
  const [auditorName, setAuditorName] = useState("");

  const [counts, setCounts] = useState<{ [prodId: string]: { actualQty: number; note: string } }>({});

  useEffect(() => {
    if (activeUserObj) {
      setAuditorName(activeUserObj.name);
    }
  }, [activeUserObj]);

  useEffect(() => {
    if (depots.length > 0) {
      const exists = depots.some(d => d.id === selectedDepotId);
      if (!exists) {
        setSelectedDepotId(depots[0].id);
      }
    }
  }, [depots, selectedDepotId]);

  useEffect(() => {
    // Populate counts default values with expected stocks
    if (selectedDepotId && stocks[selectedDepotId]) {
      const initialCounts: { [prodId: string]: { actualQty: number; note: string } } = {};
      products.forEach(p => {
        const expected = stocks[selectedDepotId][p.id] || 0;
        initialCounts[p.id] = { actualQty: expected, note: "" };
      });
      setCounts(initialCounts);
    }
  }, [selectedDepotId, products, stocks]);

  if (!isOpen) return null;

  const handleQtyChange = (prodId: string, val: number) => {
    setCounts(prev => ({
      ...prev,
      [prodId]: { ...prev[prodId], actualQty: Math.max(0, val) }
    }));
  };

  const handleNoteChange = (prodId: string, text: string) => {
    setCounts(prev => ({
      ...prev,
      [prodId]: { ...prev[prodId], note: text }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDepot = depots.find(d => d.id === selectedDepotId);
    if (!targetDepot) return;

    const items: InventoryItem[] = products.map(p => {
      const expected = (stocks[selectedDepotId] && stocks[selectedDepotId][p.id]) || 0;
      const actual = counts[p.id] ? counts[p.id].actualQty : expected;
      const note = counts[p.id] ? counts[p.id].note : "";
      return {
        productId: p.id,
        productTitle: p.title,
        expectedQty: expected,
        actualQty: actual,
        discrepancy: actual - expected,
        note
      };
    });

    const totalExpected = items.reduce((sum, i) => sum + i.expectedQty, 0);
    const totalActual = items.reduce((sum, i) => sum + i.actualQty, 0);
    const totalDiscrepancy = totalActual - totalExpected;

    addInventorySession({
      depotId: selectedDepotId,
      depotName: targetDepot.name,
      auditor: auditorName || "Gérant de Dépôt",
      status: "Clôturé",
      items,
      totalExpected,
      totalActual,
      totalDiscrepancy
    });
  };

  return (
    <Modal
      id="modal-new-inventory"
      title="Nouveau Comptage d'Inventaire Physique de Stock"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-extrabold flex items-center gap-1.5 cursor-pointer">
            <Check className="w-4 h-4" /> Enregistrer le Comptage Physique
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Depot & Auditor Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0f172a] border border-white/10 p-4 rounded-xl">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Audité *</label>
            <select
              value={selectedDepotId}
              onChange={(e) => setSelectedDepotId(e.target.value)}
              className="w-full bg-[#1e293b] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              {depots.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Responsable / Auditeur *</label>
            <input
              type="text"
              required
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="ex: Ousmane Ba"
              className="w-full bg-[#1e293b] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Physical Count Table */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-2xl space-y-3">
          <span className="font-bold text-xs text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-emerald-400" /> Saisie des Sacs Comptés Physiquement
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase bg-black/20 font-bold">
                  <th className="p-2.5">Variété de Riz</th>
                  <th className="p-2.5 text-right">Stock Système</th>
                  <th className="p-2.5 text-right">Sacs Comptés (Physique)</th>
                  <th className="p-2.5 text-right">Écart Détecté</th>
                  <th className="p-2.5">Remarque / Motifs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map(p => {
                  const expected = (stocks[selectedDepotId] && stocks[selectedDepotId][p.id]) || 0;
                  const countData = counts[p.id] || { actualQty: expected, note: "" };
                  const disc = countData.actualQty - expected;

                  return (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="p-2.5 font-bold text-white">
                        {p.title}
                        <div className="text-[10px] text-emerald-400 font-normal">{p.code} ({p.weight}kg)</div>
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-300 font-bold">{formatNumber(expected)} Sacs</td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          min={0}
                          value={countData.actualQty ?? 0}
                          onChange={(e) => handleQtyChange(p.id, Number(e.target.value))}
                          className="w-24 bg-[#1e293b] border border-white/20 text-white font-mono font-extrabold text-sm px-2.5 py-1.5 rounded-lg text-right outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5 text-right font-bold">
                        {disc === 0 ? (
                          <span className="text-slate-400">0 Sacs</span>
                        ) : disc > 0 ? (
                          <span className="text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">+ {formatNumber(disc)} (Gain)</span>
                        ) : (
                          <span className="text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">{formatNumber(disc)} (Perte)</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={countData.note || ""}
                          onChange={(e) => handleNoteChange(p.id, e.target.value)}
                          placeholder="Motif écart (sac déchiré...)"
                          className="w-full bg-[#1e293b] border border-white/10 text-white text-xs px-2.5 py-1 rounded-lg outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </Modal>
  );
};

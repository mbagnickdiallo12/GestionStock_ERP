"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatNumber } from "@/lib/utils";
import { Printer, RefreshCw, Wheat } from "lucide-react";

export const InventoryDetailsModal: React.FC = () => {
  const { activeModal, closeModal, inventories, applyInventoryAdjustment, askConfirm, settings } = useApp();

  const isDetailsModal = activeModal && activeModal.startsWith("modal-inventory-details-");
  const invId = isDetailsModal ? activeModal.replace("modal-inventory-details-", "") : null;
  const targetInv = inventories.find(i => i.id === invId);

  if (!isDetailsModal || !targetInv) return null;

  const handleApplyAdjustment = () => {
    askConfirm({
      title: "Ajuster le Stock Système ?",
      message: `Voulez-vous synchroniser définitivement le stock du dépôt "${targetInv.depotName}" avec le comptage physique de l'inventaire ${targetInv.id} ? Cette action ajustera les quantités systémiques.`,
      confirmLabel: "Oui, Appliquer l'Ajustement",
      onConfirm: () => applyInventoryAdjustment(targetInv.id),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      id={`modal-inventory-details-${targetInv.id}`}
      title={`PV d'Inventaire - ${targetInv.id}`}
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
              <Printer className="w-3.5 h-3.5" /> Imprimer PV (PDF)
            </button>
            {targetInv.status !== "Ajusté" && (
              <button
                onClick={handleApplyAdjustment}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ajuster Stock Système
              </button>
            )}
          </div>
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-5 rounded-xl font-sans space-y-4 border border-slate-200 shadow-sm text-xs">
        {/* Header Logo & Document Title */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                <Wheat className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">{settings?.companyName || "RizStock ERP"}</h1>
              <p className="text-[10px] text-slate-500">{settings?.address || "Dakar, Sénégal"} • Tél: {settings?.phone || "+221 33 800 00 00"}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">PV D'AUDIT INVENTAIRE</h2>
            <div className="text-[10px] text-slate-600 mt-0.5 space-x-2 font-medium">
              <span>N° PV: <strong className="text-slate-900 font-mono">{targetInv.id}</strong></span>
              <span>•</span>
              <span>Date: <span className="text-slate-900">{targetInv.date}</span></span>
            </div>
          </div>
        </div>

        {/* Metadata Line */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Dépôt Audité</span>
            <strong className="text-slate-900 font-bold block text-[11px]">{targetInv.depotName}</strong>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Auditeur Responsable</span>
            <strong className="text-slate-900 font-semibold block text-[11px]">{targetInv.auditor}</strong>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Statut Validation</span>
            <strong className="text-slate-900 font-semibold block text-[11px]">{targetInv.status}</strong>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-200 font-bold uppercase text-[10px] text-slate-600 bg-slate-100">
                <th className="py-1.5 px-2.5 whitespace-nowrap">Désignation du Produit</th>
                <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Système (Attendu)</th>
                <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Comptage Physique</th>
                <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Écart Constaté</th>
                <th className="py-1.5 px-2.5 text-left whitespace-nowrap">Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {targetInv.items.map(it => (
                <tr key={it.productId} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2.5 font-bold text-slate-900 whitespace-nowrap">{it.productTitle}</td>
                  <td className="py-1.5 px-2.5 text-right font-medium text-slate-700 whitespace-nowrap">{formatNumber(it.expectedQty)} Sacs</td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 whitespace-nowrap">{formatNumber(it.actualQty)} Sacs</td>
                  <td className="py-1.5 px-2.5 text-right font-bold whitespace-nowrap">
                    {it.discrepancy === 0 ? (
                      <span className="text-slate-500">0 Sac</span>
                    ) : it.discrepancy > 0 ? (
                      <span className="text-emerald-700">+{formatNumber(it.discrepancy)} Sacs</span>
                    ) : (
                      <span className="text-rose-700">{formatNumber(it.discrepancy)} Sacs</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">{it.note || "Conforme"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Minimal Summary Banner */}
        <div className="bg-slate-900 text-white p-2.5 rounded-lg flex items-center justify-between">
          <span className="font-bold text-[11px] uppercase text-slate-200">TOTAL PHYSIQUE COMPTÉ</span>
          <span className="text-base font-extrabold font-mono text-emerald-400">{formatNumber(targetInv.totalActual)} SACS</span>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 font-sans text-[10px]">
          <div>
            <span className="font-bold text-slate-600 block uppercase">Magasinier Dépôt</span>
            <div className="h-8 border-b border-slate-300 mt-1" />
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-600 block uppercase">Visa Auditeur</span>
            <div className="h-8 border-b border-slate-300 mt-1" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

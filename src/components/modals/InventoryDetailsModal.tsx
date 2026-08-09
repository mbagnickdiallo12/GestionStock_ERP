"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatNumber } from "@/lib/utils";
import { Printer, CheckCircle, AlertTriangle, RefreshCw, ClipboardCheck } from "lucide-react";

export const InventoryDetailsModal: React.FC = () => {
  const { activeModal, closeModal, inventories, applyInventoryAdjustment, askConfirm } = useApp();

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
      title={`Procès-Verbal d'Inventaire Physique - ${targetInv.id}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Fermer</button>
          {targetInv.status !== "Ajusté" && (
            <button
              onClick={handleApplyAdjustment}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30"
            >
              <RefreshCw className="w-4 h-4" /> Appliquer l'Ajustement du Stock Système
            </button>
          )}
        </>
      )}
    >
      <div className="space-y-5 text-sm">
        {/* Screen Summary Card */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              Inventaire N° {targetInv.id}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                targetInv.status === 'Ajusté' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {targetInv.status}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dépôt Audité: <strong className="text-white">{targetInv.depotName}</strong> | Auditeur: <strong className="text-white">{targetInv.auditor}</strong> | Date: <strong className="text-white">{targetInv.date}</strong>
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="bg-[#1e293b] hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-400" /> Imprimer PV PDF
          </button>
        </div>

        {/* Printable Document Box for Print / PDF */}
        <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans space-y-6 border border-slate-200">
          {/* Printable Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <div className="font-black text-slate-900 text-lg tracking-tight">GRANDS MOULINS & DÉPÔTS DE RIZ DU SÉNÉGAL (GDRS)</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Zone Industrielle de Dakar, Route du Front de Terre, Dakar - Sénégal</p>
              <p className="text-[11px] text-slate-500">Tel: +221 33 824 50 50 | NINEA: SN-DKR-2023-B-89421</p>
            </div>
            <div className="text-right">
              <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-1">
                PROCÈS-VERBAL D'AUDIT INVENTAIRE
              </span>
              <div className="text-xs text-slate-500 mt-1">N° PV: <strong className="text-slate-900">{targetInv.id}</strong></div>
              <div className="text-xs text-slate-500">Date Audit: <strong className="text-slate-900">{targetInv.date}</strong></div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 grid grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Dépôt Audité</span>
              <strong className="text-sm font-extrabold text-slate-900">{targetInv.depotName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Auditeur Responsable</span>
              <strong className="text-sm font-extrabold text-slate-900">{targetInv.auditor}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Statut Validation</span>
              <strong className="text-sm font-extrabold text-emerald-800">{targetInv.status}</strong>
            </div>
          </div>

          {/* Audit Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                  <th className="p-3">Désignation du Produit</th>
                  <th className="p-3 text-right">Système (Attendu)</th>
                  <th className="p-3 text-right">Comptage Physique</th>
                  <th className="p-3 text-right">Écart Constaté</th>
                  <th className="p-3 text-left">Motif / Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {targetInv.items.map(it => (
                  <tr key={it.productId} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">{it.productTitle}</td>
                    <td className="p-3 text-right text-slate-700 font-semibold">{formatNumber(it.expectedQty)} Sacs</td>
                    <td className="p-3 text-right font-black text-slate-900">{formatNumber(it.actualQty)} Sacs</td>
                    <td className="p-3 text-right font-extrabold">
                      {it.discrepancy === 0 ? (
                        <span className="text-slate-500">0 Sac</span>
                      ) : it.discrepancy > 0 ? (
                        <span className="text-emerald-700">+{formatNumber(it.discrepancy)} Sacs</span>
                      ) : (
                        <span className="text-red-600">{formatNumber(it.discrepancy)} Sacs</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{it.note || "Conforme"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reference Model Capsule Summary Block */}
          <div className="bg-[#1e4d35] text-white p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <span className="font-black text-xs uppercase tracking-wider block">COMPTAGE GLOBAL PHYSIQUE CONSTATÉ</span>
              <span className="text-[11px] text-emerald-200 font-medium">Stock Théorique: {formatNumber(targetInv.totalExpected)} Sacs</span>
            </div>
            <div className="text-2xl font-black font-mono">
              {formatNumber(targetInv.totalActual)} SACS
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-xs border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-700">Signature Magasinier Dépôt Audité :</p>
              <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-700">Visa Auditeur / Contrôleur Général :</p>
              <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatNumber, canManage } from "@/lib/utils";
import { Printer, RefreshCw, Wheat } from "lucide-react";

export const InventoryDetailsModal: React.FC = () => {
  const { activeModal, closeModal, inventories, applyInventoryAdjustment, askConfirm, settings, currentUser } = useApp();

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
      size="lg"
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all">
              <Printer className="w-3.5 h-3.5" /> Imprimer PV d'Inventaire (PDF)
            </button>
            {targetInv.status !== "Ajusté" && canManage(currentUser, 'inventaire') && (
              <button
                onClick={handleApplyAdjustment}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ajuster Stock Système
              </button>
            )}
          </div>
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans border border-slate-200/80 shadow-md">
        
        {/* Top Content Group */}
        <div>
          {/* Header: Logo & Title + Status Badge */}
          <div className="flex justify-between items-start pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#1e1b4b] tracking-tight">
                    {settings?.companyName ? settings.companyName.split(" ")[0].toLowerCase() : "rizstock"}
                  </span>
                </div>
              )}
              <span className="text-slate-400 font-bold uppercase text-[10.5px] tracking-wider pl-3 border-l border-slate-200">
                PV D'INVENTAIRE & AUDIT
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-semibold text-[9.5px] uppercase tracking-wider block mb-1">
                STATUT AUDIT
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold inline-block border ${
                targetInv.status === "Ajusté"
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {targetInv.status === "Ajusté" ? "Stock Ajusté" : "En cours / PV Ouvert"}
              </span>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-2.5 my-5 text-xs">
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">N° de Référence Procès-Verbal :</span>
              <span className="font-extrabold text-slate-800 text-sm font-mono tracking-tight">{targetInv.id}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Dépôt Audité & Contrôlé :</span>
              <span className="font-extrabold text-slate-900 text-sm">{targetInv.depotName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Auditeur & Commissaire aux Stocks :</span>
              <span className="font-semibold text-slate-700 text-sm">{targetInv.auditor || "Direction Audit"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Date & Heure du Recensement :</span>
              <span className="font-extrabold text-slate-800 text-sm">{targetInv.date}</span>
            </div>
          </div>

          {/* Document Subject Title */}
          <h2 className="text-sm sm:text-base font-black text-slate-900 mb-3 tracking-tight">
            Procès-Verbal de Recensement Physique Contradictoire - {settings?.companyName || "RizStock ERP"}
          </h2>

          {/* Audit Discrepancies Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-y border-slate-200 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                  <th className="py-2 px-2">VARIÉTÉ / DÉSIGNATION</th>
                  <th className="py-2 px-2 text-center">THÉORIQUE (SACS)</th>
                  <th className="py-2 px-2 text-center">PHYSIQUE (SACS)</th>
                  <th className="py-2 px-2 text-right">ÉCART CONSTATÉ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {targetInv.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-2 align-top">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{it.productTitle}</div>
                      <div className="text-slate-500 text-[10px]">{it.note || "Comptage physique unitaire contradictoire"}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-700 font-mono align-top text-xs">
                      {formatNumber(it.expectedQty)}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-900 font-mono align-top text-xs">
                      {formatNumber(it.actualQty)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-black font-mono align-top text-xs">
                      <span className={it.discrepancy === 0 ? "text-slate-400" : (it.discrepancy > 0 ? "text-emerald-600" : "text-red-600")}>
                        {it.discrepancy > 0 ? `+${it.discrepancy}` : it.discrepancy}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Highlight Box */}
          <div className="flex justify-end my-5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 flex items-center justify-between gap-6 min-w-[280px]">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">ÉCART GLOBAL TOTAL :</span>
              <span className={`text-xl font-black font-mono tracking-tight ${
                targetInv.totalDiscrepancy === 0 ? "text-slate-700" : (targetInv.totalDiscrepancy > 0 ? "text-emerald-600" : "text-red-600")
              }`}>
                {targetInv.totalDiscrepancy > 0 ? `+${formatNumber(targetInv.totalDiscrepancy)}` : formatNumber(targetInv.totalDiscrepancy)} SACS
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200/80 text-xs">
            <div>
              <span className="font-bold text-slate-600 block uppercase text-[9.5px] tracking-wider mb-0.5">Gérant du Dépôt / Magasinier</span>
              <p className="text-[9.5px] text-slate-400">Reconnaissance du comptage contradictoire</p>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-600 block uppercase text-[9.5px] tracking-wider mb-0.5">Auditeur Interne / Commissaire</span>
              <p className="text-[9.5px] text-slate-400">Pour validation et clôture du PV</p>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/80 pt-3 mt-auto flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-400">
          <span>PV d'inventaire officiel émis par {settings?.companyName || "RizStock ERP"} - NINEA {settings?.ninea || "00984521"}</span>
          <span>Document certifié électroniquement</span>
        </div>

      </div>
    </Modal>
  );
};

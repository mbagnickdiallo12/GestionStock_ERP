"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, Wheat } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const ReceptionNoteModal: React.FC = () => {
  const { activeModal, closeModal, purchases, movements, depots, settings } = useApp();

  const isBRModal = activeModal && (activeModal.startsWith("br-") || activeModal.startsWith("reception-"));
  const idRef = isBRModal ? activeModal.replace("br-", "").replace("reception-", "") : null;

  const targetPurchase = purchases.find(p => p.id === idRef);
  const targetMvt = movements.find(m => m.ref === idRef);

  if (!isBRModal || !idRef || (!targetPurchase && !targetMvt)) return null;

  const handlePrint = () => {
    window.print();
  };

  const brNumber = `BR-2026-${idRef.replace(/[^0-9]/g, "") || "001"}`;
  const dateStr = targetPurchase ? targetPurchase.date : (targetMvt ? targetMvt.date : new Date().toLocaleDateString('fr-FR'));

  const depotTarget = targetPurchase
    ? (depots.find(d => d.id === targetPurchase.depotId)?.name || targetPurchase.depotId)
    : (targetMvt ? targetMvt.dest : "Dépôt Récepteur");

  const supplierName = targetPurchase ? targetPurchase.supplier : (targetMvt ? targetMvt.source : "Provenance Conteneur");
  const containerDesc = targetPurchase ? targetPurchase.containers : "Arrivage Maritime Navire";
  const bagsCount = (targetPurchase && targetPurchase.bags > 0) ? targetPurchase.bags : ((targetMvt && targetMvt.qty > 0) ? targetMvt.qty : 1000);

  return (
    <Modal
      id={activeModal}
      title={`Bon de Réception - ${brNumber}`}
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button onClick={handlePrint} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all">
            <Printer className="w-3.5 h-3.5" /> Imprimer Bon de Réception (PDF)
          </button>
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
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[#1e1b4b] tracking-tight">
                    {settings.companyName ? settings.companyName.split(" ")[0].toLowerCase() : "rizstock"}
                  </span>
                </div>
              )}
              <span className="text-slate-400 font-bold uppercase text-[10.5px] tracking-wider pl-3 border-l border-slate-200">
                BON DE RÉCEPTION OFFICIEL
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 font-semibold text-[9.5px] uppercase tracking-wider block mb-1">
                STATUT CONTRÔLE
              </span>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded text-xs font-bold inline-block">
                Réception Conforme
              </span>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-2.5 my-5 text-xs">
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">N° de Référence Bon de Réception :</span>
              <span className="font-extrabold text-slate-800 text-sm font-mono tracking-tight">{brNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Fournisseur / Armateur Maritime :</span>
              <span className="font-extrabold text-slate-900 text-sm">{supplierName || "Armateur MSC / Cargaison"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Dépôt Réceptionnaire & Magasinier :</span>
              <span className="font-semibold text-slate-700 text-sm">{depotTarget || "Dépôt Central"}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Dossier / BL Maritime & Conteneurs :</span>
              <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 inline-block">
                {containerDesc} • Réf: {idRef}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium">Date de mise en stock :</span>
              <span className="font-extrabold text-slate-800 text-sm">{dateStr}</span>
            </div>
          </div>

          {/* Document Subject Title */}
          <h2 className="text-sm sm:text-base font-black text-slate-900 mb-3 tracking-tight">
            Procès-Verbal de Réception & Dépotage Portuaire - {settings.companyName || "RizStock ERP"}
          </h2>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-y border-slate-200 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                  <th className="py-2 px-2">DATE</th>
                  <th className="py-2 px-2">DÉSIGNATION DE LA MARCHANDISE RÉCEPTIONNÉE</th>
                  <th className="py-2 px-2 text-right">QUANTITÉ CONSTATÉE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-2 text-slate-600 align-top whitespace-nowrap text-[10.5px]">
                    {dateStr?.slice(0, 10) || "2026-08-16"}
                  </td>
                  <td className="py-2.5 px-2 align-top">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {targetPurchase?.productTitle || targetMvt?.prodTitle || "Royal Sénégal 100% Brisure (Sac 25kg)"}
                    </div>
                    <div className="text-slate-500 text-[10px] mt-0.5">
                      Conteneur 40ft dépoté • Contrôle qualité sac scellé sans avarie
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right font-black text-slate-900 text-xs sm:text-sm align-top whitespace-nowrap font-mono">
                    {formatNumber(bagsCount)} Sacs
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Highlight Box */}
          <div className="flex justify-end my-5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 flex items-center justify-between gap-6 min-w-[260px]">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">TOTAL SACS INTÉGRÉS :</span>
              <span className="text-lg font-black text-emerald-600 font-mono tracking-tight">{formatNumber(bagsCount)} SACS</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200/80 text-xs">
            <div>
              <span className="font-bold text-slate-600 block uppercase text-[9.5px] tracking-wider mb-0.5">Contrôleur Qualité / Transitaire</span>
              <p className="text-[9.5px] text-slate-400">Certification conformité plombs</p>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-600 block uppercase text-[9.5px] tracking-wider mb-0.5">Responsable Entrepôt / Magasinier</span>
              <p className="text-[9.5px] text-slate-400">Prise en compte dans le stock physique</p>
              <div className="h-10 border-b border-dashed border-slate-300 mt-1" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/80 pt-3 mt-auto flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-400">
          <span>Bon de réception officiel émis par {settings.companyName || "RizStock ERP"} - NINEA {settings.ninea || "00984521"}</span>
          <span>Document certifié électroniquement</span>
        </div>

      </div>
    </Modal>
  );
};

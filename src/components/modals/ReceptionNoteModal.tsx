"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, Wheat } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const ReceptionNoteModal: React.FC = () => {
  const { activeModal, closeModal, purchases, movements, depots, products, settings } = useApp();

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
          <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors">
            <Printer className="w-4 h-4" /> Imprimer Bon de Réception (PDF)
          </button>
          <button onClick={closeModal} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-6 rounded-xl font-sans space-y-5 border border-slate-200 shadow-sm">
        {/* Header Logo & Document Title */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                <Wheat className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">{settings.companyName || "RizStock ERP"}</h1>
              <p className="text-[11px] text-slate-500">{settings.address || "Dakar, Sénégal"} • Tél: {settings.phone || "+221 33 800 00 00"}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">BON DE RÉCEPTION</h2>
            <div className="text-[11px] text-slate-600 mt-0.5 space-x-2 font-medium">
              <span>N° BR: <strong className="text-slate-900 font-mono">{brNumber}</strong></span>
              <span>•</span>
              <span>Date: <span className="text-slate-900">{dateStr}</span></span>
            </div>
          </div>
        </div>

        {/* Logistic Metadata Line */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Fournisseur / Provenance</span>
            <strong className="text-slate-900 font-semibold truncate block">{supplierName && supplierName !== 'sup-1' ? supplierName : "Armateur MSC / Cargaison"}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Dépôt Récepteur</span>
            <strong className="text-slate-900 font-semibold truncate block">{depotTarget && depotTarget !== 'dep-1' ? depotTarget : (depots[0]?.name || "Dépôt Principal")}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Conteneurs / Navire</span>
            <strong className="text-slate-900 font-semibold truncate block">{containerDesc || "Arrivage Maritime"}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Dossier Import</span>
            <strong className="text-slate-900 font-mono truncate block">{idRef}</strong>
          </div>
        </div>

        {/* Reception Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 font-bold uppercase text-slate-600 bg-slate-100">
                <th className="py-2.5 px-3 whitespace-nowrap">Désignation du Chargement de Riz</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Déclaré</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Reçu</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Écart / Avérie</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Statut Entrée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                  {targetPurchase && targetPurchase.productTitle && targetPurchase.productTitle !== 'prod-1'
                    ? targetPurchase.productTitle
                    : (targetMvt && targetMvt.prodTitle && targetMvt.prodTitle !== 'prod-1' ? targetMvt.prodTitle : (products[0]?.title || "Royal Sénégal 100% Brisure (25kg)"))}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-700 font-medium whitespace-nowrap">{formatNumber(bagsCount)} Sacs</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">{formatNumber(bagsCount)} Sacs</td>
                <td className="py-2.5 px-3 text-center text-slate-500 whitespace-nowrap">0 Sac</td>
                <td className="py-2.5 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">Entrée Validée</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-6 text-xs border-t border-slate-200 font-sans">
          <div>
            <span className="font-bold text-slate-600 block uppercase text-[10px]">Transporteur / Transitaire Port</span>
            <div className="h-10 border-b border-slate-300 mt-2" />
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-600 block uppercase text-[10px]">Visa Magasinier Dépôt Récepteur</span>
            <div className="h-10 border-b border-slate-300 mt-2" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

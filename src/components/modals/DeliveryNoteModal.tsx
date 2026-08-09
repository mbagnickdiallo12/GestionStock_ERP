"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, Wheat } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const DeliveryNoteModal: React.FC = () => {
  const { activeModal, closeModal, sales, movements, depots, settings } = useApp();

  const isBLModal = activeModal && activeModal.startsWith("bl-");
  const idRef = isBLModal ? activeModal.replace("bl-", "") : null;

  const targetSale = sales.find(s => s.id === idRef);
  const targetMvt = movements.find(m => m.ref === idRef);

  if (!isBLModal || (!targetSale && !targetMvt)) return null;

  const handlePrint = () => {
    window.print();
  };

  const blNumber = `BL-2026-${idRef?.replace(/[^0-9]/g, "") || "001"}`;
  const dateStr = targetSale ? targetSale.date : (targetMvt ? targetMvt.date : new Date().toLocaleDateString('fr-FR'));

  const depotSource = targetSale 
    ? (depots.find(d => d.id === targetSale.depotId)?.name || targetSale.depotId)
    : (targetMvt ? targetMvt.source : "Dépôt Principal");

  const recipient = targetSale ? targetSale.clientName : (targetMvt ? targetMvt.dest : "Client / Dépôt");
  const driverOrOperator = targetMvt ? targetMvt.operator : "Transporteur Chargé";

  return (
    <Modal
      id={`bl-${idRef}`}
      title={`Bon de Livraison - ${blNumber}`}
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors">
            <Printer className="w-4 h-4" /> Imprimer Bon de Livraison (PDF)
          </button>
          <button onClick={closeModal} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-6 rounded-xl font-sans space-y-5 border border-slate-200 shadow-sm">
        {/* Header Logo & Document Info */}
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
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">BON DE LIVRAISON</h2>
            <div className="text-[11px] text-slate-600 mt-0.5 space-x-2 font-medium">
              <span>N° BL: <strong className="text-slate-900 font-mono">{blNumber}</strong></span>
              <span>•</span>
              <span>Date: <span className="text-slate-900">{dateStr}</span></span>
            </div>
          </div>
        </div>

        {/* Logistic Metadata Line */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Dépôt Expéditeur</span>
            <strong className="text-slate-900 font-semibold truncate block">{depotSource && depotSource !== 'dep-1' ? depotSource : (depots[0]?.name || "Dépôt Principal")}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Destinataire / Client</span>
            <strong className="text-slate-900 font-semibold truncate block">{recipient || "Client Grossiste"}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Chauffeur Transporteur</span>
            <strong className="text-slate-900 font-semibold truncate block">{driverOrOperator}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Référence Opération</span>
            <strong className="text-slate-900 font-mono truncate block">{idRef}</strong>
          </div>
        </div>

        {/* Articles Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 font-bold uppercase text-slate-600 bg-slate-100">
                <th className="py-2.5 px-3 whitespace-nowrap">Désignation du Sac de Riz</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Format</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Commandé</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Livré</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Conformité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {targetSale ? (
                ((targetSale.items && targetSale.items.length > 0) ? targetSale.items : [{
                  productId: "prod-1",
                  title: "Royal Sénégal 100% Brisure (25kg)",
                  qty: Math.max(1, Math.round((targetSale.totalAmount || 300000) / 15000)),
                  price: 15000
                }]).map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {it.title && it.title !== 'prod-1' ? it.title : "Royal Sénégal 100% Brisure (Sac 25kg)"}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 whitespace-nowrap">Sac Standard</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700 whitespace-nowrap">{formatNumber(it.qty || 1)} Sacs</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">{formatNumber(it.qty || 1)} Sacs</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">Conforme</td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {targetMvt?.prodTitle && targetMvt.prodTitle !== 'prod-1' ? targetMvt.prodTitle : "Royal Sénégal 100% Brisure (Sac 25kg)"}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-600 whitespace-nowrap">Sac Standard</td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-700 whitespace-nowrap">{formatNumber(targetMvt?.qty || 100)} Sacs</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">{formatNumber(targetMvt?.qty || 100)} Sacs</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-700 whitespace-nowrap">Conforme</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-3 gap-6 pt-6 text-xs border-t border-slate-200 font-sans">
          <div>
            <span className="font-bold text-slate-600 block uppercase text-[10px]">Magasinier Expéditeur</span>
            <div className="h-10 border-b border-slate-300 mt-2" />
          </div>
          <div className="text-center">
            <span className="font-bold text-slate-600 block uppercase text-[10px]">Chauffeur Transporteur</span>
            <div className="h-10 border-b border-slate-300 mt-2" />
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-600 block uppercase text-[10px]">Visa Client Récepteur</span>
            <div className="h-10 border-b border-slate-300 mt-2" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

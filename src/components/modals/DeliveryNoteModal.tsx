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
  const driverOrOperator = targetMvt ? targetMvt.operator : "Transporteur Camion Logistique";

  const totalBags = targetSale
    ? targetSale.items.reduce((sum, it) => sum + it.qty, 0)
    : (targetMvt?.qty || 500);

  const deliveryItems = targetSale ? targetSale.items : [{
    productId: "prod-mvt",
    title: targetMvt?.prodTitle || "Royal Sénégal 100% Brisure (Sac 25kg)",
    qty: targetMvt?.qty || 500,
    price: 0
  }];

  return (
    <Modal
      id={`bl-${idRef}`}
      title={`Bon de Livraison - ${blNumber}`}
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button onClick={handlePrint} className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all">
            <Printer className="w-3.5 h-3.5" /> Imprimer Bon de Livraison (PDF)
          </button>
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-8 sm:p-10 rounded-2xl font-sans border border-slate-200/80 shadow-md">
        
        {/* Header: Logo & Title + Status Badge */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#1e1b4b] tracking-tight">
                  {settings.companyName ? settings.companyName.split(" ")[0].toLowerCase() : "rizstock"}
                </span>
              </div>
            )}
            <span className="text-slate-400 font-bold uppercase text-[11px] tracking-wider pl-3 border-l border-slate-200">
              BON DE LIVRAISON OFFICIEL
            </span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block mb-1">
              STATUT LIVRAISON
            </span>
            <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-bold inline-block">
              Expédié / Livré
            </span>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="space-y-3.5 my-6 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">N° de Référence Bon de Livraison :</span>
            <span className="font-extrabold text-slate-800 text-sm font-mono tracking-tight">{blNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Destinataire / Client Réceptionnaire :</span>
            <span className="font-extrabold text-slate-900 text-sm">{recipient || "Client Grossiste"}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Dépôt Expéditeur / Origine :</span>
            <span className="font-semibold text-slate-700 text-sm">{depotSource || "Dépôt Principal"}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Transporteur / Chauffeur :</span>
            <span className="font-semibold text-slate-700 text-sm">{driverOrOperator}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Date d'expédition :</span>
            <span className="font-extrabold text-slate-800 text-sm">{dateStr}</span>
          </div>
        </div>

        {/* Document Subject Title */}
        <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 tracking-tight pt-2">
          Bon de Livraison & Décharge Logistique - {settings.companyName || "RizStock ERP"}
        </h2>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-2">DATE</th>
                <th className="py-2.5 px-2">DÉSIGNATION DE LA MARCHANDISE</th>
                <th className="py-2.5 px-2 text-right">QUANTITÉ CHARGÉE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveryItems.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 px-2 text-slate-600 align-top whitespace-nowrap text-[11px]">
                    {dateStr?.slice(0, 10) || "2026-08-16"}
                  </td>
                  <td className="py-3.5 px-2 align-top">
                    <div className="font-bold text-slate-900 text-sm">
                      {it.title}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      Conditionnement standard sacs hermétiques • Réf: {idRef}
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-right font-black text-slate-900 text-sm align-top whitespace-nowrap font-mono">
                    {formatNumber(it.qty)} Sacs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Highlight Box */}
        <div className="flex justify-end mt-8">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-6 py-3.5 flex items-center justify-between gap-8 min-w-[280px]">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TOTAL COLIS LIVRÉS :</span>
            <span className="text-lg font-black text-blue-600 font-mono tracking-tight">{formatNumber(totalBags)} SACS</span>
          </div>
        </div>

        {/* Signatures & Décharges */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-200/80 text-xs">
          <div>
            <span className="font-bold text-slate-600 block uppercase text-[10px] tracking-wider mb-1">Visa Transporteur / Chauffeur</span>
            <p className="text-[10px] text-slate-400">Mention "Pris en charge conforme"</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2" />
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-600 block uppercase text-[10px] tracking-wider mb-1">Visa & Cachet Réceptionnaire</span>
            <p className="text-[10px] text-slate-400">Date et signature du client</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/80 pt-4 mt-8 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <span>Bon de livraison officiel émis par {settings.companyName || "RizStock ERP"} - NINEA {settings.ninea || "00984521"}</span>
          <span>Document certifié électroniquement</span>
        </div>

      </div>
    </Modal>
  );
};

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer } from "lucide-react";
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
    title: targetMvt?.prodTitle || "Marchandise Riz",
    qty: targetMvt?.qty || 500,
    price: 0
  }];

  const companyAddress = settings.address || "Dakar / Touba - Sénégal";

  return (
    <Modal
      id={`bl-${idRef}`}
      title={`Bon de Livraison - ${blNumber}`}
      footer={(
        <div className="flex items-center justify-between w-full no-print">
          <button 
            onClick={handlePrint} 
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer Bon de Livraison (PDF)
          </button>
          <button 
            onClick={closeModal} 
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      )}
    >
      <div className="printable-document bg-white text-black p-8 sm:p-10 rounded-xl font-sans border border-black shadow-md mx-auto w-full max-w-[780px]">
        
        {/* Top Content Group */}
        <div>
          {/* Header: Logo, Company Info & BL Badge */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-black">
            <div className="flex items-center gap-4">
              {/* Logo without border */}
              <div className="w-14 h-14 shrink-0 flex items-center justify-center overflow-hidden">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="font-black text-2xl tracking-tighter text-black font-mono">
                    {settings.companyName ? settings.companyName.slice(0, 2).toUpperCase() : "RZ"}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black font-serif">
                  {settings.companyName || "CEEBU TOUBA"}
                </h1>
                <p className="text-xs font-bold text-black uppercase tracking-wider mt-0.5">
                  {settings.slogan || "COMMERCE GÉNÉRAL • IMPORTATION & DISTRIBUTION DE RIZ"}
                </p>
                <p className="text-xs text-black mt-0.5">
                  {companyAddress} &bull; Tél : <span className="font-bold">{settings.phone || "+221 77 855 25 50"}</span>
                </p>
                {(settings.ninea || settings.rccm) && (
                  <p className="text-[10px] text-black font-semibold mt-0.5">
                    {settings.ninea ? `NINEA : ${settings.ninea}` : ""} {settings.rccm ? `• RCCM : ${settings.rccm}` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-block border-2 border-black px-3 py-1 bg-black text-white rounded text-center">
                <span className="text-xs font-black tracking-widest uppercase">BON DE LIVRAISON</span>
              </div>
              <div className="mt-2 text-xs space-y-0.5 text-black">
                <p className="font-mono font-black text-sm">{blNumber}</p>
                <p className="text-xs font-semibold">Date : <span className="font-mono font-bold">{dateStr}</span></p>
              </div>
            </div>
          </div>

          {/* 2-Column Metadata Section */}
          <div className="grid grid-cols-2 gap-4 my-5 text-xs text-black">
            <div className="border border-black rounded-lg p-3 space-y-1.5 bg-white">
              <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-2">
                ORIGINE & EXPÉDITION
              </span>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Dépôt Expéditeur :</span>
                <span className="font-bold text-black">{depotSource || "Dépôt Principal"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Transporteur / Chauffeur :</span>
                <span className="font-bold text-black">{driverOrOperator}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Date d'enlèvement :</span>
                <span className="font-mono font-bold text-black">{dateStr}</span>
              </div>
            </div>

            <div className="border-2 border-black rounded-lg p-3 space-y-1.5 bg-white">
              <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-2">
                DESTINATAIRE / RÉCEPTIONNAIRE
              </span>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-black">Client / Réception :</span>
                <span className="font-black text-xs uppercase text-black">{recipient || "Client Grossiste"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Réf. Vente / Transfert :</span>
                <span className="font-mono font-bold text-black">{idRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-black">Statut logistique :</span>
                <span className="font-bold uppercase text-black">Livré / Conforme</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-2 border-black my-5 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs text-black">
              <thead>
                <tr className="border-b-2 border-black font-black uppercase text-center bg-slate-100 text-black">
                  <th className="py-2.5 px-3 border-r-2 border-black w-12 text-center font-black">#</th>
                  <th className="py-2.5 px-3 border-r-2 border-black text-left font-black">DÉSIGNATION DE LA MARCHANDISE</th>
                  <th className="py-2.5 px-3 border-r-2 border-black w-32 text-center font-black">CONDITIONNEMENT</th>
                  <th className="py-2.5 px-3 w-36 text-right font-black">QUANTITÉ LIVRÉE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-semibold text-black">
                {deliveryItems.map((it, idx) => (
                  <tr key={idx} className="h-10">
                    <td className="py-2 px-3 border-r-2 border-black text-center font-mono font-bold text-black">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r-2 border-black font-bold uppercase text-black">
                      {it.title}
                    </td>
                    <td className="py-2 px-3 border-r-2 border-black text-center text-xs font-semibold text-black">
                      Sacs d'origine
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black text-sm text-black">
                      {formatNumber(it.qty)} Sacs
                    </td>
                  </tr>
                ))}
                {/* Empty Spacer Rows */}
                {Array.from({ length: Math.max(0, 4 - deliveryItems.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-8">
                    <td className="border-r-2 border-black text-center text-black font-mono text-[10px]">{deliveryItems.length + i + 1}</td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Highlight Box */}
          <div className="flex justify-end my-5">
            <div className="border-2 border-black rounded-lg px-5 py-3 flex items-center justify-between gap-6 min-w-[280px] bg-white">
              <span className="text-xs font-black text-black uppercase tracking-wider">TOTAL COLIS LIVRÉS :</span>
              <span className="text-base font-black text-black font-mono tracking-tight">{formatNumber(totalBags)} SACS</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-black text-xs text-black">
            <div className="border border-black rounded-lg p-3 h-28 flex flex-col justify-between">
              <div>
                <span className="font-bold text-black block uppercase text-[10px] tracking-wider mb-0.5">VISA TRANSPORTEUR / CHAUFFEUR :</span>
                <p className="text-[9px] text-black italic">Mention « Pris en charge conforme »</p>
              </div>
              <div className="border-b border-black" />
            </div>
            <div className="border border-black rounded-lg p-3 h-28 flex flex-col justify-between text-right">
              <div>
                <span className="font-bold text-black block uppercase text-[10px] tracking-wider mb-0.5">VISA & CACHET DU RÉCEPTIONNAIRE :</span>
                <p className="text-[9px] text-black italic">Date et signature du client / magasinier</p>
              </div>
              <div className="border-b border-black" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black pt-4 mt-8 flex flex-wrap items-center justify-between gap-2 text-[10px] text-black font-medium">
          <span>Bon de livraison officiel émis par {settings.companyName || "CEEBU TOUBA"} {settings.ninea ? `• NINEA ${settings.ninea}` : ""}</span>
          <span>Gestion Logistique RizStock ERP</span>
        </div>

      </div>
    </Modal>
  );
};


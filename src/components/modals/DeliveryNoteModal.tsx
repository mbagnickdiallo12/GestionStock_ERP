"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Printer, X } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const DeliveryNoteModal: React.FC = () => {
  const { activeModal, closeModal, sales, movements, depots, settings, currentUser } = useApp();

  if (!activeModal || !activeModal.startsWith("bl-")) return null;

  const idRef = activeModal.replace("bl-", "");
  const targetSale = sales.find(s => s.id === idRef);
  const targetMvt = movements.find(m => m.ref === idRef || (m.dest && m.dest.includes(idRef)));

  if (!targetSale && !targetMvt && sales.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  // Clean BL reference without duplication
  const blNumber = idRef.startsWith("BL-")
    ? idRef
    : idRef.startsWith("FAC-")
    ? idRef.replace("FAC-", "BL-")
    : `BL-2026-${idRef.replace(/[^0-9]/g, "") || "001"}`;

  const dateStr = targetSale ? targetSale.date : (targetMvt ? targetMvt.date : new Date().toLocaleDateString('fr-FR'));

  const depotSource = targetSale 
    ? (depots.find(d => d.id === targetSale.depotId)?.name || targetSale.depotId)
    : (targetMvt ? targetMvt.source : (depots[0]?.name || "Dépôt Principal"));

  const recipient = targetSale ? (targetSale.clientName || "Client Comptoir") : (targetMvt ? targetMvt.dest : "Client Grossiste");
  const driverOrOperator = targetMvt ? targetMvt.operator : (currentUser?.name || "Transporteur Logistique");

  const totalBags = targetSale
    ? targetSale.items.reduce((sum, it) => sum + it.qty, 0)
    : (targetMvt?.qty || 500);

  const deliveryItems = targetSale && targetSale.items.length > 0 ? targetSale.items : [{
    productId: "prod-mvt",
    title: targetMvt?.prodTitle || (targetSale?.items?.[0]?.title) || "Riz Brisé 100% Non Parfumé",
    qty: targetMvt?.qty || (targetSale?.totalAmount ? Math.max(1, Math.round(targetSale.totalAmount / 15000)) : 50),
    price: 0
  }];

  const companyAddress = settings.address || (depots[0]?.city ? `${depots[0].city} - Sénégal` : "Dakar / Touba - Sénégal");

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Toolbar */}
        <div className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between no-print bg-[#0f172a]/90">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm text-white">Bon de Livraison &bull; {blNumber}</h3>
              <p className="text-xs text-slate-400">Destinataire : {recipient} &bull; {dateStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4" /> Imprimer BL (PDF A4)
            </button>
            <button 
              onClick={closeModal} 
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Printable A4 Document Sheet */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-[#090d16]/70">
          <div className="printable-document bg-white text-black p-8 sm:p-10 font-sans border border-black shadow-2xl mx-auto w-full max-w-[800px] flex flex-col justify-between min-h-[275mm]">
            
            {/* 1. TOP SECTION: Header & Logistics Details */}
            <div className="space-y-4">
              {/* Header: Logo, Company Info & BL Badge */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-black">
                <div className="flex items-center gap-4">
                  {/* Logo without border */}
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-black text-3xl tracking-tighter text-black font-mono">
                        {settings.companyName ? settings.companyName.slice(0, 2).toUpperCase() : "RZ"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-serif">
                      {settings.companyName || "CEEBU TOUBA"}
                    </h1>
                    <p className="text-xs font-bold text-black uppercase tracking-wider mt-0.5">
                      {settings.slogan || "COMMERCE GÉNÉRAL • IMPORTATION & DISTRIBUTION DE RIZ"}
                    </p>
                    <p className="text-xs text-black mt-1">
                      {companyAddress}
                    </p>
                    <p className="text-xs text-black">
                      Tél : <span className="font-bold">{settings.phone || "+221 77 855 25 50"}</span>
                      {settings.rccm ? ` • RCCM : ${settings.rccm}` : ""}
                      {settings.ninea ? ` • NINEA : ${settings.ninea}` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block border-2 border-black px-4 py-1.5 bg-black text-white rounded text-center">
                    <span className="text-xs font-black tracking-widest uppercase">BON DE LIVRAISON</span>
                  </div>
                  <div className="mt-2 text-xs space-y-0.5 text-black">
                    <p className="font-mono font-black text-base">{blNumber}</p>
                    <p className="text-xs font-semibold">Date : <span className="font-mono font-bold">{dateStr}</span></p>
                  </div>
                </div>
              </div>

              {/* 2-Column Metadata Section */}
              <div className="grid grid-cols-2 gap-4 text-xs text-black">
                <div className="border border-black rounded-lg p-3 space-y-1.5 bg-white">
                  <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-1.5">
                    ORIGINE & EXPÉDITION
                  </span>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">Dépôt Expéditeur :</span>
                    <span className="font-bold text-black">{depotSource || "Dépôt Principal"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">Transporteur / Chauffeur :</span>
                    <span className="font-bold text-black">{driverOrOperator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">Date d'enlèvement :</span>
                    <span className="font-mono font-bold text-black">{dateStr}</span>
                  </div>
                </div>

                <div className="border-2 border-black rounded-lg p-3 space-y-1.5 bg-white">
                  <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-1.5">
                    DESTINATAIRE / RÉCEPTIONNAIRE
                  </span>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-800">Client / Réception :</span>
                    <span className="font-black text-sm uppercase text-black">{recipient || "Client Grossiste"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">Réf. Vente / Transfert :</span>
                    <span className="font-mono font-bold text-black">{idRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800">Statut logistique :</span>
                    <span className="font-bold uppercase text-black">Livré / Conforme</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE SECTION: Items Table */}
            <div className="my-4 flex-1 flex flex-col justify-start">
              <div className="border-2 border-black rounded-lg overflow-hidden flex-1 flex flex-col">
                <table className="w-full text-left border-collapse text-xs text-black">
                  <thead>
                    <tr className="border-b-2 border-black font-black uppercase text-center bg-slate-100 text-black">
                      <th className="py-3 px-3 border-r-2 border-black w-14 text-center font-black">#</th>
                      <th className="py-3 px-3 border-r-2 border-black text-left font-black">DÉSIGNATION DE LA MARCHANDISE</th>
                      <th className="py-3 px-3 border-r-2 border-black w-44 text-center font-black">CONDITIONNEMENT</th>
                      <th className="py-3 px-3 w-40 text-right font-black">QUANTITÉ LIVRÉE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black font-semibold text-black">
                    {deliveryItems.map((it, idx) => (
                      <tr key={idx} className="h-12">
                        <td className="py-2.5 px-3 border-r-2 border-black text-center font-mono font-bold text-black">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r-2 border-black font-bold uppercase text-black text-xs sm:text-sm">
                          {it.title}
                        </td>
                        <td className="py-2.5 px-3 border-r-2 border-black text-center text-xs font-semibold text-black">
                          Sacs d'origine hermétiques
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-base text-black">
                          {formatNumber(it.qty)} Sacs
                        </td>
                      </tr>
                    ))}
                    {/* Empty Spacer Rows */}
                    {Array.from({ length: Math.max(0, 8 - deliveryItems.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-10">
                        <td className="border-r-2 border-black text-center text-slate-300 font-mono text-[10px]">{deliveryItems.length + i + 1}</td>
                        <td className="border-r-2 border-black"></td>
                        <td className="border-r-2 border-black"></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. BOTTOM SECTION: Total, Signatures & Footer */}
            <div className="space-y-4 pt-1">
              {/* Total Highlight Box */}
              <div className="flex justify-end">
                <div className="border-2 border-black rounded-lg px-6 py-3.5 flex items-center justify-between gap-8 min-w-[320px] bg-white">
                  <span className="text-xs font-black text-black uppercase tracking-wider">TOTAL COLIS LIVRÉS :</span>
                  <span className="text-lg font-black text-black font-mono tracking-tight">{formatNumber(totalBags)} SACS</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-2 text-xs text-black">
                <div className="border-2 border-black rounded-lg p-3.5 h-32 flex flex-col justify-between bg-white">
                  <div>
                    <span className="font-bold text-black block uppercase text-[10px] tracking-wider mb-0.5">VISA TRANSPORTEUR / CHAUFFEUR :</span>
                    <p className="text-[9px] text-slate-600 italic">Mention « Pris en charge conforme »</p>
                  </div>
                  <div className="border-b border-black" />
                </div>
                <div className="border-2 border-black rounded-lg p-3.5 h-32 flex flex-col justify-between text-right bg-white">
                  <div>
                    <span className="font-bold text-black block uppercase text-[10px] tracking-wider mb-0.5">VISA & CACHET DU RÉCEPTIONNAIRE :</span>
                    <p className="text-[9px] text-slate-600 italic">Date et signature du client / magasinier</p>
                  </div>
                  <div className="border-b border-black" />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs text-black font-semibold">
                <span>Bon de livraison officiel émis par {settings.companyName || "CEEBU TOUBA"} {settings.ninea ? `• NINEA ${settings.ninea}` : ""}</span>
                <span>Gestion Logistique RizStock ERP</span>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-[#0f172a]/90 flex items-center justify-between no-print">
          <div className="text-xs text-slate-400">
            Format A4 Standard &bull; Prêt pour l'impression
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={closeModal}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={handlePrint}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all"
            >
              <Printer className="w-4 h-4" /> Imprimer le BL (PDF A4)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};


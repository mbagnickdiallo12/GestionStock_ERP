"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Printer, X, Copy, Truck, FileText, Sparkles } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const DeliveryNoteModal: React.FC = () => {
  const { activeModal, closeModal, sales, movements, depots, settings, products, clients, currentUser } = useApp();
  const [viewMode, setViewMode] = useState<"dual" | "bl_only" | "invoice_only">("dual");

  if (!activeModal || !activeModal.startsWith("bl-")) return null;

  const idRef = activeModal.replace("bl-", "");
  const targetSale = sales.find(s => s.id === idRef);
  const targetMvt = movements.find(m => m.ref === idRef || (m.dest && m.dest.includes(idRef)));

  if (!targetSale && !targetMvt && sales.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  // Clean Reference formatting
  const cleanRefNumber = idRef.replace(/[^0-9]/g, "") || "199";
  const blCode = `BL${cleanRefNumber}`;
  const factureCode = `FC${cleanRefNumber}`;

  const dateStr = targetSale ? targetSale.date : (targetMvt ? targetMvt.date : new Date().toLocaleDateString('fr-FR'));
  const timeStr = "18:27";

  const depotSource = targetSale 
    ? (depots.find(d => d.id === targetSale.depotId)?.name || targetSale.depotId)
    : (targetMvt ? targetMvt.source : (depots[0]?.name || "Dépôt Principal"));

  const matchedClient = clients.find(c => c.name.toLowerCase() === (targetSale?.clientName || "").toLowerCase());
  const recipient = (targetSale ? (targetSale.clientName || "CLIENT COMPTOIR") : (targetMvt ? targetMvt.dest : "CLIENT GROSSISTE")).toUpperCase();
  const recipientPhone = matchedClient?.phone || "77 608 55 76";

  const driverOrOperator = targetMvt ? targetMvt.operator : (currentUser?.name || "SUPERVISEUR").toUpperCase();

  const totalAmount = targetSale?.totalAmount || 0;
  const isPaid = targetSale ? (targetSale.status === 'Payé' || !targetSale.status || targetSale.paymentMode !== 'Credit') : true;
  const reglement = isPaid ? totalAmount : 0;
  const resteAPayer = isPaid ? 0 : totalAmount;

  // Delivery items
  let deliveryItems = targetSale && targetSale.items && targetSale.items.length > 0 ? targetSale.items : [];
  if (deliveryItems.length === 0) {
    if (targetMvt) {
      const p = products.find(prod => prod.title.toLowerCase() === targetMvt.prodTitle.toLowerCase());
      deliveryItems = [{
        productId: p ? p.id : "prod-mvt",
        title: targetMvt.prodTitle,
        qty: targetMvt.qty,
        price: p ? p.sellPrice : 8250
      }];
    } else if (products.length > 0) {
      const p = products[0];
      deliveryItems = [{
        productId: p.id,
        title: p.title,
        qty: 30,
        price: p.sellPrice || 8250
      }];
    }
  }

  const totalBags = deliveryItems.reduce((acc, it) => acc + (it.qty || 0), 0);

  // Clean company branding
  const companyName = settings.companyName || "TERANGA BOUTIQUE";
  const companyAddress = settings.address || "ROUTE DE NDINDY TOUBA";
  const companySubAddress = `SIÈGE SOCIAL : ${depots[0]?.city ? depots[0].city.toUpperCase() : "TOUBA MARCHÉ OCASS"}`;
  const companyPhone = settings.phone || "77 591 30 40 / 77 719 11 18";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* Scoped Dynamic Print Styling for single-sheet A4 landscape */}
      <style>{`
        @media print {
          @page {
            size: ${viewMode === "dual" ? "A4 landscape" : "A4 portrait"};
            margin: ${viewMode === "dual" ? "3mm 5mm 3mm 5mm" : "8mm 10mm 8mm 10mm"};
          }
          .printable-dual-sheet {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 198mm !important;
            max-height: 198mm !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Toolbar */}
        <div className="px-5 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 no-print bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Bon de Livraison & Facture &bull; {idRef}</span>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  2 Volets sur 1 Feuille A4
                </span>
              </h3>
              <p className="text-xs text-slate-400">Destinataire : {recipient} &bull; {dateStr}</p>
            </div>
          </div>

          {/* View Mode Toggle Controls */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-white/10 rounded-xl p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("dual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "dual"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Imprimer Facture et Bon de Livraison sur 1 seule feuille A4"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>2-en-1 (Facture + BL)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("bl_only")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "bl_only"
                    ? "bg-slate-700 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>BL seul</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("invoice_only")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "invoice_only"
                    ? "bg-slate-700 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Facture seule</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer (1 Feuille A4)</span>
            </button>

            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Sheet Viewport */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#090d16]/80">
          
          {/* ========================================================================= */}
          {/* 🌟 1. DUAL-VOLET MODE (FACTURE + BON DE LIVRAISON SIDE-BY-SIDE ON 1 PAGE) */}
          {/* ========================================================================= */}
          {viewMode === "dual" && (
            <div className="printable-document printable-dual-sheet bg-white text-black p-4 sm:p-6 font-sans border border-black shadow-2xl mx-auto w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-dashed divide-black min-h-[195mm]">
              
              {/* ==================== VOLET GAUCHE : FACTURE ==================== */}
              <div className="flex flex-col justify-between pr-0 md:pr-4 space-y-2 h-full">
                <div>
                  <div className="flex items-center gap-3 pb-2 border-b border-black">
                    <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-xl tracking-tight shrink-0 overflow-hidden bg-white">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span>TB</span>
                      )}
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="flex justify-between items-start">
                        <h2 className="font-extrabold text-sm uppercase tracking-tight text-black">{companyName}</h2>
                        <span className="text-[10px] font-semibold text-black">{companyAddress}</span>
                      </div>
                      <div className="text-[9.5px] text-black mt-0.5 flex flex-wrap justify-between gap-1">
                        <span>{companySubAddress}</span>
                        <span className="font-bold">TEL : {companyPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-black text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-white px-1.5 py-0.5 text-[10px] font-black uppercase">FACTURE</span>
                      <span className="font-mono text-sm">{factureCode}</span>
                    </div>
                    <div className="font-mono text-[11px] text-black">
                      {dateStr} &nbsp; {timeStr}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b-2 border-black text-xs font-bold">
                    <span className="uppercase text-black truncate max-w-[200px]">{recipient}</span>
                    <span className="font-mono text-black">{recipientPhone}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-start my-1 border-2 border-black overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase bg-slate-100 text-black">
                        <th className="py-1 px-1.5 border-r border-black w-10 text-center">Qté</th>
                        <th className="py-1 px-2 border-r border-black">Désignation</th>
                        <th className="py-1 px-1.5 border-r border-black w-16 text-right">PU</th>
                        <th className="py-1 px-2 w-20 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold">
                      {deliveryItems.map((it, idx) => (
                        <tr key={idx} className="h-6">
                          <td className="py-1 px-1.5 border-r border-black text-center font-mono font-bold text-black">{it.qty}</td>
                          <td className="py-1 px-2 border-r border-black font-bold uppercase text-black text-[10px]">{it.title}</td>
                          <td className="py-1 px-1.5 border-r border-black text-right font-mono font-bold text-black">{formatNumber(it.price || 8250)}</td>
                          <td className="py-1 px-2 text-right font-mono font-bold text-black">{formatNumber((it.price || 8250) * it.qty)}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 8 - deliveryItems.length) }).map((_, i) => (
                        <tr key={`empty-inv-${i}`} className="h-5">
                          <td className="border-r border-black text-center text-transparent">.</td>
                          <td className="border-r border-black"></td>
                          <td className="border-r border-black"></td>
                          <td></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-1">
                  <div className="grid grid-cols-12 gap-2 items-start text-[10.5px]">
                    <div className="col-span-6 space-y-1">
                      <div className="flex justify-between text-black font-semibold text-[10px]">
                        <span>Facturé par :</span>
                        <span className="font-bold">{driverOrOperator}</span>
                      </div>
                      <div className="flex justify-between text-black font-semibold text-[10px]">
                        <span>Solde échéance :</span>
                        <span className="font-bold font-mono">{formatNumber(resteAPayer)}</span>
                      </div>
                      <div className="border border-black p-1 rounded text-[8.5px] text-slate-700 leading-tight">
                        <span className="font-bold text-black">NB : </span>
                        Marchandise vendue ni reprise ni échangée après livraison.
                      </div>
                    </div>

                    <div className="col-span-6 border-2 border-black rounded p-1.5 space-y-1 bg-slate-50">
                      <div className="flex justify-between items-center text-black font-black text-xs">
                        <span>Net à payer :</span>
                        <span className="font-mono text-sm">{formatNumber(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[10.5px] pt-0.5 border-t border-black/30">
                        <span>Règlement :</span>
                        <span className="font-mono">{formatNumber(reglement)}</span>
                      </div>
                      {resteAPayer > 0 && (
                        <div className="flex justify-between items-center text-red-700 font-bold text-[10px] pt-0.5 border-t border-black/30">
                          <span>Reste dû :</span>
                          <span className="font-mono">{formatNumber(resteAPayer)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== VOLET DROIT : BON DE LIVRAISON ==================== */}
              <div className="flex flex-col justify-between pl-0 md:pl-4 space-y-2 h-full pt-4 md:pt-0">
                <div>
                  <div className="flex items-center gap-3 pb-2 border-b border-black">
                    <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-xl tracking-tight shrink-0 overflow-hidden bg-white">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span>TB</span>
                      )}
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="flex justify-between items-start">
                        <h2 className="font-extrabold text-sm uppercase tracking-tight text-black">{companyName}</h2>
                        <span className="text-[10px] font-semibold text-black">{companyAddress}</span>
                      </div>
                      <div className="text-[9.5px] text-black mt-0.5 flex flex-wrap justify-between gap-1">
                        <span>{companySubAddress}</span>
                        <span className="font-bold">TEL : {companyPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-black text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-white px-1.5 py-0.5 text-[10px] font-black uppercase">BON DE LIVRAISON</span>
                      <span className="font-mono text-sm">{blCode}</span>
                    </div>
                    <div className="font-mono text-[11px] text-black">
                      {dateStr} &nbsp; {timeStr}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b-2 border-black text-xs font-bold">
                    <span className="uppercase text-black truncate max-w-[200px]">{recipient}</span>
                    <span className="font-mono text-black">{recipientPhone}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-start my-1 border-2 border-black overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase bg-slate-100 text-black">
                        <th className="py-1 px-1.5 border-r border-black w-10 text-center">Qté</th>
                        <th className="py-1 px-2 border-r border-black">Désignation</th>
                        <th className="py-1 px-1.5 border-r border-black w-16 text-right">PU</th>
                        <th className="py-1 px-2 w-20 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold">
                      {deliveryItems.map((it, idx) => (
                        <tr key={idx} className="h-6">
                          <td className="py-1 px-1.5 border-r border-black text-center font-mono font-bold text-black">{it.qty}</td>
                          <td className="py-1 px-2 border-r border-black font-bold uppercase text-black text-[10px]">{it.title}</td>
                          <td className="py-1 px-1.5 border-r border-black text-right font-mono font-bold text-black">{formatNumber(it.price || 8250)}</td>
                          <td className="py-1 px-2 text-right font-mono font-bold text-black">{formatNumber((it.price || 8250) * it.qty)}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 8 - deliveryItems.length) }).map((_, i) => (
                        <tr key={`empty-bl-${i}`} className="h-5">
                          <td className="border-r border-black text-center text-transparent">.</td>
                          <td className="border-r border-black"></td>
                          <td className="border-r border-black"></td>
                          <td></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-1">
                  <div className="grid grid-cols-12 gap-2 items-start text-[10.5px]">
                    <div className="col-span-6 space-y-1">
                      <div className="flex justify-between text-black font-semibold text-[10px]">
                        <span>Livré par :</span>
                        <span className="font-bold">{driverOrOperator}</span>
                      </div>
                      <div className="flex justify-between text-black font-semibold text-[10px]">
                        <span>Dépôt Source :</span>
                        <span className="font-bold">{depotSource}</span>
                      </div>
                      <div className="border border-black p-1 rounded text-[8.5px] text-slate-700 leading-tight">
                        <span className="font-bold text-black">Signature Client : </span>
                        Marchandise reçue conforme.
                      </div>
                    </div>

                    <div className="col-span-6 border-2 border-black rounded p-1.5 space-y-1 bg-slate-50">
                      <div className="flex justify-between items-center text-black font-black text-xs">
                        <span>Total Sacs :</span>
                        <span className="font-mono text-sm">{totalBags} sacs</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[10.5px] pt-0.5 border-t border-black/30">
                        <span>Net à payer :</span>
                        <span className="font-mono">{formatNumber(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[10px] pt-0.5 border-t border-black/30">
                        <span>Règlement :</span>
                        <span className="font-mono">{formatNumber(reglement)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 🚚 2. SINGLE BL MODE                                                     */}
          {/* ========================================================================= */}
          {viewMode === "bl_only" && (
            <div className="printable-document bg-white text-black p-8 sm:p-10 font-sans border border-black shadow-2xl mx-auto w-full max-w-[800px] flex flex-col justify-between min-h-[270mm]">
              <div className="space-y-4">
                <div className="pb-4 border-b-2 border-black flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-2xl tracking-tight shrink-0 overflow-hidden bg-white">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span>TB</span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-black uppercase tracking-tight text-black font-serif">{companyName}</h1>
                      <p className="text-xs font-bold text-black uppercase tracking-wider mt-0.5">{companyAddress}</p>
                      <p className="text-xs text-black mt-1">{companySubAddress} &bull; Tél : <span className="font-bold">{companyPhone}</span></p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="inline-block border-2 border-black px-4 py-1.5 bg-black text-white rounded text-center">
                      <span className="text-sm font-black tracking-widest uppercase">BON DE LIVRAISON</span>
                    </div>
                    <div className="mt-2 text-xs space-y-0.5 text-black">
                      <p className="font-mono font-black text-base">N° {blCode}</p>
                      <p className="text-xs font-semibold">Date : <span className="font-mono font-bold">{dateStr} {timeStr}</span></p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-black">
                  <div className="border border-black rounded-lg p-3 space-y-1.5 bg-white">
                    <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-1.5">ORIGINE & LOGISTIQUE</span>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Dépôt Expéditeur :</span><span className="font-bold">{depotSource}</span></div>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Opérateur / Livré par :</span><span className="font-bold uppercase">{driverOrOperator}</span></div>
                  </div>
                  <div className="border-2 border-black rounded-lg p-3 space-y-1.5 bg-white">
                    <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-1.5">DESTINATAIRE / RÉCEPTIONNAIRE</span>
                    <div className="flex justify-between items-baseline"><span className="text-slate-800 font-semibold">Client :</span><span className="font-black text-sm uppercase text-black">{recipient}</span></div>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Téléphone :</span><span className="font-mono font-bold text-black">{recipientPhone}</span></div>
                  </div>
                </div>
              </div>

              <div className="my-4 flex-1 flex flex-col justify-start">
                <div className="border-2 border-black rounded-lg overflow-hidden flex-1 flex flex-col">
                  <table className="w-full text-left border-collapse text-xs text-black">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase text-center bg-slate-100 text-black">
                        <th className="py-2.5 px-3 border-r-2 border-black w-14 text-center font-black">#</th>
                        <th className="py-2.5 px-3 border-r-2 border-black text-left font-black">DÉSIGNATION DE LA MARCHANDISE</th>
                        <th className="py-2.5 px-3 border-r-2 border-black w-44 text-center font-black">CONDITIONNEMENT</th>
                        <th className="py-2.5 px-3 w-40 text-right font-black">QUANTITÉ LIVRÉE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold text-black">
                      {deliveryItems.map((it, idx) => (
                        <tr key={idx} className="h-10">
                          <td className="py-2 px-3 border-r-2 border-black text-center font-mono font-bold text-black">{idx + 1}</td>
                          <td className="py-2 px-3 border-r-2 border-black font-bold uppercase text-black text-xs sm:text-sm">{it.title}</td>
                          <td className="py-2 px-3 border-r-2 border-black text-center text-xs font-semibold text-black">Sacs d'origine 25kg/50kg</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-base text-black">{it.qty} Sacs</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 10 - deliveryItems.length) }).map((_, i) => (
                        <tr key={`empty-bl-${i}`} className="h-9">
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

              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-6 items-start">
                  <div className="border border-black rounded-lg p-3 h-24 flex flex-col justify-between text-xs">
                    <span className="font-bold text-black uppercase text-[10px]">POUR LE TRANSPORTEUR / DÉPÔT :</span>
                    <span className="text-[10px] text-slate-600 italic">Signature & Visa d'expédition</span>
                  </div>
                  <div className="border-2 border-black rounded-lg p-3 h-24 flex flex-col justify-between text-xs text-right bg-slate-50">
                    <span className="font-black text-black uppercase text-[10px]">DÉCHARGE DU CLIENT RÉCEPTIONNAIRE :</span>
                    <span className="text-[10px] text-slate-600 italic">Mention "Reçu conforme sans réserve" + Signature</span>
                  </div>
                </div>
                <div className="pt-3 border-t-2 border-black text-center text-xs text-black font-semibold">
                  <p>{companyName} &bull; {companyAddress} &bull; Tél : {companyPhone}</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 📄 3. SINGLE FACTURE MODE                                                */}
          {/* ========================================================================= */}
          {viewMode === "invoice_only" && (
            <div className="printable-document bg-white text-black p-8 sm:p-10 font-sans border border-black shadow-2xl mx-auto w-full max-w-[800px] flex flex-col justify-between min-h-[270mm]">
              <div className="space-y-4">
                <div className="pb-4 border-b-2 border-black flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-2xl tracking-tight shrink-0 overflow-hidden bg-white">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span>TB</span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-black uppercase tracking-tight text-black font-serif">{companyName}</h1>
                      <p className="text-xs font-bold text-black uppercase tracking-wider mt-0.5">{companyAddress}</p>
                      <p className="text-xs text-black mt-1">{companySubAddress} &bull; Tél : <span className="font-bold">{companyPhone}</span></p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="inline-block border-2 border-black px-4 py-1.5 bg-black text-white rounded text-center">
                      <span className="text-sm font-black tracking-widest uppercase">FACTURE</span>
                    </div>
                    <div className="mt-2 text-xs space-y-0.5 text-black">
                      <p className="font-mono font-black text-base">N° {factureCode}</p>
                      <p className="text-xs font-semibold">Date : <span className="font-mono font-bold">{dateStr} {timeStr}</span></p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-black">
                  <div className="border border-black rounded-lg p-3 space-y-1.5 bg-white">
                    <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-1.5">DÉTAILS OPÉRATION</span>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Facturé par :</span><span className="font-bold uppercase font-mono">{driverOrOperator}</span></div>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Dépôt :</span><span className="font-bold uppercase">{depotSource}</span></div>
                  </div>
                  <div className="border-2 border-black rounded-lg p-3 space-y-1.5 bg-white">
                    <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-1.5">FACTURÉ À / CLIENT</span>
                    <div className="flex justify-between items-baseline"><span className="text-slate-800 font-semibold">Nom :</span><span className="font-black text-sm uppercase text-black">{recipient}</span></div>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Téléphone :</span><span className="font-mono font-bold text-black">{recipientPhone}</span></div>
                  </div>
                </div>
              </div>

              <div className="my-4 flex-1 flex flex-col justify-start">
                <div className="border-2 border-black rounded-lg overflow-hidden flex-1 flex flex-col">
                  <table className="w-full text-left border-collapse text-xs text-black">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase text-center bg-slate-100 text-black">
                        <th className="py-2.5 px-3 border-r-2 border-black w-14 text-center font-black">#</th>
                        <th className="py-2.5 px-3 border-r-2 border-black text-left font-black">DÉSIGNATION DES MARCHANDISES</th>
                        <th className="py-2.5 px-3 border-r-2 border-black w-28 text-center font-black">QUANTITÉ</th>
                        <th className="py-2.5 px-3 border-r-2 border-black w-32 text-right font-black">PRIX UNIT.</th>
                        <th className="py-2.5 px-3 w-36 text-right font-black">TOTAL (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold text-black">
                      {deliveryItems.map((it, idx) => (
                        <tr key={idx} className="h-10">
                          <td className="py-2 px-3 border-r-2 border-black text-center font-mono font-bold text-black">{idx + 1}</td>
                          <td className="py-2 px-3 border-r-2 border-black font-bold uppercase text-black text-xs sm:text-sm">{it.title}</td>
                          <td className="py-2 px-3 border-r-2 border-black text-center font-mono font-bold text-black text-xs sm:text-sm">{it.qty} sacs</td>
                          <td className="py-2 px-3 border-r-2 border-black text-right font-mono font-bold text-black">{formatNumber(it.price || 8250)}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-black">{formatNumber((it.price || 8250) * it.qty)}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 10 - deliveryItems.length) }).map((_, i) => (
                        <tr key={`empty-${i}`} className="h-9">
                          <td className="border-r-2 border-black text-center text-slate-300 font-mono text-[10px]">{deliveryItems.length + i + 1}</td>
                          <td className="border-r-2 border-black"></td>
                          <td className="border-r-2 border-black"></td>
                          <td className="border-r-2 border-black"></td>
                          <td></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-12 gap-5 items-start">
                  <div className="col-span-7">
                    <div className="border border-black rounded-lg p-3.5 bg-slate-50">
                      <span className="text-[10px] uppercase font-black text-black block mb-1">TOTAL COMMANDE MARCHANDISE :</span>
                      <p className="text-xs sm:text-sm font-serif font-black italic text-black leading-snug">
                        {totalBags} Sacs livrés
                      </p>
                    </div>
                  </div>

                  <div className="col-span-5 border-2 border-black rounded-xl overflow-hidden bg-white p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-black font-black text-sm">
                      <span className="uppercase tracking-tight">NET À PAYER :</span>
                      <span className="font-mono text-base font-black">{formatNumber(totalAmount)} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-black text-xs">
                      <span className="font-semibold text-slate-800">Montant Réglé :</span>
                      <span className="font-mono font-bold text-black">{formatNumber(reglement)} FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-black text-center text-xs text-black font-semibold">
                  <p>{companyName} &bull; {companyAddress} &bull; Tél : {companyPhone}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0f172a] flex items-center justify-between no-print">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Format optimisé &bull; Économie de papier 50% &bull; Facture et BL combinés</span>
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
              <Printer className="w-4 h-4" />
              <span>Imprimer (1 Feuille A4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { Printer, X, Copy, FileText, Truck, Sparkles, Edit3 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatNumber, numberToWordsFR } from "@/lib/utils";

export const InvoiceModal: React.FC = () => {
  const { activeModal, openModal, closeModal, sales, depots, settings, movements, products, clients, currentUser } = useApp();
  const [viewMode, setViewMode] = useState<"dual" | "invoice_only">("dual");

  if (!activeModal || !activeModal.startsWith("invoice-")) return null;

  const saleId = activeModal.replace("invoice-", "").replace("preview-", "");
  const sale = sales.find(s => s.id === saleId) || sales[0];

  if (!sale) return null;

  const depot = depots.find(d => d.id === sale.depotId);
  const matchedClient = clients.find(c => c.name.toLowerCase() === (sale.clientName || "").toLowerCase());

  const handlePrint = () => {
    window.print();
  };

  // Find real items
  let saleItems = (sale.items && sale.items.length > 0) ? sale.items : [];
  if (saleItems.length === 0) {
    const matchedMvt = movements.find(m => m.dest && m.dest.includes(sale.id));
    if (matchedMvt) {
      const p = products.find(prod => prod.title.toLowerCase() === matchedMvt.prodTitle.toLowerCase());
      saleItems = [{
        productId: p ? p.id : "prod-mvt",
        title: matchedMvt.prodTitle,
        qty: matchedMvt.qty,
        price: p ? p.sellPrice : Math.round((sale.totalAmount || 0) / Math.max(1, matchedMvt.qty))
      }];
    } else if (products.length > 0) {
      const p = products[0];
      saleItems = [{
        productId: p.id,
        title: p.title,
        qty: Math.max(1, Math.round((sale.totalAmount || 0) / (p.sellPrice || 15000))),
        price: p.sellPrice
      }];
    }
  }

  const isPaid = sale.status === 'Payé' || !sale.status || sale.paymentMode !== 'Credit';
  const reglement = isPaid ? sale.totalAmount : 0;
  const resteAPayer = isPaid ? 0 : sale.totalAmount;
  const totalBags = saleItems.reduce((acc, it) => acc + (it.qty || 0), 0);

  // Clean company branding
  const companyName = settings.companyName || "TERANGA BOUTIQUE";
  const companyAddress = settings.address || "ROUTE DE NDINDY TOUBA";
  const companySubAddress = `SIÈGE SOCIAL : ${depot?.city ? depot.city.toUpperCase() : "TOUBA MARCHÉ OCASS"}`;
  const companyPhone = settings.phone || "77 591 30 40 / 77 719 11 18";
  
  // Format clean references
  const cleanRefNumber = sale.id.replace(/[^0-9]/g, "") || "199";
  const factureCode = `FC${cleanRefNumber}`;
  const blCode = `BL${cleanRefNumber}`;
  
  const clientNameDisplay = (sale.clientName || "CLIENT COMPTOIR").toUpperCase();
  const clientPhone = matchedClient?.phone || "—";

  // Format Date & Time cleanly
  const formattedDateTime = sale.date ? sale.date.replace("T", " ") : new Date().toLocaleDateString('fr-FR');

  const supervisorName = (currentUser?.name || "SUPERVISEUR").toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {/* Dynamic Print CSS calibrated strictly for 1 single A4 sheet */}
      <style>{`
        @media print {
          @page {
            size: ${viewMode === "dual" ? "A4 landscape" : "A4 portrait"};
            margin: ${viewMode === "dual" ? "4mm 5mm" : "6mm 8mm"};
          }
          html, body {
            height: 100vh !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .printable-dual-sheet {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            padding: 2mm 4mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 14px !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
          }
          .printable-single-portrait {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            padding: 4mm 6mm !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            break-inside: avoid !important;
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
                <span>Facture de Vente &bull; {sale.id}</span>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {viewMode === "dual" ? "Double Facture (2x sur 1 Feuille A4)" : "1 Facture Plein Format"}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Client : {clientNameDisplay} &bull; {formattedDateTime}</p>
            </div>
          </div>

          {/* View Mode Toggle Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                closeModal();
                setTimeout(() => openModal(`edit-sale-${sale.id}`), 100);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Modifier les articles, le prix, la date ou les détails de cette facture"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modifier Facture</span>
            </button>

            <div className="bg-slate-900 border border-white/10 rounded-xl p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("dual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "dual"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Imprimer 2 Factures identiques côte-à-côte sur 1 seule feuille A4"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>2x Factures (1 Feuille A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("invoice_only")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "invoice_only"
                    ? "bg-slate-700 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Imprimer 1 seule Facture plein format portrait"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1 Facture Plein Format</span>
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
            <div className="printable-document printable-dual-sheet bg-white text-black p-3 sm:p-5 font-sans border border-black shadow-2xl mx-auto w-full max-w-[1050px] grid grid-cols-1 md:grid-cols-2 gap-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-dashed divide-black">
              
              {/* ==================== VOLET GAUCHE : FACTURE ==================== */}
              <div className="flex flex-col justify-between pr-0 md:pr-3 space-y-1.5 h-full">
                
                {/* 1. Header */}
                <div>
                  <div className="flex items-center gap-2.5 pb-1.5 border-b border-black">
                    <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-lg tracking-tight shrink-0 overflow-hidden bg-white">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span>TB</span>
                      )}
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="flex justify-between items-start">
                        <h2 className="font-extrabold text-xs sm:text-sm uppercase tracking-tight text-black">{companyName}</h2>
                        <span className="text-[9px] font-semibold text-black">{companyAddress}</span>
                      </div>
                      <div className="text-[8.5px] text-black mt-0.5 flex flex-wrap justify-between gap-1">
                        <span>{companySubAddress}</span>
                        <span className="font-bold">TEL : {companyPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Document Reference Bar */}
                  <div className="flex justify-between items-center py-1 border-b border-black text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-black uppercase">FACTURE</span>
                      <span className="font-mono text-xs">{factureCode}</span>
                    </div>
                    <div className="font-mono text-[10px] text-black">
                      {formattedDateTime}
                    </div>
                  </div>

                  {/* 3. Client Information Bar */}
                  <div className="flex justify-between items-center py-0.5 border-b-2 border-black text-[11px] font-bold">
                    <span className="uppercase text-black truncate max-w-[180px]">{clientNameDisplay}</span>
                    <span className="font-mono text-black">{clientPhone}</span>
                  </div>
                </div>

                {/* 4. Table Grid */}
                <div className="flex-1 flex flex-col justify-start my-1 border-2 border-black overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase bg-slate-100 text-black">
                        <th className="py-1 px-1 border-r border-black w-8 text-center">Qté</th>
                        <th className="py-1 px-1.5 border-r border-black">Désignation</th>
                        <th className="py-1 px-1 border-r border-black w-14 text-right">PU</th>
                        <th className="py-1 px-1.5 w-18 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold">
                      {saleItems.map((it, idx) => (
                        <tr key={idx} className="h-5">
                          <td className="py-0.5 px-1 border-r border-black text-center font-mono font-bold text-black">
                            {it.qty}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black font-bold uppercase text-black text-[9.5px]">
                            {it.title}
                          </td>
                          <td className="py-0.5 px-1 border-r border-black text-right font-mono font-bold text-black">
                            {sale.paymentMode === 'Cadeau' ? "0" : formatNumber(it.price)}
                          </td>
                          <td className="py-0.5 px-1.5 text-right font-mono font-bold text-black">
                            {sale.paymentMode === 'Cadeau' ? "0" : formatNumber(it.price * it.qty)}
                          </td>
                        </tr>
                      ))}
                      {/* Empty spacer rows */}
                      {Array.from({ length: Math.max(0, 5 - saleItems.length) }).map((_, i) => (
                        <tr key={`empty-inv-${i}`} className="h-4">
                          <td className="border-r border-black text-center text-transparent">.</td>
                          <td className="border-r border-black"></td>
                          <td className="border-r border-black"></td>
                          <td></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. Footer Details & Summary */}
                <div className="pt-0.5">
                  <div className="grid grid-cols-12 gap-2 items-start text-[9.5px]">
                    <div className="col-span-6 space-y-0.5">
                      <div className="flex justify-between text-black font-semibold text-[9px]">
                        <span>Facturé par :</span>
                        <span className="font-bold">{supervisorName}</span>
                      </div>
                      <div className="flex justify-between text-black font-semibold text-[9px]">
                        <span>Solde échéance :</span>
                        <span className="font-bold font-mono">{formatNumber(resteAPayer)}</span>
                      </div>
                      <div className="border border-black p-0.5 rounded text-[8px] text-slate-700 leading-tight">
                        <span className="font-bold text-black">NB : </span>
                        Marchandise vendue ni reprise ni échangée.
                      </div>
                    </div>

                    <div className="col-span-6 border-2 border-black rounded p-1 space-y-0.5 bg-slate-50">
                      <div className="flex justify-between items-center text-black font-black text-[11px]">
                        <span>Net à payer :</span>
                        <span className="font-mono text-xs">{formatNumber(sale.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[9.5px] pt-0.5 border-t border-black/30">
                        <span>Règlement :</span>
                        <span className="font-mono">{formatNumber(reglement)}</span>
                      </div>
                      {resteAPayer > 0 && (
                        <div className="flex justify-between items-center text-red-700 font-bold text-[9px] pt-0.5 border-t border-black/30">
                          <span>Reste dû :</span>
                          <span className="font-mono">{formatNumber(resteAPayer)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* ==================== VOLET DROIT : FACTURE (EXEMPLAIRE 2 / IDENTIQUE) ==================== */}
              <div className="flex flex-col justify-between pl-0 md:pl-3 space-y-1.5 h-full pt-3 md:pt-0">
                
                {/* 1. Header */}
                <div>
                  <div className="flex items-center gap-2.5 pb-1.5 border-b border-black">
                    <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-lg tracking-tight shrink-0 overflow-hidden bg-white">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span>TB</span>
                      )}
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="flex justify-between items-start">
                        <h2 className="font-extrabold text-xs sm:text-sm uppercase tracking-tight text-black">{companyName}</h2>
                        <span className="text-[9px] font-semibold text-black">{companyAddress}</span>
                      </div>
                      <div className="text-[8.5px] text-black mt-0.5 flex flex-wrap justify-between gap-1">
                        <span>{companySubAddress}</span>
                        <span className="font-bold">TEL : {companyPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Document Reference Bar */}
                  <div className="flex justify-between items-center py-1 border-b border-black text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-black uppercase">FACTURE</span>
                      <span className="font-mono text-xs">{factureCode}</span>
                    </div>
                    <div className="font-mono text-[10px] text-black">
                      {formattedDateTime}
                    </div>
                  </div>

                  {/* 3. Client Information Bar */}
                  <div className="flex justify-between items-center py-0.5 border-b-2 border-black text-[11px] font-bold">
                    <span className="uppercase text-black truncate max-w-[180px]">{clientNameDisplay}</span>
                    <span className="font-mono text-black">{clientPhone}</span>
                  </div>
                </div>

                {/* 4. Table Grid */}
                <div className="flex-1 flex flex-col justify-start my-1 border-2 border-black overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase bg-slate-100 text-black">
                        <th className="py-1 px-1 border-r border-black w-8 text-center">Qté</th>
                        <th className="py-1 px-1.5 border-r border-black">Désignation</th>
                        <th className="py-1 px-1.5 border-r border-black w-14 text-right">PU</th>
                        <th className="py-1 px-1.5 w-18 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold">
                      {saleItems.map((it, idx) => (
                        <tr key={idx} className="h-5">
                          <td className="py-0.5 px-1 border-r border-black text-center font-mono font-bold text-black">
                            {it.qty}
                          </td>
                          <td className="py-0.5 px-1.5 border-r border-black font-bold uppercase text-black text-[9.5px]">
                            {it.title}
                          </td>
                          <td className="py-0.5 px-1 border-r border-black text-right font-mono font-bold text-black">
                            {sale.paymentMode === 'Cadeau' ? "0" : formatNumber(it.price)}
                          </td>
                          <td className="py-0.5 px-1.5 text-right font-mono font-bold text-black">
                            {sale.paymentMode === 'Cadeau' ? "0" : formatNumber(it.price * it.qty)}
                          </td>
                        </tr>
                      ))}
                      {/* Empty spacer rows */}
                      {Array.from({ length: Math.max(0, 5 - saleItems.length) }).map((_, i) => (
                        <tr key={`empty-inv2-${i}`} className="h-4">
                          <td className="border-r border-black text-center text-transparent">.</td>
                          <td className="border-r border-black"></td>
                          <td className="border-r border-black"></td>
                          <td></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. Footer Details & Summary */}
                <div className="pt-0.5">
                  <div className="grid grid-cols-12 gap-2 items-start text-[9.5px]">
                    <div className="col-span-6 space-y-0.5">
                      <div className="flex justify-between text-black font-semibold text-[9px]">
                        <span>Facturé par :</span>
                        <span className="font-bold">{supervisorName}</span>
                      </div>
                      <div className="flex justify-between text-black font-semibold text-[9px]">
                        <span>Solde échéance :</span>
                        <span className="font-bold font-mono">{formatNumber(resteAPayer)}</span>
                      </div>
                      <div className="border border-black p-0.5 rounded text-[8px] text-slate-700 leading-tight">
                        <span className="font-bold text-black">NB : </span>
                        Marchandise vendue ni reprise ni échangée.
                      </div>
                    </div>

                    <div className="col-span-6 border-2 border-black rounded p-1 space-y-0.5 bg-slate-50">
                      <div className="flex justify-between items-center text-black font-black text-[11px]">
                        <span>Net à payer :</span>
                        <span className="font-mono text-xs">{formatNumber(sale.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[9.5px] pt-0.5 border-t border-black/30">
                        <span>Règlement :</span>
                        <span className="font-mono">{formatNumber(reglement)}</span>
                      </div>
                      {resteAPayer > 0 && (
                        <div className="flex justify-between items-center text-red-700 font-bold text-[9px] pt-0.5 border-t border-black/30">
                          <span>Reste dû :</span>
                          <span className="font-mono">{formatNumber(resteAPayer)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 📄 2. SINGLE INVOICE MODE                                                */}
          {/* ========================================================================= */}
          {viewMode === "invoice_only" && (
            <div className="printable-document printable-single-portrait bg-white text-black p-6 sm:p-8 font-sans border border-black shadow-2xl mx-auto w-full max-w-[800px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="pb-3 border-b-2 border-black flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center font-serif font-black text-xl tracking-tight shrink-0 overflow-hidden bg-white">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span>TB</span>
                      )}
                    </div>
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tight text-black font-serif">{companyName}</h1>
                      <p className="text-xs font-bold text-black uppercase tracking-wider mt-0.5">{companyAddress}</p>
                      <p className="text-xs text-black mt-0.5">{companySubAddress} &bull; Tél : <span className="font-bold">{companyPhone}</span></p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="inline-block border-2 border-black px-3 py-1 bg-black text-white rounded text-center">
                      <span className="text-xs font-black tracking-widest uppercase">FACTURE</span>
                    </div>
                    <div className="mt-1.5 text-xs space-y-0.5 text-black">
                      <p className="font-mono font-black text-sm">N° {factureCode}</p>
                      <p className="text-xs font-semibold">Date : <span className="font-mono font-bold">{formattedDateTime}</span></p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-black">
                  <div className="border border-black rounded-lg p-2.5 space-y-1 bg-white">
                    <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-0.5 mb-1">DÉTAILS OPÉRATION</span>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Facturé par :</span><span className="font-bold uppercase font-mono">{supervisorName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Mode de règlement :</span><span className="font-bold uppercase">{sale.paymentMode === 'Cadeau' ? "🎁 CADEAU / OFFERT (0 FCFA)" : (sale.paymentMode || "Espèces")}</span></div>
                  </div>
                  <div className="border-2 border-black rounded-lg p-2.5 space-y-1 bg-white">
                    <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-0.5 mb-1">FACTURÉ À / CLIENT</span>
                    <div className="flex justify-between items-baseline"><span className="text-slate-800 font-semibold">Nom / Raison :</span><span className="font-black text-sm uppercase text-black">{clientNameDisplay}</span></div>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Téléphone :</span><span className="font-mono font-bold text-black">{clientPhone}</span></div>
                  </div>
                </div>
              </div>

              <div className="my-3 flex-1 flex flex-col justify-start">
                <div className="border-2 border-black rounded-lg overflow-hidden flex-1 flex flex-col">
                  <table className="w-full text-left border-collapse text-xs text-black">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase text-center bg-slate-100 text-black">
                        <th className="py-2 px-3 border-r-2 border-black w-14 text-center font-black">#</th>
                        <th className="py-2 px-3 border-r-2 border-black text-left font-black">DÉSIGNATION DES MARCHANDISES</th>
                        <th className="py-2 px-3 border-r-2 border-black w-24 text-center font-black">QUANTITÉ</th>
                        <th className="py-2 px-3 border-r-2 border-black w-28 text-right font-black">PRIX UNIT.</th>
                        <th className="py-2 px-3 w-32 text-right font-black">TOTAL (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold text-black">
                      {saleItems.map((it, idx) => (
                        <tr key={idx} className="h-8">
                          <td className="py-1.5 px-3 border-r-2 border-black text-center font-mono font-bold text-black">{idx + 1}</td>
                          <td className="py-1.5 px-3 border-r-2 border-black font-bold uppercase text-black text-xs sm:text-sm">{it.title}</td>
                          <td className="py-1.5 px-3 border-r-2 border-black text-center font-mono font-bold text-black text-xs">{it.qty} sacs</td>
                          <td className="py-1.5 px-3 border-r-2 border-black text-right font-mono font-bold text-black">{sale.paymentMode === 'Cadeau' ? "0 (Offert)" : formatNumber(it.price)}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-black text-black">{sale.paymentMode === 'Cadeau' ? "0" : formatNumber(it.price * it.qty)}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 6 - saleItems.length) }).map((_, i) => (
                        <tr key={`empty-${i}`} className="h-7">
                          <td className="border-r-2 border-black text-center text-slate-300 font-mono text-[10px]">{saleItems.length + i + 1}</td>
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

              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-7">
                    <div className="border border-black rounded-lg p-2.5 bg-slate-50">
                      <span className="text-[10px] uppercase font-black text-black block mb-0.5">ARRÊTÉ LA FACTURE À LA SOMME DE :</span>
                      <p className="text-xs font-serif font-black italic text-black leading-snug">
                        {sale.paymentMode === 'Cadeau' ? "ZÉRO FRANC CFA (MARCHANDISE OFFERTE / CADEAU)" : numberToWordsFR(sale.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-5 border-2 border-black rounded-xl overflow-hidden bg-white p-2.5 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-black font-black text-xs">
                      <span className="uppercase tracking-tight">NET À PAYER :</span>
                      <span className="font-mono text-sm font-black">{formatNumber(sale.totalAmount)} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-black text-xs">
                      <span className="font-semibold text-slate-800">Montant Réglé :</span>
                      <span className="font-mono font-bold text-black">{formatNumber(reglement)} FCFA</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t-2 border-black text-center text-[10px] text-black font-semibold">
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
            <span>Format optimisé &bull; Strictement 1 feuille A4 &bull; Zéro débordement</span>
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

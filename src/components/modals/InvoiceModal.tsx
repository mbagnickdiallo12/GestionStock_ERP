"use client";

import React from "react";
import { Printer, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatNumber } from "@/lib/utils";

export const InvoiceModal: React.FC = () => {
  const { activeModal, closeModal, sales, depots, settings, movements, products, clients, currentUser } = useApp();

  if (!activeModal || !activeModal.startsWith("invoice-")) return null;

  const saleId = activeModal.replace("invoice-", "").replace("preview-", "");
  const sale = sales.find(s => s.id === saleId) || sales[0];

  if (!sale) return null;

  const depot = depots.find(d => d.id === sale.depotId);
  const matchedClient = clients.find(c => c.name.toLowerCase() === (sale.clientName || "").toLowerCase());

  const handlePrint = () => {
    window.print();
  };

  // Find real items: from sale.items, or matching stock movement, or real product from catalog
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
  const soldeEncours = matchedClient ? (matchedClient.balance || 0) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Toolbar */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between no-print bg-[#0f172a]/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-bold text-sm text-white">Facture Officielle N° {sale.id}</h3>
          </div>
          <button
            onClick={closeModal}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Printable Receipt Document */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#090d16]/50">
          <div className="printable-document bg-white text-black p-6 sm:p-8 rounded-xl font-sans border-2 border-black shadow-xl mx-auto max-w-[680px]">
            
            {/* Header: Company Name, Address, Phone & Monogram */}
            <div className="pb-3 border-b-2 border-black text-black">
              <div className="flex items-center justify-between gap-4">
                {/* Logo / Monogram Circular Stamp */}
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center font-black text-lg font-mono shrink-0 overflow-hidden bg-white text-black">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-black tracking-tighter">
                      {settings.companyName ? settings.companyName.slice(0, 2).toUpperCase() : "TB"}
                    </span>
                  )}
                </div>

                {/* Company Title & Address Centered */}
                <div className="flex-1 text-center px-2">
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black font-serif leading-tight">
                    {settings.companyName || "TERANGA BOUTIQUE"}
                  </h1>
                  <p className="text-xs font-bold uppercase tracking-wide text-black mt-0.5">
                    {settings.address || "ROUTE DE NDINDY TOUBA"}
                  </p>
                  <p className="text-[11px] font-bold text-black mt-1">
                    SIÈGE SOCIAL : {depot?.city || "TOUBA"} MARCHÉ OCASS &bull; TÉL : {settings.phone || "77 591 30 40 / 77 719 11 18"}
                  </p>
                </div>

                {/* Stamp Paid */}
                <div className="w-16 shrink-0 text-right">
                  {isPaid ? (
                    <div className="border-2 border-black text-black font-black text-[11px] px-2 py-0.5 uppercase tracking-widest rotate-[-10deg] inline-block">
                      PAYÉ
                    </div>
                  ) : (
                    <div className="border-2 border-black text-black font-black text-[11px] px-2 py-0.5 uppercase tracking-widest rotate-[-10deg] inline-block">
                      CRÉDIT
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Header Details Bar */}
            <div className="my-3 text-xs space-y-1.5 text-black font-bold">
              <div className="flex justify-between items-center text-sm font-black border-b border-black pb-1">
                <div>
                  <span className="uppercase">FACTURE</span>
                  <span className="font-mono ml-2 font-black">{sale.id}</span>
                </div>
                <div className="font-mono text-xs font-black">
                  {sale.date}
                </div>
              </div>

              {/* Client & Depot & Ninea Row */}
              <div className="flex justify-between items-center pt-1 text-xs text-black">
                <div className="font-black text-sm uppercase text-black">
                  {sale.clientName || "CLIENT COMPTOIR"}
                </div>
                <div className="font-bold text-black">
                  {depot ? depot.name : "TOUBA MOSQUE"}
                </div>
                <div className="font-mono text-xs font-black text-black">
                  {matchedClient?.phone || matchedClient?.id || (settings.ninea ? `NINEA: ${settings.ninea}` : "339751385")}
                </div>
              </div>
            </div>

            {/* Main Itemized Accounting Grid */}
            <div className="border-2 border-black my-3 overflow-hidden bg-white">
              <table className="w-full text-left border-collapse text-xs text-black">
                <thead>
                  <tr className="border-b-2 border-black font-black uppercase text-center bg-slate-100 text-black">
                    <th className="py-2 px-3 border-r-2 border-black w-20 text-center font-black">Qté</th>
                    <th className="py-2 px-3 border-r-2 border-black text-left font-black">Désignation</th>
                    <th className="py-2 px-3 border-r-2 border-black w-28 text-right font-black">PU</th>
                    <th className="py-2 px-3 w-32 text-right font-black">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-semibold text-black">
                  {saleItems.map((it, idx) => (
                    <tr key={idx} className="h-8">
                      <td className="py-1.5 px-3 border-r-2 border-black text-center font-mono font-bold">
                        {formatNumber(it.qty)}
                      </td>
                      <td className="py-1.5 px-3 border-r-2 border-black font-bold uppercase text-black">
                        {it.title}
                      </td>
                      <td className="py-1.5 px-3 border-r-2 border-black text-right font-mono font-bold">
                        {formatNumber(it.price)}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-black">
                        {formatNumber(it.price * it.qty)}
                      </td>
                    </tr>
                  ))}
                  {/* Empty Grid Space to match reference receipt layout */}
                  {Array.from({ length: Math.max(0, 4 - saleItems.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-7">
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td className="border-r-2 border-black"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Footer: Operator, Outstanding Balance & Net Financial Summary Box */}
            <div className="flex justify-between items-start gap-4 mt-3 pt-1 text-xs text-black">
              {/* Left Column */}
              <div className="space-y-1.5 flex-1 font-bold text-black">
                <div className="text-xs">
                  <span>Facturé par : </span>
                  <span className="font-mono font-black uppercase text-black">{currentUser?.name || "teranga1"}</span>
                </div>
                <div className="text-xs">
                  <span>Solde encours : </span>
                  <span className="font-mono font-black text-black">{formatNumber(soldeEncours)}</span>
                </div>
                <div className="pt-1.5">
                  <span className="text-[10px] uppercase font-black block text-black">NB :</span>
                  <div className="border border-black p-1.5 rounded text-[10px] font-medium leading-tight max-w-xs text-black">
                    Marchandise vérifiée et contrôlée au comptoir. Conservez ce reçu comme preuve d'achat.
                  </div>
                </div>
              </div>

              {/* Right Column: High Contrast Financial Box */}
              <div className="w-60 border-2 border-black rounded-lg p-2.5 space-y-1 font-bold text-xs bg-white text-black">
                <div className="flex justify-between items-center text-xs font-black border-b border-black pb-1">
                  <span className="uppercase">Net à payer :</span>
                  <span className="font-mono text-sm font-black">{formatNumber(sale.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Règlement :</span>
                  <span className="font-mono font-bold">{formatNumber(reglement)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-black font-black">
                  <span>Reste à payer :</span>
                  <span className="font-mono font-black">{formatNumber(resteAPayer)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0f172a]/80 flex items-center justify-end gap-2.5 no-print">
          <button
            onClick={closeModal}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimer Facture (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};


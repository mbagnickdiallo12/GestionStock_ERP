"use client";

import React from "react";
import { Printer, X, Wheat } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";

export const InvoiceModal: React.FC = () => {
  const { activeModal, closeModal, sales, depots, settings, movements, products } = useApp();

  if (!activeModal || !activeModal.startsWith("invoice-")) return null;

  const saleId = activeModal.replace("invoice-", "").replace("preview-", "");
  const sale = sales.find(s => s.id === saleId) || sales[0];

  if (!sale) return null;

  const depot = depots.find(d => d.id === sale.depotId);

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

  const statusLabel = sale.status === 'Payé' || !sale.status ? 'Payé / Réglé' : sale.status;
  const isPaid = statusLabel.toLowerCase().includes('payé') || statusLabel.toLowerCase().includes('réglé');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Toolbar */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between no-print bg-[#0f172a]/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-bold text-sm text-white">Facture & Reçu Officiel N° {sale.id}</h3>
          </div>
          <button
            onClick={closeModal}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Printable Receipt Document */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#090d16]/30">
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
                    FACTURE & REÇU OFFICIEL
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 font-semibold text-[9.5px] uppercase tracking-wider block mb-1">
                    STATUT DU RÈGLEMENT
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold inline-block border ${
                    isPaid 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Metadata Section */}
              <div className="space-y-2.5 my-5 text-xs">
                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">N° de Référence Transaction :</span>
                  <span className="font-extrabold text-slate-800 text-sm font-mono tracking-tight">{sale.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">Atelier / Bénéficiaire / Client :</span>
                  <span className="font-extrabold text-slate-900 text-sm">{sale.clientName || "Client Comptoir"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">Point de Vente / Dépôt :</span>
                  <span className="font-semibold text-slate-700 text-sm">{depot ? depot.name : "Dépôt Central"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">Date de règlement :</span>
                  <span className="font-extrabold text-slate-800 text-sm">{sale.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">Mode de Paiement :</span>
                  <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 inline-block">
                    {sale.paymentMode || "Espèces (Cash)"}
                  </span>
                </div>
              </div>

              {/* Document Subject Title */}
              <h2 className="text-sm sm:text-base font-black text-slate-900 mb-3 tracking-tight">
                Facture de Vente de Riz & Marchandises - {settings.companyName || "RizStock ERP"}
              </h2>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-y border-slate-200 text-slate-400 font-bold uppercase text-[9.5px] tracking-wider">
                      <th className="py-2 px-2">DATE</th>
                      <th className="py-2 px-2">DÉSIGNATION DU PRODUIT / FORFAIT</th>
                      <th className="py-2 px-2 text-right">MONTANT (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {saleItems.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-2 text-slate-600 align-top whitespace-nowrap text-[10.5px]">
                          {sale.date?.slice(0, 10) || "2026-08-16"}
                        </td>
                        <td className="py-2.5 px-2 align-top">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {it.title} ({formatNumber(it.qty)} {it.qty > 1 ? 'Sacs' : 'Sac'})
                          </div>
                          <div className="text-slate-500 text-[10px] mt-0.5">
                            Prix unitaire: {formatFCFA(it.price)} • Règlement {sale.paymentMode || "Espèces"}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-black text-slate-900 text-xs sm:text-sm align-top whitespace-nowrap font-mono">
                          {formatFCFA(it.price * it.qty)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Highlight Box */}
              <div className="flex justify-end my-5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 flex items-center justify-between gap-6 min-w-[260px]">
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">TOTAL RÉGLÉ :</span>
                  <span className="text-lg font-black text-blue-600 font-mono tracking-tight">{formatFCFA(sale.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Footer pinned cleanly at the bottom */}
            <div className="border-t border-slate-200/80 pt-3 mt-auto flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-400">
              <span>Facture officielle éditée par {settings.companyName || "RizStock ERP"} - NINEA {settings.ninea || "00984521"} - {settings.address || "Dakar, Sénégal"}</span>
              <span>Document certifié électroniquement</span>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#0f172a]/60 flex items-center justify-end gap-2.5 no-print">
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
            <Printer className="w-3.5 h-3.5" /> Imprimer Reçu / Facture (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

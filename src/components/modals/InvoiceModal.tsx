"use client";

import React from "react";
import { Printer, X, Wheat } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";

export const InvoiceModal: React.FC = () => {
  const { activeModal, closeModal, sales, depots, settings } = useApp();

  if (!activeModal || !activeModal.startsWith("invoice-")) return null;

  const saleId = activeModal.replace("invoice-", "").replace("preview-", "");
  const sale = sales.find(s => s.id === saleId) || sales[0];

  if (!sale) return null;

  const depot = depots.find(d => d.id === sale.depotId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between no-print">
          <h3 className="font-bold text-sm text-white">Facture Officielle N° {sale.id}</h3>
          <button
            onClick={closeModal}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Printable Receipt Box */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="printable-document bg-white text-slate-900 p-5 rounded-xl font-sans space-y-4 border border-slate-200 text-xs shadow-sm">
            
            {/* Header Flex */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-9 w-auto object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                    <Wheat className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">{settings.companyName}</h1>
                  <p className="text-[10px] text-slate-500">{settings.address} • Tél: {settings.phone}</p>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">FACTURE</h2>
                <div className="text-[10px] text-slate-600 mt-0.5 space-x-2 font-medium">
                  <span>N°: <strong className="text-slate-900 font-mono">{sale.id}</strong></span>
                  <span>•</span>
                  <span>Date: <span className="text-slate-900">{sale.date}</span></span>
                </div>
              </div>
            </div>

            {/* Client & Issuer Metadata Line */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Vendeur / Dépôt</span>
                <p className="font-bold text-slate-900">{settings.companyName}</p>
                <p className="text-slate-600 text-[10px]">Dépôt: {depot ? depot.name : "Dépôt Central"}</p>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Client / Facturé à</span>
                <p className="font-bold text-slate-900">{sale.clientName || "Client Comptoir"}</p>
                <p className="text-slate-600 text-[10px]">Règlement: {sale.paymentMode}</p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-1.5 px-2.5 whitespace-nowrap">Désignation Produit</th>
                    <th className="py-1.5 px-2.5 text-center whitespace-nowrap">Quantité</th>
                    <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Prix Unitaire</th>
                    <th className="py-1.5 px-2.5 text-right whitespace-nowrap">Montant Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {((sale.items && sale.items.length > 0) ? sale.items : [{
                    productId: "prod-1",
                    title: "Royal Sénégal 100% Brisure (Sac 25kg)",
                    qty: Math.max(1, Math.round((sale.totalAmount || 300000) / 15000)),
                    price: 15000
                  }]).map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                        {it.title && it.title !== 'prod-1' ? it.title : "Royal Sénégal 100% Brisure (Sac 25kg)"}
                      </td>
                      <td className="py-1.5 px-2.5 text-center font-bold text-slate-900 whitespace-nowrap">{formatNumber(it.qty || 1)} Sacs</td>
                      <td className="py-1.5 px-2.5 text-right text-slate-700 font-mono font-medium whitespace-nowrap">{formatFCFA(it.price || 15000)}</td>
                      <td className="py-1.5 px-2.5 text-right font-black text-slate-900 font-mono whitespace-nowrap">{formatFCFA((it.price || 15000) * (it.qty || 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-between items-start pt-1 text-[11px]">
              <div className="text-[10px] text-slate-500 italic max-w-xs">
                Merci de votre confiance et de votre fidélité !
              </div>

              <div className="w-56 border-t border-b border-slate-300 py-2 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Total HT :</span>
                  <span className="font-mono font-bold text-slate-900">{formatFCFA(sale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[10px]">
                  <span>TVA (0% Exonéré) :</span>
                  <span>0 FCFA</span>
                </div>
                <div className="flex justify-between font-extrabold text-xs text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total TTC :</span>
                  <span className="text-emerald-700 font-mono text-sm">{formatFCFA(sale.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 font-sans text-[10px]">
              <div>
                <span className="font-bold text-slate-600 block uppercase">Signature Client</span>
                <div className="h-8 border-b border-slate-300 mt-1" />
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-600 block uppercase">Signature Vendeur / Gérant</span>
                <div className="h-8 border-b border-slate-300 mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 border-t border-white/10 bg-black/20 flex items-center justify-end gap-2.5 no-print">
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
            Fermer
          </button>
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <Printer className="w-3.5 h-3.5" /> Imprimer Facture (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

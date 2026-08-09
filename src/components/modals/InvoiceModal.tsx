"use client";

import React from "react";
import { Printer, X } from "lucide-react";
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
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between no-print">
          <h3 className="font-bold text-lg text-white">Facture Officielle de Vente N° {sale.id}</h3>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Printable Receipt Box */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Printable Document Box - Full A4 Clean Invoice matching reference image */}
          <div className="printable-document bg-white text-slate-900 p-8 font-sans space-y-7 border border-slate-200 rounded-xl">
            
            {/* 1. Header Flex: Logo & Company Name (Left) | Facture Title & Dates (Right) */}
            <div className="flex justify-between items-start pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#10b981] text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
                    RZ
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{settings.companyName}</h1>
                  <p className="text-xs text-slate-500 font-medium">{settings.address}</p>
                  <p className="text-xs text-slate-500 font-medium">Tél: {settings.phone} | RCCM: {settings.rccm}</p>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-2xl font-black text-slate-900 tracking-wider">FACTURE - {sale.id}</h2>
                <p className="text-xs text-slate-600 mt-1 font-semibold">Date de facturation : <span className="text-slate-900">{sale.date}</span></p>
                <p className="text-xs text-slate-600 font-semibold">Mode de règlement : <span className="text-emerald-700 font-bold">{sale.paymentMode}</span></p>
              </div>
            </div>

            {/* 2. Client & Issuer Info Section (Side by Side) */}
            <div className="grid grid-cols-2 gap-8 text-xs pt-2">
              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Émetteur / Vendeur</span>
                <p className="font-extrabold text-sm text-slate-900">{settings.companyName}</p>
                <p className="text-slate-600">Dépôt d'expédition : <strong className="text-slate-900">{depot ? depot.name : (sales.find(s => s.id === sale.id)?.depotId ? depots.find(d => d.id === sale.depotId)?.name : depots[0]?.name || "Dépôt Central")}</strong></p>
              </div>

              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Facturé à / Client</span>
                <p className="font-extrabold text-sm text-slate-900">{sale.clientName || "Client Comptoir"}</p>
                <p className="text-slate-600">Adresse : Marché Tilène / Dakar, Sénégal</p>
              </div>
            </div>

            {/* 3. Greeting Line */}
            <div className="text-xs font-semibold text-slate-600 italic">
              Merci de votre confiance et de votre fidélité !
            </div>

            {/* 4. Table matching Rénov' Pro Model */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-200/80 text-slate-800 font-black border-b border-slate-300">
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-center">Quantité</th>
                    <th className="p-3.5 text-right">Prix unitaire</th>
                    <th className="p-3.5 text-right">Montant Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {((sale.items && sale.items.length > 0) ? sale.items : [{
                    productId: "prod-1",
                    title: "Royal Sénégal 100% Brisure (Sac 25kg)",
                    qty: Math.max(1, Math.round((sale.totalAmount || 300000) / 15000)),
                    price: 15000
                  }]).map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900 text-sm">
                        {it.title && it.title !== 'prod-1' ? it.title : "Royal Sénégal 100% Brisure (Sac 25kg)"}
                        <span className="block text-[11px] font-normal text-emerald-700 mt-0.5">Sac de riz certifié & contrôlé au chargement</span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-900 text-sm">{formatNumber(it.qty || 1)} Sacs</td>
                      <td className="p-3.5 text-right text-slate-700 font-semibold text-sm">{formatFCFA(it.price || 15000)}</td>
                      <td className="p-3.5 text-right font-black text-slate-900 text-sm">{formatFCFA((it.price || 15000) * (it.qty || 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. Totals Breakdown (Right Aligned matching model) & Payment Info (Left) */}
            <div className="flex justify-between items-start pt-2">
              <div className="space-y-2 text-xs text-slate-600 max-w-xs">
                <div>
                  <strong className="text-slate-900 font-bold">Moyens de paiement :</strong>
                  <p className="text-slate-700">{sale.paymentMode} (Espèces / Wave / Virement / Chèque)</p>
                </div>
                <div>
                  <strong className="text-slate-900 font-bold">Conditions de paiement :</strong>
                  <p className="text-slate-700">Comptant à la livraison / Réception des sacs</p>
                </div>
              </div>

              <div className="w-72 border-t-2 border-b-2 border-slate-300 py-3 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Total HT :</span>
                  <span className="font-bold text-slate-900">{formatFCFA(sale.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>TVA (0% Exonéré) :</span>
                  <span>0 FCFA</span>
                </div>
                <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total TTC :</span>
                  <span className="text-emerald-800 text-lg">{formatFCFA(sale.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* 6. Footer Signatures Block */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-xs border-t border-slate-200">
              <div>
                <p className="font-extrabold text-slate-800">Signature & Cachet Client :</p>
                <div className="h-16 border-b-2 border-dashed border-slate-300 mt-2 rounded-lg bg-slate-50/50"></div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-slate-800">Pour l'Émetteur / Gérant de Dépôt :</p>
                <div className="h-16 border-b-2 border-dashed border-slate-300 mt-2 rounded-lg bg-slate-50/50"></div>
              </div>
            </div>

            {/* 7. Centered Document Footer */}
            <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
              <p className="font-bold text-slate-600">{settings.companyName}</p>
              <p>{settings.address} — Tél: {settings.phone} — RCCM: {settings.rccm}</p>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-black/20 flex items-center justify-end gap-3 no-print">
          <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Fermer
          </button>
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimer Facture (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

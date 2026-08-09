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
          <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans space-y-6 border border-slate-200">
            {/* Header Flex */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#1e4d35] text-white flex items-center justify-center font-black text-xl shadow-sm">
                    RZ
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">{settings.companyName}</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">{settings.address}</p>
                  <p className="text-[11px] text-slate-500">Tel: {settings.phone} | RCCM: {settings.rccm}</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-xl font-black text-slate-900 tracking-wider">FACTURE</h1>
                <p className="text-xs text-slate-500 mt-1">N°: <strong className="text-slate-900">{sale.id}</strong></p>
                <p className="text-xs text-slate-500">Date: <strong className="text-slate-900">{sale.date}</strong></p>
              </div>
            </div>

            {/* Client & Depot Meta Card */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Client / Facturé à</span>
                <h3 className="text-sm font-extrabold text-slate-900">{sale.clientName || "Client Comptoir"}</h3>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Dépôt d'Expédition / Mode</span>
                <h4 className="text-sm font-bold text-slate-900">{depot ? depot.name : (sales.find(s => s.id === sale.id)?.depotId ? depots.find(d => d.id === sale.depotId)?.name : depots[0]?.name || "Dépôt Central")}</h4>
                <span className="text-emerald-700 font-bold text-[11px]">{sale.paymentMode}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                    <th className="p-3">Désignation</th>
                    <th className="p-3 text-center">Quantité</th>
                    <th className="p-3 text-right">Prix Unitaire</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((sale.items && sale.items.length > 0) ? sale.items : [{
                    productId: "prod-1",
                    title: "Royal Sénégal 100% Brisure (25kg)",
                    qty: Math.max(1, Math.round((sale.totalAmount || 300000) / 15000)),
                    price: 15000
                  }]).map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">
                        {it.title && it.title !== 'prod-1' ? it.title : "Royal Sénégal 100% Brisure (25kg)"}
                        <span className="block text-[11px] font-normal text-emerald-600">Format sac de riz certifié</span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">{formatNumber(it.qty || 1)} Sacs</td>
                      <td className="p-3 text-right text-slate-700">{formatFCFA(it.price || 15000)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatFCFA((it.price || 15000) * (it.qty || 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown & Dark Green Capsule Block */}
            <div className="flex justify-between items-end pt-2">
              <div className="text-xs text-slate-500 space-y-1">
                <p><strong>Paiement Info:</strong> {sale.paymentMode}</p>
                <p className="text-[11px] italic">Les sacs de riz livrés sont vérifiés et scellés.</p>
              </div>

              <div className="w-80 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600 px-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <strong className="text-slate-900">{formatFCFA(sale.totalAmount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (0% Exonéré):</span>
                    <span>0 FCFA</span>
                  </div>
                </div>

                {/* Reference Model Capsule Block */}
                <div className="bg-[#1e4d35] text-white p-3.5 rounded-xl shadow-sm flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider">Grand Total</span>
                  <span className="font-black text-lg">{formatFCFA(sale.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="pt-8 flex justify-between text-xs text-slate-500 border-t border-slate-200">
              <div className="text-left">
                <p className="font-bold text-slate-700">Signature & Cachet Client :</p>
                <div className="h-12 border-b border-dashed border-slate-300 w-48 mt-2"></div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700">Responsable Caisse / Gérant :</p>
                <div className="h-12 border-b border-dashed border-slate-300 w-48 mt-2 ml-auto"></div>
              </div>
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

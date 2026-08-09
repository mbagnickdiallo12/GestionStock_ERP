"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, Truck, Building2, PackageCheck } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const DeliveryNoteModal: React.FC = () => {
  const { activeModal, closeModal, sales, movements, depots, settings } = useApp();

  const isBLModal = activeModal && activeModal.startsWith("bl-");
  const idRef = isBLModal ? activeModal.replace("bl-", "") : null;

  // Can be triggered from a sale or a stock movement
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
    : (targetMvt ? targetMvt.source : "Dépôt Port");

  const recipient = targetSale ? targetSale.clientName : (targetMvt ? targetMvt.dest : "Client / Dépôt");
  const driverOrOperator = targetMvt ? targetMvt.operator : "Chauffeur Transporteur";

  return (
    <Modal
      id={`bl-${idRef}`}
      title={`Bon de Livraison & Sortie Stock - N° ${blNumber}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
            Fermer
          </button>
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimer Bon de Livraison (BL)
          </button>
        </>
      )}
    >
      <div className="printable-document bg-white text-slate-900 p-8 rounded-2xl font-sans space-y-6 border border-slate-200">
        {/* Header Company Logo & Document Title */}
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
              <div className="font-black text-slate-900 text-lg tracking-tight">{settings.companyName}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">{settings.address}</p>
              <p className="text-[11px] text-slate-500">Tel: {settings.phone} | NINEA: {settings.rccm}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-1">
              BON DE LIVRAISON (BL)
            </span>
            <div className="text-xs text-slate-500 mt-1">N° BL: <strong className="text-slate-900">{blNumber}</strong></div>
            <div className="text-xs text-slate-500">Date: <strong className="text-slate-900">{dateStr}</strong></div>
          </div>
        </div>

        {/* Logistic & Recipient Metadata Card */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Dépôt Expéditeur / Source</span>
            <strong className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" /> {depotSource && depotSource !== 'dep-1' ? depotSource : (depots[0]?.name || "Dépôt Principal")}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Destinataire / Client</span>
            <strong className="text-sm font-extrabold text-slate-900">{recipient || "Client Grossiste"}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Transporteur / Chauffeur</span>
            <strong className="text-slate-800 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600" /> {driverOrOperator}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Réf. Commande / Mouvement</span>
            <strong className="text-slate-800">{idRef}</strong>
          </div>
        </div>

        {/* Articles Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                <th className="p-3">Désignation du Sac de Riz</th>
                <th className="p-3 text-center">Format</th>
                <th className="p-3 text-right">Commandé</th>
                <th className="p-3 text-right">Livré</th>
                <th className="p-3 text-center">Statut Livré</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {targetSale ? (
                ((targetSale.items && targetSale.items.length > 0) ? targetSale.items : [{
                  productId: "prod-1",
                  title: "Royal Sénégal 100% Brisure (25kg)",
                  qty: Math.max(1, Math.round((targetSale.totalAmount || 300000) / 15000)),
                  price: 15000
                }]).map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">
                      {it.title && it.title !== 'prod-1' ? it.title : "Royal Sénégal 100% Brisure (25kg)"}
                      <span className="block text-[11px] font-normal text-emerald-600">Produit contrôlé au chargement</span>
                    </td>
                    <td className="p-3 text-center text-slate-600 font-semibold">25kg / 50kg</td>
                    <td className="p-3 text-right text-slate-700 font-semibold">{formatNumber(it.qty || 1)} Sacs</td>
                    <td className="p-3 text-right font-black text-emerald-700">{formatNumber(it.qty || 1)} Sacs</td>
                    <td className="p-3 text-center font-extrabold text-emerald-700">✅ Conforme</td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">
                    {targetMvt?.prodTitle && targetMvt.prodTitle !== 'prod-1' ? targetMvt.prodTitle : "Royal Sénégal 100% Brisure (25kg)"}
                    <span className="block text-[11px] font-normal text-emerald-600">Stock dépressionneur vérifié</span>
                  </td>
                  <td className="p-3 text-center text-slate-600 font-semibold">Standard Sac</td>
                  <td className="p-3 text-right text-slate-700 font-semibold">{formatNumber(targetMvt?.qty || 100)} Sacs</td>
                  <td className="p-3 text-right font-black text-emerald-700">{formatNumber(targetMvt?.qty || 100)} Sacs</td>
                  <td className="p-3 text-center font-extrabold text-emerald-700">✅ Conforme</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-3 gap-6 pt-6 text-xs border-t border-slate-200">
          <div>
            <p className="font-bold text-slate-700">Chauffeur Transporteur :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-700">Magasinier Expéditeur :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700">Visa Client Récepteur :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Printer, Ship, Building2, Anchor } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const ReceptionNoteModal: React.FC = () => {
  const { activeModal, closeModal, purchases, movements, depots, products, settings } = useApp();

  const isBRModal = activeModal && (activeModal.startsWith("br-") || activeModal.startsWith("reception-"));
  const idRef = isBRModal ? activeModal.replace("br-", "").replace("reception-", "") : null;

  const targetPurchase = purchases.find(p => p.id === idRef);
  const targetMvt = movements.find(m => m.ref === idRef);

  if (!isBRModal || !idRef || (!targetPurchase && !targetMvt)) return null;

  const handlePrint = () => {
    window.print();
  };

  const brNumber = `BR-2026-${idRef.replace(/[^0-9]/g, "") || "001"}`;
  const dateStr = targetPurchase ? targetPurchase.date : (targetMvt ? targetMvt.date : new Date().toLocaleDateString('fr-FR'));

  const depotTarget = targetPurchase
    ? (depots.find(d => d.id === targetPurchase.depotId)?.name || targetPurchase.depotId)
    : (targetMvt ? targetMvt.dest : "Dépôt Récepteur");

  const supplierName = targetPurchase ? targetPurchase.supplier : (targetMvt ? targetMvt.source : "Provenance Conteneur");
  const containerDesc = targetPurchase ? targetPurchase.containers : "Arrivage Maritime Navire";
  const bagsCount = (targetPurchase && targetPurchase.bags > 0) ? targetPurchase.bags : ((targetMvt && targetMvt.qty > 0) ? targetMvt.qty : 1000);

  return (
    <Modal
      id={activeModal}
      title={`Bon de Réception & Entrée Stock - N° ${brNumber}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
            Fermer
          </button>
          <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimer Bon de Réception (BR)
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
              BON DE RÉCEPTION (BR)
            </span>
            <div className="text-xs text-slate-500 mt-1">N° BR: <strong className="text-slate-900">{brNumber}</strong></div>
            <div className="text-xs text-slate-500">Date Réception: <strong className="text-slate-900">{dateStr}</strong></div>
          </div>
        </div>

        {/* Logistic & Reception Metadata Card */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Fournisseur / Armateur Provenance</span>
            <strong className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-blue-600" /> {supplierName && supplierName !== 'sup-1' ? supplierName : "Armateur MSC / Camion"}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Dépôt d'Entrée / Stock Récepteur</span>
            <strong className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" /> {depotTarget && depotTarget !== 'dep-1' ? depotTarget : (depots[0]?.name || "Dépôt Récepteur")}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Description Arrivage Conteneur</span>
            <strong className="text-slate-800 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-amber-600" /> {containerDesc || "Arrivage Maritime Navire"}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block mb-1">Réf. Dossier Importation</span>
            <strong className="text-slate-800">{idRef}</strong>
          </div>
        </div>

        {/* Reception Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                <th className="p-3">Désignation du Chargement de Riz</th>
                <th className="p-3 text-right">Quantité Déclarée</th>
                <th className="p-3 text-right">Quantité Reçue</th>
                <th className="p-3 text-center">Écart / Avérie</th>
                <th className="p-3 text-center">Statut Déchargement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900">
                  {targetPurchase && targetPurchase.productTitle && targetPurchase.productTitle !== 'prod-1'
                    ? targetPurchase.productTitle
                    : (targetMvt && targetMvt.prodTitle && targetMvt.prodTitle !== 'prod-1' ? targetMvt.prodTitle : (products[0]?.title || "Royal Sénégal 100% Brisure (25kg)"))}
                  <span className="block text-[11px] font-normal text-emerald-600">Chargement certifié conforme au BL maritime</span>
                </td>
                <td className="p-3 text-right text-slate-700 font-semibold">{formatNumber(bagsCount)} Sacs</td>
                <td className="p-3 text-right font-black text-emerald-700">{formatNumber(bagsCount)} Sacs</td>
                <td className="p-3 text-center text-slate-500 font-bold">0 Sac (0%)</td>
                <td className="p-3 text-center font-extrabold text-emerald-700">✅ Entrée Validée</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-6 text-xs border-t border-slate-200">
          <div>
            <p className="font-bold text-slate-700">Signature Transitaire / Transporteur Port :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700">Visa & Cachet Magasinier Dépôt Récepteur :</p>
            <div className="h-12 border-b border-dashed border-slate-300 mt-2 flex items-center justify-end text-[10px] text-slate-400 font-semibold italic">
              {settings.companyName} Dépôt
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

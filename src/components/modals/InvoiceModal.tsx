"use client";

import React from "react";
import { Printer, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatNumber, numberToWordsFR } from "@/lib/utils";

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
  const clientNameDisplay = sale.clientName || "Client Comptoir";

  // Format clean address without duplicate city
  const companyAddress = settings.address || (depot?.city ? `${depot.city} - Sénégal` : "Dakar - Sénégal");

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Toolbar */}
        <div className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between no-print bg-[#0f172a]/90">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm text-white">Facture N° {sale.id}</h3>
              <p className="text-xs text-slate-400">Client : {clientNameDisplay} &bull; {sale.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4" /> Imprimer (A4)
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
          <div className="printable-document bg-white text-black p-8 sm:p-12 rounded-xl font-sans border border-slate-300 shadow-2xl mx-auto w-full max-w-[780px]">
            
            {/* 1. Header: Logo (No border) + Company Profile + Invoice Meta */}
            <div className="pb-5 border-b-2 border-black">
              <div className="flex items-start justify-between gap-6">
                {/* Left: Logo & Company Identity */}
                <div className="flex items-center gap-4">
                  {/* Clean Logo without border */}
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-black text-2xl tracking-tighter text-black font-mono">
                        {settings.companyName ? settings.companyName.slice(0, 2).toUpperCase() : "RZ"}
                      </span>
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-black font-serif">
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

                {/* Right: Invoice Reference Badge */}
                <div className="text-right shrink-0">
                  <div className="inline-block border-2 border-black px-4 py-1 bg-black text-white rounded text-center">
                    <span className="text-sm font-black tracking-widest uppercase">FACTURE</span>
                  </div>
                  <div className="mt-2 text-xs space-y-0.5 text-black">
                    <p className="font-mono font-black text-sm">N° {sale.id}</p>
                    <p className="text-xs">Date : <span className="font-mono font-bold">{sale.date}</span></p>
                    <p className="text-xs">Dépôt : <span className="font-bold">{depot?.name || "Dépôt Principal"}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Client & Transaction Details (Clean, Minimal 2-Column Grid) */}
            <div className="grid grid-cols-2 gap-4 my-5">
              {/* Left: Operation Details */}
              <div className="border border-black rounded-lg p-3 text-xs">
                <span className="text-[10px] uppercase font-black text-black block border-b border-black/20 pb-1 mb-2">
                  DÉTAILS OPÉRATION
                </span>
                <div className="space-y-1.5 text-xs text-black">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Facturé par :</span>
                    <span className="font-bold uppercase font-mono">{currentUser?.name || "Vendeur"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Mode de règlement :</span>
                    <span className="font-bold uppercase">{sale.paymentMode || "Espèces"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Statut :</span>
                    <span className="font-bold uppercase">{sale.status || (isPaid ? "Payé" : "À Crédit")}</span>
                  </div>
                </div>
              </div>

              {/* Right: Customer Details */}
              <div className="border-2 border-black rounded-lg p-3 text-xs">
                <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-1 mb-2">
                  FACTURÉ À / CLIENT
                </span>
                <div className="space-y-1.5 text-xs text-black">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-700">Nom / Raison :</span>
                    <span className="font-black text-xs uppercase">{clientNameDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Téléphone :</span>
                    <span className="font-mono font-bold">{matchedClient?.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-700">Adresse / Ville :</span>
                    <span className="font-bold">{matchedClient?.city || depot?.city || "Sénégal"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Items Accounting Table */}
            <div className="border-2 border-black my-5 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs text-black">
                <thead>
                  <tr className="border-b-2 border-black font-black uppercase text-center bg-slate-100 text-black">
                    <th className="py-2.5 px-3 border-r-2 border-black w-12 text-center font-black">#</th>
                    <th className="py-2.5 px-3 border-r-2 border-black text-left font-black">Désignation des Marchandises</th>
                    <th className="py-2.5 px-3 border-r-2 border-black w-24 text-center font-black">Qté</th>
                    <th className="py-2.5 px-3 border-r-2 border-black w-28 text-right font-black">Prix Unit.</th>
                    <th className="py-2.5 px-3 w-32 text-right font-black">Total (FCFA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black font-semibold text-black">
                  {saleItems.map((it, idx) => (
                    <tr key={idx} className="h-9">
                      <td className="py-2 px-3 border-r-2 border-black text-center font-mono font-bold text-slate-700">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r-2 border-black font-bold uppercase text-black">
                        {it.title}
                      </td>
                      <td className="py-2 px-3 border-r-2 border-black text-center font-mono font-bold">
                        {formatNumber(it.qty)} <span className="text-[10px] font-normal text-slate-600">sacs</span>
                      </td>
                      <td className="py-2 px-3 border-r-2 border-black text-right font-mono font-bold">
                        {formatNumber(it.price)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-black text-black">
                        {formatNumber(it.price * it.qty)}
                      </td>
                    </tr>
                  ))}
                  {/* Empty Spacer Rows */}
                  {Array.from({ length: Math.max(0, 5 - saleItems.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-8">
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

            {/* 4. Financial Summary & Amount in Words */}
            <div className="grid grid-cols-12 gap-5 mt-5 items-start">
              {/* Left: Amount in Words */}
              <div className="col-span-7">
                <div className="border border-black rounded-lg p-3.5 bg-slate-50">
                  <span className="text-[10px] uppercase font-black text-black block mb-1">
                    ARRÊTÉ LA PRÉSENTE FACTURE À LA SOMME DE :
                  </span>
                  <p className="text-xs font-serif font-black italic text-black leading-snug">
                    {numberToWordsFR(sale.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Right: Clean Financial Recap Box */}
              <div className="col-span-5 border-2 border-black rounded-xl overflow-hidden bg-white">
                <div className="p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-black">
                    <span className="text-slate-700">Total Brut HT :</span>
                    <span className="font-mono font-bold">{formatNumber(sale.totalAmount)} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center text-black">
                    <span className="text-slate-700">TVA (Exonérée) :</span>
                    <span className="font-mono font-bold">0 FCFA</span>
                  </div>
                  
                  {/* NET A PAYER */}
                  <div className="flex justify-between items-center pt-2 border-t-2 border-black font-black text-sm text-black">
                    <span className="uppercase tracking-tight">NET À PAYER :</span>
                    <span className="font-mono text-base font-black">{formatNumber(sale.totalAmount)} FCFA</span>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-black/20 text-xs">
                    <span className="text-slate-700">Montant Réglé :</span>
                    <span className="font-mono font-bold text-black">{formatNumber(reglement)} FCFA</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-black text-xs font-black">
                    <span>Reste à Payer :</span>
                    <span className={`font-mono ${resteAPayer > 0 ? 'text-red-700 font-black' : 'text-black'}`}>
                      {formatNumber(resteAPayer)} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Clean Single Signature / Cachet Box (Right-aligned, no client signature required) */}
            <div className="flex justify-end mt-8">
              <div className="w-64 border border-black rounded-lg p-3 h-28 flex flex-col justify-between text-xs text-right">
                <span className="font-bold text-[10px] uppercase text-black">
                  POUR L'ENTREPRISE / LA CAISSE :
                </span>
                <span className="text-[9px] text-slate-500 italic">Signature & Cachet autorisés</span>
              </div>
            </div>

            {/* 6. Discreet Minimal Footer */}
            <div className="mt-8 pt-3 border-t border-black/30 text-center text-[10px] text-slate-600 font-medium">
              <p>
                {settings.companyName || "CEEBU TOUBA"} &bull; Siège Social : {companyAddress} &bull; Tél : {settings.phone || "+221 77 855 25 50"}
              </p>
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
              <Printer className="w-4 h-4" /> Imprimer la Facture (PDF A4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



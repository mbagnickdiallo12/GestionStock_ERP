"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Printer, X, Copy, Truck, FileText, Sparkles, Edit3, UserCheck, Phone, MapPin, Hash, Check } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const DeliveryNoteModal: React.FC = () => {
  const { activeModal, openModal, closeModal, sales, movements, depots, settings, products, clients, currentUser, updateSale, showToast } = useApp();
  const [viewMode, setViewMode] = useState<"dual" | "bl_only">("dual");
  const [showDriverEdit, setShowDriverEdit] = useState(false);

  // Local driver info state
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverMatricule, setDriverMatricule] = useState("");
  const [driverAddress, setDriverAddress] = useState("");
  const [isSavingDriver, setIsSavingDriver] = useState(false);

  if (!activeModal || !activeModal.startsWith("bl-")) return null;

  const idRef = activeModal.replace("bl-", "");
  const targetSale = sales.find(s => s.id === idRef);
  const targetMvt = movements.find(m => m.ref === idRef || (m.dest && m.dest.includes(idRef)));

  if (!targetSale && !targetMvt && sales.length === 0) return null;

  // Sync driver info from targetSale
  useEffect(() => {
    if (targetSale) {
      setDriverName(targetSale.driverInfo?.fullName || "");
      setDriverPhone(targetSale.driverInfo?.phone || "");
      setDriverMatricule(targetSale.driverInfo?.matricule || "");
      setDriverAddress(targetSale.driverInfo?.address || "");
    } else if (targetMvt) {
      setDriverName(targetMvt.operator || "");
      setDriverPhone("");
      setDriverMatricule("");
      setDriverAddress("");
    }
  }, [targetSale, targetMvt]);

  const handleSaveDriver = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetSale) return;

    try {
      setIsSavingDriver(true);
      await updateSale(targetSale.id, {
        driverInfo: {
          fullName: driverName.trim(),
          phone: driverPhone.trim(),
          matricule: driverMatricule.trim(),
          address: driverAddress.trim()
        }
      });
      showToast("Informations chauffeur enregistrées sur le Bon de Livraison !", "success");
      setShowDriverEdit(false);
    } catch (err) {
      showToast("Erreur lors de l'enregistrement des informations chauffeur.", "error");
    } finally {
      setIsSavingDriver(false);
    }
  };

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

  const displayedDriver = driverName || (targetMvt ? targetMvt.operator : (currentUser?.name || "SUPERVISEUR")).toUpperCase();

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
      {/* Dynamic Print CSS calibrated strictly for 1 single A4 sheet */}
      <style>{`
        @media print {
          @page {
            size: ${viewMode === "dual" ? "landscape" : "portrait"};
            margin: ${viewMode === "dual" ? "4mm 5mm" : "6mm 8mm"};
          }
          html, body {
            height: 100% !important;
            max-height: 100% !important;
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
                <span>Bon de Livraison &bull; {idRef}</span>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {viewMode === "dual" ? "Double BL (2x sur 1 Feuille A4)" : "1 BL Plein Format"}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Destinataire : {recipient} &bull; {dateStr}</p>
            </div>
          </div>

          {/* Action & View Mode Toggle Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {targetSale && (
              <button
                type="button"
                onClick={() => setShowDriverEdit(!showDriverEdit)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  showDriverEdit || driverName
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-800 text-slate-300 hover:text-white border-white/10"
                }`}
                title="Saisir ou modifier les informations du chauffeur (Nom, Téléphone, Matricule, Adresse)"
              >
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>{driverName ? `Chauffeur: ${driverName.split(' ')[0]}` : "Infos Chauffeur"}</span>
              </button>
            )}

            {targetSale && (
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  setTimeout(() => openModal(`edit-sale-${targetSale.id}`), 100);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Modifier les articles, le prix, la date ou les détails de cette vente"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modifier Vente</span>
              </button>
            )}

            <div className="bg-slate-900 border border-white/10 rounded-xl p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("dual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "dual"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Imprimer 2 Bons de Livraison identiques sur 1 seule feuille A4"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>2x BL (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("bl_only")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "bl_only"
                    ? "bg-slate-700 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Imprimer 1 seul Bon de Livraison plein format"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>1 BL Plein</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer BL</span>
            </button>

            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Driver Quick Edit Form (Interactive Bar) */}
        {showDriverEdit && targetSale && (
          <div className="bg-slate-900/95 border-b border-amber-500/30 p-4 no-print text-slate-200 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Truck className="w-4 h-4" />
                <span>Renseigner les Informations du Chauffeur / Transporteur</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDriverEdit(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nom et Prénom</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Ex: Modou Fall"
                  className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Téléphone</label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="Ex: 77 123 45 67"
                  className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">N° Matricule / Camion</label>
                <input
                  type="text"
                  value={driverMatricule}
                  onChange={(e) => setDriverMatricule(e.target.value)}
                  placeholder="Ex: DK-8945-AA"
                  className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Adresse</label>
                <input
                  type="text"
                  value={driverAddress}
                  onChange={(e) => setDriverAddress(e.target.value)}
                  placeholder="Ex: Dakar Thiaroye"
                  className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSaveDriver}
                  disabled={isSavingDriver}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  {isSavingDriver ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Appliquer au BL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal Body / Sheet Viewport */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#090d16]/80">
          
          {/* ========================================================================= */}
          {/* 🌟 1. DUAL-VOLET MODE (2 BONS DE LIVRAISON SIDE-BY-SIDE ON 1 PAGE)        */}
          {/* ========================================================================= */}
          {viewMode === "dual" && (
            <div className="printable-document printable-dual-sheet bg-white text-black p-3 sm:p-5 font-sans border border-black shadow-2xl mx-auto w-full max-w-[1050px] grid grid-cols-1 md:grid-cols-2 gap-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-dashed divide-black">
              
              {/* ==================== VOLET GAUCHE : BON DE LIVRAISON (EXEMPLAIRE 1) ==================== */}
              <div className="flex flex-col justify-between pr-0 md:pr-3 space-y-1.5 h-full">
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

                  <div className="flex justify-between items-center py-1 border-b border-black text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-black uppercase">BON DE LIVRAISON</span>
                      <span className="font-mono text-xs">{blCode}</span>
                    </div>
                    <div className="font-mono text-[10px] text-black">
                      {dateStr} &nbsp; {timeStr}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-b-2 border-black text-[11px] font-bold">
                    <span className="uppercase text-black truncate max-w-[180px]">{recipient}</span>
                    <span className="font-mono text-black">{recipientPhone}</span>
                  </div>
                </div>

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
                      {deliveryItems.map((it, idx) => (
                        <tr key={idx} className="h-5">
                          <td className="py-0.5 px-1 border-r border-black text-center font-mono font-bold text-black">{it.qty}</td>
                          <td className="py-0.5 px-1.5 border-r border-black font-bold uppercase text-black text-[9.5px]">{it.title}</td>
                          <td className="py-0.5 px-1 border-r border-black text-right font-mono font-bold text-black">{formatNumber(it.price || 8250)}</td>
                          <td className="py-0.5 px-1.5 text-right font-mono font-bold text-black">{formatNumber((it.price || 8250) * it.qty)}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 5 - deliveryItems.length) }).map((_, i) => (
                        <tr key={`empty-bl1-${i}`} className="h-4">
                          <td className="border-r border-black text-center text-transparent">.</td>
                          <td className="border-r border-black"></td>
                          <td className="border-r border-black"></td>
                          <td></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-0.5">
                  <div className="grid grid-cols-12 gap-2 items-start text-[9.5px]">
                    <div className="col-span-6 space-y-0.5">
                      <div className="flex justify-between text-black font-semibold text-[8.5px]">
                        <span>Livré par / Chauffeur :</span>
                        <span className="font-bold truncate max-w-[110px]">{displayedDriver}</span>
                      </div>
                      {driverPhone && (
                        <div className="flex justify-between text-black font-semibold text-[8.5px]">
                          <span>Tél. Chauffeur :</span>
                          <span className="font-mono font-bold">{driverPhone}</span>
                        </div>
                      )}
                      {driverMatricule && (
                        <div className="flex justify-between text-black font-semibold text-[8.5px]">
                          <span>N° Matricule / Plaque :</span>
                          <span className="font-mono font-bold">{driverMatricule}</span>
                        </div>
                      )}
                      {driverAddress && (
                        <div className="flex justify-between text-black font-semibold text-[8.5px]">
                          <span>Adresse :</span>
                          <span className="font-semibold truncate max-w-[110px]">{driverAddress}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-black font-semibold text-[8.5px]">
                        <span>Dépôt Source :</span>
                        <span className="font-bold">{depotSource}</span>
                      </div>
                      <div className="border border-black p-0.5 rounded text-[7.5px] text-slate-700 leading-tight mt-0.5">
                        <span className="font-bold text-black">Signature Client : </span>
                        Marchandise reçue conforme.
                      </div>
                    </div>

                    <div className="col-span-6 border-2 border-black rounded p-1 space-y-0.5 bg-slate-50">
                      <div className="flex justify-between items-center text-black font-black text-[11px]">
                        <span>Total Sacs :</span>
                        <span className="font-mono text-xs">{totalBags} sacs</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[9.5px] pt-0.5 border-t border-black/30">
                        <span>Net à payer :</span>
                        <span className="font-mono">{formatNumber(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[9px] pt-0.5 border-t border-black/30">
                        <span>Règlement :</span>
                        <span className="font-mono">{formatNumber(reglement)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== VOLET DROIT : BON DE LIVRAISON (EXEMPLAIRE 2) ==================== */}
              <div className="flex flex-col justify-between pl-0 md:pl-3 space-y-1.5 h-full pt-3 md:pt-0">
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

                  <div className="flex justify-between items-center py-1 border-b border-black text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-black text-white px-1.5 py-0.5 text-[9px] font-black uppercase">BON DE LIVRAISON</span>
                      <span className="font-mono text-xs">{blCode}</span>
                    </div>
                    <div className="font-mono text-[10px] text-black">
                      {dateStr} &nbsp; {timeStr}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-0.5 border-b-2 border-black text-[11px] font-bold">
                    <span className="uppercase text-black truncate max-w-[180px]">{recipient}</span>
                    <span className="font-mono text-black">{recipientPhone}</span>
                  </div>
                </div>

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
                      {deliveryItems.map((it, idx) => (
                        <tr key={idx} className="h-5">
                          <td className="py-0.5 px-1 border-r border-black text-center font-mono font-bold text-black">{it.qty}</td>
                          <td className="py-0.5 px-1.5 border-r border-black font-bold uppercase text-black text-[9.5px]">{it.title}</td>
                          <td className="py-0.5 px-1 border-r border-black text-right font-mono font-bold text-black">{formatNumber(it.price || 8250)}</td>
                          <td className="py-0.5 px-1.5 text-right font-mono font-bold text-black">{formatNumber((it.price || 8250) * it.qty)}</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 5 - deliveryItems.length) }).map((_, i) => (
                        <tr key={`empty-bl-${i}`} className="h-4">
                          <td className="border-r border-black text-center text-transparent">.</td>
                          <td className="border-r border-black"></td>
                          <td className="border-r border-black"></td>
                          <td></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-0.5">
                  <div className="grid grid-cols-12 gap-2 items-start text-[9.5px]">
                    <div className="col-span-6 space-y-0.5">
                      <div className="flex justify-between text-black font-semibold text-[8.5px]">
                        <span>Livré par / Chauffeur :</span>
                        <span className="font-bold truncate max-w-[110px]">{displayedDriver}</span>
                      </div>
                      {driverPhone && (
                        <div className="flex justify-between text-black font-semibold text-[8.5px]">
                          <span>Tél. Chauffeur :</span>
                          <span className="font-mono font-bold">{driverPhone}</span>
                        </div>
                      )}
                      {driverMatricule && (
                        <div className="flex justify-between text-black font-semibold text-[8.5px]">
                          <span>N° Matricule / Plaque :</span>
                          <span className="font-mono font-bold">{driverMatricule}</span>
                        </div>
                      )}
                      {driverAddress && (
                        <div className="flex justify-between text-black font-semibold text-[8.5px]">
                          <span>Adresse :</span>
                          <span className="font-semibold truncate max-w-[110px]">{driverAddress}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-black font-semibold text-[8.5px]">
                        <span>Dépôt Source :</span>
                        <span className="font-bold">{depotSource}</span>
                      </div>
                      <div className="border border-black p-0.5 rounded text-[7.5px] text-slate-700 leading-tight mt-0.5">
                        <span className="font-bold text-black">Signature Client : </span>
                        Marchandise reçue conforme.
                      </div>
                    </div>

                    <div className="col-span-6 border-2 border-black rounded p-1 space-y-0.5 bg-slate-50">
                      <div className="flex justify-between items-center text-black font-black text-[11px]">
                        <span>Total Sacs :</span>
                        <span className="font-mono text-xs">{totalBags} sacs</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[9.5px] pt-0.5 border-t border-black/30">
                        <span>Net à payer :</span>
                        <span className="font-mono">{formatNumber(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-black font-bold text-[9px] pt-0.5 border-t border-black/30">
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
                      <span className="text-xs font-black tracking-widest uppercase">BON DE LIVRAISON</span>
                    </div>
                    <div className="mt-1.5 text-xs space-y-0.5 text-black">
                      <p className="font-mono font-black text-sm">N° {blCode}</p>
                      <p className="text-xs font-semibold">Date : <span className="font-mono font-bold">{dateStr} {timeStr}</span></p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-black">
                  <div className="border border-black rounded-lg p-2.5 space-y-1 bg-white">
                    <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-0.5 mb-1">ORIGINE & LOGISTIQUE</span>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Dépôt Expéditeur :</span><span className="font-bold">{depotSource}</span></div>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Chauffeur / Livré par :</span><span className="font-bold uppercase">{displayedDriver}</span></div>
                    {driverPhone && <div className="flex justify-between"><span className="text-slate-800 font-semibold">Téléphone Chauffeur :</span><span className="font-mono font-bold">{driverPhone}</span></div>}
                    {driverMatricule && <div className="flex justify-between"><span className="text-slate-800 font-semibold">N° Matricule / Plaque :</span><span className="font-mono font-bold">{driverMatricule}</span></div>}
                    {driverAddress && <div className="flex justify-between"><span className="text-slate-800 font-semibold">Adresse Chauffeur :</span><span className="font-semibold">{driverAddress}</span></div>}
                  </div>
                  <div className="border-2 border-black rounded-lg p-2.5 space-y-1 bg-white">
                    <span className="text-[10px] uppercase font-black text-black block border-b border-black pb-0.5 mb-1">DESTINATAIRE / RÉCEPTIONNAIRE</span>
                    <div className="flex justify-between items-baseline"><span className="text-slate-800 font-semibold">Client :</span><span className="font-black text-sm uppercase text-black">{recipient}</span></div>
                    <div className="flex justify-between"><span className="text-slate-800 font-semibold">Téléphone :</span><span className="font-mono font-bold text-black">{recipientPhone}</span></div>
                    {matchedClient?.address && (
                      <div className="flex justify-between"><span className="text-slate-800 font-semibold">Adresse Livraison :</span><span className="font-semibold text-black">{matchedClient.address}</span></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="my-3 flex-1 flex flex-col justify-start">
                <div className="border-2 border-black rounded-lg overflow-hidden flex-1 flex flex-col">
                  <table className="w-full text-left border-collapse text-xs text-black">
                    <thead>
                      <tr className="border-b-2 border-black font-black uppercase text-center bg-slate-100 text-black">
                        <th className="py-2 px-3 border-r-2 border-black w-14 text-center font-black">#</th>
                        <th className="py-2 px-3 border-r-2 border-black text-left font-black">DÉSIGNATION DE LA MARCHANDISE</th>
                        <th className="py-2 px-3 border-r-2 border-black w-40 text-center font-black">CONDITIONNEMENT</th>
                        <th className="py-2 px-3 w-36 text-right font-black">QUANTITÉ LIVRÉE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-semibold text-black">
                      {deliveryItems.map((it, idx) => (
                        <tr key={idx} className="h-8">
                          <td className="py-1.5 px-3 border-r-2 border-black text-center font-mono font-bold text-black">{idx + 1}</td>
                          <td className="py-1.5 px-3 border-r-2 border-black font-bold uppercase text-black text-xs sm:text-sm">{it.title}</td>
                          <td className="py-1.5 px-3 border-r-2 border-black text-center text-xs font-semibold text-black">Sacs d'origine 25kg/50kg</td>
                          <td className="py-1.5 px-3 text-right font-mono font-black text-sm text-black">{it.qty} Sacs</td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, 6 - deliveryItems.length) }).map((_, i) => (
                        <tr key={`empty-bl-${i}`} className="h-7">
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

              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div className="border border-black rounded-lg p-2.5 h-20 flex flex-col justify-between text-xs">
                    <span className="font-bold text-black uppercase text-[10px]">POUR LE TRANSPORTEUR / DÉPÔT :</span>
                    <span className="text-[9px] text-slate-600 italic">Signature & Visa d'expédition</span>
                  </div>
                  <div className="border-2 border-black rounded-lg p-2.5 h-20 flex flex-col justify-between text-xs text-right bg-slate-50">
                    <span className="font-black text-black uppercase text-[10px]">DÉCHARGE DU CLIENT RÉCEPTIONNAIRE :</span>
                    <span className="text-[9px] text-slate-600 italic">Mention "Reçu conforme sans réserve" + Signature</span>
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

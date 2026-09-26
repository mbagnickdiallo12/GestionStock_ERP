"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Sale, SaleItem, DriverInfo } from "@/types";
import { formatFCFA, formatNumber, isMatchingDepot, getUserAssignedDepot } from "@/lib/utils";
import { Plus, Trash2, Calendar, User, Building2, CreditCard, Truck, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export const EditSaleModal: React.FC = () => {
  const { activeModal, closeModal, sales, depots, products, clients, updateSale, currentUser, showToast } = useApp();

  const isEditModal = activeModal && activeModal.startsWith("edit-sale-");
  const saleId = isEditModal ? activeModal.replace("edit-sale-", "") : null;
  const targetSale = sales.find(s => s.id === saleId);

  const userRestricted = getUserAssignedDepot(currentUser, depots);

  // Form states
  const [date, setDate] = useState("");
  const [depotId, setDepotId] = useState("");
  const [clientName, setClientName] = useState("");
  const [paymentMode, setPaymentMode] = useState<Sale['paymentMode']>("Espece");
  const [status, setStatus] = useState<Sale['status']>("Payé");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [driverInfo, setDriverInfo] = useState<DriverInfo>({
    fullName: "",
    phone: "",
    matricule: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when targetSale changes
  useEffect(() => {
    if (targetSale) {
      setDate(targetSale.date || new Date().toISOString().slice(0, 16).replace("T", " "));
      setDepotId(targetSale.depotId || (depots[0]?.id || ""));
      setClientName(targetSale.clientName || "Client Comptoir");
      setPaymentMode(targetSale.paymentMode || "Espece");
      setStatus(targetSale.status || "Payé");
      setItems(targetSale.items && targetSale.items.length > 0 ? [...targetSale.items] : (products.length > 0 ? [{
        productId: products[0].id,
        title: products[0].title,
        qty: 1,
        price: products[0].sellPrice
      }] : []));
      setDriverInfo({
        fullName: targetSale.driverInfo?.fullName || "",
        phone: targetSale.driverInfo?.phone || "",
        matricule: targetSale.driverInfo?.matricule || "",
        address: targetSale.driverInfo?.address || ""
      });
    }
  }, [targetSale, products, depots]);

  if (!isEditModal || !targetSale) return null;

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      if (field === "productId") {
        const prod = products.find(p => p.id === value);
        if (prod) {
          next[index] = {
            ...next[index],
            productId: prod.id,
            title: prod.title,
            price: prod.sellPrice
          };
        }
      } else if (field === "qty") {
        const parsed = parseInt(value);
        next[index] = {
          ...next[index],
          qty: isNaN(parsed) ? 0 : Math.max(1, parsed)
        };
      } else if (field === "price") {
        const parsed = parseInt(value);
        next[index] = {
          ...next[index],
          price: isNaN(parsed) ? 0 : Math.max(0, parsed)
        };
      }
      return next;
    });
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setItems(prev => [
      ...prev,
      {
        productId: defaultProd.id,
        title: defaultProd.title,
        qty: 1,
        price: defaultProd.sellPrice
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast("La vente doit comporter au moins 1 article.", "warning");
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, it) => acc + (it.price * it.qty), 0);
  const totalBags = items.reduce((acc, it) => acc + it.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast("Veuillez ajouter au moins un produit.", "error");
      return;
    }
    if (!clientName.trim()) {
      showToast("Veuillez renseigner le nom du client.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateSale(targetSale.id, {
        date: date.trim(),
        depotId: userRestricted ? userRestricted.id : depotId,
        clientName: clientName.trim(),
        items,
        totalAmount,
        paymentMode,
        status,
        driverInfo: driverInfo.fullName.trim() ? driverInfo : undefined
      });
    } catch (err) {
      console.error("Error submitting updateSale:", err);
      showToast("Erreur lors de la mise à jour de la vente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      id={activeModal || "modal-edit-sale"}
      title={`Modifier la Vente / Facture • ${targetSale.id}`}
      size="xl"
      footer={(
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 hidden sm:flex">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Les stocks et les créances clients sont automatiquement recalculés.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer Modifications</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-200">
        
        {/* Top Info Grid: Date, Dépôt, Client, Mode Règlement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-slate-900/70 p-4 rounded-xl border border-white/10">
          {/* 1. Date de vente */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Date & Heure de la Vente *</span>
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="YYYY-MM-DD HH:mm"
              className="w-full bg-[#0f172a] border border-white/15 text-white font-mono text-xs px-3 py-2 rounded-xl outline-none focus:border-emerald-400"
              required
            />
          </div>

          {/* 2. Client */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Client / Acheteur *</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nom du client ou entreprise..."
              className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-emerald-400"
              required
            />
          </div>

          {/* 3. Dépôt */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Dépôt Source (Vendeur) *</span>
            </label>
            {userRestricted ? (
              <div className="w-full bg-[#0f172a] border border-amber-500/40 text-white text-xs px-3 py-2 rounded-xl flex items-center justify-between">
                <span>📍 {userRestricted.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">Affecté</span>
              </div>
            ) : (
              <select
                value={depotId}
                onChange={(e) => setDepotId(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-emerald-400"
                required
              >
                {depots.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#1e293b]">📍 {d.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* 4. Mode de Règlement */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mode de Paiement *</span>
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as any)}
              className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-emerald-400"
            >
              <option value="Espece" className="bg-[#1e293b]">💵 Espèces / Cash</option>
              <option value="Wave" className="bg-[#1e293b]">📲 Wave / Mobile Money</option>
              <option value="Virement" className="bg-[#1e293b]">🏦 Virement Bancaire</option>
              <option value="Cheque" className="bg-[#1e293b]">📜 Chèque Bancaire</option>
              <option value="Credit" className="bg-[#1e293b]">⏳ À Crédit (Créance client)</option>
            </select>
          </div>

          {/* 5. Statut */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Statut de la Facture *</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-emerald-400 font-bold"
            >
              <option value="Payé" className="bg-[#1e293b] text-emerald-400">✅ Payé / Encaissé</option>
              <option value="En attente" className="bg-[#1e293b] text-amber-400">⏳ En attente de règlement</option>
              <option value="Annulé" className="bg-[#1e293b] text-red-400">🚫 Annulé</option>
            </select>
          </div>
        </div>

        {/* Products Items Table Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Articles & Quantités de la Vente</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                {items.length} ligne(s)
              </span>
            </h4>

            <button
              type="button"
              onClick={handleAddItem}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Ajouter Article</span>
            </button>
          </div>

          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0f172a]/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-white/10">
                  <th className="py-2.5 px-3">Produit / Variété</th>
                  <th className="py-2.5 px-3 w-28 text-center">Quantité (Sacs)</th>
                  <th className="py-2.5 px-3 w-36 text-right">Prix Unitaire (FCFA)</th>
                  <th className="py-2.5 px-3 w-36 text-right">Total Ligne</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                        className="w-full bg-[#1e293b] border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer focus:border-emerald-400 font-bold"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.weight}kg)</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.qty === 0 ? "" : item.qty}
                        onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                        className="w-20 bg-[#1e293b] border border-white/15 text-white font-mono font-bold text-center text-xs px-2 py-1.5 rounded-lg outline-none focus:border-emerald-400"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={item.price === 0 ? "" : item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        className="w-28 bg-[#1e293b] border border-white/15 text-emerald-400 font-mono font-bold text-right text-xs px-2.5 py-1.5 rounded-lg outline-none focus:border-emerald-400"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">
                      {formatNumber(item.price * item.qty)} F
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals Banner */}
          <div className="bg-slate-900 border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs">
            <div className="text-slate-400 font-semibold">
              Volume total : <strong className="text-white font-mono font-bold">{totalBags} sacs</strong>
            </div>
            <div className="text-slate-300 font-semibold flex items-center gap-2">
              <span>Montant Total Facture :</span>
              <span className="text-emerald-400 font-black font-mono text-sm sm:text-base">
                {formatFCFA(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Informations Chauffeur / Bon de Livraison (BL) */}
        <div className="border border-white/10 rounded-xl p-4 bg-slate-900/60 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Informations du Chauffeur & Livraison (Pour le Bon de Livraison BL)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nom et Prénom Chauffeur</label>
              <input
                type="text"
                value={driverInfo.fullName}
                onChange={(e) => setDriverInfo({ ...driverInfo, fullName: e.target.value })}
                placeholder="Ex: Modou Fall"
                className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Numéro Téléphone</label>
              <input
                type="text"
                value={driverInfo.phone}
                onChange={(e) => setDriverInfo({ ...driverInfo, phone: e.target.value })}
                placeholder="Ex: 77 123 45 67"
                className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">N° Matricule / Plaque Camion</label>
              <input
                type="text"
                value={driverInfo.matricule}
                onChange={(e) => setDriverInfo({ ...driverInfo, matricule: e.target.value })}
                placeholder="Ex: DK-4589-AF"
                className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Adresse Chauffeur</label>
              <input
                type="text"
                value={driverInfo.address}
                onChange={(e) => setDriverInfo({ ...driverInfo, address: e.target.value })}
                placeholder="Ex: Dakar Thiaroye"
                className="w-full bg-[#0f172a] border border-white/15 text-white text-xs px-3 py-1.5 rounded-lg outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
};

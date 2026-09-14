"use client";

import React, { useState } from "react";
import { Search, ShoppingBag, Trash2, CheckCircle2, Minus, Plus, ImageIcon, Calculator, BookOpen, Lock, Unlock, Building2, Warehouse, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Sale } from "@/types";
import { formatNumber, formatFCFA, isMatchingDepot } from "@/lib/utils";

import { SkeletonGrid } from "@/components/ui/Skeleton";

export default function POSPage() {
  const { products, categories, stocks, activeDepotId, setActiveDepotId, depots, cart, addToCart, updateCartQty, setCartItemQty, clearCart, processCheckout, clients, cashSessions, openModal, showToast, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState("passant");
  const [customBuyerName, setCustomBuyerName] = useState("");
  const [paymentMode, setPaymentMode] = useState<Sale['paymentMode']>("Espece");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-10 w-full bg-slate-800 rounded-xl animate-pulse" />
          <SkeletonGrid count={6} />
        </div>
        <div className="lg:col-span-4 bg-[#1e293b] border border-white/10 rounded-2xl p-5 space-y-4 animate-pulse">
          <div className="h-6 w-32 bg-slate-700 rounded" />
          <div className="h-40 bg-slate-800/50 rounded-xl" />
          <div className="h-12 w-full bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  const openSession = cashSessions.find(s => s.status === "Ouverte");
  const activeDepotObj = depots.find(d => isMatchingDepot(d.id, activeDepotId, depots)) || depots[0];

  React.useEffect(() => {
    if (activeDepotId === "all" && depots.length > 0) {
      setActiveDepotId(depots[0].id);
    }
  }, [depots, activeDepotId, setActiveDepotId]);

  const handleCheckout = async () => {
    if (isSubmitting) return;
    if (cart.length === 0) {
      showToast("Le panier est vide. Veuillez sélectionner des produits.", "error");
      return;
    }
    if (!openSession) {
      showToast("Attention : La caisse est actuellement clôturée. Veuillez d'abord ouvrir la caisse enregistreuse.", "warning");
      openModal("modal-cash-audit");
      return;
    }
    try {
      setIsSubmitting(true);
      const finalClientName = selectedClient === "passant"
        ? (customBuyerName.trim() || "Client Comptoir")
        : selectedClient;
      await processCheckout(finalClientName, paymentMode);
      setCustomBuyerName("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchName = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchName && matchCat;
  });

  const totalBags = cart.reduce((acc, i) => acc + i.qty, 0);
  const totalAmount = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);

  return (
    <div className="space-y-4">
      {/* Page Header with Cash Journal & Shift Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Point de Vente (POS) & Caisse Enregistreuse</h1>
          <p className="text-sm text-slate-400 mt-1">Sélection visuelle des sacs, journal des encaissements en direct et état de caisse.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Shift Status Indicator */}
          <button
            onClick={() => openModal("modal-cash-audit")}
            className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-extrabold transition-all cursor-pointer hover:scale-[1.02] shadow-md ${
              openSession
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                : "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30 animate-pulse"
            }`}
            title={openSession ? "Caisse Ouverte - Cliquez pour consulter ou clôturer" : "Caisse Clôturée - Cliquez pour Ouvrir la Caisse"}
          >
            {openSession ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4 text-rose-400" />}
            <span>{openSession ? `Caisse Ouverte (Fond: ${formatNumber(openSession.openingBalance)} F)` : "🔒 Caisse Clôturée — Ouvrir Caisse"}</span>
          </button>

          <button
            onClick={() => openModal("modal-cash-journal")}
            className="bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-400" /> Journal de Caisse
          </button>

          <button
            onClick={() => openModal("modal-cash-audit")}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" /> État de Caisse & Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Product Catalog with Visuals */}
        <div className="lg:col-span-2 bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
          {/* Top Filter Bar: Search, Category & Depot Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-1.5 rounded-xl flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une variété de riz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white text-sm outline-none w-full"
              />
            </div>

            {/* Depot Selector for Point of Sale */}
            <div className="flex items-center gap-1.5 bg-[#0f172a] border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={activeDepotId}
                onChange={(e) => setActiveDepotId(e.target.value)}
                className="bg-transparent text-white text-xs sm:text-sm outline-none cursor-pointer font-bold"
                title="Choisir le dépôt vendeur pour afficher le stock réel"
              >
                <option value="all" className="bg-[#1e293b] text-white">📍 Tous les Dépôts (Stock Cumulé)</option>
                {depots.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#1e293b] text-white">📍 {d.name}</option>
                ))}
              </select>
            </div>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-[#0f172a] border border-white/15 text-white text-xs sm:text-sm px-3 py-1.5 rounded-xl outline-none cursor-pointer font-semibold"
            >
              <option value="all">Toutes Catégories</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Grid of Product Cards with Square Images (1:1 Ratio) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[620px] pr-1">
            {filteredProducts.map(p => {
              // Compute exact stock for this product based on active depot filter
              let totalStock = 0;
              if (activeDepotId === "all") {
                depots.forEach(d => {
                  totalStock += (stocks[d.id] && stocks[d.id][p.id]) || 0;
                });
                Object.keys(stocks).forEach(dId => {
                  if (!depots.some(d => d.id === dId)) {
                    totalStock += (stocks[dId] && stocks[dId][p.id]) || 0;
                  }
                });
              } else {
                Object.keys(stocks).forEach(dId => {
                  if (isMatchingDepot(dId, activeDepotId, depots)) {
                    totalStock += (stocks[dId] && stocks[dId][p.id]) || 0;
                  }
                });
              }

              const inCartItem = cart.find(item => item.productId === p.id);
              const inCartQty = inCartItem ? inCartItem.qty : 0;
              const remainingAvail = Math.max(0, totalStock - inCartQty);
              const isOutOfStock = totalStock <= 0;
              const isLow = remainingAvail <= p.alertThreshold && !isOutOfStock;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (isOutOfStock) {
                      showToast(`Rupture de stock pour "${p.title}"`, "warning");
                      return;
                    }
                    if (remainingAvail <= 0) {
                      showToast(`Quantité maximum disponible (${totalStock} sacs) déjà dans le panier !`, "warning");
                      return;
                    }
                    addToCart(p.id);
                  }}
                  className={`bg-[#0f172a] border rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 group shadow-lg shadow-black/40 ${
                    isOutOfStock ? "border-rose-900/40 opacity-70" : "border-white/10 hover:border-emerald-500"
                  }`}
                >
                  {/* Top Square Image Container (Format Carré 1:1) */}
                  <div className="relative aspect-square w-full bg-[#090d16] p-3 flex items-center justify-center border-b border-white/10 overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg drop-shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600 rounded-lg">
                        <ImageIcon className="w-10 h-10 opacity-40" />
                      </div>
                    )}
                    
                    {/* Weight & Code Badges Overlay */}
                    <span className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/20 text-amber-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-lg">
                      {p.weight} kg
                    </span>
                    <span className="absolute top-2.5 left-2.5 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-md font-mono shadow-lg">
                      {p.code}
                    </span>

                    {/* In Cart Indicator Overlay */}
                    {inCartQty > 0 && (
                      <span className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                        ✓ {inCartQty} au panier
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white leading-snug group-hover:text-emerald-400 transition-colors">{p.title}</h4>
                      
                      {/* Stock Details */}
                      <div className="flex flex-wrap items-center justify-between gap-1 mt-2">
                        <span className={`text-xs ${isOutOfStock ? 'text-rose-400 font-extrabold' : isLow ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                          Stock: <strong className={isOutOfStock ? "text-rose-400" : "text-white"}>{formatNumber(totalStock)} Sacs</strong>
                          <span className="text-[10px] text-slate-500 ml-1">
                            {activeDepotId === "all" ? "(Tous dépôts)" : `(${activeDepotObj?.name.split('-')[0].trim() || 'Dépôt'})`}
                          </span>
                        </span>
                        
                        {isOutOfStock ? (
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-extrabold">Rupture</span>
                        ) : isLow ? (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">Alerte</span>
                        ) : null}
                      </div>

                      {inCartQty > 0 && (
                        <div className="text-[11px] text-emerald-400/90 font-semibold mt-1">
                          Reste disponible: <strong className="text-white">{formatNumber(remainingAvail)} sacs</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-2">
                      <span className="text-base font-black text-emerald-400">{formatFCFA(p.sellPrice)}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                        isOutOfStock 
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : remainingAvail <= 0
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "text-slate-300 bg-white/5 group-hover:bg-emerald-600 group-hover:text-white"
                      }`}>
                        {isOutOfStock ? "Épuisé" : remainingAvail <= 0 ? "Max atteint" : "+ Ajouter"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart & Checkout Panel */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-base text-white flex items-center gap-2">
                🛒 Panier Client
              </span>
              <button 
                onClick={clearCart}
                className="bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Vider
              </button>
            </div>

            {/* Client Select & Buyer Name */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Client / Acheteur</label>
              <select
                value={selectedClient}
                onChange={(e) => {
                  setSelectedClient(e.target.value);
                  if (e.target.value !== "passant") {
                    setCustomBuyerName("");
                  }
                }}
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                <option value="passant">👤 Client Comptoir / Acheteur direct</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>👤 {c.name} ({c.city})</option>
                ))}
              </select>

              {selectedClient === "passant" && (
                <div className="pt-1">
                  <label className="text-[11px] font-semibold text-emerald-400 block mb-1">
                    Nom / Raison Sociale de l'Acheteur (pour la Facture) :
                  </label>
                  <input
                    type="text"
                    placeholder="ex: SGF SARL, Cheikh Amar, etc."
                    value={customBuyerName}
                    onChange={(e) => setCustomBuyerName(e.target.value)}
                    className="w-full bg-[#090d16] border border-emerald-500/40 focus:border-emerald-400 text-white text-xs px-3 py-2 rounded-xl outline-none placeholder:text-slate-500 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="mt-4 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">Panier vide. Cliquez sur une photo au format carré à gauche pour ajouter.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="bg-[#0f172a] border border-white/10 p-3 rounded-xl flex flex-col gap-2 text-xs shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-white truncate">{item.title}</span>
                        <span className="text-slate-400">{formatNumber(item.price)} F x {formatNumber(item.qty)} = <strong className="text-emerald-400">{formatNumber(item.price * item.qty)} F</strong></span>
                      </div>
                      <div className="flex items-center gap-1 bg-[#1e293b] p-1 rounded-xl border border-white/15 shrink-0">
                        <button
                          onClick={() => updateCartQty(item.productId, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors"
                          title="Diminuer (-1 sac)"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.qty === 0 ? "" : item.qty}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                            setCartItemQty(item.productId, isNaN(val) ? 0 : val);
                          }}
                          onBlur={() => {
                            if (!item.qty || item.qty <= 0) {
                              setCartItemQty(item.productId, 1);
                            }
                          }}
                          className="w-14 text-center font-black text-white text-sm bg-[#090d16] outline-none font-mono rounded px-1 py-0.5 border border-white/15 focus:border-emerald-400 focus:bg-black shadow-inner"
                          title="Saisir directement le nombre de sacs"
                        />
                        <button
                          onClick={() => updateCartQty(item.productId, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer transition-colors shadow-sm"
                          title="Augmenter (+1 sac)"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Wholesale Bulk Quantity Buttons */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 font-semibold">Gros :</span>
                      {[+10, +50, +100, +200, +500].map(batch => (
                        <button
                          key={batch}
                          type="button"
                          onClick={() => updateCartQty(item.productId, batch)}
                          className="bg-white/5 hover:bg-emerald-600 hover:text-white text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer border border-white/10"
                        >
                          +{batch}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Summary & Validation */}
          <div className="bg-black/20 p-4 rounded-xl space-y-3 border border-white/5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Dépôt vendeur (débité) :</span>
              <strong className="text-emerald-400 font-bold">{activeDepotObj?.name || "Dépôt Principal"}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Nombre de sacs total:</span>
              <strong className="text-white">{formatNumber(totalBags)} Sacs</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Sous-total:</span>
              <span className="text-white">{formatFCFA(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white border-t border-white/10 pt-2">
              <span>Total Net à Payer:</span>
              <span className="text-emerald-400">{formatFCFA(totalAmount)}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Mode de Règlement</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as Sale['paymentMode'])}
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                <option value="Espece">💵 Espèces / Cash</option>
                <option value="Wave">📲 Wave / Mobile Money</option>
                <option value="Virement">🏦 Virement Bancaire</option>
                <option value="Cheque">📜 Chèque Bancaire</option>
                <option value="Credit">⏳ Crédit Client (30 Jours)</option>
              </select>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              className={`w-full text-white font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all mt-2 ${
                isSubmitting || cart.length === 0
                  ? "bg-slate-700/60 opacity-60 cursor-not-allowed text-slate-300"
                  : "bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-900/40 hover:-translate-y-0.5 cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Valider & Imprimer Facture
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

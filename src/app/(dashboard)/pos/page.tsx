"use client";

import React, { useState } from "react";
import { Search, ShoppingBag, Trash2, CheckCircle2, Minus, Plus, ImageIcon, Calculator, BookOpen, Lock, Unlock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Sale } from "@/types";
import { formatNumber, formatFCFA } from "@/lib/utils";

import { SkeletonGrid } from "@/components/ui/Skeleton";

export default function POSPage() {
  const { products, categories, stocks, activeDepotId, depots, cart, addToCart, updateCartQty, clearCart, processCheckout, clients, cashSessions, openModal, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState("passant");
  const [paymentMode, setPaymentMode] = useState<Sale['paymentMode']>("Espece");

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
          {/* Shift Status Indicator */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
            openSession
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/15 border-red-500/30 text-red-400"
          }`}>
            {openSession ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{openSession ? `Caisse Ouverte (Fond: ${formatNumber(openSession.openingBalance)} F)` : "Caisse Clôturée"}</span>
          </div>

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-1.5 rounded-xl flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une variété de riz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white text-sm outline-none w-full"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-1.5 rounded-xl outline-none cursor-pointer font-semibold"
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
              let avail = 0;
              if (activeDepotId === "all") {
                Object.keys(stocks).forEach(dId => avail += (stocks[dId][p.id] || 0));
              } else {
                avail = (stocks[activeDepotId] && stocks[activeDepotId][p.id]) || 0;
              }

              const isLow = avail <= p.alertThreshold;

              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p.id)}
                  className="bg-[#0f172a] border border-white/10 hover:border-emerald-500 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 group shadow-lg shadow-black/40"
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
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-white leading-snug group-hover:text-emerald-400 transition-colors">{p.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${isLow ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                          Stock: <strong className="text-white">{formatNumber(avail)} Sacs</strong>
                        </span>
                        {isLow && (
                          <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">Alerte</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-2">
                      <span className="text-base font-black text-emerald-400">{formatFCFA(p.sellPrice)}</span>
                      <span className="text-xs font-bold text-slate-300 bg-white/5 group-hover:bg-emerald-600 group-hover:text-white px-2.5 py-1 rounded-lg transition-colors">
                        + Ajouter
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

            {/* Client Select */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Client / Grossiste</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
              >
                <option value="passant">👤 Client Comptoir (Comptant)</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>👤 {c.name} ({c.city})</option>
                ))}
              </select>
            </div>

            {/* Cart Items List */}
            <div className="mt-4 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">Panier vide. Cliquez sur une photo au format carré à gauche pour ajouter.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="bg-[#0f172a] border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{item.title}</span>
                      <span className="text-slate-400">{formatNumber(item.price)} F x {item.qty} = <strong className="text-emerald-400">{formatNumber(item.price * item.qty)} F</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#1e293b] p-1 rounded-xl border border-white/15">
                      <button
                        onClick={() => updateCartQty(item.productId, -1)}
                        className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                        title="Diminuer la quantité"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <span className="w-6 text-center font-black text-white text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(item.productId, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer transition-colors"
                        title="Augmenter la quantité"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Summary & Validation */}
          <div className="bg-black/20 p-4 rounded-xl space-y-3 border border-white/5">
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
              onClick={() => processCheckout(selectedClient, paymentMode)}
              className="w-full bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all hover:-translate-y-0.5 mt-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" /> Valider & Imprimer Facture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

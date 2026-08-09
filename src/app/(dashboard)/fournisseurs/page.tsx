"use client";

import React, { useState } from "react";
import { Plus, Search, Pencil, Trash2, Globe, Phone, Mail, Clock, Star } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { canCreate } from "@/lib/utils";

import { SkeletonTable } from "@/components/ui/Skeleton";

export default function FournisseursPage() {
  const { suppliers, openModal, deleteSupplier, askConfirm, currentUser, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  const filteredSuppliers = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        s.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCountry = countryFilter === "all" || s.country.toLowerCase().includes(countryFilter.toLowerCase());
    return matchSearch && matchCountry;
  });

  const handleDelete = (id: string, name: string) => {
    askConfirm({
      title: "Supprimer le Fournisseur ?",
      message: `Êtes-vous sûr de vouloir supprimer définitivement le fournisseur "${name}" ?`,
      confirmLabel: "Oui, Supprimer le Fournisseur",
      onConfirm: () => deleteSupplier(id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Répertoire des Fournisseurs</h1>
          <p className="text-sm text-slate-400 mt-1">Armateurs, traders de riz internationaux (Inde, Thaïlande) et importateurs locaux.</p>
        </div>
        {canCreate(currentUser, 'fournisseurs') && (
          <button 
            onClick={() => openModal("modal-add-supplier")}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nouveau Fournisseur
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur, un pays, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
        >
          <option value="all">Tous les Pays / Origines</option>
          <option value="Inde">Inde / Singapour</option>
          <option value="Thaïlande">Thaïlande</option>
          <option value="Sénégal">Sénégal / Local</option>
        </select>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map(s => (
          <div key={s.id} className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" /> {s.country}
                </span>
                <span className="text-amber-400 text-xs font-bold flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {s.rating}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-2">{s.name}</h3>

              <div className="text-xs text-slate-400 space-y-2 mt-4">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-500" /> {s.phone}</div>
                <div className="flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 text-slate-500" /> {s.email}</div>
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-500" /> Délai Moyen: <strong className="text-white">{s.leadTime}</strong></div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => openModal(`edit-supplier-${s.id}`)}
                className="bg-slate-700/50 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="Modifier les coordonnées du fournisseur"
              >
                <Pencil className="w-3.5 h-3.5 text-emerald-400" /> Modifier
              </button>
              <button
                onClick={() => handleDelete(s.id, s.name)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg text-xs font-medium flex items-center justify-center cursor-pointer transition-colors"
                title="Supprimer ce fournisseur"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

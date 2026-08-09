"use client";

import React, { useState } from "react";
import { Plus, Search, MapPin, Warehouse, User, Phone, Pencil, Trash2, ClipboardList } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";

import { SkeletonGrid } from "@/components/ui/Skeleton";

export default function DepotsPage() {
  const { depots, products, stocks, openModal, deleteDepot, askConfirm, setActiveDepotId, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <SkeletonGrid count={3} />
      </div>
    );
  }

  const filteredDepots = depots.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCity = cityFilter === "all" || d.city === cityFilter;
    return matchSearch && matchCity;
  });

  const handleDelete = (id: string, name: string) => {
    askConfirm({
      title: "Supprimer le Dépôt ?",
      message: `Êtes-vous sûr de vouloir supprimer définitivement le dépôt "${name}" ? Cette action est irréversible.`,
      confirmLabel: "Oui, Supprimer le Dépôt",
      onConfirm: () => deleteDepot(id),
    });
  };

  const handleStartInventory = (depotId: string) => {
    setActiveDepotId(depotId);
    openModal("modal-new-inventory");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Gestion des Entrepôts & Dépôts de Riz</h1>
          <p className="text-sm text-slate-400 mt-1">Supervision multi-sites, capacités de stockage en sacs et inventaires par entrepôt.</p>
        </div>
        <button 
          onClick={() => openModal("modal-add-depot")}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nouveau Dépôt
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de dépôt, ville, gérant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
        >
          <option value="all">Toutes les Villes</option>
          <option value="Dakar">Dakar</option>
          <option value="Pikine">Pikine / Thiaroye</option>
          <option value="Touba">Touba</option>
          <option value="Abidjan">Abidjan (Port)</option>
        </select>
      </div>

      {/* Grid of Depots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDepots.map(d => {
          let totalBags = 0;
          let stockVal = 0;

          if (stocks[d.id]) {
            Object.keys(stocks[d.id]).forEach(pId => {
              const qty = stocks[d.id][pId];
              totalBags += qty;
              const prod = products.find(p => p.id === pId);
              if (prod) stockVal += qty * prod.sellPrice;
            });
          }

          const percent = Math.min(100, Math.round((totalBags / d.capacity) * 100));

          return (
            <div key={d.id} className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-emerald-500/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">{d.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {d.city}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  d.status === 'Actif' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                }`}>
                  {d.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Capacité Occupée</span>
                  <strong className="text-white">{formatNumber(totalBags)} / {formatNumber(d.capacity)} Sacs ({percent}%)</strong>
                </div>
                <div className="w-full bg-[#0f172a] h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-white/10">
                <div>
                  <span className="text-slate-400 block">Gérant Responsable</span>
                  <strong className="text-slate-200 flex items-center gap-1 mt-0.5">
                    <User className="w-3.5 h-3.5 text-blue-400" /> {d.manager}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Téléphone Contact</span>
                  <strong className="text-slate-200 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> {d.phone}
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <button
                  onClick={() => handleStartInventory(d.id)}
                  className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ClipboardList className="w-4 h-4" /> Inventaire Dépôt
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openModal(`edit-depot-${d.id}`)}
                    className="bg-slate-700/50 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-emerald-400" /> Modifier
                  </button>
                  <button 
                    onClick={() => handleDelete(d.id, d.name)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    title="Supprimer ce dépôt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

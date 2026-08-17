"use client";

import React, { useState } from "react";
import { Plus, Package, Edit, Trash2, Search, Upload, Image as ImageIcon, X, Tag } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Modal } from "@/components/ui/Modal";
import { Product } from "@/types";
import { formatFCFA, formatNumber, canCreate, canManage } from "@/lib/utils";

import { SkeletonGrid } from "@/components/ui/Skeleton";

export default function ProduitsPage() {
  const { products, categories, addProduct, deleteProduct, openModal, closeModal, askConfirm, currentUser, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [weightFilter, setWeightFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <SkeletonGrid count={6} />
      </div>
    );
  }

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(categories[0]?.slug || "parfume");
  const [weight, setWeight] = useState(50);
  const [buyPrice, setBuyPrice] = useState(18500);
  const [sellPrice, setSellPrice] = useState(22500);
  const [alertT, setAlertT] = useState(500);
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80");

  const PRESET_IMAGES = [
    { label: "Riz Parfumé", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
    { label: "Riz Brisé", url: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80" },
    { label: "Riz Blanc", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80" },
    { label: "Riz Local", url: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=600&q=80" },
  ];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchWeight = weightFilter === "all" || p.weight.toString() === weightFilter;
    return matchSearch && matchCat && matchWeight;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addProduct({
      title,
      category,
      weight,
      buyPrice,
      sellPrice,
      alertThreshold: alertT,
      imageUrl
    });
    setTitle("");
  };

  const handleDelete = (id: string, prodTitle: string) => {
    askConfirm({
      title: "Supprimer le Produit ?",
      message: `Êtes-vous sûr de vouloir supprimer définitivement la variété de riz "${prodTitle}" du catalogue ?`,
      confirmLabel: "Oui, Supprimer du Catalogue",
      onConfirm: () => deleteProduct(id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Catalogue des Sacs de Riz & Catégories</h1>
          <p className="text-sm text-slate-400 mt-1">Variétés de riz, gestion des catégories, contenants (50kg, 25kg), prix d'achat, de vente et photos.</p>
        </div>

        {canCreate(currentUser, 'produits') && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openModal("modal-manage-categories")}
              className="bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4 text-emerald-400" /> Gérer les Catégories ({categories.length})
            </button>
            
            <button
              onClick={() => openModal("modal-add-product")}
              className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nouveau Produit
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom de riz, code (RZ-PF-50)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-semibold"
          >
            <option value="all">Toutes les Catégories</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={weightFilter}
            onChange={(e) => setWeightFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all">Tous les Formats</option>
            <option value="50">Format Sacs 50 kg</option>
            <option value="25">Format Sacs 25 kg</option>
          </select>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Visuel</th>
                <th className="p-3">Code</th>
                <th className="p-3">Désignation Produit</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Format / Sac</th>
                <th className="p-3">Prix Achat FCFA</th>
                <th className="p-3">Prix Vente Gros FCFA</th>
                <th className="p-3">Marge / Sac</th>
                <th className="p-3">Seuil Alerte</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map(p => {
                const margin = p.sellPrice - p.buyPrice;
                const categoryObj = categories.find(c => c.slug === p.category);

                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/40 border border-white/15 shrink-0 shadow-md group">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Package className="w-5 h-5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3"><span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded text-xs font-bold font-mono">{p.code}</span></td>
                    <td className="p-3 font-bold text-white">
                      {p.title}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold border border-white/10 text-slate-200" style={{ backgroundColor: `${categoryObj?.color || "#10b981"}20`, color: categoryObj?.color || "#10b981" }}>
                        {categoryObj ? categoryObj.name : p.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{p.weight} kg</td>
                    <td className="p-3 text-slate-300 font-mono">{formatFCFA(p.buyPrice)}</td>
                    <td className="p-3 font-bold text-emerald-400 font-mono">{formatFCFA(p.sellPrice)}</td>
                    <td className="p-3 font-mono"><span className="text-emerald-400 font-bold">+{formatFCFA(margin)}</span></td>
                    <td className="p-3"><span className="bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded text-xs font-bold">{formatNumber(p.alertThreshold)} Sacs</span></td>
                    <td className="p-3">
                      {canManage(currentUser, 'produits') ? (
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => openModal(`edit-product-${p.id}`)}
                            className="bg-slate-700/50 hover:bg-slate-700 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            title="Modifier les prix, photo et catégorie"
                          >
                            <Edit className="w-3.5 h-3.5 text-emerald-400" /> Modifier
                          </button>
                          <button 
                            onClick={() => handleDelete(p.id, p.title)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded text-xs font-medium flex items-center justify-center cursor-pointer transition-colors"
                            title="Supprimer ce produit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">Lecture seule</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        id="modal-add-product"
        title="Ajouter une Variété de Riz & Visuel POS"
        footer={(
          <>
            <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
            <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Ajouter au Catalogue</button>
          </>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload Box */}
          <div className="bg-[#0f172a] border border-white/15 p-4 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-400" /> Photo du Sac de Riz (Visible en Caisse / POS)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {imageUrl ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-500/50 group shrink-0 bg-black/40">
                  <img src={imageUrl} alt="Produit preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Supprimer la photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-slate-400 text-xs shrink-0 bg-white/5">
                  <ImageIcon className="w-6 h-6 mb-1 text-slate-500" />
                  <span>Pas d'image</span>
                </div>
              )}

              <div className="flex-1 space-y-2 text-xs w-full">
                <div className="flex items-center gap-2">
                  <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Téléverser Image
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <span className="text-slate-400 text-[11px]">PNG, JPG ou WebP</span>
                </div>

                {/* Preset Selector */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-semibold">Ou choisir une photo prédéfinie :</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          imageUrl === preset.url ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" : "bg-[#1e293b] text-slate-300 border-white/10 hover:text-white"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Désignation Produit *</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="ex: Riz Parfumé Super Deluxe 50kg" 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Catégorie de Riz</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-bold"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Poids du Sac (kg)</label>
              <input 
                type="number" 
                value={weight} 
                onChange={(e) => setWeight(parseInt(e.target.value) || 50)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Prix d'Achat Moyen (FCFA)</label>
              <input 
                type="number" 
                value={buyPrice} 
                onChange={(e) => setBuyPrice(parseInt(e.target.value) || 15000)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none font-mono" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Prix de Vente Gros (FCFA)</label>
              <input 
                type="number" 
                value={sellPrice} 
                onChange={(e) => setSellPrice(parseInt(e.target.value) || 18000)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none font-mono font-bold text-emerald-400" 
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Seuil d'Alerte Stock Bas (Sacs)</label>
              <input 
                type="number" 
                value={alertT} 
                onChange={(e) => setAlertT(parseInt(e.target.value) || 500)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" 
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

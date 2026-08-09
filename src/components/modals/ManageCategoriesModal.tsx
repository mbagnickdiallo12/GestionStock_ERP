"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Plus, Edit, Trash2, Tag, Check } from "lucide-react";
import { Category } from "@/types";

export const ManageCategoriesModal: React.FC = () => {
  const { activeModal, closeModal, categories, products, addCategory, updateCategory, deleteCategory, askConfirm } = useApp();

  const isOpen = activeModal === "modal-manage-categories";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#10b981");

  if (!isOpen) return null;

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setColor(cat.color || "#10b981");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setColor("#10b981");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (editingId) {
      updateCategory(editingId, { name, slug: generatedSlug, description, color });
      setEditingId(null);
    } else {
      addCategory({ name, slug: generatedSlug, description, color });
    }

    setName("");
    setSlug("");
    setDescription("");
  };

  const handleDelete = (id: string, catName: string) => {
    askConfirm({
      title: "Supprimer la Catégorie ?",
      message: `Êtes-vous sûr de vouloir supprimer la catégorie "${catName}" ? Les produits associés seront automatiquement réattribués.`,
      confirmLabel: "Oui, Supprimer",
      onConfirm: () => deleteCategory(id),
    });
  };

  return (
    <Modal
      id="modal-manage-categories"
      title="Gestion des Catégories de Riz & Produits"
      footer={(
        <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Fermer</button>
      )}
    >
      <div className="space-y-5 text-sm">
        {/* Category Form */}
        <form onSubmit={handleSubmit} className="bg-[#0f172a] border border-white/10 p-4 rounded-xl space-y-3">
          <span className="font-bold text-xs text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Tag className="w-4 h-4 text-emerald-400" />
              {editingId ? `Modifier la Catégorie` : `Créer une Nouvelle Catégorie`}
            </span>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="text-xs text-slate-400 hover:text-white underline cursor-pointer">
                Annuler la modification
              </button>
            )}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nom de la Catégorie *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                placeholder="ex: Riz Cargo / Étuvé"
                className="w-full bg-[#1e293b] border border-white/15 text-white text-xs px-3 py-2 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Identifiant Raccourci (Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="etuve"
                className="w-full bg-[#1e293b] border border-white/15 text-white font-mono text-xs px-3 py-2 rounded-lg outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Description Métier</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description courte de la variété de riz..."
                className="w-full bg-[#1e293b] border border-white/15 text-white text-xs px-3 py-2 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Couleur du Badge:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-colors"
            >
              {editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {editingId ? "Enregistrer" : "Créer Catégorie"}
            </button>
          </div>
        </form>

        {/* Existing Categories Table */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl space-y-3">
          <span className="font-bold text-xs text-white">Catégories Actives ({categories.length})</span>

          <div className="space-y-2">
            {categories.map(cat => {
              const productCount = products.filter(p => p.category === cat.slug).length;

              return (
                <div key={cat.id} className="bg-[#1e293b] border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shrink-0 shadow" style={{ backgroundColor: cat.color || "#10b981" }} />
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        {cat.name}
                        <span className="text-[10px] text-slate-400 font-mono">({cat.slug})</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{cat.description || "Aucune description"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {productCount} Produit(s)
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors cursor-pointer"
                        title="Supprimer"
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
      </div>
    </Modal>
  );
};

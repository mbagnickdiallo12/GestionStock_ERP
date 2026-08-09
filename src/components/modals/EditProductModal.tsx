"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Product } from "@/types";
import { Upload, Image as ImageIcon, X } from "lucide-react";

export const EditProductModal: React.FC = () => {
  const { activeModal, closeModal, products, categories, updateProduct } = useApp();

  const isEditModal = activeModal && activeModal.startsWith("edit-product-");
  const productId = isEditModal ? activeModal.replace("edit-product-", "") : null;
  const targetProduct = products.find(p => p.id === productId);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("parfume");
  const [weight, setWeight] = useState(50);
  const [buyPrice, setBuyPrice] = useState(18500);
  const [sellPrice, setSellPrice] = useState(22500);
  const [alertThreshold, setAlertThreshold] = useState(500);
  const [imageUrl, setImageUrl] = useState("");

  const PRESET_IMAGES = [
    { label: "👑 Royal Sénégal", url: "/royal_senegal_bag.jpg" },
    { label: "Riz Parfumé", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
    { label: "Riz Brisé", url: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80" },
    { label: "Riz Blanc", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80" },
    { label: "Riz Local", url: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=600&q=80" },
  ];

  useEffect(() => {
    if (targetProduct) {
      setTitle(targetProduct.title);
      setCategory(targetProduct.category);
      setWeight(targetProduct.weight);
      setBuyPrice(targetProduct.buyPrice);
      setSellPrice(targetProduct.sellPrice);
      setAlertThreshold(targetProduct.alertThreshold);
      setImageUrl(targetProduct.imageUrl || PRESET_IMAGES[0].url);
    }
  }, [targetProduct]);

  if (!isEditModal || !targetProduct) return null;

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
    if (!productId) return;
    updateProduct(productId, {
      title,
      category,
      weight,
      buyPrice,
      sellPrice,
      alertThreshold,
      imageUrl
    });
  };

  return (
    <Modal
      id={`edit-product-${productId}`}
      title={`Modifier Produit: ${targetProduct.title}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Enregistrer Produit & Photo</button>
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

        {/* Product Info Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Désignation du Sac de Riz *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Catégorie de Riz</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-bold">
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Poids du Contenant (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value) || 50)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Prix d'Achat FCFA</label>
            <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none font-mono" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Prix de Vente Gros FCFA</label>
            <input type="number" value={sellPrice} onChange={(e) => setSellPrice(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none font-mono font-bold text-emerald-400" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Seuil d'Alerte Stock Bas (Sacs)</label>
            <input type="number" value={alertThreshold} onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>
        </div>
      </form>
    </Modal>
  );
};

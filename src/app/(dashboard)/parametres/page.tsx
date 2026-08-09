"use client";

import React, { useState, useRef } from "react";
import { Save, Building2, ShieldAlert, Download, RefreshCw, Upload, Image as ImageIcon, Trash2, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";

import { Skeleton } from "@/components/ui/Skeleton";

export default function ParametresPage() {
  const { settings, updateSettings, showToast, askConfirm, depots, products, stocks, sales, expenses, isLoading } = useApp();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState(settings.currency);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [rccm, setRccm] = useState(settings.rccm);
  const [vatRate, setVatRate] = useState(settings.vatRate || 0);
  const [minAlertDefault, setMinAlertDefault] = useState(settings.minAlertDefault || 500);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    setCompanyName(settings.companyName);
    setCurrency(settings.currency);
    setPhone(settings.phone);
    setAddress(settings.address);
    setRccm(settings.rccm);
    setVatRate(settings.vatRate || 0);
    setMinAlertDefault(settings.minAlertDefault || 500);
    setLogoUrl(settings.logoUrl);
  }, [settings]);

  const [invoiceFooterNote, setInvoiceFooterNote] = useState(
    "Les sacs de riz vendus et livrés sont vérifiés au comptoir. Merci de votre confiance !"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("L'image du logo ne doit pas dépasser 2 Mo", "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoUrl(result);
        updateSettings({ logoUrl: result });
        showToast("Logo de l'entreprise mis à jour avec succès !", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(undefined);
    updateSettings({ logoUrl: undefined });
    showToast("Logo retiré des documents imprimables.", "info");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      currency,
      phone,
      address,
      rccm,
      vatRate,
      minAlertDefault,
      logoUrl
    });
  };

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      settings: { companyName, currency, phone, address, rccm, vatRate, minAlertDefault, logoUrl },
      depotsCount: depots.length,
      productsCount: products.length,
      salesCount: sales.length,
      expensesCount: expenses.length,
      depots,
      products,
      stocks,
      sales,
      expenses
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `RizStock_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Sauvegarde intégrale JSON de la base de données exportée !", "success");
  };

  const handleResetData = () => {
    askConfirm({
      title: "Réinitialiser la Base de Données ERP ?",
      message: "Êtes-vous sûr de vouloir réinitialiser toutes les données locales aux valeurs d'usine ? Cette action effacera vos paramètres enregistrés.",
      confirmLabel: "Oui, Réinitialiser les Données",
      onConfirm: () => {
        localStorage.removeItem("RizStock_Settings");
        localStorage.removeItem("RizStock_Theme");
        showToast("Données système réinitialisées. Rechargement...", "warning");
        setTimeout(() => window.location.reload(), 1500);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Paramètres Généraux & Branding de l'Entreprise</h1>
          <p className="text-sm text-slate-400 mt-1">Logo officiel, informations d'en-tête de facture, bons de livraison/réception et sauvegardes.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Enregistrer Modifs
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 0: Logo Officiel de l'Entreprise */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-extrabold text-base">
            <ImageIcon className="w-5 h-5 text-emerald-500" /> Logo Officiel (Factures, Reçus, BL & BR)
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-2xl bg-[#0f172a] border border-white/15 flex items-center justify-center p-2 relative overflow-hidden group shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Entreprise" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-400 block font-semibold">Aucun Logo</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-center sm:text-left flex-1">
              <div>
                <h4 className="text-sm font-bold text-white">Importer le Logo de la Société</h4>
                <p className="text-xs text-slate-400 mt-1">Le logo apparaîtra automatiquement sur l'ensemble de vos factures de vente, reçus POS, Bons de Livraison (BL) et Bons de Réception (BR).</p>
              </div>

              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                onChange={handleLogoUpload} 
                className="hidden" 
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" /> Choisir une Image (PNG, JPG, SVG)
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Retirer Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Coordonnées Société */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-extrabold text-base">
            <Building2 className="w-5 h-5 text-emerald-500" /> Coordonnées & En-tête des Factures
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Raison Sociale / Société *</label>
              <input 
                type="text" 
                required
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Devise de Gestion *</label>
              <input 
                type="text" 
                required
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Numéro NINEA / RCCM</label>
              <input 
                type="text" 
                value={rccm} 
                onChange={(e) => setRccm(e.target.value)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Téléphone Contact Factures</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500" 
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Adresse du Siège Social</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500" 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fiscalité & Alertes de Stock */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-extrabold text-base">
            <ShieldAlert className="w-5 h-5 text-amber-500" /> Fiscalité (TVA) & Alertes de Stock Critiques
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Taux TVA par Défaut (%)</label>
              <input 
                type="number" 
                value={vatRate} 
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500" 
              />
              <span className="text-[11px] text-slate-500 mt-1 block">0% pour exonération produits vivriers de première nécessité (Riz)</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Seuil Alerte Stock Bas Général (en Sacs)</label>
              <input 
                type="number" 
                value={minAlertDefault} 
                onChange={(e) => setMinAlertDefault(parseInt(e.target.value) || 500)} 
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500" 
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Déclenche un badge rouge d'alerte lorsque le stock de sacs passe en dessous</span>
            </div>
          </div>
        </div>

        {/* Section 3: Modèle de Reçus POS */}
        <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-extrabold text-base">
            <FileText className="w-5 h-5 text-blue-500" /> Note de bas de page des Reçus POS & Factures
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Mentions Légales / Conditions d'Échange</label>
            <textarea 
              rows={2}
              value={invoiceFooterNote} 
              onChange={(e) => setInvoiceFooterNote(e.target.value)} 
              className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500" 
            />
          </div>
        </div>
      </form>

      {/* Section 4: Sauvegarde & Restauration Système */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-extrabold text-base">
          <Download className="w-5 h-5 text-purple-500" /> Sauvegarde & Restauration de la Base de Données
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Sauvegarde Complète au Format JSON</h4>
            <p className="text-xs text-slate-400">Téléchargez une copie intégrale de vos dépôts, stocks, ventes, créances et catalogue de riz.</p>
          </div>
          <button
            onClick={handleExportBackup}
            className="bg-slate-700/50 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Télécharger Sauvegarde JSON
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-400">Réinitialisation des Données ERP</h4>
            <p className="text-xs text-slate-400">Réinitialise le stockage local et restaure les paramètres système par défaut.</p>
          </div>
          <button
            onClick={handleResetData}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs px-4 py-2.5 rounded-xl border border-red-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Réinitialiser le Système
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Save, Building2, ShieldAlert, Download, RefreshCw, Upload, Image as ImageIcon, Trash2, FileText, Database, RotateCcw, AlertTriangle, CheckCircle2, History, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { BackupVersion } from "@/types";

export default function ParametresPage() {
  const { 
    settings, updateSettings, showToast, askConfirm, depots, products, stocks, sales, expenses, clients, suppliers, employees, users, purchases,
    backupVersions, createBackupSnapshot, restoreBackupVersion, deleteBackupVersion, importBackupJSON, resetSystemWithAutoBackup,
    isLoading 
  } = useApp();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState(settings.currency);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [rccm, setRccm] = useState(settings.rccm);
  const [vatRate, setVatRate] = useState(settings.vatRate || 0);
  const [minAlertDefault, setMinAlertDefault] = useState(settings.minAlertDefault || 500);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(settings.logoUrl);

  const [isResetSecurityModalOpen, setIsResetSecurityModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
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
    const snapshot = createBackupSnapshot(`Sauvegarde Manuelle JSON (${new Date().toLocaleDateString('fr-FR')})`, 'manual_export');
    
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(snapshot, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `RizStock_ERP_Backup_${snapshot.id}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`Sauvegarde ${snapshot.id} exportée avec succès !`, "success");
  };

  const handleDownloadVersionJSON = (version: BackupVersion) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(version, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `RizStock_Backup_${version.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`Fichier JSON de la version ${version.id} téléchargé !`, "info");
  };

  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          const success = importBackupJSON(parsed);
          if (success && jsonInputRef.current) {
            jsonInputRef.current.value = "";
          }
        } catch (err: any) {
          showToast("Fichier JSON corrompu ou illisible !", "error");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmExecuteReset = () => {
    if (resetConfirmInput.trim().toUpperCase() !== "REINITIALISER") {
      showToast("Veuillez saisir 'REINITIALISER' pour confirmer la sécurité.", "warning");
      return;
    }
    setIsResetSecurityModalOpen(false);
    setResetConfirmInput("");
    resetSystemWithAutoBackup();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Paramètres Généraux & Branding de l'Entreprise</h1>
          <p className="text-sm text-slate-400 mt-1">Logo officiel, informations d'en-tête de facture, sauvegardes et restauration des données.</p>
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
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-extrabold text-base">
          <Database className="w-5 h-5 text-purple-400" /> Sauvegarde, Restauration & Réinitialisation Sécurisée
        </div>

        {/* Action 1: Exportation & Importation Manuelle JSON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" /> Exportation Sauvegarde JSON
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Téléchargez une copie intégrale sous fichier `.json` de vos dépôts, stocks, ventes, créances et catalogue de riz.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
            >
              <Download className="w-4 h-4" /> Télécharger Sauvegarde JSON
            </button>
          </div>

          <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" /> Restauration Fichier JSON
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Importez un fichier de sauvegarde `.json` téléchargé précédemment pour restaurer instantanément votre base de données.
              </p>
            </div>

            <input 
              type="file" 
              ref={jsonInputRef} 
              accept=".json,application/json" 
              onChange={handleImportJSONFile} 
              className="hidden" 
            />

            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-950/40"
            >
              <Upload className="w-4 h-4" /> Importer et Restaurer Fichier JSON
            </button>
          </div>
        </div>

        {/* Action 2: Historique des Versions de Sauvegarde & Restauration (Versioned Restores) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" /> Historique des Versions de Sauvegarde & Restauration ({backupVersions.length})
            </h4>
            {backupVersions.length > 0 && (
              <span className="text-[11px] text-slate-400 font-medium">Une version de secours est créée automatiquement avant chaque réinitialisation.</span>
            )}
          </div>

          {backupVersions.length === 0 ? (
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 text-center text-slate-400 text-xs italic">
              Aucune version de sauvegarde enregistrée pour le moment. Exportez un fichier JSON ou effectuez une réinitialisation pour créer une version de secours automatique.
            </div>
          ) : (
            <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 uppercase text-[10px] text-slate-400 bg-black/40 sticky top-0">
                    <th className="p-3">Date & Heure</th>
                    <th className="p-3">Libellé / Type Version</th>
                    <th className="p-3 text-center">Données</th>
                    <th className="p-3 text-right">Chiffre d'Affaires</th>
                    <th className="p-3 text-right">Actions Restauration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {backupVersions.map((ver) => (
                    <tr key={ver.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                        {new Date(ver.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            ver.type === 'auto_reset' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {ver.type === 'auto_reset' ? 'Auto-Reset' : 'Manuelle'}
                          </span>
                          <span className="truncate max-w-[200px]" title={ver.label}>{ver.label}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center text-slate-400 font-mono whitespace-nowrap">
                        {ver.salesCount || 0} ventes • {ver.productsCount || 0} produits
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {formatFCFA(ver.totalRevenue || 0)}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => askConfirm({
                            title: `Restaurer la version ${ver.id} ?`,
                            message: `Êtes-vous sûr de vouloir restaurer les données telles qu'elles étaient le ${new Date(ver.timestamp).toLocaleString('fr-FR')} (${ver.salesCount || 0} ventes, ${ver.productsCount || 0} produits) ?`,
                            confirmLabel: "Oui, Restaurer cette version",
                            onConfirm: () => restoreBackupVersion(ver.id)
                          })}
                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded-lg font-bold text-[11px] border border-emerald-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restaurer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadVersionJSON(ver)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer inline-flex items-center"
                          title="Télécharger JSON de cette version"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBackupVersion(ver.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer inline-flex items-center"
                          title="Supprimer cette version de l'historique"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action 3: Réinitialisation Sécurisée des Données ERP */}
        <div className="bg-red-950/20 border border-red-500/30 p-5 rounded-2xl space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-red-400">Réinitialisation des Données & Remise à Zéro Système</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Réinitialise les paramètres d'usine du système ERP. <strong className="text-amber-300 font-bold">Sécurité garantie :</strong> Une sauvegarde automatique de secours est automatiquement générée et conservée dans l'historique ci-dessus avant l'exécution.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-red-500/20">
            <button
              type="button"
              onClick={() => setIsResetSecurityModalOpen(true)}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/50"
            >
              <RefreshCw className="w-4 h-4" /> Réinitialiser le Système ERP
            </button>
          </div>
        </div>
      </div>

      {/* Strict Security Reset Confirmation Modal */}
      {isResetSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

            <button
              type="button"
              onClick={() => setIsResetSecurityModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 shadow-lg shadow-red-950/50">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  Alerte de Sécurité — Réinitialisation
                </h3>
                <p className="text-xs text-slate-300">
                  Vous êtes sur le point de réinitialiser le système ERP. Une <strong className="text-emerald-400 font-bold">sauvegarde automatique de secours</strong> sera créée immédiatement avant l'effacement.
                </p>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-white/10 p-3.5 rounded-xl space-y-2 text-xs">
              <label className="font-bold text-slate-300 block">
                Tapez <span className="text-red-400 font-mono font-black select-all">REINITIALISER</span> pour débloquer la confirmation :
              </label>
              <input
                type="text"
                placeholder="REINITIALISER"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                className="w-full bg-[#1e293b] border border-red-500/40 text-white font-mono font-bold text-sm px-3 py-2 rounded-xl outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsResetSecurityModalOpen(false);
                  setResetConfirmInput("");
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={resetConfirmInput.trim().toUpperCase() !== "REINITIALISER"}
                onClick={handleConfirmExecuteReset}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                  resetConfirmInput.trim().toUpperCase() === "REINITIALISER"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-950/60 cursor-pointer"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                }`}
              >
                <RefreshCw className="w-4 h-4" /> Confirmer la Réinitialisation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

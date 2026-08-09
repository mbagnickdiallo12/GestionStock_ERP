"use client";

import React, { useState } from "react";
import { Plus, Search, ShieldCheck, UserCheck, Lock, Edit, Trash2, Key, CheckCircle, XCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { canCreate, canManage } from "@/lib/utils";

import { SkeletonTable } from "@/components/ui/Skeleton";

export default function UtilisateursPage() {
  const { users, deleteUser, openModal, askConfirm, isLoading, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

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

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.depot.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleDelete = (username: string, name: string) => {
    askConfirm({
      title: "Supprimer le Compte Utilisateur ?",
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'accès ERP de "${name}" (${username}) ?`,
      confirmLabel: "Oui, Supprimer Accès",
      onConfirm: () => deleteUser(username),
    });
  };

  const permissionsMatrix = [
    { module: "Tableau de Bord & KPIs", admin: true, gerant: true, caissier: false, comptable: true, personnalise: true },
    { module: "Point de Vente (POS) & Ventes", admin: true, gerant: true, caissier: true, comptable: false, personnalise: true },
    { module: "Gestion des Dépôts de Riz", admin: true, gerant: true, caissier: false, comptable: false, personnalise: true },
    { module: "Entrées/Sorties & Transferts Stock", admin: true, gerant: true, caissier: false, comptable: false, personnalise: true },
    { module: "🔒 Inventaires Physiques & Ajustements Stock (Sensible)", admin: true, gerant: false, caissier: false, comptable: false, personnalise: false },
    { module: "Achats & Arrivages Conteneurs", admin: true, gerant: false, caissier: false, comptable: true, personnalise: true },
    { module: "Dépenses Opérationnelles", admin: true, gerant: true, caissier: false, comptable: true, personnalise: true },
    { module: "Gestion des Fournisseurs", admin: true, gerant: false, caissier: false, comptable: true, personnalise: true },
    { module: "Recouvrement Créances Clients", admin: true, gerant: true, caissier: false, comptable: true, personnalise: true },
    { module: "Gestion RH, Avances & Paie", admin: true, gerant: false, caissier: false, comptable: false, personnalise: true },
    { module: "Rapports Financiers & Bilans", admin: true, gerant: false, caissier: false, comptable: true, personnalise: true },
    { module: "Journal d'Activités & Audit", admin: true, gerant: false, caissier: false, comptable: false, personnalise: true },
    { module: "🔒 Gestion des Rôles & Accès (Sensible)", admin: true, gerant: false, caissier: false, comptable: false, personnalise: false },
    { module: "🔒 Paramètres ERP & Branding (Sensible)", admin: true, gerant: false, caissier: false, comptable: false, personnalise: false },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" /> Rôles, Utilisateurs & Habilitations Sur-Mesure
          </h1>
          <p className="text-sm text-slate-400 mt-1">Gestion des accès ERP, définition des rôles personnalisés et matrice des permissions (RBAC).</p>
        </div>
        {canCreate(currentUser, 'utilisateurs') && (
          <button 
            onClick={() => openModal("modal-add-user")}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Enrôler un Utilisateur
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, identifiant ou dépôt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#0f172a] border border-white/15 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer"
        >
          <option value="all">Tous les Rôles</option>
          <option value="personnalise">⭐ Rôle Personnalisé / Sur-Mesure</option>
          <option value="admin">Administrateur</option>
          <option value="gerant">Gérant de Dépôt</option>
          <option value="caissier">Caissier / POS</option>
          <option value="comptable">Comptable</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Nom Utilisateur</th>
                <th className="p-3">Email / Identifiant</th>
                <th className="p-3">Rôle Attribué</th>
                <th className="p-3">Dépôt Affecté</th>
                <th className="p-3">Dernière Connexion</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(u => (
                <tr key={u.username} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    {u.name}
                  </td>
                  <td className="p-3 text-slate-300 font-mono text-xs">{u.username}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      u.role === 'admin' ? 'bg-blue-500/15 text-blue-400' :
                      u.role === 'gerant' ? 'bg-emerald-500/15 text-emerald-400' :
                      u.role === 'caissier' ? 'bg-amber-500/15 text-amber-400' :
                      u.role === 'personnalise' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-purple-500/15 text-purple-400'
                    }`}>
                      {u.role === 'personnalise' ? '⭐ SUR-MESURE' : u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 text-xs">{u.depot}</td>
                  <td className="p-3 text-slate-400 text-xs">{u.lastLogin}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.status === 'Actif' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {canManage(currentUser, 'utilisateurs') ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(`reset-pass-${u.username}`)}
                          className="bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Réinitialiser le mot de passe"
                        >
                          <Key className="w-3.5 h-3.5" /> Pass
                        </button>
                        <button 
                          onClick={() => openModal(`edit-user-${u.username}`)}
                          className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" /> Modifier
                        </button>
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleDelete(u.username, u.name)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors cursor-pointer"
                            title="Révoquer cet utilisateur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs italic">Consultation</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="font-extrabold text-base text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Matrice Officielle des Droits & Habilitations par Rôle (RBAC)
          </span>
          <span className="text-xs text-slate-400">Contrôle d'Accès Sécurisé</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase bg-black/20 font-bold">
                <th className="p-3">Module / Fonctionnalité ERP</th>
                <th className="p-3 text-center">Administrateur</th>
                <th className="p-3 text-center">Gérant de Dépôt</th>
                <th className="p-3 text-center">Caissier / POS</th>
                <th className="p-3 text-center">Comptable</th>
                <th className="p-3 text-center text-purple-300">⭐ Rôle Personnalisé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-semibold text-white">{row.module}</td>
                  <td className="p-3 text-center">
                    {row.admin ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="p-3 text-center">
                    {row.gerant ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="p-3 text-center">
                    {row.caissier ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="p-3 text-center">
                    {row.comptable ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                  </td>
                  <td className="p-3 text-center font-bold">
                    {row.personnalise ? (
                      <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Autorisé
                      </span>
                    ) : (
                      <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                        <Lock className="w-3 h-3 text-red-400" /> Exclu (Sensible)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { UserAccount } from "@/types";
import { ShieldCheck, CheckSquare, Square } from "lucide-react";

export const EditUserModal: React.FC = () => {
  const { activeModal, closeModal, users, depots, updateUser } = useApp();

  const isEditModal = activeModal && activeModal.startsWith("edit-user-");
  const username = isEditModal ? activeModal.replace("edit-user-", "") : null;
  const targetUser = users.find(u => u.username === username);

  const ALL_MODULES = [
    { key: "dashboard", label: "Tableau de Bord & KPIs" },
    { key: "pos", label: "Point de Vente (POS) & Ventes" },
    { key: "ventes", label: "Historique des Ventes" },
    { key: "depots", label: "Gestion des Dépôts de Riz" },
    { key: "produits", label: "Catalogue Produits" },
    { key: "stocks", label: "Entrées/Sorties & Transferts Stock" },
    { key: "inventaire", label: "🔒 Inventaires Physiques & Ajustements Stock (Sensible)" },
    { key: "achats", label: "Achats & Arrivages Conteneurs" },
    { key: "fournisseurs", label: "Gestion des Fournisseurs" },
    { key: "clients", label: "Recouvrement Créances Clients" },
    { key: "depenses", label: "Dépenses Opérationnelles" },
    { key: "rh", label: "Gestion RH, Avances & Paie" },
    { key: "rapports", label: "Rapports Financiers & Bilans" },
    { key: "activites", label: "Journal d'Activités & Audit" },
    { key: "utilisateurs", label: "🔒 Rôles & Habilitations Accès (Sensible)" },
    { key: "parametres", label: "🔒 Paramètres ERP & Branding (Sensible)" },
  ];

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserAccount['role']>("gerant");
  const [depot, setDepot] = useState("Tous");
  const [status, setStatus] = useState<'Actif' | 'Suspendu'>("Actif");
  const [password, setPassword] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  useEffect(() => {
    if (targetUser) {
      setName(targetUser.name);
      setRole(targetUser.role);
      setDepot(targetUser.depot);
      setStatus(targetUser.status);
      setPassword(targetUser.password || "");
      setSelectedPerms(targetUser.customPermissions || ["dashboard", "pos", "ventes", "depots", "produits", "stocks", "achats", "fournisseurs", "clients", "depenses", "rh", "rapports", "activites"]);
    }
  }, [targetUser]);

  if (!isEditModal || !targetUser) return null;

  const togglePermission = (key: string) => {
    if (selectedPerms.includes(key)) {
      setSelectedPerms(selectedPerms.filter(k => k !== key));
    } else {
      setSelectedPerms([...selectedPerms, key]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    updateUser(username, {
      name,
      role,
      depot,
      status,
      password: password || targetUser.password,
      customPermissions: role === "personnalise" ? selectedPerms : undefined
    });
  };

  return (
    <Modal
      id={`edit-user-${targetUser.username}`}
      title={`Modifier le Compte Utilisateur - ${targetUser.name}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Enregistrer Modifications</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nom & Prénom *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Rôle ERP</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-bold">
              <option value="personnalise">⭐ Rôle Personnalisé / Sur-Mesure</option>
              <option value="admin">Administrateur Général</option>
              <option value="gerant">Gérant de Dépôt</option>
              <option value="caissier">Caissier / POS</option>
              <option value="comptable">Comptable</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt d'Affectation</label>
            <select value={depot} onChange={(e) => setDepot(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
              <option value="Tous">Tous les Dépôts</option>
              {depots.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Statut du Compte</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-bold">
              <option value="Actif">Actif (Accès Autorisé)</option>
              <option value="Suspendu">Suspendu (Accès Bloqué)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Modifier Mot de Passe (Optionnel)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Laissez vide pour conserver l'actuel" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>
        </div>

        {/* Custom Permissions Selector */}
        {role === "personnalise" && (
          <div className="bg-[#0f172a] border border-white/15 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Habilitations Sur-Mesure pour {targetUser.name}
              </span>
              <span className="text-[11px] text-slate-400">{selectedPerms.length} / {ALL_MODULES.length} modules autorisés</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-h-48 overflow-y-auto pr-1">
              {ALL_MODULES.map(m => {
                const isChecked = selectedPerms.includes(m.key);
                const isSensitive = m.key === "inventaire" || m.key === "utilisateurs" || m.key === "parametres";

                return (
                  <div
                    key={m.key}
                    onClick={() => togglePermission(m.key)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                      isChecked 
                        ? isSensitive 
                          ? "bg-purple-500/15 border-purple-500/30 text-purple-300" 
                          : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-bold" 
                        : "bg-[#1e293b] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-500 shrink-0" />}
                    <span className="truncate">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

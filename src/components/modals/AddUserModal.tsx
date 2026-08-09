"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { UserAccount } from "@/types";
import { ShieldCheck, CheckSquare, Square } from "lucide-react";

export const AddUserModal: React.FC = () => {
  const { depots, addUser, closeModal } = useApp();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("RizStock@2026");
  const [role, setRole] = useState<UserAccount['role']>("personnalise");
  const [depot, setDepot] = useState("Tous");

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

  // Default custom permissions: grant standard operational modules, EXCLUDE sensitive ones (inventaire, utilisateurs, parametres) by default!
  const [selectedPerms, setSelectedPerms] = useState<string[]>([
    "dashboard", "pos", "ventes", "depots", "produits", "stocks", "achats", "fournisseurs", "clients", "depenses", "rh", "rapports", "activites"
  ]);

  const togglePermission = (key: string) => {
    if (selectedPerms.includes(key)) {
      setSelectedPerms(selectedPerms.filter(k => k !== key));
    } else {
      setSelectedPerms([...selectedPerms, key]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;
    addUser({
      name,
      username,
      password,
      role,
      depot,
      status: "Actif",
      customPermissions: role === "personnalise" ? selectedPerms : undefined
    });
    setName("");
    setUsername("");
    setPassword("RizStock@2026");
  };

  return (
    <Modal
      id="modal-add-user"
      title="Créer un Compte Utilisateur & Habilitations Sur-Mesure"
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Créer Compte</button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nom & Prénom *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Demba Ndao" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Identifiant / Login *</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="demba.n" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Mot de Passe Initial *</label>
            <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Definissez un mot de passe" className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Rôle Attribué</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer font-bold">
              <option value="personnalise">⭐ Rôle Personnalisé / Sur-Mesure</option>
              <option value="admin">Administrateur Général</option>
              <option value="gerant">Gérant de Dépôt</option>
              <option value="caissier">Caissier / POS</option>
              <option value="comptable">Comptable</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt d'Affectation</label>
            <select value={depot} onChange={(e) => setDepot(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
              <option value="Tous">Tous les Dépôts</option>
              {depots.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {/* Custom Permissions Selector */}
        {role === "personnalise" && (
          <div className="bg-[#0f172a] border border-white/15 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cocher les Modules Accès de ce Rôle Personnalisé
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

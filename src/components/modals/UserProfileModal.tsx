"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Key, ShieldCheck, Building2, Lock, LogOut } from "lucide-react";

export const UserProfileModal: React.FC = () => {
  const { activeModal, closeModal, users, activeRole, updateUser, showToast, logoutUser } = useApp();

  const isOpen = activeModal === "modal-user-profile";

  // Active simulated user based on activeRole
  const currentUser = users.find(u => u.role.toLowerCase() === activeRole.toLowerCase()) || users[0];

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  if (!isOpen || !currentUser) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser.password && currentPass && currentPass !== currentUser.password) {
      showToast("L'ancien mot de passe saisi est incorrect !", "error");
      return;
    }

    if (!newPass || newPass.length < 4) {
      showToast("Le nouveau mot de passe doit contenir au moins 4 caractères", "error");
      return;
    }
    if (newPass !== confirmPass) {
      showToast("La confirmation ne correspond pas au nouveau mot de passe !", "error");
      return;
    }

    updateUser(currentUser.username, { password: newPass });
    showToast("Votre mot de passe a été mis à jour avec succès !", "success");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    closeModal();
  };

  return (
    <Modal
      id="modal-user-profile"
      title={`Mon Profil & Mot de Passe - ${currentUser.name}`}
      footer={(
        <div className="flex items-center justify-between gap-3 w-full">
          <button
            onClick={logoutUser}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <LogOut className="w-4 h-4" /> Se Déconnecter de l'ERP
          </button>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">
            Fermer
          </button>
        </div>
      )}
    >
      <div className="space-y-5">
        {/* User Badge Info Card */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl uppercase shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              {currentUser.name}
              <span className="bg-blue-500/15 text-blue-400 text-xs px-2.5 py-0.5 rounded-full uppercase font-bold">
                {currentUser.role}
              </span>
            </h3>
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
              <span>Identifiant (Login): <strong className="text-white">{currentUser.username}</strong></span>
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-emerald-400" /> {currentUser.depot}</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} className="bg-[#1e293b] border border-white/10 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-white font-extrabold text-sm">
            <Lock className="w-4 h-4 text-amber-400" /> Changer Mon Mot de Passe Utilisateur
          </div>

          <div className="space-y-3 text-xs">
            {currentUser.password && (
              <div>
                <label className="font-semibold text-slate-400 block mb-1">Mot de Passe Actuel</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Saisissez votre mot de passe actuel"
                  className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-400 block mb-1">Nouveau Mot de Passe *</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">Confirmer le Nouveau Mot de Passe *</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Répétez le nouveau mot de passe"
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-900/30"
          >
            <ShieldCheck className="w-4 h-4" /> Valider Mon Nouveau Mot de Passe
          </button>
        </form>
      </div>
    </Modal>
  );
};

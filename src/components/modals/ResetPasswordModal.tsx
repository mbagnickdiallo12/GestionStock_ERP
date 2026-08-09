"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { Key } from "lucide-react";

export const ResetPasswordModal: React.FC = () => {
  const { activeModal, closeModal, users, updateUser, showToast } = useApp();

  const isResetModal = activeModal && activeModal.startsWith("reset-pass-");
  const username = isResetModal ? activeModal.replace("reset-pass-", "") : null;
  const targetUser = users.find(u => u.username === username);

  const [newPassword, setNewPassword] = useState("RizStock@2026");

  if (!isResetModal || !targetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !newPassword) return;
    updateUser(username, { password: newPassword });
    showToast(`Le mot de passe de l'utilisateur ${targetUser.name} a été réinitialisé !`, "success");
    closeModal();
  };

  return (
    <Modal
      id={`reset-pass-${username}`}
      title={`Réinitialiser Mot de Passe - ${targetUser.name}`}
      footer={(
        <>
          <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
          <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer">
            <Key className="w-4 h-4" /> Définir le Nouveau Mot de Passe
          </button>
        </>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-xl space-y-1 text-xs">
          <div className="text-slate-400">Utilisateur Concerné : <strong className="text-white">{targetUser.name} ({targetUser.username})</strong></div>
          <div className="text-slate-400">Rôle ERP : <strong className="text-blue-400 uppercase">{targetUser.role}</strong></div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">Mot de Passe Réinitialisé *</label>
          <input
            type="text"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/15 text-white text-sm font-bold px-3 py-2 rounded-xl outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};

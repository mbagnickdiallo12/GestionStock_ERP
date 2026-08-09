"use client";

import React from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Sun, Moon, ShoppingCart, Menu, User, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";

export const Header: React.FC = () => {
  const { currentUser, activeDepotId, setActiveDepotId, activeRole, setActiveRole, depots, setMobileMenuOpen, theme, toggleTheme, clearCart, showToast, openModal, logoutUser } = useApp();

  const handleNewSale = () => {
    clearCart();
    showToast("Nouvelle session de vente ouverte !", "info");
  };

  return (
    <header className="h-[70px] bg-[#0f172a]/85 backdrop-blur-md border-b border-white/10 px-4 sm:px-7 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Menu Button & Active Depot Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg bg-[#1e293b] border border-white/10 text-slate-300 hover:text-white lg:hidden cursor-pointer"
          title="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 bg-[#1e293b] border border-white/15 px-2.5 sm:px-3 py-1.5 rounded-lg max-w-[200px] sm:max-w-none">
          <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <select
            value={activeDepotId}
            onChange={(e) => setActiveDepotId(e.target.value)}
            className="bg-transparent text-white font-semibold text-xs sm:text-sm outline-none cursor-pointer truncate"
          >
            <option value="all" className="bg-[#1e293b] text-white">📍 Tous les Dépôts</option>
            {depots.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#1e293b] text-white">📍 {d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Badge */}
        <div className="hidden md:flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Rôle:</span>
          {currentUser?.role === 'admin' ? (
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer uppercase text-xs"
              title="Simuler un rôle (Administrateur)"
            >
              <option value="admin" className="bg-[#1e293b]">Administrateur</option>
              <option value="personnalise" className="bg-[#1e293b]">⭐ Rôle Personnalisé</option>
              <option value="gerant" className="bg-[#1e293b]">Gérant de Dépôt</option>
              <option value="caissier" className="bg-[#1e293b]">Caissier / POS</option>
              <option value="comptable" className="bg-[#1e293b]">Comptable</option>
            </select>
          ) : (
            <span className="font-extrabold uppercase text-xs text-emerald-400">
              {currentUser?.role === 'personnalise' ? '⭐ SUR-MESURE' : currentUser?.role || 'UTILISATEUR'}
            </span>
          )}
        </div>

        {/* User Profile Button */}
        <button
          onClick={() => openModal("modal-user-profile")}
          className="w-9 h-9 rounded-lg bg-[#1e293b] border border-white/10 text-emerald-400 hover:text-white hover:bg-slate-700/50 flex items-center justify-center transition-colors cursor-pointer"
          title="Mon Profil & Changer Mot de Passe"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg bg-[#1e293b] border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center justify-center transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Passer en Mode Clair' : 'Passer en Mode Sombre'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </button>

        {/* User Logout Button */}
        <button
          onClick={logoutUser}
          className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          title="Se déconnecter de la session ERP"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>

        {/* Quick POS button */}
        <Link
          href="/pos"
          onClick={handleNewSale}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Nouvelle Vente</span>
          <span className="sm:hidden">POS</span>
        </Link>
      </div>
    </header>
  );
};

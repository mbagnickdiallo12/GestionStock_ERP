"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Wheat, Lock, User, Building2, ShieldCheck, ArrowRight, Activity, Cpu } from "lucide-react";
import { AnimatedTechBackground } from "@/components/auth/AnimatedTechBackground";

import { useApp } from "@/context/AppContext";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, refreshFromSupabase } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [depot, setDepot] = useState("all");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await loginUser(username, password);
      if (res.success) {
        await refreshFromSupabase();
        router.push("/dashboard");
      } else {
        setErrorMsg(res.message || "Identifiants d'accès invalides.");
      }
    } catch (err: any) {
      setErrorMsg("Erreur système : " + (err.message || "Impossible de se connecter"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050811] text-white flex items-center justify-between overflow-hidden font-sans">
      {/* 3D Animated High-Tech Background */}
      <AnimatedTechBackground />

      {/* Futuristic Floating 3D Elements on the Right Side (Matching Screenshot) */}
      <div className="hidden lg:block absolute right-[8%] top-[18%] z-10 pointer-events-none space-y-6">
        {/* Isometric Energy Node 1 */}
        <div className="relative bg-[#0d1f18]/80 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl shadow-2xl shadow-emerald-950/60 flex items-center gap-4 animate-bounce duration-[4000ms]">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Statut Réseau Dépôts</div>
            <div className="text-sm font-extrabold text-white">4 Entrepôts Connectés</div>
          </div>
        </div>

        {/* Isometric Metric Card 2 */}
        <div className="relative left-16 bg-[#0d1f18]/80 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-2xl shadow-2xl shadow-emerald-950/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Stock Global Valorisé</div>
            <div className="text-sm font-black text-emerald-400">685 600 000 FCFA</div>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Login Container (Left Aligned as in Screenshot) */}
      <div className="relative z-20 w-full lg:w-[480px] min-h-screen lg:min-h-0 lg:my-8 lg:ml-16 bg-slate-950/75 backdrop-blur-2xl border border-white/10 lg:rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-2xl shadow-emerald-950/50">
        
        {/* Top Brand Logo */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/30">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">RizStock <span className="text-emerald-400">ERP</span></span>
              <span className="block text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Système de Gestion Multi-Dépôts</span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Connexion Utilisateur</h1>
            <p className="text-xs text-slate-400">Veuillez saisir vos identifiants d'accès à la plateforme ERP.</p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-300 p-3 rounded-xl text-xs flex items-start gap-2.5 my-4 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 my-4">
          {/* Identifiant */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Identifiant / Email</label>
            <div className="flex items-center gap-3 bg-[#0a1120] border border-white/15 focus-within:border-emerald-500 px-4 py-3 rounded-xl transition-all">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="moustapha.n"
                className="bg-transparent text-sm text-white outline-none w-full placeholder:text-slate-500 font-medium"
              />
            </div>
          </div>

          {/* Mot de Passe */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Mot de Passe</label>
            <div className="flex items-center gap-3 bg-[#0a1120] border border-white/15 focus-within:border-emerald-500 px-4 py-3 rounded-xl transition-all">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-sm text-white outline-none w-full placeholder:text-slate-500 font-medium"
              />
            </div>
          </div>

          {/* Dépôt d'Accès */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Dépôt d'Affectation</label>
            <div className="flex items-center gap-3 bg-[#0a1120] border border-white/15 focus-within:border-emerald-500 px-4 py-3 rounded-xl transition-all">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={depot}
                onChange={(e) => setDepot(e.target.value)}
                className="bg-transparent text-sm text-white outline-none w-full font-medium cursor-pointer"
              >
                <option value="all" className="bg-[#0a1120] text-white">📍 Tous les Dépôts (Accès Admin)</option>
                <option value="dep-1" className="bg-[#0a1120] text-white">📍 Dépôt 1 - Dakar Port</option>
                <option value="dep-2" className="bg-[#0a1120] text-white">📍 Dépôt 2 - Thiaroye Gare</option>
                <option value="dep-3" className="bg-[#0a1120] text-white">📍 Dépôt 3 - Touba Mosquée</option>
                <option value="dep-4" className="bg-[#0a1120] text-white">📍 Dépôt 4 - Abidjan Port</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="checkbox" defaultChecked className="accent-emerald-500 rounded" />
              <span>Se souvenir de moi</span>
            </label>
            <a href="#" className="text-emerald-400 hover:underline font-semibold">Mot de passe oublié ?</a>
          </div>

          {/* Vibrant Green Submit Button (Matching Screenshot) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 text-slate-950 font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            {loading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>SE CONNECTER À L'ERP</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Connexion Sécurisée SSL
          </span>
          <span>v2.4.0 SaaS</span>
        </div>
      </div>
    </div>
  );
}

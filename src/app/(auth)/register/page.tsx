"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wheat, Lock, Mail, User, Building2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
            <Wheat className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Inscription <span className="text-emerald-500">RizStock</span></h1>
          <p className="text-xs text-slate-400">Création de compte entreprise de distribution de riz</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nom et Prénom</label>
            <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3.5 py-2.5 rounded-xl">
              <User className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Moustapha Ndiaye"
                className="bg-transparent text-sm text-white outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nom de la Société</label>
            <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3.5 py-2.5 rounded-xl">
              <Building2 className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Grands Dépôts du Sénégal"
                className="bg-transparent text-sm text-white outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Email Professionnel</label>
            <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3.5 py-2.5 rounded-xl">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@gdrs.sn"
                className="bg-transparent text-sm text-white outline-none w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Mot de Passe</label>
            <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3.5 py-2.5 rounded-xl">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="bg-transparent text-sm text-white outline-none w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all hover:-translate-y-0.5 mt-2"
          >
            Créer Mon Compte ERP <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t border-white/10 pt-4">
          Déjà un compte ? <Link href="/login" className="text-emerald-400 font-bold hover:underline">Se Connecter</Link>
        </div>
      </div>
    </div>
  );
}

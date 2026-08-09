"use client";

import React, { useState } from "react";
import { Plus, Receipt, Search } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Modal } from "@/components/ui/Modal";
import { Expense } from "@/types";
import { formatFCFA } from "@/lib/utils";

import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";

export default function DepensesPage() {
  const { expenses, depots, addExpense, openModal, closeModal, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  const [depotId, setDepotId] = useState(depots[0]?.id || "");
  const [category, setCategory] = useState<Expense['category']>("Manutention");
  const [amount, setAmount] = useState(25000);
  const [beneficiary, setBeneficiary] = useState("Équipe Manœuvres Port");
  const [desc, setDesc] = useState("Frais déchargement conteneur");

  React.useEffect(() => {
    if (depots.length > 0 && !depotId) {
      setDepotId(depots[0].id);
    }
  }, [depots, depotId]);

  const filteredExpenses = expenses.filter(e => {
    const matchSearch = e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === "all" || e.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    const selectedDepotId = depotId || (depots[0] ? depots[0].id : "");
    addExpense({ depotId: selectedDepotId, category, amount, beneficiary, desc, user: "Gérant" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dépenses Opérationnelles & Charges Dépôt</h1>
          <p className="text-sm text-slate-400 mt-1">Manutention (manœuvres), transport camion, carburant et charges fixes d'entrepôt.</p>
        </div>
        <button 
          onClick={() => openModal("modal-add-expense")}
          className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
        >
          <Receipt className="w-4 h-4" /> Enregistrer Dépense
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher dépense (EXP-101), bénéficiaire, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
        >
          <option value="all">Toutes Catégories de Dépenses</option>
          <option value="Manutention">💪 Manutention & Déchargement</option>
          <option value="Transport">🚚 Transport & Carburant</option>
          <option value="Loyer">🏢 Loyer Entrepôt</option>
          <option value="Electricite">⚡ Électricité & Eau</option>
          <option value="Gardiennage">🛡️ Gardiennage & Sécurité</option>
          <option value="Autre">📋 Divers / Autre</option>
        </select>
      </div>

      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase text-slate-400 bg-black/20">
                <th className="p-3">Réf. Dépense</th>
                <th className="p-3">Date</th>
                <th className="p-3">Dépôt Affecté</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Description / Justificatif</th>
                <th className="p-3">Montant FCFA</th>
                <th className="p-3">Bénéficiaire</th>
                <th className="p-3">Enregistré Par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpenses.map(e => {
                const depot = depots.find(d => d.id === e.depotId);
                return (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-white">{e.id}</td>
                    <td className="p-3 text-slate-300">{e.date}</td>
                    <td className="p-3 text-slate-300">{depot ? depot.name : e.depotId}</td>
                    <td className="p-3"><span className="bg-amber-500/15 text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-bold">{e.category}</span></td>
                    <td className="p-3 text-slate-300">{e.desc}</td>
                    <td className="p-3 font-extrabold text-red-400">-{formatFCFA(e.amount)}</td>
                    <td className="p-3 text-slate-300">{e.beneficiary}</td>
                    <td className="p-3 text-slate-400">{e.user}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        id="modal-add-expense"
        title="Enregistrer une Dépense Opérationnelle"
        footer={(
          <>
            <button onClick={closeModal} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Annuler</button>
            <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Enregistrer Dépense</button>
          </>
        )}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Affecté</label>
            <select value={depotId} onChange={(e) => setDepotId(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
              {depots.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer">
              <option value="Manutention">💪 Manutention & Déchargement</option>
              <option value="Transport">🚚 Transport & Carburant</option>
              <option value="Loyer">🏢 Loyer Entrepôt</option>
              <option value="Electricite">⚡ Électricité & Eau</option>
              <option value="Gardiennage">🛡️ Gardiennage & Sécurité</option>
              <option value="Autre">📋 Divers / Autre</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Montant (FCFA) *</label>
            <input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value) || 0)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Bénéficiaire / Payé à</label>
            <input type="text" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Description & Justificatif</label>
            <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

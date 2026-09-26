"use client";

import React, { useState, useEffect } from "react";
import { Plus, Receipt, Search, Building2, Truck, Wallet, ShieldAlert, ArrowDownRight, Layers, Lock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Modal } from "@/components/ui/Modal";
import { Expense } from "@/types";
import { formatFCFA, formatNumber, canCreate, isMatchingDepot, getUserAssignedDepot } from "@/lib/utils";
import { SkeletonTable, SkeletonStatCard } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";

export default function DepensesPage() {
  const { expenses, depots, activeDepotId, addExpense, openModal, closeModal, currentUser, isLoading } = useApp();

  const userRestricted = getUserAssignedDepot(currentUser, depots);

  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [depotFilter, setDepotFilter] = useState(() => {
    if (userRestricted) return userRestricted.id;
    return activeDepotId;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sync depotFilter when activeDepotId changes from the global header, or lock to user's depot
  useEffect(() => {
    if (userRestricted) {
      setDepotFilter(userRestricted.id);
    } else {
      setDepotFilter(activeDepotId);
    }
  }, [activeDepotId, userRestricted]);

  // Modal form states
  const [depotId, setDepotId] = useState(() => {
    if (userRestricted) return userRestricted.id;
    if (activeDepotId !== "all" && depots.some(d => d.id === activeDepotId)) {
      return activeDepotId;
    }
    return depots[0]?.id || "";
  });
  const [category, setCategory] = useState<Expense['category']>("Manutention");
  const [amount, setAmount] = useState(25000);
  const [beneficiary, setBeneficiary] = useState("Équipe Manœuvres Port");
  const [desc, setDesc] = useState("Frais déchargement conteneur");

  // Keep modal depotId in sync
  useEffect(() => {
    if (userRestricted) {
      setDepotId(userRestricted.id);
    } else if (activeDepotId !== "all" && depots.some(d => d.id === activeDepotId)) {
      setDepotId(activeDepotId);
    } else if (depots.length > 0 && !depots.some(d => d.id === depotId)) {
      setDepotId(depots[0].id);
    }
  }, [activeDepotId, depots, userRestricted]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-64 bg-slate-800 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-96 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  // Filtered expenses based on Search, Category, and strictly isolated Depot
  const effectiveDepotFilter = userRestricted ? userRestricted.id : depotFilter;

  const filteredExpenses = expenses.filter(e => {
    const matchSearch = e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === "all" || e.category === catFilter;
    const matchDepot = isMatchingDepot(e.depotId, effectiveDepotFilter, depots);
    return matchSearch && matchCat && matchDepot;
  });

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const tA = new Date(a.date || "").getTime() || 0;
    const tB = new Date(b.date || "").getTime() || 0;
    return tB - tA;
  });

  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const paginatedExpenses = sortedExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate dynamic stats based on selected depot / filter
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const manutentionAmount = filteredExpenses.filter(e => e.category === "Manutention").reduce((sum, e) => sum + e.amount, 0);
  const transportAmount = filteredExpenses.filter(e => e.category === "Transport").reduce((sum, e) => sum + e.amount, 0);
  const fixedChargesAmount = filteredExpenses
    .filter(e => ["Loyer", "Electricite", "Gardiennage", "Autre"].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const currentDepotObj = userRestricted || depots.find(d => d.id === effectiveDepotFilter);
  const selectedDepotLabel = userRestricted 
    ? userRestricted.name 
    : (effectiveDepotFilter === "all" ? "Tous les Dépôts" : (currentDepotObj?.name || "Dépôt sélectionné"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    const selectedDepotId = userRestricted ? userRestricted.id : (depotId || (depots[0] ? depots[0].id : ""));
    addExpense({
      depotId: selectedDepotId,
      category,
      amount,
      beneficiary,
      desc,
      user: currentUser?.name || "Gérant"
    });
  };

  const handleOpenAddModal = () => {
    if (userRestricted) {
      setDepotId(userRestricted.id);
    } else if (depotFilter !== "all" && depots.some(d => d.id === depotFilter)) {
      setDepotId(depotFilter);
    } else if (activeDepotId !== "all" && depots.some(d => d.id === activeDepotId)) {
      setDepotId(activeDepotId);
    } else if (depots.length > 0) {
      setDepotId(depots[0].id);
    }
    openModal("modal-add-expense");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Dépenses Opérationnelles & Charges Dépôt</h1>
            {selectedDepotLabel && (
              <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                {userRestricted && <Lock className="w-3 h-3 text-amber-400" />}
                <span>📍 {selectedDepotLabel}</span>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {userRestricted 
              ? `Gestion des dépenses et charges opérationnelles affectées exclusivement au ${userRestricted.name}.`
              : "Manutention (manœuvres), transport camion, carburant et charges fixes d'entrepôt."}
          </p>
        </div>
        {canCreate(currentUser, 'depenses') && (
          <button 
            onClick={handleOpenAddModal}
            className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" /> Enregistrer Dépense
          </button>
        )}
      </div>

      {/* Dynamic Summary Cards by Depot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Dépenses */}
        <div className="bg-[#1e293b] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dépenses</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatFCFA(totalExpensesAmount)}</div>
          <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
            <span>{filteredExpenses.length} dépense(s) enregistrée(s)</span>
            <span className="text-amber-400 font-bold">{userRestricted ? userRestricted.name : (depotFilter === "all" ? "Global" : "Dépôt actif")}</span>
          </div>
        </div>

        {/* Manutention */}
        <div className="bg-[#1e293b] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manutention & Déchargement</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatFCFA(manutentionAmount)}</div>
          <div className="text-xs text-amber-400 font-semibold">Manœuvres, dépotage & dockers</div>
        </div>

        {/* Transport */}
        <div className="bg-[#1e293b] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transport & Carburant</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatFCFA(transportAmount)}</div>
          <div className="text-xs text-blue-400 font-semibold">Camionnage & livraisons</div>
        </div>

        {/* Charges fixes & Loyers */}
        <div className="bg-[#1e293b] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Charges Fixes & Loyers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatFCFA(fixedChargesAmount)}</div>
          <div className="text-xs text-purple-400 font-semibold">Loyers, Senelec & Sécurité</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher dépense (EXP-101), bénéficiaire, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-white text-sm outline-none w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Depot Filter: Locked for restricted users, selector for admins */}
          {userRestricted ? (
            <div className="flex items-center gap-2 bg-[#0f172a] border border-amber-500/30 px-3 py-2 rounded-xl shadow-sm" title={`Compte assigné exclusivement au ${userRestricted.name}`}>
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white text-sm font-bold truncate">📍 {userRestricted.name}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 ml-1">Affecté</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#0f172a] border border-white/15 px-3 py-2 rounded-xl">
              <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                value={depotFilter}
                onChange={(e) => setDepotFilter(e.target.value)}
                className="bg-transparent text-white text-sm outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#1e293b]">📍 Tous les Dépôts</option>
                {depots.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#1e293b]">📍 {d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#1e293b]">Toutes Catégories</option>
            <option value="Manutention" className="bg-[#1e293b]">💪 Manutention & Déchargement</option>
            <option value="Journalier" className="bg-[#1e293b]">👷 Journalier / Main d'œuvre</option>
            <option value="Repas" className="bg-[#1e293b]">🍲 Repas & Restauration</option>
            <option value="Maintenance" className="bg-[#1e293b]">🔧 Maintenance & Réparation</option>
            <option value="Transport" className="bg-[#1e293b]">🚚 Transport & Carburant</option>
            <option value="Loyer" className="bg-[#1e293b]">🏢 Loyer Entrepôt</option>
            <option value="Electricite" className="bg-[#1e293b]">⚡ Électricité & Eau</option>
            <option value="Gardiennage" className="bg-[#1e293b]">🛡️ Gardiennage & Sécurité</option>
            <option value="Autre" className="bg-[#1e293b]">📋 Divers / Autre</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
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
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map(e => {
                  const depot = depots.find(d => isMatchingDepot(e.depotId, d.id, depots));
                  return (
                    <tr key={e.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white whitespace-nowrap">{e.id}</td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">{e.date}</td>
                      <td className="p-3 text-slate-300 font-semibold whitespace-nowrap">
                        <span className="bg-slate-800 border border-white/10 px-2 py-0.5 rounded text-xs text-slate-200">
                          {depot ? depot.name : e.depotId}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-amber-500/15 text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          {e.category === "Manutention" && "💪"}
                          {e.category === "Journalier" && "👷"}
                          {e.category === "Repas" && "🍲"}
                          {e.category === "Maintenance" && "🔧"}
                          {e.category === "Transport" && "🚚"}
                          {e.category === "Loyer" && "🏢"}
                          {e.category === "Electricite" && "⚡"}
                          {e.category === "Gardiennage" && "🛡️"}
                          {e.category === "Autre" && "📋"}
                          {e.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{e.desc}</td>
                      <td className="p-3 font-extrabold text-red-400 whitespace-nowrap">-{formatFCFA(e.amount)}</td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">{e.beneficiary}</td>
                      <td className="p-3 text-slate-400 whitespace-nowrap">{e.user}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-500/50" />
                    <p className="font-semibold">Aucune dépense trouvée pour ce dépôt ou ce critère.</p>
                    <p className="text-xs text-slate-500 mt-1">Sélectionnez un autre critère ou cliquez sur "Enregistrer Dépense" pour en ajouter une.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Numbered Pagination with Arrows */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedExpenses.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newPerPage) => {
            setItemsPerPage(newPerPage);
            setCurrentPage(1);
          }}
          itemName="dépenses"
        />
      </div>

      {/* Add Expense Modal */}
      <Modal
        id="modal-add-expense"
        title="Enregistrer une Dépense Opérationnelle"
        footer={(
          <>
            <button onClick={closeModal} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors">
              Annuler
            </button>
            <button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors">
              Enregistrer Dépense
            </button>
          </>
        )}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Dépôt Affecté *</label>
            {userRestricted ? (
              <div className="w-full bg-[#0f172a] border border-amber-500/40 text-white text-sm px-3 py-2 rounded-xl flex items-center justify-between">
                <span className="font-bold">📍 {userRestricted.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">Affecté</span>
              </div>
            ) : (
              <select
                value={depotId}
                onChange={(e) => setDepotId(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
                required
              >
                {depots.map(d => <option key={d.id} value={d.id} className="bg-[#1e293b]">{d.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Catégorie *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none cursor-pointer"
              required
            >
              <option value="Manutention" className="bg-[#1e293b]">💪 Manutention & Déchargement</option>
              <option value="Journalier" className="bg-[#1e293b]">👷 Journalier / Main d'œuvre</option>
              <option value="Repas" className="bg-[#1e293b]">🍲 Repas & Restauration</option>
              <option value="Maintenance" className="bg-[#1e293b]">🔧 Maintenance & Réparation</option>
              <option value="Transport" className="bg-[#1e293b]">🚚 Transport & Carburant</option>
              <option value="Loyer" className="bg-[#1e293b]">🏢 Loyer Entrepôt</option>
              <option value="Electricite" className="bg-[#1e293b]">⚡ Électricité & Eau</option>
              <option value="Gardiennage" className="bg-[#1e293b]">🛡️ Gardiennage & Sécurité</option>
              <option value="Autre" className="bg-[#1e293b]">📋 Divers / Autre</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Montant (FCFA) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
              min="1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Bénéficiaire / Payé à</label>
            <input
              type="text"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="Ex: Équipe Manœuvres Port"
              className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Description & Justificatif</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex: Déchargement 2 conteneurs 40ft"
              className="w-full bg-[#0f172a] border border-white/15 text-white text-sm px-3 py-2 rounded-xl outline-none"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

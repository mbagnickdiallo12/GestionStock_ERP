"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { formatFCFA, formatNumber } from "@/lib/utils";
import { DollarSign, Lock, Unlock, Calculator, AlertTriangle, CheckCircle2, Printer, ShieldCheck } from "lucide-react";

export const CashAuditModal: React.FC = () => {
  const { activeModal, closeModal, cashSessions, openCashSession, closeCashSession, settings } = useApp();

  const isOpen = activeModal === "modal-cash-audit";
  const openSession = cashSessions.find(s => s.status === "Ouverte") || cashSessions[0];

  // Bill counting calculator state
  const [b10000, setB10000] = useState(0);
  const [b5000, setB5000] = useState(0);
  const [b2000, setB2000] = useState(0);
  const [b1000, setB1000] = useState(0);
  const [b500, setB500] = useState(0);

  // Opening balance input state when opening session
  const [newOpeningBalance, setNewOpeningBalance] = useState(100000);

  const countedTotal = (b10000 * 10000) + (b5000 * 5000) + (b2000 * 2000) + (b1000 * 1000) + (b500 * 500);
  const expectedCash = openSession ? openSession.expectedCash : 0;
  const discrepancy = countedTotal - expectedCash;

  useEffect(() => {
    if (openSession && openSession.status === "Ouverte") {
      // Auto-preset counts matching expected balance as starter
      const rem = openSession.expectedCash;
      setB10000(Math.floor(rem / 10000));
      setB5000(Math.floor((rem % 10000) / 5000));
      setB2000(0);
      setB1000(0);
      setB500(0);
    }
  }, [openSession, isOpen]);

  if (!isOpen) return null;

  const handlePrintPV = () => {
    window.print();
  };

  const handleCloseShift = () => {
    closeCashSession(countedTotal);
  };

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    openCashSession(newOpeningBalance);
  };

  return (
    <Modal
      id="modal-cash-audit"
      title="État de Caisse & Audit de Fin de Session"
      footer={(
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <button onClick={handlePrintPV} className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Printer className="w-4 h-4" /> Imprimer PV Caisse PDF
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={closeModal} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Fermer</button>
            {openSession?.status === "Ouverte" && (
              <button
                onClick={handleCloseShift}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-900/40"
              >
                <Lock className="w-4 h-4" /> Clôturer & Valider Caisse
              </button>
            )}
          </div>
        </div>
      )}
    >
      <div className="printable-document space-y-5 text-sm">
        {/* Session Status Banner */}
        <div className="bg-[#0f172a] border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${openSession?.status === "Ouverte" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {openSession?.status === "Ouverte" ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono">Session N° {openSession?.id || "CS-NOUVELLE"}</span>
              <h3 className="font-extrabold text-base text-white">
                Caisse Dépôt : {openSession?.depotName || "Dépôt Actif"}
              </h3>
              <p className="text-xs text-slate-300">Caissier Responsable : <strong>{openSession?.cashierName || settings?.companyName || "Caissier POS"}</strong></p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
            openSession?.status === "Ouverte"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
              : "bg-red-500/15 border-red-500/40 text-red-400"
          }`}>
            ● Session {openSession?.status || "Clôturée"}
          </span>
        </div>

        {/* Shift Financial Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0f172a] border border-white/10 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Fond de Caisse Initial</span>
            <span className="text-base font-extrabold text-white font-mono">{formatFCFA(openSession?.openingBalance || 0)}</span>
          </div>
          <div className="bg-[#0f172a] border border-emerald-500/30 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Ventes Espèces (Cash)</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">+{formatFCFA(openSession?.cashSales || 0)}</span>
          </div>
          <div className="bg-[#0f172a] border border-blue-500/30 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-blue-400 block mb-1">Ventes Wave / Mobile</span>
            <span className="text-base font-extrabold text-blue-400 font-mono">+{formatFCFA(openSession?.waveSales || 0)}</span>
          </div>
          <div className="bg-[#0f172a] border border-red-500/30 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-red-400 block mb-1">Sorties / Dépenses Caisse</span>
            <span className="text-base font-extrabold text-red-400 font-mono">-{formatFCFA(openSession?.totalExpenses || 0)}</span>
          </div>
        </div>

        {/* Expected Cash vs Physical Count Section */}
        <div className="bg-[#0f172a] border border-white/15 p-4 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="font-extrabold text-sm text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" /> Billetage & Comptage Physique des Espèces
            </span>
            <span className="text-xs text-slate-400">Calcul en temps réel</span>
          </div>

          {/* Billetage Calculator Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-[#1e293b] p-2.5 rounded-xl border border-white/10">
              <span className="font-bold text-slate-300 block mb-1">Billets 10 000 F</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={b10000}
                  onChange={(e) => setB10000(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0f172a] border border-white/15 px-2 py-1 rounded text-white font-bold outline-none"
                />
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1 font-mono">{formatNumber(b10000 * 10000)} F</span>
            </div>

            <div className="bg-[#1e293b] p-2.5 rounded-xl border border-white/10">
              <span className="font-bold text-slate-300 block mb-1">Billets 5 000 F</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={b5000}
                  onChange={(e) => setB5000(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0f172a] border border-white/15 px-2 py-1 rounded text-white font-bold outline-none"
                />
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1 font-mono">{formatNumber(b5000 * 5000)} F</span>
            </div>

            <div className="bg-[#1e293b] p-2.5 rounded-xl border border-white/10">
              <span className="font-bold text-slate-300 block mb-1">Billets 2 000 F</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={b2000}
                  onChange={(e) => setB2000(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0f172a] border border-white/15 px-2 py-1 rounded text-white font-bold outline-none"
                />
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1 font-mono">{formatNumber(b2000 * 2000)} F</span>
            </div>

            <div className="bg-[#1e293b] p-2.5 rounded-xl border border-white/10">
              <span className="font-bold text-slate-300 block mb-1">Billets 1 000 F</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={b1000}
                  onChange={(e) => setB1000(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0f172a] border border-white/15 px-2 py-1 rounded text-white font-bold outline-none"
                />
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1 font-mono">{formatNumber(b1000 * 1000)} F</span>
            </div>

            <div className="bg-[#1e293b] p-2.5 rounded-xl border border-white/10">
              <span className="font-bold text-slate-300 block mb-1">Pièces / 500 F</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={b500}
                  onChange={(e) => setB500(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0f172a] border border-white/15 px-2 py-1 rounded text-white font-bold outline-none"
                />
              </div>
              <span className="text-[10px] text-emerald-400 block mt-1 font-mono">{formatNumber(b500 * 500)} F</span>
            </div>
          </div>

          {/* Audit Comparison Bar */}
          <div className="bg-[#1e293b] p-4 rounded-xl space-y-2 border border-white/10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Solde Espèces Théorique Attendu :</span>
              <strong className="text-white font-mono text-sm">{formatFCFA(expectedCash)}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Espèces Physiques Comptées :</span>
              <strong className="text-emerald-400 font-mono text-base">{formatFCFA(countedTotal)}</strong>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-2 text-sm font-extrabold">
              <span className="text-slate-200">Écart de Caisse :</span>
              {discrepancy === 0 ? (
                <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" /> Caisse Conforme (0 FCFA)
                </span>
              ) : discrepancy > 0 ? (
                <span className="text-blue-400 flex items-center gap-1 bg-blue-500/15 px-2.5 py-0.5 rounded-lg border border-blue-500/30">
                  + Excédent: {formatFCFA(discrepancy)}
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1 bg-red-500/15 px-2.5 py-0.5 rounded-lg border border-red-500/30">
                  <AlertTriangle className="w-4 h-4" /> Manquant: {formatFCFA(discrepancy)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* If session is not open, offer opening form */}
        {(!openSession || openSession.status === "Clôturée") && (
          <form onSubmit={handleOpenShift} className="bg-[#0f172a] border border-emerald-500/40 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div>
              <h4 className="font-extrabold text-base text-emerald-400 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" /> Démarrer une Nouvelle Session de Caisse
              </h4>
              <p className="text-xs text-slate-300 mt-1">Saisissez le fond de caisse initial attribué au caissier pour la journée.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[#1e293b] border border-white/15 px-3 py-2 rounded-xl">
                <span className="text-xs font-bold text-slate-400">FCFA</span>
                <input
                  type="number"
                  value={newOpeningBalance}
                  onChange={(e) => setNewOpeningBalance(parseInt(e.target.value) || 0)}
                  className="bg-transparent text-white text-sm font-mono font-bold w-28 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <Unlock className="w-4 h-4" /> Ouvrir la Caisse
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

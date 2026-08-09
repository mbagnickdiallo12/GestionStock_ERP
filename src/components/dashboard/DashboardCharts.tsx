"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { useApp } from "@/context/AppContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export const DashboardCharts: React.FC = () => {
  const { depots, stocks, sales } = useApp();

  // Compute last 7 days real sales dynamically from Supabase
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const salesByDate = last7Days.map(dateStr => {
    return sales
      .filter(s => s.date && s.date.slice(0, 10) === dateStr)
      .reduce((sum, s) => sum + s.totalAmount, 0);
  });

  const formattedLabels = last7Days.map(d => {
    const parts = d.split('-');
    const day = parts[2];
    const monthNames: Record<string, string> = {
      '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr', '05': 'Mai', '06': 'Juin',
      '07': 'Juil', '08': 'Août', '09': 'Sept', '10': 'Oct', '11': 'Nov', '12': 'Déc'
    };
    return `${day} ${monthNames[parts[1]] || parts[1]}`;
  });

  const lineData = {
    labels: formattedLabels,
    datasets: [
      {
        label: 'Ventes du Jour (FCFA)',
        data: salesByDate,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.35,
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#94a3b8' } }
    }
  };

  const depotNames = depots.map(d => d.name);
  const depotBags = depots.map(d => {
    let sum = 0;
    if (stocks[d.id]) {
      Object.values(stocks[d.id]).forEach(q => sum += q);
    }
    return sum;
  });

  const PALETTE = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7', '#06b6d4'];

  const doughnutData = {
    labels: depotNames,
    datasets: [
      {
        data: depotBags,
        backgroundColor: PALETTE.slice(0, depots.length),
        borderWidth: 0,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#94a3b8', font: { size: 11 } } }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Line Chart */}
      <div className="lg:col-span-2 bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="font-bold text-base text-white flex items-center gap-2">
            📈 Évolution des Ventes (7 Derniers Jours)
          </span>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
            Données Réelles Supabase (FCFA)
          </span>
        </div>
        <div className="h-[260px] w-full">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Doughnut Chart */}
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
        <div className="border-b border-white/10 pb-3">
          <span className="font-bold text-base text-white flex items-center gap-2">
            📊 Stock par Dépôt
          </span>
        </div>
        <div className="h-[260px] w-full">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
};

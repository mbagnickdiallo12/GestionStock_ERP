"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wheat, PieChart, ShoppingCart, FileText, Warehouse, Package, Boxes, Truck, 
  TruckIcon, Users, Receipt, UserCheck, BarChart3, ShieldCheck, SlidersHorizontal, 
  ChevronLeft, ChevronRight, ChevronDown, X, Key, Activity, ClipboardList, LogOut
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, mobileMenuOpen, setMobileMenuOpen, sidebarCollapsed, setSidebarCollapsed, openModal, products, stocks, logoutUser } = useApp();
  const collapsed = sidebarCollapsed;
  const setCollapsed = setSidebarCollapsed;

  const user = currentUser || { username: 'admin', name: 'Administrateur', role: 'admin' as const, depot: 'Tous', lastLogin: '', status: 'Actif' as const };

  // Dynamic low-stock alerts count
  const alertCount = products.filter(p => {
    const totalStock = Object.values(stocks).reduce((sum, dep) => sum + (dep[p.id] || 0), 0);
    return totalStock <= p.alertThreshold;
  }).length;

  const navGroups = [
    {
      id: "sales",
      title: "Aperçu & Ventes",
      icon: PieChart,
      items: [
        { label: "Tableau de Bord", href: "/dashboard", icon: PieChart },
        { label: "Vente & Caisse (POS)", href: "/pos", icon: ShoppingCart },
        { label: "Historique Ventes", href: "/ventes", icon: FileText },
      ]
    },
    {
      id: "stocks",
      title: "Stocks & Logistique",
      icon: Boxes,
      items: [
        { label: "Dépôts de Riz", href: "/depots", icon: Warehouse },
        { label: "Catalogue Produits", href: "/produits", icon: Package },
        { 
          label: "Stocks & Mouvements", 
          href: "/stocks", 
          icon: Boxes, 
          badge: alertCount > 0 ? `${alertCount} alertes` : null 
        },
        { label: "Inventaire Physique", href: "/inventaire", icon: ClipboardList },
        { label: "Achats & Arrivages", href: "/achats", icon: Truck },
      ]
    },
    {
      id: "finance",
      title: "Partenaires & Finance",
      icon: Users,
      items: [
        { label: "Fournisseurs", href: "/fournisseurs", icon: TruckIcon },
        { label: "Clients & Créances", href: "/clients", icon: Users },
        { label: "Dépenses Opérationnelles", href: "/depenses", icon: Receipt },
      ]
    },
    {
      id: "admin",
      title: "RH & Administration",
      icon: ShieldCheck,
      items: [
        { label: "RH & Salaires", href: "/rh", icon: UserCheck },
        { label: "Rapports Financiers", href: "/rapports", icon: BarChart3 },
        { label: "Journal d'Activités", href: "/activites", icon: Activity },
        { label: "Rôles & Accès", href: "/utilisateurs", icon: ShieldCheck },
        { label: "Paramètres ERP", href: "/parametres", icon: SlidersHorizontal },
      ]
    }
  ];

  // Accordion open states
  const [openGroups, setOpenGroups] = useState<{ [id: string]: boolean }>({
    sales: true,
    stocks: true,
    finance: true,
    admin: true
  });

  // Auto-expand accordion group matching current active URL path
  useEffect(() => {
    navGroups.forEach(group => {
      if (group.items.some(it => it.href === pathname)) {
        setOpenGroups(prev => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-45 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#090d16] border-r border-white/10 transition-all duration-300 ${
          mobileMenuOpen ? "translate-x-0 w-[270px]" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-[76px]" : "lg:w-[270px]"}`}
      >
        {/* Header Logo */}
        <div className="h-[70px] px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link 
            href="/dashboard" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 text-white no-underline"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-900/30 shrink-0">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || mobileMenuOpen) && (
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg text-white">RizStock <span className="text-emerald-500">ERP</span></span>
                <span className="text-[10px] text-emerald-500 font-semibold tracking-wider uppercase">SaaS Multi-Dépôts</span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title={collapsed ? "Déplier" : "Réduire"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Mobile close button */}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible Accordion Navigation List */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-3">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(item => {
              const moduleKey = item.href.replace('/', '');
              return hasPermission(user, moduleKey);
            });

            if (visibleItems.length === 0) return null;

            const isOpen = openGroups[group.id];
            const hasActiveChild = visibleItems.some(it => it.href === pathname);
            const GroupHeaderIcon = group.icon;

            return (
              <div key={group.id} className="space-y-1">
                {/* Accordion Category Header Button */}
                {(!collapsed || mobileMenuOpen) ? (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${
                      hasActiveChild ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <GroupHeaderIcon className="w-3.5 h-3.5 text-emerald-500" />
                      {group.title}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`} />
                  </button>
                ) : (
                  <div className="text-center py-2 text-slate-500 border-b border-white/5" title={group.title}>
                    <GroupHeaderIcon className="w-4 h-4 mx-auto text-emerald-500 opacity-60" />
                  </div>
                )}

                {/* Sub-Items List */}
                {((isOpen && (!collapsed || mobileMenuOpen)) || (collapsed && !mobileMenuOpen)) && (
                  <div className={`space-y-1 ${!collapsed || mobileMenuOpen ? "pl-2 border-l border-white/10 ml-2" : ""}`}>
                    {visibleItems.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                            isActive 
                              ? "bg-emerald-500/20 text-white border-l-4 border-emerald-500 font-bold shadow-md shadow-emerald-950/40" 
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                          title={item.label}
                        >
                          <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-emerald-400" : ""}`} />
                          {(!collapsed || mobileMenuOpen) && <span className="truncate">{item.label}</span>}
                          {(!collapsed || mobileMenuOpen) && item.badge && (
                            <span className="ml-auto bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                              <span>{item.badge}</span>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer Profile & Logout Card */}
        <div className="p-3 border-t border-white/10 shrink-0 flex items-center gap-2">
          <button
            onClick={() => openModal("modal-user-profile")}
            className="flex-1 text-left flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 transition-colors cursor-pointer group"
            title="Cliquez pour ouvrir votre profil et modifier votre mot de passe"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase shadow-md">
              {user.name.charAt(0)}
            </div>
            {(!collapsed || mobileMenuOpen) && (
              <div className="flex flex-col overflow-hidden flex-1">
                <span className="font-semibold text-xs text-white truncate group-hover:text-emerald-400 transition-colors">{user.name}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" /> Mot de passe
                </span>
              </div>
            )}
          </button>

          <button
            onClick={logoutUser}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all cursor-pointer shrink-0"
            title="Déconnexion de la session ERP"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

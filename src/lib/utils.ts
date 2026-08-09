import { UserAccount } from "@/types";

export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatFCFA(amount: number): string {
  return `${formatNumber(amount)} FCFA`;
}

export function hasPermission(user: UserAccount | null | undefined, moduleKey: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  if (user.role === 'personnalise') {
    const perms = user.customPermissions || [
      "dashboard", "pos", "ventes", "depots", "produits", "stocks", "achats", "fournisseurs", "clients", "depenses", "rh", "rapports", "activites"
    ];
    return perms.includes(moduleKey);
  }

  switch (user.role) {
    case 'caissier':
      return moduleKey === 'pos' || moduleKey === 'ventes' || moduleKey === 'dashboard';

    case 'gerant':
      return [
        'dashboard', 'pos', 'ventes', 'depots', 'produits', 'stocks', 'clients', 'depenses'
      ].includes(moduleKey);

    case 'comptable':
      return [
        'dashboard', 'ventes', 'achats', 'fournisseurs', 'clients', 'depenses', 'rapports'
      ].includes(moduleKey);

    default:
      return false;
  }
}

export function canCreate(user: UserAccount | null | undefined, moduleKey?: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'personnalise') {
    if (!moduleKey) return true;
    return hasPermission(user, moduleKey);
  }
  return false;
}

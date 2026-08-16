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

export function canManage(user: UserAccount | null | undefined, moduleKey?: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'personnalise') {
    if (!moduleKey) return true;
    return hasPermission(user, moduleKey);
  }
  return false;
}

export const canDelete = canManage;
export const canEdit = canManage;

export function isMatchingDepot(
  itemDepotId: string | undefined | null,
  targetDepotId: string | undefined | null,
  depots: any[]
): boolean {
  if (!targetDepotId || targetDepotId === "all") return true;
  if (!itemDepotId) return false;

  const cleanItem = String(itemDepotId).trim();
  const cleanTarget = String(targetDepotId).trim();

  // 1. Direct ID / value match
  if (cleanItem.toLowerCase() === cleanTarget.toLowerCase()) return true;

  const targetDepot = depots.find(d => d.id.toLowerCase() === cleanTarget.toLowerCase() || d.name.toLowerCase() === cleanTarget.toLowerCase());
  const itemDepot = depots.find(d => d.id.toLowerCase() === cleanItem.toLowerCase() || d.name.toLowerCase() === cleanItem.toLowerCase());

  // 2. Both point to the exact same depot in depots array
  if (targetDepot && itemDepot && targetDepot.id === itemDepot.id) return true;

  // 3. Name or substring match
  if (targetDepot) {
    const tName = targetDepot.name.toLowerCase();
    const tCity = (targetDepot.city || "").toLowerCase();
    const iName = cleanItem.toLowerCase();

    if (tName === iName || (tCity && tCity === iName)) return true;
    if (tName.includes(iName) || iName.includes(tName)) return true;
    if (tCity && (tCity.includes(iName) || iName.includes(tCity))) return true;
  }

  // 4. Default fallback: if item is 'dep-1' or 'dep-01' and targetDepot is the first depot
  if ((cleanItem === 'dep-1' || cleanItem === 'dep-01') && depots.length > 0 && targetDepot && depots[0].id === targetDepot.id) {
    return true;
  }

  return false;
}

import { UserAccount } from "@/types";

export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatFCFA(amount: number): string {
  return `${formatNumber(amount)} FCFA`;
}

export function numberToWordsFR(n: number): string {
  if (isNaN(n) || n === 0) return "Zéro Franc CFA";
  
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];

  function convertGroup(num: number): string {
    let res = "";
    const h = Math.floor(num / 100);
    const r = num % 100;

    if (h > 0) {
      if (h === 1) res += "cent";
      else res += units[h] + " cent";
      if (r > 0) res += " ";
    }

    if (r >= 10 && r < 20) {
      res += teens[r - 10];
    } else if (r >= 20 && r < 70) {
      const t = Math.floor(r / 10);
      const u = r % 10;
      if (u === 1 && t !== 8) res += tens[t] + " et un";
      else if (u > 0) res += tens[t] + "-" + units[u];
      else res += tens[t];
    } else if (r >= 70 && r < 80) {
      const u = r % 10;
      if (u === 1) res += "soixante et onze";
      else res += "soixante-" + teens[u];
    } else if (r >= 80 && r < 90) {
      const u = r % 10;
      if (u === 0) res += "quatre-vingts";
      else res += "quatre-vingt-" + units[u];
    } else if (r >= 90 && r < 100) {
      const u = r % 10;
      res += "quatre-vingt-" + teens[u];
    } else if (r > 0 && r < 10) {
      res += units[r];
    }

    return res.trim();
  }

  const billions = Math.floor(n / 1000000000);
  let rem = n % 1000000000;
  const millions = Math.floor(rem / 1000000);
  rem = rem % 1000000;
  const thousands = Math.floor(rem / 1000);
  const ones = Math.floor(rem % 1000);

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(convertGroup(billions) + (billions > 1 ? " milliards" : " milliard"));
  }
  if (millions > 0) {
    parts.push(convertGroup(millions) + (millions > 1 ? " millions" : " million"));
  }
  if (thousands > 0) {
    if (thousands === 1) parts.push("mille");
    else parts.push(convertGroup(thousands) + " mille");
  }
  if (ones > 0) {
    parts.push(convertGroup(ones));
  }

  const str = parts.join(" ").trim();
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return `${capitalized} Francs CFA`;
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
  if (user.role === 'gerant') {
    if (!moduleKey) return true;
    return ['dashboard', 'pos', 'ventes', 'depots', 'produits', 'stocks', 'clients', 'depenses', 'inventaire'].includes(moduleKey);
  }
  if (user.role === 'comptable') {
    if (!moduleKey) return true;
    return ['dashboard', 'ventes', 'achats', 'fournisseurs', 'clients', 'depenses', 'rapports'].includes(moduleKey);
  }
  if (user.role === 'caissier') {
    if (!moduleKey) return true;
    return ['pos', 'ventes', 'dashboard'].includes(moduleKey);
  }
  if (user.role === 'personnalise') {
    if (!moduleKey) return true;
    return hasPermission(user, moduleKey);
  }
  return false;
}

export function canManage(user: UserAccount | null | undefined, moduleKey?: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'gerant') {
    if (!moduleKey) return true;
    return ['dashboard', 'pos', 'ventes', 'depots', 'produits', 'stocks', 'clients', 'depenses', 'inventaire'].includes(moduleKey);
  }
  if (user.role === 'comptable') {
    if (!moduleKey) return true;
    return ['dashboard', 'ventes', 'achats', 'fournisseurs', 'clients', 'depenses', 'rapports'].includes(moduleKey);
  }
  if (user.role === 'caissier') {
    if (!moduleKey) return true;
    return ['pos', 'ventes'].includes(moduleKey);
  }
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

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const cleanItem = String(itemDepotId).trim();
  const cleanTarget = String(targetDepotId).trim();

  // 1. Direct ID / value match
  if (cleanItem.toLowerCase() === cleanTarget.toLowerCase()) return true;

  const targetDepot = depots.find(d => 
    d.id.toLowerCase() === cleanTarget.toLowerCase() || 
    d.name.trim().toLowerCase() === cleanTarget.toLowerCase() ||
    normalize(d.name) === normalize(cleanTarget)
  );

  const itemDepot = depots.find(d => 
    d.id.toLowerCase() === cleanItem.toLowerCase() || 
    d.name.trim().toLowerCase() === cleanItem.toLowerCase() ||
    normalize(d.name) === normalize(cleanItem)
  );

  // 2. Both point to the exact same depot in depots array
  if (targetDepot && itemDepot && targetDepot.id === itemDepot.id) return true;

  // 3. Fallback for legacy dep-1, dep-2, dep-01, dep-02
  const lowerItem = cleanItem.toLowerCase();
  const lowerTarget = cleanTarget.toLowerCase();
  if (lowerItem === "dep-1" || lowerItem === "dep-01") {
    if (targetDepot && depots.length > 0 && depots[0].id === targetDepot.id) return true;
    if (depots.length > 0 && depots[0].id.toLowerCase() === lowerTarget) return true;
  }
  if (lowerItem === "dep-2" || lowerItem === "dep-02") {
    if (targetDepot && depots.length > 1 && depots[1].id === targetDepot.id) return true;
    if (depots.length > 1 && depots[1].id.toLowerCase() === lowerTarget) return true;
  }
  if (lowerTarget === "dep-1" || lowerTarget === "dep-01") {
    if (itemDepot && depots.length > 0 && depots[0].id === itemDepot.id) return true;
    if (depots.length > 0 && depots[0].id.toLowerCase() === lowerItem) return true;
  }
  if (lowerTarget === "dep-2" || lowerTarget === "dep-02") {
    if (itemDepot && depots.length > 1 && depots[1].id === itemDepot.id) return true;
    if (depots.length > 1 && depots[1].id.toLowerCase() === lowerItem) return true;
  }

  // 4. Handle trajectory strings (e.g. "Usine-->Depot Gare Bou Ndaw")
  if (cleanItem.includes("-->") || cleanItem.includes("->")) {
    const parts = cleanItem.split(/-+>/);
    for (const part of parts) {
      if (isMatchingDepot(part.trim(), targetDepotId, depots)) return true;
    }
  }

  // 5. Normalized name or keyword match
  if (targetDepot) {
    const normTarget = normalize(targetDepot.name);
    const normItem = normalize(cleanItem);

    if (normTarget === normItem) return true;
    if (normTarget && normItem && (normTarget.includes(normItem) || normItem.includes(normTarget))) return true;

    // Specific domain keywords
    if (normTarget.includes("gare bou ndaw") && (normItem.includes("gare bou ndaw") || normItem.includes("bou ndaw"))) return true;
    if (normTarget.includes("usine") && normItem.includes("usine")) return true;
  }

  return false;
}

export function getUserAssignedDepot(
  user: UserAccount | null | undefined,
  depots: any[]
): any | null {
  if (!user || user.role === 'admin') return null;
  if (!user.depot || user.depot === 'Tous' || user.depot === 'all') return null;

  const cleanUserDepot = user.depot.toLowerCase().trim();
  const matched = depots.find(d => 
    d.id.toLowerCase() === cleanUserDepot ||
    d.name.toLowerCase() === cleanUserDepot ||
    (d.city && d.city.toLowerCase() === cleanUserDepot) ||
    d.name.toLowerCase().includes(cleanUserDepot)
  );

  return matched || null;
}

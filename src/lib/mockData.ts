import { Depot, Product, StockMatrix, Sale, StockMovement, Purchase, Supplier, Client, Expense, Employee, UserAccount, CompanySettings, AuditLog, DebtTransaction, InventorySession, Category, CashSession } from "@/types";

export const INITIAL_SETTINGS: CompanySettings = {
  companyName: "RizStock ERP - Négociant & Distributeur de Riz",
  currency: "FCFA",
  vatRate: 0,
  minAlertDefault: 500,
  phone: "+221 33 800 00 00",
  address: "Dakar, Sénégal",
  rccm: "SN-DKR-2026-B-00000"
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Riz Parfumé", slug: "parfume", description: "Riz aromatique de luxe importé d'Asie (Inde, Thaïlande, Viêt Nam)", color: "#10b981" },
  { id: "cat-2", name: "Riz Brisé 100%", slug: "brise", description: "Riz brisé 100% de grande consommation familiale (Thiéboudienne)", color: "#3b82f6" },
  { id: "cat-3", name: "Riz Blanc Non Parfumé", slug: "blanc", description: "Riz blanc grain long ou moyen (Pakistan, Inde, Brésil)", color: "#8b5cf6" },
  { id: "cat-4", name: "Riz Local & Étuvé", slug: "local", description: "Riz produit localement en Afrique de l'Ouest (Gambiaka, Vallée du fleuve)", color: "#f59e0b" }
];

export const INITIAL_DEPOTS: Depot[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_STOCKS: StockMatrix = {};
export const INITIAL_SALES: Sale[] = [];
export const INITIAL_CASH_SESSIONS: CashSession[] = [];
export const INITIAL_MOVEMENTS: StockMovement[] = [];
export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_SUPPLIERS: Supplier[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_DEBT_TRANSACTIONS: DebtTransaction[] = [];
export const INITIAL_INVENTORIES: InventorySession[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_USERS: UserAccount[] = [
  { username: "mbagnickdiallo", name: "Mbagnick Diallo", role: "admin", depot: "Tous", lastLogin: "Aujourd'hui", status: "Actif" },
  { username: "admin", name: "Administrateur Général", role: "admin", depot: "Tous", lastLogin: "Aujourd'hui", status: "Actif" }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

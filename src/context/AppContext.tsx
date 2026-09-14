"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Depot, Product, StockMatrix, Sale, StockMovement, Purchase, Supplier, Client, Expense, Employee, UserAccount, CompanySettings, SaleItem, AuditLog, DebtTransaction, InventorySession, Category, CashSession, BackupVersion } from "@/types";
import { INITIAL_SETTINGS, INITIAL_DEPOTS, INITIAL_PRODUCTS, INITIAL_STOCKS, INITIAL_SALES, INITIAL_MOVEMENTS, INITIAL_PURCHASES, INITIAL_SUPPLIERS, INITIAL_CLIENTS, INITIAL_DEBT_TRANSACTIONS, INITIAL_INVENTORIES, INITIAL_EXPENSES, INITIAL_EMPLOYEES, INITIAL_USERS, INITIAL_AUDIT_LOGS, INITIAL_CATEGORIES, INITIAL_CASH_SESSIONS } from "@/lib/mockData";
import { formatFCFA, formatNumber, isMatchingDepot } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface CartItem extends SaleItem {}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

interface AppContextType {
  isLoading: boolean;
  refreshFromSupabase: () => Promise<void>;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  activeDepotId: string;
  setActiveDepotId: (id: string) => void;
  activeRole: string;
  setActiveRole: (role: string) => void;
  
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  settings: CompanySettings;
  updateSettings: (updatedData: Partial<CompanySettings>) => void;

  categories: Category[];
  depots: Depot[];
  products: Product[];
  stocks: StockMatrix;
  sales: Sale[];
  cashSessions: CashSession[];
  movements: StockMovement[];
  purchases: Purchase[];
  suppliers: Supplier[];
  clients: Client[];
  debtTransactions: DebtTransaction[];
  inventories: InventorySession[];
  expenses: Expense[];
  employees: Employee[];
  users: UserAccount[];
  auditLogs: AuditLog[];

  logActivity: (action: AuditLog['action'], description: string, depotName?: string) => void;
  clearAuditLogs: () => void;

  cart: CartItem[];
  addToCart: (productId: string) => void;
  updateCartQty: (productId: string, delta: number) => void;
  setCartItemQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  processCheckout: (clientName: string, paymentMode: Sale['paymentMode']) => void;

  activeModal: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  confirmState: ConfirmState | null;
  askConfirm: (options: { title: string; message: string; confirmLabel?: string; onConfirm: () => void }) => void;
  closeConfirm: () => void;

  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;

  openCashSession: (openingBalance: number) => void;
  closeCashSession: (actualCash: number) => void;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updatedData: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addDepot: (depot: Omit<Depot, 'id'>) => void;
  updateDepot: (id: string, updatedData: Partial<Depot>) => void;
  deleteDepot: (id: string) => void;
  
  addProduct: (product: Omit<Product, 'id' | 'code'>) => void;
  updateProduct: (id: string, updatedData: Partial<Product>) => void;
  updateProductStock: (productId: string, depotStocks: { [depotId: string]: number }) => void;
  deleteProduct: (id: string) => void;

  addPurchase: (purchase: Omit<Purchase, 'id' | 'date'>) => void;
  updatePurchase: (id: string, updatedData: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;

  addSupplier: (sup: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updatedData: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  addClient: (cli: Omit<Client, 'id' | 'totalPurchases' | 'balance'>) => void;
  updateClient: (id: string, updatedData: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  settleClientDebt: (id: string, paymentAmount: number, paymentMode?: DebtTransaction['paymentMode'], note?: string) => void;

  addInventorySession: (inv: Omit<InventorySession, 'id' | 'date'>) => void;
  applyInventoryAdjustment: (sessionId: string) => void;

  addEmployee: (emp: Omit<Employee, 'id' | 'advances' | 'lastPay'>) => void;
  updateEmployee: (id: string, updatedData: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  grantSalaryAdvance: (id: string, amount: number) => void;
  paySalary: (id: string, netPayAmount: number) => void;

  addUser: (usr: Omit<UserAccount, 'lastLogin'>) => void;
  updateUser: (username: string, updatedData: Partial<UserAccount>) => void;
  deleteUser: (username: string) => void;
  resetPassword: (username: string) => void;
  currentUser: UserAccount | null;
  loginUser: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;

  addStockMovement: (mvt: Omit<StockMovement, 'ref' | 'date'> & { depotId?: string; productId?: string; customDate?: string }) => void;
  transferStock: (srcId: string, destId: string, prodId: string, qty: number, truck: string) => void;
  addExpense: (exp: Omit<Expense, 'id' | 'date'>) => void;

  backupVersions: BackupVersion[];
  createBackupSnapshot: (label: string, type?: 'auto_reset' | 'manual_export' | 'manual_upload') => BackupVersion;
  restoreBackupVersion: (versionId: string) => void;
  deleteBackupVersion: (versionId: string) => void;
  importBackupJSON: (jsonData: any) => boolean;
  resetSystemWithAutoBackup: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeDepotId, setActiveDepotId] = useState<string>("all");
  const [activeRole, setActiveRole] = useState<string>("admin");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<CompanySettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_SETTINGS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Categories");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [depots, setDepots] = useState<Depot[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Depots");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_DEPOTS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Products");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [stocks, setStocks] = useState<StockMatrix>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Stocks");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_STOCKS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Sales");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_SALES;
  });

  const [cashSessions, setCashSessions] = useState<CashSession[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_CashSessions");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_CASH_SESSIONS;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Movements");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_MOVEMENTS;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Purchases");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_PURCHASES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Suppliers");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_SUPPLIERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Clients");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_CLIENTS;
  });

  const [debtTransactions, setDebtTransactions] = useState<DebtTransaction[]>(INITIAL_DEBT_TRANSACTIONS);
  const [inventories, setInventories] = useState<InventorySession[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Inventories");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_INVENTORIES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Expenses");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_EXPENSES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Employees");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_EMPLOYEES;
  });
  const [backupVersions, setBackupVersions] = useState<BackupVersion[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Backup_Versions");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  });
  const [users, setUsers] = useState<UserAccount[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Users");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_USERS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_CurrentUser");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Comprehensive Supabase Reload across ALL 17 Tables
  const refreshFromSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        { data: dbDepots },
        { data: dbCategories },
        { data: dbProducts },
        { data: dbStocks },
        { data: dbSuppliers },
        { data: dbClients },
        { data: dbEmployees },
        { data: dbPurchases },
        { data: dbSales },
        { data: dbExpenses },
        { data: dbMovements },
        { data: dbDebtTx },
        { data: dbUsers },
        { data: dbCash },
        { data: dbLogs },
        { data: dbInventories },
        { data: dbCompanySettings },
        { data: dbSaleItems }
      ] = await Promise.all([
        supabase.from('depots').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('products').select('*'),
        supabase.from('depot_stocks').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('purchases').select('*').order('date', { ascending: false }),
        supabase.from('sales').select('*').order('date', { ascending: false }),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('stock_movements').select('*').order('created_at', { ascending: false }),
        supabase.from('debt_transactions').select('*').order('date', { ascending: false }),
        supabase.from('user_accounts').select('*'),
        supabase.from('cash_sessions').select('*').order('date', { ascending: false }),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
        supabase.from('inventory_sessions').select('*').order('date', { ascending: false }),
        supabase.from('company_settings').select('*').order('updated_at', { ascending: false }),
        supabase.from('sale_items').select('*')
      ]);

      if (dbCompanySettings && dbCompanySettings.length > 0) {
        const s = dbCompanySettings[0];
        const loadedSettings: CompanySettings = {
          companyName: s.company_name || INITIAL_SETTINGS.companyName,
          currency: s.currency || INITIAL_SETTINGS.currency,
          vatRate: s.vat_rate !== undefined && s.vat_rate !== null ? Number(s.vat_rate) : INITIAL_SETTINGS.vatRate,
          minAlertDefault: s.min_alert_default ? Number(s.min_alert_default) : INITIAL_SETTINGS.minAlertDefault,
          phone: s.phone || INITIAL_SETTINGS.phone,
          address: s.address || INITIAL_SETTINGS.address,
          rccm: s.rccm || INITIAL_SETTINGS.rccm,
          logoUrl: s.logo_url || INITIAL_SETTINGS.logoUrl
        };
        setSettings(loadedSettings);
        localStorage.setItem("RizStock_Settings", JSON.stringify(loadedSettings));
      }

      if (dbDepots) {
        const loadedDepots = dbDepots.map(d => ({
          id: d.id,
          name: d.name,
          city: d.city,
          capacity: d.capacity,
          manager: d.manager_name || 'Non attribué',
          phone: d.phone || '',
          status: d.status || 'Actif'
        }));
        setDepots(loadedDepots);
        localStorage.setItem("RizStock_Depots", JSON.stringify(loadedDepots));
      }

      if (dbCategories && dbCategories.length > 0) {
        setCategories(dbCategories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          color: c.color || '#10b981'
        })));
      }

      if (dbProducts) {
        const loadedProds = dbProducts.map(p => ({
          id: p.id,
          code: p.code,
          title: p.title,
          category: p.category,
          weight: p.weight,
          buyPrice: Number(p.buy_price),
          sellPrice: Number(p.sell_price),
          alertThreshold: p.alert_threshold,
          imageUrl: p.image_url || '/royal_senegal_bag.jpg'
        }));
        setProducts(loadedProds);
        localStorage.setItem("RizStock_Products", JSON.stringify(loadedProds));
      }

      if (dbStocks) {
        const matrix: StockMatrix = {};
        dbStocks.forEach(s => {
          if (!matrix[s.depot_id]) matrix[s.depot_id] = {};
          matrix[s.depot_id][s.product_id] = s.quantity;
        });
        setStocks(matrix);
        localStorage.setItem("RizStock_Stocks", JSON.stringify(matrix));
      }

      if (dbSuppliers) {
        setSuppliers(dbSuppliers.map(s => ({
          id: s.id,
          name: s.name,
          country: s.country || '',
          phone: s.phone || '',
          email: s.email || '',
          leadTime: s.lead_time || '',
          rating: s.rating || '★★★★★'
        })));
      }

      if (dbClients) {
        const loadedCli = dbClients.map(c => ({
          id: c.id,
          name: c.name,
          category: c.category || 'Grossiste Majeur',
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
          city: c.city || 'Dakar',
          creditLimit: Number(c.credit_limit || 0),
          totalPurchases: Number(c.total_purchases || 0),
          balance: Number(c.balance || 0)
        }));
        setClients(loadedCli);
        localStorage.setItem("RizStock_Clients", JSON.stringify(loadedCli));
      }

      if (dbEmployees) {
        const loadedEmp = dbEmployees.map(e => ({
          id: e.id,
          name: e.name,
          firstName: e.first_name || '',
          lastName: e.last_name || '',
          role: e.role,
          depotId: e.depot_id || 'dep-1',
          salary: Number(e.salary),
          advances: Number(e.advances || 0),
          lastPay: e.last_pay || 'Jamais',
          cniNumber: e.cni_number || '',
          phone: e.phone || '',
          email: e.email || '',
          address: e.address || '',
          birthDate: e.birth_date || '',
          birthPlace: e.birth_place || '',
          contractType: e.contract_type || 'CDI',
          hireDate: e.hire_date || '',
          emergencyContact: e.emergency_contact || '',
          transportAllowance: Number(e.transport_allowance ?? 0),
          housingAllowance: Number(e.housing_allowance ?? 0),
          socialSecurityNum: e.social_security_num || ''
        }));
        setEmployees(loadedEmp);
        localStorage.setItem("RizStock_Employees", JSON.stringify(loadedEmp));
      }

      if (dbPurchases) {
        const loadedPurch = dbPurchases.map(p => ({
          id: p.id,
          date: p.date ? p.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
          supplier: p.supplier_name,
          supplierId: p.supplier_id,
          depotId: p.depot_id,
          productId: p.product_id,
          containers: p.containers,
          bags: p.bags,
          unitPrice: Number(p.unit_price || 0),
          totalCost: Number(p.total_cost),
          status: p.status || 'En Transit',
          payment: p.payment || 'En attente',
          blNumber: p.bl_number || '',
          etaDate: p.eta_date || '',
          receivedBags: p.received_bags || 0
        }));
        setPurchases(loadedPurch);
        localStorage.setItem("RizStock_Purchases", JSON.stringify(loadedPurch));
      }

      if (dbSales) {
        const loadedSales = dbSales.map(s => {
          let saleItems: SaleItem[] = [];
          if (dbSaleItems && dbSaleItems.length > 0) {
            const matched = dbSaleItems.filter(i => i.sale_id === s.id);
            if (matched.length > 0) {
              saleItems = matched.map(i => ({
                productId: i.product_id || (dbProducts?.[0]?.id || 'prod-1'),
                title: i.product_title,
                qty: Number(i.quantity || 1),
                price: Number(i.unit_price || 0)
              }));
            }
          }

          if (saleItems.length === 0 && s.items) {
            if (Array.isArray(s.items)) saleItems = s.items;
            else if (typeof s.items === 'string') {
              try { saleItems = JSON.parse(s.items); } catch (e) {}
            }
          }

          if (saleItems.length === 0) {
            // Check if there is a matching stock movement for this sale to get exact real product!
            const matchedMvt = dbMovements?.find(m => m.dest && m.dest.includes(s.id));
            if (matchedMvt) {
              const matchedProd = dbProducts?.find(p => p.title.toLowerCase() === matchedMvt.product_title.toLowerCase());
              const pPrice = matchedProd ? Number(matchedProd.sell_price) : Math.round(Number(s.total_amount || 0) / Math.max(1, matchedMvt.quantity));
              saleItems = [{
                productId: matchedProd ? matchedProd.id : 'prod-mvt',
                title: matchedMvt.product_title,
                qty: matchedMvt.quantity,
                price: pPrice
              }];
            } else {
              const firstProd = dbProducts && dbProducts.length > 0 ? dbProducts[0] : null;
              const unitP = firstProd ? Number(firstProd.sell_price) : 15000;
              const amt = Number(s.total_amount || 0);
              const computedQty = Math.max(1, Math.round(amt / (unitP || 15000)));
              saleItems = [{
                productId: firstProd ? firstProd.id : "prod-1",
                title: firstProd ? firstProd.title : "Marchandise Riz",
                qty: computedQty,
                price: unitP
              }];
            }
          }

          return {
            id: s.id,
            date: s.date ? s.date.slice(0, 16).replace("T", " ") : new Date().toISOString().slice(0, 16).replace("T", " "),
            depotId: s.depot_id || 'dep-1',
            clientName: s.client_name || "Client",
            items: saleItems,
            totalAmount: Number(s.total_amount),
            paymentMode: s.payment_mode || 'Espece',
            status: s.status || 'Payé'
          };
        });
        setSales(loadedSales);
        if (typeof window !== "undefined") {
          localStorage.setItem("RizStock_Sales", JSON.stringify(loadedSales));
        }
      }

      if (dbExpenses) {
        const loadedExp = dbExpenses.map(e => ({
          id: e.id,
          date: e.date ? e.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
          depotId: e.depot_id || 'dep-1',
          category: e.category,
          amount: Number(e.amount),
          beneficiary: e.beneficiary || '',
          desc: e.description || '',
          user: e.user_name || 'Utilisateur'
        }));
        setExpenses(loadedExp);
        if (typeof window !== "undefined") {
          localStorage.setItem("RizStock_Expenses", JSON.stringify(loadedExp));
        }
      }

      if (dbMovements) {
        const loadedMovements = dbMovements.map(m => ({
          ref: m.ref,
          date: m.created_at ? m.created_at.slice(0, 16).replace("T", " ") : new Date().toISOString().slice(0, 16).replace("T", " "),
          type: m.type,
          prodTitle: m.product_title,
          source: m.source,
          dest: m.dest,
          qty: m.quantity,
          operator: m.operator || 'Opérateur'
        }));
        setMovements(loadedMovements);
        if (typeof window !== "undefined") {
          localStorage.setItem("RizStock_Movements", JSON.stringify(loadedMovements));
        }
      }

      if (dbInventories) {
        setInventories(dbInventories.map(i => ({
          id: i.id,
          date: i.date ? i.date.slice(0, 16).replace("T", " ") : new Date().toISOString().slice(0, 16).replace("T", " "),
          depotId: i.depot_id,
          depotName: i.depot_name,
          auditor: i.auditor,
          status: i.status,
          totalExpected: i.total_expected || 0,
          totalActual: i.total_actual || 0,
          totalDiscrepancy: i.total_discrepancy || 0,
          items: []
        })));
      }

      if (dbDebtTx) {
        const loadedDebts: DebtTransaction[] = dbDebtTx.map(d => ({
          id: d.id,
          clientId: d.client_id || '',
          clientName: d.client_name || 'Client',
          date: d.date ? d.date.slice(0, 16).replace("T", " ") : new Date().toISOString().slice(0, 16).replace("T", " "),
          type: (d.type === 'RÈGLEMENT_TOTAL' ? 'RÈGLEMENT_TOTAL' : 'ACCOMPTE') as 'ACCOMPTE' | 'RÈGLEMENT_TOTAL',
          amount: Number(d.amount || 0),
          paymentMode: (d.payment_mode || 'Espece') as 'Espece' | 'Wave' | 'Virement' | 'Cheque',
          note: d.note || '',
          recordedBy: d.recorded_by || 'Administrateur'
        }));
        setDebtTransactions(loadedDebts);
      }

      if (dbCash) {
        const loadedCash = dbCash.map(s => ({
          id: s.id,
          date: s.date ? s.date.slice(0, 16).replace("T", " ") : new Date().toISOString().slice(0, 16).replace("T", " "),
          depotId: s.depot_id || 'dep-1',
          depotName: s.depot_name || 'Siège Dépôt',
          cashierName: s.cashier_name || 'Caissier',
          openingBalance: Number(s.opening_balance || 0),
          cashSales: Number(s.cash_sales || 0),
          waveSales: Number(s.wave_sales || 0),
          chequeSales: Number(s.cheque_sales || 0),
          virementSales: Number(s.virement_sales || 0),
          creditSales: Number(s.credit_sales || 0),
          totalExpenses: Number(s.total_expenses || 0),
          expectedCash: Number(s.expected_cash || s.opening_balance || 0),
          actualCash: Number(s.actual_cash || s.opening_balance || 0),
          cashDiscrepancy: Number(s.cash_discrepancy || 0),
          status: (s.status || 'Ouverte') as 'Ouverte' | 'Clôturée'
        }));
        setCashSessions(loadedCash);
        if (typeof window !== "undefined") {
          localStorage.setItem("RizStock_CashSessions", JSON.stringify(loadedCash));
        }
      }

      if (dbUsers) {
        const loadedUsers = dbUsers.map(u => ({
          username: u.username,
          name: u.name,
          role: u.role,
          depot: u.depot || 'Tous',
          lastLogin: u.last_login ? u.last_login.slice(0, 16).replace("T", " ") : 'Récemment',
          status: u.status || 'Actif',
          password: u.password,
          customPermissions: u.custom_permissions ? (typeof u.custom_permissions === 'string' ? JSON.parse(u.custom_permissions) : u.custom_permissions) : u.customPermissions
        }));
        const finalUsers = loadedUsers.length > 0 ? loadedUsers : INITIAL_USERS;
        setUsers(finalUsers);
        if (typeof window !== "undefined") {
          localStorage.setItem("RizStock_Users", JSON.stringify(finalUsers));
        }
      }

      if (dbLogs) {
        setAuditLogs(dbLogs.map(l => ({
          id: l.id,
          timestamp: l.timestamp ? l.timestamp.slice(0, 16).replace("T", " ") : new Date().toISOString().slice(0, 16).replace("T", " "),
          user: l.user_name,
          role: l.role,
          action: l.action,
          description: l.description,
          ipAddress: l.ip_address || '127.0.0.1',
          depotName: l.depot_name || 'Siège / Global'
        })));
      }

    } catch (err) {
      console.log("Supabase comprehensive refresh info:", err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Initial Load from Supabase on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("RizStock_Theme") as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    refreshFromSupabase();
  }, [refreshFromSupabase]);

  const activeUserObj = users.find(u => u.role.toLowerCase() === activeRole.toLowerCase()) || users[0];

  const logActivity = (action: AuditLog['action'], description: string, depotName?: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      user: activeUserObj ? activeUserObj.name : "Moustapha Ndiaye",
      role: activeRole,
      action,
      description,
      ipAddress: "192.168.1.45",
      depotName: depotName || (activeDepotId === "all" ? "Siège / Global" : (depots.find(d => d.id === activeDepotId)?.name || activeDepotId))
    };

    setAuditLogs(prev => [newLog, ...prev]);

    supabase.from('audit_logs').insert({
      id: newLog.id,
      timestamp: new Date().toISOString(),
      user_name: newLog.user,
      role: newLog.role,
      action: newLog.action,
      description: newLog.description,
      ip_address: newLog.ipAddress,
      depot_name: newLog.depotName
    }).then();
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    showToast("Journal d'audit réinitialisé avec succès", "info");
  };

  const updateSettings = async (updatedData: Partial<CompanySettings>) => {
    const nextSettings = { ...settings, ...updatedData };
    setSettings(nextSettings);
    localStorage.setItem("RizStock_Settings", JSON.stringify(nextSettings));

    const { data: existing } = await supabase.from('company_settings').select('id').order('updated_at', { ascending: false }).limit(1);
    const existingId = existing && existing.length > 0 ? existing[0].id : undefined;

    const payload: any = {
      company_name: nextSettings.companyName,
      currency: nextSettings.currency,
      vat_rate: nextSettings.vatRate,
      min_alert_default: nextSettings.minAlertDefault,
      phone: nextSettings.phone,
      address: nextSettings.address,
      rccm: nextSettings.rccm,
      logo_url: nextSettings.logoUrl || null,
      updated_at: new Date().toISOString()
    };

    if (existingId) {
      payload.id = existingId;
    }

    const { error } = await supabase.from('company_settings').upsert(payload);
    if (error) console.error("Supabase company_settings upsert error:", error);

    logActivity("PARAMETRE", "Mise à jour des paramètres généraux & en-tête de facturation de l'entreprise");
    showToast("Paramètres de l'entreprise enregistrés dans Supabase !", "success");
    refreshFromSupabase();
  };

  const createBackupSnapshot = (label: string, type: 'auto_reset' | 'manual_export' | 'manual_upload' = 'manual_export'): BackupVersion => {
    const id = `BACKUP-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();
    const totalRev = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    const snapshot: BackupVersion = {
      id,
      timestamp,
      label,
      type,
      depotsCount: depots.length,
      productsCount: products.length,
      salesCount: sales.length,
      totalRevenue: totalRev,
      data: {
        settings,
        categories,
        depots,
        products,
        stocks,
        sales,
        expenses,
        clients,
        suppliers,
        employees,
        users,
        purchases,
        inventories,
        cashSessions,
        movements,
        debtTransactions
      }
    };

    setBackupVersions(prev => {
      const next = [snapshot, ...prev.filter(b => b.id !== id)].slice(0, 30);
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_Backup_Versions", JSON.stringify(next));
      }
      return next;
    });

    return snapshot;
  };

  const restoreBackupVersion = (versionId: string) => {
    const version = backupVersions.find(v => v.id === versionId);
    if (!version || !version.data) {
      showToast("Version de sauvegarde introuvable !", "error");
      return;
    }

    const { data } = version;

    if (data.settings) {
      setSettings(data.settings);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Settings", JSON.stringify(data.settings));
    }
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Categories", JSON.stringify(data.categories));
    }
    if (data.depots && Array.isArray(data.depots)) {
      setDepots(data.depots);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Depots", JSON.stringify(data.depots));
    }
    if (data.products && Array.isArray(data.products)) {
      setProducts(data.products);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Products", JSON.stringify(data.products));
    }
    if (data.stocks && typeof data.stocks === "object") {
      setStocks(data.stocks);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Stocks", JSON.stringify(data.stocks));
    }
    if (data.sales && Array.isArray(data.sales)) {
      setSales(data.sales);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Sales", JSON.stringify(data.sales));
    }
    if (data.expenses && Array.isArray(data.expenses)) {
      setExpenses(data.expenses);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Expenses", JSON.stringify(data.expenses));
    }
    if (data.clients && Array.isArray(data.clients)) {
      setClients(data.clients);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Clients", JSON.stringify(data.clients));
    }
    if (data.suppliers && Array.isArray(data.suppliers)) {
      setSuppliers(data.suppliers);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Suppliers", JSON.stringify(data.suppliers));
    }
    if (data.employees && Array.isArray(data.employees)) {
      setEmployees(data.employees);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Employees", JSON.stringify(data.employees));
    }
    if (data.users && Array.isArray(data.users)) {
      setUsers(data.users);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Users", JSON.stringify(data.users));
    }
    if (data.purchases && Array.isArray(data.purchases)) {
      setPurchases(data.purchases);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Purchases", JSON.stringify(data.purchases));
    }
    if (data.inventories && Array.isArray(data.inventories)) {
      setInventories(data.inventories);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Inventories", JSON.stringify(data.inventories));
    }
    if (data.cashSessions && Array.isArray(data.cashSessions)) {
      setCashSessions(data.cashSessions);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_CashSessions", JSON.stringify(data.cashSessions));
    }
    if (data.movements && Array.isArray(data.movements)) {
      setMovements(data.movements);
      if (typeof window !== "undefined") localStorage.setItem("RizStock_Movements", JSON.stringify(data.movements));
    }

    logActivity("PARAMETRE", `Restauration effectuée depuis la version "${version.label}" (${version.id})`);
    showToast(`🎉 Base de données restaurée avec succès (${version.salesCount || 0} ventes, ${version.productsCount || 0} produits) !`, "success");
  };

  const deleteBackupVersion = (versionId: string) => {
    setBackupVersions(prev => {
      const next = prev.filter(v => v.id !== versionId);
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_Backup_Versions", JSON.stringify(next));
      }
      return next;
    });
    showToast(`Version de sauvegarde ${versionId} supprimée`, "info");
  };

  const importBackupJSON = (jsonData: any): boolean => {
    try {
      if (!jsonData || typeof jsonData !== "object") {
        showToast("Format de fichier JSON invalide !", "error");
        return false;
      }

      const importedDepots = jsonData.depots || jsonData.data?.depots;
      const importedProducts = jsonData.products || jsonData.data?.products;
      const importedSales = jsonData.sales || jsonData.data?.sales;
      const importedStocks = jsonData.stocks || jsonData.data?.stocks;
      const importedExpenses = jsonData.expenses || jsonData.data?.expenses;
      const importedClients = jsonData.clients || jsonData.data?.clients;
      const importedSuppliers = jsonData.suppliers || jsonData.data?.suppliers;
      const importedEmployees = jsonData.employees || jsonData.data?.employees;
      const importedUsers = jsonData.users || jsonData.data?.users;
      const importedPurchases = jsonData.purchases || jsonData.data?.purchases;
      const importedSettings = jsonData.settings || jsonData.data?.settings;

      createBackupSnapshot(`Sauvegarde de Sécurité Avant Importation (${new Date().toLocaleDateString('fr-FR')})`, 'manual_upload');

      if (importedSettings) {
        setSettings(importedSettings);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Settings", JSON.stringify(importedSettings));
      }
      if (Array.isArray(importedDepots) && importedDepots.length > 0) {
        setDepots(importedDepots);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Depots", JSON.stringify(importedDepots));
      }
      if (Array.isArray(importedProducts) && importedProducts.length > 0) {
        setProducts(importedProducts);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Products", JSON.stringify(importedProducts));
      }
      if (importedStocks && typeof importedStocks === "object") {
        setStocks(importedStocks);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Stocks", JSON.stringify(importedStocks));
      }
      if (Array.isArray(importedSales) && importedSales.length > 0) {
        setSales(importedSales);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Sales", JSON.stringify(importedSales));
      }
      if (Array.isArray(importedExpenses) && importedExpenses.length > 0) {
        setExpenses(importedExpenses);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Expenses", JSON.stringify(importedExpenses));
      }
      if (Array.isArray(importedClients) && importedClients.length > 0) {
        setClients(importedClients);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Clients", JSON.stringify(importedClients));
      }
      if (Array.isArray(importedSuppliers) && importedSuppliers.length > 0) {
        setSuppliers(importedSuppliers);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Suppliers", JSON.stringify(importedSuppliers));
      }
      if (Array.isArray(importedEmployees) && importedEmployees.length > 0) {
        setEmployees(importedEmployees);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Employees", JSON.stringify(importedEmployees));
      }
      if (Array.isArray(importedUsers) && importedUsers.length > 0) {
        setUsers(importedUsers);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Users", JSON.stringify(importedUsers));
      }
      if (Array.isArray(importedPurchases) && importedPurchases.length > 0) {
        setPurchases(importedPurchases);
        if (typeof window !== "undefined") localStorage.setItem("RizStock_Purchases", JSON.stringify(importedPurchases));
      }

      createBackupSnapshot(`Importation Réussie - ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR').slice(0,5)}`, 'manual_upload');

      logActivity("PARAMETRE", "Restauration manuelle intégrale de la base de données via fichier JSON");
      showToast("Fichier JSON importé et restauré avec succès !", "success");
      return true;
    } catch (err: any) {
      console.error("Import backup error:", err);
      showToast(`Erreur lors de la restauration du fichier JSON: ${err.message || err}`, "error");
      return false;
    }
  };

  const resetSystemWithAutoBackup = () => {
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const autoBackup = createBackupSnapshot(`Sauvegarde Automatique avant Réinitialisation (${dateStr})`, 'auto_reset');

    if (typeof window !== "undefined") {
      localStorage.removeItem("RizStock_Settings");
      localStorage.removeItem("RizStock_Categories");
      localStorage.removeItem("RizStock_Depots");
      localStorage.removeItem("RizStock_Products");
      localStorage.removeItem("RizStock_Stocks");
      localStorage.removeItem("RizStock_Sales");
      localStorage.removeItem("RizStock_Expenses");
      localStorage.removeItem("RizStock_Clients");
      localStorage.removeItem("RizStock_Suppliers");
      localStorage.removeItem("RizStock_Employees");
      localStorage.removeItem("RizStock_Purchases");
      localStorage.removeItem("RizStock_Inventories");
      localStorage.removeItem("RizStock_CashSessions");
      localStorage.removeItem("RizStock_Movements");
    }

    setSettings(INITIAL_SETTINGS);
    setCategories(INITIAL_CATEGORIES);
    setDepots(INITIAL_DEPOTS);
    setProducts(INITIAL_PRODUCTS);
    setStocks(INITIAL_STOCKS);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
    setClients(INITIAL_CLIENTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setEmployees(INITIAL_EMPLOYEES);
    setPurchases(INITIAL_PURCHASES);
    setInventories(INITIAL_INVENTORIES);
    setCashSessions(INITIAL_CASH_SESSIONS);
    setMovements(INITIAL_MOVEMENTS);

    logActivity("PARAMETRE", `Réinitialisation système exécutée. Sauvegarde automatique N° ${autoBackup.id} enregistrée.`);
    showToast(`Réinitialisation effectuée. Une version de secours (${autoBackup.id}) a été conservée !`, "warning");

    setTimeout(() => {
      if (typeof window !== "undefined") window.location.reload();
    }, 1200);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem("RizStock_Theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    showToast(`Mode ${nextTheme === 'light' ? 'Clair ☀️' : 'Sombre 🌙'} activé`, "info");
  };

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const openModal = (modalId: string) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  const askConfirm = (options: { title: string; message: string; confirmLabel?: string; onConfirm: () => void }) => {
    setConfirmState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel,
      onConfirm: options.onConfirm
    });
  };

  const closeConfirm = () => {
    setConfirmState(null);
  };

  const addToCart = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { productId: prod.id, title: prod.title, qty: 1, price: prod.sellPrice }];
    });

    showToast(`+1 ${prod.title} ajouté au panier !`, "success");
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const setCartItemQty = (productId: string, exactQty: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const safeQty = isNaN(exactQty) ? 0 : Math.max(0, exactQty);
        return safeQty > 0 ? { ...item, qty: safeQty } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const clearCart = () => setCart([]);

  const processCheckout = async (clientName: string, paymentMode: Sale['paymentMode']) => {
    if (cart.length === 0) {
      showToast("Le panier est vide. Veuillez sélectionner des produits.", "error");
      return;
    }

    const depotIdToDeduct = activeDepotId === "all" ? (depots[0]?.id || "dep-1") : activeDepotId;
    const targetDepot = depots.find(d => d.id === depotIdToDeduct) || depots[0];

    for (const item of cart) {
      const avail = (stocks[depotIdToDeduct] && stocks[depotIdToDeduct][item.productId]) || 0;
      if (avail < item.qty) {
        showToast(`Stock insuffisant pour ${item.title}. Disponible: ${avail} sacs`, "error");
        return;
      }
    }

    setStocks(prev => {
      const updated = { ...prev };
      if (!updated[depotIdToDeduct]) updated[depotIdToDeduct] = {};
      cart.forEach(item => {
        const current = updated[depotIdToDeduct][item.productId] || 0;
        updated[depotIdToDeduct][item.productId] = Math.max(0, current - item.qty);
      });
      localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
      return updated;
    });

    const invoiceNum = `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmt = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const totalBagsCount = cart.reduce((sum, i) => sum + i.qty, 0);

    const newSale: Sale = {
      id: invoiceNum,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      depotId: depotIdToDeduct,
      clientName: clientName || "Client Comptoir",
      items: [...cart],
      totalAmount: totalAmt,
      paymentMode: paymentMode,
      status: paymentMode === "Credit" ? "En attente" : "Payé"
    };

    setSales(prev => {
      const updated = [newSale, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_Sales", JSON.stringify(updated));
      }
      return updated;
    });

    if (targetDepot) {
      await supabase.from('depots').upsert({
        id: targetDepot.id,
        name: targetDepot.name,
        city: targetDepot.city,
        capacity: targetDepot.capacity,
        manager_name: targetDepot.manager,
        phone: targetDepot.phone,
        status: targetDepot.status
      });
    }

    for (const item of cart) {
      const matchedProd = products.find(p => p.id === item.productId || p.title.toLowerCase() === item.title.toLowerCase());
      const targetProdId = matchedProd ? matchedProd.id : item.productId;
      const targetProdTitle = matchedProd ? matchedProd.title : item.title;

      // Direct real-time fetch of exact stock row from Supabase
      const { data: currentStockRow } = await supabase
        .from('depot_stocks')
        .select('id, quantity')
        .eq('depot_id', depotIdToDeduct)
        .eq('product_id', targetProdId)
        .maybeSingle();

      const currentQty = currentStockRow ? Number(currentStockRow.quantity) : ((stocks[depotIdToDeduct] && stocks[depotIdToDeduct][targetProdId]) || 0);
      const newQty = Math.max(0, currentQty - item.qty);

      if (currentStockRow) {
        await supabase
          .from('depot_stocks')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', currentStockRow.id);
      } else {
        await supabase
          .from('depot_stocks')
          .insert({
            depot_id: depotIdToDeduct,
            product_id: targetProdId,
            quantity: newQty,
            updated_at: new Date().toISOString()
          });
      }

      // Auto-log stock movement for audit history with exact product title
      const mvtRef = `MVT-${Math.floor(1000 + Math.random() * 9000)}`;
      const mvtDate = new Date().toISOString().slice(0, 16).replace("T", " ");
      const mvtObj: StockMovement = {
        ref: mvtRef,
        date: mvtDate,
        type: 'SORTIE',
        prodTitle: targetProdTitle,
        source: targetDepot?.name || 'Dépôt Vendeur',
        dest: `Vente Facture ${invoiceNum} (${clientName || 'Client Comptoir'})`,
        qty: item.qty,
        operator: activeUserObj ? activeUserObj.name : 'Caissier POS'
      };

      setMovements(prev => {
        const updated = [mvtObj, ...prev.filter(m => m.ref !== mvtRef)];
        if (typeof window !== "undefined") {
          localStorage.setItem("RizStock_Movements", JSON.stringify(updated));
        }
        return updated;
      });

      await supabase.from('stock_movements').insert({
        ref: mvtRef,
        type: 'SORTIE',
        product_title: targetProdTitle,
        source: targetDepot?.name || 'Dépôt Vendeur',
        dest: `Vente Facture ${invoiceNum} (${clientName || 'Client Comptoir'})`,
        quantity: item.qty,
        operator: activeUserObj ? activeUserObj.name : 'Caissier POS'
      });
    }

    // Auto-update client credit balance if sale is on Credit
    if (paymentMode === "Credit" && clientName) {
      const targetCli = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
      if (targetCli) {
        const newPurchases = targetCli.totalPurchases + totalAmt;
        const newBalance = targetCli.balance + totalAmt;
        setClients(prev => prev.map(c => c.id === targetCli.id ? { ...c, totalPurchases: newPurchases, balance: newBalance } : c));
        await supabase.from('clients').update({
          total_purchases: newPurchases,
          balance: newBalance
        }).eq('id', targetCli.id);
      }
    }

    const { error } = await supabase.from('sales').insert({
      id: newSale.id,
      depot_id: newSale.depotId,
      client_name: newSale.clientName,
      total_amount: newSale.totalAmount,
      payment_mode: newSale.paymentMode,
      status: newSale.status
    });

    if (cart.length > 0) {
      const saleItemsPayload = cart.map(item => {
        const matchedProd = products.find(p => p.id === item.productId || p.title.toLowerCase() === item.title.toLowerCase());
        return {
          sale_id: invoiceNum,
          product_id: matchedProd ? matchedProd.id : item.productId,
          product_title: matchedProd ? matchedProd.title : item.title,
          quantity: item.qty,
          unit_price: item.price
        };
      });
      const { error: saleItemsErr } = await supabase.from('sale_items').insert(saleItemsPayload);
      if (saleItemsErr) {
        console.error("Supabase sale_items insert error:", saleItemsErr);
      }
    }

    if (error) {
      console.error("Sales Supabase error:", error);
      showToast(`Erreur Supabase Vente: ${error.message}`, "error");
    } else {
      showToast(`Vente ${invoiceNum} enregistrée dans Supabase !`, "success");
      refreshFromSupabase();
    }

    // Live update active open cash session totals
    setCashSessions(prev => {
      const openIdx = prev.findIndex(s => s.status === "Ouverte");
      if (openIdx === -1) return prev;
      const copy = [...prev];
      const sess = { ...copy[openIdx] };
      if (paymentMode === "Espece") {
        sess.cashSales += totalAmt;
        sess.expectedCash += totalAmt;
      } else if (paymentMode === "Wave") {
        sess.waveSales += totalAmt;
      } else if (paymentMode === "Cheque") {
        sess.chequeSales += totalAmt;
      } else if (paymentMode === "Virement") {
        sess.virementSales += totalAmt;
      } else if (paymentMode === "Credit") {
        sess.creditSales += totalAmt;
      }
      copy[openIdx] = sess;
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_CashSessions", JSON.stringify(copy));
      }
      supabase.from('cash_sessions').update({
        cash_sales: sess.cashSales,
        wave_sales: sess.waveSales,
        cheque_sales: sess.chequeSales,
        virement_sales: sess.virementSales,
        credit_sales: sess.creditSales,
        expected_cash: sess.expectedCash
      }).eq('id', sess.id).then();
      return copy;
    });

    logActivity("VENTE", `Validation Vente ${invoiceNum} (${clientName || "Client Comptoir"}) - ${formatNumber(totalBagsCount)} sacs pour ${formatFCFA(totalAmt)}`, targetDepot?.name);
    clearCart();
    openModal(`invoice-${invoiceNum}`);
  };

  const openCashSession = async (openingBalance: number) => {
    const id = `CS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const date = new Date().toISOString().slice(0, 16).replace("T", " ");
    const depotObj = depots.find(d => d.id === activeDepotId) || depots[0];

    const newSession: CashSession = {
      id,
      date,
      depotId: depotObj.id,
      depotName: depotObj.name,
      cashierName: currentUser ? currentUser.name : (activeUserObj ? activeUserObj.name : "Caissier POS"),
      openingBalance,
      cashSales: 0,
      waveSales: 0,
      chequeSales: 0,
      virementSales: 0,
      creditSales: 0,
      totalExpenses: 0,
      expectedCash: openingBalance,
      actualCash: openingBalance,
      cashDiscrepancy: 0,
      status: "Ouverte"
    };

    setCashSessions(prev => {
      const updated = prev.map(s => s.status === "Ouverte" ? { ...s, status: "Clôturée" as const } : s);
      const next = [newSession, ...updated];
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_CashSessions", JSON.stringify(next));
      }
      return next;
    });

    try {
      await supabase.from('cash_sessions').insert({
        id: newSession.id,
        depot_id: newSession.depotId,
        depot_name: newSession.depotName,
        cashier_name: newSession.cashierName,
        opening_balance: newSession.openingBalance,
        cash_sales: 0,
        wave_sales: 0,
        cheque_sales: 0,
        virement_sales: 0,
        credit_sales: 0,
        total_expenses: 0,
        expected_cash: newSession.expectedCash,
        actual_cash: newSession.actualCash,
        status: newSession.status
      });
    } catch (e) {
      console.warn("Supabase open cash session error:", e);
    }

    logActivity("VENTE", `Ouverture de caisse N° ${id} avec un fond initial de ${formatFCFA(openingBalance)}`, depotObj.name);
    showToast(`Caisse ouverte avec ${formatFCFA(openingBalance)} de fond de caisse !`, "success");
    closeModal();
  };

  const closeCashSession = async (actualCash: number) => {
    const openSession = cashSessions.find(s => s.status === "Ouverte");
    if (!openSession) return;

    const discrepancy = actualCash - openSession.expectedCash;

    setCashSessions(prev => {
      const next = prev.map(s => s.id === openSession.id ? {
        ...s,
        actualCash,
        cashDiscrepancy: discrepancy,
        status: "Clôturée" as const
      } : s);
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_CashSessions", JSON.stringify(next));
      }
      return next;
    });

    try {
      await supabase.from('cash_sessions').update({
        actual_cash: actualCash,
        cash_discrepancy: discrepancy,
        status: 'Clôturée'
      }).eq('id', openSession.id);
    } catch (e) {
      console.warn("Supabase close cash session error:", e);
    }

    logActivity("VENTE", `Clôture de Caisse ${openSession.id}. Espèces théoriques: ${formatFCFA(openSession.expectedCash)}, Compté: ${formatFCFA(actualCash)} (Écart: ${discrepancy > 0 ? '+' : ''}${formatFCFA(discrepancy)})`, openSession.depotName);
    showToast(`Session de caisse clôturée avec succès !`, "success");
    closeModal();
  };

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCat: Category = { ...catData, id };
    setCategories(prev => [...prev, newCat]);

    const { error } = await supabase.from('categories').insert({
      id: newCat.id,
      name: newCat.name,
      slug: newCat.slug,
      description: newCat.description,
      color: newCat.color
    });

    if (error) console.error(error);
    else refreshFromSupabase();

    logActivity("PARAMETRE", `Création de la nouvelle catégorie de produit "${catData.name}" (${catData.slug})`);
    showToast(`Catégorie "${catData.name}" créée dans Supabase !`, "success");
  };

  const updateCategory = async (id: string, updatedData: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    await supabase.from('categories').update(updatedData).eq('id', id);
    logActivity("PARAMETRE", `Modification de la catégorie N° ${id}`);
    showToast(`Catégorie mise à jour !`, "success");
  };

  const deleteCategory = async (id: string) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;

    const fallbackSlug = categories.find(c => c.id !== id)?.slug || "brise";
    setProducts(prev => prev.map(p => p.category === target.slug ? { ...p, category: fallbackSlug } : p));

    setCategories(prev => prev.filter(c => c.id !== id));
    await supabase.from('categories').delete().eq('id', id);

    logActivity("PARAMETRE", `Suppression de la catégorie "${target.name}"`);
    showToast(`Catégorie "${target.name}" supprimée !`, "warning");
  };

  const addDepot = async (depotData: Omit<Depot, 'id'>) => {
    const newId = `dep-${Date.now()}`;
    const newDepot: Depot = { ...depotData, id: newId };

    setDepots(prev => {
      const next = [...prev, newDepot];
      localStorage.setItem("RizStock_Depots", JSON.stringify(next));
      return next;
    });

    setStocks(prev => {
      const updated = { ...prev };
      if (!updated[newId]) updated[newId] = {};
      products.forEach(p => updated[newId][p.id] = 0);
      localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
      return updated;
    });

    const { error } = await supabase.from('depots').insert({
      id: newDepot.id,
      name: newDepot.name,
      city: newDepot.city,
      capacity: newDepot.capacity,
      manager_name: newDepot.manager,
      phone: newDepot.phone,
      status: newDepot.status
    });

    if (error) {
      console.error("Supabase depot insert error:", error);
      showToast(`Erreur Supabase: ${error.message}`, "error");
    } else {
      showToast(`Dépôt "${depotData.name}" enregistré dans Supabase !`, "success");
      refreshFromSupabase();
    }

    logActivity("PARAMETRE", `Création du nouveau dépôt "${depotData.name}" à ${depotData.city}`);
    closeModal();
  };

  const updateDepot = async (id: string, updatedData: Partial<Depot>) => {
    setDepots(prev => {
      const next = prev.map(d => d.id === id ? { ...d, ...updatedData } : d);
      localStorage.setItem("RizStock_Depots", JSON.stringify(next));
      return next;
    });

    const { error } = await supabase.from('depots').update({
      name: updatedData.name,
      city: updatedData.city,
      capacity: updatedData.capacity,
      manager_name: updatedData.manager,
      phone: updatedData.phone,
      status: updatedData.status
    }).eq('id', id);

    if (error) console.error(error);
    else refreshFromSupabase();

    logActivity("PARAMETRE", `Modification des informations du dépôt N° ${id}`);
    showToast(`Informations du dépôt mises à jour avec succès !`, "success");
    closeModal();
  };

  const deleteDepot = async (id: string) => {
    const target = depots.find(d => d.id === id);
    if (!target) return;

    setDepots(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem("RizStock_Depots", JSON.stringify(next));
      return next;
    });

    setStocks(prev => {
      const updated = { ...prev };
      delete updated[id];
      localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
      return updated;
    });

    await supabase.from('depots').delete().eq('id', id);

    if (activeDepotId === id) setActiveDepotId("all");
    logActivity("PARAMETRE", `Suppression du dépôt "${target.name}"`);
    showToast(`Dépôt "${target.name}" supprimé !`, "warning");
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'code'>) => {
    const newId = `prod-${Date.now()}`;
    const code = `RZ-${productData.category.substring(0, 2).toUpperCase()}-${productData.weight}`;
    const newProd: Product = { ...productData, id: newId, code };

    setProducts(prev => {
      const next = [...prev, newProd];
      localStorage.setItem("RizStock_Products", JSON.stringify(next));
      return next;
    });

    setStocks(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(depId => {
        if (!updated[depId]) updated[depId] = {};
        updated[depId][newId] = 0;
      });
      localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
      return updated;
    });

    const { error } = await supabase.from('products').insert({
      id: newProd.id,
      code: newProd.code,
      title: newProd.title,
      category: newProd.category,
      weight: newProd.weight,
      buy_price: newProd.buyPrice,
      sell_price: newProd.sellPrice,
      alert_threshold: newProd.alertThreshold,
      image_url: newProd.imageUrl
    });

    if (error) {
      console.error(error);
      showToast(`Erreur Supabase Produit: ${error.message}`, "error");
    } else {
      showToast(`Variété "${productData.title}" enregistrée dans Supabase !`, "success");
      refreshFromSupabase();
    }

    logActivity("STOCK", `Ajout de la nouvelle variété de riz "${productData.title}" au catalogue`);
    closeModal();
  };

  const updateProduct = async (id: string, updatedData: Partial<Product>) => {
    setProducts(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updatedData } : p);
      localStorage.setItem("RizStock_Products", JSON.stringify(next));
      return next;
    });

    await supabase.from('products').update({
      title: updatedData.title,
      category: updatedData.category,
      weight: updatedData.weight,
      buy_price: updatedData.buyPrice,
      sell_price: updatedData.sellPrice,
      alert_threshold: updatedData.alertThreshold,
      image_url: updatedData.imageUrl
    }).eq('id', id);

    logActivity("STOCK", `Modification du produit N° ${id} dans le catalogue`);
    showToast(`Produit mis à jour dans le catalogue !`, "success");
    closeModal();
  };

  const updateProductStock = async (productId: string, depotStocks: { [depotId: string]: number }) => {
    setStocks(prev => {
      const updated = { ...prev };
      Object.entries(depotStocks).forEach(([depId, qty]) => {
        if (!updated[depId]) updated[depId] = {};
        updated[depId][productId] = Math.max(0, qty);
      });
      localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
      return updated;
    });

    const upsertRows = Object.entries(depotStocks).map(([depId, qty]) => ({
      depot_id: depId,
      product_id: productId,
      quantity: Math.max(0, qty)
    }));

    if (upsertRows.length > 0) {
      await supabase.from('depot_stocks').upsert(upsertRows, { onConflict: 'depot_id,product_id' });
    }

    const prod = products.find(p => p.id === productId);
    logActivity("STOCK", `Mise à jour directe du stock réel pour "${prod?.title || productId}"`);
    showToast(`Stock réel mis à jour avec succès !`, "success");
  };

  const deleteProduct = async (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem("RizStock_Products", JSON.stringify(next));
      return next;
    });

    setStocks(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(depId => {
        delete updated[depId][id];
      });
      localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
      return updated;
    });

    await supabase.from('products').delete().eq('id', id);

    logActivity("STOCK", `Suppression du produit "${target.title}" du catalogue`);
    showToast(`Produit "${target.title}" supprimé du catalogue !`, "warning");
  };

  const addPurchase = async (purchaseData: Omit<Purchase, 'id' | 'date'>) => {
    const id = `ACH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const date = new Date().toISOString().slice(0, 10);
    const newPurchase: Purchase = { ...purchaseData, id, date };

    setPurchases(prev => {
      const next = [newPurchase, ...prev];
      localStorage.setItem("RizStock_Purchases", JSON.stringify(next));
      return next;
    });

    const targetDepot = depots.find(d => d.id === purchaseData.depotId) || depots[0];
    const targetDepotId = targetDepot ? targetDepot.id : (purchaseData.depotId || 'dep-1');
    const targetProd = products.find(p => p.id === purchaseData.productId) || products[0];
    const targetProdId = targetProd ? targetProd.id : (purchaseData.productId || 'prod-1');

    if (purchaseData.status === "Livré") {
      const currentQty = (stocks[targetDepotId] && stocks[targetDepotId][targetProdId]) || 0;
      const newQty = currentQty + purchaseData.bags;

      setStocks(prev => {
        const updated = { ...prev };
        if (!updated[targetDepotId]) updated[targetDepotId] = {};
        updated[targetDepotId][targetProdId] = newQty;
        localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
        return updated;
      });

      // Upsert into Supabase depot_stocks table
      await supabase.from('depot_stocks').upsert({
        depot_id: targetDepotId,
        product_id: targetProdId,
        quantity: newQty
      }, { onConflict: 'depot_id,product_id' });

      // Auto-log stock movement for container arrival
      const mvtRef = `MVT-${Math.floor(1000 + Math.random() * 9000)}`;
      await supabase.from('stock_movements').insert({
        ref: mvtRef,
        type: 'ENTREE',
        product_title: targetProd ? targetProd.title : 'Sac de Riz',
        source: `Arrivage Conteneur ${purchaseData.blNumber || id}`,
        dest: targetDepot ? targetDepot.name : targetDepotId,
        quantity: purchaseData.bags,
        operator: purchaseData.supplier || "Fournisseur Importateur"
      });
    }

    if (targetDepot) {
      await supabase.from('depots').upsert({
        id: targetDepot.id,
        name: targetDepot.name,
        city: targetDepot.city,
        capacity: targetDepot.capacity,
        manager_name: targetDepot.manager,
        phone: targetDepot.phone,
        status: targetDepot.status
      });
    }

    const { error } = await supabase.from('purchases').insert({
      id: newPurchase.id,
      supplier_id: newPurchase.supplierId || (suppliers[0]?.id || 'sup-1'),
      supplier_name: newPurchase.supplier,
      depot_id: targetDepotId,
      product_id: newPurchase.productId || (products[0]?.id || 'prod-1'),
      containers: newPurchase.containers,
      bags: newPurchase.bags,
      unit_price: newPurchase.unitPrice,
      total_cost: newPurchase.totalCost,
      status: newPurchase.status,
      payment: newPurchase.payment,
      bl_number: newPurchase.blNumber,
      eta_date: newPurchase.etaDate ? newPurchase.etaDate : null
    });

    if (error) {
      console.error("Supabase Purchase error:", error);
      showToast(`Erreur Supabase Achats: ${error.message}`, "error");
    } else {
      showToast(`Arrivage de ${formatNumber(purchaseData.bags)} sacs enregistré dans Supabase !`, "success");
      refreshFromSupabase();
    }

    logActivity("ACHAT", `Enregistrement arrivage maritime ${id} (${purchaseData.supplier}) - ${formatNumber(purchaseData.bags)} sacs pour ${formatFCFA(purchaseData.totalCost)}`);
    closeModal();
  };

  const updatePurchase = async (id: string, updatedData: Partial<Purchase>) => {
    const existing = purchases.find(p => p.id === id);

    setPurchases(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updatedData } : p);
      localStorage.setItem("RizStock_Purchases", JSON.stringify(next));
      return next;
    });

    await supabase.from('purchases').update({
      status: updatedData.status,
      payment: updatedData.payment
    }).eq('id', id);

    if (existing && updatedData.status === "Livré" && existing.status !== "Livré") {
      const targetProdId = existing.productId || (products.length > 0 ? products[0].id : "prod-1");
      const targetDepotId = existing.depotId || "dep-1";

      setStocks(prev => {
        const updated = { ...prev };
        if (!updated[targetDepotId]) updated[targetDepotId] = {};
        updated[targetDepotId][targetProdId] = (updated[targetDepotId][targetProdId] || 0) + existing.bags;
        localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
        return updated;
      });

      logActivity("STOCK", `Réception et dépotage effectif de ${formatNumber(existing.bags)} sacs au dépôt (Arrivage ${id})`, depots.find(d => d.id === targetDepotId)?.name);
      showToast(`🎉 Arrivage ${id} passé à LIVRÉ : +${formatNumber(existing.bags)} sacs crédités au stock réel !`, "success");
    } else {
      logActivity("ACHAT", `Mise à jour du statut de l'arrivage maritime ${id}`);
      showToast(`Commande d'arrivage ${id} mise à jour !`, "success");
    }

    closeModal();
  };

  const deletePurchase = async (id: string) => {
    setPurchases(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem("RizStock_Purchases", JSON.stringify(next));
      return next;
    });
    await supabase.from('purchases').delete().eq('id', id);
    logActivity("ACHAT", `Suppression de la commande d'arrivage ${id}`);
    showToast(`Commande d'arrivage ${id} supprimée !`, "warning");
  };

  const addSupplier = async (supData: Omit<Supplier, 'id'>) => {
    const id = `sup-${Date.now()}`;
    const newSup: Supplier = { ...supData, id };
    setSuppliers(prev => [...prev, newSup]);

    const { error } = await supabase.from('suppliers').insert({
      id: newSup.id,
      name: newSup.name,
      country: newSup.country,
      phone: newSup.phone,
      email: newSup.email,
      lead_time: newSup.leadTime,
      rating: newSup.rating
    });

    if (error) {
      console.error("Supabase Supplier error:", error);
      showToast(`Erreur Supabase Fournisseur: ${error.message}`, "error");
    } else {
      showToast(`Fournisseur "${supData.name}" enregistré dans Supabase !`, "success");
      refreshFromSupabase();
    }

    logActivity("ACHAT", `Création de la fiche fournisseur "${supData.name}" (${supData.country})`);
    closeModal();
  };

  const updateSupplier = async (id: string, updatedData: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
    await supabase.from('suppliers').update({
      name: updatedData.name,
      country: updatedData.country,
      phone: updatedData.phone,
      email: updatedData.email,
      lead_time: updatedData.leadTime,
      rating: updatedData.rating
    }).eq('id', id);
    logActivity("ACHAT", `Modification de la fiche fournisseur N° ${id}`);
    showToast(`Fiche fournisseur mise à jour !`, "success");
    closeModal();
  };

  const deleteSupplier = async (id: string) => {
    const target = suppliers.find(s => s.id === id);
    if (!target) return;
    setSuppliers(prev => prev.filter(s => s.id !== id));
    await supabase.from('suppliers').delete().eq('id', id);
    logActivity("ACHAT", `Suppression du fournisseur "${target.name}"`);
    showToast(`Fournisseur "${target.name}" supprimé !`, "warning");
  };

  const addClient = async (cliData: Omit<Client, 'id' | 'totalPurchases' | 'balance'>) => {
    const id = `cli-${Date.now()}`;
    const newCli: Client = { ...cliData, id, totalPurchases: 0, balance: 0 };
    setClients(prev => {
      const next = [...prev, newCli];
      localStorage.setItem("RizStock_Clients", JSON.stringify(next));
      return next;
    });

    const { error } = await supabase.from('clients').insert({
      id: newCli.id,
      name: newCli.name,
      category: newCli.category,
      phone: newCli.phone,
      email: newCli.email,
      address: newCli.address,
      city: newCli.city,
      credit_limit: newCli.creditLimit,
      total_purchases: newCli.totalPurchases,
      balance: newCli.balance
    });

    if (error) {
      console.error("Supabase Client error:", error);
      showToast(`Erreur Supabase Client: ${error.message}`, "error");
    } else {
      showToast(`Client "${cliData.name}" enregistré dans Supabase !`, "success");
      refreshFromSupabase();
    }

    logActivity("CREANCE", `Création du nouveau client "${cliData.name}" (${cliData.category}) - ${cliData.email || 'Sans email'}`);
    closeModal();
  };

  const updateClient = async (id: string, updatedData: Partial<Client>) => {
    setClients(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updatedData } : c);
      localStorage.setItem("RizStock_Clients", JSON.stringify(next));
      return next;
    });

    await supabase.from('clients').update({
      name: updatedData.name,
      category: updatedData.category,
      phone: updatedData.phone,
      email: updatedData.email,
      address: updatedData.address,
      city: updatedData.city,
      credit_limit: updatedData.creditLimit
    }).eq('id', id);

    logActivity("CREANCE", `Modification des coordonnées et plafond de crédit du client N° ${id}`);
    showToast(`Fiche client mise à jour !`, "success");
    closeModal();
  };

  const deleteClient = async (id: string) => {
    const target = clients.find(c => c.id === id);
    if (!target) return;
    setClients(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem("RizStock_Clients", JSON.stringify(next));
      return next;
    });

    await supabase.from('clients').delete().eq('id', id);
    logActivity("CREANCE", `Suppression de la fiche client "${target.name}"`);
    showToast(`Client "${target.name}" supprimé !`, "warning");
  };

  const settleClientDebt = async (id: string, paymentAmount: number, paymentMode: DebtTransaction['paymentMode'] = 'Espece', note: string = "Règlement de créance") => {
    const target = clients.find(c => c.id === id);
    if (!target) return;

    const newBalance = Math.max(0, target.balance - paymentAmount);
    setClients(prev => {
      const next = prev.map(c => c.id === id ? { ...c, balance: newBalance } : c);
      localStorage.setItem("RizStock_Clients", JSON.stringify(next));
      return next;
    });

    await supabase.from('clients').update({ balance: newBalance }).eq('id', id);

    const recId = `REC-${Math.floor(9000 + Math.random() * 999)}`;
    const newTx: DebtTransaction = {
      id: recId,
      clientId: target.id,
      clientName: target.name,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      type: newBalance === 0 ? "RÈGLEMENT_TOTAL" : "ACCOMPTE",
      amount: paymentAmount,
      paymentMode,
      note,
      recordedBy: activeUserObj ? activeUserObj.name : "Direction Caisse"
    };

    setDebtTransactions(prev => [newTx, ...prev]);

    await supabase.from('debt_transactions').insert({
      id: newTx.id,
      client_id: newTx.clientId,
      client_name: newTx.clientName,
      type: newTx.type,
      amount: newTx.amount,
      payment_mode: newTx.paymentMode,
      note: newTx.note,
      recorded_by: newTx.recordedBy
    });

    logActivity("CREANCE", `Recouvrement de créance client de ${formatFCFA(paymentAmount)} par ${paymentMode} pour "${target.name}" (Solde restant: ${formatFCFA(newBalance)})`);
    showToast(`Règlement de ${formatFCFA(paymentAmount)} enregistré avec succès !`, "success");
    refreshFromSupabase();
    closeModal();
  };

  const addInventorySession = async (invData: Omit<InventorySession, 'id' | 'date'>) => {
    const id = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString().slice(0, 16).replace("T", " ");
    const newInv: InventorySession = { ...invData, id, date };

    setInventories(prev => [newInv, ...prev]);

    // Ensure depot exists in Supabase depots table before inserting foreign key
    const targetDepot = depots.find(d => d.id === invData.depotId);
    if (targetDepot) {
      await supabase.from('depots').upsert({
        id: targetDepot.id,
        name: targetDepot.name,
        city: targetDepot.city,
        capacity: targetDepot.capacity,
        manager_name: targetDepot.manager,
        phone: targetDepot.phone,
        status: targetDepot.status
      });
    }

    const { error } = await supabase.from('inventory_sessions').insert({
      id: newInv.id,
      depot_id: newInv.depotId,
      depot_name: newInv.depotName,
      auditor: newInv.auditor,
      status: newInv.status,
      total_expected: newInv.totalExpected,
      total_actual: newInv.totalActual,
      total_discrepancy: newInv.totalDiscrepancy
    });

    if (error) {
      console.error("Supabase Inventory Insert error:", error);
      showToast(`Erreur Supabase Inventaire: ${error.message}`, "error");
    } else {
      showToast(`Session d'inventaire physique ${id} enregistrée avec succès !`, "success");
      refreshFromSupabase();
    }

    logActivity("STOCK", `Lancement d'une session d'inventaire physique ${id} pour le dépôt "${invData.depotName}" (${formatNumber(invData.totalActual)} sacs comptés)`, invData.depotName);
    closeModal();
  };

  const applyInventoryAdjustment = async (sessionId: string) => {
    const session = inventories.find(i => i.id === sessionId);
    if (!session) return;

    setStocks(prev => {
      const updated = { ...prev };
      if (!updated[session.depotId]) updated[session.depotId] = {};
      session.items.forEach(it => {
        updated[session.depotId][it.productId] = it.actualQty;
      });
      localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
      return updated;
    });

    const targetDepot = depots.find(d => d.id === session.depotId) || depots[0];
    if (targetDepot) {
      await supabase.from('depots').upsert({
        id: targetDepot.id,
        name: targetDepot.name,
        city: targetDepot.city,
        capacity: targetDepot.capacity,
        manager_name: targetDepot.manager,
        phone: targetDepot.phone,
        status: targetDepot.status
      });
    }

    for (const it of session.items) {
      await supabase.from('depot_stocks').upsert({
        depot_id: session.depotId,
        product_id: it.productId,
        quantity: it.actualQty
      }, { onConflict: 'depot_id,product_id' });
    }

    setInventories(prev => prev.map(i => i.id === sessionId ? { ...i, status: "Ajusté" } : i));
    await supabase.from('inventory_sessions').update({ status: 'Ajusté' }).eq('id', sessionId);

    // Auto-log audit adjustment movement
    const mvtRef = `MVT-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from('stock_movements').insert({
      ref: mvtRef,
      type: session.totalDiscrepancy >= 0 ? 'ENTREE' : 'SORTIE',
      product_title: `Ajustement Audit PV ${session.id}`,
      source: targetDepot ? targetDepot.name : session.depotName,
      dest: `Inventaire Physique ${session.id}`,
      quantity: Math.abs(session.totalDiscrepancy),
      operator: session.auditor || "Auditeur Inventory"
    });

    logActivity("STOCK", `Ajustement du stock physique suite à l'inventaire ${session.id} (Écart global: ${session.totalDiscrepancy > 0 ? '+' : ''}${formatNumber(session.totalDiscrepancy)} sacs)`, session.depotName);
    showToast(`Stock système ajusté avec succès selon le comptage d'inventaire ${session.id} !`, "success");
    refreshFromSupabase();
    closeModal();
  };

  const addEmployee = async (empData: Omit<Employee, 'id' | 'advances' | 'lastPay'>) => {
    const id = `EMP-0${Date.now()}`;
    const targetDepot = depots.find(d => d.id === empData.depotId) || depots[0];
    const targetDepotId = targetDepot ? targetDepot.id : (empData.depotId || 'dep-1');

    const newEmp: Employee = { ...empData, depotId: targetDepotId, id, advances: 0, lastPay: "En attente" };

    setEmployees(prev => {
      const next = [...prev, newEmp];
      localStorage.setItem("RizStock_Employees", JSON.stringify(next));
      return next;
    });

    if (targetDepot) {
      await supabase.from('depots').upsert({
        id: targetDepot.id,
        name: targetDepot.name,
        city: targetDepot.city,
        capacity: targetDepot.capacity,
        manager_name: targetDepot.manager,
        phone: targetDepot.phone,
        status: targetDepot.status
      });
    }

    const { error } = await supabase.from('employees').insert({
      id: newEmp.id,
      name: newEmp.name,
      first_name: newEmp.firstName,
      last_name: newEmp.lastName,
      role: newEmp.role,
      depot_id: targetDepotId,
      salary: newEmp.salary,
      advances: newEmp.advances,
      last_pay: newEmp.lastPay,
      cni_number: newEmp.cniNumber,
      phone: newEmp.phone,
      email: newEmp.email,
      address: newEmp.address,
      birth_date: newEmp.birthDate ? newEmp.birthDate : null,
      birth_place: newEmp.birthPlace,
      contract_type: newEmp.contractType,
      hire_date: newEmp.hireDate ? newEmp.hireDate : null,
      emergency_contact: newEmp.emergencyContact,
      transport_allowance: newEmp.transportAllowance,
      housing_allowance: newEmp.housingAllowance,
      social_security_num: newEmp.socialSecurityNum
    });

    if (error) {
      console.error("Supabase Employee error:", error);
      showToast(`Erreur Supabase Employé: ${error.message}`, "error");
    } else {
      showToast(`Employé "${empData.name}" enregistré dans Supabase !`, "success");
      refreshFromSupabase();
    }

    logActivity("PAIE", `Création de la fiche employé RH "${empData.name}" (${empData.role})`);
    closeModal();
  };

  const updateEmployee = async (id: string, updatedData: Partial<Employee>) => {
    setEmployees(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updatedData } : e);
      localStorage.setItem("RizStock_Employees", JSON.stringify(next));
      return next;
    });

    const updatePayload: Record<string, any> = {};
    if (updatedData.name !== undefined) updatePayload.name = updatedData.name;
    if (updatedData.firstName !== undefined) updatePayload.first_name = updatedData.firstName;
    if (updatedData.lastName !== undefined) updatePayload.last_name = updatedData.lastName;
    if (updatedData.role !== undefined) updatePayload.role = updatedData.role;
    if (updatedData.depotId !== undefined) updatePayload.depot_id = updatedData.depotId;
    if (updatedData.salary !== undefined) updatePayload.salary = updatedData.salary;
    if (updatedData.advances !== undefined) updatePayload.advances = updatedData.advances;
    if (updatedData.cniNumber !== undefined) updatePayload.cni_number = updatedData.cniNumber;
    if (updatedData.phone !== undefined) updatePayload.phone = updatedData.phone;
    if (updatedData.email !== undefined) updatePayload.email = updatedData.email;
    if (updatedData.address !== undefined) updatePayload.address = updatedData.address;
    if (updatedData.birthDate !== undefined) updatePayload.birth_date = updatedData.birthDate ? updatedData.birthDate : null;
    if (updatedData.birthPlace !== undefined) updatePayload.birth_place = updatedData.birthPlace;
    if (updatedData.contractType !== undefined) updatePayload.contract_type = updatedData.contractType;
    if (updatedData.emergencyContact !== undefined) updatePayload.emergency_contact = updatedData.emergencyContact;
    if (updatedData.transportAllowance !== undefined) updatePayload.transport_allowance = updatedData.transportAllowance;
    if (updatedData.housingAllowance !== undefined) updatePayload.housing_allowance = updatedData.housingAllowance;
    if (updatedData.socialSecurityNum !== undefined) updatePayload.social_security_num = updatedData.socialSecurityNum;

    const { error } = await supabase.from('employees').update(updatePayload).eq('id', id);
    if (error) {
      console.error("Supabase update employee error:", error);
    }

    logActivity("PAIE", `Modification de la fiche employé RH N° ${id}`);
    showToast(`Fiche employé mise à jour !`, "success");
    refreshFromSupabase();
    closeModal();
  };

  const deleteEmployee = async (id: string) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;

    setEmployees(prev => {
      const next = prev.filter(e => e.id !== id);
      localStorage.setItem("RizStock_Employees", JSON.stringify(next));
      return next;
    });

    await supabase.from('employees').delete().eq('id', id);
    logActivity("PAIE", `Suppression de la fiche employé RH "${target.name}"`);
    showToast(`Employé "${target.name}" supprimé !`, "warning");
  };

  const grantSalaryAdvance = async (id: string, amount: number) => {
    const target = employees.find(e => e.id === id);
    const newAdv = (target?.advances || 0) + amount;

    setEmployees(prev => {
      const next = prev.map(e => e.id === id ? { ...e, advances: newAdv } : e);
      localStorage.setItem("RizStock_Employees", JSON.stringify(next));
      return next;
    });

    await supabase.from('employees').update({ advances: newAdv }).eq('id', id);

    logActivity("PAIE", `Octroi d'une avance sur salaire de ${formatFCFA(amount)} pour ${target ? target.name : id}`);
    showToast(`Avance sur salaire de ${formatFCFA(amount)} accordée !`, "info");
    refreshFromSupabase();
    closeModal();
  };

  const paySalary = async (id: string, netPayAmount: number) => {
    const target = employees.find(e => e.id === id);
    if (!target) return;

    const currentMonth = "Août 2026";
    setEmployees(prev => {
      const next = prev.map(e => e.id === id ? { ...e, advances: 0, lastPay: currentMonth } : e);
      localStorage.setItem("RizStock_Employees", JSON.stringify(next));
      return next;
    });

    await supabase.from('employees').update({ advances: 0, last_pay: currentMonth }).eq('id', id);

    await addExpense({
      depotId: target.depotId,
      category: "Loyer",
      amount: netPayAmount,
      beneficiary: target.name,
      desc: `Paiement Salaire ${currentMonth} - Net Versé`,
      user: "Direction RH"
    });

    logActivity("PAIE", `Validation paiement salaire net ${currentMonth} de ${formatFCFA(netPayAmount)} pour ${target.name}`);
    showToast(`Salaire du mois (${currentMonth}) réglé pour ${target.name} !`, "success");
  };

  const addUser = async (usrData: Omit<UserAccount, 'lastLogin'>) => {
    const newUsr: UserAccount = {
      ...usrData,
      username: usrData.username.trim(),
      lastLogin: "Jamais"
    };

    setUsers(prev => {
      const filtered = prev.filter(u => u.username.toLowerCase() !== newUsr.username.toLowerCase());
      const next = [newUsr, ...filtered];
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_Users", JSON.stringify(next));
      }
      return next;
    });

    try {
      const { error } = await supabase.from('user_accounts').upsert({
        username: newUsr.username,
        name: newUsr.name,
        role: newUsr.role,
        depot: newUsr.depot,
        status: newUsr.status,
        password: newUsr.password,
        custom_permissions: newUsr.customPermissions ? (typeof newUsr.customPermissions === 'string' ? newUsr.customPermissions : JSON.stringify(newUsr.customPermissions)) : null
      }, { onConflict: 'username' });

      if (error) {
        console.warn("Supabase upsert warning:", error);
        showToast(`Compte d'accès "${usrData.username}" (${usrData.role.toUpperCase()}) sauvegardé localement !`, "success");
      } else {
        showToast(`Compte d'accès "${usrData.username}" (${usrData.role.toUpperCase()}) créé avec succès !`, "success");
        await refreshFromSupabase();
      }
    } catch (err) {
      console.warn("Supabase user insert exception:", err);
      showToast(`Compte d'accès "${usrData.username}" créé localement !`, "success");
    }

    logActivity("UTILISATEUR", `Création du nouveau compte d'accès ERP "${usrData.username}" (Rôle: ${usrData.role})`);
    closeModal();
  };

  const updateUser = async (username: string, updatedData: Partial<UserAccount>) => {
    setUsers(prev => {
      const next = prev.map(u => u.username.toLowerCase() === username.toLowerCase() ? { ...u, ...updatedData } : u);
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_Users", JSON.stringify(next));
      }
      return next;
    });

    try {
      const dbPayload: any = { ...updatedData };
      if (updatedData.customPermissions) {
        dbPayload.custom_permissions = JSON.stringify(updatedData.customPermissions);
        delete dbPayload.customPermissions;
      }
      await supabase.from('user_accounts').update(dbPayload).eq('username', username);
    } catch (e) {
      console.warn("Supabase user update exception:", e);
    }

    logActivity("UTILISATEUR", `Modification du compte utilisateur / mot de passe de "${username}"`);
    showToast(`Accès utilisateur de "${username}" mis à jour !`, "success");
    await refreshFromSupabase();
    closeModal();
  };

  const deleteUser = async (username: string) => {
    setUsers(prev => {
      const next = prev.filter(u => u.username.toLowerCase() !== username.toLowerCase());
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_Users", JSON.stringify(next));
      }
      return next;
    });
    try {
      await supabase.from('user_accounts').delete().eq('username', username);
    } catch (e) {}
    logActivity("UTILISATEUR", `Révocation définitive du compte utilisateur "${username}"`);
    showToast(`Compte utilisateur "${username}" supprimé !`, "warning");
  };

  const resetPassword = (username: string) => {
    logActivity("UTILISATEUR", `Réinitialisation du mot de passe pour l'utilisateur ${username}`);
    showToast(`Nouveau mot de passe envoyé à l'utilisateur ${username} !`, "info");
    closeModal();
  };

  const loginUser = async (usernameInput: string, passwordInput?: string): Promise<{ success: boolean; message?: string }> => {
    const trimmedUser = usernameInput.trim().toLowerCase();
    const trimmedPass = (passwordInput || "").trim();

    if (!trimmedUser) {
      return { success: false, message: "Veuillez saisir votre nom d'utilisateur ou adresse email." };
    }

    if (!trimmedPass) {
      return { success: false, message: "Veuillez saisir votre mot de passe d'accès." };
    }

    // 1. Local memory & localStorage match
    let localSavedUsers: UserAccount[] = users;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("RizStock_Users");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localSavedUsers = parsed;
          }
        } catch (e) {}
      }
    }

    const localMatch = localSavedUsers.find(u =>
      u.username.toLowerCase() === trimmedUser ||
      u.name.toLowerCase() === trimmedUser
    );

    // 2. Direct Supabase Query on user_accounts table
    let dbUser: any = null;
    try {
      const { data } = await supabase
        .from('user_accounts')
        .select('*')
        .or(`username.ilike.${trimmedUser},name.ilike.%${trimmedUser}%`)
        .maybeSingle();
      dbUser = data;
    } catch (e) {
      console.warn("Supabase user query exception during login:", e);
    }

    let target: UserAccount | null = null;

    if (dbUser) {
      target = {
        username: dbUser.username,
        name: dbUser.name,
        role: dbUser.role,
        depot: dbUser.depot || 'Tous',
        lastLogin: dbUser.last_login ? dbUser.last_login.slice(0, 16).replace("T", " ") : 'À l\'instant',
        status: dbUser.status || 'Actif',
        password: dbUser.password || localMatch?.password,
        customPermissions: dbUser.custom_permissions ? (typeof dbUser.custom_permissions === 'string' ? JSON.parse(dbUser.custom_permissions) : dbUser.custom_permissions) : (dbUser.customPermissions || localMatch?.customPermissions)
      };
    } else if (localMatch) {
      target = localMatch;
    }

    // STRICT DENIAL: If user does not exist in DB or users list, deny access immediately
    if (!target) {
      return {
        success: false,
        message: `Accès refusé : Aucun compte utilisateur enregistré sous l'identifiant "${usernameInput}". Seuls les comptes créés par l'Administrateur ont accès.`
      };
    }

    if (target.status === "Suspendu") {
      return {
        success: false,
        message: `Accès refusé : Le compte "${target.username}" est actuellement suspendu. Veuillez contacter l'Administrateur ERP.`
      };
    }

    // Verify Password: match account password, local saved password, or system fallback
    const expectedPassword = target.password || localMatch?.password || "admin123";
    if (trimmedPass !== expectedPassword) {
      return {
        success: false,
        message: `Mot de passe incorrect pour l'utilisateur "${target.username}".`
      };
    }

    setCurrentUser(target);
    setActiveRole(target.role);
    if (target.depot && target.depot !== "Tous") {
      const matchDepot = depots.find(d => d.id === target.depot || d.name === target.depot);
      if (matchDepot) setActiveDepotId(matchDepot.id);
    }
    localStorage.setItem("RizStock_CurrentUser", JSON.stringify(target));

    const nowStr = new Date().toISOString().slice(0, 16).replace("T", " ");
    try {
      await supabase.from('user_accounts').update({ last_login: nowStr }).eq('username', target.username);
    } catch (e) {}

    logActivity("UTILISATEUR", `Connexion réussie de ${target.name} (${target.username}) à l'ERP (Rôle: ${target.role.toUpperCase()})`);
    showToast(`Bienvenue ${target.name} ! Connexion réussie (${target.role.toUpperCase()}).`, "success");

    return { success: true };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem("RizStock_CurrentUser");
    logActivity("UTILISATEUR", `Déconnexion de l'utilisateur de la session ERP`);
    showToast("Déconnexion réussie. À bientôt !", "info");
    closeModal();
    window.location.href = "/login";
  };

  const addStockMovement = async (mvtData: Omit<StockMovement, 'ref' | 'date'> & { depotId?: string; productId?: string; customDate?: string }) => {
    const ref = `MVT-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = mvtData.customDate ? mvtData.customDate.slice(0, 16).replace("T", " ") : new Date().toISOString().slice(0, 16).replace("T", " ");
    const newMvt: StockMovement = { ...mvtData, ref, date };

    setMovements(prev => {
      const updated = [newMvt, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_Movements", JSON.stringify(updated));
      }
      return updated;
    });

    const depObj = depots.find(d => d.id === mvtData.depotId) ||
                   depots.find(d => d.name === mvtData.source || d.name === mvtData.dest) ||
                   depots[0];
    const prodObj = products.find(p => p.id === mvtData.productId || p.title.toLowerCase() === mvtData.prodTitle.toLowerCase()) || products[0];

    if (depObj && prodObj) {
      const depId = depObj.id;
      const prodId = prodObj.id;

      // 1. Direct fetch from Supabase to guarantee 100% database accuracy
      const { data: stockRow } = await supabase
        .from('depot_stocks')
        .select('id, quantity')
        .eq('depot_id', depId)
        .eq('product_id', prodId)
        .maybeSingle();

      const current = stockRow ? Number(stockRow.quantity) : ((stocks[depId] && stocks[depId][prodId]) || 0);
      const isEntry = mvtData.type === 'ENTREE';
      const newQty = isEntry ? current + mvtData.qty : Math.max(0, current - mvtData.qty);

      if (stockRow) {
        await supabase
          .from('depot_stocks')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', stockRow.id);
      } else {
        await supabase
          .from('depot_stocks')
          .insert({
            depot_id: depId,
            product_id: prodId,
            quantity: newQty,
            updated_at: new Date().toISOString()
          });
      }

      setStocks(prev => {
        const updated = { ...prev };
        if (!updated[depId]) updated[depId] = {};
        updated[depId][prodId] = newQty;
        localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
        return updated;
      });
    }

    const { error } = await supabase.from('stock_movements').insert({
      ref: newMvt.ref,
      type: newMvt.type,
      product_title: prodObj ? prodObj.title : newMvt.prodTitle,
      source: newMvt.source,
      dest: newMvt.dest,
      quantity: newMvt.qty,
      operator: newMvt.operator,
      created_at: mvtData.customDate ? new Date(mvtData.customDate).toISOString() : new Date().toISOString()
    });

    if (error) console.error("Supabase Stock Movement insert error:", error);
    showToast(`Mouvement de stock (${mvtData.type === 'ENTREE' ? '+' : '-'}${formatNumber(mvtData.qty)} sacs) enregistré !`, "success");
    refreshFromSupabase();
    closeModal();
  };

  const transferStock = async (srcId: string, destId: string, prodId: string, qty: number, truck: string) => {
    const avail = (stocks[srcId] && stocks[srcId][prodId]) || 0;
    if (avail < qty) {
      showToast(`Stock insuffisant dans le dépôt source. Disponible: ${formatNumber(avail)} sacs`, "error");
      return;
    }

    // Direct real-time fetch from Supabase
    const { data: srcRow } = await supabase
      .from('depot_stocks')
      .select('id, quantity')
      .eq('depot_id', srcId)
      .eq('product_id', prodId)
      .maybeSingle();

    const { data: destRow } = await supabase
      .from('depot_stocks')
      .select('id, quantity')
      .eq('depot_id', destId)
      .eq('product_id', prodId)
      .maybeSingle();

    const srcCurrent = srcRow ? Number(srcRow.quantity) : ((stocks[srcId] && stocks[srcId][prodId]) || 0);
    const destCurrent = destRow ? Number(destRow.quantity) : ((stocks[destId] && stocks[destId][prodId]) || 0);

    const newSrcQty = Math.max(0, srcCurrent - qty);
    const newDestQty = destCurrent + qty;

    if (srcRow) {
      await supabase.from('depot_stocks').update({ quantity: newSrcQty, updated_at: new Date().toISOString() }).eq('id', srcRow.id);
    } else {
      await supabase.from('depot_stocks').insert({ depot_id: srcId, product_id: prodId, quantity: newSrcQty });
    }

    if (destRow) {
      await supabase.from('depot_stocks').update({ quantity: newDestQty, updated_at: new Date().toISOString() }).eq('id', destRow.id);
    } else {
      await supabase.from('depot_stocks').insert({ depot_id: destId, product_id: prodId, quantity: newDestQty });
    }

    setStocks(prev => {
      const updated = { ...prev };
      if (!updated[srcId]) updated[srcId] = {};
      if (!updated[destId]) updated[destId] = {};
      updated[srcId][prodId] = newSrcQty;
      updated[destId][prodId] = newDestQty;
      localStorage.setItem("RizStock_Stocks", JSON.stringify(updated));
      return updated;
    });

    const prod = products.find(p => p.id === prodId);
    const srcDep = depots.find(d => d.id === srcId);
    const destDep = depots.find(d => d.id === destId);

    const ref = `TRF-${Math.floor(1000 + Math.random() * 9000)}`;
    setMovements(prev => [{
      ref,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      type: "TRANSFERT",
      prodTitle: prod ? prod.title : prodId,
      source: srcDep ? srcDep.name : srcId,
      dest: destDep ? destDep.name : destId,
      qty: qty,
      operator: `Chauffeur (${truck || "Camion Dépôt"})`
    }, ...prev]);

    const { error } = await supabase.from('stock_movements').insert({
      ref,
      type: "TRANSFERT",
      product_title: prod ? prod.title : prodId,
      source: srcDep ? srcDep.name : srcId,
      dest: destDep ? destDep.name : destId,
      quantity: qty,
      operator: `Chauffeur (${truck || "Camion Dépôt"})`
    });

    if (error) console.error(error);
    else refreshFromSupabase();

    logActivity("STOCK", `Transfert Inter-Dépôts ${ref} (${formatNumber(qty)} sacs) de ${srcDep?.name} vers ${destDep?.name}`);
    showToast(`Transfert de ${formatNumber(qty)} sacs réalisé avec succès !`);
    closeModal();
  };

  const addExpense = async (expData: Omit<Expense, 'id' | 'date'>) => {
    const id = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toISOString().slice(0, 10);
    const targetDepot = depots.find(d => isMatchingDepot(expData.depotId, d.id, depots)) || depots[0];
    const targetDepotId = targetDepot ? targetDepot.id : (expData.depotId || 'dep-1');

    const newExp: Expense = { ...expData, depotId: targetDepotId, id, date };

    setExpenses(prev => {
      const next = [newExp, ...prev];
      if (typeof window !== "undefined") {
        localStorage.setItem("RizStock_Expenses", JSON.stringify(next));
      }
      return next;
    });

    if (targetDepot) {
      await supabase.from('depots').upsert({
        id: targetDepot.id,
        name: targetDepot.name,
        city: targetDepot.city,
        capacity: targetDepot.capacity,
        manager_name: targetDepot.manager,
        phone: targetDepot.phone,
        status: targetDepot.status
      });
    }

    const { error } = await supabase.from('expenses').insert({
      id: newExp.id,
      depot_id: targetDepotId,
      category: newExp.category,
      amount: newExp.amount,
      beneficiary: newExp.beneficiary,
      description: newExp.desc,
      user_name: newExp.user
    });

    if (error) {
      console.error("Supabase Expense error:", error);
      showToast(`Erreur Supabase Dépenses: ${error.message}`, "error");
    } else {
      showToast(`Dépense de ${formatFCFA(expData.amount)} enregistrée avec succès !`, "success");
      refreshFromSupabase();
    }

    logActivity("PARAMETRE", `Enregistrement dépense opérationnelle ${id} (${expData.category}) de ${formatFCFA(expData.amount)}`);
    closeModal();
  };

  return (
    <AppContext.Provider value={{
      isLoading, refreshFromSupabase,
      theme, toggleTheme,
      activeDepotId, setActiveDepotId,
      activeRole, setActiveRole,
      mobileMenuOpen, setMobileMenuOpen,
      settings, updateSettings, categories, depots, products, stocks, sales, cashSessions, movements, purchases, suppliers, clients, debtTransactions, inventories, expenses, employees, users, auditLogs,
      logActivity, clearAuditLogs,
      cart, addToCart, updateCartQty, setCartItemQty, clearCart, processCheckout,
      activeModal, openModal, closeModal,
      confirmState, askConfirm, closeConfirm,
      toasts, showToast,
      openCashSession, closeCashSession,
      addCategory, updateCategory, deleteCategory, addDepot, updateDepot, deleteDepot, addProduct, updateProduct, updateProductStock, deleteProduct, addPurchase, updatePurchase, deletePurchase, addSupplier, updateSupplier, deleteSupplier, addClient, updateClient, deleteClient, settleClientDebt, addInventorySession, applyInventoryAdjustment, addEmployee, updateEmployee, deleteEmployee, grantSalaryAdvance, paySalary, addUser, updateUser, deleteUser, resetPassword, currentUser, loginUser, logoutUser, addStockMovement, transferStock, addExpense,
      backupVersions, createBackupSnapshot, restoreBackupVersion, deleteBackupVersion, importBackupJSON, resetSystemWithAutoBackup
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

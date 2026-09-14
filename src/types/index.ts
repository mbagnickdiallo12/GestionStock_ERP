export interface Depot {
  id: string;
  name: string;
  city: string;
  capacity: number;
  manager: string;
  phone: string;
  status: 'Actif' | 'Inactif' | 'Maintenance';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color?: string;
}

export interface Product {
  id: string;
  code: string;
  title: string;
  category: string; // Dynamic category slug/id
  weight: number; // e.g., 50kg, 25kg
  buyPrice: number; // in FCFA
  sellPrice: number; // in FCFA
  alertThreshold: number;
  imageUrl?: string;
}

export interface StockMatrix {
  [depotId: string]: {
    [productId: string]: number; // quantity of bags
  };
}

export interface SaleItem {
  productId: string;
  title: string;
  qty: number;
  price: number;
}

export interface Sale {
  id: string; // e.g. FAC-2026-0089
  date: string;
  depotId: string;
  clientName: string;
  items: SaleItem[];
  totalAmount: number; // FCFA
  paymentMode: 'Espece' | 'Wave' | 'Virement' | 'Cheque' | 'Credit';
  status: 'Payé' | 'En attente' | 'Annulé';
}

export interface CashSession {
  id: string;
  date: string;
  depotId: string;
  depotName: string;
  cashierName: string;
  openingBalance: number;
  cashSales: number;
  waveSales: number;
  chequeSales: number;
  virementSales: number;
  creditSales: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash: number;
  cashDiscrepancy: number;
  status: 'Ouverte' | 'Clôturée';
}

export interface StockMovement {
  ref: string;
  date: string;
  type: 'ENTREE' | 'SORTIE' | 'TRANSFERT';
  prodTitle: string;
  source: string;
  dest: string;
  qty: number;
  operator: string;
}

export interface Purchase {
  id: string; // e.g. ACH-2026-042
  date: string;
  supplier: string;
  supplierId?: string;
  depotId: string;
  depotName?: string;
  productId?: string;
  productTitle?: string;
  containers: string; // e.g. "10 Conteneurs (40ft)"
  bags: number;       // total bags e.g. 5400
  unitPrice?: number; // unit buy price per bag (FCFA)
  totalCost: number;  // total cost (FCFA)
  status: 'Livré' | 'En Transit' | 'Commandé' | 'Dédouanement';
  payment: 'Payé' | 'Acompte 50%' | 'En attente';
  blNumber?: string;  // Bill of Lading (BL) / N° Connaissement Maritime
  etaDate?: string;   // Estimated Date of Arrival (ETA Port)
  receivedBags?: number; // Actually received bags
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  phone: string;
  email: string;
  leadTime: string;
  rating: string;
}

export interface Client {
  id: string;
  name: string;
  category: 'Grossiste Majeur' | 'Demi-Grossiste' | 'Détaillant';
  phone: string;
  email?: string;
  address?: string;
  city: string;
  creditLimit?: number; // Plafond de crédit autorisé en FCFA
  totalPurchases: number;
  balance: number; // Outstanding balance in FCFA
}

export interface DebtTransaction {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  type: 'ACCOMPTE' | 'RÈGLEMENT_TOTAL';
  amount: number;
  paymentMode: 'Espece' | 'Wave' | 'Virement' | 'Cheque';
  note: string;
  recordedBy: string;
}

export interface InventoryItem {
  productId: string;
  productTitle: string;
  expectedQty: number;
  actualQty: number;
  discrepancy: number;
  note?: string;
}

export interface InventorySession {
  id: string;
  date: string;
  depotId: string;
  depotName: string;
  auditor: string;
  status: 'En cours' | 'Clôturé' | 'Ajusté';
  items: InventoryItem[];
  totalExpected: number;
  totalActual: number;
  totalDiscrepancy: number;
}

export interface Expense {
  id: string;
  date: string;
  depotId: string;
  category: 'Manutention' | 'Transport' | 'Loyer' | 'Electricite' | 'Gardiennage' | 'Autre';
  amount: number;
  beneficiary: string;
  desc: string;
  user: string;
}

export interface Employee {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  depotId: string;
  salary: number;
  advances: number;
  lastPay: string;

  // Detailed HR Dossier
  cniNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  birthPlace?: string;
  contractType?: 'CDI' | 'CDD' | 'Prestataire / Journalier' | 'Stage';
  hireDate?: string;
  emergencyContact?: string;
  transportAllowance?: number;
  housingAllowance?: number;
  socialSecurityNum?: string;
}

export interface UserAccount {
  username: string;
  name: string;
  role: 'admin' | 'gerant' | 'caissier' | 'comptable' | 'personnalise';
  depot: string;
  lastLogin: string;
  status: 'Actif' | 'Suspendu';
  password?: string;
  customPermissions?: string[];
}

export interface CompanySettings {
  companyName: string;
  currency: string;
  vatRate: number;
  minAlertDefault: number;
  phone: string;
  address: string;
  rccm: string;
  ninea?: string;
  email?: string;
  slogan?: string;
  logoUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: 'VENTE' | 'STOCK' | 'CREANCE' | 'PAIE' | 'ACHAT' | 'UTILISATEUR' | 'PARAMETRE';
  description: string;
  ipAddress: string;
  depotName: string;
}

export interface BackupVersion {
  id: string;
  timestamp: string;
  label: string;
  type: 'auto_reset' | 'manual_export' | 'manual_upload';
  depotsCount: number;
  productsCount: number;
  salesCount: number;
  totalRevenue: number;
  data: {
    settings?: CompanySettings;
    categories?: Category[];
    depots?: Depot[];
    products?: Product[];
    stocks?: StockMatrix;
    sales?: Sale[];
    expenses?: Expense[];
    clients?: Client[];
    suppliers?: Supplier[];
    employees?: Employee[];
    users?: UserAccount[];
    purchases?: Purchase[];
    inventories?: InventorySession[];
    cashSessions?: CashSession[];
    movements?: StockMovement[];
    debtTransactions?: DebtTransaction[];
  };
}

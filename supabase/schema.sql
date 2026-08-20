-- ==============================================================================
-- 🌾 RizStock ERP — Schema de Base de Données Supabase / PostgreSQL Complet
-- ==============================================================================

-- 1. PARAMÈTRES ENTREPRISE
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'GRANDS MOULINS & DÉPÔTS DE RIZ DU SÉNÉGAL (GDRS)',
  currency TEXT DEFAULT 'FCFA',
  vat_rate NUMERIC DEFAULT 0,
  min_alert_default INT DEFAULT 500,
  phone TEXT DEFAULT '+221 33 824 50 50',
  address TEXT DEFAULT 'Zone Industrielle de Dakar, Route du Front de Terre, Dakar',
  rccm TEXT DEFAULT 'SN-DKR-2023-B-89421',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATÉGORIES DE PRODUITS
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DÉPÔTS DE RIZ
CREATE TABLE IF NOT EXISTS depots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 50000,
  manager_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Actif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATALOGUE PRODUITS
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE,
  weight INT NOT NULL DEFAULT 50,
  buy_price NUMERIC NOT NULL,
  sell_price NUMERIC NOT NULL,
  alert_threshold INT DEFAULT 500,
  image_url TEXT DEFAULT '/royal_senegal_bag.jpg',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATRICE DE STOCK PAR DÉPÔT
CREATE TABLE IF NOT EXISTS depot_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  depot_id TEXT REFERENCES depots(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(depot_id, product_id)
);

-- 6. CAISSE & SESSIONS DE CAISSE
CREATE TABLE IF NOT EXISTS cash_sessions (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  depot_id TEXT REFERENCES depots(id),
  depot_name TEXT NOT NULL,
  cashier_name TEXT NOT NULL,
  opening_balance NUMERIC DEFAULT 0,
  cash_sales NUMERIC DEFAULT 0,
  wave_sales NUMERIC DEFAULT 0,
  cheque_sales NUMERIC DEFAULT 0,
  virement_sales NUMERIC DEFAULT 0,
  credit_sales NUMERIC DEFAULT 0,
  total_expenses NUMERIC DEFAULT 0,
  expected_cash NUMERIC DEFAULT 0,
  actual_cash NUMERIC DEFAULT 0,
  cash_discrepancy NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Ouverte' CHECK (status IN ('Ouverte', 'Clôturée'))
);

-- 7. VENTES & FACTURES
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  depot_id TEXT REFERENCES depots(id),
  client_name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('Espece', 'Wave', 'Virement', 'Cheque', 'Credit')),
  status TEXT DEFAULT 'Payé' CHECK (status IN ('Payé', 'En attente', 'Annulé')),
  user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  product_title TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC NOT NULL
);

-- 8. MOUVEMENTS DE STOCK & TRANSFERTS
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('ENTREE', 'SORTIE', 'TRANSFERT')),
  product_title TEXT NOT NULL,
  source TEXT NOT NULL,
  dest TEXT NOT NULL,
  quantity INT NOT NULL,
  operator TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FOURNISSEURS & ACHATS LOGISTIQUE
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  phone TEXT,
  email TEXT,
  lead_time TEXT,
  rating TEXT
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  supplier_id TEXT REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL,
  depot_id TEXT REFERENCES depots(id),
  product_id TEXT REFERENCES products(id),
  containers TEXT NOT NULL,
  bags INT NOT NULL,
  unit_price NUMERIC,
  total_cost NUMERIC NOT NULL,
  status TEXT DEFAULT 'En Transit' CHECK (status IN ('Livré', 'En Transit', 'Commandé', 'Dédouanement')),
  payment TEXT DEFAULT 'En attente' CHECK (payment IN ('Payé', 'Acompte 50%', 'En attente')),
  bl_number TEXT,
  eta_date DATE,
  received_bags INT DEFAULT 0
);

-- 10. CLIENTS & CRÉANCES
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Grossiste Majeur', 'Demi-Grossiste', 'Détaillant')),
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  credit_limit NUMERIC DEFAULT 0,
  total_purchases NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS debt_transactions (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  type TEXT CHECK (type IN ('ACCOMPTE', 'RÈGLEMENT_TOTAL')),
  amount NUMERIC NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('Espece', 'Wave', 'Virement', 'Cheque')),
  note TEXT,
  recorded_by TEXT
);

-- 11. INVENTAIRES PHYSIQUES & AUDIT
CREATE TABLE IF NOT EXISTS inventory_sessions (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  depot_id TEXT REFERENCES depots(id),
  depot_name TEXT NOT NULL,
  auditor TEXT NOT NULL,
  status TEXT DEFAULT 'En cours' CHECK (status IN ('En cours', 'Clôturé', 'Ajusté')),
  total_expected INT DEFAULT 0,
  total_actual INT DEFAULT 0,
  total_discrepancy INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES inventory_sessions(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id),
  product_title TEXT NOT NULL,
  expected_qty INT NOT NULL,
  actual_qty INT NOT NULL,
  discrepancy INT NOT NULL,
  note TEXT
);

-- 12. DÉPENSES OPÉRATIONNELLES
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  depot_id TEXT REFERENCES depots(id),
  category TEXT NOT NULL CHECK (category IN ('Manutention', 'Transport', 'Loyer', 'Electricite', 'Gardiennage', 'Autre')),
  amount NUMERIC NOT NULL,
  beneficiary TEXT,
  description TEXT,
  user_name TEXT
);

-- 13. RESSOURCES HUMAINES & SALAIRES
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL,
  depot_id TEXT REFERENCES depots(id),
  salary NUMERIC NOT NULL,
  advances NUMERIC DEFAULT 0,
  last_pay TEXT,
  cni_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  birth_date DATE,
  birth_place TEXT,
  contract_type TEXT CHECK (contract_type IN ('CDI', 'CDD', 'Prestataire / Journalier', 'Stage')),
  hire_date DATE,
  emergency_contact TEXT,
  transport_allowance NUMERIC DEFAULT 25000,
  housing_allowance NUMERIC DEFAULT 0,
  social_security_num TEXT
);

-- 14. COMPTES UTILISATEURS & RBAC
CREATE TABLE IF NOT EXISTS user_accounts (
  username TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'gerant', 'caissier', 'comptable', 'personnalise')),
  depot TEXT DEFAULT 'Tous',
  last_login TIMESTAMPTZ,
  status TEXT DEFAULT 'Actif',
  password TEXT,
  custom_permissions JSONB DEFAULT '[]'::jsonb
);

-- 15. JOURNAL D'ACTIVITÉS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT CHECK (action IN ('VENTE', 'STOCK', 'CREANCE', 'PAIE', 'ACHAT', 'UTILISATEUR', 'PARAMETRE')),
  description TEXT NOT NULL,
  ip_address TEXT,
  depot_name TEXT
);

-- HABILITATIONS RLS (Public & Authenticated access)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE depots ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE depot_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR FULL INSERT/SELECT/UPDATE/DELETE ACCESS (WITH CHECK)
DROP POLICY IF EXISTS "Access all" ON company_settings;
DROP POLICY IF EXISTS "Access all" ON categories;
DROP POLICY IF EXISTS "Access all" ON depots;
DROP POLICY IF EXISTS "Access all" ON products;
DROP POLICY IF EXISTS "Access all" ON depot_stocks;
DROP POLICY IF EXISTS "Access all" ON cash_sessions;
DROP POLICY IF EXISTS "Access all" ON sales;
DROP POLICY IF EXISTS "Access all" ON sale_items;
DROP POLICY IF EXISTS "Access all" ON stock_movements;
DROP POLICY IF EXISTS "Access all" ON suppliers;
DROP POLICY IF EXISTS "Access all" ON purchases;
DROP POLICY IF EXISTS "Access all" ON clients;
DROP POLICY IF EXISTS "Access all" ON debt_transactions;
DROP POLICY IF EXISTS "Access all" ON inventory_sessions;
DROP POLICY IF EXISTS "Access all" ON inventory_items;
DROP POLICY IF EXISTS "Access all" ON expenses;
DROP POLICY IF EXISTS "Access all" ON employees;
DROP POLICY IF EXISTS "Access all" ON user_accounts;
DROP POLICY IF EXISTS "Access all" ON audit_logs;

CREATE POLICY "Access all" ON company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON depots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON depot_stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON cash_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON debt_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON inventory_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON user_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Access all" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

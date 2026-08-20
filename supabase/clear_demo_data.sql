-- ==============================================================================
-- 🌾 RizStock ERP — Script de Nettoyage / Purge pour Mise en Production Réelle
-- ==============================================================================
-- Ce script supprime toutes les données de démo/test tout en préservant :
-- 1. Les 4 catégories de riz standard
-- 2. Les paramètres d'entreprise
-- 3. Votre compte Administrateur Principal ('mbagnickdiallo')

-- 1. VIDER LES TRANSACTIONS COMMERCIALES ET MOUVEMENTS
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM cash_sessions;
DELETE FROM stock_movements;
DELETE FROM inventory_items;
DELETE FROM inventory_sessions;
DELETE FROM debt_transactions;
DELETE FROM expenses;
DELETE FROM purchases;

-- 2. VIDER LES STOCKS ET DONNÉES DE RÉFÉRENCE DE TEST
DELETE FROM depot_stocks;
DELETE FROM products;
DELETE FROM clients;
DELETE FROM suppliers;
DELETE FROM employees;
DELETE FROM depots;
DELETE FROM audit_logs;

-- 3. PURGER LES UTILISATEURS DE DÉMO ET GARDER L'ADMIN DE PRODUCTION
DELETE FROM user_accounts WHERE username NOT IN ('mbagnickdiallo', 'admin');

-- S'assurer que votre compte mbagnickdiallo est bien créé en tant qu'Administrateur
INSERT INTO user_accounts (username, name, role, depot, last_login, status)
VALUES ('mbagnickdiallo', 'Mbagnick Diallo', 'admin', 'Tous', NOW(), 'Actif')
ON CONFLICT (username) DO UPDATE 
SET role = 'admin', status = 'Actif';

-- 4. RÉINITIALISER LES 4 CATÉGORIES STANDARD DE RIZ
INSERT INTO categories (id, name, slug, description, color) VALUES
('cat-1', 'Riz Parfumé', 'parfume', 'Riz aromatique de luxe importé d''Asie (Inde, Thaïlande, Viêt Nam)', '#10b981'),
('cat-2', 'Riz Brisé 100%', 'brise', 'Riz brisé 100% de grande consommation familiale (Thiéboudienne)', '#3b82f6'),
('cat-3', 'Riz Blanc Non Parfumé', 'blanc', 'Riz blanc grain long ou moyen (Pakistan, Inde, Brésil)', '#8b5cf6'),
('cat-4', 'Riz Local & Étuvé', 'local', 'Riz produit localement en Afrique de l''Ouest (Gambiaka, Vallée du fleuve)', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

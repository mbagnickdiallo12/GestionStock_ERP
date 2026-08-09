-- ==============================================================================
-- 🌾 RizStock ERP — Données Initiales (Seed Script pour Supabase)
-- ==============================================================================

-- 1. INSÉRER LES PARAMÈTRES ENTREPRISE
INSERT INTO company_settings (company_name, currency, vat_rate, min_alert_default, phone, address, rccm)
VALUES (
  'GRANDS MOULINS & DÉPÔTS DE RIZ DU SÉNÉGAL (GDRS)',
  'FCFA',
  0,
  500,
  '+221 33 824 50 50 / +221 77 600 00 00',
  'Zone Industrielle de Dakar, Route du Front de Terre, Dakar - Sénégal',
  'SN-DKR-2023-B-89421'
) ON CONFLICT DO NOTHING;

-- 2. INSÉRER LES CATÉGORIES
INSERT INTO categories (id, name, slug, description, color) VALUES
('cat-1', 'Riz Parfumé', 'parfume', 'Riz aromatique de luxe importé d''Asie (Inde, Thaïlande, Viêt Nam)', '#10b981'),
('cat-2', 'Riz Brisé 100%', 'brise', 'Riz brisé 100% de grande consommation familiale (Thiéboudienne)', '#3b82f6'),
('cat-3', 'Riz Blanc Non Parfumé', 'blanc', 'Riz blanc grain long ou moyen (Pakistan, Inde, Brésil)', '#8b5cf6'),
('cat-4', 'Riz Local & Étuvé', 'local', 'Riz produit localement en Afrique de l''Ouest (Gambiaka, Vallée du fleuve)', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- 3. INSÉRER LES DÉPÔTS DE RIZ
INSERT INTO depots (id, name, city, capacity, manager_name, phone, status) VALUES
('dep-1', 'Dépôt 1 - Dakar Port', 'Dakar Port Nord', 50000, 'Ousmane Ba', '+221 77 555 10 10', 'Actif'),
('dep-2', 'Dépôt 2 - Thiaroye Gare', 'Dakar Banlieue', 30000, 'Ibrahima Ndiaye', '+221 77 444 20 20', 'Actif'),
('dep-3', 'Dépôt 3 - Touba Mosquée', 'Touba Marché Okass', 25000, 'Serigne Modou Sow', '+221 77 333 30 30', 'Actif'),
('dep-4', 'Dépôt 4 - Abidjan Port', 'Abidjan Vridi', 40000, 'Kouassi Kouamé', '+225 07 08 09 10', 'Actif')
ON CONFLICT (id) DO NOTHING;

-- 4. INSÉRER LES PRODUITS DE RIZ
INSERT INTO products (id, code, title, category, weight, buy_price, sell_price, alert_threshold, image_url) VALUES
('prod-1', 'RZ-PF-50', 'Riz Parfumé Luxe (Sac 50kg)', 'parfume', 50, 18500, 22500, 500, '/royal_senegal_bag.jpg'),
('prod-2', 'RZ-BR-50', 'Riz Brisé Non Parfumé 100% (Sac 50kg)', 'brise', 50, 14000, 16500, 400, '/royal_senegal_bag.jpg'),
('prod-3', 'RZ-BL-50', 'Riz Blanc Extra Long Grain (Sac 50kg)', 'blanc', 50, 16000, 19000, 300, '/royal_senegal_bag.jpg'),
('prod-4', 'RZ-PF-25', 'Riz Parfumé Premium (Sac 25kg)', 'parfume', 25, 9500, 12000, 600, '/royal_senegal_bag.jpg'),
('prod-5', 'RZ-LC-50', 'Riz Local Gambiaka (Sac 50kg)', 'local', 50, 13500, 15800, 250, '/royal_senegal_bag.jpg'),
('prod-6', 'RZ-BR-25', 'Riz Brisé 5% (Sac 25kg)', 'brise', 25, 7800, 9200, 300, '/royal_senegal_bag.jpg')
ON CONFLICT (id) DO NOTHING;

-- 5. INSÉRER LES STOCKS PAR DÉPÔT
INSERT INTO depot_stocks (depot_id, product_id, quantity) VALUES
('dep-1', 'prod-1', 14500), ('dep-1', 'prod-2', 8200), ('dep-1', 'prod-3', 6400), ('dep-1', 'prod-4', 3100), ('dep-1', 'prod-5', 2800), ('dep-1', 'prod-6', 1500),
('dep-2', 'prod-1', 4200), ('dep-2', 'prod-2', 3100), ('dep-2', 'prod-3', 1200), ('dep-2', 'prod-4', 800), ('dep-2', 'prod-5', 400), ('dep-2', 'prod-6', 200),
('dep-3', 'prod-1', 1800), ('dep-3', 'prod-2', 950), ('dep-3', 'prod-3', 600), ('dep-3', 'prod-4', 400), ('dep-3', 'prod-5', 250), ('dep-3', 'prod-6', 150),
('dep-4', 'prod-1', 12000), ('dep-4', 'prod-2', 9500), ('dep-4', 'prod-3', 5400), ('dep-4', 'prod-4', 2800), ('dep-4', 'prod-5', 1100), ('dep-4', 'prod-6', 800)
ON CONFLICT (depot_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- 6. INSÉRER LES FOURNISSEURS
INSERT INTO suppliers (id, name, country, phone, email, lead_time, rating) VALUES
('sup-1', 'Indiamex Rice Trading Ltd', 'Inde / Singapour', '+65 6789 0123', 'export@indiamex-rice.com', '25 Jours', '★★★★★'),
('sup-2', 'Siam Trading Asia', 'Thaïlande (Bangkok)', '+66 2 345 6789', 'contact@siamtrading.th', '30 Jours', '★★★★★'),
('sup-3', 'Compagnie Céréalière de l''Ouest', 'Sénégal / Côte d''Ivoire', '+221 33 821 00 00', 'ventes@cc-ouest.sn', '3 Jours', '★★★★☆')
ON CONFLICT (id) DO NOTHING;

-- 7. INSÉRER LES CLIENTS
INSERT INTO clients (id, name, category, phone, email, address, city, credit_limit, total_purchases, balance) VALUES
('cli-1', 'Ets Mamadou & Frères', 'Grossiste Majeur', '+221 77 638 90 90', 'contact@ets-mamadou.sn', 'Marché Tilène, Avenue Blaise Diagne', 'Dakar', 20000000, 45800000, 0),
('cli-2', 'Grossiste Diallo Touba', 'Grossiste Majeur', '+221 77 521 44 33', 'diallo.touba@gmail.com', 'Marché Okass, îlot 4', 'Touba', 15000000, 62400000, 2500000),
('cli-3', 'Comptoir Alimentaire Banlieue', 'Demi-Grossiste', '+221 76 990 12 12', 'cab.pikine@orange.sn', 'Route de Niayes, Tally Boumack', 'Pikine', 5000000, 18900000, 1900000),
('cli-4', 'Boutique Saliou Marché', 'Détaillant', '+221 70 888 77 66', 'saliou.boutique@yahoo.fr', 'Gare Routière Thiaroye', 'Thiaroye', 2000000, 5400000, 0)
ON CONFLICT (id) DO NOTHING;

-- 8. INSÉRER LES EMPLOYÉS RH
INSERT INTO employees (id, name, first_name, last_name, role, depot_id, salary, advances, last_pay, cni_number, phone, email, address, birth_date, birth_place, contract_type, hire_date, emergency_contact, transport_allowance, housing_allowance, social_security_num) VALUES
('EMP-01', 'Ousmane Ba', 'Ousmane', 'Ba', 'Gérant Principal Dépôt Port', 'dep-1', 450000, 0, 'Juillet 2026', '1 757 1988 00412', '+221 77 555 10 10', 'ousmane.ba@gdrs-riz.sn', 'Hann Maristes II, Villa N° 148, Dakar', '1988-04-12', 'Saint-Louis', 'CDI', '2022-03-01', 'Fatoumata Sow - +221 77 600 11 22', 35000, 50000, 'IPRES-890214-SN'),
('EMP-02', 'Ibrahima Ndiaye', 'Ibrahima', 'Ndiaye', 'Gérant Dépôt Thiaroye', 'dep-2', 350000, 50000, 'Juillet 2026', '1 892 1991 00984', '+221 77 444 20 20', 'ibrahima.ndiaye@gdrs-riz.sn', 'Pikine Tally Boumack, Rue 10, Dakar', '1991-09-24', 'Kaolack', 'CDI', '2023-01-15', 'Moussa Ndiaye - +221 70 888 33 44', 25000, 30000, 'IPRES-771420-SN'),
('EMP-03', 'Awa Diop', 'Awa', 'Diop', 'Caissière Principale', 'dep-1', 280000, 0, 'Juillet 2026', '2 757 1995 01209', '+221 77 990 44 55', 'awa.diop@gdrs-riz.sn', 'Fann Résidence, Rue de la Corniche, Dakar', '1995-11-05', 'Dakar Plateau', 'CDI', '2024-02-01', 'Cheikh Diop - +221 77 111 22 33', 20000, 20000, 'IPRES-663210-SN'),
('EMP-04', 'Mamadou Sow', 'Mamadou', 'Sow', 'Chef Manutentionnaire', 'dep-1', 220000, 20000, 'Juillet 2026', '1 645 1993 00331', '+221 76 333 11 00', 'mamadou.sow@gdrs-riz.sn', 'Rufisque Ouest, Quartier Ndeffann', '1993-06-18', 'Thiès', 'CDD', '2025-06-01', 'Aminata Sow - +221 76 555 66 77', 15000, 0, 'IPRES-554109-SN')
ON CONFLICT (id) DO NOTHING;

-- 9. INSÉRER LES COMPTES UTILISATEURS
INSERT INTO user_accounts (username, name, role, depot, last_login, status) VALUES
('moustapha.n', 'Moustapha Ndiaye', 'admin', 'Tous', NOW(), 'Actif'),
('ousmane.b', 'Ousmane Ba', 'gerant', 'Dépôt 1 - Dakar Port', NOW(), 'Actif'),
('awa.d', 'Awa Diop', 'caissier', 'Dépôt 1 - Dakar Port', NOW(), 'Actif'),
('fatou.s', 'Fatou Sall', 'comptable', 'Tous', NOW(), 'Actif'),
('demba.n', 'Demba Ndao', 'personnalise', 'Tous', NOW(), 'Actif')
ON CONFLICT (username) DO NOTHING;

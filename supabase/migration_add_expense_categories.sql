-- Migration pour ajouter les nouvelles catégories de dépenses ('Journalier', 'Repas', 'Maintenance')
-- Exécutez ce script dans le SQL Editor de Supabase si la table 'expenses' existe déjà :

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

ALTER TABLE expenses ADD CONSTRAINT expenses_category_check 
  CHECK (category IN (
    'Manutention', 
    'Journalier', 
    'Repas', 
    'Maintenance', 
    'Transport', 
    'Loyer', 
    'Electricite', 
    'Gardiennage', 
    'Autre'
  ));

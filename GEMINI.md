# 🌾 RizStock ERP — Fiche de Référence Projet (`GEMINI.md`)

Ce document centralise toutes les informations clés sur **RizStock ERP**, son architecture, ses fonctionnalités, sa structure de fichiers, ses choix de design et les consignes pour toute future assistance ou évolution par une IA.

---

## 🎯 1. Description du Projet & Objectif Métier

**RizStock ERP** est une application web **SaaS Multi-Dépôts** spécialement conçue pour les négociants, importateurs et distributeurs de riz en Afrique de l'Ouest (Sénégal, Côte d'Ivoire, etc.).

L'application permet de gérer l'intégralité de la chaîne de valeur du commerce de riz :
- L'**importation maritime et logistique** des conteneurs (BL maritime, navires cargos, dédouanement portuaire).
- Le **stockage physique multi-dépôts** (Dakar Port, Thiaroye, Touba, Abidjan, etc.) et les transferts par camions semi-remorques.
- Le **Point de Vente (POS) et la Caisse** pour les ventes directes en comptoir avec gestion du journal de caisse et du billetage (comptage physique de billets).
- Le **suivi des créances clients** et le recouvrement progressif des factures à crédit.
- L'**inventaire physique périodique** avec procès-verbal d'audit (PV) et ajustement automatique des stocks.
- Les **Ressources Humaines (RH)** avec fiches salariés complètes (CNI, contrats CDI/CDD, état civil) et bulletins de paie conformes aux normes locales (IPRES).
- La **sécurité RBAC** avec définition de rôles personnalisés sur-mesure.

---

## 🚀 2. Fonctionnalités Implémentées

### 📊 A. Aperçu & Ventes
1. **Tableau de Bord Executive (`/dashboard`)** :
   - KPIs en temps réel : Chiffre d'affaires global, Sacs de riz vendus, Valeur totale du stock, Solde Caisse & Créances.
   - Graphiques de répartition du stock par dépôt et par variété de riz.
   - Tableau des dernières transactions et alertes de stock critique.
2. **Point de Vente (POS) & Caisse (`/pos`)** :
   - Grille de produits au **Format Carré (1:1 Ratio `aspect-square`)** affichant la photo authentique du sac de riz (*Royal Sénégal 100% Brisure* par défaut).
   - Panier interactif en temps réel avec modification directe du **Prix Unitaire (P.U)** pour chaque article du panier.
   - Sélecteur de **Date de Vente personnalisée** pour enregistrer des ventes rétroactives avec horodatage précis.
   - Encaissement multi-modes (*Espèces, Wave Mobile Money, Virement, Chèque, Crédit*).
   - **État & Clôture de Caisse (`CashAuditModal.tsx`)** : Calculateur de billetage (10.000F, 5.000F, 2.000F, 1.000F, 500F), calcul théorique vs réel et gestion des écarts (Manquant/Excédent).
   - **Journal de Caisse (`CashJournalModal.tsx`)** : Registre chronologique quotidien des recettes et dépenses de caisse.
3. **Historique des Ventes, Modification & Factures (`/ventes`)** :
   - Registre exhaustif des ventes avec filtre par période et recherche par N° Facture (`FAC-2026-XXXX`).
   - **Modification Complète de Vente (`EditSaleModal.tsx`)** : Rectification des articles, quantités, prix unitaire, date, client, mode de paiement, et recalcul automatique des stocks et créances clients.
   - Impression PDF des **Factures Officielle de Vente** ([`InvoiceModal.tsx`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/components/modals/InvoiceModal.tsx)) et **Bons de Livraison (BL)** ([`DeliveryNoteModal.tsx`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/components/modals/DeliveryNoteModal.tsx)) avec saisie et affichage complet des **informations du chauffeur** (*Nom et prénom, Téléphone, N° Matricule camion/permis, Adresse*).
   - **Annulation de Vente** avec réintégration immédiate des sacs de riz dans le stock du dépôt.

### 📦 B. Stocks & Logistique
1. **Dépôts de Riz (`/depots`)** :
   - Gestion des entrepôts (Capacité en tonnes/sacs, Gérant responsable, Téléphone, Statut).
   - Édition et création des dépôts ([`EditDepotModal.tsx`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/components/modals/EditDepotModal.tsx)).
2. **Catalogue Produits & Catégories (`/produits`)** :
   - Catalogue des sacs de riz (50kg, 25kg, Prix d'achat, Prix de vente, Seuil d'alerte).
   - Upload & Aperçu de photos de sacs de riz avec présélection rapide *Royal Sénégal*.
   - **Gestion des Catégories (`ManageCategoriesModal.tsx`)** : CRUD complet des catégories (*Riz Parfumé, Riz Brisé 100%, Riz Blanc, Riz Local*).
3. **Stocks & Mouvements (`/stocks`)** :
   - Matrice dynamique des stocks par dépôt et par produit (`stocks[depotId][productId]`).
   - Entrées de stock, Sorties de stock et **Transferts Inter-Dépôts** par camionnage ([`TransferStockModal.tsx`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/components/modals/TransferStockModal.tsx)).
   - Badges d'alertes de stock faible ultra-modernes avec voyant rouge pulsant.
4. **Inventaire Physique de Stock (`/inventaire`)** :
   - Sessions d'inventaire contradictoire par dépôt ([`NewInventoryModal.tsx`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/components/modals/NewInventoryModal.tsx)).
   - Procès-Verbal (PV) officiel d'audit avec motifs d'écarts ([`InventoryDetailsModal.tsx`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/components/modals/InventoryDetailsModal.tsx)).
   - Bouton d'**Ajustement Automatique du Stock Système** selon le comptage réel.
5. **Achats & Arrivages de Conteneurs (`/achats`)** :
   - Suivi des importations maritimes (*N° BL, Navires cargos, Nombre de conteneurs 40ft*).
   - **Gestion dynamique des statuts d'arrivage** (`Commandé` &rarr; `En Transit` &rarr; `Dédouanement` &rarr; `Livré`).
   - **Incrémentation automatique du stock dépôt** dès qu'un arrivage passe au statut **`Livré`**.
   - Génération et impression du **Bon de Réception (BR)** ([`ReceptionNoteModal.tsx`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/components/modals/ReceptionNoteModal.tsx)).

### 💳 C. Partenaires & Finance
1. **Fournisseurs Partenaires (`/fournisseurs`)** : Fiches des armateurs et négociants (Inde, Thaïlande, Singapour, Sénégal).
2. **Clients & Recouvrement Créances (`/clients`)** :
   - Plafonds de crédit autorisés, suivi des soldes débiteurs.
   - **Règlement de Créance (`DebtSettlementModal.tsx`)** : Enregistrement d'acomptes ou versements totaux par Wave/Virement avec reçu de versement ([`ClientDetailsModal.tsx`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/components/modals/ClientDetailsModal.tsx)).
3. **Dépenses Opérationnelles (`/depenses`)** : Suivi des frais de manutention, transport portuaire et loyers d'entrepôts.

### 👥 D. RH & Administration
1. **Ressources Humaines & Salaires (`/rh`)** :
   - Filtre par dépôt affecté.
   - **Fiche RH & Dossier Personnel Salarié (`EmployeeDetailsModal.tsx`)** : Prénom, Nom, N° CNI, Date & Lieu de Naissance, Adresse, Contact Urgence, Type de contrat (*CDI, CDD, Prestataire*), N° IPRES/CSS.
   - **Bulletin de Paie Dynamique (`PayslipModal.tsx`)** : Calcul des gains (Base + Prime Transport + Logement), déductions sociales (IPRES 5,6%) et acomptes, avec Net à Payer et impression PDF.
2. **Rôles, Utilisateurs & Habilitations (`/utilisateurs`)** :
   - Matrice des permissions RBAC.
   - **Rôle Personnalisé Sur-Mesure (`role: 'personnalise'`)** : Exclut par défaut les modules sensibles (*Inventaires Physiques, Rôles & Accès, Paramètres ERP*).
3. **Journal d'Activités & Audit (`/activites`)** : Historique traçable de toutes les actions réalisées sur l'ERP.
4. **Paramètres ERP & Branding (`/parametres`)** : Raison sociale, NINEA, RCCM, devise (FCFA) et logo de l'entreprise.

---

## 📁 3. Structure des Fichiers du Projet

```
gestionstock/
├── public/
│   └── royal_senegal_bag.jpg        # Image par défaut authentique du sac de riz 25kg/50kg
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── achats/page.tsx       # Achats & Arrivages de Conteneurs
│   │   │   ├── activites/page.tsx    # Journal d'Audit & Activités
│   │   │   ├── clients/page.tsx      # Clients & Recouvrement Créances
│   │   │   ├── dashboard/page.tsx    # Tableau de bord principal
│   │   │   ├── depenses/page.tsx     # Dépenses opérationnelles
│   │   │   ├── depots/page.tsx       # Dépôts de riz
│   │   │   ├── fournisseurs/page.tsx # Fournisseurs maritimes
│   │   │   ├── inventaire/page.tsx   # Inventaires physiques & Audit
│   │   │   ├── layout.tsx            # Layout Dashboard avec Provider & Modales
│   │   │   ├── parametres/page.tsx   # Paramètres ERP & Branding
│   │   │   ├── pos/page.tsx          # Point de Vente Caisse (POS)
│   │   │   ├── produits/page.tsx     # Catalogue Produits & Catégories
│   │   │   ├── rapports/page.tsx     # Rapports financiers & bilans
│   │   │   ├── rh/page.tsx           # RH & Paie des Salariés
│   │   │   ├── stocks/page.tsx       # Stocks & Transferts inter-dépôts
│   │   │   ├── utilisateurs/page.tsx # Rôles, Utilisateurs & Matrice RBAC
│   │   │   └── ventes/page.tsx       # Historique des Ventes & Factures
│   │   ├── layout.tsx                # Root Layout (Fonts, Metadata)
│   │   └── page.tsx                  # Redirection vers /login ou /dashboard
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            # En-tête (Dépôt actif, Rôle, Theme, POS)
│   │   │   └── Sidebar.tsx           # Menu latéral avec accordéons & tiroir mobile
│   │   ├── modals/                   # 32 Modales métiers
│   │   │   ├── AddEmployeeModal.tsx
│   │   │   ├── CashAuditModal.tsx
│   │   │   ├── CashJournalModal.tsx
│   │   │   ├── EmployeeDetailsModal.tsx
│   │   │   ├── InventoryDetailsModal.tsx
│   │   │   ├── InvoiceModal.tsx
│   │   │   ├── ManageCategoriesModal.tsx
│   │   │   ├── NewInventoryModal.tsx
│   │   │   ├── PayslipModal.tsx
│   │   │   ├── ReceptionNoteModal.tsx
│   │   │   ├── TransferStockModal.tsx
│   │   │   └── ... (32 modales au total)
│   │   └── ui/
│   │       ├── DatePeriodFilter.tsx  # Filtre temporel (Toutes, Aujourd'hui, 7J, 30J, Custom)
│   │       ├── Modal.tsx             # Wrapper de modale adaptatif
│   │       └── ToastContainer.tsx    # Système de notifications toast
│   ├── context/
│   │   └── AppContext.tsx            # Context React central (State global, Méthodes CRUD, Logs)
│   ├── lib/
│   │   ├── mockData.ts               # Données initiales réalistes (Produits, Dépôts, Ventes, RH)
│   │   └── utils.ts                  # Formateurs de devise (formatFCFA, formatNumber)
│   └── types/
│       └── index.ts                  # Déclarations des interfaces TypeScript (Product, Sale, Employee, etc.)
├── GEMINI.md                         # Ce fichier de documentation pour les IAs
├── AGENTS.md                         # Consignes de compatibilité Next.js
├── next.config.ts                    # Configuration Next.js
├── package.json                      # Dépendances du projet
└── tsconfig.json                     # Configuration TypeScript
```

---

## 🛠️ 4. Technologies Utilisées

- **Framework Web** : Next.js 16.3 (App Router, Turbopack, Client Components)
- **Bibliothèque UI** : React 19
- **Langage** : TypeScript (Typage strict de tous les modèles métiers)
- **Styling & CSS** : Tailwind CSS 4 & Vanilla CSS (Thème sombre `#0f172a` / `#1e293b` avec effets glassmorphism)
- **Iconographie** : `lucide-react`
- **Impression PDF** : CSS `@media print` natif avec la classe `.printable-invoice` (Factures, BL, BR, Bulletins de Paie, Rapports)
- **Gestion d'État** : React Context API (`AppContext.tsx`) avec persistance `localStorage`

---

## 🎨 5. Décisions de Design & Instructions pour les Futurs Modèles IA

1. **Aesthétiques Métiers Premium** :
   - Conserver le thème **Dark Mode Slate/Emerald** avec des cartes `#1e293b` et des accents `#10b981` (Émeraude), `#f59e0b` (Ambre) et `#3b82f6` (Bleu).
   - Utiliser des badges fins `rounded-full` avec des opacités subtiles (`bg-emerald-500/20 text-emerald-400`).
2. **Gestion de la Monnaie (FCFA)** :
   - Toujours utiliser `formatFCFA(valeur)` de [`utils.ts`](file:///Users/mac/Documents/Antigravity%20Projets/gestionstock/src/lib/utils.ts) pour afficher les montants financiers.
3. **Format des Photos du POS** :
   - Les photos de sacs de riz sur la page POS (`/pos`) doivent impérativement conserver le ratio **1:1 Carré (`aspect-square w-full bg-[#090d16] object-contain`)**.
4. **Règles de Mutation Automatique du Stock** :
   - Une **vente** déduit le stock du dépôt récepteur.
   - Un **transfert inter-dépôts** déduit le dépôt source et crédite le dépôt destination.
   - Un **arrivage maritime** qui passe au statut **`Livré`** crédite automatiquement le stock du dépôt récepteur.
   - Un **ajustement d'inventaire** remplace le stock théorique par le stock constaté lors du comptage physique.
5. **Règles de Responsivité Multi-Écrans** :
   - Toutes les modales doivent utiliser `<Modal max-h-[92vh] overflow-y-auto>` pour éviter tout débordement sur écran mobile.
   - Tous les tableaux métiers doivent être enveloppés dans un conteneur `overflow-x-auto`.
   - Ne jamais couper les badges sur plusieurs lignes : utiliser `whitespace-nowrap shrink-0`.

# Diagrammes UML - Système de Gestion de Pharmacie

Ce dossier contient les diagrammes UML générés pour votre rapport de fin d'étude du système de gestion de pharmacie.

## Fichiers générés

### 1. Diagramme de Classes (`CLASS_DIAGRAM.puml`)
- **Description**: Représente la structure complète des classes du système
- **Contenu**: 
  - Classes principales: PharmacyUser, Pharmacy, Medicine, Sale, Purchase, Customer, etc.
  - Relations entre les entités
  - Attributs et méthodes principales
- **Packages**: Authentification, Domaine Pharmacie, Gestion des Ventes, Gestion des Achats, Gestion des Stocks

### 2. Diagrammes de Séquence

#### a) Processus de Vente (`SEQUENCE_DIAGRAM_SALES.puml`)
- **Description**: Montre le flux complet d'une transaction de vente
- **Acteurs**: Pharmacien/Manager, Frontend (React), API Sales, API Inventory, Base de données
- **Processus**: 
  - Sélection client
  - Ajout de médicaments
  - Vérification du stock
  - Création de la vente
  - Mise à jour automatique du stock
  - Traitement des paiements

#### b) Processus d'Achat (`SEQUENCE_DIAGRAM_PURCHASE.puml`)
- **Description**: Illustre le processus de commande et réception de marchandises
- **Processus**:
  - Création de bon de commande
  - Sélection fournisseur
  - Finalisation de l'achat
  - Mise à jour du stock
  - Gestion des transactions fournisseur

#### c) Authentification (`SEQUENCE_DIAGRAM_AUTH.puml`)
- **Description**: Processus d'authentification et gestion des permissions
- **Processus**:
  - Inscription utilisateur
  - Connexion avec JWT
  - Contrôle d'accès basé sur les rôles
  - Rafraîchissement des tokens

### 3. Diagrammes de Cas d'Usage

#### a) Vue d'ensemble (`USE_CASE_DIAGRAM.puml`)
- **Description**: Vue globale des fonctionnalités système
- **Acteurs**: Pharmacien, Manager, Employé, Client
- **Packages principaux**: 7 modules fonctionnels

#### b) Diagrammes détaillés par module:

**`USE_CASE_SALES.puml` - Gestion des Ventes**
- Processus de vente complet (démarrer vente → finaliser)
- Gestion client et modes de paiement
- Rapports et analytics ventes
- Relations include/extend entre cas d'usage

**`USE_CASE_INVENTORY.puml` - Gestion des Stocks**
- Consultation et ajustement inventaire
- Alertes automatiques (stock bas, expiration, rupture)
- Traçabilité complète des mouvements
- Gestion péremption et audits

**`USE_CASE_PURCHASES.puml` - Gestion des Achats**
- Processus commandes fournisseurs complet
- Réception et contrôle qualité marchandises
- Gestion financière et crédit fournisseurs
- Optimisation et analytics achats

**`USE_CASE_USER_MANAGEMENT.puml` - Gestion des Utilisateurs**
- Authentification et sécurité (login, sessions, audit)
- Gestion rôles et permissions granulaires
- Administration comptes et pharmacies
- Logs sécurité et conformité

**`USE_CASE_CUSTOMER_MANAGEMENT.puml` - Gestion des Clients**
- Profils clients et historiques d'achat
- Programme fidélité et segmentation
- Gestion crédit et communication client
- Service client et réclamations

**`USE_CASE_REPORTS_ANALYTICS.puml` - Rapports et Analytics**
- Rapports financiers (bilan, P&L, cash-flow)
- Analytics avancés avec IA et prédictions
- Tableaux de bord temps réel et KPIs
- Rapports réglementaires et conformité

## Comment utiliser ces diagrammes

### Génération d'images
1. Installez PlantUML ou utilisez un éditeur en ligne comme [plantuml.com](http://www.plantuml.com/plantuml/)
2. Copiez le contenu des fichiers `.puml` dans l'éditeur
3. Générez les images au format PNG, SVG ou PDF

### Intégration dans votre rapport
- **Diagramme de Classes**: Section "Architecture du Système" ou "Modèle de Données"
- **Diagrammes de Séquence**: Section "Analyse Fonctionnelle" ou "Processus Métier"
- **Diagramme de Cas d'Usage**: Section "Analyse des Besoins" ou "Spécifications Fonctionnelles"

## Caractéristiques techniques du système

### Architecture
- **Backend**: Django REST Framework
- **Frontend**: React.js avec React Router
- **Base de données**: SQLite (développement)
- **Authentification**: JWT (JSON Web Tokens)
- **API**: RESTful avec permissions basées sur les rôles

### Fonctionnalités principales
- Gestion multi-utilisateurs avec rôles (Pharmacien, Manager, Employé)
- Gestion complète des stocks avec traçabilité
- Système de vente avec mise à jour automatique des stocks
- Gestion des achats et fournisseurs
- Tableau de bord avec KPIs en temps réel
- Système de permissions granulaires

### Points forts du système
- Interface bilingue (Anglais/Français)
- Recherche intelligente de médicaments
- Scanner de codes-barres intégré
- Alertes de stock bas automatiques
- Historique complet des mouvements de stock
- Gestion du crédit client
- Rapports financiers et analytiques

Ces diagrammes reflètent fidèlement l'architecture et les fonctionnalités de votre système de gestion de pharmacie tel qu'implémenté dans le code source.

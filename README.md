# 📊 CV Production Tracker

> Plateforme web de transformation automatique d'un planning de production Excel en déclaration et suivi CV.

**CV Production Tracker** est une application web développée pour automatiser le traitement des fichiers Excel de planning de production et générer une déclaration CV structurée, organisée et directement exploitable dans Microsoft Excel.

L'objectif est de remplacer les traitements manuels et répétitifs par un processus automatisé :

```text
Planning Production Excel
          ↓
       Import
          ↓
       Analyse
          ↓
 Nettoyage & Mapping
          ↓
Transformation métier
          ↓
   Aperçu Déclaration
          ↓
   Génération Excel
          ↓
      Download
```

---

## 🎯 Objectifs

L'application permet de :

- 📁 Importer un planning de production Excel
- 🔍 Analyser automatiquement le fichier
- 📊 Identifier les semaines et projets
- 🏭 Identifier les références et carrousels/postes
- 📅 Lire les données de production par jour
- 🔄 Transformer les données selon les règles métier
- 🧮 Calculer les objectifs, productions et écarts
- 📈 Calculer les indicateurs de performance
- 👀 Afficher un aperçu avant génération
- 📄 Générer une déclaration CV au format Excel
- ⬇️ Télécharger le fichier généré
- 🗂️ Conserver l'historique des imports et déclarations

---

# 🏗️ Architecture

Le projet est composé de deux applications :

```text
cv-production-tracker/
│
├── frontend/
│   └── React + TypeScript + Vite
│
├── backend/
│   └── Node.js + Express
│
└── README.md
```

Architecture globale :

```text
                    ┌─────────────────────┐
                    │     Utilisateur     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      React          │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                         REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Express        │
                    │      Backend        │
                    └───────┬─────┬───────┘
                            │     │
               ┌────────────┘     └────────────┐
               ▼                               ▼
       ┌────────────────┐              ┌────────────────┐
       │   PostgreSQL   │              │    ExcelJS     │
       │    Database    │              │ Excel Processing│
       └────────────────┘              └───────┬────────┘
                                               │
                                               ▼
                                      📊 Declaration CV
```

---

# 🛠️ Technologies

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Zustand
- Lucide React

## Backend

- Node.js
- Express
- JavaScript ES Modules
- Sequelize
- PostgreSQL
- ExcelJS
- Multer
- JWT
- bcryptjs
- express-validator
- dotenv
- CORS
- Helmet
- Morgan

---

# 📁 Structure du projet

```text
cv-production-tracker/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ExcelPreview.tsx
│   │   │   ├── ProcessingStatus.tsx
│   │   │   ├── DeclarationTable.tsx
│   │   │   └── DownloadButton.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── UploadPage.tsx
│   │   │   ├── DeclarationPage.tsx
│   │   │   └── HistoryPage.tsx
│   │   │
│   │   ├── services/
│   │   │   └── excelApi.ts
│   │   │
│   │   ├── stores/
│   │   │   └── declarationStore.ts
│   │   │
│   │   ├── types/
│   │   │   └── excel.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── excelController.js
│   │   └── declarationController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Import.js
│   │   ├── Declaration.js
│   │   └── DeclarationLine.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── excelRoutes.js
│   │   └── declarationRoutes.js
│   │
│   ├── services/
│   │   ├── excelReader.js
│   │   ├── planningService.js
│   │   ├── declarationService.js
│   │   └── excelGenerator.js
│   │
│   ├── utils/
│   │   ├── excelUtils.js
│   │   ├── calculations.js
│   │   └── apiResponse.js
│   │
│   ├── scripts/
│   │   └── analyze.js
│   │
│   ├── uploads/
│   ├── generated/
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

# 📊 Fichiers Excel de référence

Le projet utilise deux fichiers Excel de référence.

## Fichier source

```text
Planning_Off Road_W06_volvo.xlsx
```

Ce fichier représente le planning de production importé par l'utilisateur.

Il contient notamment :

- Project
- CPN
- LPN
- Workplace
- Temps de gamme
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- EQNT
- EQM
- EQS

Feuilles principales :

```text
Planning
L160
Planning_day
```

---

## Fichier modèle

```text
Copie de suivi de Déclaration CV Agadir final2026 1.xlsx
```

Ce fichier représente le format final attendu.

Il contient notamment les feuilles :

```text
W02
W03
W04
W05
W06
```

La feuille `W06` sert de référence pour la génération de la déclaration.

---

# 🔄 Fonctionnement

## Étape 1 — Import

L'utilisateur importe :

```text
Planning_Off Road_W06_volvo.xlsx
```

Le frontend envoie le fichier au backend avec `multipart/form-data`.

---

## Étape 2 — Analyse

Le backend utilise **ExcelJS** pour analyser le fichier.

L'application détecte :

- les feuilles disponibles ;
- les colonnes ;
- le nombre de lignes ;
- la semaine ;
- les projets ;
- les références ;
- les données journalières.

Exemple de résultat :

```json
{
  "fileName": "Planning_Off Road_W06_volvo.xlsx",
  "sheets": ["Planning", "L160", "Planning_day"],
  "detectedWeek": "W06",
  "projects": ["VOLVO"]
}
```

---

# 🔄 Transformation

Les données suivent le processus :

```text
Excel Reader
     ↓
Planning Service
     ↓
Declaration Service
     ↓
Calculs
     ↓
Declaration Data
     ↓
Excel Generator
```

La fonction principale est :

```javascript
transformPlanningToDeclaration();
```

Elle transforme les données du planning en données exploitables par la déclaration CV.

---

# 📋 Structure de la déclaration

Une déclaration peut contenir :

```text
Projet
   │
   └── Carrousel
          │
          ├── Objectif
          ├── Qte produite
          ├── Ecart
          ├── Ecart en %
          ├── L160%
          └── Root Cause
```

Les données journalières sont organisées :

```text
Lundi
Mardi
Mercredi
Jeudi
Vendredi
Samedi
```

avec un :

```text
Cumul
```

---

# 🧮 Calculs

Les calculs sont centralisés dans :

```text
backend/utils/calculations.js
```

Fonctions principales :

```javascript
calculateDifference(objective, produced)

calculateDifferencePercentage(objective, produced)

calculateCumulative(values)

calculateL160(...)
```

Les cas particuliers sont gérés :

- valeur vide ;
- `null` ;
- `undefined` ;
- objectif égal à zéro ;
- valeur texte ;
- division par zéro.

L'application ne doit jamais générer :

```text
NaN
Infinity
undefined
```

---

# 🗄️ Base de données

PostgreSQL est utilisé pour conserver l'historique de l'application.

## Entités principales

```text
User
   │
   ├── Imports
   │
   └── Declarations
             │
             └── DeclarationLines
```

### User

```text
id
name
email
password
role
createdAt
updatedAt
```

### Import

```text
id
filename
week
project
status
createdBy
createdAt
```

### Declaration

```text
id
importId
week
project
status
createdAt
updatedAt
```

### DeclarationLine

```text
id
declarationId
carrousel
type
monday
tuesday
wednesday
thursday
friday
saturday
cumul
rootCause
```

---

# 🔐 Authentification

La plateforme peut utiliser JWT pour sécuriser l'accès.

Exemple :

```text
POST /api/auth/login
```

Réponse :

```json
{
  "success": true,
  "token": "JWT_TOKEN"
}
```

Les routes protégées utilisent le token :

```http
Authorization: Bearer TOKEN
```

---

# 🌐 API

## Health Check

```http
GET /api/health
```

Réponse :

```json
{
  "success": true,
  "message": "CV Production Tracker API opérationnelle"
}
```

---

## Authentification

### Login

```http
POST /api/auth/login
```

### Profil

```http
GET /api/auth/me
```

---

## Excel

### Upload

```http
POST /api/excel/upload
```

Form-data :

```text
file = planning.xlsx
```

### Analyse

```http
POST /api/excel/analyze
```

### Transformation

```http
POST /api/excel/transform
```

### Génération

```http
POST /api/excel/generate
```

### Téléchargement

```http
GET /api/excel/download/:filename
```

---

# ⚙️ Installation

## Prérequis

Installer :

- Node.js
- npm
- PostgreSQL
- Git

Vérifier :

```bash
node -v
npm -v
psql --version
```

---

# 📦 Installation Backend

```bash
cd backend
npm install
```

Créer :

```text
.env
```

Exemple :

```env
PORT=5000

DATABASE_URL=postgresql://postgres:password@localhost:5432/cv_production_tracker

JWT_SECRET=your_super_secret_key

FRONTEND_URL=http://localhost:5173
```

---

# 📦 Installation Frontend

```bash
cd frontend
npm install
```

Créer :

```text
.env
```

Exemple :

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🐘 Configuration PostgreSQL

Créer la base :

```sql
CREATE DATABASE cv_production_tracker;
```

Puis vérifier la connexion avec Sequelize.

---

# ▶️ Lancer le projet

## Backend

```bash
cd backend
npm run dev
```

Backend disponible sur :

```text
http://localhost:5000
```

---

## Frontend

Dans un autre terminal :

```bash
cd frontend
npm run dev
```

Frontend disponible sur :

```text
http://localhost:5173
```

---

# 🧪 Analyse des fichiers Excel

Avant de développer les règles métier, lancer :

```bash
npm run analyze
```

Le script doit analyser les fichiers Excel de référence et afficher :

```text
=====================================
EXCEL ANALYSIS
=====================================

File: Planning_Off Road_W06_volvo.xlsx

Sheets:
- Planning
- L160
- Planning_day

Rows:
...

Columns:
...

Detected week:
W06

Projects:
VOLVO

=====================================
DECLARATION MODEL
=====================================

Sheets:
- W02
- W03
- W04
- W05
- W06

=====================================
```

Les règles de transformation doivent être documentées dans :

```text
backend/docs/transformation-rules.md
```

---

# ⚠️ Règles métier

Les règles de transformation ne doivent **pas être inventées**.

Elles doivent être déduites de la comparaison entre :

```text
Planning_Off Road_W06_volvo.xlsx
```

et :

```text
Copie de suivi de Déclaration CV Agadir final2026 1.xlsx
```

Avant d'implémenter la transformation :

1. analyser le Planning ;
2. analyser la déclaration ;
3. identifier les correspondances ;
4. identifier les calculs ;
5. documenter les règles ;
6. implémenter ;
7. tester avec W06 ;
8. tester avec d'autres semaines.

---

# 🎨 Interface

L'interface doit être professionnelle et adaptée à un environnement industriel.

Principales couleurs :

- blanc ;
- bleu foncé ;
- gris ;
- couleurs d'état.

Pages principales :

```text
Dashboard
    ↓
Upload Planning
    ↓
Analyse
    ↓
Preview Declaration
    ↓
Generation
    ↓
Download
    ↓
History
```

---

# 📱 Dashboard

Le dashboard doit afficher notamment :

```text
┌─────────────────────────────────────────┐
│ CV Production Tracker                   │
├─────────────────────────────────────────┤
│                                         │
│ Imports cette semaine          12       │
│ Déclarations générées          10       │
│ Projets                         4       │
│                                         │
├─────────────────────────────────────────┤
│ Dernières déclarations                  │
│                                         │
│ W06 | VOLVO | Générée                   │
│ W05 | VOLVO | Générée                   │
│ W04 | VOLVO | Générée                   │
│                                         │
└─────────────────────────────────────────┘
```

---

# 🔒 Sécurité

Le backend utilise :

- Helmet
- CORS
- JWT
- bcryptjs
- express-validator
- validation des fichiers
- limitation de taille
- extension `.xlsx`
- noms de fichiers sécurisés

Ne jamais faire confiance aux noms de fichiers fournis par l'utilisateur.

---

# 🧪 Tests

Le projet doit être testé avec :

- fichiers Excel valides ;
- fichier vide ;
- mauvais format ;
- fichier corrompu ;
- colonne manquante ;
- feuille manquante ;
- valeurs nulles ;
- objectif égal à zéro ;
- plusieurs projets ;
- plusieurs semaines.

Tester également les API avec **Postman**.

---

# 📈 Évolutions possibles

Le projet pourra évoluer vers :

- 👥 gestion complète des utilisateurs ;
- 🔐 gestion des rôles ;
- 📊 dashboard KPI ;
- 📅 historique par semaine ;
- 🏭 historique par projet ;
- 📈 graphiques de performance ;
- 📤 export Excel ;
- 🖨️ impression de déclaration ;
- 🔎 recherche dans l'historique ;
- 📝 modification manuelle des Root Causes ;
- 📊 comparaison entre semaines ;
- 🔔 notifications ;
- 🐳 Docker ;
- 🚀 déploiement cloud.

---

# 👨‍💻 Développement

Projet développé avec :

```text
React
TypeScript
Node.js
Express
PostgreSQL
Sequelize
ExcelJS
Tailwind CSS
```

---

# 📄 Licence

Projet privé / professionnel.

Toute utilisation ou distribution du projet doit être autorisée par le propriétaire du projet.

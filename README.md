
Full-stack Inventory Management application with:

- **backend/** — Node.js + Express + SQLite (APIs for products, import/export, inventory history)
- **frontend/** — React (Create React App) user interface

> This README explains how to run both parts locally, an overview of APIs, sample requests (PowerShell compatible), and tips for git/ignore.

---

## Table of contents

- [Prerequisites](#prerequisites)  
- [Folder structure](#folder-structure)  
- [Backend — run locally](#backend---run-locally)  
- [Frontend — run locally](#frontend---run-locally)  
- [API Reference (overview)](#api-reference-overview)  
- [Sample requests (PowerShell)](#sample-requests-powershell)  
- [Import / Export CSV](#import--export-csv)  
- [Seed data (copy-paste)](#seed-data-copy-paste)  
- [Git & .gitignore tips](#git--gitignore-tips)  
- [Deployment notes](#deployment-notes)  
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js >= 16 (includes `npm`)
- Git (optional — for pushing to GitHub)
- PowerShell or Git Bash (examples below use PowerShell-friendly commands)

---

## Folder structure

skillwise/
├─ backend/
│ ├─ server.js # express server + sqlite initialization
│ ├─ routes/
│ │ └─ products.js
│ ├─ middleware/
│ ├─ uploads/ # file uploads (ignored by git)
│ └─ inventory.db # sqlite database (ignored by git)
├─ frontend/
│ ├─ package.json
│ ├─ src/
│ │ ├─ App.js
│ │ ├─ api.js
│ │ ├─ styles.css
│ │ └─ components/
├─ .gitignore
└─ README.md

yaml
Copy code

---

## Backend — run locally

1. Install dependencies and start:

```powershell
cd backend
npm install
node server.js
By default the server listens on port 5000. You should see a console message like Server running on port 5000.

Note: The project purposely does not require an .env file. If you later add secrets, do not commit them — add them to .gitignore.

Frontend — run locally
Install dependencies and start:

powershell
Copy code
cd frontend
npm install
npm start
The frontend dev server runs at http://localhost:3000 by default and should talk to the backend at http://localhost:5000. If you change the backend URL, update frontend/src/api.js.

API Reference (overview)
Base URL: http://localhost:5000/api

Products
GET /api/products
Return all products. (Supports optional query params for category, pagination if implemented.)

POST /api/products
Create a product. Body (JSON):

json
Copy code
{ "name":"Sample","unit":"pcs","category":"Gadgets","brand":"Acme","stock":10,"status":"active","image":"https://..." }
PUT /api/products/:id
Update a product. If stock changes, the backend records an entry in inventory_history.

DELETE /api/products/:id
Delete a product.

GET /api/products/:id/history
Get inventory history (old/new quantities, date) for a product (sorted desc).

Import / Export
POST /api/products/import
Upload CSV via multipart form (field name e.g. csvFile). The server parses CSV, adds non-duplicates, returns counts.

GET /api/products/export
Download all products as CSV (response headers Content-Type: text/csv and Content-Disposition).

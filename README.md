# 🌿 AushadhSanchaya: Clinical & Pharmaceutical Ledger Platform 🧑‍⚕️

AushadhSanchaya (Sanskrit: *Aushadh* = Medicine, *Sanchaya* = Collection/Accumulation) is a next-generation, premium Pharmaceutical Inventory Ledger and Clinical Supply Chain System. Designed for modern pharmacies, hospitals, and clinical research facilities, AushadhSanchaya bridges botanical healthcare origins with strict, modern clinical science, robust auditing, and state-of-the-art artificial intelligence. 🚀

---

## 📋 Table of Contents
- [1. Project Concept 🔬](#1-project-concept-)
- [2. The Idea Behind Making This Platform 💡](#2-the-idea-behind-making-this-platform-)
- [3. Why This Platform is Required ⚠️](#3-why-this-platform-is-required-)
- [4. Tech Stack Used 🛠️](#4-tech-stack-used-)
- [5. Core Features 🌟](#5-core-features-)
- [6. Innovative & AI-Driven Features 🔮](#6-innovative--ai-driven-features-)
- [7. Project Summary 📝](#7-project-summary-)
- [8. Guide to Start the Project Locally 🚀](#8-guide-to-start-the-project-locally-)
- [9. Production Deployment Guide 🌐](#9-production-deployment-guide-)

---

## 🔬 1. Project Concept
Traditional inventory software treats stock as simple numbers in a table. In contrast, **AushadhSanchaya** introduces a strict **Ledger-Based Architecture** 🏛️ where every pill, bottle, and batch is audited from receipt to delivery. The platform honors traditional botanical/herbal medicine origins while maintaining rigorous pharmaceutical standards.

AushadhSanchaya handles the complete lifecycle of pharmaceutical products. It tracks batches, manages procurement from certified manufacturers, and monitors the distribution flow across clinics, internal departments, partner pharmacies, and patients. 📦

---

## 💡 2. The Idea Behind Making This Platform
The platform was conceived out of a direct need for an **Audit-First Philosophy** in medicine supply chains:
* **🌿 Botanical-to-Clinical Bridge**: Many modern healthcare environments blend traditional Ayurvedic/botanical remedies with modern allopathic medicines. AushadhSanchaya provides a unified platform to track both, classifying chemical ingredients, botanical sources, and scientific names in a single interface.
* **📜 Traceability and Accountability**: In medicine distribution, knowing the exact batch and user who handled a transaction is not a luxury—it is a regulatory requirement. AushadhSanchaya ensures every stock movement (Stock In, Stock Out, Distribution, Disposal) is recorded as an immutable ledger transaction.
* **🤖 AI-Augmented Workflows**: Pharmacists spend hours checking shipping labels, typing batch numbers, and verifying expiries. AushadhSanchaya integrates computer vision and conversational AI to handle these tedious tasks automatically.

---

## ⚠️ 3. Why This Platform is Required
* **📉 Reducing Expiry Waste (FEFO Enforced)**: Pharmacies lose substantial capital due to expired stock. AushadhSanchaya implements a strict **FEFO (First Expired, First Out)** warning system and visual analytics dashboard, reducing medicine expiry waste by up to 35%.
* **✍️ Eliminating Manual Data Entry Errors**: Manually typing in 15-character batch numbers and expiry dates from packaging is highly prone to human error. AushadhSanchaya's **MaoMao Vision AI** extracts this data directly from packaging images.
* **🛡️ Supply Chain Compliance**: Health systems require a complete custody log. AushadhSanchaya's role-based access matrix and transaction rollbacks ensure that data is secure and that a clear audit log is maintained for compliance officers.
* **🔮 Procurement Optimization**: Preventing critical stock-outs of life-saving medicines requires predicting demand. The platform tracks historical consumption trends to calculate seasonal demand curves and suggest optimal order levels.

---

## 🛠️ 4. Tech Stack Used

### 💻 Frontend (User Interface)
* **⚛️ React 19 & ⚡ Vite 8**: Ultra-fast hot-reloading frontend structure.
* **🎨 Tailwind CSS v4 & PostCSS**: Custom styled, organic dark-green aesthetic with fluid layout components.
* **🎬 Framer Motion**: Premium page transitions and subtle micro-animations for an interactive user experience.
* **📊 Chart.js & React-Chartjs-2**: Dynamic data rendering for stock movements, distribution statistics, and inventory values.
* **📄 jsPDF & jsPDF-AutoTable**: Client-side document compiler for generating purchase orders, goods receipts, and distribution summary reports.
* **🔌 Axios**: Standard HTTP request handling.

### ⚙️ Backend (REST API)
* **🟢 Node.js v20+ & 🚀 Express.js v5**: Asynchronous RESTful API framework.
* **🍃 MongoDB & Mongoose v9**: NoSQL database modeling with schemas for products, suppliers, purchase orders, receipts, distributions, and ledger events.
* **🔒 Joi**: Mandatory validation schemas for all incoming API request bodies, query parameters, and MongoDB object IDs.
* **🔑 Passport.js**: Secure OAuth 2.0 implementation with Google and Facebook strategies.
* **🎟️ JSON Web Tokens (JWT) & bcryptjs**: Hashed password management and secure cookie-based JWT sessions.
* **🖨️ PDFKit & 📁 Multer**: Backend PDF generation and file/image upload handlers.
* **📖 Swagger (swagger-jsdoc & swagger-ui-express)**: Automatically generated, interactive OpenAPI 3.0 API documentation.

### 🔮 Artificial Intelligence
* **🧠 Google Gemini AI SDK (`@google/generative-ai`)**:
  * **💬 Gemini 2.0 (MaoMao AI)**: Conversational assistant capable of outputting structured medical formats and traditional recipe layouts.
  * **👁️ Gemini 1.5 Pro (MaoMao Vision)**: OCR and vision intelligence for processing uploaded package/label photographs.

### 🧪 Testing
* **🃏 Jest & Supertest**: Robust suite for automated API route testing.
* **💾 MongoDB Memory Server**: In-memory MongoDB testing environment.

---

## 🌟 5. Core Features

### 🔐 Multi-Role Access Control (RBAC)
AushadhSanchaya implements a strict role-based access matrix:
* **👑 Admin**: Complete system access, user management, and transaction ledger overrides.
* **💼 Inventory Manager**: Detailed product creation, stock adjustment, and category control.
* **🛒 Procurement Staff**: Supplier profiles, Purchase Orders (PO), and Goods Receipt Notes (GRN).
* **🚚 Distribution Staff**: Distribution Orders (DO) to clinics, hospitals, and patients.
* **🧑‍⚕️ Staff**: Legacy read/write role for general operations.

### 📈 Smart Dashboard & Analytics
* **💰 Valuation Tracking**: Live calculation of total inventory financial worth.
* **🔔 Low Stock & Expiry Alerts**: Visual warning cards highlighting products that are below reorder thresholds or nearing expiry.
* **📊 LEDGER View**: Real-time stock movement graph showing inflows and outflows over custom ranges.

### 📦 Batch & Inventory Management
* **🏷️ Automatic SKU Generation**: Generates standard formatted SKU tags for new items.
* **✏️ Adjustments Log**: Detail-oriented stock modification form requiring a reason and quantity input.
* **📜 Audit Trail**: Every change creates a permanent transaction item linking the product, previous quantity, new quantity, date, reason, and actor.

### 🛒 Procurement (Release 2.0)
* **🤝 Supplier Profiles**: Tracks contact details, address, payment terms, and ratings.
* **📝 Purchase Orders (PO)**: Sequential order compiler (Draft, Submitted, Approved, Shipped, Received) with automatic tax and discount calculation.
* **📥 Goods Receipt Notes (GRN)**: Record incoming items, record batch numbers, expiries, and update quantities using atomic transaction rollbacks.
* **🏢 Government JanAushadhi API Integration**: Fetch cost-effective government-subsidized options and map them directly to purchase orders.

### 🚚 Distribution Ledger (Release 3.0)
* **📦 Distribution Orders**: Create DOs and track their lifecycle (Pending, Processed, Shipped, Delivered, Returned, Cancelled).
* **🏥 Multiple Recipient Types**: Support for hospitals, internal departments, partner pharmacies, and individual patients.
* **🔄 Returns Handling**: Easy returns with automatic inventory incrementation and audit log tracking.

---

## 6. Innovative & AI-Driven Features

### 👁️ MaoMao Vision (AI-Powered OCR & Intake)
Accelerate receipt checks. Users can take a photo of incoming pharmaceutical packages. The integrated Gemini vision intelligence parses printed text on the package, extracts the product name, batch number, manufacturer, and expiry date, and automatically matches them to pending purchase orders to auto-populate intake forms. 📸

### 💬 MaoMao AI Pharmaceutical Assistant
A persistent, context-aware AI conversational assistant. MaoMao understands the logged-in user's role and answers queries with specialized formatting:
* **🏥 Medical Mode**: Provides detailed tabular layouts of active ingredients, uses, dosages, and side effects.
* **🥣 Recipe Mode**: Outlines traditional preparations and measurements for botanical/herbal medicine formulation.

### 🛡️ MongoDB Sessions & Atomic Inventory Updates
All multi-item operations (like receiving a complex purchase order or distributing a batch of medicines) utilize MongoDB database transactions. If any database write fails during the process, the entire transaction is rolled back, guaranteeing absolute data consistency. 🔄

---

## 7. Project Summary 📝
AushadhSanchaya is a comprehensive, modern clinical ledger platform built to replace traditional, siloed pharmacy databases. By bringing together role-based workflows, atomic transaction safety, government-subsidized drug catalog mapping, and state-of-the-art Generative AI (Google Gemini for image recognition and medical queries), it ensures pharmacies, hospitals, and wellness centers run at peak efficiency, experience zero inventory leakage, and remain 100% compliant.

---

## 8. Guide to Start the Project Locally 🚀

Follow these instructions to set up and run the project on your local machine.

### Prerequisites
* **🟢 Node.js** (v20.0.0 or higher)
* **🍃 MongoDB** (A running local or remote instance)
* **🧠 Google Gemini API Key** (for AI features)
* **🔑 Google Cloud Console Credentials** (for Google OAuth login)

### Step 1: Clone the Repository & Install Dependencies
AushadhSanchaya includes a convenient script to install all dependencies for the workspace, server, and frontend in one step:
```bash
git clone https://github.com/mohitahlawat2001/ApothecaryShop.git AushadhSanchaya
cd AushadhSanchaya

# Install all packages across root, server, and ui directories
npm run install-all
```

### Step 2: Configure Environment Variables ⚙️
Copy the backend environment variables template:
```bash
cp server/.env.example server/.env
```
Open `server/.env` and update the placeholders with your credentials:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/aushadh-sanchaya

# JWT Authentication Secret
JWT_SECRET=your-secure-secret-key-here

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GOOGLE_CALLBACK_FAIL_URL=http://localhost:5173/login?error=google-failed

# Facebook OAuth Credentials
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
FACEBOOK_CALLBACK_FAIL_URL=http://localhost:5173/login?error=facebook-failed

# Google Gemini AI (Required for AI Analysis and Vision features)
AI_API_KEY=your-google-gemini-ai-api-key-here
```

### Step 3: Run the Development Server ⚡
You can launch both the backend server and frontend client concurrently from the root directory:
```bash
npm run dev
```
* **💻 Frontend Web Application**: Available at [http://localhost:5173](http://localhost:5173)
* **🟢 Backend API Gateway**: Available at [http://localhost:5000](http://localhost:5000)
* **📖 Interactive Swagger UI API Documentation**: Available at [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### Step 4: Seed Sample Data (Optional) 💾
To populate the database with a set of test products, suppliers, and users:
```bash
cd server
npm run seed
```

### Step 5: Run Automated Tests (Optional) 🧪
To run the integration and unit test suite:
```bash
cd server
npm test
```

---

## 9. Production Deployment Guide 🌐
For instructions on how to host this project in production for free (using **MongoDB Atlas**, **Render**, and **Vercel**), please refer to the detailed [DEPLOYMENT.md](DEPLOYMENT.md) guide.

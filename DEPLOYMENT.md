# 🚀 Deploying AushadhSanchaya on Free Tier Services

This guide provides step-by-step instructions to deploy the **AushadhSanchaya** platform (React frontend, Node/Express backend, and MongoDB database) completely for free.

---

## 📋 Table of Contents
- [Approach 1: Unified Monolith Deployment (Recommended) 🌟](#approach-1-unified-monolith-deployment-recommended-)
- [Approach 2: Split Services Deployment (Separate Frontend & Backend) 🔄](#approach-2-split-services-deployment-separate-frontend--backend-)

---

## 🌟 Approach 1: Unified Monolith Deployment (Recommended)
This approach deploys both the frontend and backend to the **same Render Web Service** (`https://aushadhsanchaya.onrender.com`). Express serves the static React files directly, meaning:
* **No CORS configuration errors** (same origin).
* **Single service to manage** (saving Render free slots).
* **Relative routing** (e.g. `/api` requests go to the same server automatically).

### 🍃 Step 1: Set up MongoDB Atlas (Free Database)
1. Register for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster under the **M0 Shared (Free)** tier.
3. In **Network Access**, add IP address `0.0.0.0/0` (Allow connection from anywhere).
4. Create a database username and password under **Database Access**.
5. Copy your connection string:
   `mongodb+srv://<username>:<password>@cluster.mongodb.net/aushadh-sanchaya?retryWrites=true&w=majority`
   *(Replace `<username>` and `<password>` with your created database credentials).*

### 📁 Step 2: Push Local Code to GitHub
We have pre-configured `package.json` and `server.js` to build and serve the static files in production. Push the current local changes to your repository:
```bash
git add .
git commit -m "setup: configure unified monolithic build and static files serving"
git push
```

### 🟢 Step 3: Deploy the Single Web Service on Render
1. Go to your [Render Dashboard](https://render.com) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings exactly as follows:
   * **Name**: `aushadhsanchaya`
   * **Root Directory**: *(Leave completely blank - this builds from the project root)*
   * **Environment**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm run start`
   * **Instance Type**: `Free`
4. Expand **Advanced** and add the following **Environment Variables**:
   
   | Key | Value | Description |
   |:---|:---|:---|
   | `NODE_ENV` | `production` | Triggers Express to build and serve the React UI. |
   | `MONGO_URI` | *Your MongoDB Atlas Connection String* | The connection string from Step 1. |
   | `JWT_SECRET` | *Your JWT Secret* | Secure signature secret. |
   | `AI_API_KEY` | *Your Gemini API Key* | Required to enable MaoMao AI and vision features. |
   | `GOOGLE_CLIENT_ID` | *Your Google OAuth Client ID* | Google OAuth Client ID. |
   | `GOOGLE_CLIENT_SECRET` | *Your Google OAuth Client Secret* | Google OAuth Client Secret. |

5. Click **Create Web Service**. Render will now install root dependencies, build the React frontend, build the backend server, and boot the application.
6. Once deployed, open `https://aushadhsanchaya.onrender.com` in your browser. You will see the leaf loading animation, landing page, and fully functional app working end-to-end!

---

## 🔄 Approach 2: Split Services Deployment (Separate Frontend & Backend)
Use this option if you want to deploy the frontend on a separate service (like **Vercel** or a separate **Render Static Site**) and keep the backend purely as an API server.

### Step 1: Deploy MongoDB Atlas
*(Same instructions as Step 1 in Approach 1 above).*

### Step 2: Deploy Backend to Render (Web Service)
1. Create a **Web Service** on Render.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `AI_API_KEY`, and `FRONTEND_URL` (update this once your frontend is created).
6. Copy your deployed API URL (e.g. `https://aushadhsanchaya.onrender.com`).

### Step 3: Deploy Frontend (Vercel or Render Static Site)
* **Vite API URL Configuration**:
  * Set `VITE_API_URL` to `https://aushadhsanchaya.onrender.com/api` (your backend URL + `/api`).

#### Option A: Deploy to Vercel
1. Create a project on Vercel, pointing to the `ui` root directory.
2. Set `VITE_API_URL` under Environment Variables.
3. Click **Deploy** and copy the Vercel URL (e.g., `https://aushadh-sanchaya.vercel.app`).

#### Option B: Deploy to Render (Static Site)
1. Create a **Static Site** on Render pointing to the `ui` root directory.
2. Set **Build Command**: `npm run build` and **Publish Directory**: `dist`.
3. Set `VITE_API_URL` under Environment Variables.
4. Set up Client-Side Routing: Go to **Redirects/Rewrites**, click **Add Rule**, set source to `/*`, destination to `/index.html`, and Action to `Rewrite`.
5. Click **Create Static Site** and copy your frontend URL.

### Step 4: Whitelist Frontend CORS on Backend
Go back to your Backend Web Service on Render, navigate to **Environment**, and update `FRONTEND_URL` with your frontend URL.

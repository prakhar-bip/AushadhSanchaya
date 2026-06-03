# 🚀 Deploying AushadhSanchaya on Free Tier Services

This guide provides step-by-step instructions to deploy the entire **AushadhSanchaya** platform (React frontend, Node/Express backend, and MongoDB database) completely for free using popular developer cloud services.

---

## 📋 Overview of Free Tier Stack
To host the application without incurring costs, we will use the following setup:
1. **Database 🍃**: **MongoDB Atlas** (M0 Free Tier - 512MB storage, hosted in AWS/GCP, free forever).
2. **Backend Server 🟢**: **Render** (Web Service - Free CPU/RAM tier, ideal for Node/Express).
3. **Frontend Client ⚛️**: **Vercel** (Hobby Tier - Global CDN, automatic routing, free forever, optimized for Vite/React).

---

## 🍃 Step 1: Deploy MongoDB Atlas (Free Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. Create a new project named `AushadhSanchaya`.
3. Build a Database:
   * Select **M0 (Shared)** Cluster (Free Tier).
   * Choose your preferred Provider (AWS or Google Cloud) and nearest Region.
   * Click **Create**.
4. Set up security credentials:
   * **Database User**: Create a username and secure password. Save these credentials.
   * **Network Access**: Add IP address `0.0.0.0/0` (Allow Access from Anywhere) so Render servers can connect.
5. Get your Connection String:
   * Click **Connect** → **Drivers**.
   * Copy the connection string. It will look like:
     `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`
   * Replace `<username>` and `<password>` with the database credentials you just created, and add a database name (e.g., `aushadh-sanchaya`) right before the `?` character.

---

## 🟢 Step 2: Deploy Backend Server to Render
Render provides a free Web Services hosting plan. Since Render's free tier instances sleep after 15 minutes of inactivity, note that the first API request after a sleep period will take ~50 seconds to complete (cold start).

### Preparation
1. Ensure your codebase is pushed to a remote GitHub or GitLab repository.
2. Sign up on [Render](https://render.com) using your GitHub account.

### Deploying the Web Service
1. On the Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository containing AushadhSanchaya.
3. Configure the service settings:
   * **Name**: `aushadh-sanchaya-api`
   * **Root Directory**: `server` (Important: points to the backend subfolder).
   * **Environment**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
   * **Instance Type**: `Free`
4. Expand the **Advanced** section and add the following **Environment Variables**:
   
   | Key | Value | Description |
   |:---|:---|:---|
   | `NODE_ENV` | `production` | Enables production mode. |
   | `PORT` | `10000` | Port Render uses to bind services. |
   | `MONGO_URI` | *Your MongoDB Atlas Connection String* | The connection string from Step 1. |
   | `JWT_SECRET` | *A random secure string* | Secret key for signing authorization tokens. |
   | `AI_API_KEY` | *Your Gemini API Key* | API Key to run MaoMao AI and Vision utilities. |
   | `FRONTEND_URL` | `https://your-app-name.vercel.app` | **(Set this after Step 3)** Frontend URL for CORS. |
   | `GOOGLE_CLIENT_ID` | *Your Google Client ID* | Optional: For Google OAuth integration. |
   | `GOOGLE_CLIENT_SECRET` | *Your Google Client Secret* | Optional: For Google OAuth integration. |

5. Click **Create Web Service**. Render will build and launch your backend server.
6. Once deployed, Render will provide a public URL (e.g., `https://aushadh-sanchaya-api.onrender.com`). Copy this URL.

---

## ⚛️ Step 3: Deploy React Frontend (Choose Option A or B)

You can host the React frontend either on **Vercel** (recommended for speed and performance) or directly on **Render** as a free **Static Site**.

### ⚡ Option A: Deploy Frontend to Vercel (Recommended)
Vercel is the optimal host for React + Vite. It is fast, free, and reads routing configurations automatically.
1. Sign up on [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New** → **Project**.
3. Import your GitHub repository.
4. Configure the Project Settings:
   * **Framework Preset**: `Vite` (automatically detected).
   * **Root Directory**: `ui` (Important: points to the frontend React subfolder).
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://aushadh-sanchaya-api.onrender.com/api` (Replace with your Render Backend URL from Step 2, and ensure `/api` is added to the end).
6. Click **Deploy**. Vercel will build your static files and deploy the frontend.
7. Once completed, Vercel will provide your live application URL (e.g., `https://aushadh-sanchaya.vercel.app`).

---

### 🟢 Option B: Deploy Frontend to Render (Static Site)
Render allows you to host static websites 100% free with no sleep time, meaning the frontend itself is always instantly loaded.
1. Sign up/Log in on [Render](https://render.com).
2. On the Render Dashboard, click **New +** and select **Static Site**.
3. Connect your GitHub repository containing AushadhSanchaya.
4. Configure the static site settings:
   * **Name**: `aushadh-sanchaya-ui`
   * **Root Directory**: `ui` (Important: points to the frontend React subfolder).
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
5. Expand the **Advanced** section and add the following **Environment Variable**:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://aushadh-sanchaya-api.onrender.com/api` (Replace with your Render Backend URL from Step 2, and ensure `/api` is added to the end).
6. Configure Client Routing (Required for React Router):
   * Go to your static site dashboard on Render.
   * Click **Redirects/Rewrites** in the sidebar.
   * Click **Add Rule** and enter:
     * **Source Path**: `/*`
     * **Destination Path**: `/index.html`
     * **Action**: `Rewrite`
7. Click **Create Static Site**. Render will build and host your frontend. Copy the URL (e.g., `https://aushadh-sanchaya-ui.onrender.page`).

---

## 🔄 Step 4: Link Frontend and Backend (CORS Handshake)
To allow your frontend to communicate with your backend successfully, we must update the backend CORS settings:
1. Go back to your **Render Dashboard** and open your `aushadh-sanchaya-api` Web Service (backend).
2. Navigate to the **Environment** tab.
3. Locate the `FRONTEND_URL` environment variable.
4. Update its value to your exact Vercel frontend URL (from Option A) or Render static site URL (from Option B) — e.g. `https://aushadh-sanchaya.vercel.app` or `https://aushadh-sanchaya-ui.onrender.page` (do not add a trailing slash).
5. Save the environment changes. Render will automatically redeploy the backend with the new configuration.

---

## 🔑 Step 5: Configuring OAuth Credentials (Optional)
If you wish to keep Google Login active in production, you must update your Google Cloud Console credentials:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project and navigate to **APIs & Services** → **Credentials**.
3. Edit your OAuth 2.0 Web Application client:
   * **Authorized JavaScript Origins**: Add your frontend URL (from Vercel or Render).
   * **Authorized Redirect URIs**: If using redirect OAuth, add:
     `https://aushadh-sanchaya-api.onrender.com/api/auth/google/callback`.
4. Click **Save**. Note that Google credential updates may take up to 5-10 minutes to propagate globally.

---

## ⚠️ Free Tier Limitations & Best Practices
> [!WARNING]
> **Render Cold Starts**
> Render puts Free Web Services to sleep after 15 minutes of inactivity. When a user visits the Vercel site, the login or signup request may spin for 30–50 seconds while Render wakes the backend. Consider adding a notice on your landing page informing users of this 50-second startup latency.

> [!TIP]
> **Keep-Alive Ping (Optional)**
> To prevent your backend from sleeping, you can set up a free account on a monitoring service like [UptimeRobot](https://uptimerobot.com) to ping your Render backend URL (e.g., `https://aushadh-sanchaya-api.onrender.com/api-docs` or `https://aushadh-sanchaya-api.onrender.com/health` if configured) every 10–14 minutes.

> [!NOTE]
> **MongoDB Storage Limits**
> The MongoDB Atlas M0 cluster has a storage limit of 512MB. Avoid uploading extremely large image files for product vision analysis or limit testing datasets to conserve capacity.

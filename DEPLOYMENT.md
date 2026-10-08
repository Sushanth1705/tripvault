# 🚀 TripVault Deployment Guide

TripVault is configured for seamless deployment:
- **Backend API**: [Render](https://render.com) (Node.js Web Service)
- **Frontend App**: [Vercel](https://vercel.com) (React SPA with Vite)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Photo Storage**: [Cloudinary](https://cloudinary.com)

---

## 1. MongoDB Atlas Configuration
1. Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Under **Network Access**, ensure IP `0.0.0.0/0` is added (Allow Access from Anywhere) so Render and your local machine can connect.
3. Under **Database Access**, ensure your database user has read and write privileges.

---

## 2. Deploy Backend API to Render

1. Push your repository to GitHub.
2. Sign in to [Render](https://dashboard.render.com/) and click **New +** → **Web Service**.
3. Connect your GitHub repository: `TripVault`.
4. Configure the Web Service settings:
   - **Name**: `tripvault-api`
   - **Region**: Closest to you (e.g., Singapore, Oregon, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. In the **Environment Variables** section, add the following keys from your `server/.env`:
   - `MONGO_URI` = `<your MongoDB Atlas connection string>`
   - `JWT_SECRET` = `<your secure secret string>`
   - `CLOUDINARY_CLOUD_NAME` = `<your Cloudinary cloud name>`
   - `CLOUDINARY_API_KEY` = `<your Cloudinary API key>`
   - `CLOUDINARY_API_SECRET` = `<your Cloudinary API secret>`
   - `CLIENT_URL` = `*` (or your Vercel URL once created)
   - `PORT` = `5050`
6. Click **Deploy Web Service**.
7. Once deployed, copy your Render service URL (e.g., `https://tripvault-api.onrender.com`).
   - Health check: Open `https://tripvault-api.onrender.com/` in your browser. You should see `{"message":"TripVault API is running"}`.

---

## 3. Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com/) and click **Add New...** → **Project**.
2. Select your `TripVault` repository.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://your-render-service.onrender.com/api`
     *(Replace with your actual Render API URL from Step 2, appending `/api`)*
5. Click **Deploy**.
6. Once deployed, Vercel gives you a live domain (e.g., `https://tripvault.vercel.app`).
   - SPA route rewrites are pre-configured in `client/vercel.json`, so page refreshes and direct URLs (`/dashboard`, `/profile/:username`, `/trips/:id`) work without 404 errors.

---

## 4. Final Connection Step
Go back to your Render Dashboard for `tripvault-api`:
- Update `CLIENT_URL` to match your Vercel URL (e.g., `https://tripvault.vercel.app`).

---

## 5. Verification Checklist
- [ ] Open your live Vercel URL.
- [ ] Test the **Theme Switcher** (toggle between Light and Dark mode).
- [ ] Register a new account at `/register`.
- [ ] Create a trip with a cover photo.
- [ ] Click **View** on the trip card to inspect the high-resolution hero image and photo gallery.
- [ ] Click on the image to open the fullscreen **ImageViewerModal** (test zoom, pan, close).
- [ ] Check footer attribution: **Built by Sushanth**.
- [ ] View your public profile at `/profile/<username>`.

# TripVault

TripVault is a MERN travel memory journal for saving trips, photos, ratings, and stories in one private collection. Public profiles let travellers share selected memories without exposing account credentials.

Screenshot: the current login experience is available at `/login` when running the app locally or through the live demo below.

## Live Demo

- Frontend: `https://your-tripvault.vercel.app`
- API health check: `https://your-tripvault-api.onrender.com/`

Replace these placeholders after deploying and add the live frontend URL to the GitHub repository description.

## Features

- JWT authentication with registration, login, and protected routes
- Trip CRUD with dates, descriptions, ratings, and cover photos
- Cloudinary photo uploads with file type and size validation
- Public traveller profiles and shared trip cards
- Responsive dashboard, mobile navigation, loading skeletons, empty states, readable errors, and toast feedback

## Tech Stack

- React and Vite
- Node.js and Express
- MongoDB with Mongoose
- JWT and bcryptjs
- Cloudinary and Multer
- Render for the API and Vercel for the frontend

## Run Locally

Prerequisites: Node.js 18+, npm, a MongoDB Atlas database, and a Cloudinary account for photo uploads.

```bash
git clone <your-repository-url>
cd TripVault

cd server
npm install
copy .env.example .env
# Fill in MONGO_URI, JWT_SECRET, CLIENT_URL, and Cloudinary credentials.
npm run dev
```

In another terminal:

```bash
cd TripVault/client
npm install
copy .env.example .env
# Leave VITE_API_URL empty for local development to use the Vite proxy.
npm run dev
```

Open `http://localhost:5173`.

## Environment Variables

Never commit `.env` files. Use `server/.env.example` and `client/.env.example` as templates.

The production client variable must include the API prefix:

```text
VITE_API_URL=https://your-render-service.onrender.com/api
```

## Deployment

### Render API

1. Create a Render Web Service from this repository.
2. Set the root directory to `server`, build command to `npm install`, and start command to `npm start`.
3. Add `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the Render dashboard.
4. Set `CLIENT_URL` to the final Vercel URL after the frontend is deployed.

The root `render.yaml` contains the service defaults and marks secrets as dashboard-managed.

### Vercel frontend

1. Import the repository into Vercel.
2. Set the project root to `client` and keep the Vite build command as `npm run build`.
3. Add `VITE_API_URL` with the deployed Render URL ending in `/api`.
4. Redeploy after setting the variable. `client/vercel.json` keeps React Router routes working on refresh.

### End-to-end check

After both deployments, verify registration, login, trip creation, photo upload, trip deletion, and a public profile in a private browser window. Test at iPhone SE and iPad widths in Chrome DevTools and confirm there is no horizontal scrolling.

## Project Structure

```text
TripVault/
├── client/   React/Vite frontend
├── server/   Express/MongoDB API
├── render.yaml
└── README.md
```

## License

This project is available for personal and educational use.

# TripVault - Travel Memory Journal
## Week 1: Project Setup & Authentication

A full-stack MERN application for users to log trips, upload photos, and share travel memories.

### 📋 Overview

This Week 1 submission includes:
- ✅ Express backend with MongoDB integration
- ✅ User authentication with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ React frontend with Vite
- ✅ Authentication flow (Register → Login → Dashboard)
- ✅ Responsive UI
- ✅ Authenticated trip CRUD operations
- ✅ Per-user trip ownership enforcement
- ✅ Create, edit, delete, loading, empty, and error states

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for frontend integration

**Frontend:**
- React 18 with Vite
- React Router for page navigation
- Axios for API requests
- CSS for styling

---

## 📁 Project Structure

```
tripvault/
├── client/                          ← React Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           ← Login page
│   │   │   ├── Register.jsx        ← Registration page
│   │   │   └── Dashboard.jsx       ← Protected dashboard
│   │   ├── components/
│   │   │   ├── PrivateRoute.jsx    ← Route protection
│   │   │   └── TripForm.jsx        ← Create/edit trip form
│   │   ├── context/
│   │   │   └── AuthContext.jsx     ← Auth state management
│   │   ├── App.jsx                 ← Main app component
│   │   ├── App.css                 ← Application styles
│   │   ├── index.css               ← Global styles
│   │   └── main.jsx                ← React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
│
├── server/                          ← Node.js Express Backend
│   ├── models/
│   │   ├── User.js                 ← User schema
│   │   └── Trip.js                 ← Trip schema
│   ├── routes/
│   │   ├── auth.js                 ← Auth endpoints
│   │   └── trips.js                ← Protected trip CRUD endpoints
│   ├── middleware/
│   │   └── authMiddleware.js       ← JWT verification
│   ├── index.js                    ← Server entry point
│   ├── .env                        ← Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
└── README.md                        ← This file
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+) and npm
- MongoDB Atlas account (free tier)
- Git

### 1. Clone and Navigate

```bash
git clone https://github.com/yourusername/tripvault.git
cd tripvault
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5050

# Start the server
npm run dev
```

The backend will run on `http://localhost:5050`

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 🔑 Environment Variables

**Backend (.env):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/TripVault?appName=Cluster0
JWT_SECRET=your_secure_secret_key_here
PORT=5050
```

**Frontend:**
The frontend automatically proxies `/api` requests to `http://localhost:5050` (see `vite.config.js`)

---

## 📡 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user, return JWT | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response (201):
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer {token}

Response (200):
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 🧳 Week 2: Trip Management

All trip endpoints require `Authorization: Bearer <token>`. The server takes the owner from the verified JWT (`req.user.userId`); the client cannot set or change the `user` field.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/trips` | Create a trip for the logged-in user | Yes |
| GET | `/api/trips` | List only the logged-in user's trips | Yes |
| GET | `/api/trips/:id` | Get one owned trip | Yes |
| PUT | `/api/trips/:id` | Update an owned trip | Yes |
| DELETE | `/api/trips/:id` | Delete an owned trip | Yes |

Trip fields are `title`, `destination`, `startDate`, `endDate`, `description`, and `rating` (1-5), plus the required `user` reference and Mongoose timestamps. Invalid IDs return `400`, missing trips return `404`, and attempts to access another user's trip return `403`.

Example create/update body:

```json
{
  "title": "Goa Trip",
  "destination": "Goa",
  "startDate": "2026-08-20",
  "endDate": "2026-08-25",
  "description": "Beach vacation with friends",
  "rating": 5
}
```

The protected Dashboard fetches trips with the existing Axios instance and interceptor, displays responsive trip cards, and supports create, pre-filled edit, confirmation-based delete, empty state, loading feedback, and user-friendly errors.

## 🧪 Testing the Flow

### Using Postman or Thunder Client:

1. **Register a user**
   - POST to `http://localhost:5050/api/auth/register`
   - Body: `{ "name": "Your Name", "email": "you@example.com", "password": "pass123" }`

2. **Login**
   - POST to `http://localhost:5050/api/auth/login`
   - Body: `{ "email": "you@example.com", "password": "pass123" }`
   - Save the returned `token`

3. **Get your info**
   - GET to `http://localhost:5050/api/auth/me`
   - Header: `Authorization: Bearer {your_token}`

4. **Test trip CRUD**
  - POST a valid body to `http://localhost:5050/api/trips` and save the returned `trip._id`.
  - GET `/api/trips` and GET `/api/trips/:id`.
  - PUT `/api/trips/:id` with changed trip fields.
  - DELETE `/api/trips/:id` and confirm it is removed.
  - Repeat with a second account's token: the other user's trip must return `403` for GET, PUT, and DELETE.
  - Also try no token, an invalid token, an invalid ID such as `not-an-id`, and a nonexistent ObjectId.

### In the Browser:

1. Open `http://localhost:5173`
2. Click "Register" and create an account
3. Login with your credentials
4. You'll see your profile on the dashboard
5. Click "Create Trip", then use Edit and Delete on the trip card.
6. Click "Logout" to clear session

---

## 🔐 Security Features

✅ **Passwords:** Hashed with bcryptjs (salt rounds: 10)
✅ **JWT:** Token-based authentication with 7-day expiration
✅ **Protected Routes:** Dashboard requires valid token
✅ **CORS:** Configured to allow frontend communication
✅ **.env:** Never committed to Git (added to .gitignore)
✅ **Validation:** Input validation on all auth routes

---

## 📊 Git Commit History

Here are the key commits made for Week 1:

```
commit: Backend server setup with Express and MongoDB
commit: User model schema implementation
commit: Authentication middleware with JWT
commit: Register endpoint implementation
commit: Login endpoint implementation
commit: Protected /me endpoint
commit: React Vite project initialization
commit: Authentication context setup
commit: Login and Register pages
commit: Dashboard page with user info
commit: React Router configuration
commit: Styling and responsive design
commit: Documentation and README
```

---

## 🚀 Next Steps (Week 2-4)

- [ ] Add trip creation (POST /api/trips)
- [ ] Implement photo uploads to AWS S3
- [ ] Trip listing and filtering
- [ ] Share trips with friends
- [ ] Comments and reactions
- [ ] Search functionality
- [ ] User profile customization

---

## 📝 Notes

- **Database:** Using MongoDB Atlas free tier
- **Frontend Port:** 5173 (Vite default)
- **Backend Port:** 5050
- **Token Storage:** localStorage (can upgrade to secure cookies later)
- **CORS:** Enabled for `http://localhost:5173`

---

## ❓ Troubleshooting

**MongoDB Connection Error:**
- Verify MongoDB URI in .env
- Check IP whitelist on MongoDB Atlas
- Ensure database is active

**CORS Error:**
- Backend must be running on port 5050
- CORS is configured in server/index.js

**Token Not Working:**
- Check token format: `Authorization: Bearer {token}`
- Verify JWT_SECRET matches between register and login
- Check token expiration (set to 7 days)

**Frontend can't reach backend:**
- Ensure backend is running on `http://localhost:5050`
- Check Vite proxy in `vite.config.js`
- Clear browser cache and restart dev server

---

## 👤 Author

Created for CodGen's Virtual Internship Program - Full Stack (MERN)

---

## 📄 License

ISC

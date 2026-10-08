const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
    console.warn("Could not set custom DNS servers:", dnsErr.message);
}

// Load env from current directory or parent directory
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || true
}));
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const userRoutes = require("./routes/users");
const multer = require("multer");

// Health check and root route
app.get("/", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.json({
        message: "TripVault API is running",
        database: isDbConnected ? "connected" : "connecting/disconnected",
        timestamp: new Date().toISOString()
    });
});

// Middleware to check database connection on API routes
app.use("/api", (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database connection in progress. Please ensure your current IP address (or 0.0.0.0/0) is whitelisted under Network Access in MongoDB Atlas (cloud.mongodb.com)."
        });
    }
    next();
});

// Auth & Resource routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);

// Upload & error middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        const message = error.code === "LIMIT_FILE_SIZE"
            ? "Image must be smaller than 5 MB"
            : "Please upload a valid image file";
        return res.status(400).json({ message });
    }

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({ message: "Invalid JSON format in request" });
    }

    console.error("Server error:", error);
    return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
});

const PORT = process.env.PORT || 5050;

// Start HTTP server immediately
const server = app.listen(PORT, () => {
    console.log(`🚀 TripVault API server running on http://localhost:${PORT}`);
});

// Resilient MongoDB connection with local fallback and auto-retry
const connectWithRetry = async () => {
    const atlasUri = process.env.MONGO_URI;
    const localUri = "mongodb://127.0.0.1:27017/tripvault";

    if (atlasUri) {
        try {
            console.log("Connecting to MongoDB Atlas...");
            await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 4000 });
            console.log("✅ MongoDB Atlas connected successfully!");
            return;
        } catch (atlasErr) {
            console.warn("⚠️ MongoDB Atlas connection error:", atlasErr.message);
            console.warn("👉 Make sure your IP is whitelisted under Network Access in MongoDB Atlas (https://cloud.mongodb.com).");
        }
    }

    // Try local MongoDB if Atlas fails
    try {
        console.log("Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/tripvault)...");
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
        console.log("✅ Connected to local MongoDB service for seamless development!");
        return;
    } catch (localErr) {
        console.error("❌ Local MongoDB also unavailable:", localErr.message);
    }

    console.log("Retrying database connection in 10s...");
    setTimeout(connectWithRetry, 10000);
};

connectWithRetry();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const userRoutes = require("./routes/users");
const multer = require("multer");

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "TripVault API is running"
    });
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/users", userRoutes);

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        const message = error.code === "LIMIT_FILE_SIZE"
            ? "Image must be smaller than 5 MB"
            : "Please upload a valid image file";
        return res.status(400).json({ message });
    }

    if (error) {
        console.error("Upload error:", error);
        return res.status(502).json({ message: "Image upload failed. Check your Cloudinary configuration." });
    }

    return next();
});

const PORT = process.env.PORT || 5050;

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });
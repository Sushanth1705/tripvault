const express = require("express");
const User = require("../models/User");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:username/profile", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username.toLowerCase() })
            .select("name username bio");

        if (!user) return res.status(404).json({ message: "Profile not found" });

        const trips = await Trip.find({ user: user._id })
            .select("title destination startDate endDate rating coverImage")
            .sort({ createdAt: -1 });

        return res.json({ user, trips });
    } catch (error) {
        console.error("Public profile error:", error);
        return res.status(500).json({ message: "Unable to load profile" });
    }
});

router.put("/profile", authMiddleware, async (req, res) => {
    const { username, bio } = req.body;
    if (username !== undefined && !/^[a-z0-9_]{3,30}$/i.test(username.trim())) {
        return res.status(400).json({ message: "Username must be 3-30 letters, numbers, or underscores" });
    }

    try {
        const updates = {};
        if (username !== undefined) updates.username = username.trim().toLowerCase();
        if (bio !== undefined) updates.bio = bio.trim();
        const user = await User.findByIdAndUpdate(req.user.userId, updates, {
            new: true, runValidators: true
        }).select("name username bio email");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json({ message: "Profile updated successfully", user: { id: user._id, name: user.name, email: user.email, username: user.username, bio: user.bio } });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: "Username is already taken" });
        console.error("Profile update error:", error);
        return res.status(500).json({ message: "Unable to update profile" });
    }
});

module.exports = router;

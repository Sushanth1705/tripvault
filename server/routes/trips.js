const express = require("express");
const mongoose = require("mongoose");

const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

const allowedFields = [
    "title",
    "destination",
    "startDate",
    "endDate",
    "description",
    "rating"
];

const getTripData = (body) => {
    const tripData = {};

    allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            tripData[field] = body[field];
        }
    });

    return tripData;
};

const validateTripData = (tripData, isCreate = false) => {
    if (isCreate && !tripData.title) {
        return "Title is required";
    }

    if (isCreate && !tripData.destination) {
        return "Destination is required";
    }

    if (tripData.title !== undefined && !String(tripData.title).trim()) {
        return "Title is required";
    }

    if (tripData.destination !== undefined && !String(tripData.destination).trim()) {
        return "Destination is required";
    }

    if (tripData.rating !== undefined && tripData.rating !== "" &&
        (Number.isNaN(Number(tripData.rating)) || Number(tripData.rating) < 1 || Number(tripData.rating) > 5)) {
        return "Rating must be a number between 1 and 5";
    }

    for (const field of ["startDate", "endDate"]) {
        if (tripData[field] !== undefined && tripData[field] !== "" && Number.isNaN(Date.parse(tripData[field]))) {
            return `${field} must be a valid date`;
        }
    }

    if (tripData.startDate && tripData.endDate && new Date(tripData.endDate) < new Date(tripData.startDate)) {
        return "End date cannot be before start date";
    }

    return null;
};

const handleDatabaseError = (error, res) => {
    if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ message: "Invalid trip data" });
    }

    console.error("Trip operation error:", error);
    return res.status(500).json({ message: "Server error while processing trip" });
};

router.use(authMiddleware);

router.post("/", async (req, res) => {
    try {
        const tripData = getTripData(req.body || {});
        const validationError = validateTripData(tripData, true);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const trip = await Trip.create({
            ...tripData,
            user: req.user.userId
        });

        return res.status(201).json({
            message: "Trip created successfully",
            trip
        });
    } catch (error) {
        return handleDatabaseError(error, res);
    }
});

router.get("/", async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, trips });
    } catch (error) {
        return handleDatabaseError(error, res);
    }
});

router.get("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid trip ID" });
    }

    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not authorized to access this trip" });
        }

        return res.status(200).json({ trip });
    } catch (error) {
        return handleDatabaseError(error, res);
    }
});

router.put("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid trip ID" });
    }

    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not authorized to update this trip" });
        }

        const tripData = getTripData(req.body || {});
        const validationError = validateTripData(tripData);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const effectiveStartDate = tripData.startDate || trip.startDate;
        const effectiveEndDate = tripData.endDate || trip.endDate;

        if (effectiveStartDate && effectiveEndDate && new Date(effectiveEndDate) < new Date(effectiveStartDate)) {
            return res.status(400).json({ message: "End date cannot be before start date" });
        }

        Object.assign(trip, tripData);
        await trip.save();

        return res.status(200).json({
            message: "Trip updated successfully",
            trip
        });

    } catch (error) {
        return handleDatabaseError(error, res);
    }
});

router.post("/:id/upload", upload.single("image"), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid trip ID" });
    if (!req.file) return res.status(400).json({ message: "An image file is required" });
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });
        if (trip.user.toString() !== req.user.userId) return res.status(403).json({ message: "You are not authorized to update this trip" });
        trip.photos.push(req.file.path);
        if (!trip.coverImage) trip.coverImage = req.file.path;
        await trip.save();
        return res.status(201).json({ message: "Photo uploaded successfully", trip });
    } catch (error) {
        return handleDatabaseError(error, res);
    }
});

router.delete("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid trip ID" });
    }

    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: "Trip not found" });
        }

        if (trip.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not authorized to delete this trip" });
        }

        await trip.deleteOne();
        return res.status(200).json({ message: "Trip deleted successfully" });
    } catch (error) {
        return handleDatabaseError(error, res);
    }
});

module.exports = router;

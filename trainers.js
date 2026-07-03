const express = require('express');
const router = express.Router();

// Trainers ka Dummy Data
let trainers = [
    { id: 1, name: "Anjali Sharma", specialty: "Yoga & Wellness", status: "Available" },
    { id: 2, name: "Rohit Sharma", specialty: "Heavy Weight Lifting", status: "Available" }
];

// 1. READ (Get all trainers)
router.get('/', (req, res) => res.json(trainers));

// 2. UPDATE (Trainer ka status change karna - Available/Leave)
router.put('/:id', (req, res) => {
    const trainer = trainers.find(t => t.id == req.params.id);
    if (trainer) trainer.status = trainer.status === "Available" ? "On Leave" : "Available";
    res.json({ success: !!trainer });
});

module.exports = router;
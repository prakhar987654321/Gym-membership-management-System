const express = require('express');
const router = express.Router();

let classes = [
    { id: 101, title: "Morning Yoga Shift", trainer: "Anjali Sharma", timing: "6AM - 7AM", booked: 15, total: 20 },
    { id: 102, title: "Heavy Weight Lifting", trainer: "Rohit Sharma", timing: "5PM - 6:30PM", booked: 5, total: 15 }
];

// 1. READ
router.get('/', (req, res) => res.json(classes));

// 2. CREATE (Prompt se dynamic add karna)
router.post('/add', (req, res) => {
    const newClass = { id: Date.now(), title: req.body.classname, trainer: req.body.trainer, timing: req.body.timing, booked: 0, total: parseInt(req.body.capacity) || 15 };
    classes.push(newClass);
    res.json({ success: true, class: newClass });
});

// 3. UPDATE (Book Slot)
router.put('/:id', (req, res) => {
    const target = classes.find(c => c.id == req.params.id);
    if (target && target.booked < target.total) {
        target.booked++;
        return res.json({ success: true });
    }
    res.json({ success: false });
});

// 4. DELETE
router.delete('/:id', (req, res) => {
    classes = classes.filter(c => c.id != req.params.id);
    res.json({ success: true });
});

module.exports = router;
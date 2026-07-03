const express = require('express');
const router = express.Router();

// Dynamic counters share karne ke liye endpoint
router.get('/stats', (req, res) => {
    res.json({
        attendance: 92,
        revenue: 125000
    });
});

module.exports = router;
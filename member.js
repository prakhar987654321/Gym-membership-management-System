const express = require('express');
const router = express.Router();

// Initial Mock Array (Browser refresh par data table me loaded rahega)
let members = [
    { id: 1, name: "Rahul Verma", plan: "Monthly", status: "Active" },
    { id: 2, name: "Priya Singh", plan: "Yearly", status: "Active" }
];

// 1. READ (Get all members)
router.get('/', (req, res) => res.json(members));

// 2. CREATE (Add member)
router.post('/', (req, res) => {
    members.unshift({ id: Date.now(), name: req.body.name, plan: req.body.plan, status: "Active" });
    res.json({ success: true });
    console.log("Current memory array in server memory:", members);
});

// 3. UPDATE (Toggle Status - Active/Expired)
router.put('/:id', (req, res) => {
    const member = members.find(m => m.id == req.params.id);
    if (member) member.status = member.status === "Active" ? "Expired" : "Active";
    res.json({ success: !!member });
    console.log("Updated memory array in server memory:", members);
});

// 4. DELETE (Remove Member)
router.delete('/:id', (req, res) => {
    members = members.filter(m => m.id != req.params.id);
    res.json({ success: true });
    console.log("Updated memory array in server memory:", members);
});
// Plan ke hisab se filter karna (Monthly / Yearly / Quarterly)
router.get('/filter/:plan', (req, res) => {
    const filtered = members.filter(m => m.plan.toLowerCase() === req.params.plan.toLowerCase());
    res.json(filtered);
});

module.exports = router;
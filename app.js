const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public')); // public folder (html/css/js) serve karega

// Saare routes ko unki sahi files ke sath map karna
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/members', require('./routes/member'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/trainers', require('./routes/trainers'));

app.listen(3000, () => console.log(" Gym Server Running on http://localhost:3000"));
/*require("dotenv").config();*/
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

// Models
const Member = require("./models/Member");
const Class = require("./models/Class");
const Trainer = require("./models/Trainer");
const Payment = require("./models/Payment");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
/*app.use(cors());*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB
mongoose
  .connect( "mongodb://127.0.0.1:27017/flexgym")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Error:", err));

// API ROUTES

// Dashboard Stats
app.get("/api/dashboard/stats", (req, res) => {
  Promise.all([
    Member.countDocuments(),
    Class.countDocuments(),
    Trainer.countDocuments({ status: "Available" }),
    Member.find().sort({ createdAt: -1 }).limit(4),
    Class.find().limit(3),
    Member.find(),
    Class.find(),
  ])
    .then(
      ([
        totalMembers,
        totalClasses,
        availableTrainers,
        recentMembers,
        upcomingClasses,
        allMembers,
        allClasses,
      ]) => {
        let revenue = 0;
        allMembers.forEach((m) => {
          if (m.plan === "Monthly") 
          revenue += 1000;
          else if (m.plan === "Quarterly") 
          revenue += 2500;
          else if (m.plan === "Annual") 
          revenue += 8000;
        });

        let totalBooked = 0,
          totalCapacity = 0;
        allClasses.forEach((c) => {
          totalBooked += c.booked;
          totalCapacity += c.total;
        });
        const attendance =
          totalCapacity > 0
            ? Math.round((totalBooked / totalCapacity) * 100)
            : 92;

        res.json({
          totalMembers,
          totalClasses,
          availableTrainers,
          revenue: revenue || 125000,
          attendance,
          recentMembers,
          upcomingClasses,
        });
      },
    )
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Members
app.get("/api/members", (req, res) => {
  Member.find().sort({ createdAt: -1 })//sabse naya member upar
    .then((members) =>
       res.json(members)
  )
    .catch((err) => 
      res.status(500).json({ error: err.message })
  );
});

app.post("/api/members", (req, res) => {
  const { name, email, plan } = req.body;
  if (name=="" || email=="")
    return res.status(400).json({ error: "Name & email required" });
  Member.create({ name, email, plan: plan || "Monthly" })
    .then((member) => {
      let amount = 0;
      if (member.plan === "Monthly") 
        amount = 1000;
      else if (member.plan === "Quarterly") 
        amount = 2500;
      else if (member.plan === "Annual")
        amount = 8000;
      return Payment.create({
        member: member._id,
        amount,
        plan: member.plan,
        status: "Completed",
      }).then(() => res.status(201).json(member));
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.put("/api/members/:id", (req, res) => {
  const { name, email, plan, status } = req.body;
  Member.findByIdAndUpdate(
    req.params.id,
    { name, email, plan, status },
    { new: true },
  )
    .then((member) =>
       res.json(member)
  )
    .catch((err) => 
      res.status(500).json({ error: err.message })
  );
});

app.patch("/api/members/:id/toggle", (req, res) => {
  Member.findById(req.params.id)
    .then((member) => {
      if (!member) return res.status(404).json({ error: "Not found" });
      member.status = member.status === "Active" ? "Expired" : "Active";
      return member.save();
    })
    .then((member) => res.json(member))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.delete("/api/members/:id", (req, res) => {
  Member.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true })
  )
    .catch((err) => res.status(500).json({ error: err.message })
  );
});

// Classes
app.get("/api/classes", (req, res) => {
  Class.find()
    .sort({ createdAt: -1 })
    .then((classes) => res.json(classes)
  )
    .catch((err) => res.status(500).json({ error: err.message })
  );
});

app.post("/api/classes", (req, res) => {
  const { title, trainer, timing, total } = req.body;
  if (title=="" || trainer=="")
    return res.status(400).json({ error: "Title & trainer required" });
  Class.create({
    title,
    trainer,
    timing: timing || "TBD",
    total: parseInt(total) || 20,
    booked: 0,
  })
    .then((cls) => res.status(201).json(cls))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.put("/api/classes/:id", (req, res) => {
  const { title, trainer, timing, total } = req.body;
  Class.findByIdAndUpdate(
    req.params.id,
    { title, trainer, timing, total: parseInt(total) || 20 },
    { new: true },
  )
    .then((cls) => res.json(cls))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.patch("/api/classes/:id/book", (req, res) => {
  Class.findById(req.params.id)
    .then((cls) => {
      if (!cls) return res.status(404).json({ error: "Class not found" });
      if (cls.booked >= cls.total)
        return res.status(400).json({ error: "Class full" });
      cls.booked += 1;
      return cls.save();
    })
    .then((cls) => res.json(cls))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.delete("/api/classes/:id", (req, res) => {
  Class.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Trainers
app.get("/api/trainers", (req, res) => {
  Trainer.find()
    .then((trainers) => res.json(trainers))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post("/api/trainers", (req, res) => {
  const { name, specialty, status } = req.body;
  if (!name || !specialty)
    return res.status(400).json({ error: "Name & specialty required" });
  Trainer.create({ name, specialty, status: status || "Available" })
    .then((trainer) => res.status(201).json(trainer))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.put("/api/trainers/:id", (req, res) => {
  const { name, specialty, status } = req.body;
  Trainer.findByIdAndUpdate(
    req.params.id,
    { name, specialty, status },
    { new: true },
  )
    .then((trainer) => res.json(trainer))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.delete("/api/trainers/:id", (req, res) => {
  Trainer.findByIdAndDelete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Payments
app.get("/api/payments", (req, res) => {
  Payment.find()
    .populate("member")
    .sort({ createdAt: -1 })
    .then((payments) => res.json(payments))
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Reports
app.get("/api/reports", (req, res) => {
  Promise.all([
    Member.countDocuments(),
    Member.countDocuments({ status: "Active" }),
    Class.countDocuments(),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    Member.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }]),
  ])
    .then(
      ([
        totalMembers,
        activeMembers,
        totalClasses,
        revenueResult,
        planDistribution,
      ]) => {
        const totalRevenue =
          revenueResult.length > 0 ? revenueResult[0].total : 0;
        res.json({
          totalMembers,
          activeMembers,
          totalClasses,
          totalRevenue,
          planDistribution,
        });
      },
    )
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Seed
// Seed – Members, Classes, Trainers AND Payments
app.get("/seed", (req, res) => {
  Member.deleteMany()
    .then(() => Class.deleteMany())
    .then(() => Trainer.deleteMany())
    .then(() => Payment.deleteMany())
    .then(() => {
      // Insert Members
      return Member.insertMany([
        {
          name: "Rahul Verma",
          email: "rahul@mail.com",
          plan: "Monthly",
          status: "Active",
        },
        {
          name: "Priya Singh",
          email: "priya@mail.com",
          plan: "Quarterly",
          status: "Active",
        },
        {
          name: "Aman Yadav",
          email: "aman@mail.com",
          plan: "Annual",
          status: "Expired",
        },
        {
          name: "Sneha Patel",
          email: "sneha@mail.com",
          plan: "Monthly",
          status: "Active",
        },
      ]);
    })
    .then((members) => {
      //insert classes
      return Promise.all([
        Class.insertMany([
          {
            title: "Morning Yoga Shift",
            trainer: "Anjali Sharma",
            timing: "6AM - 7AM",
            total: 20,
            booked: 15,
          },
          {
            title: "Heavy Weight Lifting",
            trainer: "Rohit Sharma",
            timing: "5PM - 6:30PM",
            total: 15,
            booked: 5,
          },
        ]),
        Trainer.insertMany([
          { name: "Anjali Sharma", specialty: "Yoga", status: "Available" },
          {
            name: "Rohit Sharma",
            specialty: "Weight Training",
            status: "Available",
          },
          { name: "Priya Mehta", specialty: "Cardio", status: "Busy" },
        ]),
        // create payment
        Payment.insertMany([
          {
            member: members[0]._id,
            amount: 1000,
            plan: "Monthly",
            status: "Completed",
          },
          {
            member: members[1]._id,
            amount: 2500,
            plan: "Quarterly",
            status: "Completed",
          },
          {
            member: members[2]._id,
            amount: 8000,
            plan: "Annual",
            status: "Completed",
          },
          {
            member: members[3]._id,
            amount: 1000,
            plan: "Monthly",
            status: "Completed",
          },
        ]),
      ]);
    })
    .then(() =>
      res.json({
        success: true,
        message: " All data seeded including payments!",
      }),
    )
    .catch((err) => res.status(500).json({ error: err.message }));
});

// Start server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`Seed data: http://localhost:${PORT}/seed`);
  console.log(`Frontend: http://localhost:${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const Member = require("./models/Member");
const Class = require("./models/Class");
const Trainer = require("./models/Trainer");
const Payment = require("./models/Payment");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ----- MongoDB Connection -----
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/flexgym";
mongoose.set("bufferTimeoutMS", 30000);

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// 1. Dashboard
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [
      totalMembers,
      totalClasses,
      availableTrainers,
      recentMembers,
      upcomingClasses,
      allMembers,
      allClasses,
    ] = await Promise.all([
      Member.countDocuments(),
      Class.countDocuments(),
      Trainer.countDocuments({ status: "Available" }),
      Member.find().sort({ createdAt: -1 }).limit(4),
      Class.find().limit(3),
      Member.find(),
      Class.find(),
    ]);

    let revenue = 0;
    allMembers.forEach((m) => {
      if (m.plan === "Monthly") revenue += 1000;
      else if (m.plan === "Quarterly") revenue += 2500;
      else if (m.plan === "Annual") revenue += 8000;
    });

    let totalBooked = 0,
      totalCapacity = 0;
    allClasses.forEach((c) => {
      totalBooked += c.booked;
      totalCapacity += c.total;
    });
    const attendance =
      totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 92;

    res.json({
      totalMembers,
      totalClasses,
      availableTrainers,
      revenue: revenue || 125000,
      attendance,
      recentMembers,
      upcomingClasses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Members
app.get("/api/members", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/members", async (req, res) => {
  console.log("📝 POST /members - Body:", req.body);
  const { name, email, plan } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name & email required" });
  }

  try {
    const member = await Member.create({
      name,
      email,
      plan: plan || "Monthly",
    });
    console.log("✅ Member created:", member.name, member._id);

    // Payment creation
    let amount = 0;
    if (member.plan === "Monthly") amount = 1000;
    else if (member.plan === "Quarterly") amount = 2500;
    else if (member.plan === "Annual") amount = 8000;

    await Payment.create({
      member: member._id,
      amount,
      plan: member.plan,
      status: "Completed",
    });
    console.log("✅ Payment created for", member.name);

    res.status(201).json(member); 
  } catch (err) {
    console.error("❌ Error in POST /members:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/members/:id", async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/members/:id/toggle", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Not found" });
    member.status = member.status === "Active" ? "Expired" : "Active";
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/members/:id", async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Classes (similar - just use async/await)
app.get("/api/classes", async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/classes", async (req, res) => {
  const { title, trainer, timing, total } = req.body;
  if (!title || !trainer)
    return res.status(400).json({ error: "Title & trainer required" });
  try {
    const cls = await Class.create({
      title,
      trainer,
      timing: timing || "TBD",
      total: parseInt(total) || 20,
      booked: 0,
    });
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/classes/:id", async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/classes/:id/book", async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: "Not found" });
    if (cls.booked >= cls.total) return res.status(400).json({ error: "Full" });
    cls.booked += 1;
    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/classes/:id", async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Trainers
app.get("/api/trainers", async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/trainers", async (req, res) => {
  const { name, specialty, status } = req.body;
  if (!name || !specialty)
    return res.status(400).json({ error: "Name & specialty required" });
  try {
    const trainer = await Trainer.create({
      name,
      specialty,
      status: status || "Available",
    });
    res.status(201).json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/trainers/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/trainers/:id", async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Payments
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("member", "name email")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Reports
app.get("/api/reports", async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      totalClasses,
      revenueResult,
      planDistribution,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: "Active" }),
      Class.countDocuments(),
      Payment.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Member.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }]),
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    res.json({
      totalMembers,
      activeMembers,
      totalClasses,
      totalRevenue,
      planDistribution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Seed (with timeout increased)
app.get("/seed", async (req, res) => {
  console.log("🌱 Seeding...");
  try {
    // Use Promise.all with small operations to avoid timeout
    await Member.deleteMany();
    await Class.deleteMany();
    await Trainer.deleteMany();
    await Payment.deleteMany();

    const members = await Member.insertMany([
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

    await Class.insertMany([
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
    ]);

    await Trainer.insertMany([
      { name: "Anjali Sharma", 
        specialty: "Yoga", 
        status: "Available" },
      {
        name: "Rohit Sharma",
        specialty: "Weight Training",
        status: "Available",
      },
      { name: "Priya Mehta", 
        specialty: "Cardio", 
        status: "Busy" },
    ]);

    const paymentData = members.map((m) => {
      let amount = 0;
      if (m.plan === "Monthly") amount = 1000;
      else if (m.plan === "Quarterly") amount = 2500;
      else if (m.plan === "Annual") amount = 8000;
      return { member: m._id, amount, plan: m.plan, status: "Completed" };
    });
    await Payment.insertMany(paymentData);

    console.log("✅ Seed complete");
    res.json({ success: true, message: "✅ Seeded with payments!" });
  } catch (err) {
    console.error("❌ Seed error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Test
app.get("/test", (req, res) => res.json({ message: "Server running" }));

// 9. Start
app.listen(PORT, () => {
  console.log(`🚀 Server on http://localhost:${PORT}`);
  console.log(`📌 Seed: http://localhost:${PORT}/seed`);
});

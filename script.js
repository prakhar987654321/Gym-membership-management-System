// NAVIGATION
const sections = document.querySelectorAll(".section-content");
const navLinks = document.querySelectorAll("[data-section]");

function showSection(sectionId) {
  sections.forEach((sec) => sec.classList.remove("active"));
  document.getElementById("section-" + sectionId).classList.add("active");
  document.querySelectorAll(".sidebar li, header nav a").forEach((el) => {
    el.classList.toggle("active", el.dataset.section === sectionId);
  });
}
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    if (section) showSection(section);
  });
});

// SEARCH
document.getElementById("search")?.addEventListener("input", function () {
  const term = this.value.toLowerCase();
  document.querySelectorAll("tbody tr").forEach((row) => {
    row.style.display = row.innerText.toLowerCase().includes(term)
      ? ""
      : "none";
  });
});

//DASHBOARD
function loadDashboard() {
  fetch("/api/dashboard/stats")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("total-members").textContent = data.totalMembers;
      document.getElementById("active-classes").textContent = data.totalClasses;
      document.getElementById("available-trainers").textContent =
        data.availableTrainers;
      document.getElementById("total-revenue").textContent =
        "₹" + data.revenue.toLocaleString("en-IN");
      document.getElementById("attendance").textContent = data.attendance + "%";

      const tbody = document.getElementById("recent-members-body");
      tbody.innerHTML = data.recentMembers
        .map(
          (m) => `
        <tr><td>${m.name}</td><td>${m.plan}</td>
        <td><span class="status ${m.status === "Active" ? "active-status" : "expire-status"}">${m.status}</span></td></tr>
      `,
        )
        .join("");

      const container = document.getElementById("upcoming-classes");
      container.innerHTML = data.upcomingClasses
        .map(
          (c) => `
        <div class="class-box"><h4>${c.title}</h4><p>${c.timing}</p></div>
      `,
        )
        .join("");
    })
    .catch((err) => console.error("Dashboard error:", err));
}

//MEMBERS
function loadMembers() {
  fetch("/api/members")
    .then((res) => res.json())
    .then((members) => {
      const tbody = document.querySelector("#members-table tbody");
      tbody.innerHTML = members
        .map(
          (m) => `
        <tr>
          <td>${m.name}</td><td>${m.email}</td><td>${m.plan}</td>
          <td><span class="status ${m.status === "Active" ? "active-status" : "expire-status"}">${m.status}</span></td>
          <td>
            <button onclick="toggleMember('${m._id}')" class="btna" style="padding:6px 12px; background:#3b82f6;">Toggle</button>
            <button onclick="deleteMember('${m._id}')" class="btna" style="padding:6px 12px; background:#ef4444; margin-left:8px;">Delete</button>
          </td>
        </tr>
      `,
        )
        .join("");
    })
    .catch((err) => console.error("Members error:", err));
}

function toggleMember(id) {
  fetch(`/api/members/${id}/toggle`, { method: "PATCH" })
    .then(() => {
      loadMembers();
      loadDashboard();
    })
    .catch((err) => alert("Error: " + err.message));
}

function deleteMember(id) {
  if (!confirm("Delete this member?")) return;
  fetch(`/api/members/${id}`, { method: "DELETE" })
    .then(() => {
      loadMembers();
      loadDashboard();
    })
    .catch((err) => alert("Error: " + err.message));
}

// CLASSES
function loadClasses() {
  fetch("/api/classes")
    .then((res) => res.json())
    .then((classes) => {
      const tbody = document.querySelector("#classes-table tbody");
      tbody.innerHTML = classes
        .map(
          (c) => `
        <tr>
          <td>${c.title}</td><td>${c.trainer}</td>
          <td><span class="badge green">${c.timing}</span></td>
          <td><span class="badge yellow">${c.booked}/${c.total}</span></td>
          <td>
            ${
              c.booked < c.total
                ? `<button onclick="bookClass('${c._id}')" class="btna" style="padding:6px 12px;">Book</button>`
                : `<span class="btna" style="padding:6px 12px; background:gray; pointer-events:none;">Full</span>`
            }
            <button onclick="deleteClass('${c._id}')" class="btna" style="padding:6px 12px; background:#ef4444; margin-left:8px;">Delete</button>
          </td>
        </tr>
      `,
        )
        .join("");
    })
    .catch((err) => console.error("Classes error:", err));
}

function bookClass(id) {
  fetch(`/api/classes/${id}/book`, { method: "PATCH" })
    .then(() => {
      loadClasses();
      loadDashboard();
    })
    .catch((err) => alert("Error: " + err.message));
}

function deleteClass(id) {
  if (!confirm("Delete this class?")) return;
  fetch(`/api/classes/${id}`, { method: "DELETE" })
    .then(() => {
      loadClasses();
      loadDashboard();
    })
    .catch((err) => alert("Error: " + err.message));
}

//TRAINERS
function loadTrainers() {
  fetch("/api/trainers")
    .then((res) => res.json())
    .then((trainers) => {
      const tbody = document.querySelector("#trainers-table tbody");
      tbody.innerHTML = trainers
        .map(
          (t) => `
        <tr>
          <td>${t.name}</td><td>${t.specialty}</td>
          <td><span class="status ${t.status === "Available" ? "active-status" : "expire-status"}">${t.status}</span></td>
          <td><button onclick="deleteTrainer('${t._id}')" class="btna" style="padding:6px 12px; background:#ef4444;">Delete</button></td>
        </tr>
      `,
        )
        .join("");
    })
    .catch((err) => console.error("Trainers error:", err));
}

function deleteTrainer(id) {
  if (!confirm("Delete this trainer?")) return;
  fetch(`/api/trainers/${id}`, { method: "DELETE" })
    .then(() => {
      loadTrainers();
      loadDashboard();
    })
    .catch((err) => alert("Error: " + err.message));
}

// MEMBERSHIP
function loadMembership() {
  const plans = [
    { 
    name: "Monthly", 
    price: 1000, 
    duration: "1 month" },
    { 
    name: "Quarterly", 
    price: 2500, 
    duration: "3 months" 
  },
    { 
    name: "Annual", 
    price: 8000, 
    duration: "12 months"
   },
  ];
  document.getElementById("plans-container").innerHTML = plans
    .map(
      (p) => `
    <div class="mini-card" style="text-align:center;">
      <h3>${p.name}</h3><h2 style="font-size:36px;">₹${p.price}</h2><p>${p.duration}</p>
    </div>
  `,
    )
    .join("");
}

//PAYMENTS
function loadPayments() {
  fetch("/api/payments")
    .then((res) => res.json())
    .then((payments) => {
      const tbody = document.querySelector("#payments-table tbody");
      tbody.innerHTML = payments
        .map(
          (p) => `
        <tr>
          <td>${p.member ? p.member.name : "N/A"}</td>
          <td>${p.plan}</td><td>₹${p.amount}</td>
          <td><span class="status ${p.status === "Completed" ? "active-status" : "expire-status"}">${p.status}</span></td>
          <td>${new Date(p.createdAt).toLocaleDateString()}</td>
        </tr>
      `,
        )
        .join("");
    })
    .catch((err) => console.error("Payments error:", err));
}

//REPORTS
function loadReports() {
  fetch("/api/reports")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("reports-container").innerHTML = `
        <div class="mini-card"><h4>Total Members</h4><h2>${data.totalMembers}</h2></div>
        <div class="mini-card"><h4>Active Members</h4><h2>${data.activeMembers}</h2></div>
        <div class="mini-card"><h4>Total Classes</h4><h2>${data.totalClasses}</h2></div>
        <div class="mini-card"><h4>Total Revenue</h4><h2>₹${data.totalRevenue.toLocaleString("en-IN")}</h2></div>
      `;
      document.getElementById("plan-distribution").innerHTML =
        data.planDistribution
          .map(
            (p) => `
        <li style="background:#1e293b; margin:8px 0; padding:12px; border-radius:8px;">
          <strong>${p._id}</strong> – ${p.count} members
        </li>
      `,
          )
          .join("");
    })
    .catch((err) => console.error("Reports error:", err));
}

// PAYMENT MODAL
const paymentModal = document.getElementById("payment-modal");
const closeModalBtn = document.querySelector(".close-modal");
const paymentMethods = document.getElementById("payment-methods");
const paymentStatus = document.getElementById("payment-status");
const paymentMsg = document.getElementById("payment-message");
let pendingMember = null;

function showPaymentModal(memberData) {
  pendingMember = memberData;
  paymentModal.style.display = "flex";
  paymentMethods.style.display = "grid";
  paymentStatus.style.display = "none";
  document
    .querySelectorAll(".payment-option")
    .forEach((el) => (el.style.display = "block"));
}

function closePaymentModal() {
  paymentModal.style.display = "none";
  pendingMember = null;
}
closeModalBtn.addEventListener("click", closePaymentModal);
paymentModal.addEventListener("click", (e) => {
  if (e.target === paymentModal) closePaymentModal();
});

document.querySelectorAll(".payment-option").forEach((option) => {
  option.addEventListener("click", function () {
    const method = this.dataset.method;
    document
      .querySelectorAll(".payment-option")
      .forEach((el) => (el.style.display = "none"));
    paymentMethods.style.display = "none";
    paymentStatus.style.display = "block";
    paymentMsg.textContent = `Processing payment via ${method}...`;
    paymentMsg.className = "";
    paymentMsg.style.color = "#e2e8f0";

    setTimeout(() => {
      const success = Math.random() < 0.9; // 90% success
      if (success) {
        paymentMsg.textContent = "✅ Payment Successful! Registering member...";
        paymentMsg.className = "payment-success";
        submitMember(pendingMember);
      } else {
        paymentMsg.textContent = "❌ Payment Failed. Please try again.";
        paymentMsg.className = "payment-fail";
        setTimeout(() => {
          document
            .querySelectorAll(".payment-option")
            .forEach((el) => (el.style.display = "block"));
          paymentMethods.style.display = "grid";
          paymentStatus.style.display = "none";
        }, 2000);
      }
    }, 2000);
  });
});

function submitMember(data) {
  fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((member) => {
      closePaymentModal();
      document.getElementById("member-form").reset();
      loadMembers();
      loadDashboard();
      document.getElementById("member-message").innerHTML =
        `<p style="color:#34d399;">✅ Member ${member.name} registered successfully!</p>`;
      setTimeout(
        () => (document.getElementById("member-message").innerHTML = ""),
        5000,
      );
    })
    .catch((err) => {
      closePaymentModal();
      document.getElementById("member-message").innerHTML =
        `<p style="color:#fb7185;">❌ Registration failed: ${err.message}</p>`;
    });
}

// MEMBER FORM
document
  .getElementById("member-form")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    if (!data.name || !data.email) {
      document.getElementById("member-message").innerHTML =
        '<p style="color:#fb7185;">Please fill all fields.</p>';
      return;
    }
    showPaymentModal(data);
  });

// CLASS FORM
document.getElementById("class-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(this));
  fetch("/api/classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then(() => {
      this.reset();
      loadClasses();
      loadDashboard();
      document.getElementById("class-message").innerHTML =
        '<p style="color:#34d399;">✅ Class added!</p>';
      setTimeout(
        () => (document.getElementById("class-message").innerHTML = ""),
        3000,
      );
    })
    .catch((err) => {
      document.getElementById("class-message").innerHTML =
        `<p style="color:#fb7185;">❌ ${err.message}</p>`;
    });
});

// TRAINER FORM
document
  .getElementById("trainer-form")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    fetch("/api/trainers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        this.reset();
        loadTrainers();
        loadDashboard();
        document.getElementById("trainer-message").innerHTML =
          '<p style="color:#34d399;">✅ Trainer added!</p>';
        setTimeout(
          () => (document.getElementById("trainer-message").innerHTML = ""),
          3000,
        );
      })
      .catch((err) => {
        document.getElementById("trainer-message").innerHTML =
          `<p style="color:#fb7185;">❌ ${err.message}</p>`;
      });
  });

//INIT
document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadMembers();
  loadClasses();
  loadTrainers();
  loadMembership();
  loadPayments();
  loadReports();
});

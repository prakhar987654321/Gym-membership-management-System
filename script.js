// public/script.js

// Initial dynamic values (backend se load hone se pehle fallback ke liye)
let totalmembers = 150;
let revenue = 125000;
let newMembers = 25;
let attendance = 92;

// DOM Elements Selection
let form = document.getElementById("registration-form");
let totalmember = document.getElementById("total-members");
let revenueBox = document.getElementById("total-revenue");
let newMembersBox = document.getElementById("new-members");
let recentBody = document.getElementById("recent-members-body");
let attendancebox = document.getElementById("attendance");

// Page load hote hi data fetch hoga backend se
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
    loadMembers();
    loadClasses();
});

//BACKEND FETCH LOGIC (DASHBOARD)
function loadDashboardStats() {
    fetch('/api/dashboard/stats')
        .then(res => res.json())
        .then(data => {
            attendance = data.attendance;
            revenue = data.revenue;
            attendancebox.innerText = attendance + "%";
            revenueBox.innerText = "₹" + revenue.toLocaleString("en-IN");
        })
        .catch(err => console.error("Stats load error:", err));
}

// BACKEND FETCH LOGIC (MEMBERS CRUD) 
function loadMembers() {
    fetch('/api/members')
        .then(res => res.json())
        .then(data => {
            totalmembers = data.length;
            totalmember.innerText = totalmembers;
            
            // Render Recent Members Table
            recentBody.innerHTML = data.map(m => `
                <tr>
                    <td>${m.name}</td>
                    <td>${m.plan}</td>
                    <td>
                        <span onclick="toggleStatus(${m.id})" class="status ${m.status === 'Active' ? 'active-status' : 'expire-status'}" style="cursor:pointer">
                            ${m.status} 
                        </span>
                    </td>
                    <td>
                        <button onclick="deleteMember(${m.id})" style="color:#fb7185; background:none; border:none; cursor:pointer;">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(err => console.error("Members load error:", err));
}

// Member Form Submit (CREATE Operation)
form.addEventListener("submit", function (e) {
    e.preventDefault();

    let fullname = document.getElementById("fullname").value.trim();
    let email = document.getElementById("email").value.trim();
    let t = document.getElementById("t").value;

    if (fullname == "" || email == "" || t == "Choose Membership") {
        alert("Please Fill all details");
        return;
    }

    // Revenue Update Calculation Logic (Original logic saved)
    let amount = 0;
    if (t == "monthly") amount = 1000;
    else if (t == "quarterly") amount = 2500;
    else if (t == "yearly") amount = 8000;
    
    let planName = (t == "monthly") ? "Monthly" : (t == "quarterly") ? "Quarterly" : "Annual";

    // Backend API Call for Member Registration
    fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullname, plan: planName })
    })
    .then(res => res.json())
    .then(resData => {
        if(resData.success) {
            newMembers++;
            newMembersBox.innerText = newMembers;
            
            // Backend update hone ke sath UI lists ko refresh karein
            loadMembers();
            form.reset();
            document.getElementById("price").innerText = "Price: ₹1000";
            alert("Member Registered Successfully!");
        }
    })
    .catch(err => console.error("Registration error:", err));
});

// Toggle Status (UPDATE Operation for Member Status)
function toggleStatus(id) {
    fetch(`/api/members/${id}`, { method: 'PUT' })
        .then(res => res.json())
        .then(() => loadMembers())
        .catch(err => console.error("Status update error:", err));
}

// Delete Member (DELETE Operation)
function deleteMember(id) {
    if (confirm("Kya aap is member ko delete karna chahte hain?")) {
        fetch(`/api/members/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(() => loadMembers())
            .catch(err => console.error("Delete member error:", err));
    }
}

//  BACKEND FETCH LOGIC (CLASSES CRUD) 
function loadClasses() {
    fetch('/api/classes')
        .then(res => res.json())
        .then(data => {
            document.getElementById("active-classes").innerText = data.length;
            const tbody = document.querySelector(".data .tbody");
            
            tbody.innerHTML = data.map(c => `
                <tr>
                    <td style="width:40px"><input type="checkbox" class="row"></td>
                    <td>${c.title}</td>
                    <td>${c.trainer}</td>
                    <td><span class="badge green">${c.timing}</span></td>
                    <td><span class="badge yellow">${c.booked}/${c.total}</span></td>
                    <td>
                        <button onclick="bookSlot(${c.id})" class="btna" ${c.booked >= c.total ? 'disabled' : ''}>
                            ${c.booked >= c.total ? 'Class Full' : 'Book Now'}
                        </button>
                        <button onclick="deleteClass(${c.id})" style="color:#fb7185; background:none; border:none; margin-left:12px; cursor:pointer;">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            
            // Reset Dynamic Checkbox Listeners
            initCheckboxes();
        })
        .catch(err => console.error("Classes load error:", err));
}

// Book Slot (UPDATE Operation for Classes & Attendance)
function bookSlot(id) {
    fetch(`/api/classes/${id}`, { method: 'PUT' })
        .then(res => res.json())
        .then(resData => {
            if (resData.success) {
                if (attendance < 100) {
                    attendance++;
                    attendancebox.innerText = attendance + "%";
                }
                loadClasses();
            }
        })
        .catch(err => console.error("Booking error:", err));
}

// Delete Class (DELETE Operation for Classes)
function deleteClass(id) {
    if (confirm("Remove this fitness class?")) {
        fetch(`/api/classes/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(() => loadClasses())
            .catch(err => console.error("Delete class error:", err));
    }
}

// Add Class via Quick Actions Box (CREATE Operation for Classes)
document.getElementById("add-class-card").addEventListener("click", function () {
    let classname = prompt("Enter Class Name");
    let trainer = prompt("Enter Trainer Name");
    let timing = prompt("Enter Timing (e.g., 6AM - 7AM)");
    let capacity = prompt("Enter Capacity");

    if (!classname || !trainer) return;

    fetch("/api/classes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classname, trainer, timing, capacity })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            alert("Class Added Successfully");
            loadClasses();
        }
    })
    .catch(err => console.error("Add class error:", err));
});

// UTILITIES & ORIGINAL INTERFACES

// Membership Dropdown Price Engine
let selecta = document.getElementById("t");
let price = document.getElementById("price");
selecta.addEventListener("change", function () {
    if (this.value === "monthly") price.innerText = "Price: ₹1000";
    else if (this.value === "quarterly") price.innerText = "Price: ₹2500";
    else if (this.value === "yearly") price.innerText = "Price: ₹8000";
    else price.innerText = "Price: ₹1000";
});

// Checkboxes Logic (Refactored to handle dynamic nodes cleanly)
function initCheckboxes() {
    let all = document.querySelector(".all");
    let rowCheckboxes = document.querySelectorAll(".row");
    
    if(!all) return;
    
    all.onchange = function () {
        rowCheckboxes.forEach(cb => cb.checked = all.checked);
    };

    rowCheckboxes.forEach(cb => {
        cb.onchange = function () {
            all.checked = [...rowCheckboxes].every(r => r.checked);
        };
    });
}

// Global Text Realtime Search Function
let search = document.getElementById("search");
search.addEventListener("input", function(){
    let searchtext = search.value.toLowerCase();
    
    document.querySelectorAll("tbody tr").forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(searchtext) ? "" : "none";
    });
});

// Scrolling Navigation Layout Hooks
document.querySelector(".action-card").addEventListener("click", function(){
    document.querySelector(".Register").scrollIntoView({ behavior: "smooth" });
    document.getElementById("fullname").focus();
});

document.querySelector('.m').addEventListener("click", function(){
    document.querySelector(".mem").scrollIntoView({ behavior: "smooth" });
    document.getElementById("total-members").focus();
});

// TRAINERS OPERATIONS (NEW ACTION) 

// Sidebar ke Trainers button (.tr) par click hone par backend se data layega
document.querySelector('.tr').addEventListener("click", function() {
    fetch('/api/trainers')
        .then(res => res.json())
        .then(data => {
            // 1. Browser Console me data print hoga (Interviewer ko dikhane ke liye)
            console.log("🔥 Live Trainers Data from Backend:", data);
            
            // 2. Screen par ek professional alert format me data dikhega
            let trainerList = data.map(t => `• ${t.name} (${t.specialty}) -> Status: ${t.status}`).join('\n');
            alert(`--- FlexGym Premium Trainers ---\n\n${trainerList}\n\n(Tip: Status badalne ke liye console me PUT request chala sakte hain)`);
        })
        .catch(err => console.error("Trainers fetch error:", err));
});
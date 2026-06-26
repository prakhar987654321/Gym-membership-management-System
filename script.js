let totalmembers = 150;
let revenue = 125000;
let newMembers = 25;

let form = document.getElementById("registration-form");
let totalmember = document.getElementById("total-members");

let revenueBox = document.getElementById("total-revenue");
let newMembersBox = document.getElementById("new-members");
let recentBody = document.getElementById("recent-members-body");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    let fullname = document.getElementById("fullname").value.trim();
    let email = document.getElementById("email").value.trim();
    let t = document.getElementById("t").value;

    if (fullname == "" || email == "" || t == "") {
        alert("Please Fill all details");
        return;
    }

    // Total Members

    totalmembers++;
    totalmember.innerText = totalmembers;

    // New Members

    newMembers++;
    newMembersBox.innerText = newMembers;
    //notification
  

    // Revenue

    let amount = 0;

    if (t == "monthly") {
        amount = 1000;
    }
    else if (t == "quarterly") {
        amount = 2500;
    }
    else if (t == "yearly") {
        amount = 8000;
    }

    revenue += amount;
    revenueBox.innerText = "₹" + revenue.toLocaleString("en-IN");

    // Plan Name

    let planName = "";

    if (t == "monthly") {
        planName = "Monthly";
    }
    else if (t == "quarterly") {
        planName = "Quarterly";
    }
    else {
        planName = "Annual";
    }

    // Add New Member in Recent Members Table

    recentBody.innerHTML =
        `
<tr>
<td>${fullname}</td>
<td>${planName}</td>
<td><span class="status active-status">Active</span></td>
</tr>
` + recentBody.innerHTML;

    alert(`Member Registered Successfully!

Name : ${fullname}

Plan : ${planName}`);

    form.reset();

    document.getElementById("price").innerText = "Price: ₹1000";
});
// Membership Plan Price
   let selecta = document.getElementById("t");
   let price = document.getElementById("price");
    selecta.addEventListener("change", function () {
  if (this.value === "monthly") {
   price.innerText = "Price: ₹1000";

    }

    else if (this.value === "quarterly") {

        price.innerText = "Price: ₹2500";

    }

    else if (this.value === "yearly") {

        price.innerText = "Price: ₹8000";

    }

    else {

        price.innerText = "Price: ₹1000";

    }

});
// Checkboxes
let all = document.querySelector(".all");
let row = document.querySelectorAll(".row");
all.addEventListener("change", function () {
row.forEach(function (checkbox) {
   checkbox.checked = all.checked;

    });

});


// Individual Checkbox

row.forEach(function (checkbox) {

    checkbox.addEventListener("change", function () {

        let allcheck = [...row].every(cb => cb.checked);

        all.checked = allcheck;

    });

});
//Search Function
let search=document.getElementById("search");
search.addEventListener("input",function(){
  let searchtext=search.value.toLowerCase();
  let classrow=document.querySelectorAll('.tbody tr');
  classrow.forEach(function(row){
    let text=row.innerText.toLowerCase();
    if(text.includes(searchtext)){
      row.style.display="";
    }
    else{
      row.style.display="none";
    }
  }) ;
  //Recent member serach
  let rowa=document.querySelectorAll("#recent-members-body tr")
  rowa.forEach(function(row){
    let text=row.innerText.toLowerCase();
    if(text.includes(searchtext)){
      row.style.display="";
    }
    else{
      row.style.display="none";
    }
  });
})

let buttons=document.querySelectorAll('.btna');
buttons.forEach(function(button){
  button.addEventListener('click',function(e){
    let row=button.parentElement.parentElement;
    let capacity=row.querySelector(".yellow");
    let text=capacity.innerText;
    let values=text.split('/');
    let booked=Number(values[0]);
    let total=Number(values[1]);
    if(booked<total){
      booked++;
      capacity.innerText=booked + "/" +total;
      button.innerText="Booked";
      button.disabled=true;
      if(booked==total){
        button.innerText="Class Full"
      }


    }



  })
})

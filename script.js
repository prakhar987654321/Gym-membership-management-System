//Internal data store Dynamic rendering
let gymclasses=[{id:1,
  name:"Morning Yoga shift",
  trainer:"Anjali Sharma",
  time:"6Am-7AM",
  slotsLeft:15,
  maxslots:20
},
{
  id:2,
  name:"heavy weight Lifting",
  trainer:"Rohit Sharma",
  time:"5pm-6:30pm",
  slotsLeft:5,
  maxSlots:15
}
];
//Document load hote hi data ko screen par dikhao
document.addEventListener("DOMContentLoaded",()=>{
  renderTable();
  updateDashboardStats();
  const form=document.getElementById('registration-form');
  form.addEventListener('submit',(event)=>{
    //page ko refresh hone sae rokega
    event.preventDefault();
    let membername=document.getElementById('fullname').value;
    let totalmember=document.getElementById('total-members');
    //dashboard counter ko 1 badhao

    let count=parseInt(totalmember.innerText);
    totalmember.innerText=count+1;
    alert(`Success: Welcome to FlexGym, ${membername}!`);
        form.reset();
  })

});
function renderTable(){
  const tbody=document.querySelector(".tbody");
  /*if(!tbody){
    return;
  }*/
  tbody.innerHTML="";//pehlae purana data saaf hua hai
  gymclasses.forEach((i)=>{
    let row=`
    <tr>
      <td><strong>${i.name}</strong></td>
      <td>${i.trainer}</td>
      <td>${i.time}</td>
      <td>${i.slotsLeft}/${i.maxSlots}</td>
      <td>
      <button class="btn-book" onclick="bookSeat(${i.id})"style="background-color:#3b82f6;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">Book Now</button>
      </td>
    </tr>
  `;
  tbody.innerHTML+=row;
  });
};
function bookSeat(classId) {
    // Hamare array database mein se sahi wali class ko dhoondho
    let targetclass = gymclasses.find(c => c.id === classId);

    if (targetclass && targetclass.slotsLeft > 0) {
        targetclass.slotsLeft--; // Array mein data kam karo
        
        // UI par data update karo bina page refresh kiye
        document.getElementById(`slot-count-${classId}`).innerText = targetclass.slotsLeft;
        
        alert(`Success: Your slot for "${targetclass.name}" with ${targetclass.trainer} is confirmed!`);
    } else {
        alert("Sorry! This class is already full.");
    }
}

function updateDashboardStats(){
  document.getElementById('active-classes').innerText = gymclasses.length;
    
    // Unique Trainers ki sankhya nikalne ke liye
    let trainers = gymclasses.map(c => c.trainer);
    let uniqueTrainers = [...new Set(trainers)];
    document.getElementById('available-trainers').innerText = uniqueTrainers.length;
}





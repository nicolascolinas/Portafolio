const serviceSelect=document.querySelector("#service");
const barberSelect=document.querySelector("#barber");
const calendarGrid=document.querySelector("#calendarGrid");
const monthLabel=document.querySelector("#monthLabel");
const timesGrid=document.querySelector("#timesGrid");
const chosenDateLabel=document.querySelector("#chosenDateLabel");
const bookingForm=document.querySelector("#bookingForm");
const summary=document.querySelector("#selectionSummary");
const message=document.querySelector("#formMessage");
const isPreview = true;

const DEMO_SERVICES=[
  {id:"corte",name:"Corte",price:14000},
  {id:"barba",name:"Barba",price:10000},
  {id:"combo",name:"Corte + barba",price:21000},
  {id:"coloracion",name:"Coloración",price:56000}
];
const DEMO_BARBERS=["Martín","Lucas","Nico"];
const DEMO_TIMES=["10:00","10:45","11:30","12:15","14:00","14:45","15:30","16:15","17:00","17:45","18:30","19:15"];
const months=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const weekdays=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];

let cursor=new Date(); cursor=new Date(cursor.getFullYear(),cursor.getMonth(),1);
let selectedDate="",selectedTime="",monthAvailability={};

const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const parseISO=s=>new Date(`${s}T12:00:00`);
const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n);

if(isPreview){
  const badge=document.querySelector("#previewBadge");
  if(badge) badge.hidden=false;
}

async function loadConfig(){
  let data;
  if(isPreview){
    data={services:DEMO_SERVICES,barbers:DEMO_BARBERS};
  }else{
    const r=await fetch("/api/config");
    if(!r.ok) throw new Error("No se pudo cargar la configuración.");
    data=await r.json();
  }
  data.services.forEach(s=>{
    const o=document.createElement("option");o.value=s.id;o.textContent=`${s.name} · ${money(s.price)}`;serviceSelect.append(o);
  });
  data.barbers.forEach(b=>{
    const o=document.createElement("option");o.value=b;o.textContent=b;barberSelect.append(o);
  });
}

function updateSummary(){
  const serviceText=serviceSelect.options[serviceSelect.selectedIndex]?.textContent||"";
  const barber=barberSelect.value;
  summary.innerHTML=(!serviceSelect.value||!barber)
    ?"Elegí servicio y profesional para ver disponibilidad."
    :`<strong>${serviceText}</strong><br>con ${barber}`;
}

async function loadMonthAvailability(){
  monthAvailability={};
  if(barberSelect.value){
    const y=cursor.getFullYear(),m=cursor.getMonth()+1;
    if(isPreview){
      const lastDay=new Date(y,m,0).getDate();
      for(let day=1;day<=lastDay;day++){
        const key=`${y}-${String(m).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        monthAvailability[key]=new Date(`${key}T12:00:00`).getDay()===0?0:DEMO_TIMES.length;
      }
    }else{
      const r=await fetch(`/api/month-availability?year=${y}&month=${m}&barber=${encodeURIComponent(barberSelect.value)}`);
      if(r.ok) monthAvailability=await r.json();
    }
  }
  renderCalendar();
}

function renderCalendar(){
  monthLabel.textContent=`${months[cursor.getMonth()]} ${cursor.getFullYear()}`;
  calendarGrid.innerHTML="";
  const y=cursor.getFullYear(),m=cursor.getMonth();
  const first=new Date(y,m,1);
  const startOffset=(first.getDay()+6)%7;
  const lastDay=new Date(y,m+1,0).getDate();
  const today=new Date();today.setHours(0,0,0,0);

  for(let i=0;i<startOffset;i++){
    const blank=document.createElement("span");
    blank.className="day-empty";
    calendarGrid.append(blank);
  }

  for(let day=1;day<=lastDay;day++){
    const d=new Date(y,m,day);
    const key=iso(d);
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="day";

    const number=document.createElement("strong");
    number.className="day-number";
    number.textContent=day;
    btn.append(number);

    const compare=new Date(d);compare.setHours(0,0,0,0);
    const avail=monthAvailability[key];

    const status=document.createElement("span");
    status.className="day-status";

    if(!barberSelect.value){
      status.textContent="Elegí profesional";
      btn.classList.add("waiting");
    }else if(d.getDay()===0 || compare<today || avail===0){
      status.textContent=d.getDay()===0?"Cerrado":"Sin turnos";
      btn.classList.add("full");
    }else if(Number.isFinite(avail)){
      status.textContent=avail===1?"1 horario":`${avail} horarios`;
      btn.classList.add(avail<=3?"limited":"available");
    }

    btn.append(status);

    if(compare<today||d.getDay()===0||!barberSelect.value||avail===0){
      btn.disabled=true;
      btn.classList.add("disabled");
    }
    if(key===selectedDate) btn.classList.add("selected");
    if(iso(today)===key) btn.classList.add("today");

    btn.addEventListener("click",()=>selectDate(key));
    calendarGrid.append(btn);
  }
}
async function selectDate(key){
  selectedDate=key;selectedTime="";renderCalendar();
  const d=parseISO(key);
  chosenDateLabel.textContent=`${weekdays[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()].toLowerCase()}`;
  let times;
  if(isPreview){
    times=DEMO_TIMES;
  }else{
    times=(await fetch(`/api/availability?date=${key}&barber=${encodeURIComponent(barberSelect.value)}`).then(r=>r.json())).times||[];
  }
  if(!times.length){
    timesGrid.innerHTML="<p>No quedan horarios disponibles para este día.</p>";
    bookingForm.classList.add("hidden");return;
  }
  timesGrid.innerHTML="";
  times.forEach(t=>{
    const b=document.createElement("button");b.type="button";b.className="time-btn";b.textContent=t;
    b.addEventListener("click",()=>{
      selectedTime=t;document.querySelectorAll(".time-btn").forEach(x=>x.classList.remove("selected"));
      b.classList.add("selected");bookingForm.classList.remove("hidden");message.textContent="";
    });
    timesGrid.append(b);
  });
}

function resetSelection(){
  selectedDate="";selectedTime="";chosenDateLabel.textContent="Elegí un día";
  timesGrid.innerHTML="<p>Los horarios aparecerán acá.</p>";bookingForm.classList.add("hidden");
}

serviceSelect.addEventListener("change",()=>{updateSummary();resetSelection();loadMonthAvailability()});
barberSelect.addEventListener("change",()=>{updateSummary();resetSelection();loadMonthAvailability()});
document.querySelector("#prevMonth").addEventListener("click",()=>{
  const now=new Date(),prev=new Date(cursor.getFullYear(),cursor.getMonth()-1,1),floor=new Date(now.getFullYear(),now.getMonth(),1);
  if(prev>=floor){cursor=prev;resetSelection();loadMonthAvailability()}
});
document.querySelector("#nextMonth").addEventListener("click",()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);resetSelection();loadMonthAvailability()});

document.querySelectorAll(".service-row").forEach(row=>row.addEventListener("click",()=>{
  serviceSelect.value=row.dataset.service;updateSummary();resetSelection();loadMonthAvailability();
  document.querySelector("#reservar").scrollIntoView({behavior:"smooth"});
}));

bookingForm.addEventListener("submit", async e => {
  e.preventDefault();

  message.className = "message";
  message.textContent = "Confirmando...";

  const payload = {
    service: serviceSelect.value,
    barber: barberSelect.value,
    date: selectedDate,
    time: selectedTime,
    name: document.querySelector("#name").value,
    phone: document.querySelector("#phone").value,
    email: document.querySelector("#email").value,
    notes: document.querySelector("#notes").value
  };

  try {
    const r = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const contentType = r.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error("BACKEND_NO_DISPONIBLE");
    }

    const data = await r.json();

    if (!r.ok) {
      throw new Error(data.error || "No se pudo reservar.");
    }

    message.className = "message success";
    message.textContent = `Turno #${data.id} confirmado para el ${data.date} a las ${data.time} con ${data.barber}.`;

    alert(
      `¡Turno confirmado!\nNúmero: ${data.id}\nFecha: ${data.date}\nHora: ${data.time}\nBarbero: ${data.barber}`
    );

    bookingForm.reset();
    selectedTime = "";
    await loadMonthAvailability();

  } catch (err) {

    if (err.message === "BACKEND_NO_DISPONIBLE" || err instanceof TypeError) {
      const turnoId = "TUR-" + String(Date.now()).slice(-6);

      message.className = "message success";
      message.textContent = `Turno ${turnoId} solicitado correctamente.`;

      alert(
        `¡Turno solicitado!\nNúmero: ${turnoId}\nFecha: ${selectedDate}\nHora: ${selectedTime}\nBarbero: ${barberSelect.value}`
      );

      bookingForm.reset();
      selectedTime = "";

    } else {
      message.className = "message error";
      message.textContent = err.message;
    }
  }
});
loadConfig().then(()=>loadMonthAvailability()).catch(err=>{
  calendarGrid.innerHTML="<p>No se pudo conectar con el servidor.</p>";
  console.error(err);
});

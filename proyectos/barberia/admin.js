let adminKey=sessionStorage.getItem("bravoAdminKey")||"",appointments=[],filter="todos";
const login=document.querySelector("#loginCard"),dash=document.querySelector("#dashboard"),list=document.querySelector("#appointmentList");
async function api(url,opts={}){
  const r=await fetch(url,{...opts,headers:{...(opts.headers||{}),"Content-Type":"application/json","x-admin-key":adminKey}});
  const data=await r.json().catch(()=>({})); if(!r.ok) throw new Error(data.error||"Error"); return data;
}
async function load(){appointments=await api("/api/admin/appointments");render()}
function render(){
  const rows=filter==="todos"?appointments:appointments.filter(a=>a.status===filter);
  list.innerHTML=rows.length?rows.map(a=>`<article class="appointment">
    <div><strong>${a.customer_name}</strong><span>${a.phone}${a.email?` · ${a.email}`:""}</span></div>
    <div><strong>${a.appointment_date}</strong><span>${a.appointment_time} · ${a.barber}</span></div>
    <div><strong>${a.service}</strong><span class="status">${a.status}</span></div>
    <div class="actions"><button onclick="setStatus(${a.id},'atendido')">Atendido</button><button onclick="setStatus(${a.id},'cancelado')">Cancelar</button><button onclick="removeItem(${a.id})">Eliminar</button></div>
  </article>`).join(""):`<div class="empty">No hay turnos en esta vista.</div>`;
}
async function setStatus(id,status){await api(`/api/admin/appointments/${id}`,{method:"PATCH",body:JSON.stringify({status})});await load()}
async function removeItem(id){if(confirm("¿Eliminar este turno?")){await api(`/api/admin/appointments/${id}`,{method:"DELETE"});await load()}}
window.setStatus=setStatus;window.removeItem=removeItem;
document.querySelector("#loginForm").addEventListener("submit",async e=>{e.preventDefault();adminKey=document.querySelector("#adminKey").value;try{await load();sessionStorage.setItem("bravoAdminKey",adminKey);login.classList.add("hidden");dash.classList.remove("hidden")}catch{alert("Clave incorrecta.")}});
document.querySelector("#refreshBtn").addEventListener("click",load);
document.querySelectorAll(".filters button").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.filter;render()}));
if(adminKey)load().then(()=>{login.classList.add("hidden");dash.classList.remove("hidden")}).catch(()=>sessionStorage.removeItem("bravoAdminKey"));

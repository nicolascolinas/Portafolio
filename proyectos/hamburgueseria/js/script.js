const products = [
  { id: 1, name: "COLINK Supreme", description: "Doble carne, cheddar, bacon, cebolla caramelizada y salsa COLINK.", price: 12900, category: "hamburguesas", tag: "Más vendida", image: "img/colink-supreme.jpg", emoji: "🍔" },
  { id: 2, name: "Golden Bacon", description: "Carne smash, cheddar, bacon crocante, pepinos y mostaza miel.", price: 11500, category: "hamburguesas", tag: "Nueva", image: "img/golden-bacon.jpg", emoji: "🍔" },
  { id: 3, name: "Classic COLINK", description: "Carne, cheddar, lechuga, tomate, cebolla y salsa clásica.", price: 9900, category: "hamburguesas", tag: "Clásica", image: "img/classic-colink.jpg", emoji: "🍔" },
  { id: 4, name: "Fire Burger", description: "Doble carne, cheddar, Aros de cebolla, bacon y salsa picante.", price: 12400, category: "hamburguesas", tag: "Picante", image: "img/fire-burger.jpg", emoji: "🌶️" },
  { id: 5, name: "Papas COLINK", description: "Papas crocantes con cheddar, verdeo y salsa de la casa.", price: 5200, category: "papas", tag: "Favoritas", image: "img/papas-colink.jpg", emoji: "🍟" },
  { id: 6, name: "Papas Bacon", description: "Papas, cheddar, bacon crocante y salsa ahumada.", price: 6100, category: "papas", tag: "Top", image: "img/papas-cheddar.jpg", emoji: "🍟" },
  { id: 7, name: "Coca-Cola 500 ml", description: "Gaseosa individual bien fría.", price: 2600, category: "bebidas", tag: "Bebida", image: "img/cola-500.jpg", emoji: "🥤" },
  { id: 8, name: "Limonada COLINK", description: "Limonada casera con limón, menta y hielo.", price: 3400, category: "bebidas", tag: "Casera", image: "img/limonada-colink.jpg", emoji: "🍋" },
  { id: 9, name: "Combo Duo", description: "Dos burgers clásicas, papas grandes y dos bebidas.", price: 24900, category: "promos", tag: "Promo", image: "img/combo-duo.jpg", emoji: "🔥" },
  { id: 10, name: "Combo Full", description: "Supreme + papas COLINK + bebida.", price: 17900, category: "promos", tag: "Combo", image: "img/colink-supreme.jpg", emoji: "🍔" },
  { id: 11, name: "Nuggets Cheddar & Bacon", description: "Nuggets crocantes con cheddar fundido y bacon.", price: 6500, category: "nuggets", tag: "Nuevo", image: "img/nuggets.jpg", emoji: "🍗" },
  { id: 12, name: "Agua 500 ml", description: "Agua mineral sin gas, bien fría.", price: 2100, category: "bebidas", tag: "Bebida", image: "img/agua-500.jpg", emoji: "💧" },
  { id: 13, name: "Cerveza Heineken 473 ml", description: "Lata de cerveza Heineken bien fría.", price: 3600, category: "bebidas", tag: "Cerveza", image: "img/cerveza.jpg", emoji: "🍺" }
];

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const grid = $("#productsGrid");
const cartCount = $("#cartCount");
const cartItems = $("#cartItems");
const cartEmpty = $("#cartEmpty");
const cartTotal = $("#cartTotal");
const checkoutTotal = $("#checkoutTotal");
const checkoutBtn = $("#checkoutBtn");
const toast = $("#toast");
const navLinks = $("#navLinks");
const menuToggle = $("#menuToggle");
const checkoutStatus = $("#checkoutStatus");
const feedbackStatus = $("#feedbackStatus");

let currentFilter = "todas";
let cart = JSON.parse(localStorage.getItem("colink-cart") || "[]");

const formatPrice = value => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
const getProduct = id => products.find(p => p.id === Number(id));
const cartQuantity = () => cart.reduce((sum, item) => sum + item.qty, 0);
const cartAmount = () => cart.reduce((sum, item) => { const p = getProduct(item.id); return sum + (p ? p.price * item.qty : 0); }, 0);

function persistCart(){ localStorage.setItem("colink-cart", JSON.stringify(cart)); }
function showToast(message){ toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(()=>toast.classList.remove("show"), 2200); }

function renderProducts(){
  const visible = currentFilter === "todas" ? products : products.filter(p => p.category === currentFilter);
  grid.innerHTML = visible.map(product => `
    <article class="product-card reveal visible">
      <div class="product-image ${product.image ? "" : "no-image"}">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : `<span aria-hidden="true">${product.emoji}</span>`}
        <span class="product-tag">${product.tag}</span>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-bottom">
          <strong class="product-price">${formatPrice(product.price)}</strong>
          <button class="add-btn" data-add="${product.id}" aria-label="Agregar ${product.name}">+</button>
        </div>
      </div>
    </article>`).join("");
}

function addToCart(id, qty=1){
  const item = cart.find(i => i.id === Number(id));
  if(item) item.qty += qty; else cart.push({ id:Number(id), qty });
  persistCart(); renderCart(); showToast("Agregado al carrito");
}
function updateQty(id, delta){
  const item = cart.find(i => i.id === Number(id)); if(!item) return;
  item.qty += delta; if(item.qty <= 0) cart = cart.filter(i => i.id !== Number(id));
  persistCart(); renderCart();
}
function removeItem(id){ cart = cart.filter(i => i.id !== Number(id)); persistCart(); renderCart(); }

function renderCart(){
  cart = cart.filter(item => getProduct(item.id) && item.qty > 0);
  const total = cartAmount();
  cartCount.textContent = cartQuantity();
  cartTotal.textContent = formatPrice(total);
  checkoutTotal.textContent = formatPrice(total);
  checkoutBtn.disabled = cart.length === 0;
  cartEmpty.hidden = cart.length > 0;
  cartItems.innerHTML = cart.map(item => {
    const p = getProduct(item.id);
    return `<article class="cart-item">
      ${p.image ? `<img class="cart-item-thumb" src="${p.image}" alt="">` : `<div class="cart-item-thumb" style="display:grid;place-items:center;background:#17130d;font-size:1.7rem">${p.emoji}</div>`}
      <div><h4>${p.name}</h4><p>${formatPrice(p.price * item.qty)}</p></div>
      <button class="remove-item" data-remove="${p.id}">Quitar</button>
      <div class="cart-item-controls"><div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div>
    </article>`;
  }).join("");
}

function openCart(){ document.body.classList.add("cart-open"); $("#cartDrawer").setAttribute("aria-hidden","false"); }
function closeCart(){ document.body.classList.remove("cart-open"); $("#cartDrawer").setAttribute("aria-hidden","true"); }
function openCheckout(){ if(!cart.length) return; closeCart(); document.body.classList.add("modal-open"); $("#checkoutModal").setAttribute("aria-hidden","false"); checkoutStatus.textContent=""; }
function closeCheckout(){ document.body.classList.remove("modal-open"); $("#checkoutModal").setAttribute("aria-hidden","true"); }

async function submitOrder(event){
  event.preventDefault();
  const form = event.currentTarget;
  const button = $("#submitOrder");
  const data = new FormData(form);
  const payload = {
    customer:{ name:data.get("name"), phone:data.get("phone"), address:data.get("address"), notes:data.get("notes") || "" },
    paymentMethod:data.get("paymentMethod"),
    items:cart.map(i=>({ id:i.id, qty:i.qty }))
  };
  button.disabled = true; button.textContent = "Procesando..."; checkoutStatus.className="form-status"; checkoutStatus.textContent="";
 try {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error("BACKEND_NO_DISPONIBLE");
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "No se pudo crear el pedido");
  }

  if (result.paymentUrl) {
    window.location.href = result.paymentUrl;
    return;
  }

  cart = [];
  persistCart();
  renderCart();
  form.reset();
  closeCheckout();

  showToast(`Pedido ${result.order.id} registrado`);

  alert(
    `¡Pedido registrado!\nNúmero: ${result.order.id}\nTotal: ${formatPrice(result.order.total)}\nEstado: ${result.order.status}`
  );

} catch (error) {

  if (error.message === "BACKEND_NO_DISPONIBLE" || error instanceof TypeError) {
    const demoId = "PED-" + String(Date.now()).slice(-6);

    cart = [];
    persistCart();
    renderCart();
    form.reset();
    closeCheckout();

    showToast(`Pedido ${demoId} confirmado`);
    alert(`¡Pedido confirmado correctamente!\nNúmero: ${demoId}`);
  } else {
    checkoutStatus.textContent = error.message;
    checkoutStatus.classList.add("error");
  }

} finally {
  button.disabled = false;
  button.textContent = "Confirmar pedido";
}
  try{
    const response = await fetch("/api/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    const result = await response.json();
    if(!response.ok) throw new Error(result.error || "No se pudo crear el pedido");
    if(result.paymentUrl){ window.location.href = result.paymentUrl; return; }
    cart = []; persistCart(); renderCart(); form.reset(); closeCheckout();
    showToast(`Pedido ${result.order.id} registrado`);
    alert(`¡Pedido registrado!\nNúmero: ${result.order.id}\nTotal: ${formatPrice(result.order.total)}\nEstado: ${result.order.status}`);
  }catch(error){ checkoutStatus.textContent = error.message + (location.protocol === "file:" ? " Abrí la web desde el servidor Node para activar el backend." : ""); checkoutStatus.classList.add("error"); }
  finally{ button.disabled=false; button.textContent="Confirmar pedido"; }
}

async function submitFeedback(event){
  event.preventDefault(); const form=event.currentTarget; const data=new FormData(form); const btn=form.querySelector("button");
  feedbackStatus.textContent=""; feedbackStatus.className="form-status"; btn.disabled=true;
  if(location.protocol === "file:"){
    form.reset(); feedbackStatus.textContent="Vista demo: mensaje simulado correctamente."; feedbackStatus.classList.add("success"); btn.disabled=false; return;
  }
  try{
    const response=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:data.get("name")||"",message:data.get("message")})});
    const result=await response.json(); if(!response.ok) throw new Error(result.error||"No se pudo enviar");
    form.reset(); feedbackStatus.textContent="Gracias. Tu mensaje fue recibido."; feedbackStatus.classList.add("success");
  }catch(error){ feedbackStatus.textContent = location.protocol === "file:" ? "El formulario se activa al iniciar el servidor Node." : error.message; feedbackStatus.classList.add("error"); }
  finally{btn.disabled=false;}
}

$("#productsGrid").addEventListener("click", e => { const btn=e.target.closest("[data-add]"); if(btn) addToCart(btn.dataset.add); });
$("#cartItems").addEventListener("click", e => { const qty=e.target.closest("[data-qty]"); const remove=e.target.closest("[data-remove]"); if(qty) updateQty(qty.dataset.qty, Number(qty.dataset.delta)); if(remove) removeItem(remove.dataset.remove); });
$("#categoryTabs").addEventListener("click", e => { const tab=e.target.closest("[data-filter]"); if(!tab)return; currentFilter=tab.dataset.filter; $$(".filter-tab").forEach(t=>t.classList.toggle("active",t===tab)); renderProducts(); });
$("[data-add-promo]").addEventListener("click",()=>addToCart(9));
$("#openCart").addEventListener("click",openCart); $("#closeCart").addEventListener("click",closeCart); $("#cartBackdrop").addEventListener("click",closeCart);
checkoutBtn.addEventListener("click",openCheckout); $("#closeCheckout").addEventListener("click",closeCheckout); $("#checkoutBackdrop").addEventListener("click",closeCheckout);
$("#checkoutForm").addEventListener("submit",submitOrder); $("#feedbackForm").addEventListener("submit",submitFeedback);
menuToggle.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(open));});
navLinks.addEventListener("click",e=>{if(e.target.matches("a")){navLinks.classList.remove("open");menuToggle.setAttribute("aria-expanded","false");}});

const sections=$$("main section[id]"); const navAnchors=$$(".nav-links a");
const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navAnchors.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${entry.target.id}`));}});},{rootMargin:"-45% 0px -48% 0px",threshold:0}); sections.forEach(s=>sectionObserver.observe(s));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");revealObserver.unobserve(entry.target);}}),{threshold:.12}); $$(".reveal").forEach(el=>revealObserver.observe(el));

renderProducts(); renderCart();

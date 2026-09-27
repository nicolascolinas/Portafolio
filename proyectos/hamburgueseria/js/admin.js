const keyForm = document.querySelector("#keyForm");
const adminKey = document.querySelector("#adminKey");
const loginBox = document.querySelector("#loginBox");
const dashboard = document.querySelector("#dashboard");
const ordersEl = document.querySelector("#orders");
const loginStatus = document.querySelector("#loginStatus");
const refreshBtn = document.querySelector("#refreshBtn");

let key = sessionStorage.getItem("colink-admin-key") || "";

const fmt = value => new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
}).format(value);

const labels = {
  pending: "Pendiente",
  preparing: "Preparando",
  on_the_way: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado"
};

function handleLoginError(error) {
  loginStatus.textContent = error.message;
  loginBox.hidden = false;
  dashboard.hidden = true;
  sessionStorage.removeItem("colink-admin-key");
}

async function loadOrders() {
  const response = await fetch("/api/admin/orders", {
    headers: { "x-admin-key": key }
  });

  if (!response.ok) {
    throw new Error("Clave incorrecta");
  }

  const data = await response.json();
  loginBox.hidden = true;
  dashboard.hidden = false;

  document.querySelector("#statTotal").textContent = data.length;
  document.querySelector("#statPending").textContent = data.filter(order => order.status === "pending").length;
  document.querySelector("#statPreparing").textContent = data.filter(order => order.status === "preparing").length;
  document.querySelector("#statDelivered").textContent = data.filter(order => order.status === "delivered").length;

  ordersEl.innerHTML = data.length
    ? data.map(order => `
      <article class="order">
        <div>
          <h3>${order.id}</h3>
          <p><strong>${order.customer.name}</strong> · ${order.customer.phone}</p>
          <p>${order.customer.address}</p>
          <p>${new Date(order.createdAt).toLocaleString("es-AR")}</p>
        </div>
        <div class="order-items">
          ${order.items.map(item => `<p>${item.qty}× ${item.name} · ${fmt(item.subtotal)}</p>`).join("")}
        </div>
        <div>
          <div class="order-total">${fmt(order.total)}</div>
          <p>Pago: ${order.paymentMethod}</p>
          <select data-order="${order.id}">
            ${Object.entries(labels).map(([value, label]) => `<option value="${value}" ${order.status === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </div>
      </article>`).join("")
    : "<p>No hay pedidos todavía.</p>";
}

keyForm.addEventListener("submit", async event => {
  event.preventDefault();
  key = adminKey.value;
  sessionStorage.setItem("colink-admin-key", key);
  loginStatus.textContent = "";
  try {
    await loadOrders();
  } catch (error) {
    handleLoginError(error);
  }
});

refreshBtn.addEventListener("click", () => {
  loadOrders().catch(handleLoginError);
});

ordersEl.addEventListener("change", async event => {
  if (!event.target.matches("select[data-order]")) return;

  const response = await fetch(`/api/admin/orders/${encodeURIComponent(event.target.dataset.order)}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": key
    },
    body: JSON.stringify({ status: event.target.value })
  });

  if (!response.ok) {
    alert("No se pudo actualizar el pedido");
  }
});

if (key) {
  loadOrders().catch(handleLoginError);
}

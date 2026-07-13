const { getOrders, formatPrice } = window.CafeUtils;

const statusLabels = {
  pending: "접수 대기",
  preparing: "제조 중",
  ready: "픽업 가능",
  completed: "완료",
  cancelled: "취소",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "날짜 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatOptions(options = {}) {
  const values = [options.temperature, options.size, ...(options.addons || [])].filter(Boolean);
  return values.length ? values.join(" · ") : "기본 옵션";
}

function renderSummary(orders) {
  const activeStatuses = new Set(["pending", "preparing", "ready"]);
  const activeCount = orders.filter((order) => activeStatuses.has(order.status)).length;
  const totalPrice = orders.reduce((total, order) => total + (Number(order.totalPrice) || 0), 0);

  document.getElementById("order-count").textContent = `${orders.length}건`;
  document.getElementById("total-orders").textContent = `${orders.length}건`;
  document.getElementById("active-orders").textContent = `${activeCount}건`;
  document.getElementById("total-price").textContent = formatPrice(totalPrice);
}

function renderOrders() {
  const orders = getOrders();
  const orderList = document.getElementById("order-list");
  const emptyState = document.getElementById("empty-state");

  renderSummary(orders);

  if (orders.length === 0) {
    orderList.innerHTML = "";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  orderList.innerHTML = orders
    .map(
      (order) => `
        <article class="order-card glass-card">
          <div class="order-card-header">
            <div>
              <p class="order-id">${escapeHtml(order.id)}</p>
              <p class="order-date">${formatDate(order.createdAt)}</p>
            </div>
            <span class="status-badge ${escapeHtml(order.status)}">${statusLabels[order.status] || order.status || "상태 없음"}</span>
          </div>

          <ul class="order-items">
            ${(order.items || [])
              .map(
                (item) => `
                  <li class="order-item">
                    <div>
                      <span class="item-name">${escapeHtml(item.name)}</span>
                      <p class="item-options">${escapeHtml(formatOptions(item.options))}</p>
                    </div>
                    <span class="item-pill">${item.quantity}개 · ${formatPrice(item.price * item.quantity)}</span>
                  </li>
                `
              )
              .join("")}
          </ul>

          <div class="order-card-footer">
            <span>${(order.items || []).length}개 메뉴</span>
            <strong class="order-total">${formatPrice(order.totalPrice)}</strong>
          </div>
        </article>
      `
    )
    .join("");
}

renderOrders();

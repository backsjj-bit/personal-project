const { getOrders, formatPrice, getCurrentUser, logout } = window.CafeUtils;

const statusLabels = {
  pending: "접수 대기",
  preparing: "제조 중",
  ready: "픽업 가능",
  completed: "완료",
  cancelled: "취소",
};

const tiers = [
  { min: 10, label: "골드회원" },
  { min: 3, label: "실버회원" },
  { min: 0, label: "일반회원" },
];

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

function getTierLabel(orderCount) {
  return tiers.find((tier) => orderCount >= tier.min).label;
}

function renderProfile(user, orders) {
  const tierLabel = getTierLabel(orders.length);

  document.getElementById("tier-badge").textContent = tierLabel;
  document.getElementById("profile-avatar").textContent = user.name.trim().charAt(0).toUpperCase();
  document.getElementById("profile-name").textContent = user.name;
  document.getElementById("profile-desc").textContent =
    orders.length > 0 ? `지금까지 ${orders.length}건을 주문했어요.` : "아직 주문 내역이 없어요.";
}

function renderSummary(orders) {
  const activeStatuses = new Set(["pending", "preparing", "ready"]);
  const activeCount = orders.filter((order) => activeStatuses.has(order.status)).length;
  const totalPrice = orders.reduce((total, order) => total + (Number(order.totalPrice) || 0), 0);

  document.getElementById("total-orders").textContent = `${orders.length}건`;
  document.getElementById("active-orders").textContent = `${activeCount}건`;
  document.getElementById("total-price").textContent = formatPrice(totalPrice);
}

function renderRecentOrders(orders) {
  const recentOrders = document.getElementById("recent-orders");
  const emptyState = document.getElementById("recent-empty");
  const recent = orders.slice(0, 3);

  if (recent.length === 0) {
    recentOrders.innerHTML = "";
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  recentOrders.innerHTML = recent
    .map(
      (order) => `
        <a class="order-mini-card glass-card" href="../orders/detail.html?id=${encodeURIComponent(order.id)}">
          <div>
            <p class="order-id">${escapeHtml(order.id)}</p>
            <p class="order-date">${formatDate(order.createdAt)}</p>
          </div>
          <span class="status-badge ${escapeHtml(order.status)}">${statusLabels[order.status] || order.status || "상태 없음"}</span>
          <strong class="order-total">${formatPrice(order.totalPrice)}</strong>
        </a>
      `
    )
    .join("");
}

function init() {
  const user = getCurrentUser();
  const guestView = document.getElementById("guest-view");
  const memberView = document.getElementById("member-view");

  if (!user) {
    guestView.hidden = false;
    memberView.hidden = true;
    return;
  }

  guestView.hidden = true;
  memberView.hidden = false;

  const orders = getOrders();
  renderProfile(user, orders);
  renderSummary(orders);
  renderRecentOrders(orders);

  document.getElementById("btn-logout").addEventListener("click", () => {
    logout();
    window.location.href = "../auth/login.html";
  });
}

init();

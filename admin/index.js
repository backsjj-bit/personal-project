(function () {
  if (!window.CafeUtils.isAdminLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const STATUS_LABELS = {
    pending: "접수 대기",
    preparing: "제조 중",
    ready: "픽업 가능",
    completed: "완료",
    cancelled: "취소",
  };
  const ACTIVE_STATUSES = new Set(["pending", "preparing", "ready"]);

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

  function getItemCount(order) {
    return (order.items || []).reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }

  function renderSummary(menus, orders) {
    const activeOrders = orders.filter((order) => ACTIVE_STATUSES.has(order.status));
    const totalRevenue = orders.reduce((total, order) => total + (Number(order.totalPrice) || 0), 0);

    document.getElementById("menu-count").textContent = `${menus.length}개`;
    document.getElementById("sold-out-count").textContent = `${menus.filter((menu) => menu.isSoldOut).length}개`;
    document.getElementById("order-count").textContent = `${orders.length}건`;
    document.getElementById("active-order-count").textContent = `${activeOrders.length}건`;
    document.getElementById("total-revenue").textContent = window.CafeUtils.formatPrice(totalRevenue);
  }

  function renderRecentOrders(orders) {
    const listEl = document.getElementById("recent-orders");
    const emptyEl = document.getElementById("empty-orders");
    const recentOrders = orders.slice(0, 5);

    if (!recentOrders.length) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    listEl.innerHTML = recentOrders
      .map(
        (order) => `
          <article class="order-card glass-card">
            <div class="order-card__top">
              <div>
                <p class="order-id">${escapeHtml(order.id)}</p>
                <p class="order-date">${formatDate(order.createdAt)}</p>
              </div>
              <span class="badge ${order.status === "cancelled" ? "badge--danger" : ""}">
                ${escapeHtml(STATUS_LABELS[order.status] || order.status || "상태 없음")}
              </span>
            </div>
            <div class="order-card__meta">
              <span>${getItemCount(order)}개 상품</span>
              <strong class="order-total">${window.CafeUtils.formatPrice(order.totalPrice)}</strong>
              <a class="btn btn--ghost btn--sm" href="orders/detail.html?id=${encodeURIComponent(order.id)}">상세</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  const menus = window.CafeUtils.getMenus();
  const orders = window.CafeUtils.getOrders();

  renderSummary(menus, orders);
  renderRecentOrders(orders);
})();

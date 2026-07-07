(function () {
  const STATUS_LABELS = {
    pending: "접수 대기",
    preparing: "제조 중",
    ready: "픽업 가능",
    completed: "완료",
    cancelled: "취소",
  };
  const ACTIVE_STATUSES = new Set(["pending", "preparing", "ready"]);

  const statusFilterEl = document.getElementById("status-filter");
  const searchInputEl = document.getElementById("search-input");
  const listBodyEl = document.getElementById("order-list-body");
  const emptyMessageEl = document.getElementById("empty-message");

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

  function getMenuSummary(order) {
    const items = order.items || [];
    if (!items.length) {
      return { title: "메뉴 없음", detail: "0개 상품" };
    }

    const firstItem = items[0];
    const extraCount = Math.max(items.length - 1, 0);
    return {
      title: extraCount ? `${firstItem.name} 외 ${extraCount}개` : firstItem.name,
      detail: `${getItemCount(order)}개 상품`,
    };
  }

  function renderStatusOptions(selectedStatus) {
    return Object.entries(STATUS_LABELS)
      .map(
        ([status, label]) =>
          `<option value="${status}" ${status === selectedStatus ? "selected" : ""}>${label}</option>`
      )
      .join("");
  }

  function renderSummary(orders) {
    const activeCount = orders.filter((order) => ACTIVE_STATUSES.has(order.status)).length;
    const completedCount = orders.filter((order) => order.status === "completed").length;
    const totalRevenue = orders.reduce((total, order) => total + (Number(order.totalPrice) || 0), 0);

    document.getElementById("total-orders").textContent = `${orders.length}건`;
    document.getElementById("active-orders").textContent = `${activeCount}건`;
    document.getElementById("completed-orders").textContent = `${completedCount}건`;
    document.getElementById("total-revenue").textContent = window.CafeUtils.formatPrice(totalRevenue);
  }

  function getFilteredOrders() {
    const status = statusFilterEl.value;
    const keyword = searchInputEl.value.trim().toLowerCase();

    return window.CafeUtils.getOrders().filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const menuText = (order.items || []).map((item) => item.name).join(" ").toLowerCase();
      const matchesKeyword =
        !keyword ||
        String(order.id).toLowerCase().includes(keyword) ||
        menuText.includes(keyword);

      return matchesStatus && matchesKeyword;
    });
  }

  function createOrderRow(order) {
    const row = document.createElement("div");
    const menuSummary = getMenuSummary(order);
    row.className = "order-table__row";
    row.innerHTML = `
      <span class="order-id">${escapeHtml(order.id)}</span>
      <span class="order-date">${formatDate(order.createdAt)}</span>
      <span class="order-menu">
        <strong>${escapeHtml(menuSummary.title)}</strong>
        <small>${escapeHtml(menuSummary.detail)}</small>
      </span>
      <span class="order-total">${window.CafeUtils.formatPrice(order.totalPrice)}</span>
      <span>
        <select class="status-select" data-status-id="${escapeHtml(order.id)}" aria-label="주문 상태 변경">
          ${renderStatusOptions(order.status)}
        </select>
      </span>
      <span class="order-actions">
        <span class="badge ${order.status === "cancelled" ? "badge--danger" : ""}">
          ${escapeHtml(STATUS_LABELS[order.status] || order.status || "상태 없음")}
        </span>
        <a class="btn btn--ghost btn--sm" href="detail.html?id=${encodeURIComponent(order.id)}">상세</a>
      </span>
    `;
    return row;
  }

  function renderOrders() {
    const orders = window.CafeUtils.getOrders();
    const filteredOrders = getFilteredOrders();

    renderSummary(orders);
    listBodyEl.innerHTML = "";
    emptyMessageEl.hidden = filteredOrders.length > 0;
    filteredOrders.forEach((order) => listBodyEl.appendChild(createOrderRow(order)));
  }

  function updateOrderStatus(orderId, status) {
    const nextOrders = window.CafeUtils.getOrders().map((order) =>
      order.id === orderId ? { ...order, status } : order
    );
    window.CafeUtils.saveOrders(nextOrders);
    renderOrders();
  }

  statusFilterEl.addEventListener("change", renderOrders);
  searchInputEl.addEventListener("input", renderOrders);
  listBodyEl.addEventListener("change", (event) => {
    const selectEl = event.target.closest("[data-status-id]");
    if (!selectEl) return;
    updateOrderStatus(selectEl.dataset.statusId, selectEl.value);
  });

  renderOrders();
})();

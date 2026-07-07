(function () {
  const STATUS_LABELS = {
    pending: "접수 대기",
    preparing: "제조 중",
    ready: "픽업 가능",
    completed: "완료",
    cancelled: "취소",
  };

  const detailEl = document.getElementById("order-detail");
  const notFoundEl = document.getElementById("not-found-message");

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
    const values = [options.temperature, options.size].filter(Boolean);
    return values.length ? values.join(" · ") : "기본 옵션";
  }

  function renderStatusOptions(selectedStatus) {
    return Object.entries(STATUS_LABELS)
      .map(
        ([status, label]) =>
          `<option value="${status}" ${status === selectedStatus ? "selected" : ""}>${label}</option>`
      )
      .join("");
  }

  function saveOrderStatus(orderId, status) {
    const nextOrders = window.CafeUtils.getOrders().map((order) =>
      order.id === orderId ? { ...order, status } : order
    );
    window.CafeUtils.saveOrders(nextOrders);
  }

  function renderOrder(order) {
    detailEl.innerHTML = `
      <div class="order-detail__header">
        <div>
          <h1 class="order-id">${escapeHtml(order.id)}</h1>
          <p class="order-date">${formatDate(order.createdAt)}</p>
        </div>
        <label class="status-control">
          <span>주문 상태</span>
          <select id="status-select" class="status-select">
            ${renderStatusOptions(order.status)}
          </select>
        </label>
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
                <span class="item-quantity">${Number(item.quantity) || 0}개</span>
                <span class="item-subtotal">${window.CafeUtils.formatPrice(item.price * item.quantity)}</span>
              </li>
            `
          )
          .join("")}
      </ul>

      <div class="order-total">
        <span>총 결제 금액</span>
        <strong>${window.CafeUtils.formatPrice(order.totalPrice)}</strong>
      </div>
    `;

    document.getElementById("status-select").addEventListener("change", (event) => {
      saveOrderStatus(order.id, event.target.value);
    });
  }

  const orderId = window.CafeUtils.getQueryParam("id");
  const order = window.CafeUtils.getOrders().find((savedOrder) => savedOrder.id === orderId);

  if (!order) {
    detailEl.hidden = true;
    notFoundEl.hidden = false;
    return;
  }

  renderOrder(order);
})();

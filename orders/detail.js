const { getOrders, getQueryParam, formatPrice, getCurrentUser } = window.CafeUtils;

const STATUS_LABELS = {
  pending: '주문 접수',
  preparing: '준비중',
  completed: '완료',
  cancelled: '취소',
};

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderOrder(order) {
  const detailEl = document.getElementById('order-detail');
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  detailEl.innerHTML = `
    <div class="order-summary glass-card">
      <div class="order-summary-row">
        <span class="order-id">주문번호 ${order.id}</span>
        <span class="status-badge status-${order.status}">${statusLabel}</span>
      </div>
      <p class="order-date">${formatDateTime(order.createdAt)}</p>
    </div>

    <div class="order-items glass-card">
      ${order.items
        .map(
          (item) => `
        <div class="order-item">
          <div class="order-item-info">
            <h3>${item.name}</h3>
            <p class="item-options">${item.options.temperature} · ${item.options.size}</p>
          </div>
          <div class="order-item-qty">x${item.quantity}</div>
          <div class="order-item-subtotal">${formatPrice(item.price * item.quantity)}</div>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="order-total glass-card">
      <span>총 결제 금액</span>
      <span class="total-price">${formatPrice(order.totalPrice)}</span>
    </div>
  `;
}

async function init() {
  const orderId = getQueryParam('id');
  const currentUser = await getCurrentUser();
  const order = getOrders().find(
    (savedOrder) => savedOrder.id === orderId && savedOrder.userEmail === currentUser?.email
  );
  const detailEl = document.getElementById('order-detail');
  const emptyState = document.getElementById('empty-state');

  if (!order) {
    detailEl.hidden = true;
    emptyState.hidden = false;
    return;
  }

  renderOrder(order);
}

init();

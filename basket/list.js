const { getCart, updateCartItem, removeCartItem, getCartTotal, createOrder, formatPrice } = window.CafeUtils;

function renderCart() {
  const cart = getCart();
  const listEl = document.getElementById('cart-list');
  const summaryEl = document.getElementById('cart-summary');
  const emptyState = document.getElementById('empty-state');

  if (cart.length === 0) {
    listEl.innerHTML = '';
    summaryEl.hidden = true;
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  summaryEl.hidden = false;

  listEl.innerHTML = cart.map((item) => `
    <div class="cart-item glass-card" data-item-id="${item.id}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p class="item-options">${[item.options.temperature, item.options.size, ...(item.options.addons || [])].join(' · ')}</p>
        <p class="unit-price">${formatPrice(item.price)}</p>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-control">
          <button class="qty-btn" data-qty-minus type="button">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-qty-plus type="button">+</button>
        </div>
        <p class="subtotal">${formatPrice(item.price * item.quantity)}</p>
        <button class="btn btn-ghost btn-remove" data-remove type="button">삭제</button>
      </div>
    </div>
  `).join('');

  document.getElementById('cart-total').textContent = formatPrice(getCartTotal());
}

document.getElementById('cart-list').addEventListener('click', (e) => {
  const itemEl = e.target.closest('[data-item-id]');
  if (!itemEl) return;

  const itemId = itemEl.dataset.itemId;
  const cart = getCart();
  const item = cart.find((c) => c.id === itemId);
  if (!item) return;

  if (e.target.closest('[data-qty-minus]')) {
    updateCartItem(itemId, item.quantity - 1);
    renderCart();
  } else if (e.target.closest('[data-qty-plus]')) {
    updateCartItem(itemId, item.quantity + 1);
    renderCart();
  } else if (e.target.closest('[data-remove]')) {
    removeCartItem(itemId);
    renderCart();
  }
});

document.getElementById('btn-checkout').addEventListener('click', () => {
  const cart = getCart();
  if (cart.length === 0) return;

  createOrder(cart);
  renderCart();

  const successEl = document.getElementById('order-success');
  successEl.hidden = false;
  setTimeout(() => { successEl.hidden = true; }, 2500);
});

renderCart();

const {
  getCart,
  updateCartItem,
  removeCartItem,
  getCartTotal,
  createOrder,
  formatPrice,
  getCurrentUser,
  getStampInfo,
  hasSignupCoupon,
  COUPON_DISCOUNT,
  SIGNUP_COUPON_DISCOUNT,
} = window.CafeUtils;

const couponSectionEl = document.getElementById('coupon-section');
const couponStampEl = document.getElementById('coupon-stamp');
const couponStampLabelEl = document.getElementById('coupon-stamp-label');
const couponSignupEl = document.getElementById('coupon-signup');
const discountRowEl = document.getElementById('discount-row');
const cartDiscountEl = document.getElementById('cart-discount');
const cartTotalEl = document.getElementById('cart-total');

function getAvailableCoupons() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { stampCoupons: 0, signupCoupon: false };
  }

  return {
    stampCoupons: getStampInfo(currentUser.email).availableCoupons,
    signupCoupon: hasSignupCoupon(currentUser.email),
  };
}

function renderCouponOptions() {
  const { stampCoupons, signupCoupon } = getAvailableCoupons();

  couponStampEl.closest('.coupon-option').hidden = stampCoupons <= 0;
  couponStampLabelEl.textContent = `사용 가능한 스탬프 쿠폰 ${stampCoupons}장 사용 (-${formatPrice(COUPON_DISCOUNT).replace('₩', '')}원)`;
  couponSignupEl.closest('.coupon-option').hidden = !signupCoupon;

  couponSectionEl.hidden = stampCoupons <= 0 && !signupCoupon;

  if (stampCoupons <= 0) couponStampEl.checked = false;
  if (!signupCoupon) couponSignupEl.checked = false;
}

function updateTotals() {
  const subtotal = getCartTotal();
  const discount =
    (couponStampEl.checked ? COUPON_DISCOUNT : 0) + (couponSignupEl.checked ? SIGNUP_COUPON_DISCOUNT : 0);
  const total = Math.max(subtotal - discount, 0);

  discountRowEl.hidden = discount <= 0;
  cartDiscountEl.textContent = `-${formatPrice(discount)}`;
  cartTotalEl.textContent = formatPrice(total);
}

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

  renderCouponOptions();
  updateTotals();
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

couponStampEl.addEventListener('change', updateTotals);
couponSignupEl.addEventListener('change', updateTotals);

document.getElementById('btn-checkout').addEventListener('click', () => {
  const cart = getCart();
  if (cart.length === 0) return;

  createOrder(cart, {
    useCoupon: couponStampEl.checked,
    useSignupCoupon: couponSignupEl.checked,
  });
  renderCart();

  const successEl = document.getElementById('order-success');
  successEl.hidden = false;
  setTimeout(() => { successEl.hidden = true; }, 2500);
});

renderCart();

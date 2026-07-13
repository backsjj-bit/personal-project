(function () {
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderCartSidebar() {
    const sidebar = document.getElementById("cartSidebar");
    if (!sidebar) {
      return;
    }

    const { getCart, getCartTotal, formatPrice } = window.CafeUtils;
    const cart = getCart();
    const listEl = document.getElementById("cartSidebarList");
    const emptyEl = document.getElementById("cartSidebarEmpty");
    const totalEl = document.getElementById("cartSidebarTotal");
    const checkoutLink = document.getElementById("cartSidebarCheckout");
    const countEl = document.getElementById("cartSidebarCount");

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    countEl.textContent = `${itemCount}개`;

    if (!cart.length) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      totalEl.textContent = formatPrice(0);
      checkoutLink.setAttribute("aria-disabled", "true");
      return;
    }

    emptyEl.hidden = true;
    checkoutLink.removeAttribute("aria-disabled");
    listEl.innerHTML = cart
      .map((item) => {
        const optionText = [item.options.temperature, item.options.size, ...(item.options.addons || [])].join(" · ");
        return `
          <div class="cart-sidebar__item" data-item-id="${escapeHtml(item.id)}">
            <div class="cart-sidebar__item-info">
              <p class="cart-sidebar__item-name">${escapeHtml(item.name)}</p>
              <p class="cart-sidebar__item-options">${escapeHtml(optionText)}</p>
              <div class="cart-sidebar__qty">
                <button type="button" class="cart-sidebar__qty-btn" data-qty-minus>-</button>
                <span class="cart-sidebar__qty-value">${item.quantity}</span>
                <button type="button" class="cart-sidebar__qty-btn" data-qty-plus>+</button>
                <button type="button" class="cart-sidebar__remove" data-remove aria-label="삭제">삭제</button>
              </div>
            </div>
            <span class="cart-sidebar__item-price">${formatPrice(item.price * item.quantity)}</span>
          </div>
        `;
      })
      .join("");
    totalEl.textContent = formatPrice(getCartTotal());
  }

  function handleListClick(event) {
    const itemEl = event.target.closest("[data-item-id]");
    if (!itemEl) {
      return;
    }

    const { getCart, updateCartItem, removeCartItem } = window.CafeUtils;
    const itemId = itemEl.dataset.itemId;
    const item = getCart().find((cartItem) => cartItem.id === itemId);
    if (!item) {
      return;
    }

    if (event.target.closest("[data-qty-minus]")) {
      updateCartItem(itemId, item.quantity - 1);
    } else if (event.target.closest("[data-qty-plus]")) {
      updateCartItem(itemId, item.quantity + 1);
    } else if (event.target.closest("[data-remove]")) {
      removeCartItem(itemId);
    } else {
      return;
    }

    renderCartSidebar();
  }

  window.renderCartSidebar = renderCartSidebar;
  window.addEventListener("DOMContentLoaded", () => {
    renderCartSidebar();
    document.getElementById("cartSidebarList")?.addEventListener("click", handleListClick);
  });
})();

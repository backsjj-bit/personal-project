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
          <div class="cart-sidebar__item">
            <div>
              <p class="cart-sidebar__item-name">${escapeHtml(item.name)} × ${item.quantity}</p>
              <p class="cart-sidebar__item-options">${escapeHtml(optionText)}</p>
            </div>
            <span>${formatPrice(item.price * item.quantity)}</span>
          </div>
        `;
      })
      .join("");
    totalEl.textContent = formatPrice(getCartTotal());
  }

  window.renderCartSidebar = renderCartSidebar;
  window.addEventListener("DOMContentLoaded", renderCartSidebar);
})();

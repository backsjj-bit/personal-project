(function () {
  const CART_STORAGE_KEY = "newCafeCart";
  const ORDER_STORAGE_KEY = "newCafeOrders";

  function formatPrice(value) {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function findMenuById(menuId) {
    return (window.CafeData?.menus || []).find((menu) => menu.id === menuId) || null;
  }

  function findCategoryById(categoryId) {
    return (window.CafeData?.categories || []).find((category) => category.id === categoryId) || null;
  }

  function getMenusByCategory(categoryId) {
    const menus = window.CafeData?.menus || [];
    if (!categoryId || categoryId === "all") {
      return menus;
    }

    return menus.filter((menu) => menu.categoryId === categoryId);
  }

  function readStorage(key, fallback) {
    try {
      const savedValue = localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : fallback;
    } catch (error) {
      console.warn("Failed to read storage:", key, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getCart() {
    return readStorage(CART_STORAGE_KEY, []);
  }

  function saveCart(cartItems) {
    writeStorage(CART_STORAGE_KEY, cartItems);
    return cartItems;
  }

  function createCartItemId(menuId, options) {
    return [menuId, options.temperature, options.size].filter(Boolean).join(":");
  }

  function addToCart(menuId, options = {}, quantity = 1) {
    const menu = findMenuById(menuId);
    if (!menu || menu.isSoldOut) {
      return getCart();
    }

    const normalizedOptions = {
      temperature: options.temperature || menu.options?.temperature?.[0] || "hot",
      size: options.size || menu.options?.sizes?.[0] || "regular",
    };
    const itemId = createCartItemId(menuId, normalizedOptions);
    const cart = getCart();
    const existingItem = cart.find((item) => item.id === itemId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: itemId,
        menuId,
        name: menu.name,
        price: menu.price,
        quantity,
        options: normalizedOptions,
      });
    }

    return saveCart(cart);
  }

  function updateCartItem(itemId, quantity) {
    const nextCart = getCart()
      .map((item) => (item.id === itemId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);

    return saveCart(nextCart);
  }

  function removeCartItem(itemId) {
    return saveCart(getCart().filter((item) => item.id !== itemId));
  }

  function clearCart() {
    return saveCart([]);
  }

  function getCartTotal(cartItems = getCart()) {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  function getOrders() {
    return readStorage(ORDER_STORAGE_KEY, []);
  }

  function saveOrders(orders) {
    writeStorage(ORDER_STORAGE_KEY, orders);
    return orders;
  }

  function createOrder(cartItems = getCart()) {
    if (!cartItems.length) {
      return null;
    }

    const order = {
      id: `order-${Date.now()}`,
      items: cartItems,
      totalPrice: getCartTotal(cartItems),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    saveOrders([order, ...getOrders()]);
    clearCart();
    return order;
  }

  window.CafeUtils = Object.freeze({
    CART_STORAGE_KEY,
    ORDER_STORAGE_KEY,
    formatPrice,
    getQueryParam,
    findMenuById,
    findCategoryById,
    getMenusByCategory,
    getCart,
    saveCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartTotal,
    getOrders,
    saveOrders,
    createOrder,
  });
})();

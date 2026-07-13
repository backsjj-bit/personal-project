(function () {
  const CART_STORAGE_KEY = "newCafeCart";
  const ORDER_STORAGE_KEY = "newCafeOrders";
  const MENU_STORAGE_KEY = "newCafeMenusV16";
  const USER_STORAGE_KEY = "newCafeUsers";
  const SESSION_STORAGE_KEY = "newCafeSession";
  const ADMIN_ID = "damon";
  const ADMIN_PASSWORD = "9802";
  const ADMIN_SESSION_KEY = "newCafeAdminSession";

  function formatPrice(value) {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function getMenuPrice(menu, size) {
    const prices = menu.price || {};
    if (size && prices[size] != null) {
      return prices[size];
    }

    const values = Object.values(prices);
    return values.length ? values[0] : 0;
  }

  function getAddonsTotal(menu, addonIds = []) {
    const addons = menu.addons || [];
    return addonIds.reduce((total, addonId) => {
      const addon = addons.find((candidate) => candidate.id === addonId);
      return total + (addon ? addon.price : 0);
    }, 0);
  }

  function getAddonLabels(menu, addonIds = []) {
    const addons = menu.addons || [];
    return addonIds.map((addonId) => addons.find((candidate) => candidate.id === addonId)?.label).filter(Boolean);
  }

  function getMenuPriceRange(menu) {
    const values = Object.values(menu.price || {});
    if (!values.length) {
      return { min: 0, max: 0 };
    }

    return { min: Math.min(...values), max: Math.max(...values) };
  }

  function formatPriceRange(menu) {
    const { min, max } = getMenuPriceRange(menu);
    return min === max ? formatPrice(min) : `${formatPrice(min)} ~ ${formatPrice(max)}`;
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function findMenuById(menuId) {
    return getMenus().find((menu) => menu.id === menuId) || null;
  }

  function findCategoryById(categoryId) {
    return (window.CafeData?.categories || []).find((category) => category.id === categoryId) || null;
  }

  function getMenusByCategory(categoryId) {
    const menus = getMenus();
    if (!categoryId || categoryId === "all") {
      return menus;
    }

    return menus.filter((menu) => menu.categoryId === categoryId);
  }

  function getMenus() {
    const storedMenus = readStorage(MENU_STORAGE_KEY, null);
    if (storedMenus) {
      return storedMenus;
    }

    const initialMenus = window.CafeData?.menus || [];
    writeStorage(MENU_STORAGE_KEY, initialMenus);
    return initialMenus;
  }

  function saveMenus(menus) {
    writeStorage(MENU_STORAGE_KEY, menus);
    return menus;
  }

  function generateMenuId(seedName) {
    const base =
      (seedName || "menu")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, "-")
        .replace(/(^-+|-+$)/g, "") || "menu";

    const existingIds = new Set(getMenus().map((menu) => menu.id));
    let candidateId = base;
    let suffix = 1;
    while (existingIds.has(candidateId)) {
      candidateId = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidateId;
  }

  function addMenu(menuData) {
    const newMenu = {
      ...menuData,
      id: menuData.id || generateMenuId(menuData.englishName || menuData.name),
    };

    saveMenus([...getMenus(), newMenu]);
    return newMenu;
  }

  function updateMenu(menuId, updates) {
    const nextMenus = getMenus().map((menu) =>
      menu.id === menuId ? { ...menu, ...updates, id: menu.id } : menu
    );

    saveMenus(nextMenus);
    return nextMenus.find((menu) => menu.id === menuId) || null;
  }

  function deleteMenu(menuId) {
    return saveMenus(getMenus().filter((menu) => menu.id !== menuId));
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
    const addonKey = (options.addons || []).slice().sort().join(",");
    return [menuId, options.temperature, options.size, addonKey].filter(Boolean).join(":");
  }

  function addToCart(menuId, options = {}, quantity = 1) {
    const menu = findMenuById(menuId);
    if (!menu || menu.isSoldOut) {
      return getCart();
    }

    const normalizedOptions = {
      temperature: options.temperature || menu.options?.temperature?.[0] || "hot",
      size: options.size || menu.options?.sizes?.[0] || "regular",
      addons: options.addons || [],
    };
    const itemId = createCartItemId(menuId, normalizedOptions);
    const cart = getCart();
    const existingItem = cart.find((item) => item.id === itemId);
    const unitPrice = getMenuPrice(menu, normalizedOptions.size) + getAddonsTotal(menu, normalizedOptions.addons);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: itemId,
        menuId,
        name: menu.name,
        price: unitPrice,
        quantity,
        options: {
          temperature: normalizedOptions.temperature,
          size: normalizedOptions.size,
          addons: getAddonLabels(menu, normalizedOptions.addons),
        },
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

  function getUsers() {
    return readStorage(USER_STORAGE_KEY, []);
  }

  function saveUsers(users) {
    writeStorage(USER_STORAGE_KEY, users);
    return users;
  }

  function findUserByEmail(email) {
    return getUsers().find((user) => user.email === email) || null;
  }

  function registerUser({ name, email, password }) {
    if (findUserByEmail(email)) {
      return { success: false, message: "이미 가입된 이메일입니다." };
    }

    const user = { name, email, password };
    saveUsers([...getUsers(), user]);
    writeStorage(SESSION_STORAGE_KEY, email);
    return { success: true, user };
  }

  function login(email, password) {
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      return { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }

    writeStorage(SESSION_STORAGE_KEY, email);
    return { success: true, user };
  }

  function logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  function getCurrentUser() {
    const email = readStorage(SESSION_STORAGE_KEY, null);
    return email ? findUserByEmail(email) : null;
  }

  function adminLogin(id, password) {
    if (id !== ADMIN_ID || password !== ADMIN_PASSWORD) {
      return { success: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." };
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    return { success: true };
  }

  function isAdminLoggedIn() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  }

  function adminLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }

  window.CafeUtils = Object.freeze({
    CART_STORAGE_KEY,
    ORDER_STORAGE_KEY,
    formatPrice,
    getMenuPrice,
    getMenuPriceRange,
    formatPriceRange,
    getAddonsTotal,
    getAddonLabels,
    getQueryParam,
    findMenuById,
    findCategoryById,
    getMenusByCategory,
    getMenus,
    saveMenus,
    generateMenuId,
    addMenu,
    updateMenu,
    deleteMenu,
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
    registerUser,
    login,
    logout,
    getCurrentUser,
    adminLogin,
    isAdminLoggedIn,
    adminLogout,
  });
})();

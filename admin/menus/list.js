(function () {
  if (!window.CafeUtils.isAdminLoggedIn()) {
    window.location.href = "../login.html";
    return;
  }

  const categoryFilterEl = document.getElementById("category-filter");
  const searchInputEl = document.getElementById("search-input");
  const listBodyEl = document.getElementById("menu-list-body");
  const emptyMessageEl = document.getElementById("empty-message");

  function renderCategoryOptions() {
    const categories = window.CafeData?.categories || [];
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.label;
      categoryFilterEl.appendChild(option);
    });
  }

  function getCategoryLabel(categoryId) {
    return window.CafeUtils.findCategoryById(categoryId)?.label || "미분류";
  }

  function createMenuRow(menu) {
    const row = document.createElement("div");
    row.className = "menu-table__row";
    row.innerHTML = `
      <span class="menu-table__image">
        <img src="${menu.image}" alt="${menu.name}" loading="lazy" />
      </span>
      <span class="menu-table__name">
        <strong>${menu.name}</strong>
        <small>${menu.englishName || ""}</small>
      </span>
      <span>${getCategoryLabel(menu.categoryId)}</span>
      <span>${window.CafeUtils.formatPriceRange(menu)}</span>
      <span class="menu-table__status">
        ${
          menu.isSoldOut
            ? '<span class="badge badge--danger">품절</span>'
            : '<span class="badge badge--accent">판매중</span>'
        }
        ${menu.isRecommended ? '<span class="badge badge--warning">추천</span>' : ""}
        ${menu.isHidden ? '<span class="badge badge--danger">숨김</span>' : ""}
      </span>
      <span class="menu-table__actions">
        <a href="detail.html?id=${menu.id}" class="btn btn--ghost btn--sm">상세</a>
        <a href="edit.html?id=${menu.id}" class="btn btn--ghost btn--sm">수정</a>
        <button type="button" class="btn btn--ghost btn--sm" data-hide-id="${menu.id}">${menu.isHidden ? "숨김 해제" : "숨김"}</button>
        <button type="button" class="btn btn--danger btn--sm" data-delete-id="${menu.id}">삭제</button>
      </span>
    `;
    return row;
  }

  function renderMenus() {
    const categoryId = categoryFilterEl.value;
    const keyword = searchInputEl.value.trim().toLowerCase();

    let menus = window.CafeUtils.getMenusByCategory(categoryId);
    if (keyword) {
      menus = menus.filter(
        (menu) =>
          menu.name.toLowerCase().includes(keyword) ||
          (menu.englishName || "").toLowerCase().includes(keyword)
      );
    }

    listBodyEl.innerHTML = "";
    emptyMessageEl.hidden = menus.length > 0;
    menus.forEach((menu) => listBodyEl.appendChild(createMenuRow(menu)));
  }

  function handleDeleteClick(event) {
    const deleteButton = event.target.closest("[data-delete-id]");
    if (!deleteButton) return;

    const menuId = deleteButton.dataset.deleteId;
    const menu = window.CafeUtils.findMenuById(menuId);
    if (!menu) return;

    const confirmed = window.confirm(`'${menu.name}' 메뉴를 삭제할까요?`);
    if (!confirmed) return;

    window.CafeUtils.deleteMenu(menuId);
    renderMenus();
  }

  function handleHideClick(event) {
    const hideButton = event.target.closest("[data-hide-id]");
    if (!hideButton) return;

    const menuId = hideButton.dataset.hideId;
    const menu = window.CafeUtils.findMenuById(menuId);
    if (!menu) return;

    window.CafeUtils.updateMenu(menuId, { isHidden: !menu.isHidden });
    renderMenus();
  }

  renderCategoryOptions();
  renderMenus();

  categoryFilterEl.addEventListener("change", renderMenus);
  searchInputEl.addEventListener("input", renderMenus);
  listBodyEl.addEventListener("click", handleDeleteClick);
  listBodyEl.addEventListener("click", handleHideClick);
})();

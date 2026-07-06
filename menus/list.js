window.addEventListener("DOMContentLoaded", () => {
  const { CafeData, CafeUtils } = window;
  const searchInput = document.querySelector("#searchInput");
  const categoryFilter = document.querySelector("#categoryFilter");
  const menuGrid = document.querySelector("#menuGrid");
  const menuCount = document.querySelector("#menuCount");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderCategoryFilter() {
    categoryFilter.innerHTML = [
      '<option value="all">전체</option>',
      ...CafeData.categories.map((category) => `<option value="${category.id}">${escapeHtml(category.label || category.name)}</option>`),
    ].join("");
  }

  function getFilteredMenus() {
    const keyword = searchInput.value.trim().toLowerCase();
    const categoryId = categoryFilter.value;

    return CafeUtils.getMenusByCategory(categoryId).filter((menu) => {
      if (!keyword) {
        return true;
      }

      return `${menu.name} ${menu.englishName} ${menu.description}`.toLowerCase().includes(keyword);
    });
  }

  function renderMenus() {
    const menus = getFilteredMenus();
    menuCount.textContent = `${menus.length}개`;

    if (menus.length === 0) {
      menuGrid.innerHTML = '<p class="empty-state">조건에 맞는 메뉴가 없습니다.</p>';
      return;
    }

    menuGrid.innerHTML = menus
      .map((menu) => {
        const category = CafeUtils.findCategoryById(menu.categoryId);

        return `
          <article class="menu-card ${menu.isSoldOut ? "is-sold-out" : ""}">
            <a href="./detail.html?id=${encodeURIComponent(menu.id)}">
              <div class="menu-image">
                <img src="${escapeHtml(menu.image)}" alt="${escapeHtml(menu.name)}" />
              </div>
              <div class="menu-body">
                <div class="menu-title">
                  <div>
                    <h3>${escapeHtml(menu.name)}</h3>
                    <p>${escapeHtml(menu.englishName)}</p>
                  </div>
                  <span class="price">${CafeUtils.formatPrice(menu.price)}</span>
                </div>
                <p class="menu-description">${escapeHtml(menu.description)}</p>
                <div class="tag-row">
                  <span class="tag">${escapeHtml(category?.label || category?.name || "기타")}</span>
                  ${menu.isRecommended ? '<span class="tag warning">추천</span>' : ""}
                  ${menu.isSoldOut ? '<span class="tag danger">품절</span>' : ""}
                </div>
              </div>
            </a>
          </article>
        `;
      })
      .join("");
  }

  [searchInput, categoryFilter].forEach((element) => {
    element.addEventListener("input", renderMenus);
    element.addEventListener("change", renderMenus);
  });

  renderCategoryFilter();
  renderMenus();
});

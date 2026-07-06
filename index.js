window.addEventListener("DOMContentLoaded", () => {
  const { CafeData, CafeUtils } = window;
  const recommendedGrid = document.querySelector("#recommendedGrid");
  const categoryList = document.querySelector("#categoryList");

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderRecommended() {
    const recommended = CafeData.menus.filter((menu) => menu.isRecommended);

    if (recommended.length === 0) {
      recommendedGrid.innerHTML = '<p class="empty-state">추천 메뉴가 없습니다.</p>';
      return;
    }

    recommendedGrid.innerHTML = recommended
      .map((menu) => {
        const category = CafeUtils.findCategoryById(menu.categoryId);

        return `
          <article class="menu-card ${menu.isSoldOut ? "is-sold-out" : ""}">
            <a href="./menus/detail.html?id=${encodeURIComponent(menu.id)}">
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
                  <span class="tag warning">추천</span>
                  ${menu.isSoldOut ? '<span class="tag danger">품절</span>' : ""}
                </div>
              </div>
            </a>
          </article>
        `;
      })
      .join("");
  }

  function renderCategories() {
    categoryList.innerHTML = CafeData.categories
      .map(
        (category) => `
          <a class="category-card glass-card" href="./menus/list.html">
            <span class="category-label">${escapeHtml(category.label || category.name)}</span>
            <p class="category-description">${escapeHtml(category.description || "")}</p>
          </a>
        `
      )
      .join("");
  }

  renderRecommended();
  renderCategories();
});

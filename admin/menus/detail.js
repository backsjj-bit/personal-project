(function () {
  if (!window.CafeUtils.isAdminLoggedIn()) {
    window.location.href = "../login.html";
    return;
  }

  const detailEl = document.getElementById("menu-detail");
  const notFoundEl = document.getElementById("not-found-message");

  function renderOptionList(label, values) {
    if (!values || !values.length) return "";
    return `<div class="menu-detail__option"><span>${label}</span><strong>${values.join(", ")}</strong></div>`;
  }

  function renderPriceList(price) {
    const entries = Object.entries(price || {});
    if (!entries.length) return "";
    const text = entries
      .map(([size, value]) => `${size} ${window.CafeUtils.formatPrice(value)}`)
      .join(" · ");
    return `<div class="menu-detail__option"><span>가격</span><strong>${text}</strong></div>`;
  }

  function renderMenu(menu) {
    detailEl.innerHTML = `
      <div class="menu-detail__image">
        <img src="${menu.image}" alt="${menu.name}" />
      </div>
      <div class="menu-detail__body">
        <div class="menu-detail__title">
          <h1>${menu.name}</h1>
          <span class="menu-detail__english">${menu.englishName || ""}</span>
        </div>
        <div class="menu-detail__badges">
          <span class="badge badge--accent">${window.CafeUtils.findCategoryById(menu.categoryId)?.label || "미분류"}</span>
          ${
            menu.isSoldOut
              ? '<span class="badge badge--danger">품절</span>'
              : '<span class="badge badge--accent">판매중</span>'
          }
          ${menu.isRecommended ? '<span class="badge badge--warning">추천 메뉴</span>' : ""}
        </div>
        <p class="menu-detail__price">${window.CafeUtils.formatPriceRange(menu)}</p>
        <p class="menu-detail__desc">${menu.description || ""}</p>
        ${renderOptionList("온도", menu.options?.temperature)}
        ${renderOptionList("사이즈", menu.options?.sizes)}
        ${renderPriceList(menu.price)}
        ${renderOptionList("태그", menu.tags)}
        <div class="menu-detail__actions">
          <a class="btn btn--primary" href="edit.html?id=${menu.id}">수정</a>
          <button type="button" class="btn btn--danger" id="delete-button">삭제</button>
        </div>
      </div>
    `;

    document.getElementById("delete-button").addEventListener("click", () => {
      const confirmed = window.confirm(`'${menu.name}' 메뉴를 삭제할까요?`);
      if (!confirmed) return;
      window.CafeUtils.deleteMenu(menu.id);
      window.location.href = "list.html";
    });
  }

  const menuId = window.CafeUtils.getQueryParam("id");
  const menu = menuId ? window.CafeUtils.findMenuById(menuId) : null;

  if (menu) {
    renderMenu(menu);
  } else {
    detailEl.hidden = true;
    notFoundEl.hidden = false;
  }
})();

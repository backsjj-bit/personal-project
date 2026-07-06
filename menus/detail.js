window.addEventListener("DOMContentLoaded", () => {
  const { CafeUtils } = window;
  const detailPanel = document.querySelector("#detailPanel");
  const menuId = CafeUtils.getQueryParam("id");
  const menu = CafeUtils.findMenuById(menuId);

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toLabel(value) {
    const labels = {
      hot: "Hot",
      iced: "Iced",
      room: "Room",
      regular: "Regular",
      large: "Large",
      single: "Single",
    };

    return labels[value] || value;
  }

  function renderOptionGroup(name, legend, values) {
    if (!values?.length) {
      return "";
    }

    return `
      <fieldset>
        <legend>${legend}</legend>
        <div class="option-group">
          ${values
            .map(
              (value, index) => `
                <label>
                  <input type="radio" name="${name}" value="${escapeHtml(value)}" ${index === 0 ? "checked" : ""} />
                  <span>${escapeHtml(toLabel(value))}</span>
                </label>
              `
            )
            .join("")}
        </div>
      </fieldset>
    `;
  }

  if (!menu) {
    detailPanel.innerHTML = `
      <div class="empty-state">
        메뉴를 찾을 수 없습니다.
        <div class="submit-row">
          <a class="primary-button" href="./list.html">목록으로</a>
        </div>
      </div>
    `;
    return;
  }

  const category = CafeUtils.findCategoryById(menu.categoryId);

  detailPanel.innerHTML = `
    <div class="detail-media">
      <img src="${escapeHtml(menu.image)}" alt="${escapeHtml(menu.name)}" />
    </div>
    <div class="detail-content">
      <div>
        <p class="eyebrow">${escapeHtml(category?.label || category?.name || "Menu")}</p>
        <h2>${escapeHtml(menu.name)}</h2>
        <p class="english-name">${escapeHtml(menu.englishName)}</p>
      </div>
      <p class="description">${escapeHtml(menu.description)}</p>
      <div class="tag-row">
        ${menu.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        ${menu.isRecommended ? '<span class="tag warning">추천</span>' : ""}
        ${menu.isSoldOut ? '<span class="tag danger">품절</span>' : ""}
      </div>
      <strong class="detail-price">${CafeUtils.formatPrice(menu.price)}</strong>
      ${
        menu.isSoldOut
          ? '<p class="sold-out-message">현재 품절된 메뉴입니다.</p>'
          : `
            <form id="optionForm" class="option-form">
              ${renderOptionGroup("temperature", "온도", menu.options?.temperature)}
              ${renderOptionGroup("size", "사이즈", menu.options?.sizes)}
              <div class="quantity-row">
                <label>
                  <span>수량</span>
                  <input name="quantity" type="number" min="1" value="1" />
                </label>
              </div>
              <div class="submit-row">
                <a class="ghost-button" href="./list.html">목록</a>
                <button class="primary-button" type="submit">장바구니 담기</button>
              </div>
              <p id="feedback" class="feedback" aria-live="polite"></p>
            </form>
          `
      }
    </div>
  `;

  const optionForm = document.querySelector("#optionForm");

  if (!optionForm) {
    return;
  }

  optionForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(optionForm);
    const quantity = Math.max(1, Number(formData.get("quantity")) || 1);

    CafeUtils.addToCart(
      menu.id,
      {
        temperature: formData.get("temperature"),
        size: formData.get("size"),
      },
      quantity
    );

    document.querySelector("#feedback").textContent = "장바구니에 담았습니다.";
  });
});

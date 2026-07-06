(function () {
  const formEl = document.getElementById("menu-form");
  const categorySelectEl = document.getElementById("category-select");
  const notFoundEl = document.getElementById("not-found-message");

  function renderCategoryOptions() {
    const categories = window.CafeData?.categories || [];
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.label;
      categorySelectEl.appendChild(option);
    });
  }

  function setCheckedValues(name, values = []) {
    formEl.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.checked = values.includes(input.value);
    });
  }

  function fillForm(menu) {
    formEl.elements.name.value = menu.name || "";
    formEl.elements.englishName.value = menu.englishName || "";
    formEl.elements.categoryId.value = menu.categoryId || "";
    formEl.elements.price.value = menu.price || 0;
    formEl.elements.image.value = menu.image || "";
    formEl.elements.description.value = menu.description || "";
    formEl.elements.tags.value = (menu.tags || []).join(", ");
    setCheckedValues("temperature", menu.options?.temperature);
    setCheckedValues("sizes", menu.options?.sizes);
    formEl.elements.isRecommended.checked = Boolean(menu.isRecommended);
    formEl.elements.isSoldOut.checked = Boolean(menu.isSoldOut);
  }

  function getCheckedValues(formData, name) {
    return formData.getAll(name);
  }

  function handleSubmit(menuId) {
    return function (event) {
      event.preventDefault();

      const formData = new FormData(formEl);
      const tags = (formData.get("tags") || "")
        .toString()
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const updates = {
        name: formData.get("name").toString().trim(),
        englishName: formData.get("englishName").toString().trim(),
        categoryId: formData.get("categoryId"),
        price: Number(formData.get("price")) || 0,
        image: formData.get("image").toString().trim(),
        description: formData.get("description").toString().trim(),
        tags,
        options: {
          temperature: getCheckedValues(formData, "temperature"),
          sizes: getCheckedValues(formData, "sizes"),
        },
        isRecommended: formData.get("isRecommended") === "on",
        isSoldOut: formData.get("isSoldOut") === "on",
      };

      window.CafeUtils.updateMenu(menuId, updates);
      window.location.href = `detail.html?id=${menuId}`;
    };
  }

  const menuId = window.CafeUtils.getQueryParam("id");
  const menu = menuId ? window.CafeUtils.findMenuById(menuId) : null;

  if (menu) {
    renderCategoryOptions();
    fillForm(menu);
    formEl.hidden = false;
    formEl.addEventListener("submit", handleSubmit(menu.id));
  } else {
    notFoundEl.hidden = false;
  }
})();

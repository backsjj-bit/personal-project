(function () {
  const formEl = document.getElementById("menu-form");
  const categorySelectEl = document.getElementById("category-select");

  function renderCategoryOptions() {
    const categories = window.CafeData?.categories || [];
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.label;
      categorySelectEl.appendChild(option);
    });
  }

  function getCheckedValues(formData, name) {
    return formData.getAll(name);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(formEl);
    const tags = (formData.get("tags") || "")
      .toString()
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const menuData = {
      name: formData.get("name").toString().trim(),
      englishName: formData.get("englishName").toString().trim(),
      categoryId: formData.get("categoryId"),
      price: Number(formData.get("price")) || 0,
      image:
        formData.get("image").toString().trim() ||
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
      description: formData.get("description").toString().trim(),
      tags,
      options: {
        temperature: getCheckedValues(formData, "temperature"),
        sizes: getCheckedValues(formData, "sizes"),
      },
      isRecommended: formData.get("isRecommended") === "on",
      isSoldOut: formData.get("isSoldOut") === "on",
    };

    if (!menuData.name || !menuData.categoryId || !menuData.price) {
      window.alert("메뉴명, 카테고리, 가격을 입력해주세요.");
      return;
    }

    const newMenu = window.CafeUtils.addMenu(menuData);
    window.location.href = `detail.html?id=${newMenu.id}`;
  }

  renderCategoryOptions();
  formEl.addEventListener("submit", handleSubmit);
})();

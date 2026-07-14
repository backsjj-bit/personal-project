(function () {
  if (!window.CafeUtils.isAdminLoggedIn()) {
    window.location.href = "../login.html";
    return;
  }

  const formEl = document.getElementById("menu-form");
  const categorySelectEl = document.getElementById("category-select");
  const imageFileInputEl = document.getElementById("image-file-input");
  const imagePreviewEl = document.getElementById("image-preview");

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80";

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  imageFileInputEl.addEventListener("change", async () => {
    const file = imageFileInputEl.files?.[0];
    if (!file) {
      imagePreviewEl.hidden = true;
      imagePreviewEl.src = "";
      return;
    }

    imagePreviewEl.src = await readFileAsDataUrl(file);
    imagePreviewEl.hidden = false;
  });

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

  function getSizePrices(formData, sizes) {
    const price = {};
    sizes.forEach((size) => {
      price[size] = Number(formData.get(`price_${size}`)) || 0;
    });
    return price;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(formEl);
    const tags = (formData.get("tags") || "")
      .toString()
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const sizes = getCheckedValues(formData, "sizes");
    const imageFile = imageFileInputEl.files?.[0];
    const image = imageFile ? await readFileAsDataUrl(imageFile) : DEFAULT_IMAGE;

    const menuData = {
      name: formData.get("name").toString().trim(),
      englishName: formData.get("englishName").toString().trim(),
      categoryId: formData.get("categoryId"),
      price: getSizePrices(formData, sizes),
      image,
      description: formData.get("description").toString().trim(),
      tags,
      options: {
        temperature: getCheckedValues(formData, "temperature"),
        sizes,
      },
      isRecommended: formData.get("isRecommended") === "on",
      isSoldOut: formData.get("isSoldOut") === "on",
    };

    const hasPrice = sizes.some((size) => menuData.price[size] > 0);

    if (!menuData.name || !menuData.categoryId || !sizes.length || !hasPrice) {
      window.alert("메뉴명, 카테고리, 사이즈와 가격을 입력해주세요.");
      return;
    }

    const newMenu = window.CafeUtils.addMenu(menuData);
    window.location.href = `detail.html?id=${newMenu.id}`;
  }

  renderCategoryOptions();
  formEl.addEventListener("submit", handleSubmit);
})();

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
    const recommended = CafeUtils.getMenus().filter((menu) => menu.isRecommended);

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
                  <span class="price">${CafeUtils.formatPriceRange(menu)}</span>
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

  function renderStampCard() {
    const stampCard = document.querySelector("#stampCard");
    const currentUser = CafeUtils.getCurrentUser();

    if (!currentUser) {
      stampCard.innerHTML = `
        <p class="eyebrow">Stamp</p>
        <h2>스탬프 적립 이벤트</h2>
        <p class="stamp-card__desc">로그인하면 주문할 때마다 스탬프가 쌓여요. 10개를 모으면 2,000원 쿠폰을 드려요!</p>
        <a class="primary-button" href="./auth/login.html">로그인하고 시작하기</a>
      `;
      return;
    }

    const { stamps, availableCoupons } = CafeUtils.getStampInfo(currentUser.email);
    const dots = Array.from({ length: 10 }, (_, index) => {
      const filled = index < stamps;
      return `<span class="stamp-dot ${filled ? "is-filled" : ""}">${filled ? "☕" : ""}</span>`;
    }).join("");

    stampCard.innerHTML = `
      <p class="eyebrow">Stamp</p>
      <h2>스탬프 적립 이벤트</h2>
      <p class="stamp-card__desc">주문 10회마다 2,000원 쿠폰을 드려요!</p>
      <div class="stamp-dots">${dots}</div>
      <p class="stamp-card__status">${
        availableCoupons > 0
          ? `사용 가능한 쿠폰 ${availableCoupons}장이 있어요! 장바구니에서 사용해보세요 🎉`
          : `${stamps} / 10 스탬프`
      }</p>
    `;
  }

  function initHeroCarousel() {
    const track = document.querySelector("#heroTrack");
    const prevButton = document.querySelector("#heroPrev");
    const nextButton = document.querySelector("#heroNext");
    const dots = Array.from(document.querySelectorAll(".hero-carousel__dot"));
    const slideCount = track ? track.children.length : 0;
    const AUTOPLAY_INTERVAL = 7000;
    let autoplayTimer = null;

    if (!track || !slideCount) {
      return;
    }

    function getCurrentIndex() {
      return Math.round(track.scrollLeft / track.clientWidth);
    }

    function goToSlide(index) {
      const slideWidth = track.clientWidth;
      track.scrollTo({ left: slideWidth * index, behavior: "smooth" });
    }

    function updateActiveDot() {
      const index = getCurrentIndex();
      dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = window.setInterval(() => {
        goToSlide((getCurrentIndex() + 1) % slideCount);
      }, AUTOPLAY_INTERVAL);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    prevButton?.addEventListener("click", () => {
      goToSlide((getCurrentIndex() - 1 + slideCount) % slideCount);
      startAutoplay();
    });

    nextButton?.addEventListener("click", () => {
      goToSlide((getCurrentIndex() + 1) % slideCount);
      startAutoplay();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        goToSlide(Number(dot.dataset.slide));
        startAutoplay();
      });
    });

    track.addEventListener("scroll", () => {
      window.requestAnimationFrame(updateActiveDot);
    });

    startAutoplay();
  }

  renderRecommended();
  renderCategories();
  renderStampCard();
  initHeroCarousel();
});

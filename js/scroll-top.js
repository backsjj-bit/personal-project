(function () {
  function init() {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "scrollTopButton";
    button.className = "scroll-top-button";
    button.setAttribute("aria-label", "맨 위로 이동");
    button.textContent = "↑";
    document.body.appendChild(button);

    function toggleVisibility() {
      button.classList.toggle("is-visible", window.scrollY > 300);
    }

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility();
  }

  window.addEventListener("DOMContentLoaded", init);
})();

(function () {
  const form = document.getElementById("admin-login-form");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const id = document.getElementById("admin-id").value.trim();
    const password = document.getElementById("admin-password").value;
    const result = window.CafeUtils.adminLogin(id, password);

    if (!result.success) {
      errorMessage.textContent = result.message;
      errorMessage.hidden = false;
      return;
    }

    window.location.href = "./index.html";
  });
})();

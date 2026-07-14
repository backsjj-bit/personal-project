const { login } = window.CafeUtils;

const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const result = await login(email, password);

  if (!result.success) {
    errorMessage.textContent = result.message;
    errorMessage.hidden = false;
    return;
  }

  window.location.href = "../my/index.html";
});

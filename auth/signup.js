const { registerUser } = window.CafeUtils;

const form = document.getElementById("signup-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const result = registerUser({ name, email, password });

  if (!result.success) {
    errorMessage.textContent = result.message;
    errorMessage.hidden = false;
    return;
  }

  window.location.href = "../my/index.html";
});

// Alternar formularios
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotPasswordForm");

loginTab.onclick = () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    forgotForm.style.display = "none";
};

registerTab.onclick = () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    forgotForm.style.display = "none";
};

// Volver al login desde "olvidé mi contraseña"
document.getElementById("backToLoginBtn").onclick = () => {
    forgotForm.style.display = "none";
    loginForm.style.display = "block";
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
};

// Registro
document.getElementById("formRegister").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;

    const errorDiv = document.getElementById("registerError");
    errorDiv.style.display = "none";
    errorDiv.innerText = "";

    if (password !== confirmPassword) {
        errorDiv.style.display = "block";
        errorDiv.innerText = "Las contraseñas no coinciden.";
        return;
    }

    const response = await fetch("register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();

    if (result.success) {
        alert("✅ Usuario registrado con éxito.");
        document.getElementById("formRegister").reset();
        loginTab.click(); // Volver al login
    } else {
        errorDiv.style.display = "block";
        errorDiv.innerText = result.message || "Error al registrar usuario.";
    }
});

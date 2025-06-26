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


// Registrarse
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
        Swal.fire({
            icon: 'warning',
            title: 'Contraseñas distintas',
            text: 'Las contraseñas no coinciden.',
            confirmButtonText: 'Corregir'
        });
        return;
    }


    const response = await fetch("register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });


    const result = await response.json();


    if (result.success) {
        Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Usuario registrado con éxito.',
            confirmButtonText: 'Aceptar'
        });
        document.getElementById("formRegister").reset();
        loginTab.click(); // Volver al login
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Correo ya registrado',
            text: result.message || "Ese correo ya está en uso.",
            showCancelButton: true,
            confirmButtonText: 'Iniciar sesión',
            cancelButtonText: 'Cancelar'
        }).then((res) => {
            if (res.isConfirmed) {
                loginTab.click(); // Ir al login
            }
        });
    }
});


// Inicio de sesión
document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();


    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;


    const errorDiv = document.getElementById("loginError");
    errorDiv.style.display = "none";
    errorDiv.innerText = "";


    const response = await fetch("login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });


    const result = await response.json();


    if (result.success) {
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido/a ${result.user.name}!`,
            text: 'Inicio de sesión exitoso.',
            confirmButtonText: 'Entrar'
        }).then(() => {
            // GUARDAR EL USUARIO EN LOCALSTORAGE
            localStorage.setItem("patita_user", JSON.stringify(result.user));
            // Redirigir a inicio
            window.location.href = "index.html";
        });


    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error al iniciar sesión',
            text: result.message || "Error desconocido.",
            confirmButtonText: 'Intentar de nuevo'
        });
    }
});

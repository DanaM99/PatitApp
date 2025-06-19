// Manejo de autenticación
class AuthManager {
  constructor() {
    this.init()
  }

  init() {
    this.setupAuthForms()
    this.setupAuthTabs()
  }

  setupAuthForms() {
    // Formulario de login
    const loginForm = document.getElementById("formLogin")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e))
    }

    // Formulario de registro
    const registerForm = document.getElementById("formRegister")
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e))
    }

    // Formulario de recuperación de contraseña
    const forgotForm = document.getElementById("formForgotPassword")
    if (forgotForm) {
      forgotForm.addEventListener("submit", (e) => this.handleForgotPassword(e))
    }

    // Enlace de olvidé contraseña
    const forgotLink = document.getElementById("forgotPasswordLink")
    if (forgotLink) {
      forgotLink.addEventListener("click", (e) => {
        e.preventDefault()
        this.showForgotPasswordForm()
      })
    }

    // Botón volver al login
    const backToLoginBtn = document.getElementById("backToLoginBtn")
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener("click", () => {
        this.showLoginForm()
      })
    }
  }

  setupAuthTabs() {
    const loginTab = document.getElementById("loginTab")
    const registerTab = document.getElementById("registerTab")

    if (loginTab) {
      loginTab.addEventListener("click", () => this.showLoginForm())
    }

    if (registerTab) {
      registerTab.addEventListener("click", () => this.showRegisterForm())
    }
  }

  showLoginForm() {
    this.switchTab("loginTab", "loginForm")
  }

  showRegisterForm() {
    this.switchTab("registerTab", "registerForm")
  }

  showForgotPasswordForm() {
    const loginForm = document.getElementById("loginForm")
    const registerForm = document.getElementById("registerForm")
    const forgotForm = document.getElementById("forgotPasswordForm")

    if (loginForm) loginForm.style.display = "none"
    if (registerForm) registerForm.style.display = "none"
    if (forgotForm) forgotForm.style.display = "block"

    // Ocultar tabs
    const tabs = document.querySelectorAll(".auth-tab")
    tabs.forEach((tab) => (tab.style.display = "none"))
  }

  switchTab(activeTabId, activeFormId) {
    // Cambiar tabs
    const tabs = document.querySelectorAll(".auth-tab")
    tabs.forEach((tab) => {
      tab.classList.remove("active")
      tab.style.display = "block"
    })

    const activeTab = document.getElementById(activeTabId)
    if (activeTab) {
      activeTab.classList.add("active")
    }

    // Cambiar formularios
    const forms = document.querySelectorAll(".auth-form")
    forms.forEach((form) => {
      form.style.display = "none"
    })

    const activeForm = document.getElementById(activeFormId)
    if (activeForm) {
      activeForm.style.display = "block"
    }
  }

  async handleLogin(e) {
    e.preventDefault()

    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value
    const errorElement = document.getElementById("loginError")

    // Validaciones básicas
    if (!email || !password) {
      patitaApp.showAlert(errorElement, "Por favor completa todos los campos")
      return
    }

    if (!patitaApp.isValidEmail(email)) {
      patitaApp.showAlert(errorElement, "Por favor ingresa un email válido")
      return
    }

    try {
      // Simular llamada a API (reemplazar con llamada real)
      const response = await this.simulateLogin(email, password)

      if (response.success) {
        patitaApp.setCurrentUser(response.user)
        window.location.href = "panel.html"
      } else {
        patitaApp.showAlert(errorElement, response.message)
      }
    } catch (error) {
      patitaApp.showAlert(errorElement, "Error al iniciar sesión. Inténtalo de nuevo.")
    }
  }

  async handleRegister(e) {
    e.preventDefault()

    const name = document.getElementById("registerName").value
    const email = document.getElementById("registerEmail").value
    const password = document.getElementById("registerPassword").value
    const confirmPassword = document.getElementById("registerConfirmPassword").value
    const zone = document.getElementById("registerZone").value
    const errorElement = document.getElementById("registerError")

    // Validaciones
    if (!name || !email || !password || !confirmPassword || !zone) {
      patitaApp.showAlert(errorElement, "Por favor completa todos los campos")
      return
    }

    if (!patitaApp.isValidEmail(email)) {
      patitaApp.showAlert(errorElement, "Por favor ingresa un email válido")
      return
    }

    if (password.length < 6) {
      patitaApp.showAlert(errorElement, "La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      patitaApp.showAlert(errorElement, "Las contraseñas no coinciden")
      return
    }

    try {
      // Simular llamada a API (reemplazar con llamada real)
      const response = await this.simulateRegister({
        name,
        email,
        password,
        zone,
      })

      if (response.success) {
        patitaApp.setCurrentUser(response.user)
        window.location.href = "panel.html"
      } else {
        patitaApp.showAlert(errorElement, response.message)
      }
    } catch (error) {
      patitaApp.showAlert(errorElement, "Error al registrarse. Inténtalo de nuevo.")
    }
  }

  async handleForgotPassword(e) {
    e.preventDefault()

    const email = document.getElementById("forgotEmail").value
    const errorElement = document.getElementById("forgotError")
    const successElement = document.getElementById("forgotSuccess")

    if (!email) {
      patitaApp.showAlert(errorElement, "Por favor ingresa tu email")
      return
    }

    if (!patitaApp.isValidEmail(email)) {
      patitaApp.showAlert(errorElement, "Por favor ingresa un email válido")
      return
    }

    try {
      // Simular llamada a API (reemplazar con llamada real)
      const response = await this.simulateForgotPassword(email)

      if (response.success) {
        patitaApp.showAlert(successElement, "Se ha enviado un enlace de recuperación a tu email", "success")
        document.getElementById("formForgotPassword").reset()
      } else {
        patitaApp.showAlert(errorElement, response.message)
      }
    } catch (error) {
      patitaApp.showAlert(errorElement, "Error al enviar el enlace. Inténtalo de nuevo.")
    }
  }

  // Simulaciones de API (reemplazar con llamadas reales)
  async simulateLogin(email, password) {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Usuarios de prueba
    const testUsers = [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan@ejemplo.com",
        password: "123456",
        zone: "Palermo, Buenos Aires",
        phone: "+54 11 1234-5678",
      },
      {
        id: 2,
        name: "María García",
        email: "maria@ejemplo.com",
        password: "123456",
        zone: "Recoleta, Buenos Aires",
        phone: "+54 11 8765-4321",
      },
    ]

    const user = testUsers.find((u) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      return {
        success: true,
        user: {
          ...userWithoutPassword,
          token: "fake-jwt-token-" + Date.now(),
        },
      }
    } else {
      return {
        success: false,
        message: "Email o contraseña incorrectos",
      }
    }
  }

  async simulateRegister(userData) {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simular verificación de email existente
    if (userData.email === "juan@ejemplo.com" || userData.email === "maria@ejemplo.com") {
      return {
        success: false,
        message: "Este email ya está registrado",
      }
    }

    // Simular registro exitoso
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      zone: userData.zone,
      token: "fake-jwt-token-" + Date.now(),
    }

    return {
      success: true,
      user: newUser,
    }
  }

  async simulateForgotPassword(email) {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "Enlace enviado correctamente",
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return patitaApp.getCurrentUser() !== null
  }

  // Requerir autenticación
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "login.html"
      return false
    }
    return true
  }

  // Cerrar sesión
  logout() {
    patitaApp.logout()
  }
}

// Inicializar gestor de autenticación
const authManager = new AuthManager()

// Funciones globales
window.authManager = authManager
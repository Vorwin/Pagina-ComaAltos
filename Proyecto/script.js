document.addEventListener('DOMContentLoaded', function () {
    // Redirigir al menú correspondiente si el usuario ya está autenticado
    if (window.location.pathname.includes('Login.html') && sessionStorage.getItem('loggedIn')) {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        redirectByRole(userData.role);
    }

    // Manejar el inicio de sesión
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const username = document.getElementById('usernameInput').value;
            const password = document.getElementById('passwordInput').value;

            fetch('http://localhost:3000/api/usuarios/activos')
                .then(response => response.json())
                .then(data => {
                    const user = data.find(user =>
                        user.Nombre_Usuario === username &&
                        user.Contraseña === password
                    );

                    if (user) {
                        // Guardar todos los datos relevantes del usuario
                        const userData = {
                            id: user.id_usuario,
                            username: user.Nombre_Usuario,
                            role: user.Rol,
                            // Agrega más campos si son necesarios
                            isAuthenticated: true
                        };

                        // Guardar objeto completo en sessionStorage
                        sessionStorage.setItem('userData', JSON.stringify(userData));

                        // Redirigir según rol
                        redirectByRole(user.Rol);
                    } else {
                        alert('Usuario o contraseña incorrectos');
                    }
                })
                .catch(error => {
                    console.error('Error en la autenticación:', error);
                    alert('Error al conectar con el servidor');
                });
        });
    }

    // Manejar el botón de Logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault();
            sessionStorage.removeItem('userData'); // Elimina todos los datos del usuario
            window.location.href = '../Login.html';
        });
    }

    // Verificar autenticación en páginas protegidas
    protectRoutes();

    // Mostrar información del usuario si está en página protegida
    displayUserInfo();

    // Configuración adicional (menú, modo oscuro, etc.)
    setupAdditionalFeatures();
});

// Función para redirigir según rol
function redirectByRole(role) {
    switch (role.toLowerCase()) {
        case 'admin':
            window.location.href = 'menuAdmin/menuCliente.html';
            break;
        case 'colocadora':
            window.location.href = 'menuColocadora/menuInventario.html';
            break;
        case 'cliente':
            window.location.href = 'menuCliente/menuReporteInv.html';
            break;
        default:
            window.location.href = 'Login.html';
    }
}

// Función para proteger rutas
function protectRoutes() {
    const protectedRoutes = [
        'menuAdmin/menuCliente.html',
        'menuColocadora/menuInventario.html',
        'menuCliente/menuReporteInv.html',
        'menuProducto.html'
    ];

    const currentPath = window.location.pathname;
    const isProtected = protectedRoutes.some(route => currentPath.includes(route));

    if (isProtected) {
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
            window.location.href = '../Login.html';
        }
    }
}

// Función para mostrar información del usuario
function displayUserInfo() {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) return;

    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    const userIdElement = document.getElementById('userId');

    if (userNameElement) {
        userNameElement.textContent = userData.username;
    }

    if (userRoleElement) {
        userRoleElement.textContent = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    }

    if (userIdElement) {
        userIdElement.textContent = userData.id;
    }
}

// Función para configuración adicional
function setupAdditionalFeatures() {
    // Navegación en el menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function () {
            const page = item.getAttribute('data-page');
            window.location.href = page;
        });
    });
}


//Barra lateral xD
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
        const page = item.getAttribute('data-page');
        window.location.href = page;
    });
});

const body = document.querySelector("body"),
      modeToggle = body.querySelector(".logout-mode");
      sidebar = body.querySelector("nav");
      sidebarToggle = body.querySelector(".sidebar-toggle");
let getMode = localStorage.getItem("mode");
if(getMode && getMode ==="dark"){
    body.classList.toggle("dark");
}
let getStatus = localStorage.getItem("status");
if(getStatus && getStatus ==="close"){
    sidebar.classList.toggle("close");
}
modeToggle.addEventListener("click", () =>{
    body.classList.toggle("dark12");
    if(body.classList.contains("darko")){
        localStorage.setItem("mode", "dark2");
    }else{
        localStorage.setItem("mode", "light1");
    }
});
sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    if(sidebar.classList.contains("close")){
        localStorage.setItem("status", "close");
    }else{
        localStorage.setItem("status", "open");
    }
})
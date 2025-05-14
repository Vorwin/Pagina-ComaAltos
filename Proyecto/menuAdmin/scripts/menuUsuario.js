document.addEventListener('DOMContentLoaded', function () {
    // Cargar usuarios en los selects y tablas
    function cargarUsuarios() {
        // Cargar usuarios activos en select de modificación
        fetch('http://localhost:3000/api/usuarios/usuarios-select')
            .then(response => response.json())
            .then(data => {
                const selectMod = document.getElementById('usuarioSelect');
                const selectBaja = document.getElementById('usuarioSelectbaja');

                // Limpiar selects
                selectMod.innerHTML = '<option selected value="">Seleccione un usuario</option>';
                selectBaja.innerHTML = '<option selected value="">Seleccione un usuario</option>';

                data.forEach(usuario => {
                    const option = document.createElement('option');
                    option.value = usuario.id_usuario;
                    option.textContent = usuario.Nombre_Usuario;
                    option.dataset.nombre = usuario.Nombre_Usuario;
                    selectMod.appendChild(option.cloneNode(true));
                    selectBaja.appendChild(option.cloneNode(true));
                });
            });

        // Cargar tabla de usuarios inactivos
        fetch('http://localhost:3000/api/usuarios/inactivos')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#UsuarioTableInactivos:last-of-type tbody');
                tbody.innerHTML = '';
                data.forEach(usuario => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
              <td>${usuario.Nombre_Usuario}</td>
              <td>${usuario.Contraseña}</td>
              <td>${usuario.Rol}</td>
            `;
                    tbody.appendChild(row);
                });
            });
    }

    // Cargar tabla de usuarios activos
    function cargarUsuariosActivos(rol = null) {
        let url = 'http://localhost:3000/api/usuarios/activos';
        if (rol) { url = `http://localhost:3000/api/usuarios/por-rol/${rol}`; }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#UsuarioTable tbody');
                tbody.innerHTML = '';
                data.forEach(usuario => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${usuario.Nombre_Usuario}</td>
                        <td>${usuario.Contraseña}</td>
                        <td>${usuario.Rol}</td>
                    `;
                    tbody.appendChild(row);
                });
            });
    }

    // Evento para el filtro por rol
    document.getElementById('filterRolSelect').addEventListener('change', function () {
        const rol = this.value;
        if (rol === 'todos') {
            cargarUsuariosActivos();
        } else {
            cargarUsuariosActivos(rol);
        }
    });
    
    // Cargar datos iniciales
    cargarUsuarios();
    cargarUsuariosActivos();

    // Evento para autocompletar al seleccionar usuario
    document.getElementById('usuarioSelect').addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            document.getElementById('nuevoNombUser').value = selectedOption.dataset.nombre || '';
        } else {
            document.getElementById('nuevoNombUser').value = '';
        }
    });

    // Formulario para agregar usuario
    document.getElementById('agregarUsuarioForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            Nombre_Usuario: document.getElementById('nombUsuario').value,
            Contraseña: document.getElementById('contraUsuario').value,
            Rol: document.getElementById('RolselectUsuario').value
        };

        fetch('http://localhost:3000/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                alert('Usuario agregado correctamente');
                document.getElementById('agregarUsuarioForm').reset();
                cargarUsuarios();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al agregar usuario: ' + (error.message || 'Error del servidor'));
            });
    });

    // Formulario para modificar usuario
    document.getElementById('modifyusuarioForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const usuarioId = document.getElementById('usuarioSelect').value;
        const formData = {
            Nombre_Usuario: document.getElementById('nuevoNombUser').value,
            Contraseña: document.getElementById('nuevoContraUser').value
        };

        fetch(`http://localhost:3000/api/usuarios/${usuarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                alert('Usuario modificado correctamente');
                document.getElementById('modifyusuarioForm').reset();
                cargarUsuarios();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al modificar usuario');
            });
    });

    // Formulario para deshabilitar usuario
    document.getElementById('removeUsuarioForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const usuarioId = document.getElementById('usuarioSelectbaja').value;

        fetch(`http://localhost:3000/api/usuarios/deshabilitar/${usuarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                alert('Usuario deshabilitado correctamente');
                document.getElementById('removeUsuarioForm').reset();
                cargarUsuarios();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al deshabilitar usuario');
            });
    });

    //mostar nombre de usuario en el label
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const label_nombre = document.getElementById('mostarUsuario');
    label_nombre.innerHTML = userData.username;
});
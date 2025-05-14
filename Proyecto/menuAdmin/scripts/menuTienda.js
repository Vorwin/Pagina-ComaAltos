document.addEventListener('DOMContentLoaded', function () {
    // Cargar tiendas en los selects y tablas
    function cargarTiendas() {
        // Cargar tiendas activas en select de modificación
        fetch('http://localhost:3000/api/tiendas/tiendas-select')
            .then(response => response.json())
            .then(data => {
                const selectMod = document.getElementById('SelectTiendaMod');
                const selectBaja = document.getElementById('tiendaSelectbaja');

                // Limpiar selects
                selectMod.innerHTML = '<option selected value="">Seleccione una tienda</option>';
                selectBaja.innerHTML = '<option selected value="">Seleccione una tienda</option>';

                data.forEach(tienda => {
                    const option = document.createElement('option');
                    option.value = tienda.id_tienda;
                    option.textContent = tienda.Nombre_tienda;
                    option.dataset.nombre = tienda.Nombre_tienda;
                    selectMod.appendChild(option.cloneNode(true));
                    selectBaja.appendChild(option.cloneNode(true));
                });
            });

        // Cargar tabla de tiendas activas
        fetch('http://localhost:3000/api/tiendas/activas')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#tiendaTableAct tbody');
                tbody.innerHTML = '';
                data.forEach(tienda => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
              <td>${tienda.Nombre_tienda}</td>
              <td>${tienda.Nombre_Departamento}</td>
            `;
                    tbody.appendChild(row);
                });
            });

        // Cargar tabla de tiendas inactivas
        fetch('http://localhost:3000/api/tiendas/inactivas')
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#tiendaTablebaja tbody');
                tbody.innerHTML = '';
                data.forEach(tienda => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
              <td>${tienda.Nombre_tienda}</td>
              <td>${tienda.Nombre_Departamento}</td>
              <td>${new Date(tienda.fecha_de_baja).toLocaleDateString()}</td>
              <td>${tienda.motivo_de_baja}</td>
            `;
                    tbody.appendChild(row);
                });
            });
    }

    // Cargar datos iniciales
    cargarTiendas();

    // Evento para autocompletar al seleccionar tienda
    document.getElementById('SelectTiendaMod').addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            document.getElementById('nuevoNombreTienda').value = selectedOption.dataset.nombre || '';
        } else {
            document.getElementById('nuevoNombreTienda').value = '';
        }
    });

    // Formulario para agregar tienda
    document.getElementById('tiendaForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            Nombre_tienda: document.getElementById('tiendaNom').value,
            id_departamento: document.getElementById('tiendaSelectDept').value
        };

        fetch('http://localhost:3000/api/tiendas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                alert('Tienda agregada correctamente');
                document.getElementById('tiendaForm').reset();
                cargarTiendas();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al agregar tienda');
            });
    });

    // Formulario para modificar tienda
    document.getElementById('modTienda').addEventListener('submit', function (e) {
        e.preventDefault();

        const tiendaId = document.getElementById('SelectTiendaMod').value;
        const formData = {
            Nombre_tienda: document.getElementById('nuevoNombreTienda').value,
            id_departamento: document.getElementById('tiendaSelectnuevoDept').value
        };

        fetch(`http://localhost:3000/api/tiendas/${tiendaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                alert('Tienda modificada correctamente');
                document.getElementById('modTienda').reset();
                cargarTiendas();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al modificar tienda');
            });
    });

    // Formulario para dar de baja
    document.getElementById('removeColocadoraForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const tiendaId = document.getElementById('tiendaSelectbaja').value;
        const fechaBaja = document.getElementById('fechaBajaTienda').value;
        const motivoBaja = document.getElementById('motivoBajaTienda').value;

        fetch(`http://localhost:3000/api/tiendas/baja/${tiendaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fecha_de_baja: fechaBaja,
                motivo_de_baja: motivoBaja
            })
        })
            .then(response => response.json())
            .then(data => {
                alert('Tienda dada de baja correctamente');
                document.getElementById('removeColocadoraForm').reset();
                cargarTiendas();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al dar de baja la tienda');
            });
    });

    //mostar nombre de usuario en el label
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const label_nombre = document.getElementById('mostarUsuario');
    label_nombre.innerHTML = userData.username;
});
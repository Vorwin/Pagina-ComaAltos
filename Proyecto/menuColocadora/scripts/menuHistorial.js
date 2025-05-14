document.addEventListener('DOMContentLoaded', function () {
    // Mostrar información del usuario
    const usuario = JSON.parse(sessionStorage.getItem('userData') || 'Colocadora');
    const label_nombre = document.getElementById('mostarUsuario');
    label_nombre.innerHTML = usuario.username;
    const id = JSON.parse(sessionStorage.getItem('userData')).id;


    // Variables para almacenar selecciones
    let tiendaSeleccionada = null;
    let empresaSeleccionada = null;
    let idColocadora = null;

    // Cargar tiendas para esta colocadora  

    fetch(`http://localhost:3000/api/usuarios/colocadora/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se encontró colocadora asociada a este usuario');
            }
            return response.json();
        })
        .then(colocadora => {
            idColocadora = colocadora.id_colocadora;
            // Cargar datos iniciales
            cargarTiendas(idColocadora);
            cargarEmpresas();
        })
        .catch(error => {
            console.error('Error al obtener colocadora:', error);
            alert('Error: ' + error.message);
            document.getElementById('btnAgregaProducto').disabled = true;
        });

    // Evento cuando se selecciona una tienda
    document.getElementById('selectTienda').addEventListener('change', function () {
        tiendaSeleccionada = this.value;
        if (tiendaSeleccionada) {
            cargarEmpresas(idColocadora, tiendaSeleccionada);
        } else {
            document.getElementById('selectEmpresa').innerHTML = '<option value="">Seleccione una empresa</option>';
        }
    });

    // Evento cuando se selecciona una empresa
    document.getElementById('selectEmpresa').addEventListener('change', function () {
        empresaSeleccionada = this.value;
    });

    // Formulario para filtrar historial
    document.getElementById('agregarProductoForm').addEventListener('submit', function (e) {
        e.preventDefault();

        if (!tiendaSeleccionada || !empresaSeleccionada) {
            alert('Por favor seleccione una tienda y una empresa');
            return;
        }

        cargarHistorial(idColocadora, tiendaSeleccionada, empresaSeleccionada);
    });

    // Configurar logout
    document.getElementById('logoutButton').addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '../../Login.html';
    });

    // Función para cargar tiendas
    function cargarTiendas(idColocadora) {
        fetch(`http://localhost:3000/api/inventario/tiendas-colocadora/${idColocadora}`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('selectTienda');
                select.innerHTML = '<option value="">Seleccione una tienda</option>';

                data.forEach(tienda => {
                    const option = document.createElement('option');
                    option.value = tienda.id_tienda;
                    option.textContent = tienda.Nombre_tienda;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar tiendas:', error);
                alert('Error al cargar las tiendas');
            });
    }

    // Función para cargar empresas
    function cargarEmpresas(idColocadora, idTienda) {
        fetch(`http://localhost:3000/api/inventario/empresas-colocadora/${idColocadora}/${idTienda}`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('selectEmpresa');
                select.innerHTML = '<option value="">Seleccione una empresa</option>';

                data.forEach(empresa => {
                    const option = document.createElement('option');
                    option.value = empresa.id_empresa;
                    option.textContent = empresa.Nombre_Empresa;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar empresas:', error);
                alert('Error al cargar las empresas');
            });
    }

    // Función para cargar historial filtrado
    function cargarHistorial(idColocadora, idTienda, idEmpresa) {
        fetch(`http://localhost:3000/api/inventario/historial-filtrado/${idColocadora}/${idTienda}/${idEmpresa}`)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#colocadorasTable tbody');
                tbody.innerHTML = '';

                if (data.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="7" class="text-center">No se encontraron registros</td>';
                    tbody.appendChild(row);
                    return;
                }

                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.no_inventario}</td>
                        <td>${item.Nombre_tienda}</td>
                        <td>${item.Nombre_Empresa}</td>
                        <td>${item.Nombre_del_producto}</td>
                        <td><img src="${item.url_imagen}" alt="Imagen producto" style="max-width: 100px;"></td>
                        <td>${item.existencias}</td>
                        <td>${new Date(item.fecha_de_ingreso).toLocaleDateString()}</td>
                    `;
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error al cargar historial:', error);
                alert('Error al cargar el historial');
            });
    }
});

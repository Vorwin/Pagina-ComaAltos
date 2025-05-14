document.addEventListener('DOMContentLoaded', function () {
    // Mostrar información del usuario
    const usuario = JSON.parse(sessionStorage.getItem('userData') || 'Colocadora');
    const label_nombre = document.getElementById('mostarUsuario');
    label_nombre.innerHTML = usuario.username;
    const id = JSON.parse(sessionStorage.getItem('userData')).id;


    // Obtener ID de la colocadora desde sessionStorage
    let idColocadora = null;

    fetch(`http://localhost:3000/api/usuarios/colocadora/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se encontró colocadora asociada a este usuario');
            }
            return response.json();
        })
        .then(colocadora => {
            idColocadora = colocadora.id_colocadora;
            // Continuar con el resto de la carga
            cargarDatosIniciales();
        })
        .catch(error => {
            console.error('Error al obtener colocadora:', error);
            alert('Error: ' + error.message + '\nNo puede registrar inventario sin estar asociado a una colocadora.');
            document.getElementById('agregarProductoForm').querySelector('button[type="submit"]').disabled = true;
        });

    function cargarDatosIniciales() {
        // Cargar tiendas en el select
        fetch('http://localhost:3000/api/inventario/tiendas')
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('selectTienda');
                data.forEach(tienda => {
                    const option = document.createElement('option');
                    option.value = tienda.id_tienda;
                    option.textContent = tienda.Nombre_tienda;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar tiendas:', error);
                alert('Error al cargar la lista de tiendas');
            });

        // Cargar empresas en el select
        fetch('http://localhost:3000/api/inventario/empresas')
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('selectEmpresa');
                data.forEach(empresa => {
                    const option = document.createElement('option');
                    option.value = empresa.id_empresa;
                    option.textContent = empresa.Nombre_Empresa;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar empresas:', error);
                alert('Error al cargar la lista de empresas');
            });

        /* // Cargar historial de inventario
        cargarUltimoInventario(); */
    }

    // Evento para cargar productos cuando se selecciona una empresa
    document.getElementById('selectEmpresa').addEventListener('change', function () {
        const idEmpresa = this.value;
        if (!idEmpresa) return;

        fetch(`http://localhost:3000/api/inventario/productos/${idEmpresa}`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('selectProducto');
                select.innerHTML = '<option value="">Seleccione un producto</option>';

                data.forEach(producto => {
                    const option = document.createElement('option');
                    option.value = producto.id_producto;
                    option.textContent = producto.Nombre_del_producto;
                    option.dataset.imagen = producto.url_imagen;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                alert('Error al cargar la lista de productos');
            });
    });

    // Evento para mostrar imagen del producto seleccionado
    document.getElementById('selectProducto').addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const imagenUrl = selectedOption.dataset.imagen;
        const imgElement = document.getElementById('fotoProd');

        if (imagenUrl) {
            imgElement.src = imagenUrl;
            imgElement.style.display = 'block';
        } else {
            imgElement.style.display = 'none';
        }
    });

    // Formulario para agregar inventario
    document.getElementById('agregarProductoForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const idTienda = document.getElementById('selectTienda').value;
        const idProducto = document.getElementById('selectProducto').value;
        const cantidad = document.getElementById('cantidadProducto').value;
        

        if (!idColocadora) {
            alert('No se ha identificado a la colocadora. Vuelva a iniciar sesión.');
            return;
        }

        const formData = {
            id_tienda: idTienda,
            id_producto: idProducto,
            id_colocadora: idColocadora,
            existencias: cantidad
        };

        fetch('http://localhost:3000/api/inventario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message); });
                }
                return response.json();
            })
            .then(data => {
                alert('Inventario registrado correctamente');
                document.getElementById('agregarProductoForm').reset();
                document.getElementById('fotoProd').style.display = 'none';
                // Actualizar la tabla con solo el último registro
                cargarUltimoInventario();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`Error al registrar inventario: ${error.message}`);
            });
    });

    // Cargar último inventario ingresado
    function cargarUltimoInventario() {
        if (!idColocadora) return;

        fetch(`http://localhost:3000/api/inventario/ultimo-inventario/${idColocadora}`)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#productosTableCol tbody');
                tbody.innerHTML = '';

                if (data.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="5" class="text-center">No hay registros de inventario recientes</td>`;
                    tbody.appendChild(row);
                    return;
                }

                data.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${item.Nombre_tienda}</td>
                    <td>${item.Nombre_Empresa}</td>
                    <td>${item.Nombre_del_producto}</td>
                    <td><img src="${item.url_imagen}" alt="Imagen producto" style="max-width: 100px;"></td>
                    <td>${item.existencias}</td>
                `;
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error al cargar último inventario:', error);
                alert('Error al cargar el último inventario');
            });
    }

    // Llamar a esta función en lugar de cargarHistorialInventario()
    cargarUltimoInventario();
});
document.addEventListener('DOMContentLoaded', function () {
    // Mostrar información del usuario
    const usuario = JSON.parse(sessionStorage.getItem('userData') || 'Colocadora');
    const label_nombre = document.getElementById('mostarUsuario');
    label_nombre.innerHTML = usuario.username;
    const id = JSON.parse(sessionStorage.getItem('userData')).id;

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
            cargarProductosDanados();
            cargarInvertario();
        })
        .catch(error => {
            console.error('Error al obtener colocadora:', error);
            alert('Error: ' + error.message + '\nNo puede registrar inventario sin estar asociado a una colocadora.');

        });

    // C
    // argar inventarios de la colocadora
    function cargarInvertario() {
        fetch(`http://localhost:3000/api/productos-danados/inventarios/${idColocadora}`)
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('selectinventario');
                select.innerHTML = '<option value="">Seleccione un inventario</option>';

                data.forEach(inventario => {
                    const option = document.createElement('option');
                    option.value = inventario.no_inventario;
                    option.textContent = `Inv-${inventario.no_inventario} - ${inventario.Nombre_tienda} - ${inventario.Nombre_Empresa}`;
                    option.dataset.empresa = inventario.Nombre_Empresa;
                    option.dataset.producto = inventario.Nombre_del_producto;
                    option.dataset.imagen = inventario.url_imagen;
                    select.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar inventarios:', error);
                alert('Error al cargar la lista de inventarios');
            });
    }

    // Evento para mostrar información del inventario seleccionado
    document.getElementById('selectinventario').addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];


        let a = selectedOption.dataset.producto.toString();
        let b= selectedOption.dataset.empresa.toString();

        const imgElement = document.getElementById('fotoProducto');
        const nomProd = document.getElementById('nombProducto');
        const inputEmpresa = document.getElementById('inputEmpresa');
        nomProd.value = a;
        inputEmpresa.value = b;


        if (selectedOption.dataset.imagen) {
            imgElement.src = selectedOption.dataset.imagen;
            imgElement.style.display = 'block';
        } else {
            imgElement.style.display = 'none';
        }
    });

    // Formulario para agregar producto dañado
    document.getElementById('agregarProductoDaForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const noInventario = document.getElementById('selectinventario').value;
        const unidadesDanadas = document.getElementById('unidadesDanadas').value;
        const descripcion = document.getElementById('motivoBaja').value;
        const fotoFile = document.getElementById('SubfotoProducto').files[0];

        console.log(unidadesDanadas);

        if (!noInventario || !unidadesDanadas || !descripcion) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        const formData = new FormData();
        formData.append('unidades_danadas', unidadesDanadas);
        formData.append('descripcion', descripcion);
        if (fotoFile) {
            formData.append('fotoProdDa', fotoFile);
        }
        formData.append('no_inventario', noInventario);

        fetch('http://localhost:3000/api/productos-danados/agregarProdDa', {
            method: 'POST',
            body: formData
        })
            .then(async response => {
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Error en la solicitud');
                }
                return response.json();
            })
            .then(data => {
                alert('Producto dañado registrado correctamente');
                document.getElementById('agregarProductoDaForm').reset();
                document.getElementById('fotoProducto').style.display = 'none';
                cargarProductosDanados();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message || 'Error al registrar producto dañado');
            });
    });

    // Cargar productos dañados
    function cargarProductosDanados() {
        if (!idColocadora) return;

        fetch(`http://localhost:3000/api/productos-danados/${idColocadora}`)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#colocadorasTable tbody');
                tbody.innerHTML = '';

                if (data.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="7" class="text-center">No hay productos dañados registrados</td>';
                    tbody.appendChild(row);
                    return;
                }

                data.forEach(producto => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${producto.no_inventario}</td>
                        <td>${producto.Nombre_tienda}</td>
                        <td>${producto.Nombre_Empresa}</td>
                        <td>${producto.Nombre_del_producto}</td>
                        <td>
                            ${producto.url_fotografia_producto_dañado ?
                            `<img src="${producto.url_fotografia_producto_dañado}" alt="Producto dañado" style="max-width: 100px;">` :
                            'Sin imagen'}
                        </td>
                        <td>${producto.unidades_danadas}</td>
                        <td>${producto.descripcion}</td>
                    `;
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error al cargar productos dañados:', error);
                alert('Error al cargar los productos dañados');
            });
    }

    // Cargar productos dañados al iniciar
    cargarProductosDanados();

});
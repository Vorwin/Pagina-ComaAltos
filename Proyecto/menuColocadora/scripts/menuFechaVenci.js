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

            cargarInvertario();
            cargarVencimientos();
        })
        .catch(error => {
            console.error('Error al obtener colocadora:', error);
            alert('Error: ' + error.message + '\nNo puede registrar inventario sin estar asociado a una colocadora.');

        });

    // Cargar vencimientos registrados
    function cargarVencimientos() {
        fetch(`http://localhost:3000/api/vencimientos/${idColocadora}`)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#colocadorasTable tbody');
                tbody.innerHTML = '';

                data.forEach(vencimiento => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${vencimiento.Nombre_tienda}</td>
                        <td>${vencimiento.Nombre_Empresa}</td>
                        <td>${vencimiento.Nombre_del_producto}</td>
                        <td><img src="${vencimiento.url_imagen}" alt="Imagen producto" style="max-width: 100px;"></td>
                        <td>${new Date(vencimiento.fecha_de_vencimiento).toLocaleDateString()}</td>
                    `;
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error al cargar vencimientos:', error);
                alert('Error al cargar el historial de vencimientos');
            });
    }


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
                    option.textContent = `Inv.${inventario.no_inventario} Tienda: ${inventario.Nombre_tienda}`;
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

    document.getElementById('selectinventario').addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];

        let a = selectedOption.dataset.producto.toString();
        let b = selectedOption.dataset.empresa.toString();

        const imgElement = document.getElementById('fotoProducto');
        const nomProd = document.getElementById('inputProd');
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

    // Formulario para agregar vencimiento
    document.getElementById('agregarProductoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const noInventario = document.getElementById('selectinventario').value;
        const lote = document.getElementById('inputlote').value;
        const fechaVencimiento = document.getElementById('fechaBaja').value;

        if (!noInventario || !lote || !fechaVencimiento) {
            alert('Por favor complete todos los campos');
            return;
        }

        const formData = {
            lote_productos: document.getElementById('inputlote').value,
            fecha_de_vencimiento: document.getElementById('fechaBaja').value,
            no_inventario: document.getElementById('selectinventario').value
        };

        fetch('http://localhost:3000/api/vencimientos', {
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
            alert('Fecha de vencimiento registrada correctamente');
            document.getElementById('agregarProductoForm').reset();
            document.getElementById('fotoProducto').style.display = 'none';
            cargarVencimientos();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error al registrar vencimiento: ${error.message}`);
        });
    });

    // Configurar logout
    document.getElementById('logoutButton').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = '../../Login.html';
    });
});

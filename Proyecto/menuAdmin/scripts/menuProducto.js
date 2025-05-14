document.addEventListener('DOMContentLoaded', function () {
    // Cargar empresas en el select
    fetch('http://localhost:3000/api/productos/empresas-select')
        .then(response => response.json())
        .then(data => {
            const selectEmpresas = document.getElementById('EmpresaProductos');
            data.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id_empresa;
                option.textContent = empresa.Nombre_Empresa;
                selectEmpresas.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar empresas:', error);
            alert('Error al cargar la lista de empresas');
        });

    fetch('http://localhost:3000/api/productos/empresas-select')
        .then(response => response.json())
        .then(data => {
            const selectEmpresas = document.getElementById('EmpresaProductos2');
            data.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id_empresa;
                option.textContent = empresa.Nombre_Empresa;
                selectEmpresas.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar empresas:', error);
            alert('Error al cargar la lista de empresas');
        });
    // Cargar tabla de productos
    /*  fetch('http://localhost:3000/api/productos')
         .then(response => response.json())
         .then(data => {
             const tbody = document.querySelector('#colocadorasTable tbody');
             data.forEach(producto => {
                 const row = document.createElement('tr');
                 row.innerHTML = `
             <td>${producto.Nombre_Empresa}</td>
             <td>${producto.Nombre_del_producto}</td>
             <td>${producto.codigo_de_barras}</td>
             <td>${producto.codigo_U}</td>
             <td><img src="${producto.url_imagen}" alt="Imagen del producto" style="max-width: 100px;"></td>
           `;
                 tbody.appendChild(row);
             });
         })
         .catch(error => {
             console.error('Error al cargar productos:', error);
             alert('Error al cargar la lista de productos');
         }); */

    // Evento para filtrar productos cuando se selecciona una empresa
    document.querySelector('#filtroProdEmpresa #EmpresaProductos2').addEventListener('change', function () {
        const idEmpresa = this.value;
        cargarProductos(idEmpresa);
    });

    // Función para cargar productos (con filtro opcional por empresa)
    function cargarProductos(idEmpresa = null) {
        let url = 'http://localhost:3000/api/productos';
        if (idEmpresa) {
            url = `http://localhost:3000/api/productos/empresa/${idEmpresa}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const tbody = document.querySelector('#colocadorasTable tbody');
                tbody.innerHTML = '';

                if (data.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="5" class="text-center">No se encontraron productos</td>';
                    tbody.appendChild(row);
                    return;
                }

                data.forEach(producto => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
            <td>${producto.Nombre_Empresa || ''}</td>
            <td>${producto.Nombre_del_producto}</td>
            <td>${producto.codigo_de_barras}</td>
            <td>${producto.codigo_U}</td>
            <td><img src="${producto.url_imagen}" alt="Imagen producto" style="max-width: 100px;"></td>
          `;
                    tbody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                alert('Error al cargar la lista de productos');
            });
    }

    // Formulario para agregar producto
    document.getElementById('agregarProductoForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('id_empresa', document.getElementById('EmpresaProductos').value);
        formData.append('Nombre_del_producto', document.getElementById('nombProducto').value);
        formData.append('codigo_de_barras', document.getElementById('CodBarProducto').value);
        formData.append('codigo_U', document.getElementById('CodUProducto').value);
        formData.append('fotoProducto', document.getElementById('fotoProducto').files[0]);

        fetch('http://localhost:3000/api/productos', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message || 'Error del servidor'); });
                }
                return response.json();
            })
            .then(data => {
                alert('Producto agregado correctamente');
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert(`Error al agregar producto: ${error.message}`);
            });
    });

    //mostar nombre de usuario en el label
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const label_nombre = document.getElementById('mostarUsuario');
    label_nombre.innerHTML = userData.username;
});
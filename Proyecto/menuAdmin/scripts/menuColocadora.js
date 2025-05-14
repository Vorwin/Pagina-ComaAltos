document.addEventListener('DOMContentLoaded', function () {
    // Cargar usuarios en el select
    fetch('http://localhost:3000/api/colocadoras/usuarios-select')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('colocadoraUsuarioSelect');
            data.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.id_usuario;
                option.textContent = usuario.Nombre_Usuario;
                select.appendChild(option);
            });
        });

    // Cargar colocadoras en los selects de modificación y baja
    fetch('http://localhost:3000/api/colocadoras/colocadoras-select')
        .then(response => response.json())
        .then(data => {
            const selectMod = document.getElementById('colocadoraSelectMod');
            const selectBaja = document.getElementById('colocadoraSelectbaja');

            data.forEach(colocadora => {
                // Para modificación
                const optionMod = document.createElement('option');
                optionMod.value = colocadora.id_colocadora;
                optionMod.textContent = `${colocadora.Nombre} ${colocadora.Apellido}`;
                optionMod.setAttribute('data-nombre', colocadora.Nombre);
                optionMod.setAttribute('data-apellido', colocadora.Apellido);
                selectMod.appendChild(optionMod.cloneNode(true));

                // Para baja
                selectBaja.appendChild(optionMod.cloneNode(true));
            });

            // Evento para autocompletar cuando se selecciona una colocadora
            selectMod.addEventListener('change', function () {
                const selectedOption = this.options[this.selectedIndex];
                document.getElementById('NuevNomColocadora').value = selectedOption.getAttribute('data-nombre') || '';
                document.getElementById('NuevoApeColocadora').value = selectedOption.getAttribute('data-apellido') || '';

            });
        });


    // Cargar tabla de colocadoras activas
    fetch('http://localhost:3000/api/colocadoras/activas')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#colocadorasTable tbody');
            data.forEach(colocadora => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${colocadora.Nombre}</td>
                    <td>${colocadora.Apellido}</td>
                    <td>${colocadora.DPI}</td>
                    <td>${colocadora.Nombre_Departamento}</td>
                    <td>${new Date(colocadora.fecha_contratacion).toLocaleDateString()}</td>`;
                tbody.appendChild(row);
            });
        });

    // Cargar tabla de colocadoras inactivas
    fetch('http://localhost:3000/api/colocadoras/inactivas')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#colocadorasTablebaja tbody');
            data.forEach(colocadora => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${colocadora.Nombre}</td>
                    <td>${colocadora.Apellido}</td>
                    <td>${colocadora.Nombre_Departamento}</td>
                    <td>${colocadora.motivo_de_baja}</td>
                    <td>${new Date(colocadora.fecha_de_baja).toLocaleDateString()}</td>`;
                tbody.appendChild(row);
            });
        });

    // Formulario para agregar colocadora
    document.getElementById('addColocadoraForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = {
            Nombre: document.getElementById('nombreColocadora').value,
            Apellido: document.getElementById('apellidoColocadora').value,
            DPI: document.getElementById('dpiColocadora').value,
            fecha_contratacion: document.getElementById('fechaContratacion').value,
            id_departamento: document.getElementById('colocadoraSelectDept').value,
            id_usuario: document.getElementById('colocadoraUsuarioSelect').value
        };

        fetch('http://localhost:3000/api/colocadoras', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                alert('Colocadora agregada correctamente');
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al agregar colocadora');
            });
    });

    // Formulario para modificar colocadora
    document.getElementById('modifyClientForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const colocadoraId = document.getElementById('colocadoraSelectMod').value;
        const formData = {
            Nombre: document.getElementById('NuevNomColocadora').value,
            Apellido: document.getElementById('NuevoApeColocadora').value,
            id_departamento: document.getElementById('nuevoDepartamento').value
        };

        fetch(`http://localhost:3000/api/colocadoras/${colocadoraId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                alert('Colocadora modificada correctamente');
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al modificar colocadora');
            });
    });

    // Formulario para dar de baja
    document.getElementById('removeColocadoraForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const colocadoraId = document.getElementById('colocadoraSelectbaja').value;
        const fechaBaja = document.getElementById('fechaBaja').value;
        const motivoBaja = document.getElementById('motivoBaja').value;

        fetch(`http://localhost:3000/api/colocadoras/baja/${colocadoraId}`, {
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
                alert('Colocadora dada de baja correctamente');
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al dar de baja a la colocadora');
            });
    });

    //mostar nombre de usuario en el label
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const label_nombre = document.getElementById('mostarUsuario');
    label_nombre.innerHTML = userData.username;
});



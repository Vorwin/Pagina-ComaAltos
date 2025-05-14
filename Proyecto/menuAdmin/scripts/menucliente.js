window.onload = (event) => {
  cargar();
  console.log('Page is fully loaded');
};

function cargar() {
  // Cargar usuarios en el select
  fetch('http://localhost:3000/api/empresas/usuarios-select')
    .then(response => response.json())
    .then(data => {
      // Llenar el select de usuarios para agregar cliente
      const select = document.getElementById('clienteUsuarioSelect');
      data.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.id_usuario;
        option.textContent = usuario.Nombre_Usuario;
        select.appendChild(option);
      });
    });

  // Cargar empresas en el select de modificación
  fetch('http://localhost:3000/api/empresas/empresas-select')
    .then(response => response.json())
    .then(data => {
      const selectMod = document.getElementById('clienteModSelect');
      const selectBaja = document.getElementById('clienteSelectbaja');
      const nombreInput = document.getElementById('nuevoNombCli');

      data.forEach(empresa => {
        // Para modificación
        const optionMod = document.createElement('option');
        optionMod.value = empresa.id_empresa;
        optionMod.textContent = empresa.Nombre_Empresa;
        optionMod.setAttribute('data-nombre', empresa.Nombre_Empresa);
        selectMod.appendChild(optionMod.cloneNode(true));

        // Para baja
        selectBaja.appendChild(optionMod.cloneNode(true));
      });

      // Llenar el campo de nombre al seleccionar una empresa para modificar
      selectMod.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        nombreInput.value = selectedOption.getAttribute('data-nombre') || '';
      });

    });

  // Cargar tabla de clientes activos
  fetch('http://localhost:3000/api/empresas/activas')
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector('#clientesTable tbody');
      data.forEach(empresa => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${empresa.Nombre_Empresa}</td>
        <td><img src="${empresa.url_logotipo}" alt="Logo" style="max-width: 100px;"></td>
        `;
        tbody.appendChild(row);
      });
    });

  // Cargar tabla de clientes inactivos
  fetch('http://localhost:3000/api/empresas/inactivas')
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector('#clientsTablebaja tbody');
      data.forEach(empresa => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${empresa.Nombre_Empresa}</td>
        <td><img src="${empresa.url_logotipo}" alt="Logo" style="max-width: 100px;"></td>
        <td>${empresa.motivo_de_baja}</td>
        <td>${new Date(empresa.fecha_de_baja).toLocaleDateString()}</td>
        `;
        tbody.appendChild(row);
      });
    });
}

// Formulario para agregar cliente
document.getElementById('agregarClienteForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('Nombre_Empresa', document.getElementById('nombCliente').value);
  formData.append('id_usuario', document.getElementById('clienteUsuarioSelect').value);

  const fileInput = document.getElementById('clientLogo');
  if (!fileInput.files[0]) {
    alert('Seleccione un archivo de imagen');
    return;
  }
  formData.append('clientLogo', fileInput.files[0]);

  try {
    const response = await fetch('http://localhost:3000/api/empresas', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error del servidor');
    }

    alert('Empresa creada exitosamente!');
    location.reload();

  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
  }
});

// Formulario para modificar cliente
document.getElementById('modifyClientForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const empresaId = document.getElementById('clienteModSelect').value;
  const formData = new FormData();
  formData.append('Nombre_Empresa', document.getElementById('nuevoNombCli').value);

  const logoFile = document.getElementById('nuevoLogoCli').files[0];
  if (logoFile) {
    formData.append('nuevoLogoCli', logoFile);
  }

  fetch(`http://localhost:3000/api/empresas/${empresaId}`, {
    method: 'PUT',
    body: formData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      return response.json();
    })
    .then(data => {
      alert('Cliente modificado correctamente');
      location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al modificar cliente: ' + error.message);
    });
});

// Formulario para dar de baja
document.getElementById('removeColocadoraForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const empresaId = document.getElementById('clienteSelectbaja').value;
  const fechaBaja = document.getElementById('fechaBajCliente').value;
  const motivoBaja = document.getElementById('motivoBajaCliente').value;

  fetch(`http://localhost:3000/api/empresas/baja/${empresaId}`, {
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
      alert('Cliente dado de baja correctamente');
      location.reload();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al dar de baja al cliente');
    });
});

//mostar nombre de usuario en el label
const userData = JSON.parse(sessionStorage.getItem('userData'));
const label_nombre = document.getElementById('mostarUsuario');
label_nombre.innerHTML = userData.username;
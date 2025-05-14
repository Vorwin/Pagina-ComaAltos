const pool = require('../database');

// Obtener todos los usuarios activos
const getUsuariosActivos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_usuario, Nombre_Usuario, Contraseña, Rol FROM Usuario WHERE Estado = 1'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios activos' });
    }
};

// Obtener todos los usuarios inactivos
const getUsuariosInactivos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_usuario, Nombre_Usuario, Contraseña, Rol FROM Usuario WHERE Estado = 0'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios inactivos' });
    }
};

// Crear un nuevo usuario (sin encriptación)
const createUsuario = async (req, res) => {
    const { Nombre_Usuario, Contraseña, Rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        const [existente] = await pool.query(
            'SELECT * FROM Usuario WHERE Nombre_Usuario = ?',
            [Nombre_Usuario]
        );

        if (existente.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya existe' });
        }

        const [result] = await pool.query(
            'INSERT INTO Usuario (Nombre_Usuario, Contraseña, Rol, Estado) VALUES (?, ?, ?, 1)',
            [Nombre_Usuario, Contraseña, Rol] // Contraseña sin encriptar
        );

        res.status(201).json({
            id_usuario: result.insertId,
            Nombre_Usuario,
            Rol,
            Estado: 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

// Actualizar un usuario (sin encriptación)
const updateUsuario = async (req, res) => {
    const { id_usuario } = req.params;
    const { Nombre_Usuario, Contraseña } = req.body;

    try {
        // Verificar si el usuario existe
        const [usuario] = await pool.query(
            'SELECT * FROM Usuario WHERE id_usuario = ?',
            [id_usuario]
        );

        if (usuario.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        let updateQuery = 'UPDATE Usuario SET Nombre_Usuario = ?';
        let queryParams = [Nombre_Usuario || usuario[0].Nombre_Usuario];

        if (Contraseña) {
            updateQuery += ', Contraseña = ?';
            queryParams.push(Contraseña); // Contraseña sin encriptar
        }

        updateQuery += ' WHERE id_usuario = ?';
        queryParams.push(id_usuario);

        await pool.query(updateQuery, queryParams);

        res.json({
            id_usuario,
            message: 'Usuario actualizado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

// Deshabilitar un usuario
const disableUsuario = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const [usuario] = await pool.query(
            'SELECT * FROM Usuario WHERE id_usuario = ?',
            [id_usuario]
        );

        if (usuario.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await pool.query(
            'UPDATE Usuario SET Estado = 0 WHERE id_usuario = ?',
            [id_usuario]
        );

        res.json({ message: 'Usuario deshabilitado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al deshabilitar usuario' });
    }
};

// Obtener usuarios para select
const getUsuariosForSelect = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_usuario, Nombre_Usuario, Rol FROM Usuario WHERE Estado = 1'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Autenticar usuario
const loginUsuario = async (req, res) => {
    const { Nombre_Usuario, Contraseña } = req.body;

    try {
        const [rows] = await pool.query(
            'SELECT id_usuario, Nombre_Usuario, Contraseña, Rol FROM Usuario WHERE Nombre_Usuario = ? AND Estado = 1',
            [Nombre_Usuario]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
        }

        const usuario = rows[0];

        // Comparar contraseñas (sin encriptación en este caso)
        if (Contraseña !== usuario.Contraseña) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Eliminar la contraseña de la respuesta
        delete usuario.Contraseña;

        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener colocadora por ID de usuario
const getColocadoraByUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT c.id_colocadora, c.Nombre, c.Apellido 
       FROM Colocadora c 
       WHERE c.id_usuario = ? AND c.estado = 1`,
      [id_usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Colocadora no encontrada para este usuario' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener colocadora' });
  }
};

// Obtener usuarios por rol
const getUsuariosByRol = async (req, res) => {
  const { rol } = req.params;
  
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, Nombre_Usuario, Contraseña, Rol FROM Usuario WHERE Rol = ? AND Estado = 1',
      [rol]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios por rol' });
  }
};

module.exports = {
    getUsuariosActivos,
    getUsuariosInactivos,
    createUsuario,
    updateUsuario,
    loginUsuario,
    disableUsuario,
    getUsuariosForSelect, 
    getColocadoraByUsuario,
    getUsuariosByRol
};
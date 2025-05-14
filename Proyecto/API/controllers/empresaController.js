const pool = require('../database');
const { uploadLogoEmpresa, uploadLogoToImageKit } = require('../multerConfig');

// Obtener todas las empresas activas
const getEmpresasActivas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_empresa, Nombre_Empresa, url_logotipo FROM Empresa WHERE estado = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener empresas activas' });
  }
};

// Obtener todas las empresas inactivas
const getEmpresasInactivas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_empresa, Nombre_Empresa, url_logotipo, motivo_de_baja, fecha_de_baja FROM Empresa WHERE estado = 0'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener empresas inactivas' });
  }
};

// Crear una nueva empresa
const createEmpresa = async (req, res) => {
  const { Nombre_Empresa, id_usuario } = req.body;

  try {
    // Verificar si el usuario existe
    const [user] = await pool.query('SELECT * FROM Usuario WHERE id_usuario = ?', [id_usuario]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Subir imagen a ImageKit si existe
    let imageUrl = null;
    if (req.file) {
      const imageKitResponse = await uploadLogoToImageKit(req.file);
      imageUrl = imageKitResponse.url;
    }

    const [result] = await pool.query(
      'INSERT INTO Empresa (Nombre_Empresa, url_logotipo, id_usuario, estado) VALUES (?, ?, ?, 1)',
      [Nombre_Empresa, imageUrl, id_usuario]
    );

    res.status(201).json({
      id_empresa: result.insertId,
      Nombre_Empresa,
      url_logotipo: imageUrl,
      id_usuario,
      estado: 1
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear empresa' });
  }
};

// Actualizar una empresa (modificado para usar ImageKit)
const updateEmpresa = async (req, res) => {
  const { id_empresa } = req.params;
  const { Nombre_Empresa } = req.body;

  try {
    // Obtener la empresa actual
    const [empresa] = await pool.query('SELECT url_logotipo FROM Empresa WHERE id_empresa = ?', [id_empresa]);
    if (empresa.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    let imageUrl = empresa[0].url_logotipo;

    // Si se subió una nueva imagen, actualizarla en ImageKit
    if (req.file) {
      const imageKitResponse = await uploadLogoToImageKit(req.file);
      imageUrl = imageKitResponse.url;
    }

    await pool.query(
      'UPDATE Empresa SET Nombre_Empresa = ?, url_logotipo = ? WHERE id_empresa = ?',
      [Nombre_Empresa, imageUrl, id_empresa]
    );

    res.json({
      id_empresa,
      Nombre_Empresa,
      url_logotipo: imageUrl,
      message: 'Empresa actualizada correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar empresa' });
  }
};

// Dar de baja a una empresa
const darDeBajaEmpresa = async (req, res) => {
  const { id_empresa } = req.params;
  const { fecha_de_baja, motivo_de_baja } = req.body;

  try {
    const [empresa] = await pool.query('SELECT * FROM Empresa WHERE id_empresa = ?', [id_empresa]);
    if (empresa.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    await pool.query(
      'UPDATE Empresa SET estado = 0, fecha_de_baja = ?, motivo_de_baja = ? WHERE id_empresa = ?',
      [fecha_de_baja, motivo_de_baja, id_empresa]
    );

    res.json({ message: 'Empresa dada de baja correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al dar de baja la empresa' });
  }
};

// Obtener usuarios para select
const getUsuariosForSelect = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, Nombre_Usuario FROM Usuario WHERE Estado = 1 and rol = "admin"'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener empresas para select
const getEmpresasForSelect = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_empresa, Nombre_Empresa FROM Empresa WHERE estado = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener empresas' });
  }
};

module.exports = {
  getEmpresasActivas,
  getEmpresasInactivas,
  createEmpresa: [uploadLogoEmpresa.single('clientLogo'), createEmpresa],
  updateEmpresa: [uploadLogoEmpresa.single('nuevoLogoCli'), updateEmpresa],
  darDeBajaEmpresa,
  getUsuariosForSelect,
  getEmpresasForSelect
};
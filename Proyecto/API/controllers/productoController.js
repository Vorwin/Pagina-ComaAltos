const pool = require('../database');
// En productoController.js
const { uploadFotoProducto, uploadProductoToImageKit } = require('../multerConfig');

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id_producto, p.Nombre_del_producto, p.codigo_U, p.codigo_de_barras, 
             p.url_imagen, e.Nombre_Empresa
      FROM Producto p
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      WHERE e.estado = 1
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Crear un nuevo producto
const createProducto = async (req, res) => {
  const { Nombre_del_producto, codigo_U, codigo_de_barras, id_empresa } = req.body;
  
  try {
    // Verificar si la empresa existe
    const [empresa] = await pool.query('SELECT * FROM Empresa WHERE id_empresa = ? AND estado = 1', [id_empresa]);
    if (empresa.length === 0) {
      return res.status(404).json({ message: 'Empresa no encontrada o inactiva' });
    }

    // Verificar si el código de barras ya existe
    const [existente] = await pool.query('SELECT * FROM Producto WHERE codigo_de_barras = ?', [codigo_de_barras]);
    if (existente.length > 0) {
      return res.status(400).json({ message: 'El código de barras ya está en uso' });
    }

    // Subir imagen a ImageKit
    let imageUrl = null;
    if (req.file) {
      const imageKitResponse = await uploadProductoToImageKit(req.file);
      imageUrl = imageKitResponse.url;
    }

    const [result] = await pool.query(
      'INSERT INTO Producto (Nombre_del_producto, codigo_U, codigo_de_barras, url_imagen, id_empresa) VALUES (?, ?, ?, ?, ?)',
      [Nombre_del_producto, codigo_U, codigo_de_barras, imageUrl, id_empresa]
    );

    res.status(201).json({
      id_producto: result.insertId,
      Nombre_del_producto,
      codigo_U,
      codigo_de_barras,
      url_imagen: imageUrl,
      id_empresa
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Error al crear producto',
      error: error.message 
    });
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

// Obtener productos por empresa
const getProductosByEmpresa = async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT p.id_producto, p.Nombre_del_producto, p.codigo_U, p.codigo_de_barras, 
             p.url_imagen, e.Nombre_Empresa
      FROM Producto p
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      WHERE p.id_empresa = ? AND e.estado = 1
    `, [id_empresa]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos por empresa' });
  }
};

// Exportación correcta
module.exports = {
  getProductos,
  createProducto,
  getEmpresasForSelect, 
  getProductosByEmpresa
};
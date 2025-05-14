const pool = require('../database');

// Obtener todas las tiendas activas
const getTiendas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id_tienda, Nombre_tienda FROM Tienda WHERE estado = 1'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener tiendas' });
  }
};

// Obtener todas las empresas activas
const getEmpresas = async (req, res) => {
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
    const [rows] = await pool.query(
      `SELECT p.id_producto, p.Nombre_del_producto, p.url_imagen 
       FROM Producto p 
       WHERE p.id_empresa = ?`,
      [id_empresa]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Crear un nuevo registro de inventario
const createInventario = async (req, res) => {
  const { id_tienda, id_producto, id_colocadora, existencias } = req.body;

  try {
    // Verificar si la tienda existe
    const [tienda] = await pool.query('SELECT * FROM Tienda WHERE id_tienda = ? AND estado = 1', [id_tienda]);
    if (tienda.length === 0) {
      return res.status(404).json({ message: 'Tienda no encontrada o inactiva' });
    }

    // Verificar si el producto existe
    const [producto] = await pool.query('SELECT * FROM Producto WHERE id_producto = ?', [id_producto]);
    if (producto.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si la colocadora existe
    const [colocadora] = await pool.query('SELECT * FROM Colocadora WHERE id_colocadora = ? AND estado = 1', [id_colocadora]);
    if (colocadora.length === 0) {
      return res.status(404).json({ message: 'Colocadora no encontrada o inactiva' });
    }

    // Crear el registro de inventario
    const [inventario] = await pool.query(
      'INSERT INTO Inventario (fecha_de_ingreso) VALUES (CURDATE())'
    );
    const no_inventario = inventario.insertId;

    // Crear el detalle de inventario
    await pool.query(
      `INSERT INTO Detalle_Inventario 
       (id_tienda, id_producto, no_inventario, id_colocadora, existencias) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_tienda, id_producto, no_inventario, id_colocadora, existencias]
    );

    res.status(201).json({
      message: 'Inventario registrado correctamente',
      no_inventario
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar inventario' });
  }
};

// Obtener historial de inventario
const getUltimoInventario = async (req, res) => {
  const { id_colocadora } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        t.Nombre_tienda, 
        e.Nombre_Empresa, 
        p.Nombre_del_producto, 
        p.url_imagen,
        di.existencias,
        i.fecha_de_ingreso
      FROM Detalle_Inventario di
      JOIN Tienda t ON di.id_tienda = t.id_tienda
      JOIN Producto p ON di.id_producto = p.id_producto
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      JOIN Inventario i ON di.no_inventario = i.no_inventario
      WHERE di.id_colocadora = ?
      ORDER BY i.fecha_de_ingreso DESC, i.no_inventario DESC
      LIMIT 5
    `, [id_colocadora]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener último inventario' });
  }
};

// Obtener historial de inventario filtrado por tienda, empresa y colocadora
/* const getHistorialFiltrado = async (req, res) => {
  const { id_tienda, id_empresa, id_colocadora } = req.query;

  try {
    let query = `
      SELECT 
        i.no_inventario,
        t.Nombre_tienda, 
        e.Nombre_Empresa, 
        p.Nombre_del_producto, 
        p.url_imagen,
        di.existencias,
        i.fecha_de_ingreso
      FROM Detalle_Inventario di
      JOIN Tienda t ON di.id_tienda = t.id_tienda
      JOIN Producto p ON di.id_producto = p.id_producto
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      JOIN Inventario i ON di.no_inventario = i.no_inventario
      WHERE di.id_colocadora = ?
    `;

    const params = [id_colocadora];

    if (id_tienda) {
      query += ' AND di.id_tienda = ?';
      params.push(id_tienda);
    }

    if (id_empresa) {
      query += ' AND p.id_empresa = ?';
      params.push(id_empresa);
    }

    query += ' ORDER BY i.fecha_de_ingreso DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial filtrado' });
  }
}; */

const getTiendasByColocadora = async (req, res) => {
  const { id_colocadora } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT t.id_tienda, t.Nombre_tienda
      FROM Detalle_Inventario di
      JOIN Tienda t ON di.id_tienda = t.id_tienda
      WHERE di.id_colocadora = ?
      ORDER BY t.Nombre_tienda
    `, [id_colocadora]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener tiendas' });
  }
};

// Obtener empresas únicas por colocadora y tienda
const getEmpresasByColocadoraTienda = async (req, res) => {
  const { id_colocadora, id_tienda } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT e.id_empresa, e.Nombre_Empresa
      FROM Detalle_Inventario di
      JOIN Producto p ON di.id_producto = p.id_producto
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      WHERE di.id_colocadora = ? AND di.id_tienda = ?
      ORDER BY e.Nombre_Empresa
    `, [id_colocadora, id_tienda]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener empresas' });
  }
};

// Obtener historial filtrado por colocadora, tienda y empresa
const getHistorialFiltrado = async (req, res) => {
  const { id_colocadora, id_tienda, id_empresa } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        i.no_inventario,
        t.Nombre_tienda,
        e.Nombre_Empresa,
        p.Nombre_del_producto,
        p.url_imagen,
        di.existencias,
        i.fecha_de_ingreso
      FROM Detalle_Inventario di
      JOIN Tienda t ON di.id_tienda = t.id_tienda
      JOIN Producto p ON di.id_producto = p.id_producto
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      JOIN Inventario i ON di.no_inventario = i.no_inventario
      WHERE di.id_colocadora = ? 
        AND di.id_tienda = ? 
        AND e.id_empresa = ?
      ORDER BY i.fecha_de_ingreso DESC
    `, [id_colocadora, id_tienda, id_empresa]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial filtrado' });
  }
};

module.exports = {
  getTiendas,
  getEmpresas,
  getProductosByEmpresa,
  createInventario,
  getUltimoInventario,
  getHistorialFiltrado,
  getTiendasByColocadora,
  getEmpresasByColocadoraTienda
};
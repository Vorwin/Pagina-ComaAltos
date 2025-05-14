const pool = require('../database');

// Obtener inventarios por colocadora
const getInventariosByColocadora = async (req, res) => {
  const { id_colocadora } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        i.no_inventario,
        t.Nombre_tienda,
        e.Nombre_Empresa,
        p.Nombre_del_producto,
        p.url_imagen
      FROM Detalle_Inventario di
      JOIN Inventario i ON di.no_inventario = i.no_inventario
      JOIN Tienda t ON di.id_tienda = t.id_tienda
      JOIN Producto p ON di.id_producto = p.id_producto
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      WHERE di.id_colocadora = ?
      ORDER BY i.fecha_de_ingreso DESC
    `, [id_colocadora]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener inventarios' });
  }
};

// Agregar fecha de vencimiento
const addVencimiento = async (req, res) => {
  const { no_inventario, lote_productos, fecha_de_vencimiento } = req.body;

  try {
    // Verificar si el inventario existe
    const [inventario] = await pool.query(
      'SELECT * FROM Inventario WHERE no_inventario = ?',
      [no_inventario]
    );
    
    if (inventario.length === 0) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }

    // Insertar registro de vencimiento
    const [result] = await pool.query(
      'INSERT INTO Vencimiento_Producto (lote_productos, fecha_de_vencimiento, no_inventario) VALUES (?, ?, ?)',
      [lote_productos, fecha_de_vencimiento, no_inventario]
    );

    res.status(201).json({
        id_vencimiento: result.insertId,
        lote_productos,
        fecha_de_vencimiento,
        no_inventario
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar vencimiento' });
  }
};

// Obtener vencimientos por colocadora
const getVencimientosByColocadora = async (req, res) => {
  const { id_colocadora } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        t.Nombre_tienda,
        e.Nombre_Empresa,
        p.Nombre_del_producto,
        p.url_imagen,
        vp.lote_productos,
        vp.fecha_de_vencimiento
      FROM Vencimiento_Producto vp
      JOIN Inventario i ON vp.no_inventario = i.no_inventario
      JOIN Detalle_Inventario di ON i.no_inventario = di.no_inventario
      JOIN Tienda t ON di.id_tienda = t.id_tienda
      JOIN Producto p ON di.id_producto = p.id_producto
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      WHERE di.id_colocadora = ?
      ORDER BY vp.fecha_de_vencimiento ASC
    `, [id_colocadora]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener vencimientos' });
  }
};

module.exports = {
  getInventariosByColocadora,
  addVencimiento,
  getVencimientosByColocadora
};
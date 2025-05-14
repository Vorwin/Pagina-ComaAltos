const pool = require('../database');
const { uploadProductoDanadoImageKit, uploadFotoProductoDanado} = require('../multerConfig');

// Obtener inventarios de la colocadora actual
const getInventariosByColocadora = async (req, res) => {
  const { id_colocadora } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        di.no_inventario,
        t.Nombre_tienda,
        e.Nombre_Empresa,
        p.Nombre_del_producto,
        p.url_imagen,
        p.id_producto
      FROM Detalle_Inventario di
      JOIN Tienda t ON di.id_tienda = t.id_tienda
      JOIN Producto p ON di.id_producto = p.id_producto
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      WHERE di.id_colocadora = ?
      ORDER BY di.no_inventario DESC
    `, [id_colocadora]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener inventarios' });
  }
};

// Obtener productos dañados
const getProductosDanados = async (req, res) => {
  const { id_colocadora } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        i.no_inventario,
        pd.id_producto_dañado,
        pd.unidades_danadas,
        pd.descripcion,
        pd.url_fotografia_producto_dañado,
        i.fecha_de_ingreso,
        t.Nombre_tienda,
        e.Nombre_Empresa,
        p.Nombre_del_producto,
        p.url_imagen
      FROM Producto_Danado pd
      JOIN Inventario i ON pd.no_inventario = i.no_inventario
      JOIN Detalle_Inventario di ON pd.no_inventario = di.no_inventario
      JOIN Tienda t ON di.id_tienda = t.id_tienda
      JOIN Producto p ON di.id_producto = p.id_producto
      JOIN Empresa e ON p.id_empresa = e.id_empresa
      WHERE di.id_colocadora = ?
      ORDER BY i.fecha_de_ingreso DESC
    `, [id_colocadora]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos dañados' });
  }
};

// Crear registro de producto dañado
const createProductoDanado = async (req, res) => {
  // Los datos ahora vienen de req.body (para campos normales) y req.file (para la imagen)
  const { unidades_danadas, descripcion, no_inventario} = req.body;


  try {
    // Verificar si el inventario existe
    const [inventario] = await pool.query('SELECT * FROM Inventario WHERE no_inventario = ?',[no_inventario]);
    if (inventario.length === 0) {
      return res.status(404).json({ message: 'Inventario no encontrado' });
    }
    
    // Subir imagen a ImageKit si existe
    let imageUrl = null;
    if (req.file) {
      const imageKitResponse = await uploadProductoDanadoImageKit(req.file);
      imageUrl = imageKitResponse.url;
    }

    // Crear el registro de producto dañado
    const [result] = await pool.query(
      `INSERT INTO Producto_Danado 
       (unidades_danadas, descripcion, url_fotografia_producto_dañado, no_inventario) 
       VALUES (?, ?, ?, ?)`,
      [unidades_danadas, descripcion, imageUrl, no_inventario]
    );

    res.status(201).json({
      id_producto_dañado: result.insertId,
      unidades_danadas: unidades_danadas,
      descripcion,
      url_fotografia_producto_dañado: imageUrl,
      no_inventario
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar producto dañado'});
  }
};


module.exports = {
  getInventariosByColocadora,
  getProductosDanados,
  createProductoDanado: [uploadFotoProductoDanado.single('fotoProdDa'), createProductoDanado]
};
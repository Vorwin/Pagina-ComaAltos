const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { uploadFotoProducto } = require('../multerConfig');

// Obtener todos los productos
router.get('/', productoController.getProductos);

// Crear nuevo producto (con middleware de subida de imagen)
router.post('/', uploadFotoProducto.single('fotoProducto'), productoController.createProducto);

// Obtener empresas para select
router.get('/empresas-select', productoController.getEmpresasForSelect);

// Obtener productos por empresa
router.get('/empresa/:id_empresa', productoController.getProductosByEmpresa);

module.exports = router;
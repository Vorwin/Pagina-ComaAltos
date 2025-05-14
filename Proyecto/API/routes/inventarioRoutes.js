const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Obtener tiendas
router.get('/tiendas', inventarioController.getTiendas);

// Obtener empresas
router.get('/empresas', inventarioController.getEmpresas);

// Obtener productos por empresa
router.get('/productos/:id_empresa', inventarioController.getProductosByEmpresa);

// Crear registro de inventario
router.post('/', inventarioController.createInventario);

// Obtener último inventario por colocadora
router.get('/ultimo-inventario/:id_colocadora', inventarioController.getUltimoInventario);

// Obtener tiendas por colocadora
router.get('/tiendas-colocadora/:id_colocadora', inventarioController.getTiendasByColocadora);

// Obtener empresas por colocadora y tienda
router.get('/empresas-colocadora/:id_colocadora/:id_tienda', inventarioController.getEmpresasByColocadoraTienda);

// Obtener historial filtrado
router.get('/historial-filtrado/:id_colocadora/:id_tienda/:id_empresa', inventarioController.getHistorialFiltrado);

module.exports = router;
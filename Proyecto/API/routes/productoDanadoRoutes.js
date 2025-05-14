const express = require('express');
const router = express.Router();
const productoDanadoController = require('../controllers/productoDanadoController');

// Obtener inventarios por colocadora
router.get('/inventarios/:id_colocadora', productoDanadoController.getInventariosByColocadora);

// Obtener productos dañados por colocadora
router.get('/:id_colocadora', productoDanadoController.getProductosDanados);

// Crear registro de producto dañado
router.post('/agregarProdDa',productoDanadoController.createProductoDanado);

module.exports = router;
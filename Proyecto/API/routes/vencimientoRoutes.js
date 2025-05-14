const express = require('express');
const router = express.Router();
const vencimientoController = require('../controllers/vencimientoController');

// Obtener inventarios por colocadora
router.get('/inventarios/:id_colocadora', vencimientoController.getInventariosByColocadora);

// Agregar fecha de vencimiento
router.post('/', vencimientoController.addVencimiento);

// Obtener vencimientos por colocadora
router.get('/:id_colocadora', vencimientoController.getVencimientosByColocadora);

module.exports = router;
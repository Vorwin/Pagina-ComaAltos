const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');

// Obtener tiendas activas
router.get('/activas', tiendaController.getTiendasActivas);

// Obtener tiendas inactivas
router.get('/inactivas', tiendaController.getTiendasInactivas);

// Crear nueva tienda
router.post('/', tiendaController.createTienda);

// Actualizar tienda
router.put('/:id_tienda', tiendaController.updateTienda);

// Dar de baja a tienda
router.put('/baja/:id_tienda', tiendaController.darDeBajaTienda);

// Obtener tiendas para select
router.get('/tiendas-select', tiendaController.getTiendasForSelect);

module.exports = router;
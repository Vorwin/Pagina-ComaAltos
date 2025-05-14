const express = require('express');
const router = express.Router();
const colocadoraController = require('../controllers/colocadoraController');

// Obtener colocadoras activas
router.get('/activas', colocadoraController.getColocadorasActivas);

// Obtener colocadoras inactivas
router.get('/inactivas', colocadoraController.getColocadorasInactivas);

// Crear nueva colocadora
router.post('/', colocadoraController.createColocadora);

// Actualizar colocadora
router.put('/:id_colocadora', colocadoraController.updateColocadora);

// Dar de baja a colocadora
router.put('/baja/:id_colocadora', colocadoraController.darDeBajaColocadora);

// Obtener usuarios para select
router.get('/usuarios-select', colocadoraController.getUsuariosForSelect);

// Obtener colocadoras para select
router.get('/colocadoras-select', colocadoraController.getColocadorasForSelect);

module.exports = router;
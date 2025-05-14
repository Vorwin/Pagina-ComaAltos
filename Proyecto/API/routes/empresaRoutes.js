const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

// Obtener empresas activas
router.get('/activas', empresaController.getEmpresasActivas);

// Obtener empresas inactivas
router.get('/inactivas', empresaController.getEmpresasInactivas);

// Crear nueva empresa
router.post('/', empresaController.createEmpresa);

// Actualizar empresa
router.put('/:id_empresa', empresaController.updateEmpresa);

// Dar de baja a empresa
router.put('/baja/:id_empresa', empresaController.darDeBajaEmpresa);

// Obtener usuarios para select
router.get('/usuarios-select', empresaController.getUsuariosForSelect);

// Obtener empresas para select
router.get('/empresas-select', empresaController.getEmpresasForSelect);


module.exports = router;
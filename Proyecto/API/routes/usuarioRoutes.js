const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Obtener usuarios activos
router.get('/activos', usuarioController.getUsuariosActivos);

// Obtener usuarios inactivos
router.get('/inactivos', usuarioController.getUsuariosInactivos);

// Crear nuevo usuario
router.post('/', usuarioController.createUsuario);

// Actualizar usuario
router.put('/:id_usuario', usuarioController.updateUsuario);

// Deshabilitar usuario
router.put('/deshabilitar/:id_usuario', usuarioController.disableUsuario);

// Obtener usuarios para select
router.get('/usuarios-select', usuarioController.getUsuariosForSelect);

/// Obtener usuario para login
router.post('/login', usuarioController.loginUsuario);

// Obtener colocadora por usuario
router.get('/colocadora/:id_usuario', usuarioController.getColocadoraByUsuario);

// Obtener usuarios por rol
router.get('/por-rol/:rol', usuarioController.getUsuariosByRol);

module.exports = router;
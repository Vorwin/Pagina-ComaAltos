const express = require('express');
const cors = require('cors');
const path = require('path');
const empresaRoutes = require('./routes/empresaRoutes');
const colocadoraRoutes = require('./routes/colocadoraRoutes');
const productoRoutes = require('./routes/productoRoutes');
const tiendaRoutes = require('./routes/tiendaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const productoDanadoRoutes = require('./routes/productoDanadoRoutes');
const vencimientoRoutes = require('./routes/vencimientoRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/empresas', empresaRoutes);
app.use('/api/colocadoras', colocadoraRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/tiendas', tiendaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/productos-danados', productoDanadoRoutes);
app.use('/api/vencimientos', vencimientoRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const pool = require('../database');

// Obtener todas las colocadoras activas
const getColocadorasActivas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT c.id_colocadora, c.Nombre, c.Apellido, c.DPI, c.fecha_contratacion, 
             d.Nombre_Departamento, u.Nombre_Usuario
      FROM Colocadora c
      JOIN Departamento d ON c.id_departamento = d.id_departamento
      JOIN Usuario u ON c.id_usuario = u.id_usuario
      WHERE c.estado = 1
    `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener colocadoras activas' });
    }
};

// Obtener todas las colocadoras inactivas
const getColocadorasInactivas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT c.id_colocadora, c.Nombre, c.Apellido, d.Nombre_Departamento, 
             c.motivo_de_baja, c.fecha_de_baja
      FROM Colocadora c
      JOIN Departamento d ON c.id_departamento = d.id_departamento
      WHERE c.estado = 0
    `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener colocadoras inactivas' });
    }
};

// Crear una nueva colocadora
const createColocadora = async (req, res) => {
    const { Nombre, Apellido, DPI, fecha_contratacion, id_departamento, id_usuario } = req.body;

    try {
        // Verificar si el usuario existe
        const [user] = await pool.query('SELECT * FROM Usuario WHERE id_usuario = ?', [id_usuario]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el departamento existe
        const [dept] = await pool.query('SELECT * FROM Departamento WHERE id_departamento = ?', [id_departamento]);
        if (dept.length === 0) {
            return res.status(404).json({ message: 'Departamento no encontrado' });
        }

        const [result] = await pool.query(
            'INSERT INTO Colocadora (Nombre, Apellido, DPI, fecha_contratacion, id_departamento, id_usuario, estado) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [Nombre, Apellido, DPI, fecha_contratacion, id_departamento, id_usuario]
        );

        res.status(201).json({
            id_colocadora: result.insertId,
            Nombre,
            Apellido,
            DPI,
            fecha_contratacion,
            id_departamento,
            id_usuario,
            estado: 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear colocadora' });
    }
};

// Actualizar una colocadora
const updateColocadora = async (req, res) => {
    const { id_colocadora } = req.params;
    const { Nombre, Apellido, DPI, id_departamento } = req.body;

    try {
        // Verificar si la colocadora existe
        const [colocadora] = await pool.query('SELECT * FROM Colocadora WHERE id_colocadora = ?', [id_colocadora]);
        if (colocadora.length === 0) {
            return res.status(404).json({ message: 'Colocadora no encontrada' });
        }

        // Verificar si el departamento existe
        if (id_departamento) {
            const [dept] = await pool.query('SELECT * FROM Departamento WHERE id_departamento = ?', [id_departamento]);
            if (dept.length === 0) {
                return res.status(404).json({ message: 'Departamento no encontrado' });
            }
        }

        await pool.query(
            'UPDATE Colocadora SET Nombre = ?, Apellido = ?, DPI = ?, id_departamento = ? WHERE id_colocadora = ?',
            [
                Nombre || colocadora[0].Nombre,
                Apellido || colocadora[0].Apellido,
                DPI || colocadora[0].DPI,
                id_departamento || colocadora[0].id_departamento,
                id_colocadora
            ]
        );

        res.json({
            id_colocadora,
            message: 'Colocadora actualizada correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar colocadora' });
    }
};

// Dar de baja a una colocadora
const darDeBajaColocadora = async (req, res) => {
    const { id_colocadora } = req.params;
    const { fecha_de_baja, motivo_de_baja } = req.body;

    try {
        const [colocadora] = await pool.query('SELECT * FROM Colocadora WHERE id_colocadora = ?', [id_colocadora]);
        if (colocadora.length === 0) {
            return res.status(404).json({ message: 'Colocadora no encontrada' });
        }

        await pool.query(
            'UPDATE Colocadora SET estado = 0, fecha_de_baja = ?, motivo_de_baja = ? WHERE id_colocadora = ?',
            [fecha_de_baja, motivo_de_baja, id_colocadora]
        );

        res.json({ message: 'Colocadora dada de baja correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al dar de baja la colocadora' });
    }
};

// Obtener usuarios para select
const getUsuariosForSelect = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_usuario, Nombre_Usuario FROM Usuario WHERE Estado = 1 and rol = "colocadora";'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

// Obtener colocadoras para select
const getColocadorasForSelect = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_colocadora, Nombre, Apellido FROM Colocadora WHERE estado = 1'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener colocadoras' });
    }
};

module.exports = {
    getColocadorasActivas,
    getColocadorasInactivas,
    createColocadora,
    updateColocadora,
    darDeBajaColocadora,
    getUsuariosForSelect,
    getColocadorasForSelect
};
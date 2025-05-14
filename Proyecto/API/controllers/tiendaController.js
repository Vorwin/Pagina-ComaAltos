const pool = require('../database');

// Obtener todas las tiendas activas
const getTiendasActivas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT t.id_tienda, t.Nombre_tienda, d.Nombre_Departamento
      FROM Tienda t
      JOIN Departamento d ON t.id_departamento = d.id_departamento
      WHERE t.estado = 1
    `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener tiendas activas' });
    }
};

// Obtener todas las tiendas inactivas
const getTiendasInactivas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT t.id_tienda, t.Nombre_tienda, d.Nombre_Departamento, 
             t.motivo_de_baja, t.fecha_de_baja
      FROM Tienda t
      JOIN Departamento d ON t.id_departamento = d.id_departamento
      WHERE t.estado = 0
    `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener tiendas inactivas' });
    }
};

// Crear una nueva tienda
const createTienda = async (req, res) => {
    const { Nombre_tienda, id_departamento } = req.body;

    try {
        // Verificar si el departamento existe
        const [dept] = await pool.query('SELECT * FROM Departamento WHERE id_departamento = ?', [id_departamento]);
        if (dept.length === 0) {
            return res.status(404).json({ message: 'Departamento no encontrado' });
        }

        const [result] = await pool.query(
            'INSERT INTO Tienda (Nombre_tienda, id_departamento, estado) VALUES (?, ?, 1)',
            [Nombre_tienda, id_departamento]
        );

        res.status(201).json({
            id_tienda: result.insertId,
            Nombre_tienda,
            id_departamento,
            estado: 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear tienda' });
    }
};

// Actualizar una tienda
const updateTienda = async (req, res) => {
    const { id_tienda } = req.params;
    const { Nombre_tienda, id_departamento } = req.body;

    try {
        // Verificar si la tienda existe
        const [tienda] = await pool.query('SELECT * FROM Tienda WHERE id_tienda = ?', [id_tienda]);
        if (tienda.length === 0) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        // Verificar si el departamento existe
        if (id_departamento) {
            const [dept] = await pool.query('SELECT * FROM Departamento WHERE id_departamento = ?', [id_departamento]);
            if (dept.length === 0) {
                return res.status(404).json({ message: 'Departamento no encontrado' });
            }
        }

        await pool.query(
            'UPDATE Tienda SET Nombre_tienda = ?, id_departamento = ? WHERE id_tienda = ?',
            [
                Nombre_tienda || tienda[0].Nombre_tienda,
                id_departamento || tienda[0].id_departamento,
                id_tienda
            ]
        );

        res.json({
            id_tienda,
            message: 'Tienda actualizada correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar tienda' });
    }
};

// Dar de baja a una tienda
const darDeBajaTienda = async (req, res) => {
    const { id_tienda } = req.params;
    const { fecha_de_baja, motivo_de_baja } = req.body;

    try {
        const [tienda] = await pool.query('SELECT * FROM Tienda WHERE id_tienda = ?', [id_tienda]);
        if (tienda.length === 0) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        await pool.query(
            'UPDATE Tienda SET estado = 0, fecha_de_baja = ?, motivo_de_baja = ? WHERE id_tienda = ?',
            [fecha_de_baja, motivo_de_baja, id_tienda]
        );

        res.json({ message: 'Tienda dada de baja correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al dar de baja la tienda' });
    }
};

// Obtener tiendas para select
const getTiendasForSelect = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_tienda, Nombre_tienda FROM Tienda WHERE estado = 1'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener tiendas' });
    }
};

module.exports = {
    getTiendasActivas,
    getTiendasInactivas,
    createTienda,
    updateTienda,
    darDeBajaTienda,
    getTiendasForSelect
};
const express = require('express');
const router = express.Router();
const { sql } = require('../db');

/* OBTENER TODOS LOS CLIENTES */
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT * FROM Cliente
            ORDER BY id_cliente DESC
        `;
        res.json(result.recordset);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

/* OBTENER CLIENTE POR ID */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql.query`
            SELECT * FROM Cliente WHERE id_cliente = ${id}
        `;
        res.json(result.recordset);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

/* AGREGAR CLIENTE */
router.post('/', async (req, res) => {
    try {
        const { nombre, telefono, correo, direccion } = req.body;
        
        await sql.query`
            INSERT INTO Cliente (nombre, telefono, correo, direccion)
            VALUES (${nombre}, ${telefono}, ${correo}, ${direccion})
        `;
        
        res.json({ mensaje: 'Cliente agregado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

/* EDITAR CLIENTE */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, correo, direccion } = req.body;
        
        await sql.query`
            UPDATE Cliente
            SET 
                nombre = ${nombre},
                telefono = ${telefono},
                correo = ${correo},
                direccion = ${direccion}
            WHERE id_cliente = ${id}
        `;
        
        res.json({ mensaje: 'Cliente actualizado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

/* ELIMINAR CLIENTE */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primero verificamos si tiene ventas
        const ventasCheck = await sql.query`
            SELECT COUNT(*) AS total FROM Venta WHERE id_cliente = ${id}
        `;
        
        if (ventasCheck.recordset[0].total > 0) {
            return res.status(400).json({ 
                mensaje: 'No se puede eliminar el cliente porque tiene ventas asociadas.' 
            });
        }
        
        await sql.query`
            DELETE FROM Cliente WHERE id_cliente = ${id}
        `;
        
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

module.exports = router;

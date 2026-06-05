const express = require('express');
const router = express.Router();
const { sql } = require('../db');

router.get('/', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT v.id_venta, v.total, v.fecha, c.nombre AS cliente_nombre, c.telefono, c.correo, c.direccion 
            FROM Venta v 
            INNER JOIN Cliente c ON v.id_cliente = c.id_cliente
            ORDER BY v.id_venta DESC
        `;
        res.json(result.recordset);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

router.post('/', async (req, res) => {
    console.log('POST /api/ventas RECIBIDO');
    console.log(req.body);
    try {
        const {
            cliente,
            carrito,
            total
        } = req.body;
        /* REGISTRAR CLIENTE */
        const clienteResult = await sql.query`
            INSERT INTO Cliente
            (
                nombre,
                telefono,
                correo,
                direccion
            )
            OUTPUT INSERTED.id_cliente
            VALUES
            (
                ${cliente.nombre},
                ${cliente.telefono},
                ${cliente.correo},
                ${cliente.direccion}
            )
        `;
        const idCliente =
            clienteResult.recordset[0].id_cliente;
        /* REGISTRAR VENTA */
        const ventaResult = await sql.query`
            INSERT INTO Venta
            (
                id_cliente,
                total
            )
            OUTPUT INSERTED.id_venta
            VALUES
            (
                ${idCliente},
                ${total}
            )
        `;
        const idVenta =
            ventaResult.recordset[0].id_venta;
        /* DETALLE */
        for (const producto of carrito) {
            await sql.query`
                INSERT INTO detalle_venta
                (
                    id_venta,
                    id_producto,
                    cantidad,
                    precio_unitario,
                    subtotal
                )
                VALUES
                (
                    ${idVenta},
                    ${producto.id_producto},
                    ${producto.cantidad},
                    ${producto.precio},
                    ${producto.precio * producto.cantidad}
                )
            `;
            /* DESCONTAR STOCK */
            await sql.query`
                UPDATE Productos
                SET stock =
                stock - ${producto.cantidad}
                WHERE id_producto =
                ${producto.id_producto}
            `;
        }
        res.json({
            mensaje: 'Venta registrada',
            idVenta
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
module.exports = router;
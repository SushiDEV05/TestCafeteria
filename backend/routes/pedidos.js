const express = require('express');
const router = express.Router();
const { sql } = require('../db');

router.post('/', async (req, res) => {

    try {

        const {
            carrito,
            total,
            id_usuario
        } = req.body;

        /* CREAR PEDIDO */

        const pedidoResult = await sql.query`

            INSERT INTO pedidos
            (id_usuario, fecha, estado, total)

            VALUES
            (
                ${id_usuario},
                CURRENT_TIMESTAMP,
                'Pendiente',
                ${total}
            )

            RETURNING id_pedido
        `;

        const idPedido =
            pedidoResult.recordset[0].id_pedido;

        /* GUARDAR DETALLE */

        for (const producto of carrito) {

            await sql.query`

                INSERT INTO detalle_pedido
                (
                    id_pedido,
                    id_producto,
                    cantidad,
                    precio_unitario,
                    subtotal
                )

                VALUES
                (
                    ${idPedido},
                    ${producto.id_producto},
                    ${producto.cantidad},
                    ${producto.precio},
                    ${producto.precio * producto.cantidad}
                )
            `;

            /* DESCONTAR STOCK */

            await sql.query`

                UPDATE Productos

                SET stock = stock - ${producto.cantidad}

                WHERE id_producto =
                ${producto.id_producto}

            `;
        }

        res.json({
            mensaje: 'Pedido registrado',
            idPedido
        });

    } catch (error) {

        console.log(error);

        res.status(500).json(error);
    }
});

/* OBTENER TODOS LOS PEDIDOS */
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT p.id_pedido, p.id_usuario, p.fecha, p.estado, p.total, u.nombre AS usuario_nombre, u.correo
            FROM pedidos p
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            ORDER BY p.id_pedido DESC
        `;
        res.json(result.recordset);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

/* EDITAR ESTADO DE PEDIDO */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        await sql.query`
            UPDATE pedidos
            SET estado = ${estado}
            WHERE id_pedido = ${id}
        `;
        
        res.json({ mensaje: 'Estado de pedido actualizado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

/* ELIMINAR PEDIDO */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primero eliminar el detalle asociado al pedido
        await sql.query`
            DELETE FROM detalle_pedido WHERE id_pedido = ${id}
        `;
        
        // Luego eliminar el pedido principal
        await sql.query`
            DELETE FROM pedidos WHERE id_pedido = ${id}
        `;
        
        res.json({ mensaje: 'Pedido eliminado correctamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

module.exports = router;
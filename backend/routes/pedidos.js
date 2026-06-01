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

            OUTPUT INSERTED.id_pedido

            VALUES
            (
                ${id_usuario},
                GETDATE(),
                'Pendiente',
                ${total}
            )
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

module.exports = router;
const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const ExcelJS = require('exceljs');

router.get('/exportar', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT v.id_venta, v.total, v.fecha, c.nombre AS cliente_nombre, c.telefono, c.correo, c.direccion 
            FROM Venta v 
            INNER JOIN Cliente c ON v.id_cliente = c.id_cliente
            ORDER BY v.id_venta DESC
        `;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ventas');

        worksheet.columns = [
            { header: 'ID Venta', key: 'id_venta', width: 10 },
            { header: 'Fecha', key: 'fecha', width: 25 },
            { header: 'Cliente', key: 'cliente_nombre', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 15 },
            { header: 'Correo', key: 'correo', width: 30 },
            { header: 'Dirección', key: 'direccion', width: 30 },
            { header: 'Total', key: 'total', width: 15 }
        ];

        result.recordset.forEach(venta => {
            worksheet.addRow({
                id_venta: venta.id_venta,
                fecha: venta.fecha ? new Date(venta.fecha).toLocaleString() : 'N/A',
                cliente_nombre: venta.cliente_nombre,
                telefono: venta.telefono,
                correo: venta.correo,
                direccion: venta.direccion,
                total: venta.total
            });
        });

        // Estilos para la cabecera
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9C7B5E' } };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Ventas.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

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
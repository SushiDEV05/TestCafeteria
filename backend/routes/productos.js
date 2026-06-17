const express = require('express');
const router = express.Router();
const multer = require('multer');
const { sql } = require('../db');

/* CONFIGURAR MULTER */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = /jpg|jpeg|png/;
        const extension = tiposPermitidos.test(
            file.originalname.toLowerCase()
        );
        if (extension) {
            return cb(null, true);
        }
        cb('Solo imágenes JPG y PNG');
    }
});

/* OBTENER PRODUCTOS */
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT * FROM Productos
        `;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json(error);
    }
});

/* ========================================================================= */
/* AGREGAR PRODUCTO (BLINDADO CONTRA VALORES BLANCOS O NaN)                 */
/* ========================================================================= */
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio,
            stock
        } = req.body;

        const imagen = req.file ? req.file.filename : '';

        // Forzamos el tipo de dato numérico y evitamos el colapso por NaN
        let precioNumerico = parseFloat(precio);
        let stockNumerico = parseInt(stock);

        if (isNaN(precioNumerico)) precioNumerico = 0.0;
        if (isNaN(stockNumerico)) stockNumerico = 0;

        await sql.query`
            INSERT INTO Productos
            (nombre, descripcion, precio, imagen, stock)
            VALUES
            (
                ${nombre},
                ${descripcion},
                ${precioNumerico},
                ${imagen},
                ${stockNumerico}
            )
        `;
        res.json({
            mensaje: 'Producto agregado correctamente'
        });
    } catch (error) {
        console.error("❌ ERROR CRÍTICO EN POST PRODUCTOS:", error);
        res.status(500).json(error);
    }
});

/* ========================================================================= */
/* ELIMINAR PRODUCTO (CORREGIDO PARA EVITAR EL ERROR DE SINTAXIS MULTIPLE)   */
/* ========================================================================= */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Ejecutamos cada eliminación por separado para que el motor de SQL no se confunda
        await sql.query`DELETE FROM detalle_pedido WHERE id_producto = ${id}`;
        await sql.query`DELETE FROM detalle_venta WHERE id_producto = ${id}`;
        await sql.query`DELETE FROM Productos WHERE id_producto = ${id}`;

        res.json({
            mensaje: 'Producto eliminado'
        });
    } catch (error) {
        console.error("❌ ERROR CRÍTICO EN DELETE PRODUCTOS:", error);
        res.status(500).json(error);
    }
});

/* ========================================================================= */
/* EDITAR PRODUCTO (BLINDADO CONTRA VALORES NaN / NULL)                      */
/* ========================================================================= */
router.put('/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            descripcion,
            precio,
            stock
        } = req.body;

        // Convertimos y validamos. Si da NaN, le ponemos un valor por defecto
        let precioNumerico = parseFloat(precio);
        let stockNumerico = parseInt(stock);

        if (isNaN(precioNumerico)) precioNumerico = 0.0;
        if (isNaN(stockNumerico)) stockNumerico = 0;

        if (req.file) {
            // Si el usuario seleccionó una nueva foto, se actualiza la imagen
            const nuevaImagen = req.file.filename;
            await sql.query`
                UPDATE Productos
                SET
                    nombre = ${nombre},
                    descripcion = ${descripcion},
                    precio = ${precioNumerico},
                    imagen = ${nuevaImagen},
                    stock = ${stockNumerico}
                WHERE id_producto = ${id}
            `;
        } else {
            // Si no se seleccionó ninguna foto, se conserva la imagen que ya existía
            await sql.query`
                UPDATE Productos
                SET
                    nombre = ${nombre},
                    descripcion = ${descripcion},
                    precio = ${precioNumerico},
                    stock = ${stockNumerico}
                WHERE id_producto = ${id}
            `;
        }

        res.json({
            mensaje: 'Producto actualizado correctamente'
        });
    } catch (error) {
        // Esto pintará en los logs de Render el fallo exacto si ocurre algo externo
        console.error("❌ ERROR CRÍTICO EN PUT PRODUCTOS:", error);
        res.status(500).json({
            error: true,
            message: error.message
        });
    }
});

module.exports = router;
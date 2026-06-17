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

/* AGREGAR PRODUCTO */
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            precio,
            stock
        } = req.body;
        const imagen = req.file ? req.file.filename : '';
        await sql.query`
            INSERT INTO Productos
            (nombre, descripcion, precio, imagen, stock)
            VALUES
            (
                ${nombre},
                ${descripcion},
                ${precio},
                ${imagen},
                ${stock}
            )
        `;
        res.json({
            mensaje: 'Producto agregado correctamente'
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

/* ========================================================================= */
/* ELIMINAR PRODUCTO (CORREGIDO PARA EVITAR EL ERROR DE SINTAXIS 42601)      */
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
        console.log(error);
        res.status(500).json(error);
    }
});

/* ========================================================================= */
/* EDITAR PRODUCTO (CORREGIDO: MANTIENE LA IMAGEN ANTERIOR SI VIENE VACÍA)   */
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

        if (req.file) {
            // Si el usuario subió una nueva foto, actualizamos TODO, incluyendo la nueva imagen
            const nuevaImagen = req.file.filename;
            await sql.query`
                UPDATE Productos
                SET
                    nombre = ${nombre},
                    descripcion = ${descripcion},
                    precio = ${precio},
                    imagen = ${nuevaImagen},
                    stock = ${stock}
                WHERE id_producto = ${id}
            `;
        } else {
            // Si req.file es undefined, el usuario no cambió la foto. Conservamos la imagen existente
            await sql.query`
                UPDATE Productos
                SET
                    nombre = ${nombre},
                    descripcion = ${descripcion},
                    precio = ${precio},
                    stock = ${stock}
                WHERE id_producto = ${id}
            `;
        }

        res.json({
            mensaje: 'Producto actualizado'
        });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { sql } = require('../db');

/* ===================== LOGIN ===================== */
router.post('/login', async (req, res) => {
    try {
        const { correo, contrasena, rol } = req.body;

        if (!correo || !contrasena || !rol) {
            return res.status(400).json({
                success: false,
                mensaje: 'Por favor ingrese todos los campos (correo, contrasena, rol).'
            });
        }

        const result = await sql.query`
            SELECT id_usuario, nombre, correo, rol 
            FROM usuarios 
            WHERE correo = ${correo} AND contrasena = ${contrasena} AND rol = ${rol}
        `;

        if (result.recordset && result.recordset.length > 0) {
            const user = result.recordset[0];
            res.json({
                success: true,
                id_usuario: user.id_usuario,
                usuario: user.nombre,
                correo: user.correo,
                role: user.rol
            });
        } else {
            res.status(401).json({
                success: false,
                mensaje: 'Correo, contraseña o rol incorrectos.'
            });
        }
    } catch (error) {
        console.error('Error en el login del backend:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error interno en el servidor.',
            error: error.message
        });
    }
});

/* ===================== LISTAR USUARIOS ===================== */
/* rolSolicitante: el rol de quien está consultando (super ve todos, admin ve solo empleados) */
router.get('/usuarios', async (req, res) => {
    try {
        const { rolSolicitante } = req.query;

        let result;
        if (rolSolicitante === 'super') {
            // Super puede ver admins y empleados (no otros super por seguridad)
            result = await sql.query`
                SELECT id_usuario, nombre, correo, rol 
                FROM usuarios 
                WHERE rol IN ('administrador', 'empleado')
                ORDER BY rol, nombre
            `;
        } else if (rolSolicitante === 'administrador') {
            // Admin solo puede ver empleados
            result = await sql.query`
                SELECT id_usuario, nombre, correo, rol 
                FROM usuarios 
                WHERE rol = 'empleado'
                ORDER BY nombre
            `;
        } else {
            return res.status(403).json({
                success: false,
                mensaje: 'No tienes permisos para ver los usuarios.'
            });
        }

        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno.', error: error.message });
    }
});

/* ===================== CREAR USUARIO ===================== */
router.post('/usuarios', async (req, res) => {
    try {
        const { nombre, correo, contrasena, rol, rolSolicitante } = req.body;

        if (!nombre || !correo || !contrasena || !rol || !rolSolicitante) {
            return res.status(400).json({ success: false, mensaje: 'Todos los campos son requeridos.' });
        }

        // Validar permisos de creación
        if (rolSolicitante === 'super') {
            if (!['administrador', 'empleado'].includes(rol)) {
                return res.status(403).json({ success: false, mensaje: 'Super solo puede crear administradores o empleados.' });
            }
        } else if (rolSolicitante === 'administrador') {
            if (rol !== 'empleado') {
                return res.status(403).json({ success: false, mensaje: 'El administrador solo puede crear empleados.' });
            }
        } else {
            return res.status(403).json({ success: false, mensaje: 'No tienes permisos para crear usuarios.' });
        }

        // Verificar correo duplicado
        const check = await sql.query`SELECT id_usuario FROM usuarios WHERE correo = ${correo}`;
        if (check.recordset.length > 0) {
            return res.status(409).json({ success: false, mensaje: 'Ya existe un usuario con ese correo.' });
        }

        await sql.query`
            INSERT INTO usuarios (nombre, correo, contrasena, rol)
            VALUES (${nombre}, ${correo}, ${contrasena}, ${rol})
        `;

        res.status(201).json({ success: true, mensaje: 'Usuario creado correctamente.' });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno.', error: error.message });
    }
});

/* ===================== EDITAR USUARIO ===================== */
router.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, contrasena, rol, rolSolicitante } = req.body;

        if (!nombre || !correo || !contrasena || !rol || !rolSolicitante) {
            return res.status(400).json({ success: false, mensaje: 'Todos los campos son requeridos.' });
        }

        // Verificar que el usuario a editar exista
        const target = await sql.query`SELECT rol FROM usuarios WHERE id_usuario = ${id}`;
        if (target.recordset.length === 0) {
            return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
        }
        const rolObjetivo = target.recordset[0].rol;

        // Validar permisos
        if (rolSolicitante === 'administrador' && rolObjetivo !== 'empleado') {
            return res.status(403).json({ success: false, mensaje: 'El administrador solo puede editar empleados.' });
        }
        if (rolSolicitante === 'super' && !['administrador', 'empleado'].includes(rolObjetivo)) {
            return res.status(403).json({ success: false, mensaje: 'No tienes permisos para editar este usuario.' });
        }

        await sql.query`
            UPDATE usuarios
            SET nombre = ${nombre}, correo = ${correo}, contrasena = ${contrasena}, rol = ${rol}
            WHERE id_usuario = ${id}
        `;

        res.json({ success: true, mensaje: 'Usuario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al editar usuario:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno.', error: error.message });
    }
});

/* ===================== ELIMINAR USUARIO ===================== */
router.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rolSolicitante } = req.query;

        // Verificar que el usuario exista
        const target = await sql.query`SELECT rol FROM usuarios WHERE id_usuario = ${id}`;
        if (target.recordset.length === 0) {
            return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
        }
        const rolObjetivo = target.recordset[0].rol;

        // Validar permisos
        if (rolSolicitante === 'administrador' && rolObjetivo !== 'empleado') {
            return res.status(403).json({ success: false, mensaje: 'El administrador solo puede eliminar empleados.' });
        }
        if (rolSolicitante === 'super' && !['administrador', 'empleado'].includes(rolObjetivo)) {
            return res.status(403).json({ success: false, mensaje: 'No tienes permisos para eliminar este usuario.' });
        }
        if (!['super', 'administrador'].includes(rolSolicitante)) {
            return res.status(403).json({ success: false, mensaje: 'No tienes permisos para eliminar usuarios.' });
        }

        await sql.query`DELETE FROM usuarios WHERE id_usuario = ${id}`;
        res.json({ success: true, mensaje: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ success: false, mensaje: 'Error interno.', error: error.message });
    }
});

module.exports = router;


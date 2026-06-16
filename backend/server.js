const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { conectarDB } = require('./db');

const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const ventasRoutes = require('./routes/ventas');
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');

const app = express(); // <-- IMPORTANTE: Primero definimos 'app'

app.use(cors());
app.use(express.json());

/* ========================================================================= */
/* CARPETA IMAGENES (CORREGIDA CON PATH.JOIN PARA PRODUCCIÓN EN RENDER)       */
/* ========================================================================= */
// Esto asegura que Express encuentre la carpeta local de fotos en el servidor Linux de Render
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* RUTAS DE LA API */
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);

/* CONEXION BD */
conectarDB();

/* ========================================================================= */
/* SERVIR EL FRONTEND DE ANGULAR (AUTOMÁTICO)                               */
/* ========================================================================= */
let distPath = path.join(__dirname, '../dist');

// Corregimos la ruta estática para que apunte a la subcarpeta real (dist/cofe)
if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    const subFolder = files.find(f => fs.statSync(path.join(distPath, f)).isDirectory());
    if (subFolder) {
        let potentialPath = path.join(distPath, subFolder);
        // Si Angular usó la estructura moderna con /browser
        if (fs.existsSync(path.join(potentialPath, 'browser'))) {
            distPath = path.join(potentialPath, 'browser');
        } else {
            distPath = potentialPath;
        }
    }
}
// Ahora Express buscará main.js y styles.css en la carpeta correcta
app.use(express.static(distPath));

// Cualquier otra ruta SPA recarga el index.html correcto
app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

/* SERVIDOR */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
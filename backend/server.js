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

/* CARPETA IMAGENES */
app.use('/uploads', express.static('uploads'));

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
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

// Usamos app.use sin ruta para saltarnos el parser estricto de Express 5 / Node 24
app.use((req, res) => {
    let indexPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
        const files = fs.readdirSync(distPath);
        const subFolder = files.find(f => fs.statSync(path.join(distPath, f)).isDirectory());
        if (subFolder) {
            indexPath = path.join(distPath, subFolder, 'index.html');
            if (!fs.existsSync(indexPath) && fs.existsSync(path.join(distPath, subFolder, 'browser', 'index.html'))) {
                indexPath = path.join(distPath, subFolder, 'browser', 'index.html');
            }
        }
    }
    res.sendFile(indexPath);
});
/* ========================================================================= */

/* SERVIDOR */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
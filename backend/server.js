const express = require('express');
const cors = require('cors');
const { conectarDB } = require('./db');
const productosRoutes = require('./routes/productos');
const app = express();
app.use(cors());
app.use(express.json());
/* CARPETA IMAGENES */
app.use('/uploads', express.static('uploads'));
/* RUTAS */
app.use('/api/productos', productosRoutes);
conectarDB();
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});
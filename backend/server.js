const express = require('express');
const cors = require('cors');

const { conectarDB } = require('./db');

const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const ventasRoutes = require('./routes/ventas');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());

app.use(express.json());

/* CARPETA IMAGENES */
app.use('/uploads', express.static('uploads'));

/* RUTAS */
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/auth', authRoutes);
const clientesRoutes = require('./routes/clientes');
app.use('/api/clientes', clientesRoutes);

/* CONEXION BD */
conectarDB();

/* SERVIDOR */
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});
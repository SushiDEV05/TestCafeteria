const { sql, conectarDB } = require('./db');

conectarDB().then(async () => {
    try {
        // Find a user or just insert with a random ID if none exist
        const userResult = await sql.query("SELECT TOP 1 id_usuario FROM usuarios");
        let userId = 1;
        if (userResult.recordset.length > 0) {
            userId = userResult.recordset[0].id_usuario;
        }

        console.log("Using user ID:", userId);

        // Insert a dummy order
        const pedidoResult = await sql.query`
            INSERT INTO pedidos (id_usuario, fecha, estado, total)
            OUTPUT INSERTED.id_pedido
            VALUES (${userId}, GETDATE(), 'Pendiente', 45.50)
        `;
        
        const pedidoId = pedidoResult.recordset[0].id_pedido;
        console.log("Inserted order ID:", pedidoId);

        // We can just stop here as the list only needs the main order, but let's see.
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
});

const { sql, conectarDB } = require('./db');
conectarDB().then(async () => {
    try {
        const result = await sql.query("SELECT * FROM pedidos");
        console.log('Pedidos:', result.recordset);
    } catch (e) { console.error(e); }
    process.exit(0);
});

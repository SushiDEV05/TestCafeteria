const { sql, conectarDB } = require('./db');
conectarDB().then(async () => {
    try {
        const result = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        console.log('Tables:', result.recordset);
        
        for (const row of result.recordset) {
            const cols = await sql.query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${row.TABLE_NAME}'`);
            console.log(`\nTable ${row.TABLE_NAME}:`);
            console.log(cols.recordset);
        }
    } catch (e) { console.error(e); }
    process.exit(0);
});

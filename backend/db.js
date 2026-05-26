const sql = require('mssql');
const config = {
    user: 'admincafeteria',
    password: '1234',
    server: 'SUSHIPC',
    database: 'Cafeteria',
    options: {
        trustServerCertificate: true
    }
};
async function conectarDB() {
    try {
        await sql.connect(config);
        console.log('Conectado a SQL Server');
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    sql,
    conectarDB
};
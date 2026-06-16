const { Pool } = require('pg');

const config = {
    host: 'dpg-d8o86gpkh4rs73b9ndhg-a',
    database: 'cafeteria_7y02',
    user: 'sushi',
    password: '4mdX2Ia7KRI0XhLE5l7fGkX2Vzj7iQwK',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
};

const pool = new Pool(config);

async function conectarDB() {
    try {
        await pool.query('SELECT NOW()');
        console.log('Conectado a PostgreSQL');
    } catch (error) {
        console.error('Error al conectar a PostgreSQL:', error);
    }
}

function formatRow(row) {
    if (!row) return row;
    const formatted = { ...row };
    for (const key of Object.keys(row)) {
        formatted[key.toUpperCase()] = row[key];
        formatted[key.toLowerCase()] = row[key];
    }
    return formatted;
}

const sql = {
    query: async function (strings, ...values) {
        let text;
        let queryValues = [];

        if (Array.isArray(strings) && strings.raw) {
            // Tagged template literal
            let textParts = [];
            for (let i = 0; i < strings.length; i++) {
                textParts.push(strings[i]);
                if (i < values.length) {
                    textParts.push(`$${i + 1}`);
                }
            }
            text = textParts.join('');
            queryValues = values;
        } else {
            // Plain string query
            text = strings;
            queryValues = values;
        }

        const res = await pool.query(text, queryValues);
        const formattedRows = res.rows.map(formatRow);

        return {
            recordset: formattedRows,
            rows: formattedRows,
            rowCount: res.rowCount
        };
    }
};

module.exports = {
    sql,
    conectarDB
};
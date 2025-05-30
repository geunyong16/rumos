// backend/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "postgres", // Changed from "lumos" to "rumos" as mentioned in SQL
    user: "postgres",
    password: "0408"
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database');
    release();
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
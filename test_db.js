// check-db.js (프로젝트 루트)
const { pool } = require('./backend/config/db');

(async () => {
  try {
    const { rows } = await pool.query('SELECT current_database()');
    console.log('현재 연결된 DB:', rows[0].current_database);
  } catch (err) {
    console.error('DB 확인 에러:', err.stack);
  } finally {
    await pool.end();
  }
})();

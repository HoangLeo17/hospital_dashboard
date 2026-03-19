const mysql = require('mysql2');

// Tạo connection pool tới MySQL
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'chi_so_danh_gia_benh_vien',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Kiểm tra kết nối khi khởi động
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    // process.exit(1); // Do not exit, allow server to run for frontend development
  } else {
    console.log('✅ Kết nối MySQL thành công - Database: chi_so_danh_gia_benh_vien');
  }
  if (connection) connection.release();
});

module.exports = pool;

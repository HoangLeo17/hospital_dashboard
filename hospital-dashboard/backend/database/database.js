const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = process.env.DB_PATH ? path.resolve(__dirname, '..', process.env.DB_PATH) : path.resolve(__dirname, '../kpi_dashboard.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // 1. Create bang_chi_so (Quality Indicators)
    db.run(`CREATE TABLE IF NOT EXISTS bang_chi_so (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ma_chi_so TEXT NOT NULL,
      ten_chi_so TEXT NOT NULL,
      don_vi_tinh TEXT NOT NULL,
      chi_tieu_mong_doi REAL,
      loai_so_sanh TEXT CHECK( loai_so_sanh IN ('>=', '<=', '>', '<') ),
      mo_ta TEXT
    )`);

    // 2. Create bang_khoa (Departments)
    db.run(`CREATE TABLE IF NOT EXISTS bang_khoa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten_khoa TEXT NOT NULL
    )`);

    // 3. Create bang_du_lieu_chi_so (Data Entries)
    db.run(`CREATE TABLE IF NOT EXISTS bang_du_lieu_chi_so (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_chi_so INTEGER,
      id_khoa INTEGER,
      nam INTEGER,
      thang INTEGER,
      tu_so INTEGER,
      mau_so INTEGER,
      ngay_nhap DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_chi_so) REFERENCES bang_chi_so (id),
      FOREIGN KEY (id_khoa) REFERENCES bang_khoa (id)
    )`);

    // Seed Data if needed (Usually not needed if sqlite file is copied, but keeping for safety)
  });
}

module.exports = db;

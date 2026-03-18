const db = require('../database/database');

exports.getData = (req, res) => {
  // Use indicator_id for backwards compatibility or general query
  const { indicator_id, nam, thang, quy } = req.query;

  let query = `
    SELECT d.id, d.nam, d.thang, d.tu_so, d.mau_so, k.ten_khoa, c.ma_chi_so, d.id_chi_so 
    FROM bang_du_lieu_chi_so d
    JOIN bang_khoa k ON d.id_khoa = k.id
    JOIN bang_chi_so c ON d.id_chi_so = c.id
    WHERE 1=1
  `;
  const params = [];

  if (indicator_id) {
    query += ` AND d.id_chi_so = ?`;
    params.push(indicator_id);
  }
  if (nam) {
    query += ` AND d.nam = ?`;
    params.push(nam);
  }
  if (thang && thang !== 'all') {
    query += ` AND d.thang = ?`;
    params.push(thang);
  }
  if (quy && quy !== 'all') {
    if (quy == 1) {
      query += ` AND d.thang IN (1, 2, 3)`;
    } else if (quy == 2) {
      query += ` AND d.thang IN (4, 5, 6)`;
    } else if (quy == 3) {
      query += ` AND d.thang IN (7, 8, 9)`;
    } else if (quy == 4) {
      query += ` AND d.thang IN (10, 11, 12)`;
    }
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

exports.postData = (req, res) => {
  const { id_chi_so, id_khoa, nam, thang, tu_so, mau_so } = req.body;

  // 1. Validate mapping exists in khoa_chi_so
  db.get(
    `SELECT id FROM khoa_chi_so WHERE khoa_id = ? AND chi_so_id = ?`,
    [id_khoa, id_chi_so],
    (err, mapping) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!mapping) {
        return res.status(400).json({ 
          error: 'Chỉ số này không áp dụng cho khoa được chọn theo quy định của bệnh viện.' 
        });
      }

      // 2. Check if entry exists for this period
      db.get(
        `SELECT id FROM bang_du_lieu_chi_so WHERE id_chi_so = ? AND id_khoa = ? AND nam = ? AND thang = ?`,
        [id_chi_so, id_khoa, nam, thang],
        (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          if (row) {
            // Update existing record
            db.run(
              `UPDATE bang_du_lieu_chi_so SET tu_so = ?, mau_so = ?, ngay_nhap = CURRENT_TIMESTAMP WHERE id = ?`,
              [tu_so, mau_so, row.id],
              function (err) {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                res.json({ message: 'Data updated successfully', id: row.id });
              }
            );
          } else {
            // Insert new record
            db.run(
              `INSERT INTO bang_du_lieu_chi_so (id_chi_so, id_khoa, nam, thang, tu_so, mau_so)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [id_chi_so, id_khoa, nam, thang, tu_so, mau_so],
              function (err) {
                if (err) {
                  res.status(500).json({ error: err.message });
                  return;
                }
                res.status(201).json({ message: 'Data created successfully', id: this.lastID });
              }
            );
          }
        }
      );
    }
  );
};

exports.getYears = (req, res) => {
  const startYear = 2026;
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }
  
  // Return at least the start year if somehow the current year is earlier (e.g. system clock issues)
  if (years.length === 0) {
    years.push(startYear);
  }
  
  res.json(years);
};

const jwt = require('jsonwebtoken');
const pool = require('../database/database');

const JWT_SECRET = process.env.JWT_SECRET || 'hospital_kpi_secret_key_2026';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin@2026';

// ============================================================
//  AUTH
// ============================================================
exports.login = (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu.' });
  }
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mật khẩu không đúng.' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
};

// Verify token is still valid (for frontend auto-check)
exports.verifyToken = (req, res) => {
  res.json({ valid: true });
};

// ============================================================
//  bang_khoa  (Departments)
// ============================================================
exports.getKhoa = (req, res) => {
  pool.query('SELECT * FROM bang_khoa ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createKhoa = (req, res) => {
  const { ten_khoa } = req.body;
  if (!ten_khoa || !ten_khoa.trim()) {
    return res.status(400).json({ error: 'Tên khoa không được để trống.' });
  }
  pool.query('INSERT INTO bang_khoa (ten_khoa) VALUES (?)', [ten_khoa.trim()], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ten_khoa: ten_khoa.trim() });
  });
};

exports.updateKhoa = (req, res) => {
  const { id } = req.params;
  const { ten_khoa } = req.body;
  if (!ten_khoa || !ten_khoa.trim()) {
    return res.status(400).json({ error: 'Tên khoa không được để trống.' });
  }
  pool.query('UPDATE bang_khoa SET ten_khoa = ? WHERE id = ?', [ten_khoa.trim(), id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy khoa.' });
    res.json({ message: 'Cập nhật thành công.' });
  });
};

exports.deleteKhoa = (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM bang_khoa WHERE id = ?', [id], (err, result) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ error: 'Không thể xoá vì khoa này đang được sử dụng trong dữ liệu khác.' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy khoa.' });
    res.json({ message: 'Xoá thành công.' });
  });
};

// ============================================================
//  bang_chi_so  (Indicators)
// ============================================================
exports.getChiSo = (req, res) => {
  pool.query('SELECT * FROM bang_chi_so ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createChiSo = (req, res) => {
  const { ma_chi_so, ten_chi_so, don_vi_tinh, chi_tieu_mong_doi, loai_so_sanh } = req.body;
  if (!ma_chi_so || !ten_chi_so) {
    return res.status(400).json({ error: 'Mã chỉ số và tên chỉ số không được để trống.' });
  }
  pool.query(
    'INSERT INTO bang_chi_so (ma_chi_so, ten_chi_so, don_vi_tinh, chi_tieu_mong_doi, loai_so_sanh) VALUES (?, ?, ?, ?, ?)',
    [ma_chi_so.trim(), ten_chi_so.trim(), don_vi_tinh || '%', chi_tieu_mong_doi || 0, loai_so_sanh || '<='],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, message: 'Tạo chỉ số thành công.' });
    }
  );
};

exports.updateChiSo = (req, res) => {
  const { id } = req.params;
  const { ma_chi_so, ten_chi_so, don_vi_tinh, chi_tieu_mong_doi, loai_so_sanh } = req.body;
  pool.query(
    'UPDATE bang_chi_so SET ma_chi_so = ?, ten_chi_so = ?, don_vi_tinh = ?, chi_tieu_mong_doi = ?, loai_so_sanh = ? WHERE id = ?',
    [ma_chi_so, ten_chi_so, don_vi_tinh, chi_tieu_mong_doi, loai_so_sanh, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy chỉ số.' });
      res.json({ message: 'Cập nhật thành công.' });
    }
  );
};

exports.deleteChiSo = (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM bang_chi_so WHERE id = ?', [id], (err, result) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ error: 'Không thể xoá vì chỉ số này đang được sử dụng trong dữ liệu khác.' });
      }
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy chỉ số.' });
    res.json({ message: 'Xoá thành công.' });
  });
};

// ============================================================
//  khoa_chi_so  (Department ↔ Indicator mappings)
// ============================================================
exports.getKhoaChiSo = (req, res) => {
  const query = `
    SELECT kc.id, kc.khoa_id, kc.chi_so_id, k.ten_khoa, cs.ma_chi_so, cs.ten_chi_so
    FROM khoa_chi_so kc
    JOIN bang_khoa k ON kc.khoa_id = k.id
    JOIN bang_chi_so cs ON kc.chi_so_id = cs.id
    ORDER BY kc.chi_so_id ASC, k.ten_khoa ASC
  `;
  pool.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createKhoaChiSo = (req, res) => {
  const { khoa_id, chi_so_id } = req.body;
  if (!khoa_id || !chi_so_id) {
    return res.status(400).json({ error: 'Khoa và chỉ số không được để trống.' });
  }
  // Check if mapping already exists
  pool.query(
    'SELECT id FROM khoa_chi_so WHERE khoa_id = ? AND chi_so_id = ?',
    [khoa_id, chi_so_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length > 0) {
        return res.status(400).json({ error: 'Liên kết khoa - chỉ số này đã tồn tại.' });
      }
      pool.query(
        'INSERT INTO khoa_chi_so (khoa_id, chi_so_id) VALUES (?, ?)',
        [khoa_id, chi_so_id],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: result.insertId, message: 'Tạo liên kết thành công.' });
        }
      );
    }
  );
};

exports.deleteKhoaChiSo = (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM khoa_chi_so WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy liên kết.' });
    res.json({ message: 'Xoá thành công.' });
  });
};

// ============================================================
//  bang_du_lieu_chi_so  (Indicator Data entries)
// ============================================================
exports.getDuLieu = (req, res) => {
  const { chi_so_id, khoa_id, nam, thang } = req.query;
  let query = `
    SELECT d.*, k.ten_khoa, cs.ma_chi_so, cs.ten_chi_so
    FROM bang_du_lieu_chi_so d
    JOIN bang_khoa k ON d.id_khoa = k.id
    JOIN bang_chi_so cs ON d.id_chi_so = cs.id
    WHERE 1=1
  `;
  const params = [];

  if (chi_so_id) { query += ' AND d.id_chi_so = ?'; params.push(chi_so_id); }
  if (khoa_id) { query += ' AND d.id_khoa = ?'; params.push(khoa_id); }
  if (nam) { query += ' AND d.nam = ?'; params.push(nam); }
  if (thang) { query += ' AND d.thang = ?'; params.push(thang); }

  query += ' ORDER BY d.nam DESC, d.thang DESC, k.ten_khoa ASC';

  pool.query(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createDuLieu = (req, res) => {
  const { id_chi_so, id_khoa, nam, thang, tu_so, mau_so } = req.body;
  if (!id_chi_so || !id_khoa || !nam || !thang) {
    return res.status(400).json({ error: 'Chỉ số, khoa, năm, tháng không được để trống.' });
  }
  // Check duplicate
  pool.query(
    'SELECT id FROM bang_du_lieu_chi_so WHERE id_chi_so = ? AND id_khoa = ? AND nam = ? AND thang = ?',
    [id_chi_so, id_khoa, nam, thang],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length > 0) {
        return res.status(400).json({ error: 'Dữ liệu cho khoa/chỉ số/tháng/năm này đã tồn tại. Vui lòng sửa thay vì thêm mới.' });
      }
      pool.query(
        'INSERT INTO bang_du_lieu_chi_so (id_chi_so, id_khoa, nam, thang, tu_so, mau_so) VALUES (?, ?, ?, ?, ?, ?)',
        [id_chi_so, id_khoa, nam, thang, tu_so || 0, mau_so || 0],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: result.insertId, message: 'Thêm dữ liệu thành công.' });
        }
      );
    }
  );
};

exports.updateDuLieu = (req, res) => {
  const { id } = req.params;
  const { tu_so, mau_so, nam, thang } = req.body;
  pool.query(
    'UPDATE bang_du_lieu_chi_so SET tu_so = ?, mau_so = ?, nam = ?, thang = ?, ngay_nhap = CURRENT_TIMESTAMP WHERE id = ?',
    [tu_so, mau_so, nam, thang, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy dữ liệu.' });
      res.json({ message: 'Cập nhật thành công.' });
    }
  );
};

exports.deleteDuLieu = (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM bang_du_lieu_chi_so WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Không tìm thấy dữ liệu.' });
    res.json({ message: 'Xoá thành công.' });
  });
};

const pool = require('../database/database');

exports.getDepartments = (req, res) => {
  pool.query("SELECT * FROM bang_khoa ORDER BY ten_khoa ASC", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

exports.getIndicators = (req, res) => {
  pool.query("SELECT * FROM bang_chi_so", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

exports.updateIndicator = (req, res) => {
  const { id } = req.params;
  const { chi_tieu_mong_doi, loai_so_sanh } = req.body;
  
  pool.query(
    `UPDATE bang_chi_so SET chi_tieu_mong_doi = ?, loai_so_sanh = ? WHERE id = ?`,
    [chi_tieu_mong_doi, loai_so_sanh, id],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Target updated successfully', changes: result.affectedRows });
    }
  );
};

exports.getIndicatorsByDepartment = (req, res) => {
  const { deptId } = req.params;
  const query = `
    SELECT cs.* 
    FROM bang_chi_so cs
    JOIN khoa_chi_so kc ON cs.id = kc.chi_so_id
    WHERE kc.khoa_id = ?
  `;
  pool.query(query, [deptId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getDepartmentsByIndicator = (req, res) => {
  const id = req.params.indicatorId || req.params.chiSoId;
  const query = `
    SELECT k.* 
    FROM bang_khoa k
    JOIN khoa_chi_so kc ON k.id = kc.khoa_id
    WHERE kc.chi_so_id = ?
    ORDER BY k.ten_khoa ASC
  `;
  pool.query(query, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};


const db = require('../database/database');

exports.getDepartments = (req, res) => {
  db.all("SELECT * FROM bang_khoa ORDER BY ten_khoa ASC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
};

exports.getIndicators = (req, res) => {
  db.all("SELECT * FROM bang_chi_so", [], (err, rows) => {
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
  
  db.run(
    `UPDATE bang_chi_so SET chi_tieu_mong_doi = ?, loai_so_sanh = ? WHERE id = ?`,
    [chi_tieu_mong_doi, loai_so_sanh, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Target updated successfully', changes: this.changes });
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
  db.all(query, [deptId], (err, rows) => {
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
  db.all(query, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};


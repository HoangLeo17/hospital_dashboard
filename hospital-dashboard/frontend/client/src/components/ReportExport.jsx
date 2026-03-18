import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import INDICATOR_EXPORT_CONFIGS from '../utils/indicatorExportConfigs';

/**
 * ReportExport — Engine xuất Excel dùng chung cho tất cả chỉ số.
 *
 * Props:
 *  - indicatorId   : number  — ID chỉ số (1-12), dùng để tra cứu config
 *  - indicatorName : string  — tên file khi xuất
 *  - year          : string|number
 *  - entries       : array   — dữ liệu từ API { tu_so, mau_so, thang, ten_khoa }
 *  - departments   : array   — danh sách khoa áp dụng [{ id, ten_khoa }]
 *
 * Logic xuất hoàn toàn được định nghĩa trong indicatorExportConfigs.js.
 * Khi thêm CS mới: chỉ thêm entry vào INDICATOR_EXPORT_CONFIGS, không sửa file này.
 */
const ReportExport = ({ indicatorId, indicatorName, year, entries, departments = [] }) => {
  const [exporting, setExporting] = useState(false);

  // Tên file: IndicatorName_hh_MM_ss_dd_mm_yyyy.xlsx
  const safeFileName = (indicatorName || 'BaoCao').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '');
  const now = new Date();
  const dateStr = `${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}_${String(now.getSeconds()).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}`;
  const fileName = `${safeFileName}_${dateStr}.xlsx`;

  // Lấy config từ registry
  const cfg = INDICATOR_EXPORT_CONFIGS[indicatorId];

  // ─── Aggregate helpers ──────────────────────────────────────────────────────

  /** Tổng hợp entries theo tháng → { 1: {tuSo, mauSo}, ... } */
  const aggregateByMonth = () => {
    const map = {};
    entries.forEach(e => {
      const m = Number(e.thang);
      if (!map[m]) map[m] = { tuSo: 0, mauSo: 0 };
      map[m].tuSo += Number(e.tu_so);
      map[m].mauSo += Number(e.mau_so);
    });
    return map;
  };

  /** Tổng hợp entries theo tên khoa → { 'HSTC-CĐ': {tuSo, mauSo}, ... } */
  const aggregateByDept = () => {
    const map = {};
    entries.forEach(e => {
      const k = e.ten_khoa;
      if (!map[k]) map[k] = { tuSo: 0, mauSo: 0 };
      map[k].tuSo += Number(e.tu_so);
      map[k].mauSo += Number(e.mau_so);
    });
    return map;
  };

  // ─── Sheet builders ─────────────────────────────────────────────────────────

  const buildSheet1 = () => {
    const monthMap = aggregateByMonth();
    const headers = cfg.sheet1Header();
    const numCols = headers[0].length;

    const aoa = [];
    // Title (span toàn bộ cột)
    aoa.push([`Sheet 01: ${cfg.sheet1Title}`, ...Array(numCols - 1).fill('')]);
    // Header rows
    headers.forEach(h => aoa.push(h));
    // Data rows: tháng 01 → 12
    for (let m = 1; m <= 12; m++) {
      aoa.push(cfg.buildDataRow(String(m).padStart(2, '0'), monthMap[m]));
    }
    return aoa;
  };

  const buildSheet2 = () => {
    const deptMap = aggregateByDept();
    const headers = cfg.sheet2Header();
    const numCols = headers[0].length;

    const aoa = [];
    // Title
    aoa.push([`Sheet 02: ${cfg.sheet2Title}`, ...Array(numCols - 1).fill('')]);
    // Header rows
    headers.forEach(h => aoa.push(h));

    // Data rows: theo danh sách khoa
    let grand = { tuSo: 0, mauSo: 0 };
    departments.forEach(dept => {
      const agg = deptMap[dept.ten_khoa];
      aoa.push(cfg.buildDeptRow(dept.ten_khoa, agg));
      if (agg && agg.mauSo > 0) {
        grand.tuSo += agg.tuSo;
        grand.mauSo += agg.mauSo;
      }
    });

    // Summary row
    aoa.push(cfg.buildSummaryRow(grand));
    return aoa;
  };

  // ─── Export handler ─────────────────────────────────────────────────────────

  const handleExportExcel = () => {
    if (!cfg) {
      alert(`Chưa có cấu hình xuất Excel cho chỉ số ID=${indicatorId}`);
      return;
    }
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1
      const s1Data = buildSheet1();
      const numTitleCols = s1Data[0].length;
      const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
      ws1['!merges'] = cfg.sheet1Merges(numTitleCols);
      ws1['!cols'] = cfg.sheet1Cols;
      XLSX.utils.book_append_sheet(wb, ws1, 'Tỷ lệ chung theo tháng');

      // Sheet 2
      const s2Data = buildSheet2();
      const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
      ws2['!merges'] = cfg.sheet2Merges();
      ws2['!cols'] = cfg.sheet2Cols;
      XLSX.utils.book_append_sheet(wb, ws2, 'Theo khoa phòng');

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Export error:', err);
      alert('Lỗi xuất file Excel!');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      className="btn btn-success btn-sm d-flex align-items-center gap-2 px-3"
      onClick={handleExportExcel}
      disabled={exporting || !entries || entries.length === 0}
      title={!entries?.length ? 'Không có dữ liệu để xuất' : `Xuất báo cáo ${indicatorName} năm ${year}`}
      style={{ borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
    >
      <i className={`bi ${exporting ? 'bi-hourglass-split' : 'bi-file-earmark-excel-fill'}`}></i>
      {exporting ? 'Đang xuất...' : 'Xuất Excel'}
    </button>
  );
};

export default ReportExport;

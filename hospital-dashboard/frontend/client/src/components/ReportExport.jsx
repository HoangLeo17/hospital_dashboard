import React, { useState } from 'react';
import * as XLSX from 'xlsx';

/**
 * ReportExport - Reusable export component for indicator pages.
 *
 * Props:
 *  - indicatorName: string  (used in filename)
 *  - year: string|number
 *  - entries: array of data rows from API
 *  - targetVal: number
 *  - operator: string (e.g. '<=')
 *  - unit: string (e.g. '%', '‰')
 *  - calcMultiplier: number (100 for %, 1000 for ‰)
 */
const ReportExport = ({ indicatorName, year, entries, targetVal, operator, unit = '%', calcMultiplier = 100 }) => {
  const [exporting, setExporting] = useState(false);

  const safeFileName = (indicatorName || 'BaoCao').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_À-ỹ]/g, '');
  const fileName = `${safeFileName}_${year}.xlsx`;

  // --- Build Monthly Trend Sheet ---
  const buildMonthlySheet = () => {
    const monthMap = {};
    entries.forEach(e => {
      const m = e.thang;
      if (!monthMap[m]) monthMap[m] = { tuSo: 0, mauSo: 0 };
      monthMap[m].tuSo += e.tu_so;
      monthMap[m].mauSo += e.mau_so;
    });

    const rows = [['Tháng', `Tổng tử số`, `Tổng mẫu số`, `Tỷ lệ (${unit})`, `Chỉ tiêu (${unit})`, `Đánh giá`]];
    for (let m = 1; m <= 12; m++) {
      const d = monthMap[m];
      if (!d) {
        rows.push([`Tháng ${String(m).padStart(2, '0')}`, '-', '-', '-', `${operator}${targetVal}${unit}`, 'Không có dữ liệu']);
      } else {
        const rate = d.mauSo > 0 ? ((d.tuSo / d.mauSo) * calcMultiplier) : 0;
        const pass = rate !== null && evalPass(rate, targetVal, operator);
        rows.push([
          `Tháng ${String(m).padStart(2, '0')}`,
          d.tuSo,
          d.mauSo,
          rate.toFixed(1),
          `${operator}${targetVal}${unit}`,
          pass ? '✔ Đạt' : '✘ Chưa đạt'
        ]);
      }
    }
    return rows;
  };

  // --- Build By Department Sheet ---
  const buildDeptSheet = () => {
    const deptMap = {};
    entries.forEach(e => {
      const key = e.ten_khoa;
      if (!deptMap[key]) deptMap[key] = { tuSo: 0, mauSo: 0 };
      deptMap[key].tuSo += e.tu_so;
      deptMap[key].mauSo += e.mau_so;
    });

    const rows = [['Khoa / Phòng', `Tổng tử số`, `Tổng mẫu số`, `Tỷ lệ (${unit})`, `Chỉ tiêu`, `Đánh giá`]];
    Object.entries(deptMap).forEach(([khoa, d]) => {
      const rate = d.mauSo > 0 ? ((d.tuSo / d.mauSo) * calcMultiplier) : 0;
      const pass = evalPass(rate, targetVal, operator);
      rows.push([khoa, d.tuSo, d.mauSo, rate.toFixed(1), `${operator}${targetVal}${unit}`, pass ? '✔ Đạt' : '✘ Chưa đạt']);
    });
    return rows;
  };

  // --- Build Summary ---
  const buildSummary = () => {
    const total = { tuSo: 0, mauSo: 0 };
    entries.forEach(e => { total.tuSo += e.tu_so; total.mauSo += e.mau_so; });
    const rate = total.mauSo > 0 ? ((total.tuSo / total.mauSo) * calcMultiplier) : 0;
    return [
      ['Chỉ số', indicatorName],
      ['Năm báo cáo', year],
      ['Chỉ tiêu', `${operator} ${targetVal}${unit}`],
      [],
      ['Tổng tử số cả năm', total.tuSo],
      ['Tổng mẫu số cả năm', total.mauSo],
      [`Tỷ lệ cả năm (${unit})`, rate.toFixed(2)],
      ['Đánh giá tổng thể', evalPass(rate, targetVal, operator) ? '✔ Đạt chỉ tiêu' : '✘ Chưa đạt chỉ tiêu'],
    ];
  };

  const evalPass = (rate, target, op) => {
    if (op === '<=') return rate <= target;
    if (op === '>=') return rate >= target;
    if (op === '<') return rate < target;
    if (op === '>') return rate > target;
    return false;
  };

  const handleExportExcel = () => {
    setExporting(true);
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary
      const ws1 = XLSX.utils.aoa_to_sheet(buildSummary());
      ws1['!cols'] = [{ wch: 28 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

      // Sheet 2: Monthly Trend
      const monthlyData = buildMonthlySheet();
      const ws2 = XLSX.utils.aoa_to_sheet(monthlyData);
      ws2['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws2, 'Xu hướng theo tháng');

      // Sheet 3: By Department
      const deptData = buildDeptSheet();
      const ws3 = XLSX.utils.aoa_to_sheet(deptData);
      ws3['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws3, 'Theo khoa');

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Export error:', err);
      alert('Lỗi xuất file Excel!');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="d-flex gap-2">
      <button
        className="btn btn-success btn-sm d-flex align-items-center gap-2 px-3"
        onClick={handleExportExcel}
        disabled={exporting || !entries || entries.length === 0}
        title={entries?.length === 0 ? 'Không có dữ liệu để xuất' : `Xuất báo cáo ${indicatorName} năm ${year}`}
        style={{ borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
      >
        <i className={`bi ${exporting ? 'bi-hourglass-split' : 'bi-file-earmark-excel-fill'}`}></i>
        {exporting ? 'Đang xuất...' : 'Xuất Excel'}
      </button>
    </div>
  );
};

export default ReportExport;

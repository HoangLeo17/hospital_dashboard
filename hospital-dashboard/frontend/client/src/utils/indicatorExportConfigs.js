/**
 * indicatorExportConfigs.js
 *
 * Cấu hình xuất Excel cho từng chỉ số (CS1 → CS12).
 * Mỗi entry định nghĩa:
 *   - sheet1Title / sheet2Title : tiêu đề của từng sheet
 *   - template                  : kiểu layout ('complement' | 'ratio')
 *   - sheet1Cols / sheet2Cols   : độ rộng cột [{ wch }]
 *   - buildDataRow(m, agg, unit): trả về mảng ô cho 1 dòng dữ liệu (tháng hoặc khoa)
 *   - buildSummaryRow(agg, unit): trả về mảng ô cho dòng "Tỷ lệ chung"
 *   - sheet1Header(unit)        : mảng các dòng header sheet 1 (sau title)
 *   - sheet2Header(unit)        : mảng các dòng header sheet 2 (sau title)
 *   - sheet1Merges              : mảng merge cho sheet 1 (row 0 = title, row 1+ = header)
 *
 * agg = { tuSo, mauSo } — đã tổng hợp theo tháng hoặc khoa.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Tính tỷ lệ an toàn */
const rate = (tuSo, mauSo, multiplier, digits = 2) =>
  mauSo > 0 ? ((tuSo / mauSo) * multiplier).toFixed(digits) : null;

/** Tỷ lệ làm tròn nguyên */
const rateRound = (tuSo, mauSo, multiplier) =>
  mauSo > 0 ? Math.round((tuSo / mauSo) * multiplier) : null;

// ─── Template: complement ────────────────────────────────────────────────────
// Layout: Tháng/Khoa | colYes | Tỷ lệ | colNo | Tỷ lệ | Tổng
// Dùng cho: CS1, CS4, CS5, CS6, CS7, CS8, CS9, CS10, CS11, CS12
// (bất kỳ CS nào mà mauSo = tuSo + không_tuSo)

const complementConfig = ({ sheet1Title, sheet2Title, colYes, colNo, unit = '%', multiplier = 100 }) => ({
  template: 'complement',
  sheet1Title,
  sheet2Title,

  sheet1Header: () => [
    ['Tháng', colYes, '', colNo, '', 'Tổng'],
    ['', colYes, 'Tỷ lệ', colNo, 'Tỷ lệ', ''],
  ],
  sheet2Header: () => [
    ['Khoa/phòng', colYes, colNo, 'Tổng'],
  ],

  // Dòng dữ liệu sheet 1 (theo tháng)
  buildDataRow: (label, agg) => {
    if (!agg || agg.mauSo === 0) return [label, '', '', '', '', ''];
    const khong = agg.mauSo - agg.tuSo;
    const r1 = rateRound(agg.tuSo, agg.mauSo, multiplier);
    const r2 = rateRound(khong, agg.mauSo, multiplier);
    return [label, agg.tuSo, `${r1}${unit}`, khong, `${r2}${unit}`, `${agg.mauSo} (100${unit})`];
  },

  // Dòng dữ liệu sheet 2 (theo khoa)
  buildDeptRow: (name, agg) => {
    if (!agg || agg.mauSo === 0) return [name, '', '', ''];
    const khong = agg.mauSo - agg.tuSo;
    const r1 = rateRound(agg.tuSo, agg.mauSo, multiplier);
    const r2 = rateRound(khong, agg.mauSo, multiplier);
    return [name, `${agg.tuSo} (${r1}${unit})`, `${khong} (${r2}${unit})`, `${agg.mauSo} (100${unit})`];
  },

  buildSummaryRow: (agg) => {
    if (!agg || agg.mauSo === 0) return ['Tỷ lệ chung', '', '', ''];
    const khong = agg.mauSo - agg.tuSo;
    const r1 = rateRound(agg.tuSo, agg.mauSo, multiplier);
    const r2 = rateRound(khong, agg.mauSo, multiplier);
    return ['Tỷ lệ chung', `${agg.tuSo} (${r1}${unit})`, `${khong} (${r2}${unit})`, `${agg.mauSo} (100${unit})`];
  },

  sheet1Cols: [{ wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 16 }],
  sheet2Cols: [{ wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 18 }],

  // Merges cho sheet 1 (row 0 = title, row 1 = header nhóm, row 2 = sub-header)
  sheet1Merges: (numTitleCols) => [
    { s: { r: 0, c: 0 }, e: { r: 0, c: numTitleCols - 1 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },                // "Tháng"
    { s: { r: 1, c: 1 }, e: { r: 1, c: 2 } },                // colYes group
    { s: { r: 1, c: 3 }, e: { r: 1, c: 4 } },                // colNo group
    { s: { r: 1, c: 5 }, e: { r: 2, c: 5 } },                // "Tổng"
  ],
  sheet2Merges: () => [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
  ],
});

// ─── Template: ratio ─────────────────────────────────────────────────────────
// Layout: Tháng/Khoa | colTuSo | colMauSo | colTyLe
// Dùng cho: CS2, CS3 (bất kỳ CS nào mà mauSo không phải tổng của tuSo + cái gì đó)

const ratioConfig = ({ sheet1Title, sheet2Title, colTuSo, colMauSo, colTyLe, unit = '%', multiplier = 100 }) => ({
  template: 'ratio',
  sheet1Title,
  sheet2Title,

  sheet1Header: () => [
    ['Tháng', colTuSo, colMauSo, colTyLe || `Tỷ lệ (${unit})`],
  ],
  sheet2Header: () => [
    ['Khoa/phòng', colTuSo, colMauSo, colTyLe || `Tỷ lệ (${unit})`],
  ],

  buildDataRow: (label, agg) => {
    if (!agg || agg.mauSo === 0) return [label, '', '', ''];
    const r = rate(agg.tuSo, agg.mauSo, multiplier);
    return [label, agg.tuSo, agg.mauSo, `${r}${unit}`];
  },

  buildDeptRow: (name, agg) => {
    if (!agg || agg.mauSo === 0) return [name, '', '', ''];
    const r = rate(agg.tuSo, agg.mauSo, multiplier);
    return [name, agg.tuSo, agg.mauSo, `${r}${unit}`];
  },

  buildSummaryRow: (agg) => {
    if (!agg || agg.mauSo === 0) return ['Tỷ lệ chung', '', '', ''];
    const r = rate(agg.tuSo, agg.mauSo, multiplier);
    return ['Tỷ lệ chung', agg.tuSo, agg.mauSo, `${r}${unit}`];
  },

  sheet1Cols: [{ wch: 10 }, { wch: 18 }, { wch: 26 }, { wch: 24 }],
  sheet2Cols: [{ wch: 22 }, { wch: 18 }, { wch: 26 }, { wch: 24 }],

  sheet1Merges: (numTitleCols) => [
    { s: { r: 0, c: 0 }, e: { r: 0, c: numTitleCols - 1 } },
  ],
  sheet2Merges: () => [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
  ],
});

// ─── Khai báo config từng chỉ số ─────────────────────────────────────────────

const INDICATOR_EXPORT_CONFIGS = {
  // CS1: Tuân thủ vệ sinh tay
  1: complementConfig({
    sheet1Title: 'Tỷ lệ tuân thủ vệ sinh tay chung :',
    sheet2Title: 'Tỷ lệ tuân thủ vệ sinh tay tại các khoa/phòng trong Bệnh viện',
    colYes: 'Có rửa tay',
    colNo: 'Không rửa tay',
    unit: '%',
    multiplier: 100,
  }),

  // CS2: Viêm phổi thở máy — tỷ số thuần tuý
  2: ratioConfig({
    sheet1Title: 'Tỷ lệ viêm phổi thở máy :',
    sheet2Title: 'Tỷ lệ viêm phổi thở máy tại các khoa/phòng trong Bệnh viện',
    colTuSo: 'Số ca viêm phổi',
    colMauSo: 'Tổng số bệnh nhân thở máy',
    colTyLe: 'Tỷ lệ Viêm phổi thở máy',
    unit: '%',
    multiplier: 100,
  }),

  // CS3: Loét do tỳ đè — tỷ số thuần tuý
  3: ratioConfig({
    sheet1Title: 'Tỷ lệ loét do tỳ đè :',
    sheet2Title: 'Tỷ lệ loét do tỳ đè tại các khoa/phòng trong Bệnh viện',
    colTuSo: 'Số ca loét',
    colMauSo: 'Tổng số bệnh nhân',
    colTyLe: 'Tỷ lệ loét do tỳ đè',
    unit: '%',
    multiplier: 100,
  }),

  // CS4: Truyền thông GDSK
  4: complementConfig({
    sheet1Title: 'Tỷ lệ truyền thông GDSK :',
    sheet2Title: 'Tỷ lệ truyền thông GDSK tại các khoa/phòng trong Bệnh viện',
    colYes: 'Được tư vấn',
    colNo: 'Không được tư vấn',
    unit: '%',
    multiplier: 100,
  }),

  // CS5: Chuẩn bị NB trước mổ
  5: complementConfig({
    sheet1Title: 'Tỷ lệ chuẩn bị NB trước mổ :',
    sheet2Title: 'Tỷ lệ chuẩn bị NB trước mổ tại các khoa/phòng trong Bệnh viện',
    colYes: 'Đạt chuẩn',
    colNo: 'Không đạt',
    unit: '%',
    multiplier: 100,
  }),

  // CS6: 05 đúng dùng thuốc
  6: complementConfig({
    sheet1Title: 'Tỷ lệ thực hiện 05 đúng dùng thuốc :',
    sheet2Title: 'Tỷ lệ 05 đúng dùng thuốc tại các khoa/phòng trong Bệnh viện',
    colYes: 'Đạt 5 đúng',
    colNo: 'Không đạt',
    unit: '%',
    multiplier: 100,
  }),

  // CS7: Bàn giao NB chăm sóc
  7: complementConfig({
    sheet1Title: 'Tỷ lệ bàn giao NB chăm sóc :',
    sheet2Title: 'Tỷ lệ bàn giao NB chăm sóc tại các khoa/phòng trong Bệnh viện',
    colYes: 'Bàn giao đủ',
    colNo: 'Không đủ',
    unit: '%',
    multiplier: 100,
  }),

  // CS8: Đi buồng ĐDTK
  8: complementConfig({
    sheet1Title: 'Tỷ lệ đi buồng ĐDTK :',
    sheet2Title: 'Tỷ lệ đi buồng ĐDTK tại các khoa/phòng trong Bệnh viện',
    colYes: 'Đạt',
    colNo: 'Không đạt',
    unit: '%',
    multiplier: 100,
  }),

  // CS9: Thuốc cảnh báo cao
  9: complementConfig({
    sheet1Title: 'Tỷ lệ quản lý thuốc cảnh báo cao :',
    sheet2Title: 'Tỷ lệ quản lý thuốc cảnh báo cao tại các khoa/phòng trong Bệnh viện',
    colYes: 'Đạt',
    colNo: 'Không đạt',
    unit: '%',
    multiplier: 100,
  }),

  // CS10: Chăm sóc catheter TM
  10: complementConfig({
    sheet1Title: 'Tỷ lệ chăm sóc catheter TM :',
    sheet2Title: 'Tỷ lệ chăm sóc catheter TM tại các khoa/phòng trong Bệnh viện',
    colYes: 'Đạt chuẩn',
    colNo: 'Không đạt',
    unit: '%',
    multiplier: 100,
  }),

  // CS11: Ghi chép TD & CSNB
  11: complementConfig({
    sheet1Title: 'Tỷ lệ ghi chép TD & CSNB :',
    sheet2Title: 'Tỷ lệ ghi chép TD & CSNB tại các khoa/phòng trong Bệnh viện',
    colYes: 'Ghi đầy đủ',
    colNo: 'Không đầy đủ',
    unit: '%',
    multiplier: 100,
  }),

  // CS12: Mẫu bệnh phẩm bị từ chối
  12: ratioConfig({
    sheet1Title: 'Tỷ lệ mẫu bệnh phẩm bị từ chối :',
    sheet2Title: 'Tỷ lệ mẫu bệnh phẩm bị từ chối tại các khoa/phòng trong Bệnh viện',
    colTuSo: 'Số mẫu bị từ chối',
    colMauSo: 'Tổng số mẫu gửi',
    colTyLe: 'Tỷ lệ từ chối',
    unit: '%',
    multiplier: 100,
  }),
};

export default INDICATOR_EXPORT_CONFIGS;

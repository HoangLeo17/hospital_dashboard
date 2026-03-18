-- ============================================================
-- Script khởi tạo database MySQL
-- Database: chi_so_danh_gia_benh_vien
-- ============================================================

CREATE DATABASE IF NOT EXISTS chi_so_danh_gia_benh_vien
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chi_so_danh_gia_benh_vien;

-- ============================================================
-- 1. Bảng danh mục khoa phòng
-- ============================================================
CREATE TABLE IF NOT EXISTS bang_khoa (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  ten_khoa VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. Bảng danh mục chỉ số chất lượng
-- ============================================================
CREATE TABLE IF NOT EXISTS bang_chi_so (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  ma_chi_so         VARCHAR(50)  NOT NULL,
  ten_chi_so        VARCHAR(500) NOT NULL,
  don_vi_tinh       VARCHAR(100) NOT NULL,
  chi_tieu_mong_doi DECIMAL(10,2),
  loai_so_sanh      ENUM('>=', '<=', '>', '<'),
  mo_ta             TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. Bảng mapping: khoa nào áp dụng chỉ số nào
-- ============================================================
CREATE TABLE IF NOT EXISTS khoa_chi_so (
  khoa_id   INT NOT NULL,
  chi_so_id INT NOT NULL,
  PRIMARY KEY (khoa_id, chi_so_id),
  FOREIGN KEY (khoa_id)   REFERENCES bang_khoa(id)    ON DELETE CASCADE,
  FOREIGN KEY (chi_so_id) REFERENCES bang_chi_so(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. Bảng dữ liệu nhập thực tế theo tháng/năm
-- ============================================================
CREATE TABLE IF NOT EXISTS bang_du_lieu_chi_so (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  id_chi_so INT NOT NULL,
  id_khoa   INT NOT NULL,
  nam       SMALLINT    NOT NULL,
  thang     TINYINT     NOT NULL CHECK (thang BETWEEN 1 AND 12),
  tu_so     DECIMAL(15,4) NOT NULL DEFAULT 0,
  mau_so    DECIMAL(15,4) NOT NULL DEFAULT 0,
  ngay_nhap DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_chi_so) REFERENCES bang_chi_so(id) ON DELETE CASCADE,
  FOREIGN KEY (id_khoa)   REFERENCES bang_khoa(id)   ON DELETE CASCADE,
  UNIQUE KEY uq_chi_so_khoa_ky (id_chi_so, id_khoa, nam, thang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA mẫu (có thể xóa nếu đã có dữ liệu riêng)
-- ============================================================

-- Khoa phòng
INSERT IGNORE INTO bang_khoa (id, ten_khoa) VALUES
(1,  'Khoa Hồi sức tích cực'),
(2,  'Khoa Ngoại'),
(3,  'Khoa Nội'),
(4,  'Khoa Sản'),
(5,  'Khoa Nhi'),
(6,  'Khoa Cấp cứu'),
(7,  'Khoa Truyền nhiễm'),
(8,  'Khoa Phẫu thuật'),
(9,  'Khoa Xét nghiệm'),
(10, 'Khoa Chẩn đoán hình ảnh');

-- Chỉ số chất lượng
INSERT IGNORE INTO bang_chi_so (id, ma_chi_so, ten_chi_so, don_vi_tinh, chi_tieu_mong_doi, loai_so_sanh, mo_ta) VALUES
(1, 'VSBT',  'Tỷ lệ vệ sinh bàn tay đúng quy trình',                           '%', 80,   '>=', 'Vệ sinh bàn tay 5 thời điểm'),
(2, 'VPCM',  'Tỷ lệ mắc viêm phổi liên quan thở máy (VAP)',                    '‰', 1,    '<=', 'Trên 1000 ngày thở máy'),
(3, 'NKH',   'Tỷ lệ mắc nhiễm khuẩn huyết liên quan đường truyền trung tâm',  '‰', 1,    '<=', 'Trên 1000 ngày catheter'),
(4, 'NKTN',  'Tỷ lệ mắc nhiễm khuẩn tiết niệu liên quan catheter tiểu',       '‰', 1,    '<=', 'Trên 1000 ngày catheter tiểu'),
(5, 'PTAM',  'Tỷ lệ phẫu thuật an toàn (bảng kiểm)',                           '%', 95,   '>=', 'Sử dụng bảng kiểm phẫu thuật an toàn');

-- Mapping khoa - chỉ số
INSERT IGNORE INTO khoa_chi_so (khoa_id, chi_so_id) VALUES
-- VSBT áp dụng tất cả khoa
(1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),
-- VPCM chỉ cho ICU và Cấp cứu
(1,2),(6,2),
-- NKH cho ICU, Ngoại, Cấp cứu
(1,3),(2,3),(6,3),
-- NKTN cho ICU, Nội, Sản
(1,4),(3,4),(4,4),
-- PTAM chỉ Ngoại và Phẫu thuật
(2,5),(8,5);

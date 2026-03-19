import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <button className="mobile-toggle" onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>

      <aside className={`sidebar ${isOpen ? 'show' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand text-decoration-none">
            <img src="/logo/auth-logo.svg" alt="Logo Bệnh viện Đa khoa Ninh Thuận" />
          </Link>
        </div>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              <i className="bi bi-grid-1x2-fill"></i> Tổng quan Dashboard
            </Link>
          </li>
          <li className="nav-item mt-3 mb-2 px-3 text-uppercase" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>
            Chỉ số chi tiết
          </li>
          <li className="nav-item">
            <Link to="/vesinhtay" className={`nav-link ${isActive('/vesinhtay')}`}>
              <i className="bi bi-droplet-fill"></i> 1. Tuân thủ vệ sinh tay
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/viemphoi" className={`nav-link ${isActive('/viemphoi')}`}>
              <i className="bi bi-lungs-fill"></i> 2. Viêm phổi thở máy
            </Link>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-bandaid-fill"></i> 3. Loét do tỳ đè
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-megaphone-fill"></i> 4. Truyền thông GDSK
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-clipboard2-pulse-fill"></i> 5. Chuẩn bị NB trước mổ
            </a>
          </li>
          <li className="nav-item">
            <Link to="/namduongthuoc" className={`nav-link ${isActive('/namduongthuoc')}`}>
              <i className="bi bi-capsule"></i> 6. 05 đúng dùng thuốc
            </Link>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-people-fill"></i> 7. Bàn giao NB chăm sóc
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-person-walking"></i> 8. Đi buồng ĐDTK
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-exclamation-triangle-fill"></i> 9. Thuốc cảnh báo cao
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-activity"></i> 10. Chăm sóc catheter TM
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-journal-medical"></i> 11. Ghi chép TD & CSNB
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-x-circle-fill"></i> 12. Mẫu bệnh phẩm bị từ chối
            </a>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;

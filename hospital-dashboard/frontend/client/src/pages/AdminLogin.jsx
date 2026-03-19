import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../utils/adminApi';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } = await adminLogin(password);
      sessionStorage.setItem('admin_token', token);
      navigate('/admin/panel');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}>
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: 420, borderRadius: 16 }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: 28 }}></i>
            </div>
            <h4 className="fw-bold mb-1">Quản trị hệ thống</h4>
            <p className="text-muted small mb-0">Nhập mật khẩu admin để truy cập</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold">Mật khẩu</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-key-fill"></i></span>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-lg w-100 text-white fw-semibold"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Đang xác thực...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-2"></i>Đăng nhập</>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/" className="text-muted text-decoration-none small">
              <i className="bi bi-arrow-left me-1"></i>Quay lại Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

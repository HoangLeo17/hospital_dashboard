import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  verifyAdminToken,
  getKhoa, createKhoa, updateKhoa, deleteKhoa,
  getChiSo, createChiSo, updateChiSo, deleteChiSo,
  getKhoaChiSo, createKhoaChiSo, deleteKhoaChiSo,
  getDuLieu, createDuLieu, updateDuLieu, deleteDuLieu,
} from '../utils/adminApi';

/* ================================================================
   Reusable: Confirmation Modal
   ================================================================ */
const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)' }} onClick={onCancel}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title"><i className="bi bi-exclamation-triangle-fill me-2"></i>{title}</h5>
            <button className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>
          <div className="modal-body">{message}</div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>Huỷ</button>
            <button className="btn btn-danger" onClick={onConfirm}>Xoá</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   Toast notification
   ================================================================ */
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  if (!msg) return null;
  const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
  return (
    <div className={`alert alert-${type} alert-dismissible position-fixed shadow`} role="alert"
      style={{ top: 20, right: 20, zIndex: 9999, minWidth: 300 }}>
      <i className={`bi ${icon} me-2`}></i>{msg}
      <button className="btn-close" onClick={onClose}></button>
    </div>
  );
};

/* ================================================================
   TAB 1: bang_khoa
   ================================================================ */
const KhoaTab = ({ toast }) => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ ten_khoa: '' });
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState({ show: false, id: null });

  const load = useCallback(async () => { setRows(await getKhoa()); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      if (editId) {
        await updateKhoa(editId, form);
        toast('Cập nhật khoa thành công!', 'success');
      } else {
        await createKhoa(form);
        toast('Thêm khoa thành công!', 'success');
      }
      setForm({ ten_khoa: '' }); setEditId(null); load();
    } catch (e) { toast(e.response?.data?.error || 'Lỗi!', 'danger'); }
  };

  const handleDelete = async () => {
    try {
      await deleteKhoa(confirm.id);
      toast('Xoá khoa thành công!', 'success');
      setConfirm({ show: false, id: null }); load();
    } catch (e) { toast(e.response?.data?.error || 'Lỗi!', 'danger'); setConfirm({ show: false, id: null }); }
  };

  return (
    <>
      <ConfirmModal show={confirm.show} title="Xoá khoa" message="Bạn có chắc chắn muốn xoá khoa này?" onConfirm={handleDelete} onCancel={() => setConfirm({ show: false, id: null })} />

      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title mb-3">{editId ? 'Sửa khoa' : 'Thêm khoa mới'}</h6>
          <div className="row g-2 align-items-end">
            <div className="col-md-8">
              <label className="form-label small">Tên khoa</label>
              <input className="form-control" value={form.ten_khoa} onChange={(e) => setForm({ ten_khoa: e.target.value })} placeholder="Nhập tên khoa..." />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button className="btn btn-primary flex-fill" onClick={handleSave}>
                <i className={`bi ${editId ? 'bi-pencil-square' : 'bi-plus-circle'} me-1`}></i>{editId ? 'Cập nhật' : 'Thêm'}
              </button>
              {editId && <button className="btn btn-outline-secondary" onClick={() => { setEditId(null); setForm({ ten_khoa: '' }); }}>Huỷ</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead className="table-dark">
              <tr><th width="60">ID</th><th>Tên khoa</th><th width="140" className="text-center">Hành động</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.ten_khoa}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setEditId(r.id); setForm({ ten_khoa: r.ten_khoa }); }}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ show: true, id: r.id })}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-4">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

/* ================================================================
   TAB 2: bang_chi_so
   ================================================================ */
const ChiSoTab = ({ toast }) => {
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ma_chi_so: '', ten_chi_so: '', don_vi_tinh: '%', chi_tieu_mong_doi: 0, loai_so_sanh: '<=' });
  const [confirm, setConfirm] = useState({ show: false, id: null });

  const load = useCallback(async () => { setRows(await getChiSo()); }, []);
  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setEditId(null); setForm({ ma_chi_so: '', ten_chi_so: '', don_vi_tinh: '%', chi_tieu_mong_doi: 0, loai_so_sanh: '<=' }); };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateChiSo(editId, form);
        toast('Cập nhật chỉ số thành công!', 'success');
      } else {
        await createChiSo(form);
        toast('Thêm chỉ số thành công!', 'success');
      }
      resetForm(); load();
    } catch (e) { toast(e.response?.data?.error || 'Lỗi!', 'danger'); }
  };

  const handleDelete = async () => {
    try {
      await deleteChiSo(confirm.id);
      toast('Xoá chỉ số thành công!', 'success');
      setConfirm({ show: false, id: null }); load();
    } catch (e) { toast(e.response?.data?.error || 'Lỗi!', 'danger'); setConfirm({ show: false, id: null }); }
  };

  return (
    <>
      <ConfirmModal show={confirm.show} title="Xoá chỉ số" message="Bạn có chắc chắn muốn xoá chỉ số này?" onConfirm={handleDelete} onCancel={() => setConfirm({ show: false, id: null })} />

      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title mb-3">{editId ? 'Sửa chỉ số' : 'Thêm chỉ số mới'}</h6>
          <div className="row g-2 align-items-end">
            <div className="col-md-2">
              <label className="form-label small">Mã chỉ số</label>
              <input className="form-control" value={form.ma_chi_so} onChange={(e) => setForm({ ...form, ma_chi_so: e.target.value })} placeholder="CS1" />
            </div>
            <div className="col-md-4">
              <label className="form-label small">Tên chỉ số</label>
              <input className="form-control" value={form.ten_chi_so} onChange={(e) => setForm({ ...form, ten_chi_so: e.target.value })} placeholder="Tên chỉ số..." />
            </div>
            <div className="col-md-1">
              <label className="form-label small">Đơn vị</label>
              <input className="form-control" value={form.don_vi_tinh} onChange={(e) => setForm({ ...form, don_vi_tinh: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Chỉ tiêu</label>
              <input type="number" step="any" className="form-control" value={form.chi_tieu_mong_doi} onChange={(e) => setForm({ ...form, chi_tieu_mong_doi: e.target.value })} />
            </div>
            <div className="col-md-1">
              <label className="form-label small">So sánh</label>
              <select className="form-select" value={form.loai_so_sanh} onChange={(e) => setForm({ ...form, loai_so_sanh: e.target.value })}>
                <option value="<=">&le;</option>
                <option value=">=">&ge;</option>
              </select>
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button className="btn btn-primary flex-fill" onClick={handleSave}>
                <i className={`bi ${editId ? 'bi-pencil-square' : 'bi-plus-circle'} me-1`}></i>{editId ? 'Cập nhật' : 'Thêm'}
              </button>
              {editId && <button className="btn btn-outline-secondary" onClick={resetForm}>Huỷ</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover table-striped mb-0">
            <thead className="table-dark">
              <tr><th width="50">ID</th><th width="80">Mã</th><th>Tên chỉ số</th><th width="70">Đơn vị</th><th width="90">Chỉ tiêu</th><th width="80">So sánh</th><th width="140" className="text-center">Hành động</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td><span className="badge bg-info">{r.ma_chi_so}</span></td>
                  <td>{r.ten_chi_so}</td>
                  <td>{r.don_vi_tinh}</td>
                  <td>{r.chi_tieu_mong_doi}</td>
                  <td>{r.loai_so_sanh}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setEditId(r.id); setForm({ ma_chi_so: r.ma_chi_so, ten_chi_so: r.ten_chi_so, don_vi_tinh: r.don_vi_tinh, chi_tieu_mong_doi: r.chi_tieu_mong_doi, loai_so_sanh: r.loai_so_sanh }); }}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ show: true, id: r.id })}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-4">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

/* ================================================================
   TAB 3: khoa_chi_so  (Mapping)
   ================================================================ */
const MappingTab = ({ toast }) => {
  const [rows, setRows] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [chiSoList, setChiSoList] = useState([]);
  const [form, setForm] = useState({ khoa_id: '', chi_so_id: '' });
  const [confirm, setConfirm] = useState({ show: false, id: null });
  const [filterChiSo, setFilterChiSo] = useState('');

  const load = useCallback(async () => {
    const [mappings, khoa, chiSo] = await Promise.all([getKhoaChiSo(), getKhoa(), getChiSo()]);
    setRows(mappings); setKhoaList(khoa); setChiSoList(chiSo);
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    try {
      await createKhoaChiSo(form);
      toast('Thêm liên kết thành công!', 'success');
      setForm({ khoa_id: '', chi_so_id: '' }); load();
    } catch (e) { toast(e.response?.data?.error || 'Lỗi!', 'danger'); }
  };

  const handleDelete = async () => {
    try {
      await deleteKhoaChiSo(confirm.id);
      toast('Xoá liên kết thành công!', 'success');
      setConfirm({ show: false, id: null }); load();
    } catch (e) { toast(e.response?.data?.error || 'Lỗi!', 'danger'); setConfirm({ show: false, id: null }); }
  };

  const filtered = filterChiSo ? rows.filter((r) => String(r.chi_so_id) === filterChiSo) : rows;

  return (
    <>
      <ConfirmModal show={confirm.show} title="Xoá liên kết" message="Bạn có chắc chắn muốn xoá liên kết khoa – chỉ số này?" onConfirm={handleDelete} onCancel={() => setConfirm({ show: false, id: null })} />

      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title mb-3">Thêm liên kết Khoa – Chỉ số</h6>
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label small">Chỉ số</label>
              <select className="form-select" value={form.chi_so_id} onChange={(e) => setForm({ ...form, chi_so_id: e.target.value })}>
                <option value="">-- Chọn chỉ số --</option>
                {chiSoList.map((c) => <option key={c.id} value={c.id}>{c.ma_chi_so} – {c.ten_chi_so}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small">Khoa</label>
              <select className="form-select" value={form.khoa_id} onChange={(e) => setForm({ ...form, khoa_id: e.target.value })}>
                <option value="">-- Chọn khoa --</option>
                {khoaList.map((k) => <option key={k.id} value={k.id}>{k.ten_khoa}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary" onClick={handleAdd} disabled={!form.khoa_id || !form.chi_so_id}>
                <i className="bi bi-link-45deg me-1"></i>Thêm liên kết
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between bg-white">
          <span className="fw-semibold">Danh sách liên kết ({filtered.length})</span>
          <select className="form-select form-select-sm" style={{ width: 280 }} value={filterChiSo} onChange={(e) => setFilterChiSo(e.target.value)}>
            <option value="">Tất cả chỉ số</option>
            {chiSoList.map((c) => <option key={c.id} value={c.id}>{c.ma_chi_so} – {c.ten_chi_so}</option>)}
          </select>
        </div>
        <div className="table-responsive" style={{ maxHeight: 500, overflowY: 'auto' }}>
          <table className="table table-hover table-striped mb-0">
            <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
              <tr><th width="50">ID</th><th>Chỉ số</th><th>Khoa</th><th width="100" className="text-center">Hành động</th></tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td><span className="badge bg-info">{r.ma_chi_so}</span> {r.ten_chi_so}</td>
                  <td>{r.ten_khoa}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ show: true, id: r.id })}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

/* ================================================================
   TAB 4: bang_du_lieu_chi_so  (Data entries)
   ================================================================ */
const DuLieuTab = ({ toast }) => {
  const [rows, setRows] = useState([]);
  const [khoaList, setKhoaList] = useState([]);
  const [chiSoList, setChiSoList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ id_chi_so: '', id_khoa: '', nam: new Date().getFullYear(), thang: new Date().getMonth() + 1, tu_so: 0, mau_so: 0 });
  const [filter, setFilter] = useState({ chi_so_id: '', khoa_id: '', nam: new Date().getFullYear() });
  const [confirm, setConfirm] = useState({ show: false, id: null });

  const loadMeta = useCallback(async () => {
    const [khoa, chiSo] = await Promise.all([getKhoa(), getChiSo()]);
    setKhoaList(khoa); setChiSoList(chiSo);
  }, []);

  const loadData = useCallback(async () => {
    const params = {};
    if (filter.chi_so_id) params.chi_so_id = filter.chi_so_id;
    if (filter.khoa_id) params.khoa_id = filter.khoa_id;
    if (filter.nam) params.nam = filter.nam;
    setRows(await getDuLieu(params));
  }, [filter]);

  useEffect(() => { loadMeta(); }, [loadMeta]);
  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => { setEditId(null); setForm({ id_chi_so: '', id_khoa: '', nam: new Date().getFullYear(), thang: new Date().getMonth() + 1, tu_so: 0, mau_so: 0 }); };

  const handleSave = async () => {
    try {
      if (editId) {
        await updateDuLieu(editId, { tu_so: form.tu_so, mau_so: form.mau_so, nam: form.nam, thang: form.thang });
        toast('Cập nhật dữ liệu thành công!', 'success');
      } else {
        await createDuLieu(form);
        toast('Thêm dữ liệu thành công!', 'success');
      }
      resetForm(); loadData();
    } catch (e) { toast(e.response?.data?.error || 'Lỗi!', 'danger'); }
  };

  const handleDelete = async () => {
    try {
      await deleteDuLieu(confirm.id);
      toast('Xoá dữ liệu thành công!', 'success');
      setConfirm({ show: false, id: null }); loadData();
    } catch (e) { toast(e.response?.data?.error || 'Lỗi!', 'danger'); setConfirm({ show: false, id: null }); }
  };

  return (
    <>
      <ConfirmModal show={confirm.show} title="Xoá dữ liệu" message="Bạn có chắc chắn muốn xoá bản ghi dữ liệu này?" onConfirm={handleDelete} onCancel={() => setConfirm({ show: false, id: null })} />

      {/* Add / Edit form */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title mb-3">{editId ? 'Sửa dữ liệu' : 'Thêm dữ liệu mới'}</h6>
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label small">Chỉ số</label>
              <select className="form-select" value={form.id_chi_so} onChange={(e) => setForm({ ...form, id_chi_so: e.target.value })} disabled={!!editId}>
                <option value="">-- Chọn --</option>
                {chiSoList.map((c) => <option key={c.id} value={c.id}>{c.ma_chi_so}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Khoa</label>
              <select className="form-select" value={form.id_khoa} onChange={(e) => setForm({ ...form, id_khoa: e.target.value })} disabled={!!editId}>
                <option value="">-- Chọn --</option>
                {khoaList.map((k) => <option key={k.id} value={k.id}>{k.ten_khoa}</option>)}
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label small">Năm</label>
              <input type="number" className="form-control" value={form.nam} onChange={(e) => setForm({ ...form, nam: e.target.value })} />
            </div>
            <div className="col-md-1">
              <label className="form-label small">Tháng</label>
              <input type="number" min="1" max="12" className="form-control" value={form.thang} onChange={(e) => setForm({ ...form, thang: e.target.value })} />
            </div>
            <div className="col-md-1">
              <label className="form-label small">Tử số</label>
              <input type="number" step="any" className="form-control" value={form.tu_so} onChange={(e) => setForm({ ...form, tu_so: e.target.value })} />
            </div>
            <div className="col-md-1">
              <label className="form-label small">Mẫu số</label>
              <input type="number" step="any" className="form-control" value={form.mau_so} onChange={(e) => setForm({ ...form, mau_so: e.target.value })} />
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button className="btn btn-primary flex-fill" onClick={handleSave}>
                <i className={`bi ${editId ? 'bi-pencil-square' : 'bi-plus-circle'} me-1`}></i>{editId ? 'Cập nhật' : 'Thêm'}
              </button>
              {editId && <button className="btn btn-outline-secondary" onClick={resetForm}>Huỷ</button>}
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="row g-2 align-items-center">
            <div className="col-auto"><span className="fw-semibold small"><i className="bi bi-funnel me-1"></i>Lọc:</span></div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filter.chi_so_id} onChange={(e) => setFilter({ ...filter, chi_so_id: e.target.value })}>
                <option value="">Tất cả chỉ số</option>
                {chiSoList.map((c) => <option key={c.id} value={c.id}>{c.ma_chi_so} – {c.ten_chi_so}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={filter.khoa_id} onChange={(e) => setFilter({ ...filter, khoa_id: e.target.value })}>
                <option value="">Tất cả khoa</option>
                {khoaList.map((k) => <option key={k.id} value={k.id}>{k.ten_khoa}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control form-control-sm" placeholder="Năm" value={filter.nam} onChange={(e) => setFilter({ ...filter, nam: e.target.value })} />
            </div>
            <div className="col-auto">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setFilter({ chi_so_id: '', khoa_id: '', nam: '' })}><i className="bi bi-arrow-counterclockwise me-1"></i>Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="card">
        <div className="card-header bg-white d-flex align-items-center justify-content-between">
          <span className="fw-semibold">Dữ liệu ({rows.length} bản ghi)</span>
        </div>
        <div className="table-responsive" style={{ maxHeight: 500, overflowY: 'auto' }}>
          <table className="table table-hover table-striped mb-0 small">
            <thead className="table-dark" style={{ position: 'sticky', top: 0 }}>
              <tr>
                <th width="50">ID</th><th>Chỉ số</th><th>Khoa</th><th width="60">Năm</th><th width="60">Tháng</th>
                <th width="90">Tử số</th><th width="90">Mẫu số</th><th width="90">Tỷ lệ</th><th width="140" className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const rate = Number(r.mau_so) ? ((Number(r.tu_so) / Number(r.mau_so)) * 100).toFixed(2) : '—';
                return (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td><span className="badge bg-info">{r.ma_chi_so}</span></td>
                    <td>{r.ten_khoa}</td>
                    <td>{r.nam}</td>
                    <td>{r.thang}</td>
                    <td>{Number(r.tu_so)}</td>
                    <td>{Number(r.mau_so)}</td>
                    <td>{rate !== '—' ? `${rate}%` : rate}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setEditId(r.id); setForm({ id_chi_so: r.id_chi_so, id_khoa: r.id_khoa, nam: r.nam, thang: r.thang, tu_so: Number(r.tu_so), mau_so: Number(r.mau_so) }); }}><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirm({ show: true, id: r.id })}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={9} className="text-center text-muted py-4">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

/* ================================================================
   MAIN: AdminPanel
   ================================================================ */
const AdminPanel = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('khoa');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    verifyAdminToken().then(() => setVerified(true)).catch(() => { sessionStorage.removeItem('admin_token'); navigate('/admin'); });
  }, [navigate]);

  const toast = (msg, type) => { setToastMsg(msg); setToastType(type); };

  const handleLogout = () => { sessionStorage.removeItem('admin_token'); navigate('/admin'); };

  if (!verified) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  const tabs = [
    { key: 'khoa', icon: 'bi-building', label: 'bang_khoa' },
    { key: 'chiso', icon: 'bi-clipboard-data', label: 'bang_chi_so' },
    { key: 'mapping', icon: 'bi-link-45deg', label: 'khoa_chi_so' },
    { key: 'dulieu', icon: 'bi-database', label: 'bang_du_lieu_chi_so' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Toast msg={toastMsg} type={toastType} onClose={() => setToastMsg('')} />

      {/* Top navbar */}
      <nav className="navbar navbar-dark shadow-sm" style={{ background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }}>
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            <i className="bi bi-shield-lock-fill me-2"></i>Admin Panel – Quản trị CSDL
          </span>
          <div className="d-flex align-items-center gap-3">
            <a href="/" className="btn btn-outline-light btn-sm"><i className="bi bi-house me-1"></i>Dashboard</a>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}><i className="bi bi-box-arrow-right me-1"></i>Đăng xuất</button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4" style={{ maxWidth: 1400 }}>
        {/* Tab pills */}
        <ul className="nav nav-pills mb-4">
          {tabs.map((t) => (
            <li className="nav-item" key={t.key}>
              <button
                className={`nav-link ${tab === t.key ? 'active' : ''}`}
                style={tab !== t.key ? { color: '#212529' } : {}}
                onClick={() => setTab(t.key)}
              >
                <i className={`bi ${t.icon} me-1`}></i>{t.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab content */}
        {tab === 'khoa' && <KhoaTab toast={toast} />}
        {tab === 'chiso' && <ChiSoTab toast={toast} />}
        {tab === 'mapping' && <MappingTab toast={toast} />}
        {tab === 'dulieu' && <DuLieuTab toast={toast} />}
      </div>
    </div>
  );
};

export default AdminPanel;

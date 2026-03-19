import axios from 'axios';

const adminApi = axios.create({
  baseURL: `http://${window.location.hostname}:3000/api/admin`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
adminApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      sessionStorage.removeItem('admin_token');
      window.location.href = '/admin';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const adminLogin = async (password) => {
  const res = await adminApi.post('/login', { password });
  return res.data; // { token }
};

export const verifyAdminToken = async () => {
  const res = await adminApi.get('/verify');
  return res.data;
};

// ── bang_khoa ────────────────────────────────────────────────
export const getKhoa = async () => (await adminApi.get('/khoa')).data;
export const createKhoa = async (data) => (await adminApi.post('/khoa', data)).data;
export const updateKhoa = async (id, data) => (await adminApi.put(`/khoa/${id}`, data)).data;
export const deleteKhoa = async (id) => (await adminApi.delete(`/khoa/${id}`)).data;

// ── bang_chi_so ──────────────────────────────────────────────
export const getChiSo = async () => (await adminApi.get('/chi-so')).data;
export const createChiSo = async (data) => (await adminApi.post('/chi-so', data)).data;
export const updateChiSo = async (id, data) => (await adminApi.put(`/chi-so/${id}`, data)).data;
export const deleteChiSo = async (id) => (await adminApi.delete(`/chi-so/${id}`)).data;

// ── khoa_chi_so ──────────────────────────────────────────────
export const getKhoaChiSo = async () => (await adminApi.get('/khoa-chi-so')).data;
export const createKhoaChiSo = async (data) => (await adminApi.post('/khoa-chi-so', data)).data;
export const deleteKhoaChiSo = async (id) => (await adminApi.delete(`/khoa-chi-so/${id}`)).data;

// ── bang_du_lieu_chi_so ──────────────────────────────────────
export const getDuLieu = async (params) => (await adminApi.get('/du-lieu', { params })).data;
export const createDuLieu = async (data) => (await adminApi.post('/du-lieu', data)).data;
export const updateDuLieu = async (id, data) => (await adminApi.put(`/du-lieu/${id}`, data)).data;
export const deleteDuLieu = async (id) => (await adminApi.delete(`/du-lieu/${id}`)).data;

export default adminApi;

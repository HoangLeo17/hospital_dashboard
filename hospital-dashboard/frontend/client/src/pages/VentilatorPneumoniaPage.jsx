import React, { useState, useEffect } from 'react';
import { getDepartmentsByIndicator, getIndicatorData, postIndicatorData, getIndicators, updateIndicatorTarget, getYears } from '../utils/api';
import DepartmentBarChart from '../components/DepartmentBarChart';
import PageHeader from '../components/PageHeader';

const VentilatorPneumoniaPage = () => {
  const indicatorId = 2; // VPTM
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [entries, setEntries] = useState([]);
  const [yearsList, setYearsList] = useState([]);

  const [targetVal, setTargetVal] = useState(5);
  const [operator, setOperator] = useState('<=');
  const [savingTarget, setSavingTarget] = useState(false);

  // Form State
  const [deptId, setDeptId] = useState('');
  const [month, setMonth] = useState('6');
  const [year, setYear] = useState('');
  const [yesVal, setYesVal] = useState('');
  const [noVal, setNoVal] = useState('');
  const [savingData, setSavingData] = useState(false);

  // Filter 
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    fetchInitData();
  }, []);

  useEffect(() => {
    if (year) {
      fetchDashboardData();
    }
  }, [year]);

  const fetchInitData = async () => {
    try {
      setLoadingDepts(true);
      const [depts, inds, y] = await Promise.all([
        getDepartmentsByIndicator(indicatorId),
        getIndicators(),
        getYears()
      ]);
      setDepartments(depts);
      if (depts.length > 0) setDeptId(String(depts[0].id));
      const ind = inds.find(i => i.id === indicatorId);
      if (ind) {
        setTargetVal(ind.chi_tieu_mong_doi);
        setOperator(ind.loai_so_sanh);
      }
      if (y && y.length > 0) {
        setYearsList(y);
        const latest = Math.max(...y).toString();
        setYear(latest);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingDepts(false); }
  };

  const fetchDashboardData = async () => {
    try {
      const data = await getIndicatorData({ indicator_id: indicatorId, nam: year });
      setEntries(data);
    } catch (err) { console.error(err); }
  };

  const handleSaveTarget = async () => {
    setSavingTarget(true);
    try {
      await updateIndicatorTarget(indicatorId, { chi_tieu_mong_doi: targetVal, loai_so_sanh: operator });
      setTimeout(() => setSavingTarget(false), 1000);
      fetchDashboardData();
    } catch (err) {
      alert("Lỗi");
      setSavingTarget(false);
    }
  };

  const handleAddEntry = async () => {
    const tu_so = parseInt(yesVal); // Số ca VPTM
    const mau_so = parseInt(noVal); // Số ngày thở máy

    if (!deptId || isNaN(tu_so) || isNaN(mau_so) || mau_so === 0) {
      alert("Vui lòng điền thông tin hợp lệ (Tổng số bệnh nhân thở máy phải > 0)!");
      return;
    }

    setSavingData(true);
    try {
      await postIndicatorData({ id_chi_so: indicatorId, id_khoa: deptId, nam: year, thang: month, tu_so, mau_so });
      setYesVal('');
      setNoVal('');
      setTimeout(() => setSavingData(false), 1000);
      fetchDashboardData();
    } catch (err) {
      alert("Lỗi nhập liệu!");
      setSavingData(false);
    }
  };

  // Calculate Data for Charts
  const filteredEntries = filterMonth === 'all' ? entries : entries.filter(e => e.thang.toString() === filterMonth);

  let totalTuSo = 0;
  let totalMauSo = 0;
  filteredEntries.forEach(e => {
    totalTuSo += e.tu_so;
    totalMauSo += e.mau_so;
  });
  const overallRate = totalMauSo > 0 ? Math.round((totalTuSo / totalMauSo) * 100) : 0;

  // Render Logic
  let monthsToRender = filterMonth === 'all' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [parseInt(filterMonth)];

  return (
    <>
      <PageHeader 
        title="2. Viêm phổi thở máy"
        subtitle="Giám sát và đo lường tỷ lệ nhiễm khuẩn liên quan đến thở máy tại các khoa trọng điểm"
        overallRate={overallRate}
        targetVal={targetVal}
        indicatorId={indicatorId}
        indicatorName="Viem_phoi_tho_may"
        year={year}
        entries={entries}
        departments={departments}
        operator={operator}
      />

      <div className="row g-4 mb-4">
        {/* Target Settings */}
        <div className="col-xl-4 col-lg-5">
          <div className="glass-panel h-100" style={{ animation: 'fadeInUp 0.4s ease-out 0.1s both' }}>
            <div className="d-flex align-items-center mb-4 gap-2">
              <div className="kpi-icon icon-blue"><i className="bi bi-bullseye"></i></div>
              <h5 className="mb-0 fw-bold">Thiết lập chỉ tiêu</h5>
            </div>

            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label">Điều kiện</label>
                <select className="form-select" value={operator} onChange={e => setOperator(e.target.value)}>
                  <option value="<=">&lt;= (Nhỏ hơn/bằng)</option>
                  <option value=">=">&gt;= (Lớn hơn/bằng)</option>
                  <option value="<">&lt; (Nhỏ hơn)</option>
                  <option value=">">&gt; (Lớn hơn)</option>
                </select>
              </div>
              <div className="col-sm-6">
                <label className="form-label">Chỉ tiêu (%)</label>
                <div className="input-group">
                  <input type="number" className="form-control" value={targetVal} onChange={e => setTargetVal(parseInt(e.target.value))} />
                  <span className="input-group-text bg-white border-start-0 text-muted">%</span>
                </div>
              </div>
              <div className="col-12 mt-4">
                <button onClick={handleSaveTarget} className={`btn ${savingTarget ? 'btn-success' : 'btn-primary-custom'} w-100 justify-content-center`}>
                  <i className={`bi ${savingTarget ? 'bi-check2' : 'bi-save'}`}></i> {savingTarget ? 'Đã lưu' : 'Lưu thiết lập'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Entry */}
        <div className="col-xl-8 col-lg-7">
          <div className="glass-panel h-100" style={{ animation: 'fadeInUp 0.4s ease-out 0.2s both' }}>
            <div className="d-flex align-items-center mb-4 gap-2">
              <div className="kpi-icon icon-green"><i className="bi bi-pencil-square"></i></div>
              <h5 className="mb-0 fw-bold">Nhập liệu giám sát</h5>
            </div>

            <div className="row g-3">
              <div className="col-md-4 col-sm-6">
                <label className="form-label">Khoa / Phòng</label>
                <select className="form-select" value={deptId} onChange={e => setDeptId(e.target.value)} disabled={loadingDepts}>
                  {loadingDepts ? (
                    <option>Đang tải...</option>
                  ) : departments.length === 0 ? (
                    <option value="">Không có khoa áp dụng</option>
                  ) : (
                    departments.map(d => <option key={d.id} value={d.id}>{d.ten_khoa}</option>)
                  )}
                </select>
              </div>

              <div className="col-md-3 col-sm-6">
                <label className="form-label">Thời gian</label>
                <div className="d-flex gap-2">
                  <select className="form-select px-2" value={month} onChange={e => setMonth(e.target.value)}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>T{m.toString().padStart(2, '0')}</option>)}
                  </select>
                  <select className="form-select px-2" value={year} onChange={e => setYear(e.target.value)} style={{ minWidth: '75px' }}>
                    {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="col-md-5 col-12 ms-auto mt-md-0 mt-3 d-flex flex-column justify-content-end">
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label">Số ca viêm phổi</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-danger"><i className="bi bi-lungs"></i></span>
                      <input type="number" className="form-control border-start-0 ps-0" value={yesVal} onChange={e => setYesVal(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Số BN thở máy</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 text-primary"><i className="bi bi-people-fill"></i></span>
                      <input type="number" className="form-control border-start-0 ps-0" value={noVal} onChange={e => setNoVal(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 mt-4 d-flex justify-content-end">
                <button onClick={handleAddEntry} className="btn btn-primary-custom" style={{ backgroundColor: 'var(--success-color)', minWidth: '150px' }}>
                  <i className={`bi ${savingData ? 'bi-hourglass' : 'bi-plus-lg'}`}></i> {savingData ? 'Đang cập nhật...' : 'Cập nhật dữ liệu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 mt-5">
        <h4 className="fw-bold mb-0">Phân tích chuyên sâu</h4>
        <div className="d-flex gap-2 bg-white p-2 rounded-3 shadow-sm border">
          <select className="form-select form-select-sm border-0 bg-transparent fw-medium" value={year} onChange={e => setYear(e.target.value)} style={{ width: '100px', boxShadow: 'none' }}>
            {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="vr bg-secondary opacity-25"></div>
          <select className="form-select form-select-sm border-0 bg-transparent fw-medium" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 'auto', boxShadow: 'none' }}>
            <option value="all">Hiển thị cả năm</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>Tháng {m.toString().padStart(2, '0')}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <div className="kpi-icon icon-orange" style={{ width: '30px', height: '30px', fontSize: '14px' }}><i className="bi bi-bar-chart-line-fill"></i></div>
          <h6 className="mb-0 fw-bold">Tỷ lệ viêm phổi thở máy (%)</h6>
        </div>
        <div className="d-flex gap-3 text-muted fs-7 fw-medium bg-white px-3 py-2 rounded-3 border shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(46, 204, 113, 0.8)' }}></div> Đạt KPI
          </div>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(231, 76, 60, 0.8)' }}></div> Vượt ngưỡng an toàn
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {monthsToRender.map(m => {
          let mEntries = entries.filter(e => e.thang === m);
          if (mEntries.length === 0 && filterMonth === 'all') return null;

          let labels = [];
          let values = [];

          mEntries.forEach(e => {
            labels.push(e.ten_khoa.substring(0, 15));
            values.push(e.mau_so > 0 ? ((e.tu_so / e.mau_so) * 100).toFixed(1) : 0);
          });

          return (
            <div className="col-xl-6 col-md-12" key={m}>
              <div className="glass-panel h-100" style={{ animation: `fadeInUp 0.5s ease-out 0.4s both` }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold mb-0 text-dark">Thống kê nội bộ Tháng {m.toString().padStart(2, '0')}</h6>
                  <div className="badge bg-light text-dark border p-2">
                    <i className="bi bi-shield-check text-success"></i> Giới hạn: {operator} {targetVal}%
                  </div>
                </div>

                <div className="chart-container" style={{ height: '320px' }}>
                  {mEntries.length === 0 ? (
                    <div className="text-center text-muted mt-5 pt-5">Chưa có dữ liệu</div>
                  ) : (
                    <DepartmentBarChart labels={labels} dataValues={values} targetValue={targetVal} isPercentage={true} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  );
};

export default VentilatorPneumoniaPage;

import React, { useState, useEffect } from 'react';
import { getIndicators, getIndicatorData, getYears } from '../utils/api';
import KpiCard from '../components/KpiCard';

const Dashboard = () => {
  const [indicators, setIndicators] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState('all');
  const [currentQuarter, setCurrentQuarter] = useState('all');
  const [filterType, setFilterType] = useState('month'); // 'month' or 'quarter'
  const [years, setYears] = useState([2026]);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const y = await getYears();
        setYears(y);
        if (y.length > 0) {
          // Set to latest year by default
          const latest = Math.max(...y);
          setCurrentYear(latest);
        }
      } catch(e) { console.error(e); }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [currentYear, currentMonth, currentQuarter, filterType]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const inds = await getIndicators();
      setIndicators(inds);

      let params = { nam: currentYear };
      if (filterType === 'month' && currentMonth !== 'all') {
        params.thang = currentMonth;
      } else if (filterType === 'quarter' && currentQuarter !== 'all') {
        params.quy = currentQuarter;
      }

      const data = await getIndicatorData(params);
      setEntries(data);
    } catch (err) {
      console.error("API Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  const icons = ['bi-droplet-fill', 'bi-lungs', 'bi-bandaid', 'bi-megaphone', 'bi-clipboard2-pulse', 'bi-capsule', 'bi-people', 'bi-person-walking', 'bi-exclamation-triangle', 'bi-activity', 'bi-journal-medical', 'bi-x-circle'];
  const colors = ['icon-blue', 'icon-green', 'icon-red', 'icon-orange'];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard Chỉ số chất lượng</h1>
        <div className="page-subtitle">Theo dõi tỷ lệ đạt chuẩn của 12 tiêu chí chất lượng điều dưỡng</div>
      </div>

      <div className="filter-bar">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-calendar3 text-muted"></i>
          <span className="text-muted fw-medium" style={{ fontSize: '14px' }}>Năm báo cáo:</span>
        </div>

        <div className="btn-group-custom">
          {years.map(year => (
            <button
              key={year}
              className={`btn ${currentYear === year ? 'active' : ''}`}
              onClick={() => setCurrentYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="ms-md-auto d-flex align-items-center gap-3">
          <div className="btn-group-custom">
            <button
              className={`btn ${filterType === 'month' ? 'active' : ''}`}
              onClick={() => { setFilterType('month'); setCurrentQuarter('all'); }}
            >
              Theo Tháng
            </button>
            <button
              className={`btn ${filterType === 'quarter' ? 'active' : ''}`}
              onClick={() => { setFilterType('quarter'); setCurrentMonth('all'); }}
            >
              Theo Quý
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
        {filterType === 'month' ? (
          Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <button
              key={m}
              className={`btn btn-outline-custom ${currentMonth === m ? 'active' : ''}`}
              onClick={() => setCurrentMonth(currentMonth === m ? 'all' : m)}
            >
              T{m.toString().padStart(2, '0')}
            </button>
          ))
        ) : (
          ['Quý I', 'Quý II', 'Quý III', 'Quý IV'].map((q, i) => (
            <button
              key={q}
              className={`btn btn-outline-custom ${currentQuarter === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentQuarter(currentQuarter === i + 1 ? 'all' : i + 1)}
            >
              {q}
            </button>
          ))
        )}
      </div>

      <div className="kpi-grid">
        {loading ? (
          <div className="w-100 py-5 text-center text-muted col-span-full">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          indicators.map((ind, i) => {
            const relatedEntries = entries.filter(e => e.id_chi_so === ind.id);
            let totalTuSo = 0;
            let totalMauSo = 0;

            relatedEntries.forEach(e => {
              totalTuSo += e.tu_so;
              totalMauSo += e.mau_so;
            });

            let rateValue = 0;
            if (totalMauSo > 0) {
              if (ind.don_vi_tinh === '%') {
                rateValue = (totalTuSo / totalMauSo) * 100;
              } else if (ind.don_vi_tinh === '‰') {
                rateValue = (totalTuSo / totalMauSo) * 1000;
              } else {
                rateValue = (totalTuSo / totalMauSo);
              }
            }

            let showRate = rateValue.toFixed(totalMauSo === 0 ? 0 : 1);
            if (showRate.endsWith('.0')) showRate = Math.round(rateValue).toString();

            let target = ind.chi_tieu_mong_doi;
            let pass = false;
            let parsedVal = parseFloat(showRate);

            if (ind.loai_so_sanh === '>=') pass = parsedVal >= target;
            if (ind.loai_so_sanh === '<=') pass = parsedVal <= target;
            if (ind.loai_so_sanh === '>') pass = parsedVal > target;
            if (ind.loai_so_sanh === '<') pass = parsedVal < target;

            if (totalMauSo === 0) pass = true;

            const badgeHtml = totalMauSo === 0
              ? '<div class="status-badge bg-light text-muted border">Chưa có dữ liệu</div>'
              : (pass
                ? '<div class="status-badge ok"><i class="bi bi-check-circle-fill"></i> Đạt</div>'
                : '<div class="status-badge bad"><i class="bi bi-x-circle-fill"></i> Chưa đạt</div>');

            return (
              <KpiCard
                key={ind.id}
                title={ind.ten_chi_so}
                icon={icons[i % icons.length]}
                colorClass={colors[i % colors.length]}
                value={totalMauSo === 0 ? '--' : showRate}
                unit={ind.don_vi_tinh}
                statusHtml={badgeHtml}
                targetHtml={`Mục tiêu: ${ind.loai_so_sanh} ${ind.chi_tieu_mong_doi}${ind.don_vi_tinh}`}
                delay={i * 0.05}
              />
            );
          })
        )}
      </div>
    </>
  );
};

export default Dashboard;

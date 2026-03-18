import React from 'react';

const KpiCard = ({ title, icon, colorClass, value, unit, statusHtml, targetHtml, delay }) => {
  return (
    <div className="kpi-card" style={{ animationDelay: `${delay}s` }}>
      <div className="kpi-header">
        <div className="kpi-title">{title}</div>
        <div className={`kpi-icon ${colorClass}`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      <div className="kpi-body">
        <div className="kpi-value">{value}{unit}</div>
        <div dangerouslySetInnerHTML={{ __html: statusHtml }} />
      </div>
      <div className="kpi-footer">
        <div className="kpi-target">{targetHtml}</div>
      </div>
    </div>
  );
};

export default KpiCard;

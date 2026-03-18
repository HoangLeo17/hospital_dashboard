import React from 'react';
import ReportExport from './ReportExport';

/**
 * PageHeader - Reusable header component for indicator pages.
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  overallRate, 
  targetVal, 
  indicatorName, 
  year, 
  entries, 
  operator,
  unit = '%',
  calcMultiplier = 100
}) => {
  const isPassing = operator === '>=' ? overallRate >= targetVal : overallRate <= targetVal;

  return (
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <h1 className="page-title">{title}</h1>
        <div className="page-subtitle">{subtitle}</div>
      </div>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <ReportExport
          indicatorName={indicatorName}
          year={year}
          entries={entries}
          targetVal={targetVal}
          operator={operator}
          unit={unit}
          calcMultiplier={calcMultiplier}
        />
        <div className={`status-badge ${isPassing ? 'ok' : 'bad'}`} style={{ fontSize: '14px', padding: '8px 16px', borderRadius: '8px' }}>
          {isPassing ? (
            <><i className="bi bi-check-circle-fill"></i> Đang đạt chỉ tiêu toàn viện</>
          ) : (
            <><i className="bi bi-x-circle-fill"></i> Chưa đạt chỉ tiêu</>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

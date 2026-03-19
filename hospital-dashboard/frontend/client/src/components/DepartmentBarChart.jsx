import React from 'react';
import { Bar } from 'react-chartjs-2';

const DepartmentBarChart = ({ labels, dataValues, targetValue, isPercentage, operator = '>=' }) => {

  // Kiểm tra đạt KPI dựa theo operator
  const isPass = (val) => {
    const v = parseFloat(val);
    const t = parseFloat(targetValue);
    if (operator === '>=') return v >= t;
    if (operator === '<=') return v <= t;
    if (operator === '>') return v > t;
    if (operator === '<') return v < t;
    return v >= t;
  };

  const colors = dataValues.map(val =>
    isPass(val) ? 'rgba(67, 97, 238, 0.8)' : 'rgba(231, 76, 60, 0.8)'
  );

  const hoverColors = dataValues.map(val =>
    isPass(val) ? 'rgba(67, 97, 238, 1)' : 'rgba(231, 76, 60, 1)'
  );

  // Thêm điểm phantom để đường line luôn hiển thị dù chỉ có 1 bar
  const lineLabels = labels.length === 1 ? [...labels, ''] : labels;
  const lineData   = Array(lineLabels.length).fill(targetValue);

  const data = {
    labels: lineLabels,
    datasets: [
      {
        label: isPercentage ? "Tỷ lệ tuân thủ (%)" : "Tỷ lệ (‰)",
        data: [...dataValues, ...(labels.length === 1 ? [null] : [])],
        backgroundColor: [...colors, ...(labels.length === 1 ? ['transparent'] : [])],
        hoverBackgroundColor: [...hoverColors, ...(labels.length === 1 ? ['transparent'] : [])],
        borderRadius: 8,
        barThickness: 'flex',
        maxBarThickness: 60,
      },
      {
        type: 'line',
        label: 'Ngưỡng an toàn (KPI)',
        data: lineData,
        borderColor: 'rgba(243, 156, 18, 0.9)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        pointHitRadius: 0,
        spanGaps: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const unit = isPercentage ? '%' : '‰';
            if (context.datasetIndex === 0) return ` Tỷ lệ: ${context.raw}${unit}`;
            return ` Ngưỡng KPI: ${context.raw}${unit}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: isPercentage ? 100 : undefined,
        suggestedMax: isPercentage ? undefined : targetValue * 1.5,
        grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
        title: { 
          display: true, 
          text: isPercentage ? 'Tỷ lệ %' : 'Số ca / 1000', 
          font: { size: 11, family: "'Outfit', sans-serif" } 
        }
      },
      x: { grid: { display: false, drawBorder: false } }
    },
    animation: {
      y: { duration: 800, easing: 'easeOutBounce' }
    }
  };

  return <Bar data={data} options={options} />;
};

export default DepartmentBarChart;

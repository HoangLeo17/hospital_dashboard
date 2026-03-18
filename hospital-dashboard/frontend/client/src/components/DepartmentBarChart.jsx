import React from 'react';
import { Bar } from 'react-chartjs-2';

const DepartmentBarChart = ({ labels, dataValues, targetValue, isPercentage }) => {
  
  const colors = dataValues.map(val => 
    val >= targetValue ? 'rgba(67, 97, 238, 0.8)' : 'rgba(231, 76, 60, 0.8)'
  );
  
  const hoverColors = dataValues.map(val => 
    val >= targetValue ? 'rgba(67, 97, 238, 1)' : 'rgba(231, 76, 60, 1)'
  );

  const data = {
    labels,
    datasets: [
      {
        label: isPercentage ? "Tỷ lệ tuân thủ (%)" : "Tỷ lệ (‰)",
        data: dataValues,
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderRadius: 8,
        barThickness: 'flex',
        maxBarThickness: 60
      },
      {
        type: 'line',
        label: 'Ngưỡng an toàn (KPI)',
        data: Array(labels.length).fill(targetValue),
        borderColor: 'rgba(243, 156, 18, 0.7)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        pointHitRadius: 0
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

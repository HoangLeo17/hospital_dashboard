import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const ProgressDoughnut = ({ value, label }) => {
  const data = {
    labels: ['Đạt', 'Chưa đạt'],
    datasets: [{
      data: [value, 100 - value],
      backgroundColor: ['#4361ee', '#f1f5f9'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const options = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}%`
        }
      }
    }
  };

  return (
    <div className="position-relative" style={{ height: '220px' }}>
      <Doughnut data={data} options={options} />
      <div className="position-absolute top-50 start-50 translate-middle text-center">
        <h3 className="fw-bold mb-0" style={{ color: '#2b2d42' }}>{value}%</h3>
        <span className="text-muted" style={{ fontSize: '12px' }}>{label}</span>
      </div>
    </div>
  );
};

export default ProgressDoughnut;

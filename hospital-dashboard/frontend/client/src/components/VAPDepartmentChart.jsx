import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VAPDepartmentChart = ({ labels, dataValues, targetValue }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Tỷ lệ VAP (%)',
        data: dataValues,
        backgroundColor: dataValues.map(val => 
          val <= targetValue ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)'
        ),
        borderColor: dataValues.map(val => 
          val <= targetValue ? 'rgba(46, 204, 113, 1)' : 'rgba(231, 76, 60, 1)'
        ),
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Ngưỡng KPI',
        data: Array(labels.length).fill(targetValue),
        type: 'line',
        borderColor: 'rgba(52, 152, 219, 0.8)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { callback: (value) => value + '%' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

export default VAPDepartmentChart;

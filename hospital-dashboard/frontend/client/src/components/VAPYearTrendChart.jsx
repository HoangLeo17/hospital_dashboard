import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const VAPYearTrendChart = ({ dataValues, targetValue }) => {
  const months = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T12'];

  const data = {
    labels: months,
    datasets: [
      {
        type: 'bar',
        label: 'Tỷ lệ VAP (%)',
        data: dataValues,
        backgroundColor: 'rgba(67, 97, 238, 0.4)',
        borderColor: 'rgba(67, 97, 238, 1)',
        borderWidth: 1,
        borderRadius: 4,
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'top',
          color: '#4361ee',
          font: { weight: 'bold', size: 11 },
          formatter: (value) => value > 0 ? value + '%' : ''
        }
      },
      {
        type: 'line',
        label: 'Đường xu hướng',
        data: dataValues,
        borderColor: 'rgba(67, 97, 238, 1)',
        borderWidth: 3,
        tension: 0,
        fill: false,
        pointBackgroundColor: 'rgba(67, 97, 238, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        datalabels: { display: false }
      },
      {
        type: 'line',
        label: 'Ngưỡng an toàn (KPI)',
        data: Array(12).fill(targetValue),
        borderColor: 'rgba(231, 76, 60, 0.8)',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        fill: false,
        datalabels: { display: false }
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          font: { family: "'Outfit', sans-serif", size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: 'rgba(67, 97, 238, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}%`
        }
      },
      datalabels: {
        // Global datalabels settings
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        suggestedMax: Math.max(...(dataValues && dataValues.length ? dataValues : [0]), targetValue) * 1.5,
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { callback: (value) => value + '%' }
      },
      x: {
        grid: { display: false }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  return <Chart type="bar" data={data} options={options} />;
};

export default VAPYearTrendChart;

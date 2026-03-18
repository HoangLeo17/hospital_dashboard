import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.jsx'

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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Chart.js Premium Global Settings
ChartJS.defaults.font.family = "'Outfit', sans-serif";
ChartJS.defaults.color = '#8d99ae';
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(26, 29, 36, 0.9)';
ChartJS.defaults.plugins.tooltip.titleFont = { size: 14, family: "'Outfit', sans-serif", weight: 'bold' };
ChartJS.defaults.plugins.tooltip.bodyFont = { size: 13, family: "'Outfit', sans-serif" };
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.displayColors = true;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

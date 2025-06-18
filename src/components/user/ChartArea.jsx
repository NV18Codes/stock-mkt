import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: true,
      text: 'Portfolio Performance',
      color: '#fff',
      font: {
        size: 16
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: '#333'
      },
      ticks: {
        color: '#cce3ff'
      }
    },
    y: {
      grid: {
        color: '#333'
      },
      ticks: {
        color: '#cce3ff',
        callback: (value) => `₹${(value / 1000).toFixed(1)}K`
      }
    }
  }
};

const ChartArea = ({ data = [] }) => {
  const chartData = {
    labels: data.map(point => new Date(point.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Portfolio Value',
        data: data.map(point => point.value),
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div style={{ height: 300, background: '#111', border: '1px solid #007bff', borderRadius: 8, padding: '1em' }}>
      {data && data.length > 0 ? (
        <Line options={options} data={chartData} />
      ) : (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '1.2em' }}>
          No portfolio data available
        </div>
      )}
    </div>
  );
};

export default ChartArea; 
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
      color: '#2c3e50',
      font: {
        size: 'clamp(14px, 3vw, 16px)',
        weight: '600'
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: '#e0e0e0'
      },
      ticks: {
        color: '#2c3e50',
        font: {
          size: 'clamp(10px, 2.2vw, 12px)'
        }
      }
    },
    y: {
      grid: {
        color: '#e0e0e0'
      },
      ticks: {
        color: '#2c3e50',
        font: {
          size: 'clamp(10px, 2.2vw, 12px)'
        },
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
    <div style={{ 
      height: 'clamp(250px, 40vh, 300px)', 
      background: '#ffffff', 
      border: '1px solid #e0e0e0', 
      borderRadius: '8px', 
      padding: 'clamp(0.8em, 2vw, 1em)',
      boxShadow: '0 1px 6px rgba(0,0,0,0.1)'
    }}>
      {data && data.length > 0 ? (
        <Line options={options} data={chartData} />
      ) : (
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#6c757d', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500
        }}>
          No portfolio data available
        </div>
      )}
    </div>
  );
};

export default ChartArea; 
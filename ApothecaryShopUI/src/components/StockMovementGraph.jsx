import React, { useState } from 'react';
import { motion } from 'motion/react';
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
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
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

const StockMovementGraph = ({ stockMovements }) => {
  const [chartType, setChartType] = useState('line');

  // Return early if no data
  if (!stockMovements || stockMovements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-[#F5F7F4]/50 rounded-xl border border-[#16221D]/5 p-8 h-64">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#2D3E37]/20 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-[#2D3E37]/60 font-medium">No stock movement data available to display</p>
      </div>
    );
  }

  // Sort movements by date (ascending)
  const sortedMovements = [...stockMovements].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Prepare data for the chart
  const labels = sortedMovements.map(movement => 
    new Date(movement.createdAt).toLocaleDateString()
  );

  const stockLevels = sortedMovements.map(movement => movement.newStock);
  
  // Prepare data for movement quantity chart (separate incoming and outgoing)
  const incomingData = sortedMovements.map(movement => 
    movement.type === 'in' ? movement.quantity : 0
  );
  
  const outgoingData = sortedMovements.map(movement => 
    movement.type === 'out' ? movement.quantity : 0
  );

  const chartConfigs = {
    line: {
      data: {
        labels,
        datasets: [
          {
            label: 'Stock Level',
            data: stockLevels,
            borderColor: '#4D6E60',
            backgroundColor: 'rgba(77, 110, 96, 0.2)',
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Stock Level Over Time',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const index = context.dataIndex;
                const movement = sortedMovements[index];
                const type = movement.type === 'in' ? 'Added' : 'Removed';
                const quantity = movement.quantity;
                return [
                  `Stock Level: ${movement.newStock}`,
                  `${type}: ${quantity} units`,
                  `Reason: ${movement.reason}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantity'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    },
    bar: {
      data: {
        labels,
        datasets: [
          {
            label: 'Stock Level',
            data: stockLevels,
            backgroundColor: 'rgba(77, 110, 96, 0.7)',
            borderColor: '#4D6E60',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Stock Level Over Time',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Stock Quantity'
            }
          },
        }
      }
    },
    movement: {
      data: {
        labels,
        datasets: [
          {
            label: 'Stock In',
            data: incomingData,
            backgroundColor: 'rgba(77, 110, 96, 0.7)',
            borderColor: '#4D6E60',
            borderWidth: 1,
          },
          {
            label: 'Stock Out',
            data: outgoingData,
            backgroundColor: 'rgba(180, 113, 52, 0.7)',
            borderColor: '#B47134',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Stock Movement Quantities',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantity Changed'
            }
          },
        }
      }
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={chartConfigs.bar.data} options={chartConfigs.bar.options} />;
      case 'movement':
        return <Bar data={chartConfigs.movement.data} options={chartConfigs.movement.options} />;
      case 'line':
      default:
        return <Line data={chartConfigs.line.data} options={chartConfigs.line.options} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#16221D]/5 p-6 mb-8">
      <div className="flex items-center justify-end mb-6">
        <span className="mr-3 text-sm font-semibold text-[#2D3E37] uppercase tracking-wider">View:</span>
        <div className="inline-flex rounded-lg shadow-sm p-1 bg-[#F5F7F4] border border-[#16221D]/5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setChartType('line')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              chartType === 'line' 
                ? 'bg-white text-[#16221D] shadow-sm' 
                : 'text-[#2D3E37]/70 hover:text-[#16221D]'
            }`}
          >
            Line
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              chartType === 'bar' 
                ? 'bg-white text-[#16221D] shadow-sm' 
                : 'text-[#2D3E37]/70 hover:text-[#16221D]'
            }`}
          >
            Bar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setChartType('movement')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              chartType === 'movement' 
                ? 'bg-white text-[#16221D] shadow-sm' 
                : 'text-[#2D3E37]/70 hover:text-[#16221D]'
            }`}
          >
            In/Out
          </motion.button>
        </div>
      </div>
      <div className="h-80">
        {renderChart()}
      </div>
    </div>
  );
};

export default StockMovementGraph;

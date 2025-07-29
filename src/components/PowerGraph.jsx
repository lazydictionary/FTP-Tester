import React, { useMemo, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export default function PowerGraph({ 
  currentFTP, 
  goalFTP,
  testType, 
  elapsedSeconds,
  protocol = null,
  darkMode = false
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const markerRef = useRef(null);

  // Generate static chart data with minute ticks
  const { data, labels } = useMemo(() => {
    const totalMinutes = testType === '20min' ? 20 : 30;
    return {
      data: Array.from({ length: totalMinutes + 1 }, (_, minute) => {
        const seconds = minute * 60;
        if (testType === '20min') {
          return protocol?.calculatePower?.(goalFTP, seconds) ?? goalFTP * 0.95;
        }
        return currentFTP * (minute < 5 ? 0.46 : 0.46 + 0.06 * (minute - 4));
      }),
      labels: Array.from({ length: totalMinutes + 1 }, (_, i) => `${i}:00`)
    };
  }, [testType, currentFTP, goalFTP, protocol]);

  // Initialize chart and marker
  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    // Cleanup function to remove chart and marker
    const cleanup = () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      if (markerRef.current && containerRef.current && markerRef.current.parentNode === containerRef.current) {
        containerRef.current.removeChild(markerRef.current);
        markerRef.current = null;
      }
    };

    // Clean up before creating new chart/marker
    cleanup();

    // Calculate dynamic y-axis min/max
    const maxDataValue = Math.max(...data);
    const minDataValue = Math.min(...data);
    const yAxisPadding = 20; // watts padding
    const yMax = Math.ceil((maxDataValue + yAxisPadding) / 10) * 10;
    const yMin = Math.max(0, Math.floor((minDataValue - yAxisPadding) / 10) * 10);

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Target Power',
          data,
          borderColor: darkMode ? '#66BB6A' : '#4CAF50',
          borderWidth: 3,
          tension: 0,
          stepped: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBorderWidth: 2,
          pointHoverBackgroundColor: darkMode ? '#66BB6A' : '#4CAF50',
          pointHoverBorderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            title: { 
              display: true, 
              text: 'Time (minutes)',
              color: darkMode ? '#b0b0b0' : '#666666'
            },
            min: 0,
            max: testType === '20min' ? 20 : 30,
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: darkMode ? '#b0b0b0' : '#666666',
              stepSize: 1,
              callback: function(value) {
                const minute = typeof value === 'string' ? parseInt(value) : value;
                return minute % 5 === 0 ? `${minute}:00` : '';
              },
              count: testType === '20min' ? 21 : 31,
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0
            }
          },
          y: {
            title: { 
              display: true, 
              text: 'Power (watts)',
              color: darkMode ? '#b0b0b0' : '#666666'
            },
            min: yMin,
            max: yMax,
            grid: {
              color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: darkMode ? '#b0b0b0' : '#666666',
              stepSize: Math.ceil((yMax - yMin) / 10)
            }
          }
        },
        plugins: { 
          legend: { display: false },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            titleColor: darkMode ? '#ffffff' : '#1a1a1a',
            bodyColor: darkMode ? '#ffffff' : '#1a1a1a',
            borderColor: darkMode ? '#404040' : '#e0e0e0',
            borderWidth: 2,
            bodyFont: {
              size: 14,
              weight: 'bold'
            },
            titleFont: {
              size: 20,
              weight: 'normal'
            },
            padding: 8,
            cornerRadius: 8,  
            callbacks: {
              label: () => null,
              beforeTitle: (context) => {
                const powerValue = Math.round(context[0].parsed.y);
                return `Power: ${powerValue} watts`;
              },
              title: (context) => {
                return `Time: ${context[0].label}`;
              },
            },
            displayColors: false,
            boxWidth: 20,
            boxHeight: 20,
            caretSize: 12
          }
        }
      }
  });

    // Always create a new marker after cleanup
    if (containerRef.current) {
      markerRef.current = document.createElement('div');
      markerRef.current.style.position = 'absolute';
      markerRef.current.style.width = '2px';
      markerRef.current.style.backgroundColor = 'red';
      markerRef.current.style.zIndex = '10';
      markerRef.current.style.pointerEvents = 'none';
      markerRef.current.style.display = 'none';
      containerRef.current.appendChild(markerRef.current);
    }

    return cleanup;
  }, [data, labels, currentFTP, testType, darkMode]);

  // Update marker position
  useEffect(() => {
    if (!markerRef.current || !chartRef.current || !containerRef.current) return;

    const chart = chartRef.current;
    const totalDuration = testType === '20min' ? 1200 : 1800;
    const progress = Math.min(elapsedSeconds / totalDuration, 1);
    
    if (chart.chartArea) {
      const chartArea = chart.chartArea;
      const markerPosition = chartArea.left + (chartArea.right - chartArea.left) * progress;
      
      markerRef.current.style.left = `${markerPosition}px`;
      markerRef.current.style.top = `${chartArea.top}px`;
      markerRef.current.style.height = `${chartArea.bottom - chartArea.top}px`;
      markerRef.current.style.display = 'block';
    }
  }, [elapsedSeconds, testType]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '300px',
        position: 'relative'
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
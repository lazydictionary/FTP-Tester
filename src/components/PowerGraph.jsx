import React, { useMemo, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export default function PowerGraph({ 
  currentFTP, 
  goalFTP,
  testType, 
  elapsedSeconds 
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const markerRef = useRef(null);

  // Generate static chart data with minute ticks
  const { data, labels } = useMemo(() => {
    const totalMinutes = testType === '20min' ? 20 : 30;
    const data = [];
    const labels = [];
    
    for (let minute = 0; minute <= totalMinutes; minute++) {
      const power = testType === '20min' 
        ? goalFTP * 0.95 
        : currentFTP * (minute < 5 ? 0.46 : 0.46 + 0.06 * (minute - 4));
      
      data.push(power);
      labels.push(minute % 5 === 0 ? `${minute}:00` : '');
    }
    
    return { data, labels };
  }, [testType, currentFTP, goalFTP]);

  // Initialize chart and marker
  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    // Clear previous chart if exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Clear previous marker if exists
    if (markerRef.current && containerRef.current) {
      containerRef.current.removeChild(markerRef.current);
    }

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Target Power',
          data,
          borderColor: '#4CAF50',
          borderWidth: 3,
          tension: 0,
          stepped: true,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
            x: {
                title: { display: true, text: 'Time (minutes)' },
                min: 0,
                max: testType === '20min' ? 20 : 30,
                ticks: {
                // Force ticks at every minute
                stepSize: 1,
                // Only show labels at 5-minute intervals
                callback: function(value) {
                    // Convert value to index (since value might be string)
                    const minute = typeof value === 'string' ? parseInt(value) : value;
                    return minute % 5 === 0 ? `${minute}:00` : '';
                },
                // Ensure we have enough ticks
                count: testType === '20min' ? 21 : 31, // 0-20 or 0-30 inclusive
                // Additional settings to prevent auto-skipping
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
                }
            },
            y: {
                title: { display: true, text: 'Power (watts)' },
                min: 0,
                max: currentFTP * 2.5
            }
            },
        plugins: { 
          legend: { display: false }
        }
      }
    });

    // Create new marker
    markerRef.current = document.createElement('div');
    markerRef.current.style.position = 'absolute';
    markerRef.current.style.width = '2px';
    markerRef.current.style.backgroundColor = 'red';
    markerRef.current.style.zIndex = '10';
    markerRef.current.style.pointerEvents = 'none';
    containerRef.current.appendChild(markerRef.current);

    return () => {
      if (chartRef.current) chartRef.current.destroy();
      if (markerRef.current && containerRef.current) {
        containerRef.current.removeChild(markerRef.current);
      }
    };
  }, [data, labels, currentFTP, testType]);

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
        height: '250px',
        position: 'relative'
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
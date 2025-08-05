import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { Chart } from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(annotationPlugin);

const ZONE_COLORS = {
  light: {
    1: '#C0C0FC', // < 55%
    2: '#98DCFF', // 56-75%
    3: '#84ECD2', // 76-90%
    4: '#D1EB84', // 91-105%
    5: '#FDE18C', // 106-120%
    6: '#FDC298', // 121-150%
    7: '#E79AA0'  // > 151%
  },
  dark: {
    1: '#C0C0FC', // < 55%
    2: '#98DCFF', // 56-75%
    3: '#84ECD2', // 76-90%
    4: '#D1EB84', // 91-105%
    5: '#FDE18C', // 106-120%
    6: '#FDC298', // 121-150%
    7: '#E79AA0'  // > 151%
  }
};

const ZONE_THRESHOLDS = [
  { min: 0.20, max: 0.55},
  { min: 0.55, max: 0.75}, 
  { min: 0.75, max: 0.90},
  { min: 0.90, max: 1.05}, 
  { min: 1.05, max: 1.20}, 
  { min: 1.20, max: 1.50},
  { min: 1.50, max: Infinity}
];

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
  const staticMarkerRef = useRef({ line: null, label: null });

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

  const updateStaticMarker = useCallback(() => {
    if (!chartRef.current || !containerRef.current || testType === '20min') {
      return;
    }

    const chart = chartRef.current;
    if (!chart.chartArea) return;

    // Remove existing markers if they exist
    const existingLine = containerRef.current?.querySelector('.static-marker');
    const existingLabel = containerRef.current?.querySelector('.static-marker-label');

    if (existingLine?.parentNode) existingLine.parentNode.removeChild(existingLine);
    if (existingLabel?.parentNode) existingLabel.parentNode.removeChild(existingLabel);

    const chartArea = chart.chartArea;
    const xPosition = chartArea.left + (chartArea.right - chartArea.left) * (19.5 / 30);

    // Create vertical line marker
    const markerLine = document.createElement('div');
    markerLine.className = 'static-marker';
    markerLine.style.position = 'absolute';
    markerLine.style.left = `${xPosition}px`;
    markerLine.style.top = `${chartArea.top}px`;
    markerLine.style.width = '2px';
    markerLine.style.height = `${chartArea.bottom - chartArea.top}px`;
    markerLine.style.backgroundColor = darkMode ? '#FFA726' : '#FF7043';
    markerLine.style.zIndex = '9';
    markerLine.style.pointerEvents = 'none';

    // Create label
    const markerLabel = document.createElement('div');
    markerLabel.className = 'static-marker-label';
    markerLabel.textContent = 'Current FTP';
    markerLabel.style.position = 'absolute';
    markerLabel.style.left = `${xPosition + 5}px`;
    markerLabel.style.top = `${chartArea.top + 10}px`;
    markerLabel.style.color = darkMode ? '#FFA726' : '#FF7043';
    markerLabel.style.fontSize = '12px';
    markerLabel.style.fontWeight = 'bold';
    markerLabel.style.backgroundColor = darkMode ? 'rgba(45, 45, 45, 0.7)' : 'rgba(255, 255, 255, 0.7)';
    markerLabel.style.padding = '2px 5px';
    markerLabel.style.borderRadius = '3px';
    markerLabel.style.zIndex = '9';
    markerLabel.style.pointerEvents = 'none';

    // Add elements to container
    containerRef.current.appendChild(markerLine);
    containerRef.current.appendChild(markerLabel);

    // Store references
    staticMarkerRef.current = { line: markerLine, label: markerLabel };
  }, [testType, darkMode]);

  // Initialize chart and markers
  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    const cleanup = () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      if (markerRef.current?.parentNode) {
        markerRef.current.parentNode.removeChild(markerRef.current);
      }
      markerRef.current = null;

      if (staticMarkerRef.current.line?.parentNode) {
        staticMarkerRef.current.line.parentNode.removeChild(staticMarkerRef.current.line);
      }
      if (staticMarkerRef.current.label?.parentNode) {
        staticMarkerRef.current.label.parentNode.removeChild(staticMarkerRef.current.label);
      }
      staticMarkerRef.current = { line: null, label: null };
    };

    cleanup();

    const maxDataValue = Math.max(...data);
    const minDataValue = Math.min(...data);
    const yAxisPadding = 20;
    const yMax = Math.ceil((maxDataValue + yAxisPadding) / 10) * 10;
    const yMin = Math.max(0, Math.floor((minDataValue - yAxisPadding) / 10) * 10);

    const ftpValue = testType === '20min' ? goalFTP : currentFTP;
    const zoneColors = darkMode ? ZONE_COLORS.dark : ZONE_COLORS.light;

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
        animation: { 
          duration: 0,
          onComplete: () => {
            setTimeout(updateStaticMarker, 0);
          }
        },
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
          },
          annotation: {
            annotations: ZONE_THRESHOLDS.map((threshold, index) => ({
              type: 'box',
              yMin: ftpValue * threshold.min,
              yMax: ftpValue * threshold.max,
              backgroundColor: `${zoneColors[index + 1]}80`,
              borderWidth: 0,
              drawTime: 'beforeDatasetsDraw',
              xScaleID: 'x',
              yScaleID: 'y',
              label: {
                display: true,
                content: `Zone ${index + 1}`,
                position: {
                  x: 'start',
                  y: 'center'
                },
                xAdjust: 10,
                color: darkMode ? '#d6d5d5ff' : '#676767',
                font: {
                  size: 13,
                  weight: 'bold'
                },
                }
              }
            
          )
        )
      }
    }
  }
});

    // Create moving marker
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
  }, [data, labels, currentFTP, goalFTP, testType, darkMode, updateStaticMarker]);

  // Update moving marker position
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
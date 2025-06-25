import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Thermometer, AlertTriangle, Flame, Droplet,
  Download, Wifi, WifiOff, Clock, Activity, 
  Gauge, ShieldAlert, RefreshCw 
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Legend, 
  Tooltip 
} from 'chart.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import axios from 'axios';
import './AdminSecurity.css';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Legend,
  Tooltip
);

// Constants
const ALERT_TYPES = {
  fire: { icon: Flame, color: 'critical', title: 'Fire Detected!' },
  water: { icon: Droplet, color: 'warning', title: 'Water Leak!' },
  alcohol: { icon: AlertTriangle, color: 'danger', title: 'High Alcohol Level!' },
  temp: { icon: Thermometer, color: 'warning', title: 'High Temperature!' }
};

const TIME_RANGE_OPTIONS = [
  { value: 1, label: 'Last 1 hour' },
  { value: 6, label: 'Last 6 hours' },
  { value: 24, label: 'Last 24 hours' },
  { value: 168, label: 'Last 7 days' }
];

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    console.error('Error Boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Dashboard Error</h2>
          <button onClick={() => window.location.reload()}>
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom WebSocket Hook
const useWebSocket = (url, onMessage, onError) => {
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!isMounted.current || wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log(`Connecting to WebSocket at ${url}`);
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
      onMessage({ type: 'connection', status: 'connected' });
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        onError('Failed to parse WebSocket message');
      }
    };

    wsRef.current.onclose = (e) => {
      console.log(`WebSocket closed (code: ${e.code}, reason: ${e.reason || 'none'})`);
      if (!isMounted.current) return;
      
      // Exponential backoff for reconnection
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectTimer.current = setTimeout(() => {
        if (isMounted.current) {
          reconnectAttempts.current++;
          connect();
        }
      }, delay);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError('WebSocket connection error');
      wsRef.current?.close();
    };
  }, [url, onMessage, onError]);

  useEffect(() => {
    isMounted.current = true;
    connect();
    
    return () => {
      isMounted.current = false;
      wsRef.current?.close();
      clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not open, cannot send data');
    }
  }, []);

  return { send };
};

const AdminSecurity = () => {
  // State management
  const [realTimeData, setRealTimeData] = useState({
    temperature: 0,
    humidity: 0,
    alcohol_level: 0,
    flame_detected: false,
    water_detected: false,
    timestamp: new Date().toISOString()
  });
  
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [timeRange, setTimeRange] = useState(24);
  const [lastUpdated, setLastUpdated] = useState('');

  // WebSocket URL
  const wsUrl = 'ws://localhost:5000/ws';

  // Check for alerts based on sensor data
  const checkForAlerts = useCallback((data) => {
    const newAlerts = [];
    
    if (data.flame_detected) {
      newAlerts.push(createAlert('fire', `Flame sensor triggered`));
    }
    
    if (data.water_detected) {
      newAlerts.push(createAlert('water', `Water sensor activated`));
    }
    
    if (data.alcohol_level > 300) {
      newAlerts.push(createAlert('alcohol', `Alcohol level detected at ${data.alcohol_level}`));
    }
    
    if (data.temperature > 30) {
      newAlerts.push(createAlert('temp', `Temperature reached ${data.temperature}°C`));
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
    }
  }, []);

  const createAlert = (type, message) => ({
    id: Date.now() + Math.random(),
    type,
    title: ALERT_TYPES[type].title,
    message,
    time: new Date().toLocaleTimeString(),
    acknowledged: false
  });
  // WebSocket message handler
  const handleWebSocketMessage = useCallback((message) => {
    if (message.type === 'sensor_update') {
      const newData = {
        ...message.data,
        timestamp: message.timestamp || new Date().toISOString()
      };
      
      setRealTimeData(newData);
      setLastUpdated(new Date().toLocaleTimeString());
      setConnectionStatus('connected');

      setHistoricalData(prev => {
        const newHistory = [...prev, newData];
        return newHistory.slice(-100); // Keep last 100 entries
      });

      checkForAlerts(newData);
    } else if (message.type === 'connection') {
      setConnectionStatus(message.status);
    }
  }, [checkForAlerts]);

  // WebSocket error handler
  const handleWebSocketError = useCallback((errorMsg) => {
    console.error('WebSocket error:', errorMsg);
    setError(errorMsg);
    setConnectionStatus('disconnected');
  }, []);

  // Initialize WebSocket
  const { send } = useWebSocket(
    wsUrl,
    handleWebSocketMessage,
    handleWebSocketError
  );

  const requestData = useCallback(() => {
  send({ type: 'request_data' });
}, [send]);

  

  // Fetch historical data
  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/iot/history', {
        params: { hours: timeRange },
        timeout: 5000
      });
      
      if (response.data?.success) {
        setHistoricalData(response.data.data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load historical data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Export data to CSV
  const exportData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/iot/export', {
        params: { hours: timeRange },
        responseType: 'blob',
        timeout: 10000
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sensor_data_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
      setError(`Export failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Alert management
  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  const acknowledgeAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, acknowledged: true })));
  };

  // Initialize data
  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  // Memoized chart data
  const chartData = useMemo(() => {
    return {
      labels: historicalData.map(d => new Date(d.timestamp).toLocaleTimeString()),
      temperatures: historicalData.map(d => d.temperature),
      humidities: historicalData.map(d => d.humidity),
      alcoholLevels: historicalData.map(d => d.alcohol_level)
    };
  }, [historicalData]);

  // Chart configurations
  const tempHumidityChart = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: chartData.temperatures,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Humidity (%)',
        data: chartData.humidities,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y1',
      }
    ]
  };

  const alcoholChart = {
    labels: chartData.labels,
    datasets: [{
      label: 'Alcohol Level',
      data: chartData.alcoholLevels,
      backgroundColor: 'rgba(255, 159, 64, 0.5)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1
    }]
  };

  const alertDistribution = {
    labels: Object.keys(ALERT_TYPES).map(key => ALERT_TYPES[key].title),
    datasets: [{
      data: Object.keys(ALERT_TYPES).map(type => 
        alerts.filter(a => a.type === type).length
      ),
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(234, 179, 8, 0.7)',
        'rgba(20, 184, 166, 0.7)'
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(234, 179, 8, 1)',
        'rgba(20, 184, 166, 1)'
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: false }
    }
  };

  return (
    <ErrorBoundary>
      <div className="admin-security-container">
        {error && (
          <div className="error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="dashboard-header">
          <div>
            <h1>IoT Security Dashboard</h1>
            <p className="subtitle">
              Real-time monitoring of environmental and security sensors
              {lastUpdated && (
                <span className="last-updated">
                  <Clock size={14} /> Last updated: {lastUpdated}
                </span>
              )}
            </p>
          </div>
          <div className="header-controls">
            <div className={`connection-status ${connectionStatus}`}>
              {connectionStatus === 'connected' ? (
                <><Wifi size={16} /> Connected</>
              ) : (
                <><WifiOff size={16} /> Disconnected</>
              )}
            </div>
            <button className="export-btn" onClick={exportData}>
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>

        <button onClick={requestData}>Refresh Data</button>


        <div className="time-range-selector">
          <label>Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            disabled={loading}
          >
            {TIME_RANGE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Tabs selectedIndex={activeTab} onSelect={setActiveTab}>
          <TabList className="tab-list">
            <Tab className={`tab ${activeTab === 0 ? 'active' : ''}`}>
              <Gauge size={18} /> Dashboard
            </Tab>
            <Tab className={`tab ${activeTab === 1 ? 'active' : ''}`}>
              <Activity size={18} /> Environmental
            </Tab>
            <Tab className={`tab ${activeTab === 2 ? 'active' : ''}`}>
              <ShieldAlert size={18} /> Alerts
              {alerts.filter(a => !a.acknowledged).length > 0 && (
                <span className="alert-badge">
                  {alerts.filter(a => !a.acknowledged).length}
                </span>
              )}
            </Tab>
            <Tab className={`tab ${activeTab === 3 ? 'active' : ''}`}>
              <Clock size={18} /> Historical Data
            </Tab>
          </TabList>

          <TabPanel>
            <DashboardView 
              realTimeData={realTimeData} 
              tempHumidityChart={tempHumidityChart} 
              chartOptions={chartOptions} 
            />
          </TabPanel>

          <TabPanel>
            <EnvironmentalView 
              chartData={chartData}
              alcoholChart={alcoholChart}
              alertDistribution={alertDistribution}
              chartOptions={chartOptions}
            />
          </TabPanel>

          <TabPanel>
            <AlertsView 
              alerts={alerts}
              ALERT_TYPES={ALERT_TYPES}
              acknowledgeAlert={acknowledgeAlert}
              acknowledgeAllAlerts={acknowledgeAllAlerts}
            />
          </TabPanel>

          <TabPanel>
            <HistoricalDataView 
              loading={loading}
              historicalData={historicalData}
            />
          </TabPanel>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

// Sub-components for better organization
const DashboardView = ({ realTimeData, tempHumidityChart, chartOptions }) => (
  <div className="dashboard-grid">
    <div className="status-cards">
      <StatusCard 
        icon={Thermometer}
        title="Temperature"
        value={`${realTimeData.temperature.toFixed(1)}°C`}
        status={getStatusLevel(realTimeData.temperature, [28, 30])}
      />
      <StatusCard 
        icon={Thermometer}
        title="Humidity"
        value={`${realTimeData.humidity.toFixed(1)}%`}
        status={getStatusLevel(realTimeData.humidity, [20, 80], true)}
      />
      <StatusCard 
        icon={Flame}
        title="Alcohol Vapor"
        value={realTimeData.alcohol_level}
        status={getStatusLevel(realTimeData.alcohol_level, [300, 500])}
      />
      <StatusCard 
        icon={AlertTriangle}
        title="Hazard Status"
        value={getHazardStatus(realTimeData)}
        status={realTimeData.flame_detected ? 'critical' : 
               realTimeData.water_detected ? 'warning' : 'normal'}
        icons={[
          realTimeData.flame_detected && Flame,
          realTimeData.water_detected && Droplet
        ]}
      />
    </div>
    <div className="main-chart">
      <h3>Temperature & Humidity Trends</h3>
      <div className="chart-wrapper">
        <Line 
          data={tempHumidityChart}
          options={{
            ...chartOptions,
            scales: {
              y: {
                title: { display: true, text: 'Temperature (°C)' },
                position: 'left',
              },
              y1: {
                title: { display: true, text: 'Humidity (%)' },
                position: 'right',
                grid: { drawOnChartArea: false },
              }
            }
          }}
        />
      </div>
    </div>
  </div>
);

const EnvironmentalView = ({ chartData, alcoholChart, alertDistribution, chartOptions }) => (
  <div className="environmental-grid">
    <ChartContainer title="Temperature History">
      <Line 
        data={{
          labels: chartData.labels,
          datasets: [{
            label: 'Temperature (°C)',
            data: chartData.temperatures,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            tension: 0.3,
          }]
        }}
        options={chartOptions}
      />
    </ChartContainer>
    <ChartContainer title="Humidity History">
      <Line 
        data={{
          labels: chartData.labels,
          datasets: [{
            label: 'Humidity (%)',
            data: chartData.humidities,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.3,
          }]
        }}
        options={chartOptions}
      />
    </ChartContainer>
    <ChartContainer title="Alcohol Vapor Levels">
      <Bar 
        data={alcoholChart}
        options={{
          ...chartOptions,
          scales: { y: { beginAtZero: true } }
        }}
      />
    </ChartContainer>
    <ChartContainer title="Alert Distribution">
      <Pie 
        data={alertDistribution}
        options={{
          ...chartOptions,
          plugins: { legend: { position: 'bottom' } }
        }}
      />
    </ChartContainer>
  </div>
);

const AlertsView = ({ alerts, ALERT_TYPES, acknowledgeAlert, acknowledgeAllAlerts }) => (
  <div className="alerts-container">
    <div className="alerts-header">
      <h2>Active Alerts</h2>
      <div className="alerts-summary">
        <span>{alerts.length} total alerts</span>
        <span className="unacknowledged">
          {alerts.filter(a => !a.acknowledged).length} unacknowledged
        </span>
        {alerts.filter(a => !a.acknowledged).length > 0 && (
          <button 
            className="acknowledge-all-btn"
            onClick={acknowledgeAllAlerts}
          >
            Acknowledge All
          </button>
        )}
      </div>
    </div>
    
    <div className="alerts-list">
      {alerts.length === 0 ? (
        <div className="no-alerts">
          <div className="no-alerts-icon">
            <ShieldAlert size={40} />
          </div>
          <h3>No active alerts</h3>
          <p>All systems are operating normally</p>
        </div>
      ) : (
        alerts.map((alert) => {
          const Icon = ALERT_TYPES[alert.type]?.icon || AlertTriangle;
          const alertClass = ALERT_TYPES[alert.type]?.color || 'warning';
          
          return (
            <div
              key={alert.id}
              className={`alert-item ${alertClass} ${alert.acknowledged ? 'acknowledged' : ''}`}
            >
              <div className="alert-icon">
                <Icon size={20} />
              </div>
              <div className="alert-content">
                <div className="alert-title">
                  <h4>{alert.title}</h4>
                  <span className={`severity-badge ${alertClass}`}>
                    {alertClass}
                  </span>
                </div>
                <p className="alert-description">{alert.message}</p>
                <div className="alert-footer">
                  <span className="alert-time">{alert.time}</span>
                  {!alert.acknowledged && (
                    <button 
                      className="acknowledge-btn"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);

const HistoricalDataView = ({ loading, historicalData }) => (
  <div className="historical-data">
    <div className="table-container">
      {loading ? (
        <div className="loading-data">
          <RefreshCw className="animate-spin" size={24} />
          <p>Loading data...</p>
        </div>
      ) : historicalData.length === 0 ? (
        <div className="no-data">
          <div className="no-data-content">
            <Clock size={40} />
            <p>No historical data available</p>
          </div>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Temp (°C)</th>
              <th>Humidity (%)</th>
              <th>Alcohol</th>
              <th>Flame</th>
              <th>Water</th>
            </tr>
          </thead>
          <tbody>
            {historicalData.slice(0, 100).map((data, index) => (
              <tr key={index}>
                <td>{new Date(data.timestamp).toLocaleString()}</td>
                <td>{data.temperature?.toFixed(1)}</td>
                <td>{data.humidity?.toFixed(1)}</td>
                <td>{data.alcohol_level}</td>
                <td className={data.flame_detected ? 'critical' : ''}>
                  {data.flame_detected ? 'Yes' : 'No'}
                </td>
                <td className={data.water_detected ? 'warning' : ''}>
                  {data.water_detected ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

// Helper components
const StatusCard = ({ icon: Icon, title, value, status, icons = [] }) => (
  <div className={`status-card ${status}`}>
    <div className="card-header">
      <Icon size={20} />
      <h3>{title}</h3>
    </div>
    <div className="card-value">{value}</div>
    <div className="card-status">
      {status === 'critical' ? 'Critical' : 
       status === 'warning' ? 'Warning' : 'Normal'}
    </div>
    {icons.length > 0 && (
      <div className="card-footer">
        {icons.filter(Boolean).map((Icon, i) => (
          <Icon key={i} size={16} />
        ))}
      </div>
    )}
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div className="chart-container">
    <h3>{title}</h3>
    <div className="chart-wrapper">
      {children}
    </div>
  </div>
);

// Helper functions
const getStatusLevel = (value, thresholds, isRange = false) => {
  if (isRange) {
    return (value < thresholds[0] || value > thresholds[1]) ? 'warning' : 'normal';
  }
  return value > thresholds[1] ? 'critical' : 
         value > thresholds[0] ? 'warning' : 'normal';
};

const getHazardStatus = (data) => {
  if (data.flame_detected) return 'Fire!';
  if (data.water_detected) return 'Water Leak';
  return 'All Clear';
};

export default AdminSecurity;
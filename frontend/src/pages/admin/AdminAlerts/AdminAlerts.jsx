import React from 'react';
import { AlertTriangle, BellOff, CheckCircle2, Download, Flame, Thermometer, User } from 'lucide-react';
import './AdminAlerts.css';

export default function AdminAlerts() {
  // Sample alerts data
  const alerts = [
    {
      id: 1,
      title: "High Temperature Alert",
      description: "Temperature in storage area exceeds safe levels (28°C)",
      severity: "critical",
      time: "10 minutes ago",
      icon: Thermometer,
      acknowledged: false,
      category: "environmental",
    },
    {
      id: 2,
      title: "Ethanol Level Warning",
      description: "Ethanol vapor concentration approaching threshold (15%)",
      severity: "warning",
      time: "25 minutes ago",
      icon: AlertTriangle,
      acknowledged: false,
      category: "environmental",
    },
    {
      id: 3,
      title: "Unauthorized Access Attempt",
      description: "Failed login attempt at east entrance",
      severity: "critical",
      time: "1 hour ago",
      icon: User,
      acknowledged: true,
      category: "security",
    },
    {
      id: 4,
      title: "Fire Alarm Triggered",
      description: "Smoke detector activated in chemical storage area",
      severity: "critical",
      time: "2 hours ago",
      icon: Flame,
      acknowledged: true,
      category: "safety",
    },
    {
      id: 5,
      title: "System Check Complete",
      description: "All security systems functioning normally",
      severity: "info",
      time: "3 hours ago",
      icon: CheckCircle2,
      acknowledged: true,
      category: "system",
    },
    {
      id: 6,
      title: "Low Humidity Warning",
      description: "Humidity in storage area below recommended levels (30%)",
      severity: "warning",
      time: "4 hours ago",
      icon: AlertTriangle,
      acknowledged: false,
      category: "environmental",
    },
    {
      id: 7,
      title: "Inventory System Offline",
      description: "Inventory management system temporarily unavailable",
      severity: "warning",
      time: "5 hours ago",
      icon: AlertTriangle,
      acknowledged: true,
      category: "system",
    },
  ];

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>Security Alerts</h1>
          <p>Monitor and manage all system alerts and notifications.</p>
        </div>
        <div className="header-actions">
          <button className="btn outline">
            <BellOff className="icon" />
            Mute Alerts
          </button>
          <button className="btn outline">
            <Download className="icon" />
            Export Logs
          </button>
        </div>
      </div>

      <div className="alerts-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Alerts</h3>
            </div>
            <div className="stat-content">
              <div className="stat-value">24</div>
              <p className="stat-description">Last 24 hours</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>Critical Alerts</h3>
            </div>
            <div className="stat-content">
              <div className="stat-value critical">3</div>
              <p className="stat-description">2 unacknowledged</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>Warning Alerts</h3>
            </div>
            <div className="stat-content">
              <div className="stat-value warning">8</div>
              <p className="stat-description">3 unacknowledged</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <h3>System Status</h3>
            </div>
            <div className="stat-content">
              <div className="stat-value success">Online</div>
              <p className="stat-description">All systems operational</p>
            </div>
          </div>
        </div>

        <div className="alerts-tabs">
          <div className="tabs-list">
            <button className="tab-trigger active">All Alerts</button>
            <button className="tab-trigger">Critical</button>
            <button className="tab-trigger">Warning</button>
            <button className="tab-trigger">Unacknowledged</button>
          </div>

          <div className="tab-content active">
            <div className="alert-history-card">
              <div className="alert-card-header">
                <h2>Alert History</h2>
                <p>Recent security and system alerts</p>
              </div>
              <div className="alert-card-content">
                <div className="alerts-list">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`alert-item ${
                        alert.severity === "critical" && !alert.acknowledged ? "critical-border" : ""
                      } ${
                        alert.severity === "warning" && !alert.acknowledged ? "warning-border" : ""
                      }`}
                    >
                      <div className="alert-content">
                        <div
                          className={`alert-icon ${
                            alert.severity === "critical" ? "critical-icon" : ""
                          } ${
                            alert.severity === "warning" ? "warning-icon" : ""
                          } ${
                            alert.severity === "info" ? "info-icon" : ""
                          }`}
                        >
                          <alert.icon className="icon" />
                        </div>

                        <div className="alert-details">
                          <div className="alert-header">
                            <h4 className="alert-title">{alert.title}</h4>
                            <div className="alert-badges">
                              <span
                                className={`badge ${
                                  alert.severity === "critical"
                                    ? "critical-badge"
                                    : alert.severity === "warning"
                                      ? "warning-badge"
                                      : "info-badge"
                                }`}
                              >
                                {alert.severity}
                              </span>
                              <span className="badge category-badge">
                                {alert.category}
                              </span>
                            </div>
                          </div>
                          <p className="alert-description">{alert.description}</p>
                          <div className="alert-footer">
                            <span className="alert-time">{alert.time}</span>
                            {!alert.acknowledged && (
                              <button className="btn outline sm">
                                Acknowledge
                              </button>
                            )}
                            {alert.acknowledged && (
                              <span className="acknowledged">
                                <CheckCircle2 className="icon" />
                                Acknowledged
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
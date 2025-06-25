// settings.jsx
import { useState } from "react";

export default function AdminSettings() {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          <button className="tabs-trigger active" data-value="general">General</button>
          <button className="tabs-trigger" data-value="appearance">Appearance</button>
          <button className="tabs-trigger" data-value="notifications">Notifications</button>
          <button className="tabs-trigger" data-value="security">Security</button>
        </div>

        <div className="tabs-content active" data-value="general">
          <div className="card">
            <div className="card-header">
              <h2>General Settings</h2>
              <p>Manage your basic account settings and preferences.</p>
            </div>
            <div className="card-content">
              <div className="section">
                <h3>Profile Information</h3>
                <div className="grid">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input id="name" type="text" defaultValue="Admin User" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" defaultValue="admin@example.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="title">Job Title</label>
                    <input id="title" type="text" defaultValue="System Administrator" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
              </div>

              <div className="separator"></div>

              <div className="section">
                <h3>Language & Region</h3>
                <div className="grid">
                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <select id="language" defaultValue="en">
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="timezone">Timezone</label>
                    <select id="timezone" defaultValue="utc-5">
                      <option value="utc-8">Pacific Time (UTC-8)</option>
                      <option value="utc-5">Eastern Time (UTC-5)</option>
                      <option value="utc+0">UTC</option>
                      <option value="utc+1">Central European Time (UTC+1)</option>
                      <option value="utc+3">Eastern European Time (UTC+3)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="date-format">Date Format</label>
                    <select id="date-format" defaultValue="mdy">
                      <option value="mdy">MM/DD/YYYY</option>
                      <option value="dmy">DD/MM/YYYY</option>
                      <option value="ymd">YYYY/MM/DD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="time-format">Time Format</label>
                    <select id="time-format" defaultValue="12h">
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn-primary" onClick={handleSave}>
                {isSaved ? (
                  <>
                    <span className="icon-check"></span>
                    Saved
                  </>
                ) : (
                  <>
                    <span className="icon-save"></span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="tabs-content" data-value="appearance">
          <div className="card">
            <div className="card-header">
              <h2>Appearance</h2>
              <p>Customize the look and feel of the dashboard.</p>
            </div>
            <div className="card-content">
              <div className="section">
                <h3>Theme</h3>
                <div className="radio-group">
                  <div className="radio-option">
                    <input type="radio" id="light" name="theme" value="light" defaultChecked />
                    <label htmlFor="light">
                      <div className="theme-preview light"></div>
                      <span>Light</span>
                    </label>
                  </div>
                  <div className="radio-option">
                    <input type="radio" id="dark" name="theme" value="dark" />
                    <label htmlFor="dark">
                      <div className="theme-preview dark"></div>
                      <span>Dark</span>
                    </label>
                  </div>
                  <div className="radio-option">
                    <input type="radio" id="system" name="theme" value="system" />
                    <label htmlFor="system">
                      <div className="theme-preview system"></div>
                      <span>System</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="separator"></div>

              <div className="section">
                <h3>Layout</h3>
                <div className="grid">
                  <div className="switch-group">
                    <label htmlFor="sidebar-collapsed">Collapsed Sidebar by Default</label>
                    <label className="switch">
                      <input type="checkbox" id="sidebar-collapsed" />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="compact-view">Compact View</label>
                    <label className="switch">
                      <input type="checkbox" id="compact-view" />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="show-breadcrumbs">Show Breadcrumbs</label>
                    <label className="switch">
                      <input type="checkbox" id="show-breadcrumbs" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="sticky-header">Sticky Header</label>
                    <label className="switch">
                      <input type="checkbox" id="sticky-header" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn-primary" onClick={handleSave}>
                {isSaved ? (
                  <>
                    <span className="icon-check"></span>
                    Saved
                  </>
                ) : (
                  <>
                    <span className="icon-save"></span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="tabs-content" data-value="notifications">
          <div className="card">
            <div className="card-header">
              <h2>Notification Settings</h2>
              <p>Configure how and when you receive notifications.</p>
            </div>
            <div className="card-content">
              <div className="section">
                <h3>Email Notifications</h3>
                <div className="switch-list">
                  <div className="switch-group">
                    <label htmlFor="email-security">Security Alerts</label>
                    <label className="switch">
                      <input type="checkbox" id="email-security" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="email-orders">New Orders</label>
                    <label className="switch">
                      <input type="checkbox" id="email-orders" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="email-inventory">Inventory Updates</label>
                    <label className="switch">
                      <input type="checkbox" id="email-inventory" />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="email-system">System Notifications</label>
                    <label className="switch">
                      <input type="checkbox" id="email-system" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="separator"></div>

              <div className="section">
                <h3>Dashboard Notifications</h3>
                <div className="switch-list">
                  <div className="switch-group">
                    <label htmlFor="dash-security">Security Alerts</label>
                    <label className="switch">
                      <input type="checkbox" id="dash-security" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="dash-orders">New Orders</label>
                    <label className="switch">
                      <input type="checkbox" id="dash-orders" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="dash-inventory">Inventory Updates</label>
                    <label className="switch">
                      <input type="checkbox" id="dash-inventory" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="switch-group">
                    <label htmlFor="dash-system">System Notifications</label>
                    <label className="switch">
                      <input type="checkbox" id="dash-system" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="separator"></div>

              <div className="section">
                <h3>Notification Schedule</h3>
                <div className="form-group">
                  <label htmlFor="quiet-hours">Quiet Hours</label>
                  <div className="grid">
                    <div className="form-group">
                      <label htmlFor="quiet-start">Start Time</label>
                      <select id="quiet-start" defaultValue="22">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="quiet-end">End Time</label>
                      <select id="quiet-end" defaultValue="6">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={i}>
                            {i.toString().padStart(2, "0")}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn-primary" onClick={handleSave}>
                {isSaved ? (
                  <>
                    <span className="icon-check"></span>
                    Saved
                  </>
                ) : (
                  <>
                    <span className="icon-save"></span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="tabs-content" data-value="security">
          <div className="card">
            <div className="card-header">
              <h2>Security Settings</h2>
              <p>Manage your account security and authentication settings.</p>
            </div>
            <div className="card-content">
              <div className="section">
                <h3>Password</h3>
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <input id="current-password" type="password" />
                </div>
                <div className="grid">
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input id="new-password" type="password" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <input id="confirm-password" type="password" />
                  </div>
                </div>
              </div>

              <div className="separator"></div>

              <div className="section">
                <h3>Two-Factor Authentication</h3>
                <div className="switch-group">
                  <div>
                    <label>Enable Two-Factor Authentication</label>
                    <p className="description">Add an extra layer of security to your account</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" id="2fa" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="separator"></div>

              <div className="section">
                <h3>Session Management</h3>
                <div className="switch-list">
                  <div className="switch-group">
                    <label htmlFor="auto-logout">Auto Logout After Inactivity</label>
                    <label className="switch">
                      <input type="checkbox" id="auto-logout" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label htmlFor="session-timeout">Session Timeout (minutes)</label>
                    <select id="session-timeout" defaultValue="30">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="separator"></div>

              <div className="section">
                <h3>Login History</h3>
                <div className="login-history">
                  <div className="login-session">
                    <div>
                      <div className="session-title">Chrome on Windows</div>
                      <div className="session-details">192.168.1.1 • Current session</div>
                    </div>
                    <span className="badge active">Active Now</span>
                  </div>
                  <div className="login-session">
                    <div>
                      <div className="session-title">Safari on macOS</div>
                      <div className="session-details">192.168.1.2 • 2 days ago</div>
                    </div>
                    <button className="btn-outline">Revoke</button>
                  </div>
                  <div className="login-session">
                    <div>
                      <div className="session-title">Firefox on Ubuntu</div>
                      <div className="session-details">192.168.1.3 • 5 days ago</div>
                    </div>
                    <button className="btn-outline">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button className="btn-primary" onClick={handleSave}>
                {isSaved ? (
                  <>
                    <span className="icon-check"></span>
                    Saved
                  </>
                ) : (
                  <>
                    <span className="icon-save"></span>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"

import { useState } from "react"
import { Check, Camera, Calendar, Clock, LogIn, MapPin, Phone, Mail, Save, User, Building } from "lucide-react"

export default function AdminProfile() {
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  // Sample activity data
  const activities = [
    {
      id: 1,
      action: "Logged in",
      details: "Successful login from Chrome on Windows",
      date: "Today",
      time: "10:30 AM",
      icon: LogIn,
    },
    {
      id: 2,
      action: "Updated inventory",
      details: "Added 5 new products to inventory",
      date: "Today",
      time: "09:45 AM",
      icon: Check,
    },
    {
      id: 3,
      action: "Changed password",
      details: "Password changed successfully",
      date: "Yesterday",
      time: "04:30 PM",
      icon: Check,
    },
    {
      id: 4,
      action: "Logged in",
      details: "Successful login from Safari on macOS",
      date: "Yesterday",
      time: "08:15 AM",
      icon: LogIn,
    },
    {
      id: 5,
      action: "Updated profile",
      details: "Changed profile information",
      date: "May 4, 2023",
      time: "02:45 PM",
      icon: User,
    },
  ]

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header">
        <h1 className="dashboard-heading">My Profile</h1>
        <p className="dashboard-text">View and manage your profile information.</p>
      </div>

      <div className="grid gap-6">
        <div className="card">
          <div className="card-content p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="avatar">
                    <img src="/placeholder.svg?height=128&width=128" alt="Admin" className="avatar-image" />
                    <div className="avatar-fallback">AD</div>
                  </div>
                  <button
                    className="avatar-button"
                    title="Change profile picture"
                  >
                    <Camera className="icon-sm" />
                    <span className="sr-only">Change profile picture</span>
                  </button>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold">Admin User</h2>
                  <p className="text-sm text-muted">System Administrator</p>
                </div>
                <span className="badge">Super Admin</span>
              </div>

              <div className="separator-vertical"></div>

              <div className="flex-1 grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="icon-sm text-muted" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted">admin@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="icon-sm text-muted" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="icon-sm text-muted" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted">IT Administration</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="icon-sm text-muted" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted">Rabat, Morocco</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="icon-sm text-muted" />
                  <div>
                    <p className="text-sm font-medium">Joined</p>
                    <p className="text-sm text-muted">January 15, 2022</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="icon-sm text-muted" />
                  <div>
                    <p className="text-sm font-medium">Last Active</p>
                    <p className="text-sm text-muted">Today at 10:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <div className="tabs-list">
            <button className="tabs-trigger active">Edit Profile</button>
            <button className="tabs-trigger">Activity Log</button>
            <button className="tabs-trigger">Preferences</button>
          </div>

          <div className="tabs-content active">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Edit Profile Information</h3>
                <p className="card-description">Update your personal information and contact details.</p>
              </div>
              <div className="card-content space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="first-name">First Name</label>
                    <input id="first-name" defaultValue="Admin" className="input" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last-name">Last Name</label>
                    <input id="last-name" defaultValue="User" className="input" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" defaultValue="admin@example.com" className="input" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone">Phone Number</label>
                    <input id="phone" defaultValue="+1 (555) 123-4567" className="input" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="job-title">Job Title</label>
                    <input id="job-title" defaultValue="System Administrator" className="input" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="department">Department</label>
                    <input id="department" defaultValue="IT Administration" className="input" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location">Location</label>
                    <input id="location" defaultValue="Rabat, Morocco" className="input" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="timezone">Timezone</label>
                    <input id="timezone" defaultValue="GMT+1 (Central European Time)" className="input" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    rows={4}
                    defaultValue="Experienced system administrator with expertise in network security, database management, and IT infrastructure. Responsible for maintaining the ministry's digital systems and ensuring data security."
                    className="textarea"
                  />
                </div>
              </div>
              <div className="card-footer">
                <button className="button" onClick={handleSave}>
                  {isSaved ? (
                    <>
                      <Check className="icon-sm mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="icon-sm mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="tabs-content">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Activity Log</h3>
                <p className="card-description">View your recent account activity and security events.</p>
              </div>
              <div className="card-content">
                <div className="table">
                  <div className="table-header">
                    <div className="table-row">
                      <div className="table-head">Action</div>
                      <div className="table-head">Details</div>
                      <div className="table-head">Date</div>
                      <div className="table-head">Time</div>
                    </div>
                  </div>
                  <div className="table-body">
                    {activities.map((activity) => (
                      <div className="table-row" key={activity.id}>
                        <div className="table-cell">
                          <div className="flex items-center gap-2">
                            <activity.icon className="icon-sm text-muted" />
                            <span>{activity.action}</span>
                          </div>
                        </div>
                        <div className="table-cell">{activity.details}</div>
                        <div className="table-cell">{activity.date}</div>
                        <div className="table-cell">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button className="button-outline">View Full History</button>
              </div>
            </div>
          </div>

          <div className="tabs-content">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">User Preferences</h3>
                <p className="card-description">Customize your dashboard experience.</p>
              </div>
              <div className="card-content space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Dashboard Preferences</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="default-page">Default Landing Page</label>
                      <input id="default-page" defaultValue="Dashboard Overview" className="input" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="items-per-page">Items Per Page</label>
                      <input id="items-per-page" type="number" defaultValue="10" className="input" />
                    </div>
                  </div>
                </div>

                <div className="separator"></div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="email-format">Email Format</label>
                      <input id="email-format" defaultValue="HTML" className="input" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="notification-sound">Notification Sound</label>
                      <input id="notification-sound" defaultValue="Default" className="input" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button className="button" onClick={handleSave}>
                  {isSaved ? (
                    <>
                      <Check className="icon-sm mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="icon-sm mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
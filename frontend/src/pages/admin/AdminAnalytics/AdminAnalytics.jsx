import React from 'react';
import { Download, RefreshCw } from "lucide-react";
import './AdminAnalytics.css';

export default function AdminAnalytics() {
  // Test data for sales chart
  const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 2780 },
    { month: 'May', sales: 1890 },
    { month: 'Jun', sales: 2390 },
    { month: 'Jul', sales: 3490 },
  ];

  // Test data for visitors chart
  const visitorsData = [
    { day: 'Mon', visitors: 400 },
    { day: 'Tue', visitors: 600 },
    { day: 'Wed', visitors: 200 },
    { day: 'Thu', visitors: 800 },
    { day: 'Fri', visitors: 500 },
    { day: 'Sat', visitors: 900 },
    { day: 'Sun', visitors: 700 },
  ];

  // Test data for top products
  const topProducts = [
    { name: 'Product A', sales: 1250 },
    { name: 'Product B', sales: 980 },
    { name: 'Product C', sales: 750 },
    { name: 'Product D', sales: 620 },
    { name: 'Product E', sales: 540 },
  ];

  // Test data for sales by region
  const salesByRegion = [
    { region: 'North', sales: 35 },
    { region: 'South', sales: 25 },
    { region: 'East', sales: 20 },
    { region: 'West', sales: 15 },
    { region: 'Central', sales: 5 },
  ];

  // Calculate max values for chart scaling
  const maxSales = Math.max(...salesData.map(item => item.sales));
  const maxVisitors = Math.max(...visitorsData.map(item => item.visitors));
  const maxProductSales = Math.max(...topProducts.map(item => item.sales));

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <h1 className="heading">Analytics</h1>
          <p className="text">View detailed analytics and reports for your business.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline btn-sm">
            <RefreshCw className="icon mr-2" />
            Refresh
          </button>
          <button className="btn btn-outline btn-sm">
            <Download className="icon mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          <button className="tabs-trigger active" data-value="overview">Overview</button>
          <button className="tabs-trigger" data-value="sales">Sales</button>
          <button className="tabs-trigger" data-value="visitors">Visitors</button>
          <button className="tabs-trigger" data-value="products">Products</button>
        </div>

        <div className="tabs-content active" data-value="overview">
          <div className="metrics-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Total Revenue</h3>
              </div>
              <div className="card-content">
                <div className="text-2xl">$45,231.89</div>
                <p className="text-muted">+20.1% from last month</p>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Sales</h3>
              </div>
              <div className="card-content">
                <div className="text-2xl">+2,350</div>
                <p className="text-muted">+10.5% from last month</p>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Active Users</h3>
              </div>
              <div className="card-content">
                <div className="text-2xl">+12,234</div>
                <p className="text-muted">+19.2% from last month</p>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Conversion Rate</h3>
              </div>
              <div className="card-content">
                <div className="text-2xl">3.2%</div>
                <p className="text-muted">+1.1% from last month</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card col-span-4">
              <div className="card-header">
                <h3 className="card-title">Sales Overview</h3>
                <p className="card-description">Monthly sales performance</p>
              </div>
              <div className="card-content">
                <div className="sales-chart">
                  <div className="chart-bars">
                    {salesData.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div 
                          className="chart-bar" 
                          style={{ height: `${(item.sales / maxSales) * 100}%` }}
                        ></div>
                        <span className="chart-label">{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-y-axis">
                    <span>${maxSales}</span>
                    <span>${Math.round(maxSales * 0.75)}</span>
                    <span>${Math.round(maxSales * 0.5)}</span>
                    <span>${Math.round(maxSales * 0.25)}</span>
                    <span>$0</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card col-span-3">
              <div className="card-header">
                <h3 className="card-title">Top Products</h3>
                <p className="card-description">Best selling products this month</p>
              </div>
              <div className="card-content">
                <div className="products-chart">
                  {topProducts.map((product, index) => (
                    <div key={index} className="product-row">
                      <span className="product-name">{product.name}</span>
                      <div className="product-bar-container">
                        <div 
                          className="product-bar" 
                          style={{ width: `${(product.sales / maxProductSales) * 100}%` }}
                        ></div>
                      </div>
                      <span className="product-value">{product.sales}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card col-span-4">
              <div className="card-header">
                <h3 className="card-title">Visitors</h3>
                <p className="card-description">Website traffic analysis</p>
              </div>
              <div className="card-content">
                <div className="visitors-chart">
                  <div className="chart-lines">
                    {visitorsData.map((item, index) => (
                      <div key={index} className="chart-line-container">
                        <div 
                          className="chart-line" 
                          style={{ height: `${(item.visitors / maxVisitors) * 100}%` }}
                        ></div>
                        <span className="chart-label">{item.day}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-y-axis">
                    <span>{maxVisitors}</span>
                    <span>{Math.round(maxVisitors * 0.75)}</span>
                    <span>{Math.round(maxVisitors * 0.5)}</span>
                    <span>{Math.round(maxVisitors * 0.25)}</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card col-span-3">
              <div className="card-header">
                <h3 className="card-title">Sales by Region</h3>
                <p className="card-description">Geographic distribution of sales</p>
              </div>
              <div className="card-content">
                <div className="region-chart">
                  {salesByRegion.map((region, index) => (
                    <div key={index} className="region-row">
                      <span className="region-name">{region.region}</span>
                      <div className="region-bar-container">
                        <div 
                          className="region-bar" 
                          style={{ width: `${region.sales}%` }}
                        ></div>
                      </div>
                      <span className="region-value">{region.sales}%</span>
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
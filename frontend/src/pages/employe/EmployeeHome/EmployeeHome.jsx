import { useState, useEffect } from "react";
import "./EmployeeHome.css";
import { Search, Clock, CheckCircle, XCircle } from "lucide-react";

export default function EmployeeHome() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("Fetching orders..."); // Debug log
        const response = await fetch('http://localhost:5000/api/orders');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
        
        const data = await response.json();
        console.log("Received data:", data); // Debug log
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        const mappedData = data.map(order => ({
          ...order,
          order_date: new Date(order.order_date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }));
        
        console.log("Mapped data:", mappedData); // Debug log
        setOrders(mappedData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.employee_name?.toLowerCase().includes(searchLower)) || 
      (order.items_list?.toLowerCase().includes(searchLower)) || 
      (order.order_number?.toString().includes(searchTerm))
    );
  });

  // Debugging output
  console.log("Current orders state:", orders);
  console.log("Filtered orders:", filteredOrders);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="employee-dashboard">
      <div className="dashboard-container">
        <DashboardHeader orders={orders} />
        
        <div className="dashboard-content">
          <SearchControls 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
          
          <OrdersTable orders={filteredOrders} />
        </div>
      </div>
    </div>
  );
}

// Component for loading state
function LoadingScreen() {
  return (
    <div className="employee-loading-screen">
      <div className="loading-animation">
        <div className="loading-spinner"></div>
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
      <h3>جار تحميل بيانات الطلبات</h3>
      <p>يرجى الانتظار...</p>
    </div>
  );
}

// Component for error state
function ErrorScreen({ error }) {
  return (
    <div className="employee-error-screen">
      <div className="error-icon">
        <XCircle size={48} />
      </div>
      <h3>حدث خطأ في تحميل البيانات</h3>
      <p className="error-message">{error}</p>
      <button 
        className="retry-button" 
        onClick={() => window.location.reload()}
      >
        إعادة المحاولة
      </button>
    </div>
  );
}

// Component for dashboard header
function DashboardHeader({ orders }) {
  return (
    <div className="dashboard-header">
      <div className="header-content">
        <h1>
          <span className="header-title">سجل الطلبات</span>
        </h1>
      </div>
      <div className="header-decoration"></div>
    </div>
  );
}

// Component for search controls
function SearchControls({ searchTerm, setSearchTerm }) {
  return (
    <div className="controls-section">
      <div className="search-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="ابحث عن طلب، موظف، أو رقم طلب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
    </div>
  );
}

// Component for orders table
function OrdersTable({ orders }) {
  if (orders.length === 0) {
    return (
      <div className="no-orders-found">
        <Search size={48} className="no-orders-icon" />
        <h3>لا توجد طلبات متطابقة</h3>
        <p>لم يتم العثور على أي طلبات تطابق معايير البحث الخاصة بك</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="luxury-table-wrapper">
        <table className="luxury-table">
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>الموظف</th>
              <th>الطلبات</th>
              <th>عدد المواد</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Component for individual order row
function OrderRow({ order }) {
  return (
    <tr key={order.id}>
      <td className="order-id">#{order.order_number}</td>
      <td className="employee-name">{order.employee_name}</td>
      <td className="order-item" title={order.items_list}>
        {order.items_list?.length > 30 
          ? `${order.items_list.substring(0, 30)}...` 
          : order.items_list}
      </td>
      <td className="order-quantity">{order.items_count}</td>
      <td className="order-date">{order.order_date}</td>
      <td className="order-status">
        <StatusBadge status={order.status} />
      </td>
      <td className="rejection-reason">
        {order.notes || "—"}
      </td>
    </tr>
  );
}

// Component for status badge
function StatusBadge({ status }) {
  const statusMap = {
    "قيد المعالجة": {
      class: "processing",
      icon: <Clock size={16} />
    },
    "تم الموافقة": {
      class: "approved",
      icon: <CheckCircle size={16} />
    },
    "تم التسليم": {
      class: "delivered",
      icon: <CheckCircle size={16} />
    },
    "تم الرفض": {
      class: "rejected",
      icon: <XCircle size={16} />
    }
  };

  const statusInfo = statusMap[status] || { class: "", icon: null };

  return (
    <div className={`status-badge ${statusInfo.class}`}>
      {statusInfo.icon}
      <span>{status}</span>
    </div>
  );
}
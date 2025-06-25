import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CitoyenLayout from './components/layout/CitoyenLayout/CitoyenLayout';
import HomePage from './pages/HomePage';
import CitoyenHome from './pages/citoyen/CitoyenHome/CitoyenHome'; 
import CitoyenGuide from './pages/citoyen/CitoyenGuide/CitoyenGuide'; 
import NotFound from './components/common/NotFound';
import '@fontsource/noto-sans-arabic/400.css';
import '@fontsource/noto-sans-arabic/700.css';
import CitoyenContact from './pages/citoyen/CitoyenContact/CitoyenContact';
import CitoyenConsultation from './pages/citoyen/CitoyenConsultation/CitoyenConsultation';
import CitoyenTribuneaux from './pages/citoyen/CitoyenTribuneaux/CitoyenTribuneaux'; 
import TribunalDetail from './pages/citoyen/CitoyenTribuneaux/TribunalDetail';
import EmployeeLayout from './components/layout/EmployeeLayout/EmployeeLayout';
import EmployeeLogin from './pages/employe/EmployeeLogin/EmployeeLogin.jsx';
import EmployeeHome from './pages/employe/EmployeeHome/EmployeeHome.jsx';
import EmployeeGuide from './pages/employe/EmployeeGuide/EmployeeGuide.jsx';
import EmployeeOrder from './pages/employe/EmployeeOrder/EmployeeOrder.jsx';
import EmployeeRating from './pages/employe/EmployeeRating/EmployeeRating.jsx';
import AdminLogin from './pages/admin/AdminLogin/AdminLogin.jsx';
import AdminLayout from './components/layout/AdminLayout/AdminLayout.jsx'; 
import AdminHome from './pages/admin/AdminHome/AdminHome.jsx';
import AdminAnalytics from './pages/admin/AdminAnalytics/AdminAnalytics.jsx'
import AdminInventory from './pages/admin/AdminInventory/AdminInventory.jsx';
import AdminMessages from './pages/admin/AdminMessages/AdminMessages.jsx';
import AdminProfile from './pages/admin/AdminProfile/AdminProfile.jsx';
import AdminRatings from './pages/admin/AdminRatings/AdminRatings.jsx';
import AdminSecurity from './pages/admin/AdminSecurity/AdminSecurity.jsx';
import AdminSettings from './pages/admin/AdminSettings/AdminSettings.jsx';
import AdminUsers from './pages/admin/AdminUsers/AdminUsers.jsx';
import AdminOrders from './pages/admin/AdminOrders/AdminOrder.jsx';
import EmployeeUsers from './pages/admin/AdminUsers/EmployeeUsers.jsx';

const App = () => {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Citoyen Layout and its pages */}
        <Route element={<CitoyenLayout />}>
          <Route path="/citoyen" element={<CitoyenHome />} />
          <Route path="/citoyen/guide" element={<CitoyenGuide />} />
          <Route path="/citoyen/consultation" element={<CitoyenConsultation />} />
          <Route path="/citoyen/contact" element={<CitoyenContact />} />
          <Route path="/citoyen/tribunaux" element={<CitoyenTribuneaux />} />
          <Route path="/citoyen/tribunaux/:id" element={<TribunalDetail />} />
        </Route>

        {/* Employee Layout and its pages */}
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route element={<EmployeeLayout />}>
          <Route path="/employee" element={<EmployeeHome />} />
          <Route path="/employee/guide" element={<EmployeeGuide />} />
          <Route path="/employee/order" element={<EmployeeOrder />} />
          <Route path="/employee/rate" element={<EmployeeRating />} />
        </Route>
        {/* Admin Layout and its pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/inventory" element={<AdminInventory/>} />
          <Route path="/admin/Orders" element={<AdminOrders/>} />
          <Route path="/admin/Messages" element={<AdminMessages/>} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/ratings" element={<AdminRatings />} />
          <Route path="/admin/security" element={<AdminSecurity />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/employee-users" element={<EmployeeUsers />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
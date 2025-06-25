// components/layout/AdminLayout/AdminBreadcrumbs.jsx
import { useLocation } from 'react-router-dom';
import styles from './styles/layout.module.css'; 

const AdminBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x && x !== 'admin');
  
  return (
    <div className={styles.breadcrumbs}>
      <span>Admin</span>
      {pathnames.map((name, index) => (
        <span key={name}>
          {' > '}
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </span>
      ))}
    </div>
  );
};

export default AdminBreadcrumbs; 
import { Navigate } from 'react-router-dom';

/**
 * @deprecated /admin/login has been unified into the central /login portal.
 * This bridge seamlessly redirects any direct navigation or legacy deep-links
 * to /login?redirect=/admin/dashboard.
 */
export default function Login() {
  return <Navigate to="/login?redirect=/admin/dashboard" replace />;
}

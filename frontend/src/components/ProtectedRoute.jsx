import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { getToken } from '../api/client';

export default function ProtectedRoute() {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar />
      <div className="relative z-10 min-w-0 flex-1">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
        <div className="fixed inset-x-0 bottom-0 z-20 lg:hidden">
          <Sidebar mobile />
        </div>
      </div>
    </div>
  );
}

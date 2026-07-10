import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { getToken } from '../api/client';

export default function ProtectedRoute() {
  const { pathname } = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  // Detect workspace route, e.g. /subjects/:subjectId
  const isWorkspace = /^\/subjects\/[^/]+$/.test(pathname);

  return (
    <div className="app-shell flex min-h-screen">
      <Sidebar />
      <div className={`relative z-10 min-w-0 flex-1 flex flex-col ${isWorkspace ? 'h-screen overflow-hidden' : ''}`}>
        <Navbar />
        <main className={isWorkspace ? "flex-1 min-h-0 overflow-hidden relative" : "mt-6 mx-auto w-full max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8"}>
          <Outlet />
        </main>
        <div className="fixed inset-x-0 bottom-0 z-20 lg:hidden shrink-0">
          <Sidebar mobile />
        </div>
      </div>
    </div>
  );
}


import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Notes = React.lazy(() => import('./pages/Notes'));
const Practice = React.lazy(() => import('./pages/Practice'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Register = React.lazy(() => import('./pages/Register'));
const RevisionQueue = React.lazy(() => import('./pages/RevisionQueue'));
const SubjectDetail = React.lazy(() => import('./pages/SubjectDetail'));
const Subjects = React.lazy(() => import('./pages/Subjects'));
const TopicDetail = React.lazy(() => import('./pages/TopicDetail'));
const Awards = React.lazy(() => import('./pages/Awards'));
const Search = React.lazy(() => import('./pages/Search'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
          <Route path="/topics/:topicId" element={<TopicDetail />} />
          <Route path="/topics/:topicId/notes" element={<Notes />} />
          <Route path="/topics/:topicId/practice" element={<Practice />} />
          <Route path="/revision" element={<RevisionQueue />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

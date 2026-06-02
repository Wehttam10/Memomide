import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Notes from './pages/Notes';
import Practice from './pages/Practice';
import Profile from './pages/Profile';
import Register from './pages/Register';
import RevisionQueue from './pages/RevisionQueue';
import SubjectDetail from './pages/SubjectDetail';
import Subjects from './pages/Subjects';
import TopicDetail from './pages/TopicDetail';
import Awards from './pages/Awards';
import Search from './pages/Search';

export default function App() {
  return (
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
  );
}

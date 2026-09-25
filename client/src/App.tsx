import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Shell } from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import Academics from './pages/Academics';
import AcademicStatistics from './pages/AcademicStatistics';
import Expenses from './pages/Expenses';
import Statistics from './pages/Statistics';
import Customize from './pages/Customize';

export default function App() {
  return (
    <AppProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/academics/statistics" element={<AcademicStatistics />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </AppProvider>
  );
}

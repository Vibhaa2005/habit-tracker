import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Shell } from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import Academics from './pages/Academics';
import Statistics from './pages/Statistics';
import Customize from './pages/Customize';

export default function App() {
  return (
    <AppProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </AppProvider>
  );
}

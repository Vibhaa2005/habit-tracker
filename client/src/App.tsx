import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Shell } from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import Routine from './pages/Routine';
import Academics from './pages/Academics';
import Statistics from './pages/Statistics';
import Customize from './pages/Customize';

export default function App() {
  return (
    <AppProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/customize" element={<Customize />} />
        </Routes>
      </Shell>
    </AppProvider>
  );
}

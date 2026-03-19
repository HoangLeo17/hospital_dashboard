import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HandHygienePage from './pages/HandHygienePage';
import VentilatorPneumoniaPage from './pages/VentilatorPneumoniaPage';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes — no sidebar/layout */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/panel" element={<AdminPanel />} />

        {/* Main app routes with sidebar layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/vesinhtay" element={<HandHygienePage />} />
              <Route path="/viemphoi" element={<VentilatorPneumoniaPage />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;

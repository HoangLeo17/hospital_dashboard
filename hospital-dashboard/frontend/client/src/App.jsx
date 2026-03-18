import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HandHygienePage from './pages/HandHygienePage';
import VentilatorPneumoniaPage from './pages/VentilatorPneumoniaPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vesinhtay" element={<HandHygienePage />} />
          <Route path="/viemphoi" element={<VentilatorPneumoniaPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

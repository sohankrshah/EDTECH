
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Counselor from './pages/Counselor';
import Applications from './pages/Applications';
import Documents from './pages/Documents';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/counselor" element={<Counselor />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/documents" element={<Documents />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;

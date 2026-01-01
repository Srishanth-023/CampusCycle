import React from 'react';
import { BoothProvider } from './context/BoothContext';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <BoothProvider>
      <Dashboard />
    </BoothProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { WorkflowCanvas } from './components/WorkflowCanvas/WorkflowCanvas';
import { CredentialsManager } from './pages/Credentials/CredentialsManager';
import { LoginPage } from './pages/Auth/LoginPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/workflow/new" element={<WorkflowCanvas />} />
        <Route path="/workflow/:id" element={<WorkflowCanvas />} />
        <Route path="/credentials" element={<CredentialsManager />} />
      </Routes>
    </Router>
  );
};

export default App;

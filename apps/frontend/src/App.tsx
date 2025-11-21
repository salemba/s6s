import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { WorkflowCanvas } from './components/WorkflowCanvas/WorkflowCanvas';
import { CredentialsManager } from './pages/Credentials/CredentialsManager';
import { LogsPage } from './pages/Logs/LogsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { PrivateRoute } from './components/Auth/PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workflows" element={<Dashboard />} />
          <Route path="/workflow/new" element={<WorkflowCanvas />} />
          <Route path="/workflow/:id" element={<WorkflowCanvas />} />
          <Route path="/credentials" element={<CredentialsManager />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

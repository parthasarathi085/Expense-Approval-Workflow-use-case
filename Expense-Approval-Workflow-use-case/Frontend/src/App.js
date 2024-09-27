import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SigninSignup from './pages/SigninSignup';
import Dashboard from './pages/Dashboard';
import SubmitExpense from './pages/SubmitExpense';
import ViewExpenseStatus from './pages/ViewExpenseStatus';
import ApproverLeaveEntry from './pages/ApproverLeaveEntry';
import ApproverDashboard from './pages/ApproverDashboard';
import PendingExpenseApprovals from './pages/PendingExpenseApprovals';
import LoadingScreen from './pages/LoadingScreen';
import { createGlobalStyle } from 'styled-components';

import { ToastContainer } from 'react-toastify';

import FloatingHomeButton from '../src/pages/FloatingHomeButton';

// Global styles to enforce desktop view
const GlobalStyle = createGlobalStyle`
  html, body {
    width: 100%;
    min-width: 100%;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
  }

  @media screen and (max-width: 1280px) {
    html, body {
      overflow-x: auto;
    }
  }
`;

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <>
      <GlobalStyle />
      <Router>
        {loading ? (
          <LoadingScreen />
        ) : (
          
          <>
            <Routes>
              <Route path="/" element={<SigninSignup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/submit-expense" element={<SubmitExpense />} />
              <Route path="/view-expense-status" element={<ViewExpenseStatus />} />
              <Route path="/approver-dashboard" element={<ApproverDashboard />} />
              <Route path="/pending-approvals" element={<PendingExpenseApprovals />} />
              <Route path="/leave-entry" element={<ApproverLeaveEntry />} />
            </Routes>
            <ToastContainer />
            <FloatingHomeButton />
          </>        
        )}
      </Router>
    </>
  );
};

export default App;

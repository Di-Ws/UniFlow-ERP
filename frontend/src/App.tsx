import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { startAutoLogoutCheck } from './utils/auth';

function App() {
  useEffect(() => {
    // Start the background check for token expiry and auto-logout
    startAutoLogoutCheck();
  }, []);

  return (
    <Router>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            borderRadius: '12px'
          }
        }} 
      />
      <AppRoutes />
    </Router>
  );
}

export default App;
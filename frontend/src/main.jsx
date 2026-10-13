import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { SmtpProvider } from './context/SmtpContext';
import ErrorBoundary from './components/common/ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SmtpProvider>
          <App />
        </SmtpProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);

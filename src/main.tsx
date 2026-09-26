import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './context/ThemeContext';
import { ClerkProviderWithTheme } from './components/ClerkProviderWithTheme';
import { MotionProvider } from './components/MotionProvider';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <MotionProvider>
        <ClerkProviderWithTheme>
          <BrowserRouter>
            <App />
            <Analytics />
          </BrowserRouter>
        </ClerkProviderWithTheme>
      </MotionProvider>
    </ThemeProvider>
  </React.StrictMode>
);

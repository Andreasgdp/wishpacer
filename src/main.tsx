import React from 'react';
import ReactDOM from 'react-dom/client';
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
          <App />
          <Analytics />
        </ClerkProviderWithTheme>
      </MotionProvider>
    </ThemeProvider>
  </React.StrictMode>
);

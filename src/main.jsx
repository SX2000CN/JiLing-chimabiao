import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/components/App';
import ErrorBoundary from './app/components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// 热重载支持
if (import.meta.hot) {
  import.meta.hot.accept();
}

// 全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});

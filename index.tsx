import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Fatal Error: Root element with id "root" not found in the DOM.');
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '20px';
  errorDiv.innerHTML = '<h1>Application Mount Error</h1><p>Could not find the root element to mount the application. Please ensure an element with id="root" exists in your index.html.</p>';
  document.body.appendChild(errorDiv);
}

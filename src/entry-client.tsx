import './index.css'
import React, { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App.tsx'


hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <App />
  </StrictMode>,
)

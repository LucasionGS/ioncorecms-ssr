import React, { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'

export function render(_url: string) {
  const head = `<title>Vite SSR App</title>`
  
  const html = renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )  
  return { head, html }
}

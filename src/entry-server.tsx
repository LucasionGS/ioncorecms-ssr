import React, { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import process from "node:process";
// import NodeController from "../server/controllers/NodeController.ts";

// const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173

export async function render(_url: string) {
  const head = `<title>Vite SSR App</title>`
  
  const serverProps: Record<string, any> = {};

  // Resolve initial data
  await fetch(`http://localhost:${port}/api/nodes/resolve/${_url === '/' ? 'home' : _url}`)
    .then(res => res.json())
    // Things aren't being loaded correctly when used as an SSR module, 
    // so can't use fetch internally yet
    // await NodeController.resolveNodeByPath(_url === '/' ? 'home' : _url)
    .then(data => {
      if (data.success) {
        serverProps.nodeData = data.data.node;
        serverProps.nodeType = data.data.nodeType;
      }
    })
    .catch(err => {
      console.error('Error fetching initial node data:', err);
    });
  
  const html = renderToString(
    <StrictMode>
      <App {...serverProps} />
    </StrictMode>,
  )  
  return { head, html }
}

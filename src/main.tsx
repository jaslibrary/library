import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DebugErrorBoundary } from './components/DebugErrorBoundary'
// import AppMinimal from './AppMinimal.tsx'

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <StrictMode>
      <DebugErrorBoundary>
        <App />
      </DebugErrorBoundary>
    </StrictMode>
  )
} else {
  document.body.innerHTML = '<h1 style="color:red">FATAL: No Root Element Found</h1>';
}

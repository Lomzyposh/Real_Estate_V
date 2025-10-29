import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { LoaderProvider } from './contexts/LoaderContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { SavedProvider } from './contexts/SavedContext.jsx'
import { PropertiesProvider } from './contexts/PropertiesContext.jsx'
import { AgentProvider } from './contexts/AgentContext.jsx'
import { AdminProvider } from './contexts/AdminContext.jsx'
import { useScrollToTopOnRouteChange } from '../hooks/useScrollTop.js'

function ScrollHandler() {
  useScrollToTopOnRouteChange();
  return null; // doesn’t render anything — just the effect
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollHandler />
      <AuthProvider>
        <LoaderProvider>
          <ThemeProvider>
            <PropertiesProvider>
              <AgentProvider>
                <SavedProvider>
                  <AdminProvider>

                    <App />

                  </AdminProvider>
                </SavedProvider>
              </AgentProvider>
            </PropertiesProvider>
          </ThemeProvider>
        </LoaderProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

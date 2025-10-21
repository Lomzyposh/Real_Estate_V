import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { LoaderProvider } from './contexts/LoaderContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { SavedProvider } from './contexts/SavedContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoaderProvider>
          <ThemeProvider>
            <SavedProvider>

              <App />

            </SavedProvider>
          </ThemeProvider>
        </LoaderProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

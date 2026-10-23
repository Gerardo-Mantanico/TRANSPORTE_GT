import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/AppRoutes'
import { AuthProvider } from './app/providers/AuthProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { ToastProvider } from './components/ui/Toast'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

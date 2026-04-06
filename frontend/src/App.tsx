import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'

import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Submit from './pages/Submit'
import Investigator from './pages/Investigator'
import LoginPage from './pages/LoginPage'
import About from './pages/About'
import Support from './pages/Support'
import Legal from './pages/Legal'

const theme = createTheme({
  typography: {
    fontFamily: 'Vazirmatn, system-ui, Segoe UI, Roboto, sans-serif',
  },
  direction: 'rtl',
})

function App() {
  const adminRoutePath = import.meta.env.VITE_ADMIN_ROUTE_PATH

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<Submit />} />
            {adminRoutePath && (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path={adminRoutePath}
                  element={
                    <ProtectedRoute>
                      <Investigator />
                    </ProtectedRoute>
                  }
                />
              </>
            )}
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/legal" element={<Legal />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
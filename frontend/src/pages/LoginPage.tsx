import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import { ArrowBack, Security, VpnKey, QrCode } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const steps = ['ایمیل و رمز عبور', 'احراز هویت دو مرحله‌ای']

const LoginPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login, verifyMFA, requiresMFA, user } = useAuth()

  useEffect(() => {
    // Check if user has legitimate access to this login page
    const hasAdminAccess = sessionStorage.getItem('admin_access_attempted')
    if (!hasAdminAccess && !user) {
      // Direct access to login page without going through protected route
      navigate('/', { replace: true })
      return
    }

    // If user becomes authenticated, redirect to admin and clear flag
    if (user) {
      const adminRoutePath = import.meta.env.VITE_ADMIN_ROUTE_PATH
      if (adminRoutePath) {
        sessionStorage.removeItem('admin_access_attempted')
        navigate(adminRoutePath)
      }
    }
  }, [user, navigate])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // If MFA is required, the auth context will set requiresMFA to true
      // and the component will re-render to show the MFA step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود ناموفق')
    } finally {
      setLoading(false)
    }
  }

  const handleMfaVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await verifyMFA(email, totpCode)
      // Auth context will handle navigation on successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'کد TOTP نامعتبر')
    } finally {
      setLoading(false)
    }
  }



  // Update active step based on auth state
  useEffect(() => {
    if (requiresMFA) {
      setActiveStep(1)
    } else {
      setActiveStep(0)
    }
  }, [requiresMFA])

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Email & Password
        return (
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              ورود بازرسان
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleEmailLogin}>
              <TextField
                fullWidth
                label="آدرس ایمیل"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="رمز عبور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                required
                disabled={loading}
              />

              {/* Captcha */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
                  onSuccess={(token: string) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken(null)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !captchaToken}
                sx={{
                  background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0067a5 0%, #fe28a2 100%)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'ورود'}
              </Button>
            </Box>


          </Box>
        )

      case 1: // Two-Factor Authentication
        return (
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              احراز هویت دو مرحله‌ای
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
              کد ۶ رقمی را از برنامه احراز هویت خود وارد کنید
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleMfaVerification}>
              <TextField
                fullWidth
                label="کد TOTP"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                sx={{ mb: 3 }}
                required
                disabled={loading}
                inputProps={{
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                }}
                placeholder="000000"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || totpCode.length !== 6}
                sx={{
                  background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0067a5 0%, #fe28a2 100%)',
                  },
                  '&:disabled': {
                    background: '#ccc',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'تأیید و ورود'}
              </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => setActiveStep(0)}
                sx={{ color: '#1c39bb' }}
              >
                بازگشت به ورود
              </Button>
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d99058 0%, #c81d11 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Box sx={{
        py: 2,
        px: 3,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#32127a' }}>
              آرشیو عدالت - پورتال بازرسان
            </Typography>
            <Button
              endIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ color: '#1c39bb' }}
            >
              بازگشت به خانه
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ flex: 1, py: 8 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Security sx={{ fontSize: 80, color: '#1c39bb', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#32127a', mb: 2 }}>
                دسترسی امن بازرسان
              </Typography>
              <Typography variant="body1" sx={{ color: '#f77fb3', lineHeight: 1.6 }}>
                به پنل مدیریتی آرشیو عدالت با امنیت پیشرفته دسترسی پیدا کنید.
                احراز هویت دو مرحله‌ای تضمین می‌کند که فقط بازرسان مجاز بتوانند به داده‌های حساس شواهد دسترسی داشته باشند.
              </Typography>
            </Box>

            <Card sx={{
              background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
              color: 'white',
              borderRadius: 3,
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  ویژگی‌های امنیتی
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VpnKey sx={{ fontSize: 20 }} />
                    <Typography variant="body2">احراز هویت چندمرحله‌ای</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QrCode sx={{ fontSize: 20 }} />
                    <Typography variant="body2">کدهای زمانی TOTP</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security sx={{ fontSize: 20 }} />
                    <Typography variant="body2">ارتباطات رمزگذاری شده</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={24}
              sx={{
                p: 4,
                borderRadius: 4,
                background: 'white',
              }}
            >
              {/* Stepper */}
              <Box sx={{ mb: 4 }}>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{
                    '& .MuiStepConnector-root': {
                      display: 'none',
                    },
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {renderStepContent(activeStep)}
            </Paper>
          </Grid>
        </Grid>
      </Container>


    </Box>
  )
}

export default LoginPage
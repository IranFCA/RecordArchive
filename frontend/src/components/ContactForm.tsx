import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useTranslation } from '../hooks/useTranslation'
import { Turnstile } from '@marsidev/react-turnstile'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  captcha_token: string
}

interface ContactFormProps {
  onSuccess?: () => void
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    captcha_token: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string>('')

  const handleInputChange = (field: keyof ContactFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Use CAPTCHA token from state (set by callback)
      const submitData = {
        ...formData,
        captcha_token: captchaToken
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to send message')
      }

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        captcha_token: '',
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body1">
          {t('contact.form.success')}
        </Typography>
      </Alert>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label={t('contact.form.name')}
        value={formData.name}
        onChange={handleInputChange('name')}
        required
        sx={{ mb: 2 }}
        variant="outlined"
      />

      <TextField
        fullWidth
        label={t('contact.form.email')}
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        required
        sx={{ mb: 2 }}
        variant="outlined"
      />

      <TextField
        fullWidth
        label={t('contact.form.subject')}
        value={formData.subject}
        onChange={handleInputChange('subject')}
        required
        sx={{ mb: 2 }}
        variant="outlined"
      />

      <TextField
        fullWidth
        label={t('contact.form.message')}
        multiline
        rows={6}
        value={formData.message}
        onChange={handleInputChange('message')}
        required
        sx={{ mb: 3 }}
        variant="outlined"
        placeholder={t('contact.form.messagePlaceholder')}
      />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Turnstile
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
          onSuccess={setCaptchaToken}
          options={{
            theme: 'light',
            size: 'normal'
          }}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={loading || !captchaToken}
        sx={{
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        {loading ? <CircularProgress size={24} /> : t('contact.form.submit')}
      </Button>
    </Box>
  )
}

export default ContactForm
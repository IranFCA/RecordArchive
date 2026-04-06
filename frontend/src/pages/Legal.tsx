import React from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Card,
  CardContent,
  Button,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ArrowBack, Gavel, Security, Info } from '@mui/icons-material'
import { useTranslation } from '../hooks/useTranslation'

const Legal: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const legalSections = [
    {
      key: 'goodFaith',
      icon: <Security sx={{ fontSize: 24, color: 'primary.main' }} />,
    },
    {
      key: 'noGuarantee',
      icon: <Info sx={{ fontSize: 24, color: 'warning.main' }} />,
    },
    {
      key: 'responsibility',
      icon: <Gavel sx={{ fontSize: 24, color: 'error.main' }} />,
    },
    {
      key: 'privacy',
      icon: <Security sx={{ fontSize: 24, color: 'success.main' }} />,
    },
    {
      key: 'reviewAccess',
      icon: <Info sx={{ fontSize: 24, color: 'info.main' }} />,
    },
    {
      key: 'fileScanning',
      icon: <Security sx={{ fontSize: 24, color: 'primary.main' }} />,
    },
    {
      key: 'consent',
      icon: <Gavel sx={{ fontSize: 24, color: 'secondary.main' }} />,
    },
  ]

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4,
    }}>
      {/* Header */}
      <Box sx={{
        px: 3,
        mb: 4,
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#32127a' }}>
              {t('legal.pageTitle')}
            </Typography>
            <Button
              endIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ color: '#1c39bb' }}
            >
              {t('common.backToHome')}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Title Section */}
        <Paper sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
        }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            {t('legal.title')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
            {t('legal.introduction')}
          </Typography>
        </Paper>

        {/* Legal Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {legalSections.map((section) => (
            <Card
              key={section.key}
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{
                    p: 2,
                    borderRadius: '50%',
                    background: 'rgba(28, 57, 187, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {section.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: '#32127a',
                        mb: 2,
                      }}
                    >
                      {t(`legal.sections.${section.key}.title`)}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.8,
                        color: '#555',
                        fontSize: '1.1rem',
                      }}
                    >
                      {t(`legal.sections.${section.key}.content`)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Footer Notice */}
        <Paper sx={{
          p: 4,
          mt: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          textAlign: 'center',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {t('legalNotice.title')}
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.6, opacity: 0.9 }}>
            {t('legalNotice.content')}
          </Typography>
        </Paper>

        {/* Navigation */}
        <Box sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
        }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              borderColor: '#1c39bb',
              color: '#1c39bb',
              '&:hover': {
                borderColor: '#32127a',
                background: 'rgba(28, 57, 187, 0.04)',
              },
            }}
          >
            {t('common.backToHome')}
          </Button>
        </Box>
      </Container>
    </Box>
  )
}

export default Legal
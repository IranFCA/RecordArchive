import React from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Security, Assessment, People, Description } from '@mui/icons-material'
import { useTranslation } from '../hooks/useTranslation'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Persian Cultural Background Pattern */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0, 166, 147, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 60% 40%, rgba(247, 123, 179, 0.05) 0%, transparent 50%)
        `,
        backgroundSize: '200px 200px',
        pointerEvents: 'none',
      }} />
      {/* Header */}
      <Box sx={{
        py: 2,
        px: 3,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              {t('nav.platformTitle')}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 8 }}>
        <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            {t('home.title')}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              lineHeight: 1.6,
              fontSize: { xs: '1.2rem', md: '1.5rem' }
            }}
          >
            {t('home.subtitle')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'white',
                color: '#1c39bb',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                }
              }}
              onClick={() => navigate('/submit')}
            >
              {t('nav.submitEvidence')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                background: 'white',
                color: '#1c39bb',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                '&:hover': {
                  background: 'rgba(255,255,255,0.9)',
                }
              }}
              onClick={() => alert('Admin portal is only available for admins!')}
            >
              {t('nav.investigatorAccess')}
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} className="persian-pattern">
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            color: 'white',
            mb: 6,
            position: 'relative',
          }}
          className="persian-calligraphy"
        >
          <Box sx={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 80,
            height: 4,
            background: 'linear-gradient(90deg, var(--persian-gold), var(--persian-blue), var(--persian-red))',
            borderRadius: 2,
          }} />
          {t('home.features.title')}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={3}>
            <Card className="persian-card miniature-frame" sx={{
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-8px) scale(1.02)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box className="islamic-star" sx={{ mb: 2 }}>
                  <Security sx={{ fontSize: 48, color: 'var(--persian-blue)', position: 'relative', zIndex: 1 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--persian-purple)' }} className="persian-accent">
                  {t('home.features.secureSubmissions.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('home.features.secureSubmissions.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card className="persian-card miniature-frame" sx={{
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-8px) scale(1.02)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box className="islamic-star" sx={{ mb: 2 }}>
                  <Assessment sx={{ fontSize: 48, color: 'var(--persian-red)', position: 'relative', zIndex: 1 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--persian-purple)' }} className="persian-accent">
                  {t('home.features.evidenceManagement.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('home.features.evidenceManagement.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card className="persian-card miniature-frame" sx={{
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-8px) scale(1.02)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box className="islamic-star" sx={{ mb: 2 }}>
                  <People sx={{ fontSize: 48, color: 'var(--persian-green)', position: 'relative', zIndex: 1 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--persian-purple)' }} className="persian-accent">
                  {t('home.features.entityTracking.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('home.features.entityTracking.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card className="persian-card miniature-frame" sx={{
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-8px) scale(1.02)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box className="islamic-star" sx={{ mb: 2 }}>
                  <Description sx={{ fontSize: 48, color: 'var(--persian-orange)', position: 'relative', zIndex: 1 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--persian-purple)' }} className="persian-accent">
                  {t('home.features.documentArchival.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('home.features.documentArchival.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{
        py: 4,
        background: 'rgba(0,0,0,0.2)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Button
              onClick={() => navigate('/about')}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'underline',
                textTransform: 'none',
                fontSize: '0.9rem',
                mr: 3,
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'transparent',
                }
              }}
            >
              {t('nav.aboutProject')}
            </Button>
            <Button
              onClick={() => navigate('/legal')}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'underline',
                textTransform: 'none',
                fontSize: '0.9rem',
                mr: 0.5,
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'transparent',
                }
              }}
            >
              {t('nav.legalNotice')}
            </Button>
            <Button
              onClick={() => navigate('/support')}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'underline',
                textTransform: 'none',
                fontSize: '0.9rem',
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'transparent',
                }
              }}
            >
              {t('nav.supportDonate')}
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            {t('home.footer.copyright')}
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Home

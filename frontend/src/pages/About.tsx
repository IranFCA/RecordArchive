import React from 'react'
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ArrowBack, Security, Assessment, People, Description, Gavel, Shield } from '@mui/icons-material'
import { useTranslation } from '../hooks/useTranslation'

const About: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #d99058 0%, #c81d11 100%)',
      py: 4,
    }}>
      {/* Header */}
      <Box sx={{
        px: 3,
        mb: 4,
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('about.pageTitle')}
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
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
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
            {t('about.title')}
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
            {t('about.subtitle')}
          </Typography>
        </Box>

        {/* Mission Section */}
        <Card sx={{
          mb: 6,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#32127a' }}>
              {t('about.mission.title')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, fontSize: '1.1rem' }}>
              {t('about.mission.description1')}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, fontSize: '1.1rem' }}>
              {t('about.mission.description2')}
            </Typography>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Typography variant="h3" sx={{ mb: 4, textAlign: 'center', fontWeight: 600, color: 'white' }}>
          {t('about.capabilities.title')}
        </Typography>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Security sx={{ fontSize: 48, color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  {t('about.capabilities.secureSubmissions.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('about.capabilities.secureSubmissions.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Assessment sx={{ fontSize: 48, color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  {t('about.capabilities.evidenceManagement.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('about.capabilities.evidenceManagement.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <People sx={{ fontSize: 48, color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  {t('about.capabilities.entityTracking.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('about.capabilities.entityTracking.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Description sx={{ fontSize: 48, color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  {t('about.capabilities.documentArchival.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('about.capabilities.documentArchival.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Gavel sx={{ fontSize: 48, color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  {t('about.capabilities.legalCompliance.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('about.capabilities.legalCompliance.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              transition: 'transform 0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Shield sx={{ fontSize: 48, color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  {t('about.capabilities.privacyProtection.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {t('about.capabilities.privacyProtection.description')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Security Notice */}
        <Card sx={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#32127a' }}>
              {t('about.security.title')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
              {t('about.security.description')}
            </Typography>
            <Box component="ul" sx={{ pl: 3, lineHeight: 1.8 }}>
              {[
                'رمزگذاری برای انتقال و نگهداری داده‌ها',
                'امکان ارسال ناشناس بدون اطلاعات شخصی',
                'احراز هویت چندمرحله‌ای برای دسترسی‌های مدیریتی',
                'بررسی یکپارچگی فایل‌ها با استفاده از هش رمزنگاری',
                'بازرسی‌های امنیتی منظم و بهبود مستمر کنترل‌ها',
                'ثبت و نگهداری امن سوابق مربوط به شواهد و پردازش آن‌ها',
              ].map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </Box>
            <Typography variant="body1" sx={{ mt: 3, fontStyle: 'italic' }}>
              {t('about.security.commitment')}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default About
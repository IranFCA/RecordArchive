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
import { ArrowBack, Favorite, VolunteerActivism, ContactMail } from '@mui/icons-material'
import { useTranslation } from '../hooks/useTranslation'
import ContactForm from '../components/ContactForm'

const Support: React.FC = () => {
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
              {t('support.pageTitle')}
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
            {t('support.title')}
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
            {t('support.subtitle')}
          </Typography>
        </Box>

        {/* Ways to Support */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Favorite sx={{ fontSize: 48, color: '#c81d11', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#32127a' }}>
                  {t('support.whySupport.title')}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  {t('support.whySupport.description')}
                </Typography>
                <Box component="ul" sx={{ textAlign: 'right', pl: 3, lineHeight: 1.8 }}>
                  {[
                    'زیرساخت امن و رمزگذاری شده را حفظ کنیم',
                    'ابزارهای پیشرفته تحلیل شواهد را توسعه دهیم',
                    'دسترسی ۲۴/۷ پلتفرم و نظارت را تضمین کنیم',
                    'اقدامات امنیتی اضافی و بازرسی‌ها را پیاده‌سازی کنیم',
                    'از انطباق قانونی و استانداردهای بین‌المللی حمایت کنیم',
                    'تیم متخصصان امنیتی و توسعه را گسترش دهیم',
                  ].map((benefit: string, index: number) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{
              height: '100%',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <VolunteerActivism sx={{ fontSize: 48, color: '#00a693', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#32127a' }}>
                  {t('support.otherWays.title')}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                  {t('support.otherWays.description')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    '🛠️ داوطلب مهارت‌های فنی',
                    '📢 انتشار آگاهی',
                    '🔍 ارائه سرنخ‌های شواهد',
                    '📝 تخصص حقوقی',
                  ].map((option: string, index: number) => (
                    <Button
                      key={index}
                      variant="outlined"
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        borderColor: '#00a693',
                        color: '#00a693',
                        '&:hover': {
                          borderColor: '#00a693',
                          backgroundColor: 'rgba(0, 166, 147, 0.1)',
                        }
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>



        {/* Cryptocurrency Donation Section */}
        <Card sx={{
          mb: 6,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#32127a' }}>
              {t('support.crypto.title')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', lineHeight: 1.7 }}>
              {t('support.crypto.description')}
            </Typography>

            <Grid container spacing={4}>
              {/* BTC Donation */}
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <img
                      src="/btc.jpg"
                      alt="Bitcoin QR Code"
                      style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('support.crypto.bitcoin')}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigator.clipboard.writeText('bc1qplx6tq9crm5hwszsq9ujac20znv9xpcqpr7mwr')
                      alert('Bitcoin address copied to clipboard!')
                    }}
                    sx={{
                      borderColor: '#f7931a',
                      color: '#f7931a',
                      '&:hover': {
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                      }
                    }}
                  >
                    {t('support.crypto.copyAddress')}
                  </Button>
                </Box>
              </Grid>

              {/* USDT Donation */}
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    <img
                      src="/usdt.jpg"
                      alt="USDT QR Code"
                      style={{ width: '150px', height: '150px', borderRadius: '8px' }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('support.crypto.tether')}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      navigator.clipboard.writeText('0x2a701230ed34f01afcA0F0079B821fd33dC7afe2')
                      alert('USDT address copied to clipboard!')
                    }}
                    sx={{
                      borderColor: '#26a17b',
                      color: '#26a17b',
                      '&:hover': {
                        borderColor: '#26a17b',
                        backgroundColor: 'rgba(38, 161, 123, 0.1)',
                      }
                    }}
                  >
                    {t('support.crypto.copyAddress')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Impact Section */}
        <Card sx={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 600, color: '#32127a' }}>
              {t('support.impact.title')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', lineHeight: 1.7 }}>
              {t('support.impact.description')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#00a693', fontWeight: 700, mb: 1 }}>
                    ۱۰۰%
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('support.impact.metrics.securityFocused.title')}
                  </Typography>
                  <Typography variant="body2">
                    {t('support.impact.metrics.securityFocused.description')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#00a693', fontWeight: 700, mb: 1 }}>
                    ۲۴/۷
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('support.impact.metrics.platformUptime.title')}
                  </Typography>
                  <Typography variant="body2">
                    {t('support.impact.metrics.platformUptime.description')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#00a693', fontWeight: 700, mb: 1 }}>
                    ∞
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('support.impact.metrics.evidenceProtected.title')}
                  </Typography>
                  <Typography variant="body2">
                    {t('support.impact.metrics.evidenceProtected.description')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Box sx={{ mt: 6 }}>
          <Card sx={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <ContactMail sx={{ fontSize: 48, color: '#32127a', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#32127a', mb: 2 }}>
                  {t('support.contactForm.title')}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  {t('support.contactForm.description')}
                </Typography>
              </Box>
              <ContactForm />
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}

export default Support
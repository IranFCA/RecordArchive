import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Select,
  FormControl,
  MenuItem,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import { ArrowBack, Security, Logout, Shield, CheckCircle, Cancel, Delete, Download, Comment } from '@mui/icons-material'

interface Submission {
  id: string
  title: string
  description: string
  status: string
  created_at: string
  is_anonymous: boolean
  submitter_contact?: string
  files?: string[]
  investigator_notes?: string
}

interface Contact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

const Investigator: React.FC = () => {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [contactsLoading, setContactsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'submissions' | 'contacts' | 'archive'>('submissions')
  const [showMfaDialog, setShowMfaDialog] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [commentText, setCommentText] = useState('')

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

  useEffect(() => {
    fetchSubmissions()
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setContactsLoading(true)
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch contacts')
      }

      const data = await response.json()
      setContacts(data)
    } catch (err) {
      console.error('Failed to load contacts:', err)
    } finally {
      setContactsLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${apiBaseUrl}/api/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }

      const data = await response.json()
      setSubmissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'unreviewed': return t('investigator.table.status.pending')
      case 'corroborated': return t('investigator.table.status.approved')
      case 'rejected': return t('investigator.table.status.rejected')
      case 'under_review': return t('investigator.table.status.underReview')
      case 'needs_info': return t('investigator.table.status.needsInfo')
      case 'archived': return t('investigator.table.status.archived')
      case 'duplicate': return t('investigator.table.status.duplicate')
      default: return status
    }
  }

  const handleSetupMfa = async () => {
    try {
      setMfaLoading(true)
      const response = await fetch(`${apiBaseUrl}/api/auth/setup-mfa?email=${encodeURIComponent(user?.email || '')}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setQrCodeUrl(data.qr_code_url)
        setShowMfaDialog(true)
      } else {
        alert('خطا در راه‌اندازی MFA')
      }
    } catch (err) {
      alert('خطای شبکه')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleEnableMfa = async () => {
    try {
      setMfaLoading(true)
      const response = await fetch(`${apiBaseUrl}/api/auth/enable-mfa?email=${encodeURIComponent(user?.email || '')}&totp_code=${encodeURIComponent(mfaCode)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert('MFA با موفقیت فعال شد!')
        setShowMfaDialog(false)
        setQrCodeUrl('')
        setMfaCode('')
      } else {
        alert('کد TOTP نامعتبر است')
      }
    } catch (err) {
      alert('خطای شبکه')
    } finally {
      setMfaLoading(false)
    }
  }

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      setActionLoading(submissionId)
      const response = await fetch(`${apiBaseUrl}/api/submissions/${submissionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh submissions
        await fetchSubmissions()
        alert(`وضعیت پرونده به "${getStatusText(newStatus)}" تغییر یافت`)
      } else {
        alert('خطا در تغییر وضعیت')
      }
    } catch (err) {
      alert('خطای شبکه')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (submissionId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این پرونده را حذف کنید؟')) {
      return
    }

    try {
      setActionLoading(submissionId)
      const response = await fetch(`${apiBaseUrl}/api/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from local state
        setSubmissions(prev => prev.filter(s => s.id !== submissionId))
        alert('پرونده با موفقیت حذف شد')
      } else {
        alert('خطا در حذف پرونده')
      }
    } catch (err) {
      alert('خطای شبکه')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟')) {
      return
    }

    try {
      setActionLoading(contactId)
      const response = await fetch(`${apiBaseUrl}/api/contact/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from local state
        setContacts(prev => prev.filter(c => c.id !== contactId))
        alert('پیام با موفقیت حذف شد')
      } else {
        alert('خطا در حذف پیام')
      }
    } catch (err) {
      alert('خطای شبکه')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDownload = async (submissionId: string, filename: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/submissions/${submissionId}/files/${filename}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename.split('_', 1)[1] || filename // Remove hash prefix
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('خطا در دانلود فایل')
      }
    } catch (err) {
      alert('خطای شبکه')
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
              {t('investigator.pageTitle')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#32127a' }}>
                {t('common.welcome')}, {user?.email}
              </Typography>
              <Button
                startIcon={<Logout />}
                onClick={handleLogout}
                variant="outlined"
                sx={{ color: '#1c39bb', borderColor: '#1c39bb' }}
              >
                {t('common.logout')}
              </Button>
              <Button
                endIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{ color: '#1c39bb' }}
              >
                {t('common.backToHome')}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ flex: 1, py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Security sx={{ fontSize: 80, color: '#1c39bb', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#32127a', mb: 2 }}>
                {t('investigator.title')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#f77fb3', lineHeight: 1.6 }}>
                {t('investigator.welcome')}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 3, background: 'white' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                  <Tab label={`📋 ${t('investigator.tabs.submissions')} (${submissions.filter(s => s.status === 'UNREVIEWED').length})`} value="submissions" />
                  <Tab label={`💬 ${t('investigator.tabs.contacts')} (${contacts.length})`} value="contacts" />
                  <Tab label={`📦 ${t('investigator.tabs.archive')} (${submissions.filter(s => s.status !== 'UNREVIEWED').length})`} value="archive" />
                </Tabs>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {activeTab === 'submissions' && (
                <>
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : submissions.filter(s => s.status === 'UNREVIEWED').length === 0 ? (
                    <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                      {t('investigator.table.noData.submissions')}
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>{t('investigator.table.headers.title')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.status')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.date')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.type')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.files')}</strong></TableCell>
                            <TableCell><strong>عملیات سریع</strong></TableCell>
                            <TableCell><strong>مدیریت وضعیت</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {submissions.filter(s => s.status === 'UNREVIEWED').map((submission) => (
                            <TableRow key={submission.id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {submission.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {submission.description.length > 50
                                    ? `${submission.description.substring(0, 50)}...`
                                    : submission.description}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusText(submission.status)}
                                  color={getStatusColor(submission.status) as any}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(submission.created_at).toLocaleDateString('fa-IR')}
                              </TableCell>
                              <TableCell>
                                {submission.is_anonymous ? t('investigator.table.type.anonymous') : t('investigator.table.type.identified')}
                              </TableCell>
                              <TableCell>
                                {submission.files && submission.files.length > 0 ? (
                                  <Box>
                                    {submission.files.map((file, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                          {file.split('_', 1)[1] || file}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDownload(submission.id, file)}
                                          sx={{ p: 0.5, color: '#1c39bb' }}
                                          title="دانلود فایل"
                                        >
                                          <Download sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                      </Box>
                                    ))}
                                  </Box>
                                ) : (
                                  t('investigator.table.noFiles')
                                )}
                              </TableCell>
                              {/* Quick Actions Column */}
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusChange(submission.id, 'CORROBORATED')}
                                    disabled={actionLoading === submission.id}
                                    sx={{ color: 'success.main' }}
                                    title="تأیید سریع"
                                  >
                                    {actionLoading === submission.id ? <CircularProgress size={16} /> : <CheckCircle />}
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={() => handleStatusChange(submission.id, 'REJECTED')}
                                    disabled={actionLoading === submission.id}
                                    sx={{ color: 'error.main' }}
                                    title="رد سریع"
                                  >
                                    {actionLoading === submission.id ? <CircularProgress size={16} /> : <Cancel />}
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedSubmission(submission)
                                      setCommentText(submission.investigator_notes || '')
                                      setShowCommentDialog(true)
                                    }}
                                    sx={{ color: '#ff9800' }}
                                    title="یادداشت بازرس"
                                  >
                                    <Comment />
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(submission.id)}
                                    disabled={actionLoading === submission.id}
                                    sx={{ color: 'error.main' }}
                                    title="حذف پرونده"
                                  >
                                    {actionLoading === submission.id ? <CircularProgress size={16} /> : <Delete />}
                                  </IconButton>
                                </Box>
                              </TableCell>

                              {/* Status Management Column */}
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <Select
                                      value={submission.status}
                                      onChange={(e) => handleStatusChange(submission.id, e.target.value)}
                                      disabled={actionLoading === submission.id}
                                      sx={{ fontSize: '0.875rem' }}
                                    >
                                      <MenuItem value="UNREVIEWED">⏳ {t('investigator.table.status.pending')}</MenuItem>
                                      <MenuItem value="UNDER_REVIEW">🔍 {t('investigator.table.status.underReview')}</MenuItem>
                                      <MenuItem value="CORROBORATED">✅ {t('investigator.table.status.approved')}</MenuItem>
                                      <MenuItem value="REJECTED">❌ {t('investigator.table.status.rejected')}</MenuItem>
                                      <MenuItem value="NEEDS_INFO">❓ {t('investigator.table.status.needsInfo')}</MenuItem>
                                      <MenuItem value="ARCHIVED">📦 {t('investigator.table.status.archived')}</MenuItem>
                                      <MenuItem value="DUPLICATE">🔄 {t('investigator.table.status.duplicate')}</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}

              {activeTab === 'archive' && (
                <>
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : submissions.filter(s => s.status !== 'UNREVIEWED').length === 0 ? (
                    <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                      هیچ پرونده بایگانی‌شده‌ای یافت نشد.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>{t('investigator.table.headers.title')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.status')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.date')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.type')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.files')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.actions')}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {submissions.filter(s => s.status !== 'UNREVIEWED').map((submission) => (
                            <TableRow key={submission.id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {submission.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {submission.description.length > 50
                                    ? `${submission.description.substring(0, 50)}...`
                                    : submission.description}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={getStatusText(submission.status)}
                                  color={getStatusColor(submission.status) as any}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(submission.created_at).toLocaleDateString('fa-IR')}
                              </TableCell>
                              <TableCell>
                                {submission.is_anonymous ? t('investigator.table.type.anonymous') : t('investigator.table.type.identified')}
                              </TableCell>
                              <TableCell>
                                {submission.files && submission.files.length > 0 ? (
                                  <Box>
                                    {submission.files.map((file, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                          {file.split('_', 1)[1] || file}
                                        </Typography>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDownload(submission.id, file)}
                                          sx={{ p: 0.5, color: '#1c39bb' }}
                                          title="دانلود فایل"
                                        >
                                          <Download sx={{ fontSize: '1rem' }} />
                                        </IconButton>
                                      </Box>
                                    ))}
                                  </Box>
                                ) : (
                                  t('investigator.table.noFiles')
                                )}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  {/* Comment Action */}
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedSubmission(submission)
                                      setCommentText(submission.investigator_notes || '')
                                      setShowCommentDialog(true)
                                    }}
                                    sx={{ color: '#ff9800' }}
                                    title="یادداشت بازرس"
                                  >
                                    <Comment />
                                  </IconButton>

                                  {/* File Downloads */}
                                  {submission.files && submission.files.length > 0 && (
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDownload(submission.id, submission.files![0])}
                                      sx={{ color: '#1c39bb' }}
                                      title="دانلود فایل"
                                    >
                                      <Download />
                                    </IconButton>
                                  )}

                                  {/* Delete Action */}
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(submission.id)}
                                    disabled={actionLoading === submission.id}
                                    sx={{ color: 'error.main' }}
                                    title="حذف"
                                  >
                                    {actionLoading === submission.id ? <CircularProgress size={16} /> : <Delete />}
                                  </IconButton>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}

              {activeTab === 'contacts' && (
                <>
                  {contactsLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : contacts.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                      {t('investigator.table.noData.contacts')}
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>{t('investigator.table.headers.name')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.email')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.subject')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.message')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.date')}</strong></TableCell>
                            <TableCell><strong>{t('investigator.table.headers.actions')}</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {contacts.map((contact) => (
                            <TableRow key={contact.id} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {contact.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {contact.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {contact.subject}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 300 }}>
                                  {contact.message.length > 100
                                    ? `${contact.message.substring(0, 100)}...`
                                    : contact.message}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {new Date(contact.created_at).toLocaleDateString('fa-IR')}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteContact(contact.id)}
                                  sx={{ color: 'error.main' }}
                                  title="حذف پیام"
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: '#32127a' }}>
                {t('investigator.account.title')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t('investigator.account.email')}:</strong> {user?.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>{t('investigator.account.role')}:</strong> {user?.is_admin ? t('investigator.account.admin') : t('investigator.account.user')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                {t('investigator.account.lastLogin')}: {new Date().toLocaleString('fa-IR')}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  startIcon={<Shield />}
                  onClick={handleSetupMfa}
                  disabled={mfaLoading}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0067a5 0%, #fe28a2 100%)',
                    }
                  }}
                >
                  {mfaLoading ? <CircularProgress size={20} /> : t('investigator.account.setupMfa')}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* MFA Setup Dialog */}
      <Dialog open={showMfaDialog} onClose={() => setShowMfaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
          {t('investigator.mfaSetup.title')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {t('investigator.mfaSetup.description')}
          </Typography>

          {qrCodeUrl && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img
                src={qrCodeUrl}
                alt={t('investigator.mfaSetup.qrAlt')}
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            </Box>
          )}

          <TextField
            fullWidth
            label={t('investigator.mfa.totpCode')}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            sx={{ mb: 3 }}
            required
            inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' } }}
            placeholder={t('investigator.mfa.placeholder')}
          />

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {t('investigator.mfaSetup.instructions')}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMfaDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleEnableMfa}
            disabled={mfaLoading || mfaCode.length !== 6}
            variant="contained"
          >
            {mfaLoading ? <CircularProgress size={20} /> : t('investigator.mfa.verifyLogin')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onClose={() => setShowCommentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          یادداشت‌های بازرس - {selectedSubmission?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="یادداشت‌های بازرس"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="یادداشت‌ها و تحلیل‌های خود را در مورد این پرونده اینجا وارد کنید..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCommentDialog(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={async () => {
              if (selectedSubmission) {
                try {
                  const response = await fetch(`${apiBaseUrl}/api/submissions/${selectedSubmission.id}/notes`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ investigator_notes: commentText }),
                  })

                  if (response.ok) {
                    // Update local state
                    setSubmissions(prev => prev.map(s =>
                      s.id === selectedSubmission.id
                        ? { ...s, investigator_notes: commentText }
                        : s
                    ))
                    setShowCommentDialog(false)
                    alert('یادداشت‌ها با موفقیت ذخیره شد')
                  } else {
                    alert('خطا در ذخیره یادداشت‌ها')
                  }
                } catch (err) {
                  alert('خطای شبکه')
                }
              }
            }}
            variant="contained"
          >
            ذخیره یادداشت‌ها
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  )
}

export default Investigator

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Container,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import {
  ArrowBack,
  CloudUpload,
  Send
} from '@mui/icons-material'
import { useTranslation } from '../hooks/useTranslation'

const steps = ['اطلاعات شخصی', 'جزئیات شواهد', 'اطلاعات موجودیت‌ها', 'بررسی و ارسال']

const Submit: React.FC = () => {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    // Personal Info
    anonymous: true,
    name: '',
    email: '',
    phone: '',

    // Evidence Details
    title: '',
    description: '',
    evidenceType: '',
    dateOfIncident: '',
    location: '',
    documents: [] as File[],

    // Backend fields
    country: '',
    source_basis: '',
    submitter_contact: '',

    // Entity Information
    entities: [] as string[],
    entityName: '',
    entityType: '',
    relationship: '',

    // Additional
    urgency: 'normal',
    additionalNotes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // File upload restrictions (match backend limits)
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB
  const MAX_FILES = 5

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    // Client-side validation
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: نوع فایل مجاز نیست`)
        continue
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: فایل خیلی بزرگ است (حداکثر ${MAX_FILE_SIZE / (1024 * 1024)}MB)`)
        continue
      }

      validFiles.push(file)
    }

    // Check total file count
    const totalFiles = formData.documents.length + validFiles.length
    if (totalFiles > MAX_FILES) {
      errors.push(`تعداد فایل‌ها زیاد است. حداکثر ${MAX_FILES} فایل مجاز است.`)
      return
    }

    // Check total size
    const currentTotalSize = formData.documents.reduce((sum, f) => sum + f.size, 0)
    const newTotalSize = validFiles.reduce((sum, f) => sum + f.size, 0)
    if (currentTotalSize + newTotalSize > MAX_TOTAL_SIZE) {
      errors.push(`حجم کل آپلود از حد ${MAX_TOTAL_SIZE / (1024 * 1024)}MB تجاوز خواهد کرد.`)
      return
    }

    // Show errors if any
    if (errors.length > 0) {
      alert(`خطاهای آپلود:\n${errors.join('\n')}`)
      return
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...validFiles]
    }))
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const addEntity = () => {
    if (formData.entityName && formData.entityType) {
      const entityString = `${formData.entityName} (${formData.entityType})`
      setFormData(prev => ({
        ...prev,
        entities: [...prev.entities, entityString],
        entityName: '',
        entityType: '',
        relationship: ''
      }))
    }
  }

  const removeEntity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      entities: prev.entities.filter((_, i) => i !== index)
    }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0: // Personal Info
        if (!formData.anonymous && !formData.name.trim()) {
          newErrors.name = 'نام الزامی است'
        }
        if (!formData.anonymous && !formData.email.trim()) {
          newErrors.email = 'ایمیل الزامی است'
        }
        break
      case 1: // Evidence Details
        if (!formData.title.trim()) {
          newErrors.title = 'عنوان الزامی است'
        }
        if (!formData.description.trim()) {
          newErrors.description = 'توضیحات الزامی است'
        } else if (formData.description.trim().length < 10) {
          newErrors.description = 'توضیحات باید حداقل ۱۰ کاراکتر باشد'
        }
        if (!formData.evidenceType) {
          newErrors.evidenceType = 'نوع شواهد الزامی است'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!captchaToken) {
      alert('لطفاً تأیید CAPTCHA را کامل کنید')
      return
    }

    setLoading(true)
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()

      // Add form fields
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('relationship_type', 'unknown') // Default for now
      if (formData.country) formDataToSend.append('country', formData.country)
      if (formData.source_basis) formDataToSend.append('source_basis', formData.source_basis)
      if (formData.dateOfIncident) formDataToSend.append('date_range_start', formData.dateOfIncident)
      if (formData.dateOfIncident) formDataToSend.append('date_range_end', formData.dateOfIncident)
      if (formData.submitter_contact) formDataToSend.append('submitter_contact', formData.submitter_contact)
      formDataToSend.append('is_anonymous', formData.anonymous.toString())
      formDataToSend.append('captcha_token', captchaToken)

      // Add files
      formData.documents.forEach((file) => {
        formDataToSend.append('files', file)
      })

      // Send to backend
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
      const response = await fetch(`${apiBaseUrl}/api/submissions/upload`, {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Submission successful:', result)
        setSubmitSuccess(true)
      } else {
        const error = await response.json()
        alert(`ارسال ناموفق: ${error.detail || 'خطای ناشناخته'}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('خطای شبکه. لطفاً دوباره تلاش کنید.')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Personal Info
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              اطلاعات شخصی
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                آیا می‌خواهید به صورت ناشناس ارسال کنید؟
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={formData.anonymous ? 'contained' : 'outlined'}
                  onClick={() => handleInputChange('anonymous', true)}
                  sx={{ flex: 1 }}
                >
                  بله، ناشناس
                </Button>
                <Button
                  variant={!formData.anonymous ? 'contained' : 'outlined'}
                  onClick={() => handleInputChange('anonymous', false)}
                  sx={{ flex: 1 }}
                >
                  ارائه اطلاعات تماس
                </Button>
              </Box>
            </FormControl>

            {!formData.anonymous && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="نام کامل"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
                <TextField
                  fullWidth
                  label="آدرس ایمیل"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
                <TextField
                  fullWidth
                  label="شماره تلفن (اختیاری)"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              <strong>نکته حریم خصوصی:</strong> تمام ارسال‌ها به صورت محرمانه مدیریت می‌شوند.
              {formData.anonymous ? ' ارسال‌های ناشناس به حفظ هویت شما کمک می‌کنند.' : ' اطلاعات تماس شما فقط برای اهداف تأیید استفاده خواهد شد.'}
            </Alert>
          </Box>
        )

      case 1: // Evidence Details
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              جزئیات شواهد
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="عنوان ارسال"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
              />

              <TextField
                fullWidth
                label="توضیحات مفصل"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="لطفاً تا حد امکان جزئیات کاملی درباره شواهد ارائه دهید (حداقل ۱۰ کاراکتر)، شامل زمینه، تاریخ‌ها و هر اطلاعات پس‌زمینه مرتبط."
                required
              />

              <FormControl fullWidth error={!!errors.evidenceType}>
                <InputLabel>نوع شواهد</InputLabel>
                <Select
                  value={formData.evidenceType}
                  onChange={(e) => handleInputChange('evidenceType', e.target.value)}
                  label="نوع شواهد"
                >
                  <MenuItem value="document">سند</MenuItem>
                  <MenuItem value="financial_record">سوابق مالی</MenuItem>
                  <MenuItem value="communication">ارتباطات</MenuItem>
                  <MenuItem value="photographic">شواهد عکاسی</MenuItem>
                  <MenuItem value="testimonial">گواهی</MenuItem>
                  <MenuItem value="other">سایر</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="تاریخ وقوع (در صورت امکان)"
                type="date"
                value={formData.dateOfIncident}
                onChange={(e) => handleInputChange('dateOfIncident', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="مکان (در صورت امکان)"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="شهر، کشور یا جزئیات مکان خاص"
              />

              {/* File Upload */}
              <Box>
                <input
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="evidence-files"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="evidence-files">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{ width: '100%', py: 2, borderStyle: 'dashed' }}
                  >
                    آپلود فایل‌های شواهد
                  </Button>
                </label>

                <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2">
                    <strong>نکته امنیتی:</strong> تمام فایل‌های آپلود شده به طور خودکار برای ویروس‌ها
                    و بدافزارها اسکن می‌شوند. یکپارچگی فایل با استفاده از هش رمزنگاری تأیید می‌شود.
                  </Typography>
                </Alert>

                {formData.documents.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      فایل‌های آپلود شده:
                    </Typography>
                    {formData.documents.map((file, index) => (
                      <Chip
                        key={index}
                        label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                        onDelete={() => removeFile(index)}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )

      case 2: // Entity Information
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              اطلاعات موجودیت‌ها
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              لطفاً هر موجودیتی (افراد، سازمان‌ها، شرکت‌ها) که در شواهد شما ذکر شده را شناسایی کنید.
              این کار به ما کمک می‌کند تا اطلاعات را بهتر درک و دسته‌بندی کنیم.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="نام موجودیت"
                value={formData.entityName}
                onChange={(e) => handleInputChange('entityName', e.target.value)}
                placeholder="نام کامل شخص یا سازمان"
              />

              <FormControl fullWidth>
                <InputLabel>نوع موجودیت</InputLabel>
                <Select
                  value={formData.entityType}
                  onChange={(e) => handleInputChange('entityType', e.target.value)}
                  label="نوع موجودیت"
                >
                  <MenuItem value="individual">فرد</MenuItem>
                  <MenuItem value="company">شرکت</MenuItem>
                  <MenuItem value="organization">سازمان</MenuItem>
                  <MenuItem value="government">نهاد دولتی</MenuItem>
                  <MenuItem value="other">سایر</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="رابطه/نقش (اختیاری)"
                value={formData.relationship}
                onChange={(e) => handleInputChange('relationship', e.target.value)}
                placeholder="این موجودیت چگونه به شواهد مرتبط است؟"
              />

              <Button
                variant="outlined"
                onClick={addEntity}
                disabled={!formData.entityName || !formData.entityType}
                sx={{ mt: 1 }}
              >
                افزودن موجودیت
              </Button>
            </Box>

            {formData.entities.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  موجودیت‌های اضافه شده:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.entities.map((entity, index) => (
                    <Chip
                      key={index}
                      label={entity}
                      onDelete={() => removeEntity(index)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>اولویت ارسال</InputLabel>
              <Select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                label="اولویت ارسال"
              >
                <MenuItem value="low">کم - اطلاعات عمومی</MenuItem>
                <MenuItem value="normal">معمولی - اولویت استاندارد</MenuItem>
                <MenuItem value="high">زیاد - اطلاعات حساس به زمان</MenuItem>
                <MenuItem value="critical">بحرانی - نیاز به توجه فوری</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="یادداشت‌های اضافی (اختیاری)"
              multiline
              rows={3}
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="هر اطلاعات یا زمینه اضافی که می‌خواهید ارائه دهید"
            />
          </Box>
        )

      case 3: // Review & Submit
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
              بررسی و ارسال
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              لطفاً قبل از ارسال، ارسال خود را به دقت بررسی کنید. پس از ارسال، شماره تأیید دریافت خواهید کرد.
            </Alert>

            {/* Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>خلاصه ارسال</Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">نوع ارسال:</Typography>
                    <Typography variant="body1">{formData.anonymous ? 'ناشناس' : 'با اطلاعات تماس'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">نوع شواهد:</Typography>
                    <Typography variant="body1">{formData.evidenceType}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">عنوان:</Typography>
                    <Typography variant="body1">{formData.title}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">موجودیت‌ها:</Typography>
                    <Typography variant="body1">
                      {formData.entities.length > 0 ? formData.entities.join(', ') : 'هیچ‌کدام مشخص نشده'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">فایل‌ها:</Typography>
                    <Typography variant="body1">{formData.documents.length} فایل</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">اولویت:</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{formData.urgency}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Captcha */}
            {!submitSuccess && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
                  onSuccess={(token: string) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken(null)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </Box>
            )}

            {submitSuccess ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6">ارسال موفق!</Typography>
                <Typography variant="body2">
                  شواهد شما با موفقیت ارسال شد. به زودی ایمیل تأیید دریافت خواهید کرد.
                  شماره مرجع ارسال شما: <strong>JA-{Date.now()}</strong>
                </Typography>
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/')}
                  sx={{ px: 4 }}
                >
                  بازگشت به خانه
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSubmit}
                  disabled={!captchaToken || loading}
                  sx={{
                    px: 4,
                    background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0067a5 0%, #fe28a2 100%)',
                    },
                    '&:disabled': {
                      background: '#ccc',
                    }
                  }}
                >
                  {loading ? 'در حال ارسال...' : 'ارسال شواهد'}
                </Button>
              </Box>
            )}
          </Box>
        )

      default:
        return null
    }
  }

  if (submitSuccess) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
              {t('submit.success.completedTitle')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 3 }}>
              {t('submit.success.completedThankYou')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              {t('submit.success.completedDescription')}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0067a5 0%, #fe28a2 100%)',
                }
              }}
            >
              بازگشت به خانه
            </Button>
          </Paper>
        </Container>
      </Box>
    )
  }

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
              آرشیو عدالت - ارسال شواهد
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

      <Container maxWidth="lg">
        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
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
        </Paper>

        {/* Step Content */}
        <Paper sx={{ p: 4, borderRadius: 3, minHeight: 500 }}>
          {renderStepContent(activeStep)}
        </Paper>

        {/* Navigation */}
        {activeStep < steps.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0067a5 0%, #fe28a2 100%)',
                }
              }}

            >
              قبلی
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                background: 'linear-gradient(135deg, #1c39bb 0%, #32127a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0067a5 0%, #fe28a2 100%)',
                }
              }}
            >
              بعدی
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default Submit
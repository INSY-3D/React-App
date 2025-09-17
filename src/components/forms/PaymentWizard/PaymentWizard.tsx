import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SendIcon from '@mui/icons-material/Send'

import PaymentDetails from './PaymentDetails'
import BeneficiaryDetails from './BeneficiaryDetails'
import ReviewAndPay from './ReviewAndPay'
import { useNotifications } from '../../NotificationsProvider'
import api from '../../../lib/apiClient'

const steps = ['Payment Details', 'Beneficiary Info', 'Review & Pay']

interface PaymentData {
  paymentDetails: {
    amount: string
    currency: string
    reference: string
    purpose: string
  }
  beneficiaryDetails: {
    fullName: string
    bankName: string
    swiftCode: string
    accountNumber: string
    iban: string
    address: string
    city: string
    postalCode: string
    country: string
  }
}

export default function PaymentWizard() {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [stepValidation, setStepValidation] = useState<boolean[]>([false, false, false])
  const { notify } = useNotifications()

  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentDetails: {
      amount: '',
      currency: 'USD',
      reference: '',
      purpose: ''
    },
    beneficiaryDetails: {
      fullName: '',
      bankName: '',
      swiftCode: '',
      accountNumber: '',
      iban: '',
      address: '',
      city: '',
      postalCode: '',
      country: ''
    }
  })

  const handleStepValidation = (stepIndex: number, isValid: boolean) => {
    const newValidation = [...stepValidation]
    newValidation[stepIndex] = isValid
    setStepValidation(newValidation)
  }

  const handlePaymentDetailsChange = (data: any) => {
    setPaymentData(prev => ({ ...prev, paymentDetails: data }))
  }

  const handleBeneficiaryDetailsChange = (data: any) => {
    setPaymentData(prev => ({ ...prev, beneficiaryDetails: data }))
  }

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Submit payment to API
      await api.post('/api/v1/payments', {
        ...paymentData.paymentDetails,
        ...paymentData.beneficiaryDetails,
        type: 'international',
        status: 'pending_verification'
      })
      
      setIsComplete(true)
      notify({ 
        severity: 'success', 
        message: 'Payment submitted successfully and is pending verification.' 
      })
    } catch (error: any) {
      notify({ 
        severity: 'error', 
        message: error?.response?.data?.message || 'Failed to submit payment. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PaymentDetails
            data={paymentData.paymentDetails}
            onChange={handlePaymentDetailsChange}
            onValidation={(isValid) => handleStepValidation(0, isValid)}
          />
        )
      case 1:
        return (
          <BeneficiaryDetails
            data={paymentData.beneficiaryDetails}
            onChange={handleBeneficiaryDetailsChange}
            onValidation={(isValid) => handleStepValidation(1, isValid)}
          />
        )
      case 2:
        return (
          <ReviewAndPay
            data={paymentData}
            onValidation={(isValid) => handleStepValidation(2, isValid)}
          />
        )
      default:
        return null
    }
  }

  if (isComplete) {
    return (
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Payment Submitted Successfully
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Your international payment has been submitted and is now pending verification by our compliance team.
        </Typography>
        <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
          <Typography variant="subtitle2" fontWeight={600}>Next Steps:</Typography>
          <Typography variant="body2">
            • You will receive email notifications about the payment status<br />
            • Processing typically takes 1-3 business days<br />
            • The payment will appear in your transaction history
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          href="/payments" 
          sx={{ mt: 3 }}
        >
          View Payments
        </Button>
      </Paper>
    )
  }

  return (
    <Stack spacing={4} sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          New International Payment
        </Typography>
        <Typography color="text.secondary">
          Send money internationally through the SWIFT network with full compliance monitoring.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={stepValidation[index]}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4 }}>
        {renderStepContent(activeStep)}
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back
        </Button>

        <Box display="flex" gap={2}>
          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!stepValidation[activeStep]}
              endIcon={<ArrowForwardIcon />}
              variant="contained"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!stepValidation[activeStep] || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
              variant="contained"
              color="primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment'}
            </Button>
          )}
        </Box>
      </Box>
    </Stack>
  )
}

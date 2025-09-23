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
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [stepValidation, setStepValidation] = useState<boolean[]>([false, false, false])
  const [paymentId, setPaymentId] = useState<string | null>(null) // Track created payment ID
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const [isUpdatingBeneficiary, setIsUpdatingBeneficiary] = useState(false)
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

  const handleNext = async () => {
    if (activeStep === 0) {
      await createDraftPayment()
    } else if (activeStep === 1) {
      await updateBeneficiaryDetails()
    } else if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1)
    }
  }

  // Task 2 Compliant: Step 1 - Create DRAFT payment
  const createDraftPayment = async () => {
    setIsCreatingDraft(true)
    try {
      const response = await api.post('/api/v1/payments', {
        amount: paymentData.paymentDetails.amount,
        currency: paymentData.paymentDetails.currency,
        provider: 'SWIFT',
        idempotencyKey: `payment-${Date.now()}-${Math.random().toString(36).substring(2)}`
      })
      const createdPaymentId = response.data.paymentId || response.data.data?.id
      setPaymentId(createdPaymentId)
      setActiveStep(1)
      notify({ severity: 'success', message: 'Payment draft created successfully.' })
    } catch (error: any) {
      notify({ severity: 'error', message: error?.response?.data?.message || 'Failed to create payment draft. Please try again.' })
    } finally {
      setIsCreatingDraft(false)
    }
  }

  // Task 2 Compliant: Step 2 - Update beneficiary details
  const updateBeneficiaryDetails = async () => {
    if (!paymentId) {
      notify({ severity: 'error', message: 'Payment ID not found. Please start over.' })
      return
    }
    setIsUpdatingBeneficiary(true)
    try {
      await api.put(`/api/v1/payments/${paymentId}/beneficiary`, {
        beneficiaryName: paymentData.beneficiaryDetails.fullName,
        beneficiaryAccountNumber: paymentData.beneficiaryDetails.accountNumber,
        swiftBIC: paymentData.beneficiaryDetails.swiftCode,
        beneficiaryIban: paymentData.beneficiaryDetails.iban,
        beneficiaryAddress: paymentData.beneficiaryDetails.address,
        beneficiaryCity: paymentData.beneficiaryDetails.city,
        beneficiaryPostalCode: paymentData.beneficiaryDetails.postalCode,
        beneficiaryCountry: paymentData.beneficiaryDetails.country
      })
      setActiveStep(2)
      notify({ severity: 'success', message: 'Beneficiary details updated successfully.' })
    } catch (error: any) {
      notify({ severity: 'error', message: error?.response?.data?.message || 'Failed to update beneficiary details. Please try again.' })
    } finally {
      setIsUpdatingBeneficiary(false)
    }
  }

  // Task 2 Compliant: Step 3 - Submit for verification
  const handleSubmit = async () => {
    if (!paymentId) {
      notify({ severity: 'error', message: 'Payment ID not found. Please start over.' })
      return
    }
    setIsSubmitting(true)
    try {
      await api.post(`/api/v1/payments/${paymentId}/submit`, {
        reference: paymentData.paymentDetails.reference,
        purpose: paymentData.paymentDetails.purpose
      })
      setIsComplete(true)
      notify({ severity: 'success', message: 'Payment submitted successfully and is pending verification.' })
      // Navigate back to payments after a short delay
      setTimeout(() => navigate('/payments'), 600)
    } catch (error: any) {
      notify({ severity: 'error', message: error?.response?.data?.message || 'Failed to submit payment. Please try again.' })
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
          Your international payment {paymentId && `(${paymentId})`} has been submitted and is now pending verification by our compliance team.
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
          onClick={() => navigate('/payments')} 
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
              disabled={
                !stepValidation[activeStep] || 
                isCreatingDraft || 
                isUpdatingBeneficiary
              }
              endIcon={
                (activeStep === 0 && isCreatingDraft) || 
                (activeStep === 1 && isUpdatingBeneficiary) ? 
                <CircularProgress size={20} /> : 
                <ArrowForwardIcon />
              }
              variant="contained"
            >
              {activeStep === 0 && isCreatingDraft ? 'Creating Draft...' :
               activeStep === 1 && isUpdatingBeneficiary ? 'Updating Details...' :
               activeStep === 0 ? 'Create Payment Draft' :
               activeStep === 1 ? 'Update Beneficiary' : 'Next'}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!stepValidation[activeStep] || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
              variant="contained"
              color="primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          )}
        </Box>
      </Box>
    </Stack>
  )
}

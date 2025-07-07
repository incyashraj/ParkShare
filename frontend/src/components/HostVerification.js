import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Description as DocumentIcon,
  VerifiedUser as VerifiedIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';

const HostVerification = () => {
  const { currentUser } = useAuth();
  const { socket } = useRealtime();
  
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    identityDocument: null,
    addressProof: null,
    propertyOwnership: null,
    additionalDocuments: []
  });
  const [notification, setNotification] = useState(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Basic verification form data
  const [basicVerificationData, setBasicVerificationData] = useState({
    email: '',
    phone: '',
    emailCode: '',
    phoneCode: ''
  });
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const steps = [
    {
      label: 'Basic Verification',
      description: 'Complete email and mobile verification',
      completed: false
    },
    {
      label: 'Document Upload',
      description: 'Upload required verification documents',
      completed: false
    },
    {
      label: 'Review Process',
      description: 'Documents under admin review',
      completed: false
    },
    {
      label: 'Verification Complete',
      description: 'Host verification approved',
      completed: false
    }
  ];

  useEffect(() => {
    loadVerificationStatus();
    
    // Listen for verification updates
    if (socket) {
      socket.on('host-verification-update', handleVerificationUpdate);
      socket.on('notification', handleNotification);
    }

    return () => {
      if (socket) {
        socket.off('host-verification-update', handleVerificationUpdate);
        socket.off('notification', handleNotification);
      }
    };
  }, [socket]);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/host-verification/status/${currentUser.uid}`, {
        headers: {
          Authorization: `Bearer ${currentUser.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data);
        updateActiveStep(data);
        
        // Pre-fill basic verification data
        setBasicVerificationData(prev => ({
          ...prev,
          email: data.email || '',
          phone: data.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateActiveStep = (status) => {
    if (status.isVerifiedHost) {
      setActiveStep(3);
    } else if (status.hostVerificationStatus === 'approved') {
      setActiveStep(3);
    } else if (status.hostVerificationStatus === 'documents_submitted' || 
               status.hostVerificationStatus === 'under_review') {
      setActiveStep(2);
    } else if (status.emailVerified && status.mobileVerified) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  };

  const handleVerificationUpdate = (data) => {
    setNotification({
      message: `Your host verification has been ${data.status}`,
      severity: data.status === 'approved' ? 'success' : 'info'
    });
    loadVerificationStatus();
  };

  const handleNotification = (notification) => {
    if (notification.type === 'host_verification') {
      setNotification({
        message: notification.message,
        severity: notification.data.status === 'approved' ? 'success' : 'info'
      });
    }
  };

  const handleBasicVerificationChange = (field, value) => {
    setBasicVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendEmailCode = async () => {
    try {
      setSendingEmailCode(true);
      const response = await fetch('http://localhost:3001/api/auth/send-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({
          email: basicVerificationData.email
        })
      });

      if (response.ok) {
        setNotification({
          message: 'Email verification code sent successfully!',
          severity: 'success'
        });
      } else {
        const error = await response.json();
        setNotification({
          message: error.message || 'Failed to send email code',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error sending email code:', error);
      setNotification({
        message: 'Failed to send email code. Please try again.',
        severity: 'error'
      });
    } finally {
      setSendingEmailCode(false);
    }
  };

  const handleSendPhoneCode = async () => {
    try {
      setSendingPhoneCode(true);
      const response = await fetch('http://localhost:3001/api/auth/send-mobile-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({
          phone: basicVerificationData.phone
        })
      });

      if (response.ok) {
        setNotification({
          message: 'SMS verification code sent successfully!',
          severity: 'success'
        });
      } else {
        const error = await response.json();
        setNotification({
          message: error.message || 'Failed to send SMS code',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error sending SMS code:', error);
      setNotification({
        message: 'Failed to send SMS code. Please try again.',
        severity: 'error'
      });
    } finally {
      setSendingPhoneCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setVerifyingEmail(true);
      const response = await fetch('http://localhost:3001/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({
          email: basicVerificationData.email,
          code: basicVerificationData.emailCode
        })
      });

      if (response.ok) {
        setNotification({
          message: 'Email verified successfully!',
          severity: 'success'
        });
        loadVerificationStatus();
      } else {
        const error = await response.json();
        setNotification({
          message: error.message || 'Failed to verify email',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      setNotification({
        message: 'Failed to verify email. Please try again.',
        severity: 'error'
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleVerifyPhone = async () => {
    try {
      setVerifyingPhone(true);
      const response = await fetch('http://localhost:3001/api/auth/verify-mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({
          phone: basicVerificationData.phone,
          code: basicVerificationData.phoneCode
        })
      });

      if (response.ok) {
        setNotification({
          message: 'Phone number verified successfully!',
          severity: 'success'
        });
        loadVerificationStatus();
      } else {
        const error = await response.json();
        setNotification({
          message: error.message || 'Failed to verify phone number',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error verifying phone:', error);
      setNotification({
        message: 'Failed to verify phone number. Please try again.',
        severity: 'error'
      });
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleFileChange = (field, files) => {
    if (field === 'additionalDocuments') {
      setFormData(prev => ({
        ...prev,
        [field]: Array.from(files)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: files[0]
      }));
    }
  };

  const handleUploadDocuments = async () => {
    try {
      setUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('userId', currentUser.uid);
      
      if (formData.identityDocument) {
        formDataToSend.append('identityDocument', formData.identityDocument);
      }
      if (formData.addressProof) {
        formDataToSend.append('addressProof', formData.addressProof);
      }
      if (formData.propertyOwnership) {
        formDataToSend.append('propertyOwnership', formData.propertyOwnership);
      }
      if (formData.additionalDocuments.length > 0) {
        formData.additionalDocuments.forEach(doc => {
          formDataToSend.append('additionalDocuments', doc);
        });
      }

      const response = await fetch('http://localhost:3001/api/host-verification/upload-documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        setNotification({
          message: 'Documents uploaded successfully! Your verification is now under review.',
          severity: 'success'
        });
        loadVerificationStatus();
      } else {
        const error = await response.json();
        setNotification({
          message: error.message || 'Failed to upload documents',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
      setNotification({
        message: 'Failed to upload documents. Please try again.',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckIcon color="success" />;
      case 'rejected':
        return <ErrorIcon color="error" />;
      case 'pending_review':
        return <PendingIcon color="warning" />;
      default:
        return <DocumentIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending_review':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading verification status...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SecurityIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Host Verification
            </Typography>
          </Box>

          {notification && (
            <Alert 
              severity={notification.severity} 
              sx={{ mb: 3 }}
              onClose={() => setNotification(null)}
            >
              {notification.message}
            </Alert>
          )}

          {/* Verification Status Overview */}
          {verificationStatus && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Current Status</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {verificationStatus.emailVerified ? 
                      <CheckIcon color="success" /> : 
                      <ErrorIcon color="error" />
                    }
                    <Typography sx={{ ml: 1 }}>
                      Email Verification: {verificationStatus.emailVerified ? 'Complete' : 'Pending'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {verificationStatus.mobileVerified ? 
                      <CheckIcon color="success" /> : 
                      <ErrorIcon color="error" />
                    }
                    <Typography sx={{ ml: 1 }}>
                      Mobile Verification: {verificationStatus.mobileVerified ? 'Complete' : 'Pending'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {verificationStatus.isVerifiedHost ? 
                      <VerifiedIcon color="success" /> : 
                      <AssignmentIcon color="warning" />
                    }
                    <Typography sx={{ ml: 1 }}>
                      Host Status: {verificationStatus.isVerifiedHost ? 'Verified Host' : 'Pending Verification'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Verification Steps */}
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  
                  {index === 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Complete basic verification steps to proceed with host verification.
                      </Typography>
                      
                      {/* Email Verification */}
                      <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Email Verification
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email Address"
                              type="email"
                              value={basicVerificationData.email}
                              onChange={(e) => handleBasicVerificationChange('email', e.target.value)}
                              disabled={verificationStatus?.emailVerified}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Button
                              variant="outlined"
                              onClick={handleSendEmailCode}
                              disabled={sendingEmailCode || verificationStatus?.emailVerified || !basicVerificationData.email}
                              startIcon={sendingEmailCode ? <LinearProgress size={20} /> : <SendIcon />}
                              fullWidth
                            >
                              {sendingEmailCode ? 'Sending...' : 'Send Code'}
                            </Button>
                          </Grid>
                          {!verificationStatus?.emailVerified && (
                            <>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Verification Code"
                                  value={basicVerificationData.emailCode}
                                  onChange={(e) => handleBasicVerificationChange('emailCode', e.target.value)}
                                  placeholder="Enter 6-digit code"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Button
                                  variant="contained"
                                  onClick={handleVerifyEmail}
                                  disabled={verifyingEmail || !basicVerificationData.emailCode}
                                  startIcon={verifyingEmail ? <LinearProgress size={20} /> : <CheckIcon />}
                                  fullWidth
                                >
                                  {verifyingEmail ? 'Verifying...' : 'Verify Email'}
                                </Button>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Paper>

                      {/* Phone Verification */}
                      <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Mobile Verification
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Phone Number"
                              type="tel"
                              value={basicVerificationData.phone}
                              onChange={(e) => handleBasicVerificationChange('phone', e.target.value)}
                              disabled={verificationStatus?.mobileVerified}
                              placeholder="+1234567890"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Button
                              variant="outlined"
                              onClick={handleSendPhoneCode}
                              disabled={sendingPhoneCode || verificationStatus?.mobileVerified || !basicVerificationData.phone}
                              startIcon={sendingPhoneCode ? <LinearProgress size={20} /> : <SendIcon />}
                              fullWidth
                            >
                              {sendingPhoneCode ? 'Sending...' : 'Send SMS'}
                            </Button>
                          </Grid>
                          {!verificationStatus?.mobileVerified && (
                            <>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="SMS Code"
                                  value={basicVerificationData.phoneCode}
                                  onChange={(e) => handleBasicVerificationChange('phoneCode', e.target.value)}
                                  placeholder="Enter 6-digit code"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Button
                                  variant="contained"
                                  onClick={handleVerifyPhone}
                                  disabled={verifyingPhone || !basicVerificationData.phoneCode}
                                  startIcon={verifyingPhone ? <LinearProgress size={20} /> : <CheckIcon />}
                                  fullWidth
                                >
                                  {verifyingPhone ? 'Verifying...' : 'Verify Phone'}
                                </Button>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Paper>

                      {verificationStatus?.emailVerified && verificationStatus?.mobileVerified && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Basic verification complete!</Typography>
                          <Typography variant="body2">
                            You can now proceed to upload your verification documents.
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {index === 1 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Upload the required documents for host verification.
                      </Typography>
                      
                      <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <FormLabel component="legend">Required Documents</FormLabel>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={!!formData.identityDocument}
                                disabled
                              />
                            }
                            label="Identity Document (Government ID, Passport, or Driver's License)"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={!!formData.addressProof}
                                disabled
                              />
                            }
                            label="Address Proof (Utility Bill, Bank Statement, or Rental Agreement)"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox 
                                checked={!!formData.propertyOwnership}
                                disabled
                              />
                            }
                            label="Property Ownership Proof (Deed, Lease Agreement, or Property Tax Receipt)"
                          />
                        </FormGroup>
                      </FormControl>

                      <Box sx={{ mt: 2 }}>
                        <input
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          id="identity-document"
                          type="file"
                          onChange={(e) => handleFileChange('identityDocument', e.target.files)}
                        />
                        <label htmlFor="identity-document">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            sx={{ mr: 1, mb: 1 }}
                          >
                            Identity Document
                          </Button>
                        </label>

                        <input
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          id="address-proof"
                          type="file"
                          onChange={(e) => handleFileChange('addressProof', e.target.files)}
                        />
                        <label htmlFor="address-proof">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            sx={{ mr: 1, mb: 1 }}
                          >
                            Address Proof
                          </Button>
                        </label>

                        <input
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          id="property-ownership"
                          type="file"
                          onChange={(e) => handleFileChange('propertyOwnership', e.target.files)}
                        />
                        <label htmlFor="property-ownership">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            sx={{ mr: 1, mb: 1 }}
                          >
                            Property Ownership
                          </Button>
                        </label>

                        <input
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          id="additional-documents"
                          type="file"
                          multiple
                          onChange={(e) => handleFileChange('additionalDocuments', e.target.files)}
                        />
                        <label htmlFor="additional-documents">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<UploadIcon />}
                            sx={{ mb: 1 }}
                          >
                            Additional Documents (Optional)
                          </Button>
                        </label>
                      </Box>

                      {formData.identityDocument && (
                        <Chip 
                          label={formData.identityDocument.name} 
                          onDelete={() => setFormData(prev => ({ ...prev, identityDocument: null }))}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      )}
                      {formData.addressProof && (
                        <Chip 
                          label={formData.addressProof.name} 
                          onDelete={() => setFormData(prev => ({ ...prev, addressProof: null }))}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      )}
                      {formData.propertyOwnership && (
                        <Chip 
                          label={formData.propertyOwnership.name} 
                          onDelete={() => setFormData(prev => ({ ...prev, propertyOwnership: null }))}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      )}
                      {formData.additionalDocuments.map((doc, index) => (
                        <Chip 
                          key={index}
                          label={doc.name} 
                          onDelete={() => {
                            const newDocs = formData.additionalDocuments.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, additionalDocuments: newDocs }));
                          }}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}

                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={handleUploadDocuments}
                          disabled={uploading || !formData.identityDocument || !formData.addressProof || !formData.propertyOwnership}
                          startIcon={uploading ? <LinearProgress size={20} /> : <UploadIcon />}
                        >
                          {uploading ? 'Uploading...' : 'Submit Documents'}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {index === 2 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Your documents are currently under review by our verification team.
                      </Typography>
                      
                      {verificationStatus?.verificationDocuments && (
                        <List>
                          {verificationStatus.verificationDocuments.map((doc, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                {getStatusIcon(doc.status)}
                              </ListItemIcon>
                              <ListItemText
                                primary={doc.originalName}
                                secondary={`${doc.fieldName} • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                              />
                              <Chip 
                                label={doc.status.replace('_', ' ')} 
                                color={getStatusColor(doc.status)}
                                size="small"
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}

                      {verificationStatus?.verificationNotes && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Review Notes:</Typography>
                          <Typography variant="body2">{verificationStatus.verificationNotes}</Typography>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {index === 3 && (
                    <Box>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="h6">Congratulations!</Typography>
                        <Typography variant="body2">
                          Your host verification has been approved. You are now a verified host and can list your parking spots.
                        </Typography>
                      </Alert>
                      
                      <Button 
                        variant="contained" 
                        onClick={() => window.location.href = '/add-spot'}
                        startIcon={<VerifiedIcon />}
                      >
                        List Your Parking Spot
                      </Button>
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog 
        open={showDocumentDialog} 
        onClose={() => setShowDocumentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Document Preview</Typography>
            <IconButton onClick={() => setShowDocumentDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedDocument.originalName}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {selectedDocument.fieldName} • 
                Size: {(selectedDocument.size / 1024 / 1024).toFixed(2)} MB • 
                Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                Document preview is not available. Please contact support if you need to view this document.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDocumentDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HostVerification;
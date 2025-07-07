import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  LinearProgress,
  Chip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  AttachFile,
  Close,
  Image,
  PictureAsPdf,
  Delete,
  CloudUpload,
  FileCopy
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../apiConfig';

const FileUpload = ({ onFilesSelected, maxFiles = 5, maxSize = 10 }) => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const [previewDialog, setPreviewDialog] = useState({ open: false, file: null });
  const fileInputRef = useRef(null);

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return <Image color="primary" />;
    } else if (mimetype === 'application/pdf') {
      return <PictureAsPdf color="error" />;
    }
    return <FileCopy color="action" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Only PDF and image files are supported.`);
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`File size ${formatFileSize(file.size)} exceeds the maximum limit of ${maxSize}MB.`);
    }
    
    return true;
  };

  const handleFileSelect = useCallback((selectedFiles) => {
    setError('');
    const newFiles = Array.from(selectedFiles);
    
    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      try {
        validateFile(file);
        validFiles.push(file);
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files.length, maxFiles, maxSize]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e) => {
    const selectedFiles = e.target.files;
    handleFileSelect(selectedFiles);
  }, [handleFileSelect]);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const uploadFile = async (file, index) => {
    const formData = new FormData();
    formData.append('attachment', file);

    try {
      const response = await fetch(`${API_BASE}/messages/upload-attachment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.file;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    const uploadedFiles = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(prev => ({ ...prev, [i]: 0 }));

        // Simulate progress (in real implementation, you'd track actual progress)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[i] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [i]: current + 10 };
          });
        }, 100);

        try {
          const uploadedFile = await uploadFile(file, i);
          uploadedFiles.push(uploadedFile);
          setUploadProgress(prev => ({ ...prev, [i]: 100 }));
        } catch (error) {
          setError(`Failed to upload ${file.name}: ${error.message}`);
          setUploadProgress(prev => ({ ...prev, [i]: 0 }));
        }
      }

      if (uploadedFiles.length > 0) {
        onFilesSelected(uploadedFiles);
        setFiles([]);
        setUploadProgress({});
      }
    } catch (error) {
      setError('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const openPreview = (file) => {
    setPreviewDialog({ open: true, file });
  };

  const closePreview = () => {
    setPreviewDialog({ open: false, file: null });
  };

  return (
    <Box>
      {/* File Upload Area */}
      <Paper
        sx={{
          p: 2,
          border: '2px dashed',
          borderColor: 'grey.300',
          backgroundColor: 'grey.50',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'grey.100'
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Drop files here or click to select
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supports PDF and image files (max {maxSize}MB each, up to {maxFiles} files)
          </Typography>
        </Box>
      </Paper>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files ({files.length}/{maxFiles})
          </Typography>
          {files.map((file, index) => (
            <Paper key={index} sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {getFileIcon(file.type)}
                <Box sx={{ ml: 1, flex: 1 }}>
                  <Typography variant="body2" noWrap>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {file.type.startsWith('image/') && (
                  <IconButton size="small" onClick={() => openPreview(file)}>
                    <AttachFile />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => removeFile(index)}>
                  <Delete />
                </IconButton>
              </Box>
            </Paper>
          ))}

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <Box sx={{ mt: 2 }}>
              {Object.entries(uploadProgress).map(([index, progress]) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="caption">
                    Uploading {files[parseInt(index)]?.name}...
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Upload Button */}
          <Button
            variant="contained"
            onClick={uploadAllFiles}
            disabled={uploading}
            sx={{ mt: 2 }}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </Button>
        </Box>
      )}

      {/* File Preview Dialog */}
      <Dialog open={previewDialog.open} onClose={closePreview} maxWidth="md" fullWidth>
        <DialogTitle>
          File Preview
          <IconButton
            onClick={closePreview}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewDialog.file && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {previewDialog.file.name}
              </Typography>
              {previewDialog.file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(previewDialog.file)}
                  alt={previewDialog.file.name}
                  style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              ) : (
                <Typography>PDF preview not available</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload; 
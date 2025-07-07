import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import {
  Image,
  PictureAsPdf,
  FileCopy,
  Download,
  Delete,
  Close,
  Visibility,
  GetApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../apiConfig';

const MessageAttachment = ({ attachment, onDelete, canDelete = false }) => {
  const { currentUser } = useAuth();
  const [previewDialog, setPreviewDialog] = useState({ open: false, attachment: null });
  const [deleting, setDeleting] = useState(false);

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

  const getFileType = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return 'Image';
    } else if (mimetype === 'application/pdf') {
      return 'PDF';
    }
    return 'File';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${API_BASE}${attachment.url}`;
    link.download = attachment.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/api/messages/attachment/${attachment.filename}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUser.uid}`
        }
      });

      if (response.ok) {
        onDelete(attachment.id);
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setDeleting(false);
    }
  };

  const openPreview = () => {
    setPreviewDialog({ open: true, attachment });
  };

  const closePreview = () => {
    setPreviewDialog({ open: false, attachment: null });
  };

  const isImage = attachment.mimetype.startsWith('image/');
  const isPdf = attachment.mimetype === 'application/pdf';

  return (
    <>
      <Paper
        sx={{
          p: 1,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          maxWidth: 300,
          backgroundColor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          {getFileIcon(attachment.mimetype)}
          <Box sx={{ ml: 1, flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {attachment.originalName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getFileType(attachment.mimetype)} • {formatFileSize(attachment.size)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {(isImage || isPdf) && (
            <IconButton size="small" onClick={openPreview}>
              <Visibility />
            </IconButton>
          )}
          <IconButton size="small" onClick={handleDownload}>
            <Download />
          </IconButton>
          {canDelete && (
            <IconButton 
              size="small" 
              onClick={handleDelete}
              disabled={deleting}
              color="error"
            >
              <Delete />
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Preview Dialog */}
      <Dialog open={previewDialog.open} onClose={closePreview} maxWidth="md" fullWidth>
        <DialogTitle>
          {previewDialog.attachment?.originalName}
          <IconButton
            onClick={closePreview}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewDialog.attachment && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip 
                  label={getFileType(previewDialog.attachment.mimetype)} 
                  color="primary" 
                  size="small" 
                />
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(previewDialog.attachment.size)}
                </Typography>
              </Box>
              
              {isImage ? (
                <img
                  src={`${API_BASE}${previewDialog.attachment.url}`}
                  alt={previewDialog.attachment.originalName}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '500px', 
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              ) : isPdf ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PictureAsPdf sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    PDF Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    PDF files cannot be previewed in the browser
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<GetApp />}
                    onClick={handleDownload}
                  >
                    Download PDF
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FileCopy sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    File Preview Not Available
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<GetApp />}
                    onClick={handleDownload}
                  >
                    Download File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<GetApp />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MessageAttachment; 
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
  useMediaQuery,
  Stack,
  Tooltip,
  Badge,
  Card,
  CardContent,
  Fade,
  Slide,
  Grow,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Send as SendIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  LocalParking as ParkingIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Report as ReportIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';

const MessagingSystem = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get URL parameters for pre-filling new message
  const urlParams = new URLSearchParams(window.location.search);
  const recipientParam = urlParams.get('recipient');
  const subjectParam = urlParams.get('subject');
  
  const { currentUser } = useAuth();
  const { isConnected, sendMessage, getMessages, getConversations } = useRealtime();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showConversationList, setShowConversationList] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
    loadAvailableUsers();
    
    // If URL parameters are provided, open new message dialog
    if (recipientParam && subjectParam) {
      setNewMessageRecipient(recipientParam);
      setNewMessageSubject(subjectParam);
      setShowNewMessageDialog(true);
      // Clear URL parameters
      navigate('/messages', { replace: true });
    }
  }, [recipientParam, subjectParam, navigate]);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      setSelectedConversation(conversations.find(c => c.id === conversationId));
    }
  }, [conversationId, conversations]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/conversations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        
        // Calculate unread counts
        const counts = {};
        data.conversations?.forEach(conv => {
          counts[conv.id] = conv.unreadCount || 0;
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async (convId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${convId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      conversationId: selectedConversation.id,
      content: newMessage.trim(),
      senderId: currentUser.uid,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        setNewMessage('');
        // Reload messages to get the updated list
        await loadMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartNewConversation = async () => {
    if (!newMessageRecipient || !newMessageSubject || !newMessageContent) return;

    const conversationData = {
      participants: [currentUser.uid, newMessageRecipient],
      subject: newMessageSubject,
      initialMessage: newMessageContent,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify(conversationData)
      });

      if (response.ok) {
        const data = await response.json();
        setShowNewMessageDialog(false);
        setNewMessageRecipient('');
        setNewMessageSubject('');
        setNewMessageContent('');
        
        // Navigate to the new conversation
        navigate(`/messages/${data.conversation.id}`);
        await loadConversations();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowConversationList(false);
    navigate(`/messages/${conversation.id}`);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
    navigate('/messages');
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p.id !== currentUser.uid);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getOtherParticipant(conv);
    const matchesSearch = otherUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'unread') return matchesSearch && (unreadCounts[conv.id] || 0) > 0;
    return matchesSearch;
  });

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: 'calc(100vh - 200px)' }}>
      <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
        {/* Conversations List */}
        <Paper 
          sx={{ 
            width: { xs: '100%', md: 350 },
            display: { xs: showConversationList ? 'block' : 'none', md: 'block' },
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: '1px solid #F0F0F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Messages
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={isConnected ? 'Connected' : 'Connecting...'}
                  size="small"
                  color={isConnected ? 'success' : 'warning'}
                  variant="outlined"
                />
                <Tooltip title="New Message">
                  <IconButton
                    onClick={() => setShowNewMessageDialog(true)}
                    sx={{ color: 'primary.main' }}
                  >
                    <MessageIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {/* Search and Filter */}
            <Stack spacing={2}>
              <TextField
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Filter"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="unread">Unread</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Conversations */}
          <Box sx={{ height: 'calc(100% - 140px)', overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredConversations.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <MessageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No conversations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a conversation to begin messaging
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<MessageIcon />}
                  onClick={() => setShowNewMessageDialog(true)}
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  New Message
                </Button>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredConversations.map((conversation, index) => {
                  const otherUser = getOtherParticipant(conversation);
                  const unreadCount = unreadCounts[conversation.id] || 0;
                  
                  return (
                    <Grow key={conversation.id} in timeout={index * 100}>
                      <ListItem
                        button
                        onClick={() => handleConversationSelect(conversation)}
                        selected={selectedConversation?.id === conversation.id}
                        sx={{
                          borderBottom: '1px solid #F0F0F0',
                          '&:hover': {
                            backgroundColor: '#F7F7F7',
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#FFF0F0',
                            '&:hover': {
                              backgroundColor: '#FFE8E8',
                            }
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            badgeContent={unreadCount}
                            color="error"
                            invisible={unreadCount === 0}
                          >
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {otherUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight={unreadCount > 0 ? 600 : 400}
                                color="text.primary"
                                sx={{ flexGrow: 1 }}
                              >
                                {otherUser?.username || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getTimeAgo(conversation.lastMessage?.timestamp || conversation.timestamp)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color={unreadCount > 0 ? 'text.primary' : 'text.secondary'}
                              sx={{
                                fontWeight: unreadCount > 0 ? 500 : 400,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {conversation.lastMessage?.content || conversation.subject}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </Grow>
                  );
                })}
              </List>
            )}
          </Box>
        </Paper>

        {/* Messages Area */}
        <Paper 
          sx={{ 
            flexGrow: 1,
            display: { xs: showConversationList ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <Box sx={{ p: 3, borderBottom: '1px solid #F0F0F0', backgroundColor: '#F7F7F7' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {isMobile && (
                    <IconButton onClick={handleBackToList} sx={{ color: 'primary.main' }}>
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {getOtherParticipant(selectedConversation)?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      {getOtherParticipant(selectedConversation)?.username || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedConversation.subject}
                    </Typography>
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="More options">
                      <IconButton sx={{ color: 'text.secondary' }}>
                        <MoreIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>

              {/* Messages */}
              <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <MessageIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No messages yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start the conversation by sending a message
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {messages.map((message, index) => {
                      const isOwnMessage = message.senderId === currentUser.uid;
                      
                      return (
                        <Slide key={message.id} direction={isOwnMessage ? 'left' : 'right'} in timeout={300}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                              mb: 1
                            }}
                          >
                            <Box
                              sx={{
                                maxWidth: '70%',
                                backgroundColor: isOwnMessage ? 'primary.main' : '#F0F0F0',
                                color: isOwnMessage ? 'white' : 'text.primary',
                                borderRadius: 3,
                                p: 2,
                                position: 'relative',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 0,
                                  height: 0,
                                  borderStyle: 'solid',
                                  ...(isOwnMessage ? {
                                    right: -8,
                                    borderWidth: '8px 0 8px 8px',
                                    borderColor: `transparent transparent transparent ${theme.palette.primary.main}`
                                  } : {
                                    left: -8,
                                    borderWidth: '8px 8px 8px 0',
                                    borderColor: `transparent #F0F0F0 transparent transparent`
                                  })
                                }
                              }}
                            >
                              <Typography variant="body1" sx={{ mb: 1 }}>
                                {message.content}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {getTimeAgo(message.timestamp)}
                                </Typography>
                                {isOwnMessage && (
                                  <CheckCircleIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Slide>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </Stack>
                )}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: '1px solid #F0F0F0' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      }
                    }}
                  />
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '&:disabled': {
                        backgroundColor: '#F0F0F0',
                        color: 'text.secondary',
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              textAlign: 'center'
            }}>
              <Box>
                <MessageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Choose a conversation from the list to start messaging
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<MessageIcon />}
                  onClick={() => setShowNewMessageDialog(true)}
                  sx={{ borderRadius: 2 }}
                >
                  New Message
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* New Message Dialog */}
      <Dialog
        open={showNewMessageDialog}
        onClose={() => setShowNewMessageDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            New Message
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Recipient</InputLabel>
              <Select
                value={newMessageRecipient}
                onChange={(e) => setNewMessageRecipient(e.target.value)}
                label="Recipient"
              >
                {availableUsers
                  .filter(user => user.uid !== currentUser.uid)
                  .map(user => (
                    <MenuItem key={user.uid} value={user.uid}>
                      {user.username || user.email}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Subject"
              value={newMessageSubject}
              onChange={(e) => setNewMessageSubject(e.target.value)}
              placeholder="Enter message subject..."
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={newMessageContent}
              onChange={(e) => setNewMessageContent(e.target.value)}
              placeholder="Enter your message..."
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setShowNewMessageDialog(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartNewConversation}
            variant="contained"
            disabled={!newMessageRecipient || !newMessageSubject || !newMessageContent}
            sx={{ borderRadius: 2 }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MessagingSystem; 
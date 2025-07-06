import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  useTheme,
  useMediaQuery,
  Stack,
  Tooltip,
  Badge,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Popover,
  Menu,
} from '@mui/material';
import {
  Send as SendIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Report as ReportIcon,
  EmojiEmotions as EmojiIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Add as AddIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  NotificationsOff as MuteIcon,
  Notifications as UnmuteIcon,
  Archive as ArchiveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';

const MessagingSystem = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { currentUser } = useAuth();
  const { isConnected, socket } = useRealtime();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showConversationList, setShowConversationList] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [messageActions, setMessageActions] = useState({ anchorEl: null, message: null });
  const [conversationActions, setConversationActions] = useState({ anchorEl: null });
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [reportDialog, setReportDialog] = useState({
    open: false,
    userId: null,
    username: '',
    reason: '',
    description: ''
  });

  const messagesEndRef = useRef(null);

  // Add emoji picker state
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const emojiList = ['😀','😂','😍','😎','👍','🙏','🎉','🚗','🏆','💬','❤️','😅','😇','😢','😡','😱','🤔','🙌','👏','🔥','🌟'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Only scroll to bottom when new messages are added, not when selecting a conversation
  useEffect(() => {
    if (messages.length > previousMessageCount && previousMessageCount > 0) {
      scrollToBottom();
    }
    setPreviousMessageCount(messages.length);
  }, [messages.length, previousMessageCount]);

  // Helper function to get other user from participants
  const getOtherUser = useCallback((participants) => {
    if (!participants) return null;
    return participants.find(p => p.uid !== currentUser?.uid);
  }, [currentUser?.uid]);

  const loadConversations = useCallback(async () => {
    if (!currentUser?.uid) return;
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
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  const loadAvailableUsers = useCallback(async () => {
    if (!currentUser?.uid) return;
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
  }, [currentUser?.uid]);

  const loadMessages = useCallback(async (convId) => {
    if (!currentUser?.uid || !convId) return;
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
        setPreviousMessageCount(0); // Reset when loading new conversation
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Authenticate user with socket
    if (isConnected && socket) {
      socket.emit('authenticate-user', {
        uid: currentUser.uid,
        username: currentUser.displayName || currentUser.email,
        email: currentUser.email
      });
    }
    
    loadConversations();
    loadAvailableUsers();
    
    // Set up real-time listeners
    if (isConnected && socket) {
      const handleNewMessage = (data) => {
        console.log('New message received:', data);
        
        // If this message is for the currently selected conversation, add it to messages
        if (selectedConversation && data.conversationId === selectedConversation.id) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(msg => msg.id === data.message.id);
            if (messageExists) return prev;
            return [...prev, data.message];
          });
        }
        
        // Update conversation list to show latest message
        setConversations(prev => prev.map(conv => 
          conv.id === data.conversationId 
            ? { 
                ...conv, 
                lastMessage: data.message, 
                lastActivity: data.message.timestamp,
                unreadCount: (conv.unreadCount || 0) + 1
              }
            : conv
        ));
      };

      const handleTypingIndicator = (data) => {
        console.log('Typing indicator:', data);
        // Handle typing indicator for the conversation
        if (selectedConversation && data.conversationId === selectedConversation.id) {
          setTypingUsers(prev => ({
            ...prev,
            [data.conversationId]: data.typingUsers || []
          }));
        }
      };

      const handleMessageStatus = (data) => {
        console.log('Message status update:', data);
        // Update message status (read, delivered, etc.)
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, status: data.status } : msg
        ));
      };

      // Listen for new messages
      socket.on('new-message', handleNewMessage);
      socket.on('typing-indicator', handleTypingIndicator);
      socket.on('message-status', handleMessageStatus);

      // Clean up listeners
      return () => {
        socket.off('new-message', handleNewMessage);
        socket.off('typing-indicator', handleTypingIndicator);
        socket.off('message-status', handleMessageStatus);
      };
    }
  }, [currentUser?.uid, isConnected, socket, loadConversations, loadAvailableUsers, selectedConversation]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants ? getOtherUser(conv.participants) : null;
    const searchLower = searchTerm.toLowerCase();
    return otherUser?.username?.toLowerCase().includes(searchLower) ||
           conv.subject?.toLowerCase().includes(searchLower) ||
           (conv.messages && conv.messages.length > 0 && 
            conv.messages[conv.messages.length - 1].content?.toLowerCase().includes(searchLower));
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sendingMessage) return;
    
    setSendingMessage(true);
    const tempMessageId = `temp_${Date.now()}`;
    const newMsg = {
      id: tempMessageId,
      content: messageInput,
      senderId: currentUser.uid,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, newMsg]);
    const messageContent = messageInput;
    setMessageInput('');
    
    try {
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageContent,
          senderId: currentUser.uid
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Replace temp message with real message from server
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId ? { ...data.message, status: 'sent' } : msg
        ));
        
        // Update conversation list to show latest message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: data.message, lastActivity: data.message.timestamp }
            : conv
        ));
      } else {
        // If failed, mark message as failed
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessageId ? { ...msg, status: 'failed' } : msg
        ));
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessageId ? { ...msg, status: 'failed' } : msg
      ));
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRetryMessage = async (failedMessage) => {
    if (!selectedConversation || sendingMessage) return;
    
    setSendingMessage(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: failedMessage.content,
          senderId: currentUser.uid
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Replace failed message with successful one
        setMessages(prev => prev.map(msg => 
          msg.id === failedMessage.id ? { ...data.message, status: 'sent' } : msg
        ));
        
        // Update conversation list
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: data.message, lastActivity: data.message.timestamp }
            : conv
        ));
      } else {
        setError('Failed to retry message');
      }
    } catch (error) {
      console.error('Error retrying message:', error);
      setError('Failed to retry message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartNewConversation = async () => {
    if (!newMessageRecipient || !newMessageSubject || !newMessageContent) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({
          participants: [currentUser.uid, newMessageRecipient],
          subject: newMessageSubject,
          initialMessage: newMessageContent
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowNewMessageDialog(false);
        setNewMessageRecipient('');
        setNewMessageSubject('');
        setNewMessageContent('');
        loadConversations();
        
        // Navigate to the new conversation
        if (data.conversation) {
          navigate(`/messages/${data.conversation.id}`);
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Failed to create conversation');
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
    setShowConversationList(true);
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(p => p.uid !== currentUser?.uid);
  };

  const handleOpenNewMessageDialog = () => {
    setShowNewMessageDialog(true);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getDetailedTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.keys(groups).map(date => ({
      date,
      messages: groups[date]
    }));
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleEmojiClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setAnchorEl(null);
  };

  const handleMessageAction = (event, message) => {
    setMessageActions({ anchorEl: event.currentTarget, message });
  };

  const handleMessageActionClose = () => {
    setMessageActions({ anchorEl: null, message: null });
  };

  const handleConversationAction = (event) => {
    setConversationActions({ anchorEl: event.currentTarget });
  };

  const handleConversationActionClose = () => {
    setConversationActions({ anchorEl: null });
  };

  const handleReply = () => {
    if (!messageActions.message) return;
    
    // Set the message input with reply format
    setMessageInput(`> ${messageActions.message.content}\n\n`);
    
    // Focus on the message input
    setTimeout(() => {
      const messageInput = document.querySelector('textarea[placeholder="Type a message..."]');
      if (messageInput) {
        messageInput.focus();
        messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
      }
    }, 100);
    
    handleMessageActionClose();
  };

  const handleForward = () => {
    if (!messageActions.message) return;
    
    // Navigate to new message dialog with pre-filled content
    setNewMessageContent(`Forwarded message: ${messageActions.message.content}`);
    setShowNewMessageDialog(true);
    handleMessageActionClose();
  };

  const handleDelete = async () => {
    if (!messageActions.message) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${messageActions.message.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageActions.message.id));
      } else {
        setError('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
    
    handleMessageActionClose();
  };

  // Conversation action handlers
  const handleMuteConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${selectedConversation.id}/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({ muted: !selectedConversation.muted })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update local state
        setSelectedConversation(prev => ({
          ...prev,
          muted: data.muted
        }));
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, muted: data.muted }
            : conv
        ));
      } else {
        setError('Failed to mute conversation');
      }
    } catch (error) {
      console.error('Error muting conversation:', error);
      setError('Failed to mute conversation');
    }
    
    handleConversationActionClose();
  };

  const handleStarConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${selectedConversation.id}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({ starred: !selectedConversation.starred })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update local state
        setSelectedConversation(prev => ({
          ...prev,
          starred: data.starred
        }));
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, starred: data.starred }
            : conv
        ));
      } else {
        setError('Failed to star conversation');
      }
    } catch (error) {
      console.error('Error starring conversation:', error);
      setError('Failed to star conversation');
    }
    
    handleConversationActionClose();
  };

  const handleArchiveConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${selectedConversation.id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({ archived: !selectedConversation.archived })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update local state
        setSelectedConversation(prev => ({
          ...prev,
          archived: data.archived
        }));
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, archived: data.archived }
            : conv
        ));
      } else {
        setError('Failed to archive conversation');
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
      setError('Failed to archive conversation');
    }
    
    handleConversationActionClose();
  };

  const handleBlockUser = async () => {
    if (!selectedConversation) return;
    
    const otherUser = getOtherParticipant(selectedConversation);
    if (!otherUser) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/users/${otherUser.uid}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({ blocked: true })
      });
      
      if (response.ok) {
        setError('User blocked successfully');
        // Optionally remove conversation from list
        setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
        setSelectedConversation(null);
      } else {
        setError('Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      setError('Failed to block user');
    }
    
    handleConversationActionClose();
  };

  const handleReportUser = async () => {
    if (!selectedConversation) return;
    
    const otherUser = getOtherParticipant(selectedConversation);
    if (!otherUser) return;
    
    setReportDialog({
      open: true,
      userId: otherUser.uid,
      username: otherUser.username || 'Unknown User',
      reason: '',
      description: ''
    });
    
    handleConversationActionClose();
  };

  const handleSubmitReport = async () => {
    if (!reportDialog.userId || !reportDialog.reason) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/users/${reportDialog.userId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({
          reason: reportDialog.reason,
          description: reportDialog.description
        })
      });
      
      if (response.ok) {
        setError('User reported successfully');
        setReportDialog({ open: false, userId: null, username: '', reason: '', description: '' });
      } else {
        setError('Failed to report user');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      setError('Failed to report user');
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/conversations/${selectedConversation.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        // Remove from conversations list
        setConversations(prev => prev.filter(conv => conv.id !== selectedConversation.id));
        setSelectedConversation(null);
        setMessages([]);
      } else {
        setError('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
    
    handleConversationActionClose();
  };

  const getMessageStatusIcon = (message) => {
    switch (message.status) {
      case 'sending':
        return <CircularProgress size={12} />;
      case 'sent':
        return <DoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />;
      case 'delivered':
        return <DoneAllIcon sx={{ fontSize: 12, color: 'text.secondary' }} />;
      case 'read':
        return <DoneAllIcon sx={{ fontSize: 12, color: 'primary.main' }} />;
      case 'failed':
        return <RefreshIcon sx={{ fontSize: 12, color: 'error.main' }} />;
      default:
        return null;
    }
  };

  const handleTypingStart = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing start event via Socket.IO if available
      if (socket && selectedConversation) {
        // This would be implemented with Socket.IO
        console.log('Started typing');
      }
    }
  };

  const handleTypingStop = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
      // Emit typing stop event via Socket.IO if available
      if (socket && selectedConversation) {
        // This would be implemented with Socket.IO
        console.log('Stopped typing');
      }
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const handleMessageInputChange = (e) => {
    setMessageInput(e.target.value);
    handleTypingStart();
    handleTypingStop();
  };

  const handleViewProfile = () => {
    const otherUser = getOtherParticipant(selectedConversation);
    if (otherUser) {
      navigate(`/user-profile/${otherUser.uid || otherUser.id}`);
    }
    handleConversationActionClose();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: 'calc(100vh - 200px)' }}>
      <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
        {/* Conversation List */}
        <Paper elevation={2} sx={{ width: { xs: '100%', md: 340 }, minWidth: 0, maxWidth: 400, height: '100%', overflow: 'auto', borderRadius: 4, border: '1px solid #eee', bgcolor: '#fff', p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>Messages</Typography>
            <Tooltip title="New Message">
              <IconButton color="primary" onClick={handleOpenNewMessageDialog}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider />
          <Box sx={{ p: 1, pb: 0 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ mb: 1, borderRadius: 2, bgcolor: '#fafafa' }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Box>
          <List sx={{ p: 0, m: 0 }}>
            {filteredConversations.length === 0 && (
              <ListItem sx={{ justifyContent: 'center', py: 4 }}>
                <Typography color="text.secondary">No conversations</Typography>
              </ListItem>
            )}
            {filteredConversations.map((conv) => {
              const isSelected = selectedConversation && selectedConversation.id === conv.id;
              const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
              const unreadCount = conv.unreadCount || 0;
              const otherUser = conv.participants ? getOtherUser(conv.participants) : null;
              const isOnline = onlineUsers && otherUser?._id && onlineUsers.includes(otherUser._id);
              return (
                <ListItem
                  key={conv.id}
                  button
                  selected={isSelected}
                  onClick={() => handleSelectConversation(conv)}
                  sx={{
                    bgcolor: isSelected ? 'rgba(255,56,92,0.08)' : 'transparent',
                    borderLeft: isSelected ? '4px solid #FF385C' : '4px solid transparent',
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: 'rgba(255,56,92,0.04)' },
                    alignItems: 'flex-start',
                    py: 2,
                    px: 2,
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color={isOnline ? 'success' : 'default'}
                      variant="dot"
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                      <Avatar src={otherUser?.avatarUrl} sx={{ bgcolor: '#FF385C' }}>
                        {otherUser?.username?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={600} sx={{ color: isSelected ? 'primary.main' : 'text.primary' }}>
                          {otherUser?.username || 'Unknown'}
                        </Typography>
                        {conv.starred && (
                          <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        )}
                        {conv.muted && (
                          <MuteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        )}
                        {conv.archived && (
                          <ArchiveIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        )}
                        {unreadCount > 0 && (
                          <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography 
                          variant="body2" 
                          color={conv.muted ? 'text.disabled' : 'text.secondary'} 
                          noWrap 
                          sx={{ 
                            flex: 1, 
                            maxWidth: 160,
                            opacity: conv.muted ? 0.6 : 1
                          }}
                        >
                          {lastMsg ? (lastMsg.content && lastMsg.content.length > 32 ? lastMsg.content.slice(0, 32) + '…' : lastMsg.content) : 'No messages yet'}
                        </Typography>
                        {lastMsg && (
                          <Typography variant="caption" color="text.disabled" sx={{ minWidth: 60, textAlign: 'right' }}>
                            {lastMsg.createdAt ? formatTimeAgo(lastMsg.createdAt) : ''}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {getOtherParticipant(selectedConversation)?.username || 'Unknown User'}
                      </Typography>
                      {selectedConversation?.starred && (
                        <StarIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                      )}
                      {selectedConversation?.muted && (
                        <MuteIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                      {selectedConversation?.archived && (
                        <ArchiveIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {selectedConversation.subject}
                    </Typography>
                  </Box>
                  
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="More options">
                      <IconButton 
                        onClick={handleConversationAction}
                        sx={{ color: 'text.secondary' }}
                      >
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
                    {groupMessagesByDate(messages).map((group) => (
                      <div key={group.date}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                          <Chip 
                            label={formatDateHeader(group.date)}
                            size="small"
                            sx={{ 
                              bgcolor: 'rgba(0,0,0,0.05)', 
                              color: 'text.secondary',
                              fontWeight: 500
                            }}
                          />
                        </Box>
                        {group.messages.map((message, index) => {
                          const isOwnMessage = message.senderId && currentUser?.uid && message.senderId === currentUser.uid;
                          
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
                                    cursor: 'pointer',
                                    '&:hover': {
                                      backgroundColor: isOwnMessage ? 'primary.dark' : '#E8E8E8',
                                    },
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
                                  onContextMenu={(e) => handleMessageAction(e, message)}
                                >
                                  <Typography variant="body1" sx={{ mb: 1 }}>
                                    {message.content}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                      {message.timestamp ? getDetailedTime(message.timestamp) : ''}
                                    </Typography>
                                    {getMessageStatusIcon(message)}
                                    {message.status === 'failed' && isOwnMessage && (
                                      <Tooltip title="Retry sending">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRetryMessage(message)}
                                          sx={{ 
                                            color: 'error.main',
                                            p: 0.5,
                                            '&:hover': { color: 'error.dark' }
                                          }}
                                        >
                                          <RefreshIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Slide>
                          );
                        })}
                      </div>
                    ))}
                    {/* Typing indicator */}
                    {typingUsers && typingUsers.size > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 2, ml: 2 }}>
                        <CircularProgress size={16} color="primary" thickness={6} sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                        </Typography>
                      </Box>
                    )}
                    <div ref={messagesEndRef} />
                  </Stack>
                )}
              </Box>

              {/* Message Input Area */}
              <Box sx={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #eee', bgcolor: '#fafafa' }}>
                {error && (
                  <Alert severity="error" sx={{ m: 1, borderRadius: 1 }}>
                    {error}
                  </Alert>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 1 }}>
                  <IconButton onClick={handleEmojiClick} size="large" color="primary">
                    <EmojiIcon />
                  </IconButton>
                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleEmojiClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    PaperProps={{ sx: { p: 1, borderRadius: 2, minWidth: 220 } }}
                  >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {emojiList.map((emoji) => (
                        <IconButton key={emoji} onClick={() => handleEmojiSelect(emoji)} size="small">
                          <span style={{ fontSize: 22 }}>{emoji}</span>
                        </IconButton>
                      ))}
                    </Box>
                  </Popover>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={handleMessageInputChange}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    multiline
                    minRows={1}
                    maxRows={4}
                    disabled={sendingMessage}
                    sx={{ borderRadius: 2, bgcolor: '#fff' }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!messageInput.trim() || sendingMessage}
                    onClick={handleSendMessage}
                    sx={{ ml: 1, borderRadius: 2, minWidth: 80 }}
                  >
                    {sendingMessage ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Send'
                    )}
                  </Button>
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

      {/* Message Actions Context Menu */}
      <Menu
        anchorEl={messageActions.anchorEl}
        open={Boolean(messageActions.anchorEl)}
        onClose={handleMessageActionClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 150,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <MenuItem onClick={handleReply}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            Reply
          </Box>
        </MenuItem>
        <MenuItem onClick={handleForward}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SendIcon sx={{ fontSize: 18 }} />
            Forward
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon sx={{ fontSize: 18 }} />
            Delete
          </Box>
        </MenuItem>
      </Menu>

      {/* Conversation Actions Menu */}
      <Menu
        anchorEl={conversationActions.anchorEl}
        open={Boolean(conversationActions.anchorEl)}
        onClose={handleConversationActionClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <MenuItem onClick={handleViewProfile}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 18 }} />
            View Profile
          </Box>
        </MenuItem>
        <MenuItem onClick={handleStarConversation}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedConversation?.starred ? (
              <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            ) : (
              <StarBorderIcon sx={{ fontSize: 18 }} />
            )}
            {selectedConversation?.starred ? 'Unstar Conversation' : 'Star Conversation'}
          </Box>
        </MenuItem>
        <MenuItem onClick={handleMuteConversation}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedConversation?.muted ? (
              <UnmuteIcon sx={{ fontSize: 18 }} />
            ) : (
              <MuteIcon sx={{ fontSize: 18 }} />
            )}
            {selectedConversation?.muted ? 'Unmute Notifications' : 'Mute Notifications'}
          </Box>
        </MenuItem>
        <MenuItem onClick={handleArchiveConversation}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArchiveIcon sx={{ fontSize: 18 }} />
            {selectedConversation?.archived ? 'Unarchive' : 'Archive'}
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleBlockUser} sx={{ color: 'warning.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BlockIcon sx={{ fontSize: 18 }} />
            {getOtherParticipant(selectedConversation)?.blocked ? 'Unblock User' : 'Block User'}
          </Box>
        </MenuItem>
        <MenuItem onClick={handleReportUser} sx={{ color: 'warning.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportIcon sx={{ fontSize: 18 }} />
            Report User
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteConversation} sx={{ color: 'error.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon sx={{ fontSize: 18 }} />
            Delete Conversation
          </Box>
        </MenuItem>
      </Menu>

      {/* Report User Dialog */}
      <Dialog
        open={reportDialog.open}
        onClose={() => setReportDialog({ open: false, userId: null, username: '', reason: '', description: '' })}
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
            Report User
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Report {reportDialog.username} for inappropriate behavior
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Reason</InputLabel>
              <Select
                value={reportDialog.reason}
                onChange={(e) => setReportDialog(prev => ({ ...prev, reason: e.target.value }))}
                label="Reason"
              >
                <MenuItem value="harassment">Harassment</MenuItem>
                <MenuItem value="spam">Spam</MenuItem>
                <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
                <MenuItem value="fake">Fake Profile</MenuItem>
                <MenuItem value="scam">Scam</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={reportDialog.description}
              onChange={(e) => setReportDialog(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please provide details about the issue..."
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setReportDialog({ open: false, userId: null, username: '', reason: '', description: '' })}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReport}
            variant="contained"
            color="warning"
            disabled={!reportDialog.reason || !reportDialog.description}
            sx={{ borderRadius: 2 }}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MessagingSystem; 
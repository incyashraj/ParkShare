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
  AttachFile as AttachFileIcon,
  LocalParking,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import UserPresenceIndicator from './UserPresenceIndicator';
import UserStatusIndicator from './UserStatusIndicator';
import FileUpload from './FileUpload';
import MessageAttachment from './MessageAttachment';
import UserActivityTracker from './UserActivityTracker';
import { API_BASE } from '../apiConfig';

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
  const [showArchived, setShowArchived] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showE2EEWarning, setShowE2EEWarning] = useState(false);

  const messagesEndRef = useRef(null);

  // Add emoji picker state
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  const emojiList = ['😀','😂','😍','😎','👍','🙏','🎉','🚗','🏆','💬','❤️','😅','😇','😢','😡','😱','🤔','🙌','👏','🔥','🌟'];

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // Scroll to bottom when new messages are added or when conversation is first loaded
  useEffect(() => {
    if (messages.length > 0) {
      // Scroll immediately for new messages, with a small delay for loaded conversations
      const shouldScrollImmediately = messages.length > previousMessageCount;
      if (shouldScrollImmediately) {
        scrollToBottom();
      } else if (previousMessageCount === 0 && messages.length > 0) {
        // First time loading messages in a conversation
        setTimeout(() => scrollToBottom(), 100);
      }
    }
    setPreviousMessageCount(messages.length);
  }, [messages.length, previousMessageCount]);

  // Helper function to get other user from participants
  const getOtherUser = useCallback((participants) => {
    if (!participants) return null;
    return participants.find(p => p.uid !== currentUser?.uid);
  }, [currentUser?.uid]);

  const setSortedConversations = (convs) => {
    setConversations(
      (convs || []).sort((a, b) => {
        // Prefer lastActivity, fallback to lastMessage.timestamp
        const aTime = new Date(a.lastActivity || (a.lastMessage && a.lastMessage.timestamp) || 0);
        const bTime = new Date(b.lastActivity || (b.lastMessage && b.lastMessage.timestamp) || 0);
        return bTime - aTime;
      })
    );
  };

  const loadConversations = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSortedConversations(data.conversations || []);
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
      const response = await fetch(`${API_BASE}/users/messaging`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Only show users with public keys
        const filtered = [];
        for (const user of data.users || []) {
          try {
            const pkRes = await fetch(`${API_BASE}/users/${user.uid}/publicKey`);
            if (pkRes.ok) filtered.push(user);
          } catch {}
        }
        setAvailableUsers(filtered);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, [currentUser?.uid]);

  const loadMessages = useCallback(async (convId) => {
    if (!currentUser?.uid || !convId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/conversations/${convId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        let decrypted = await decryptMessages(data.messages || []);
        // Sort messages by timestamp ascending (oldest first)
        decrypted = decrypted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        // Map backend 'read' to status for own messages
        const mapMessageStatus = (msgs) => {
          return msgs.map(msg => {
            if (msg.senderId === currentUser?.uid) {
              if (msg.read) return { ...msg, status: 'read' };
              // If not read, treat as delivered (since delivered/read is only for own messages)
              return { ...msg, status: 'delivered' };
            }
            return msg;
          });
        };
        decrypted = mapMessageStatus(decrypted);
        setMessages(decrypted);
        setPreviousMessageCount(0);
        setTimeout(() => scrollToBottom(), 100);
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
      const handleNewMessage = async (data) => {
        let newMsg = data.message;
        if (newMsg.content && isPGPMessage(newMsg.content)) {
          try {
            const privateKey = getStoredPrivateKey();
            if (privateKey) {
              newMsg = { ...newMsg, content: await decryptMessage(newMsg.content, privateKey) };
            }
          } catch {
            newMsg = { ...newMsg, content: '[Unable to decrypt]' };
          }
        }
        if (selectedConversation && data.conversationId === selectedConversation.id) {
          setMessages(prev => {
            // If an optimistic message exists (temp id), replace it
            const tempIdx = prev.findIndex(msg => msg.id.startsWith('temp_') && msg.content === newMsg.content);
            if (tempIdx !== -1) {
              const updated = [...prev];
              updated[tempIdx] = newMsg;
              return updated;
            }
            // Otherwise, avoid duplicates by id
            if (prev.some(msg => msg.id === newMsg.id)) return prev;
            return [...prev, newMsg].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          });
          // Emit delivered status with messageId
          if (socket) {
            socket.emit('message-status', {
              conversationId: data.conversationId,
              messageId: newMsg.id,
              userId: currentUser.uid,
              status: 'delivered'
            });
          }
        }
        setConversations(prev => prev.map(conv =>
          conv.id === data.conversationId
            ? { ...conv, lastMessage: newMsg, lastActivity: newMsg.timestamp, unreadCount: (conv.unreadCount || 0) + 1 }
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
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.email, isConnected, socket, loadConversations, loadAvailableUsers, selectedConversation]);

  // Define handleSelectConversation before it's used in useEffect
  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    setPreviousMessageCount(0); // Reset message count for new conversation
    loadMessages(conversation.id);
    if (isMobile) {
      setShowConversationList(false);
    }
  }, [loadMessages, isMobile]);

  // Handle conversationId parameter from URL
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation && (!selectedConversation || selectedConversation.id !== conversationId)) {
        handleSelectConversation(conversation);
      }
    }
  }, [conversationId, conversations, selectedConversation, handleSelectConversation]);

  // Helper functions to check conversation status for current user
  const isConversationStarred = (conversation) => {
    if (!conversation || !conversation.starred || !currentUser?.uid) return false;
    return conversation.starred[currentUser.uid] === true;
  };

  const isConversationMuted = (conversation) => {
    if (!conversation || !conversation.muted || !currentUser?.uid) return false;
    return conversation.muted[currentUser.uid] === true;
  };

  const isConversationArchived = (conversation) => {
    if (!conversation || !conversation.archived || !currentUser?.uid) return false;
    return conversation.archived[currentUser.uid] === true;
  };

  // Filter conversations based on search term and archive status
  const filteredConversations = conversations.filter(conv => {
    // Skip null or undefined conversations
    if (!conv) return false;
    
    const otherUser = conv.participants ? getOtherUser(conv.participants) : null;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = otherUser?.username?.toLowerCase().includes(searchLower) ||
           conv.subject?.toLowerCase().includes(searchLower) ||
           (conv.messages && conv.messages.length > 0 && 
            conv.messages[conv.messages.length - 1].content?.toLowerCase().includes(searchLower));
    
    // Filter by archive status using helper function
    const matchesArchiveFilter = showArchived ? isConversationArchived(conv) : !isConversationArchived(conv);
    
    return matchesSearch && matchesArchiveFilter;
  });

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || !selectedConversation || sendingMessage) return;
    setSendingMessage(true);
    const tempMessageId = `temp_${Date.now()}`;
    const newMsg = {
      id: tempMessageId,
      content: messageInput,
      attachments: selectedFiles,
      senderId: currentUser.uid,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    // Optimistically add only the user's own message
    setMessages(prev => [
      ...prev.filter(msg => msg.id !== tempMessageId),
      newMsg
    ]);
    const messageContent = messageInput;
    const messageAttachments = selectedFiles;
    setMessageInput('');
    setSelectedFiles([]);
    setShowFileUpload(false);
    setTimeout(() => scrollToBottom(), 50);
    try {
      // Fetch recipient public key
      const otherUser = selectedConversation.participants.find(p => p.uid !== currentUser.uid);
      let recipientPublicKey;
      try {
        recipientPublicKey = await fetchUserPublicKey(otherUser.uid);
      } catch (e) {
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessageId ? { ...msg, status: 'failed' } : msg
        ));
        setError('Recipient has not set up secure messaging yet. They need to log in once before you can message them.');
        setSendingMessage(false);
        return;
      }
      // Encrypt message
      const encryptedContent = await encryptMessage(messageContent, recipientPublicKey);
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: encryptedContent,
          senderId: currentUser.uid,
          attachments: messageAttachments
        })
      });
      if (response.ok) {
        const data = await response.json();
        // Decrypt the message content before updating the UI
        let decryptedMessage = data.message;
        try {
          if (decryptedMessage.content) {
            const privateKey = getStoredPrivateKey();
            if (privateKey) {
              decryptedMessage = {
                ...decryptedMessage,
                content: await decryptMessage(decryptedMessage.content, privateKey)
              };
            }
          }
        } catch (e) {
          decryptedMessage = {
            ...decryptedMessage,
            content: '[Unable to decrypt]'
          };
        }
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessageId ? { ...decryptedMessage, status: 'sent' } : msg
        ));
        setConversations(prev => prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: decryptedMessage, lastActivity: decryptedMessage.timestamp }
            : conv
        ));
        setSuccessMessage('Message sent successfully');
        setTimeout(() => setSuccessMessage(null), 2000);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        const errorData = await response.json();
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessageId ? { ...msg, status: 'failed' } : msg
        ));
        setError(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
      const response = await fetch(`${API_BASE}/messages`, {
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
        
        // Show success notification
        setSuccessMessage('Message sent successfully');
        setTimeout(() => setSuccessMessage(null), 2000);
        
        // Ensure scroll to bottom after successful retry
        setTimeout(() => scrollToBottom(), 100);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          if (errorData.message.includes('blocked users')) {
            setError(`Cannot send message - ${errorData.blockedUsers?.join(', ')} are blocked. Unblock them in your profile to send messages.`);
          } else if (errorData.message.includes('been blocked')) {
            setError('Cannot send message - you have been blocked by one or more participants.');
          } else {
            setError(errorData.message || 'Cannot send message to this conversation.');
          }
        } else {
          setError(errorData.message || 'Failed to retry message');
        }
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
      const response = await fetch(`${API_BASE}/conversations`, {
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
        
        // Show success notification
        setSuccessMessage('Conversation created successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Reload conversations and navigate to the new conversation
        await loadConversations();
        
        // Navigate to the new conversation
        if (data.conversation) {
          navigate(`/messages/${data.conversation.id}`);
        }
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          if (errorData.message.includes('blocked user')) {
            setError(`Cannot message ${errorData.blockedUser || 'this user'} - they are blocked. Unblock them in your profile to send messages.`);
          } else if (errorData.message.includes('been blocked')) {
            setError('Cannot create conversation - you have been blocked by this user.');
          } else {
            setError(errorData.message || 'Cannot create conversation with this user.');
          }
        } else {
          setError(errorData.message || 'Failed to create conversation');
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setError('Failed to create conversation');
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
    setShowConversationList(true);
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants || !currentUser?.uid) return null;
    return conversation.participants.find(p => p.uid !== currentUser.uid);
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
      const response = await fetch(`${API_BASE}/messages/${messageActions.message.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageActions.message.id));
        
        // Show success notification
        setSuccessMessage('Message deleted successfully');
        setTimeout(() => setSuccessMessage(null), 2000);
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
      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update local state with the full conversation object
        setSelectedConversation(data.conversation);
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? data.conversation
            : conv
        ));
        
        setSuccessMessage(`Conversation ${data.muted ? 'muted' : 'unmuted'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
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
      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update local state with the full conversation object
        setSelectedConversation(data.conversation);
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? data.conversation
            : conv
        ));
        
        setSuccessMessage(`Conversation ${data.starred ? 'starred' : 'unstarred'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
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
      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update local state with the full conversation object
        setSelectedConversation(data.conversation);
        
        // Update conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? data.conversation
            : conv
        ));
        
        setSuccessMessage(`Conversation ${data.archived ? 'archived' : 'unarchived'} successfully`);
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // If archiving, close the conversation view
        if (data.archived) {
          setSelectedConversation(null);
          setMessages([]);
        }
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
      const response = await fetch(`${API_BASE}/users/${otherUser.uid}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({ blocked: true })
      });
      
      if (response.ok) {
        setSuccessMessage('User blocked successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
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
      const response = await fetch(`${API_BASE}/users/${reportDialog.userId}/report`, {
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
        setSuccessMessage('User reported successfully. Our support team will review this report.');
        setReportDialog({ open: false, userId: null, username: '', reason: '', description: '' });
        setTimeout(() => setSuccessMessage(null), 5000);
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
      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}`, {
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
        
        // Show success notification
        setSuccessMessage('Conversation deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
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
    let status = message.status;
    if (!status && message.senderId === currentUser?.uid) {
      status = message.read ? 'read' : 'delivered';
    }
    switch (status) {
      case 'sending':
        return <CircularProgress size={12} />;
      case 'sent':
        return <DoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />;
      case 'delivered':
        return <span style={{ fontSize: 12, color: '#1976d2', fontWeight: 500, marginLeft: 4 }}>delivered</span>;
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

  const handleFilesSelected = (files) => {
    setSelectedFiles(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const handleRemoveAttachment = (fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleToggleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  // Key management utilities
  const getStoredPrivateKey = () => localStorage.getItem('pgp_privateKey');
  const getStoredPublicKey = () => localStorage.getItem('pgp_publicKey');
  const storeKeys = (privateKey, publicKey) => {
    localStorage.setItem('pgp_privateKey', privateKey);
    localStorage.setItem('pgp_publicKey', publicKey);
  };

  const generatePGPKeys = async (userId, email) => {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Secure messaging is not supported in this environment.');
    }
    const openpgp = await import('openpgp');
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'rsa',
      rsaBits: 2048,
      userIDs: [{ name: userId, email }],
      passphrase: '' // No passphrase for demo; use a real one in production
    });
    storeKeys(privateKey, publicKey);
    return { privateKey, publicKey };
  };

  const encryptMessage = async (plaintext, recipientPublicKeyArmored) => {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Secure messaging is not supported in this environment.');
    }
    const openpgp = await import('openpgp');
    const publicKey = await openpgp.readKey({ armoredKey: recipientPublicKeyArmored });
    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: plaintext }),
      encryptionKeys: publicKey
    });
    return encrypted;
  };

  const decryptMessage = async (ciphertext, privateKeyArmored) => {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      throw new Error('Secure messaging is not supported in this environment.');
    }
    const openpgp = await import('openpgp');
    const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
    const message = await openpgp.readMessage({ armoredMessage: ciphertext });
    const { data: decrypted } = await openpgp.decrypt({
      message,
      decryptionKeys: privateKey
    });
    return decrypted;
  };

  // On first login, generate and upload keys if not present
  useEffect(() => {
    if (!currentUser) return;
    const setupKeys = async () => {
      let privateKey = getStoredPrivateKey();
      let publicKey = getStoredPublicKey();
      let needsUpload = false;
      if (!privateKey || !publicKey) {
        const keys = await generatePGPKeys(currentUser.uid, currentUser.email);
        privateKey = keys.privateKey;
        publicKey = keys.publicKey;
        needsUpload = true;
      }
      // Always upload public key to backend on login to ensure it's present
      await fetch(`${API_BASE}/users/${currentUser.uid}/publicKey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey })
      });
    };
    setupKeys();
  }, [currentUser]);

  // Helper to fetch a user's public key
  const fetchUserPublicKey = async (userId) => {
    const res = await fetch(`${API_BASE}/users/${userId}/publicKey`);
    if (!res.ok) throw new Error('Could not fetch public key');
    const data = await res.json();
    return data.publicKey;
  };

  // Helper to detect PGP message
  const isPGPMessage = (content) => typeof content === 'string' && content.startsWith('-----BEGIN PGP MESSAGE-----');

  // Decrypt messages after loading
  const decryptMessages = async (msgs) => {
    const privateKey = getStoredPrivateKey();
    if (!privateKey) return msgs;
    let unableToDecrypt = false;
    const decryptedMsgs = await Promise.all(msgs.map(async (msg) => {
      try {
        if (msg.content && isPGPMessage(msg.content)) {
          const decrypted = await decryptMessage(msg.content, privateKey);
          return { ...msg, content: decrypted };
        }
        return msg; // Plaintext, no decryption needed
      } catch {
        unableToDecrypt = true;
        return { ...msg, content: '[Unable to decrypt]' };
      }
    }));
    setShowE2EEWarning(unableToDecrypt);
    // Always sort by timestamp ascending (oldest first)
    return decryptedMsgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  // In useEffect, when selectedConversation changes, mark messages as read
  useEffect(() => {
    if (!selectedConversation || !currentUser?.uid) return;
    // Mark all messages as read in this conversation
    const markAsRead = async () => {
      try {
        await fetch(`${API_BASE}/conversations/${selectedConversation.id}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.uid}`
          }
        });
        // Emit socket event to notify sender
        if (socket) {
          socket.emit('message-status', {
            conversationId: selectedConversation.id,
            userId: currentUser.uid,
            status: 'read'
          });
        }
      } catch (e) {
        // Ignore errors
      }
    };
    markAsRead();
  }, [selectedConversation, currentUser, socket]);

  // Listen for 'message-status' events and update message status in UI
  useEffect(() => {
    if (!socket) return;
    const handleMessageStatus = (data) => {
      setMessages(prev => prev.map(msg =>
        msg.id === data.messageId ? { ...msg, status: data.status } : msg
      ));
    };
    socket.on('message-status', handleMessageStatus);
    return () => {
      socket.off('message-status', handleMessageStatus);
    };
  }, [socket]);

  // In useEffect, when selectedConversation changes, scroll to bottom after loading messages
  useEffect(() => {
    if (!selectedConversation) return;
    setTimeout(() => scrollToBottom(), 200);
  }, [selectedConversation]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: 'calc(100vh - 200px)' }}>
      {currentUser && <UserActivityTracker userId={currentUser.uid} />}
      {showE2EEWarning && (
        <div className="e2ee-warning" style={{ background: '#fffbe6', color: '#ad8b00', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #ffe58f' }}>
          <strong>Some messages could not be decrypted.</strong><br />
          End-to-end encryption is only available for messages sent after your encryption keys were created. Older messages or messages sent before this may not be readable.
        </div>
      )}
      {/* Success and Error Messages */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
        {/* Conversation List */}
        <Paper elevation={2} sx={{ 
          width: { xs: '100%', md: 340 }, 
          minWidth: 0, 
          maxWidth: 400, 
          height: '100%', 
          borderRadius: 4, 
          border: '1px solid #eee', 
          bgcolor: '#fff', 
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Fixed Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #f0f0f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            bgcolor: '#fff',
            zIndex: 1,
            flexShrink: 0
          }}>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'primary.main' }}>Messages</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={showArchived ? "Show Active" : "Show Archived"}>
                <IconButton 
                  color={showArchived ? "primary" : "default"}
                  onClick={() => setShowArchived(!showArchived)}
                  sx={{ 
                    bgcolor: showArchived ? 'rgba(255,56,92,0.1)' : 'transparent',
                    '&:hover': { bgcolor: showArchived ? 'rgba(255,56,92,0.2)' : 'rgba(0,0,0,0.05)' }
                  }}
                >
                  <ArchiveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="New Message">
                <IconButton color="primary" onClick={handleOpenNewMessageDialog}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Fixed Search Bar */}
          <Box sx={{ 
            p: 1, 
            borderBottom: '1px solid #f0f0f0',
            bgcolor: '#fff',
            zIndex: 1,
            flexShrink: 0
          }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: '#fafafa' }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Box>
          
          {/* Scrollable Conversation List */}
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            bgcolor: '#fafafa',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.3)',
            },
            '&.scrolling::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.4)',
            }
          }}
          onScroll={(e) => {
            const element = e.target;
            element.classList.add('scrolling');
            clearTimeout(element.scrollTimeout);
            element.scrollTimeout = setTimeout(() => {
              element.classList.remove('scrolling');
            }, 1000);
          }}
          >
            <List sx={{ p: 0, m: 0 }}>
              {filteredConversations.length === 0 && (
                <ListItem sx={{ justifyContent: 'center', py: 4 }}>
                  <Typography color="text.secondary">No conversations</Typography>
                </ListItem>
              )}
              {filteredConversations.map((conv) => {
                const isSelected = selectedConversation && selectedConversation.id === conv.id;
                const lastMsg = conv.lastMessage || (conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null);
                const unreadCount = conv.unreadCount || 0;
                const otherUser = conv.participants ? getOtherUser(conv.participants) : null;
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
                      borderBottom: '1px solid #f0f0f0',
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 48, mr: 2 }}>
                      <UserPresenceIndicator 
                        userId={otherUser?.uid} 
                        username={otherUser?.username} 
                        size="small"
                        hideOwnStatus={true}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography 
                            fontWeight={600} 
                            sx={{ 
                              color: isSelected ? 'primary.main' : 'text.primary',
                              fontSize: '0.95rem',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {otherUser?.username || 'Unknown'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                            {isConversationStarred(conv) && (
                              <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                            )}
                            {isConversationMuted(conv) && (
                              <MuteIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            )}
                            {isConversationArchived(conv) && (
                              <ArchiveIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            )}
                            {unreadCount > 0 && (
                              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 0.5 }} />
                            )}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {/* Spot information if available */}
                          {conv.spotDetails && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1, 
                              bgcolor: 'rgba(25, 118, 210, 0.08)', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1,
                              border: '1px solid rgba(25, 118, 210, 0.2)'
                            }}>
                              <LocalParking sx={{ fontSize: 14, color: 'primary.main' }} />
                              <Typography 
                                variant="caption" 
                                color="primary.main" 
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {conv.spotDetails.title}
                              </Typography>
                              <Chip 
                                label={conv.spotDetails.available ? 'Available' : 'Occupied'} 
                                size="small" 
                                color={conv.spotDetails.available ? 'success' : 'default'}
                                sx={{ height: 16, fontSize: '0.6rem' }}
                              />
                            </Box>
                          )}
                          
                          {/* Message content */}
                          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <Typography 
                              variant="body2" 
                              color={conv.muted ? 'text.disabled' : 'text.secondary'} 
                              noWrap 
                              sx={{ 
                                flex: 1, 
                                maxWidth: '70%',
                                opacity: conv.muted ? 0.6 : 1,
                                fontSize: '0.8rem',
                                lineHeight: 1.2
                              }}
                            >
                              {lastMsg ? (lastMsg.content && lastMsg.content.length > 25 ? lastMsg.content.slice(0, 25) + '…' : lastMsg.content) : 'No messages yet'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                              {lastMsg && (
                                <Typography variant="caption" color="text.disabled" sx={{ minWidth: 50, textAlign: 'right', fontSize: '0.7rem' }}>
                                  {lastMsg.createdAt ? formatTimeAgo(lastMsg.createdAt) : ''}
                                </Typography>
                              )}
                              {/* Status indicator */}
                              {otherUser && (
                                <UserStatusIndicator 
                                  userId={otherUser.uid} 
                                  username={otherUser.username} 
                                  size="small"
                                  showTooltip={false}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
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
                  
                  <UserPresenceIndicator 
                    userId={getOtherParticipant(selectedConversation)?.uid} 
                    username={getOtherParticipant(selectedConversation)?.username} 
                    size="medium"
                    hideOwnStatus={true}
                  />
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {getOtherParticipant(selectedConversation)?.username || 'Unknown User'}
                      </Typography>
                      {isConversationStarred(selectedConversation) && (
                        <StarIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                      )}
                      {isConversationMuted(selectedConversation) && (
                        <MuteIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                      {isConversationArchived(selectedConversation) && (
                        <ArchiveIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedConversation.subject}
                      </Typography>
                      {/* Status indicator */}
                      <UserStatusIndicator 
                        userId={getOtherParticipant(selectedConversation)?.uid} 
                        username={getOtherParticipant(selectedConversation)?.username} 
                        size="small"
                        showTooltip={true}
                      />
                    </Box>
                    
                    {/* Spot information if available */}
                    {selectedConversation.spotDetails && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mt: 1,
                        bgcolor: 'rgba(25, 118, 210, 0.08)', 
                        px: 2, 
                        py: 1, 
                        borderRadius: 2,
                        border: '1px solid rgba(25, 118, 210, 0.2)'
                      }}>
                        <LocalParking sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="primary.main" fontWeight={500}>
                            {selectedConversation.spotDetails.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedConversation.spotDetails.location} • {selectedConversation.spotDetails.hourlyRate}
                          </Typography>
                        </Box>
                        <Chip 
                          label={selectedConversation.spotDetails.available ? 'Available' : 'Occupied'} 
                          size="small" 
                          color={selectedConversation.spotDetails.available ? 'success' : 'default'}
                        />
                      </Box>
                    )}
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
              <Box sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                p: 2,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.3)',
                },
                '&.scrolling::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.4)',
                }
              }}
              onScroll={(e) => {
                const element = e.target;
                element.classList.add('scrolling');
                clearTimeout(element.scrollTimeout);
                element.scrollTimeout = setTimeout(() => {
                  element.classList.remove('scrolling');
                }, 1000);
              }}
              >
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
                                  {message.content && (
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                      {message.content}
                                    </Typography>
                                  )}
                                  
                                  {/* Display attachments */}
                                  {message.attachments && message.attachments.length > 0 && (
                                    <Box sx={{ mb: 1 }}>
                                      {message.attachments.map((attachment) => (
                                        <MessageAttachment
                                          key={attachment.id}
                                          attachment={attachment}
                                          onDelete={handleRemoveAttachment}
                                          canDelete={message.senderId === currentUser.uid}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                      {message.timestamp ? getDetailedTime(message.timestamp) : ''}
                                    </Typography>
                                    {isOwnMessage && getMessageStatusIcon(message)}
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
                
                {/* File Upload Area */}
                {showFileUpload && (
                  <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <FileUpload 
                      onFilesSelected={handleFilesSelected}
                      maxFiles={5}
                      maxSize={10}
                    />
                  </Box>
                )}
                
                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <Box sx={{ p: 1, borderBottom: '1px solid #eee', bgcolor: '#f8f9fa' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Attached files ({selectedFiles.length})
                    </Typography>
                    {selectedFiles.map((file) => (
                      <MessageAttachment
                        key={file.id}
                        attachment={file}
                        onDelete={handleRemoveAttachment}
                        canDelete={true}
                      />
                    ))}
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 1 }}>
                  <IconButton onClick={handleEmojiClick} size="large" color="primary">
                    <EmojiIcon />
                  </IconButton>
                  <Tooltip title="Attach files">
                    <IconButton 
                      onClick={handleToggleFileUpload} 
                      size="large" 
                      color={showFileUpload ? "primary" : "default"}
                      sx={{ 
                        bgcolor: showFileUpload ? 'rgba(25,118,210,0.1)' : 'transparent',
                        '&:hover': { bgcolor: showFileUpload ? 'rgba(25,118,210,0.2)' : 'rgba(0,0,0,0.05)' }
                      }}
                    >
                      <AttachFileIcon />
                    </IconButton>
                  </Tooltip>
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
                    disabled={(!messageInput.trim() && selectedFiles.length === 0) || sendingMessage}
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
            {isConversationStarred(selectedConversation) ? (
              <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            ) : (
              <StarBorderIcon sx={{ fontSize: 18 }} />
            )}
            {isConversationStarred(selectedConversation) ? 'Unstar Conversation' : 'Star Conversation'}
          </Box>
        </MenuItem>
        <MenuItem onClick={handleMuteConversation}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isConversationMuted(selectedConversation) ? (
              <UnmuteIcon sx={{ fontSize: 18 }} />
            ) : (
              <MuteIcon sx={{ fontSize: 18 }} />
            )}
            {isConversationMuted(selectedConversation) ? 'Unmute Notifications' : 'Mute Notifications'}
          </Box>
        </MenuItem>
        <MenuItem onClick={handleArchiveConversation}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ArchiveIcon sx={{ fontSize: 18 }} />
            {isConversationArchived(selectedConversation) ? 'Unarchive' : 'Archive'}
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
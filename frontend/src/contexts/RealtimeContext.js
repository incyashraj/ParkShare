import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const RealtimeContext = createContext();

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPresence, setUserPresence] = useState(new Map());
  const [messages, setMessages] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [spotStatus, setSpotStatus] = useState(new Map());
  const [connectedUsers, setConnectedUsers] = useState([]);

  console.log('RealtimeProvider rendered, isConnected:', isConnected, 'socket:', socket);

  // Initialize socket connection
  useEffect(() => {
    let newSocket;
    try {
      newSocket = io('http://localhost:3001', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
    } catch (error) {
      console.error('Failed to initialize socket connection:', error);
      return;
    }

    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // User authentication
    newSocket.on('user-authenticated', (userData) => {
      setCurrentUser(userData);
      console.log('User authenticated in real-time:', userData.username);
    });

    // Enhanced booking notifications
    newSocket.on('booking-received', (notification) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'booking',
        title: notification.title,
        message: notification.message,
        data: notification.booking,
        timestamp: notification.timestamp,
        read: false
      }, ...prev]);
    });

    // Booking cancellations
    newSocket.on('booking-cancelled', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'cancellation',
        title: 'Booking Cancelled',
        message: `${data.userName} cancelled their booking`,
        data: data,
        timestamp: new Date(),
        read: false
      }, ...prev]);
    });

    // Spot availability updates
    newSocket.on('spot-availability-updated', (data) => {
      setSpotStatus(prev => new Map(prev.set(data.spotId, {
        available: data.available,
        reason: data.reason,
        lastUpdated: data.lastUpdated
      })));

      setNotifications(prev => [{
        id: Date.now(),
        type: 'availability',
        title: 'Spot Availability Changed',
        message: `Spot ${data.spotId} is now ${data.available ? 'available' : 'unavailable'}`,
        data: data,
        timestamp: new Date(),
        read: false
      }, ...prev]);
    });

    // Spot booked notifications
    newSocket.on('spot-booked', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'spot-booked',
        title: 'Spot Booked',
        message: `Spot ${data.spotId} has been booked`,
        data: data,
        timestamp: data.timestamp,
        read: false
      }, ...prev]);
    });

    // Spot status updates
    newSocket.on('spot-status', (data) => {
      setSpotStatus(prev => new Map(prev.set(data.spotId, {
        available: data.available,
        currentBookings: data.currentBookings,
        lastUpdated: data.lastUpdated
      })));
    });

    // User presence updates
    newSocket.on('user-presence-update', (data) => {
      setUserPresence(prev => new Map(prev.set(data.userId, {
        online: data.online,
        lastSeen: data.lastSeen,
        username: data.username
      })));
    });

    // Real-time messaging
    newSocket.on('new-message', (messageData) => {
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationId = [messageData.senderId, messageData.recipientId].sort().join('-');
        const conversation = newMessages.get(conversationId) || [];
        conversation.push(messageData);
        newMessages.set(conversationId, conversation);
        return newMessages;
      });

      // Add message notification
      setNotifications(prev => [{
        id: Date.now(),
        type: 'message',
        title: `New Message from ${messageData.senderName}`,
        message: messageData.message.substring(0, 50) + (messageData.message.length > 50 ? '...' : ''),
        data: messageData,
        timestamp: messageData.timestamp,
        read: false
      }, ...prev]);
    });

    // Message sent confirmation
    newSocket.on('message-sent', (messageData) => {
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationId = [messageData.senderId, messageData.recipientId].sort().join('-');
        const conversation = newMessages.get(conversationId) || [];
        conversation.push(messageData);
        newMessages.set(conversationId, conversation);
        return newMessages;
      });
    });

    // Typing indicators
    newSocket.on('user-typing', (data) => {
      setTypingUsers(prev => new Map(prev.set(data.senderId, data.typing)));
    });

    // Spot search results
    newSocket.on('spot-search-results', (data) => {
      // This can be used to update search results in real-time
      console.log('Real-time search results:', data);
    });

    // General announcements
    newSocket.on('announcement', (announcement) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'announcement',
        title: announcement.title,
        message: announcement.message,
        data: announcement,
        timestamp: new Date(),
        read: false
      }, ...prev]);
    });

    // Support ticket notifications
    newSocket.on('support-ticket-notification', (notification) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'support-ticket',
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: new Date(notification.timestamp),
        read: false
      }, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        try {
          newSocket.close();
        } catch (error) {
          console.error('Error closing socket:', error);
        }
      }
    };
  }, []);

  // Authenticate user when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user && socket) {
        const userData = {
          uid: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email
        };
        
        socket.emit('authenticate-user', userData);
        setCurrentUser(userData);
      }
    });

    return unsubscribe;
  }, [socket]);

  // Activity tracking
  useEffect(() => {
    if (!socket || !currentUser) return;

    const trackActivity = () => {
      socket.emit('user-activity', {
        type: 'page_view',
        page: window.location.pathname,
        timestamp: new Date()
      });
    };

    // Track initial activity
    trackActivity();

    // Track activity on user interaction
    const events = ['click', 'scroll', 'keypress', 'mousemove'];
    const throttledTrackActivity = throttle(trackActivity, 30000); // Throttle to 30 seconds

    events.forEach(event => {
      window.addEventListener(event, throttledTrackActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledTrackActivity);
      });
    };
  }, [socket, currentUser]);

  // Utility functions
  const joinSpotRoom = useCallback((spotId) => {
    if (socket) {
      socket.emit('join-spot-room', spotId);
    }
  }, [socket]);

  const leaveSpotRoom = useCallback((spotId) => {
    if (socket) {
      socket.emit('leave-spot-room', spotId);
    }
  }, [socket]);

  const sendMessage = useCallback((recipientId, message) => {
    if (socket && currentUser) {
      socket.emit('send-message', {
        recipientId,
        message,
        senderId: currentUser.uid,
        senderName: currentUser.username
      });
    }
  }, [socket, currentUser]);

  const startTyping = useCallback((recipientId) => {
    if (socket && currentUser) {
      socket.emit('typing-start', {
        recipientId,
        senderId: currentUser.uid
      });
    }
  }, [socket, currentUser]);

  const stopTyping = useCallback((recipientId) => {
    if (socket && currentUser) {
      socket.emit('typing-stop', {
        recipientId,
        senderId: currentUser.uid
      });
    }
  }, [socket, currentUser]);

  const searchSpots = useCallback((filters) => {
    if (socket) {
      socket.emit('spot-search', filters);
    }
  }, [socket]);

  const updateSpotAvailability = useCallback((spotId, available, reason) => {
    if (socket) {
      socket.emit('spot-availability-change', { spotId, available, reason });
    }
  }, [socket]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      type: notification.type || 'info',
      title: notification.title || 'Notification',
      message: notification.message || '',
      data: notification.data || {},
      timestamp: notification.timestamp || new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const getConversation = useCallback((otherUserId) => {
    if (!currentUser) return [];
    const conversationId = [currentUser.uid, otherUserId].sort().join('-');
    return messages.get(conversationId) || [];
  }, [messages, currentUser]);

  const isUserOnline = useCallback((userId) => {
    const presence = userPresence.get(userId);
    return presence?.online || false;
  }, [userPresence]);

  const isUserTyping = useCallback((userId) => {
    return typingUsers.get(userId) || false;
  }, [typingUsers]);

  const getSpotStatus = useCallback((spotId) => {
    return spotStatus.get(spotId);
  }, [spotStatus]);

  // Throttle utility function
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const value = {
    socket,
    isConnected,
    currentUser,
    notifications,
    userPresence,
    messages,
    typingUsers,
    spotStatus,
    connectedUsers,
    joinSpotRoom,
    leaveSpotRoom,
    sendMessage,
    startTyping,
    stopTyping,
    searchSpots,
    updateSpotAvailability,
    addNotification,
    clearNotification,
    clearAllNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getConversation,
    isUserOnline,
    isUserTyping,
    getSpotStatus
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}; 
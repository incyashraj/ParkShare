import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../firebase';

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

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Listen for booking notifications
    newSocket.on('booking-received', (booking) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'booking',
        title: 'New Booking Received',
        message: `${booking.userName} booked your spot at ${booking.spotDetails?.location}`,
        data: booking,
        timestamp: new Date()
      }, ...prev]);
    });

    // Listen for booking cancellations
    newSocket.on('booking-cancelled', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'cancellation',
        title: 'Booking Cancelled',
        message: `${data.userName} cancelled their booking`,
        data: data,
        timestamp: new Date()
      }, ...prev]);
    });

    // Listen for spot availability updates
    newSocket.on('spot-availability-updated', (data) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'availability',
        title: 'Spot Availability Changed',
        message: `Spot ${data.spotId} is now ${data.available ? 'available' : 'unavailable'}`,
        data: data,
        timestamp: new Date()
      }, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Join user room when user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && socket) {
        socket.emit('join-user-room', user.uid);
      }
    });

    return unsubscribe;
  }, [socket]);

  const joinSpotRoom = (spotId) => {
    if (socket) {
      socket.emit('join-spot-room', spotId);
    }
  };

  const leaveSpotRoom = (spotId) => {
    if (socket) {
      socket.emit('leave-spot-room', spotId);
    }
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    joinSpotRoom,
    leaveSpotRoom,
    clearNotification,
    clearAllNotifications
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}; 
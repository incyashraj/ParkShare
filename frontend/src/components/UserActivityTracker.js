import { useEffect, useRef, useCallback } from 'react';
import { useRealtime } from '../contexts/RealtimeContext';

const UserActivityTracker = ({ userId }) => {
  const { socket } = useRealtime();
  const lastActivityRef = useRef(Date.now());

  // Track various user activities
  const trackActivity = useCallback((activity) => {
    if (!socket || !userId) return;

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    // Only emit if it's been at least 10 seconds since last activity
    // This prevents spam but keeps presence accurate
    if (timeSinceLastActivity > 10000) {
      socket.emit('user-activity', activity);
      lastActivityRef.current = now;
    }
  }, [socket, userId]);

  useEffect(() => {
    if (!socket || !userId) return;

    // Track mouse movements
    const handleMouseMove = () => trackActivity('browsing');
    const handleClick = () => trackActivity('clicking');
    const handleKeyPress = () => trackActivity('typing');
    const handleScroll = () => trackActivity('scrolling');
    const handleFocus = () => trackActivity('active');

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackActivity('tab hidden');
      } else {
        trackActivity('tab visible');
      }
    };

    // Track window focus/blur
    const handleWindowFocus = () => trackActivity('window focused');
    const handleWindowBlur = () => trackActivity('window blurred');

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('keypress', handleKeyPress, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('focus', handleFocus, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    // Initial activity
    trackActivity('page loaded');

    // Periodic activity check (every 30 seconds)
    const interval = setInterval(() => {
      trackActivity('active');
    }, 30000);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      clearInterval(interval);
    };
  }, [socket, userId, trackActivity]);

  // This component doesn't render anything
  return null;
};

export default UserActivityTracker; 
# User Presence System

## Overview

The ParkShare application now includes a comprehensive real-time user presence system that tracks whether users are online, away, or offline. This system provides real-time status updates and enhances the user experience by showing live activity indicators throughout the application.

## Features

### 🟢 Real-Time Status Tracking
- **Online**: User is actively using the application
- **Away**: User has been inactive for 5+ minutes
- **Offline**: User has disconnected or closed the application

### 📊 Activity Monitoring
- Tracks mouse movements, clicks, typing, and scrolling
- Monitors tab visibility and window focus
- Records periodic activity to maintain accurate presence status
- Prevents spam by limiting activity emissions to once every 10 seconds

### 🎯 Visual Indicators
- Color-coded status dots (Green: Online, Orange: Away, Grey: Offline)
- Real-time status chips with tooltips showing detailed information
- Last seen timestamps with human-readable formatting
- Activity descriptions (e.g., "browsing", "typing", "scrolling")

## Components

### Backend Components

#### 1. Enhanced Socket.IO Presence Tracking
```javascript
// Data structures for presence tracking
const userPresence = new Map(); // userId -> { online, lastSeen, lastActivity, status }
const presenceTimeouts = new Map(); // userId -> timeoutId for away status
```

#### 2. Presence Management Functions
- `emitUserPresenceUpdate(userId, status, lastActivity)` - Broadcasts presence changes
- `setUserAway(userId)` - Automatically marks users as away after inactivity
- `getUserPresenceStatus(userId)` - Retrieves current presence status

#### 3. API Endpoints
- `GET /api/users/:userId/presence` - Get user presence status
- `GET /api/admin/online-users` - Get all online users (admin only)
- Enhanced user details with presence information

### Frontend Components

#### 1. UserPresenceIndicator
A reusable component that displays user status with visual indicators:
```jsx
<UserPresenceIndicator 
  userId="user123" 
  username="John Doe" 
  showDetails={true}
  size="small"
/>
```

**Props:**
- `userId`: User's unique identifier
- `username`: User's display name
- `showDetails`: Show detailed status information
- `size`: Component size ('small', 'medium', 'large')

#### 2. UserActivityTracker
An invisible component that tracks user activity and emits it to the backend:
```jsx
<UserActivityTracker userId={currentUser.uid} />
```

**Tracked Activities:**
- Mouse movements and clicks
- Keyboard input
- Scrolling
- Tab visibility changes
- Window focus/blur events
- Periodic activity checks

## Implementation Details

### Backend Presence Logic

1. **Connection Handling**
   - When user connects: Set status to 'online'
   - Clear any existing away timeouts
   - Emit presence update to all connected users

2. **Activity Tracking**
   - Update last activity timestamp
   - Reset away timeout (5 minutes)
   - Emit activity updates

3. **Away Detection**
   - Automatic timeout after 5 minutes of inactivity
   - Status changes from 'online' to 'away'
   - Broadcasts status change to all users

4. **Disconnect Handling**
   - Clear all timeouts
   - Set status to 'offline'
   - Update last seen timestamp
   - Broadcast offline status

### Frontend Integration

1. **Activity Tracking**
   - Passive event listeners for performance
   - Debounced activity emissions (10-second minimum interval)
   - Automatic cleanup on component unmount

2. **Real-Time Updates**
   - Socket.IO listeners for presence updates
   - Automatic UI updates when status changes
   - Optimistic updates for better UX

3. **Visual Feedback**
   - Color-coded status indicators
   - Tooltips with detailed information
   - Responsive design for all screen sizes

## Usage Examples

### In Admin Panel
```jsx
// Show online users in dashboard
{onlineUsers.map(user => (
  <UserPresenceIndicator 
    key={user.uid}
    userId={user.uid} 
    username={user.username} 
    showDetails={true}
  />
))}
```

### In Messaging System
```jsx
// Show user status in conversation list
<ListItemAvatar>
  <UserPresenceIndicator 
    userId={otherUser.uid} 
    username={otherUser.username} 
    size="small"
  />
</ListItemAvatar>
```

### In Navigation
```jsx
// Show current user's status
<UserPresenceIndicator 
  userId={currentUser.uid} 
  username={currentUser.displayName} 
  size="small"
/>
```

## Configuration

### Timeout Settings
- **Away timeout**: 5 minutes (300,000ms)
- **Activity emission interval**: 10 seconds (10,000ms)
- **Periodic activity check**: 30 seconds (30,000ms)

### Status Colors
- **Online**: #4CAF50 (Green)
- **Away**: #FF9800 (Orange)
- **Offline**: #9E9E9E (Grey)

## Performance Considerations

1. **Efficient Activity Tracking**
   - Passive event listeners
   - Debounced emissions to prevent spam
   - Automatic cleanup to prevent memory leaks

2. **Optimized Updates**
   - Only emit updates when status actually changes
   - Batch presence updates when possible
   - Use efficient data structures (Maps)

3. **Scalability**
   - Presence data stored in memory for fast access
   - Minimal network traffic with smart update logic
   - Efficient user lookup and status retrieval

## Security

1. **Authentication Required**
   - All presence endpoints require valid user authentication
   - Admin endpoints require admin privileges

2. **Privacy Protection**
   - Only basic presence status is shared
   - Detailed activity logs are not exposed
   - Users can't see others' specific activities

## Future Enhancements

1. **Custom Status Messages**
   - Allow users to set custom status (e.g., "In a meeting")
   - Status message sharing with contacts

2. **Presence History**
   - Track presence patterns over time
   - Analytics for user activity trends

3. **Advanced Notifications**
   - Notify when specific users come online
   - Presence-based notification preferences

4. **Mobile Integration**
   - Background activity tracking
   - Push notifications for presence changes

## Troubleshooting

### Common Issues

1. **User shows as offline when online**
   - Check if UserActivityTracker is mounted
   - Verify Socket.IO connection is active
   - Check browser console for errors

2. **Status not updating in real-time**
   - Ensure Socket.IO listeners are properly set up
   - Check network connectivity
   - Verify backend presence endpoints are working

3. **Performance issues**
   - Reduce activity tracking frequency if needed
   - Check for memory leaks in event listeners
   - Monitor Socket.IO connection health

### Debug Commands

```bash
# Check online users
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/online-users

# Check specific user presence
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/users/USER_ID/presence

# Check backend health
curl http://localhost:3001/health
```

## API Reference

### GET /api/users/:userId/presence
Returns the presence status of a specific user.

**Response:**
```json
{
  "userId": "user123",
  "username": "John Doe",
  "presence": {
    "status": "online",
    "lastSeen": "2024-01-15T10:30:00Z",
    "lastActivity": "browsing"
  }
}
```

### GET /api/admin/online-users
Returns all currently online users (admin only).

**Response:**
```json
{
  "onlineUsers": [
    {
      "uid": "user123",
      "username": "John Doe",
      "email": "john@example.com",
      "status": "online",
      "lastSeen": "2024-01-15T10:30:00Z",
      "lastActivity": "browsing"
    }
  ],
  "totalOnline": 1,
  "totalUsers": 15
}
```

This presence system provides a solid foundation for real-time user interaction and can be extended with additional features as needed. 
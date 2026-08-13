import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000');

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  onlineUsers: {},
  getPresence: () => ({ status: 'offline', lastSeen: null }),
  joinOrderRoom: () => {},
  leaveOrderRoom: () => {},
  markMessagesSeen: () => {},
});

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuthStore();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const activeRoomRef = useRef(null);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);

      // Restore active room if disconnected
      if (activeRoomRef.current) {
        socketInstance.emit('join_order', activeRoomRef.current);
      }
    });

    socketInstance.on('connect_error', (err) => {
      setIsConnected(false);
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    // Realtime User Presence Events
    socketInstance.on('user_presence', ({ userId, status, lastSeen }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: { status, lastSeen },
      }));
    });

    socketInstance.on('user_presence_status', ({ userId, status, lastSeen }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: { status, lastSeen },
      }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token]);

  const joinOrderRoom = useCallback((orderId) => {
    if (!orderId) return;
    activeRoomRef.current = orderId;
    if (socket && socket.connected) {
      socket.emit('join_order', orderId);
    }
  }, [socket]);

  const leaveOrderRoom = useCallback((orderId) => {
    if (!orderId) return;
    if (activeRoomRef.current === orderId) {
      activeRoomRef.current = null;
    }
    if (socket && socket.connected) {
      socket.emit('leave_order', orderId);
    }
  }, [socket]);

  const markMessagesSeen = useCallback((orderId) => {
    if (socket && socket.connected && orderId) {
      socket.emit('mark_seen', { orderId });
    }
  }, [socket]);

  const getPresence = useCallback((targetUserId) => {
    if (!targetUserId) return { status: 'offline', lastSeen: null };
    if (targetUserId === user?._id) return { status: 'online', lastSeen: null };
    return onlineUsers[targetUserId] || { status: 'offline', lastSeen: null };
  }, [onlineUsers, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        getPresence,
        joinOrderRoom,
        leaveOrderRoom,
        markMessagesSeen,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

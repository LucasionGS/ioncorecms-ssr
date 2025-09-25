import React, { createContext, useContext, useCallback, useState, useEffect, useRef, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connect: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  const connect = useCallback(() => {
    // If already connected or currently connecting, don't create a new connection
    if (socketRef.current || isConnectingRef.current) {
      return;
    }

    isConnectingRef.current = true;

    // Get the server URL from environment or use default
    const serverUrl = import.meta.env.VITE_SERVER_URL || ('http://localhost:3174');
    
    console.log('Connecting to Socket.IO server at:', serverUrl);
    
    // Create socket connection
    const socketInstance = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    // Store reference to prevent multiple connections
    socketRef.current = socketInstance;

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to Socket.IO server:', socketInstance.id);
      setIsConnected(true);
      isConnectingRef.current = false;
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
      // Reset refs when disconnected so reconnection can happen
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        socketRef.current = null;
        isConnectingRef.current = false;
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
      isConnectingRef.current = false;
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed');
      setIsConnected(false);
      // Reset refs on failed reconnection
      socketRef.current = null;
      isConnectingRef.current = false;
    });

    setSocket(socketInstance);
  }, []);

  // Cleanup on provider unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up Socket.IO connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnectingRef.current = false;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect }}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook to use the socket context with lazy connection
export function useSocket(): SocketContextType {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  const { connect, socket } = context;
  
  // Connect on first use of this hook
  useEffect(() => {
    if (!socket) {
      connect();
    }
  }, [connect, socket]);

  return context;
}
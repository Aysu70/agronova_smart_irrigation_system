import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const socketInstance = socketService.connect();
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
      });

      return () => {
        socketService.disconnect();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated]);

  const value = {
    socket,
    connected,
    emit: (event, data) => socketService.emit(event, data),
    on: (event, callback) => socketService.on(event, callback),
    off: (event, callback) => socketService.off(event, callback),
    joinGroup: (groupId) => socketService.joinGroup(groupId),
    leaveGroup: (groupId) => socketService.leaveGroup(groupId),
    joinUserRoom: (userId) => socketService.joinUserRoom(userId),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export default SocketContext;

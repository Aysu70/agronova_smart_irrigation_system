import React, { useState, useEffect, useRef } from 'react';
import Card from '../common/Card';
import { Send } from 'lucide-react';
import { getInitials, getAvatarColor, timeAgo } from '../../utils/helpers';
import { communityAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ChatRoom = ({ group }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket, joinGroup, leaveGroup } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (group) {
      loadMessages();
      joinGroup(group._id);

      // Listen for new messages
      socket?.on('new_message', handleNewMessage);

      return () => {
        socket?.off('new_message', handleNewMessage);
        leaveGroup(group._id);
      };
    }
  }, [group]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const loadMessages = async () => {
    try {
      const response = await communityAPI.getMessages(group._id);
      setMessages(response.data.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await communityAPI.sendMessage(group._id, { content: newMessage });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!group) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Select a group to start chatting</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-lg font-semibold">{group.name}</h3>
        <p className="text-sm text-gray-500">{group.members.length} members</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => {
          const isOwn = message.sender._id === user._id;
          
          return (
            <div
              key={message._id}
              className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full ${getAvatarColor(message.sender.name)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-medium">
                  {getInitials(message.sender.name)}
                </span>
              </div>
              <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm font-medium">{message.sender.name}</span>
                  <span className="text-xs text-gray-400">{timeAgo(message.timestamp)}</span>
                </div>
                <div className={`mt-1 inline-block px-4 py-2 rounded-lg ${
                  isOwn 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </Card>
  );
};

export default ChatRoom;

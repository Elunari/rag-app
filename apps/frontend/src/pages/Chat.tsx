import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, Avatar, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { ApiService } from '../services/api-service';

const MotionPaper = motion(Paper);

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiService = ApiService.getInstance();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.sendMessage(inputMessage);
      const aiMessage: Message = {
        id: Date.now(),
        text: response.message,
        isUser: false,
        timestamp: new Date(response.timestamp),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: 'text.primary',
            fontWeight: 'bold',
          }}
        >
          AI Chat Interface
        </Typography>
        
        <MotionPaper
          elevation={3}
          sx={{
            flex: 1,
            mb: 2,
            p: 2,
            background: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
            overflow: 'auto',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                mb: 2,
                flexDirection: message.isUser ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.isUser ? 'primary.main' : 'grey.500',
                  width: 32,
                  height: 32,
                }}
              >
                {message.isUser ? <PersonIcon /> : <SmartToyIcon />}
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  maxWidth: '70%',
                  background: message.isUser
                    ? 'primary.main'
                    : 'background.paper',
                  color: message.isUser ? 'white' : 'text.primary',
                  border: message.isUser ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.7,
                    textAlign: message.isUser ? 'right' : 'left',
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </MotionPaper>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                '& fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
                '&:hover fieldset': {
                  borderColor: 'primary.dark',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
                '& input': {
                  fontSize: '1rem',
                  padding: '12px 14px',
                },
              },
            }}
          />
          <Button
            variant="contained"
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Chat; 
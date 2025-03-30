import React from 'react';
import { Box, Paper, Typography, Container, Button } from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const MotionPaper = motion(Paper);

const KnowledgeBase = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            background: 'linear-gradient(45deg, #00ff9f 30%, #ff00ff 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}
        >
          Knowledge Base Upload
        </Typography>

        <MotionPaper
          elevation={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            background: 'rgba(0, 255, 159, 0.05)',
            border: '2px dashed rgba(0, 255, 159, 0.3)',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(0, 255, 159, 0.1)',
              borderColor: 'rgba(0, 255, 159, 0.5)',
            },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 60, color: '#00ff9f', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Drag and drop files here
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            or click to select files
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{
              background: 'linear-gradient(45deg, #00ff9f 30%, #ff00ff 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #00ff9f 40%, #ff00ff 100%)',
              },
            }}
          >
            Select Files
          </Button>
        </MotionPaper>
      </Box>
    </Container>
  );
};

export default KnowledgeBase; 
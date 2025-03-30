import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChatIcon from '@mui/icons-material/Chat';
import StorageIcon from '@mui/icons-material/Storage';

const AnimatedLink = ({ to, children, icon }: { to: string; children: React.ReactNode; icon: React.ReactNode }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Button
      component={RouterLink}
      to={to}
      color="inherit"
      startIcon={icon}
    >
      {children}
    </Button>
  </motion.div>
);

const Navigation = () => {
  return (
    <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            background: 'linear-gradient(45deg, #00ff9f 30%, #ff00ff 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}
        >
          AI Knowledge Base
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <AnimatedLink to="/" icon={<ChatIcon />}>
            Chat
          </AnimatedLink>
          <AnimatedLink to="/knowledge-base" icon={<StorageIcon />}>
            Knowledge Base
          </AnimatedLink>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 
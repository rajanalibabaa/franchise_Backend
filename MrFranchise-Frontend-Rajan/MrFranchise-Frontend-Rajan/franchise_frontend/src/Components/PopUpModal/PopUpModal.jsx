import React,{useState,useEffect}from 'react';
import { Box, Modal, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import pop1 from '../../assets/Images/ModelBg.jpeg';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%', md: '60%' },
  maxWidth: 700,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
  textAlign: 'center',
};

const imageStyle = {
  width: '100%',
  borderRadius: '8px',
  marginTop: '1rem',
};

const PopupModal = ({ open, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Renamed state

  useEffect(() => {
    // Check if the popup has already been shown in this session
    const hasShownPopup = sessionStorage.getItem('hasShownPopup');
    if (!hasShownPopup) {
      setIsModalOpen(true); // Show the popup
      sessionStorage.setItem('hasShownPopup', 'true'); // Mark as shown
    }
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
    if (onClose) onClose(); // Call the onClose prop if provided
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="popup-title" aria-describedby="popup-description">
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="popup-title" variant="h3" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#ffba00' }}>
          Welcome to Our Franchise Website
        </Typography>
        <Typography id="popup-description" variant="h5" sx={{color:"#7ad03a"}}>
          World's highest visited franchise website network.
        </Typography>
        <img src={pop1} alt="popup visual" style={imageStyle} loading='lazy' />
      </Box>
    </Modal>
  );
};

export default PopupModal;

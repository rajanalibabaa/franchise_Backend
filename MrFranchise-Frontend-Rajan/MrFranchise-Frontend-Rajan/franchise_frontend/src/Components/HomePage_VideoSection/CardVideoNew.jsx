import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const CARD_DATA = [
  {
    id: 1,
    title: 'Skale Fitness',
    price: '1 Cr. – 2 Cr.',
    size: '2,000 - 3,000 Sq. Ft',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png', // sample logo
  },
  {
    id: 2,
    title: 'Urban Wellness',
    price: '50 L - 1 Cr.',
    size: '1,500 - 2,500 Sq. Ft',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  },
  {
    id: 3,
    title: 'Tech Gym',
    price: '2 Cr. – 5 Cr.',
    size: '3,000 - 5,000 Sq. Ft',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  },
];

const CardsRow = () => (
  <Box
    component="section"
    sx={{
      display: 'flex',
      overflowX: 'auto',
      p: 2,
      '& > *': {
        flex: '0 0 400px',
        mr: 2,
        scrollSnapAlign: 'start',
      },
      scrollSnapType: 'x mandatory',
      '&::-webkit-scrollbar': { height: 6 },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#1976d2',
        borderRadius: 4,
      },
    }}
  >
    {CARD_DATA.map((card) => (
      <Card
        key={card.id}
        elevation={3}
        sx={{
          position: 'relative',
          height: 550,
          width: '70%',
          color: '#fff',
          overflow: 'hidden',
          scrollSnapAlign: 'start',
          borderRadius: 2,
        }}
      >
        {/* VIDEO AS BACKGROUND */}
        <CardMedia
          component="video"
          src={card.videoUrl}
          autoPlay
          loop
          muted
          controls={false}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* OVERLAY WITH CONTENT */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 2,
          }}
        >
          <Box>
            {/* Logo + Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                component="img"
                src={card.logoUrl}
                alt={`${card.title} logo`}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  backgroundColor: '#fff',
                }}
              />
              <Typography variant="h6" fontWeight="bold">
                {card.title}
              </Typography>
            </Box>

            <List dense>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32, color: '#fff' }}>
                  <CheckCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={card.price} />
              </ListItem>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32, color: '#fff' }}>
                  <ArrowRightAltIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={card.size} />
              </ListItem>
            </List>

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Card>
    ))}
  </Box>
);

export default CardsRow;
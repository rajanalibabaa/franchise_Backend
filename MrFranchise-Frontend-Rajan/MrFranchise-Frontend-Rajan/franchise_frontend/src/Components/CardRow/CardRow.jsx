import React from 'react';
import { Grid, Paper, Typography, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const CardsRow = () => {
  return (
    <Grid container spacing={3} sx={{ padding: '20px' }}>
      {/* Card 1 */}
      <Grid item xs={12} sm={4}>
        <Paper elevation={3} sx={{ padding: '20px', height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Skale Fitness
          </Typography>
          
          <List dense>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="1 Cr. – 2 Cr." />
            </ListItem>
            
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <ArrowRightAltIcon color="action" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="2,000 - 3,000 Sq. Ft" />
            </ListItem>
          </List>

          <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
            Premium fitness brand with modern training equipment for Indian fitness. If we look around, we will find that weight loss advertisements are rampant everywhere.
          </Typography>

          <Button 
            variant="contained" 
            fullWidth
            sx={{ mt: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            Apply
          </Button>
        </Paper>
      </Grid>

      {/* Card 2 */}
      <Grid item xs={12} sm={4}>
        <Paper elevation={3} sx={{ padding: '20px', height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Urban Wellness
          </Typography>
          
          <List dense>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="50 L - 1 Cr." />
            </ListItem>
            
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <ArrowRightAltIcon color="action" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="1,500 - 2,500 Sq. Ft" />
            </ListItem>
          </List>

          <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
            Holistic wellness center offering yoga, meditation, and organic nutrition counseling in urban locations.
          </Typography>

          <Button 
            variant="contained" 
            fullWidth
            sx={{ mt: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            Apply
          </Button>
        </Paper>
      </Grid>

      {/* Card 3 */}
      <Grid item xs={12} sm={4}>
        <Paper elevation={3} sx={{ padding: '20px', height: '100%' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Tech Gym
          </Typography>
          
          <List dense>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="2 Cr. – 5 Cr." />
            </ListItem>
            
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <ArrowRightAltIcon color="action" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="3,000 - 5,000 Sq. Ft" />
            </ListItem>
          </List>

          <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
            High-tech gymnasium featuring AI-powered equipment and virtual reality fitness programs.
          </Typography>

          <Button 
            variant="contained" 
            fullWidth
            sx={{ mt: 2, backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}
          >
            Apply
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CardsRow;
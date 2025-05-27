import React from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Divider } from '@mui/material';

const plans = [
  {
    name: 'Silver',
    price: 99,
    originalPrice: 299,
    discount: 'Save 67%',
    websites: 1,
    color: '#f5f5f5',
    borderColor: '#d3d3d3',
    

  },
  {
    name: 'Gold',
    price: 199,
    originalPrice: 499,
    discount: 'Save 60%',
    websites: 10,
    highlight: true,
    color: '#fff8e1',
    borderColor: '#ffb300',
  },
  {
    name: 'Platinum',
    price: 299,
    originalPrice: 699,
    discount: 'Save 57%',
    websites: 50,
    color: '#e3f2fd',
    borderColor: '#0288d1',
  },
];

const Upgradeaccount = () => {
  return (
    <Box>
    <Typography variant="h6" fontWeight={600} mb={2} sx={{ textAlign: "center", color: "#fafafa",
                    backgroundColor: "#689f38", padding: "10px", borderRadius: "5px" }}>
                    UPGRADE ACCOUNT
                </Typography>
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                border: `2px solid ${plan.borderColor}`,
                backgroundColor: plan.color,
                borderRadius: 3,
                boxShadow: plan.highlight ? 6 : 3,
                position: 'relative',
                height: '130%',
                width: 300,
                padding: 0,
                transition: "transform 0.4s ease, box-shadow 0.4s ease",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
                },
                
              }}
            >
              {plan.highlight && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: plan.borderColor,
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    py: 1,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                  }}
                >
                  MOST POPULAR
                </Box>
              )}
              <CardContent sx={{ pt: plan.highlight ? 6 : 4 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="body2" align="center" sx={{ textDecoration: 'line-through' }}>
                  ₹{plan.originalPrice}
                </Typography>
                <Typography variant="caption" align="center" display="block" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {plan.discount}
                </Typography>
                <Typography variant="h4" align="center" sx={{ my: 1 }}>
                  ₹{plan.price}.00 <Typography variant="body2" component="span">/mo</Typography>
                </Typography>
                <Typography variant="caption" align="center" display="block" sx={{ mb: 2 }}>
                  +2 months free
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ backgroundColor: plan.borderColor, color: '#fff', fontWeight: 'bold' }}
                >
                  Choose Plan
                </Button>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" align="center">
                  ✔ {plan.websites} website{plan.websites > 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
    </Box>
  );
};

export default Upgradeaccount;

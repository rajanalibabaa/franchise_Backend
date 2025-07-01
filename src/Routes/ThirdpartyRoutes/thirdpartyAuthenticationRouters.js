import { Router } from "express";
import passport from "passport"
import { facebookAuthProfile, googleAuthProfile } from "../../controller/thirdpartyAuthentication/authenticationController.js";

const route = Router()

route.get('/v1/auth/google', passport.authenticate('google', {
    
    scope: ['profile', 'email']
  }));
  
route.get('/v1/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      // Successful authentication, redirect to the home page or user dashboard
      res.redirect('/api/v1/auth/google/profile');
    });

route.get('/v1/auth/google/profile', googleAuthProfile)


route.get('/facebook', passport.authenticate('facebook', {
  scope: ['email'] // Only this if you need it
}));

  
route.get('/v1/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/api/v1/auth/facebook/profile');
    // res.send(`✅ Facebook login success. Hello`);
  }
);

route.get('/v1/auth/facebook/profile', facebookAuthProfile)


export default route
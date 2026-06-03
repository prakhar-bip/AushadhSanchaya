const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/user');
require('dotenv').config();

exports.googleLoginController = async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // 1. Fetch user data securely from Google
    const googleResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    
    const { email, name, sub: googleId, picture: avatar } = googleResponse.data;

    // 2. Check if user already exists
    let user = await User.findOne({ email });

    // 3. Create the user if they don't exist
    if (!user) {
      user = new User({
        name,
        email,
        role: 'user', // Default role
        googleId,
        avatar,
        provider: 'google'
      });
      await user.save();
    } else {
      // Update googleId and avatar if not set (linking accounts)
      let updateNeeded = false;
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        updateNeeded = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        updateNeeded = true;
      }
      if (updateNeeded) await user.save();
    }

    // 4. Generate your app's JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        sub: user._id,
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '24h' }
    );

    // 5. Send it back to the React app
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Google Auth Error:", error.response?.data || error.message);
    res.status(401).json({ message: "Invalid or expired Google Token" });
  }
};
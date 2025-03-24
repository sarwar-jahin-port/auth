const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware')

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token to DB
    await User.update({ refreshToken }, { where: { id: user.id } });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Clearing the refresh token from the database for the logged-out user
    await User.update({ refreshToken: null }, { where: { id: userId } });

    // TODO: On the client-side, you should also discard the access token and might be refresh token also
    // (e.g., remove it from local storage or cookies).

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);
  
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) return res.sendStatus(403);
  
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || user.id !== decoded.userId) return res.sendStatus(403);
      const newAccessToken = jwt.sign(
        { userId: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '50m' }
      );
      res.json({ accessToken: newAccessToken });
    });
  });

module.exports = router;
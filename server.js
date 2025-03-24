const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes')
const authenticateToken = require('./middleware/authMiddleware')

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST'],
}));
app.use(express.json());

(async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database connected!');
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();

app.use('', authRoutes);

app.get('/check-authentication', authenticateToken, (req, res) =>{
  res.json({ message: 'User profile data', user: req.user });
})
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
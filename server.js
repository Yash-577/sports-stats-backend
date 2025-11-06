import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware first
const FRONTEND_URL = process.env.FRONTEND_URL || "http://sports-stats-frontend.vercel.app";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);

// ✅ Test route
app.get('/', (req, res) => {
  res.send('Sports API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


   

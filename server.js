import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

dotenv.config();
connectDB();

const app = express();

// ✅ Allow multiple frontend URLs
const allowedOrigins = [
  "https://sports-stats-frontend.vercel.app",
  "https://sports-stats-frontend-git-main-yash-577s-projects.vercel.app",
  "http://localhost:3000" // For local development
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // ✅ Fixed syntax error

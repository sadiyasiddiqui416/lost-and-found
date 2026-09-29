import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import itemRoutes from './routes/items.js';

const app = express();
const port = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', name: 'Integral University Lost & Found' }));
app.use('/api/items', itemRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Server error. Check the API terminal.' });
});

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/integral_lost_found');
  console.log('MongoDB connected.');
  app.listen(port, () => console.log(`API ready at http://localhost:${port}`));
} catch (error) {
  console.error('MongoDB connection failed. Start MongoDB or configure MONGODB_URI in server/.env.');
  console.error(error.message);
  process.exit(1);
}

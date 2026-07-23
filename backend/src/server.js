import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Assuming standard Vite port, can be overridden via env if needed
  credentials: true
}));
app.use(express.json());

// Basic health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Proof of Delivery API is running.' });
});

// Routes
import deliveryRoutes from './routes/deliveryRoutes.js';
app.use('/api/deliveries', deliveryRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

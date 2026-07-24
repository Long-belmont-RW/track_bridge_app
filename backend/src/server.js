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
import authRoutes from './routes/authRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import driverRoutes from './routes/driverRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/drivers', driverRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

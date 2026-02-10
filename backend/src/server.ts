import dotenv from 'dotenv';
dotenv.config(); // Load environment variables FIRST

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import kycRoutes from './routes/kycRoutes';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/image_kyc_db';

const allowedOrigins=[
    "http://localhost:5173",
    "https://trustgate-1-front.onrender.com"
]

// Middleware
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
// app.get('/api/health', (req, res) => {
//     res.json({
//         status: 'OK',
//         cloudinary: {
//             configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
//             cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
//             api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
//             api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
//         }
//     });
// });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kyc', kycRoutes);

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

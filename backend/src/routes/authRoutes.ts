import express from 'express';
import { AuthController } from '../controllers/implementation/AuthController';
import { AuthService } from '../services/implementation/AuthService';
import { UserRepository } from '../repositories/implementation/UserRepository';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Dependency Injection (Composition Root for this module)
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

// Example protected route
router.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to the dashboard' });
});

export default router;

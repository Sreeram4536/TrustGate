import express from 'express';
import { UserController } from '../controllers/implementation/UserController';
import { UserService } from '../services/implementation/UserService';
import { UserRepository } from '../repositories/implementation/UserRepository';
import { authenticateToken } from '../middleware/authMiddleware';

import { requireAdmin } from '../middleware/adminMiddleware';

const router = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', authenticateToken, requireAdmin, (req, res) => userController.getUsers(req, res));

export default router;

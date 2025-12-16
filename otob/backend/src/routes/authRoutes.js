import express from 'express';
import { login, logout } from '../controllers/authController.js';
import { refreshToken } from '../controllers/refreshToken.js';
import {createUser} from "../controllers/userController.js";

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/register', createUser);
export default router;

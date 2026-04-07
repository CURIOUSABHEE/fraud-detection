import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth.middleware';
import { addUserToNeo4j } from '../services/neo4j.service';

const router = Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('mpin')
      .matches(/^\d{6}$/)
      .withMessage('MPIN must be exactly 6 digits'),
    body('full_name').optional().trim(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('pan_card').optional().trim().toUpperCase(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { username, full_name, gender, pan_card, mpin } = req.body as {
        username: string;
        full_name?: string;
        gender?: string;
        pan_card?: string;
        mpin: string;
      };

      const existing = await User.findOne({ username });
      if (existing) {
        res.status(400).json({ message: 'Username is already taken' });
        return;
      }

      const hashedMpin = await bcrypt.hash(mpin, 10);
      const user = new User({ username, full_name, gender, pan_card, mpin: hashedMpin });
      await user.save();

      // Mirror user to Neo4j (non-blocking on failure)
      addUserToNeo4j({
        username: user.username,
        full_name: user.full_name ?? undefined,
        gender: user.gender ?? undefined,
        pan_card: user.pan_card ?? undefined,
        balance: user.balance,
        latest_login: null,
      }).catch((err) => console.error('[Neo4j] Failed to sync new user:', err));

      const secret = process.env.JWT_SECRET as string;
      const token = jwt.sign({ id: user._id }, secret, { expiresIn: '24h' });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          full_name: user.full_name,
          gender: user.gender,
          pan_card: user.pan_card,
          balance: user.balance,
          role: user.role || 'user',
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      console.error('[Auth] Register error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('mpin').matches(/^\d{6}$/).withMessage('MPIN must be 6 digits'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { username, mpin } = req.body as { username: string; mpin: string };

      const user = await User.findOne({ username });
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const isMatch = await bcrypt.compare(mpin, user.mpin);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      user.latest_login = new Date();
      await user.save();

      const secret = process.env.JWT_SECRET as string;
      const token = jwt.sign({ id: user._id }, secret, { expiresIn: '24h' });

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          full_name: user.full_name,
          gender: user.gender,
          pan_card: user.pan_card,
          balance: user.balance,
          role: user.role || 'user',
          latest_login: user.latest_login,
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      console.error('[Auth] Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-mpin -totpSecret');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('[Auth] Me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

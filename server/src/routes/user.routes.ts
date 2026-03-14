import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// ─── GET /api/users/search?q=… ───────────────────────────────────────────────
router.get('/search', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string || '').trim();
    if (q.length < 1) { res.json([]); return; }

    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: req.user!.id },          // exclude self
    })
      .select('username full_name')
      .limit(8);

    res.json(users.map((u) => ({ username: u.username, full_name: u.full_name ?? null })));
  } catch (err) {
    console.error('[User] Search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/users/me ────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('-mpin -totpSecret');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error('[User] Fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/users/me ────────────────────────────────────────────────────────
router.put(
  '/me',
  authMiddleware,
  [
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
      const { full_name, gender, pan_card } = req.body as {
        full_name?: string;
        gender?: string;
        pan_card?: string;
      };

      const user = await User.findByIdAndUpdate(
        req.user!.id,
        { full_name, gender, pan_card },
        { new: true, runValidators: true }
      ).select('-mpin -totpSecret');

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (err) {
      console.error('[User] Update error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;

import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

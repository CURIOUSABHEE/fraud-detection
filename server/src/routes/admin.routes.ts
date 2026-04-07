import { Router, Request, Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalTransactions, fraudCount, totalUsers, volumeAgg, weeklyStats] =
      await Promise.all([
        Transaction.countDocuments({ transaction_type: 'DEBIT' }),
        Transaction.countDocuments({ is_fraud: true, transaction_type: 'DEBIT' }),
        User.countDocuments(),
        Transaction.aggregate([
          { $match: { transaction_type: 'DEBIT' } },
          { $group: { _id: null, total: { $sum: '$transaction_amount' } } },
        ]),
        Transaction.aggregate([
          {
            $match: {
              transaction_type: 'DEBIT',
              timestamp: { $gte: weekAgo },
            },
          },
          {
            $group: {
              _id: {
                $dayOfWeek: '$timestamp',
              },
              normal: {
                $sum: { $cond: [{ $eq: ['$is_fraud', false] }, 1, 0] },
              },
              fraud: {
                $sum: { $cond: [{ $eq: ['$is_fraud', true] }, 1, 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    const totalVolume = volumeAgg.length > 0 ? volumeAgg[0].total : 0;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const barData = dayNames.map((day, i) => {
      const stat = weeklyStats.find((s: any) => s._id === i + 1);
      return {
        day,
        normal: stat?.normal || 0,
        fraud: stat?.fraud || 0,
      };
    });

    res.json({
      totalTransactions,
      fraudCount,
      totalVolume,
      activeUsers: totalUsers,
      barData,
    });
  } catch (err) {
    console.error('[Admin] Stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/admin/transactions ──────────────────────────────────────────────
router.get(
  '/transactions',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, limit = '50' } = req.query;

      const filter: any = { transaction_type: 'DEBIT' };
      if (status === 'fraud') filter.is_fraud = true;
      if (status === 'success') filter.status = 'SUCCESS';
      if (status === 'failed') filter.status = 'FAILED';

      const transactions = await Transaction.find(filter)
        .populate('user', 'username full_name')
        .populate('counterparty', 'username full_name')
        .sort({ timestamp: -1 })
        .limit(Number(limit));

      res.json(
        transactions.map((tx: any) => ({
          id: tx._id,
          sender: tx.user?.username || 'unknown',
          receiver: tx.counterparty?.username || 'unknown',
          amount: tx.transaction_amount,
          date: tx.timestamp,
          status: tx.is_fraud ? 'fraud' : tx.status?.toLowerCase() || 'success',
          is_fraud: tx.is_fraud,
        }))
      );
    } catch (err) {
      console.error('[Admin] Transactions error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─── PATCH /api/admin/transactions/:id/fraud ──────────────────────────────────
// Toggle the is_fraud flag and update status accordingly
router.patch(
  '/transactions/:id/fraud',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { is_fraud } = req.body as { is_fraud: boolean };

      const transaction = await Transaction.findById(id);
      if (!transaction) {
        res.status(404).json({ message: 'Transaction not found' });
        return;
      }

      transaction.is_fraud = is_fraud;
      transaction.status = is_fraud ? 'FRAUD' : 'SUCCESS';
      await transaction.save();

      res.json({
        id: transaction._id,
        is_fraud: transaction.is_fraud,
        status: transaction.status,
        message: is_fraud
          ? 'Transaction marked as fraud'
          : 'Transaction marked as normal',
      });
    } catch (err) {
      console.error('[Admin] Toggle fraud error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  addTransactionToNeo4j,
  detectVelocityAnomaly,
  detectRingPattern,
  detectStarPattern,
} from '../services/neo4j.service';

const router = Router();

// ─── GET /api/transactions/ ───────────────────────────────────────────────────
// Returns all DEBIT transactions (used by FastAPI for model retraining)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ transaction_type: 'DEBIT' })
      .sort({ timestamp: -1 })
      .limit(5000)
      .lean();
    res.json(transactions);
  } catch (err) {
    console.error('[Transaction] Fetch all error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── GET /api/transactions/my ─────────────────────────────────────────────────
router.get('/my', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ user: req.user!.id })
      .populate('counterparty', 'username full_name')
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(transactions);
  } catch (err) {
    console.error('[Transaction] Fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/transactions/send ─────────────────────────────────────────────
router.post(
  '/send',
  authMiddleware,
  [
    body('recipient_username').trim().notEmpty().withMessage('Recipient username is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
    body('mpin').matches(/^\d{6}$/).withMessage('MPIN must be 6 digits'),
    body('description').optional().trim(),
    body('sender_lat').optional().isFloat(),
    body('sender_long').optional().isFloat(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const {
        recipient_username,
        amount,
        mpin,
        description,
        sender_lat,
        sender_long,
      } = req.body as {
        recipient_username: string;
        amount: number;
        mpin: string;
        description?: string;
        sender_lat?: number;
        sender_long?: number;
      };

      const senderId = req.user!.id;

      // ── Verify sender + MPIN ─────────────────────────────────────────────
      const sender = await User.findById(senderId);
      if (!sender) {
        res.status(404).json({ message: 'Sender account not found' });
        return;
      }

      const mpinMatch = await bcrypt.compare(mpin, sender.mpin);
      if (!mpinMatch) {
        res.status(401).json({ message: 'Incorrect MPIN' });
        return;
      }

      // ── Verify receiver ──────────────────────────────────────────────────
      const receiver = await User.findOne({ username: recipient_username });
      if (!receiver) {
        res.status(404).json({ message: 'Recipient not found' });
        return;
      }

      if (receiver._id.toString() === senderId) {
        res.status(400).json({ message: 'Cannot send money to yourself' });
        return;
      }

      // ── Balance check ────────────────────────────────────────────────────
      const txAmount = Number(amount);
      if (sender.balance < txAmount) {
        res.status(400).json({ message: 'Insufficient balance' });
        return;
      }

      // ── Compute transaction metadata ─────────────────────────────────────
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const ip =
        (req.headers['x-forwarded-for'] as string | undefined)
          ?.split(',')[0]
          ?.trim() ||
        req.ip ||
        '0.0.0.0';

      const [dailyCount, weeklyDebits, failed7d, prevFraud, lastTx] =
        await Promise.all([
          Transaction.countDocuments({ user: senderId, timestamp: { $gte: startOfDay } }),
          Transaction.find({
            user: senderId,
            transaction_type: 'DEBIT',
            timestamp: { $gte: weekAgo },
          }),
          Transaction.countDocuments({
            user: senderId,
            status: 'FAILED',
            timestamp: { $gte: weekAgo },
          }),
          Transaction.countDocuments({ user: senderId, is_fraud: true }),
          Transaction.findOne({ user: senderId }).sort({ timestamp: -1 }),
        ]);

      const avg7d =
        weeklyDebits.length > 0
          ? weeklyDebits.reduce((s, t) => s + t.transaction_amount, 0) /
            weeklyDebits.length
          : 0;

      const timeSinceLast = lastTx
        ? Math.floor((now.getTime() - lastTx.timestamp.getTime()) / 60000)
        : 0;

      const accountAge = Math.floor(
        (now.getTime() - (sender as any).createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const weeklyWithDist = weeklyDebits.filter(
        (t) => t.transaction_distance != null && t.transaction_distance > 0
      );
      const distAvg7d =
        weeklyWithDist.length > 0
          ? weeklyWithDist.reduce((s, t) => s + (t.transaction_distance ?? 0), 0) /
            weeklyWithDist.length
          : 0;

      // IP flag: true if this is the user's first time using this IP (after initial tx)
      const prevIpTx = await Transaction.findOne({ user: senderId, ip_address: ip });
      const ipFlag = prevIpTx === null && lastTx !== null;

      const transactionHour = now.getHours();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      const isNight = transactionHour >= 22 || transactionHour < 6;
      const txToBalanceRatio = sender.balance > 0 ? txAmount / sender.balance : 1;

      // ── Neo4j anomaly detection ──────────────────────────────────────────
      const [velocityAnomaly, ringPattern, starPattern] = await Promise.all([
        detectVelocityAnomaly({
          senderUsername: sender.username,
          transaction_amount: txAmount,
        }),
        detectRingPattern(sender.username),
        detectStarPattern(sender.username),
      ]);

      const neo4jFraud = velocityAnomaly || ringPattern || starPattern;

      // ── ML Model1 fraud prediction (XGBoost + Isolation Forest + SHAP) ──
      const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000/fastapi';

      interface Model1Result {
        is_fraud: boolean;
        fraud_probability: number;
        most_affected_feature: string;
        feature_importance: number;
        is_anomaly: boolean;
      }

      let mlPrediction: Model1Result | null = null;

      try {
        const model1Res = await fetch(
          `${FASTAPI_URL.replace(/\/fastapi\/?$/, '')}/fastapi/model1/predict`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              IP_Address_Flag: ipFlag ? 1 : 0,
              Previous_Fraudulent_Activity: prevFraud > 0 ? 1 : 0,
              Daily_Transaction_Count: dailyCount + 1,
              Failed_Transaction_Count_7d: failed7d,
              Account_Age: accountAge,
              Distance_From_Distance_Avg_7d: 0,
              Is_Weekend: isWeekend ? 1 : 0,
              IsNight: isNight ? 1 : 0,
              Time_Since_Last_Transaction: timeSinceLast,
              Distance_Avg_Transaction_7d: distAvg7d,
              Transaction_To_Balance_Ratio: txToBalanceRatio,
            }),
          }
        );
        if (model1Res.ok) {
          mlPrediction = (await model1Res.json()) as Model1Result;
        } else {
          console.error('[ML] Model1 returned status', model1Res.status);
        }
      } catch (err) {
        console.error('[ML] Model1 prediction call failed (non-blocking):', err);
      }

      // Combine Neo4j + ML results for final fraud decision
      const mlFraud = mlPrediction ? (mlPrediction.is_fraud || mlPrediction.is_anomaly) : false;
      const is_fraud = neo4jFraud || mlFraud;
      const status = is_fraud ? 'FRAUD' : 'SUCCESS';

      // ── Update balances ──────────────────────────────────────────────────
      sender.balance = sender.balance - txAmount;
      receiver.balance = receiver.balance + txAmount;

      // ── Persist transactions (DEBIT for sender, CREDIT for receiver) ─────
      const senderTx = new Transaction({
        user: sender._id,
        counterparty: receiver._id,
        transaction_amount: txAmount,
        transaction_type: 'DEBIT',
        description,
        status,
        account_balance: sender.balance,
        ip_address: ip,
        ip_address_flag: ipFlag,
        previous_fraudulent_activity: prevFraud,
        daily_transaction_count: dailyCount + 1,
        avg_transaction_amount_7d: avg7d,
        failed_transaction_count_7d: failed7d,
        account_age: accountAge,
        timestamp: now,
        transaction_hour: transactionHour,
        is_weekend: isWeekend,
        is_night: isNight,
        time_since_last_transaction: timeSinceLast,
        transaction_to_balance_ratio: txToBalanceRatio,
        sender_lat: sender_lat ?? null,
        sender_long: sender_long ?? null,
        distance_avg_transaction_7d: distAvg7d,
        is_fraud,
      });

      const receiverTx = new Transaction({
        user: receiver._id,
        counterparty: sender._id,
        transaction_amount: txAmount,
        transaction_type: 'CREDIT',
        description,
        status: 'SUCCESS',
        account_balance: receiver.balance,
        ip_address: ip,
        timestamp: now,
        transaction_hour: transactionHour,
        is_weekend: isWeekend,
        is_night: isNight,
        is_fraud: false,
      });

      await Promise.all([
        senderTx.save(),
        receiverTx.save(),
        sender.save(),
        receiver.save(),
      ]);

      // ── Neo4j graph update (non-blocking) ────────────────────────────────
      addTransactionToNeo4j({
        _id: senderTx._id as any,
        senderUsername: sender.username,
        receiverUsername: receiver.username,
        transaction_amount: txAmount,
        description,
        status,
        ip_address: ip,
        is_fraud,
      }).catch((err) => console.error('[Neo4j] Failed to log transaction:', err));

      res.json({
        message: is_fraud
          ? 'Transaction was flagged as suspicious'
          : 'Transaction successful',
        transaction: {
          id: senderTx._id,
          amount: txAmount,
          recipient: receiver.username,
          recipient_name: receiver.full_name,
          status,
          is_fraud,
          new_balance: sender.balance,
        },
        prediction: mlPrediction,
        neo4j: { velocityAnomaly, ringPattern, starPattern },
      });
    } catch (err) {
      console.error('[Transaction] Send error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;

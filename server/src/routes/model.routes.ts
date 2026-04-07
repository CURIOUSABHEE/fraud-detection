import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000/fastapi';

const MODELS: Record<string, { name: string }> = {
  sunny: { name: 'Sunny Model' },
  abhishek_amount: { name: 'Abhishek Amount Model' },
  abhishek_ratio: { name: 'Abhishek Ratio Model' },
};

async function predictFraud(modelType: string, inputData: Record<string, any>) {
  const modelConfig = MODELS[modelType];
  if (!modelConfig) throw new Error(`Model ${modelType} not found`);

  const processedData: Record<string, any> = {};
  for (const key in inputData) {
    let value = inputData[key];
    if (value === null || value === undefined) continue;
    if (typeof value === 'boolean') value = value ? 1 : 0;
    processedData[key.toLowerCase()] = value;
  }

  const res = await fetch(`${FASTAPI_URL}/predict/${modelType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(processedData),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error: ${res.status} - ${err}`);
  }

  const result = await res.json() as Record<string, any>;
  return {
    is_fraud: result.is_fraud,
    probability: result.probability,
    model_name: modelConfig.name,
    features_used: result.features_used ?? Object.keys(processedData).length,
  };
}

// All model routes require auth + admin
router.use(authMiddleware, adminMiddleware);

// ─── POST /api/models/test-model/:modelId ─────────────────────────────────────
router.post(
  '/test-model/:modelId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { modelId } = req.params;
      if (!['sunny', 'abhishek_amount', 'abhishek_ratio'].includes(modelId)) {
        res.status(400).json({ error: 'Invalid model ID' });
        return;
      }
      const prediction = await predictFraud(modelId, req.body);
      res.json({ [modelId]: prediction });
    } catch (error: any) {
      console.error('[Models] Test model error:', error);
      res.status(500).json({ error: error.message || 'Error testing model' });
    }
  }
);

// ─── POST /api/models/test-all-models ──────────────────────────────────────────
router.post(
  '/test-all-models',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const formData = req.body;
      const [sunny, abhishek_amount, abhishek_ratio] = await Promise.all([
        predictFraud('sunny', formData),
        predictFraud('abhishek_amount', formData),
        predictFraud('abhishek_ratio', formData),
      ]);
      res.json({ sunny, abhishek_amount, abhishek_ratio });
    } catch (error: any) {
      console.error('[Models] Test all models error:', error);
      res.status(500).json({ error: error.message || 'Error testing models' });
    }
  }
);

export default router;

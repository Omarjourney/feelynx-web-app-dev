import { Router } from 'express';

import { emotionSchemas, withValidation, type InferBody } from '../utils/validation';

const NEGATIVE_KEYWORDS = [
  'hate',
  'stupid',
  'idiot',
  'trash',
  'awful',
  'kill',
  'loser',
  'ugly',
  'annoying',
  'boring',
];

const POSITIVE_KEYWORDS = ['love', 'amazing', 'great', 'fire', 'beautiful', 'awesome', 'wow', 'stunning'];

const router = Router();

router.post(
  '/',
  withValidation(emotionSchemas.analyze),
  (req, res) => {
    const { text } = req.body as InferBody<typeof emotionSchemas.analyze>;
    const lower = text.toLowerCase();

    const hasNegative = NEGATIVE_KEYWORDS.some((keyword) => lower.includes(keyword));
    const hasPositive = POSITIVE_KEYWORDS.some((keyword) => lower.includes(keyword));

    const sentiment = hasNegative ? 'negative' : hasPositive ? 'positive' : 'neutral';

    if (hasNegative) {
      return res.json({
        sentiment,
        flagged: true,
        replacement: '✨ Let’s keep the vibes positive and empowering.',
      });
    }

    if (sentiment === 'neutral') {
      return res.json({ sentiment, flagged: false });
    }

    return res.json({ sentiment, flagged: false });
  },
);

export default router;

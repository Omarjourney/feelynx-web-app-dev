import { Router } from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  withValidation,
  type InferBody,
  type InferParams,
  type InferQuery,
  highlightsSchemas,
} from '../utils/validation';

const HIGHLIGHTS_DIR = path.join(process.cwd(), 'data', 'highlights');

const ensureHighlightsDir = async () => {
  await fs.mkdir(HIGHLIGHTS_DIR, { recursive: true });
};

interface HighlightRecord {
  id: string;
  streamId: string;
  title: string;
  start: number;
  end: number;
  duration: number;
  clipUrl: string;
  previewImage: string;
  generatedAt: string;
  shareCounts: Record<string, number>;
  engagementPeak: number;
}

const readHighlightsFile = async (streamId: string): Promise<HighlightRecord[]> => {
  await ensureHighlightsDir();
  const filePath = path.join(HIGHLIGHTS_DIR, `${streamId}.json`);
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as HighlightRecord[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeHighlightsFile = async (streamId: string, highlights: HighlightRecord[]) => {
  await ensureHighlightsDir();
  const filePath = path.join(HIGHLIGHTS_DIR, `${streamId}.json`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(filePath, JSON.stringify(highlights, null, 2));
};

const generateHighlightId = (streamId: string, index: number) => `${streamId}-${index}`;

const buildClipUrl = (streamId: string, highlightId: string) =>
  `https://cdn.feelynx.tv/clips/${encodeURIComponent(streamId)}/${encodeURIComponent(highlightId)}.mp4`;

const buildPreviewImage = (streamId: string, highlightId: string) =>
  `https://cdn.feelynx.tv/clips/${encodeURIComponent(streamId)}/${encodeURIComponent(highlightId)}.jpg`;

const router = Router();

router.get(
  '/',
  withValidation(highlightsSchemas.list),
  async (req, res) => {
    const { streamId } = req.query as unknown as InferQuery<typeof highlightsSchemas.list>;

    try {
      if (streamId) {
        const highlights = await readHighlightsFile(streamId);
        return res.json({ streamId, highlights });
      }

      await ensureHighlightsDir();
      const entries = await fs.readdir(HIGHLIGHTS_DIR);
      const payload: Record<string, HighlightRecord[]> = {};
      for (const entry of entries) {
        if (!entry.endsWith('.json')) continue;
        const id = entry.replace(/\.json$/, '');
        payload[id] = await readHighlightsFile(id);
      }
      return res.json(payload);
    } catch (error) {
      console.error('Failed to load highlights', error);
      return res.status(500).json({ message: 'Failed to load highlights' });
    }
  },
);

const windowScore = (data: Array<{ timestamp: number; viewers: number; tokens: number; reactions: number }>) => {
  if (!data.length) return 0;
  const totals = data.reduce(
    (acc, item) => {
      acc.viewers += item.viewers;
      acc.tokens += item.tokens;
      acc.reactions += item.reactions;
      return acc;
    },
    { viewers: 0, tokens: 0, reactions: 0 },
  );
  return totals.viewers * 0.35 + totals.tokens * 0.5 + totals.reactions * 0.15;
};

const deriveHighlights = (
  streamId: string,
  engagement: Array<{ timestamp: number; viewers: number; tokens: number; reactions: number }>,
  clipLength: number,
): HighlightRecord[] => {
  if (!engagement.length) {
    return [];
  }

  const sorted = [...engagement].sort((a, b) => a.timestamp - b.timestamp);
  const highlights: HighlightRecord[] = [];
  const windowSize = clipLength * 1000;

  for (let i = 0; i < sorted.length; i++) {
    const windowStart = sorted[i].timestamp;
    const windowEnd = windowStart + windowSize;
    const windowData = sorted.filter((item) => item.timestamp >= windowStart && item.timestamp <= windowEnd);
    const score = windowScore(windowData);
    const id = generateHighlightId(streamId, highlights.length + 1);

    highlights.push({
      id,
      streamId,
      title: `Viral spike @ ${Math.round(windowStart / 1000)}s`,
      start: windowStart,
      end: windowEnd,
      duration: clipLength,
      clipUrl: buildClipUrl(streamId, id),
      previewImage: buildPreviewImage(streamId, id),
      generatedAt: new Date().toISOString(),
      shareCounts: {},
      engagementPeak: score,
    });
  }

  return highlights
    .sort((a, b) => b.engagementPeak - a.engagementPeak)
    .slice(0, 5)
    .map((highlight, index) => ({ ...highlight, id: generateHighlightId(streamId, index + 1) }));
};

router.post(
  '/',
  withValidation(highlightsSchemas.generate),
  async (req, res) => {
    const { streamId, engagement, clipLength } = req.body as InferBody<typeof highlightsSchemas.generate>;

    try {
      const clipDuration = Math.max(10, Math.min(clipLength ?? 15, 20));
      const generated = deriveHighlights(streamId, engagement, clipDuration);
      if (!generated.length) {
        return res.status(400).json({ message: 'Unable to derive highlights from engagement data' });
      }
      await writeHighlightsFile(streamId, generated);
      return res.json({ streamId, highlights: generated });
    } catch (error) {
      console.error('Failed to generate highlights', error);
      return res.status(500).json({ message: 'Failed to generate highlights' });
    }
  },
);

router.patch(
  '/:streamId/:highlightId',
  withValidation(highlightsSchemas.update),
  async (req, res) => {
    const { streamId, highlightId } = req.params as unknown as InferParams<typeof highlightsSchemas.update>;
    const { start, end, title } = req.body as InferBody<typeof highlightsSchemas.update>;

    try {
      const highlights = await readHighlightsFile(streamId);
      const index = highlights.findIndex((item) => item.id === highlightId);
      if (index === -1) {
        return res.status(404).json({ message: 'Highlight not found' });
      }

      const highlight = highlights[index];
      const updated = {
        ...highlight,
        start: start ?? highlight.start,
        end: end ?? highlight.end,
        duration: ((end ?? highlight.end) - (start ?? highlight.start)) / 1000,
        title: title ?? highlight.title,
      };
      highlights[index] = updated;
      await writeHighlightsFile(streamId, highlights);
      return res.json(updated);
    } catch (error) {
      console.error('Failed to update highlight', error);
      return res.status(500).json({ message: 'Failed to update highlight' });
    }
  },
);

router.post(
  '/:streamId/:highlightId/share',
  withValidation(highlightsSchemas.share),
  async (req, res) => {
    const { streamId, highlightId } = req.params as unknown as InferParams<typeof highlightsSchemas.share>;
    const { platform } = req.body as InferBody<typeof highlightsSchemas.share>;

    try {
      const highlights = await readHighlightsFile(streamId);
      const index = highlights.findIndex((item) => item.id === highlightId);
      if (index === -1) {
        return res.status(404).json({ message: 'Highlight not found' });
      }
      const highlight = highlights[index];
      const shareCounts = {
        ...highlight.shareCounts,
        [platform]: (highlight.shareCounts[platform] ?? 0) + 1,
      };
      const updated = { ...highlight, shareCounts };
      highlights[index] = updated;
      await writeHighlightsFile(streamId, highlights);
      return res.json({ shareCounts });
    } catch (error) {
      console.error('Failed to register share', error);
      return res.status(500).json({ message: 'Failed to register share' });
    }
  },
);

export default router;

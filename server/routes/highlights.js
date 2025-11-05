import { Router } from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { withValidation, highlightsSchemas, } from '../utils/validation';
const HIGHLIGHTS_DIR = path.join(process.cwd(), 'data', 'highlights');
const ensureHighlightsDir = async () => {
    await fs.mkdir(HIGHLIGHTS_DIR, { recursive: true });
};
const readHighlightsFile = async (streamId) => {
    await ensureHighlightsDir();
    const filePath = path.join(HIGHLIGHTS_DIR, `${streamId}.json`);
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const raw = await fs.readFile(filePath, 'utf8');
        return JSON.parse(raw);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
};
const writeHighlightsFile = async (streamId, highlights) => {
    await ensureHighlightsDir();
    const filePath = path.join(HIGHLIGHTS_DIR, `${streamId}.json`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(filePath, JSON.stringify(highlights, null, 2));
};
const generateHighlightId = (streamId, index) => `${streamId}-${index}`;
const buildClipUrl = (streamId, highlightId) => `https://cdn.feelynx.tv/clips/${encodeURIComponent(streamId)}/${encodeURIComponent(highlightId)}.mp4`;
const buildPreviewImage = (streamId, highlightId) => `https://cdn.feelynx.tv/clips/${encodeURIComponent(streamId)}/${encodeURIComponent(highlightId)}.jpg`;
const router = Router();
router.get('/', withValidation(highlightsSchemas.list), async (req, res) => {
    const { streamId } = req.query;
    try {
        if (streamId) {
            const highlights = await readHighlightsFile(streamId);
            return res.json({ streamId, highlights });
        }
        await ensureHighlightsDir();
        const entries = await fs.readdir(HIGHLIGHTS_DIR);
        const payload = {};
        for (const entry of entries) {
            if (!entry.endsWith('.json'))
                continue;
            const id = entry.replace(/\.json$/, '');
            payload[id] = await readHighlightsFile(id);
        }
        return res.json(payload);
    }
    catch (error) {
        console.error('Failed to load highlights', error);
        return res.status(500).json({ message: 'Failed to load highlights' });
    }
});
const windowScore = (data) => {
    if (!data.length)
        return 0;
    const totals = data.reduce((acc, item) => {
        acc.viewers += item.viewers;
        acc.tokens += item.tokens;
        acc.reactions += item.reactions;
        return acc;
    }, { viewers: 0, tokens: 0, reactions: 0 });
    return totals.viewers * 0.35 + totals.tokens * 0.5 + totals.reactions * 0.15;
};
const deriveHighlights = (streamId, engagement, clipLength) => {
    if (!engagement.length) {
        return [];
    }
    const sorted = [...engagement].sort((a, b) => a.timestamp - b.timestamp);
    const highlights = [];
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
        .map((highlight, index) => (Object.assign(Object.assign({}, highlight), { id: generateHighlightId(streamId, index + 1) })));
};
router.post('/', withValidation(highlightsSchemas.generate), async (req, res) => {
    const { streamId, engagement, clipLength } = req.body;
    try {
        const clipDuration = Math.max(10, Math.min(clipLength !== null && clipLength !== void 0 ? clipLength : 15, 20));
        const generated = deriveHighlights(streamId, engagement, clipDuration);
        if (!generated.length) {
            return res.status(400).json({ message: 'Unable to derive highlights from engagement data' });
        }
        await writeHighlightsFile(streamId, generated);
        return res.json({ streamId, highlights: generated });
    }
    catch (error) {
        console.error('Failed to generate highlights', error);
        return res.status(500).json({ message: 'Failed to generate highlights' });
    }
});
router.patch('/:streamId/:highlightId', withValidation(highlightsSchemas.update), async (req, res) => {
    const { streamId, highlightId } = req.params;
    const { start, end, title } = req.body;
    try {
        const highlights = await readHighlightsFile(streamId);
        const index = highlights.findIndex((item) => item.id === highlightId);
        if (index === -1) {
            return res.status(404).json({ message: 'Highlight not found' });
        }
        const highlight = highlights[index];
        const updated = Object.assign(Object.assign({}, highlight), { start: start !== null && start !== void 0 ? start : highlight.start, end: end !== null && end !== void 0 ? end : highlight.end, duration: ((end !== null && end !== void 0 ? end : highlight.end) - (start !== null && start !== void 0 ? start : highlight.start)) / 1000, title: title !== null && title !== void 0 ? title : highlight.title });
        highlights[index] = updated;
        await writeHighlightsFile(streamId, highlights);
        return res.json(updated);
    }
    catch (error) {
        console.error('Failed to update highlight', error);
        return res.status(500).json({ message: 'Failed to update highlight' });
    }
});
router.post('/:streamId/:highlightId/share', withValidation(highlightsSchemas.share), async (req, res) => {
    var _a;
    const { streamId, highlightId } = req.params;
    const { platform } = req.body;
    try {
        const highlights = await readHighlightsFile(streamId);
        const index = highlights.findIndex((item) => item.id === highlightId);
        if (index === -1) {
            return res.status(404).json({ message: 'Highlight not found' });
        }
        const highlight = highlights[index];
        const shareCounts = Object.assign(Object.assign({}, highlight.shareCounts), { [platform]: ((_a = highlight.shareCounts[platform]) !== null && _a !== void 0 ? _a : 0) + 1 });
        const updated = Object.assign(Object.assign({}, highlight), { shareCounts });
        highlights[index] = updated;
        await writeHighlightsFile(streamId, highlights);
        return res.json({ shareCounts });
    }
    catch (error) {
        console.error('Failed to register share', error);
        return res.status(500).json({ message: 'Failed to register share' });
    }
});
export default router;

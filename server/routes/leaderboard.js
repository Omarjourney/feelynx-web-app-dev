import { Router } from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { leaderboardSchemas, withValidation, } from '../utils/validation';
const DATA_FILE = path.join(process.cwd(), 'data', 'leaderboard.json');
const readLeaderboard = async () => {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
};
const writeLeaderboard = async (entries) => {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
};
const resolveTier = (tokens) => {
    if (tokens >= 5000)
        return 'Elite';
    if (tokens >= 2000)
        return 'Pro';
    return 'Growth';
};
const resolveStreakBadge = (streakDays) => {
    if (streakDays >= 14)
        return '🔥 Elite Streak';
    if (streakDays >= 7)
        return '⚡ Pro Streak';
    if (streakDays >= 3)
        return '✨ Growth Streak';
    return null;
};
const router = Router();
router.get('/', async (_req, res) => {
    try {
        const entries = await readLeaderboard();
        const sorted = [...entries].sort((a, b) => b.weeklyTokens - a.weeklyTokens).slice(0, 10);
        const withBadges = sorted.map((entry, index) => (Object.assign(Object.assign({}, entry), { rank: index + 1, streakBadge: resolveStreakBadge(entry.streakDays) })));
        res.json({ entries: withBadges });
    }
    catch (error) {
        console.error('Failed to load leaderboard', error);
        res.status(500).json({ message: 'Failed to load leaderboard' });
    }
});
router.post('/', withValidation(leaderboardSchemas.record), async (req, res) => {
    const payload = req.body;
    try {
        const entries = await readLeaderboard();
        const index = entries.findIndex((entry) => entry.creatorId === payload.creatorId);
        const nextEntry = {
            creatorId: payload.creatorId,
            creatorName: payload.creatorName,
            avatar: payload.avatar,
            weeklyTokens: payload.weeklyTokens,
            streakDays: payload.streakDays,
            tier: resolveTier(payload.weeklyTokens),
            lastShareRate: payload.lastShareRate,
        };
        if (index === -1) {
            entries.push(nextEntry);
        }
        else {
            entries[index] = nextEntry;
        }
        await writeLeaderboard(entries);
        res.json(nextEntry);
    }
    catch (error) {
        console.error('Failed to update leaderboard', error);
        res.status(500).json({ message: 'Failed to update leaderboard' });
    }
});
export default router;

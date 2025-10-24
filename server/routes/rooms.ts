import { Router } from 'express';
import { roomParticipants } from '../roomParticipants';

const router = Router();

router.get('/:room/participants', (req, res) => {
  const { room } = req.params;
  const participants = roomParticipants[room] || {
    hosts: new Set<string>(),
    viewers: new Set<string>(),
  };
  res.json({
    hosts: Array.from(participants.hosts),
    viewers: Array.from(participants.viewers),
  });
});

export default router;

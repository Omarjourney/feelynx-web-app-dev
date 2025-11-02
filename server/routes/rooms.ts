import { Router } from 'express';
import { roomParticipants } from '../roomParticipants';
import { roomSchemas, withValidation, type InferParams } from '../utils/validation';

const router = Router();

router.get('/:room/participants', withValidation(roomSchemas.participants), (req, res) => {
  const { room } = req.params as InferParams<typeof roomSchemas.participants>;
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

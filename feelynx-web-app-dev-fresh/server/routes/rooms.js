import { Router } from 'express';
import { roomParticipants } from '../roomParticipants';
import { roomSchemas, withValidation } from '../utils/validation';
const router = Router();
router.get('/:room/participants', withValidation(roomSchemas.participants), (req, res) => {
  const { room } = req.params;
  const participants = roomParticipants[room] || {
    hosts: new Set(),
    viewers: new Set(),
  };
  res.json({
    hosts: Array.from(participants.hosts),
    viewers: Array.from(participants.viewers),
  });
});
export default router;

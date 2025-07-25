import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

const app = express();
app.use(express.json());

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import postsRoutes from './routes/posts';
import paymentsRoutes from './routes/payments';
import livekitRoutes from './routes/livekit';

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/livekit', livekitRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

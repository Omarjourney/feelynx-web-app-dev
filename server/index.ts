import express from 'express';
import dotenv from 'dotenv';
import { pool } from './db/index.js';

dotenv.config();

const app = express();
app.use(express.json());

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import postsRoutes from './routes/posts.js';
import paymentsRoutes from './routes/payments.js';
import livekitRoutes from './routes/livekit.js';

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/livekit', livekitRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

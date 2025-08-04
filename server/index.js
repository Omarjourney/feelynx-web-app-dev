import express from 'express';
import streamRouter from './stream.js';

const app = express();
app.use(express.json());

app.use('/api/stream', streamRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Stream server running on ${PORT}`);
});

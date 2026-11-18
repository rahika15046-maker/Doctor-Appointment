import 'dotenv/config';
import app from './app.js';
import { connectDb } from './db.js';

const port = process.env.PORT || 5000;
const host = '0.0.0.0';

// Start listening immediately on 0.0.0.0 so Render detects port binding in < 1 second!
const server = app.listen(port, host, () => {
  console.log(`MEDORA API server running on http://${host}:${port}`);
});

// Connect DB safely in background without blocking port binding or timing out Render deploy
connectDb().catch((err) => {
  console.error('[DB] Connection error:', err.message);
});

export default server;

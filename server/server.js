import 'dotenv/config';
import app from './app.js';
import { connectDb } from './db.js';

await connectDb();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`MEDORA API server running on port ${port}`));

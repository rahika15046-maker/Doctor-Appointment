import 'dotenv/config';
import mongoose from 'mongoose';

async function check() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('Connected to MongoDB successfully!');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }
    
    // Check doctors specifically
    const doctors = await db.collection('doctors').find({}).toArray();
    console.log(`\nFound ${doctors.length} doctors:`);
    doctors.forEach(d => {
      console.log(`• ${d.name} (${d.specialization || d.department}) - Hospital: ${d.hospital}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Atlas check failed:', err.message);
  }
}

check();

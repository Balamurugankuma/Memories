// backend/clearMongoDB.js
const { MongoClient } = require('mongodb');

async function clearMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farewelldb';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    await db.collection('memories').deleteMany({});
    await db.collection('comments').deleteMany({});
    await db.collection('messages').deleteMany({});
    
    console.log('✅ MongoDB collections cleared successfully!');
  } catch (error) {
    console.error('Error clearing MongoDB:', error);
  } finally {
    await client.close();
  }
}

clearMongoDB();
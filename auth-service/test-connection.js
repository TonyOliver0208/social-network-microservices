require('dotenv/config');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Testing MongoDB connection...');
console.log('URI (masked):', uri.replace(/\/\/.*@/, '//***:***@'));

mongoose.connect(uri, { 
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000 
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  mongoose.disconnect();
})
.catch(err => {
  console.log('❌ MongoDB connection failed:');
  console.log('Error name:', err.name);
  console.log('Error message:', err.message);
  if (err.reason) {
    console.log('Error reason:', err.reason);
  }
});
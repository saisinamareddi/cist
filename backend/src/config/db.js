const mongoose = require('mongoose');

const getMongoUrl = () => process.env.Mongo_Url || process.env.MONGO_URL || process.env.MONGODB_URI;

const connectDB = async () => {
  const mongoUrl = getMongoUrl();

  if (!mongoUrl) {
    throw new Error('MongoDB URL is missing. Add Mongo_Url to backend/.env');
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};

module.exports = connectDB;

const mongoose = require('mongoose');

const mongooseConnect = async dbUri => {
  await mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const db = mongoose.connection;

  db.once('open', async () => {
    console.log('Connected to database');
  });

  db.on('error', () => {
    console.log('Error connecting to database');
  });

  db.on('error', () => {
    console.log('Disconnected from database');
  });
};

module.exports = mongooseConnect;

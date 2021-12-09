const http = require('http');
require('dotenv').config();
const expressApp = require('./app');
const connectToDB = require('./db/index');

const startUp = async app => {
  const JWT = process.env.JWT_AUTH_SECRET;
  let PORT = process.env.PORT;
  const DB_HOST = process.env.DB_HOST;

  if (!JWT) {
    throw new Error('JWT_AUTH_SECRET must be defined');
  }

  if (!DB_HOST) {
    throw new Error('Database configurations must be defined');
  }

  if (!PORT) {
    throw new Error('PORT must be defined');
  }

  // Connect to database.
  await connectToDB(DB_HOST);

  // initialize http server
  const httpServer = http.createServer(app);

  PORT = parseInt(PORT, 10);
  const server = httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT} ${process.env.NODE_ENV}`);
    console.log(`🚀 API Docs @ http://localhost:${PORT}/api-docs`);
  });

  process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully...');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
};

startUp(expressApp);

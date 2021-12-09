const fs = require('fs');
const logger = require('../logger');

exports.deleteFileFromPath = (filePath) => {
  logger.info('File Utility', `Deleting file @ ${filePath}`);
  if (fs.existsSync(filePath)) {
    logger.info('File Utility', 'The file exists.');
    return fs.unlink(filePath, (error) => {
      if (error) {
        throw error;
      }
    });
  }
  logger.info('File Utility', 'The file does not exist.');
};

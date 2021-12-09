/* eslint-disable no-console */
// const ansiColor = require('ansi-colors');
const kuler = require('kuler');

const getTimeStamp = () => new Date().toISOString();

exports.info = (namespace, message, object) => {
  if (object) {
    console.info(
      kuler(`[${getTimeStamp()}] [INFO] [${namespace}] ${message}`, '#FF6600'),
      object,
    );
  } else {
    console.info(
      kuler(`[${getTimeStamp()}] [INFO] [${namespace}] ${message}`, '#FF6600'),
    );
  }
};

exports.warn = (namespace, message, object) => {
  if (object) {
    console.warn(
      kuler(`[${getTimeStamp()}] [WARN] [${namespace}] ${message}`, '#FF6600'),
      object,
    );
  } else {
    console.warn(
      kuler(`[${getTimeStamp()}] [WARN] [${namespace}] ${message}`, '#FF6600'),
    );
  }
};

exports.error = (namespace, message, object) => {
  if (object) {
    console.error(
      `[${getTimeStamp()}] [ERROR] [${namespace}] ${message}`,
      object,
    );
  } else {
    console.error(`[${getTimeStamp()}] [ERROR] [${namespace}] ${message}`);
  }
};

exports.debug = (namespace, message, object) => {
  if (object) {
    console.debug(
      `[${getTimeStamp()}] [DEBUG] [${namespace}] ${message}`,
      object,
    );
  } else {
    console.debug(`[${getTimeStamp()}] [DEBUG] [${namespace}] ${message}`);
  }
};

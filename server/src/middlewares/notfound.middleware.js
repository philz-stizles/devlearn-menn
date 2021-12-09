const notFoundHandler = (_req, res) => {
  const message = 'Resource not found';

  res.status(404).send({ status: false, message });
};

module.exports = notFoundHandler;

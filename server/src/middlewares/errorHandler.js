module.exports = (err, req, res, next) => {
  // Body parser JSON syntax error handling
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: {
        status: 400,
        message: 'Invalid JSON in request body',
      },
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${status}: ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};
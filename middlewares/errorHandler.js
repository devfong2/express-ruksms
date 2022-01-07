// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = err;
  return res.status(statusCode || 400).json({
    success: false,
    data: null,
    error: {
      code: statusCode || 400,
      message,
    },
  });
};

export default errorHandler;

export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const handleApiError = (res, error) => {
  const status = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  res.status(status).json({
    status: 'error',
    statusCode: status,
    message,
  });
};


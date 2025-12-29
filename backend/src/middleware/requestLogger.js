import logger from '../config/logger.js';

/**
 * Middleware untuk log setiap HTTP request
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Ambil informasi user jika ada (sudah di-extract oleh extractUserForLogging middleware)
  const userId = req.user?.id;
  const username = req.user?.username;
  
  // Log request yang masuk
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };
  
  // Hanya tambahkan userId dan username jika ada
  if (userId) {
    logData.userId = userId;
  }
  if (username) {
    logData.username = username;
  }
  
  logger.http('Incoming request', logData);

  // Override res.json untuk log response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    
    // Log response
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };
    
    // Hanya tambahkan userId dan username jika ada
    if (userId) {
      logData.userId = userId;
    }
    if (username) {
      logData.username = username;
    }
    
    logger.http('Request completed', logData);

    return originalJson(data);
  };

  // Tangkap error jika ada
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (res.statusCode >= 400) {
      const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      };
      
      // Hanya tambahkan userId dan username jika ada
      if (userId) {
        logData.userId = userId;
      }
      if (username) {
        logData.username = username;
      }
      
      logger.warn('Request failed', logData);
    }
  });

  next();
};

/**
 * Middleware untuk log error
 */
export const errorLogger = (err, req, res, next) => {
  const userId = req.user?.id;
  const username = req.user?.username;

  const logData = {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    ip: req.ip,
  };
  
  // Hanya tambahkan userId dan username jika ada
  if (userId) {
    logData.userId = userId;
  }
  if (username) {
    logData.username = username;
  }

  logger.error('Error occurred', logData);

  next(err);
};
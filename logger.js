const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(), // always log to console
  ],
});

// Only log to file in development (i.e., locally)
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }));
  logger.add(new transports.File({ filename: path.join('logs', 'combined.log') }));
}

module.exports = logger;

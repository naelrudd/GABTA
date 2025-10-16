require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Core middleware
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan('dev'));
// Also accept URL-encoded forms as fallback
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api', routes);

// Swagger only in dev/test
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerJsdoc = require('swagger-jsdoc');
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'GABTA API Documentation',
        version: '1.0.0',
        description: 'API for GABTA - QR Code Based Attendance System',
      },
      servers: [{ url: '/api', description: 'Current server' }],
    },
    apis: ['./src/routes/*.js'],
  };
  const specs = swaggerJsdoc(options);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// Central error handler
app.use(errorHandler);

module.exports = app;
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

// CORS configuration - allow frontend to access backend
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000,http://192.168.18.8:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

// Handle preflight requests
app.options('*', cors());

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
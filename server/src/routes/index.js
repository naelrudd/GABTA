const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const sessionRoutes = require('./session.routes');
const attendanceRoutes = require('./attendance.routes');
const statisticsRoutes = require('./statistics.routes');

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/statistics', statisticsRoutes);

module.exports = router;
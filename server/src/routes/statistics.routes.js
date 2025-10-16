const express = require('express');
const router = express.Router();
const { verifyToken, isCommittee } = require('../middlewares/auth');
const attendanceController = require('../controllers/attendance.controller');

/**
 * @swagger
 * /statistics/overview:
 *   get:
 *     summary: Get overall statistics (committee/admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics
 */
router.get('/overview', verifyToken, isCommittee, attendanceController.getAttendanceSummary);

module.exports = router;
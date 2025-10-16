const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, isCommittee } = require('../middlewares/auth');
const attendanceController = require('../controllers/attendance.controller');

/**
 * @swagger
 * /attendance/submit:
 *   post:
 *     summary: Submit attendance (scan QR or enter manual code)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - token
 *               - locationLat
 *               - locationLng
 *             properties:
 *               sessionId:
 *                 type: string
 *               token:
 *                 type: string
 *               locationLat:
 *                 type: number
 *               locationLng:
 *                 type: number
 *               isManual:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Attendance recorded successfully
 */
router.post(
  '/submit',
  verifyToken,
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('token').notEmpty().withMessage('Token is required'),
    body('locationLat').isFloat().withMessage('Valid latitude is required'),
    body('locationLng').isFloat().withMessage('Valid longitude is required'),
  ],
  attendanceController.submitAttendance
);

/**
 * @swagger
 * /attendance/session/{sessionId}:
 *   get:
 *     summary: Get attendance list for a session (committee/admin only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance list
 */
router.get('/session/:sessionId', verifyToken, isCommittee, attendanceController.getSessionAttendance);

/**
 * @swagger
 * /attendance/user/{userId?}:
 *   get:
 *     summary: Get user's attendance history
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (optional, defaults to current user)
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Filter by session ID
 *     responses:
 *       200:
 *         description: User attendance history
 */
router.get('/user/:userId?', verifyToken, attendanceController.getUserAttendance);

/**
 * @swagger
 * /attendance/stats/user/{userId?}:
 *   get:
 *     summary: Get user attendance statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (optional, defaults to current user)
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get('/stats/user/:userId?', verifyToken, attendanceController.getUserStats);

/**
 * @swagger
 * /attendance/stats/session/{sessionId}:
 *   get:
 *     summary: Get session attendance statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session statistics
 */
router.get('/stats/session/:sessionId', verifyToken, isCommittee, attendanceController.getSessionStats);

/**
 * @swagger
 * /attendance/summary:
 *   get:
 *     summary: Get attendance summary (recent records)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance summary
 */
router.get('/summary', verifyToken, attendanceController.getAttendanceSummary);

/**
 * @swagger
 * /attendance/{id}:
 *   patch:
 *     summary: Update attendance status (dosen only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [present, late, absent]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance updated
 */
router.patch('/:id', verifyToken, isCommittee, attendanceController.updateAttendance);

module.exports = router;
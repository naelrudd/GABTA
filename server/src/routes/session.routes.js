const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, isCommittee } = require('../middlewares/auth');
const sessionController = require('../controllers/session.controller');

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session (committee/admin only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startTime
 *               - endTime
 *               - locationLat
 *               - locationLng
 *             properties:
 *               name:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               locationLat:
 *                 type: number
 *               locationLng:
 *                 type: number
 *               radiusMeters:
 *                 type: integer
 *                 default: 50
 *                 description: Attendance area radius in meters
 *               className:
 *                 type: string
 *                 description: Class/Subject name for organizing sessions
 *     responses:
 *       201:
 *         description: Session created successfully
 */
router.post(
  '/',
  verifyToken,
  isCommittee,
  [
    body('name').notEmpty().withMessage('Session name is required'),
    body('startTime').isISO8601().withMessage('Valid start time is required'),
    body('endTime').isISO8601().withMessage('Valid end time is required'),
    body('locationLat').isFloat().withMessage('Valid latitude is required'),
    body('locationLng').isFloat().withMessage('Valid longitude is required'),
    body('radiusMeters').optional().isInt({ min: 10, max: 1000 }).withMessage('Radius must be between 10-1000 meters'),
    body('className').optional().isString().withMessage('Class name must be a string'),
  ],
  sessionController.createSession
);

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get all sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mine
 *         schema:
 *           type: boolean
 *         description: Filter by sessions created by current user
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get('/', verifyToken, sessionController.getSessions);

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 */
router.get('/:id', verifyToken, sessionController.getSessionById);

/**
 * @swagger
 * /sessions/{id}/scan:
 *   get:
 *     summary: Get session info with fresh token (for student direct scan access)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session info with fresh attendance token
 */
router.get('/:id/scan', verifyToken, sessionController.getSessionForScan);

/**
 * @swagger
 * /sessions/{id}/qr:
 *   get:
 *     summary: Get current QR code for session (rotates every 30s)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code data with token and manual code
 */
router.get('/:id/qr', verifyToken, isCommittee, sessionController.getSessionQR);

/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Update session
 *     tags: [Sessions]
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
 *               name:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               locationLat:
 *                 type: number
 *               locationLng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Session updated
 */
router.put(
  '/:id',
  verifyToken,
  isCommittee,
  [
    body('name').optional().notEmpty().withMessage('Session name cannot be empty'),
    body('startTime').optional().isISO8601().withMessage('Valid start time is required'),
    body('endTime').optional().isISO8601().withMessage('Valid end time is required'),
    body('locationLat').optional().isFloat().withMessage('Valid latitude is required'),
    body('locationLng').optional().isFloat().withMessage('Valid longitude is required'),
  ],
  sessionController.updateSession
);

/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Delete session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session deleted
 */
router.delete('/:id', verifyToken, isCommittee, sessionController.deleteSession);

module.exports = router;
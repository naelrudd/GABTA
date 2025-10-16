const { validationResult } = require('express-validator');
const sessionService = require('../services/session.service');

// Create a new session (committee/admin only)
exports.createSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, startTime, endTime, locationLat, locationLng, radiusMeters, className } = req.body;
    const creatorId = req.user.id;

    const session = await sessionService.createSession(
      { name, startTime, endTime, locationLat, locationLng, radiusMeters, className },
      creatorId
    );

    res.status(201).json({
      message: 'Session created successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Get all sessions
exports.getSessions = async (req, res, next) => {
  try {
    const filters = {};
    
    // If user is participant, show only active sessions
    if (req.user.role.name === 'participant') {
      filters.active = true;
    }
    
    // If query param says mySession, filter by creator
    if (req.query.mine === 'true') {
      filters.creatorId = req.user.id;
    }

    const sessions = await sessionService.getSessions(filters);

    res.status(200).json({
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// Get session by ID
exports.getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await sessionService.getSessionById(id);

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};

// Get current QR code for a session (refreshes every 30s)
exports.getSessionQR = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Only creator or committee/admin can get QR
    const session = await sessionService.getSessionById(id);
    if (
      session.creatorId !== req.user.id &&
      req.user.role.name !== 'admin' &&
      req.user.role.name !== 'committee'
    ) {
      return res.status(403).json({ message: 'Unauthorized to view QR code' });
    }

    const qrData = await sessionService.getCurrentQRData(id);

    res.status(200).json(qrData);
  } catch (error) {
    next(error);
  }
};

// Update session
exports.updateSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    const session = await sessionService.updateSession(id, updates, req.user.id);

    res.status(200).json({
      message: 'Session updated successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Delete session
exports.deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await sessionService.deleteSession(id, req.user.id, req.user.role.name);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get session info with fresh token (for direct scan access)
// This allows students to access /scan/:sessionId and get a fresh token automatically
exports.getSessionForScan = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get session basic info
    const session = await sessionService.getSessionById(id);
    
    // Check if session is active
    const now = new Date();
    const isActive = now >= new Date(session.startTime) && now <= new Date(session.endTime);
    
    if (!isActive) {
      return res.status(400).json({ 
        message: 'Sesi presensi belum dimulai atau sudah berakhir',
        session: {
          id: session.id,
          name: session.name,
          startTime: session.startTime,
          endTime: session.endTime,
        }
      });
    }
    
    // Generate fresh token for this student
    const token = sessionService.generateQRToken(id, session.qrSecret);
    
    res.status(200).json({
      sessionId: id,
      sessionName: session.name,
      token,
      expiresIn: 30, // seconds
      location: {
        lat: session.locationLat,
        lng: session.locationLng,
        radius: session.radiusMeters,
      },
    });
  } catch (error) {
    next(error);
  }
};

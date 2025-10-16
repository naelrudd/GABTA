const { Session, User, AttendanceRecord } = require('../models');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class SessionService {
  // Create a new session
  async createSession(data, creatorId) {
    const { name, startTime, endTime, locationLat, locationLng, radiusMeters = 50, className, kodeKelas, maxCapacity } = data;
    
    // Generate QR secret for this session
    const qrSecret = crypto.randomBytes(32).toString('hex');
    
    const session = await Session.create({
      name,
      startTime,
      endTime,
      locationLat,
      locationLng,
      radiusMeters,
      className,
      kodeKelas,
      maxCapacity: maxCapacity || null,
      qrSecret,
      creatorId,
    });
    
    return session;
  }

  // Get all sessions (with optional filters)
  async getSessions(filters = {}) {
    const where = {};
    
    if (filters.creatorId) {
      where.creatorId = filters.creatorId;
    }
    
    if (filters.active) {
      const now = new Date();
      where.startTime = { [require('sequelize').Op.lte]: now };
      where.endTime = { [require('sequelize').Op.gte]: now };
    }
    
    const sessions = await Session.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['startTime', 'DESC']],
    });
    
    return sessions;
  }

  // Get session by ID
  async getSessionById(sessionId) {
    const session = await Session.findByPk(sessionId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: AttendanceRecord,
          as: 'attendances',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
          ],
        },
      ],
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    return session;
  }

  // Generate rotating QR token (valid for 30 seconds)
  generateQRToken(sessionId, qrSecret) {
    const payload = {
      sessionId,
      type: 'attendance',
      timestamp: Date.now(),
    };
    
    // Sign with session's qrSecret, expires in 30 seconds
    const token = jwt.sign(payload, qrSecret, { expiresIn: '30s' });
    
    return token;
  }

  // Generate manual entry code (6-digit, valid 30s)
  generateManualCode(sessionId, qrSecret) {
    const payload = {
      sessionId,
      type: 'manual',
      timestamp: Date.now(),
    };
    
    // Create a short token and convert to 6-digit code
    const token = jwt.sign(payload, qrSecret, { expiresIn: '30s' });
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const code = parseInt(hash.substring(0, 8), 16).toString().substring(0, 6).padStart(6, '0');
    
    return { code, token };
  }

  // Get current QR data (token + QR image)
  async getCurrentQRData(sessionId) {
    const session = await Session.findByPk(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const token = this.generateQRToken(sessionId, session.qrSecret);
    const { code, token: manualToken } = this.generateManualCode(sessionId, session.qrSecret);
    
    // Get server URL from environment or use default
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const webUrl = process.env.WEB_URL || 'http://localhost:3000';
    
    // SIMPLE QR CODE with sessionId in URL path!
    // When scanned: http://192.168.18.8:3000/attend/{sessionId}
    // - Mobile opens browser
    // - If not logged in → auto-redirect to login → back to this URL
    // - If logged in → page auto-requests fresh token from backend → auto-submit
    const scanUrl = `${webUrl}/attend/${sessionId}`;
    
    // Generate QR code image (base64) - simple URL with sessionId!
    const qrCodeImage = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'M',
      width: 300,
    });
    
    // Also include full data for API response
    const qrData = {
      sessionId,
      token,
      serverUrl,  // Backend API URL
      webUrl,     // Frontend URL for easy access
      scanUrl,    // Simple scan page URL - just /scan
    };
    
    return {
      token,
      manualCode: code,
      manualToken,
      qrCodeImage,
      qrData,      // Include parsed data for easy access
      expiresIn: 30, // seconds
      sessionId,
      serverUrl,   // For display in UI
      scanUrl,     // Simple link - just http://IP:3000/scan
    };
  }

  // Verify QR token
  verifyQRToken(token, qrSecret) {
    try {
      const decoded = jwt.verify(token, qrSecret);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Update session
  async updateSession(sessionId, updates, userId) {
    const session = await Session.findByPk(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Only creator or admin can update
    if (session.creatorId !== userId) {
      throw new Error('Unauthorized to update this session');
    }

    // Allow updating radiusMeters and className
    const allowedUpdates = ['name', 'startTime', 'endTime', 'locationLat', 'locationLng', 'radiusMeters', 'className'];
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });
    
    await session.update(filteredUpdates);
    return session;
  }

  // Delete session
  async deleteSession(sessionId, userId, userRole) {
    const session = await Session.findByPk(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Only creator or admin can delete
    if (session.creatorId !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized to delete this session');
    }
    
    await session.destroy();
    return { message: 'Session deleted successfully' };
  }
}

module.exports = new SessionService();

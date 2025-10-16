const { AttendanceRecord, Session, User } = require('../models');
const sessionService = require('./session.service');
const { isWithinRadius } = require('../utils/location');
const { Op } = require('sequelize');

class AttendanceService {
  // Submit attendance (via QR scan or manual token)
  async submitAttendance(userId, sessionId, token, userLat, userLng, isManual = false) {
    // Get session details
    const session = await Session.findByPk(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Check if session is currently active
    const now = new Date();
    if (now < session.startTime || now > session.endTime) {
      throw new Error('Session is not currently active');
    }
    
    // Verify token (QR or manual)
    try {
      sessionService.verifyQRToken(token, session.qrSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
    
    // Verify location (use session's radius or default 50m)
    const radiusMeters = session.radiusMeters || 50;
    const withinRadius = isWithinRadius(
      userLat,
      userLng,
      session.locationLat,
      session.locationLng,
      radiusMeters
    );
    
    if (!withinRadius) {
      throw new Error(`You must be within ${radiusMeters} meters of the session location`);
    }
    
    // Check for duplicate attendance
    const existing = await AttendanceRecord.findOne({
      where: {
        userId,
        sessionId,
      },
    });
    
    if (existing) {
      throw new Error('Attendance already recorded for this session');
    }
    
    // Determine status (present/late based on time)
    let status = 'present';
    const lateThreshold = new Date(session.startTime.getTime() + 15 * 60000); // 15 minutes after start
    if (now > lateThreshold) {
      status = 'late';
    }
    
    // Create attendance record
    const attendance = await AttendanceRecord.create({
      userId,
      sessionId,
      timestamp: now,
      locationLat: userLat,
      locationLng: userLng,
      status,
    });
    
    return attendance;
  }
  
  // Get attendance records for a session
  async getSessionAttendance(sessionId) {
    const attendance = await AttendanceRecord.findAll({
      where: { sessionId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['timestamp', 'ASC']],
    });
    
    return attendance;
  }
  
  // Get user's attendance history
  async getUserAttendance(userId, filters = {}) {
    const where = { userId };
    
    if (filters.sessionId) {
      where.sessionId = filters.sessionId;
    }
    
    const attendance = await AttendanceRecord.findAll({
      where,
      include: [
        {
          model: Session,
          as: 'session',
          attributes: ['id', 'name', 'startTime', 'endTime'],
        },
      ],
      order: [['timestamp', 'DESC']],
    });
    
    return attendance;
  }
  
  // Get attendance statistics for a user
  async getUserStats(userId) {
    const attendance = await AttendanceRecord.findAll({
      where: { userId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count'],
      ],
      group: ['status'],
    });
    
    const stats = {
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
    };
    
    attendance.forEach((record) => {
      const count = parseInt(record.dataValues.count);
      stats[record.status] = count;
      stats.total += count;
    });
    
    return stats;
  }
  
  // Get session statistics
  async getSessionStats(sessionId) {
    const session = await Session.findByPk(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const attendance = await AttendanceRecord.findAll({
      where: { sessionId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count'],
      ],
      group: ['status'],
    });
    
    const stats = {
      sessionId,
      sessionName: session.name,
      totalAttendees: 0,
      present: 0,
      late: 0,
      absent: 0,
    };
    
    attendance.forEach((record) => {
      const count = parseInt(record.dataValues.count);
      stats[record.status] = count;
      stats.totalAttendees += count;
    });
    
    return stats;
  }
  
  // Get attendance summary by session (for dashboard/recap)
  async getAttendanceSummary(userId = null, userRole = null) {
    const where = {};
    
    // If participant, only show their own attendance
    if (userRole === 'participant' && userId) {
      where.userId = userId;
    }
    
    const attendance = await AttendanceRecord.findAll({
      where,
      include: [
        {
          model: Session,
          as: 'session',
          attributes: ['id', 'name', 'startTime', 'endTime'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      order: [['timestamp', 'DESC']],
      limit: 50, // Recent 50 records
    });
    
    return attendance;
  }

  // Update attendance status (dosen only)
  async updateAttendanceStatus(attendanceId, newStatus, notes, updatedBy) {
    const attendance = await AttendanceRecord.findByPk(attendanceId, {
      include: [
        {
          model: Session,
          as: 'session',
        },
      ],
    });

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    // Update status
    attendance.status = newStatus;
    attendance.notes = notes || `Updated by admin: ${newStatus}`;
    attendance.updatedBy = updatedBy;
    await attendance.save();

    return attendance;
  }
}

module.exports = new AttendanceService();

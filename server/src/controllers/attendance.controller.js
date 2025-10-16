const { validationResult } = require('express-validator');
const attendanceService = require('../services/attendance.service');

// Submit attendance (scan QR or manual token)
exports.submitAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, token, locationLat, locationLng, isManual } = req.body;
    const userId = req.user.id;

    const attendance = await attendanceService.submitAttendance(
      userId,
      sessionId,
      token,
      locationLat,
      locationLng,
      isManual
    );

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance for a session (committee/admin only)
exports.getSessionAttendance = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const attendance = await attendanceService.getSessionAttendance(sessionId);

    res.status(200).json({
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's attendance history
exports.getUserAttendance = async (req, res, next) => {
  try {
    // Participants can only see their own, admin/committee can see any user
    let userId = req.user.id;
    
    if (req.params.userId && (req.user.role.name === 'admin' || req.user.role.name === 'committee')) {
      userId = req.params.userId;
    }

    const filters = {};
    if (req.query.sessionId) {
      filters.sessionId = req.query.sessionId;
    }

    const attendance = await attendanceService.getUserAttendance(userId, filters);

    res.status(200).json({
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics
exports.getUserStats = async (req, res, next) => {
  try {
    let userId = req.user.id;
    
    if (req.params.userId && (req.user.role.name === 'admin' || req.user.role.name === 'committee')) {
      userId = req.params.userId;
    }

    const stats = await attendanceService.getUserStats(userId);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

// Get session statistics
exports.getSessionStats = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const stats = await attendanceService.getSessionStats(sessionId);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

// Get attendance summary
exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role.name;

    const summary = await attendanceService.getAttendanceSummary(userId, userRole);

    res.status(200).json({
      count: summary.length,
      records: summary,
    });
  } catch (error) {
    next(error);
  }
};

// Update attendance status (dosen only)
exports.updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['present', 'late', 'absent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const attendance = await attendanceService.updateAttendanceStatus(id, status, notes, req.user.id);

    res.status(200).json({
      message: 'Attendance status updated',
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

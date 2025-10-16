const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const config = require('../config/auth');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        message: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, config.secret);
    
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name', 'permissions']
        }
      ]
    });
    
    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      message: 'Unauthorized'
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role.name !== 'admin') {
    return res.status(403).json({
      message: 'Require Admin Role!'
    });
  }
  next();
};

const isCommittee = (req, res, next) => {
  if (req.user.role.name !== 'committee' && req.user.role.name !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Dosen/Committee role required.'
    });
  }
  next();
};

const isParticipant = (req, res, next) => {
  if (req.user.role.name !== 'participant') {
    return res.status(403).json({
      message: 'Access denied. Mahasiswa/Participant role required.'
    });
  }
  next();
};

const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.role.permissions || !req.user.role.permissions.includes(permission)) {
      return res.status(403).json({
        message: `Require Permission: ${permission}`
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  isCommittee,
  isParticipant,
  hasPermission
};
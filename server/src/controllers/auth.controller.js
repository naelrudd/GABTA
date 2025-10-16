const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User, Role } = require('../models');
const config = require('../config/auth');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      role: user.role.name
    },
    config.secret,
    {
      expiresIn: config.expiresIn
    }
  );
};

exports.register = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, nim, nip, role, idType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email sudah terdaftar'
      });
    }

    // Check if NIM already exists (if provided)
    if (nim) {
      const existingNim = await User.findOne({ where: { nim } });
      if (existingNim) {
        return res.status(400).json({
          message: 'NIM sudah terdaftar'
        });
      }
    }

    // Check if NIP already exists (if provided)
    if (nip) {
      const existingNip = await User.findOne({ where: { nip } });
      if (existingNip) {
        return res.status(400).json({
          message: 'NIP sudah terdaftar'
        });
      }
    }

    // Determine role based on idType or email
    let targetRole;
    let finalNim = null;
    let finalNip = null;

    if (idType === 'nim' || email.endsWith('@students.um.ac.id')) {
      // Student - requires NIM
      if (!nim) {
        return res.status(400).json({
          message: 'NIM wajib diisi untuk mahasiswa'
        });
      }
      targetRole = await Role.findOne({ where: { name: 'participant' } });
      finalNim = nim;
    } else if (idType === 'nip') {
      // Lecturer - requires NIP
      if (!nip) {
        return res.status(400).json({
          message: 'NIP wajib diisi untuk dosen'
        });
      }
      targetRole = await Role.findOne({ where: { name: 'committee' } });
      finalNip = nip;
    } else {
      // Fallback: use role parameter or default to participant
      if (role === 'committee' || role === 'admin') {
        targetRole = await Role.findOne({ where: { name: role } });
      } else {
        targetRole = await Role.findOne({ where: { name: 'participant' } });
      }
      finalNim = nim || null;
      finalNip = nip || null;
    }

    if (!targetRole) {
      return res.status(500).json({
        message: 'Role tidak ditemukan'
      });
    }

    // Generate verification token
    const emailService = require('../services/email.service');
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours expiry

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      nim: finalNim,
      nip: finalNip,
      roleId: targetRole.id,
      isVerified: false,
      verificationToken,
      verificationExpires
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nim: user.nim,
        nip: user.nip,
        role: targetRole.name
      }, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue registration even if email fails
    }

    res.status(201).json({
      message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nim: user.nim,
        nip: user.nip,
        role: targetRole.name,
        isVerified: false
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email },
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
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi.',
        needsVerification: true,
        email: user.email
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nim: user.nim,
      nip: user.nip,
      role: user.role.name,
      isVerified: user.isVerified,
      accessToken: token
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      nim: req.user.nim,
      nip: req.user.nip,
      role: req.user.role.name,
      isVerified: req.user.isVerified,
      permissions: req.user.role.permissions
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    // Validate that at least one field is provided
    if (!firstName && !lastName) {
      return res.status(400).json({
        message: 'At least one field (firstName or lastName) is required'
      });
    }

    // Update user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        nim: updatedUser.nim,
        nip: updatedUser.nip,
        role: updatedUser.role.name
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        message: 'Token verifikasi tidak ditemukan'
      });
    }

    // Find user by verification token
    const user = await User.findOne({
      where: {
        verificationToken: token
      },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name', 'permissions']
      }]
    });

    if (!user) {
      return res.status(400).json({
        message: 'Token verifikasi tidak valid'
      });
    }

    // Check if token has expired
    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return res.status(400).json({
        message: 'Token verifikasi telah kedaluwarsa. Silakan daftar ulang.'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(200).json({
        message: 'Email sudah terverifikasi sebelumnya',
        alreadyVerified: true
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    // Send welcome email
    const emailService = require('../services/email.service');
    try {
      await emailService.sendWelcomeEmail({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    // Generate token for auto-login
    const jwt = require('jsonwebtoken');
    const config = require('../config/auth');
    const accessToken = jwt.sign(
      { 
        id: user.id,
        role: user.role.name
      },
      config.secret,
      { expiresIn: config.expiresIn }
    );

    res.status(200).json({
      message: 'Email berhasil diverifikasi! Anda akan otomatis login.',
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nim: user.nim,
        nip: user.nip,
        role: user.role.name,
        isVerified: true
      },
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email wajib diisi'
      });
    }

    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name']
      }]
    });

    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'Email sudah terverifikasi'
      });
    }

    // Generate new token
    const emailService = require('../services/email.service');
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.verificationToken = verificationToken;
    user.verificationExpires = verificationExpires;
    await user.save();

    // Resend verification email
    await emailService.sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nim: user.nim,
      nip: user.nip,
      role: user.role.name
    }, verificationToken);

    res.status(200).json({
      message: 'Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.'
    });
  } catch (error) {
    next(error);
  }
};
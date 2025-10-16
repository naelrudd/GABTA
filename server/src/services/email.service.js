const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    // Configure email transporter
    // For development, you can use services like Mailtrap, Gmail, or SendGrid
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });
  }

  /**
   * Generate verification token
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"GABTA System" <${process.env.EMAIL_USER || 'noreply@gabta.com'}>`,
      to: user.email,
      subject: 'Verifikasi Email Akun GABTA Anda',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0d6efd; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 GABTA</h1>
              <p>Sistem Presensi Berbasis Geolokasi</p>
            </div>
            <div class="content">
              <h2>Halo, ${user.firstName} ${user.lastName}!</h2>
              <p>Terima kasih telah mendaftar di GABTA. Untuk melengkapi registrasi Anda, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
              
              <center>
                <a href="${verificationUrl}" class="button" style="color: white;">Verifikasi Email Saya</a>
              </center>
              
              <p>Atau salin dan tempel link berikut di browser Anda:</p>
              <p style="background-color: #e9ecef; padding: 10px; border-radius: 3px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <p><strong>Informasi Akun Anda:</strong></p>
              <ul>
                <li>Email: ${user.email}</li>
                <li>Nama: ${user.firstName} ${user.lastName}</li>
                ${user.nim ? `<li>NIM: ${user.nim}</li>` : ''}
                ${user.nip ? `<li>NIP: ${user.nip}</li>` : ''}
                <li>Role: ${user.role === 'committee' ? '👨‍🏫 Dosen' : '👨‍🎓 Mahasiswa'}</li>
              </ul>
              
              <p style="color: #dc3545; font-weight: bold;">⚠️ Link verifikasi ini akan kedaluwarsa dalam 24 jam.</p>
              
              <p>Jika Anda tidak mendaftar akun ini, abaikan email ini.</p>
            </div>
            <div class="footer">
              <p>© 2025 GABTA - Geolocation-Based Attendance System</p>
              <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(user) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    const mailOptions = {
      from: `"GABTA System" <${process.env.EMAIL_USER || 'noreply@gabta.com'}>`,
      to: user.email,
      subject: 'Selamat Datang di GABTA!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #198754; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email Terverifikasi!</h1>
            </div>
            <div class="content">
              <h2>Selamat datang, ${user.firstName}!</h2>
              <p>Email Anda telah berhasil diverifikasi. Sekarang Anda dapat login dan mulai menggunakan sistem GABTA.</p>
              
              <center>
                <a href="${loginUrl}" class="button" style="color: white;">Login Sekarang</a>
              </center>
              
              <p><strong>Fitur yang tersedia untuk Anda:</strong></p>
              ${user.role === 'committee' ? `
                <ul>
                  <li>📝 Membuat sesi presensi baru</li>
                  <li>📊 Melihat dashboard rekap kehadiran</li>
                  <li>👥 Mengelola daftar kelas dan peserta</li>
                  <li>📥 Export data kehadiran ke Excel</li>
                  <li>✏️ Edit data kehadiran mahasiswa</li>
                </ul>
              ` : `
                <ul>
                  <li>📸 Scan QR Code untuk presensi</li>
                  <li>📍 Input kode manual untuk presensi</li>
                  <li>📊 Lihat riwayat kehadiran Anda</li>
                  <li>👤 Kelola profil akun</li>
                </ul>
              `}
              
              <p>Jika ada pertanyaan, jangan ragu untuk menghubungi administrator.</p>
            </div>
            <div class="footer">
              <p>© 2025 GABTA - Geolocation-Based Attendance System</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', user.email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error here, as it's not critical
    }
  }
}

module.exports = new EmailService();

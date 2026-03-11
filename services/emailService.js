const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter based on environment
    if (process.env.EMAIL_SERVICE === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else if (process.env.SMTP_HOST) {
      // Custom SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    } else {
      // Development mode - log to console
      console.log('⚠️  Email service not configured. OTPs will be logged to console.');
      this.transporter = null;
    }
  }

  async sendOTP(email, otp, userName) {
    if (!this.transporter) {
      // Development mode - log to console
      console.log('\n=== EMAIL OTP (Development Mode) ===');
      console.log('To:', email);
      console.log('User:', userName);
      console.log('OTP:', otp);
      console.log('Expires in: 10 minutes');
      console.log('====================================\n');
      return { success: true, mode: 'console' };
    }

    try {
      const mailOptions = {
        from: `"KGL Groceries" <${process.env.EMAIL_USER || 'noreply@kgl.co.ug'}>`,
        to: email,
        subject: 'Password Reset OTP - KGL Groceries',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #14542f 0%, #1a6b3d 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">KGL Groceries</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #14542f;">Password Reset Request</h2>
              <p>Hello ${userName},</p>
              <p>You requested to reset your password. Use the OTP code below to complete the process:</p>
              <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #14542f;">
                <h1 style="color: #14542f; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this, please ignore this email or contact support.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                KGL Groceries Ltd - Maganjo & Matugga<br>
                This is an automated message, please do not reply.
              </p>
            </div>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✓ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      // Fallback to console logging
      console.log('\n=== EMAIL OTP (Fallback) ===');
      console.log('To:', email);
      console.log('User:', userName);
      console.log('OTP:', otp);
      console.log('============================\n');
      return { success: false, error: error.message, mode: 'console' };
    }
  }

  async verifyConnection() {
    if (!this.transporter) {
      return { connected: false, mode: 'console' };
    }

    try {
      await this.transporter.verify();
      console.log('✓ Email service connected');
      return { connected: true };
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
      return { connected: false, error: error.message };
    }
  }
}

module.exports = new EmailService();

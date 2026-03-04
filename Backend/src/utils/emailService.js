const nodemailer = require('nodemailer');
const { ApiError } = require('../errors/errorHandler');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
  }

  async sendVerificationCode(to, code) {
    try {
      await this.transporter.sendMail({
        from: `"My RV Vault" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Email Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #35549B;">Verify Your Email</h2>
            <p>Thank you for registering with My RV Vault. Please use the following code to verify your email address:</p>
            <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>The My RV Vault Team</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error.message, error.code);
      throw new ApiError('Failed to send verification email', 500);
    }
  }

  async sendPasswordResetCode(to, code) {
    try {
      await this.transporter.sendMail({
        from: `"My RV Vault" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #2196F3;">Reset Your Password</h2>
            <p>We received a request to reset your password. Please use the following code:</p>
            <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>The My RV Vault Team</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error.message, error.code);
      throw new ApiError('Failed to send password reset email', 500);
    }
  }

  async sendWelcomeEmail(to, name) {
    try {
      await this.transporter.sendMail({
        from: `"My RV Vault" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Welcome to My RV Vault!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #35549B;">Welcome to My RV Vault!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for joining My RV Vault. You can now log in and start managing your RV.</p>
            <p>Best regards,<br>The My RV Vault Team</p>
          </div>
        `
      });
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error.message);
      return false;
    }
  }
}

module.exports = new EmailService();

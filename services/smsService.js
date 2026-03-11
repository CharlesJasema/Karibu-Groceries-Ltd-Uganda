const axios = require('axios');

class SMSService {
  constructor() {
    // Check if SMS service is configured
    this.apiKey = process.env.SMS_API_KEY;
    this.username = process.env.SMS_USERNAME || 'sandbox'; // Default to sandbox for testing
    this.senderId = process.env.SMS_SENDER_ID || 'KGL';
    
    if (!this.apiKey) {
      console.log('⚠️  SMS service not configured. OTPs will be logged to console.');
    }
  }

  async sendOTP(phoneNumber, otp, userName) {
    // Clean phone number (remove spaces, ensure proper format)
    let cleanPhone = phoneNumber.replace(/\s+/g, '');
    
    // Convert to international format if needed
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+256' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+256' + cleanPhone;
    }
    
    if (!this.apiKey) {
      // Development mode - log to console
      console.log('\n=== SMS OTP (Development Mode) ===');
      console.log('To:', cleanPhone);
      console.log('User:', userName);
      console.log('OTP:', otp);
      console.log('Expires in: 10 minutes');
      console.log('===================================\n');
      return { success: true, mode: 'console' };
    }

    try {
      const message = `KGL Groceries: Your password reset OTP is ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      // Africa's Talking API format - use sandbox endpoint
      const response = await axios.post(
        'https://api.sandbox.africastalking.com/version1/messaging',
        new URLSearchParams({
          username: this.username,
          to: cleanPhone,
          message: message,
          from: this.senderId
        }).toString(),
        {
          headers: {
            'apiKey': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('✓ SMS sent to:', cleanPhone);
      console.log('Response:', response.data);
      return { success: true, response: response.data };
    } catch (error) {
      console.error('❌ SMS send error:', error.message);
      if (error.response) {
        console.error('API Response:', error.response.data);
      }
      // Fallback to console logging
      console.log('\n=== SMS OTP (Fallback) ===');
      console.log('To:', cleanPhone);
      console.log('User:', userName);
      console.log('OTP:', otp);
      console.log('==========================\n');
      return { success: false, error: error.message, mode: 'console' };
    }
  }

  async verifyConnection() {
    if (!this.apiKey) {
      return { connected: false, mode: 'console' };
    }

    try {
      // Test connection by checking account balance - use sandbox endpoint
      const response = await axios.get(
        'https://api.sandbox.africastalking.com/version1/user',
        {
          params: {
            username: this.username
          },
          headers: {
            'apiKey': this.apiKey,
            'Accept': 'application/json'
          },
          timeout: 5000
        }
      );
      console.log('✓ SMS service connected (Africa\'s Talking)');
      console.log('Account:', response.data);
      return { connected: true, data: response.data };
    } catch (error) {
      console.error('❌ SMS service connection failed:', error.message);
      return { connected: false, error: error.message };
    }
  }
}

module.exports = new SMSService();

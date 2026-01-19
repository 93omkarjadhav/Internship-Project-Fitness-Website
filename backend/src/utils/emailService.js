import nodemailer from 'nodemailer';
import twilio from 'twilio';

const createTransporter = () => {
  return nodemailer.createTransport({     // ✅ FIXED HERE
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendPasswordResetSMS = async (phoneNumber, resetUrl) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`;
    }

    if (!accountSid || !authToken || !twilioPhoneNumber ||
      accountSid === 'your_account_sid_here' ||
      authToken === 'your_auth_token_here' ||
      twilioPhoneNumber === 'your_twilio_phone_number_here') {

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  TWILIO NOT CONFIGURED - SMS MOCK MODE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📞 Phone Number:', formattedPhone);
      console.log('🔗 Reset Link:', resetUrl);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return;
    }

    console.log('\n📱 Sending SMS via Twilio to:', formattedPhone);

    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      body: `FitFare Password Reset: Click here to reset your password: ${resetUrl}`,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    console.log('✅ SMS sent successfully! Message SID:', message.sid);
    return message;

  } catch (error) {
    console.error('❌ Error sending SMS:', error.message || error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    if (
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD ||
      process.env.SMTP_USER === 'your-email@gmail.com' ||
      process.env.SMTP_PASSWORD === 'your-app-password'
    ) {
      console.log('Email not configured - skipping email send');
      console.log('Reset link would be:', resetUrl);
      return;
    }

    const transporter = createTransporter();   // 👍 Works now

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@fitfare.fit',
      to: email,
      subject: 'Reset Your FitFare Password',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2>Reset Your Password</h2>
            <p>Click below to create a new password:</p>
            <a href="${resetUrl}" style="padding: 12px 30px; background: #667eea; color: white; border-radius: 5px;">
              Reset Password
            </a>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

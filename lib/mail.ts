import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'NextGen Billing - Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #5B21B6;">NextGen Billing Verification</h2>
        <p>Thank you for signing up for NextGen Billing.</p>
        <p>Your one-time password (OTP) for verification is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #7C3AED; background: #f1f5f9; display: inline-block; padding: 10px 20px; border-radius: 8px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return { success: false, error };
  }
};

export const sendPaymentStatusEmail = async (email: string, planName: string, amount: number, status: string) => {
  const isSuccess = status === "SUCCESS";
  const subject = isSuccess 
    ? 'NextGen Billing - Payment Successful' 
    : 'NextGen Billing - Payment Failed';
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: ${isSuccess ? '#10B981' : '#EF4444'};">Payment ${isSuccess ? 'Successful' : 'Failed'}</h2>
      <p>Your payment attempt for the <strong>${planName}</strong> was ${isSuccess ? 'successful' : 'unsuccessful'}.</p>
      <p>Amount: <strong>₹${amount.toLocaleString('en-IN')}</strong></p>
      ${isSuccess 
        ? '<p>Your premium features have been unlocked. You can now log in to the dashboard to start generating billing documents.</p>' 
        : '<p>Please try again or contact support if you continue facing issues.</p>'
      }
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send payment email:", error);
    return { success: false, error };
  }
};

export const sendPasswordResetOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'NextGen Billing - Password Reset Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #5B21B6;">NextGen Billing Password Reset</h2>
        <p>You have requested to reset your password.</p>
        <p>Your one-time password (OTP) for verification is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #7C3AED; background: #f1f5f9; display: inline-block; padding: 10px 20px; border-radius: 8px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email. Your password will not change.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset OTP email:", error);
    return { success: false, error };
  }
};
export const sendContactConfirmationEmail = async (email: string, firstName: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'We received your message - NextGen Billing',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #5B21B6;">Hello ${firstName},</h2>
        <p>Thank you for reaching out to NextGen Billing.</p>
        <p>This is an automated email to confirm that we have received your message. Our team is reviewing it and will get back to you within 24 hours.</p>
        <p>If you have any urgent queries, you can also reach us at support@nextgenbilling.com.</p>
        <br />
        <p>Best Regards,</p>
        <p><strong>The NextGen Billing Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send contact confirmation email:", error);
    return { success: false, error };
  }
};

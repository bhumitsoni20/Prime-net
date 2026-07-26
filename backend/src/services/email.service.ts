import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { firebaseAuth } from '../config/firebase';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendCustomVerificationEmail = async (email: string, displayName: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured. Skipping verification email.');
      return false;
    }

    const actionCodeSettings = {
      url: `${env.CLIENT_URL}/login`,
      handleCodeInApp: false,
    };
    
    // Generate the exact Firebase verification link
    const link = await firebaseAuth.generateEmailVerificationLink(email, actionCodeSettings);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body {
    background-color: #f9fafb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .header {
    background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
    padding: 40px 20px;
    text-align: center;
  }
  .logo {
    display: inline-block;
    background-color: #4f46e5;
    color: white;
    width: 48px;
    height: 48px;
    line-height: 48px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 16px;
  }
  .title {
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
  .content {
    padding: 40px 32px;
    color: #374151;
    line-height: 1.6;
    text-align: center;
  }
  .greeting {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 16px;
  }
  .button {
    display: inline-block;
    background-color: #4f46e5;
    color: #ffffff !important;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    margin: 32px 0;
  }
  .footer {
    background-color: #f3f4f6;
    padding: 24px;
    text-align: center;
    color: #6b7280;
    font-size: 12px;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">▶</div>
      <h1 class="title">Welcome to Streamkart!</h1>
    </div>
    <div class="content">
      <div class="greeting">Hi ${displayName || 'there'},</div>
      <p>Thank you for joining Streamkart &mdash; your ultimate digital subscription marketplace. We're thrilled to have you on board!</p>
      <p>Before you get started exploring and managing your subscriptions seamlessly, please verify your email address by clicking the button below.</p>
      
      <a href="${link}" class="button">Verify Email Address</a>
      
      <p style="font-size: 14px; color: #6b7280;">If you didn't create an account with us, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Streamkart. All rights reserved.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: '"Streamkart" <noreply@streamkart.com>',
      to: email,
      subject: 'Verify your email for Streamkart',
      html: htmlContent,
    });
    
    logger.info(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error(`Error sending verification email: ${error}`);
    return false;
  }
};

export const sendCustomPasswordResetEmail = async (email: string, displayName?: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured. Skipping password reset email.');
      return false;
    }

    const actionCodeSettings = {
      url: `${env.CLIENT_URL}/login`,
      handleCodeInApp: false,
    };
    
    // Generate the exact Firebase password reset link
    const link = await firebaseAuth.generatePasswordResetLink(email, actionCodeSettings);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .header { background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%); padding: 40px 20px; text-align: center; }
  .logo { display: inline-block; background-color: #4f46e5; color: white; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; font-weight: bold; font-size: 24px; margin-bottom: 16px; }
  .title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
  .content { padding: 40px 32px; color: #374151; line-height: 1.6; text-align: center; }
  .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px; }
  .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 32px 0; }
  .warning { background-color: #fef2f2; color: #991b1b; padding: 16px; border-radius: 8px; font-size: 14px; margin-top: 24px; border: 1px solid #fee2e2; }
  .footer { background-color: #f3f4f6; padding: 24px; text-align: center; color: #6b7280; font-size: 12px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">▶</div>
      <h1 class="title">Reset Your Password</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${displayName || 'there'},</div>
      <p>We received a request to reset the password for your Streamkart account. Don't worry, we've got you covered!</p>
      <p>Simply click the button below to securely set a new password and regain access to your account.</p>
      
      <a href="${link}" class="button">Reset Password</a>
      
      <div class="warning">
        <strong>Didn't request this?</strong><br>
        If you didn't ask to reset your password, please ignore this email. Your password will remain unchanged and your account is secure.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 Streamkart. All rights reserved.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: '"Streamkart" <noreply@streamkart.com>',
      to: email,
      subject: 'Reset your password for Streamkart',
      html: htmlContent,
    });
    
    logger.info(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error(`Error sending password reset email: ${error}`);
    return false;
  }
};

export const sendEmail = async (to: string, subject: string, body: string) => {
  logger.info(`[Email Placeholder] To: ${to}, Subject: ${subject}`);
  return true;
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  return sendEmail(
    email,
    'Welcome to Streamkart!',
    `Hi ${name}, welcome to Streamkart — your digital subscription marketplace!`
  );
};

export const sendOrderConfirmation = async (email: string, orderId: string) => {
  return sendEmail(
    email,
    'Order Confirmed — Streamkart',
    `Your order #${orderId} has been placed successfully.`
  );
};

export const sendRequestFulfilledEmail = async (email: string, name: string, productName: string, price: number, sellerName: string, productId: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured. Using placeholder.');
      return sendEmail(
        email,
        'Your requested product is now available on StreamKart!',
        `Hello ${name},\n\nThe product you requested is now available on StreamKart.\n\nProduct: ${productName}\nPrice: ₹${price}\nSeller: ${sellerName}\n\nClick below to purchase instantly:\n${env.CLIENT_URL}/products/${productId}`
      );
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .header { background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%); padding: 40px 20px; text-align: center; }
  .logo { display: inline-block; background-color: #4f46e5; color: white; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; font-weight: bold; font-size: 24px; margin-bottom: 16px; }
  .title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
  .content { padding: 40px 32px; color: #374151; line-height: 1.6; text-align: center; }
  .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px; }
  .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 32px 0; }
  .details-box { background-color: #f3f4f6; padding: 16px; border-radius: 8px; font-size: 14px; margin: 24px 0; border: 1px solid #e5e7eb; text-align: left; }
  .footer { background-color: #f3f4f6; padding: 24px; text-align: center; color: #6b7280; font-size: 12px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">▶</div>
      <h1 class="title">Your Request is Fulfilled!</h1>
    </div>
    <div class="content">
      <div class="greeting">Great news, ${name || 'there'}!</div>
      <p>The product you requested has been officially listed on the marketplace by a verified seller and is ready for you to purchase.</p>
      
      <div class="details-box">
        <strong>Product:</strong> ${productName}<br>
        <strong>Price:</strong> ₹${price}<br>
        <strong>Listed by:</strong> ${sellerName}
      </div>

      <p>Click the button below to complete your purchase instantly before it's gone!</p>
      
      <a href="${env.CLIENT_URL}/products/${productId}" class="button">Purchase Now</a>
      
    </div>
    <div class="footer">
      <p>&copy; 2026 Streamkart. All rights reserved.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: '"Streamkart" <noreply@streamkart.com>',
      to: email,
      subject: 'Your requested product is now available on StreamKart!',
      html: htmlContent,
    });
    
    logger.info(`Fulfillment email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error(`Error sending fulfillment email: ${error}`);
    return false;
  }
};

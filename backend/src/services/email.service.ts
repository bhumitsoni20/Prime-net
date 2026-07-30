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
  tls: {
    // Bypasses OpenSSL 3.0 DECODER routines::unsupported errors 
    // often caused by Windows Antivirus (like Kaspersky/ESET) intercepting local TLS traffic
    rejectUnauthorized: false,
  },
});

export const sendSupportTicketEmail = async (topic: string, subject: string, description: string, customerEmail: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured. Skipping support ticket email.');
      return false;
    }

    const mailOptions = {
      from: `"StreamKart Support" <${env.SMTP_USER}>`,
      to: 'creativecornerpass@gmail.com',
      replyTo: customerEmail,
      subject: `New Support Ticket: [${topic}] ${subject}`,
      html: `
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
    text-align: left;
  }
  .field {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
  }
  .field-label {
    font-size: 13px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }
  .field-value {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }
  .desc-box {
    background-color: #f3f4f6;
    padding: 20px;
    border-radius: 12px;
    font-size: 15px;
    white-space: pre-wrap;
    color: #374151;
    margin-top: 16px;
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
      <img src="${env.CLIENT_URL}/streamkart-logo-nav.png" alt="StreamKart" style="height: 56px; object-fit: contain; margin-bottom: 16px;" />
      <h1 class="title">New Support Ticket</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Customer Email</div>
        <div class="field-value"><a href="mailto:${customerEmail}" style="color: #4f46e5; text-decoration: none;">${customerEmail}</a></div>
      </div>
      <div class="field">
        <div class="field-label">Topic</div>
        <div class="field-value">${topic}</div>
      </div>
      <div class="field" style="border-bottom: none;">
        <div class="field-label">Subject</div>
        <div class="field-value">${subject}</div>
      </div>
      
      <div class="field-label" style="margin-top: 24px;">Message Details</div>
      <div class="desc-box">${description}</div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Streamkart Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Support ticket email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending support ticket email:', error);
    return false;
  }
};

export const sendCustomVerificationEmail = async (email: string, displayName: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error('SMTP credentials not configured in environment variables.');
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
      <img src="${env.CLIENT_URL}/streamkart-logo-nav.png" alt="StreamKart" style="height: 56px; object-fit: contain; margin-bottom: 16px;" />
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
  } catch (error: any) {
    logger.error(`Error sending verification email: ${error.message || error}`);
    throw new Error(error.message || 'Failed to send verification email');
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
      <img src="${env.CLIENT_URL}/streamkart-logo-nav.png" alt="StreamKart" style="height: 56px; object-fit: contain; margin-bottom: 16px;" />
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
      <img src="${env.CLIENT_URL}/streamkart-logo-nav.png" alt="StreamKart" style="height: 56px; object-fit: contain; margin-bottom: 16px;" />
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

export const sendSellerSuspensionEmail = async (email: string, name: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured. Skipping seller suspension email.');
      return false;
    }

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
    background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%);
    padding: 40px 20px;
    text-align: center;
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
      <img src="${env.CLIENT_URL}/streamkart-logo-nav.png" alt="StreamKart" style="height: 56px; object-fit: contain; margin-bottom: 16px;" />
      <h1 class="title">Action Required: Seller Account Suspended</h1>
    </div>
    <div class="content">
      <div class="greeting">Hi ${name},</div>
      <p>We are writing to inform you that your seller account has been temporarily suspended for 24 hours.</p>
      <p>This action was taken automatically because you have received more than 4 reviews with a rating of less than 3 stars. Maintaining a high quality of service is crucial to our marketplace.</p>
      <p><strong>What happens next?</strong><br/>
      After 24 hours, your account will be automatically reactivated. You will then be placed on a 10-day probation period. During this time, you must improve your ratings. If you continue to receive poor reviews during this period, your account may face further penalties.</p>
      <p>Please review your product offerings and customer service practices to ensure the best experience for our buyers.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Streamkart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: '"Streamkart Trust & Safety" <noreply@streamkart.com>',
      to: email,
      subject: 'Action Required: Your Streamkart Seller Account has been suspended',
      html: htmlContent,
    });
    
    logger.info(`Seller suspension email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error(`Error sending seller suspension email: ${error}`);
    return false;
  }
};

export const sendBundlePurchaseConfirmation = async (email: string, name: string, bundleTitle: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) return false;
    await transporter.sendMail({
      from: '"Streamkart" <noreply@streamkart.com>',
      to: email,
      subject: `Order Confirmed: ${bundleTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hi ${name}, your bundle purchase is confirmed!</h2>
          <p>You have successfully purchased <strong>${bundleTitle}</strong>.</p>
          <p>The seller has been notified and will begin delivering the credentials for each product in your bundle separately. You can track the progress in your dashboard chat.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    logger.error(`Error sending bundle purchase email: ${error}`);
    return false;
  }
};

export const sendPartialBundleDelivery = async (email: string, name: string, bundleTitle: string, productName: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) return false;
    await transporter.sendMail({
      from: '"Streamkart" <noreply@streamkart.com>',
      to: email,
      subject: `Credentials Delivered for ${productName} (Bundle: ${bundleTitle})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hi ${name},</h2>
          <p>Your credentials for <strong>${productName}</strong> have been delivered securely in your chat.</p>
          <p>Log in to your dashboard to view them.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    logger.error(`Error sending partial bundle delivery email: ${error}`);
    return false;
  }
};

export const sendBundleCompleteDelivery = async (email: string, name: string, bundleTitle: string) => {
  try {
    if (!env.SMTP_USER || !env.SMTP_PASS) return false;
    await transporter.sendMail({
      from: '"Streamkart" <noreply@streamkart.com>',
      to: email,
      subject: `Complete Bundle Delivered: ${bundleTitle}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hi ${name},</h2>
          <p>Great news! All products in your <strong>${bundleTitle}</strong> bundle have been fully delivered.</p>
          <p>You can now log in to your dashboard to access all your credentials.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    logger.error(`Error sending bundle complete delivery email: ${error}`);
    return false;
  }
};

import dotenv from 'dotenv';
dotenv.config();

// Bypass OpenSSL 3.0 DECODER routines::unsupported errors 
// caused by local Antivirus (Kaspersky/ESET) TLS interception on Windows.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  JWT_EXPIRES_IN: string;
  CLIENT_URL: string;
  ADMIN_EMAIL: string;
  SMTP_USER: string;
  SMTP_PASS: string;
}

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value !== undefined && value !== '') {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`CRITICAL: Missing required environment variable: ${key}`);
};

export const env: EnvConfig = {
  PORT: parseInt(getEnv('PORT', '5000'), 10),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  MONGODB_URI: getEnv('MONGODB_URI'),
  FIREBASE_PROJECT_ID: getEnv('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: getEnv('FIREBASE_CLIENT_EMAIL'),
  FIREBASE_PRIVATE_KEY: getEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '30d'),
  CLIENT_URL: getEnv('CLIENT_URL', 'http://localhost:5173'),
  ADMIN_EMAIL: getEnv('ADMIN_EMAIL', ''),
  SMTP_USER: getEnv('SMTP_USER', ''),
  SMTP_PASS: getEnv('SMTP_PASS', ''),
};

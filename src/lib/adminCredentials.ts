import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getStoreFilePath } from '@/lib/storePath';

function getCredentialsJsonPath(): string {
  try {
    return getStoreFilePath('admin_credentials.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'admin_credentials.json');
  }
}

function getEnvPath(): string {
  const candidates = [
    'C:/Users/PROBOOK/ATHEER-STORE/.env.local',
    path.join(process.cwd(), '.env.local'),
    path.join('C:\\Users\\PROBOOK\\ATHEER-STORE', '.env.local'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

// In-memory cache for fast lookup
let cachedAdminEmail: string | null = null;

/**
 * Hash a password using PBKDF2 with SHA-512 and a random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

/**
 * Verify a plain password against stored hash or fallback
 */
export function verifyPassword(password: string, storedHashOrPlain: string): boolean {
  if (!storedHashOrPlain || !password) return false;

  const cleanPass = password.trim();
  const cleanStored = storedHashOrPlain.trim();

  // Stored as PBKDF2 hash (supports colon or dollar delimiter)
  if (cleanStored.startsWith('pbkdf2')) {
    const delimiter = cleanStored.includes(':') ? ':' : cleanStored.includes('$') ? '$' : '_';
    const parts = cleanStored.split(delimiter);
    if (parts.length < 3) return false;
    const salt = parts[1].trim();
    const originalHash = parts[2].trim();
    if (!salt || !originalHash) return false;

    const computedHash = crypto.pbkdf2Sync(cleanPass, salt, 100000, 64, 'sha512').toString('hex');
    const bufComputed = Buffer.from(computedHash, 'hex');
    const bufOriginal = Buffer.from(originalHash, 'hex');

    if (bufComputed.length !== bufOriginal.length) return false;
    return crypto.timingSafeEqual(bufComputed, bufOriginal);
  }

  // Fallback plain-text comparison (with timing safe equal)
  const a = Buffer.from(cleanPass);
  const b = Buffer.from(cleanStored);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Get current configured admin email
 */
export function getAdminEmail(): string {
  if (process.env.ADMIN_EMAIL) {
    return process.env.ADMIN_EMAIL.trim();
  }

  // Check persisted JSON first for serverless
  try {
    const credPath = getCredentialsJsonPath();
    if (fs.existsSync(credPath)) {
      const data = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      if (data && data.email) return data.email.trim();
    }
  } catch (e) {}

  // Try reading from .env.local
  const envPath = getEnvPath();
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^ADMIN_EMAIL=([^\r\n]+)/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    } catch (e) {
      // Ignore
    }
  }

  return 'atheerxo140@gmail.com';
}

/**
 * Get current configured admin password hash / value
 */
export function getAdminPasswordHash(): string | null {
  // Check persisted JSON first for serverless
  try {
    const credPath = getCredentialsJsonPath();
    if (fs.existsSync(credPath)) {
      const data = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      if (data && data.passwordHash) return data.passwordHash.trim();
    }
  } catch (e) {}

  // Prefer process.env only if it contains the full hash with delimiter
  if (process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_PASSWORD_HASH.includes(':') || process.env.ADMIN_PASSWORD_HASH.includes('$'))) {
    return process.env.ADMIN_PASSWORD_HASH.trim();
  }

  const envPath = getEnvPath();
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const matchHash = content.match(/^ADMIN_PASSWORD_HASH=([^\r\n]+)/m);
      if (matchHash && matchHash[1]) {
        return matchHash[1].trim();
      }
      const matchPlain = content.match(/^ADMIN_PASSWORD=([^\r\n]+)/m);
      if (matchPlain && matchPlain[1]) {
        return matchPlain[1].trim();
      }
    } catch (e) {
      // Ignore
    }
  }

  if (process.env.ADMIN_PASSWORD_HASH) {
    return process.env.ADMIN_PASSWORD_HASH.trim();
  }
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD.trim();
  }

  return null;
}

/**
 * Save new admin email and password securely to .env.local
 */
export function setAdminCredentials(newEmail: string, newPassword?: string): void {
  const cleanEmail = newEmail.trim().toLowerCase();
  process.env.ADMIN_EMAIL = cleanEmail;
  cachedAdminEmail = cleanEmail;

  let passwordHash = '';
  if (newPassword && newPassword.trim().length > 0) {
    passwordHash = hashPassword(newPassword.trim());
    process.env.ADMIN_PASSWORD_HASH = passwordHash;
  }

  // Write to JSON store for serverless resilience
  try {
    const credPath = getCredentialsJsonPath();
    let currentData: any = {};
    if (fs.existsSync(credPath)) {
      try {
        currentData = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      } catch (e) {}
    }
    currentData.email = cleanEmail;
    if (passwordHash) {
      currentData.passwordHash = passwordHash;
    }
    fs.writeFileSync(credPath, JSON.stringify(currentData, null, 2), 'utf8');
  } catch (e) {}

  try {
    const envPath = getEnvPath();
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, '', 'utf8');
    }

    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update or insert ADMIN_EMAIL
    if (envContent.match(/^ADMIN_EMAIL=/m)) {
      envContent = envContent.replace(/^ADMIN_EMAIL=[^\r\n]*/m, `ADMIN_EMAIL=${cleanEmail}`);
    } else {
      envContent += `\nADMIN_EMAIL=${cleanEmail}`;
    }

    // Update or insert ADMIN_PASSWORD_HASH
    if (passwordHash) {
      if (envContent.match(/^ADMIN_PASSWORD_HASH=/m)) {
        envContent = envContent.replace(/^ADMIN_PASSWORD_HASH=[^\r\n]*/m, `ADMIN_PASSWORD_HASH=${passwordHash}`);
      } else {
        envContent += `\nADMIN_PASSWORD_HASH=${passwordHash}`;
      }
      // Remove obsolete plain text ADMIN_PASSWORD if present
      envContent = envContent.replace(/^ADMIN_PASSWORD=[^\r\n]*[\r\n]?/m, '');
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  } catch (e) {
    console.warn('[AdminCredentials] Notice: Could not write .env.local (serverless runtime)');
  }
}

const TOKEN_SECRET = process.env.SUPABASE_SECRET_KEY || 'atheer-store-super-secret-key-2026';

/**
 * Sign a secure HMAC admin session token
 */
export function signAdminToken(email: string): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${email.trim().toLowerCase()}:${timestamp}`)
    .digest('hex');
  return `ath_${timestamp}_${signature}`;
}

/**
 * Cryptographically verify an HMAC admin session token
 */
export function verifyAdminToken(token: string): boolean {
  if (!token || !token.startsWith('ath_')) return false;
  const parts = token.split('_');
  if (parts.length !== 3) return false;
  const [, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max validity 30 days
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) return false;

  const currentEmail = getAdminEmail().trim().toLowerCase();
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${currentEmail}:${timestampStr}`)
    .digest('hex');

  const bufExpected = Buffer.from(expectedSig);
  const bufActual = Buffer.from(signature);
  if (bufExpected.length !== bufActual.length) return false;
  return crypto.timingSafeEqual(bufExpected, bufActual);
}

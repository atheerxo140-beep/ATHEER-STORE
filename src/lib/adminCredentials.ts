import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ENV_PATH = path.join(process.cwd(), '.env.local');

// In-memory cache for fast lookup
let cachedAdminEmail: string | null = null;

/**
 * Hash a password using PBKDF2 with SHA-512 and a random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2$${salt}$${hash}`;
}

/**
 * Verify a plain password against stored hash or fallback
 */
export function verifyPassword(password: string, storedHashOrPlain: string): boolean {
  if (!storedHashOrPlain) return false;

  // Stored as PBKDF2 hash
  if (storedHashOrPlain.startsWith('pbkdf2$')) {
    const [, salt, originalHash] = storedHashOrPlain.split('$');
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(originalHash, 'hex'));
  }

  // Fallback plain-text comparison (with timing safe equal)
  const a = Buffer.from(password);
  const b = Buffer.from(storedHashOrPlain);
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

  // Try reading from .env.local
  if (fs.existsSync(ENV_PATH)) {
    try {
      const content = fs.readFileSync(ENV_PATH, 'utf8');
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
  if (process.env.ADMIN_PASSWORD_HASH) {
    return process.env.ADMIN_PASSWORD_HASH.trim();
  }
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD.trim();
  }

  if (fs.existsSync(ENV_PATH)) {
    try {
      const content = fs.readFileSync(ENV_PATH, 'utf8');
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

  if (!fs.existsSync(ENV_PATH)) {
    fs.writeFileSync(ENV_PATH, '', 'utf8');
  }

  let envContent = fs.readFileSync(ENV_PATH, 'utf8');

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

  fs.writeFileSync(ENV_PATH, envContent.trim() + '\n', 'utf8');
}

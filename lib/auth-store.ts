import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  password_hash?: string;
  avatar_url?: string | null;
  phone_number?: string | null;
  auth_provider: 'email' | 'google';
  verification_method?: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface SessionRecord {
  token: string;
  user_id: string;
  expires_at: number; // Unix timestamp in ms
  created_at: string;
}

export interface PasswordResetRecord {
  id: string;
  email: string;
  token: string;
  code: string; // 6-digit OTP code for easy manual entry
  expires_at: number; // Unix timestamp in ms
  used: boolean;
  created_at: string;
}

export interface UserIntegrationRecord {
  id: string;
  user_id: string;
  platform_id: string;
  status: string;
  synced_count: number;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface DatabaseSchema {
  users: Record<string, UserRecord>; // keyed by user.id
  sessions: Record<string, SessionRecord>; // keyed by token
  password_resets: Record<string, PasswordResetRecord>; // keyed by id
  user_integrations: Record<string, UserIntegrationRecord>; // keyed by id
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'auth_database.json');

// In-memory cache
let dbCache: DatabaseSchema | null = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): DatabaseSchema {
  if (dbCache) return dbCache;

  ensureDataDirectory();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(raw);
      if (!dbCache?.users) dbCache = { users: {}, sessions: {}, password_resets: {}, user_integrations: {} };
      return dbCache;
    } catch (err) {
      console.error('[AuthStore] Error reading database file, initializing empty:', err);
    }
  }

  dbCache = {
    users: {},
    sessions: {},
    password_resets: {},
    user_integrations: {},
  };
  persistDatabase(dbCache);
  return dbCache;
}

function persistDatabase(db: DatabaseSchema) {
  ensureDataDirectory();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
  try {
    fs.renameSync(tempFile, DB_FILE);
  } catch {
    // Fallback on Windows if rename encounters lock
    fs.copyFileSync(tempFile, DB_FILE);
    fs.unlinkSync(tempFile);
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, expectedKeyHex] = parts;
  try {
    const keyBuffer = Buffer.from(expectedKeyHex, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// User operations
export function findUserByEmail(email: string): UserRecord | null {
  const db = loadDatabase();
  const normalized = email.trim().toLowerCase();
  for (const user of Object.values(db.users)) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

export function findUserById(id: string): UserRecord | null {
  const db = loadDatabase();
  return db.users[id] || null;
}

export function createUser(params: {
  email: string;
  password?: string;
  name?: string;
  avatar_url?: string;
  auth_provider?: 'email' | 'google';
  email_verified?: boolean;
}): UserRecord {
  const db = loadDatabase();
  const normalizedEmail = params.email.trim().toLowerCase();

  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error('A user with this email address already exists');
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const user: UserRecord = {
    id,
    email: normalizedEmail,
    name: params.name?.trim() || normalizedEmail.split('@')[0],
    password_hash: params.password ? hashPassword(params.password) : undefined,
    avatar_url: params.avatar_url || null,
    phone_number: null,
    auth_provider: params.auth_provider || 'email',
    verification_method: null,
    email_verified: params.email_verified ?? true,
    created_at: now,
    updated_at: now,
    last_login_at: now,
  };

  db.users[id] = user;
  persistDatabase(db);
  return user;
}

export function updateUser(id: string, updates: Partial<UserRecord>): UserRecord {
  const db = loadDatabase();
  const user = db.users[id];
  if (!user) {
    throw new Error('User not found');
  }

  const updated: UserRecord = {
    ...user,
    ...updates,
    id: user.id, // Immutable
    updated_at: new Date().toISOString(),
  };

  db.users[id] = updated;
  persistDatabase(db);
  return updated;
}

// Session operations
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(userId: string): SessionRecord {
  const db = loadDatabase();
  const token = generateToken();
  const now = Date.now();

  const session: SessionRecord = {
    token,
    user_id: userId,
    expires_at: now + SESSION_TTL_MS,
    created_at: new Date().toISOString(),
  };

  db.sessions[token] = session;
  persistDatabase(db);
  return session;
}

export function getSession(token: string): { session: SessionRecord; user: UserRecord } | null {
  if (!token) return null;
  const db = loadDatabase();
  const session = db.sessions[token];
  if (!session) return null;

  if (Date.now() > session.expires_at) {
    delete db.sessions[token];
    persistDatabase(db);
    return null;
  }

  const user = db.users[session.user_id];
  if (!user) {
    delete db.sessions[token];
    persistDatabase(db);
    return null;
  }

  return { session, user };
}

export function deleteSession(token: string): void {
  const db = loadDatabase();
  if (db.sessions[token]) {
    delete db.sessions[token];
    persistDatabase(db);
  }
}

// Password reset operations
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function createPasswordReset(email: string): PasswordResetRecord {
  const db = loadDatabase();
  const normalized = email.trim().toLowerCase();
  const id = crypto.randomUUID();
  const token = generateToken();
  const code = generate6DigitCode();

  const record: PasswordResetRecord = {
    id,
    email: normalized,
    token,
    code,
    expires_at: Date.now() + RESET_TOKEN_TTL_MS,
    used: false,
    created_at: new Date().toISOString(),
  };

  db.password_resets[id] = record;
  persistDatabase(db);
  return record;
}

export function findValidReset(tokenOrCode: string): PasswordResetRecord | null {
  const db = loadDatabase();
  const query = tokenOrCode.trim();
  const now = Date.now();

  for (const reset of Object.values(db.password_resets)) {
    if (!reset.used && reset.expires_at > now) {
      if (reset.token === query || reset.code === query) {
        return reset;
      }
    }
  }
  return null;
}

export function completePasswordReset(tokenOrCode: string, newPassword: string): UserRecord {
  const reset = findValidReset(tokenOrCode);
  if (!reset) {
    throw new Error('Invalid or expired password reset code. Please request a new one.');
  }

  const user = findUserByEmail(reset.email);
  if (!user) {
    throw new Error('Associated user account was not found.');
  }

  // Update user's password
  const updatedUser = updateUser(user.id, {
    password_hash: hashPassword(newPassword),
  });

  // Invalidate reset record
  const db = loadDatabase();
  if (db.password_resets[reset.id]) {
    db.password_resets[reset.id].used = true;
    persistDatabase(db);
  }

  return updatedUser;
}

// User Integrations storage for compatibility with dashboard
export function getUserIntegrations(userId: string): UserIntegrationRecord[] {
  const db = loadDatabase();
  return Object.values(db.user_integrations).filter((item) => item.user_id === userId);
}

export function upsertUserIntegration(
  userId: string,
  platformId: string,
  data: Partial<UserIntegrationRecord>
): UserIntegrationRecord {
  const db = loadDatabase();
  const existing = Object.values(db.user_integrations).find(
    (item) => item.user_id === userId && item.platform_id === platformId
  );

  const now = new Date().toISOString();
  if (existing) {
    const updated: UserIntegrationRecord = {
      ...existing,
      ...data,
      id: existing.id,
      user_id: userId,
      platform_id: platformId,
      updated_at: now,
    };
    db.user_integrations[existing.id] = updated;
    persistDatabase(db);
    return updated;
  }

  const id = crypto.randomUUID();
  const created: UserIntegrationRecord = {
    id,
    user_id: userId,
    platform_id: platformId,
    status: data.status || 'connected',
    synced_count: data.synced_count || 0,
    settings: data.settings || {},
    created_at: now,
    updated_at: now,
  };
  db.user_integrations[id] = created;
  persistDatabase(db);
  return created;
}

import fs from 'fs';
import path from 'path';

export interface Subscriber {
  id: string;
  email: string;
  locale: string;
  subscribedAt: string;
  isActive: boolean;
}

const STORE_PATH = path.join(process.cwd(), 'src', 'data', 'subscribers_store.json');

function readSubscribers(): Subscriber[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('[subscriberService] Error reading subscribers:', e);
  }
  return [];
}

function writeSubscribers(subs: Subscriber[]) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(subs, null, 2), 'utf8');
  } catch (e) {
    console.error('[subscriberService] Error writing subscribers:', e);
  }
}

export function getAllSubscribers(): Subscriber[] {
  return readSubscribers();
}

export function addSubscriber(email: string, locale: string = 'ar'): { success: boolean; isNew: boolean } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Invalid email address');
  }

  const subs = readSubscribers();
  const existing = subs.find((s) => s.email.toLowerCase() === cleanEmail);

  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      writeSubscribers(subs);
    }
    return { success: true, isNew: false };
  }

  subs.push({
    id: `sub-${Date.now()}`,
    email: cleanEmail,
    locale,
    subscribedAt: new Date().toISOString(),
    isActive: true,
  });

  writeSubscribers(subs);
  return { success: true, isNew: true };
}

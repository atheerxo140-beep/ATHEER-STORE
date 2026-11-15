import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';

export type StaffRole = 'owner' | 'admin' | 'order_manager' | 'inventory_manager' | 'marketing_manager';

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

function getStaffStorePath(): string {
  try {
    return getStoreFilePath('staff_store.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'staff_store.json');
  }
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff-owner-01',
    email: 'atheerxo140@gmail.com',
    name: 'ATHEER Brand Owner',
    role: 'owner',
    permissions: ['all'],
    isActive: true,
    createdAt: '2026-11-14T21:00:00.000Z',
  },
  {
    id: 'staff-admin-02',
    email: 'yassinanwar140@gmail.com',
    name: 'Yassin Anwar (Operations)',
    role: 'owner',
    permissions: ['all'],
    isActive: true,
    createdAt: '2026-11-14T21:00:00.000Z',
  },
];

function readStaff(): StaffMember[] {
  try {
    const storePath = getStaffStorePath();
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
  } catch (e) {
    console.error('[staffService] Error reading staff:', e);
  }
  return DEFAULT_STAFF;
}

function writeStaff(staff: StaffMember[]) {
  try {
    const storePath = getStaffStorePath();
    fs.writeFileSync(storePath, JSON.stringify(staff, null, 2), 'utf8');
  } catch (e) {
    console.error('[staffService] Error writing staff:', e);
  }
}

export function getAllStaff(): StaffMember[] {
  return readStaff();
}

export function getStaffByEmail(email: string): StaffMember | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  return readStaff().find((s) => s.email.toLowerCase() === clean);
}

export function addStaffMember(member: Omit<StaffMember, 'id' | 'createdAt'>): StaffMember {
  const staff = readStaff();
  const existing = staff.find((s) => s.email.toLowerCase() === member.email.trim().toLowerCase());
  if (existing) {
    throw new Error('A staff member with this email already exists.');
  }

  const newStaff: StaffMember = {
    ...member,
    id: `staff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: member.email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };

  staff.push(newStaff);
  writeStaff(staff);
  return newStaff;
}

export function updateStaffMember(id: string, updates: Partial<StaffMember>): StaffMember | null {
  const staff = readStaff();
  const idx = staff.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  // Protect primary owners from deactivation or demotion
  if (
    (staff[idx].email === 'atheerxo140@gmail.com' || staff[idx].email === 'yassinanwar140@gmail.com') &&
    updates.role &&
    updates.role !== 'owner'
  ) {
    throw new Error('Primary owner account role cannot be demoted.');
  }

  staff[idx] = {
    ...staff[idx],
    ...updates,
    email: updates.email ? updates.email.trim().toLowerCase() : staff[idx].email,
  };

  writeStaff(staff);
  return staff[idx];
}

export function deleteStaffMember(id: string): boolean {
  const staff = readStaff();
  const member = staff.find((s) => s.id === id);
  if (!member) return false;

  if (member.email === 'atheerxo140@gmail.com' || member.email === 'yassinanwar140@gmail.com') {
    throw new Error('Primary brand owner account cannot be deleted.');
  }

  const filtered = staff.filter((s) => s.id !== id);
  writeStaff(filtered);
  return true;
}

export function isOwner(email: string): boolean {
  const clean = email.trim().toLowerCase();
  if (clean === 'atheerxo140@gmail.com' || clean === 'yassinanwar140@gmail.com') return true;
  const member = getStaffByEmail(clean);
  return member?.role === 'owner';
}

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { UserRole } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'university_event_hub_fallback_secret_2026';

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  // 1. Try Bearer token in Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // 2. Try cookie
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return verifyToken(cookieToken);
  }

  return null;
}

export function requireRole(allowedRoles: UserRole[], user: TokenPayload | null): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

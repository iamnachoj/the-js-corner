import { createHash, createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE_NAME = 'js_corner_admin';

function safeCompare(a, b) {
  const left = createHash('sha256').update(String(a ?? '')).digest();
  const right = createHash('sha256').update(String(b ?? '')).digest();

  return timingSafeEqual(left, right);
}

export function isPasswordValid(password) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return false;
  }

  return safeCompare(password, expectedPassword);
}

export function createAdminSessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!password || !secret) {
    return '';
  }

  return createHmac('sha256', secret).update(password).digest('hex');
}

export function hasValidAdminSession(token) {
  const expectedToken = createAdminSessionToken();

  if (!token || !expectedToken) {
    return false;
  }

  return safeCompare(token, expectedToken);
}

export function buildSessionCookie(token) {
  const baseCookie = [
    `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 12}`,
  ];

  if (process.env.NODE_ENV === 'production') {
    baseCookie.push('Secure');
  }

  return baseCookie.join('; ');
}

export function buildExpiredSessionCookie() {
  const baseCookie = [
    `${ADMIN_SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];

  if (process.env.NODE_ENV === 'production') {
    baseCookie.push('Secure');
  }

  return baseCookie.join('; ');
}
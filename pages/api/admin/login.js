import {
  buildSessionCookie,
  createAdminSessionToken,
  isPasswordValid,
} from '../../../lib/admin-auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const { password } = req.body ?? {};

  if (!isPasswordValid(password)) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = createAdminSessionToken();

  if (!token) {
    return res
      .status(500)
      .json({ message: 'Admin environment variables are not configured.' });
  }

  res.setHeader('Set-Cookie', buildSessionCookie(token));
  return res.status(200).json({ message: 'Authenticated.' });
}

import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-change-me',
    );
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

import jwt from 'jsonwebtoken';
import { query } from '../db.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'masil-dev-secret');
    const result = await query(
      `SELECT id, email, name, nickname, phone,
              apartment_id, apartment_name, building, unit,
              gps_verified, phone_verified, verification_status,
              help_count, thanks_count, manner_temp,
              role, created_at
       FROM users WHERE id = ?`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '로그인이 만료되었습니다.' });
  }
}

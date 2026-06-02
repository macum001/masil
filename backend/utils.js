import jwt from 'jsonwebtoken';

export function createToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'masil-dev-secret',
    { expiresIn: '30d' }
  );
}

export function publicUser(user) {
  if (!user) return null;
  const { password_hash, otp_code, reset_token, ...safe } = user;
  return safe;
}

export function timeAgo(createdAt) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}
import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { createToken, publicUser } from '../utils.js';

const router = express.Router();

// ── 회원가입 ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: '이메일과 비밀번호를 입력해주세요.' });

    const exists = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.rows.length > 0)
      return res.status(409).json({ success: false, message: '이미 가입된 이메일입니다.' });

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users (email, password_hash, otp_code, role, created_at, updated_at)
       VALUES (?, ?, '123456', 'user', NOW(), NOW())`,
      [email, passwordHash]
    );

    res.json({ success: true, message: 'MVP 테스트 인증번호는 123456 입니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: '회원가입 처리 중 오류가 발생했습니다.', error: error.message });
  }
});

// ── OTP 인증 ──────────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: '가입 정보를 찾을 수 없습니다.' });

    const user = result.rows[0];
    if ((otpCode || '').trim() !== (user.otp_code || '123456'))
      return res.status(400).json({ success: false, message: '인증번호가 올바르지 않습니다.' });

    await query(
      'UPDATE users SET email_verified = true, otp_code = NULL, updated_at = NOW() WHERE id = ?',
      [user.id]
    );

    const updated = await query('SELECT * FROM users WHERE id = ?', [user.id]);
    const token = createToken(updated.rows[0]);
    res.json({ success: true, access_token: token, data: publicUser(updated.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: '인증 처리 중 오류가 발생했습니다.', error: error.message });
  }
});

// ── OTP 재전송 ────────────────────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    await query('UPDATE users SET otp_code = ?, updated_at = NOW() WHERE email = ?', ['123456', email]);
    res.json({ success: true, message: 'MVP 테스트 인증번호는 123456 입니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: '인증번호 재전송 중 오류가 발생했습니다.', error: error.message });
  }
});

// ── 로그인 ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호를 확인해주세요.' });

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호를 확인해주세요.' });

    const token = createToken(user);
    res.json({ success: true, access_token: token, data: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: '로그인 처리 중 오류가 발생했습니다.', error: error.message });
  }
});

// ── 내 정보 조회 ──────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// ── 내 정보 수정 (온보딩 포함) ────────────────────────────────────────────────
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const {
      name, nickname, phone,
      apartment_id, apartment_name, building, unit,
      gps_verified, verification_status, card_issued_at, phone_verified,
    } = req.body;

    await query(
      `UPDATE users
       SET name                = COALESCE(?, name),
           nickname            = COALESCE(?, nickname),
           phone               = COALESCE(?, phone),
           apartment_id        = COALESCE(?, apartment_id),
           apartment_name      = COALESCE(?, apartment_name),
           building            = COALESCE(?, building),
           unit                = COALESCE(?, unit),
           gps_verified        = COALESCE(?, gps_verified),
           verification_status = COALESCE(?, verification_status),
           card_issued_at      = COALESCE(?, card_issued_at),
           phone_verified      = COALESCE(?, phone_verified),
           updated_at          = NOW()
       WHERE id = ?`,
      [name, nickname, phone, apartment_id, apartment_name, building, unit,
       gps_verified, verification_status, card_issued_at, phone_verified, req.user.id]
    );

    const updated = await query(
      `SELECT id, email, name, nickname, phone, apartment_id, apartment_name,
              building, unit, gps_verified, phone_verified, verification_status,
              help_count, thanks_count, manner_temp, role, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    res.json({ success: true, data: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '프로필 수정 중 오류가 발생했습니다.', error: error.message });
  }
});

// ── 계정 설정: 비밀번호 변경 (로그인 상태) ───────────────────────────────────
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: '현재 비밀번호와 새 비밀번호를 입력해주세요.' });

    const result = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const ok = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!ok)
      return res.status(400).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [hash, req.user.id]);
    res.json({ success: true, message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: '비밀번호 변경 중 오류가 발생했습니다.', error: error.message });
  }
});

// ── 계정 탈퇴 ─────────────────────────────────────────────────────────────────
router.delete('/me', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: '계정이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: '계정 삭제 중 오류가 발생했습니다.', error: error.message });
  }
});

// ── 비밀번호 재설정 요청 (이메일 발송 → MVP는 토큰 응답) ──────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = crypto.randomBytes(24).toString('hex');
    await query('UPDATE users SET reset_token = ?, updated_at = NOW() WHERE email = ?', [resetToken, email]);
    res.json({ success: true, message: '비밀번호 재설정 링크가 발송되었습니다.', resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: '비밀번호 재설정 요청 중 오류가 발생했습니다.', error: error.message });
  }
});

// ── 비밀번호 재설정 ──────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const hash = await bcrypt.hash(newPassword, 10);

    const result = await query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, updated_at = NOW() WHERE reset_token = ?',
      [hash, resetToken]
    );

    if (result.rows.affectedRows === 0)
      return res.status(400).json({ success: false, message: '재설정 토큰이 올바르지 않습니다.' });

    res.json({ success: true, message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: '비밀번호 변경 중 오류가 발생했습니다.', error: error.message });
  }
});

export default router;

import express from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ══════════════════════════════════════════════════════════════
// 내 활동 통계
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/users/me/stats
 * 도움 준 횟수, 감사 받은 수, 매너 온도, 올린 글 수
 */
router.get('/me/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 내가 올린 글 수
    const postsCount = await query(
      'SELECT COUNT(*) AS cnt FROM requests WHERE user_id = ?',
      [userId]
    );

    // 내가 신청(참여)한 글 수
    const helpedCount = await query(
      'SELECT COUNT(*) AS cnt FROM request_applications WHERE helper_user_id = ?',
      [userId]
    );

    // 실제 완료된 도움 횟수 (status=done인 요청 중 내가 helper인 것)
    const doneCount = await query(
      `SELECT COUNT(*) AS cnt
       FROM request_applications ra
       JOIN requests r ON r.id = ra.request_id
       WHERE ra.helper_user_id = ? AND r.status = 'done'`,
      [userId]
    );

    // users 테이블 캐싱 값
    const userStats = await query(
      'SELECT help_count, thanks_count, manner_temp FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        my_posts:     postsCount.rows[0].cnt,
        my_helped:    helpedCount.rows[0].cnt,
        done_count:   doneCount.rows[0].cnt,
        help_count:   userStats.rows[0].help_count,
        thanks_count: userStats.rows[0].thanks_count,
        manner_temp:  userStats.rows[0].manner_temp,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '통계를 불러오지 못했습니다.', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 알림
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/users/me/notifications
 * 내 알림 목록
 */
router.get('/me/notifications', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, body, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '알림을 불러오지 못했습니다.', error: error.message });
  }
});

/**
 * PATCH /api/users/me/notifications/:id/read
 * 알림 읽음 처리
 */
router.patch('/me/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '알림 읽음 처리 실패', error: error.message });
  }
});

/**
 * PATCH /api/users/me/notifications/read-all
 * 모든 알림 읽음 처리
 */
router.patch('/me/notifications/read-all', requireAuth, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: '알림 일괄 읽음 처리 실패', error: error.message });
  }
});

export default router;

import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ══════════════════════════════════════════════════════════════
// 채팅방 목록
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/chat/rooms
 * 내 채팅방 목록 (마지막 메시지, 상대방 정보 포함)
 */
router.get('/rooms', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT
        cr.id,
        cr.request_id,
        cr.requester_id,
        cr.helper_id,
        cr.created_at,
        r.title,
        r.category,
        r.status AS request_status,
        requester.nickname  AS requester_nickname,
        requester.name      AS requester_name,
        helper.nickname     AS helper_nickname,
        helper.name         AS helper_name,
        (
          SELECT cm.message
          FROM chat_messages cm
          WHERE cm.room_id = cr.id
          ORDER BY cm.id DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT cm.created_at
          FROM chat_messages cm
          WHERE cm.room_id = cr.id
          ORDER BY cm.id DESC
          LIMIT 1
        ) AS last_message_at,
        (
          SELECT COUNT(*)
          FROM chat_messages cm
          WHERE cm.room_id = cr.id
        ) AS message_count
      FROM chat_rooms cr
      LEFT JOIN requests  r         ON r.id  = cr.request_id
      LEFT JOIN users     requester ON requester.id = cr.requester_id
      LEFT JOIN users     helper    ON helper.id    = cr.helper_id
      WHERE cr.requester_id = ? OR cr.helper_id = ?
      ORDER BY COALESCE(last_message_at, cr.created_at) DESC`,
      [userId, userId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '채팅방 목록 조회 실패', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 메시지 목록
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/chat/messages/:roomId
 * 특정 채팅방의 메시지 목록
 */
router.get('/messages/:roomId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    // 참여자 확인
    const [roomCheck] = await pool.query(
      'SELECT id FROM chat_rooms WHERE id = ? AND (requester_id = ? OR helper_id = ?)',
      [roomId, userId, userId]
    );
    if (roomCheck.length === 0)
      return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' });

    const [rows] = await pool.query(
      `SELECT
        cm.id,
        cm.room_id,
        cm.sender_id,
        cm.message,
        cm.created_at,
        u.nickname AS sender_nickname,
        u.name     AS sender_name
      FROM chat_messages cm
      LEFT JOIN users u ON u.id = cm.sender_id
      WHERE cm.room_id = ?
      ORDER BY cm.id ASC`,
      [roomId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '메시지 조회 실패', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 메시지 전송
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/chat/messages
 * body: { room_id, message }
 */
router.post('/messages', requireAuth, async (req, res) => {
  try {
    const { room_id, message } = req.body;
    const senderId = req.user.id;

    if (!room_id || !message?.trim())
      return res.status(400).json({ success: false, message: 'room_id와 message가 필요합니다.' });

    // 참여자 확인
    const [roomCheck] = await pool.query(
      'SELECT id FROM chat_rooms WHERE id = ? AND (requester_id = ? OR helper_id = ?)',
      [room_id, senderId, senderId]
    );
    if (roomCheck.length === 0)
      return res.status(403).json({ success: false, message: '해당 채팅방에 참여할 권한이 없습니다.' });

    const [result] = await pool.query(
      'INSERT INTO chat_messages (room_id, sender_id, message, created_at) VALUES (?, ?, ?, NOW())',
      [room_id, senderId, message.trim()]
    );

    const [rows] = await pool.query(
      `SELECT cm.id, cm.room_id, cm.sender_id, cm.message, cm.created_at,
              u.nickname AS sender_nickname, u.name AS sender_name
       FROM chat_messages cm
       LEFT JOIN users u ON u.id = cm.sender_id
       WHERE cm.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '메시지 저장 실패', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 채팅방 생성 / 조회
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/chat/rooms
 * body: { request_id, helper_id }
 * 이미 있으면 기존 반환, 없으면 생성
 */
router.post('/rooms', requireAuth, async (req, res) => {
  try {
    const { request_id, helper_id } = req.body;
    const requesterId = req.user.id;

    if (!request_id || !helper_id)
      return res.status(400).json({ success: false, message: 'request_id와 helper_id가 필요합니다.' });

    const [existing] = await pool.query(
      'SELECT id FROM chat_rooms WHERE request_id = ? AND requester_id = ? AND helper_id = ?',
      [request_id, requesterId, helper_id]
    );
    if (existing.length > 0)
      return res.json({ success: true, data: { id: existing[0].id } });

    const [result] = await pool.query(
      'INSERT INTO chat_rooms (request_id, requester_id, helper_id, created_at) VALUES (?, ?, ?, NOW())',
      [request_id, requesterId, helper_id]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: '채팅방 생성 실패', error: error.message });
  }
});

/**
 * GET /api/chat/rooms/:roomId
 * 채팅방 상세 (참여자 정보 + 연결된 요청글)
 */
router.get('/rooms/:roomId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT cr.*, r.title, r.category, r.status AS request_status,
              r.gratitude_type,
              req_u.nickname AS requester_nickname, req_u.name AS requester_name,
              hlp_u.nickname AS helper_nickname,    hlp_u.name AS helper_name
       FROM chat_rooms cr
       LEFT JOIN requests r    ON r.id  = cr.request_id
       LEFT JOIN users req_u   ON req_u.id = cr.requester_id
       LEFT JOIN users hlp_u   ON hlp_u.id = cr.helper_id
       WHERE cr.id = ? AND (cr.requester_id = ? OR cr.helper_id = ?)`,
      [req.params.roomId, userId, userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: '채팅방을 찾을 수 없습니다.' });

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '채팅방 조회 실패', error: error.message });
  }
});

export default router;

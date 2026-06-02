import express from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { timeAgo } from '../utils.js';

const router = express.Router();

function toClient(row) {
  return { ...row, time_ago: timeAgo(row.created_at) };
}

// ══════════════════════════════════════════════════════════════
// 공개 목록 / 검색
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/requests
 * 요청글 목록
 * query: category, post_type, search, status, limit, offset
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const {
      category,
      post_type,
      search,
      status,
      limit = 50,
      offset = 0,
    } = req.query;

    const conditions = [];
    const params = [];

    if (category && category !== 'all') {
      conditions.push('r.category = ?');
      params.push(category);
    }
    if (post_type && post_type !== 'all') {
      conditions.push('r.post_type = ?');
      params.push(post_type);
    }
    if (status && status !== 'all') {
      conditions.push('r.status = ?');
      params.push(status);
    }
    // 검색: 제목 또는 내용에서 키워드 검색
    if (search && search.trim()) {
      conditions.push('(r.title LIKE ? OR r.content LIKE ?)');
      const kw = `%${search.trim()}%`;
      params.push(kw, kw);
    }

    const meRow = await query('SELECT apartment_id FROM users WHERE id = ?', [req.user.id]);
    const myAptId = meRow.rows[0]?.apartment_id;

    if (myAptId) {
      conditions.push('author.apartment_id = ?');
      params.push(myAptId);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const result = await query(
      `SELECT r.*,
              author.nickname, author.name, author.apartment_name
       FROM requests r
       LEFT JOIN users author ON author.id = r.user_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      params
    );
    

    res.json({ success: true, data: result.rows.map(toClient) });
  } catch (error) {
    res.status(500).json({ success: false, message: '요청 목록을 불러오지 못했습니다.', error: error.message });
  }
});

/**
 * GET /api/requests/my/posts
 * 내가 올린 글 목록
 */
router.get('/my/posts', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, u.nickname, u.name, u.apartment_name
       FROM requests r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows.map(toClient) });
  } catch (error) {
    res.status(500).json({ success: false, message: '내 글 목록을 불러오지 못했습니다.', error: error.message });
  }
});

/**
 * GET /api/requests/my/helped
 * 내가 도움을 준 글 목록 (도움 신청 + 완료된 것)
 */
router.get('/my/helped', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, u.nickname, u.name, u.apartment_name,
              ra.created_at AS applied_at, ra.status AS apply_status
       FROM request_applications ra
       JOIN requests r ON r.id = ra.request_id
       LEFT JOIN users u ON u.id = r.user_id
       WHERE ra.helper_user_id = ?
       ORDER BY ra.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows.map(toClient) });
  } catch (error) {
    res.status(500).json({ success: false, message: '참여한 글 목록을 불러오지 못했습니다.', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 단일 조회
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/requests/:id
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, u.nickname, u.name, u.apartment_name
       FROM requests r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: '요청글을 찾을 수 없습니다.' });

    // 신청자 목록도 함께 반환
    const applications = await query(
      `SELECT ra.id, ra.status, ra.message, ra.created_at,
              u.id AS user_id, u.nickname, u.name
       FROM request_applications ra
       JOIN users u ON u.id = ra.helper_user_id
       WHERE ra.request_id = ?
       ORDER BY ra.created_at ASC`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...toClient(result.rows[0]),
        applications: applications.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '요청 상세를 불러오지 못했습니다.', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 요청글 생성
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/requests
 * body: post_type, title, category, content, location, time, gratitude_type, image_url
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      post_type = 'request',
      title,
      category,
      content,
      location,
      time,
      gratitude_type,
      image_url,
    } = req.body;

    if (!title || !category)
      return res.status(400).json({ success: false, message: '제목과 카테고리를 입력해주세요.' });

    const insertResult = await query(
      `INSERT INTO requests
         (user_id, post_type, title, category, content,
          location_text, location_range, preferred_time,
          gratitude_type, image_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting', NOW(), NOW())`,
      [
        req.user.id,
        post_type || 'request',
        title,
        category,
        content || '',
        location || '단지 전체',
        location || '단지 전체',
        time || '시간 협의',
        gratitude_type || null,
        image_url || null,
      ]
    );

    const newId = insertResult.rows.insertId;
    const result = await query(
      `SELECT r.*, u.nickname, u.name, u.apartment_name
       FROM requests r LEFT JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
      [newId]
    );

    res.status(201).json({ success: true, data: toClient(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: '요청 등록에 실패했습니다.', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 요청글 수정
// ══════════════════════════════════════════════════════════════

/**
 * PATCH /api/requests/:id
 */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { title, category, content, location, time, gratitude_type, image_url } = req.body;

    const updateResult = await query(
      `UPDATE requests
       SET title          = COALESCE(?, title),
           category       = COALESCE(?, category),
           content        = COALESCE(?, content),
           location_text  = COALESCE(?, location_text),
           location_range = COALESCE(?, location_range),
           preferred_time = COALESCE(?, preferred_time),
           gratitude_type = COALESCE(?, gratitude_type),
           image_url      = COALESCE(?, image_url),
           updated_at     = NOW()
       WHERE id = ? AND user_id = ?`,
      [title, category, content, location, location, time, gratitude_type, image_url,
       req.params.id, req.user.id]
    );

    if (updateResult.rows.affectedRows === 0)
      return res.status(404).json({ success: false, message: '수정할 요청글을 찾을 수 없습니다.' });

    const result = await query(
      `SELECT r.*, u.nickname, u.name, u.apartment_name
       FROM requests r LEFT JOIN users u ON u.id = r.user_id
       WHERE r.id = ?`,
      [req.params.id]
    );

    res.json({ success: true, data: toClient(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: '요청글 수정에 실패했습니다.', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 상태 변경
// ══════════════════════════════════════════════════════════════

/**
 * PATCH /api/requests/:id/status
 * body: { status: 'waiting'|'connecting'|'done'|'closed' }
 */
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['waiting', 'connecting', 'done', 'closed'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: '상태값이 올바르지 않습니다.' });

    // 내 글인지 확인
    const own = await query('SELECT user_id, status FROM requests WHERE id = ?', [req.params.id]);
    if (own.rows.length === 0)
      return res.status(404).json({ success: false, message: '요청글을 찾을 수 없습니다.' });
    if (own.rows[0].user_id !== req.user.id)
      return res.status(403).json({ success: false, message: '본인 글만 변경할 수 있습니다.' });

    const alreadyDone = own.rows[0].status === 'done';

    // 상태 업데이트
    await query(
      'UPDATE requests SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );

    // done으로 "처음" 전환될 때만 통계 증가 (중복 방지)
    if (status === 'done' && !alreadyDone) {
      // helper 찾기 (applied 또는 done 둘 다 허용)
      const helperRow = await query(
        'SELECT helper_user_id FROM request_applications WHERE request_id = ? ORDER BY id ASC LIMIT 1',
        [req.params.id]
      );
      if (helperRow.rows.length > 0) {
        const helperId = helperRow.rows[0].helper_user_id;
        // 도와준 사람: 도움횟수 +1, 감사받은수 +1, 매너온도 +0.5
        await query(
          'UPDATE users SET help_count = help_count + 1, thanks_count = thanks_count + 1, manner_temp = LEAST(manner_temp + 0.5, 99.9), updated_at = NOW() WHERE id = ?',
          [helperId]
        );
        // 신청 완료 처리
        await query(
          "UPDATE request_applications SET status = 'done' WHERE request_id = ?",
          [req.params.id]
        );
        // 알림
        await query(
          'INSERT INTO notifications (user_id, title, body, created_at) VALUES (?, ?, ?, NOW())',
          [helperId, '감사 인사가 도착했어요! 🙏', '도움이 완료되어 매너온도가 0.5도 올랐어요.']
        );
      }
    }

    const result = await query('SELECT * FROM requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: toClient(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: '상태 변경에 실패했습니다.', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 도움 신청
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/requests/:id/applications
 * body: { message }
 */
router.post('/:id/applications', requireAuth, async (req, res) => {
  try {
    const { message = '' } = req.body;

    // 중복 신청 방지
    const dupCheck = await query(
      'SELECT id FROM request_applications WHERE request_id = ? AND helper_user_id = ?',
      [req.params.id, req.user.id]
    );
    if (dupCheck.rows.length > 0)
      return res.status(409).json({ success: false, message: '이미 도움 신청을 했습니다.' });

    // 요청자 정보 조회
    const requestInfo = await query('SELECT user_id FROM requests WHERE id = ?', [req.params.id]);
    if (requestInfo.rows.length === 0)
      return res.status(404).json({ success: false, message: '요청글을 찾을 수 없습니다.' });

    // 본인 글에는 신청 불가
    if (requestInfo.rows[0].user_id === req.user.id)
      return res.status(400).json({ success: false, message: '본인 글에는 도움 신청할 수 없습니다.' });

    const insertResult = await query(
      `INSERT INTO request_applications (request_id, helper_user_id, message, status, created_at)
       VALUES (?, ?, ?, 'applied', NOW())`,
      [req.params.id, req.user.id, message]
    );

    // 채팅방 생성 (없으면)
    const existingRoom = await query(
      'SELECT id FROM chat_rooms WHERE request_id = ? AND helper_id = ? LIMIT 1',
      [req.params.id, req.user.id]
    );

    let chatRoomId = null;
    if (existingRoom.rows.length === 0) {
      const roomResult = await query(
        'INSERT INTO chat_rooms (request_id, requester_id, helper_id, created_at) VALUES (?, ?, ?, NOW())',
        [req.params.id, requestInfo.rows[0].user_id, req.user.id]
      );
      chatRoomId = roomResult.rows.insertId;
    } else {
      chatRoomId = existingRoom.rows[0].id;
    }

    // 요청 상태 → connecting
    await query(
      'UPDATE requests SET status = ?, updated_at = NOW() WHERE id = ?',
      ['connecting', req.params.id]
    );

    // 요청자에게 알림 저장
    await query(
      `INSERT INTO notifications (user_id, title, body, created_at)
       VALUES (?, ?, ?, NOW())`,
      [
        requestInfo.rows[0].user_id,
        '도움 신청이 왔어요!',
        `${req.user.nickname || req.user.name || '이웃'}님이 도움을 신청했습니다.`,
      ]
    );

    res.status(201).json({ success: true, data: { id: insertResult.rows.insertId, chat_room_id: chatRoomId } });
  } catch (error) {
    res.status(500).json({ success: false, message: '도움 신청에 실패했습니다.', error: error.message });
  }
});

// ══════════════════════════════════════════════════════════════
// 요청글 삭제
// ══════════════════════════════════════════════════════════════

/**
 * DELETE /api/requests/:id
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM requests WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.rows.affectedRows === 0)
      return res.status(404).json({ success: false, message: '삭제할 요청글을 찾을 수 없습니다.' });

    res.json({ success: true, message: '요청글이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ success: false, message: '요청글 삭제에 실패했습니다.', error: error.message });
  }
});

export default router;

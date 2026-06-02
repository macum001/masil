import express from 'express';
import { query } from '../db.js';

const router = express.Router();

/**
 * GET /api/apartments?query=검색어
 * 아파트 검색 (이름 또는 주소)
 * - 검색어 없으면 전체 목록 (최대 50개)
 * - MySQL은 LIKE가 기본적으로 대소문자 무시
 */
router.get('/', async (req, res) => {
  try {
    const keyword = (req.query.query || '').trim();

    let result;
    if (!keyword) {
      result = await query(
        `SELECT id, name, address, household_count, lat, lng
         FROM apartments
         ORDER BY name ASC
         LIMIT 50`,
        []
      );
    } else {
      const like = `%${keyword}%`;
      result = await query(
        `SELECT id, name, address, household_count, lat, lng
         FROM apartments
         WHERE name LIKE ? OR address LIKE ?
         ORDER BY name ASC
         LIMIT 50`,
        [like, like]
      );
    }

    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '아파트 검색에 실패했습니다.', error: error.message });
  }
});

/**
 * GET /api/apartments/:id
 * 특정 아파트 상세 조회
 */
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, address, household_count, lat, lng FROM apartments WHERE id = ?',
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: '아파트를 찾을 수 없습니다.' });

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: '아파트 조회에 실패했습니다.', error: error.message });
  }
});

export default router;

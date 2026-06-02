import express from 'express';
import { query } from '../db.js';

const router = express.Router();

const KAKAO_REST_KEY = process.env.KAKAO_REST_KEY || '';

router.get('/search', async (req, res) => {
  try {
    const keyword = (req.query.query || '').trim();
    if (!keyword) return res.json({ success: true, data: [] });
    if (!KAKAO_REST_KEY) {
      return res.status(500).json({ success: false, message: '카카오 API 키가 설정되지 않았습니다.' });
    }

    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=15`;
    const kakaoRes = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
    });
    const kakaoData = await kakaoRes.json();

    if (!kakaoRes.ok) {
      return res.status(500).json({ success: false, message: '카카오 검색 실패', error: kakaoData });
    }

    const results = (kakaoData.documents || []).map((doc) => ({
      id: `kakao_${doc.id}`,
      kakao_id: doc.id,
      name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      lat: Number(doc.y),
      lng: Number(doc.x),
      category: doc.category_group_name || '',
    }));

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: '주소 검색에 실패했습니다.', error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { kakao_id, name, address, lat, lng } = req.body;
    if (!name) return res.status(400).json({ success: false, message: '아파트 이름이 필요합니다.' });

    let existing;
    if (kakao_id) {
      existing = await query('SELECT id FROM apartments WHERE kakao_id = ? LIMIT 1', [kakao_id]);
    } else {
      existing = await query('SELECT id FROM apartments WHERE name = ? AND address = ? LIMIT 1', [name, address || '']);
    }
    if (existing.rows.length > 0) {
      return res.json({ success: true, data: { id: existing.rows[0].id } });
    }

    const result = await query(
      'INSERT INTO apartments (name, address, lat, lng, kakao_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, address || '', lat || null, lng || null, kakao_id || null]
    );
    res.json({ success: true, data: { id: result.rows.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: '아파트 등록에 실패했습니다.', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const keyword = (req.query.query || '').trim();
    let result;
    if (!keyword) {
      result = await query(
        `SELECT id, name, address, household_count, lat, lng FROM apartments ORDER BY name ASC LIMIT 50`,
        []
      );
    } else {
      const like = `%${keyword}%`;
      result = await query(
        `SELECT id, name, address, household_count, lat, lng FROM apartments WHERE name LIKE ? OR address LIKE ? ORDER BY name ASC LIMIT 50`,
        [like, like]
      );
    }
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: '아파트 검색에 실패했습니다.', error: error.message });
  }
});

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
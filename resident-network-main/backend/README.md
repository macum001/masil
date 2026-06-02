# Masil Backend 설치 및 실행 가이드

## 1. DB 준비 (MySQL 8.0+)

```sql
CREATE DATABASE masil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. 스키마 + 시드 데이터 적용

```bash
mysql -u root -p masil < sql/schema.sql
mysql -u root -p masil < sql/seed.sql
```

## 3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일 수정 (DB_PASSWORD, JWT_SECRET 반드시 변경)
```

## 4. 패키지 설치 및 실행

```bash
npm install
npm run dev   # 개발 서버
npm start     # 프로덕션
```

---

## API 엔드포인트 전체 목록

### 인증 (`/api/auth`)
| Method | Path | 설명 |
|--------|------|------|
| POST | /register | 회원가입 |
| POST | /verify-otp | 이메일 OTP 인증 |
| POST | /resend-otp | OTP 재전송 |
| POST | /login | 로그인 |
| GET  | /me | 내 정보 조회 |
| PATCH | /me | 내 정보 수정 (온보딩 포함) |
| POST | /change-password | 비밀번호 변경 (로그인 상태) |
| DELETE | /me | 회원 탈퇴 |
| POST | /forgot-password | 비밀번호 재설정 요청 |
| POST | /reset-password | 비밀번호 재설정 |

### 요청글 (`/api/requests`)
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 목록 (category, post_type, search, status 필터) |
| GET | /my/posts | 내가 올린 글 |
| GET | /my/helped | 내가 참여한 글 |
| GET | /:id | 단일 조회 (신청자 목록 포함) |
| POST | / | 글 작성 |
| PATCH | /:id | 글 수정 |
| PATCH | /:id/status | 상태 변경 |
| POST | /:id/applications | 도움 신청 (채팅방 자동 생성) |
| DELETE | /:id | 글 삭제 |

### 채팅 (`/api/chat`)
| Method | Path | 설명 |
|--------|------|------|
| GET | /rooms | 내 채팅방 목록 |
| GET | /rooms/:roomId | 채팅방 상세 |
| POST | /rooms | 채팅방 생성/조회 |
| GET | /messages/:roomId | 메시지 목록 |
| POST | /messages | 메시지 전송 |

### 아파트 (`/api/apartments`)
| Method | Path | 설명 |
|--------|------|------|
| GET | / | 검색 (?query=검색어) |
| GET | /:id | 단일 조회 |

### 사용자 활동 (`/api/users`)
| Method | Path | 설명 |
|--------|------|------|
| GET | /me/stats | 도움준횟수, 감사받은수, 매너온도 |
| GET | /me/notifications | 알림 목록 |
| PATCH | /me/notifications/:id/read | 알림 읽음 |
| PATCH | /me/notifications/read-all | 전체 읽음 |

### 파일 업로드
| Method | Path | 설명 |
|--------|------|------|
| POST | /api/upload | 이미지 업로드 (multipart, images[]) |

---

## 프론트엔드 교체 파일

| 파일명 | 교체 위치 |
|--------|----------|
| `frontend_services_api.js` | `src/services/api.js` |
| `frontend_MyComplex.jsx` | `src/pages/MyComplex.jsx` |
| `frontend_Together.jsx` | `src/pages/Together.jsx` |
| `frontend_Home.jsx` | `src/pages/Home.jsx` |

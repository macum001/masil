# 마실 | 우리 단지 부탁해

마실은 아파트 주민들이 서로 산책, 전달, 장보기, 돌봄, 나눔 같은 생활 도움을 요청하고 연결되는 주민 커뮤니티 앱입니다.

## jp 개발 방향

- 프론트엔드는 Vite + React 기준으로 구성했습니다.
- 백엔드는 Express + PostgreSQL 기준으로 새로 추가했습니다.
- 데이터 저장은 PostgreSQL 기준으로 설계했습니다.
- 배포는 Render에서 먼저 테스트하고, 이후 가비아 VPS 또는 AWS로 이전할 수 있게 구성했습니다.
- 특정 빌더 전용 SDK나 전용 DB에 의존하지 않도록 정리했습니다.

## 폴더 구조

```txt
resident-network-main
├── backend
│   ├── server.js
│   ├── db.js
│   ├── middleware
│   ├── routes
│   └── sql
├── src
│   ├── api
│   ├── services
│   ├── pages
│   ├── components
│   └── lib
├── index.html
├── package.json
└── vite.config.js
```

## 프론트 실행

```bash
npm install
npm run dev
```

브라우저에서 확인:

```txt
http://localhost:5173
```

## 백엔드 실행

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

브라우저에서 확인:

```txt
http://localhost:4000/health
```

## DB 생성 순서

PostgreSQL DB를 만든 뒤 아래 SQL을 순서대로 실행합니다.

```txt
backend/sql/schema.sql
backend/sql/seed.sql
```

## 프론트 환경변수

프로젝트 루트에 `.env.local` 파일을 만들고 아래처럼 입력합니다.

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

Render 배포 후에는 백엔드 주소로 변경합니다.

```env
VITE_API_BASE_URL=https://masil-backend.onrender.com/api
```

## Render 배포 구조

1. PostgreSQL 생성
2. backend를 Web Service로 배포
3. frontend를 Static Site로 배포
4. frontend 환경변수에 백엔드 API 주소 입력

## 테스트 계정 흐름

회원가입 후 인증번호는 MVP 테스트용으로 `123456`을 사용합니다.

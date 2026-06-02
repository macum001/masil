# jp 배포 순서

## 1. 로컬에서 프론트 실행

```bash
npm install
npm run dev
```

브라우저에서 확인합니다.

```txt
http://localhost:5173
```

## 2. 로컬에서 백엔드 실행

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

브라우저에서 확인합니다.

```txt
http://localhost:4000/health
```

## 3. Render PostgreSQL 만들기

Render Dashboard에서 New + 버튼을 누릅니다.

```txt
New +
PostgreSQL
```

DB 생성 후 External Database URL 또는 Internal Database URL을 복사합니다.

## 4. DB 테이블 만들기

Render PostgreSQL 접속 정보로 SQL을 실행합니다.

먼저 실행:

```txt
backend/sql/schema.sql
```

그다음 실행:

```txt
backend/sql/seed.sql
```

## 5. Render 백엔드 만들기

Render Dashboard에서 New + 버튼을 누릅니다.

```txt
New +
Web Service
```

GitHub 저장소를 선택합니다.

설정값은 아래처럼 입력합니다.

```txt
Name: masil-backend
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Environment Variables에 아래를 넣습니다.

```txt
NODE_ENV=production
DATABASE_URL=Render PostgreSQL 주소
JWT_SECRET=긴 비밀키 입력
FRONTEND_URL=https://resident-network.onrender.com
```

배포 후 아래 주소가 열리면 성공입니다.

```txt
https://masil-backend.onrender.com/health
```

## 6. Render 프론트 환경변수 수정

프론트 Static Site 설정으로 이동합니다.

```txt
Environment
Add Environment Variable
```

아래 값을 넣습니다.

```txt
VITE_API_BASE_URL=https://masil-backend.onrender.com/api
```

그다음 Manual Deploy를 누릅니다.

## 7. 기능 테스트

1. 회원가입
2. 인증번호 123456 입력
3. 로그인
4. 홈 화면 진입
5. 이웃과 연결하기 클릭
6. 글 작성
7. 홈 목록에 새 글 표시 확인
8. 새로고침 후 글이 유지되는지 확인

새로고침 후 글이 남아 있으면 DB 연결이 된 것입니다.

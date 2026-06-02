-- =============================================
-- Masil (마실) Database Schema - MySQL 8.0+
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  email_verified      BOOLEAN DEFAULT FALSE,
  otp_code            VARCHAR(20),
  reset_token         TEXT,
  name                VARCHAR(100),
  nickname            VARCHAR(100),
  phone               VARCHAR(30),
  apartment_id        INT,
  apartment_name      VARCHAR(150),
  building            VARCHAR(50),
  unit                VARCHAR(50),
  gps_verified        BOOLEAN DEFAULT FALSE,
  phone_verified      BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(30) DEFAULT 'pending',
  card_issued_at      DATETIME,
  role                VARCHAR(30) DEFAULT 'user',
  -- 활동 통계 (실시간 집계 대신 캐싱)
  help_count          INT DEFAULT 0,
  thanks_count        INT DEFAULT 0,
  manner_temp         DECIMAL(4,1) DEFAULT 36.5,
  created_at          DATETIME DEFAULT NOW(),
  updated_at          DATETIME DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE IF NOT EXISTS apartments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  address         TEXT NOT NULL,
  household_count INT,
  lat             DECIMAL(10, 7),
  lng             DECIMAL(10, 7),
  created_at      DATETIME DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT,
  post_type       VARCHAR(30) DEFAULT 'request',
  title           VARCHAR(200) NOT NULL,
  category        VARCHAR(50) NOT NULL,
  content         TEXT,
  location_text   VARCHAR(200),
  location_range  VARCHAR(100),
  preferred_time  VARCHAR(100),
  gratitude_type  VARCHAR(30),
  image_url       TEXT,
  status          VARCHAR(30) DEFAULT 'waiting',
  created_at      DATETIME DEFAULT NOW(),
  updated_at      DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS request_applications (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  request_id     INT,
  helper_user_id INT,
  message        TEXT,
  status         VARCHAR(30) DEFAULT 'applied',
  created_at     DATETIME DEFAULT NOW(),
  FOREIGN KEY (request_id)     REFERENCES requests(id) ON DELETE CASCADE,
  FOREIGN KEY (helper_user_id) REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_rooms (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  request_id   INT,
  requester_id INT NOT NULL,
  helper_id    INT NOT NULL,
  created_at   DATETIME DEFAULT NOW(),
  FOREIGN KEY (request_id)   REFERENCES requests(id) ON DELETE SET NULL,
  FOREIGN KEY (requester_id) REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (helper_id)    REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  room_id    INT NOT NULL,
  sender_id  INT NOT NULL,
  message    TEXT NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (room_id)   REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_requests_created_at   ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_category      ON requests(category);
CREATE INDEX IF NOT EXISTS idx_requests_user_id       ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_post_type     ON requests(post_type);
CREATE INDEX IF NOT EXISTS idx_req_apps_request_id    ON request_applications(request_id);
CREATE INDEX IF NOT EXISTS idx_req_apps_helper_id     ON request_applications(helper_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_req_id      ON chat_rooms(request_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id  ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON notifications(user_id);

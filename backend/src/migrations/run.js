const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

const SQL = `
CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'todo_app'}\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`${process.env.DB_NAME || 'todo_app'}\`;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(50)  NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(72)  NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  token_hash VARCHAR(64)  NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_rt_user (user_id),
  KEY idx_rt_expires (expires_at),
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS todos (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  priority    ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  completed   TINYINT(1)    NOT NULL DEFAULT 0,
  due_date    DATETIME,
  tags        JSON,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Index strategies:
  -- 1. User + completion status  -> paginated list filters
  KEY idx_todos_user_completed (user_id, completed),
  -- 2. User + priority           -> priority filter
  KEY idx_todos_user_priority  (user_id, priority),
  -- 3. User + due_date           -> due-date sorting/filtering
  KEY idx_todos_user_due       (user_id, due_date),
  -- 4. Full-text on title+desc   -> search
  FULLTEXT KEY ft_todos_search (title, description),

  CONSTRAINT fk_todos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

async function run() {
  const conn = await mysql.createConnection(config);
  try {
    console.log('Running migrations…');
    await conn.query(SQL);
    console.log('✅  Migrations complete');
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});

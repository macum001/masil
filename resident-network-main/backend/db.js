import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'masil',
  port:             Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
});

/**
 * PostgreSQL 스타일 $1, $2... 를 MySQL ? 로 변환하여 실행
 * INSERT/UPDATE 결과: rows = ResultSetHeader (rows.insertId, rows.affectedRows)
 * SELECT 결과:        rows = RowDataPacket[]
 */
export async function query(text, params = []) {
  const mysqlSql = text.replace(/\$(\d+)/g, '?');
  const [rows] = await pool.execute(mysqlSql, params);
  return { rows };
}

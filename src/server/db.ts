import "server-only";
import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

/** Single pool per server instance (docs/06: small pool because of serverless connection limits). */
const globalForDb = globalThis as unknown as { __dujonPool?: Pool };

function createPool(): Pool {
  const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: true, ca: process.env.DB_SSL_CA || undefined } : undefined;
  return mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl,
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: ["DATE"],
    connectionLimit: Number(process.env.DB_POOL_LIMIT ?? 3),
    waitForConnections: true,
    queueLimit: 50,
    namedPlaceholders: false,
    supportBigNumbers: true,
    bigNumberStrings: false,
    decimalNumbers: true,
  });
}

export function pool(): Pool {
  if (!globalForDb.__dujonPool) globalForDb.__dujonPool = createPool();
  return globalForDb.__dujonPool;
}

type Params = ReadonlyArray<string | number | boolean | Date | null | undefined | ReadonlyArray<string | number>>;
type Runner = Pick<Pool, "execute" | "query"> | PoolConnection;

function norm(params: Params | undefined): unknown[] {
  return (params ?? []).map((p) => (p === undefined ? null : p));
}

/** Run a SELECT and return typed rows. Use `?` placeholders only — never string-concatenate user input. */
export async function rows<T = RowDataPacket>(sql: string, params?: Params, runner: Runner = pool()): Promise<T[]> {
  const [res] = await runner.query<RowDataPacket[]>(sql, norm(params));
  return res as unknown as T[];
}

export async function one<T = RowDataPacket>(sql: string, params?: Params, runner: Runner = pool()): Promise<T | null> {
  const r = await rows<T>(sql, params, runner);
  return r[0] ?? null;
}

export async function exec(sql: string, params?: Params, runner: Runner = pool()): Promise<ResultSetHeader> {
  const [res] = await runner.query<ResultSetHeader>(sql, norm(params));
  return res;
}

export async function tx<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool().getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    await conn.rollback().catch(() => undefined);
    throw e;
  } finally {
    conn.release();
  }
}

export function isDuplicateKey(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "ER_DUP_ENTRY";
}

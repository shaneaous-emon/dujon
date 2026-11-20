import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import mysql from "mysql2/promise";

/** Applies db/migrations/*.sql in order, once each. Usage: pnpm db:migrate */
async function main() {
  const base = {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_MIGRATE_USER ?? process.env.DB_USER,
    password: process.env.DB_MIGRATE_PASSWORD ?? process.env.DB_PASSWORD,
    multipleStatements: true,
    charset: "utf8mb4",
  };
  // local convenience: create the database when it does not exist yet (never in production)
  if (process.env.APP_ENV !== "production" && process.env.DB_NAME) {
    const boot = await mysql.createConnection(base);
    await boot.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME.replace(/`/g, "")}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await boot.end();
  }
  const conn = await mysql.createConnection({ ...base, database: process.env.DB_NAME });
  await conn.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(100) NOT NULL PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB",
  );
  const [done] = await conn.query("SELECT name FROM schema_migrations");
  const applied = new Set((done as { name: string }[]).map((r) => r.name));
  const dir = join(process.cwd(), "db", "migrations");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    if (applied.has(file)) continue;
    console.log(`applying ${file}`);
    await conn.query(readFileSync(join(dir, file), "utf8"));
    await conn.query("INSERT IGNORE INTO schema_migrations (name) VALUES (?)", [file]);
  }
  await conn.end();
  console.log("migrations up to date");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import mysql from "mysql2/promise";

interface Upazila { code: string; name_en: string; name_bn: string; type: "upazila" | "thana" }
interface District { code: string; name_en: string; name_bn: string; upazilas: Upazila[] }
interface Division { code: string; name_en: string; name_bn: string; districts: District[] }

/** Upserts reference locations by code; never deletes (docs/07 §4). Usage: pnpm seed:locations */
async function main() {
  const data = JSON.parse(readFileSync(join(process.cwd(), "data/locations/bd-locations.v1.json"), "utf8")) as {
    divisions: Division[];
  };
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
  });
  let nd = 0, nt = 0, nu = 0;
  for (const d of data.divisions) {
    await conn.query(
      "INSERT INTO divisions (code,name_en,name_bn) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name_en=VALUES(name_en), name_bn=VALUES(name_bn)",
      [d.code, d.name_en, d.name_bn],
    );
    const [[drow]] = (await conn.query("SELECT id FROM divisions WHERE code=?", [d.code])) as [{ id: number }[], unknown];
    nd++;
    for (const s of d.districts) {
      await conn.query(
        "INSERT INTO districts (division_id,code,name_en,name_bn) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE division_id=VALUES(division_id), name_en=VALUES(name_en), name_bn=VALUES(name_bn)",
        [drow.id, s.code, s.name_en, s.name_bn],
      );
      const [[srow]] = (await conn.query("SELECT id FROM districts WHERE code=?", [s.code])) as [{ id: number }[], unknown];
      nt++;
      for (const u of s.upazilas) {
        await conn.query(
          "INSERT INTO upazilas (district_id,code,name_en,name_bn,type) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name_en=VALUES(name_en), name_bn=VALUES(name_bn), type=VALUES(type)",
          [srow.id, u.code, u.name_en, u.name_bn, u.type],
        );
        nu++;
      }
    }
  }
  await conn.end();
  console.log(`locations seeded: ${nd} divisions, ${nt} districts, ${nu} upazilas/thanas`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

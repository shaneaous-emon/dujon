/**
 * DEV/PREVIEW ONLY. Creates clearly-labelled demo members so the interface can be explored.
 * Every row has users.is_demo=1, a "Demo" display name and a "[DEMO]" about text.
 * Refuses to run when APP_ENV=production. `pnpm seed:demo -- --purge` removes them.
 * Demo members are NOT real people and must never appear in production (brief: no fabricated members).
 */
import { randomInt } from "node:crypto";
import { hash } from "@node-rs/argon2";
import mysql from "mysql2/promise";

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const pid = () => Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const PASSWORD = "Demo-pass-2026";

const MALE = ["Arif", "Tanvir", "Rafi", "Sabbir", "Nayeem", "Imran", "Shuvo", "Mahir"];
const FEMALE = ["Nusrat", "Tania", "Mim", "Sumaiya", "Rima", "Farzana", "Lamia", "Ishrat"];
const OCC = ["Software engineer", "Teacher", "Banker", "Doctor", "Civil engineer", "Business", "Pharmacist", "Government service"];
const EDU = ["bachelors", "masters", "hsc", "diploma", "bachelors", "masters", "doctorate", "bachelors"] as const;
const MARITAL = ["never_married", "never_married", "divorced", "never_married", "never_married", "widowed", "never_married", "never_married"] as const;

async function main() {
  if ((process.env.APP_ENV ?? "development") === "production") throw new Error("seed-demo refuses to run in production");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    dateStrings: ["DATE"],
  });

  if (process.argv.includes("--purge")) {
    const [r] = (await conn.query(
      `DELETE u FROM users u WHERE u.is_demo=1`,
    )) as [{ affectedRows: number }, unknown];
    console.log(`purged ${r.affectedRows} demo users`);
    await conn.end();
    return;
  }

  const [existing] = (await conn.query("SELECT COUNT(*) AS c FROM users WHERE is_demo=1")) as [{ c: number }[], unknown];
  if (existing[0]!.c > 0) {
    console.log("demo data already present — run with --purge first to recreate");
    await conn.end();
    return;
  }

  const [places] = (await conn.query(
    `SELECT di.id AS district_id, di.division_id, (SELECT u.id FROM upazilas u WHERE u.district_id=di.id ORDER BY u.id LIMIT 1) AS upazila_id
       FROM districts di WHERE di.name_en IN ('Dhaka','Chattogram','Rajshahi','Khulna','Sylhet','Barishal','Rangpur','Mymensingh','Cumilla','Gazipur')`,
  )) as [{ district_id: number; division_id: number; upazila_id: number | null }[], unknown];
  if (places.length === 0) throw new Error("no locations found — run pnpm seed:locations first");

  const passwordHash = await hash(PASSWORD, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const year = new Date().getFullYear();
  let n = 0;
  for (const gender of ["male", "female"] as const) {
    const names = gender === "male" ? MALE : FEMALE;
    for (let i = 0; i < names.length * 2; i++) {
      const name = names[i % names.length]!;
      const place = places[(i + (gender === "male" ? 0 : 3)) % places.length]!;
      const age = 22 + ((i * 3) % 14);
      const dob = `${year - age}-${String(1 + (i % 12)).padStart(2, "0")}-${String(1 + ((i * 5) % 27)).padStart(2, "0")}`;
      const email = `demo+${gender}${i + 1}@example.invalid`;
      const [u] = (await conn.query(
        `INSERT INTO users (email,email_verified_at,password_hash,full_name,role,status,preferred_locale,terms_version,privacy_version,terms_accepted_at,is_demo)
         VALUES (?,NOW(3),?,?,'user','active','bn','demo','demo',NOW(3),1)`,
        [email, passwordHash, `Demo ${name}`],
      )) as [{ insertId: number }, unknown];
      await conn.query(
        `INSERT INTO profiles (user_id,public_id,display_name,gender,date_of_birth,created_by,marital_status,height_cm,education_level,occupation,
                               division_id,district_id,upazila_id,about,family_info,status,onboarding_step,published_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'published',4,NOW(3))`,
        [
          u.insertId,
          pid(),
          `Demo ${name}`,
          gender,
          dob,
          i % 5 === 4 ? "parent" : "self",
          MARITAL[i % MARITAL.length],
          gender === "male" ? 165 + (i % 15) : 150 + (i % 14),
          EDU[i % EDU.length],
          OCC[i % OCC.length],
          place.division_id,
          place.district_id,
          place.upazila_id,
          "[DEMO] Demo content — not a real member. This profile exists only to preview the DUJON interface in development.",
          "[DEMO] Demo content.",
        ],
      );
      n++;
    }
  }
  console.log(`created ${n} demo members (password for all: ${PASSWORD}; emails demo+male1..16 / demo+female1..16 @example.invalid)`);
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

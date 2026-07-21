import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Vercel's serverless runtime has a read-only CWD but a writable /tmp.
// In production we point at /tmp/local.db (seeded by `postbuild`).
// In dev we use the local file.
const isVercel = !!process.env.VERCEL;
const url = process.env.DATABASE_URL ?? (isVercel ? "file:/tmp/local.db" : "file:./local.db");

const client = createClient({ url });

export const db = drizzle(client, { schema });
export { schema };

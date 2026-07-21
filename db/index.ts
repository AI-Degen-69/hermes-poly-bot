import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Production (Vercel): use the bundled read-only demo.db so the live
// dashboard has data out of the box. Dev: use the local writable local.db.
const isVercel = !!process.env.VERCEL;
const url = process.env.DATABASE_URL ?? (isVercel ? "file:./demo.db" : "file:./local.db");

const client = createClient({ url });

export const db = drizzle(client, { schema });
export { schema };

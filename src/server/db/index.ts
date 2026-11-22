import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { DatabaseSync as DatabaseSyncType, SQLInputValue } from "node:sqlite";
import { MIGRATIONS } from "./migrations";
import { seedCatalog } from "./seed";

/*
 * Data access uses Node's built-in SQLite driver (node:sqlite) so the project has
 * no native build step. It is loaded via process.getBuiltinModule so the bundler
 * never tries to resolve it. All SQL uses bound parameters — never string
 * concatenation of user input.
 *
 * For production, the repository functions in src/server/* are the only callers,
 * so swapping to Postgres is contained to this layer (see docs/DEPLOYMENT.md).
 */

type SqliteModule = typeof import("node:sqlite");

declare global {
  var __leyteDb: DatabaseSyncType | undefined;
}

function loadSqlite(): SqliteModule {
  const mod = process.getBuiltinModule?.("node:sqlite") as SqliteModule | undefined;
  if (!mod) {
    throw new Error("node:sqlite is unavailable. Node.js 22.13+ is required.");
  }
  return mod;
}

export function databasePath(): string {
  // ":memory:" must reach SQLite verbatim — path.resolve would turn it into a real file.
  if (process.env.DATABASE_PATH === ":memory:") return ":memory:";
  return process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(process.cwd(), "storage", "leyte.db");
}

function open(): DatabaseSyncType {
  const { DatabaseSync } = loadSqlite();
  const file = databasePath();
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  if (file !== ":memory:") db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  migrate(db);
  seedCatalog(db);
  return db;
}

function migrate(db: DatabaseSyncType) {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)",
  );
  const applied = new Set(
    (db.prepare("SELECT version FROM schema_migrations").all() as { version: number }[]).map(
      (r) => r.version,
    ),
  );
  for (const m of MIGRATIONS) {
    if (applied.has(m.version)) continue;
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(m.sql);
      db.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)").run(
        m.version,
        new Date().toISOString(),
      );
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  }
}

export function db(): DatabaseSyncType {
  if (!globalThis.__leyteDb) globalThis.__leyteDb = open();
  return globalThis.__leyteDb;
}

/** Run `fn` inside an IMMEDIATE transaction; rolls back on any thrown error. */
export function transaction<T>(fn: (d: DatabaseSyncType) => T): T {
  const d = db();
  d.exec("BEGIN IMMEDIATE");
  try {
    const result = fn(d);
    d.exec("COMMIT");
    return result;
  } catch (err) {
    d.exec("ROLLBACK");
    throw err;
  }
}

export function one<T>(sql: string, ...params: SQLInputValue[]): T | undefined {
  return db().prepare(sql).get(...params) as T | undefined;
}

export function many<T>(sql: string, ...params: SQLInputValue[]): T[] {
  return db().prepare(sql).all(...params) as T[];
}

export function run(sql: string, ...params: SQLInputValue[]) {
  return db().prepare(sql).run(...params);
}

export function nowIso(): string {
  return new Date().toISOString();
}

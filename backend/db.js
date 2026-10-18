// db.js
// Sets up the SQLite connection using better-sqlite3.
// On first run (no .db file yet) it creates the table from
// schema.sql and loads the sample records from seed.sql.

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const DB_PATH = process.env.DB_PATH || "./recipes.db";
const dbExists = fs.existsSync(DB_PATH);

const db = new DatabaseSync(DB_PATH);

if (!dbExists) {
  console.log("No database file found - creating schema and seed data...");

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  db.exec(schema);

  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
  db.exec(seed);

  console.log("Database created and seeded with sample recipes.");
}

module.exports = db;

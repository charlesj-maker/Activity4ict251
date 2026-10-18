-- ICT251 Activity 4: Personal Recipe Card
-- Single-table SQLite schema

DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  title              TEXT NOT NULL,
  category           TEXT,
  ingredients        TEXT,
  instructions       TEXT,
  prep_time_minutes  INTEGER,
  servings           INTEGER,
  created_at         TEXT DEFAULT (datetime('now')),
  updated_at         TEXT DEFAULT (datetime('now'))
);

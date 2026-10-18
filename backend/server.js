// server.js
// ICT251 Activity 4 - Personal Recipe Card REST API
// Provides GET, GET/:id, POST, PUT, DELETE for /api/recipes

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Small helper: validate the fields coming in from the client
function validateRecipeInput(body) {
  const errors = [];

  if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
    errors.push("title is required and must be a non-empty string.");
  }
  if (body.prep_time_minutes !== undefined && body.prep_time_minutes !== null) {
    if (isNaN(Number(body.prep_time_minutes)) || Number(body.prep_time_minutes) < 0) {
      errors.push("prep_time_minutes must be a non-negative number.");
    }
  }
  if (body.servings !== undefined && body.servings !== null) {
    if (isNaN(Number(body.servings)) || Number(body.servings) < 0) {
      errors.push("servings must be a non-negative number.");
    }
  }

  return errors;
}

// Root route - simple health check / API info
app.get("/", (req, res) => {
  res.json({
    message: "Recipe CRUD API is running.",
    endpoints: [
      "GET /api/recipes",
      "GET /api/recipes/:id",
      "POST /api/recipes",
      "PUT /api/recipes/:id",
      "DELETE /api/recipes/:id"
    ]
  });
});

// GET /api/recipes - list all records
app.get("/api/recipes", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM recipes ORDER BY id DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recipes.", details: err.message });
  }
});

// GET /api/recipes/:id - get one record
app.get("/api/recipes/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM recipes WHERE id = ?").get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: "Recipe not found." });
    }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recipe.", details: err.message });
  }
});

// POST /api/recipes - create a record
app.post("/api/recipes", (req, res) => {
  const errors = validateRecipeInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { title, category, ingredients, instructions, prep_time_minutes, servings } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO recipes (title, category, ingredients, instructions, prep_time_minutes, servings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    const result = stmt.run(
      title.trim(),
      category || null,
      ingredients || null,
      instructions || null,
      prep_time_minutes || null,
      servings || null
    );

    const newRecipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: "Failed to create recipe.", details: err.message });
  }
});

// PUT /api/recipes/:id - update a record
app.put("/api/recipes/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM recipes WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Recipe not found." });
  }

  const errors = validateRecipeInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const {
    title = existing.title,
    category = existing.category,
    ingredients = existing.ingredients,
    instructions = existing.instructions,
    prep_time_minutes = existing.prep_time_minutes,
    servings = existing.servings
  } = req.body;

  try {
    db.prepare(`
      UPDATE recipes
      SET title = ?, category = ?, ingredients = ?, instructions = ?,
          prep_time_minutes = ?, servings = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(title.trim(), category, ingredients, instructions, prep_time_minutes, servings, req.params.id);

    const updated = db.prepare("SELECT * FROM recipes WHERE id = ?").get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update recipe.", details: err.message });
  }
});

// DELETE /api/recipes/:id - delete a record
app.delete("/api/recipes/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM recipes WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: "Recipe not found." });
  }

  try {
    db.prepare("DELETE FROM recipes WHERE id = ?").run(req.params.id);
    res.json({ message: "Recipe deleted successfully.", deleted: existing });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete recipe.", details: err.message });
  }
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Recipe CRUD API running on http://localhost:${PORT}`);
});

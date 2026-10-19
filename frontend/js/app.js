// app.js
// ICT251 Activity 4 - Frontend logic for the Recipe Card Manager.
// Talks to the Express/SQLite REST API to perform full CRUD
// (Create, Read, Update, Delete) and updates the page without reloading.

// Change this to your deployed backend URL once published, e.g.
// const API_BASE = "https://your-backend.onrender.com/api/recipes";
const API_BASE = "https://YOUR-SERVICE-NAME.onrender.com/api/recipes";

const form = document.getElementById("recipe-form");
const formTitle = document.getElementById("form-title");
const idField = document.getElementById("recipe-id");
const titleField = document.getElementById("title");
const categoryField = document.getElementById("category");
const ingredientsField = document.getElementById("ingredients");
const instructionsField = document.getElementById("instructions");
const prepTimeField = document.getElementById("prep_time_minutes");
const servingsField = document.getElementById("servings");

const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formMessage = document.getElementById("form-message");
const listMessage = document.getElementById("list-message");
const tableBody = document.getElementById("recipe-table-body");

document.addEventListener("DOMContentLoaded", loadRecipes);
form.addEventListener("submit", handleFormSubmit);
cancelBtn.addEventListener("click", resetForm);

// Fetches all recipes from the API and renders them in the table
async function loadRecipes() {
  setMessage(listMessage, "Loading recipes...", "");

  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error("Server responded with status " + response.status);
    }
    const recipes = await response.json();
    renderTable(recipes);
    setMessage(listMessage, "", "");
  } catch (err) {
    setMessage(listMessage, "Could not load recipes. Is the API running? (" + err.message + ")", "error");
  }
}

// Builds the table rows from an array of recipe objects.
// Uses textContent throughout so no user-entered text is ever
// interpreted as HTML.
function renderTable(recipes) {
  tableBody.textContent = "";

  if (recipes.length === 0) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 6;
    emptyCell.textContent = "No recipes yet. Add one using the form.";
    emptyRow.appendChild(emptyCell);
    tableBody.appendChild(emptyRow);
    return;
  }

  recipes.forEach(function (recipe) {
    const row = document.createElement("tr");

    // Title
    const titleCell = document.createElement("td");
    titleCell.className = "recipe-title";
    titleCell.textContent = recipe.title;
    row.appendChild(titleCell);

    // Category pill
    const categoryCell = document.createElement("td");
    const pill = document.createElement("span");
    const categoryKey = (recipe.category || "none").toLowerCase();
    pill.className = "category-pill " + categoryKey;
    pill.textContent = recipe.category || "Uncategorised";
    categoryCell.appendChild(pill);
    row.appendChild(categoryCell);

    // Prep time
    const prepCell = document.createElement("td");
    prepCell.textContent = recipe.prep_time_minutes ? recipe.prep_time_minutes + " min" : "-";
    row.appendChild(prepCell);

    // Servings
    const servingsCell = document.createElement("td");
    servingsCell.textContent = recipe.servings || "-";
    row.appendChild(servingsCell);

    // Updated at
    const updatedCell = document.createElement("td");
    updatedCell.textContent = recipe.updated_at || "-";
    row.appendChild(updatedCell);

    // Actions
    const actionsCell = document.createElement("td");
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "action-buttons";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function () {
      loadIntoForm(recipe);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      handleDelete(recipe.id, recipe.title);
    });

    actionsWrap.appendChild(editButton);
    actionsWrap.appendChild(deleteButton);
    actionsCell.appendChild(actionsWrap);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });
}

// Populates the form with an existing recipe's data for editing
function loadIntoForm(recipe) {
  idField.value = recipe.id;
  titleField.value = recipe.title || "";
  categoryField.value = recipe.category || "";
  ingredientsField.value = recipe.ingredients || "";
  instructionsField.value = recipe.instructions || "";
  prepTimeField.value = recipe.prep_time_minutes || "";
  servingsField.value = recipe.servings || "";

  formTitle.textContent = "Edit Recipe";
  submitBtn.textContent = "Save Changes";
  cancelBtn.hidden = false;
  setMessage(formMessage, "", "");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Resets the form back to "create" mode
function resetForm() {
  form.reset();
  idField.value = "";
  formTitle.textContent = "Add a New Recipe";
  submitBtn.textContent = "Add Recipe";
  cancelBtn.hidden = true;
  setMessage(formMessage, "", "");
}

// Handles both create (POST) and update (PUT) depending on
// whether an id is present in the hidden field.
async function handleFormSubmit(event) {
  event.preventDefault();

  const title = titleField.value.trim();
  if (title === "") {
    setMessage(formMessage, "Title is required.", "error");
    return;
  }

  const payload = {
    title: title,
    category: categoryField.value || null,
    ingredients: ingredientsField.value.trim() || null,
    instructions: instructionsField.value.trim() || null,
    prep_time_minutes: prepTimeField.value ? Number(prepTimeField.value) : null,
    servings: servingsField.value ? Number(servingsField.value) : null
  };

  const existingId = idField.value;
  const isEditing = existingId !== "";

  const url = isEditing ? API_BASE + "/" + existingId : API_BASE;
  const method = isEditing ? "PUT" : "POST";

  submitBtn.disabled = true;

  try {
    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const errorText = data.errors ? data.errors.join(" ") : (data.error || "Something went wrong.");
      setMessage(formMessage, errorText, "error");
      return;
    }

    setMessage(formMessage, isEditing ? "Recipe updated." : "Recipe added.", "success");
    resetForm();
    await loadRecipes();
  } catch (err) {
    setMessage(formMessage, "Network error: " + err.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
}

// Deletes a recipe after a simple confirmation, then refreshes the list
async function handleDelete(id, title) {
  const confirmed = window.confirm('Delete "' + title + '"? This cannot be undone.');
  if (!confirmed) return;

  try {
    const response = await fetch(API_BASE + "/" + id, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      setMessage(listMessage, data.error || "Could not delete recipe.", "error");
      return;
    }

    setMessage(listMessage, "Recipe deleted.", "success");
    await loadRecipes();
  } catch (err) {
    setMessage(listMessage, "Network error: " + err.message, "error");
  }
}

// Small helper to show a status message with a style class
function setMessage(element, text, type) {
  element.textContent = text;
  element.className = "form-message" + (type ? " " + type : "");
}

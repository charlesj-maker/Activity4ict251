# Recipe Card Manager — ICT251 Activity 4

A single-table CRUD application built with **Node.js + Express + SQLite** on the backend
and a plain **HTML/CSS/JavaScript** frontend that consumes the REST API.

**Student:** Charles Makwembo (202509566)
**Module:** ICT251 Web Technologies
**Theme:** Personal Recipe Card (Question 2)

---

## Project structure

```
recipe-crud/
├─ backend/
│  ├─ .env.example
│  ├─ db.js
│  ├─ package.json
│  ├─ schema.sql
│  ├─ seed.sql
│  └─ server.js
└─ frontend/
   ├─ css/styles.css
   ├─ js/app.js
   └─ index.html
```

## Database (Part A)

Single table `recipes` in SQLite:

| Field              | Type    | Notes                          |
|--------------------|---------|---------------------------------|
| id                 | INTEGER | Primary key, auto-increment     |
| title              | TEXT    | Required                        |
| category           | TEXT    | Breakfast / Lunch / Dinner / Dessert |
| ingredients        | TEXT    |                                  |
| instructions       | TEXT    |                                  |
| prep_time_minutes  | INTEGER |                                  |
| servings           | INTEGER |                                  |
| created_at         | TEXT    | Timestamp, set on insert        |
| updated_at         | TEXT    | Timestamp, refreshed on update  |

The database file and the 11 sample recipes are created automatically the first
time the server runs (see `db.js`, which runs `schema.sql` then `seed.sql`).

## Running the backend locally

```
cd backend
npm install
npm start
```

The API runs at `http://localhost:3000`. The SQLite file `recipes.db` is created
in the `backend` folder on first run — no manual database setup required.

### API endpoints

| Method | Endpoint             | Description        |
|--------|-----------------------|---------------------|
| GET    | /api/recipes          | List all recipes    |
| GET    | /api/recipes/:id      | Get one recipe      |
| POST   | /api/recipes          | Create a recipe     |
| PUT    | /api/recipes/:id      | Update a recipe     |
| DELETE | /api/recipes/:id      | Delete a recipe     |

All responses are JSON. CORS is enabled so the frontend (or Postman) can call
the API from any origin.

### Example POST body

```json
{
  "title": "Garlic Butter Rice",
  "category": "Dinner",
  "ingredients": "Rice, garlic, butter, parsley",
  "instructions": "Cook rice. Melt butter with garlic. Stir through rice.",
  "prep_time_minutes": 20,
  "servings": 4
}
```

## Running the frontend locally

Open `frontend/index.html` with the VS Code **Live Server** extension (or any
static file server). The frontend calls the API at `http://localhost:3000` by
default — this is set at the top of `frontend/js/app.js` as `API_BASE`. Update
that constant to your deployed backend URL once you deploy.

## Testing in Postman

1. Import or manually create requests for all 5 endpoints listed above against
   `http://localhost:3000`.
2. For POST and PUT, set the body to **raw / JSON** and include the fields shown
   in the example above.
3. Confirm each request returns a `200`/`201` status and the expected JSON body.
4. A screen recording was taken showing all five requests, their URLs, methods,
   request bodies (POST/PUT), and JSON responses, as required by the activity brief.

## Deployment

- **Backend:** deployed as a Node web service (see hosting notes below for the
  platform used).
- **Frontend:** static site, same approach as Activity 3 (GitHub + Render).

(See submission notes for the live links to both.)

## Features implemented

- Full CRUD via a REST API (GET list, GET one, POST, PUT, DELETE)
- Input validation on the server (required title, non-negative numbers)
- SQLite database auto-created and seeded with 11 sample recipes
- Environment variables for configuration (`.env`)
- CORS enabled
- Frontend: create form, live-updating table, inline edit (loads into form,
  saves via PUT), delete with confirmation, category colour-coded pills
- All user-entered text rendered with `textContent`, never `innerHTML`

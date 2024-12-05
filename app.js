const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const db = new sqlite3.Database("./database.db");

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve the static files (like your CSS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Route to get all items and display the form
app.get("/", (req, res) => {
  db.all("SELECT * FROM items", (err, rows) => {
    if (err) {
      res.status(500).send("Database error");
      return;
    }
    res.render("index", { items: rows });
  });
});

// Route to handle POST request and add new item to the database
app.post("/items", (req, res) => {
  const { name, description } = req.body;

  // SQL query to insert new item into the database
  const query = `INSERT INTO items (name, description, date_created) VALUES (?, ?, ?)`;
  const params = [name, description, new Date().toISOString()];

  db.run(query, params, function(err) {
    if (err) {
      res.status(500).send("Database error");
      return;
    }
    // Redirect to the home page after adding the item
    res.redirect("/");
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

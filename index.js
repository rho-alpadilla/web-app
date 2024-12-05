const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

// Set view engine to ejs
app.set('view engine', 'ejs');

// Initialize SQLite Database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Error opening database:', err.message);
  else {
    db.run(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price_list TEXT,
        description TEXT,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], (err) => {
      if (err) console.error('Error creating table:', err.message);

      // Ensure `price_list` column exists
      db.all("PRAGMA table_info(items)", [], (err, tableInfo) => {
        if (err) {
          console.error("Error retrieving table info:", err.message);
        } else {
          const columns = tableInfo.map(col => col.name);
          if (!columns.includes("price_list")) {
            db.run("ALTER TABLE items ADD COLUMN price_list TEXT", (err) => {
              if (err) {
                console.error("Error adding price_list column:", err.message);
              } else {
                console.log("price_list column added to items table.");
              }
            });
          }
        }
      });
    });
  }
});

// Routes

// Route to get all items and render the list
app.get('/', (req, res) => {
  db.all('SELECT * FROM items', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.render('index', { items: rows });
  });
});

// Route to show a single item
app.get('/show-item/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(404).send('Item not found');
    res.render('show-item', { item: row });
  });
});

// Route to render the edit form
app.get('/edit/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    if (!row) return res.status(404).send('Item not found');
    res.render('edit-item', { item: row });
  });
});

// Route to add an item
app.post('/add', (req, res) => {
  const { name, price_list, description } = req.body;
  db.run('INSERT INTO items (name, price_list, description) VALUES (?, ?, ?)', [name, price_list, description], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect('/');
  });
});

// Route to update an item
app.post('/update/:id', (req, res) => {
  const { id } = req.params;
  const { name, price_list, description } = req.body;
  db.run('UPDATE items SET name = ?, price_list = ?, description = ? WHERE id = ?', [name, price_list, description, id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect('/');
  });
});

// Route to delete an item
app.post('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM items WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err.message);
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

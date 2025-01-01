// server.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 3000;
const cors = require('cors');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// SQLite Database
const db = new sqlite3.Database('database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to SQLite database.');
});

// Create tables if not exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
)`);
db.run(`CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT,
  lastName TEXT,
  birthDate TEXT
)`);

// Routes
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        return res.status(400).json({ message: 'Registration failed. Username might already exist.' });
      }
      res.status(201).json({ message: 'Registration successful!' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error during registration.' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Login failed. An error occurred.' });
    }
    if (user && await bcrypt.compare(password, user.password)) {
      return res.status(200).json({ message: 'Login successful!', username });
    }
    res.status(401).json({ message: 'Login failed. Invalid username or password.' });
  });
});

app.get('/api/records', (req, res) => {
  db.all('SELECT * FROM records', [], (err, records) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching records.' });
    }
    res.status(200).json(records);
  });
});

app.post('/api/records', (req, res) => {
  const { firstName, lastName, birthDate } = req.body;
  db.run('INSERT INTO records (firstName, lastName, birthDate) VALUES (?, ?, ?)', [firstName, lastName, birthDate], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error adding record.' });
    }
    res.status(201).json({ message: 'Record added successfully!' });
  });
});

// Serve static HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
  });
  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

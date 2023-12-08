const express = require('express');
var cors = require('cors')
const test = require('dotenv').config();
console.log(test);
const mysql = require('mysql2')
const app = express();
const path = require('path');
const { Client } = require("pg");
// Middleware to parse JSON requests
app.use(express.json());
app.use(cors())

const corsOptions = {
  origin: 'https://esdb.onrender.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const connection = new Client({
  connectionString: process.env.DATABASE_URL
});
connection.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

// Endpoint for handling search requests
app.get('/search', async (req, res) => {
  console.log('Request received at /search');
  try {
    //Search for Tournament
    const result = await connection.query('SELECT * FROM Tournament');
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Tournament:', rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error searching in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Endpoint for handling insert requests
app.post('/insert', async (req, res) => {
  const { Tournament_ID, Name, Start_date, End_date } = req.body;

  console.log('Request received at /insert');
  try {
    // Insert a new tournament
    const result = await connection.query(
      "INSERT INTO Tournament VALUES ($1, $2, $3, $4)",
      [Tournament_ID, Name, Start_date, End_date]
    );
    const rows = result.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Tournament:', rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response to frontend
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("db name: " + process.env.DATABASE_NAME);
  console.log(`Server is running on port ${PORT}`);
});

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

const connection = new Client(process.env.DATABASE_URL);

// Endpoint for handling search requests

app.get('https://esdb-backend.onrender.com/search', async (req, res) => {
  try {
    //Search for Tournament
    const [rows] = await connection.query(
      'SELECT * FROM Tournament WHERE Tournament_ID = 0',
    );

    // Log the result to the console
    console.log('Tournament:', rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);

  } catch (error) {

    // Log any errors
    console.error('Error inserting in the database:', error);

    // Send error message in the response
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("db name: " + process.env.DATABASE_NAME);
  console.log(`Server is running on port ${PORT}`);
});

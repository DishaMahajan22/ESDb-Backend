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
  // origin: ['https://esdb.onrender.com','http://localhost:3000'],
  origin: ['https://esdb.onrender.com'],
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
    const { searchItem, searchName } = req.query;

    //if there is no search parameter for some reason, fail 
    if (!searchItem) {
      return res.status(400).json({ error: 'Bad Request', message: 'searchItem parameter is required' });
    }

    let finalRes;
    // Perform different searches based on the searchItem parameter
    switch (searchItem.toLowerCase()) {
      case 'tournament':
        if (searchName !== "" && searchName !== undefined ){
          finalRes = await connection.query('SELECT * FROM Tournament WHERE Name iLIKE $1', [`%${searchName}%`]);
        } else{
          finalRes = await connection.query('SELECT * FROM Tournament');
        }
        break;
      case 'player':
        if (searchName !== "" && searchName !== undefined ){
          finalRes = await connection.query('SELECT * FROM Player WHERE Name iLIKE $1', [`%${searchName}%`]);
        } else{
          finalRes = await connection.query('SELECT * FROM Player');
        }
        break;
      case 'game':
        if (searchName !== "" && searchName !== undefined ){
          finalRes = await connection.query('SELECT * FROM Game WHERE Game_Name iLIKE $1', [`%${searchName}%`]);
        } else{
          finalRes = await connection.query('SELECT * FROM Game');
        }
        break;
      case 'team':
        if (searchName !== "" && searchName !== undefined ){
          finalRes = await connection.query('SELECT * FROM Team WHERE Name iLIKE $1', [`%${searchName}%`]);
        } else{
          finalRes = await connection.query('SELECT * FROM Team');
        }

        break;
      default:
        return res.status(400).json({ error: 'Bad Request', message: 'Invalid searchItem parameter' });
    }

    const rows = finalRes.rows; // Access the 'rows' of the data

    // Log the result to the console
    console.log('Result Log Test:', rows);

    // Send the retrieved tournament as JSON in the response
    res.json(rows);
  } catch (error) {

    // Log errors
    console.error('Error searching in the database:', error);

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
